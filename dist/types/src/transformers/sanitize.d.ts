export interface SanitizeHTMLOptions {
    maxEmptyParagraphs?: number;
}
export declare const sanitizeHTML: (html: string, { maxEmptyParagraphs }?: SanitizeHTMLOptions) => string;
