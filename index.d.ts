import * as _tiptap_react from '@tiptap/react';
import { EditorOptions } from '@tiptap/react';
export * from '@tiptap/react';
import { SuggestionOptions } from '@tiptap/suggestion';
import { Extensions } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        bold: {
            /**
             * Set a bold mark
             */
            setBold: () => ReturnType;
            /**
             * Toggle a bold mark
             */
            toggleBold: () => ReturnType;
            /**
             * Unset a bold mark
             */
            unsetBold: () => ReturnType;
        };
    }
}

/**
 * Mention extension
 *
 * @see {https://tiptap.dev/api/nodes/mention}
 *
 * ```html
 * <a
 *  class="mention"
 *  href="LINK"
 *  data-id="ID"
 *  data-display-name="DISPLAYNAME"
 *  data-user-name="USERNAME"
 *  rel="noopener noreferrer nofollow"
 *  >
 *   <span>@USERNAME</span>
 * </a>
 * ```
 */
type MentionSuggestion = Omit<SuggestionOptions, 'editor'>;

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
                duration: string;
            }) => ReturnType;
        };
    }
}

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
            }) => ReturnType;
        };
    }
}

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

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        link: {
            /**
             * Set a link mark
             */
            setLink: (attributes: {
                href: string;
                target?: string | null;
            }) => ReturnType;
            /**
             * Toggle a link mark
             */
            toggleLink: (attributes: {
                href: string;
                target?: string | null;
            }) => ReturnType;
            /**
             * Unset a link mark
             */
            unsetLink: () => ReturnType;
        };
    }
}

type MakeArticleEditorExtensionsProps = {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
};
type MakeCommentEditorExtensionsProps = {
    placeholder?: string;
    mentionSuggestion?: MentionSuggestion;
};

type UseArticleEditorProps = {
    content: string;
} & MakeArticleEditorExtensionsProps & Partial<EditorOptions>;
declare const useArticleEdtor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseArticleEditorProps) => _tiptap_react.Editor | null;

type UseCommentEditorProps = {
    content: string;
} & MakeCommentEditorExtensionsProps & Partial<EditorOptions>;
declare const useCommentEditor: ({ content, placeholder, mentionSuggestion, ...editorProps }: UseCommentEditorProps) => _tiptap_react.Editor | null;

declare const html2md: (html: string) => Promise<string>;

declare const md2html: (md: string) => Promise<string>;

declare const sanitizeHTML: (md: string) => Promise<string>;

declare const makeNormalizer: (extensions: Extensions) => (html: string) => string;
declare const normalizeArticleHTML: (html: string) => string;
declare const normalizeCommentHTML: (html: string) => string;

export { html2md, makeNormalizer, md2html, normalizeArticleHTML, normalizeCommentHTML, sanitizeHTML, useArticleEdtor, useCommentEditor };
