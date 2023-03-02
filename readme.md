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

## Examples

1. Put original HTML file into `./examples/original`
2. Run `npm run build:examples`
3. Markdown and HTML (from Markdown) are outputted to `./examples/markdown` and `.examples/html`

## Benchmark

```bash
npm run benchmark
```

Results are outputted to `./benchmark/results`

## TODO

### Converters

- [ ] strikethrough `<s>`
- [ ] underline `<u>`
