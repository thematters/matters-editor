import { v4 } from 'uuid'
import * as React from 'react'
import { render } from 'react-dom'

import { MattersArticleEditor, MattersCommentEditor } from '../src'

const App = () => {
  const eventName = 'demo-event'

  const [commentContent, setCommentContent] = React.useState('')

  const dummyRead = ({ file }: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const editorUpdate = (params: any) => {
    // TODO: add update api
  }

  const editorUpload = async (params: any): Promise<any> => {
    // TODO: add calling upload api and get source path
    // below is just an example.
    const source = await dummyRead(params)
    return { id: v4(), path: source }
  }

  React.useEffect(() => {
    window.addEventListener(eventName, (data: any) => {
      // TODO: Process data and hook your notifier.
    })
  }, [])

  return (
    <>
      <MattersArticleEditor
        editorContent=""
        editorContentId=""
        editorUpdate={editorUpdate}
        editorUpload={editorUpload}
        enableReviseMode={false}
        enableSummary={true}
        enableToolbar={true}
        eventName={eventName}
        language="zh_hant"
        readOnly={false}
        theme="bubble"
        titleDefaultValue=""
        titleReadOnly={false}
      />
      <br />
      <MattersCommentEditor
        editorContent={commentContent}
        editorUpdate={(params) => setCommentContent(params.content)}
        eventName={eventName}
        language="en"
        readOnly={false}
        theme="bubble"
        texts={{
          COMMENT_PLACEHOLDER: 'custom placeholder\nand line break',
        }}
      />
    </>
  )
}

render(<App />, document.getElementById('demo'))
