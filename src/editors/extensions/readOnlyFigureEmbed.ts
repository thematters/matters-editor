import { Node } from '@tiptap/core'

/**
 * ReadyOnlyFigureEmbed extension is similar to FigureEmbed extension,
 * but it is read-only for article revision.
 */

type NormalizeEmbedURLReturn = {
  url: string
  provider?:
    | 'youtube'
    | 'vimeo'
    | 'bilibili'
    | 'twitter'
    | 'instagram'
    | 'jsfiddle'
    | 'codepen'
  allowfullscreen: boolean
  sandbox: Array<'allow-scripts' | 'allow-same-origin' | 'allow-popups'>
}

enum Provider {
  YouTube = 'youtube',
  Vimeo = 'vimeo',
  Bilibili = 'bilibili',
  // Twitter = 'twitter',
  Instagram = 'instagram',
  JSFiddle = 'jsfiddle',
  CodePen = 'codepen',
}

const normalizeEmbedURL = (url: string): NormalizeEmbedURLReturn => {
  const fallbackReturn: NormalizeEmbedURLReturn = {
    url: '',
    allowfullscreen: false,
    sandbox: [],
  }
  let inputUrl
  try {
    inputUrl = new URL(url)
  } catch (e) {
    return fallbackReturn
  }

  const { hostname, pathname, searchParams } = inputUrl

  // if (!hostname) {
  //   throw
  // }

  /**
   * YouTube
   *
   * URL:
   *   - https://www.youtube.com/watch?v=ARJ8cAGm6JE
   *   - https://www.youtube.com/embed/ARJ8cAGm6JE
   *   - https://youtu.be/ARJ8cAGm6JE
   *
   * Params:
   *   - t=123 for start time
   *   - v=ARJ8cAGm6JE for video id
   */
  const isYouTube = [
    'youtube.com',
    'youtu.be',
    'www.youtu.be',
    'www.youtube.com',
  ].includes(hostname)
  if (isYouTube) {
    const v = searchParams.get('v')
    const t = searchParams.get('t') || searchParams.get('start')
    const qs = new URLSearchParams({
      rel: '0',
      ...(t ? { start: t } : {}),
    }).toString()

    let id = ''
    if (v) {
      id = v
    } else if (pathname.match('/embed/')) {
      id = pathname.split('/embed/')[1]
    } else if (hostname.includes('youtu.be')) {
      id = pathname.split('/')[1]
    }

    return {
      url: `https://www.youtube.com/embed/${id}` + (qs ? `?${qs}` : ''),
      provider: Provider.YouTube,
      allowfullscreen: true,
      sandbox: [],
    }
  }

  /**
   * Vimeo
   *
   * URL:
   *   - https://vimeo.com/332732612
   *   - https://player.vimeo.com/video/332732612
   */
  const isVimeo = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(
    hostname
  )
  if (isVimeo) {
    const id = pathname.replace(/\/$/, '').split('/').slice(-1)[0]
    return {
      url: `https://player.vimeo.com/video/${id}`,
      provider: Provider.Vimeo,
      allowfullscreen: true,
      sandbox: [],
    }
  }

  /**
   * bilibili
   *
   * URL:
   *   - https://www.bilibili.com/video/BV1bW411n7fY/
   *   - https://www.bilibili.com/BV1bW411n7fY/
   *   - https://player.bilibili.com/player.html?bvid=BV1bW411n7fY
   *
   * Params:
   *   - bvid=BV1bW411n7fY for video id
   */
  const isBilibili = [
    'bilibili.com',
    'player.bilibili.com',
    'www.bilibili.com',
  ].includes(hostname)
  if (isBilibili) {
    const bvid = searchParams.get('bvid')

    let id = ''
    if (bvid) {
      id = bvid
    } else {
      id = pathname.replace(/\/$/, '').split('/').slice(-1)[0]
    }

    return {
      url: `https://player.bilibili.com/player.html?bvid=${id}&autoplay=0`,
      // url: `https://player.bilibili.com/player.html?bvid=${id}`,
      provider: Provider.Bilibili,
      allowfullscreen: true,
      sandbox: [],
    }
  }

  // Twitter

  /**
   * Instagram
   *
   * URL:
   *   - https://www.instagram.com/p/CkszmehL4hF/
   */
  const isInstagram = ['instagram.com', 'www.instagram.com'].includes(hostname)
  if (isInstagram) {
    const id = pathname
      .replace('/embed', '')
      .replace(/\/$/, '')
      .split('/')
      .slice(-1)[0]
    return {
      url: `https://www.instagram.com/p/${id}/embed`,
      provider: Provider.Instagram,
      allowfullscreen: false,
      sandbox: [],
    }
  }

  /**
   * JSFiddle
   *
   * URL:
   *   - https://jsfiddle.net/zfUyN/
   *   - https://jsfiddle.net/kizu/zfUyN/
   *   - https://jsfiddle.net/kizu/zfUyN/embedded/
   *   - https://jsfiddle.net/kizu/zfUyN/embedded/result/
   *   - https://jsfiddle.net/kizu/zfUyN/embed/js,result/
   */
  const isJSFiddle = ['jsfiddle.net', 'www.jsfiddle.net'].includes(hostname)
  if (isJSFiddle) {
    const parts = pathname
      .replace('/embedded', '')
      .replace(/\/$/, '')
      .split('/')
      .filter(Boolean)
    const id = parts.length === 1 ? parts[0] : parts[1]
    return {
      url: `https://jsfiddle.net/${id}/embedded/`,
      provider: Provider.JSFiddle,
      allowfullscreen: false,
      sandbox: [],
    }
  }

  /**
   * CodePen
   *
   * URL:
   *   - https://codepen.io/ykadosh/pen/jOwjmJe
   *   - https://codepen.io/ykadosh/embed/jOwjmJe
   *   - https://codepen.io/ykadosh/embed/preview/jOwjmJe
   */
  const isCodePen = ['codepen.io', 'www.codepen.io'].includes(hostname)
  if (isCodePen) {
    const author = pathname.split('/')[1]
    const id = pathname.replace(/\/$/, '').split('/').slice(-1)[0]
    return {
      url: `https://codepen.io/${author}/embed/preview/${id}`,
      provider: Provider.CodePen,
      allowfullscreen: false,
      sandbox: [],
    }
  }

  return fallbackReturn
}

