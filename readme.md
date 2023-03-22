# Matters Editor

## Usage

Install

```bash
npm i @matters/matters-editor
```

### Converters

#### Usage

```ts
import { md2html, html2md } from '@matters/matters-editor'

const html = md2html('**hello, world**')
const markdown = html2md(html)
```

#### Formats

- Headings (`<h1>` to `<h6>`) <-> `#` to `######`;
- Bold (`<bold>`) <-> `**`;
- Italic (`<em>`) <-> `_`;
- Strikethrough (`<s>`) <-> `~~`;
- Underline (`<u>`) -> `**`;
- Code (`<code>`) <-> `` `code` ``;
- Code Block (`<pre>`) <-> ` ``` `;
- Blockquote (`<blockquote>`) <-> `>`;
- Line Breaks (`<br>`) <-> `\`;
- Horizontal Line (`<hr>`) <-> `---`;
- Ordered List (`<li>`) <-> `1. ABC \n 2. ABC \n 3. ABC`;
- Unordered List (`<ul>`) <-> `* ABC \n * ABC \n * ABC`;
- Link (`<a>`) <-> `[example.com](https://example.com)`;
- Image (`<img>`) <-> `![alt text](https://example.com/a.jpg "title")`;
- Figure (`<figure>`) <-> Raw `<figure>`;

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
