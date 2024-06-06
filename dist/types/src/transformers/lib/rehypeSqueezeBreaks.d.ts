import { type Root } from 'hast';
export interface RehypeSqueezeBreaksOptions {
    maxHardBreaks?: number;
    maxSoftBreaks?: number;
}
/**
 * Squeeze hard and soft breaks to a maximum of N
 *
 * e.g.
 * <p></p><p></p><p></p><p></p><p></p><p></p>
 * =>
 * <p><br></p><p><br></p>
 *
 */
export declare const rehypeSqueezeBreaks: (props: RehypeSqueezeBreaksOptions) => (tree: Root) => void;
