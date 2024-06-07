import { Node } from '@tiptap/core';
export interface BlockquoteOptions {
    /**
     * HTML attributes to add to the blockquote element
     * @default {}
     * @example { class: 'foo' }
     */
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        plainBlockQuote: {
            setPlainBlockquote: () => ReturnType;
        };
    }
}
/**
 * Matches a blockquote to a `>` as input.
 */
export declare const inputRegex: RegExp;
/**
 * This extension allows you to create plain blockquotes,
 * contains only plainParagraph.
 *
 * Forked from:
 * @see https://tiptap.dev/api/nodes/blockquote
 */
export declare const PlainBlockquote: Node<BlockquoteOptions, any>;
