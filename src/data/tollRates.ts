/**
 * 香港隧道收費資料與計算
 * 資料來源：運輸署 https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/toll_matters/toll_rates_of_road_tunnels_and_lantau_link/index.html
 * 最後更新：2025
 */

export type VehicleType =
  | 'private_car'   // 私家車
  | 'taxi'          // 的士
  | 'motorcycle'    // 電單車/機動三輪車
  | 'commercial'    // 貨車/小巴/巴士（過海三隧用）

export type VehicleTypeTateKong =
  | 'private_car'
  | 'taxi'
  | 'motorcycle'
  | 'minibus'       // 小巴
  | 'light_goods'   // 輕型貨車
  | 'medium_goods'  // 中型貨車
  | 'heavy_goods'   // 重型貨車
  | 'single_deck_bus'
  | 'double_deck_bus'

export const VEHICLE_LABELS: Record<VehicleType | VehicleTypeTateKong, string> = {
  private_car: '私家車',
  taxi: '的士',
  motorcycle: '電單車',
  commercial: '貨車／小巴／巴士',
  minibus: '小巴',
  light_goods: '輕型貨車',
  medium_goods: '中型貨車',
  heavy_goods: '重型貨車',
  single_deck_bus: '單層巴士',
  double_deck_bus: '雙層巴士',
}

/** 香港時區取得當前時間 HH:MM 及星期 (0=日, 6=六) */
export function getHKTimeNow(): { time: string; dayOfWeek: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Hong_Kong',
    weekday: 'short',
  })
  const now = new Date()
  const time = formatter.format(now).replace('24:', '00:')
  const dayStr = dayFormatter.format(now)
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const dayOfWeek = dayMap[dayStr] ?? 0
  return { time, dayOfWeek }
}

/** 時間字串 "HH:MM" 轉為當日分鐘數 (0-1439)，用於比較 */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** 是否為星期日或公眾假期（由外部傳入） */
export type TollInput = {
  time: string      // "HH:MM"
  dayOfWeek: number // 0=日
  isPublicHoliday: boolean
  vehicle: VehicleType | VehicleTypeTateKong
}

// --- 過海三隧（紅隧、東隧、西隧）分時段 ---
// 平日：西隧繁忙 $60，紅/東隧繁忙 $40；一般 $30；非繁忙 $20
// 假日：一般 $25，非繁忙 $20；的士全日 $25；商用車全日 $50；電單車 私家車的 40%

function getCrossHarbourToll(
  tunnel: 'western' | 'eastern' | 'cross_harbour',
  input: TollInput
): number {
  const { time, dayOfWeek, isPublicHoliday, vehicle } = input
  const isHoliday = isPublicHoliday || dayOfWeek === 0

  if (vehicle === 'taxi') return 25
  if (vehicle === 'commercial') return 50
  if (vehicle === 'motorcycle') {
    const carToll = getCrossHarbourCarToll(tunnel, time, isHoliday)
    return Math.round(carToll * 0.4)
  }
  if (vehicle !== 'private_car') {
    // 其他車種在過海三隧用私家車費率再按比例或預設
    const carToll = getCrossHarbourCarToll(tunnel, time, isHoliday)
    return carToll
  }

  return getCrossHarbourCarToll(tunnel, time, isHoliday)
}

function getCrossHarbourCarToll(
  tunnel: 'western' | 'eastern' | 'cross_harbour',
  time: string,
  isHoliday: boolean
): number {
  const m = timeToMinutes(time)

  if (isHoliday) {
    // 假日：非繁忙 19:15-10:15 $20；一般 10:15-19:15 $25；過渡 10:11-10:15, 19:15-19:19
    if (m >= timeToMinutes('19:15') || m < timeToMinutes('10:15')) return 20
    if (m >= timeToMinutes('10:15') && m < timeToMinutes('19:15')) return 25
    if (m >= timeToMinutes('10:11') && m < timeToMinutes('10:15')) {
      const step = Math.floor((m - timeToMinutes('10:11')) / 2)
      return 21 + step * 2
    }
    if (m >= timeToMinutes('19:15') && m < timeToMinutes('19:19')) {
      const step = Math.floor((m - timeToMinutes('19:15')) / 2)
      return 23 - step * 2
    }
    return 25
  }

  // 平日
  if (tunnel === 'western') {
    // 西隧：非繁忙 19:00-07:30 $20；過渡 07:30-08:08 22->60；繁忙 08:08-10:15 $60；過渡 10:15-10:43；一般 10:43-16:30 $30；繁忙 16:30-19:00 $60
    if (m >= timeToMinutes('19:00') || m < timeToMinutes('07:30')) return 20
    if (m >= timeToMinutes('07:30') && m < timeToMinutes('08:08')) {
      const step = Math.floor((m - timeToMinutes('07:30')) / 2)
      return Math.min(22 + step * 2, 60)
    }
    if (m >= timeToMinutes('08:08') && m < timeToMinutes('10:15')) return 60
    if (m >= timeToMinutes('10:15') && m < timeToMinutes('10:43')) {
      const step = Math.floor((m - timeToMinutes('10:15')) / 2)
      return Math.max(58 - step * 2, 30)
    }
    if (m >= timeToMinutes('10:43') && m < timeToMinutes('16:30')) return 30
    if (m >= timeToMinutes('16:30') && m < timeToMinutes('19:00')) return 60
    return 30
  }

  // 紅隧、東隧
  if (m >= timeToMinutes('19:00') || m < timeToMinutes('07:30')) return 20
  if (m >= timeToMinutes('07:30') && m < timeToMinutes('07:48')) {
    const step = Math.floor((m - timeToMinutes('07:30')) / 2)
    return Math.min(22 + step * 2, 40)
  }
  if (m >= timeToMinutes('07:48') && m < timeToMinutes('10:15')) return 40
  if (m >= timeToMinutes('10:15') && m < timeToMinutes('10:23')) {
    const step = Math.floor((m - timeToMinutes('10:15')) / 2)
    return Math.max(38 - step * 2, 30)
  }
  if (m >= timeToMinutes('10:23') && m < timeToMinutes('16:30')) return 30
  if (m >= timeToMinutes('16:30') && m < timeToMinutes('19:00')) return 40
  return 30
}

