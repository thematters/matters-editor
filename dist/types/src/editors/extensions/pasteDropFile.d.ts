import { Node } from '@tiptap/core';
import { Editor } from '@tiptap/core';
/**
 * A extension to handle paste and drop image events.
 */
type PasteDropFileOptions = {
    onPaste: (editor: Editor, files: File[]) => void;
    onDrop: (editor: Editor, files: File[], pos: number) => void;
    mimeTypes?: string[];
};
export declare const PasteDropFile: Node<PasteDropFileOptions, any>;
export {};
