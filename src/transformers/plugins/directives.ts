import { type Root } from 'mdast'
import { type Plugin } from 'unified'

export const directives: Plugin<[], Root> = () => {
  return (tree) => {
    // @ts-expect-error
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        const data = node.data || (node.data = {})
        // @ts-expect-error
        const hast = h(node.name, node.attributes)

        data.hName = hast.tagName
        data.hProperties = hast.properties
      }
    })
  }
}