// --- 大欖隧道 ---
// 平日：繁忙 07:15-09:59, 17:15-19:01 $45；一般 $30；非繁忙 $18
// 星期日及公眾假期：劃一 $18
function getTateKongToll(input: TollInput): number {
  const { time, dayOfWeek, isPublicHoliday, vehicle } = input
  const isHoliday = isPublicHoliday || dayOfWeek === 0
  if (isHoliday) return 18
  if (vehicle !== 'private_car') {
    // 大欖隧道其他車種簡化用私家車費率（實際可按署方再細分）
    return getTateKongCarToll(time)
  }
  return getTateKongCarToll(time)
}

function getTateKongCarToll(time: string): number {
  const m = timeToMinutes(time)
  if (m >= timeToMinutes('07:15') && m < timeToMinutes('09:59')) return 45
  if (m >= timeToMinutes('17:15') && m < timeToMinutes('19:01')) return 45
  if (m >= timeToMinutes('09:59') && m < timeToMinutes('17:15')) return 30
  return 18
}

// --- 大老山隧道（按車種，無時段）---
const TATE_MAO_SHAN_RATES: Record<VehicleTypeTateKong, number> = {
  motorcycle: 15,
  private_car: 20,
  taxi: 20,
  minibus: 23,
  light_goods: 24,
  medium_goods: 28,
  heavy_goods: 28,
  single_deck_bus: 32,
  double_deck_bus: 35,
}

function getTateMaoShanToll(vehicle: VehicleTypeTateKong): number {
  return TATE_MAO_SHAN_RATES[vehicle] ?? TATE_MAO_SHAN_RATES.private_car
}

// --- 劃一 $8 ---
const FLAT_8_TUNNELS = ['香港仔隧道', '城門隧道', '獅子山隧道', '沙田嶺／尖山／大圍隧道'] as const

export type TunnelItem = {
  id: string
  name: string
  toll: number
  note?: string
}

/** 依當前時間與是否假日，計算各隧道現時收費 */
export function getCurrentTolls(input: TollInput): TunnelItem[] {
  const list: TunnelItem[] = []

  list.push({
    id: 'cross_harbour',
    name: '海底隧道（紅隧）',
    toll: getCrossHarbourToll('cross_harbour', input),
  })
  list.push({
    id: 'eastern',
    name: '東區海底隧道（東隧）',
    toll: getCrossHarbourToll('eastern', input),
  })
  list.push({
    id: 'western',
    name: '西區海底隧道（西隧）',
    toll: getCrossHarbourToll('western', input),
  })
  list.push({
    id: 'tate_kong',
    name: '大欖隧道',
    toll: getTateKongToll(input),
  })

  const tateMaoShanVehicle =
    input.vehicle in TATE_MAO_SHAN_RATES
      ? (input.vehicle as VehicleTypeTateKong)
      : 'private_car'
  list.push({
    id: 'tate_mao_shan',
    name: '大老山隧道',
    toll: getTateMaoShanToll(tateMaoShanVehicle),
  })

  for (const name of FLAT_8_TUNNELS) {
    list.push({
      id: name.replace(/\s*[／\/].*$/, '').replace(/\s/g, '_'),
      name,
      toll: 8,
    })
  }

  return list
}

/** 用於 UI 的車種選項（過海三隧 + 大老山共用選項） */
export const VEHICLE_OPTIONS: { value: VehicleType | VehicleTypeTateKong; label: string }[] = [
  { value: 'private_car', label: VEHICLE_LABELS.private_car },
  { value: 'taxi', label: VEHICLE_LABELS.taxi },
  { value: 'motorcycle', label: VEHICLE_LABELS.motorcycle },
  { value: 'commercial', label: VEHICLE_LABELS.commercial },
  { value: 'minibus', label: VEHICLE_LABELS.minibus },
  { value: 'light_goods', label: VEHICLE_LABELS.light_goods },
  { value: 'medium_goods', label: VEHICLE_LABELS.medium_goods },
  { value: 'heavy_goods', label: VEHICLE_LABELS.heavy_goods },
  { value: 'single_deck_bus', label: VEHICLE_LABELS.single_deck_bus },
  { value: 'double_deck_bus', label: VEHICLE_LABELS.double_deck_bus },
]

const VALID_VEHICLE_VALUES = new Set(VEHICLE_OPTIONS.map((o) => o.value))

/** 驗證字串是否為有效車種（用於 localStorage 還原） */
export function isValidVehicle(
  value: string
): value is VehicleType | VehicleTypeTateKong {
  return VALID_VEHICLE_VALUES.has(value as VehicleType)
}
