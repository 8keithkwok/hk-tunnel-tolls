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

const VEHICLE_STORAGE_KEY = 'hk-tunnel-tolls-vehicle'

const TD_URL =
  'https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/toll_matters/toll_rates_of_road_tunnels_and_lantau_link/index.html'

export default function App() {
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        <h1 className="mb-1 text-xl font-bold tracking-tight sm:text-2xl">
          香港隧道現時收費
        </h1>
        <p className="mb-4 text-sm text-slate-400 sm:mb-6">
          香港時間 {time}
          {dayOfWeek === 0 && '（星期日）'}
          {isPublicHoliday && dayOfWeek !== 0 && '（公眾假期）'}
          {loading && ' · 載入假期資料…'}
        </p>

        <p className="mb-3 text-sm font-medium text-slate-300">車種</p>
        <VehicleSelector value={vehicle} onChange={setVehicle} />
        <div className="mb-6" />

        <div className="space-y-2 sm:space-y-3">
          {tolls.map((item) => (
            <TunnelCard key={item.id} item={item} />
          ))}
        </div>

        <footer className="mt-8 border-t border-slate-700 pt-6 text-center text-xs text-slate-500 sm:text-sm">
          <p>
            資料來源：{' '}
            <a
              href={TD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline hover:text-amber-300"
            >
              運輸署 － 行車隧道的收費
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
