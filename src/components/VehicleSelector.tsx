import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { VehicleType, VehicleTypeTateKong } from '../data/tollRates'
import { VEHICLE_OPTIONS } from '../data/tollRates'

type Props = {
  value: VehicleType | VehicleTypeTateKong
  onChange: (v: VehicleType | VehicleTypeTateKong) => void
}

export function VehicleSelector({ value, onChange }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const selectedLabel = t(`vehicle.${value}`)

  return (
    <div ref={containerRef} className="relative max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('app.vehicleLabel')}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-600 bg-slate-700/90 px-4 py-2.5 text-left text-sm font-medium text-white shadow-lg shadow-black/20
          transition-[border-color,box-shadow,background-color]
          hover:border-slate-500 hover:bg-slate-700
          focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50
          data-[open]:border-amber-500/70 data-[open]:ring-2 data-[open]:ring-amber-500/40"
        data-open={open ? '' : undefined}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className="h-4 w-4 shrink-0 text-slate-400 transition-transform data-[open]:rotate-180"
          data-open={open ? '' : undefined}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('app.vehicleLabel')}
          className="absolute z-50 mt-2 w-full min-w-[12rem] overflow-hidden rounded-xl border border-slate-600 bg-slate-800 shadow-xl shadow-black/30"
          style={{ animation: 'vehicleDropdownIn 0.15s ease-out' }}
        >
          {VEHICLE_OPTIONS.map((opt) => {
            const selected = value === opt.value
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium transition-colors
                    first:pt-3 last:pb-3
                    hover:bg-slate-700/80 hover:text-white
                    focus:bg-slate-700/80 focus:text-white focus:outline-none
                    data-[selected]:bg-amber-500/20 data-[selected]:text-amber-300 data-[selected]:hover:bg-amber-500/25"
                  data-selected={selected ? '' : undefined}
                >
                  {t(`vehicle.${opt.value}`)}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <style>{`
        @keyframes vehicleDropdownIn {
          from { opacity: 0; transform: scale(0.97) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
