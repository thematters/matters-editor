export const ACCEPTED_UPLOAD_AUDIO_TYPES: string[] = ['audio/mpeg', 'audio/aac']

export const ACCEPTED_UPLOAD_IMAGE_TYPES: string[] = [
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
]

export const COLOR: { [key: string]: string } = { GREEN: 'green', RED: 'red' }

export const CUSTOM_BLOT_TYPES: string[] = [
  'embedClipboard',
  'embedCode',
  'embedVideo',
]

export const DEBOUNCE_DELAY: number = 300

export const DEBOUNCE_DELAY_MENTION: number = 900

export const LANGUAGE = {
  en: 'en',
  zh_hans: 'zh_hans',
  zh_hant: 'zh_hant',
}

export const KEYCODES: { [key: string]: number } = {
  DOWN: 40,
  ENTER: 13,
  ESCAPE: 27,
  TAB: 9,
  UP: 38,
  V: 86,
}

export const SANDBOX_DEFAULT_SETTINGS: string[] = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
]

export const SANDBOX_SPECIAL_SETTINGS: string[] = [
  ...SANDBOX_DEFAULT_SETTINGS,
  'allow-popups-to-escape-sandbox',
  'allow-storage-access-by-user-activation',
  'allow-top-navigation-by-user-activation',
]

export const SELECTION_TYPES: { [key: string]: string } = {
  CUSTOM_BLOT: 'customBlot',
  NEW_LINE: 'newLine',
}

export const UPLOAD_IMAGE_SIZE_LIMIT: number = 5 * 1024 * 1024

export const UPLOAD_AUDIO_SIZE_LIMIT: number = 100 * 1024 * 1024

export const URL_LIKE_BUTTON: string = 'url_like_button'

export const MAX_ARTICE_TITLE_LENGTH = 100
export const MAX_ARTICE_SUMMARY_LENGTH = 200
export const MAX_ARTICLE_CONTENT_LENGTH = 50e3
