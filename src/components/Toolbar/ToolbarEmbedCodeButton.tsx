import * as React from 'react'

import SVGToolbarEmbedCode from '../../icons/ToolbarEmbedCode'

/**
 * This component is a button for emedding code sandbox into your writing.
 *
 * Usage:
 *   <ToolbarEmbedCodeButton
 *     callback={() => {}}
 *     texts={{}}
 *   />
 *
 * List of CSS classes used in the component:
 *   [
 *     'u-motionn-icon-hover'
 *   ]
 */

interface Props {
  callback: () => void
  texts: Texts
}

export default ({ callback, texts }: Props) => (
  <button aria-label={texts.TOOLBAR_EMBED_CODE} type="button" onClick={callback}>
    <SVGToolbarEmbedCode className="u-motion-icon-hover" />
  </button>
)
