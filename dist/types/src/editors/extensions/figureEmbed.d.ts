import { Node } from '@tiptap/core';
/**
 * FigureEmbed extension:
 *
 * @see {https://tiptap.dev/experiments/embeds}
 *
 * ```html
 * <figure class="embed">
 *   <div class="iframe-container">
 *     <iframe
 *       loading="lazy"
 *       src="URL"
 *       frameborder="0"
 *       sandbox="allow-scripts allow-same-origin allow-popups">
 *     </iframe>
 *   </div>
 *
 *   <figcaption>CAPTION</figcaption>
 * </figure>
 * ```
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        figureEmbed: {
            setFigureEmbed: (options: {
                src: string;
                caption?: string;
                position?: number;
            }) => ReturnType;
        };
    }
}
export declare const FigureEmbed: Node<any, any>;
