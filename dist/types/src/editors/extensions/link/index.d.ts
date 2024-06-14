import { Mark } from '@tiptap/core';
/**
 * Link extension compitable with the Mention extension, forked from:
 *
 * @see {@url https://github.com/ueberdosis/tiptap/tree/main/packages/extension-link}
 *
 * Differences:
 * - altered `parseHTML.tag` to resolve the conflict with Mention extension
 *   since the priority doesn't work as expected.
 * - clamp long text
 */
export interface LinkProtocolOptions {
    /**
     * The protocol scheme to be registered.
     * @default '''
     * @example 'ftp'
     * @example 'git'
     */
    scheme: string;
    /**
     * If enabled, it allows optional slashes after the protocol.
     * @default false
     * @example true
     */
    optionalSlashes?: boolean;
}
export declare const pasteRegex: RegExp;
export interface LinkOptions {
    /**
     * If enabled, the extension will automatically add links as you type.
     * @default true
     * @example false
     */
    autolink: boolean;
    /**
     * An array of custom protocols to be registered with linkifyjs.
     * @default []
     * @example ['ftp', 'git']
     */
    protocols: Array<LinkProtocolOptions | string>;
    /**
     * Default protocol to use when no protocol is specified.
     * @default 'http'
     */
    defaultProtocol: string;
    /**
     * If enabled, links will be opened on click.
     * @default true
     * @example false
     * @example 'whenNotEditable'
     */
    openOnClick: boolean;
    /**
     * Adds a link to the current selection if the pasted content only contains an url.
     * @default true
     * @example false
     */
    linkOnPaste: boolean;
    /**
     * HTML attributes to add to the link element.
     * @default {}
     * @example { class: 'foo' }
     */
    HTMLAttributes: Record<string, any>;
    /**
     * A validation function that modifies link verification for the auto linker.
     * @param url - The url to be validated.
     * @returns - True if the url is valid, false otherwise.
     */
    validate: (url: string) => boolean;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        link: {
            /**
             * Set a link mark
             * @param attributes The link attributes
             * @example editor.commands.setLink({ href: 'https://tiptap.dev' })
             */
            setLink: (attributes: {
                href: string;
                target?: string | null;
                rel?: string | null;
                class?: string | null;
            }) => ReturnType;
            /**
             * Toggle a link mark
             * @param attributes The link attributes
             * @example editor.commands.toggleLink({ href: 'https://tiptap.dev' })
             */
            toggleLink: (attributes: {
                href: string;
                target?: string | null;
                rel?: string | null;
                class?: string | null;
            }) => ReturnType;
            /**
             * Unset a link mark
             * @example editor.commands.unsetLink()
             */
            unsetLink: () => ReturnType;
        };
    }
}
/**
 * This extension allows you to create links.
 * @see https://www.tiptap.dev/api/marks/link
 */
export declare const Link: Mark<LinkOptions, any>;
