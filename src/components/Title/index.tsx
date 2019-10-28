import * as React from 'react'

/**
 * This is an optional component belonged to the edoitor.
 *
 * Usage:
 *   <MattersEditorTitle
 *     devaultValue="Default title"
 *     update={() => func({ title: '' }}}
 *     texts={{}}
 *   />
 */

interface Props {
  defaultValue?: string
  texts: Texts
  update: (params: { title: any }) => void
}

const getValidTitleValue = (value: any, fallback: any): string => {
  return value && value !== fallback ? value : ''
}

export default ({ defaultValue, texts, update }: Props) => {
  const [value, setValue] = React.useState<string>(defaultValue)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => update({ title: value })

  React.useEffect(() => setValue(defaultValue), [defaultValue])

  return (
    <header className="editor-title">
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
