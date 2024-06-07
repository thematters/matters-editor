import { Node } from '@tiptap/core';
export interface PlainParagraphOptions {
    /**
     * The HTML attributes for a plain paragraph node.
     * @default {}
     * @example { class: 'foo' }
     */
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        plainParagraph: {
            setPlainParagraph: () => ReturnType;
        };
    }
}
/**
 * This extension allows you to create
 * plain paragraphs (only support plain text and hard break)
 * for plainBlockquote extension.
 *
 * Forked from:
 * @see https://www.tiptap.dev/api/nodes/paragraph
 */
export declare const PlainParagraph: Node<PlainParagraphOptions, any>;
