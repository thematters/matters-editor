import classNames from 'classnames'
import React from 'react'
import { KEYCODES } from '../../enums/common'
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
  const [height, setHeight] = React.useState('auto')
  const [parentHeight, setParentHeight] = React.useState('auto')

  const length = (value && value.length) || 0

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = (event.target.value || '').replace(/\r\n|\r|\n/g, '')
    setHeight('auto')
    setParentHeight(`${instance.current.scrollHeight}px`)
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
      setHeight(`${instance.current.scrollHeight}px`)
      setParentHeight(`${instance.current.scrollHeight}px`)
    }
  }, [value])

  if (!enable) {
    return null
  }

  const classes = classNames({
    'editor-summary': true,
    'u-area-disable': readOnly,
  })
  const counterClasses = classNames({
    counter: true,
    error: length > 200,
  })

  return (
    <section className={classes} style={{ minHeight: parentHeight }}>
      <textarea
        ref={instance}
        rows={1}
        aria-label={texts.SUMMARY_PLACEHOLDER}
        placeholder={texts.SUMMARY_PLACEHOLDER}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        style={{ height }}
      />
      {!readOnly && (
        <section className={counterClasses}>({length}/200)</section>
      )}
    </section>
  )
}

export default MattersEditorSummary
