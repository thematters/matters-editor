import uuid from 'uuid/v4'
import * as React from 'react'
import { render } from 'react-dom'

import MattersEditor from '../src'

const demoMentionUsers = [
  { id: uuid(), displayName: 'user1', userName: 'user1' },
  { id: uuid(), displayName: 'user2', userName: 'user2' }
]

const DemoMentionList = ({ mentionLoading, mentionSelection, mentionUsers }) => {
  const style = { width: '100%', padding: '0.8rem 1rem', textAlign: 'left' as const }

  const handleMentionClick = (user: any) => mentionSelection(user)

  return (
    <>
      {mentionUsers.map(user => {
        return (
          <button
            key={user.id}
            type="button"
            onClick={() => handleMentionClick(user)}
            style={style}
          >
            {user.userName}
          </button>
        )
      })}
    </>
  )
}

const App = () => {
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
    return { id: uuid(), path: source }
  }

  const mentionKeywordChange = (keyword: string) => {
    // TODO: add search mention user api
    // here we use defined demoMentionUsers for demo.
  }

  return (
    <MattersEditor
      editorContent=""
      editorContentId=""
      editorUpdate={editorUpdate}
      editorUpload={editorUpload}
      eventName="event-name"
      language="EN"
      mentionLoading={false}
      mentionKeywordChange={mentionKeywordChange}
      mentionUsers={demoMentionUsers}
      mentionListComponent={DemoMentionList}
      readOnly={false}
      siteDomain=""
      theme="bubble"
      titleDefaultValue=""
      uploadAssetDomain=""
    />
  )
}

render(<App />, document.getElementById('demo'))
