import { type Root } from 'hast';
/**
 * Squeeze empty paragraphs to a maximum of N
 *
 * e.g.
 * <p></p><p></p><p></p><p></p><p></p><p></p>
 * =>
 * <p><br></p><p><br></p>
 *
 * @param {number} maxCount: maximum number of empty paragraphs, -1 to retain all
 *
 */
export declare const rehypeSqueezeParagraphs: ({ maxCount }: {
    maxCount: number;
}) => (tree: Root) => void;
