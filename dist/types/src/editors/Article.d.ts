import type { EditorOptions } from '@tiptap/react';
import { type MakeArticleEditorExtensionsProps } from './extensions';
type UseArticleEditorProps = {
    content: string;
} & MakeArticleEditorExtensionsProps & Partial<EditorOptions>;
export declare const useArticleEdtor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseArticleEditorProps) => import("@tiptap/react").Editor | null;
export {};
