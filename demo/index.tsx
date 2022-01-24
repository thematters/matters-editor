import React from 'react';
import { render } from 'react-dom';

import { useHelpers } from '@remirror/react';

import { MarkdownEditor } from '../src';

const basicContent = `
**Markdown** content is the _best_
<br>

# Heading 1
<br>

## Heading 2
<br>

### Heading 3
<br>

#### Heading 4
<br>

##### Heading 5
<br>

###### Heading 6
<br>

> Blockquote

\`\`\`ts
const a = 'asdf';
\`\`\`

playtime is just beginning

## List support

- an unordered
  - list is a thing
    - of beauty
1. As is
2. An ordered
3. List
`;

function MarkdownPreview() {
  const { getMarkdown } = useHelpers(true);

  return (
    <pre>
      <code>{getMarkdown()}</code>
    </pre>
  );
}

const App = () => {
  return (
    <MarkdownEditor
      placeholder="Start typing..."
      initialContent={basicContent}
      editorUpdate={(params: Params) => console.log('editorUpdate:', params)}
    >
      <MarkdownPreview />
    </MarkdownEditor>
  );
};

render(<App />, document.getElementById('demo'));
