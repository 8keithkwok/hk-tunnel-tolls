import { useState, useCallback, useEffect } from 'react'

/**
 * Persist state in localStorage. Syncs on change and validates on init.
 */
export function useLocalStorage<T extends string>(
  key: string,
  initialValue: T,
  isValid: (value: string) => value is T
): [T, (value: T) => void] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw != null && isValid(raw)) return raw
    } catch {
      // ignore
    }
    return initialValue
  }, [key, initialValue, isValid])

  const [state, setState] = useState<T>(read)

  useEffect(() => {
    try {
      window.localStorage.setItem(key, state)
    } catch {
      // ignore
    }
  }, [key, state])

  return [state, setState]
}
