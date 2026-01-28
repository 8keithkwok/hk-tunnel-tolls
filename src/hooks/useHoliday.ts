import { useState, useEffect } from 'react'
import { fetchHolidayDates, isHoliday as checkHoliday, getTodayHKDateStr } from '../api/holiday'

export function useHoliday(): {
  isPublicHoliday: boolean
  loading: boolean
  error: string | null
} {
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchHolidayDates()
      .then((list) => {
        if (!cancelled) setDates(list)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load holidays')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const today = getTodayHKDateStr()
  const isPublicHoliday = checkHoliday(today, dates)

  return { isPublicHoliday, loading, error }
}
