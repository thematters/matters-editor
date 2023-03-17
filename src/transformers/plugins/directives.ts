import { Root } from 'mdast'
import { Plugin } from 'unified'

export const directives: Plugin<[], Root> = () => {
  return (tree) => {
    // @ts-ignore
    visit(tree, (node) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        const data = node.data || (node.data = {})
        // @ts-ignore
        const hast = h(node.name, node.attributes)

        data.hName = hast.tagName
        data.hProperties = hast.properties
      }
    })
  }
}
