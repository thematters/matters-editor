"use strict";var t=require("@tiptap/react"),e=require("@tiptap/extension-blockquote"),n=require("@tiptap/extension-bullet-list"),r=require("@tiptap/extension-code"),i=require("@tiptap/extension-code-block"),o=require("@tiptap/extension-document"),a=require("@tiptap/extension-gapcursor"),s=require("@tiptap/extension-hard-break"),u=require("@tiptap/extension-heading"),l=require("@tiptap/extension-history"),c=require("@tiptap/extension-horizontal-rule"),d=require("@tiptap/extension-list-item"),p=require("@tiptap/extension-ordered-list"),f=require("@tiptap/extension-paragraph"),g=require("@tiptap/extension-placeholder"),m=require("@tiptap/extension-strike"),h=require("@tiptap/extension-text"),_=require("@tiptap/core"),y=require("@tiptap/pm/state"),v=require("@tiptap/suggestion"),b=function(){return b=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var i in e=arguments[n])Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t},b.apply(this,arguments)};function k(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]])}return n}var w=_.Node.create({name:"figureAudio",group:"block",content:"inline*",draggable:!0,isolating:!0,addAttributes:function(){return{src:{default:null,parseHTML:function(t){var e;return null===(e=t.querySelector("source"))||void 0===e?void 0:e.getAttribute("src")}},title:{default:"",parseHTML:function(t){var e;return null===(e=t.querySelector(".title"))||void 0===e?void 0:e.textContent}},duration:{default:"00:00",parseHTML:function(t){var e,n=t.querySelector(".duration");return null===(e=null==n?void 0:n.dataset)||void 0===e?void 0:e.time}}}},parseHTML:function(){return[{tag:'figure[class="audio"]',contentElement:"figcaption"}]},renderHTML:function(t){var e=t.HTMLAttributes;return["figure",{class:"audio"},["audio",{controls:!0},["source",{src:e.src,type:"audio/mp3",draggable:!1,contenteditable:!1}]],["div",{class:"player"},["header",["div",{class:"meta"},["h4",{class:"title"},e.title],["div",{class:"time"},["span",{class:"current","data-time":"00:00"}],["span",{class:"duration","data-time":e.duration}]]],["span",{class:"play"}]],["footer",["div",{class:"progress-bar"},["span",{}]]]],["figcaption",0]]},addCommands:function(){var t=this;return{setFigureAudio:function(e){var n=e.caption,r=k(e,["caption"]);return function(e){return(0,e.chain)().insertContent({type:t.name,attrs:r,content:n?[{type:"text",text:n}]:[]}).command((function(t){var e=t.tr,n=t.commands,r=e.doc,i=e.selection,o=r.resolve(i.to-2).end();return n.setTextSelection(o)})).run()}}}},addProseMirrorPlugins:function(){return[new y.Plugin({key:new y.PluginKey("removePastedFigureAudio"),props:{transformPastedHTML:function(t){return t=t.replace(/<figure.*class=.audio.*[\n]*.*?<\/figure>/g,"")}}})]}}),x=_.Node.create({name:"figureEmbed",group:"block",content:"inline*",draggable:!0,isolating:!0,addAttributes:function(){return{class:{default:null,parseHTML:function(t){return t.getAttribute("class")}},src:{default:null,parseHTML:function(t){var e;return null===(e=t.querySelector("iframe"))||void 0===e?void 0:e.getAttribute("src")}}}},parseHTML:function(){return[{tag:'figure[class^="embed"]',contentElement:"figcaption"}]},renderHTML:function(t){var e=function(t){var e,n={url:"",allowfullscreen:!1,sandbox:[]};try{e=new URL(t)}catch(t){return n}var r=e.hostname,i=e.pathname,o=e.searchParams;if(["youtube.com","youtu.be","www.youtu.be","www.youtube.com"].includes(r)){var a=o.get("v"),s=o.get("t"),u=new URLSearchParams(b({rel:"0"},s?{start:s}:{})).toString(),l="";return a?l=a:i.match("/embed/")?l=i.split("/embed/")[1]:r.includes("youtu.be")&&(l=i.split("/")[1]),{url:"https://www.youtube.com/embed/".concat(l)+(u?"?=".concat(u):""),provider:"youtube",allowfullscreen:!0,sandbox:[]}}if(["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(r))return l=i.replace(/\/$/,"").split("/").slice(-1)[0],{url:"https://player.vimeo.com/video/".concat(l),provider:"vimeo",allowfullscreen:!0,sandbox:[]};if(["bilibili.com","player.bilibili.com","www.bilibili.com"].includes(r)){return l="",l=o.get("bvid")||i.replace(/\/$/,"").split("/").slice(-1)[0],{url:"https://player.bilibili.com/player.html?bvid=".concat(l),provider:"bilibili",allowfullscreen:!0,sandbox:[]}}if(["instagram.com","www.instagram.com"].includes(r))return l=i.replace("/embed","").replace(/\/$/,"").split("/").slice(-1)[0],{url:"https://www.instagram.com/p/".concat(l,"/embed"),provider:"instagram",allowfullscreen:!1,sandbox:[]};if(["jsfiddle.net","www.jsfiddle.net"].includes(r)){var c=i.replace("/embedded","").replace(/\/$/,"").split("/").filter(Boolean);return l=1===c.length?c[0]:c[1],{url:"https://jsfiddle.net/".concat(l,"/embedded/"),provider:"jsfiddle",allowfullscreen:!1,sandbox:[]}}if(["codepen.io","www.codepen.io"].includes(r)){var d=i.split("/")[1];return l=i.replace(/\/$/,"").split("/").slice(-1)[0],{url:"https://codepen.io/".concat(d,"/embed/preview/").concat(l),provider:"codepen",allowfullscreen:!1,sandbox:[]}}return n}(t.HTMLAttributes.src),n=e.url,r=e.provider,i=e.allowfullscreen,o=e.sandbox;return["figure",b({class:"embed"},r?{"data-provider":r}:{}),["div",{class:"iframe-container"},["iframe",b(b(b({src:n,loading:"lazy"},o&&o.length>0?{sandbox:o.join(" ")}:{}),i?{allowfullscreen:!0}:{}),{frameborder:"0",draggable:!1,contenteditable:!1})]],["figcaption",0]]},addCommands:function(){var t=this;return{setFigureEmbed:function(e){var n=e.caption,r=k(e,["caption"]);return function(e){return(0,e.chain)().insertContent({type:t.name,attrs:r,content:n?[{type:"text",text:n}]:[]}).command((function(t){var e=t.tr,n=t.commands,r=e.doc,i=e.selection,o=r.resolve(i.to-2).end();return n.setTextSelection(o)})).run()}}}},addProseMirrorPlugins:function(){return[new y.Plugin({key:new y.PluginKey("removePastedFigureEmbed"),props:{transformPastedHTML:function(t){return t=t.replace(/<figure.*class=.embed.*[\n]*.*?<\/figure>/g,"")}}})]}}),E=_.Node.create({name:"figureImage",group:"block",content:"inline*",draggable:!0,isolating:!0,addAttributes:function(){return{class:{default:null,parseHTML:function(t){return t.getAttribute("class")}},src:{default:null,parseHTML:function(t){var e;return null===(e=t.querySelector("img"))||void 0===e?void 0:e.getAttribute("src")}}}},parseHTML:function(){return[{tag:'figure[class="image"]',contentElement:"figcaption"}]},renderHTML:function(t){return["figure",{class:"image"},["img",{src:t.HTMLAttributes.src,draggable:!1,contenteditable:!1}],["figcaption",0]]},addCommands:function(){var t=this;return{setFigureImage:function(e){var n=e.caption,r=k(e,["caption"]);return function(e){return(0,e.chain)().insertContent({type:t.name,attrs:r,content:n?[{type:"text",text:n}]:[]}).command((function(t){var e=t.tr,n=t.commands,r=e.doc,i=e.selection,o=r.resolve(i.to-2).end();return n.setTextSelection(o)})).run()}}}},addProseMirrorPlugins:function(){return[new y.Plugin({key:new y.PluginKey("removePastedFigureImage"),props:{transformPastedHTML:function(t){return t=t.replace(/<figure.*class=.image.*[\n]*.*?<\/figure>/g,"")}}})]}});const A="aaa1rp3barth4b_ott3vie4c1le2ogado5udhabi7c_ademy5centure6ountant_s9o1tor4d_s1ult4e_g1ro2tna4f_l1rica5g_akhan5ency5i_g1rbus3force5tel5kdn3l_faromeo7ibaba4pay4lfinanz6state5y2sace3tom5m_azon4ericanexpress7family11x2fam3ica3sterdam8nalytics7droid5quan4z2o_l2partments8p_le4q_uarelle8r_ab1mco4chi3my2pa2t_e3s_da2ia2sociates9t_hleta5torney7u_ction5di_ble3o3spost5thor3o_s4vianca6w_s2x_a2z_ure5ba_by2idu3namex3narepublic11d1k2r_celona5laycard4s5efoot5gains6seball5ketball8uhaus5yern5b_c1t1va3cg1n2d1e_ats2uty4er2ntley5rlin4st_buy5t2f1g1h_arti5i_ble3d1ke2ng_o3o1z2j1lack_friday9ockbuster8g1omberg7ue3m_s1w2n_pparibas9o_ats3ehringer8fa2m1nd2o_k_ing5sch2tik2on4t1utique6x2r_adesco6idgestone9oadway5ker3ther5ussels7s1t1uild_ers6siness6y1zz3v1w1y1z_h3ca_b1fe2l_l1vinklein9m_era3p2non3petown5ital_one8r_avan4ds2e_er_s4s2sa1e1h1ino4t_ering5holic7ba1n1re2s2c1d1enter4o1rn3f_a1d2g1h_anel2nel4rity4se2t2eap3intai5ristmas6ome4urch5i_priani6rcle4sco3tadel4i_c2y_eats7k1l_aims4eaning6ick2nic1que6othing5ud3ub_med6m1n1o_ach3des3ffee4llege4ogne5m_cast4mbank4unity6pany2re3uter5sec4ndos3struction8ulting7tact3ractors9oking_channel11l1p2rsica5untry4pon_s4rses6pa2r_edit_card4union9icket5own3s1uise_s6u_isinella9v1w1x1y_mru3ou3z2dabur3d1nce3ta1e1ing3sun4y2clk3ds2e_al_er2s3gree4livery5l1oitte5ta3mocrat6ntal2ist5si_gn4v2hl2iamonds6et2gital5rect_ory7scount3ver5h2y2j1k1m1np2o_cs1tor4g1mains5t1wnload7rive4tv2ubai3nlop4pont4rban5vag2r2z2earth3t2c_o2deka3u_cation8e1g1mail3erck5nergy4gineer_ing9terprises10pson4quipment8r_icsson6ni3s_q1tate5t_isalat7u_rovision8s2vents5xchange6pert3osed4ress5traspace10fage2il1rwinds6th3mily4n_s2rm_ers5shion4t3edex3edback6rrari3ero6i_at2delity5o2lm2nal1nce1ial7re_stone6mdale6sh_ing5t_ness6j1k1lickr3ghts4r2orist4wers5y2m1o_o_d_network8tball6rd1ex2sale4um3undation8x2r_ee1senius7l1ogans4ntdoor4ier7tr2ujitsu5n_d2rniture7tbol5yi3ga_l_lery3o1up4me_s3p1rden4y2b_iz3d_n2e_a1nt_ing5orge5f1g_ee3h1i_ft_s3ves2ing5l_ass3e1obal2o4m_ail3bh2o1x2n1odaddy5ld_point6f2o_dyear5g_le4p1t1v2p1q1r_ainger5phics5tis4een3ipe3ocery4up4s1t1u_ardian6cci3ge2ide2tars5ru3w1y2hair2mburg5ngout5us3bo2dfc_bank7ealth_care8lp1sinki6re1mes5gtv3iphop4samitsu7tachi5v2k_t2m1n1ockey4ldings5iday5medepot5goods5s_ense7nda3rse3spital5t_ing5t_eles2s3mail5use3w2r1sbc3t1u_ghes5yatt3undai7ibm2cbc2e1u2d1e_ee3fm2kano4l1m_amat4db2mo_bilien9n_c1dustries8finiti5o2g1k1stitute6urance4e4t_ernational10uit4vestments10o1piranga7q1r_ish4s_maili5t_anbul7t_au2v3jaguar4va3cb2e_ep2tzt3welry6io2ll2m_p2nj2o_bs1urg4t1y2p_morgan6rs3uegos4niper7kaufen5ddi3e_rryhotels6logistics9properties14fh2g1h1i_a1ds2m1nder2le4tchen5wi3m1n1oeln3matsu5sher5p_mg2n2r_d1ed3uokgroup8w1y_oto4z2la_caixa5mborghini8er3ncaster5ia3d_rover6xess5salle5t_ino3robe5w_yer5b1c1ds2ease3clerc5frak4gal2o2xus4gbt3i_dl2fe_insurance9style7ghting6ke2lly3mited4o2ncoln4de2k2psy3ve1ing5k1lc1p2oan_s3cker3us3l1ndon4tte1o3ve3pl_financial11r1s1t_d_a3u_ndbeck6xe1ury5v1y2ma_cys3drid4if1son4keup4n_agement7go3p1rket_ing3s4riott5shalls7serati6ttel5ba2c_kinsey7d1e_d_ia3et2lbourne7me1orial6n_u2rckmsd7g1h1iami3crosoft7l1ni1t2t_subishi9k1l_b1s2m_a2n1o_bi_le4da2e1i1m1nash3ey2ster5rmon3tgage6scow4to_rcycles9v_ie4p1q1r1s_d2t_n1r2u_seum3ic3tual5v1w1x1y1z2na_b1goya4me2tura4vy3ba2c1e_c1t_bank4flix4work5ustar5w_s2xt_direct7us4f_l2g_o2hk2i_co2ke1on3nja3ssan1y5l1o_kia3rthwesternmutual14on4w_ruz3tv4p1r_a1w2tt2u1yc2z2obi1server7ffice5kinawa6layan_group9dnavy5lo3m_ega4ne1g1l_ine5oo2pen3racle3nge4g_anic5igins6saka4tsuka4t2vh3pa_ge2nasonic7ris2s1tners4s1y3ssagens7y2ccw3e_t2f_izer5g1h_armacy6d1ilips5one2to_graphy6s4ysio5ics1tet2ures6d1n_g1k2oneer5zza4k1l_ace2y_station9umbing5s3m1n_c2ohl2ker3litie5rn2st3r_america6xi3ess3ime3o_d_uctions8f1gressive8mo2perties3y5tection8u_dential9s1t1ub2w_c2y2qa1pon3uebec3st5racing4dio4e_ad1lestate6tor2y4cipes5d_stone5umbrella9hab3ise_n3t2liance6n_t_als5pair3ort3ublican8st_aurant8view_s5xroth6ich_ardli6oh3l1o1p2o_cher3ks3deo3gers4om3s_vp3u_gby3hr2n2w_e2yukyu6sa_arland6fe_ty4kura4le1on3msclub4ung5ndvik_coromant12ofi4p1rl2s1ve2xo3b_i1s2c_a1b1haeffler7midt4olarships8ol3ule3warz5ience5ot3d1e_arch3t2cure1ity6ek2lect4ner3rvices6ven3w1x_y3fr2g1h_angrila6rp2w2ell3ia1ksha5oes2p_ping5uji3w_time7i_lk2na1gles5te3j1k_i_n2y_pe4l_ing4m_art3ile4n_cf3o_ccer3ial4ftbank4ware6hu2lar2utions7ng1y2y2pa_ce3ort2t3r_l2s1t_ada2ples4r1tebank4farm7c_group6ockholm6rage3e3ream4udio2y3yle4u_cks3pplies3y2ort5rf1gery5zuki5v1watch4iss4x1y_dney4stems6z2tab1ipei4lk2obao4rget4tamotors6r2too4x_i3c_i2d_k2eam2ch_nology8l1masek5nnis4va3f1g1h_d1eater2re6iaa2ckets5enda4ffany5ps2res2ol4j_maxx4x2k_maxx5l1m_all4n1o_day3kyo3ols3p1ray3shiba5tal3urs3wn2yota3s3r_ade1ing4ining5vel_channel7ers_insurance16ust3v2t1ube2i1nes3shu4v_s2w1z2ua1bank3s2g1k1nicom3versity8o2ol2ps2s1y1z2va_cations7na1guard7c1e_gas3ntures6risign5mögensberater2ung14sicherung10t2g1i_ajes4deo3g1king4llas4n1p1rgin4sa1ion4va1o3laanderen9n1odka3lkswagen7vo3te1ing3o2yage5u_elos6wales2mart4ter4ng_gou5tch_es6eather_channel12bcam3er2site5d_ding5ibo2r3f1hoswho6ien2ki2lliamhill9n_dows4e1ners6me2olterskluwer11odside6rk_s2ld3w2s1tc1f3xbox3erox4finity6ihuan4n2xx2yz3yachts4hoo3maxun5ndex5e1odobashi7ga2kohama6u_tube6t1un3za_ppos4ra3ero3ip2m1one3uerich6w2",L="ελ1υ2бг1ел3дети4ею2католик6ом3мкд2он1сква6онлайн5рг3рус2ф2сайт3рб3укр3қаз3հայ3ישראל5קום3ابوظبي5تصالات6رامكو5لاردن4بحرين5جزائر5سعودية6عليان5مغرب5مارات5یران5بارت2زار4يتك3ھارت5تونس4سودان3رية5شبكة4عراق2ب2مان4فلسطين6قطر3كاثوليك6وم3مصر2ليسيا5وريتانيا7قع4همراه5پاکستان7ڀارت4कॉम3नेट3भारत_म्3ोत5संगठन5বাংলা5ভারত2ৰত4ਭਾਰਤ4ભારત4ଭାରତ4இந்தியா6லங்கை6சிங்கப்பூர்11భారత్5ಭಾರತ4ഭാരതം5ලංකා4คอม3ไทย3ລາວ3გე2みんな3アマゾン4クラウド4グーグル4コム2ストア3セール3ファッション6ポイント4世界2中信1国1國1文网3亚马逊3企业2佛山2信息2健康2八卦2公司1益2台湾1灣2商城1店1标2嘉里_大酒店5在线2大拿2天主教3娱乐2家電2广东2微博2慈善2我爱你3手机2招聘2政务1府2新加坡2闻2时尚2書籍2机构2淡马锡3游戏2澳門2点看2移动2组织机构4网址1店1站1络2联通2谷歌2购物2通販2集团2電訊盈科4飞利浦3食品2餐厅2香格里拉3港2닷넷1컴2삼성2한국2",S=(t,e)=>{for(const n in e)t[n]=e[n];return t},M="numeric",P="ascii",O="alpha",T="asciinumeric",C="alphanumeric",j="domain",H="emoji",R="scheme",N="slashscheme",z="whitespace";function q(t,e){return t in e||(e[t]=[]),e[t]}function B(t,e,n){e[M]&&(e[T]=!0,e[C]=!0),e[P]&&(e[T]=!0,e[O]=!0),e[T]&&(e[C]=!0),e[O]&&(e[C]=!0),e[C]&&(e[j]=!0),e[H]&&(e[j]=!0);for(const r in e){const e=q(r,n);e.indexOf(t)<0&&e.push(t)}}function I(t){void 0===t&&(t=null),this.j={},this.jr=[],this.jd=null,this.t=t}I.groups={},I.prototype={accepts(){return!!this.t},go(t){const e=this,n=e.j[t];if(n)return n;for(let n=0;n<e.jr.length;n++){const r=e.jr[n][0],i=e.jr[n][1];if(i&&r.test(t))return i}return e.jd},has(t,e){return void 0===e&&(e=!1),e?t in this.j:!!this.go(t)},ta(t,e,n,r){for(let i=0;i<t.length;i++)this.tt(t[i],e,n,r)},tr(t,e,n,r){let i;return r=r||I.groups,e&&e.j?i=e:(i=new I(e),n&&r&&B(e,n,r)),this.jr.push([t,i]),i},ts(t,e,n,r){let i=this;const o=t.length;if(!o)return i;for(let e=0;e<o-1;e++)i=i.tt(t[e]);return i.tt(t[o-1],e,n,r)},tt(t,e,n,r){r=r||I.groups;const i=this;if(e&&e.j)return i.j[t]=e,e;const o=e;let a,s=i.go(t);if(s?(a=new I,S(a.j,s.j),a.jr.push.apply(a.jr,s.jr),a.jd=s.jd,a.t=s.t):a=new I,o){if(r)if(a.t&&"string"==typeof a.t){const t=S(function(t,e){const n={};for(const r in e)e[r].indexOf(t)>=0&&(n[r]=!0);return n}(a.t,r),n);B(o,t,r)}else n&&B(o,n,r);a.t=o}return i.j[t]=a,a}};const K=(t,e,n,r,i)=>t.ta(e,n,r,i),U=(t,e,n,r,i)=>t.tr(e,n,r,i),D=(t,e,n,r,i)=>t.ts(e,n,r,i),$=(t,e,n,r,i)=>t.tt(e,n,r,i),F="WORD",Q="UWORD",W="LOCALHOST",Y="TLD",G="UTLD",J="SCHEME",X="SLASH_SCHEME",Z="NUM",V="WS",tt="NL",et="OPENBRACE",nt="OPENBRACKET",rt="OPENANGLEBRACKET",it="OPENPAREN",ot="CLOSEBRACE",at="CLOSEBRACKET",st="CLOSEANGLEBRACKET",ut="CLOSEPAREN",lt="AMPERSAND",ct="APOSTROPHE",dt="ASTERISK",pt="AT",ft="BACKSLASH",gt="BACKTICK",mt="CARET",ht="COLON",_t="COMMA",yt="DOLLAR",vt="DOT",bt="EQUALS",kt="EXCLAMATION",wt="HYPHEN",xt="PERCENT",Et="PIPE",At="PLUS",Lt="POUND",St="QUERY",Mt="QUOTE",Pt="SEMI",Ot="SLASH",Tt="TILDE",Ct="UNDERSCORE",jt="EMOJI",Ht="SYM";var Rt=Object.freeze({__proto__:null,WORD:F,UWORD:Q,LOCALHOST:W,TLD:Y,UTLD:G,SCHEME:J,SLASH_SCHEME:X,NUM:Z,WS:V,NL:tt,OPENBRACE:et,OPENBRACKET:nt,OPENANGLEBRACKET:rt,OPENPAREN:it,CLOSEBRACE:ot,CLOSEBRACKET:at,CLOSEANGLEBRACKET:st,CLOSEPAREN:ut,AMPERSAND:lt,APOSTROPHE:ct,ASTERISK:dt,AT:pt,BACKSLASH:ft,BACKTICK:gt,CARET:mt,COLON:ht,COMMA:_t,DOLLAR:yt,DOT:vt,EQUALS:bt,EXCLAMATION:kt,HYPHEN:wt,PERCENT:xt,PIPE:Et,PLUS:At,POUND:Lt,QUERY:St,QUOTE:Mt,SEMI:Pt,SLASH:Ot,TILDE:Tt,UNDERSCORE:Ct,EMOJI:jt,SYM:Ht});const Nt=/[a-z]/,zt=/\p{L}/u,qt=/\p{Emoji}/u,Bt=/\d/,It=/\s/,Kt="\n",Ut="️",Dt="‍";let $t=null,Ft=null;function Qt(t,e,n,r,i){let o;const a=e.length;for(let n=0;n<a-1;n++){const a=e[n];t.j[a]?o=t.j[a]:(o=new I(r),o.jr=i.slice(),t.j[a]=o),t=o}return o=new I(n),o.jr=i.slice(),t.j[e[a-1]]=o,o}function Wt(t){const e=[],n=[];let r=0;for(;r<t.length;){let i=0;for(;"0123456789".indexOf(t[r+i])>=0;)i++;if(i>0){e.push(n.join(""));let o=parseInt(t.substring(r,r+i),10);for(;o>0;o--)n.pop();r+=i}else"_"===t[r]?(e.push(n.join("")),r++):(n.push(t[r]),r++)}return e}const Yt={defaultProtocol:"http",events:null,format:Jt,formatHref:Jt,nl2br:!1,tagName:"a",target:null,rel:null,validate:!0,truncate:1/0,className:null,attributes:null,ignoreTags:[],render:null};function Gt(t,e){void 0===e&&(e=null);let n=S({},Yt);t&&(n=S(n,t instanceof Gt?t.o:t));const r=n.ignoreTags,i=[];for(let t=0;t<r.length;t++)i.push(r[t].toUpperCase());this.o=n,e&&(this.defaultRender=e),this.ignoreTags=i}function Jt(t){return t}function Xt(t,e){this.t="token",this.v=t,this.tk=e}function Zt(t,e){class n extends Xt{constructor(e,n){super(e,n),this.t=t}}for(const t in e)n.prototype[t]=e[t];return n.t=t,n}Gt.prototype={o:Yt,ignoreTags:[],defaultRender:t=>t,check(t){return this.get("validate",t.toString(),t)},get(t,e,n){const r=null!=e;let i=this.o[t];return i?("object"==typeof i?(i=n.t in i?i[n.t]:Yt[t],"function"==typeof i&&r&&(i=i(e,n))):"function"==typeof i&&r&&(i=i(e,n.t,n)),i):i},getObj(t,e,n){let r=this.o[t];return"function"==typeof r&&null!=e&&(r=r(e,n.t,n)),r},render(t){const e=t.render(this);return(this.get("render",null,t)||this.defaultRender)(e,t.t,t)}},Xt.prototype={isLink:!1,toString(){return this.v},toHref(t){return this.toString()},toFormattedString(t){const e=this.toString(),n=t.get("truncate",e,this),r=t.get("format",e,this);return n&&r.length>n?r.substring(0,n)+"…":r},toFormattedHref(t){return t.get("formatHref",this.toHref(t.get("defaultProtocol")),this)},startIndex(){return this.tk[0].s},endIndex(){return this.tk[this.tk.length-1].e},toObject(t){return void 0===t&&(t=Yt.defaultProtocol),{type:this.t,value:this.toString(),isLink:this.isLink,href:this.toHref(t),start:this.startIndex(),end:this.endIndex()}},toFormattedObject(t){return{type:this.t,value:this.toFormattedString(t),isLink:this.isLink,href:this.toFormattedHref(t),start:this.startIndex(),end:this.endIndex()}},validate(t){return t.get("validate",this.toString(),this)},render(t){const e=this,n=this.toFormattedHref(t),r=t.get("tagName",n,e),i=this.toFormattedString(t),o={},a=t.get("className",n,e),s=t.get("target",n,e),u=t.get("rel",n,e),l=t.getObj("attributes",n,e),c=t.getObj("events",n,e);return o.href=n,a&&(o.class=a),s&&(o.target=s),u&&(o.rel=u),l&&S(o,l),{tagName:r,attributes:o,content:i,eventListeners:c}}};const Vt=Zt("email",{isLink:!0,toHref(){return"mailto:"+this.toString()}}),te=Zt("text"),ee=Zt("nl"),ne=Zt("url",{isLink:!0,toHref(t){return void 0===t&&(t=Yt.defaultProtocol),this.hasProtocol()?this.v:`${t}://${this.v}`},hasProtocol(){const t=this.tk;return t.length>=2&&t[0].t!==W&&t[1].t===ht}}),re=t=>new I(t);function ie(t,e,n){const r=n[0].s,i=n[n.length-1].e;return new t(e.slice(r,i),n)}const oe="undefined"!=typeof console&&console&&console.warn||(()=>{}),ae="until manual call of linkify.init(). Register all schemes and plugins before invoking linkify the first time.",se={scanner:null,parser:null,tokenQueue:[],pluginQueue:[],customSchemes:[],initialized:!1};function ue(t,e){if(void 0===e&&(e=!1),se.initialized&&oe(`linkifyjs: already initialized - will not register custom scheme "${t}" ${ae}`),!/^[0-9a-z]+(-[0-9a-z]+)*$/.test(t))throw new Error('linkifyjs: incorrect scheme format.\n 1. Must only contain digits, lowercase ASCII letters or "-"\n 2. Cannot start or end with "-"\n 3. "-" cannot repeat');se.customSchemes.push([t,e])}function le(){se.scanner=function(t){void 0===t&&(t=[]);const e={};I.groups=e;const n=new I;null==$t&&($t=Wt(A)),null==Ft&&(Ft=Wt(L)),$(n,"'",ct),$(n,"{",et),$(n,"[",nt),$(n,"<",rt),$(n,"(",it),$(n,"}",ot),$(n,"]",at),$(n,">",st),$(n,")",ut),$(n,"&",lt),$(n,"*",dt),$(n,"@",pt),$(n,"`",gt),$(n,"^",mt),$(n,":",ht),$(n,",",_t),$(n,"$",yt),$(n,".",vt),$(n,"=",bt),$(n,"!",kt),$(n,"-",wt),$(n,"%",xt),$(n,"|",Et),$(n,"+",At),$(n,"#",Lt),$(n,"?",St),$(n,'"',Mt),$(n,"/",Ot),$(n,";",Pt),$(n,"~",Tt),$(n,"_",Ct),$(n,"\\",ft);const r=U(n,Bt,Z,{[M]:!0});U(r,Bt,r);const i=U(n,Nt,F,{[P]:!0});U(i,Nt,i);const o=U(n,zt,Q,{[O]:!0});U(o,Nt),U(o,zt,o);const a=U(n,It,V,{[z]:!0});$(n,Kt,tt,{[z]:!0}),$(a,Kt),U(a,It,a);const s=U(n,qt,jt,{[H]:!0});U(s,qt,s),$(s,Ut,s);const u=$(s,Dt);U(u,qt,s);const l=[[Nt,i]],c=[[Nt,null],[zt,o]];for(let t=0;t<$t.length;t++)Qt(n,$t[t],Y,F,l);for(let t=0;t<Ft.length;t++)Qt(n,Ft[t],G,Q,c);B(Y,{tld:!0,ascii:!0},e),B(G,{utld:!0,alpha:!0},e),Qt(n,"file",J,F,l),Qt(n,"mailto",J,F,l),Qt(n,"http",X,F,l),Qt(n,"https",X,F,l),Qt(n,"ftp",X,F,l),Qt(n,"ftps",X,F,l),B(J,{scheme:!0,ascii:!0},e),B(X,{slashscheme:!0,ascii:!0},e),t=t.sort(((t,e)=>t[0]>e[0]?1:-1));for(let e=0;e<t.length;e++){const r=t[e][0],i=t[e][1]?{[R]:!0}:{[N]:!0};r.indexOf("-")>=0?i[j]=!0:Nt.test(r)?Bt.test(r)?i[T]=!0:i[P]=!0:i[M]=!0,D(n,r,r,i)}return D(n,"localhost",W,{ascii:!0}),n.jd=new I(Ht),{start:n,tokens:S({groups:e},Rt)}}(se.customSchemes);for(let t=0;t<se.tokenQueue.length;t++)se.tokenQueue[t][1]({scanner:se.scanner});se.parser=function(t){let{groups:e}=t;const n=e.domain.concat([lt,dt,pt,ft,gt,mt,yt,bt,wt,Z,xt,Et,At,Lt,Ot,Ht,Tt,Ct]),r=[ct,st,ot,at,ut,ht,_t,vt,kt,rt,et,nt,it,St,Mt,Pt],i=[lt,ct,dt,ft,gt,mt,ot,yt,bt,wt,Z,et,xt,Et,At,Lt,St,Ot,Ht,Tt,Ct],o=re(),a=$(o,Tt);K(a,i,a),K(a,e.domain,a);const s=re(),u=re(),l=re();K(o,e.domain,s),K(o,e.scheme,u),K(o,e.slashscheme,l),K(s,i,a),K(s,e.domain,s);const c=$(s,pt);$(a,pt,c),$(u,pt,c),$(l,pt,c);const d=$(a,vt);K(d,i,a),K(d,e.domain,a);const p=re();K(c,e.domain,p),K(p,e.domain,p);const f=$(p,vt);K(f,e.domain,p);const g=re(Vt);K(f,e.tld,g),K(f,e.utld,g),$(c,W,g);const m=$(p,wt);K(m,e.domain,p),K(g,e.domain,p),$(g,vt,f),$(g,wt,m);const h=$(g,ht);K(h,e.numeric,Vt);const _=$(s,wt),y=$(s,vt);K(_,e.domain,s),K(y,i,a),K(y,e.domain,s);const v=re(ne);K(y,e.tld,v),K(y,e.utld,v),K(v,e.domain,s),K(v,i,a),$(v,vt,y),$(v,wt,_),$(v,pt,c);const b=$(v,ht),k=re(ne);K(b,e.numeric,k);const w=re(ne),x=re();K(w,n,w),K(w,r,x),K(x,n,w),K(x,r,x),$(v,Ot,w),$(k,Ot,w);const E=$(u,ht),A=$(l,ht),L=$(A,Ot);$(L,Ot,E),K(u,e.domain,s),$(u,vt,y),$(u,wt,_),K(l,e.domain,s),$(l,vt,y),$(l,wt,_),K(E,e.domain,w),$(E,Ot,w);const S=$(w,et),M=$(w,nt),P=$(w,rt),O=$(w,it);$(x,et,S),$(x,nt,M),$(x,rt,P),$(x,it,O),$(S,ot,w),$(M,at,w),$(P,st,w),$(O,ut,w),$(S,ot,w);const T=re(ne),C=re(ne),j=re(ne),H=re(ne);K(S,n,T),K(M,n,C),K(P,n,j),K(O,n,H);const R=re(),N=re(),z=re(),q=re();return K(S,r),K(M,r),K(P,r),K(O,r),K(T,n,T),K(C,n,C),K(j,n,j),K(H,n,H),K(T,r,T),K(C,r,C),K(j,r,j),K(H,r,H),K(R,n,R),K(N,n,C),K(z,n,j),K(q,n,H),K(R,r,R),K(N,r,N),K(z,r,z),K(q,r,q),$(C,at,w),$(j,st,w),$(H,ut,w),$(T,ot,w),$(N,at,w),$(z,st,w),$(q,ut,w),$(R,ut,w),$(o,W,v),$(o,tt,ee),{start:o,tokens:Rt}}(se.scanner.tokens);for(let t=0;t<se.pluginQueue.length;t++)se.pluginQueue[t][1]({scanner:se.scanner,parser:se.parser});se.initialized=!0}function ce(t){return se.initialized||le(),function(t,e,n){let r=n.length,i=0,o=[],a=[];for(;i<r;){let s=t,u=null,l=null,c=0,d=null,p=-1;for(;i<r&&!(u=s.go(n[i].t));)a.push(n[i++]);for(;i<r&&(l=u||s.go(n[i].t));)u=null,s=l,s.accepts()?(p=0,d=s):p>=0&&p++,i++,c++;if(p<0)i-=c,i<r&&(a.push(n[i]),i++);else{a.length>0&&(o.push(ie(te,e,a)),a=[]),i-=p,c-=p;const t=d.t,r=n.slice(i-c,i);o.push(ie(t,e,r))}}return a.length>0&&o.push(ie(te,e,a)),o}(se.parser.start,t,function(t,e){const n=function(t){const e=[],n=t.length;let r=0;for(;r<n;){let i,o=t.charCodeAt(r),a=o<55296||o>56319||r+1===n||(i=t.charCodeAt(r+1))<56320||i>57343?t[r]:t.slice(r,r+2);e.push(a),r+=a.length}return e}(e.replace(/[A-Z]/g,(t=>t.toLowerCase()))),r=n.length,i=[];let o=0,a=0;for(;a<r;){let s=t,u=null,l=0,c=null,d=-1,p=-1;for(;a<r&&(u=s.go(n[a]));)s=u,s.accepts()?(d=0,p=0,c=s):d>=0&&(d+=n[a].length,p++),l+=n[a].length,o+=n[a].length,a++;o-=d,a-=p,l-=d,i.push({t:c.t,v:e.slice(o-l,o),s:o-l,e:o})}return i}(se.scanner.start,t))}function de(t,e,n){if(void 0===e&&(e=null),void 0===n&&(n=null),e&&"object"==typeof e){if(n)throw Error(`linkifyjs: Invalid link type ${e}; must be a string`);n=e,e=null}const r=new Gt(n),i=ce(t),o=[];for(let t=0;t<i.length;t++){const n=i[t];!n.isLink||e&&n.t!==e||o.push(n.toFormattedObject(r))}return o}function pe(t,e){void 0===e&&(e=null);const n=ce(t);return 1===n.length&&n[0].isLink&&(!e||n[0].t===e)}function fe(t){return new y.Plugin({key:new y.PluginKey("autolink"),appendTransaction:function(e,n,r){var i=e.some((function(t){return t.docChanged}))&&!n.doc.eq(r.doc),o=e.some((function(t){return t.getMeta("preventAutolink")}));if(i&&!o){var a=r.tr,s=_.combineTransactionSteps(n.doc,function(t,e,n){if(n||2===arguments.length)for(var r,i=0,o=e.length;i<o;i++)!r&&i in e||(r||(r=Array.prototype.slice.call(e,0,i)),r[i]=e[i]);return t.concat(r||Array.prototype.slice.call(e))}([],e,!0)),u=s.mapping;if(_.getChangedRanges(s).forEach((function(e){var i=e.oldRange,o=e.newRange;_.getMarksBetween(i.from,i.to,n.doc).filter((function(e){return e.mark.type===t.type})).forEach((function(e){var i=u.map(e.from),o=u.map(e.to),s=_.getMarksBetween(i,o,r.doc).filter((function(e){return e.mark.type===t.type}));if(s.length){var l=s[0],c=n.doc.textBetween(e.from,e.to,void 0," "),d=r.doc.textBetween(l.from,l.to,void 0," "),p=pe(c),f=pe(d);p&&!f&&a.removeMark(l.from,l.to,t.type)}}));var s,l,c=_.findChildrenInRange(r.doc,o,(function(t){return t.isTextblock}));if(c.length>1?(s=c[0],l=r.doc.textBetween(s.pos,s.pos+s.node.nodeSize,void 0," ")):c.length&&r.doc.textBetween(o.from,o.to," "," ").endsWith(" ")&&(s=c[0],l=r.doc.textBetween(s.pos,o.to,void 0," ")),s&&l){var d=l.split(" ").filter((function(t){return""!==t}));if(d.length<=0)return!1;var p=d[d.length-1],f=s.pos+l.lastIndexOf(p);if(!p)return!1;de(p).filter((function(t){return t.isLink})).filter((function(e){return!t.validate||t.validate(e.value)})).map((function(t){return b(b({},t),{from:f+t.start+1,to:f+t.end+1})})).forEach((function(e){a.addMark(e.from,e.to,t.type.create({href:e.href}))}))}})),a.steps.length)return a}}})}var ge=_.Mark.create({name:"link",keepOnSplit:!1,onCreate:function(){this.options.protocols.forEach((function(t){"string"!=typeof t?ue(t.scheme,t.optionalSlashes):ue(t)}))},onDestroy:function(){I.groups={},se.scanner=null,se.parser=null,se.tokenQueue=[],se.pluginQueue=[],se.customSchemes=[],se.initialized=!1},inclusive:function(){return this.options.autolink},addOptions:function(){return{openOnClick:!0,linkOnPaste:!0,autolink:!0,protocols:[],HTMLAttributes:{target:"_blank",rel:"noopener noreferrer nofollow",class:null},validate:void 0}},addAttributes:function(){return{href:{default:null},target:{default:this.options.HTMLAttributes.target},class:{default:this.options.HTMLAttributes.class}}},parseHTML:function(){return[{tag:'a[href]:not([href *= "javascript:" i]):not([class="mention"])'}]},renderHTML:function(t){var e=t.HTMLAttributes;return["a",_.mergeAttributes(this.options.HTMLAttributes,e),0]},addCommands:function(){var t=this;return{setLink:function(e){return function(n){return(0,n.chain)().setMark(t.name,e).setMeta("preventAutolink",!0).run()}},toggleLink:function(e){return function(n){return(0,n.chain)().toggleMark(t.name,e,{extendEmptyMarkRange:!0}).setMeta("preventAutolink",!0).run()}},unsetLink:function(){return function(e){return(0,e.chain)().unsetMark(t.name,{extendEmptyMarkRange:!0}).setMeta("preventAutolink",!0).run()}}}},addPasteRules:function(){var t=this;return[_.markPasteRule({find:function(e){return de(e).filter((function(e){return!t.options.validate||t.options.validate(e.value)})).filter((function(t){return t.isLink})).map((function(t){return{text:t.value,index:t.start,data:t}}))},type:this.type,getAttributes:function(t){var e;return{href:null===(e=t.data)||void 0===e?void 0:e.href}}})]},addProseMirrorPlugins:function(){var t,e=[];return this.options.autolink&&e.push(fe({type:this.type,validate:this.options.validate})),this.options.openOnClick&&e.push((t={type:this.type},new y.Plugin({key:new y.PluginKey("handleClickLink"),props:{handleClick:function(e,n,r){var i,o,a;if(1!==r.button)return!1;var s=_.getAttributes(e.state,t.type.name),u=null===(i=r.target)||void 0===i?void 0:i.closest("a"),l=null!==(o=null==u?void 0:u.href)&&void 0!==o?o:s.href,c=null!==(a=null==u?void 0:u.target)&&void 0!==a?a:s.target;return!(!u||!l||(window.open(l,c),0))}}}))),this.options.linkOnPaste&&e.push(function(t){return new y.Plugin({key:new y.PluginKey("handlePasteLink"),props:{handlePaste:function(e,n,r){if(e.state.selection.empty)return!1;var i="";r.content.forEach((function(t){i+=t.textContent}));var o=de(i).find((function(t){return t.isLink&&t.value===i}));return!(!i||!o||(t.editor.commands.setMark(t.type,{href:o.href}),0))}}})}({editor:this.editor,type:this.type})),e}}),me=new y.PluginKey("mention"),he=_.Node.create({name:"mention",group:"inline",inline:!0,selectable:!1,atom:!0,addOptions:function(){var t=this;return{suggestion:{char:"@",allowedPrefixes:null,pluginKey:me,command:function(e){var n,r,i,o=e.editor,a=e.range,s=e.props,u=o.view.state.selection,l=u.$from,c=u.$to,d=1===l.parentOffset,p=c.nodeBefore,f=c.nodeAfter,g=null===(n=null==p?void 0:p.text)||void 0===n?void 0:n.startsWith(" "),m=null===(r=null==f?void 0:f.text)||void 0===r?void 0:r.startsWith(" "),h=[];d||g||h.push({type:"text",text:" "}),h.push({type:t.name,attrs:s}),m||h.push({type:"text",text:" "}),o.chain().focus().insertContentAt(a,h).run(),null===(i=window.getSelection())||void 0===i||i.collapseToEnd()},allow:function(e){var n=e.state,r=e.range,i=n.doc.resolve(r.from),o=n.schema.nodes[t.name];return!!i.parent.type.contentMatch.matchType(o)}}}},addAttributes:function(){return{id:{default:null,parseHTML:function(t){return t.getAttribute("data-id")}},userName:{default:null,parseHTML:function(t){return t.getAttribute("data-user-name")}},displayName:{default:null,parseHTML:function(t){return t.getAttribute("data-display-name")}}}},parseHTML:function(){return[{tag:'a[class="mention"]'}]},renderHTML:function(t){var e,n=t.node;return["a",{class:"mention",href:"/"+this.options.suggestion.char+n.attrs.userName,"data-id":n.attrs.id,"data-user-name":n.attrs.userName,"data-display-name":n.attrs.displayName,ref:"noopener noreferrer nofollow"},["span","@".concat(null!==(e=n.attrs.displayName)&&void 0!==e?e:n.attrs.userName)]]},addKeyboardShortcuts:function(){var t=this;return{Backspace:function(){return t.editor.commands.command((function(e){var n=e.tr,r=e.state,i=!1,o=r.selection,a=o.empty,s=o.anchor;return!!a&&(r.doc.nodesBetween(s-1,s,(function(e,r){if(e.type.name===t.name)return i=!0,n.insertText(t.options.suggestion.char||"",r,r+e.nodeSize),!1})),i)}))}}},addProseMirrorPlugins:function(){return[v(b({editor:this.editor},this.options.suggestion))]}}),_e=/(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/,ye=/(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g,ve=/(?:^|\s)((?:_)((?:[^_]+))(?:_))$/,be=/(?:^|\s)((?:_)((?:[^_]+))(?:_))/g,ke=/(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/,we=/(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))/g,xe=/(?:^|\s)((?:__)((?:[^__]+))(?:__))$/,Ee=/(?:^|\s)((?:__)((?:[^__]+))(?:__))/g,Ae=_.Mark.create({name:"bold",addOptions:function(){return{HTMLAttributes:{}}},parseHTML:function(){return[{tag:"strong"},{tag:"b",getAttrs:function(t){return"normal"!==t.style.fontWeight&&null}},{style:"font-weight",getAttrs:function(t){return/^(bold(er)?|[5-9]\d{2,})$/.test(t)&&null}},{tag:"em"},{tag:"i",getAttrs:function(t){return"normal"!==t.style.fontStyle&&null}},{style:"font-style=italic"},{tag:"u"},{style:"text-decoration",consuming:!1,getAttrs:function(t){return!!t.includes("underline")&&{}}}]},renderHTML:function(t){var e=t.HTMLAttributes;return["strong",_.mergeAttributes(this.options.HTMLAttributes,e),0]},addCommands:function(){var t=this;return{setBold:function(){return function(e){return e.commands.setMark(t.name)}},toggleBold:function(){return function(e){return e.commands.toggleMark(t.name)}},unsetBold:function(){return function(e){return e.commands.unsetMark(t.name)}}}},addKeyboardShortcuts:function(){var t=this;return{"Mod-b":function(){return t.editor.commands.toggleBold()},"Mod-B":function(){return t.editor.commands.toggleBold()},"Mod-i":function(){return t.editor.commands.toggleBold()},"Mod-I":function(){return t.editor.commands.toggleBold()},"Mod-u":function(){return t.editor.commands.toggleBold()},"Mod-U":function(){return t.editor.commands.toggleBold()}}},addInputRules:function(){return[_.markInputRule({find:ke,type:this.type}),_.markInputRule({find:xe,type:this.type}),_.markInputRule({find:_e,type:this.type}),_.markInputRule({find:ve,type:this.type})]},addPasteRules:function(){return[_.markPasteRule({find:we,type:this.type}),_.markPasteRule({find:Ee,type:this.type}),_.markPasteRule({find:ye,type:this.type}),_.markPasteRule({find:be,type:this.type})]}}),Le=function(t){var _=t.placeholder,y=t.mentionSuggestion;return[o,l,a,g.configure({placeholder:_}),h,f,u.configure({levels:[2,3]}),Ae,m,r,i,e,s,c,p,d,n,ge,E,w,x,he.configure({suggestion:y})]},Se=function(t){var a=t.placeholder,u=t.mentionSuggestion;return[o,l,g.configure({placeholder:a}),h,f,Ae,m,r,i,e,s,c,d,p,n,ge,he.configure({suggestion:u})]};exports.makeArticleEditorExtensions=Le,exports.makeCommentEditorExtensions=Se,exports.useArticleEdtor=function(e){var n=e.content,r=e.placeholder,i=e.mentionSuggestion,o=k(e,["content","placeholder","mentionSuggestion"]);return t.useEditor(b({extensions:Le({placeholder:r,mentionSuggestion:i}),content:n},o))},exports.useCommentEditor=function(e){var n=e.content,r=e.placeholder,i=e.mentionSuggestion,o=k(e,["content","placeholder","mentionSuggestion"]);return t.useEditor(b({extensions:Se({placeholder:r,mentionSuggestion:i}),content:n},o))},Object.keys(t).forEach((function(e){"default"===e||exports.hasOwnProperty(e)||Object.defineProperty(exports,e,{enumerable:!0,get:function(){return t[e]}})}));
//# sourceMappingURL=index.cjs.map
