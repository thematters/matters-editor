# Matters Editor

## Usage

Install

```bash
npm i @matters/matters-editor
```

### Converters

```ts
import { md2html, html2md } from '@matters/matters-editor'

const html = md2html('**hello, world**')
const markdown = html2md(html)
```

## Development

```bash
# dev
npm run dev

# build
npm run build

# test
npm run test
```

## TODO

### Converters

- [ ] strikethrough `<s>`
- [ ] underline `<u>`
