import { useEditor } from '@tiptap/react';
export * from '@tiptap/react';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Document from '@tiptap/extension-document';
import Gapcursor from '@tiptap/extension-gapcursor';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Strike from '@tiptap/extension-strike';
import Text$1 from '@tiptap/extension-text';
import { Node, combineTransactionSteps, getChangedRanges, getMarksBetween, findChildrenInRange, getAttributes, Mark, mergeAttributes, markPasteRule, markInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var FigureAudio = Node.create({
    name: 'figureAudio',
    group: 'block',
    content: 'text*',
    draggable: true,
    isolating: true,
    addAttributes: function () {
        return {
            src: {
                default: null,
                parseHTML: function (element) { var _a; return (_a = element.querySelector('source')) === null || _a === void 0 ? void 0 : _a.getAttribute('src'); },
            },
            title: {
                default: '',
                parseHTML: function (element) { var _a; return (_a = element.querySelector('.title')) === null || _a === void 0 ? void 0 : _a.textContent; },
            },
        };
    },
    parseHTML: function () {
        return [
            {
                tag: 'figure[class="audio"]',
                contentElement: 'figcaption',
            },
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return [
            'figure',
            { class: 'audio' },
            [
                'audio',
                { controls: true },
                [
                    'source',
                    {
                        src: HTMLAttributes.src,
                        type: 'audio/mp3',
                        draggable: false,
                        contenteditable: false,
                    },
                ],
            ],
            [
                'div',
                { class: 'player' },
                [
                    'header',
                    [
                        'div',
                        { class: 'meta' },
                        ['h4', { class: 'title' }, HTMLAttributes.title],
                        [
                            'div',
                            { class: 'time' },
                            ['span', { class: 'current', 'data-time': '00:00' }],
                            ['span', { class: 'duration', 'data-time': '--:--' }],
                        ],
                    ],
                    ['span', { class: 'play' }],
                ],
                ['footer', ['div', { class: 'progress-bar' }, ['span', {}]]],
            ],
            ['figcaption', 0],
        ];
    },
    addCommands: function () {
        var _this = this;
        return {
            setFigureAudio: function (_a) {
                var caption = _a.caption, attrs = __rest(_a, ["caption"]);
                return function (_a) {
                    var chain = _a.chain;
                    return (chain()
                        .insertContent({
                        type: _this.name,
                        attrs: attrs,
                        content: caption ? [{ type: 'text', text: caption }] : [],
                    })
                        // set cursor at end of caption field
                        .command(function (_a) {
                        var tr = _a.tr, commands = _a.commands;
                        var doc = tr.doc, selection = tr.selection;
                        var position = doc.resolve(selection.to - 2).end();
                        return commands.setTextSelection(position);
                    })
                        .run());
                };
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            new Plugin({
                key: new PluginKey('removePastedFigureAudio'),
                props: {
                    transformPastedHTML: function (html) {
                        // remove
                        html = html.replace(/<figure.*class=.audio.*[\n]*.*?<\/figure>/g, '');
                        return html;
                    },
                },
            }),
        ];
    },
});

var normalizeEmbedURL = function (url) {
    var fallbackReturn = {
        url: '',
        allowfullscreen: false,
        sandbox: [],
    };
    var inputUrl;
    try {
        inputUrl = new URL(url);
    }
    catch (e) {
        return fallbackReturn;
    }
    var hostname = inputUrl.hostname, pathname = inputUrl.pathname, searchParams = inputUrl.searchParams;
    // if (!hostname) {
    //   throw
    // }
    /**
     * YouTube
     *
     * URL:
     *   - https://www.youtube.com/watch?v=ARJ8cAGm6JE
     *   - https://www.youtube.com/embed/ARJ8cAGm6JE
     *   - https://youtu.be/ARJ8cAGm6JE
     *
     * Params:
     *   - t=123 for start time
     *   - v=ARJ8cAGm6JE for video id
     */
    var isYouTube = [
        'youtube.com',
        'youtu.be',
        'www.youtu.be',
        'www.youtube.com',
    ].includes(hostname);
    if (isYouTube) {
        var v = searchParams.get('v');
        var t = searchParams.get('t');
        var qs = new URLSearchParams(__assign({ rel: '0' }, (t ? { start: t } : {}))).toString();
        var id = '';
        if (v) {
            id = v;
        }
        else if (pathname.match('/embed/')) {
            id = pathname.split('/embed/')[1];
        }
        else if (hostname.includes('youtu.be')) {
            id = pathname.split('/')[1];
        }
        return {
            url: "https://www.youtube.com/embed/".concat(id) + (qs ? "?=".concat(qs) : ''),
            provider: 'youtube',
            allowfullscreen: true,
            sandbox: [],
        };
    }
    /**
     * Vimeo
     *
     * URL:
     *   - https://vimeo.com/332732612
     *   - https://player.vimeo.com/video/332732612
     */
    var isVimeo = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(hostname);
    if (isVimeo) {
        var id = pathname.replace(/\/$/, '').split('/').slice(-1)[0];
        return {
            url: "https://player.vimeo.com/video/".concat(id),
            provider: 'vimeo',
            allowfullscreen: true,
            sandbox: [],
        };
    }
    /**
     * bilibili
     *
     * URL:
     *   - https://www.bilibili.com/video/BV1bW411n7fY/
     *   - https://www.bilibili.com/BV1bW411n7fY/
     *   - https://player.bilibili.com/player.html?bvid=BV1bW411n7fY
     *
     * Params:
     *   - bvid=BV1bW411n7fY for video id
     */
    var isBilibili = [
        'bilibili.com',
        'player.bilibili.com',
        'www.bilibili.com',
    ].includes(hostname);
    if (isBilibili) {
        var bvid = searchParams.get('bvid');
        var id = '';
        if (bvid) {
            id = bvid;
        }
        else {
            id = pathname.replace(/\/$/, '').split('/').slice(-1)[0];
        }
        return {
            url: "https://player.bilibili.com/player.html?bvid=".concat(id),
            provider: 'bilibili',
            allowfullscreen: true,
            sandbox: [],
        };
    }
    // Twitter
    /**
     * Instagram
     *
     * URL:
     *   - https://www.instagram.com/p/CkszmehL4hF/
     */
    var isInstagram = ['instagram.com', 'www.instagram.com'].includes(hostname);
    if (isInstagram) {
        var id = pathname
            .replace('/embed', '')
            .replace(/\/$/, '')
            .split('/')
            .slice(-1)[0];
        return {
            url: "https://www.instagram.com/p/".concat(id, "/embed"),
            provider: 'instagram',
            allowfullscreen: false,
            sandbox: [],
        };
    }
    /**
     * JSFiddle
     *
     * URL:
     *   - https://jsfiddle.net/zfUyN/
     *   - https://jsfiddle.net/kizu/zfUyN/
     *   - https://jsfiddle.net/kizu/zfUyN/embedded/
     *   - https://jsfiddle.net/kizu/zfUyN/embedded/result/
     *   - https://jsfiddle.net/kizu/zfUyN/embed/js,result/
     */
    var isJSFiddle = ['jsfiddle.net', 'www.jsfiddle.net'].includes(hostname);
    if (isJSFiddle) {
        var parts = pathname
            .replace('/embedded', '')
            .replace(/\/$/, '')
            .split('/')
            .filter(Boolean);
        var id = parts.length === 1 ? parts[0] : parts[1];
        return {
            url: "https://jsfiddle.net/".concat(id, "/embedded/"),
            provider: 'jsfiddle',
            allowfullscreen: false,
            sandbox: [],
        };
    }
    /**
     * CodePen
     *
     * URL:
     *   - https://codepen.io/ykadosh/pen/jOwjmJe
     *   - https://codepen.io/ykadosh/embed/jOwjmJe
     *   - https://codepen.io/ykadosh/embed/preview/jOwjmJe
     */
    var isCodePen = ['codepen.io', 'www.codepen.io'].includes(hostname);
    if (isCodePen) {
        var author = pathname.split('/')[1];
        var id = pathname.replace(/\/$/, '').split('/').slice(-1)[0];
        return {
            url: "https://codepen.io/".concat(author, "/embed/preview/").concat(id),
            provider: 'codepen',
            allowfullscreen: false,
            sandbox: [],
        };
    }
    return fallbackReturn;
};
var FigureEmbed = Node.create({
    name: 'figureEmbed',
    group: 'block',
    content: 'text*',
    draggable: true,
    isolating: true,
    addAttributes: function () {
        return {
            class: {
                default: null,
                parseHTML: function (element) { return element.getAttribute('class'); },
            },
            src: {
                default: null,
                parseHTML: function (element) { var _a; return (_a = element.querySelector('iframe')) === null || _a === void 0 ? void 0 : _a.getAttribute('src'); },
            },
        };
    },
    parseHTML: function () {
        return [
            {
                // match "embed", "embed-video", "embed-code" for backward compatibility
                tag: 'figure[class^="embed"]',
                contentElement: 'figcaption',
            },
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        var _b = normalizeEmbedURL(HTMLAttributes.src), url = _b.url, provider = _b.provider, allowfullscreen = _b.allowfullscreen, sandbox = _b.sandbox;
        return [
            'figure',
            __assign({ class: 'embed' }, (provider ? { 'data-provider': provider } : {})),
            [
                'div',
                { class: 'iframe-container' },
                [
                    'iframe',
                    __assign(__assign(__assign({ src: url, loading: 'lazy' }, (sandbox && sandbox.length > 0
                        ? { sandbox: sandbox.join(' ') }
                        : {})), (allowfullscreen ? { allowfullscreen: true } : {})), { frameborder: '0', draggable: false, contenteditable: false }),
                ],
            ],
            ['figcaption', 0],
        ];
    },
    addCommands: function () {
        var _this = this;
        return {
            setFigureEmbed: function (_a) {
                var caption = _a.caption, attrs = __rest(_a, ["caption"]);
                return function (_a) {
                    var chain = _a.chain;
                    return (chain()
                        .insertContent({
                        type: _this.name,
                        attrs: attrs,
                        content: caption ? [{ type: 'text', text: caption }] : [],
                    })
                        // set cursor at end of caption field
                        .command(function (_a) {
                        var tr = _a.tr, commands = _a.commands;
                        var doc = tr.doc, selection = tr.selection;
                        var position = doc.resolve(selection.to - 2).end();
                        return commands.setTextSelection(position);
                    })
                        .run());
                };
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            new Plugin({
                key: new PluginKey('removePastedFigureEmbed'),
                props: {
                    transformPastedHTML: function (html) {
                        // remove
                        html = html.replace(/<figure.*class=.embed.*[\n]*.*?<\/figure>/g, '');
                        return html;
                    },
                },
            }),
        ];
    },
});

var FigureImage = Node.create({
    name: 'figureImage',
    group: 'block',
    content: 'text*',
    draggable: true,
    isolating: true,
    addAttributes: function () {
        return {
            class: {
                default: null,
                parseHTML: function (element) { return element.getAttribute('class'); },
            },
            src: {
                default: null,
                parseHTML: function (element) { var _a; return (_a = element.querySelector('img')) === null || _a === void 0 ? void 0 : _a.getAttribute('src'); },
            },
        };
    },
    parseHTML: function () {
        return [
            {
                tag: 'figure[class="image"]',
                contentElement: 'figcaption',
            },
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return [
            'figure',
            { class: 'image' },
            [
                'img',
                {
                    src: HTMLAttributes.src,
                    draggable: false,
                    contenteditable: false,
                },
            ],
            ['figcaption', 0],
        ];
    },
    addCommands: function () {
        var _this = this;
        return {
            setFigureImage: function (_a) {
                var caption = _a.caption, attrs = __rest(_a, ["caption"]);
                return function (_a) {
                    var chain = _a.chain;
                    return (chain()
                        .insertContent({
                        type: _this.name,
                        attrs: attrs,
                        content: caption ? [{ type: 'text', text: caption }] : [],
                    })
                        // set cursor at end of caption field
                        .command(function (_a) {
                        var tr = _a.tr, commands = _a.commands;
                        var doc = tr.doc, selection = tr.selection;
                        var position = doc.resolve(selection.to - 2).end();
                        return commands.setTextSelection(position);
                    })
                        .run());
                };
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            new Plugin({
                key: new PluginKey('removePastedFigureImage'),
                props: {
                    transformPastedHTML: function (html) {
                        // remove
                        html = html.replace(/<figure.*class=.image.*[\n]*.*?<\/figure>/g, '');
                        return html;
                    },
                },
            }),
        ];
    },
});

// THIS FILE IS AUTOMATICALLY GENERATED DO NOT EDIT DIRECTLY
// See update-tlds.js for encoding/decoding format
// https://data.iana.org/TLD/tlds-alpha-by-domain.txt
const encodedTlds = 'aaa1rp3barth4b_ott3vie4c1le2ogado5udhabi7c_ademy5centure6ountant_s9o1tor4d_s1ult4e_g1ro2tna4f_l1rica5g_akhan5ency5i_g1rbus3force5tel5kdn3l_faromeo7ibaba4pay4lfinanz6state5y2sace3tom5m_azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o_l2partments8p_le4q_uarelle8r_ab1mco4chi3my2pa2t_e3s_da2ia2sociates9t_hleta5torney7u_ction5di_ble3o3spost5thor3o_s4vianca6w_s2x_a2z_ure5ba_by2idu3namex3narepublic11d1k2r_celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b_c1t1va3cg1n2d1e_ats2uty4er2ntley5rlin4st_buy5t2f1g1h_arti5i_ble3d1ke2ng_o3o1z2j1lack_friday9ockbuster8g1omberg7ue3m_s1w2n_pparibas9o_ats3ehringer8fa2m1nd2o_k_ing5sch2tik2on4t1utique6x2r_adesco6idgestone9oadway5ker3ther5ussels7s1t1uild_ers6siness6y1zz3v1w1y1z_h3ca_b1fe2l_l1vinklein9m_era3p2non3petown5ital_one8r_avan4ds2e_er_s4s2sa1e1h1ino4t_ering5holic7ba1n1re2s2c1d1enter4o1rn3f_a1d2g1h_anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i_priani6rcle4sco3tadel4i_c2y_eats7k1l_aims4eaning6ick2nic1que6othing5ud3ub_med6m1n1o_ach3des3ffee4llege4ogne5m_cast4mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking_channel11l1p2rsica5untry4pon_s4rses6pa2r_edit_card4union9icket5own3s1uise_s6u_isinella9v1w1x1y_mru3ou3z2dabur3d1nce3ta1e1ing3sun4y2clk3ds2e_al_er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si_gn4v2hl2iamonds6et2gital5rect_ory7scount3ver5h2y2j1k1m1np2o_cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c_o2deka3u_cation8e1g1mail3erck5nergy4gineer_ing9terprises10pson4quipment8r_icsson6ni3s_q1tate5t_isalat7u_rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n_s2rm_ers5shion4t3edex3edback6rrari3ero6i_at2delity5o2lm2nal1nce1ial7re_stone6mdale6sh_ing5t_ness6j1k1lickr3ghts4r2orist4wers5y2m1o_o_d_network8tball6rd1ex2sale4um3undation8x2r_ee1senius7l1ogans4ntdoor4ier7tr2ujitsu5n_d2rniture7tbol5yi3ga_l_lery3o1up4me_s3p1rden4y2b_iz3d_n2e_a1nt_ing5orge5f1g_ee3h1i_ft_s3ves2ing5l_ass3e1obal2o4m_ail3bh2o1x2n1odaddy5ld_point6f2o_dyear5g_le4p1t1v2p1q1r_ainger5phics5tis4een3ipe3ocery4up4s1t1u_ardian6cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc_bank7ealth_care8lp1sinki6re1mes5gtv3iphop4samitsu7tachi5v2k_t2m1n1ockey4ldings5iday5medepot5goods5s_ense7nda3rse3spital5t_ing5t_eles2s3mail5use3w2r1sbc3t1u_ghes5yatt3undai7ibm2cbc2e1u2d1e_ee3fm2kano4l1m_amat4db2mo_bilien9n_c1dustries8finiti5o2g1k1stitute6urance4e4t_ernational10uit4vestments10o1piranga7q1r_ish4s_maili5t_anbul7t_au2v3jaguar4va3cb2e_ep2tzt3welry6io2ll2m_p2nj2o_bs1urg4t1y2p_morgan6rs3uegos4niper7kaufen5ddi3e_rryhotels6logistics9properties14fh2g1h1i_a1ds2m1nder2le4tchen5wi3m1n1oeln3matsu5sher5p_mg2n2r_d1ed3uokgroup8w1y_oto4z2la_caixa5mborghini8er3ncaster5ia3d_rover6xess5salle5t_ino3robe5w_yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i_dl2fe_insurance9style7ghting6ke2lly3mited4o2ncoln4de2k2psy3ve1ing5k1lc1p2oan_s3cker3us3l1ndon4tte1o3ve3pl_financial11r1s1t_d_a3u_ndbeck6xe1ury5v1y2ma_cys3drid4if1son4keup4n_agement7go3p1rket_ing3s4riott5shalls7serati6ttel5ba2c_kinsey7d1e_d_ia3et2lbourne7me1orial6n_u2rckmsd7g1h1iami3crosoft7l1ni1t2t_subishi9k1l_b1s2m_a2n1o_bi_le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to_rcycles9v_ie4p1q1r1s_d2t_n1r2u_seum3ic3tual5v1w1x1y1z2na_b1goya4me2tura4vy3ba2c1e_c1t_bank4flix4work5ustar5w_s2xt_direct7us4f_l2g_o2hk2i_co2ke1on3nja3ssan1y5l1o_kia3rthwesternmutual14on4w_ruz3tv4p1r_a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan_group9dnavy5lo3m_ega4ne1g1l_ine5oo2pen3racle3nge4g_anic5igins6saka4tsuka4t2vh3pa_ge2nasonic7ris2s1tners4s1y3ssagens7y2ccw3e_t2f_izer5g1h_armacy6d1ilips5one2to_graphy6s4ysio5ics1tet2ures6d1n_g1k2oneer5zza4k1l_ace2y_station9umbing5s3m1n_c2ohl2ker3litie5rn2st3r_america6xi3ess3ime3o_d_uctions8f1gressive8mo2perties3y5tection8u_dential9s1t1ub2w_c2y2qa1pon3uebec3st5racing4dio4e_ad1lestate6tor2y4cipes5d_stone5umbrella9hab3ise_n3t2liance6n_t_als5pair3ort3ublican8st_aurant8view_s5xroth6ich_ardli6oh3l1o1p2o_cher3ks3deo3gers4om3s_vp3u_gby3hr2n2w_e2yukyu6sa_arland6fe_ty4kura4le1on3msclub4ung5ndvik_coromant12ofi4p1rl2s1ve2xo3b_i1s2c_a1b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e_arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x_y3fr2g1h_angrila6rp2w2ell3ia1ksha5oes2p_ping5uji3w_time7i_lk2na1gles5te3j1k_i_n2y_pe4l_ing4m_art3ile4n_cf3o_ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa_ce3ort2t3r_l2s1t_ada2ples4r1tebank4farm7c_group6ockholm6rage3e3ream4udio2y3yle4u_cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y_dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x_i3c_i2d_k2eam2ch_nology8l1masek5nnis4va3f1g1h_d1eater2re6iaa2ckets5enda4ffany5ps2res2ol4j_maxx4x2k_maxx5l1m_all4n1o_day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r_ade1ing4ining5vel_channel7ers_insurance16ust3v2t1ube2i1nes3shu4v_s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va_cations7na1guard7c1e_gas3ntures6risign5mögensberater2ung14sicherung10t2g1i_ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lkswagen7vo3te1ing3o2yage5u_elos6wales2mart4ter4ng_gou5tch_es6eather_channel12bcam3er2site5d_ding5ibo2r3f1hoswho6ien2ki2lliamhill9n_dows4e1ners6me2olterskluwer11odside6rk_s2ld3w2s1tc1f3xbox3erox4finity6ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u_tube6t1un3za_ppos4ra3ero3ip2m1one3uerich6w2';
// Internationalized domain names containing non-ASCII
const encodedUtlds = 'ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5تصالات6رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत_म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里_大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2';

/**
 * @template A
 * @template B
 * @param {A} target
 * @param {B} properties
 * @return {A & B}
 */
const assign = (target, properties) => {
  for (const key in properties) {
    target[key] = properties[key];
  }
  return target;
};

/**
 * Finite State Machine generation utilities
 */

/**
 * @template T
 * @typedef {{ [group: string]: T[] }} Collections
 */

/**
 * @typedef {{ [group: string]: true }} Flags
 */

// Keys in scanner Collections instances
const numeric = 'numeric';
const ascii = 'ascii';
const alpha = 'alpha';
const asciinumeric = 'asciinumeric';
const alphanumeric = 'alphanumeric';
const domain = 'domain';
const emoji = 'emoji';
const scheme = 'scheme';
const slashscheme = 'slashscheme';
const whitespace = 'whitespace';

/**
 * @template T
 * @param {string} name
 * @param {Collections<T>} groups to register in
 * @returns {T[]} Current list of tokens in the given collection
 */
function registerGroup(name, groups) {
  if (!(name in groups)) {
    groups[name] = [];
  }
  return groups[name];
}

/**
 * @template T
 * @param {T} t token to add
 * @param {Collections<T>} groups
 * @param {Flags} flags
 */
function addToGroups(t, flags, groups) {
  if (flags[numeric]) {
    flags[asciinumeric] = true;
    flags[alphanumeric] = true;
  }
  if (flags[ascii]) {
    flags[asciinumeric] = true;
    flags[alpha] = true;
  }
  if (flags[asciinumeric]) {
    flags[alphanumeric] = true;
  }
  if (flags[alpha]) {
    flags[alphanumeric] = true;
  }
  if (flags[alphanumeric]) {
    flags[domain] = true;
  }
  if (flags[emoji]) {
    flags[domain] = true;
  }
  for (const k in flags) {
    const group = registerGroup(k, groups);
    if (group.indexOf(t) < 0) {
      group.push(t);
    }
  }
}

/**
 * @template T
 * @param {T} t token to check
 * @param {Collections<T>} groups
 * @returns {Flags} group flags that contain this token
 */
function flagsForToken(t, groups) {
  const result = {};
  for (const c in groups) {
    if (groups[c].indexOf(t) >= 0) {
      result[c] = true;
    }
  }
  return result;
}

/**
 * @template T
 * @typedef {null | T } Transition
 */

/**
 * Define a basic state machine state. j is the list of character transitions,
 * jr is the list of regex-match transitions, jd is the default state to
 * transition to t is the accepting token type, if any. If this is the terminal
 * state, then it does not emit a token.
 *
 * The template type T represents the type of the token this state accepts. This
 * should be a string (such as of the token exports in `text.js`) or a
 * MultiToken subclass (from `multi.js`)
 *
 * @template T
 * @param {T} [token] Token that this state emits
 */
function State(token) {
  if (token === void 0) {
    token = null;
  }
  // this.n = null; // DEBUG: State name
  /** @type {{ [input: string]: State<T> }} j */
  this.j = {}; // IMPLEMENTATION 1
  // this.j = []; // IMPLEMENTATION 2
  /** @type {[RegExp, State<T>][]} jr */
  this.jr = [];
  /** @type {?State<T>} jd */
  this.jd = null;
  /** @type {?T} t */
  this.t = token;
}

/**
 * Scanner token groups
 * @type Collections<string>
 */
State.groups = {};
State.prototype = {
  accepts() {
    return !!this.t;
  },
  /**
   * Follow an existing transition from the given input to the next state.
   * Does not mutate.
   * @param {string} input character or token type to transition on
   * @returns {?State<T>} the next state, if any
   */
  go(input) {
    const state = this;
    const nextState = state.j[input];
    if (nextState) {
      return nextState;
    }
    for (let i = 0; i < state.jr.length; i++) {
      const regex = state.jr[i][0];
      const nextState = state.jr[i][1]; // note: might be empty to prevent default jump
      if (nextState && regex.test(input)) {
        return nextState;
      }
    }
    // Nowhere left to jump! Return default, if any
    return state.jd;
  },
  /**
   * Whether the state has a transition for the given input. Set the second
   * argument to true to only look for an exact match (and not a default or
   * regular-expression-based transition)
   * @param {string} input
   * @param {boolean} exactOnly
   */
  has(input, exactOnly) {
    if (exactOnly === void 0) {
      exactOnly = false;
    }
    return exactOnly ? input in this.j : !!this.go(input);
  },
  /**
   * Short for "transition all"; create a transition from the array of items
   * in the given list to the same final resulting state.
   * @param {string | string[]} inputs Group of inputs to transition on
   * @param {Transition<T> | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   */
  ta(inputs, next, flags, groups) {
    for (let i = 0; i < inputs.length; i++) {
      this.tt(inputs[i], next, flags, groups);
    }
  },
  /**
   * Short for "take regexp transition"; defines a transition for this state
   * when it encounters a token which matches the given regular expression
   * @param {RegExp} regexp Regular expression transition (populate first)
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  tr(regexp, next, flags, groups) {
    groups = groups || State.groups;
    let nextState;
    if (next && next.j) {
      nextState = next;
    } else {
      // Token with maybe token groups
      nextState = new State(next);
      if (flags && groups) {
        addToGroups(next, flags, groups);
      }
    }
    this.jr.push([regexp, nextState]);
    return nextState;
  },
  /**
   * Short for "take transitions", will take as many sequential transitions as
   * the length of the given input and returns the
   * resulting final state.
   * @param {string | string[]} input
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of token groups
   * @returns {State<T>} taken after the given input
   */
  ts(input, next, flags, groups) {
    let state = this;
    const len = input.length;
    if (!len) {
      return state;
    }
    for (let i = 0; i < len - 1; i++) {
      state = state.tt(input[i]);
    }
    return state.tt(input[len - 1], next, flags, groups);
  },
  /**
   * Short for "take transition", this is a method for building/working with
   * state machines.
   *
   * If a state already exists for the given input, returns it.
   *
   * If a token is specified, that state will emit that token when reached by
   * the linkify engine.
   *
   * If no state exists, it will be initialized with some default transitions
   * that resemble existing default transitions.
   *
   * If a state is given for the second argument, that state will be
   * transitioned to on the given input regardless of what that input
   * previously did.
   *
   * Specify a token group flags to define groups that this token belongs to.
   * The token will be added to corresponding entires in the given groups
   * object.
   *
   * @param {string} input character, token type to transition on
   * @param {T | State<T>} [next] Transition options
   * @param {Flags} [flags] Collections flags to add token to
   * @param {Collections<T>} [groups] Master list of groups
   * @returns {State<T>} taken after the given input
   */
  tt(input, next, flags, groups) {
    groups = groups || State.groups;
    const state = this;

    // Check if existing state given, just a basic transition
    if (next && next.j) {
      state.j[input] = next;
      return next;
    }
    const t = next;

    // Take the transition with the usual default mechanisms and use that as
    // a template for creating the next state
    let nextState,
      templateState = state.go(input);
    if (templateState) {
      nextState = new State();
      assign(nextState.j, templateState.j);
      nextState.jr.push.apply(nextState.jr, templateState.jr);
      nextState.jd = templateState.jd;
      nextState.t = templateState.t;
    } else {
      nextState = new State();
    }
    if (t) {
      // Ensure newly token is in the same groups as the old token
      if (groups) {
        if (nextState.t && typeof nextState.t === 'string') {
          const allFlags = assign(flagsForToken(nextState.t, groups), flags);
          addToGroups(t, allFlags, groups);
        } else if (flags) {
          addToGroups(t, flags, groups);
        }
      }
      nextState.t = t; // overwrite anything that was previously there
    }

    state.j[input] = nextState;
    return nextState;
  }
};

// Helper functions to improve minification (not exported outside linkifyjs module)

/**
 * @template T
 * @param {State<T>} state
 * @param {string | string[]} input
 * @param {Flags} [flags]
 * @param {Collections<T>} [groups]
 */
const ta = (state, input, next, flags, groups) => state.ta(input, next, flags, groups);

/**
 * @template T
 * @param {State<T>} state
 * @param {RegExp} regexp
 * @param {T | State<T>} [next]
 * @param {Flags} [flags]
 * @param {Collections<T>} [groups]
 */
const tr = (state, regexp, next, flags, groups) => state.tr(regexp, next, flags, groups);

/**
 * @template T
 * @param {State<T>} state
 * @param {string | string[]} input
 * @param {T | State<T>} [next]
 * @param {Flags} [flags]
 * @param {Collections<T>} [groups]
 */
const ts = (state, input, next, flags, groups) => state.ts(input, next, flags, groups);

/**
 * @template T
 * @param {State<T>} state
 * @param {string} input
 * @param {T | State<T>} [next]
 * @param {Collections<T>} [groups]
 * @param {Flags} [flags]
 */
const tt = (state, input, next, flags, groups) => state.tt(input, next, flags, groups);

/******************************************************************************
Text Tokens
Identifiers for token outputs from the regexp scanner
******************************************************************************/

// A valid web domain token
const WORD = 'WORD'; // only contains a-z
const UWORD = 'UWORD'; // contains letters other than a-z, used for IDN

// Special case of word
const LOCALHOST = 'LOCALHOST';

// Valid top-level domain, special case of WORD (see tlds.js)
const TLD = 'TLD';

// Valid IDN TLD, special case of UWORD (see tlds.js)
const UTLD = 'UTLD';

// The scheme portion of a web URI protocol. Supported types include: `mailto`,
// `file`, and user-defined custom protocols. Limited to schemes that contain
// only letters
const SCHEME = 'SCHEME';

// Similar to SCHEME, except makes distinction for schemes that must always be
// followed by `://`, not just `:`. Supported types include `http`, `https`,
// `ftp`, `ftps`
const SLASH_SCHEME = 'SLASH_SCHEME';

// Any sequence of digits 0-9
const NUM = 'NUM';

// Any number of consecutive whitespace characters that are not newline
const WS = 'WS';

// New line (unix style)
const NL$1 = 'NL'; // \n

// Opening/closing bracket classes
const OPENBRACE = 'OPENBRACE'; // {
const OPENBRACKET = 'OPENBRACKET'; // [
const OPENANGLEBRACKET = 'OPENANGLEBRACKET'; // <
const OPENPAREN = 'OPENPAREN'; // (
const CLOSEBRACE = 'CLOSEBRACE'; // }
const CLOSEBRACKET = 'CLOSEBRACKET'; // ]
const CLOSEANGLEBRACKET = 'CLOSEANGLEBRACKET'; // >
const CLOSEPAREN = 'CLOSEPAREN'; // )

// Various symbols
const AMPERSAND = 'AMPERSAND'; // &
const APOSTROPHE = 'APOSTROPHE'; // '
const ASTERISK = 'ASTERISK'; // *
const AT = 'AT'; // @
const BACKSLASH = 'BACKSLASH'; // \
const BACKTICK = 'BACKTICK'; // `
const CARET = 'CARET'; // ^
const COLON = 'COLON'; // :
const COMMA = 'COMMA'; // ,
const DOLLAR = 'DOLLAR'; // $
const DOT = 'DOT'; // .
const EQUALS = 'EQUALS'; // =
const EXCLAMATION = 'EXCLAMATION'; // !
const HYPHEN = 'HYPHEN'; // -
const PERCENT = 'PERCENT'; // %
const PIPE = 'PIPE'; // |
const PLUS = 'PLUS'; // +
const POUND = 'POUND'; // #
const QUERY = 'QUERY'; // ?
const QUOTE = 'QUOTE'; // "

const SEMI = 'SEMI'; // ;
const SLASH = 'SLASH'; // /
const TILDE = 'TILDE'; // ~
const UNDERSCORE = 'UNDERSCORE'; // _

// Emoji symbol
const EMOJI$1 = 'EMOJI';

// Default token - anything that is not one of the above
const SYM = 'SYM';

var tk = /*#__PURE__*/Object.freeze({
	__proto__: null,
	WORD: WORD,
	UWORD: UWORD,
	LOCALHOST: LOCALHOST,
	TLD: TLD,
	UTLD: UTLD,
	SCHEME: SCHEME,
	SLASH_SCHEME: SLASH_SCHEME,
	NUM: NUM,
	WS: WS,
	NL: NL$1,
	OPENBRACE: OPENBRACE,
	OPENBRACKET: OPENBRACKET,
	OPENANGLEBRACKET: OPENANGLEBRACKET,
	OPENPAREN: OPENPAREN,
	CLOSEBRACE: CLOSEBRACE,
	CLOSEBRACKET: CLOSEBRACKET,
	CLOSEANGLEBRACKET: CLOSEANGLEBRACKET,
	CLOSEPAREN: CLOSEPAREN,
	AMPERSAND: AMPERSAND,
	APOSTROPHE: APOSTROPHE,
	ASTERISK: ASTERISK,
	AT: AT,
	BACKSLASH: BACKSLASH,
	BACKTICK: BACKTICK,
	CARET: CARET,
	COLON: COLON,
	COMMA: COMMA,
	DOLLAR: DOLLAR,
	DOT: DOT,
	EQUALS: EQUALS,
	EXCLAMATION: EXCLAMATION,
	HYPHEN: HYPHEN,
	PERCENT: PERCENT,
	PIPE: PIPE,
	PLUS: PLUS,
	POUND: POUND,
	QUERY: QUERY,
	QUOTE: QUOTE,
	SEMI: SEMI,
	SLASH: SLASH,
	TILDE: TILDE,
	UNDERSCORE: UNDERSCORE,
	EMOJI: EMOJI$1,
	SYM: SYM
});

// Note that these two Unicode ones expand into a really big one with Babel
const ASCII_LETTER = /[a-z]/;
const LETTER = /\p{L}/u; // Any Unicode character with letter data type
const EMOJI = /\p{Emoji}/u; // Any Unicode emoji character
const DIGIT = /\d/;
const SPACE = /\s/;

/**
	The scanner provides an interface that takes a string of text as input, and
	outputs an array of tokens instances that can be used for easy URL parsing.
*/
const NL = '\n'; // New line character
const EMOJI_VARIATION = '\ufe0f'; // Variation selector, follows heart and others
const EMOJI_JOINER = '\u200d'; // zero-width joiner

let tlds = null,
  utlds = null; // don't change so only have to be computed once

/**
 * Scanner output token:
 * - `t` is the token name (e.g., 'NUM', 'EMOJI', 'TLD')
 * - `v` is the value of the token (e.g., '123', '❤️', 'com')
 * - `s` is the start index of the token in the original string
 * - `e` is the end index of the token in the original string
 * @typedef {{t: string, v: string, s: number, e: number}} Token
 */

/**
 * @template T
 * @typedef {{ [collection: string]: T[] }} Collections
 */

/**
 * Initialize the scanner character-based state machine for the given start
 * state
 * @param {[string, boolean][]} customSchemes List of custom schemes, where each
 * item is a length-2 tuple with the first element set to the string scheme, and
 * the second element set to `true` if the `://` after the scheme is optional
 */
function init$2(customSchemes) {
  if (customSchemes === void 0) {
    customSchemes = [];
  }
  // Frequently used states (name argument removed during minification)
  /** @type Collections<string> */
  const groups = {}; // of tokens
  State.groups = groups;
  /** @type State<string> */
  const Start = new State();
  if (tlds == null) {
    tlds = decodeTlds(encodedTlds);
  }
  if (utlds == null) {
    utlds = decodeTlds(encodedUtlds);
  }

  // States for special URL symbols that accept immediately after start
  tt(Start, "'", APOSTROPHE);
  tt(Start, '{', OPENBRACE);
  tt(Start, '[', OPENBRACKET);
  tt(Start, '<', OPENANGLEBRACKET);
  tt(Start, '(', OPENPAREN);
  tt(Start, '}', CLOSEBRACE);
  tt(Start, ']', CLOSEBRACKET);
  tt(Start, '>', CLOSEANGLEBRACKET);
  tt(Start, ')', CLOSEPAREN);
  tt(Start, '&', AMPERSAND);
  tt(Start, '*', ASTERISK);
  tt(Start, '@', AT);
  tt(Start, '`', BACKTICK);
  tt(Start, '^', CARET);
  tt(Start, ':', COLON);
  tt(Start, ',', COMMA);
  tt(Start, '$', DOLLAR);
  tt(Start, '.', DOT);
  tt(Start, '=', EQUALS);
  tt(Start, '!', EXCLAMATION);
  tt(Start, '-', HYPHEN);
  tt(Start, '%', PERCENT);
  tt(Start, '|', PIPE);
  tt(Start, '+', PLUS);
  tt(Start, '#', POUND);
  tt(Start, '?', QUERY);
  tt(Start, '"', QUOTE);
  tt(Start, '/', SLASH);
  tt(Start, ';', SEMI);
  tt(Start, '~', TILDE);
  tt(Start, '_', UNDERSCORE);
  tt(Start, '\\', BACKSLASH);
  const Num = tr(Start, DIGIT, NUM, {
    [numeric]: true
  });
  tr(Num, DIGIT, Num);

  // State which emits a word token
  const Word = tr(Start, ASCII_LETTER, WORD, {
    [ascii]: true
  });
  tr(Word, ASCII_LETTER, Word);

  // Same as previous, but specific to non-fsm.ascii alphabet words
  const UWord = tr(Start, LETTER, UWORD, {
    [alpha]: true
  });
  tr(UWord, ASCII_LETTER); // Non-accepting
  tr(UWord, LETTER, UWord);

  // Whitespace jumps
  // Tokens of only non-newline whitespace are arbitrarily long
  // If any whitespace except newline, more whitespace!
  const Ws = tr(Start, SPACE, WS, {
    [whitespace]: true
  });
  tt(Start, NL, NL$1, {
    [whitespace]: true
  });
  tt(Ws, NL); // non-accepting state to avoid mixing whitespaces
  tr(Ws, SPACE, Ws);

  // Emoji tokens. They are not grouped by the scanner except in cases where a
  // zero-width joiner is present
  const Emoji = tr(Start, EMOJI, EMOJI$1, {
    [emoji]: true
  });
  tr(Emoji, EMOJI, Emoji);
  tt(Emoji, EMOJI_VARIATION, Emoji);
  // tt(Start, EMOJI_VARIATION, Emoji); // This one is sketchy

  const EmojiJoiner = tt(Emoji, EMOJI_JOINER);
  tr(EmojiJoiner, EMOJI, Emoji);
  // tt(EmojiJoiner, EMOJI_VARIATION, Emoji); // also sketchy

  // Generates states for top-level domains
  // Note that this is most accurate when tlds are in alphabetical order
  const wordjr = [[ASCII_LETTER, Word]];
  const uwordjr = [[ASCII_LETTER, null], [LETTER, UWord]];
  for (let i = 0; i < tlds.length; i++) {
    fastts(Start, tlds[i], TLD, WORD, wordjr);
  }
  for (let i = 0; i < utlds.length; i++) {
    fastts(Start, utlds[i], UTLD, UWORD, uwordjr);
  }
  addToGroups(TLD, {
    tld: true,
    ascii: true
  }, groups);
  addToGroups(UTLD, {
    utld: true,
    alpha: true
  }, groups);

  // Collect the states generated by different protocols. NOTE: If any new TLDs
  // get added that are also protocols, set the token to be the same as the
  // protocol to ensure parsing works as expected.
  fastts(Start, 'file', SCHEME, WORD, wordjr);
  fastts(Start, 'mailto', SCHEME, WORD, wordjr);
  fastts(Start, 'http', SLASH_SCHEME, WORD, wordjr);
  fastts(Start, 'https', SLASH_SCHEME, WORD, wordjr);
  fastts(Start, 'ftp', SLASH_SCHEME, WORD, wordjr);
  fastts(Start, 'ftps', SLASH_SCHEME, WORD, wordjr);
  addToGroups(SCHEME, {
    scheme: true,
    ascii: true
  }, groups);
  addToGroups(SLASH_SCHEME, {
    slashscheme: true,
    ascii: true
  }, groups);

  // Register custom schemes. Assumes each scheme is asciinumeric with hyphens
  customSchemes = customSchemes.sort((a, b) => a[0] > b[0] ? 1 : -1);
  for (let i = 0; i < customSchemes.length; i++) {
    const sch = customSchemes[i][0];
    const optionalSlashSlash = customSchemes[i][1];
    const flags = optionalSlashSlash ? {
      [scheme]: true
    } : {
      [slashscheme]: true
    };
    if (sch.indexOf('-') >= 0) {
      flags[domain] = true;
    } else if (!ASCII_LETTER.test(sch)) {
      flags[numeric] = true; // numbers only
    } else if (DIGIT.test(sch)) {
      flags[asciinumeric] = true;
    } else {
      flags[ascii] = true;
    }
    ts(Start, sch, sch, flags);
  }

  // Localhost token
  ts(Start, 'localhost', LOCALHOST, {
    ascii: true
  });

  // Set default transition for start state (some symbol)
  Start.jd = new State(SYM);
  return {
    start: Start,
    tokens: assign({
      groups
    }, tk)
  };
}

/**
	Given a string, returns an array of TOKEN instances representing the
	composition of that string.

	@method run
	@param {State<string>} start scanner starting state
	@param {string} str input string to scan
	@return {Token[]} list of tokens, each with a type and value
*/
function run$1(start, str) {
  // State machine is not case sensitive, so input is tokenized in lowercased
  // form (still returns regular case). Uses selective `toLowerCase` because
  // lowercasing the entire string causes the length and character position to
  // vary in some non-English strings with V8-based runtimes.
  const iterable = stringToArray(str.replace(/[A-Z]/g, c => c.toLowerCase()));
  const charCount = iterable.length; // <= len if there are emojis, etc
  const tokens = []; // return value

  // cursor through the string itself, accounting for characters that have
  // width with length 2 such as emojis
  let cursor = 0;

  // Cursor through the array-representation of the string
  let charCursor = 0;

  // Tokenize the string
  while (charCursor < charCount) {
    let state = start;
    let nextState = null;
    let tokenLength = 0;
    let latestAccepting = null;
    let sinceAccepts = -1;
    let charsSinceAccepts = -1;
    while (charCursor < charCount && (nextState = state.go(iterable[charCursor]))) {
      state = nextState;

      // Keep track of the latest accepting state
      if (state.accepts()) {
        sinceAccepts = 0;
        charsSinceAccepts = 0;
        latestAccepting = state;
      } else if (sinceAccepts >= 0) {
        sinceAccepts += iterable[charCursor].length;
        charsSinceAccepts++;
      }
      tokenLength += iterable[charCursor].length;
      cursor += iterable[charCursor].length;
      charCursor++;
    }

    // Roll back to the latest accepting state
    cursor -= sinceAccepts;
    charCursor -= charsSinceAccepts;
    tokenLength -= sinceAccepts;

    // No more jumps, just make a new token from the last accepting one
    tokens.push({
      t: latestAccepting.t,
      // token type/name
      v: str.slice(cursor - tokenLength, cursor),
      // string value
      s: cursor - tokenLength,
      // start index
      e: cursor // end index (excluding)
    });
  }

  return tokens;
}

/**
 * Convert a String to an Array of characters, taking into account that some
 * characters like emojis take up two string indexes.
 *
 * Adapted from core-js (MIT license)
 * https://github.com/zloirock/core-js/blob/2d69cf5f99ab3ea3463c395df81e5a15b68f49d9/packages/core-js/internals/string-multibyte.js
 *
 * @function stringToArray
 * @param {string} str
 * @returns {string[]}
 */
function stringToArray(str) {
  const result = [];
  const len = str.length;
  let index = 0;
  while (index < len) {
    let first = str.charCodeAt(index);
    let second;
    let char = first < 0xd800 || first > 0xdbff || index + 1 === len || (second = str.charCodeAt(index + 1)) < 0xdc00 || second > 0xdfff ? str[index] // single character
    : str.slice(index, index + 2); // two-index characters
    result.push(char);
    index += char.length;
  }
  return result;
}

/**
 * Fast version of ts function for when transition defaults are well known
 * @param {State<string>} state
 * @param {string} input
 * @param {string} t
 * @param {string} defaultt
 * @param {[RegExp, State<string>][]} jr
 * @returns {State<string>}
 */
function fastts(state, input, t, defaultt, jr) {
  let next;
  const len = input.length;
  for (let i = 0; i < len - 1; i++) {
    const char = input[i];
    if (state.j[char]) {
      next = state.j[char];
    } else {
      next = new State(defaultt);
      next.jr = jr.slice();
      state.j[char] = next;
    }
    state = next;
  }
  next = new State(t);
  next.jr = jr.slice();
  state.j[input[len - 1]] = next;
  return next;
}

/**
 * Converts a string of Top-Level Domain names encoded in update-tlds.js back
 * into a list of strings.
 * @param {str} encoded encoded TLDs string
 * @returns {str[]} original TLDs list
 */
function decodeTlds(encoded) {
  const words = [];
  const stack = [];
  let i = 0;
  let digits = '0123456789';
  while (i < encoded.length) {
    let popDigitCount = 0;
    while (digits.indexOf(encoded[i + popDigitCount]) >= 0) {
      popDigitCount++; // encountered some digits, have to pop to go one level up trie
    }

    if (popDigitCount > 0) {
      words.push(stack.join('')); // whatever preceded the pop digits must be a word
      let popCount = parseInt(encoded.substring(i, i + popDigitCount), 10);
      for (; popCount > 0; popCount--) {
        stack.pop();
      }
      i += popDigitCount;
    } else if (encoded[i] === '_') {
      words.push(stack.join('')); // found a word, will be followed by another
      i++;
    } else {
      stack.push(encoded[i]); // drop down a level into the trie
      i++;
    }
  }
  return words;
}

/**
 * An object where each key is a valid DOM Event Name such as `click` or `focus`
 * and each value is an event handler function.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element#events
 * @typedef {?{ [event: string]: Function }} EventListeners
 */

/**
 * All formatted properties required to render a link, including `tagName`,
 * `attributes`, `content` and `eventListeners`.
 * @typedef {{ tagName: any, attributes: {[attr: string]: any}, content: string,
 * eventListeners: EventListeners }} IntermediateRepresentation
 */

/**
 * Specify either an object described by the template type `O` or a function.
 *
 * The function takes a string value (usually the link's href attribute), the
 * link type (`'url'`, `'hashtag`', etc.) and an internal token representation
 * of the link. It should return an object of the template type `O`
 * @template O
 * @typedef {O | ((value: string, type: string, token: MultiToken) => O)} OptObj
 */

/**
 * Specify either a function described by template type `F` or an object.
 *
 * Each key in the object should be a link type (`'url'`, `'hashtag`', etc.). Each
 * value should be a function with template type `F` that is called when the
 * corresponding link type is encountered.
 * @template F
 * @typedef {F | { [type: string]: F}} OptFn
 */

/**
 * Specify either a value with template type `V`, a function that returns `V` or
 * an object where each value resolves to `V`.
 *
 * The function takes a string value (usually the link's href attribute), the
 * link type (`'url'`, `'hashtag`', etc.) and an internal token representation
 * of the link. It should return an object of the template type `V`
 *
 * For the object, each key should be a link type (`'url'`, `'hashtag`', etc.).
 * Each value should either have type `V` or a function that returns V. This
 * function similarly takes a string value and a token.
 *
 * Example valid types for `Opt<string>`:
 *
 * ```js
 * 'hello'
 * (value, type, token) => 'world'
 * { url: 'hello', email: (value, token) => 'world'}
 * ```
 * @template V
 * @typedef {V | ((value: string, type: string, token: MultiToken) => V) | { [type: string]: V | ((value: string, token: MultiToken) => V) }} Opt
 */

/**
 * See available options: https://linkify.js.org/docs/options.html
 * @typedef {{
 * 	defaultProtocol?: string,
 *  events?: OptObj<EventListeners>,
 * 	format?: Opt<string>,
 * 	formatHref?: Opt<string>,
 * 	nl2br?: boolean,
 * 	tagName?: Opt<any>,
 * 	target?: Opt<string>,
 * 	rel?: Opt<string>,
 * 	validate?: Opt<boolean>,
 * 	truncate?: Opt<number>,
 * 	className?: Opt<string>,
 * 	attributes?: OptObj<({ [attr: string]: any })>,
 *  ignoreTags?: string[],
 * 	render?: OptFn<((ir: IntermediateRepresentation) => any)>
 * }} Opts
 */

/**
 * @type Required<Opts>
 */
const defaults = {
  defaultProtocol: 'http',
  events: null,
  format: noop,
  formatHref: noop,
  nl2br: false,
  tagName: 'a',
  target: null,
  rel: null,
  validate: true,
  truncate: Infinity,
  className: null,
  attributes: null,
  ignoreTags: [],
  render: null
};

/**
 * Utility class for linkify interfaces to apply specified
 * {@link Opts formatting and rendering options}.
 *
 * @param {Opts | Options} [opts] Option value overrides.
 * @param {(ir: IntermediateRepresentation) => any} [defaultRender] (For
 *   internal use) default render function that determines how to generate an
 *   HTML element based on a link token's derived tagName, attributes and HTML.
 *   Similar to render option
 */
function Options(opts, defaultRender) {
  if (defaultRender === void 0) {
    defaultRender = null;
  }
  let o = assign({}, defaults);
  if (opts) {
    o = assign(o, opts instanceof Options ? opts.o : opts);
  }

  // Ensure all ignored tags are uppercase
  const ignoredTags = o.ignoreTags;
  const uppercaseIgnoredTags = [];
  for (let i = 0; i < ignoredTags.length; i++) {
    uppercaseIgnoredTags.push(ignoredTags[i].toUpperCase());
  }
  /** @protected */
  this.o = o;
  if (defaultRender) {
    this.defaultRender = defaultRender;
  }
  this.ignoreTags = uppercaseIgnoredTags;
}
Options.prototype = {
  o: defaults,
  /**
   * @type string[]
   */
  ignoreTags: [],
  /**
   * @param {IntermediateRepresentation} ir
   * @returns {any}
   */
  defaultRender(ir) {
    return ir;
  },
  /**
   * Returns true or false based on whether a token should be displayed as a
   * link based on the user options.
   * @param {MultiToken} token
   * @returns {boolean}
   */
  check(token) {
    return this.get('validate', token.toString(), token);
  },
  // Private methods

  /**
   * Resolve an option's value based on the value of the option and the given
   * params. If operator and token are specified and the target option is
   * callable, automatically calls the function with the given argument.
   * @template {keyof Opts} K
   * @param {K} key Name of option to use
   * @param {string} [operator] will be passed to the target option if it's a
   * function. If not specified, RAW function value gets returned
   * @param {MultiToken} [token] The token from linkify.tokenize
   * @returns {Opts[K] | any}
   */
  get(key, operator, token) {
    const isCallable = operator != null;
    let option = this.o[key];
    if (!option) {
      return option;
    }
    if (typeof option === 'object') {
      option = token.t in option ? option[token.t] : defaults[key];
      if (typeof option === 'function' && isCallable) {
        option = option(operator, token);
      }
    } else if (typeof option === 'function' && isCallable) {
      option = option(operator, token.t, token);
    }
    return option;
  },
  /**
   * @template {keyof Opts} L
   * @param {L} key Name of options object to use
   * @param {string} [operator]
   * @param {MultiToken} [token]
   * @returns {Opts[L] | any}
   */
  getObj(key, operator, token) {
    let obj = this.o[key];
    if (typeof obj === 'function' && operator != null) {
      obj = obj(operator, token.t, token);
    }
    return obj;
  },
  /**
   * Convert the given token to a rendered element that may be added to the
   * calling-interface's DOM
   * @param {MultiToken} token Token to render to an HTML element
   * @returns {any} Render result; e.g., HTML string, DOM element, React
   *   Component, etc.
   */
  render(token) {
    const ir = token.render(this); // intermediate representation
    const renderFn = this.get('render', null, token) || this.defaultRender;
    return renderFn(ir, token.t, token);
  }
};
function noop(val) {
  return val;
}

/******************************************************************************
	Multi-Tokens
	Tokens composed of arrays of TextTokens
******************************************************************************/

/**
 * @param {string} value
 * @param {Token[]} tokens
 */
function MultiToken(value, tokens) {
  this.t = 'token';
  this.v = value;
  this.tk = tokens;
}

/**
 * Abstract class used for manufacturing tokens of text tokens. That is rather
 * than the value for a token being a small string of text, it's value an array
 * of text tokens.
 *
 * Used for grouping together URLs, emails, hashtags, and other potential
 * creations.
 * @class MultiToken
 * @property {string} t
 * @property {string} v
 * @property {Token[]} tk
 * @abstract
 */
MultiToken.prototype = {
  isLink: false,
  /**
   * Return the string this token represents.
   * @return {string}
   */
  toString() {
    return this.v;
  },
  /**
   * What should the value for this token be in the `href` HTML attribute?
   * Returns the `.toString` value by default.
   * @param {string} [scheme]
   * @return {string}
  */
  toHref(scheme) {
    return this.toString();
  },
  /**
   * @param {Options} options Formatting options
   * @returns {string}
   */
  toFormattedString(options) {
    const val = this.toString();
    const truncate = options.get('truncate', val, this);
    const formatted = options.get('format', val, this);
    return truncate && formatted.length > truncate ? formatted.substring(0, truncate) + '…' : formatted;
  },
  /**
   *
   * @param {Options} options
   * @returns {string}
   */
  toFormattedHref(options) {
    return options.get('formatHref', this.toHref(options.get('defaultProtocol')), this);
  },
  /**
   * The start index of this token in the original input string
   * @returns {number}
   */
  startIndex() {
    return this.tk[0].s;
  },
  /**
   * The end index of this token in the original input string (up to this
   * index but not including it)
   * @returns {number}
   */
  endIndex() {
    return this.tk[this.tk.length - 1].e;
  },
  /**
  	Returns an object  of relevant values for this token, which includes keys
  	* type - Kind of token ('url', 'email', etc.)
  	* value - Original text
  	* href - The value that should be added to the anchor tag's href
  		attribute
  		@method toObject
  	@param {string} [protocol] `'http'` by default
  */
  toObject(protocol) {
    if (protocol === void 0) {
      protocol = defaults.defaultProtocol;
    }
    return {
      type: this.t,
      value: this.toString(),
      isLink: this.isLink,
      href: this.toHref(protocol),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   *
   * @param {Options} options Formatting option
   */
  toFormattedObject(options) {
    return {
      type: this.t,
      value: this.toFormattedString(options),
      isLink: this.isLink,
      href: this.toFormattedHref(options),
      start: this.startIndex(),
      end: this.endIndex()
    };
  },
  /**
   * Whether this token should be rendered as a link according to the given options
   * @param {Options} options
   * @returns {boolean}
   */
  validate(options) {
    return options.get('validate', this.toString(), this);
  },
  /**
   * Return an object that represents how this link should be rendered.
   * @param {Options} options Formattinng options
   */
  render(options) {
    const token = this;
    const href = this.toFormattedHref(options);
    const tagName = options.get('tagName', href, token);
    const content = this.toFormattedString(options);
    const attributes = {};
    const className = options.get('className', href, token);
    const target = options.get('target', href, token);
    const rel = options.get('rel', href, token);
    const attrs = options.getObj('attributes', href, token);
    const eventListeners = options.getObj('events', href, token);
    attributes.href = href;
    if (className) {
      attributes.class = className;
    }
    if (target) {
      attributes.target = target;
    }
    if (rel) {
      attributes.rel = rel;
    }
    if (attrs) {
      assign(attributes, attrs);
    }
    return {
      tagName,
      attributes,
      content,
      eventListeners
    };
  }
};

/**
 * Create a new token that can be emitted by the parser state machine
 * @param {string} type readable type of the token
 * @param {object} props properties to assign or override, including isLink = true or false
 * @returns {new (value: string, tokens: Token[]) => MultiToken} new token class
 */
function createTokenClass(type, props) {
  class Token extends MultiToken {
    constructor(value, tokens) {
      super(value, tokens);
      this.t = type;
    }
  }
  for (const p in props) {
    Token.prototype[p] = props[p];
  }
  Token.t = type;
  return Token;
}

/**
	Represents a list of tokens making up a valid email address
*/
const Email = createTokenClass('email', {
  isLink: true,
  toHref() {
    return 'mailto:' + this.toString();
  }
});

/**
	Represents some plain text
*/
const Text = createTokenClass('text');

/**
	Multi-linebreak token - represents a line break
	@class Nl
*/
const Nl = createTokenClass('nl');

/**
	Represents a list of text tokens making up a valid URL
	@class Url
*/
const Url = createTokenClass('url', {
  isLink: true,
  /**
  	Lowercases relevant parts of the domain and adds the protocol if
  	required. Note that this will not escape unsafe HTML characters in the
  	URL.
  		@param {string} [scheme] default scheme (e.g., 'https')
  	@return {string} the full href
  */
  toHref(scheme) {
    if (scheme === void 0) {
      scheme = defaults.defaultProtocol;
    }
    // Check if already has a prefix scheme
    return this.hasProtocol() ? this.v : `${scheme}://${this.v}`;
  },
  /**
   * Check whether this URL token has a protocol
   * @return {boolean}
   */
  hasProtocol() {
    const tokens = this.tk;
    return tokens.length >= 2 && tokens[0].t !== LOCALHOST && tokens[1].t === COLON;
  }
});

/**
	Not exactly parser, more like the second-stage scanner (although we can
	theoretically hotswap the code here with a real parser in the future... but
	for a little URL-finding utility abstract syntax trees may be a little
	overkill).

	URL format: http://en.wikipedia.org/wiki/URI_scheme
	Email format: http://en.wikipedia.org/wiki/EmailAddress (links to RFC in
	reference)

	@module linkify
	@submodule parser
	@main run
*/
const makeState = arg => new State(arg);

/**
 * Generate the parser multi token-based state machine
 * @param {{ groups: Collections<string> }} tokens
 */
function init$1(_ref) {
  let {
    groups
  } = _ref;
  // Types of characters the URL can definitely end in
  const qsAccepting = groups.domain.concat([AMPERSAND, ASTERISK, AT, BACKSLASH, BACKTICK, CARET, DOLLAR, EQUALS, HYPHEN, NUM, PERCENT, PIPE, PLUS, POUND, SLASH, SYM, TILDE, UNDERSCORE]);

  // Types of tokens that can follow a URL and be part of the query string
  // but cannot be the very last characters
  // Characters that cannot appear in the URL at all should be excluded
  const qsNonAccepting = [APOSTROPHE, CLOSEANGLEBRACKET, CLOSEBRACE, CLOSEBRACKET, CLOSEPAREN, COLON, COMMA, DOT, EXCLAMATION, OPENANGLEBRACKET, OPENBRACE, OPENBRACKET, OPENPAREN, QUERY, QUOTE, SEMI];

  // For addresses without the mailto prefix
  // Tokens allowed in the localpart of the email
  const localpartAccepting = [AMPERSAND, APOSTROPHE, ASTERISK, BACKSLASH, BACKTICK, CARET, CLOSEBRACE, DOLLAR, EQUALS, HYPHEN, NUM, OPENBRACE, PERCENT, PIPE, PLUS, POUND, QUERY, SLASH, SYM, TILDE, UNDERSCORE];

  // The universal starting state.
  /**
   * @type State<Token>
   */
  const Start = makeState();
  const Localpart = tt(Start, TILDE); // Local part of the email address
  ta(Localpart, localpartAccepting, Localpart);
  ta(Localpart, groups.domain, Localpart);
  const Domain = makeState(),
    Scheme = makeState(),
    SlashScheme = makeState();
  ta(Start, groups.domain, Domain); // parsed string ends with a potential domain name (A)
  ta(Start, groups.scheme, Scheme); // e.g., 'mailto'
  ta(Start, groups.slashscheme, SlashScheme); // e.g., 'http'

  ta(Domain, localpartAccepting, Localpart);
  ta(Domain, groups.domain, Domain);
  const LocalpartAt = tt(Domain, AT); // Local part of the email address plus @

  tt(Localpart, AT, LocalpartAt); // close to an email address now

  // Local part of an email address can be e.g. 'http' or 'mailto'
  tt(Scheme, AT, LocalpartAt);
  tt(SlashScheme, AT, LocalpartAt);
  const LocalpartDot = tt(Localpart, DOT); // Local part of the email address plus '.' (localpart cannot end in .)
  ta(LocalpartDot, localpartAccepting, Localpart);
  ta(LocalpartDot, groups.domain, Localpart);
  const EmailDomain = makeState();
  ta(LocalpartAt, groups.domain, EmailDomain); // parsed string starts with local email info + @ with a potential domain name
  ta(EmailDomain, groups.domain, EmailDomain);
  const EmailDomainDot = tt(EmailDomain, DOT); // domain followed by DOT
  ta(EmailDomainDot, groups.domain, EmailDomain);
  const Email$1 = makeState(Email); // Possible email address (could have more tlds)
  ta(EmailDomainDot, groups.tld, Email$1);
  ta(EmailDomainDot, groups.utld, Email$1);
  tt(LocalpartAt, LOCALHOST, Email$1);

  // Hyphen can jump back to a domain name
  const EmailDomainHyphen = tt(EmailDomain, HYPHEN); // parsed string starts with local email info + @ with a potential domain name
  ta(EmailDomainHyphen, groups.domain, EmailDomain);
  ta(Email$1, groups.domain, EmailDomain);
  tt(Email$1, DOT, EmailDomainDot);
  tt(Email$1, HYPHEN, EmailDomainHyphen);

  // Final possible email states
  const EmailColon = tt(Email$1, COLON); // URL followed by colon (potential port number here)
  /*const EmailColonPort = */
  ta(EmailColon, groups.numeric, Email); // URL followed by colon and port numner

  // Account for dots and hyphens. Hyphens are usually parts of domain names
  // (but not TLDs)
  const DomainHyphen = tt(Domain, HYPHEN); // domain followed by hyphen
  const DomainDot = tt(Domain, DOT); // domain followed by DOT
  ta(DomainHyphen, groups.domain, Domain);
  ta(DomainDot, localpartAccepting, Localpart);
  ta(DomainDot, groups.domain, Domain);
  const DomainDotTld = makeState(Url); // Simplest possible URL with no query string
  ta(DomainDot, groups.tld, DomainDotTld);
  ta(DomainDot, groups.utld, DomainDotTld);
  ta(DomainDotTld, groups.domain, Domain);
  ta(DomainDotTld, localpartAccepting, Localpart);
  tt(DomainDotTld, DOT, DomainDot);
  tt(DomainDotTld, HYPHEN, DomainHyphen);
  tt(DomainDotTld, AT, LocalpartAt);
  const DomainDotTldColon = tt(DomainDotTld, COLON); // URL followed by colon (potential port number here)
  const DomainDotTldColonPort = makeState(Url); // TLD followed by a port number
  ta(DomainDotTldColon, groups.numeric, DomainDotTldColonPort);

  // Long URL with optional port and maybe query string
  const Url$1 = makeState(Url);

  // URL with extra symbols at the end, followed by an opening bracket
  const UrlNonaccept = makeState(); // URL followed by some symbols (will not be part of the final URL)

  // Query strings
  ta(Url$1, qsAccepting, Url$1);
  ta(Url$1, qsNonAccepting, UrlNonaccept);
  ta(UrlNonaccept, qsAccepting, Url$1);
  ta(UrlNonaccept, qsNonAccepting, UrlNonaccept);

  // Become real URLs after `SLASH` or `COLON NUM SLASH`
  // Here works with or without scheme:// prefix
  tt(DomainDotTld, SLASH, Url$1);
  tt(DomainDotTldColonPort, SLASH, Url$1);

  // Note that domains that begin with schemes are treated slighly differently
  const UriPrefix = tt(Scheme, COLON); // e.g., 'mailto:' or 'http://'
  const SlashSchemeColon = tt(SlashScheme, COLON); // e.g., 'http:'
  const SlashSchemeColonSlash = tt(SlashSchemeColon, SLASH); // e.g., 'http:/'

  tt(SlashSchemeColonSlash, SLASH, UriPrefix);

  // Scheme states can transition to domain states
  ta(Scheme, groups.domain, Domain);
  tt(Scheme, DOT, DomainDot);
  tt(Scheme, HYPHEN, DomainHyphen);
  ta(SlashScheme, groups.domain, Domain);
  tt(SlashScheme, DOT, DomainDot);
  tt(SlashScheme, HYPHEN, DomainHyphen);

  // Force URL with scheme prefix followed by anything sane
  ta(UriPrefix, groups.domain, Url$1);
  tt(UriPrefix, SLASH, Url$1);

  // URL, followed by an opening bracket
  const UrlOpenbrace = tt(Url$1, OPENBRACE); // URL followed by {
  const UrlOpenbracket = tt(Url$1, OPENBRACKET); // URL followed by [
  const UrlOpenanglebracket = tt(Url$1, OPENANGLEBRACKET); // URL followed by <
  const UrlOpenparen = tt(Url$1, OPENPAREN); // URL followed by (

  tt(UrlNonaccept, OPENBRACE, UrlOpenbrace);
  tt(UrlNonaccept, OPENBRACKET, UrlOpenbracket);
  tt(UrlNonaccept, OPENANGLEBRACKET, UrlOpenanglebracket);
  tt(UrlNonaccept, OPENPAREN, UrlOpenparen);

  // Closing bracket component. This character WILL be included in the URL
  tt(UrlOpenbrace, CLOSEBRACE, Url$1);
  tt(UrlOpenbracket, CLOSEBRACKET, Url$1);
  tt(UrlOpenanglebracket, CLOSEANGLEBRACKET, Url$1);
  tt(UrlOpenparen, CLOSEPAREN, Url$1);
  tt(UrlOpenbrace, CLOSEBRACE, Url$1);

  // URL that beings with an opening bracket, followed by a symbols.
  // Note that the final state can still be `UrlOpenbrace` (if the URL only
  // has a single opening bracket for some reason).
  const UrlOpenbraceQ = makeState(Url); // URL followed by { and some symbols that the URL can end it
  const UrlOpenbracketQ = makeState(Url); // URL followed by [ and some symbols that the URL can end it
  const UrlOpenanglebracketQ = makeState(Url); // URL followed by < and some symbols that the URL can end it
  const UrlOpenparenQ = makeState(Url); // URL followed by ( and some symbols that the URL can end it
  ta(UrlOpenbrace, qsAccepting, UrlOpenbraceQ);
  ta(UrlOpenbracket, qsAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracket, qsAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparen, qsAccepting, UrlOpenparenQ);
  const UrlOpenbraceSyms = makeState(); // UrlOpenbrace followed by some symbols it cannot end it
  const UrlOpenbracketSyms = makeState(); // UrlOpenbracketQ followed by some symbols it cannot end it
  const UrlOpenanglebracketSyms = makeState(); // UrlOpenanglebracketQ followed by some symbols it cannot end it
  const UrlOpenparenSyms = makeState(); // UrlOpenparenQ followed by some symbols it cannot end it
  ta(UrlOpenbrace, qsNonAccepting);
  ta(UrlOpenbracket, qsNonAccepting);
  ta(UrlOpenanglebracket, qsNonAccepting);
  ta(UrlOpenparen, qsNonAccepting);

  // URL that begins with an opening bracket, followed by some symbols
  ta(UrlOpenbraceQ, qsAccepting, UrlOpenbraceQ);
  ta(UrlOpenbracketQ, qsAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracketQ, qsAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparenQ, qsAccepting, UrlOpenparenQ);
  ta(UrlOpenbraceQ, qsNonAccepting, UrlOpenbraceQ);
  ta(UrlOpenbracketQ, qsNonAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracketQ, qsNonAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparenQ, qsNonAccepting, UrlOpenparenQ);
  ta(UrlOpenbraceSyms, qsAccepting, UrlOpenbraceSyms);
  ta(UrlOpenbracketSyms, qsAccepting, UrlOpenbracketQ);
  ta(UrlOpenanglebracketSyms, qsAccepting, UrlOpenanglebracketQ);
  ta(UrlOpenparenSyms, qsAccepting, UrlOpenparenQ);
  ta(UrlOpenbraceSyms, qsNonAccepting, UrlOpenbraceSyms);
  ta(UrlOpenbracketSyms, qsNonAccepting, UrlOpenbracketSyms);
  ta(UrlOpenanglebracketSyms, qsNonAccepting, UrlOpenanglebracketSyms);
  ta(UrlOpenparenSyms, qsNonAccepting, UrlOpenparenSyms);

  // Close brace/bracket to become regular URL
  tt(UrlOpenbracketQ, CLOSEBRACKET, Url$1);
  tt(UrlOpenanglebracketQ, CLOSEANGLEBRACKET, Url$1);
  tt(UrlOpenparenQ, CLOSEPAREN, Url$1);
  tt(UrlOpenbraceQ, CLOSEBRACE, Url$1);
  tt(UrlOpenbracketSyms, CLOSEBRACKET, Url$1);
  tt(UrlOpenanglebracketSyms, CLOSEANGLEBRACKET, Url$1);
  tt(UrlOpenparenSyms, CLOSEPAREN, Url$1);
  tt(UrlOpenbraceSyms, CLOSEPAREN, Url$1);
  tt(Start, LOCALHOST, DomainDotTld); // localhost is a valid URL state
  tt(Start, NL$1, Nl); // single new line

  return {
    start: Start,
    tokens: tk
  };
}

/**
 * Run the parser state machine on a list of scanned string-based tokens to
 * create a list of multi tokens, each of which represents a URL, email address,
 * plain text, etc.
 *
 * @param {State<MultiToken>} start parser start state
 * @param {string} input the original input used to generate the given tokens
 * @param {Token[]} tokens list of scanned tokens
 * @returns {MultiToken[]}
 */
function run(start, input, tokens) {
  let len = tokens.length;
  let cursor = 0;
  let multis = [];
  let textTokens = [];
  while (cursor < len) {
    let state = start;
    let secondState = null;
    let nextState = null;
    let multiLength = 0;
    let latestAccepting = null;
    let sinceAccepts = -1;
    while (cursor < len && !(secondState = state.go(tokens[cursor].t))) {
      // Starting tokens with nowhere to jump to.
      // Consider these to be just plain text
      textTokens.push(tokens[cursor++]);
    }
    while (cursor < len && (nextState = secondState || state.go(tokens[cursor].t))) {
      // Get the next state
      secondState = null;
      state = nextState;

      // Keep track of the latest accepting state
      if (state.accepts()) {
        sinceAccepts = 0;
        latestAccepting = state;
      } else if (sinceAccepts >= 0) {
        sinceAccepts++;
      }
      cursor++;
      multiLength++;
    }
    if (sinceAccepts < 0) {
      // No accepting state was found, part of a regular text token add
      // the first text token to the text tokens array and try again from
      // the next
      cursor -= multiLength;
      if (cursor < len) {
        textTokens.push(tokens[cursor]);
        cursor++;
      }
    } else {
      // Accepting state!
      // First close off the textTokens (if available)
      if (textTokens.length > 0) {
        multis.push(initMultiToken(Text, input, textTokens));
        textTokens = [];
      }

      // Roll back to the latest accepting state
      cursor -= sinceAccepts;
      multiLength -= sinceAccepts;

      // Create a new multitoken
      const Multi = latestAccepting.t;
      const subtokens = tokens.slice(cursor - multiLength, cursor);
      multis.push(initMultiToken(Multi, input, subtokens));
    }
  }

  // Finally close off the textTokens (if available)
  if (textTokens.length > 0) {
    multis.push(initMultiToken(Text, input, textTokens));
  }
  return multis;
}

/**
 * Utility function for instantiating a new multitoken with all the relevant
 * fields during parsing.
 * @param {new (value: string, tokens: Token[]) => MultiToken} Multi class to instantiate
 * @param {string} input original input string
 * @param {Token[]} tokens consecutive tokens scanned from input string
 * @returns {MultiToken}
 */
function initMultiToken(Multi, input, tokens) {
  const startIdx = tokens[0].s;
  const endIdx = tokens[tokens.length - 1].e;
  const value = input.slice(startIdx, endIdx);
  return new Multi(value, tokens);
}

const warn = typeof console !== 'undefined' && console && console.warn || (() => {});
const warnAdvice = 'until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.';

// Side-effect initialization state
const INIT = {
  scanner: null,
  parser: null,
  tokenQueue: [],
  pluginQueue: [],
  customSchemes: [],
  initialized: false
};

/**
 * @typedef {{
 * 	start: State<string>,
 * 	tokens: { groups: Collections<string> } & typeof tk
 * }} ScannerInit
 */

/**
 * @typedef {{
 * 	start: State<MultiToken>,
 * 	tokens: typeof multi
 * }} ParserInit
 */

/**
 * @typedef {(arg: { scanner: ScannerInit }) => void} TokenPlugin
 */

/**
 * @typedef {(arg: { scanner: ScannerInit, parser: ParserInit }) => void} Plugin
 */

/**
 * De-register all plugins and reset the internal state-machine. Used for
 * testing; not required in practice.
 * @private
 */
function reset() {
  State.groups = {};
  INIT.scanner = null;
  INIT.parser = null;
  INIT.tokenQueue = [];
  INIT.pluginQueue = [];
  INIT.customSchemes = [];
  INIT.initialized = false;
}

/**
 * Detect URLs with the following additional protocol. Anything with format
 * "protocol://..." will be considered a link. If `optionalSlashSlash` is set to
 * `true`, anything with format "protocol:..." will be considered a link.
 * @param {string} protocol
 * @param {boolean} [optionalSlashSlash]
 */
function registerCustomProtocol(scheme, optionalSlashSlash) {
  if (optionalSlashSlash === void 0) {
    optionalSlashSlash = false;
  }
  if (INIT.initialized) {
    warn(`linkifyjs: already initialized - will not register custom scheme "${scheme}" ${warnAdvice}`);
  }
  if (!/^[0-9a-z]+(-[0-9a-z]+)*$/.test(scheme)) {
    throw new Error('linkifyjs: incorrect scheme format.\n 1. Must only contain digits, lowercase ASCII letters or "-"\n 2. Cannot start or end with "-"\n 3. "-" cannot repeat');
  }
  INIT.customSchemes.push([scheme, optionalSlashSlash]);
}

/**
 * Initialize the linkify state machine. Called automatically the first time
 * linkify is called on a string, but may be called manually as well.
 */
function init() {
  // Initialize scanner state machine and plugins
  INIT.scanner = init$2(INIT.customSchemes);
  for (let i = 0; i < INIT.tokenQueue.length; i++) {
    INIT.tokenQueue[i][1]({
      scanner: INIT.scanner
    });
  }

  // Initialize parser state machine and plugins
  INIT.parser = init$1(INIT.scanner.tokens);
  for (let i = 0; i < INIT.pluginQueue.length; i++) {
    INIT.pluginQueue[i][1]({
      scanner: INIT.scanner,
      parser: INIT.parser
    });
  }
  INIT.initialized = true;
}

/**
 * Parse a string into tokens that represent linkable and non-linkable sub-components
 * @param {string} str
 * @return {MultiToken[]} tokens
 */
function tokenize(str) {
  if (!INIT.initialized) {
    init();
  }
  return run(INIT.parser.start, str, run$1(INIT.scanner.start, str));
}

/**
 * Find a list of linkable items in the given string.
 * @param {string} str string to find links in
 * @param {string | Opts} [type] either formatting options or specific type of
 * links to find, e.g., 'url' or 'email'
 * @param {Opts} [opts] formatting options for final output. Cannot be specified
 * if opts already provided in `type` argument
*/
function find(str, type, opts) {
  if (type === void 0) {
    type = null;
  }
  if (opts === void 0) {
    opts = null;
  }
  if (type && typeof type === 'object') {
    if (opts) {
      throw Error(`linkifyjs: Invalid link type ${type}; must be a string`);
    }
    opts = type;
    type = null;
  }
  const options = new Options(opts);
  const tokens = tokenize(str);
  const filtered = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.isLink && (!type || token.t === type)) {
      filtered.push(token.toFormattedObject(options));
    }
  }
  return filtered;
}

/**
 * Is the given string valid linkable text of some sort. Note that this does not
 * trim the text for you.
 *
 * Optionally pass in a second `type` param, which is the type of link to test
 * for.
 *
 * For example,
 *
 *     linkify.test(str, 'email');
 *
 * Returns `true` if str is a valid email.
 * @param {string} str string to test for links
 * @param {string} [type] optional specific link type to look for
 * @returns boolean true/false
 */
function test(str, type) {
  if (type === void 0) {
    type = null;
  }
  const tokens = tokenize(str);
  return tokens.length === 1 && tokens[0].isLink && (!type || tokens[0].t === type);
}

function autolink(options) {
    return new Plugin({
        key: new PluginKey('autolink'),
        appendTransaction: function (transactions, oldState, newState) {
            var docChanges = transactions.some(function (transaction) { return transaction.docChanged; }) &&
                !oldState.doc.eq(newState.doc);
            var preventAutolink = transactions.some(function (transaction) {
                return transaction.getMeta('preventAutolink');
            });
            if (!docChanges || preventAutolink) {
                return;
            }
            var tr = newState.tr;
            var transform = combineTransactionSteps(oldState.doc, __spreadArray([], transactions, true));
            var mapping = transform.mapping;
            var changes = getChangedRanges(transform);
            changes.forEach(function (_a) {
                var oldRange = _a.oldRange, newRange = _a.newRange;
                // at first we check if we have to remove links
                getMarksBetween(oldRange.from, oldRange.to, oldState.doc)
                    .filter(function (item) { return item.mark.type === options.type; })
                    .forEach(function (oldMark) {
                    var newFrom = mapping.map(oldMark.from);
                    var newTo = mapping.map(oldMark.to);
                    var newMarks = getMarksBetween(newFrom, newTo, newState.doc).filter(function (item) { return item.mark.type === options.type; });
                    if (!newMarks.length) {
                        return;
                    }
                    var newMark = newMarks[0];
                    var oldLinkText = oldState.doc.textBetween(oldMark.from, oldMark.to, undefined, ' ');
                    var newLinkText = newState.doc.textBetween(newMark.from, newMark.to, undefined, ' ');
                    var wasLink = test(oldLinkText);
                    var isLink = test(newLinkText);
                    // remove only the link, if it was a link before too
                    // because we don’t want to remove links that were set manually
                    if (wasLink && !isLink) {
                        tr.removeMark(newMark.from, newMark.to, options.type);
                    }
                });
                // now let’s see if we can add new links
                var nodesInChangedRanges = findChildrenInRange(newState.doc, newRange, function (node) { return node.isTextblock; });
                var textBlock;
                var textBeforeWhitespace;
                if (nodesInChangedRanges.length > 1) {
                    // Grab the first node within the changed ranges (ex. the first of two paragraphs when hitting enter)
                    textBlock = nodesInChangedRanges[0];
                    textBeforeWhitespace = newState.doc.textBetween(textBlock.pos, textBlock.pos + textBlock.node.nodeSize, undefined, ' ');
                }
                else if (nodesInChangedRanges.length &&
                    // We want to make sure to include the block seperator argument to treat hard breaks like spaces
                    newState.doc
                        .textBetween(newRange.from, newRange.to, ' ', ' ')
                        .endsWith(' ')) {
                    textBlock = nodesInChangedRanges[0];
                    textBeforeWhitespace = newState.doc.textBetween(textBlock.pos, newRange.to, undefined, ' ');
                }
                if (textBlock && textBeforeWhitespace) {
                    var wordsBeforeWhitespace = textBeforeWhitespace
                        .split(' ')
                        .filter(function (s) { return s !== ''; });
                    if (wordsBeforeWhitespace.length <= 0) {
                        return false;
                    }
                    var lastWordBeforeSpace = wordsBeforeWhitespace[wordsBeforeWhitespace.length - 1];
                    var lastWordAndBlockOffset_1 = textBlock.pos +
                        textBeforeWhitespace.lastIndexOf(lastWordBeforeSpace);
                    if (!lastWordBeforeSpace) {
                        return false;
                    }
                    find(lastWordBeforeSpace)
                        .filter(function (link) { return link.isLink; })
                        .filter(function (link) {
                        if (options.validate) {
                            return options.validate(link.value);
                        }
                        return true;
                    })
                        // calculate link position
                        .map(function (link) { return (__assign(__assign({}, link), { from: lastWordAndBlockOffset_1 + link.start + 1, to: lastWordAndBlockOffset_1 + link.end + 1 })); })
                        // add link mark
                        .forEach(function (link) {
                        tr.addMark(link.from, link.to, options.type.create({
                            href: link.href,
                        }));
                    });
                }
            });
            if (!tr.steps.length) {
                return;
            }
            return tr;
        },
    });
}

function clickHandler(options) {
    return new Plugin({
        key: new PluginKey('handleClickLink'),
        props: {
            handleClick: function (view, pos, event) {
                var _a, _b, _c;
                if (event.button !== 1) {
                    return false;
                }
                var attrs = getAttributes(view.state, options.type.name);
                var link = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('a');
                var href = (_b = link === null || link === void 0 ? void 0 : link.href) !== null && _b !== void 0 ? _b : attrs.href;
                var target = (_c = link === null || link === void 0 ? void 0 : link.target) !== null && _c !== void 0 ? _c : attrs.target;
                if (link && href) {
                    window.open(href, target);
                    return true;
                }
                return false;
            },
        },
    });
}

function pasteHandler(options) {
    return new Plugin({
        key: new PluginKey('handlePasteLink'),
        props: {
            handlePaste: function (view, event, slice) {
                var state = view.state;
                var selection = state.selection;
                var empty = selection.empty;
                if (empty) {
                    return false;
                }
                var textContent = '';
                slice.content.forEach(function (node) {
                    textContent += node.textContent;
                });
                var link = find(textContent).find(function (item) { return item.isLink && item.value === textContent; });
                if (!textContent || !link) {
                    return false;
                }
                options.editor.commands.setMark(options.type, {
                    href: link.href,
                });
                return true;
            },
        },
    });
}

var Link = Mark.create({
    name: 'link',
    keepOnSplit: false,
    onCreate: function () {
        this.options.protocols.forEach(function (protocol) {
            if (typeof protocol === 'string') {
                registerCustomProtocol(protocol);
                return;
            }
            registerCustomProtocol(protocol.scheme, protocol.optionalSlashes);
        });
    },
    onDestroy: function () {
        reset();
    },
    inclusive: function () {
        return this.options.autolink;
    },
    addOptions: function () {
        return {
            openOnClick: true,
            linkOnPaste: true,
            autolink: true,
            protocols: [],
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
                class: null,
            },
            validate: undefined,
        };
    },
    addAttributes: function () {
        return {
            href: {
                default: null,
            },
            target: {
                default: this.options.HTMLAttributes.target,
            },
            class: {
                default: this.options.HTMLAttributes.class,
            },
        };
    },
    parseHTML: function () {
        return [
            {
                tag: 'a[href]:not([href *= "javascript:" i]):not([class="mention"])',
            },
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return [
            'a',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0,
        ];
    },
    addCommands: function () {
        var _this = this;
        return {
            setLink: function (attributes) {
                return function (_a) {
                    var chain = _a.chain;
                    return chain()
                        .setMark(_this.name, attributes)
                        .setMeta('preventAutolink', true)
                        .run();
                };
            },
            toggleLink: function (attributes) {
                return function (_a) {
                    var chain = _a.chain;
                    return chain()
                        .toggleMark(_this.name, attributes, { extendEmptyMarkRange: true })
                        .setMeta('preventAutolink', true)
                        .run();
                };
            },
            unsetLink: function () {
                return function (_a) {
                    var chain = _a.chain;
                    return chain()
                        .unsetMark(_this.name, { extendEmptyMarkRange: true })
                        .setMeta('preventAutolink', true)
                        .run();
                };
            },
        };
    },
    addPasteRules: function () {
        var _this = this;
        return [
            markPasteRule({
                find: function (text) {
                    return find(text)
                        .filter(function (link) {
                        if (_this.options.validate) {
                            return _this.options.validate(link.value);
                        }
                        return true;
                    })
                        .filter(function (link) { return link.isLink; })
                        .map(function (link) { return ({
                        text: link.value,
                        index: link.start,
                        data: link,
                    }); });
                },
                type: this.type,
                getAttributes: function (match) {
                    var _a;
                    return ({
                        href: (_a = match.data) === null || _a === void 0 ? void 0 : _a.href,
                    });
                },
            }),
        ];
    },
    addProseMirrorPlugins: function () {
        var plugins = [];
        if (this.options.autolink) {
            plugins.push(autolink({
                type: this.type,
                validate: this.options.validate,
            }));
        }
        if (this.options.openOnClick) {
            plugins.push(clickHandler({
                type: this.type,
            }));
        }
        if (this.options.linkOnPaste) {
            plugins.push(pasteHandler({
                editor: this.editor,
                type: this.type,
            }));
        }
        return plugins;
    },
});

var MentionPluginKey = new PluginKey('mention');
var Mention = Node.create({
    name: 'mention',
    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,
    addOptions: function () {
        var _this = this;
        return {
            suggestion: {
                char: '@',
                allowedPrefixes: null,
                pluginKey: MentionPluginKey,
                command: function (_a) {
                    var _b, _c, _d;
                    var editor = _a.editor, range = _a.range, props = _a.props;
                    var _e = editor.view.state.selection, $from = _e.$from, $to = _e.$to;
                    var isNewLine = $from.parentOffset === 1;
                    var nodeBefore = $to.nodeBefore;
                    var nodeAfter = $to.nodeAfter;
                    var hasBeforeSpace = (_b = nodeBefore === null || nodeBefore === void 0 ? void 0 : nodeBefore.text) === null || _b === void 0 ? void 0 : _b.startsWith(' ');
                    var hasAfterSpace = (_c = nodeAfter === null || nodeAfter === void 0 ? void 0 : nodeAfter.text) === null || _c === void 0 ? void 0 : _c.startsWith(' ');
                    var insertContent = [];
                    if (!isNewLine && !hasBeforeSpace) {
                        insertContent.push({
                            type: 'text',
                            text: ' ',
                        });
                    }
                    insertContent.push({
                        type: _this.name,
                        attrs: props,
                    });
                    if (!hasAfterSpace) {
                        insertContent.push({
                            type: 'text',
                            text: ' ',
                        });
                    }
                    editor.chain().focus().insertContentAt(range, insertContent).run();
                    (_d = window.getSelection()) === null || _d === void 0 ? void 0 : _d.collapseToEnd();
                },
                allow: function (_a) {
                    var state = _a.state, range = _a.range;
                    var $from = state.doc.resolve(range.from);
                    var type = state.schema.nodes[_this.name];
                    var allow = !!$from.parent.type.contentMatch.matchType(type);
                    return allow;
                },
            },
        };
    },
    addAttributes: function () {
        return {
            id: {
                default: null,
                parseHTML: function (element) { return element.getAttribute('data-id'); },
            },
            userName: {
                default: null,
                parseHTML: function (element) { return element.getAttribute('data-user-name'); },
            },
            displayName: {
                default: null,
                parseHTML: function (element) { return element.getAttribute('data-display-name'); },
            },
        };
    },
    parseHTML: function () {
        return [
            {
                tag: 'a[class="mention"]',
            },
        ];
    },
    renderHTML: function (_a) {
        var _b;
        var node = _a.node;
        return [
            'a',
            {
                class: 'mention',
                href: '/' + this.options.suggestion.char + node.attrs.userName,
                'data-id': node.attrs.id,
                'data-user-name': node.attrs.userName,
                'data-display-name': node.attrs.displayName,
                ref: 'noopener noreferrer nofollow',
            },
            ['span', "@".concat((_b = node.attrs.displayName) !== null && _b !== void 0 ? _b : node.attrs.userName)],
        ];
    },
    addKeyboardShortcuts: function () {
        var _this = this;
        return {
            Backspace: function () {
                return _this.editor.commands.command(function (_a) {
                    var tr = _a.tr, state = _a.state;
                    var isMention = false;
                    var selection = state.selection;
                    var empty = selection.empty, anchor = selection.anchor;
                    if (!empty) {
                        return false;
                    }
                    state.doc.nodesBetween(anchor - 1, anchor, function (node, pos) {
                        if (node.type.name === _this.name) {
                            isMention = true;
                            tr.insertText(_this.options.suggestion.char || '', pos, pos + node.nodeSize);
                            return false;
                        }
                    });
                    return isMention;
                });
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            Suggestion(__assign({ editor: this.editor }, this.options.suggestion)),
        ];
    },
});

var italicStarInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/;
var italicStarPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g;
var italicUnderscoreInputRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/;
var italicUnderscorePasteRegex = /(?:^|\s)((?:_)((?:[^_]+))(?:_))/g;
var boldStarInputRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/;
var boldStarPasteRegex = /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g;
var boldUnderscoreInputRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/;
var boldUnderscorePasteRegex = /(?:^|\s)((?:__)((?:[^__]+))(?:__))/g;
var Bold = Mark.create({
    name: 'bold',
    addOptions: function () {
        return {
            HTMLAttributes: {},
        };
    },
    parseHTML: function () {
        return [
            // bold
            {
                tag: 'strong',
            },
            {
                tag: 'b',
                getAttrs: function (node) {
                    return node.style.fontWeight !== 'normal' && null;
                },
            },
            {
                style: 'font-weight',
                getAttrs: function (value) {
                    return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null;
                },
            },
            // italic
            {
                tag: 'em',
            },
            {
                tag: 'i',
                getAttrs: function (node) {
                    return node.style.fontStyle !== 'normal' && null;
                },
            },
            {
                style: 'font-style=italic',
            },
            // underline
            {
                tag: 'u',
            },
            {
                style: 'text-decoration',
                consuming: false,
                getAttrs: function (style) {
                    return style.includes('underline') ? {} : false;
                },
            },
        ];
    },
    renderHTML: function (_a) {
        var HTMLAttributes = _a.HTMLAttributes;
        return [
            'strong',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            0,
        ];
    },
    addCommands: function () {
        var _this = this;
        return {
            setBold: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.setMark(_this.name);
                };
            },
            toggleBold: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.toggleMark(_this.name);
                };
            },
            unsetBold: function () {
                return function (_a) {
                    var commands = _a.commands;
                    return commands.unsetMark(_this.name);
                };
            },
        };
    },
    addKeyboardShortcuts: function () {
        var _this = this;
        return {
            // bold
            'Mod-b': function () { return _this.editor.commands.toggleBold(); },
            'Mod-B': function () { return _this.editor.commands.toggleBold(); },
            // italic
            'Mod-i': function () { return _this.editor.commands.toggleBold(); },
            'Mod-I': function () { return _this.editor.commands.toggleBold(); },
            // underline
            'Mod-u': function () { return _this.editor.commands.toggleBold(); },
            'Mod-U': function () { return _this.editor.commands.toggleBold(); },
        };
    },
    addInputRules: function () {
        return [
            // bold
            markInputRule({
                find: boldStarInputRegex,
                type: this.type,
            }),
            markInputRule({
                find: boldUnderscoreInputRegex,
                type: this.type,
            }),
            // italic
            markInputRule({
                find: italicStarInputRegex,
                type: this.type,
            }),
            markInputRule({
                find: italicUnderscoreInputRegex,
                type: this.type,
            }),
            // underline
        ];
    },
    addPasteRules: function () {
        return [
            // bold
            markPasteRule({
                find: boldStarPasteRegex,
                type: this.type,
            }),
            markPasteRule({
                find: boldUnderscorePasteRegex,
                type: this.type,
            }),
            // italic
            markPasteRule({
                find: italicStarPasteRegex,
                type: this.type,
            }),
            markPasteRule({
                find: italicUnderscorePasteRegex,
                type: this.type,
            }),
            // underline
        ];
    },
});

var makeArticleEditorExtensions = function (_a) {
    var placeholder = _a.placeholder, mentionSuggestion = _a.mentionSuggestion;
    return [
        Document,
        History,
        Gapcursor,
        Placeholder.configure({
            placeholder: placeholder,
        }),
        // Basic Formats
        Text$1,
        Paragraph,
        Heading.configure({
            levels: [2, 3],
        }),
        Bold,
        Strike,
        Code,
        CodeBlock,
        Blockquote,
        HardBreak,
        HorizontalRule,
        OrderedList,
        ListItem,
        BulletList,
        // Custom Formats
        Link,
        FigureImage,
        FigureAudio,
        FigureEmbed,
        Mention.configure({
            suggestion: mentionSuggestion,
        }),
    ];
};
var makeCommentEditorExtensions = function (_a) {
    var placeholder = _a.placeholder, mentionSuggestion = _a.mentionSuggestion;
    return [
        Document,
        History,
        Placeholder.configure({
            placeholder: placeholder,
        }),
        // Basic Formats
        Text$1,
        Paragraph,
        Bold,
        Strike,
        Code,
        CodeBlock,
        Blockquote,
        HardBreak,
        HorizontalRule,
        ListItem,
        OrderedList,
        BulletList,
        // Custom Formats
        Link,
        Mention.configure({
            suggestion: mentionSuggestion,
        }),
    ];
};

var useArticleEdtor = function (_a) {
    var content = _a.content, placeholder = _a.placeholder, mentionSuggestion = _a.mentionSuggestion, editorProps = __rest(_a, ["content", "placeholder", "mentionSuggestion"]);
    var extensions = editorProps.extensions, restProps = __rest(editorProps, ["extensions"]);
    var editor = useEditor(__assign({ extensions: __spreadArray(__spreadArray([], makeArticleEditorExtensions({ placeholder: placeholder, mentionSuggestion: mentionSuggestion }), true), (extensions || []), true), content: content }, restProps));
    return editor;
};

var useCommentEditor = function (_a) {
    var content = _a.content, placeholder = _a.placeholder, mentionSuggestion = _a.mentionSuggestion, editorProps = __rest(_a, ["content", "placeholder", "mentionSuggestion"]);
    var extensions = editorProps.extensions, restProps = __rest(editorProps, ["extensions"]);
    var editor = useEditor(__assign({ extensions: __spreadArray(__spreadArray([], makeCommentEditorExtensions({ placeholder: placeholder, mentionSuggestion: mentionSuggestion }), true), (extensions || []), true), content: content }, restProps));
    return editor;
};

export { useArticleEdtor, useCommentEditor };
