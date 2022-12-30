import Quill from 'quill'

import BaseBlockEmbed from './BaseBlockEmbed'

const Parchment = Quill.import('parchment')

interface AudioFigureParams {
  caption?: string
  fileName?: string
  sources: Array<{ src: string; type: string; assetId: string }>
}

class AudioFigure extends BaseBlockEmbed {
  static blotName = 'audioFigure'
  static className = 'audio'
  static tagName = 'figure'

  public static create(value: AudioFigureParams) {
    const node = super.create(value)

    // caption
    const figcaption = Parchment.create('figcaption', {
      caption: value.caption || '',
    }).domNode

    // audio
    const audio = document.createElement('audio')
    audio.setAttribute('controls', '')
    audio.setAttribute('controlsList', 'nodownload')
    audio.dataset.fileName = value.fileName
    value.sources.forEach(({ src, type, assetId }) => {
      const source = Parchment.create('source', { src, type }).domNode
      source.dataset.assetId = assetId
      audio.appendChild(source)
    })

    // player
    const player = document.createElement('div')
    player.setAttribute('class', 'player')
    node.setAttribute('contenteditable', 'false')
    player.innerHTML = `
      <header>
        <div class="meta">
          <h4 class="title" contenteditable="true">${value.fileName}</h4>

          <div class="time">
            <span class="current"></span>
            <span class="duration"></span>
          </div>
        </div>

        <span class="play"></span>
      </header>

      <footer>
        <div class="progress-bar">
          <span></span>
        </div>
      </footer>
    `

    const util = Parchment.query('util')
    if (util && util.reviseMode === true) {
      node.setAttribute('contenteditable', false)
      node.classList.add('u-area-disable')
    }

    node.appendChild(audio)
    node.appendChild(player)
    node.appendChild(figcaption)

    return node
  }

  static value(domNode: HTMLElement): any {
    const audio = domNode.querySelector('audio')
    const caption = domNode.querySelector('figcaption')
    const sources = domNode.querySelectorAll('source')

    const sourcesVal: Array<{ src: string; type: string; assetId: string }> = []
    if (sources.length > 0) {
      Array.prototype.forEach.call(sources, (node: HTMLElement) => {
        sourcesVal.push({
          src: node.getAttribute('src') || '',
          type: node.getAttribute('type') || '',
          assetId: node.dataset.assetId || '',
        })
      })
    }

    return {
      caption: caption ? caption.innerText : '',
      fileName: audio ? audio.dataset.fileName : '',
      sources: sourcesVal,
    }
  }

  $title: HTMLElement | null
  $audio: HTMLAudioElement | null

  constructor(domNode: HTMLElement) {
    super(domNode)

    this.$title = domNode.querySelector('.title')
    this.$audio = domNode.querySelector('audio')

    if (!this.$title || !this.$audio) {
      return
    }

    this.$title.addEventListener('keydown', this.onPress)
    this.$title.addEventListener('paste', this.onPaste)
    this.$title.addEventListener('change', this.onPress)
    this.$title.addEventListener('blur', this.onPress)
  }

  onPaste = (event: ClipboardEvent) => {
    event.stopPropagation()
  }

  onPress = () => {
    if (!this.$title || !this.$audio) {
      return
    }

    this.$audio.dataset.fileName = this.$title.innerText
  }
}

Quill.register('formats/audioFigure', AudioFigure)

export default AudioFigure
