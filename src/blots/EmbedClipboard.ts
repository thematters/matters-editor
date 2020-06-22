import { Quill } from 'react-quill'

import { COLOR, KEYCODES, URL_LIKE_BUTTON } from '../enums/common'
import { TEXT } from '../enums/text'
import * as embedUrl from '../utils/embed'

const Parchment = Quill.import('parchment')
const BlockEmbed = Quill.import('blots/block/embed')

type Purpose = 'video' | 'code'

interface EmbedParams {
  placeholder: string
  purpose: Purpose
}

class EmbedClipboard extends BlockEmbed {
  private get quill() {
    if (!this.scroll || !this.scroll.domNode.parentNode) {
      return null
    }
    return Quill.find(this.scroll.domNode.parentNode)
  }

  static create(value: EmbedParams) {
    const node = super.create(value)
    node.setAttribute('value', '')
    node.setAttribute('placeholder', value.placeholder)
    node.setAttribute('data-purpose', value.purpose)
    node.setAttribute('contenteditable', 'false')
    return node
  }

  static value(domNode: HTMLElement) {
    return {
      placeholder: domNode.getAttribute('placeholder') || '',
      purpose: domNode.getAttribute('data-purpose') || null,
    }
  }

  constructor(domNode: HTMLElement) {
    super(domNode)
    domNode.addEventListener('blur', this.onBlur)
    domNode.addEventListener('paste', this.onPaste)
    domNode.addEventListener('keydown', this.onPress)
    setTimeout(() => {
      domNode.focus()
    })
  }

  onBlur = (event: FocusEvent) => {
    const target = event.currentTarget as HTMLInputElement

    if (!target.value) {
      this.removeBlot()
    } else {
      this.submit(target.value)
    }
  }

  onPaste = (event: ClipboardEvent) => {
    event.stopPropagation()
  }

  onPress = (event: KeyboardEvent) => {
    event.stopPropagation()

    const key = event.which || event.keyCode
    const target = event.currentTarget as HTMLInputElement

    if (!target.value && key !== KEYCODES.ENTER) {
      return
    }

    // blur to trigger `this.onBlur` to fire `this.submit`
    target.blur()
  }

  removeBlot = () => {
    this.remove()

    if (!this.quill) {
      return
    }

    const range = this.quill.getSelection(true)
    this.quill.setSelection(range.index, 0, 'silent')
  }

  submit = (text: string) => {
    const { embedClipboard } = this.value()
    let url = ''

    if (!this.quill) {
      return
    }

    if (embedClipboard.purpose === 'video') {
      url = embedUrl.video(text)
    } else if (embedClipboard.purpose === 'code') {
      url = embedUrl.code(text)
    }

    if (url && url != URL_LIKE_BUTTON) {
      this.insertEmbed(url)
    } else {
      this.replaceWithText(text)
    }

    if (url === URL_LIKE_BUTTON) {
      const util = Parchment.query('util')
      if (util && util.eventDispatcher && util.eventName && util.language) {
        util.eventDispatcher(util.eventName, {
          color: COLOR.RED,
          content: TEXT[util.language].LIKE_BUTTON_FAILED,
        })
      }
    }
  }

  insertEmbed = (url: string) => {
    const { embedClipboard } = this.value()
    const range = this.quill.getSelection(true)
    const blotName = { video: 'embedVideo', code: 'embedCode' }[
      embedClipboard.purpose as Purpose
    ]
    this.removeBlot()
    this.quill.insertEmbed(range.index, blotName, { url }, 'user')
    this.quill.setSelection(range.index + 1, 0, 'silent')
  }

  replaceWithText = (text: string) => {
    const range = this.quill.getSelection(true)
    this.removeBlot()
    this.quill.insertText(range.index, text, 'user')
    this.quill.setSelection(range.index + text.length, 0, 'silent')
  }
}

EmbedClipboard.blotName = 'embedClipboard'
EmbedClipboard.className = 'embed-clipboard'
EmbedClipboard.tagName = 'input'

Quill.register('formats/embedClipboard', EmbedClipboard)

export default EmbedClipboard
