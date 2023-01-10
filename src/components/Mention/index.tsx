import React, { useEffect } from 'react'

/**
 * This component is a mention list container which will be visible when typing `@`.
 *
 * Usage:
 *   <MattersEditorMention
 *     mentionLoading={false}
 *     mentionListComponent={() => (<div></div>)}
 *     mentionUsers={[]}
 *     reference={}
 *   />
 */

interface Props {
  mentionLoading: boolean
  mentionListComponent: any
  mentionSelection: any
  mentionUsers: any[]
  reference: React.RefObject<HTMLElement>
}

export default ({
  mentionLoading,
  mentionListComponent,
  mentionSelection,
  mentionUsers,
  reference,
}: Props) => {
  const hasMention = mentionUsers.length <= 0 && !mentionLoading

  return (
    <section className="mention-container" ref={reference}>
      {hasMention
        ? null
        : mentionListComponent({
            mentionLoading,
            mentionSelection,
            mentionUsers,
          })}
    </section>
  )
}
