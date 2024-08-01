import { type Root } from 'mdast';
import { type Options as MicromarkStrikethroughOptions } from 'micromark-extension-gfm-strikethrough';
import { type Plugin } from 'unified';
export declare const remarkStrikethrough: Plugin<[MicromarkStrikethroughOptions?], Root>;
