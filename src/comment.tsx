import _debounce from 'lodash/debounce'
import React, { useEffect } from 'react'
import Quill from 'quill'
import ReactQuill from 'react-quill'

import MattersEditorMention from './components/Mention'
import { FORMAT_CONFIG, MODULE_CONFIG } from './configs/comment'
import { DEBOUNCE_DELAY, LANGUAGE } from './enums/common'
import { TEXT, Texts } from './enums/text'
import { getQuillInstance } from './utils/editor'

interface Props {
  editorContent: string
  editorUpdate: (params: Params) => void
  eventName: string
  language: Language
  mentionLoading: boolean
  mentionKeywordChange: (keyword: string) => void
  mentionUsers: any
  mentionListComponent: any
  readOnly: boolean
  theme: string
  texts?: Texts
  scrollingContainer?: string | HTMLElement
}

interface State {
  content: string
  mentionInstance: any
}

const Wrapper: React.FC<React.PropsWithChildren & { onMount: () => any }> = ({
  onMount,
  children,
}) => {
  useEffect(() => {
    onMount()
  }, [])

  return <div id="editor-comment-container">{children}</div>
}

export class MattersCommentEditor extends React.Component<Props, State> {
  private instance: Quill | null = null
  private editorReference = React.createRef<ReactQuill>()
  private mentionReference = React.createRef<HTMLElement>()
  private texts: Texts = null

  constructor(props: Props) {
    super(props)
    this.state = {
      content: this.props.editorContent,
      mentionInstance: null,
    }

    this.texts = {
      ...TEXT[props.language || LANGUAGE.zh_hant],
      ...props.texts,
    }
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

  update = _debounce((content: string) => {
    this.props.editorUpdate({ content })
  }, DEBOUNCE_DELAY)

  handleChange = (content: string, delta: any, source: string) => {
    this.setState({ content }, () => {
      if (source === 'user') {
        this.update(content)
      }
    })
  }

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
      // TODO
    }
  }

  storeMentionInstance = (instance: any) =>
    this.setState({ mentionInstance: instance })

  render() {
    const modulesConfig = {
      ...MODULE_CONFIG,
      mention: {
        mentionContainer: this.mentionReference?.current,
        handleMentionChange: this.handleMentionChange,
        storeMentionInstance: this.storeMentionInstance,
      },
    }

    return (
      <Wrapper
        onMount={() => {
          // FIXME: force update state to re-render <ReactQuill>
          this.setState({ content: this.state.content })
        }}
      >
        {this.mentionReference?.current && (
          <ReactQuill
            formats={FORMAT_CONFIG}
            modules={modulesConfig}
            placeholder={this.texts.COMMENT_PLACEHOLDER}
            readOnly={this.props.readOnly}
            ref={this.editorReference}
            theme={this.props.theme}
            value={this.state.content}
            onChange={this.handleChange}
            bounds="#editor-comment-container"
            scrollingContainer={this.props.scrollingContainer}
          />
        )}

        <MattersEditorMention
          mentionLoading={this.props.mentionLoading}
          mentionListComponent={this.props.mentionListComponent}
          mentionSelection={this.handleMentionSelection}
          mentionUsers={this.props.mentionUsers}
          reference={this.mentionReference}
        />
      </Wrapper>
    )
  }
}
