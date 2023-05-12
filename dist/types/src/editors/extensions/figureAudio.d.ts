import { Node } from '@tiptap/core';
/**
 * FigureAudio extension:
 *
 * @see {https://tiptap.dev/experiments/figure}
 *
 * ```html
 * <figure class="audio">
 *   <source src="URL" type="audio/mp3" />
 *
 *   <div class="player">
 *     <header>
 *       <div class="meta">
 *         <h4 class="title">TITLE</h4>
 *         <div class="time">
 *           <span class="current" data-time="00:00"></span>
 *           <span class="duration" data-time="39:05"></span>
 *         </div>
 *       </div>
 *       <span class="play"></span>
 *     </header>
 *     <footer>
 *       <div class="progress-bar"><span></span></div>
 *     </footer>
 *   </div>
 *
 *   <figcaption>CAPTION</figcaption>
 * </figure>
 * ```
 */
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        figureAudio: {
            setFigureAudio: (options: {
                src: string;
                caption?: string;
                title: string;
                position?: number;
            }) => ReturnType;
        };
    }
}
export declare const FigureAudio: Node<any, any>;
