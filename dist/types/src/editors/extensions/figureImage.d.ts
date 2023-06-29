import { Node } from '@tiptap/core';
/**
 * FigureImage extension:
 *
 * @see {https://tiptap.dev/experiments/figure}
 *
 * ```html
 * <figure class="image">
 *   <img src="URL" />
 *   <figcaption>CAPTION</figcaption>
 * </figure>
 * ```
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        figureImage: {
            setFigureImage: (options: {
                src: string;
                caption?: string;
                position?: number;
            }) => ReturnType;
        };
    }
}
type FigureImageOptions = {
    maxCaptionLength?: number;
};
export declare const FigureImage: Node<FigureImageOptions, any>;
export {};
