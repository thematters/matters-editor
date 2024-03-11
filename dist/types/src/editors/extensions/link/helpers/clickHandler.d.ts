import { type MarkType } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
interface ClickHandlerOptions {
    type: MarkType;
}
export declare function clickHandler(options: ClickHandlerOptions): Plugin;
export {};
