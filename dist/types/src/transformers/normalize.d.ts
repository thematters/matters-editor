import type { Extensions } from '@tiptap/core';
export type NormalizeOptions = {
    truncate?: {
        maxLength: number;
        keepProtocol: boolean;
    };
};
export declare const makeNormalizer: (extensions: Extensions) => (html: string) => string;
export declare const truncateLinkText: (html: string, { maxLength, keepProtocol }: {
    maxLength: number;
    keepProtocol: boolean;
}) => string;
export declare const normalizeArticleHTML: (html: string, options?: NormalizeOptions) => string;
export declare const normalizeCommentHTML: (html: string, options?: NormalizeOptions) => string;
export declare const normalizeJournalHTML: (html: string, options?: NormalizeOptions) => string;
