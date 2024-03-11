import { type EditorOptions } from '@tiptap/react';
import { type MakeCommentEditorExtensionsProps } from './extensions';
type UseCommentEditorProps = {
    content: string;
} & MakeCommentEditorExtensionsProps & Partial<EditorOptions>;
export declare const useCommentEditor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseCommentEditorProps) => import("@tiptap/react").Editor | null;
export {};
