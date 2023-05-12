import { Mark } from '@tiptap/core';
/**
 * Bold extension forked from:
 *
 * @see {https://github.com/ueberdosis/tiptap/tree/develop/packages/extension-bold}
 * @see {https://github.com/ueberdosis/tiptap/tree/develop/packages/extension-italic}
 * @see {https://github.com/ueberdosis/tiptap/tree/develop/packages/extension-underline}
 *
 * This exenstion can normalize italic and underline to bold.
 */
export interface BoldOptions {
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        bold: {
            /**
             * Set a bold mark
             */
            setBold: () => ReturnType;
            /**
             * Toggle a bold mark
             */
            toggleBold: () => ReturnType;
            /**
             * Unset a bold mark
             */
            unsetBold: () => ReturnType;
        };
    }
}
export declare const italicStarInputRegex: RegExp;
export declare const italicStarPasteRegex: RegExp;
export declare const italicUnderscoreInputRegex: RegExp;
export declare const italicUnderscorePasteRegex: RegExp;
export declare const boldStarInputRegex: RegExp;
export declare const boldStarPasteRegex: RegExp;
export declare const boldUnderscoreInputRegex: RegExp;
export declare const boldUnderscorePasteRegex: RegExp;
export declare const Bold: Mark<BoldOptions, any>;
