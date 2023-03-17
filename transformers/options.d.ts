import { RehypeRewriteOptions } from 'rehype-rewrite';
import { Options as RemarkStringifyOptions } from 'remark-stringify';
export declare const remarkStringifyOptions: RemarkStringifyOptions;
export declare const remarkRehypeOptions: {
    allowDangerousHtml: boolean;
};
export declare const rehypeParseOptions: {
    fragment: boolean;
};
export declare const rehypeRemarkOptions: import('hast-util-to-mdast/lib/types').Options;
export declare const rehypeStringifyOptions: {
    closeSelfClosing: boolean;
    closeEmptyElements: boolean;
    tightSelfClosing: boolean;
};
export declare const rehypeRewriteOptions: RehypeRewriteOptions;
export declare const rehypeSanitizeOptions: void | import('hast-util-sanitize/lib').Schema;
