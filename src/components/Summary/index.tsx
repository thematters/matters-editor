import autosize from 'autosize'
import classNames from 'classnames'
import React from 'react'

import { KEYCODES, MAX_ARTICE_SUMMARY_LENGTH } from '../../enums/common'
import { Texts } from '../../enums/text'

/**
 * This is an optional component for user to add summary.
 *
 * Usage:
 *   <MattersEditorSummary
 *      devalutValue="Default summary"
 *      enable={true}
 *      readOnly={false}
 *      texts={{}}
 *      update={() => func({ summary: '' })}
 *   />
 */

interface Props {
  defaultValue?: string
  enable?: boolean
  readOnly: boolean
  texts: Texts
  update: (params: { summary: any }) => void
}

const getValidValue = (value: any, fallback: string): string => {
  return value && value !== fallback ? value : ''
}

const MattersEditorSummary: React.FC<Props> = ({
  defaultValue,
  enable,
  readOnly,
  texts,
  update,
}) => {
  const instance = React.useRef(null)
  const [value, setValue] = React.useState<string>(defaultValue)

  const length = (value && value.length) || 0

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = (event.target.value || '').replace(/\r\n|\r|\n/g, '')
    setValue(text)
  }

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) =>
    update({ summary: value })

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.charCode === KEYCODES.ENTER || event.key === 'Enter') {
      event.preventDefault()
    }
  }

  React.useEffect(() => {
    if (enable && instance) {
      autosize(instance.current)
    }
  }, [])

  if (!enable) {
    return null
  }

  const classes = classNames({
    'editor-summary': true,
    'u-area-disable': readOnly,
  })
  const counterClasses = classNames({
    counter: true,
    error: length > MAX_ARTICE_SUMMARY_LENGTH,
  })

  return (
    <section className={classes}>
      <textarea
        ref={instance}
        rows={1}
        aria-label={texts.SUMMARY_PLACEHOLDER}
        placeholder={texts.SUMMARY_PLACEHOLDER}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      {!readOnly && (
        <section className={counterClasses}>
          ({length}/{MAX_ARTICE_SUMMARY_LENGTH})
        </section>
      )}
    </section>
  )
}

export default MattersEditorSummary
