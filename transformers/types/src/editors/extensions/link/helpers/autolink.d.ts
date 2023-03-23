import { MarkType } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
type AutolinkOptions = {
    type: MarkType;
    validate?: (url: string) => boolean;
};
export declare function autolink(options: AutolinkOptions): Plugin;
export {};