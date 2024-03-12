import { type Root, type RootContent } from 'hast'

/**
 * Squeeze empty paragraphs to a maximum of N
 *
 * e.g.
 * <p></p><p></p><p></p><p></p><p></p><p></p>
 * =>
 * <p><br></p><p><br></p>
 *
 * @param {number} maxCount
 */
export const rehypeSqueezeParagraphs =
  ({ maxCount }: { maxCount: number }) =>
  (tree: Root) => {
    if (tree.type !== 'root') {
      return
    }

    const children: RootContent[] = []
    let count = 0
    let touched = false

    tree.children.forEach((node) => {
      // skip empty text nodes
      if (node.type === 'text' && node.value.replace(/\s/g, '') === '') {
        children.push(node)
        return
      }

      // skip non-paragraph nodes
      if (node.type !== 'element' || node.tagName !== 'p') {
        count = 0
        children.push(node)
        return
      }

      // skip non-empty paragraphs:
      // - <p></p>
      // - <p><br/></p>
      const isEmptyParagraph =
        node.children.length === 0 ||
        node.children.every((n) => n.type === 'element' && n.tagName === 'br')
      if (!isEmptyParagraph) {
        count = 0
        children.push(node)
        return
      }

      // cap empty paragraphs
      count++
      if (count <= maxCount) {
        children.push({
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'br',
              properties: {},
              children: [],
            },
          ],
        })
      } else {
        touched = true
      }
    })

    if (touched) {
      tree.children = children
    }
  }
