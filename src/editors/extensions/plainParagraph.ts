import { mergeAttributes, Node } from '@tiptap/core'

export interface PlainParagraphOptions {
  /**
   * The HTML attributes for a plain paragraph node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    plainParagraph: {
      setPlainParagraph: () => ReturnType
    }
  }
}

/**
 * This extension allows you to create
 * plain paragraphs (only support plain text and hard break)
 * for plainBlockquote extension.
 *
 * Forked from:
 * @see https://www.tiptap.dev/api/nodes/paragraph
 */
export const PlainParagraph = Node.create<PlainParagraphOptions>({
  name: 'plainParagraph',

  // higher priority to override the default paragraph node
  // https://github.com/ueberdosis/tiptap/blob/f635d7b4f511530496377a8ef051875e30e301a4/packages/extension-paragraph/src/paragraph.ts#L31
  priority: 2000,

  addOptions() {
    return {
      HTMLAttributes: { class: 'plain' },
    }
  },

  group: 'plainBlock',

  content: 'inline*',

  marks: '',

  defining: true,

  parseHTML() {
    return [{ tag: 'p[class="plain"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setPlainParagraph:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
    }
  },
})
