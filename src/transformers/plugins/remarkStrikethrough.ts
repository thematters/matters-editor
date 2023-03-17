import { Root } from 'mdast'
import {
  combineExtensions,
  // combineHtmlExtensions,
} from 'micromark-util-combine-extensions'
import {
  gfmStrikethrough,
  // gfmStrikethroughHtml,
  Options as MicromarkStrikethroughOptions,
} from 'micromark-extension-gfm-strikethrough'
import {
  gfmStrikethroughFromMarkdown,
  gfmStrikethroughToMarkdown,
} from 'mdast-util-gfm-strikethrough'
import { Plugin, Processor } from 'unified'

type GfmOptions = MicromarkStrikethroughOptions | undefined

function gfm(options: GfmOptions) {
  return combineExtensions([gfmStrikethrough(options)])
}

// function gfmHtml() {
//   return combineHtmlExtensions([gfmStrikethroughHtml])
// }

function gfmFromMarkdown() {
  return [gfmStrikethroughFromMarkdown]
}

function gfmToMarkdown() {
  return {
    extensions: [gfmStrikethroughToMarkdown],
  }
}

function _remarkStrikethrough(options = {}) {
  // @ts-ignore
  const data = this.data()

  const add = (field: string, value: unknown) => {
    const list = data[field] ? data[field] : (data[field] = [])
    // @ts-ignore
    list.push(value)
  }

  add('micromarkExtensions', gfm(options))
  add('fromMarkdownExtensions', gfmFromMarkdown())
  add('toMarkdownExtensions', gfmToMarkdown())
}

export const remarkStrikethrough = _remarkStrikethrough as Plugin<
  [MicromarkStrikethroughOptions?],
  Root
>
