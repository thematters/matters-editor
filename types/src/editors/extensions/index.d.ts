import { MentionSuggestion } from './mention';
export * from './figureAudio';
export * from './figureEmbed';
export * from './figureImage';
export * from './link';
export * from './mention';
export * from './bold';
export type MakeArticleEditorExtensionsProps = {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
};
export declare const makeArticleEditorExtensions: ({ placeholder, mentionSuggestion, }: MakeArticleEditorExtensionsProps) => (import("@tiptap/core").Node<any, any> | import("@tiptap/core").Mark<import("./bold").BoldOptions, any> | import("@tiptap/core").Extension<any, any>)[];
export type MakeCommentEditorExtensionsProps = {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
};
export declare const makeCommentEditorExtensions: ({ placeholder, mentionSuggestion, }: MakeCommentEditorExtensionsProps) => (import("@tiptap/core").Node<any, any> | import("@tiptap/core").Mark<import("./bold").BoldOptions, any> | import("@tiptap/core").Extension<import("@tiptap/extension-history").HistoryOptions, any>)[];
