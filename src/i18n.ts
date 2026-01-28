import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhHK from './locales/zh-HK.json'

const LOCALE_STORAGE_KEY = 'hk-tunnel-tolls-locale'

const savedLocale =
  typeof window !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null
const initialLng = savedLocale === 'en' || savedLocale === 'zh-HK' ? savedLocale : 'zh-HK'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-HK': { translation: zhHK },
  },
  lng: initialLng,
  fallbackLng: 'zh-HK',
  interpolation: {
    escapeValue: false,
  },
})

export { LOCALE_STORAGE_KEY }
