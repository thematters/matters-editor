import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

export interface HorizontalRuleOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    horizontalRule: {
      /**
       * Add a horizontal rule
       */
      setHorizontalRule: () => ReturnType
    }
  }
}

export const HorizontalRule = Node.create<HorizontalRuleOptions>({
  name: 'horizontalRule',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  parseHTML() {
    return [{ tag: 'hr' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent([
              { type: this.name },
              {
                type: 'paragraph',
              },
            ])
            .run()
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
        type: this.type,
      }),
    ]
  },
})
