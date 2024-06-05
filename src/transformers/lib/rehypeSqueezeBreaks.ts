import { type ElementContent, type Root, type RootContent } from 'hast'

interface Props {
  maxHardBreaks?: number
  maxSoftBreaks?: number
}

const isEmptyText = (node: RootContent) =>
  node.type === 'text' && node.value.replace(/\s/g, '') === ''

const isBr = (node: RootContent) =>
  node.type === 'element' && node.tagName === 'br'

const squeezeSoftBreaks = ({
  children,
  maxSoftBreaks,
}: { children: ElementContent[] } & Pick<Props, 'maxSoftBreaks'>) => {
  const newChildren: ElementContent[] = []
  const isRetainAll = maxSoftBreaks === -1
  let breakCount = 0

  children.forEach((node) => {
    if (node.type !== 'element' || node.tagName !== 'br') {
      breakCount = 0
      newChildren.push(node)
      return
    }

    // cap empty paragraphs or retain all by adding <br>
    breakCount++
    const shouldRetain =
      isRetainAll || (maxSoftBreaks ? breakCount <= maxSoftBreaks : false)
    if (shouldRetain) {
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
}: { children: Array<RootContent | ElementContent> } & Props) => {
  const newChildren: RootContent[] = []
  const isRetainAll = maxHardBreaks === -1
  let breakCount = 0

  children.forEach((node) => {
    // skip empty text nodes
    if (isEmptyText(node)) {
      newChildren.push(node)
      return
    }

    // paragraphs in blockquote
    if (node.type === 'element' && node.tagName === 'blockquote') {
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
      return
    }

    // skip non-paragraph node
    if (node.type !== 'element' || node.tagName !== 'p') {
      breakCount = 0
      newChildren.push(node)
      return
    }

    // skip non-empty paragraph:
    // - <p></p>
    // - <p>  </p>
    // - <p><br></p>
    // - <p>  <br></p>
    const isEmptyParagraph =
      node.children.length === 0 ||
      node.children.every((n) => isBr(n) || isEmptyText(n))
    if (!isEmptyParagraph) {
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
      return
    }

    // cap empty paragraphs or retain all by adding <br>
    breakCount++
    const shouldRetain =
      isRetainAll || (maxHardBreaks ? breakCount <= maxHardBreaks : false)
    if (shouldRetain) {
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
export const rehypeSqueezeBreaks = (props: Props) => (tree: Root) => {
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
