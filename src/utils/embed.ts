import { URL_LIKE_BUTTON } from '../enums/common'

const getPath = (url: string) => {
  const path = new URL(url).pathname
  if (path) {
    return path
      .split('/')
      .filter((fragment) => fragment)
      .join('/')
  }
  return ''
}

export const code = (value: string) => {
  if (!value) {
    return ''
  }

  if (value.match(/http(s)?:\/\/jsfiddle.net\//)) {
    return `https://jsfiddle.net/${getPath(value)}/embedded/`
  }
  if (value.match(/http(s)?:\/\/(button\.)?like\.co\//)) {
    return URL_LIKE_BUTTON
  }
  return ''
}

export const video = (value: string) => {
  if (!value) {
    return ''
  }

  let id: string | null
  const inputUrl = new URL(value)
  switch (inputUrl.hostname) {
    case 'youtu.be':
      /* URL {
           href: 'https://youtu.be/shoVsQhou-8?t=17643',
           origin: 'https://youtu.be',
           hostname: 'youtu.be',
           pathname: '/shoVsQhou-8',
           search: '?t=17643',
           searchParams: URLSearchParams { 't' => '17643' },
           ...
      */
      id = inputUrl.pathname.substring(1) // remove '/'
      const outputUrl = new URL(`https://www.youtube.com/embed/${id}?rel=0`)
      if (inputUrl.searchParams.has('t'))
        outputUrl.searchParams.set('start', inputUrl.searchParams.get('t'))
      return outputUrl.toString()
  }

  if (value.match('/(http(s)?://)?(www.)?youtube|youtu.be/')) {
    id = value.match('embed')
      ? value.split(/embed\//)[1].split('"')[0]
      : value.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]
    return 'https://www.youtube.com/embed/' + id + '?rel=0'
  }
  if (value.match(/vimeo.com\/(\d+)/)) {
    const matches = value.match(/vimeo.com\/(\d+)/)
    id = matches && matches[1]
    return 'https://player.vimeo.com/video/' + id
  }
  if (value.match(/id_(.*)\.html/i)) {
    const matches = value.match(/id_(.*)\.html/i)
    id = matches && matches[1]
    return 'http://player.youku.com/embed/' + id
  }
  return ''
}
