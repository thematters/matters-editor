import React from 'react'

import { Texts } from '../../enums/text'
import SVGToolbarEmbedCode from '../../icons/ToolbarEmbedCode'

/**
 * This component is a button for emedding code sandbox into your writing.
 *
 * Usage:
 *   <ToolbarEmbedCodeButton
 *     callback={() => {}}
 *     texts={{}}
 *   />
 */

interface Props {
  callback: () => void
  texts: Texts
}

export default ({ callback, texts }: Props) => (
  <button
    aria-label={texts.TOOLBAR_EMBED_CODE}
    type="button"
    onClick={callback}
  >
    <SVGToolbarEmbedCode className="u-motion-icon-hover" />
  </button>
)
