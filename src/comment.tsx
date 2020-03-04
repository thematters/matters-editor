import debounce from 'lodash/debounce'
import * as React from 'react'
import ReactQuill, { Quill } from 'react-quill'

import MattersEditorMention from './components/Mention'
import { FORMAT_CONFIG, MODULE_CONFIG } from './configs/comment'
import { DEBOUNCE_DELAY, LANGUAGE } from './enums/common'
import { TEXT } from './enums/text'
import { getQuillInstance } from './utils/editor'

interface Props {
  editorContent: string
  editorUpdate: (params: Params) => void
  eventName: string
  language: string
  mentionLoading: boolean
  mentionKeywordChange: (keyword: string) => void
  mentionUsers: any
  mentionListComponent: any
  readOnly: boolean
  theme: string
  texts?: Texts
}

interface State {
  focus: boolean
  mentionInstance: any
}

export class MattersCommentEditor extends React.Component<Props, State> {
  private instance: Quill | null = null

  private editorReference = React.createRef<ReactQuill>()

  private mentionReference = React.createRef<HTMLElement>()

  private texts: Texts = null

  constructor(props: Props) {
    super(props)
    this.state = {
      focus: false,
      mentionInstance: null
    }
    this.texts = props.texts || TEXT[props.language] || TEXT[LANGUAGE.ZH_HANT]
  }

  componentDidMount() {
    this.instance = this.initQuillInstance()
    this.resetLinkInputPlaceholder()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.instance = this.initQuillInstance()
    this.resetLinkInputPlaceholder()
  }

  initQuillInstance = () => getQuillInstance(this.editorReference)

  update = debounce((content: string) => {
    this.props.editorUpdate({ content })
  }, DEBOUNCE_DELAY)

  handleBlur = () => this.setState({ focus: false })

  handleFocus = () => this.setState({ focus: true })

  handleChange = (content: string) => this.update(content)

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
    const classes = this.state.focus ? 'focus' : ''

    const modulesConfig = {
      ...MODULE_CONFIG,
      mention: {
        mentionContainer: this.mentionReference && this.mentionReference.current,
        handleMentionChange: this.handleMentionChange,
        storeMentionInstance: this.storeMentionInstance
      }
    }

    return (
      <>
        <div id="editor-comment-container" className={classes}>
          <ReactQuill
            formats={FORMAT_CONFIG}
            modules={modulesConfig}
            placeholder={this.texts.COMMENT_PLACEHOLDER}
            readOnly={this.props.readOnly}
            ref={this.editorReference}
            theme={this.props.theme}
            value={this.props.editorContent}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onChange={this.handleChange}
            bounds="#editor-comment-container"
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
