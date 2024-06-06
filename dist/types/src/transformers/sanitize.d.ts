import { type RehypeSqueezeBreaksOptions } from './lib';
export type SanitizeHTMLOptions = RehypeSqueezeBreaksOptions;
export declare const sanitizeHTML: (html: string, { maxHardBreaks, maxSoftBreaks }?: SanitizeHTMLOptions) => string;
