import { type EditorOptions } from '@tiptap/react';
import { type MakeCampaignEditorExtensionsProps } from './extensions';
type UseCampaignEditorProps = {
    content: string;
} & MakeCampaignEditorExtensionsProps & Partial<EditorOptions>;
export declare const useCampaignEditor: ({ content, placeholder, ...editorProps }: UseCampaignEditorProps) => import("@tiptap/react").Editor | null;
export {};
