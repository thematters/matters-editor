import _debounce from 'lodash/debounce';

import React, { useMemo } from 'react';

// import '@remirror/styles/all.css';

// import { CoreStyledComponent, coreStyledCss } from '@remirror/styles/emotion';

import { FC, useCallback } from 'react';
import jsx from 'refractor/lang/jsx';
import typescript from 'refractor/lang/typescript';
import { ExtensionPriority } from 'remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  EmojiExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  StrikeExtension,
  // TableExtension,
  TrailingNodeExtension,
} from 'remirror/extensions';
import {
  ComponentItem,
  EditorComponent,
  EmojiPopupComponent,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

import data from 'svgmoji/emoji.json';

import { FloatingLinkToolbar } from './link-toolbar';

export default { title: 'Editors / Markdown' };

export interface MarkdownEditorProps {
  placeholder?: string;
  initialContent?: string;

  editorContent: string;
  editorContentId: string;
  editorUpdate: (params: Params) => void;
  editorUpload: (params: Params) => Promise<ResultData>;
  enableReviseMode?: boolean;
  enableSummary?: boolean;
  enableToolbar?: boolean;
  eventName: string;
  language: Language;
  // mentionLoading: boolean
  // mentionKeywordChange: (keyword: string) => void
  // mentionUsers: any
  // mentionListComponent: any
  readOnly: boolean;
  summaryDefaultValue?: string;
  summaryReadOnly?: boolean;
  theme: string;
  texts?: Texts;
  titleDefaultValue?: string;
  titleReadOnly?: boolean;
  uploadAudioSizeLimit?: number;
  uploadImageSizeLimit?: number;
  scrollingContainer?: string | HTMLElement;
}

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
export const MarkdownEditor: FC<MarkdownEditorProps> = ({
  placeholder,
  initialContent,
  editorUpdate,
  children,
}) => {
  const linkExtension = useMemo(() => {
    const extension = new LinkExtension({ autoLink: true });
    extension.addHandler('onClick', (_, data) => {
      console.log(`You clicked link: ${JSON.stringify(data)}`);
      return true;
    });
    return extension;
  }, []);

  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new EmojiExtension({
        data,
        plainText: true,
        // moji: 'noto'
      }),
      // new LinkExtension({ autoLink: true }),
      new BoldExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      // new LinkExtension(),
      linkExtension,
      new BlockquoteExtension(),
      new BulletListExtension({ enableSpine: true }),
      new OrderedListExtension(),
      new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: true }),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),
      // new TableExtension(),
      new MarkdownExtension({ copyAsMarkdown: false }),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
    ],
    [placeholder]
  );

  const { manager, state, setState } = useRemirror({
    extensions,
    stringHandler: 'markdown',
    content: initialContent,
  });

  const changeHandler = (parameter) => {
    // Update the state to the latest value.
    if (parameter.tr?.docChanged) {
      console.log('before onChange:', parameter);
      editorUpdate?.(parameter);
    }
    setState(parameter.state);
  };

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} autoFocus state={state} onChange={changeHandler}>
          <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
          <EditorComponent />
          <FloatingLinkToolbar />
          <EmojiPopupComponent />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

const toolbarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Heading Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleHeading',
        display: 'icon',
        attrs: { level: 2 },
      },
      {
        type: ComponentItem.ToolbarMenu,

        items: [
          {
            type: ComponentItem.MenuGroup,
            role: 'radio',
            items: [
              {
                // type: ComponentItem.ToolbarCommandButton,
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                // display: 'icon',
                attrs: { level: 1 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 3 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 4 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 5 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: 'toggleHeading',
                attrs: { level: 6 },
              },
            ],
          },
        ],
      },
    ],
    separator: 'end',
  },
  { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
  { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
  { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },

  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleBulletList',
        display: 'icon',
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleOrderedList',
        display: 'icon',
      },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Simple Formatting',
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleBlockquote',
        display: 'icon',
      },
      // { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCodeBlock', display: 'icon' },
    ],
    separator: 'end',
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: 'History',
    items: [
      { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
      { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: 'toggleColumns',
        display: 'icon',
        attrs: { count: 2 },
      },
    ],
    separator: 'none',
  },
];
