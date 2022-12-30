import Quill from 'quill'

const Embed = Quill.import('blots/embed')

/**
 * This is not a legit blot.
 *
 */
class Util extends Embed {}

Util.blotName = 'util'
Util.className = 'hacky-util'
Util.tagName = 'br'

export default Util
