import { EditorOptions } from '@tiptap/react';
import { MentionSuggestion } from './extensions';
type UseCommentEditorProps = {
    content: string;
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
} & Partial<EditorOptions>;
export declare const makeCommentEditorExtensions: ({ placeholder, mentionSuggestion, }: Pick<UseCommentEditorProps, 'placeholder' | 'mentionSuggestion'>) => (import("@tiptap/react").Node<any, any> | import("@tiptap/react").Extension<import("@tiptap/extension-history").HistoryOptions, any> | import("@tiptap/react").Extension<import("@tiptap/extension-placeholder").PlaceholderOptions, any> | import("@tiptap/react").Mark<import("@tiptap/extension-bold").BoldOptions, any>)[];
export declare const useCommentEditor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseCommentEditorProps) => import("@tiptap/react").Editor | null;
export {};
