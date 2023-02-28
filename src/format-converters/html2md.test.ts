import { test, expect } from 'vitest'
import { html2md } from './html2md'

test('html2md', () => {
  expect(html2md('abc')).toBe('abc')
})
