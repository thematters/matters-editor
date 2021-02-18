import classNames from 'classnames'
import React from 'react'
import { Texts } from '../../enums/text'

/**
 * This is an optional component belonged to the edoitor.
 *
 * Usage:
 *   <MattersEditorTitle
 *     devaultValue="Default title"
 *     readOnly={false}
 *     texts={{}}
 *     update={() => func({ title: '' })}
 *   />
 */

interface Props {
  defaultValue?: string
  readOnly: boolean
  texts: Texts
  update: (params: { title: any }) => void
}

const getValidTitleValue = (value: any, fallback: any): string => {
  return value && value !== fallback ? value : ''
}

const MattersEditorTitle: React.FC<Props> = ({
  defaultValue,
  readOnly,
  texts,
  update,
}) => {
  const classes = classNames('editor-title', readOnly ? 'u-area-disable' : '')

  const [value, setValue] = React.useState<string>(defaultValue)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) =>
    update({ title: value })

  React.useEffect(() => setValue(defaultValue), [defaultValue])

  return (
    <header className={classes}>
      <input
        type="text"
        aria-label={texts.TITLE_PLACEHOLDER}
        placeholder={texts.TITLE_PLACEHOLDER}
        onChange={handleChange}
        onBlur={handleBlur}
        value={getValidTitleValue(value, texts.TITLE_FALLBACK)}
      />
    </header>
  )
}

export default MattersEditorTitle
