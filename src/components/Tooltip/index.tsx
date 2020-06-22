import React from 'react'

import Tippy, { TippyProps } from '@tippyjs/react'

/**
 * This is a wrapper of Tippy.js component.
 *
 * @see {@url https://github.com/atomiks/tippyjs-react}
 */

export const Tooltip: React.FC<TippyProps> = (props) => (
  <Tippy
    arrow={true}
    interactive={false}
    offset={[0, 12]}
    placement="right"
    animation="shift-away"
    theme="tooltip"
    zIndex={101}
    {...props}
  />
)
