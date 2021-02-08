import _debounce from 'lodash/debounce'
import React from 'react'
import ReactQuill, { Quill } from 'react-quill'

import Util from './blots/Util'
import MattersEditorMention from './components/Mention'
import MattersEditorTitle from './components/Title'
import MattersEditorToolbar from './components/Toolbar'
import { FORMAT_CONFIG, MODULE_CONFIG } from './configs/default'
import { DEBOUNCE_DELAY, LANGUAGE, SELECTION_TYPES } from './enums/common'
import { TEXT, Texts } from './enums/text'
import createImageMatcher from './matchers/createImage'
import { initAudioPlayers } from './utils/audioPlayer'
import { defineSelection, getQuillInstance } from './utils/editor'

interface Props {
  editorContent: string
  editorContentId: string
  editorUpdate: (params: Params) => void
  editorUpload: (params: Params) => Promise<ResultData>
  enableReviseMode?: boolean
  enableToolbar?: boolean
  eventName: string
  language: Language
  mentionLoading: boolean
  mentionKeywordChange: (keyword: string) => void
  mentionUsers: any
  mentionListComponent: any
  readOnly: boolean
  theme: string
  texts?: Texts
  titleDefaultValue?: string
  titleReadOnly?: boolean
  uploadAudioSizeLimit?: number
  uploadImageSizeLimit?: number
  scrollingContainer?: string | HTMLElement
}

interface State {
  content: string
  mentionInstance: any
  toolbarPosition: number
  toolbarVisible: boolean
}

export class MattersArticleEditor extends React.Component<Props, State> {
  private instance: Quill | null = null
  private initText: string = ''
  private texts: Texts = null

  private editorReference = React.createRef<ReactQuill>()
  private mentionReference = React.createRef<HTMLElement>()

  constructor(props: Props) {
    super(props)
    this.state = {
      content: this.props.editorContent,
      mentionInstance: null,
      toolbarPosition: 0,
      toolbarVisible: false,
    }

    this.texts = {
      ...TEXT[props.language || LANGUAGE.zh_hant],
      ...props.texts,
    }

    // temporarily hacky solution
    Util.eventDispatcher = this.eventDispatcher
    Util.eventName = props.eventName
    Util.language = props.language || LANGUAGE.zh_hant
    Util.reviseMode = props.enableReviseMode
    Quill.register('formats/util', Util, true)
  }

  componentDidMount() {
    this.instance = this.initQuillInstance()
    this.resetLinkInputPlaceholder()
    initAudioPlayers()

    // set init text
    this.initText = this.instance.getText() || ''
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
      toolbarPosition: 0,
    })
  }

  initQuillInstance = () => {
    const instance = getQuillInstance(this.editorReference)
    if (instance) {
      instance.clipboard.addMatcher(
        'IMG',
        createImageMatcher(this.props.editorUpload)
      )
    }
    return instance
  }

  update = _debounce(
    (updateData: { content: string; currText: string; initText: string }) => {
      this.props.editorUpdate(updateData)
    },
    DEBOUNCE_DELAY
  )

  handleBlur = () => this.update(this.state.content)

  handleChange = (content: string, delta: any, source: string) => {
    this.setState({ content }, () => {
      if (source === 'user') {
        // expose content, current text and initial text to parent
        this.update({
          content,
          currText: this.instance.getText() || '',
          initText: this.initText,
        })
      }
    })
  }

  handleChangeSelection = (
    range: SelectionRange,
    source: string,
    editor: any
  ) => {
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
          toolbarPosition: bounds.top || 0,
        })
        break
      }
      case SELECTION_TYPES.NEW_LINE: {
        this.setState({
          toolbarVisible: true,
          toolbarPosition: bounds.top,
        })
        break
      }
      default: {
        if (this.state.toolbarVisible) {
          this.setState({
            toolbarVisible: false,
            toolbarPosition: bounds.top || 0,
          })
        }
        break
      }
    }
  }

  handleImageDrop = async (file: any): Promise<ResultData> =>
    this.props.editorUpload({ file })

  handleMentionChange = (keyword: string) => {
    this.props.mentionKeywordChange(keyword)
  }

  handleMentionSelection = ({ id, userName, displayName }) => {
    this.state.mentionInstance.insertMention({
      id,
      displayName,
      userName,
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
      const input = this.instance.theme.tooltip.root.querySelector(
        'input[data-link]'
      )
      input.dataset.link = this.texts.LINK_PLACEHOLDER
    } catch (error) {
      // TODO: Add error handler
    }
  }

  storeMentionInstance = (instance: any) =>
    this.setState({ mentionInstance: instance })

  render() {
    const classes = this.props.readOnly ? 'u-area-disable' : ''

    let modulesConfig = {
      ...MODULE_CONFIG,
      imageDrop: {
        eventDispatcher: this.eventDispatcher,
        eventName: this.props.eventName,
        handleImageDrop: this.handleImageDrop,
        texts: this.texts,
      },
      mention: {
        mentionContainer:
          this.mentionReference && this.mentionReference.current,
        handleMentionChange: this.handleMentionChange,
        storeMentionInstance: this.storeMentionInstance,
      },
    }

    if (this.props.enableReviseMode) {
      modulesConfig.toolbar = null
      modulesConfig.imageDrop = null
    }

    return (
      <>
        <MattersEditorTitle
          defaultValue={this.props.titleDefaultValue}
          readOnly={this.props.titleReadOnly}
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
            scrollingContainer={this.props.scrollingContainer}
          />
          <MattersEditorToolbar
            enable={this.props.enableToolbar}
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
