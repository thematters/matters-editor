import { Quill } from 'react-quill'

// import { docsSoap } from 'docs-soap'
import { soap } from '../utils/soap'

import createImageMatcher from '../matchers/createImage'
import { isSafari } from '../utils/browser'
import { dom } from '../utils/dom'

const Delta = Quill.import('delta')

const CodeBlock = Quill.import('formats/code')

const Clipboard = Quill.import('modules/clipboard')

const Parchment = Quill.import('parchment')

/**
 * Override Clipboard because pasting will cause browser scroll to top. And
 * it seems no solution for this bug at this moment.
 *
 * @see: https://github.com/quilljs/quill/issues/1374
 */

class RemadeClipboard extends Clipboard {
  upload: Promise<ResultData>

  constructor(quill, options) {
    super(quill, options)
    this.upload = options.upload
  }

  onPaste(event: any) {
    if (event.defaultPrevented || !this.quill.isEnabled()) {
      return
    }

    const util = Parchment.query('util')
    const reviseMode = util && util.reviseMode === true

    // store scroll position
    const target = isSafari() ? 'body' : 'html'
    const element = dom.$(target)
    const scrollTop = element ? element.scrollTop || 0 : 0

    // parse and concat data
    const range = this.quill.getSelection(true)
    event.preventDefault()
    event.stopPropagation()

    const formats = this.quill.getFormat(this.quill.selection.savedRange.index)
    const clipboardData = event.clipboardData // || window.clipboardData
    // const types = clipboardData.types
    const text = clipboardData.getData('text/plain') // text/plain always exists
    const htmlRaw = clipboardData.getData('text/html')

    // console.log("onPaste:", { types, text, htmlRaw, })

    let delta = new Delta().retain(range.index)
    if (formats[CodeBlock.blotName]) {
      delta.insert(text, {
        [CodeBlock.blotName]: formats[CodeBlock.blotName],
      })
    } else if (!clipboardData.types.includes("text/html") || !htmlRaw) {
      delta.insert(text)
    } else { // text/html
      // add image matcher only when pasting html
      this.addMatcher('IMG', createImageMatcher(this.upload))

      // Needed for Google docs, run only when clipboard is HTML
      const html = soap(htmlRaw) // docsSoap(htmlRaw)
      // console.log("onPaste:", { text, htmlRaw, html })

      let pasteDelta = this.convert(html)

      // remove image matcher in case of re-upload by calling this.convert directly
      this.matchers = (this.matchers || []).filter(
        (matcher) => Array.isArray(matcher) && matcher[0] !== 'IMG'
      )

      if (reviseMode) {
        // if revise-mode is enabled, then skip figure blocks when pasting
        const excludedFormats = [
          'audioFigure',
          'divider',
          'embedCode',
          'embedVideo',
          'imageFigure',
        ]
        pasteDelta.ops = pasteDelta.ops.filter((ops) => {
          const name = Object.keys(ops.insert || {})[0]
          if (excludedFormats.includes(name)) {
            return false
          }
          return true
        })
      }

      delta = delta.concat(pasteDelta)
    }
    delta.delete(range.length)
    this.quill.updateContents(delta, 'user')
    this.quill.setSelection(delta.length() - range.length, 'silent')

    // re-apply stored scroll position
    element.scrollTop = scrollTop
  }
}

Quill.register('modules/clipboard', RemadeClipboard, true)
