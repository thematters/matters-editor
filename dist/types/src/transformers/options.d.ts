import { type Schema } from 'hast-util-sanitize';
import { type Options } from 'hast-util-to-mdast';
import { type RehypeRewriteOptions } from 'rehype-rewrite';
import { type Options as RemarkStringifyOptions } from 'remark-stringify';
export declare const remarkStringifyOptions: RemarkStringifyOptions;
export declare const remarkRehypeOptions: {
    allowDangerousHtml: boolean;
};
export declare const rehypeParseOptions: {
    fragment: boolean;
};
export declare const rehypeRemarkOptions: Options;
export declare const rehypeStringifyOptions: {
    closeSelfClosing: boolean;
    closeEmptyElements: boolean;
};
export declare const rehypeRewriteOptions: RehypeRewriteOptions;
export declare const rehypeSanitizeOptions: Schema;
