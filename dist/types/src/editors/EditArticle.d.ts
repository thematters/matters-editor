import type { EditorOptions } from '@tiptap/react';
import { MakeArticleEditorExtensionsProps } from './extensions';
type UseEditArticleEditorProps = {
    content: string;
} & MakeArticleEditorExtensionsProps & Partial<EditorOptions>;
export declare const useEditArticleEdtor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseEditArticleEditorProps) => import("@tiptap/react").Editor | null;
export {};
