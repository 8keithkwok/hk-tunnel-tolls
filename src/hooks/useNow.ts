import { useState, useEffect } from 'react'
import { getHKTimeNow } from '../data/tollRates'

/** 每分鐘更新一次的香港當前時間（用於現時收費） */
export function useNow(intervalMs = 60_000): { time: string; dayOfWeek: number } {
  const [now, setNow] = useState(getHKTimeNow)

  useEffect(() => {
    const id = setInterval(() => setNow(getHKTimeNow()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
