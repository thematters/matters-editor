import { type Editor, Node } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

/**
 * FigureEmbed extension:
 *
 * @see {https://tiptap.dev/experiments/embeds}
 *
 * ```html
 * <figure class="embed">
 *   <div class="iframe-container">
 *     <iframe
 *       loading="lazy"
 *       src="URL"
 *       frameborder="0"
 *       sandbox="allow-scripts allow-same-origin allow-popups">
 *     </iframe>
 *   </div>
 *
 *   <figcaption>CAPTION</figcaption>
 * </figure>
 * ```
 */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureEmbed: {
      setFigureEmbed: (options: {
        src: string
        caption?: string
        position?: number
      }) => ReturnType
    }
  }
}

interface NormalizeEmbedURLReturn {
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
    const t = searchParams.get('t') ?? searchParams.get('start')
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
    hostname,
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

const pluginName = 'figureEmbed'

export const FigureEmbed = Node.create({
  name: pluginName,
  group: 'block',
  content: 'text*',
  draggable: true,
  isolating: true,

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
      HTMLAttributes.src as string,
    )

    // for backward compatibility
    // can be removed when fully switch to new editor
    const isVideo = [
      Provider.YouTube,
      Provider.Vimeo,
      Provider.Bilibili,
    ].includes(provider as Provider)
    const isCode = [Provider.JSFiddle, Provider.CodePen].includes(
      provider as Provider,
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

  addCommands() {
    return {
      setFigureEmbed:
        ({ caption, position, ...attrs }) =>
        ({ chain }) => {
          const insertContent = [
            {
              type: this.name,
              attrs,
              content: caption ? [{ type: 'text', text: caption }] : [],
            },
            {
              type: 'paragraph',
            },
          ]

          if (!position) {
            return chain().insertContent(insertContent).focus().run()
          }

          return chain().insertContentAt(position, insertContent).focus().run()
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('removePastedFigureEmbed'),
        props: {
          handleKeyDown(view, event) {
            const isBackSpace = event.key.toLowerCase() === 'backspace'
            const isEnter = event.key.toLowerCase() === 'enter'

            if (!isBackSpace && !isEnter) {
              return
            }

            const anchorParent = view.state.selection.$anchor.parent
            const isCurrentPlugin = anchorParent.type.name === pluginName
            const isEmptyFigcaption = anchorParent.content.size <= 0

            if (!isCurrentPlugin) {
              return
            }

            // @ts-expect-error
            const editor = view.dom.editor as Editor

            // backSpace to remove if the figcaption is empty
            if (isBackSpace && isEmptyFigcaption) {
              // FIXME: setTimeOut to avoid repetitive deletion
              setTimeout(() => {
                editor.commands.deleteNode(pluginName)
              })
              return
            }

            // insert a new paragraph
            if (isEnter) {
              const { $from, $to } = editor.state.selection
              const isTextAfter = $to.nodeAfter?.type?.name === 'text'

              // skip if figcaption text is selected
              // or has text after current selection
              if ($from !== $to || isTextAfter) {
                return
              }

              // FIXME: setTimeOut to avoid repetitive paragraph insertion
              setTimeout(() => {
                editor.commands.insertContentAt($to.pos + 1, {
                  type: 'paragraph',
                })
              })
            }
          },

          transformPastedHTML(html) {
            // remove
            html = html
              .replace(/\n/g, '')
              .replace(/<figure.*class=.embed.*[\n]*.*?<\/figure>/g, '')
            return html
          },
        },
      }),
    ]
  },
})
