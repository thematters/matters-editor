import React from 'react';
import { EditorOptions } from '@tiptap/react';
import { MentionSuggestion } from './extensions';
type ArticleEditorProps = {
    content: string;
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
} & Partial<EditorOptions>;
export declare const makeArticleEditorExtensions: ({ placeholder, mentionSuggestion, }: Pick<ArticleEditorProps, 'placeholder' | 'mentionSuggestion'>) => (import("@tiptap/react").Node<any, any> | import("@tiptap/react").Extension<any, any> | import("@tiptap/react").Mark<import("@tiptap/extension-bold").BoldOptions, any>)[];
export declare const ArticleEditor: React.FC<ArticleEditorProps>;
export {};
