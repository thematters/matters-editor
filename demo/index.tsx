import uuid from 'uuid/v4'
import * as React from 'react'
import { render } from 'react-dom'

import MattersEditor from '../src'

const MentionList = () => <div />

const App = () => {
  const dummyRead = ({ file }: Params) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const editorUpdate = (params: Params) => {
    // TODO: add update api
  }

  const editorUpload = async (params: Params): Promise<ResultData> => {
    // TODO: add calling upload api and get source path
    // below is just an example.
    const source = await dummyRead(params)
    return { id: uuid(), path: source }
  }

  const mentionKeywordChange = (keyword: string) => {
    // TODO: add search mention user api
  }

  return (
    <MattersEditor
      editorContent=""
      editorContentId=""
      editorUpdate={editorUpdate}
      editorUpload={editorUpload}
      eventName="event-name"
      language="ZH_HANT"
      mentionLoading={false}
      mentionKeywordChange={mentionKeywordChange}
      mentionUsers={[]}
      mentionListComponent={MentionList}
      siteDomain=""
      theme="bubble"
      titleDefaultValue=""
      uploadAssetDomain=""
    />
  )
}

render(<App />, document.getElementById('demo'))
