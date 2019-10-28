export const ACCEPTED_UPLOAD_AUDIO_TYPES: string[] = ['audio/mpeg', 'audio/aac']

export const ACCEPTED_UPLOAD_IMAGE_TYPES: string[] = [
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp'
]

export const COLOR: { [key: string]: string } = { GREEN: 'green', RED: 'red' }

export const CUSTOM_BLOT_TYPES: string[] = ['embedClipboard', 'embedCode', 'embedVideo']

export const DEBOUNCE_DELAY: number = 300

export const LANGUAGE: { [key: string]: string } = {
  EN: 'EN',
  ZH_HANS: 'ZH_HANS',
  ZH_HANT: 'ZH_HANT'
}

export const KEYCODES: { [key: string]: number } = {
  DOWN: 40,
  ENTER: 13,
  ESCAPE: 27,
  TAB: 9,
  UP: 38,
  V: 86
}

export const SANDBOX_DEFAULT_SETTINGS: string[] = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups'
]

export const SANDBOX_SPECIAL_SETTINGS: string[] = [
  ...SANDBOX_DEFAULT_SETTINGS,
  'allow-popups-to-escape-sandbox',
  'allow-storage-access-by-user-activation',
  'allow-top-navigation-by-user-activation'
]

export const SELECTION_TYPES: { [key: string]: string } = {
  CUSTOM_BLOT: 'customBlot',
  NEW_LINE: 'newLine'
}

export const UPLOAD_IMAGE_SIZE_LIMIT: number = 5 * 1024 * 1024

export const UPLOAD_AUDIO_SIZE_LIMIT: number = 100 * 1024 * 1024
