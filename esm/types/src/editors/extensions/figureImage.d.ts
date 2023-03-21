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
            }) => ReturnType;
        };
    }
}
export declare const FigureImage: Node<any, any>;
