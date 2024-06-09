import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export interface BlockquoteOptions {
  /**
   * HTML attributes to add to the blockquote element
   * @default {}
   * @example { class: 'foo' }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockQuote: {
      /**
       * Set a blockquote node
       */
      setBlockquote: () => ReturnType
      /**
       * Toggle a blockquote node
       */
      toggleBlockquote: () => ReturnType
      /**
       * Unset a blockquote node
       */
      unsetBlockquote: () => ReturnType
    }
  }
}
/**
 * Matches a blockquote to a `>` as input.
 */
export const inputRegex = /^\s*>\s$/

/**
 * This extension allows you to create blockquotes,
 * contains only plain text paragraph and soft break (<br>).
 *
 * Forked from:
 * @see https://tiptap.dev/api/nodes/blockquote
 */
export const Blockquote = Node.create<BlockquoteOptions>({
  name: 'blockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'paragraph+',

  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'blockquote',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setBlockquote:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name)
        },
      toggleBlockquote:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name)
        },
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('restrictBlockquoteMarks'),
        filterTransaction: (transaction) => {
          // Nothing has changed, ignore it.
          if (!transaction.docChanged) {
            return true
          }

          // Skip if not in a blockquote
          const $anchor = transaction.selection.$anchor
          const $grandParent = $anchor.node($anchor.depth - 1)
          const isInBlockquote = $grandParent.type.name === this.name
          if (!isInBlockquote) {
            return true
          }

          // Prevent adding marks (except <br>) to blockquote
          const $start = $anchor.start($anchor.depth - 1)
          const $end = $anchor.end($anchor.depth - 1)
          transaction.removeMark($start, $end)

          return true
        },
      }),
    ]
  },
})
