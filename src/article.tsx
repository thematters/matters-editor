import debounce from 'lodash/debounce'
import * as React from 'react'
import ReactQuill, { Quill } from 'react-quill'

import Util from './blots/Util'
import MattersEditorMention from './components/Mention'
import MattersEditorTitle from './components/Title'
import MattersEditorToolbar from './components/Toolbar'
import { FORMAT_CONFIG, MODULE_CONFIG } from './configs/default'
import { DEBOUNCE_DELAY, LANGUAGE, SELECTION_TYPES } from './enums/common'
import { TEXT } from './enums/text'
import createImageMatcher from './matchers/createImage'
import { initAudioPlayers } from './utils/audioPlayer'
import { defineSelection, getQuillInstance } from './utils/editor'

interface Props {
  editorContent: string
  editorContentId: string
  editorUpdate: (params: Params) => void
  editorUpload: (params: Params) => Promise<ResultData>
  eventName: string
  language: string
  mentionLoading: boolean
  mentionKeywordChange: (keyword: string) => void
  mentionUsers: any
  mentionListComponent: any
  readOnly: boolean
  siteDomain: string
  theme: string
  texts?: Texts
  titleDefaultValue?: string
  uploadAssetDomain: string
  uploadAudioSizeLimit?: number
  uploadImageSizeLimit?: number
}

interface State {
  content: string
  mentionInstance: any
  toolbarPosition: number
  toolbarVisible: boolean
}

export class MattersArticleEditor extends React.Component<Props, State> {
  private instance: Quill | null = null

  private editorReference = React.createRef<ReactQuill>()

  private mentionReference = React.createRef<HTMLElement>()

  private texts: Texts = null

  constructor(props: Props) {
    super(props)
    this.state = {
      content: this.props.editorContent,
      mentionInstance: null,
      toolbarPosition: 0,
      toolbarVisible: false
    }
    this.texts = props.texts || TEXT[props.language] || TEXT[LANGUAGE.ZH_HANT]

    // temporarily hacky solution
    Util.eventDispatcher = this.eventDispatcher
    Util.eventName = props.eventName
    Util.language = props.language || LANGUAGE.ZH_HANT
    Quill.register('formats/util', Util, true)
  }

  componentDidMount() {
    this.instance = this.initQuillInstance()
    this.resetLinkInputPlaceholder()
    initAudioPlayers()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.instance = this.initQuillInstance()
    this.resetLinkInputPlaceholder()
    initAudioPlayers()

    if (prevProps.editorContentId === this.props.editorContentId) {
      return
    }

    this.setState({
      content: this.props.editorContent || '',
      toolbarVisible: false,
      toolbarPosition: 0
    })
  }

  initQuillInstance = () => {
    const instance = getQuillInstance(this.editorReference)
    if (instance) {
      instance.clipboard.addMatcher(
        'IMG',
        createImageMatcher(
          this.props.editorUpload,
          this.props.uploadAssetDomain,
          this.props.siteDomain
        )
      )
    }
    return instance
  }

  update = debounce((content: string) => {
    this.props.editorUpdate({ content })
  }, DEBOUNCE_DELAY)

  handleBlur = () => this.update(this.state.content)

  handleChange = (content: string, delta: any, source: string) => {
    this.setState({ content }, () => {
      if (source === 'user') {
        this.update(content)
      }
    })
  }

  handleChangeSelection = (range: SelectionRange, source: string, editor: any) => {
    if (!range) {
      return
    }
    const instance = getQuillInstance(this.editorReference)
    const bounds = editor.getBounds(range)
    const selection = defineSelection(range, editor, instance, bounds)

    switch (selection) {
      case SELECTION_TYPES.CUSTOM_BLOT: {
        this.setState({
          toolbarVisible: false,
          toolbarPosition: bounds.top || 0
        })
        break
      }
      case SELECTION_TYPES.NEW_LINE: {
        this.setState({
          toolbarVisible: true,
          toolbarPosition: bounds.top
        })
        break
      }
      default: {
        if (this.state.toolbarVisible) {
          this.setState({
            toolbarVisible: false,
            toolbarPosition: bounds.top || 0
          })
        }
        break
      }
    }
  }

  handleImageDrop = async (file: any): Promise<ResultData> => this.props.editorUpload({ file })

  handleMentionChange = debounce((keyword: string) => {
    this.props.mentionKeywordChange(keyword)
  }, DEBOUNCE_DELAY)

  handleMentionSelection = ({ id, userName, displayName }) => {
    this.state.mentionInstance.insertMention({
      id,
      displayName,
      userName
    })
  }

  eventDispatcher = (event: string, data: any) => {
    if (this.props.eventName && window) {
      window.dispatchEvent(new CustomEvent(event, { detail: { ...data } }))
    }
  }

  resetLinkInputPlaceholder = () => {
    if (!this.instance) {
      return
    }
    try {
      // @ts-ignore
      const input = this.instance.theme.tooltip.root.querySelector('input[data-link]')
      input.dataset.link = this.texts.LINK_PLACEHOLDER
    } catch (error) {
      // TODO: Add error handler
    }
  }

  storeMentionInstance = (instance: any) => this.setState({ mentionInstance: instance })

  render() {
    const classes = this.props.readOnly ? 'u-area-disable' : ''

    const modulesConfig = {
      ...MODULE_CONFIG,
      imageDrop: {
        eventDispatcher: this.eventDispatcher,
        eventName: this.props.eventName,
        handleImageDrop: this.handleImageDrop,
        texts: this.texts
      },
      mention: {
        mentionContainer: this.mentionReference && this.mentionReference.current,
        handleMentionChange: this.handleMentionChange,
        storeMentionInstance: this.storeMentionInstance
      }
    }

    return (
      <>
        <MattersEditorTitle
          defaultValue={this.props.titleDefaultValue}
          readOnly={this.props.readOnly}
          texts={this.texts}
          update={this.props.editorUpdate}
        />
        <div id="editor-article-container" className={classes}>
          <ReactQuill
            formats={FORMAT_CONFIG}
            modules={modulesConfig}
            placeholder={this.texts.EDITOR_PLACEHOLDER}
            readOnly={this.props.readOnly}
            ref={this.editorReference}
            theme={this.props.theme}
            value={this.state.content}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            onChangeSelection={this.handleChangeSelection}
          />
          <MattersEditorToolbar
            eventDispatcher={this.eventDispatcher}
            eventName={this.props.eventName}
            instance={this.instance}
            position={this.state.toolbarPosition}
            visible={this.state.toolbarVisible}
            texts={this.texts}
            update={this.props.editorUpdate}
            upload={this.props.editorUpload}
            uploadAudioSizeLimit={this.props.uploadAudioSizeLimit}
            uploadImageSizeLimit={this.props.uploadImageSizeLimit}
          />
          <MattersEditorMention
            mentionLoading={this.props.mentionLoading}
            mentionListComponent={this.props.mentionListComponent}
            mentionSelection={this.handleMentionSelection}
            mentionUsers={this.props.mentionUsers}
            reference={this.mentionReference}
          />
        </div>
      </>
    )
  }
}
