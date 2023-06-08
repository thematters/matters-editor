import { Root } from 'mdast';
import { Options as MicromarkStrikethroughOptions } from 'micromark-extension-gfm-strikethrough';
import { Plugin } from 'unified';
export declare const remarkStrikethrough: Plugin<[(MicromarkStrikethroughOptions | undefined)?], Root>;
