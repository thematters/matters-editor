import { type EditorOptions } from '@tiptap/react';
import { type MakeJournalEditorExtensionsProps } from './extensions';
type UseJournalEditorProps = {
    content: string;
} & MakeJournalEditorExtensionsProps & Partial<EditorOptions>;
export declare const useJournalEditor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseJournalEditorProps) => import("@tiptap/react").Editor | null;
export {};
