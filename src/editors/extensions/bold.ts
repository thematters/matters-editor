import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from '@tiptap/core'

/**
 * Bold extension forked from:
 *
 * @see {https://github.com/ueberdosis/tiptap/tree/develop/packages/extension-bold}
 * @see {https://github.com/ueberdosis/tiptap/tree/develop/packages/extension-italic}
 * @see {https://github.com/ueberdosis/tiptap/tree/develop/packages/extension-underline}
 *
 * This exenstion can normalize italic and underline to bold.
 */

export interface BoldOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bold: {
      /**
       * Set a bold mark
       */
      setBold: () => ReturnType
      /**
       * Toggle a bold mark
       */
      toggleBold: () => ReturnType
      /**
       * Unset a bold mark
       */
      unsetBold: () => ReturnType
    }
  }
}

export const italicStarInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/
export const italicStarPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g
export const italicUnderscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/
export const italicUnderscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/g
export const boldStarInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/
export const boldStarPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g
export const boldUnderscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/
export const boldUnderscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/g

export const Bold = Mark.create<BoldOptions>({
  name: 'bold',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      // bold
      {
        tag: 'strong',
      },
      {
        tag: 'b',
        getAttrs: (node) =>
          (node as HTMLElement).style.fontWeight !== 'normal' && null,
      },
      {
        style: 'font-weight',
        getAttrs: (value) =>
          /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
      // italic
      {
        tag: 'em',
      },
      {
        tag: 'i',
        getAttrs: (node) =>
          (node as HTMLElement).style.fontStyle !== 'normal' && null,
      },
      {
        style: 'font-style=italic',
      },
      // underline
      {
        tag: 'u',
      },
      {
        style: 'text-decoration',
        consuming: false,
        getAttrs: (style) =>
          (style as string).includes('underline') ? {} : false,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'strong',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setBold:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name)
        },
      toggleBold:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
      unsetBold:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      // bold
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
      // italic
      'Mod-i': () => this.editor.commands.toggleBold(),
      'Mod-I': () => this.editor.commands.toggleBold(),
      // underline
      'Mod-u': () => this.editor.commands.toggleBold(),
      'Mod-U': () => this.editor.commands.toggleBold(),
    }
  },

  addInputRules() {
    return [
      // bold
      markInputRule({
        find: boldStarInputRegex,
        type: this.type,
      }),
      markInputRule({
        find: boldUnderscoreInputRegex,
        type: this.type,
      }),
      // italic
      markInputRule({
        find: italicStarInputRegex,
        type: this.type,
      }),
      markInputRule({
        find: italicUnderscoreInputRegex,
        type: this.type,
      }),
      // underline
    ]
  },

  addPasteRules() {
    return [
      // bold
      markPasteRule({
        find: boldStarPasteRegex,
        type: this.type,
      }),
      markPasteRule({
        find: boldUnderscorePasteRegex,
        type: this.type,
      }),
      // italic
      markPasteRule({
        find: italicStarPasteRegex,
        type: this.type,
      }),
      markPasteRule({
        find: italicUnderscorePasteRegex,
        type: this.type,
      }),
      // underline
    ]
  },
})
