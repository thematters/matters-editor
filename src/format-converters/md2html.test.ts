import { test, expect } from 'vitest'
import { md2html } from './md2html'

test('md2html', () => {
  expect(md2html('abc')).toBe('abc')
})
