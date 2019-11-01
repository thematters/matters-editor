import * as config from './default'

export const FORMAT_CONFIG = [
  // inline
  'bold',
  'italic',
  'underline',

  // block
  'blockquote',
  'list',
  'link',

  // custom
  'mention',
  'smartBreak',

  // hacks
  'util'
]

export const MODULE_CONFIG = {
  ...config.MODULE_CONFIG,
  toolbar: [
    ['bold', 'italic', 'underline'],
    ['blockquote', { list: 'ordered' }, { list: 'bullet' }, 'link']
  ]
}
