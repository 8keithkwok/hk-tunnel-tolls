/**
 * 香港公眾假期 API
 * 資料來源：1823 / data.gov.hk https://www.1823.gov.hk/common/ical/tc.json
 * 備援：public/holidays.json
 */

const GOV_API_URL = 'https://www.1823.gov.hk/common/ical/tc.json'

/** 靜態假期備援（CORS 時使用），格式：YYYY-MM-DD */
export type HolidayEntry = { date: string; name?: string }

/** jCal 格式可能為 [ "vcalendar", [], [ ["vevent", [], [ ["dtstart", {}, "date", "20250101"], ... ] ] ] ] */
function parseJCalDates(jcal: unknown): string[] {
  const dates: string[] = []
  if (!Array.isArray(jcal) || jcal[0] !== 'vcalendar') return dates
  const components = jcal[2]
  if (!Array.isArray(components)) return dates
  for (const comp of components) {
    if (!Array.isArray(comp) || comp[0] !== 'vevent') continue
    const props = comp[2]
    if (!Array.isArray(props)) continue
    for (const p of props) {
      if (!Array.isArray(p) || p[0] !== 'dtstart') continue
      const val = p[3]
      if (typeof val === 'string') {
        const normalized = val.replace(/-/g, '').slice(0, 8)
        if (normalized.length === 8) {
          dates.push(`${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`)
        }
      }
    }
  }
  return dates
}

function parseSimpleHolidays(data: unknown): string[] {
  const dates: string[] = []
  if (Array.isArray(data)) {
    for (const e of data) {
      const d = typeof e === 'object' && e !== null && 'date' in e ? (e as { date: string }).date : String(e)
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) dates.push(d)
    }
    return dates
  }
  if (typeof data === 'object' && data !== null && 'holidays' in data) {
    const arr = (data as { holidays: HolidayEntry[] }).holidays
    if (Array.isArray(arr)) {
      for (const e of arr) {
        if (e?.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date)) dates.push(e.date)
      }
    }
    return dates
  }
  if (typeof data === 'object' && data !== null && 'dates' in data) {
    const arr = (data as { dates: string[] }).dates
    if (Array.isArray(arr)) {
      for (const d of arr) {
        if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) dates.push(d)
      }
    }
    return dates
  }
  return dates
}

let cachedDates: string[] | null = null

/** 取得公眾假期日期列表（會先試 1823 API，失敗則用靜態 JSON） */
export async function fetchHolidayDates(): Promise<string[]> {
  if (cachedDates) return cachedDates

  try {
    const res = await fetch(GOV_API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: unknown = await res.json()
    cachedDates = parseJCalDates(data)
    if (cachedDates.length > 0) return cachedDates
  } catch {
    // CORS or network error: use static fallback
  }

  try {
    const base = import.meta.env.BASE_URL || '/'
    const url = `${base}holidays.json`.replace(/\/+/g, '/')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: unknown = await res.json()
    cachedDates = parseSimpleHolidays(data)
  } catch {
    cachedDates = []
  }

  return cachedDates
}

/** 判斷指定日期是否為公眾假期（YYYY-MM-DD）；不包含星期日，星期日由呼叫方以 dayOfWeek === 0 處理 */
export function isHoliday(dateStr: string, holidayDates: string[]): boolean {
  return holidayDates.includes(dateStr)
}

/** 取得今日香港日期 YYYY-MM-DD */
export function getTodayHKDateStr(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}
