import { type Root, type RootContent } from 'hast'

/**
 * Squeeze empty paragraphs to a maximum of N
 *
 * e.g.
 * <p></p><p></p><p></p><p></p><p></p><p></p>
 * =>
 * <p><br></p><p><br></p>
 *
 * @param {number} maxCount: maximum number of empty paragraphs, -1 to retain all
 *
 */
export const rehypeSqueezeParagraphs =
  ({ maxCount }: { maxCount: number }) =>
  (tree: Root) => {
    if (tree.type !== 'root') {
      return
    }

    const children: RootContent[] = []
    const isRetainAll = maxCount < 0
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

      // cap empty paragraphs or retain all by adding <br>
      count++
      if (count <= maxCount || isRetainAll) {
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
        touched = true
      }
    })

    if (touched || isRetainAll) {
      tree.children = children
    }
  }
