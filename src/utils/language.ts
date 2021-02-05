export const langConvert = {
  html2sys: (lang: HTMLLanguage): Language => {
    return ({
      'zh-Hans': 'zh_hans',
      'zh-Hant': 'zh_hant',
      en: 'en',
    }[lang] || 'zh_hant') as Language
  },
}
