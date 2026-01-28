import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNow } from './hooks/useNow'
import { useHoliday } from './hooks/useHoliday'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  getCurrentTolls,
  isValidVehicle,
  type VehicleType,
  type VehicleTypeTateKong,
} from './data/tollRates'
import { TunnelCard } from './components/TunnelCard'
import { VehicleSelector } from './components/VehicleSelector'
import { LOCALE_STORAGE_KEY } from './i18n'

const VEHICLE_STORAGE_KEY = 'hk-tunnel-tolls-vehicle'

const TD_URL =
  'https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/toll_matters/toll_rates_of_road_tunnels_and_lantau_link/index.html'

function saveLocale(lng: string) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng)
  } catch {
    // ignore
  }
}

export default function App() {
  const { t, i18n } = useTranslation()
  const { time, dayOfWeek } = useNow()
  const { isPublicHoliday, loading } = useHoliday()
  const [vehicle, setVehicle] = useLocalStorage<VehicleType | VehicleTypeTateKong>(
    VEHICLE_STORAGE_KEY,
    'private_car',
    isValidVehicle
  )

  const tolls = getCurrentTolls({
    time,
    dayOfWeek,
    isPublicHoliday,
    vehicle,
  })

  useEffect(() => {
    document.title = t('meta.title')
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', t('meta.description'))
    document.documentElement.lang = i18n.language
  }, [i18n.language, t])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t('app.title')}
          </h1>
          <div className="flex shrink-0 gap-1 text-sm text-slate-400">
            <button
              type="button"
              onClick={() => {
                i18n.changeLanguage('zh-HK')
                saveLocale('zh-HK')
              }}
              className={
                i18n.language === 'zh-HK' || i18n.language?.startsWith('zh-HK')
                  ? 'font-medium text-amber-400'
                  : 'hover:text-slate-300'
              }
              aria-pressed={i18n.language === 'zh-HK' || i18n.language?.startsWith('zh-HK')}
            >
              {t('lang.zhHK')}
            </button>
            <span aria-hidden>|</span>
            <button
              type="button"
              onClick={() => {
                i18n.changeLanguage('en')
                saveLocale('en')
              }}
              className={
                i18n.language === 'en'
                  ? 'font-medium text-amber-400'
                  : 'hover:text-slate-300'
              }
              aria-pressed={i18n.language === 'en'}
            >
              {t('lang.en')}
            </button>
          </div>
        </div>
        <p className="mb-4 text-sm text-slate-400 sm:mb-6">
          {t('app.timePrefix')} {time}
          {dayOfWeek === 0 && t('app.sunday')}
          {isPublicHoliday && dayOfWeek !== 0 && t('app.publicHoliday')}
          {loading && t('app.loadingHolidays')}
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-300">{t('app.vehicleLabel')}</span>
          <VehicleSelector value={vehicle} onChange={setVehicle} />
        </div>

        <div className="space-y-2 sm:space-y-3">
          {tolls.map((item) => (
            <TunnelCard key={item.id} item={item} />
          ))}
        </div>

        <footer className="mt-8 border-t border-slate-700 pt-6 text-center text-xs text-slate-500 sm:text-sm">
          <p>
            {t('footer.source')}{' '}
            <a
              href={TD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300"
            >
              {t('footer.linkText')}
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
