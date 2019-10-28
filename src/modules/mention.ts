import { Quill } from 'react-quill'

import { isValidChars, REGEXP_DISPLAY_NAME } from '../utils/validator'

/**
 * Mention module.
 *
 * @see https://github.com/afconsult/quill-mention
 */

interface ModuleOptions {
  mentionContainer: HTMLElement
  handleMentionChange: (value: string) => void
  storeMentionInstance: (instance: any) => void
}

class Mention {
  quill: Quill
  cursorPos: number | null
  isolateCharacter: boolean
  maxChars: number
  mentionCharPos: any
  mentionContainer: HTMLElement
  mentionDenotationChars: string[]
  handleMentionChange: (value: string) => void
  offsetTop: number
  offsetLeft: number

  constructor(quill: Quill, options: ModuleOptions) {
    this.quill = quill
    this.cursorPos = null
    this.maxChars = 31
    this.mentionCharPos = null
    this.mentionContainer = options.mentionContainer
    this.mentionDenotationChars = ['@']
    this.handleMentionChange = options.handleMentionChange
    this.offsetTop = 16
    this.offsetLeft = 0
    this.isolateCharacter = false
    options.storeMentionInstance(this)
    quill.on('text-change', this.handleTextChange.bind(this))
    quill.on('selection-change', this.handleSelectionChange.bind(this))
  }

  show() {
    if (this.mentionContainer) {
      this.mentionContainer.style.visibility = 'hidden'
      this.mentionContainer.style.display = ''
      this.setMentionContainerPosition()
    }
  }

  hide() {
    if (this.mentionContainer) {
      this.mentionContainer.style.display = 'none'
    }
  }

  insertMention(data: { id: string; displayName: string; userName: string }) {
    if (!data || !this.cursorPos) {
      return
    }

    const tempMentionCharPos = this.mentionCharPos
    this.quill.deleteText(this.mentionCharPos, this.cursorPos - this.mentionCharPos, 'user')
    this.quill.insertEmbed(tempMentionCharPos, 'mention', data, 'user')
    this.quill.insertText(tempMentionCharPos + 1, ' ', 'user')
    this.quill.setSelection(tempMentionCharPos + 2, 'user')
  }

  isContainerBottomCovered(topPos: number, containerPos: any) {
    const elementBottom = topPos + this.mentionContainer.offsetHeight + containerPos.top
    return elementBottom > window.pageYOffset + window.innerHeight
  }

  isContainerRightCovered(leftPos: number, containerPos: any) {
    const rightPos = leftPos + this.mentionContainer.offsetWidth + containerPos.left
    const browserWidth = window.pageXOffset + document.documentElement.clientWidth
    return rightPos > browserWidth
  }

  setMentionContainerPosition() {
    const containerHeight = this.mentionContainer.offsetHeight
    // @ts-ignore
    const containerPosition = this.quill.container.getBoundingClientRect()
    const mentionCharPosition = this.quill.getBounds(this.mentionCharPos)

    let topPosition = this.offsetTop
    let leftPosition = this.offsetLeft

    /**
     * handle horizontal positioning
     */
    leftPosition += mentionCharPosition.left
    if (this.isContainerRightCovered(leftPosition, containerPosition)) {
      const containerWidth = this.mentionContainer.offsetWidth + this.offsetLeft
      const editorWidth = containerPosition.width
      leftPosition = editorWidth - containerWidth
    }

    /**
     * handle vertical positioning
     */
    topPosition += mentionCharPosition.bottom
    if (this.isContainerBottomCovered(topPosition, containerPosition)) {
      let overMentionCharPos = this.offsetTop * -1
      overMentionCharPos += mentionCharPosition.top
      topPosition = overMentionCharPos - containerHeight
    }

    this.mentionContainer.style.top = `${topPosition}px`
    this.mentionContainer.style.left = `${leftPosition}px`
    this.mentionContainer.style.visibility = 'visible'
  }

  handleChange() {
    const range = this.quill.getSelection()
    if (range == null) {
      return
    }

    this.cursorPos = range.index
    const startPos = Math.max(0, this.cursorPos - this.maxChars)
    const beforeCursorPos = this.quill.getText(startPos, this.cursorPos - startPos)
    const mentionCharIndex = this.mentionDenotationChars.reduce((prev, cur) => {
      const previousIndex = prev
      const mentionIndex = beforeCursorPos.lastIndexOf(cur)
      return mentionIndex > previousIndex ? mentionIndex : previousIndex
    }, -1)

    if (mentionCharIndex <= -1) {
      this.hide()
      return
    }

    if (
      this.isolateCharacter &&
      !(mentionCharIndex === 0 || !!beforeCursorPos[mentionCharIndex - 1].match(/\s/g))
    ) {
      this.hide()
      return
    }

    const mentionCharPos = this.cursorPos - (beforeCursorPos.length - mentionCharIndex)
    const textAfter = beforeCursorPos.substring(mentionCharIndex + 1)
    this.mentionCharPos = mentionCharPos

    if (!isValidChars(textAfter)) {
      this.hide()
      return
    }

    this.handleMentionChange(textAfter)
    this.show()
  }

  handleTextChange(delta: any, oldDelta: any, source: string) {
    if (source === 'user') {
      this.handleChange()
    }
  }

  handleSelectionChange(range: SelectionRange) {
    if (range && range.length === 0) {
      this.handleChange()
    } else {
      this.hide()
    }
  }
}

Quill.register('modules/mention', Mention)

export default Mention
