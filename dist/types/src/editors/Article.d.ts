import type { EditorOptions } from '@tiptap/react';
import { MakeArticleEditorExtensionsProps } from './extensions';
type UseArticleEditorProps = {
    content: string;
} & MakeArticleEditorExtensionsProps & Partial<EditorOptions>;
export declare const useArticleEdtor: ({ content, placeholder, mentionSuggestion, maxCaptionLength, ...editorProps }: UseArticleEditorProps) => import("@tiptap/react").Editor | null;
export {};
