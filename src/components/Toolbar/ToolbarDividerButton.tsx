import React from 'react'

import SVGToolbarDivider from '../../icons/ToolbarDivider'

/**
 * This component is a button for inserting a divider into your writing.
 *
 * Usage:
 *   <ToolbarDividerButton
 *     callback=({} => {})
 *     texts={{}}
 *   />
 */

interface Props {
  callback: (params: Params) => void
  texts: Texts
}

export default ({ callback, texts }: Props) => (
  <button
    aria-label={texts.TOOLBAR_ADD_DIVIDER}
    type="button"
    onClick={callback}
  >
    <SVGToolbarDivider className="u-motion-icon-hover" />
  </button>
)
