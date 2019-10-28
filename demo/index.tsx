import * as React from 'react'
import { render } from 'react-dom'

import MattersEditor from '../src'

const MentionList = () => (<div />)

const App = () => {
  const editorUpdate = (params: Params) => {}

  const editorUpload = async (params: Params): Promise<ResultData> => ({})

  const mentionKeywordChange = (keyword: string) => {}

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
