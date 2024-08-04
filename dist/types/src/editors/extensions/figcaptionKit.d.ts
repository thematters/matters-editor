import { type Editor } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
/**
 * FigcaptionKit extension works with FigureAudio,
 * FigureEmbed and FigureImage extensions to:
 * - limit figcaption length
 * - handle enter key event to insert a new paragraph
 * - handle backspace key event to remove the figcaption if it's empty
 * - handle click event to select the figcaption
 *
 * @see {https://github.com/ueberdosis/tiptap/issues/629}
 */
type FigcaptionKitOptions = {
    maxCaptionLength?: number;
};
export declare const makeFigcaptionEventHandlerPlugin: ({ editor, }: {
    editor: Editor;
}) => Plugin<any>;
export declare const FigcaptionKit: Node<FigcaptionKitOptions, any>;
export {};
