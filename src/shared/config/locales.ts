export type SupportedLocaleCode = 'ko-KR' | 'en-US' | 'it-IT' | 'ja-JP' | 'fr-FR'

export interface SupportedLocale {
  code: SupportedLocaleCode
  countryName: string
  countryNameEn: string
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: 'ko-KR', countryName: '한국', countryNameEn: 'Korea' },
  { code: 'ja-JP', countryName: '일본', countryNameEn: 'Japan' },
  { code: 'fr-FR', countryName: '프랑스', countryNameEn: 'France' },
  { code: 'it-IT', countryName: '이탈리아', countryNameEn: 'Italy' },
  { code: 'en-US', countryName: '미국', countryNameEn: 'USA' },
]

export const SUPPORTED_LOCALE_CODES: SupportedLocaleCode[] = SUPPORTED_LOCALES.map(
  (locale) => locale.code
)

export const getLocaleByCode = (code: string): SupportedLocale | undefined => {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code)
}

export const isSupportedLocale = (code: string): code is SupportedLocaleCode => {
  return SUPPORTED_LOCALES.some((locale) => locale.code === code)
}

export const DEFAULT_LOCALE: SupportedLocaleCode = 'ko-KR'

