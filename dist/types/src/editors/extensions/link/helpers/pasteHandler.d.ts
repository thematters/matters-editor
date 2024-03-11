import { type Editor } from '@tiptap/core';
import { type MarkType } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
interface PasteHandlerOptions {
    editor: Editor;
    type: MarkType;
}
export declare function pasteHandler(options: PasteHandlerOptions): Plugin;
export {};
