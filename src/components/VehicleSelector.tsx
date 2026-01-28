import { useTranslation } from 'react-i18next'
import type { VehicleType, VehicleTypeTateKong } from '../data/tollRates'
import { VEHICLE_OPTIONS } from '../data/tollRates'

type Props = {
  value: VehicleType | VehicleTypeTateKong
  onChange: (v: VehicleType | VehicleTypeTateKong) => void
}

export function VehicleSelector({ value, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={t('app.vehicleLabel')}
    >
      {VEHICLE_OPTIONS.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={
              'min-h-11 rounded-full px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation ' +
              (selected
                ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-400/50'
                : 'bg-slate-700/80 text-slate-300 ring-1 ring-slate-600 hover:bg-slate-700 hover:text-white')
            }
          >
            {t(`vehicle.${opt.value}`)}
          </button>
        )
      })}
    </div>
  )
}
