import * as React from 'react'

import Tippy, { TippyProps } from '@tippy.js/react'
import { Instance } from 'tippy.js'

/**
 * This is a wrapper of Tippy.js component.
 *
 * @see https://atomiks.github.io/tippyjs
 */

export const Tooltip: React.FC<TippyProps> = props => <Tippy {...props} />
Tooltip.defaultProps = {
  arrow: true,
  interactive: false,
  distance: 12,
  placement: 'right',
  animation: 'shift-away',
  theme: 'tooltip',
  boundary: 'window',
  zIndex: 101
}
