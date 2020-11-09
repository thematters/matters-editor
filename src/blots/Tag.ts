import { Quill } from 'react-quill'

const Embed = Quill.import('blots/embed')

interface TagParams {
  displayName: string
  id: string
}

class Tag extends Embed {
  static create(value: TagParams) {
    const node = super.create(value) as HTMLElement

    node.setAttribute('href', `/tags/${value.id}`)
    node.setAttribute('target', '_blank')
    node.dataset.displayName = value.displayName
    node.dataset.id = value.id
    node.textContent = `#${value.displayName}`

    return node
  }

  static value(domNode: HTMLElement) {
    return domNode.dataset
  }
}

Tag.blotName = 'tag'
Tag.tagName = 'a'
Tag.className = 'tag'

Quill.register('formats/tag', Tag)

export default Tag