const pluginName = 'readOnlyFigureEmbed'

export const ReadOnlyFigureEmbed = Node.create({
  name: pluginName,
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

  // read-only
  atom: true,

  // disallows all marks for figcaption
  marks: '',

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: (element) => element.getAttribute('class'),
      },
      src: {
        default: null,
        parseHTML: (element) =>
          element.querySelector('iframe')?.getAttribute('src'),
      },
    }
  },

  parseHTML() {
    return [
      {
        // match "embed", "embed-video", "embed-code" for backward compatibility
        tag: 'figure[class^="embed"]',
        contentElement: 'figcaption',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { url, provider, allowfullscreen, sandbox } = normalizeEmbedURL(
      HTMLAttributes.src
    )

    // for backward compatibility
    // can be removed when fully switch to new editor
    const isVideo = [
      Provider.YouTube,
      Provider.Vimeo,
      Provider.Bilibili,
    ].includes(provider as Provider)
    const isCode = [Provider.JSFiddle, Provider.CodePen].includes(
      provider as Provider
    )
    const className = [
      'embed',
      ...(isVideo ? [`embed-video`] : []),
      ...(isCode ? [`embed-code`] : []),
    ].join(' ')


    return [
      'figure',
      { class: className, ...(provider ? { 'data-provider': provider } : {}) },
      [
        'div',
        { class: 'iframe-container' },
        [
          'iframe',
          {
            src: url,
            loading: 'lazy',
            ...(sandbox && sandbox.length > 0
              ? { sandbox: sandbox.join(' ') }
              : {}),
            ...(allowfullscreen ? { allowfullscreen: true } : {}),
            frameborder: '0',
            draggable: false,
            contenteditable: false,
          },
        ],
      ],
      ['figcaption', 0],
    ]
  },
})
