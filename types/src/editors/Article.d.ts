import type { EditorOptions } from '@tiptap/react';
import { MentionSuggestion } from './extensions';
type UseArticleEditorProps = {
    content: string;
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
} & Partial<EditorOptions>;
export declare const makeArticleEditorExtensions: ({ placeholder, mentionSuggestion, }: Pick<UseArticleEditorProps, 'placeholder' | 'mentionSuggestion'>) => (import("@tiptap/react").Node<any, any> | import("@tiptap/react").Mark<import("./extensions").BoldOptions, any> | import("@tiptap/react").Extension<any, any>)[];
export declare const useArticleEdtor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseArticleEditorProps) => import("@tiptap/react").Editor | null;
export {};
