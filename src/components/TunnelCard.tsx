import { useTranslation } from 'react-i18next'
import type { TunnelItem } from '../data/tollRates'

type Props = { item: TunnelItem }

export function TunnelCard({ item }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left shadow-sm sm:px-5 sm:py-4">
      <span className="text-base font-medium text-white sm:text-lg">{t(item.nameKey)}</span>
      <span className="text-xl font-bold tabular-nums text-amber-400 sm:text-2xl">
        ${item.toll}
      </span>
    </div>
  )
}
