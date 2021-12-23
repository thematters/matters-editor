// @flow
// from https://github.com/aem/docs-soap

module.exports = (
  html: string
): HTMLElement => {
  let doc = void 0;
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, 'text/html');
  } else {
    doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html;
  }
  return doc.body;
};
