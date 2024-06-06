import { type ElementContent, type Root, type RootContent } from 'hast'

export interface RehypeSqueezeBreaksOptions {
  maxHardBreaks?: number
  maxSoftBreaks?: number
}

const isEmptyText = (node: RootContent) =>
  node.type === 'text' && node.value.replace(/\s/g, '') === ''

const isBr = (node: RootContent) =>
  node.type === 'element' && node.tagName === 'br'

const isEmptyParagraph = (nodes: ElementContent[]) => {
  // - <p></p>
  // - <p>  </p>
  // - <p><br></p>
  // - <p>  <br></p>
  return nodes.length === 0 || nodes.every((n) => isBr(n) || isEmptyText(n))
}

const squeezeSoftBreaks = ({
  children,
  maxSoftBreaks,
}: { children: ElementContent[] } & Pick<
  RehypeSqueezeBreaksOptions,
  'maxSoftBreaks'
>) => {
  const newChildren: ElementContent[] = []
  const isRetainAll = maxSoftBreaks === -1
  let breakCount = 0

  children.forEach((node) => {
    if (!isBr(node)) {
      breakCount = 0
      newChildren.push(node)
      return
    }

    // cap empty paragraphs or retain all by adding <br>
    breakCount++
    if (isRetainAll || (maxSoftBreaks && breakCount <= maxSoftBreaks)) {
      newChildren.push({
        type: 'element',
        tagName: 'br',
        properties: {},
        children: [],
      })
    }
  })

  return newChildren
}

const squeezeHardBreaks = ({
  children,
  maxHardBreaks,
  maxSoftBreaks,
}: {
  children: Array<RootContent | ElementContent>
} & RehypeSqueezeBreaksOptions) => {
  const newChildren: RootContent[] = []
  const isRetainAll = maxHardBreaks === -1
  let breakCount = 0

  if (maxHardBreaks === undefined) {
    return children
  }

  children.forEach((node) => {
    // skip empty text nodes
    if (isEmptyText(node)) {
      newChildren.push(node)
      return
    }

    // skip non-element nodes
    if (node.type !== 'element') {
      breakCount = 0
      newChildren.push(node)
      return
    }

    switch (node.tagName) {
      case 'blockquote':
        newChildren.push({
          type: 'element',
          tagName: 'blockquote',
          properties: node.properties,
          children: squeezeHardBreaks({
            children: node.children,
            maxHardBreaks,
            maxSoftBreaks,
          }) as ElementContent[],
        })
        break
      case 'p':
        // skip non-empty paragraph:
        if (!isEmptyParagraph(node.children)) {
          breakCount = 0
          newChildren.push({
            type: 'element',
            tagName: 'p',
            properties: node.properties,
            children: squeezeSoftBreaks({
              children: node.children,
              maxSoftBreaks,
            }),
          })
          break
        }

        // cap empty paragraphs or retain all by adding <br>
        breakCount++

        if (!isRetainAll && !(maxHardBreaks && breakCount <= maxHardBreaks)) {
          break
        }

        newChildren.push({
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
        break

      // skip non-paragraph node
      default:
        breakCount = 0
        newChildren.push(node)
    }
  })

  return newChildren
}

/**
 * Squeeze hard and soft breaks to a maximum of N
 *
 * e.g.
 * <p></p><p></p><p></p><p></p><p></p><p></p>
 * =>
 * <p><br></p><p><br></p>
 *
 */
export const rehypeSqueezeBreaks =
  (props: RehypeSqueezeBreaksOptions) => (tree: Root) => {
    if (tree.type !== 'root') {
      return
    }

    if (
      typeof props.maxHardBreaks !== 'number' &&
      typeof props.maxSoftBreaks !== 'number'
    ) {
      return
    }

    tree.children = squeezeHardBreaks({ children: tree.children, ...props })
  }
