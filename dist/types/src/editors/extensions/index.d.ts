import { type MentionSuggestion } from './mention';
export * from './bold';
export * from './figureAudio';
export * from './figureEmbed';
export * from './figureImage';
export * from './horizontalRule';
export * from './link';
export * from './mention';
/**
 * Article
 */
export interface MakeArticleEditorExtensionsProps {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
}
export declare const makeArticleEditorExtensions: ({ placeholder, mentionSuggestion, }: MakeArticleEditorExtensionsProps) => (import("@tiptap/core").Mark<import("./bold").BoldOptions, any> | import("@tiptap/core").Node<any, any> | import("@tiptap/core").Extension<any, any>)[];
/**
 * Comment
 */
export interface MakeCommentEditorExtensionsProps {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
}
export declare const makeCommentEditorExtensions: ({ placeholder, mentionSuggestion, }: MakeCommentEditorExtensionsProps) => (import("@tiptap/core").Node<any, any> | import("@tiptap/core").Mark<import("./link").LinkOptions, any> | import("@tiptap/core").Extension<import("@tiptap/extension-history").HistoryOptions, any> | import("@tiptap/core").Extension<import("@tiptap/extension-placeholder").PlaceholderOptions, any>)[];
/**
 * Journal
 */
export interface MakeJournalEditorExtensionsProps {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
}
export declare const makeJournalEditorExtensions: ({ placeholder, mentionSuggestion, }: MakeJournalEditorExtensionsProps) => (import("@tiptap/core").Node<any, any> | import("@tiptap/core").Mark<import("./link").LinkOptions, any> | import("@tiptap/core").Extension<import("@tiptap/extension-history").HistoryOptions, any> | import("@tiptap/core").Extension<import("@tiptap/extension-placeholder").PlaceholderOptions, any>)[];
