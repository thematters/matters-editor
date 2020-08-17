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
        eventName={eventName}
        language="EN"
        readOnly={false}
        siteDomain=""
        theme="bubble"
        titleDefaultValue=""
        uploadAssetDomain=""
      />
      <br />
      <MattersCommentEditor
        editorContent={commentContent}
        editorUpdate={(params) => setCommentContent(params.content)}
        eventName={eventName}
        language="EN"
        readOnly={false}
        theme="bubble"
      />
    </>
  )
}

render(<App />, document.getElementById('demo'))
