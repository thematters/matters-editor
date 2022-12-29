import Quill from 'quill'

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

  constructor(quill: Quill, options: ModuleOptions) {
    this.quill = quill
    this.cursorPos = null
    this.maxChars = 31
    this.mentionCharPos = null
    this.mentionContainer = options.mentionContainer
    this.mentionDenotationChars = ['@']
    this.handleMentionChange = options.handleMentionChange
    this.isolateCharacter = false
    options.storeMentionInstance(this)
    quill.on('text-change', this.handleTextChange.bind(this))
    quill.on('selection-change', this.handleSelectionChange.bind(this))
  }

  show() {
    if (this.mentionContainer) {
      this.mentionContainer.style.display = ''
      this.setMentionPosition()
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
    this.quill.deleteText(
      this.mentionCharPos,
      this.cursorPos - this.mentionCharPos,
      'user'
    )
    this.quill.insertEmbed(tempMentionCharPos, 'mention', data, 'user')
    this.quill.setSelection(tempMentionCharPos + 1, 'user')

    setTimeout(() => {
      this.quill.insertText(tempMentionCharPos + 1, ' ', 'user')
      this.quill.setSelection(tempMentionCharPos + 2, 'user')
    })
  }

  setMentionPosition() {
    // @ts-ignore
    const editorBounds = this.quill.container.getBoundingClientRect() as DOMRect
    const mentionBounds = this.mentionContainer.getBoundingClientRect() as DOMRect
    const mentionCharPosition = this.quill.getBounds(this.mentionCharPos)

    // horizontal
    const offsetLeft = 16
    const exceptLeft = mentionCharPosition.left + offsetLeft
    const maxLeft = editorBounds.width - mentionBounds.width - offsetLeft
    const left = Math.min(exceptLeft, maxLeft)

    // vertical
    const offsetTop = 16
    const exceptTop = mentionCharPosition.bottom + offsetTop
    const exceptTopFlip = mentionCharPosition.top - mentionBounds.height
    const isOverEditorBottom =
      editorBounds.top + exceptTop + mentionBounds.height > editorBounds.bottom
    const isFlipOverEditorTop = exceptTopFlip < 0

    let top
    if (isOverEditorBottom && isFlipOverEditorTop) {
      top = exceptTop
    } else if (isOverEditorBottom) {
      top = exceptTopFlip
    } else {
      top = exceptTop
    }

    this.mentionContainer.style.transform = `translate(${left}px, ${top}px)`
  }

  handleChange() {
    const range = this.quill.getSelection()
    if (range == null) {
      return
    }

    this.cursorPos = range.index
    const startPos = Math.max(0, this.cursorPos - this.maxChars)
    const beforeCursorPos = this.quill.getText(
      startPos,
      this.cursorPos - startPos
    )
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
      !(
        mentionCharIndex === 0 ||
        !!beforeCursorPos[mentionCharIndex - 1].match(/\s/g)
      )
    ) {
      this.hide()
      return
    }

    const mentionCharPos =
      this.cursorPos - (beforeCursorPos.length - mentionCharIndex)
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
