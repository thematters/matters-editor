import { Node } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { SuggestionOptions } from '@tiptap/suggestion';
/**
 * Mention extension
 *
 * @see {https://tiptap.dev/api/nodes/mention}
 *
 * ```html
 * <a
 *  class="mention"
 *  href="LINK"
 *  data-id="ID"
 *  data-display-name="DISPLAYNAME"
 *  data-user-name="USERNAME"
 *  rel="noopener noreferrer nofollow"
 *  >
 *   <span>@USERNAME</span>
 * </a>
 * ```
 */
export type MentionSuggestion = Omit<SuggestionOptions, 'editor'>;
export type MentionOptions = {
    suggestion: MentionSuggestion;
};
export declare const MentionPluginKey: PluginKey<any>;
export declare const Mention: Node<MentionOptions, any>;
