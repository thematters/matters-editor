import { type EditorOptions } from '@tiptap/react';
import { type MakeMomentEditorExtensionsProps } from './extensions';
type UseMomentEditorProps = {
    content: string;
} & MakeMomentEditorExtensionsProps & Partial<EditorOptions>;
export declare const useMomentEditor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseMomentEditorProps) => import("@tiptap/react").Editor | null;
export {};
