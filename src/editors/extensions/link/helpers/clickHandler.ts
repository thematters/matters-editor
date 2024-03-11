import { getAttributes } from '@tiptap/core'
import { type MarkType } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'

interface ClickHandlerOptions {
  type: MarkType
}

export function clickHandler(options: ClickHandlerOptions): Plugin {
  return new Plugin({
    key: new PluginKey('handleClickLink'),
    props: {
      handleClick: (view, pos, event) => {
        if (event.button !== 1) {
          return false
        }

        const attrs = getAttributes(view.state, options.type.name)
        const link = (event.target as HTMLElement)?.closest('a')

        const href = link?.href ?? (attrs.href as string)
        const target = link?.target ?? (attrs.target as string)

        if (link && href) {
          window.open(href, target)

          return true
        }

        return false
      },
    },
  })
}
