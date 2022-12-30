import Quill from 'quill'

const Embed = Quill.import('blots/embed')

interface MentionParams {
  displayName: string
  id: string
  userName: string
}

class Mention extends Embed {
  static create(value: MentionParams) {
    const node = super.create(value) as HTMLElement

    node.setAttribute('href', `/@${value.userName}`)
    node.setAttribute('target', '_blank')
    node.dataset.displayName = value.displayName
    node.dataset.userName = value.userName
    node.dataset.id = value.id
    node.textContent = `@${value.displayName}`

    return node
  }

  static value(domNode: HTMLElement) {
    return domNode.dataset
  }
}

Mention.blotName = 'mention'
Mention.tagName = 'a'
Mention.className = 'mention'

Quill.register('formats/mention', Mention)

export default Mention
