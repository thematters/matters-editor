export const REGEXP_DISPLAY_NAME = /^[A-Za-z0-9\u4E00-\u9FFF\u3400-\u4DFF\uF900-\uFAFF\u2e80-\u33ffh]*$/

export const isValidChars = (value: string) => REGEXP_DISPLAY_NAME.test(value)
