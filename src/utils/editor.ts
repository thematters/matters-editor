import _includes from 'lodash/includes'
import { Quill } from 'react-quill'

import { CUSTOM_BLOT_TYPES, SELECTION_TYPES } from '../enums/common'

/**
 * Determine current selection is custom blot or not.
 *
 */
const isCustomBlot = (blot: any): boolean =>
  blot && blot.statics && _includes(CUSTOM_BLOT_TYPES, blot.statics.blotName)

/**
 * Define current selection types, and it cloud be `customBlot`, `newLine` or else.
 *
 */
export const defineSelection = (
  range: { index: number; length: number },
  editor: any,
  instance: any,
  bounds: any
) => {
  const [blot] = instance ? instance.getLeaf(range.index) : [null]
  if (isCustomBlot(blot)) {
    return SELECTION_TYPES.CUSTOM_BLOT
  }

  const isNewLine =
    bounds.left === 0 && !editor.getText(range.index, 1).replace(/\s/, '')
  if (isNewLine) {
    return SELECTION_TYPES.NEW_LINE
  }
}

/**
 * Get Quill instance via reference.
 *
 */
export const getQuillInstance = (reference: any): Quill | null => {
  if (
    !reference ||
    !reference.current ||
    typeof reference.current.getEditor !== 'function'
  ) {
    return null
  }
  return reference.current.getEditor()
}

/**
 * Trim all line breaks from html string.
 *
 */
export const trimLineBreaks = (html: string): string => {
  const LINE_BREAK = '<p><br></p>'
  const regex = new RegExp(`(^(${LINE_BREAK})*)|((${LINE_BREAK})*$)`, 'g')
  return html.replace(regex, '')
}

/**
 * Insert specific embed blocks into content.
 *
 */
export const insertEmbedBlock = (
  instance: Quill | null,
  purpose: EmbedBlockPurpose,
  placeholder: string,
  captionPlaceholder: string
) => {
  if (instance && purpose) {
    const range = instance.getSelection(true)
    instance.insertEmbed(
      range.index,
      'embedClipboard',
      { purpose, placeholder, captionPlaceholder },
      'user'
    )
  }
}

/**
 * Insert images into content.
 *
 */
export const insertImageBlock = (
  instance: Quill | null,
  params: Params,
  captionPlaceholder: string
) => {
  if (instance && params && params.id && params.path) {
    const { id, path } = params
    const range = instance.getSelection(true)
    instance.insertEmbed(
      range.index,
      'imageFigure',
      { src: path, assetId: id, captionPlaceholder },
      'user'
    )
    instance.setSelection(range.index + 1, 0, 'silent')
  }
}
