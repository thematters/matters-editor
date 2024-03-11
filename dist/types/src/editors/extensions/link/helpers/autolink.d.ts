import { type MarkType } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
interface AutolinkOptions {
    type: MarkType;
    validate?: (url: string) => boolean;
}
export declare function autolink(options: AutolinkOptions): Plugin;
export {};
