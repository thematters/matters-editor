# Matters Editor

## Installation

```bash
npm i @matters/matters-editor
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

## Editor

The editor core, built with [TipTap](https://tiptap.dev) & [ProseMirror](https://prosemirror.net/), using by [thematters/matters-web](https://github.com/thematters/matters-web).

```tsx
import {
  EditorContent,
  useArticleEdtor,
  useCommentEditor,
} from '@matters/matters-editor'

const Editor = () => {
  const editor = useArticleEdtor({
    editable: true,
    placeholder: 'Write your article here...',
    content: '', // initial content
    onUpdate: async ({ editor, transaction }) => {
      const content = editor.getHTML()
      // update({ content })
    },
    // mentionSuggestion, // if you want to enable mention extension
    // extensions: [...], // provides your custom extensions
  })

  return <EditorContent editor={editor} />
}
```

## Transformers

Transformers (using by [thematters/matters-server](https://github.com/thematters/matters-server)) export below functions:

- `md2html`: Convert Markdown to HTML
- `html2md`: Convert HTML to Markdown
- `sanitizeHTML`: Sanitize HTML
- `normalizeArticleHTML`: Normalize article HTML
- `normalizeCommentHTML`: Normalize comment HTML

```ts
import {
  md2html,
  html2md,
  sanitizeHTML,
  normalizeArticleHTML,
  normalizeCommentHTML,
} from '@matters/matters-editor'

const html = md2html('**hello, world**')
const markdown = html2md(html)

const sanitizedHTML = sanitizeHTML('<script>alert("hello, world")</script>')
const articleHTML = normalizeArticleHTML('<p>hello, world</p>')
const comemntHTML = normalizeCommentHTML('<p>hello, world</p>')
```

### Formats

Below formats are supported to convert between Markdown and HTML:

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

### Examples

Try HTML <=> Markdowns converters in CLI:

1. Put original HTML file into `./examples/original`
2. Run `npm run build:examples`
3. Markdown and HTML (from Markdown) are outputted to `./examples/markdown` and `.examples/html`

Build demo:

```bash
npm run demo:transformers
```

Or try live demo: https://thematters.github.io/matters-editor/transfomers

### Benchmark

```bash
npm run benchmark
```

Results are outputted to `./benchmark/results`
