import { parseHTML } from './parseHTML'

// from docs-soap
const docsId = /id="docs\-internal\-guid/

// for copying from GoogleDoc
export function soap(html: string) {
  if (!html.match(docsId)) return html

  const doc = parseHTML(html)

  // GoogleDoc seems always wrap the clipboard under a `<b>` tag with "font-weight:normal;"
  // <b style="font-weight:normal;" id="docs-internal-guid-2db0d950-7fff-7f11-db86-642209503788">...</b>
  if (
    doc?.children?.length > 0 &&
    doc.children[0] instanceof Node &&
    doc.children[0].nodeType === Node.ELEMENT_NODE
  ) {
    const node = doc.children[0] as HTMLElement
    if (
      node.tagName === 'B' &&
      node.style?.fontWeight === 'normal' &&
      node.id?.match(/^docs-internal-guid-/)
    ) {
      const body = document.createElement('body')
      body.append(...node.children)
      return body.outerHTML
    }
  }

  return html
}
