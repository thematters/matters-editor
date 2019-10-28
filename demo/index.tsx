import * as React from 'react'
import { render } from 'react-dom'

import MattersEditor from '../src'

const MentionList = () => {
  return <div />
}

const DemoApp = () => {
  const editorUpdate = (params: Params) => {}

  const editorUpload = async (params: Params): Promise<ResultData> => {
    return {}
  }

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

render(<DemoApp />, document.getElementById('demo'))
