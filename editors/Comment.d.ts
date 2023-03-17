import React from 'react';
import { EditorOptions } from '@tiptap/react';
import { MentionSuggestion } from './extensions';
type CommentEditorProps = {
    content: string;
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
} & Partial<EditorOptions>;
export declare const makeCommentEditorExtensions: ({ placeholder, mentionSuggestion, }: Pick<CommentEditorProps, 'placeholder' | 'mentionSuggestion'>) => (import("@tiptap/react").Node<any, any> | import("@tiptap/react").Extension<import("@tiptap/extension-history").HistoryOptions, any> | import("@tiptap/react").Extension<import("@tiptap/extension-placeholder").PlaceholderOptions, any> | import("@tiptap/react").Mark<import("@tiptap/extension-bold").BoldOptions, any>)[];
export declare const CommentEditor: React.FC<CommentEditorProps>;
export {};
