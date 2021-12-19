
const parseHTML = require('./parseHTML');

// from docs-soap
const docsId = /id="docs\-internal\-guid/;

// for copying from GoogleDoc
export function soap(html) {
  if (!html.match(docsId)) return html

  const doc = parseHTML(html);

  // GoogleDoc seems always wrap the clipboard under a `<b>` tag with "font-weight:normal;"
  // <b style="font-weight:normal;" id="docs-internal-guid-2db0d950-7fff-7f11-db86-642209503788">
  if (doc?.childNodes?.length > 0 &&
    doc.childNodes[0].tagName === 'B' &&
    doc.childNodes[0].style.fontWeight === 'normal' &&
    doc.childNodes[0].id .match(/^docs-internal-guid-/)) {

    const body = document.createElement('body')
    body.append(... doc.childNodes[0].childNodes)
    return body.outerHTML
  }

  return html
}
