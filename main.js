const w8 = () => null, F8 = () => null;
function _i(e) {
  if (e)
    throw e;
}
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var Go = function(t) {
  return t != null && t.constructor != null && typeof t.constructor.isBuffer == "function" && t.constructor.isBuffer(t);
}, on = Object.prototype.hasOwnProperty, Ko = Object.prototype.toString, Ai = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, Ni = function(t) {
  return typeof Array.isArray == "function" ? Array.isArray(t) : Ko.call(t) === "[object Array]";
}, Si = function(t) {
  if (!t || Ko.call(t) !== "[object Object]")
    return !1;
  var n = on.call(t, "constructor"), r = t.constructor && t.constructor.prototype && on.call(t.constructor.prototype, "isPrototypeOf");
  if (t.constructor && !n && !r)
    return !1;
  var i;
  for (i in t)
    ;
  return typeof i > "u" || on.call(t, i);
}, yi = function(t, n) {
  Ai && n.name === "__proto__" ? Ai(t, n.name, {
    enumerable: !0,
    configurable: !0,
    value: n.newValue,
    writable: !0
  }) : t[n.name] = n.newValue;
}, Ii = function(t, n) {
  if (n === "__proto__")
    if (on.call(t, n)) {
      if (Ci)
        return Ci(t, n).value;
    } else
      return;
  return t[n];
}, mn = function e() {
  var t, n, r, i, s, o, a = arguments[0], u = 1, c = arguments.length, f = !1;
  for (typeof a == "boolean" && (f = a, a = arguments[1] || {}, u = 2), (a == null || typeof a != "object" && typeof a != "function") && (a = {}); u < c; ++u)
    if (t = arguments[u], t != null)
      for (n in t)
        r = Ii(a, n), i = Ii(t, n), a !== i && (f && i && (Si(i) || (s = Ni(i))) ? (s ? (s = !1, o = r && Ni(r) ? r : []) : o = r && Si(r) ? r : {}, yi(a, { name: n, newValue: e(f, o, i) })) : typeof i < "u" && yi(a, { name: n, newValue: i }));
  return a;
};
function Cr(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function uu() {
  const e = [], t = { run: n, use: r };
  return t;
  function n(...i) {
    let s = -1;
    const o = i.pop();
    if (typeof o != "function")
      throw new TypeError("Expected function as last argument, not " + o);
    a(null, ...i);
    function a(u, ...c) {
      const f = e[++s];
      let h = -1;
      if (u) {
        o(u);
        return;
      }
      for (; ++h < i.length; )
        (c[h] === null || c[h] === void 0) && (c[h] = i[h]);
      i = c, f ? cu(f, a)(...c) : o(null, ...c);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), t;
  }
}
function cu(e, t) {
  let n;
  return r;
  function r(...o) {
    const a = e.length > o.length;
    let u;
    a && o.push(i);
    try {
      u = e.apply(this, o);
    } catch (c) {
      const f = (
        /** @type {Error} */
        c
      );
      if (a && n)
        throw f;
      return i(f);
    }
    a || (u instanceof Promise ? u.then(s, i) : u instanceof Error ? i(u) : s(u));
  }
  function i(o, ...a) {
    n || (n = !0, t(o, ...a));
  }
  function s(o) {
    i(null, o);
  }
}
function N1(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? Oi(e.position) : "start" in e || "end" in e ? Oi(e) : "line" in e || "column" in e ? Nr(e) : "";
}
function Nr(e) {
  return xi(e && e.line) + ":" + xi(e && e.column);
}
function Oi(e) {
  return Nr(e && e.start) + "-" + Nr(e && e.end);
}
function xi(e) {
  return e && typeof e == "number" ? e : 1;
}
class we extends Error {
  /**
   * Create a message for `reason` at `place` from `origin`.
   *
   * When an error is passed in as `reason`, the `stack` is copied.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   *
   *   > 👉 **Note**: you should use markdown.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // To do: next major: expose `undefined` everywhere instead of `null`.
  constructor(t, n, r) {
    const i = [null, null];
    let s = {
      // @ts-expect-error: we always follows the structure of `position`.
      start: { line: null, column: null },
      // @ts-expect-error: "
      end: { line: null, column: null }
    };
    if (super(), typeof n == "string" && (r = n, n = void 0), typeof r == "string") {
      const o = r.indexOf(":");
      o === -1 ? i[1] = r : (i[0] = r.slice(0, o), i[1] = r.slice(o + 1));
    }
    n && ("type" in n || "position" in n ? n.position && (s = n.position) : "start" in n || "end" in n ? s = n : ("line" in n || "column" in n) && (s.start = n)), this.name = N1(n) || "1:1", this.message = typeof t == "object" ? t.message : t, this.stack = "", typeof t == "object" && t.stack && (this.stack = t.stack), this.reason = this.message, this.fatal, this.line = s.start.line, this.column = s.start.column, this.position = s, this.source = i[0], this.ruleId = i[1], this.file, this.actual, this.expected, this.url, this.note;
  }
}
we.prototype.file = "";
we.prototype.name = "";
we.prototype.reason = "";
we.prototype.message = "";
we.prototype.stack = "";
we.prototype.fatal = null;
we.prototype.column = null;
we.prototype.line = null;
we.prototype.source = null;
we.prototype.ruleId = null;
we.prototype.position = null;
const Xe = { basename: fu, dirname: hu, extname: pu, join: du, sep: "/" };
function fu(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  P1(e);
  let n = 0, r = -1, i = e.length, s;
  if (t === void 0 || t.length === 0 || t.length > e.length) {
    for (; i--; )
      if (e.charCodeAt(i) === 47) {
        if (s) {
          n = i + 1;
          break;
        }
      } else
        r < 0 && (s = !0, r = i + 1);
    return r < 0 ? "" : e.slice(n, r);
  }
  if (t === e)
    return "";
  let o = -1, a = t.length - 1;
  for (; i--; )
    if (e.charCodeAt(i) === 47) {
      if (s) {
        n = i + 1;
        break;
      }
    } else
      o < 0 && (s = !0, o = i + 1), a > -1 && (e.charCodeAt(i) === t.charCodeAt(a--) ? a < 0 && (r = i) : (a = -1, r = o));
  return n === r ? r = o : r < 0 && (r = e.length), e.slice(n, r);
}
function hu(e) {
  if (P1(e), e.length === 0)
    return ".";
  let t = -1, n = e.length, r;
  for (; --n; )
    if (e.charCodeAt(n) === 47) {
      if (r) {
        t = n;
        break;
      }
    } else
      r || (r = !0);
  return t < 0 ? e.charCodeAt(0) === 47 ? "/" : "." : t === 1 && e.charCodeAt(0) === 47 ? "//" : e.slice(0, t);
}
function pu(e) {
  P1(e);
  let t = e.length, n = -1, r = 0, i = -1, s = 0, o;
  for (; t--; ) {
    const a = e.charCodeAt(t);
    if (a === 47) {
      if (o) {
        r = t + 1;
        break;
      }
      continue;
    }
    n < 0 && (o = !0, n = t + 1), a === 46 ? i < 0 ? i = t : s !== 1 && (s = 1) : i > -1 && (s = -1);
  }
  return i < 0 || n < 0 || // We saw a non-dot character immediately before the dot.
  s === 0 || // The (right-most) trimmed path component is exactly `..`.
  s === 1 && i === n - 1 && i === r + 1 ? "" : e.slice(i, n);
}
function du(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    P1(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : mu(n);
}
function mu(e) {
  P1(e);
  const t = e.charCodeAt(0) === 47;
  let n = Tu(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.charCodeAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function Tu(e, t) {
  let n = "", r = 0, i = -1, s = 0, o = -1, a, u;
  for (; ++o <= e.length; ) {
    if (o < e.length)
      a = e.charCodeAt(o);
    else {
      if (a === 47)
        break;
      a = 47;
    }
    if (a === 47) {
      if (!(i === o - 1 || s === 1))
        if (i !== o - 1 && s === 2) {
          if (n.length < 2 || r !== 2 || n.charCodeAt(n.length - 1) !== 46 || n.charCodeAt(n.length - 2) !== 46) {
            if (n.length > 2) {
              if (u = n.lastIndexOf("/"), u !== n.length - 1) {
                u < 0 ? (n = "", r = 0) : (n = n.slice(0, u), r = n.length - 1 - n.lastIndexOf("/")), i = o, s = 0;
                continue;
              }
            } else if (n.length > 0) {
              n = "", r = 0, i = o, s = 0;
              continue;
            }
          }
          t && (n = n.length > 0 ? n + "/.." : "..", r = 2);
        } else
          n.length > 0 ? n += "/" + e.slice(i + 1, o) : n = e.slice(i + 1, o), r = o - i - 1;
      i = o, s = 0;
    } else
      a === 46 && s > -1 ? s++ : s = -1;
  }
  return n;
}
function P1(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const Eu = { cwd: gu };
function gu() {
  return "/";
}
function Sr(e) {
  return e !== null && typeof e == "object" && // @ts-expect-error: indexable.
  e.href && // @ts-expect-error: indexable.
  e.origin;
}
function _u(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!Sr(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return Au(e);
}
function Au(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const t = e.pathname;
  let n = -1;
  for (; ++n < t.length; )
    if (t.charCodeAt(n) === 37 && t.charCodeAt(n + 1) === 50) {
      const r = t.charCodeAt(n + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(t);
}
const vn = ["history", "path", "basename", "stem", "extname", "dirname"];
class Cu {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Buffer` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(t) {
    let n;
    t ? typeof t == "string" || Nu(t) ? n = { value: t } : Sr(t) ? n = { path: t } : n = t : n = {}, this.data = {}, this.messages = [], this.history = [], this.cwd = Eu.cwd(), this.value, this.stored, this.result, this.map;
    let r = -1;
    for (; ++r < vn.length; ) {
      const s = vn[r];
      s in n && n[s] !== void 0 && n[s] !== null && (this[s] = s === "history" ? [...n[s]] : n[s]);
    }
    let i;
    for (i in n)
      vn.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {string | URL} path
   */
  set path(t) {
    Sr(t) && (t = _u(t)), Kn(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the parent path (example: `'~'`).
   */
  get dirname() {
    return typeof this.path == "string" ? Xe.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   */
  set dirname(t) {
    bi(this.basename, "dirname"), this.path = Xe.join(t || "", this.basename);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   */
  get basename() {
    return typeof this.path == "string" ? Xe.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set basename(t) {
    Kn(t, "basename"), Gn(t, "basename"), this.path = Xe.join(this.dirname || "", t);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   */
  get extname() {
    return typeof this.path == "string" ? Xe.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   */
  set extname(t) {
    if (Gn(t, "extname"), bi(this.dirname, "extname"), t) {
      if (t.charCodeAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = Xe.join(this.dirname, this.stem + (t || ""));
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   */
  get stem() {
    return typeof this.path == "string" ? Xe.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set stem(t) {
    Kn(t, "stem"), Gn(t, "stem"), this.path = Xe.join(this.dirname || "", t + (this.extname || ""));
  }
  /**
   * Serialize the file.
   *
   * @param {BufferEncoding | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Buffer`
   *   (default: `'utf8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(t) {
    return (this.value || "").toString(t || void 0);
  }
  /**
   * Create a warning message associated with the file.
   *
   * Its `fatal` is set to `false` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(t, n, r) {
    const i = new we(t, n, r);
    return this.path && (i.name = this.path + ":" + i.name, i.file = this.path), i.fatal = !1, this.messages.push(i), i;
  }
  /**
   * Create an info message associated with the file.
   *
   * Its `fatal` is set to `null` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(t, n, r) {
    const i = this.message(t, n, r);
    return i.fatal = null, i;
  }
  /**
   * Create a fatal error associated with the file.
   *
   * Its `fatal` is set to `true` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * > 👉 **Note**: a fatal error means that a file is no longer processable.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Message.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(t, n, r) {
    const i = this.message(t, n, r);
    throw i.fatal = !0, i;
  }
}
function Gn(e, t) {
  if (e && e.includes(Xe.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + Xe.sep + "`"
    );
}
function Kn(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function bi(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function Nu(e) {
  return Go(e);
}
const zo = Yo().freeze(), $o = {}.hasOwnProperty;
function Yo() {
  const e = uu(), t = [];
  let n = {}, r, i = -1;
  return s.data = o, s.Parser = void 0, s.Compiler = void 0, s.freeze = a, s.attachers = t, s.use = u, s.parse = c, s.stringify = f, s.run = h, s.runSync = E, s.process = g, s.processSync = A, s;
  function s() {
    const _ = Yo();
    let b = -1;
    for (; ++b < t.length; )
      _.use(...t[b]);
    return _.data(mn(!0, {}, n)), _;
  }
  function o(_, b) {
    return typeof _ == "string" ? arguments.length === 2 ? (Yn("data", r), n[_] = b, s) : $o.call(n, _) && n[_] || null : _ ? (Yn("data", r), n = _, s) : n;
  }
  function a() {
    if (r)
      return s;
    for (; ++i < t.length; ) {
      const [_, ...b] = t[i];
      if (b[0] === !1)
        continue;
      b[0] === !0 && (b[0] = void 0);
      const N = _.call(s, ...b);
      typeof N == "function" && e.use(N);
    }
    return r = !0, i = Number.POSITIVE_INFINITY, s;
  }
  function u(_, ...b) {
    let N;
    if (Yn("use", r), _ != null)
      if (typeof _ == "function")
        U(_, ...b);
      else if (typeof _ == "object")
        Array.isArray(_) ? B(_) : L(_);
      else
        throw new TypeError("Expected usable value, not `" + _ + "`");
    return N && (n.settings = Object.assign(n.settings || {}, N)), s;
    function D(C) {
      if (typeof C == "function")
        U(C);
      else if (typeof C == "object")
        if (Array.isArray(C)) {
          const [x, ...w] = C;
          U(x, ...w);
        } else
          L(C);
      else
        throw new TypeError("Expected usable value, not `" + C + "`");
    }
    function L(C) {
      B(C.plugins), C.settings && (N = Object.assign(N || {}, C.settings));
    }
    function B(C) {
      let x = -1;
      if (C != null)
        if (Array.isArray(C))
          for (; ++x < C.length; ) {
            const w = C[x];
            D(w);
          }
        else
          throw new TypeError("Expected a list of plugins, not `" + C + "`");
    }
    function U(C, x) {
      let w = -1, z;
      for (; ++w < t.length; )
        if (t[w][0] === C) {
          z = t[w];
          break;
        }
      z ? (Cr(z[1]) && Cr(x) && (x = mn(!0, z[1], x)), z[1] = x) : t.push([...arguments]);
    }
  }
  function c(_) {
    s.freeze();
    const b = h1(_), N = s.Parser;
    return zn("parse", N), Ri(N, "parse") ? new N(String(b), b).parse() : N(String(b), b);
  }
  function f(_, b) {
    s.freeze();
    const N = h1(b), D = s.Compiler;
    return $n("stringify", D), ki(_), Ri(D, "compile") ? new D(_, N).compile() : D(_, N);
  }
  function h(_, b, N) {
    if (ki(_), s.freeze(), !N && typeof b == "function" && (N = b, b = void 0), !N)
      return new Promise(D);
    D(null, N);
    function D(L, B) {
      e.run(_, h1(b), U);
      function U(C, x, w) {
        x = x || _, C ? B(C) : L ? L(x) : N(null, x, w);
      }
    }
  }
  function E(_, b) {
    let N, D;
    return s.run(_, b, L), Li("runSync", "run", D), N;
    function L(B, U) {
      _i(B), N = U, D = !0;
    }
  }
  function g(_, b) {
    if (s.freeze(), zn("process", s.Parser), $n("process", s.Compiler), !b)
      return new Promise(N);
    N(null, b);
    function N(D, L) {
      const B = h1(_);
      s.run(s.parse(B), B, (C, x, w) => {
        if (C || !x || !w)
          U(C);
        else {
          const z = s.stringify(x, w);
          z == null || (Iu(z) ? w.value = z : w.result = z), U(C, w);
        }
      });
      function U(C, x) {
        C || !x ? L(C) : D ? D(x) : b(null, x);
      }
    }
  }
  function A(_) {
    let b;
    s.freeze(), zn("processSync", s.Parser), $n("processSync", s.Compiler);
    const N = h1(_);
    return s.process(N, D), Li("processSync", "process", b), N;
    function D(L) {
      b = !0, _i(L);
    }
  }
}
function Ri(e, t) {
  return typeof e == "function" && // Prototypes do exist.
  // type-coverage:ignore-next-line
  e.prototype && // A function with keys in its prototype is probably a constructor.
  // Classes’ prototype methods are not enumerable, so we check if some value
  // exists in the prototype.
  // type-coverage:ignore-next-line
  (Su(e.prototype) || t in e.prototype);
}
function Su(e) {
  let t;
  for (t in e)
    if ($o.call(e, t))
      return !0;
  return !1;
}
function zn(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `Parser`");
}
function $n(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `Compiler`");
}
function Yn(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function ki(e) {
  if (!Cr(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function Li(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function h1(e) {
  return yu(e) ? e : new Cu(e);
}
function yu(e) {
  return Boolean(
    e && typeof e == "object" && "message" in e && "messages" in e
  );
}
function Iu(e) {
  return typeof e == "string" || Go(e);
}
var Qe = {};
const Ou = [
  65534,
  65535,
  131070,
  131071,
  196606,
  196607,
  262142,
  262143,
  327678,
  327679,
  393214,
  393215,
  458750,
  458751,
  524286,
  524287,
  589822,
  589823,
  655358,
  655359,
  720894,
  720895,
  786430,
  786431,
  851966,
  851967,
  917502,
  917503,
  983038,
  983039,
  1048574,
  1048575,
  1114110,
  1114111
];
Qe.REPLACEMENT_CHARACTER = "�";
Qe.CODE_POINTS = {
  EOF: -1,
  NULL: 0,
  TABULATION: 9,
  CARRIAGE_RETURN: 13,
  LINE_FEED: 10,
  FORM_FEED: 12,
  SPACE: 32,
  EXCLAMATION_MARK: 33,
  QUOTATION_MARK: 34,
  NUMBER_SIGN: 35,
  AMPERSAND: 38,
  APOSTROPHE: 39,
  HYPHEN_MINUS: 45,
  SOLIDUS: 47,
  DIGIT_0: 48,
  DIGIT_9: 57,
  SEMICOLON: 59,
  LESS_THAN_SIGN: 60,
  EQUALS_SIGN: 61,
  GREATER_THAN_SIGN: 62,
  QUESTION_MARK: 63,
  LATIN_CAPITAL_A: 65,
  LATIN_CAPITAL_F: 70,
  LATIN_CAPITAL_X: 88,
  LATIN_CAPITAL_Z: 90,
  RIGHT_SQUARE_BRACKET: 93,
  GRAVE_ACCENT: 96,
  LATIN_SMALL_A: 97,
  LATIN_SMALL_F: 102,
  LATIN_SMALL_X: 120,
  LATIN_SMALL_Z: 122,
  REPLACEMENT_CHARACTER: 65533
};
Qe.CODE_POINT_SEQUENCES = {
  DASH_DASH_STRING: [45, 45],
  //--
  DOCTYPE_STRING: [68, 79, 67, 84, 89, 80, 69],
  //DOCTYPE
  CDATA_START_STRING: [91, 67, 68, 65, 84, 65, 91],
  //[CDATA[
  SCRIPT_STRING: [115, 99, 114, 105, 112, 116],
  //script
  PUBLIC_STRING: [80, 85, 66, 76, 73, 67],
  //PUBLIC
  SYSTEM_STRING: [83, 89, 83, 84, 69, 77]
  //SYSTEM
};
Qe.isSurrogate = function(e) {
  return e >= 55296 && e <= 57343;
};
Qe.isSurrogatePair = function(e) {
  return e >= 56320 && e <= 57343;
};
Qe.getSurrogatePairCodePoint = function(e, t) {
  return (e - 55296) * 1024 + 9216 + t;
};
Qe.isControlCodePoint = function(e) {
  return e !== 32 && e !== 10 && e !== 13 && e !== 9 && e !== 12 && e >= 1 && e <= 31 || e >= 127 && e <= 159;
};
Qe.isUndefinedCodePoint = function(e) {
  return e >= 64976 && e <= 65007 || Ou.indexOf(e) > -1;
};
var wr = {
  controlCharacterInInputStream: "control-character-in-input-stream",
  noncharacterInInputStream: "noncharacter-in-input-stream",
  surrogateInInputStream: "surrogate-in-input-stream",
  nonVoidHtmlElementStartTagWithTrailingSolidus: "non-void-html-element-start-tag-with-trailing-solidus",
  endTagWithAttributes: "end-tag-with-attributes",
  endTagWithTrailingSolidus: "end-tag-with-trailing-solidus",
  unexpectedSolidusInTag: "unexpected-solidus-in-tag",
  unexpectedNullCharacter: "unexpected-null-character",
  unexpectedQuestionMarkInsteadOfTagName: "unexpected-question-mark-instead-of-tag-name",
  invalidFirstCharacterOfTagName: "invalid-first-character-of-tag-name",
  unexpectedEqualsSignBeforeAttributeName: "unexpected-equals-sign-before-attribute-name",
  missingEndTagName: "missing-end-tag-name",
  unexpectedCharacterInAttributeName: "unexpected-character-in-attribute-name",
  unknownNamedCharacterReference: "unknown-named-character-reference",
  missingSemicolonAfterCharacterReference: "missing-semicolon-after-character-reference",
  unexpectedCharacterAfterDoctypeSystemIdentifier: "unexpected-character-after-doctype-system-identifier",
  unexpectedCharacterInUnquotedAttributeValue: "unexpected-character-in-unquoted-attribute-value",
  eofBeforeTagName: "eof-before-tag-name",
  eofInTag: "eof-in-tag",
  missingAttributeValue: "missing-attribute-value",
  missingWhitespaceBetweenAttributes: "missing-whitespace-between-attributes",
  missingWhitespaceAfterDoctypePublicKeyword: "missing-whitespace-after-doctype-public-keyword",
  missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers: "missing-whitespace-between-doctype-public-and-system-identifiers",
  missingWhitespaceAfterDoctypeSystemKeyword: "missing-whitespace-after-doctype-system-keyword",
  missingQuoteBeforeDoctypePublicIdentifier: "missing-quote-before-doctype-public-identifier",
  missingQuoteBeforeDoctypeSystemIdentifier: "missing-quote-before-doctype-system-identifier",
  missingDoctypePublicIdentifier: "missing-doctype-public-identifier",
  missingDoctypeSystemIdentifier: "missing-doctype-system-identifier",
  abruptDoctypePublicIdentifier: "abrupt-doctype-public-identifier",
  abruptDoctypeSystemIdentifier: "abrupt-doctype-system-identifier",
  cdataInHtmlContent: "cdata-in-html-content",
  incorrectlyOpenedComment: "incorrectly-opened-comment",
  eofInScriptHtmlCommentLikeText: "eof-in-script-html-comment-like-text",
  eofInDoctype: "eof-in-doctype",
  nestedComment: "nested-comment",
  abruptClosingOfEmptyComment: "abrupt-closing-of-empty-comment",
  eofInComment: "eof-in-comment",
  incorrectlyClosedComment: "incorrectly-closed-comment",
  eofInCdata: "eof-in-cdata",
  absenceOfDigitsInNumericCharacterReference: "absence-of-digits-in-numeric-character-reference",
  nullCharacterReference: "null-character-reference",
  surrogateCharacterReference: "surrogate-character-reference",
  characterReferenceOutsideUnicodeRange: "character-reference-outside-unicode-range",
  controlCharacterReference: "control-character-reference",
  noncharacterCharacterReference: "noncharacter-character-reference",
  missingWhitespaceBeforeDoctypeName: "missing-whitespace-before-doctype-name",
  missingDoctypeName: "missing-doctype-name",
  invalidCharacterSequenceAfterDoctypeName: "invalid-character-sequence-after-doctype-name",
  duplicateAttribute: "duplicate-attribute",
  nonConformingDoctype: "non-conforming-doctype",
  missingDoctype: "missing-doctype",
  misplacedDoctype: "misplaced-doctype",
  endTagWithoutMatchingOpenElement: "end-tag-without-matching-open-element",
  closingOfElementWithOpenChildElements: "closing-of-element-with-open-child-elements",
  disallowedContentInNoscriptInHead: "disallowed-content-in-noscript-in-head",
  openElementsLeftAfterEof: "open-elements-left-after-eof",
  abandonedHeadElementChild: "abandoned-head-element-child",
  misplacedStartTagForHeadElement: "misplaced-start-tag-for-head-element",
  nestedNoscriptInHead: "nested-noscript-in-head",
  eofInElementThatCanContainOnlyText: "eof-in-element-that-can-contain-only-text"
};
const Qt = Qe, jn = wr, Rt = Qt.CODE_POINTS, xu = 1 << 16;
let bu = class {
  constructor() {
    this.html = null, this.pos = -1, this.lastGapPos = -1, this.lastCharPos = -1, this.gapStack = [], this.skipNextNewLine = !1, this.lastChunkWritten = !1, this.endOfChunkHit = !1, this.bufferWaterline = xu;
  }
  _err() {
  }
  _addGap() {
    this.gapStack.push(this.lastGapPos), this.lastGapPos = this.pos;
  }
  _processSurrogate(t) {
    if (this.pos !== this.lastCharPos) {
      const n = this.html.charCodeAt(this.pos + 1);
      if (Qt.isSurrogatePair(n))
        return this.pos++, this._addGap(), Qt.getSurrogatePairCodePoint(t, n);
    } else if (!this.lastChunkWritten)
      return this.endOfChunkHit = !0, Rt.EOF;
    return this._err(jn.surrogateInInputStream), t;
  }
  dropParsedChunk() {
    this.pos > this.bufferWaterline && (this.lastCharPos -= this.pos, this.html = this.html.substring(this.pos), this.pos = 0, this.lastGapPos = -1, this.gapStack = []);
  }
  write(t, n) {
    this.html ? this.html += t : this.html = t, this.lastCharPos = this.html.length - 1, this.endOfChunkHit = !1, this.lastChunkWritten = n;
  }
  insertHtmlAtCurrentPos(t) {
    this.html = this.html.substring(0, this.pos + 1) + t + this.html.substring(this.pos + 1, this.html.length), this.lastCharPos = this.html.length - 1, this.endOfChunkHit = !1;
  }
  advance() {
    if (this.pos++, this.pos > this.lastCharPos)
      return this.endOfChunkHit = !this.lastChunkWritten, Rt.EOF;
    let t = this.html.charCodeAt(this.pos);
    return this.skipNextNewLine && t === Rt.LINE_FEED ? (this.skipNextNewLine = !1, this._addGap(), this.advance()) : t === Rt.CARRIAGE_RETURN ? (this.skipNextNewLine = !0, Rt.LINE_FEED) : (this.skipNextNewLine = !1, Qt.isSurrogate(t) && (t = this._processSurrogate(t)), t > 31 && t < 127 || t === Rt.LINE_FEED || t === Rt.CARRIAGE_RETURN || t > 159 && t < 64976 || this._checkForProblematicCharacters(t), t);
  }
  _checkForProblematicCharacters(t) {
    Qt.isControlCodePoint(t) ? this._err(jn.controlCharacterInInputStream) : Qt.isUndefinedCodePoint(t) && this._err(jn.noncharacterInInputStream);
  }
  retreat() {
    this.pos === this.lastGapPos && (this.lastGapPos = this.gapStack.pop(), this.pos--), this.pos--;
  }
};
var Ru = bu, ku = new Uint16Array([4, 52, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 106, 303, 412, 810, 1432, 1701, 1796, 1987, 2114, 2360, 2420, 2484, 3170, 3251, 4140, 4393, 4575, 4610, 5106, 5512, 5728, 6117, 6274, 6315, 6345, 6427, 6516, 7002, 7910, 8733, 9323, 9870, 10170, 10631, 10893, 11318, 11386, 11467, 12773, 13092, 14474, 14922, 15448, 15542, 16419, 17666, 18166, 18611, 19004, 19095, 19298, 19397, 4, 16, 69, 77, 97, 98, 99, 102, 103, 108, 109, 110, 111, 112, 114, 115, 116, 117, 140, 150, 158, 169, 176, 194, 199, 210, 216, 222, 226, 242, 256, 266, 283, 294, 108, 105, 103, 5, 198, 1, 59, 148, 1, 198, 80, 5, 38, 1, 59, 156, 1, 38, 99, 117, 116, 101, 5, 193, 1, 59, 167, 1, 193, 114, 101, 118, 101, 59, 1, 258, 4, 2, 105, 121, 182, 191, 114, 99, 5, 194, 1, 59, 189, 1, 194, 59, 1, 1040, 114, 59, 3, 55349, 56580, 114, 97, 118, 101, 5, 192, 1, 59, 208, 1, 192, 112, 104, 97, 59, 1, 913, 97, 99, 114, 59, 1, 256, 100, 59, 1, 10835, 4, 2, 103, 112, 232, 237, 111, 110, 59, 1, 260, 102, 59, 3, 55349, 56632, 112, 108, 121, 70, 117, 110, 99, 116, 105, 111, 110, 59, 1, 8289, 105, 110, 103, 5, 197, 1, 59, 264, 1, 197, 4, 2, 99, 115, 272, 277, 114, 59, 3, 55349, 56476, 105, 103, 110, 59, 1, 8788, 105, 108, 100, 101, 5, 195, 1, 59, 292, 1, 195, 109, 108, 5, 196, 1, 59, 301, 1, 196, 4, 8, 97, 99, 101, 102, 111, 114, 115, 117, 321, 350, 354, 383, 388, 394, 400, 405, 4, 2, 99, 114, 327, 336, 107, 115, 108, 97, 115, 104, 59, 1, 8726, 4, 2, 118, 119, 342, 345, 59, 1, 10983, 101, 100, 59, 1, 8966, 121, 59, 1, 1041, 4, 3, 99, 114, 116, 362, 369, 379, 97, 117, 115, 101, 59, 1, 8757, 110, 111, 117, 108, 108, 105, 115, 59, 1, 8492, 97, 59, 1, 914, 114, 59, 3, 55349, 56581, 112, 102, 59, 3, 55349, 56633, 101, 118, 101, 59, 1, 728, 99, 114, 59, 1, 8492, 109, 112, 101, 113, 59, 1, 8782, 4, 14, 72, 79, 97, 99, 100, 101, 102, 104, 105, 108, 111, 114, 115, 117, 442, 447, 456, 504, 542, 547, 569, 573, 577, 616, 678, 784, 790, 796, 99, 121, 59, 1, 1063, 80, 89, 5, 169, 1, 59, 454, 1, 169, 4, 3, 99, 112, 121, 464, 470, 497, 117, 116, 101, 59, 1, 262, 4, 2, 59, 105, 476, 478, 1, 8914, 116, 97, 108, 68, 105, 102, 102, 101, 114, 101, 110, 116, 105, 97, 108, 68, 59, 1, 8517, 108, 101, 121, 115, 59, 1, 8493, 4, 4, 97, 101, 105, 111, 514, 520, 530, 535, 114, 111, 110, 59, 1, 268, 100, 105, 108, 5, 199, 1, 59, 528, 1, 199, 114, 99, 59, 1, 264, 110, 105, 110, 116, 59, 1, 8752, 111, 116, 59, 1, 266, 4, 2, 100, 110, 553, 560, 105, 108, 108, 97, 59, 1, 184, 116, 101, 114, 68, 111, 116, 59, 1, 183, 114, 59, 1, 8493, 105, 59, 1, 935, 114, 99, 108, 101, 4, 4, 68, 77, 80, 84, 591, 596, 603, 609, 111, 116, 59, 1, 8857, 105, 110, 117, 115, 59, 1, 8854, 108, 117, 115, 59, 1, 8853, 105, 109, 101, 115, 59, 1, 8855, 111, 4, 2, 99, 115, 623, 646, 107, 119, 105, 115, 101, 67, 111, 110, 116, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 1, 8754, 101, 67, 117, 114, 108, 121, 4, 2, 68, 81, 658, 671, 111, 117, 98, 108, 101, 81, 117, 111, 116, 101, 59, 1, 8221, 117, 111, 116, 101, 59, 1, 8217, 4, 4, 108, 110, 112, 117, 688, 701, 736, 753, 111, 110, 4, 2, 59, 101, 696, 698, 1, 8759, 59, 1, 10868, 4, 3, 103, 105, 116, 709, 717, 722, 114, 117, 101, 110, 116, 59, 1, 8801, 110, 116, 59, 1, 8751, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 1, 8750, 4, 2, 102, 114, 742, 745, 59, 1, 8450, 111, 100, 117, 99, 116, 59, 1, 8720, 110, 116, 101, 114, 67, 108, 111, 99, 107, 119, 105, 115, 101, 67, 111, 110, 116, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 1, 8755, 111, 115, 115, 59, 1, 10799, 99, 114, 59, 3, 55349, 56478, 112, 4, 2, 59, 67, 803, 805, 1, 8915, 97, 112, 59, 1, 8781, 4, 11, 68, 74, 83, 90, 97, 99, 101, 102, 105, 111, 115, 834, 850, 855, 860, 865, 888, 903, 916, 921, 1011, 1415, 4, 2, 59, 111, 840, 842, 1, 8517, 116, 114, 97, 104, 100, 59, 1, 10513, 99, 121, 59, 1, 1026, 99, 121, 59, 1, 1029, 99, 121, 59, 1, 1039, 4, 3, 103, 114, 115, 873, 879, 883, 103, 101, 114, 59, 1, 8225, 114, 59, 1, 8609, 104, 118, 59, 1, 10980, 4, 2, 97, 121, 894, 900, 114, 111, 110, 59, 1, 270, 59, 1, 1044, 108, 4, 2, 59, 116, 910, 912, 1, 8711, 97, 59, 1, 916, 114, 59, 3, 55349, 56583, 4, 2, 97, 102, 927, 998, 4, 2, 99, 109, 933, 992, 114, 105, 116, 105, 99, 97, 108, 4, 4, 65, 68, 71, 84, 950, 957, 978, 985, 99, 117, 116, 101, 59, 1, 180, 111, 4, 2, 116, 117, 964, 967, 59, 1, 729, 98, 108, 101, 65, 99, 117, 116, 101, 59, 1, 733, 114, 97, 118, 101, 59, 1, 96, 105, 108, 100, 101, 59, 1, 732, 111, 110, 100, 59, 1, 8900, 102, 101, 114, 101, 110, 116, 105, 97, 108, 68, 59, 1, 8518, 4, 4, 112, 116, 117, 119, 1021, 1026, 1048, 1249, 102, 59, 3, 55349, 56635, 4, 3, 59, 68, 69, 1034, 1036, 1041, 1, 168, 111, 116, 59, 1, 8412, 113, 117, 97, 108, 59, 1, 8784, 98, 108, 101, 4, 6, 67, 68, 76, 82, 85, 86, 1065, 1082, 1101, 1189, 1211, 1236, 111, 110, 116, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 1, 8751, 111, 4, 2, 116, 119, 1089, 1092, 59, 1, 168, 110, 65, 114, 114, 111, 119, 59, 1, 8659, 4, 2, 101, 111, 1107, 1141, 102, 116, 4, 3, 65, 82, 84, 1117, 1124, 1136, 114, 114, 111, 119, 59, 1, 8656, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 8660, 101, 101, 59, 1, 10980, 110, 103, 4, 2, 76, 82, 1149, 1177, 101, 102, 116, 4, 2, 65, 82, 1158, 1165, 114, 114, 111, 119, 59, 1, 10232, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 10234, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 10233, 105, 103, 104, 116, 4, 2, 65, 84, 1199, 1206, 114, 114, 111, 119, 59, 1, 8658, 101, 101, 59, 1, 8872, 112, 4, 2, 65, 68, 1218, 1225, 114, 114, 111, 119, 59, 1, 8657, 111, 119, 110, 65, 114, 114, 111, 119, 59, 1, 8661, 101, 114, 116, 105, 99, 97, 108, 66, 97, 114, 59, 1, 8741, 110, 4, 6, 65, 66, 76, 82, 84, 97, 1264, 1292, 1299, 1352, 1391, 1408, 114, 114, 111, 119, 4, 3, 59, 66, 85, 1276, 1278, 1283, 1, 8595, 97, 114, 59, 1, 10515, 112, 65, 114, 114, 111, 119, 59, 1, 8693, 114, 101, 118, 101, 59, 1, 785, 101, 102, 116, 4, 3, 82, 84, 86, 1310, 1323, 1334, 105, 103, 104, 116, 86, 101, 99, 116, 111, 114, 59, 1, 10576, 101, 101, 86, 101, 99, 116, 111, 114, 59, 1, 10590, 101, 99, 116, 111, 114, 4, 2, 59, 66, 1345, 1347, 1, 8637, 97, 114, 59, 1, 10582, 105, 103, 104, 116, 4, 2, 84, 86, 1362, 1373, 101, 101, 86, 101, 99, 116, 111, 114, 59, 1, 10591, 101, 99, 116, 111, 114, 4, 2, 59, 66, 1384, 1386, 1, 8641, 97, 114, 59, 1, 10583, 101, 101, 4, 2, 59, 65, 1399, 1401, 1, 8868, 114, 114, 111, 119, 59, 1, 8615, 114, 114, 111, 119, 59, 1, 8659, 4, 2, 99, 116, 1421, 1426, 114, 59, 3, 55349, 56479, 114, 111, 107, 59, 1, 272, 4, 16, 78, 84, 97, 99, 100, 102, 103, 108, 109, 111, 112, 113, 115, 116, 117, 120, 1466, 1470, 1478, 1489, 1515, 1520, 1525, 1536, 1544, 1593, 1609, 1617, 1650, 1664, 1668, 1677, 71, 59, 1, 330, 72, 5, 208, 1, 59, 1476, 1, 208, 99, 117, 116, 101, 5, 201, 1, 59, 1487, 1, 201, 4, 3, 97, 105, 121, 1497, 1503, 1512, 114, 111, 110, 59, 1, 282, 114, 99, 5, 202, 1, 59, 1510, 1, 202, 59, 1, 1069, 111, 116, 59, 1, 278, 114, 59, 3, 55349, 56584, 114, 97, 118, 101, 5, 200, 1, 59, 1534, 1, 200, 101, 109, 101, 110, 116, 59, 1, 8712, 4, 2, 97, 112, 1550, 1555, 99, 114, 59, 1, 274, 116, 121, 4, 2, 83, 86, 1563, 1576, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 1, 9723, 101, 114, 121, 83, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 1, 9643, 4, 2, 103, 112, 1599, 1604, 111, 110, 59, 1, 280, 102, 59, 3, 55349, 56636, 115, 105, 108, 111, 110, 59, 1, 917, 117, 4, 2, 97, 105, 1624, 1640, 108, 4, 2, 59, 84, 1631, 1633, 1, 10869, 105, 108, 100, 101, 59, 1, 8770, 108, 105, 98, 114, 105, 117, 109, 59, 1, 8652, 4, 2, 99, 105, 1656, 1660, 114, 59, 1, 8496, 109, 59, 1, 10867, 97, 59, 1, 919, 109, 108, 5, 203, 1, 59, 1675, 1, 203, 4, 2, 105, 112, 1683, 1689, 115, 116, 115, 59, 1, 8707, 111, 110, 101, 110, 116, 105, 97, 108, 69, 59, 1, 8519, 4, 5, 99, 102, 105, 111, 115, 1713, 1717, 1722, 1762, 1791, 121, 59, 1, 1060, 114, 59, 3, 55349, 56585, 108, 108, 101, 100, 4, 2, 83, 86, 1732, 1745, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 1, 9724, 101, 114, 121, 83, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 1, 9642, 4, 3, 112, 114, 117, 1770, 1775, 1781, 102, 59, 3, 55349, 56637, 65, 108, 108, 59, 1, 8704, 114, 105, 101, 114, 116, 114, 102, 59, 1, 8497, 99, 114, 59, 1, 8497, 4, 12, 74, 84, 97, 98, 99, 100, 102, 103, 111, 114, 115, 116, 1822, 1827, 1834, 1848, 1855, 1877, 1882, 1887, 1890, 1896, 1978, 1984, 99, 121, 59, 1, 1027, 5, 62, 1, 59, 1832, 1, 62, 109, 109, 97, 4, 2, 59, 100, 1843, 1845, 1, 915, 59, 1, 988, 114, 101, 118, 101, 59, 1, 286, 4, 3, 101, 105, 121, 1863, 1869, 1874, 100, 105, 108, 59, 1, 290, 114, 99, 59, 1, 284, 59, 1, 1043, 111, 116, 59, 1, 288, 114, 59, 3, 55349, 56586, 59, 1, 8921, 112, 102, 59, 3, 55349, 56638, 101, 97, 116, 101, 114, 4, 6, 69, 70, 71, 76, 83, 84, 1915, 1933, 1944, 1953, 1959, 1971, 113, 117, 97, 108, 4, 2, 59, 76, 1925, 1927, 1, 8805, 101, 115, 115, 59, 1, 8923, 117, 108, 108, 69, 113, 117, 97, 108, 59, 1, 8807, 114, 101, 97, 116, 101, 114, 59, 1, 10914, 101, 115, 115, 59, 1, 8823, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 1, 10878, 105, 108, 100, 101, 59, 1, 8819, 99, 114, 59, 3, 55349, 56482, 59, 1, 8811, 4, 8, 65, 97, 99, 102, 105, 111, 115, 117, 2005, 2012, 2026, 2032, 2036, 2049, 2073, 2089, 82, 68, 99, 121, 59, 1, 1066, 4, 2, 99, 116, 2018, 2023, 101, 107, 59, 1, 711, 59, 1, 94, 105, 114, 99, 59, 1, 292, 114, 59, 1, 8460, 108, 98, 101, 114, 116, 83, 112, 97, 99, 101, 59, 1, 8459, 4, 2, 112, 114, 2055, 2059, 102, 59, 1, 8461, 105, 122, 111, 110, 116, 97, 108, 76, 105, 110, 101, 59, 1, 9472, 4, 2, 99, 116, 2079, 2083, 114, 59, 1, 8459, 114, 111, 107, 59, 1, 294, 109, 112, 4, 2, 68, 69, 2097, 2107, 111, 119, 110, 72, 117, 109, 112, 59, 1, 8782, 113, 117, 97, 108, 59, 1, 8783, 4, 14, 69, 74, 79, 97, 99, 100, 102, 103, 109, 110, 111, 115, 116, 117, 2144, 2149, 2155, 2160, 2171, 2189, 2194, 2198, 2209, 2245, 2307, 2329, 2334, 2341, 99, 121, 59, 1, 1045, 108, 105, 103, 59, 1, 306, 99, 121, 59, 1, 1025, 99, 117, 116, 101, 5, 205, 1, 59, 2169, 1, 205, 4, 2, 105, 121, 2177, 2186, 114, 99, 5, 206, 1, 59, 2184, 1, 206, 59, 1, 1048, 111, 116, 59, 1, 304, 114, 59, 1, 8465, 114, 97, 118, 101, 5, 204, 1, 59, 2207, 1, 204, 4, 3, 59, 97, 112, 2217, 2219, 2238, 1, 8465, 4, 2, 99, 103, 2225, 2229, 114, 59, 1, 298, 105, 110, 97, 114, 121, 73, 59, 1, 8520, 108, 105, 101, 115, 59, 1, 8658, 4, 2, 116, 118, 2251, 2281, 4, 2, 59, 101, 2257, 2259, 1, 8748, 4, 2, 103, 114, 2265, 2271, 114, 97, 108, 59, 1, 8747, 115, 101, 99, 116, 105, 111, 110, 59, 1, 8898, 105, 115, 105, 98, 108, 101, 4, 2, 67, 84, 2293, 2300, 111, 109, 109, 97, 59, 1, 8291, 105, 109, 101, 115, 59, 1, 8290, 4, 3, 103, 112, 116, 2315, 2320, 2325, 111, 110, 59, 1, 302, 102, 59, 3, 55349, 56640, 97, 59, 1, 921, 99, 114, 59, 1, 8464, 105, 108, 100, 101, 59, 1, 296, 4, 2, 107, 109, 2347, 2352, 99, 121, 59, 1, 1030, 108, 5, 207, 1, 59, 2358, 1, 207, 4, 5, 99, 102, 111, 115, 117, 2372, 2386, 2391, 2397, 2414, 4, 2, 105, 121, 2378, 2383, 114, 99, 59, 1, 308, 59, 1, 1049, 114, 59, 3, 55349, 56589, 112, 102, 59, 3, 55349, 56641, 4, 2, 99, 101, 2403, 2408, 114, 59, 3, 55349, 56485, 114, 99, 121, 59, 1, 1032, 107, 99, 121, 59, 1, 1028, 4, 7, 72, 74, 97, 99, 102, 111, 115, 2436, 2441, 2446, 2452, 2467, 2472, 2478, 99, 121, 59, 1, 1061, 99, 121, 59, 1, 1036, 112, 112, 97, 59, 1, 922, 4, 2, 101, 121, 2458, 2464, 100, 105, 108, 59, 1, 310, 59, 1, 1050, 114, 59, 3, 55349, 56590, 112, 102, 59, 3, 55349, 56642, 99, 114, 59, 3, 55349, 56486, 4, 11, 74, 84, 97, 99, 101, 102, 108, 109, 111, 115, 116, 2508, 2513, 2520, 2562, 2585, 2981, 2986, 3004, 3011, 3146, 3167, 99, 121, 59, 1, 1033, 5, 60, 1, 59, 2518, 1, 60, 4, 5, 99, 109, 110, 112, 114, 2532, 2538, 2544, 2548, 2558, 117, 116, 101, 59, 1, 313, 98, 100, 97, 59, 1, 923, 103, 59, 1, 10218, 108, 97, 99, 101, 116, 114, 102, 59, 1, 8466, 114, 59, 1, 8606, 4, 3, 97, 101, 121, 2570, 2576, 2582, 114, 111, 110, 59, 1, 317, 100, 105, 108, 59, 1, 315, 59, 1, 1051, 4, 2, 102, 115, 2591, 2907, 116, 4, 10, 65, 67, 68, 70, 82, 84, 85, 86, 97, 114, 2614, 2663, 2672, 2728, 2735, 2760, 2820, 2870, 2888, 2895, 4, 2, 110, 114, 2620, 2633, 103, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 1, 10216, 114, 111, 119, 4, 3, 59, 66, 82, 2644, 2646, 2651, 1, 8592, 97, 114, 59, 1, 8676, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 8646, 101, 105, 108, 105, 110, 103, 59, 1, 8968, 111, 4, 2, 117, 119, 2679, 2692, 98, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 1, 10214, 110, 4, 2, 84, 86, 2699, 2710, 101, 101, 86, 101, 99, 116, 111, 114, 59, 1, 10593, 101, 99, 116, 111, 114, 4, 2, 59, 66, 2721, 2723, 1, 8643, 97, 114, 59, 1, 10585, 108, 111, 111, 114, 59, 1, 8970, 105, 103, 104, 116, 4, 2, 65, 86, 2745, 2752, 114, 114, 111, 119, 59, 1, 8596, 101, 99, 116, 111, 114, 59, 1, 10574, 4, 2, 101, 114, 2766, 2792, 101, 4, 3, 59, 65, 86, 2775, 2777, 2784, 1, 8867, 114, 114, 111, 119, 59, 1, 8612, 101, 99, 116, 111, 114, 59, 1, 10586, 105, 97, 110, 103, 108, 101, 4, 3, 59, 66, 69, 2806, 2808, 2813, 1, 8882, 97, 114, 59, 1, 10703, 113, 117, 97, 108, 59, 1, 8884, 112, 4, 3, 68, 84, 86, 2829, 2841, 2852, 111, 119, 110, 86, 101, 99, 116, 111, 114, 59, 1, 10577, 101, 101, 86, 101, 99, 116, 111, 114, 59, 1, 10592, 101, 99, 116, 111, 114, 4, 2, 59, 66, 2863, 2865, 1, 8639, 97, 114, 59, 1, 10584, 101, 99, 116, 111, 114, 4, 2, 59, 66, 2881, 2883, 1, 8636, 97, 114, 59, 1, 10578, 114, 114, 111, 119, 59, 1, 8656, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8660, 115, 4, 6, 69, 70, 71, 76, 83, 84, 2922, 2936, 2947, 2956, 2962, 2974, 113, 117, 97, 108, 71, 114, 101, 97, 116, 101, 114, 59, 1, 8922, 117, 108, 108, 69, 113, 117, 97, 108, 59, 1, 8806, 114, 101, 97, 116, 101, 114, 59, 1, 8822, 101, 115, 115, 59, 1, 10913, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 1, 10877, 105, 108, 100, 101, 59, 1, 8818, 114, 59, 3, 55349, 56591, 4, 2, 59, 101, 2992, 2994, 1, 8920, 102, 116, 97, 114, 114, 111, 119, 59, 1, 8666, 105, 100, 111, 116, 59, 1, 319, 4, 3, 110, 112, 119, 3019, 3110, 3115, 103, 4, 4, 76, 82, 108, 114, 3030, 3058, 3070, 3098, 101, 102, 116, 4, 2, 65, 82, 3039, 3046, 114, 114, 111, 119, 59, 1, 10229, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 10231, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 10230, 101, 102, 116, 4, 2, 97, 114, 3079, 3086, 114, 114, 111, 119, 59, 1, 10232, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 10234, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 10233, 102, 59, 3, 55349, 56643, 101, 114, 4, 2, 76, 82, 3123, 3134, 101, 102, 116, 65, 114, 114, 111, 119, 59, 1, 8601, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 8600, 4, 3, 99, 104, 116, 3154, 3158, 3161, 114, 59, 1, 8466, 59, 1, 8624, 114, 111, 107, 59, 1, 321, 59, 1, 8810, 4, 8, 97, 99, 101, 102, 105, 111, 115, 117, 3188, 3192, 3196, 3222, 3227, 3237, 3243, 3248, 112, 59, 1, 10501, 121, 59, 1, 1052, 4, 2, 100, 108, 3202, 3213, 105, 117, 109, 83, 112, 97, 99, 101, 59, 1, 8287, 108, 105, 110, 116, 114, 102, 59, 1, 8499, 114, 59, 3, 55349, 56592, 110, 117, 115, 80, 108, 117, 115, 59, 1, 8723, 112, 102, 59, 3, 55349, 56644, 99, 114, 59, 1, 8499, 59, 1, 924, 4, 9, 74, 97, 99, 101, 102, 111, 115, 116, 117, 3271, 3276, 3283, 3306, 3422, 3427, 4120, 4126, 4137, 99, 121, 59, 1, 1034, 99, 117, 116, 101, 59, 1, 323, 4, 3, 97, 101, 121, 3291, 3297, 3303, 114, 111, 110, 59, 1, 327, 100, 105, 108, 59, 1, 325, 59, 1, 1053, 4, 3, 103, 115, 119, 3314, 3380, 3415, 97, 116, 105, 118, 101, 4, 3, 77, 84, 86, 3327, 3340, 3365, 101, 100, 105, 117, 109, 83, 112, 97, 99, 101, 59, 1, 8203, 104, 105, 4, 2, 99, 110, 3348, 3357, 107, 83, 112, 97, 99, 101, 59, 1, 8203, 83, 112, 97, 99, 101, 59, 1, 8203, 101, 114, 121, 84, 104, 105, 110, 83, 112, 97, 99, 101, 59, 1, 8203, 116, 101, 100, 4, 2, 71, 76, 3389, 3405, 114, 101, 97, 116, 101, 114, 71, 114, 101, 97, 116, 101, 114, 59, 1, 8811, 101, 115, 115, 76, 101, 115, 115, 59, 1, 8810, 76, 105, 110, 101, 59, 1, 10, 114, 59, 3, 55349, 56593, 4, 4, 66, 110, 112, 116, 3437, 3444, 3460, 3464, 114, 101, 97, 107, 59, 1, 8288, 66, 114, 101, 97, 107, 105, 110, 103, 83, 112, 97, 99, 101, 59, 1, 160, 102, 59, 1, 8469, 4, 13, 59, 67, 68, 69, 71, 72, 76, 78, 80, 82, 83, 84, 86, 3492, 3494, 3517, 3536, 3578, 3657, 3685, 3784, 3823, 3860, 3915, 4066, 4107, 1, 10988, 4, 2, 111, 117, 3500, 3510, 110, 103, 114, 117, 101, 110, 116, 59, 1, 8802, 112, 67, 97, 112, 59, 1, 8813, 111, 117, 98, 108, 101, 86, 101, 114, 116, 105, 99, 97, 108, 66, 97, 114, 59, 1, 8742, 4, 3, 108, 113, 120, 3544, 3552, 3571, 101, 109, 101, 110, 116, 59, 1, 8713, 117, 97, 108, 4, 2, 59, 84, 3561, 3563, 1, 8800, 105, 108, 100, 101, 59, 3, 8770, 824, 105, 115, 116, 115, 59, 1, 8708, 114, 101, 97, 116, 101, 114, 4, 7, 59, 69, 70, 71, 76, 83, 84, 3600, 3602, 3609, 3621, 3631, 3637, 3650, 1, 8815, 113, 117, 97, 108, 59, 1, 8817, 117, 108, 108, 69, 113, 117, 97, 108, 59, 3, 8807, 824, 114, 101, 97, 116, 101, 114, 59, 3, 8811, 824, 101, 115, 115, 59, 1, 8825, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 3, 10878, 824, 105, 108, 100, 101, 59, 1, 8821, 117, 109, 112, 4, 2, 68, 69, 3666, 3677, 111, 119, 110, 72, 117, 109, 112, 59, 3, 8782, 824, 113, 117, 97, 108, 59, 3, 8783, 824, 101, 4, 2, 102, 115, 3692, 3724, 116, 84, 114, 105, 97, 110, 103, 108, 101, 4, 3, 59, 66, 69, 3709, 3711, 3717, 1, 8938, 97, 114, 59, 3, 10703, 824, 113, 117, 97, 108, 59, 1, 8940, 115, 4, 6, 59, 69, 71, 76, 83, 84, 3739, 3741, 3748, 3757, 3764, 3777, 1, 8814, 113, 117, 97, 108, 59, 1, 8816, 114, 101, 97, 116, 101, 114, 59, 1, 8824, 101, 115, 115, 59, 3, 8810, 824, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 3, 10877, 824, 105, 108, 100, 101, 59, 1, 8820, 101, 115, 116, 101, 100, 4, 2, 71, 76, 3795, 3812, 114, 101, 97, 116, 101, 114, 71, 114, 101, 97, 116, 101, 114, 59, 3, 10914, 824, 101, 115, 115, 76, 101, 115, 115, 59, 3, 10913, 824, 114, 101, 99, 101, 100, 101, 115, 4, 3, 59, 69, 83, 3838, 3840, 3848, 1, 8832, 113, 117, 97, 108, 59, 3, 10927, 824, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 1, 8928, 4, 2, 101, 105, 3866, 3881, 118, 101, 114, 115, 101, 69, 108, 101, 109, 101, 110, 116, 59, 1, 8716, 103, 104, 116, 84, 114, 105, 97, 110, 103, 108, 101, 4, 3, 59, 66, 69, 3900, 3902, 3908, 1, 8939, 97, 114, 59, 3, 10704, 824, 113, 117, 97, 108, 59, 1, 8941, 4, 2, 113, 117, 3921, 3973, 117, 97, 114, 101, 83, 117, 4, 2, 98, 112, 3933, 3952, 115, 101, 116, 4, 2, 59, 69, 3942, 3945, 3, 8847, 824, 113, 117, 97, 108, 59, 1, 8930, 101, 114, 115, 101, 116, 4, 2, 59, 69, 3963, 3966, 3, 8848, 824, 113, 117, 97, 108, 59, 1, 8931, 4, 3, 98, 99, 112, 3981, 4e3, 4045, 115, 101, 116, 4, 2, 59, 69, 3990, 3993, 3, 8834, 8402, 113, 117, 97, 108, 59, 1, 8840, 99, 101, 101, 100, 115, 4, 4, 59, 69, 83, 84, 4015, 4017, 4025, 4037, 1, 8833, 113, 117, 97, 108, 59, 3, 10928, 824, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 1, 8929, 105, 108, 100, 101, 59, 3, 8831, 824, 101, 114, 115, 101, 116, 4, 2, 59, 69, 4056, 4059, 3, 8835, 8402, 113, 117, 97, 108, 59, 1, 8841, 105, 108, 100, 101, 4, 4, 59, 69, 70, 84, 4080, 4082, 4089, 4100, 1, 8769, 113, 117, 97, 108, 59, 1, 8772, 117, 108, 108, 69, 113, 117, 97, 108, 59, 1, 8775, 105, 108, 100, 101, 59, 1, 8777, 101, 114, 116, 105, 99, 97, 108, 66, 97, 114, 59, 1, 8740, 99, 114, 59, 3, 55349, 56489, 105, 108, 100, 101, 5, 209, 1, 59, 4135, 1, 209, 59, 1, 925, 4, 14, 69, 97, 99, 100, 102, 103, 109, 111, 112, 114, 115, 116, 117, 118, 4170, 4176, 4187, 4205, 4212, 4217, 4228, 4253, 4259, 4292, 4295, 4316, 4337, 4346, 108, 105, 103, 59, 1, 338, 99, 117, 116, 101, 5, 211, 1, 59, 4185, 1, 211, 4, 2, 105, 121, 4193, 4202, 114, 99, 5, 212, 1, 59, 4200, 1, 212, 59, 1, 1054, 98, 108, 97, 99, 59, 1, 336, 114, 59, 3, 55349, 56594, 114, 97, 118, 101, 5, 210, 1, 59, 4226, 1, 210, 4, 3, 97, 101, 105, 4236, 4241, 4246, 99, 114, 59, 1, 332, 103, 97, 59, 1, 937, 99, 114, 111, 110, 59, 1, 927, 112, 102, 59, 3, 55349, 56646, 101, 110, 67, 117, 114, 108, 121, 4, 2, 68, 81, 4272, 4285, 111, 117, 98, 108, 101, 81, 117, 111, 116, 101, 59, 1, 8220, 117, 111, 116, 101, 59, 1, 8216, 59, 1, 10836, 4, 2, 99, 108, 4301, 4306, 114, 59, 3, 55349, 56490, 97, 115, 104, 5, 216, 1, 59, 4314, 1, 216, 105, 4, 2, 108, 109, 4323, 4332, 100, 101, 5, 213, 1, 59, 4330, 1, 213, 101, 115, 59, 1, 10807, 109, 108, 5, 214, 1, 59, 4344, 1, 214, 101, 114, 4, 2, 66, 80, 4354, 4380, 4, 2, 97, 114, 4360, 4364, 114, 59, 1, 8254, 97, 99, 4, 2, 101, 107, 4372, 4375, 59, 1, 9182, 101, 116, 59, 1, 9140, 97, 114, 101, 110, 116, 104, 101, 115, 105, 115, 59, 1, 9180, 4, 9, 97, 99, 102, 104, 105, 108, 111, 114, 115, 4413, 4422, 4426, 4431, 4435, 4438, 4448, 4471, 4561, 114, 116, 105, 97, 108, 68, 59, 1, 8706, 121, 59, 1, 1055, 114, 59, 3, 55349, 56595, 105, 59, 1, 934, 59, 1, 928, 117, 115, 77, 105, 110, 117, 115, 59, 1, 177, 4, 2, 105, 112, 4454, 4467, 110, 99, 97, 114, 101, 112, 108, 97, 110, 101, 59, 1, 8460, 102, 59, 1, 8473, 4, 4, 59, 101, 105, 111, 4481, 4483, 4526, 4531, 1, 10939, 99, 101, 100, 101, 115, 4, 4, 59, 69, 83, 84, 4498, 4500, 4507, 4519, 1, 8826, 113, 117, 97, 108, 59, 1, 10927, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 1, 8828, 105, 108, 100, 101, 59, 1, 8830, 109, 101, 59, 1, 8243, 4, 2, 100, 112, 4537, 4543, 117, 99, 116, 59, 1, 8719, 111, 114, 116, 105, 111, 110, 4, 2, 59, 97, 4555, 4557, 1, 8759, 108, 59, 1, 8733, 4, 2, 99, 105, 4567, 4572, 114, 59, 3, 55349, 56491, 59, 1, 936, 4, 4, 85, 102, 111, 115, 4585, 4594, 4599, 4604, 79, 84, 5, 34, 1, 59, 4592, 1, 34, 114, 59, 3, 55349, 56596, 112, 102, 59, 1, 8474, 99, 114, 59, 3, 55349, 56492, 4, 12, 66, 69, 97, 99, 101, 102, 104, 105, 111, 114, 115, 117, 4636, 4642, 4650, 4681, 4704, 4763, 4767, 4771, 5047, 5069, 5081, 5094, 97, 114, 114, 59, 1, 10512, 71, 5, 174, 1, 59, 4648, 1, 174, 4, 3, 99, 110, 114, 4658, 4664, 4668, 117, 116, 101, 59, 1, 340, 103, 59, 1, 10219, 114, 4, 2, 59, 116, 4675, 4677, 1, 8608, 108, 59, 1, 10518, 4, 3, 97, 101, 121, 4689, 4695, 4701, 114, 111, 110, 59, 1, 344, 100, 105, 108, 59, 1, 342, 59, 1, 1056, 4, 2, 59, 118, 4710, 4712, 1, 8476, 101, 114, 115, 101, 4, 2, 69, 85, 4722, 4748, 4, 2, 108, 113, 4728, 4736, 101, 109, 101, 110, 116, 59, 1, 8715, 117, 105, 108, 105, 98, 114, 105, 117, 109, 59, 1, 8651, 112, 69, 113, 117, 105, 108, 105, 98, 114, 105, 117, 109, 59, 1, 10607, 114, 59, 1, 8476, 111, 59, 1, 929, 103, 104, 116, 4, 8, 65, 67, 68, 70, 84, 85, 86, 97, 4792, 4840, 4849, 4905, 4912, 4972, 5022, 5040, 4, 2, 110, 114, 4798, 4811, 103, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 1, 10217, 114, 111, 119, 4, 3, 59, 66, 76, 4822, 4824, 4829, 1, 8594, 97, 114, 59, 1, 8677, 101, 102, 116, 65, 114, 114, 111, 119, 59, 1, 8644, 101, 105, 108, 105, 110, 103, 59, 1, 8969, 111, 4, 2, 117, 119, 4856, 4869, 98, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 1, 10215, 110, 4, 2, 84, 86, 4876, 4887, 101, 101, 86, 101, 99, 116, 111, 114, 59, 1, 10589, 101, 99, 116, 111, 114, 4, 2, 59, 66, 4898, 4900, 1, 8642, 97, 114, 59, 1, 10581, 108, 111, 111, 114, 59, 1, 8971, 4, 2, 101, 114, 4918, 4944, 101, 4, 3, 59, 65, 86, 4927, 4929, 4936, 1, 8866, 114, 114, 111, 119, 59, 1, 8614, 101, 99, 116, 111, 114, 59, 1, 10587, 105, 97, 110, 103, 108, 101, 4, 3, 59, 66, 69, 4958, 4960, 4965, 1, 8883, 97, 114, 59, 1, 10704, 113, 117, 97, 108, 59, 1, 8885, 112, 4, 3, 68, 84, 86, 4981, 4993, 5004, 111, 119, 110, 86, 101, 99, 116, 111, 114, 59, 1, 10575, 101, 101, 86, 101, 99, 116, 111, 114, 59, 1, 10588, 101, 99, 116, 111, 114, 4, 2, 59, 66, 5015, 5017, 1, 8638, 97, 114, 59, 1, 10580, 101, 99, 116, 111, 114, 4, 2, 59, 66, 5033, 5035, 1, 8640, 97, 114, 59, 1, 10579, 114, 114, 111, 119, 59, 1, 8658, 4, 2, 112, 117, 5053, 5057, 102, 59, 1, 8477, 110, 100, 73, 109, 112, 108, 105, 101, 115, 59, 1, 10608, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8667, 4, 2, 99, 104, 5087, 5091, 114, 59, 1, 8475, 59, 1, 8625, 108, 101, 68, 101, 108, 97, 121, 101, 100, 59, 1, 10740, 4, 13, 72, 79, 97, 99, 102, 104, 105, 109, 111, 113, 115, 116, 117, 5134, 5150, 5157, 5164, 5198, 5203, 5259, 5265, 5277, 5283, 5374, 5380, 5385, 4, 2, 67, 99, 5140, 5146, 72, 99, 121, 59, 1, 1065, 121, 59, 1, 1064, 70, 84, 99, 121, 59, 1, 1068, 99, 117, 116, 101, 59, 1, 346, 4, 5, 59, 97, 101, 105, 121, 5176, 5178, 5184, 5190, 5195, 1, 10940, 114, 111, 110, 59, 1, 352, 100, 105, 108, 59, 1, 350, 114, 99, 59, 1, 348, 59, 1, 1057, 114, 59, 3, 55349, 56598, 111, 114, 116, 4, 4, 68, 76, 82, 85, 5216, 5227, 5238, 5250, 111, 119, 110, 65, 114, 114, 111, 119, 59, 1, 8595, 101, 102, 116, 65, 114, 114, 111, 119, 59, 1, 8592, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 8594, 112, 65, 114, 114, 111, 119, 59, 1, 8593, 103, 109, 97, 59, 1, 931, 97, 108, 108, 67, 105, 114, 99, 108, 101, 59, 1, 8728, 112, 102, 59, 3, 55349, 56650, 4, 2, 114, 117, 5289, 5293, 116, 59, 1, 8730, 97, 114, 101, 4, 4, 59, 73, 83, 85, 5306, 5308, 5322, 5367, 1, 9633, 110, 116, 101, 114, 115, 101, 99, 116, 105, 111, 110, 59, 1, 8851, 117, 4, 2, 98, 112, 5329, 5347, 115, 101, 116, 4, 2, 59, 69, 5338, 5340, 1, 8847, 113, 117, 97, 108, 59, 1, 8849, 101, 114, 115, 101, 116, 4, 2, 59, 69, 5358, 5360, 1, 8848, 113, 117, 97, 108, 59, 1, 8850, 110, 105, 111, 110, 59, 1, 8852, 99, 114, 59, 3, 55349, 56494, 97, 114, 59, 1, 8902, 4, 4, 98, 99, 109, 112, 5395, 5420, 5475, 5478, 4, 2, 59, 115, 5401, 5403, 1, 8912, 101, 116, 4, 2, 59, 69, 5411, 5413, 1, 8912, 113, 117, 97, 108, 59, 1, 8838, 4, 2, 99, 104, 5426, 5468, 101, 101, 100, 115, 4, 4, 59, 69, 83, 84, 5440, 5442, 5449, 5461, 1, 8827, 113, 117, 97, 108, 59, 1, 10928, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 1, 8829, 105, 108, 100, 101, 59, 1, 8831, 84, 104, 97, 116, 59, 1, 8715, 59, 1, 8721, 4, 3, 59, 101, 115, 5486, 5488, 5507, 1, 8913, 114, 115, 101, 116, 4, 2, 59, 69, 5498, 5500, 1, 8835, 113, 117, 97, 108, 59, 1, 8839, 101, 116, 59, 1, 8913, 4, 11, 72, 82, 83, 97, 99, 102, 104, 105, 111, 114, 115, 5536, 5546, 5552, 5567, 5579, 5602, 5607, 5655, 5695, 5701, 5711, 79, 82, 78, 5, 222, 1, 59, 5544, 1, 222, 65, 68, 69, 59, 1, 8482, 4, 2, 72, 99, 5558, 5563, 99, 121, 59, 1, 1035, 121, 59, 1, 1062, 4, 2, 98, 117, 5573, 5576, 59, 1, 9, 59, 1, 932, 4, 3, 97, 101, 121, 5587, 5593, 5599, 114, 111, 110, 59, 1, 356, 100, 105, 108, 59, 1, 354, 59, 1, 1058, 114, 59, 3, 55349, 56599, 4, 2, 101, 105, 5613, 5631, 4, 2, 114, 116, 5619, 5627, 101, 102, 111, 114, 101, 59, 1, 8756, 97, 59, 1, 920, 4, 2, 99, 110, 5637, 5647, 107, 83, 112, 97, 99, 101, 59, 3, 8287, 8202, 83, 112, 97, 99, 101, 59, 1, 8201, 108, 100, 101, 4, 4, 59, 69, 70, 84, 5668, 5670, 5677, 5688, 1, 8764, 113, 117, 97, 108, 59, 1, 8771, 117, 108, 108, 69, 113, 117, 97, 108, 59, 1, 8773, 105, 108, 100, 101, 59, 1, 8776, 112, 102, 59, 3, 55349, 56651, 105, 112, 108, 101, 68, 111, 116, 59, 1, 8411, 4, 2, 99, 116, 5717, 5722, 114, 59, 3, 55349, 56495, 114, 111, 107, 59, 1, 358, 4, 14, 97, 98, 99, 100, 102, 103, 109, 110, 111, 112, 114, 115, 116, 117, 5758, 5789, 5805, 5823, 5830, 5835, 5846, 5852, 5921, 5937, 6089, 6095, 6101, 6108, 4, 2, 99, 114, 5764, 5774, 117, 116, 101, 5, 218, 1, 59, 5772, 1, 218, 114, 4, 2, 59, 111, 5781, 5783, 1, 8607, 99, 105, 114, 59, 1, 10569, 114, 4, 2, 99, 101, 5796, 5800, 121, 59, 1, 1038, 118, 101, 59, 1, 364, 4, 2, 105, 121, 5811, 5820, 114, 99, 5, 219, 1, 59, 5818, 1, 219, 59, 1, 1059, 98, 108, 97, 99, 59, 1, 368, 114, 59, 3, 55349, 56600, 114, 97, 118, 101, 5, 217, 1, 59, 5844, 1, 217, 97, 99, 114, 59, 1, 362, 4, 2, 100, 105, 5858, 5905, 101, 114, 4, 2, 66, 80, 5866, 5892, 4, 2, 97, 114, 5872, 5876, 114, 59, 1, 95, 97, 99, 4, 2, 101, 107, 5884, 5887, 59, 1, 9183, 101, 116, 59, 1, 9141, 97, 114, 101, 110, 116, 104, 101, 115, 105, 115, 59, 1, 9181, 111, 110, 4, 2, 59, 80, 5913, 5915, 1, 8899, 108, 117, 115, 59, 1, 8846, 4, 2, 103, 112, 5927, 5932, 111, 110, 59, 1, 370, 102, 59, 3, 55349, 56652, 4, 8, 65, 68, 69, 84, 97, 100, 112, 115, 5955, 5985, 5996, 6009, 6026, 6033, 6044, 6075, 114, 114, 111, 119, 4, 3, 59, 66, 68, 5967, 5969, 5974, 1, 8593, 97, 114, 59, 1, 10514, 111, 119, 110, 65, 114, 114, 111, 119, 59, 1, 8645, 111, 119, 110, 65, 114, 114, 111, 119, 59, 1, 8597, 113, 117, 105, 108, 105, 98, 114, 105, 117, 109, 59, 1, 10606, 101, 101, 4, 2, 59, 65, 6017, 6019, 1, 8869, 114, 114, 111, 119, 59, 1, 8613, 114, 114, 111, 119, 59, 1, 8657, 111, 119, 110, 97, 114, 114, 111, 119, 59, 1, 8661, 101, 114, 4, 2, 76, 82, 6052, 6063, 101, 102, 116, 65, 114, 114, 111, 119, 59, 1, 8598, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 1, 8599, 105, 4, 2, 59, 108, 6082, 6084, 1, 978, 111, 110, 59, 1, 933, 105, 110, 103, 59, 1, 366, 99, 114, 59, 3, 55349, 56496, 105, 108, 100, 101, 59, 1, 360, 109, 108, 5, 220, 1, 59, 6115, 1, 220, 4, 9, 68, 98, 99, 100, 101, 102, 111, 115, 118, 6137, 6143, 6148, 6152, 6166, 6250, 6255, 6261, 6267, 97, 115, 104, 59, 1, 8875, 97, 114, 59, 1, 10987, 121, 59, 1, 1042, 97, 115, 104, 4, 2, 59, 108, 6161, 6163, 1, 8873, 59, 1, 10982, 4, 2, 101, 114, 6172, 6175, 59, 1, 8897, 4, 3, 98, 116, 121, 6183, 6188, 6238, 97, 114, 59, 1, 8214, 4, 2, 59, 105, 6194, 6196, 1, 8214, 99, 97, 108, 4, 4, 66, 76, 83, 84, 6209, 6214, 6220, 6231, 97, 114, 59, 1, 8739, 105, 110, 101, 59, 1, 124, 101, 112, 97, 114, 97, 116, 111, 114, 59, 1, 10072, 105, 108, 100, 101, 59, 1, 8768, 84, 104, 105, 110, 83, 112, 97, 99, 101, 59, 1, 8202, 114, 59, 3, 55349, 56601, 112, 102, 59, 3, 55349, 56653, 99, 114, 59, 3, 55349, 56497, 100, 97, 115, 104, 59, 1, 8874, 4, 5, 99, 101, 102, 111, 115, 6286, 6292, 6298, 6303, 6309, 105, 114, 99, 59, 1, 372, 100, 103, 101, 59, 1, 8896, 114, 59, 3, 55349, 56602, 112, 102, 59, 3, 55349, 56654, 99, 114, 59, 3, 55349, 56498, 4, 4, 102, 105, 111, 115, 6325, 6330, 6333, 6339, 114, 59, 3, 55349, 56603, 59, 1, 926, 112, 102, 59, 3, 55349, 56655, 99, 114, 59, 3, 55349, 56499, 4, 9, 65, 73, 85, 97, 99, 102, 111, 115, 117, 6365, 6370, 6375, 6380, 6391, 6405, 6410, 6416, 6422, 99, 121, 59, 1, 1071, 99, 121, 59, 1, 1031, 99, 121, 59, 1, 1070, 99, 117, 116, 101, 5, 221, 1, 59, 6389, 1, 221, 4, 2, 105, 121, 6397, 6402, 114, 99, 59, 1, 374, 59, 1, 1067, 114, 59, 3, 55349, 56604, 112, 102, 59, 3, 55349, 56656, 99, 114, 59, 3, 55349, 56500, 109, 108, 59, 1, 376, 4, 8, 72, 97, 99, 100, 101, 102, 111, 115, 6445, 6450, 6457, 6472, 6477, 6501, 6505, 6510, 99, 121, 59, 1, 1046, 99, 117, 116, 101, 59, 1, 377, 4, 2, 97, 121, 6463, 6469, 114, 111, 110, 59, 1, 381, 59, 1, 1047, 111, 116, 59, 1, 379, 4, 2, 114, 116, 6483, 6497, 111, 87, 105, 100, 116, 104, 83, 112, 97, 99, 101, 59, 1, 8203, 97, 59, 1, 918, 114, 59, 1, 8488, 112, 102, 59, 1, 8484, 99, 114, 59, 3, 55349, 56501, 4, 16, 97, 98, 99, 101, 102, 103, 108, 109, 110, 111, 112, 114, 115, 116, 117, 119, 6550, 6561, 6568, 6612, 6622, 6634, 6645, 6672, 6699, 6854, 6870, 6923, 6933, 6963, 6974, 6983, 99, 117, 116, 101, 5, 225, 1, 59, 6559, 1, 225, 114, 101, 118, 101, 59, 1, 259, 4, 6, 59, 69, 100, 105, 117, 121, 6582, 6584, 6588, 6591, 6600, 6609, 1, 8766, 59, 3, 8766, 819, 59, 1, 8767, 114, 99, 5, 226, 1, 59, 6598, 1, 226, 116, 101, 5, 180, 1, 59, 6607, 1, 180, 59, 1, 1072, 108, 105, 103, 5, 230, 1, 59, 6620, 1, 230, 4, 2, 59, 114, 6628, 6630, 1, 8289, 59, 3, 55349, 56606, 114, 97, 118, 101, 5, 224, 1, 59, 6643, 1, 224, 4, 2, 101, 112, 6651, 6667, 4, 2, 102, 112, 6657, 6663, 115, 121, 109, 59, 1, 8501, 104, 59, 1, 8501, 104, 97, 59, 1, 945, 4, 2, 97, 112, 6678, 6692, 4, 2, 99, 108, 6684, 6688, 114, 59, 1, 257, 103, 59, 1, 10815, 5, 38, 1, 59, 6697, 1, 38, 4, 2, 100, 103, 6705, 6737, 4, 5, 59, 97, 100, 115, 118, 6717, 6719, 6724, 6727, 6734, 1, 8743, 110, 100, 59, 1, 10837, 59, 1, 10844, 108, 111, 112, 101, 59, 1, 10840, 59, 1, 10842, 4, 7, 59, 101, 108, 109, 114, 115, 122, 6753, 6755, 6758, 6762, 6814, 6835, 6848, 1, 8736, 59, 1, 10660, 101, 59, 1, 8736, 115, 100, 4, 2, 59, 97, 6770, 6772, 1, 8737, 4, 8, 97, 98, 99, 100, 101, 102, 103, 104, 6790, 6793, 6796, 6799, 6802, 6805, 6808, 6811, 59, 1, 10664, 59, 1, 10665, 59, 1, 10666, 59, 1, 10667, 59, 1, 10668, 59, 1, 10669, 59, 1, 10670, 59, 1, 10671, 116, 4, 2, 59, 118, 6821, 6823, 1, 8735, 98, 4, 2, 59, 100, 6830, 6832, 1, 8894, 59, 1, 10653, 4, 2, 112, 116, 6841, 6845, 104, 59, 1, 8738, 59, 1, 197, 97, 114, 114, 59, 1, 9084, 4, 2, 103, 112, 6860, 6865, 111, 110, 59, 1, 261, 102, 59, 3, 55349, 56658, 4, 7, 59, 69, 97, 101, 105, 111, 112, 6886, 6888, 6891, 6897, 6900, 6904, 6908, 1, 8776, 59, 1, 10864, 99, 105, 114, 59, 1, 10863, 59, 1, 8778, 100, 59, 1, 8779, 115, 59, 1, 39, 114, 111, 120, 4, 2, 59, 101, 6917, 6919, 1, 8776, 113, 59, 1, 8778, 105, 110, 103, 5, 229, 1, 59, 6931, 1, 229, 4, 3, 99, 116, 121, 6941, 6946, 6949, 114, 59, 3, 55349, 56502, 59, 1, 42, 109, 112, 4, 2, 59, 101, 6957, 6959, 1, 8776, 113, 59, 1, 8781, 105, 108, 100, 101, 5, 227, 1, 59, 6972, 1, 227, 109, 108, 5, 228, 1, 59, 6981, 1, 228, 4, 2, 99, 105, 6989, 6997, 111, 110, 105, 110, 116, 59, 1, 8755, 110, 116, 59, 1, 10769, 4, 16, 78, 97, 98, 99, 100, 101, 102, 105, 107, 108, 110, 111, 112, 114, 115, 117, 7036, 7041, 7119, 7135, 7149, 7155, 7219, 7224, 7347, 7354, 7463, 7489, 7786, 7793, 7814, 7866, 111, 116, 59, 1, 10989, 4, 2, 99, 114, 7047, 7094, 107, 4, 4, 99, 101, 112, 115, 7058, 7064, 7073, 7080, 111, 110, 103, 59, 1, 8780, 112, 115, 105, 108, 111, 110, 59, 1, 1014, 114, 105, 109, 101, 59, 1, 8245, 105, 109, 4, 2, 59, 101, 7088, 7090, 1, 8765, 113, 59, 1, 8909, 4, 2, 118, 119, 7100, 7105, 101, 101, 59, 1, 8893, 101, 100, 4, 2, 59, 103, 7113, 7115, 1, 8965, 101, 59, 1, 8965, 114, 107, 4, 2, 59, 116, 7127, 7129, 1, 9141, 98, 114, 107, 59, 1, 9142, 4, 2, 111, 121, 7141, 7146, 110, 103, 59, 1, 8780, 59, 1, 1073, 113, 117, 111, 59, 1, 8222, 4, 5, 99, 109, 112, 114, 116, 7167, 7181, 7188, 7193, 7199, 97, 117, 115, 4, 2, 59, 101, 7176, 7178, 1, 8757, 59, 1, 8757, 112, 116, 121, 118, 59, 1, 10672, 115, 105, 59, 1, 1014, 110, 111, 117, 59, 1, 8492, 4, 3, 97, 104, 119, 7207, 7210, 7213, 59, 1, 946, 59, 1, 8502, 101, 101, 110, 59, 1, 8812, 114, 59, 3, 55349, 56607, 103, 4, 7, 99, 111, 115, 116, 117, 118, 119, 7241, 7262, 7288, 7305, 7328, 7335, 7340, 4, 3, 97, 105, 117, 7249, 7253, 7258, 112, 59, 1, 8898, 114, 99, 59, 1, 9711, 112, 59, 1, 8899, 4, 3, 100, 112, 116, 7270, 7275, 7281, 111, 116, 59, 1, 10752, 108, 117, 115, 59, 1, 10753, 105, 109, 101, 115, 59, 1, 10754, 4, 2, 113, 116, 7294, 7300, 99, 117, 112, 59, 1, 10758, 97, 114, 59, 1, 9733, 114, 105, 97, 110, 103, 108, 101, 4, 2, 100, 117, 7318, 7324, 111, 119, 110, 59, 1, 9661, 112, 59, 1, 9651, 112, 108, 117, 115, 59, 1, 10756, 101, 101, 59, 1, 8897, 101, 100, 103, 101, 59, 1, 8896, 97, 114, 111, 119, 59, 1, 10509, 4, 3, 97, 107, 111, 7362, 7436, 7458, 4, 2, 99, 110, 7368, 7432, 107, 4, 3, 108, 115, 116, 7377, 7386, 7394, 111, 122, 101, 110, 103, 101, 59, 1, 10731, 113, 117, 97, 114, 101, 59, 1, 9642, 114, 105, 97, 110, 103, 108, 101, 4, 4, 59, 100, 108, 114, 7411, 7413, 7419, 7425, 1, 9652, 111, 119, 110, 59, 1, 9662, 101, 102, 116, 59, 1, 9666, 105, 103, 104, 116, 59, 1, 9656, 107, 59, 1, 9251, 4, 2, 49, 51, 7442, 7454, 4, 2, 50, 52, 7448, 7451, 59, 1, 9618, 59, 1, 9617, 52, 59, 1, 9619, 99, 107, 59, 1, 9608, 4, 2, 101, 111, 7469, 7485, 4, 2, 59, 113, 7475, 7478, 3, 61, 8421, 117, 105, 118, 59, 3, 8801, 8421, 116, 59, 1, 8976, 4, 4, 112, 116, 119, 120, 7499, 7504, 7517, 7523, 102, 59, 3, 55349, 56659, 4, 2, 59, 116, 7510, 7512, 1, 8869, 111, 109, 59, 1, 8869, 116, 105, 101, 59, 1, 8904, 4, 12, 68, 72, 85, 86, 98, 100, 104, 109, 112, 116, 117, 118, 7549, 7571, 7597, 7619, 7655, 7660, 7682, 7708, 7715, 7721, 7728, 7750, 4, 4, 76, 82, 108, 114, 7559, 7562, 7565, 7568, 59, 1, 9559, 59, 1, 9556, 59, 1, 9558, 59, 1, 9555, 4, 5, 59, 68, 85, 100, 117, 7583, 7585, 7588, 7591, 7594, 1, 9552, 59, 1, 9574, 59, 1, 9577, 59, 1, 9572, 59, 1, 9575, 4, 4, 76, 82, 108, 114, 7607, 7610, 7613, 7616, 59, 1, 9565, 59, 1, 9562, 59, 1, 9564, 59, 1, 9561, 4, 7, 59, 72, 76, 82, 104, 108, 114, 7635, 7637, 7640, 7643, 7646, 7649, 7652, 1, 9553, 59, 1, 9580, 59, 1, 9571, 59, 1, 9568, 59, 1, 9579, 59, 1, 9570, 59, 1, 9567, 111, 120, 59, 1, 10697, 4, 4, 76, 82, 108, 114, 7670, 7673, 7676, 7679, 59, 1, 9557, 59, 1, 9554, 59, 1, 9488, 59, 1, 9484, 4, 5, 59, 68, 85, 100, 117, 7694, 7696, 7699, 7702, 7705, 1, 9472, 59, 1, 9573, 59, 1, 9576, 59, 1, 9516, 59, 1, 9524, 105, 110, 117, 115, 59, 1, 8863, 108, 117, 115, 59, 1, 8862, 105, 109, 101, 115, 59, 1, 8864, 4, 4, 76, 82, 108, 114, 7738, 7741, 7744, 7747, 59, 1, 9563, 59, 1, 9560, 59, 1, 9496, 59, 1, 9492, 4, 7, 59, 72, 76, 82, 104, 108, 114, 7766, 7768, 7771, 7774, 7777, 7780, 7783, 1, 9474, 59, 1, 9578, 59, 1, 9569, 59, 1, 9566, 59, 1, 9532, 59, 1, 9508, 59, 1, 9500, 114, 105, 109, 101, 59, 1, 8245, 4, 2, 101, 118, 7799, 7804, 118, 101, 59, 1, 728, 98, 97, 114, 5, 166, 1, 59, 7812, 1, 166, 4, 4, 99, 101, 105, 111, 7824, 7829, 7834, 7846, 114, 59, 3, 55349, 56503, 109, 105, 59, 1, 8271, 109, 4, 2, 59, 101, 7841, 7843, 1, 8765, 59, 1, 8909, 108, 4, 3, 59, 98, 104, 7855, 7857, 7860, 1, 92, 59, 1, 10693, 115, 117, 98, 59, 1, 10184, 4, 2, 108, 109, 7872, 7885, 108, 4, 2, 59, 101, 7879, 7881, 1, 8226, 116, 59, 1, 8226, 112, 4, 3, 59, 69, 101, 7894, 7896, 7899, 1, 8782, 59, 1, 10926, 4, 2, 59, 113, 7905, 7907, 1, 8783, 59, 1, 8783, 4, 15, 97, 99, 100, 101, 102, 104, 105, 108, 111, 114, 115, 116, 117, 119, 121, 7942, 8021, 8075, 8080, 8121, 8126, 8157, 8279, 8295, 8430, 8446, 8485, 8491, 8707, 8726, 4, 3, 99, 112, 114, 7950, 7956, 8007, 117, 116, 101, 59, 1, 263, 4, 6, 59, 97, 98, 99, 100, 115, 7970, 7972, 7977, 7984, 7998, 8003, 1, 8745, 110, 100, 59, 1, 10820, 114, 99, 117, 112, 59, 1, 10825, 4, 2, 97, 117, 7990, 7994, 112, 59, 1, 10827, 112, 59, 1, 10823, 111, 116, 59, 1, 10816, 59, 3, 8745, 65024, 4, 2, 101, 111, 8013, 8017, 116, 59, 1, 8257, 110, 59, 1, 711, 4, 4, 97, 101, 105, 117, 8031, 8046, 8056, 8061, 4, 2, 112, 114, 8037, 8041, 115, 59, 1, 10829, 111, 110, 59, 1, 269, 100, 105, 108, 5, 231, 1, 59, 8054, 1, 231, 114, 99, 59, 1, 265, 112, 115, 4, 2, 59, 115, 8069, 8071, 1, 10828, 109, 59, 1, 10832, 111, 116, 59, 1, 267, 4, 3, 100, 109, 110, 8088, 8097, 8104, 105, 108, 5, 184, 1, 59, 8095, 1, 184, 112, 116, 121, 118, 59, 1, 10674, 116, 5, 162, 2, 59, 101, 8112, 8114, 1, 162, 114, 100, 111, 116, 59, 1, 183, 114, 59, 3, 55349, 56608, 4, 3, 99, 101, 105, 8134, 8138, 8154, 121, 59, 1, 1095, 99, 107, 4, 2, 59, 109, 8146, 8148, 1, 10003, 97, 114, 107, 59, 1, 10003, 59, 1, 967, 114, 4, 7, 59, 69, 99, 101, 102, 109, 115, 8174, 8176, 8179, 8258, 8261, 8268, 8273, 1, 9675, 59, 1, 10691, 4, 3, 59, 101, 108, 8187, 8189, 8193, 1, 710, 113, 59, 1, 8791, 101, 4, 2, 97, 100, 8200, 8223, 114, 114, 111, 119, 4, 2, 108, 114, 8210, 8216, 101, 102, 116, 59, 1, 8634, 105, 103, 104, 116, 59, 1, 8635, 4, 5, 82, 83, 97, 99, 100, 8235, 8238, 8241, 8246, 8252, 59, 1, 174, 59, 1, 9416, 115, 116, 59, 1, 8859, 105, 114, 99, 59, 1, 8858, 97, 115, 104, 59, 1, 8861, 59, 1, 8791, 110, 105, 110, 116, 59, 1, 10768, 105, 100, 59, 1, 10991, 99, 105, 114, 59, 1, 10690, 117, 98, 115, 4, 2, 59, 117, 8288, 8290, 1, 9827, 105, 116, 59, 1, 9827, 4, 4, 108, 109, 110, 112, 8305, 8326, 8376, 8400, 111, 110, 4, 2, 59, 101, 8313, 8315, 1, 58, 4, 2, 59, 113, 8321, 8323, 1, 8788, 59, 1, 8788, 4, 2, 109, 112, 8332, 8344, 97, 4, 2, 59, 116, 8339, 8341, 1, 44, 59, 1, 64, 4, 3, 59, 102, 108, 8352, 8354, 8358, 1, 8705, 110, 59, 1, 8728, 101, 4, 2, 109, 120, 8365, 8371, 101, 110, 116, 59, 1, 8705, 101, 115, 59, 1, 8450, 4, 2, 103, 105, 8382, 8395, 4, 2, 59, 100, 8388, 8390, 1, 8773, 111, 116, 59, 1, 10861, 110, 116, 59, 1, 8750, 4, 3, 102, 114, 121, 8408, 8412, 8417, 59, 3, 55349, 56660, 111, 100, 59, 1, 8720, 5, 169, 2, 59, 115, 8424, 8426, 1, 169, 114, 59, 1, 8471, 4, 2, 97, 111, 8436, 8441, 114, 114, 59, 1, 8629, 115, 115, 59, 1, 10007, 4, 2, 99, 117, 8452, 8457, 114, 59, 3, 55349, 56504, 4, 2, 98, 112, 8463, 8474, 4, 2, 59, 101, 8469, 8471, 1, 10959, 59, 1, 10961, 4, 2, 59, 101, 8480, 8482, 1, 10960, 59, 1, 10962, 100, 111, 116, 59, 1, 8943, 4, 7, 100, 101, 108, 112, 114, 118, 119, 8507, 8522, 8536, 8550, 8600, 8697, 8702, 97, 114, 114, 4, 2, 108, 114, 8516, 8519, 59, 1, 10552, 59, 1, 10549, 4, 2, 112, 115, 8528, 8532, 114, 59, 1, 8926, 99, 59, 1, 8927, 97, 114, 114, 4, 2, 59, 112, 8545, 8547, 1, 8630, 59, 1, 10557, 4, 6, 59, 98, 99, 100, 111, 115, 8564, 8566, 8573, 8587, 8592, 8596, 1, 8746, 114, 99, 97, 112, 59, 1, 10824, 4, 2, 97, 117, 8579, 8583, 112, 59, 1, 10822, 112, 59, 1, 10826, 111, 116, 59, 1, 8845, 114, 59, 1, 10821, 59, 3, 8746, 65024, 4, 4, 97, 108, 114, 118, 8610, 8623, 8663, 8672, 114, 114, 4, 2, 59, 109, 8618, 8620, 1, 8631, 59, 1, 10556, 121, 4, 3, 101, 118, 119, 8632, 8651, 8656, 113, 4, 2, 112, 115, 8639, 8645, 114, 101, 99, 59, 1, 8926, 117, 99, 99, 59, 1, 8927, 101, 101, 59, 1, 8910, 101, 100, 103, 101, 59, 1, 8911, 101, 110, 5, 164, 1, 59, 8670, 1, 164, 101, 97, 114, 114, 111, 119, 4, 2, 108, 114, 8684, 8690, 101, 102, 116, 59, 1, 8630, 105, 103, 104, 116, 59, 1, 8631, 101, 101, 59, 1, 8910, 101, 100, 59, 1, 8911, 4, 2, 99, 105, 8713, 8721, 111, 110, 105, 110, 116, 59, 1, 8754, 110, 116, 59, 1, 8753, 108, 99, 116, 121, 59, 1, 9005, 4, 19, 65, 72, 97, 98, 99, 100, 101, 102, 104, 105, 106, 108, 111, 114, 115, 116, 117, 119, 122, 8773, 8778, 8783, 8821, 8839, 8854, 8887, 8914, 8930, 8944, 9036, 9041, 9058, 9197, 9227, 9258, 9281, 9297, 9305, 114, 114, 59, 1, 8659, 97, 114, 59, 1, 10597, 4, 4, 103, 108, 114, 115, 8793, 8799, 8805, 8809, 103, 101, 114, 59, 1, 8224, 101, 116, 104, 59, 1, 8504, 114, 59, 1, 8595, 104, 4, 2, 59, 118, 8816, 8818, 1, 8208, 59, 1, 8867, 4, 2, 107, 108, 8827, 8834, 97, 114, 111, 119, 59, 1, 10511, 97, 99, 59, 1, 733, 4, 2, 97, 121, 8845, 8851, 114, 111, 110, 59, 1, 271, 59, 1, 1076, 4, 3, 59, 97, 111, 8862, 8864, 8880, 1, 8518, 4, 2, 103, 114, 8870, 8876, 103, 101, 114, 59, 1, 8225, 114, 59, 1, 8650, 116, 115, 101, 113, 59, 1, 10871, 4, 3, 103, 108, 109, 8895, 8902, 8907, 5, 176, 1, 59, 8900, 1, 176, 116, 97, 59, 1, 948, 112, 116, 121, 118, 59, 1, 10673, 4, 2, 105, 114, 8920, 8926, 115, 104, 116, 59, 1, 10623, 59, 3, 55349, 56609, 97, 114, 4, 2, 108, 114, 8938, 8941, 59, 1, 8643, 59, 1, 8642, 4, 5, 97, 101, 103, 115, 118, 8956, 8986, 8989, 8996, 9001, 109, 4, 3, 59, 111, 115, 8965, 8967, 8983, 1, 8900, 110, 100, 4, 2, 59, 115, 8975, 8977, 1, 8900, 117, 105, 116, 59, 1, 9830, 59, 1, 9830, 59, 1, 168, 97, 109, 109, 97, 59, 1, 989, 105, 110, 59, 1, 8946, 4, 3, 59, 105, 111, 9009, 9011, 9031, 1, 247, 100, 101, 5, 247, 2, 59, 111, 9020, 9022, 1, 247, 110, 116, 105, 109, 101, 115, 59, 1, 8903, 110, 120, 59, 1, 8903, 99, 121, 59, 1, 1106, 99, 4, 2, 111, 114, 9048, 9053, 114, 110, 59, 1, 8990, 111, 112, 59, 1, 8973, 4, 5, 108, 112, 116, 117, 119, 9070, 9076, 9081, 9130, 9144, 108, 97, 114, 59, 1, 36, 102, 59, 3, 55349, 56661, 4, 5, 59, 101, 109, 112, 115, 9093, 9095, 9109, 9116, 9122, 1, 729, 113, 4, 2, 59, 100, 9102, 9104, 1, 8784, 111, 116, 59, 1, 8785, 105, 110, 117, 115, 59, 1, 8760, 108, 117, 115, 59, 1, 8724, 113, 117, 97, 114, 101, 59, 1, 8865, 98, 108, 101, 98, 97, 114, 119, 101, 100, 103, 101, 59, 1, 8966, 110, 4, 3, 97, 100, 104, 9153, 9160, 9172, 114, 114, 111, 119, 59, 1, 8595, 111, 119, 110, 97, 114, 114, 111, 119, 115, 59, 1, 8650, 97, 114, 112, 111, 111, 110, 4, 2, 108, 114, 9184, 9190, 101, 102, 116, 59, 1, 8643, 105, 103, 104, 116, 59, 1, 8642, 4, 2, 98, 99, 9203, 9211, 107, 97, 114, 111, 119, 59, 1, 10512, 4, 2, 111, 114, 9217, 9222, 114, 110, 59, 1, 8991, 111, 112, 59, 1, 8972, 4, 3, 99, 111, 116, 9235, 9248, 9252, 4, 2, 114, 121, 9241, 9245, 59, 3, 55349, 56505, 59, 1, 1109, 108, 59, 1, 10742, 114, 111, 107, 59, 1, 273, 4, 2, 100, 114, 9264, 9269, 111, 116, 59, 1, 8945, 105, 4, 2, 59, 102, 9276, 9278, 1, 9663, 59, 1, 9662, 4, 2, 97, 104, 9287, 9292, 114, 114, 59, 1, 8693, 97, 114, 59, 1, 10607, 97, 110, 103, 108, 101, 59, 1, 10662, 4, 2, 99, 105, 9311, 9315, 121, 59, 1, 1119, 103, 114, 97, 114, 114, 59, 1, 10239, 4, 18, 68, 97, 99, 100, 101, 102, 103, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 120, 9361, 9376, 9398, 9439, 9444, 9447, 9462, 9495, 9531, 9585, 9598, 9614, 9659, 9755, 9771, 9792, 9808, 9826, 4, 2, 68, 111, 9367, 9372, 111, 116, 59, 1, 10871, 116, 59, 1, 8785, 4, 2, 99, 115, 9382, 9392, 117, 116, 101, 5, 233, 1, 59, 9390, 1, 233, 116, 101, 114, 59, 1, 10862, 4, 4, 97, 105, 111, 121, 9408, 9414, 9430, 9436, 114, 111, 110, 59, 1, 283, 114, 4, 2, 59, 99, 9421, 9423, 1, 8790, 5, 234, 1, 59, 9428, 1, 234, 108, 111, 110, 59, 1, 8789, 59, 1, 1101, 111, 116, 59, 1, 279, 59, 1, 8519, 4, 2, 68, 114, 9453, 9458, 111, 116, 59, 1, 8786, 59, 3, 55349, 56610, 4, 3, 59, 114, 115, 9470, 9472, 9482, 1, 10906, 97, 118, 101, 5, 232, 1, 59, 9480, 1, 232, 4, 2, 59, 100, 9488, 9490, 1, 10902, 111, 116, 59, 1, 10904, 4, 4, 59, 105, 108, 115, 9505, 9507, 9515, 9518, 1, 10905, 110, 116, 101, 114, 115, 59, 1, 9191, 59, 1, 8467, 4, 2, 59, 100, 9524, 9526, 1, 10901, 111, 116, 59, 1, 10903, 4, 3, 97, 112, 115, 9539, 9544, 9564, 99, 114, 59, 1, 275, 116, 121, 4, 3, 59, 115, 118, 9554, 9556, 9561, 1, 8709, 101, 116, 59, 1, 8709, 59, 1, 8709, 112, 4, 2, 49, 59, 9571, 9583, 4, 2, 51, 52, 9577, 9580, 59, 1, 8196, 59, 1, 8197, 1, 8195, 4, 2, 103, 115, 9591, 9594, 59, 1, 331, 112, 59, 1, 8194, 4, 2, 103, 112, 9604, 9609, 111, 110, 59, 1, 281, 102, 59, 3, 55349, 56662, 4, 3, 97, 108, 115, 9622, 9635, 9640, 114, 4, 2, 59, 115, 9629, 9631, 1, 8917, 108, 59, 1, 10723, 117, 115, 59, 1, 10865, 105, 4, 3, 59, 108, 118, 9649, 9651, 9656, 1, 949, 111, 110, 59, 1, 949, 59, 1, 1013, 4, 4, 99, 115, 117, 118, 9669, 9686, 9716, 9747, 4, 2, 105, 111, 9675, 9680, 114, 99, 59, 1, 8790, 108, 111, 110, 59, 1, 8789, 4, 2, 105, 108, 9692, 9696, 109, 59, 1, 8770, 97, 110, 116, 4, 2, 103, 108, 9705, 9710, 116, 114, 59, 1, 10902, 101, 115, 115, 59, 1, 10901, 4, 3, 97, 101, 105, 9724, 9729, 9734, 108, 115, 59, 1, 61, 115, 116, 59, 1, 8799, 118, 4, 2, 59, 68, 9741, 9743, 1, 8801, 68, 59, 1, 10872, 112, 97, 114, 115, 108, 59, 1, 10725, 4, 2, 68, 97, 9761, 9766, 111, 116, 59, 1, 8787, 114, 114, 59, 1, 10609, 4, 3, 99, 100, 105, 9779, 9783, 9788, 114, 59, 1, 8495, 111, 116, 59, 1, 8784, 109, 59, 1, 8770, 4, 2, 97, 104, 9798, 9801, 59, 1, 951, 5, 240, 1, 59, 9806, 1, 240, 4, 2, 109, 114, 9814, 9822, 108, 5, 235, 1, 59, 9820, 1, 235, 111, 59, 1, 8364, 4, 3, 99, 105, 112, 9834, 9838, 9843, 108, 59, 1, 33, 115, 116, 59, 1, 8707, 4, 2, 101, 111, 9849, 9859, 99, 116, 97, 116, 105, 111, 110, 59, 1, 8496, 110, 101, 110, 116, 105, 97, 108, 101, 59, 1, 8519, 4, 12, 97, 99, 101, 102, 105, 106, 108, 110, 111, 112, 114, 115, 9896, 9910, 9914, 9921, 9954, 9960, 9967, 9989, 9994, 10027, 10036, 10164, 108, 108, 105, 110, 103, 100, 111, 116, 115, 101, 113, 59, 1, 8786, 121, 59, 1, 1092, 109, 97, 108, 101, 59, 1, 9792, 4, 3, 105, 108, 114, 9929, 9935, 9950, 108, 105, 103, 59, 1, 64259, 4, 2, 105, 108, 9941, 9945, 103, 59, 1, 64256, 105, 103, 59, 1, 64260, 59, 3, 55349, 56611, 108, 105, 103, 59, 1, 64257, 108, 105, 103, 59, 3, 102, 106, 4, 3, 97, 108, 116, 9975, 9979, 9984, 116, 59, 1, 9837, 105, 103, 59, 1, 64258, 110, 115, 59, 1, 9649, 111, 102, 59, 1, 402, 4, 2, 112, 114, 1e4, 10005, 102, 59, 3, 55349, 56663, 4, 2, 97, 107, 10011, 10016, 108, 108, 59, 1, 8704, 4, 2, 59, 118, 10022, 10024, 1, 8916, 59, 1, 10969, 97, 114, 116, 105, 110, 116, 59, 1, 10765, 4, 2, 97, 111, 10042, 10159, 4, 2, 99, 115, 10048, 10155, 4, 6, 49, 50, 51, 52, 53, 55, 10062, 10102, 10114, 10135, 10139, 10151, 4, 6, 50, 51, 52, 53, 54, 56, 10076, 10083, 10086, 10093, 10096, 10099, 5, 189, 1, 59, 10081, 1, 189, 59, 1, 8531, 5, 188, 1, 59, 10091, 1, 188, 59, 1, 8533, 59, 1, 8537, 59, 1, 8539, 4, 2, 51, 53, 10108, 10111, 59, 1, 8532, 59, 1, 8534, 4, 3, 52, 53, 56, 10122, 10129, 10132, 5, 190, 1, 59, 10127, 1, 190, 59, 1, 8535, 59, 1, 8540, 53, 59, 1, 8536, 4, 2, 54, 56, 10145, 10148, 59, 1, 8538, 59, 1, 8541, 56, 59, 1, 8542, 108, 59, 1, 8260, 119, 110, 59, 1, 8994, 99, 114, 59, 3, 55349, 56507, 4, 17, 69, 97, 98, 99, 100, 101, 102, 103, 105, 106, 108, 110, 111, 114, 115, 116, 118, 10206, 10217, 10247, 10254, 10268, 10273, 10358, 10363, 10374, 10380, 10385, 10406, 10458, 10464, 10470, 10497, 10610, 4, 2, 59, 108, 10212, 10214, 1, 8807, 59, 1, 10892, 4, 3, 99, 109, 112, 10225, 10231, 10244, 117, 116, 101, 59, 1, 501, 109, 97, 4, 2, 59, 100, 10239, 10241, 1, 947, 59, 1, 989, 59, 1, 10886, 114, 101, 118, 101, 59, 1, 287, 4, 2, 105, 121, 10260, 10265, 114, 99, 59, 1, 285, 59, 1, 1075, 111, 116, 59, 1, 289, 4, 4, 59, 108, 113, 115, 10283, 10285, 10288, 10308, 1, 8805, 59, 1, 8923, 4, 3, 59, 113, 115, 10296, 10298, 10301, 1, 8805, 59, 1, 8807, 108, 97, 110, 116, 59, 1, 10878, 4, 4, 59, 99, 100, 108, 10318, 10320, 10324, 10345, 1, 10878, 99, 59, 1, 10921, 111, 116, 4, 2, 59, 111, 10332, 10334, 1, 10880, 4, 2, 59, 108, 10340, 10342, 1, 10882, 59, 1, 10884, 4, 2, 59, 101, 10351, 10354, 3, 8923, 65024, 115, 59, 1, 10900, 114, 59, 3, 55349, 56612, 4, 2, 59, 103, 10369, 10371, 1, 8811, 59, 1, 8921, 109, 101, 108, 59, 1, 8503, 99, 121, 59, 1, 1107, 4, 4, 59, 69, 97, 106, 10395, 10397, 10400, 10403, 1, 8823, 59, 1, 10898, 59, 1, 10917, 59, 1, 10916, 4, 4, 69, 97, 101, 115, 10416, 10419, 10434, 10453, 59, 1, 8809, 112, 4, 2, 59, 112, 10426, 10428, 1, 10890, 114, 111, 120, 59, 1, 10890, 4, 2, 59, 113, 10440, 10442, 1, 10888, 4, 2, 59, 113, 10448, 10450, 1, 10888, 59, 1, 8809, 105, 109, 59, 1, 8935, 112, 102, 59, 3, 55349, 56664, 97, 118, 101, 59, 1, 96, 4, 2, 99, 105, 10476, 10480, 114, 59, 1, 8458, 109, 4, 3, 59, 101, 108, 10489, 10491, 10494, 1, 8819, 59, 1, 10894, 59, 1, 10896, 5, 62, 6, 59, 99, 100, 108, 113, 114, 10512, 10514, 10527, 10532, 10538, 10545, 1, 62, 4, 2, 99, 105, 10520, 10523, 59, 1, 10919, 114, 59, 1, 10874, 111, 116, 59, 1, 8919, 80, 97, 114, 59, 1, 10645, 117, 101, 115, 116, 59, 1, 10876, 4, 5, 97, 100, 101, 108, 115, 10557, 10574, 10579, 10599, 10605, 4, 2, 112, 114, 10563, 10570, 112, 114, 111, 120, 59, 1, 10886, 114, 59, 1, 10616, 111, 116, 59, 1, 8919, 113, 4, 2, 108, 113, 10586, 10592, 101, 115, 115, 59, 1, 8923, 108, 101, 115, 115, 59, 1, 10892, 101, 115, 115, 59, 1, 8823, 105, 109, 59, 1, 8819, 4, 2, 101, 110, 10616, 10626, 114, 116, 110, 101, 113, 113, 59, 3, 8809, 65024, 69, 59, 3, 8809, 65024, 4, 10, 65, 97, 98, 99, 101, 102, 107, 111, 115, 121, 10653, 10658, 10713, 10718, 10724, 10760, 10765, 10786, 10850, 10875, 114, 114, 59, 1, 8660, 4, 4, 105, 108, 109, 114, 10668, 10674, 10678, 10684, 114, 115, 112, 59, 1, 8202, 102, 59, 1, 189, 105, 108, 116, 59, 1, 8459, 4, 2, 100, 114, 10690, 10695, 99, 121, 59, 1, 1098, 4, 3, 59, 99, 119, 10703, 10705, 10710, 1, 8596, 105, 114, 59, 1, 10568, 59, 1, 8621, 97, 114, 59, 1, 8463, 105, 114, 99, 59, 1, 293, 4, 3, 97, 108, 114, 10732, 10748, 10754, 114, 116, 115, 4, 2, 59, 117, 10741, 10743, 1, 9829, 105, 116, 59, 1, 9829, 108, 105, 112, 59, 1, 8230, 99, 111, 110, 59, 1, 8889, 114, 59, 3, 55349, 56613, 115, 4, 2, 101, 119, 10772, 10779, 97, 114, 111, 119, 59, 1, 10533, 97, 114, 111, 119, 59, 1, 10534, 4, 5, 97, 109, 111, 112, 114, 10798, 10803, 10809, 10839, 10844, 114, 114, 59, 1, 8703, 116, 104, 116, 59, 1, 8763, 107, 4, 2, 108, 114, 10816, 10827, 101, 102, 116, 97, 114, 114, 111, 119, 59, 1, 8617, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8618, 102, 59, 3, 55349, 56665, 98, 97, 114, 59, 1, 8213, 4, 3, 99, 108, 116, 10858, 10863, 10869, 114, 59, 3, 55349, 56509, 97, 115, 104, 59, 1, 8463, 114, 111, 107, 59, 1, 295, 4, 2, 98, 112, 10881, 10887, 117, 108, 108, 59, 1, 8259, 104, 101, 110, 59, 1, 8208, 4, 15, 97, 99, 101, 102, 103, 105, 106, 109, 110, 111, 112, 113, 115, 116, 117, 10925, 10936, 10958, 10977, 10990, 11001, 11039, 11045, 11101, 11192, 11220, 11226, 11237, 11285, 11299, 99, 117, 116, 101, 5, 237, 1, 59, 10934, 1, 237, 4, 3, 59, 105, 121, 10944, 10946, 10955, 1, 8291, 114, 99, 5, 238, 1, 59, 10953, 1, 238, 59, 1, 1080, 4, 2, 99, 120, 10964, 10968, 121, 59, 1, 1077, 99, 108, 5, 161, 1, 59, 10975, 1, 161, 4, 2, 102, 114, 10983, 10986, 59, 1, 8660, 59, 3, 55349, 56614, 114, 97, 118, 101, 5, 236, 1, 59, 10999, 1, 236, 4, 4, 59, 105, 110, 111, 11011, 11013, 11028, 11034, 1, 8520, 4, 2, 105, 110, 11019, 11024, 110, 116, 59, 1, 10764, 116, 59, 1, 8749, 102, 105, 110, 59, 1, 10716, 116, 97, 59, 1, 8489, 108, 105, 103, 59, 1, 307, 4, 3, 97, 111, 112, 11053, 11092, 11096, 4, 3, 99, 103, 116, 11061, 11065, 11088, 114, 59, 1, 299, 4, 3, 101, 108, 112, 11073, 11076, 11082, 59, 1, 8465, 105, 110, 101, 59, 1, 8464, 97, 114, 116, 59, 1, 8465, 104, 59, 1, 305, 102, 59, 1, 8887, 101, 100, 59, 1, 437, 4, 5, 59, 99, 102, 111, 116, 11113, 11115, 11121, 11136, 11142, 1, 8712, 97, 114, 101, 59, 1, 8453, 105, 110, 4, 2, 59, 116, 11129, 11131, 1, 8734, 105, 101, 59, 1, 10717, 100, 111, 116, 59, 1, 305, 4, 5, 59, 99, 101, 108, 112, 11154, 11156, 11161, 11179, 11186, 1, 8747, 97, 108, 59, 1, 8890, 4, 2, 103, 114, 11167, 11173, 101, 114, 115, 59, 1, 8484, 99, 97, 108, 59, 1, 8890, 97, 114, 104, 107, 59, 1, 10775, 114, 111, 100, 59, 1, 10812, 4, 4, 99, 103, 112, 116, 11202, 11206, 11211, 11216, 121, 59, 1, 1105, 111, 110, 59, 1, 303, 102, 59, 3, 55349, 56666, 97, 59, 1, 953, 114, 111, 100, 59, 1, 10812, 117, 101, 115, 116, 5, 191, 1, 59, 11235, 1, 191, 4, 2, 99, 105, 11243, 11248, 114, 59, 3, 55349, 56510, 110, 4, 5, 59, 69, 100, 115, 118, 11261, 11263, 11266, 11271, 11282, 1, 8712, 59, 1, 8953, 111, 116, 59, 1, 8949, 4, 2, 59, 118, 11277, 11279, 1, 8948, 59, 1, 8947, 59, 1, 8712, 4, 2, 59, 105, 11291, 11293, 1, 8290, 108, 100, 101, 59, 1, 297, 4, 2, 107, 109, 11305, 11310, 99, 121, 59, 1, 1110, 108, 5, 239, 1, 59, 11316, 1, 239, 4, 6, 99, 102, 109, 111, 115, 117, 11332, 11346, 11351, 11357, 11363, 11380, 4, 2, 105, 121, 11338, 11343, 114, 99, 59, 1, 309, 59, 1, 1081, 114, 59, 3, 55349, 56615, 97, 116, 104, 59, 1, 567, 112, 102, 59, 3, 55349, 56667, 4, 2, 99, 101, 11369, 11374, 114, 59, 3, 55349, 56511, 114, 99, 121, 59, 1, 1112, 107, 99, 121, 59, 1, 1108, 4, 8, 97, 99, 102, 103, 104, 106, 111, 115, 11404, 11418, 11433, 11438, 11445, 11450, 11455, 11461, 112, 112, 97, 4, 2, 59, 118, 11413, 11415, 1, 954, 59, 1, 1008, 4, 2, 101, 121, 11424, 11430, 100, 105, 108, 59, 1, 311, 59, 1, 1082, 114, 59, 3, 55349, 56616, 114, 101, 101, 110, 59, 1, 312, 99, 121, 59, 1, 1093, 99, 121, 59, 1, 1116, 112, 102, 59, 3, 55349, 56668, 99, 114, 59, 3, 55349, 56512, 4, 23, 65, 66, 69, 72, 97, 98, 99, 100, 101, 102, 103, 104, 106, 108, 109, 110, 111, 112, 114, 115, 116, 117, 118, 11515, 11538, 11544, 11555, 11560, 11721, 11780, 11818, 11868, 12136, 12160, 12171, 12203, 12208, 12246, 12275, 12327, 12509, 12523, 12569, 12641, 12732, 12752, 4, 3, 97, 114, 116, 11523, 11528, 11532, 114, 114, 59, 1, 8666, 114, 59, 1, 8656, 97, 105, 108, 59, 1, 10523, 97, 114, 114, 59, 1, 10510, 4, 2, 59, 103, 11550, 11552, 1, 8806, 59, 1, 10891, 97, 114, 59, 1, 10594, 4, 9, 99, 101, 103, 109, 110, 112, 113, 114, 116, 11580, 11586, 11594, 11600, 11606, 11624, 11627, 11636, 11694, 117, 116, 101, 59, 1, 314, 109, 112, 116, 121, 118, 59, 1, 10676, 114, 97, 110, 59, 1, 8466, 98, 100, 97, 59, 1, 955, 103, 4, 3, 59, 100, 108, 11615, 11617, 11620, 1, 10216, 59, 1, 10641, 101, 59, 1, 10216, 59, 1, 10885, 117, 111, 5, 171, 1, 59, 11634, 1, 171, 114, 4, 8, 59, 98, 102, 104, 108, 112, 115, 116, 11655, 11657, 11669, 11673, 11677, 11681, 11685, 11690, 1, 8592, 4, 2, 59, 102, 11663, 11665, 1, 8676, 115, 59, 1, 10527, 115, 59, 1, 10525, 107, 59, 1, 8617, 112, 59, 1, 8619, 108, 59, 1, 10553, 105, 109, 59, 1, 10611, 108, 59, 1, 8610, 4, 3, 59, 97, 101, 11702, 11704, 11709, 1, 10923, 105, 108, 59, 1, 10521, 4, 2, 59, 115, 11715, 11717, 1, 10925, 59, 3, 10925, 65024, 4, 3, 97, 98, 114, 11729, 11734, 11739, 114, 114, 59, 1, 10508, 114, 107, 59, 1, 10098, 4, 2, 97, 107, 11745, 11758, 99, 4, 2, 101, 107, 11752, 11755, 59, 1, 123, 59, 1, 91, 4, 2, 101, 115, 11764, 11767, 59, 1, 10635, 108, 4, 2, 100, 117, 11774, 11777, 59, 1, 10639, 59, 1, 10637, 4, 4, 97, 101, 117, 121, 11790, 11796, 11811, 11815, 114, 111, 110, 59, 1, 318, 4, 2, 100, 105, 11802, 11807, 105, 108, 59, 1, 316, 108, 59, 1, 8968, 98, 59, 1, 123, 59, 1, 1083, 4, 4, 99, 113, 114, 115, 11828, 11832, 11845, 11864, 97, 59, 1, 10550, 117, 111, 4, 2, 59, 114, 11840, 11842, 1, 8220, 59, 1, 8222, 4, 2, 100, 117, 11851, 11857, 104, 97, 114, 59, 1, 10599, 115, 104, 97, 114, 59, 1, 10571, 104, 59, 1, 8626, 4, 5, 59, 102, 103, 113, 115, 11880, 11882, 12008, 12011, 12031, 1, 8804, 116, 4, 5, 97, 104, 108, 114, 116, 11895, 11913, 11935, 11947, 11996, 114, 114, 111, 119, 4, 2, 59, 116, 11905, 11907, 1, 8592, 97, 105, 108, 59, 1, 8610, 97, 114, 112, 111, 111, 110, 4, 2, 100, 117, 11925, 11931, 111, 119, 110, 59, 1, 8637, 112, 59, 1, 8636, 101, 102, 116, 97, 114, 114, 111, 119, 115, 59, 1, 8647, 105, 103, 104, 116, 4, 3, 97, 104, 115, 11959, 11974, 11984, 114, 114, 111, 119, 4, 2, 59, 115, 11969, 11971, 1, 8596, 59, 1, 8646, 97, 114, 112, 111, 111, 110, 115, 59, 1, 8651, 113, 117, 105, 103, 97, 114, 114, 111, 119, 59, 1, 8621, 104, 114, 101, 101, 116, 105, 109, 101, 115, 59, 1, 8907, 59, 1, 8922, 4, 3, 59, 113, 115, 12019, 12021, 12024, 1, 8804, 59, 1, 8806, 108, 97, 110, 116, 59, 1, 10877, 4, 5, 59, 99, 100, 103, 115, 12043, 12045, 12049, 12070, 12083, 1, 10877, 99, 59, 1, 10920, 111, 116, 4, 2, 59, 111, 12057, 12059, 1, 10879, 4, 2, 59, 114, 12065, 12067, 1, 10881, 59, 1, 10883, 4, 2, 59, 101, 12076, 12079, 3, 8922, 65024, 115, 59, 1, 10899, 4, 5, 97, 100, 101, 103, 115, 12095, 12103, 12108, 12126, 12131, 112, 112, 114, 111, 120, 59, 1, 10885, 111, 116, 59, 1, 8918, 113, 4, 2, 103, 113, 12115, 12120, 116, 114, 59, 1, 8922, 103, 116, 114, 59, 1, 10891, 116, 114, 59, 1, 8822, 105, 109, 59, 1, 8818, 4, 3, 105, 108, 114, 12144, 12150, 12156, 115, 104, 116, 59, 1, 10620, 111, 111, 114, 59, 1, 8970, 59, 3, 55349, 56617, 4, 2, 59, 69, 12166, 12168, 1, 8822, 59, 1, 10897, 4, 2, 97, 98, 12177, 12198, 114, 4, 2, 100, 117, 12184, 12187, 59, 1, 8637, 4, 2, 59, 108, 12193, 12195, 1, 8636, 59, 1, 10602, 108, 107, 59, 1, 9604, 99, 121, 59, 1, 1113, 4, 5, 59, 97, 99, 104, 116, 12220, 12222, 12227, 12235, 12241, 1, 8810, 114, 114, 59, 1, 8647, 111, 114, 110, 101, 114, 59, 1, 8990, 97, 114, 100, 59, 1, 10603, 114, 105, 59, 1, 9722, 4, 2, 105, 111, 12252, 12258, 100, 111, 116, 59, 1, 320, 117, 115, 116, 4, 2, 59, 97, 12267, 12269, 1, 9136, 99, 104, 101, 59, 1, 9136, 4, 4, 69, 97, 101, 115, 12285, 12288, 12303, 12322, 59, 1, 8808, 112, 4, 2, 59, 112, 12295, 12297, 1, 10889, 114, 111, 120, 59, 1, 10889, 4, 2, 59, 113, 12309, 12311, 1, 10887, 4, 2, 59, 113, 12317, 12319, 1, 10887, 59, 1, 8808, 105, 109, 59, 1, 8934, 4, 8, 97, 98, 110, 111, 112, 116, 119, 122, 12345, 12359, 12364, 12421, 12446, 12467, 12474, 12490, 4, 2, 110, 114, 12351, 12355, 103, 59, 1, 10220, 114, 59, 1, 8701, 114, 107, 59, 1, 10214, 103, 4, 3, 108, 109, 114, 12373, 12401, 12409, 101, 102, 116, 4, 2, 97, 114, 12382, 12389, 114, 114, 111, 119, 59, 1, 10229, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 10231, 97, 112, 115, 116, 111, 59, 1, 10236, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 10230, 112, 97, 114, 114, 111, 119, 4, 2, 108, 114, 12433, 12439, 101, 102, 116, 59, 1, 8619, 105, 103, 104, 116, 59, 1, 8620, 4, 3, 97, 102, 108, 12454, 12458, 12462, 114, 59, 1, 10629, 59, 3, 55349, 56669, 117, 115, 59, 1, 10797, 105, 109, 101, 115, 59, 1, 10804, 4, 2, 97, 98, 12480, 12485, 115, 116, 59, 1, 8727, 97, 114, 59, 1, 95, 4, 3, 59, 101, 102, 12498, 12500, 12506, 1, 9674, 110, 103, 101, 59, 1, 9674, 59, 1, 10731, 97, 114, 4, 2, 59, 108, 12517, 12519, 1, 40, 116, 59, 1, 10643, 4, 5, 97, 99, 104, 109, 116, 12535, 12540, 12548, 12561, 12564, 114, 114, 59, 1, 8646, 111, 114, 110, 101, 114, 59, 1, 8991, 97, 114, 4, 2, 59, 100, 12556, 12558, 1, 8651, 59, 1, 10605, 59, 1, 8206, 114, 105, 59, 1, 8895, 4, 6, 97, 99, 104, 105, 113, 116, 12583, 12589, 12594, 12597, 12614, 12635, 113, 117, 111, 59, 1, 8249, 114, 59, 3, 55349, 56513, 59, 1, 8624, 109, 4, 3, 59, 101, 103, 12606, 12608, 12611, 1, 8818, 59, 1, 10893, 59, 1, 10895, 4, 2, 98, 117, 12620, 12623, 59, 1, 91, 111, 4, 2, 59, 114, 12630, 12632, 1, 8216, 59, 1, 8218, 114, 111, 107, 59, 1, 322, 5, 60, 8, 59, 99, 100, 104, 105, 108, 113, 114, 12660, 12662, 12675, 12680, 12686, 12692, 12698, 12705, 1, 60, 4, 2, 99, 105, 12668, 12671, 59, 1, 10918, 114, 59, 1, 10873, 111, 116, 59, 1, 8918, 114, 101, 101, 59, 1, 8907, 109, 101, 115, 59, 1, 8905, 97, 114, 114, 59, 1, 10614, 117, 101, 115, 116, 59, 1, 10875, 4, 2, 80, 105, 12711, 12716, 97, 114, 59, 1, 10646, 4, 3, 59, 101, 102, 12724, 12726, 12729, 1, 9667, 59, 1, 8884, 59, 1, 9666, 114, 4, 2, 100, 117, 12739, 12746, 115, 104, 97, 114, 59, 1, 10570, 104, 97, 114, 59, 1, 10598, 4, 2, 101, 110, 12758, 12768, 114, 116, 110, 101, 113, 113, 59, 3, 8808, 65024, 69, 59, 3, 8808, 65024, 4, 14, 68, 97, 99, 100, 101, 102, 104, 105, 108, 110, 111, 112, 115, 117, 12803, 12809, 12893, 12908, 12914, 12928, 12933, 12937, 13011, 13025, 13032, 13049, 13052, 13069, 68, 111, 116, 59, 1, 8762, 4, 4, 99, 108, 112, 114, 12819, 12827, 12849, 12887, 114, 5, 175, 1, 59, 12825, 1, 175, 4, 2, 101, 116, 12833, 12836, 59, 1, 9794, 4, 2, 59, 101, 12842, 12844, 1, 10016, 115, 101, 59, 1, 10016, 4, 2, 59, 115, 12855, 12857, 1, 8614, 116, 111, 4, 4, 59, 100, 108, 117, 12869, 12871, 12877, 12883, 1, 8614, 111, 119, 110, 59, 1, 8615, 101, 102, 116, 59, 1, 8612, 112, 59, 1, 8613, 107, 101, 114, 59, 1, 9646, 4, 2, 111, 121, 12899, 12905, 109, 109, 97, 59, 1, 10793, 59, 1, 1084, 97, 115, 104, 59, 1, 8212, 97, 115, 117, 114, 101, 100, 97, 110, 103, 108, 101, 59, 1, 8737, 114, 59, 3, 55349, 56618, 111, 59, 1, 8487, 4, 3, 99, 100, 110, 12945, 12954, 12985, 114, 111, 5, 181, 1, 59, 12952, 1, 181, 4, 4, 59, 97, 99, 100, 12964, 12966, 12971, 12976, 1, 8739, 115, 116, 59, 1, 42, 105, 114, 59, 1, 10992, 111, 116, 5, 183, 1, 59, 12983, 1, 183, 117, 115, 4, 3, 59, 98, 100, 12995, 12997, 13e3, 1, 8722, 59, 1, 8863, 4, 2, 59, 117, 13006, 13008, 1, 8760, 59, 1, 10794, 4, 2, 99, 100, 13017, 13021, 112, 59, 1, 10971, 114, 59, 1, 8230, 112, 108, 117, 115, 59, 1, 8723, 4, 2, 100, 112, 13038, 13044, 101, 108, 115, 59, 1, 8871, 102, 59, 3, 55349, 56670, 59, 1, 8723, 4, 2, 99, 116, 13058, 13063, 114, 59, 3, 55349, 56514, 112, 111, 115, 59, 1, 8766, 4, 3, 59, 108, 109, 13077, 13079, 13087, 1, 956, 116, 105, 109, 97, 112, 59, 1, 8888, 97, 112, 59, 1, 8888, 4, 24, 71, 76, 82, 86, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 108, 109, 111, 112, 114, 115, 116, 117, 118, 119, 13142, 13165, 13217, 13229, 13247, 13330, 13359, 13414, 13420, 13508, 13513, 13579, 13602, 13626, 13631, 13762, 13767, 13855, 13936, 13995, 14214, 14285, 14312, 14432, 4, 2, 103, 116, 13148, 13152, 59, 3, 8921, 824, 4, 2, 59, 118, 13158, 13161, 3, 8811, 8402, 59, 3, 8811, 824, 4, 3, 101, 108, 116, 13173, 13200, 13204, 102, 116, 4, 2, 97, 114, 13181, 13188, 114, 114, 111, 119, 59, 1, 8653, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8654, 59, 3, 8920, 824, 4, 2, 59, 118, 13210, 13213, 3, 8810, 8402, 59, 3, 8810, 824, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8655, 4, 2, 68, 100, 13235, 13241, 97, 115, 104, 59, 1, 8879, 97, 115, 104, 59, 1, 8878, 4, 5, 98, 99, 110, 112, 116, 13259, 13264, 13270, 13275, 13308, 108, 97, 59, 1, 8711, 117, 116, 101, 59, 1, 324, 103, 59, 3, 8736, 8402, 4, 5, 59, 69, 105, 111, 112, 13287, 13289, 13293, 13298, 13302, 1, 8777, 59, 3, 10864, 824, 100, 59, 3, 8779, 824, 115, 59, 1, 329, 114, 111, 120, 59, 1, 8777, 117, 114, 4, 2, 59, 97, 13316, 13318, 1, 9838, 108, 4, 2, 59, 115, 13325, 13327, 1, 9838, 59, 1, 8469, 4, 2, 115, 117, 13336, 13344, 112, 5, 160, 1, 59, 13342, 1, 160, 109, 112, 4, 2, 59, 101, 13352, 13355, 3, 8782, 824, 59, 3, 8783, 824, 4, 5, 97, 101, 111, 117, 121, 13371, 13385, 13391, 13407, 13411, 4, 2, 112, 114, 13377, 13380, 59, 1, 10819, 111, 110, 59, 1, 328, 100, 105, 108, 59, 1, 326, 110, 103, 4, 2, 59, 100, 13399, 13401, 1, 8775, 111, 116, 59, 3, 10861, 824, 112, 59, 1, 10818, 59, 1, 1085, 97, 115, 104, 59, 1, 8211, 4, 7, 59, 65, 97, 100, 113, 115, 120, 13436, 13438, 13443, 13466, 13472, 13478, 13494, 1, 8800, 114, 114, 59, 1, 8663, 114, 4, 2, 104, 114, 13450, 13454, 107, 59, 1, 10532, 4, 2, 59, 111, 13460, 13462, 1, 8599, 119, 59, 1, 8599, 111, 116, 59, 3, 8784, 824, 117, 105, 118, 59, 1, 8802, 4, 2, 101, 105, 13484, 13489, 97, 114, 59, 1, 10536, 109, 59, 3, 8770, 824, 105, 115, 116, 4, 2, 59, 115, 13503, 13505, 1, 8708, 59, 1, 8708, 114, 59, 3, 55349, 56619, 4, 4, 69, 101, 115, 116, 13523, 13527, 13563, 13568, 59, 3, 8807, 824, 4, 3, 59, 113, 115, 13535, 13537, 13559, 1, 8817, 4, 3, 59, 113, 115, 13545, 13547, 13551, 1, 8817, 59, 3, 8807, 824, 108, 97, 110, 116, 59, 3, 10878, 824, 59, 3, 10878, 824, 105, 109, 59, 1, 8821, 4, 2, 59, 114, 13574, 13576, 1, 8815, 59, 1, 8815, 4, 3, 65, 97, 112, 13587, 13592, 13597, 114, 114, 59, 1, 8654, 114, 114, 59, 1, 8622, 97, 114, 59, 1, 10994, 4, 3, 59, 115, 118, 13610, 13612, 13623, 1, 8715, 4, 2, 59, 100, 13618, 13620, 1, 8956, 59, 1, 8954, 59, 1, 8715, 99, 121, 59, 1, 1114, 4, 7, 65, 69, 97, 100, 101, 115, 116, 13647, 13652, 13656, 13661, 13665, 13737, 13742, 114, 114, 59, 1, 8653, 59, 3, 8806, 824, 114, 114, 59, 1, 8602, 114, 59, 1, 8229, 4, 4, 59, 102, 113, 115, 13675, 13677, 13703, 13725, 1, 8816, 116, 4, 2, 97, 114, 13684, 13691, 114, 114, 111, 119, 59, 1, 8602, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8622, 4, 3, 59, 113, 115, 13711, 13713, 13717, 1, 8816, 59, 3, 8806, 824, 108, 97, 110, 116, 59, 3, 10877, 824, 4, 2, 59, 115, 13731, 13734, 3, 10877, 824, 59, 1, 8814, 105, 109, 59, 1, 8820, 4, 2, 59, 114, 13748, 13750, 1, 8814, 105, 4, 2, 59, 101, 13757, 13759, 1, 8938, 59, 1, 8940, 105, 100, 59, 1, 8740, 4, 2, 112, 116, 13773, 13778, 102, 59, 3, 55349, 56671, 5, 172, 3, 59, 105, 110, 13787, 13789, 13829, 1, 172, 110, 4, 4, 59, 69, 100, 118, 13800, 13802, 13806, 13812, 1, 8713, 59, 3, 8953, 824, 111, 116, 59, 3, 8949, 824, 4, 3, 97, 98, 99, 13820, 13823, 13826, 59, 1, 8713, 59, 1, 8951, 59, 1, 8950, 105, 4, 2, 59, 118, 13836, 13838, 1, 8716, 4, 3, 97, 98, 99, 13846, 13849, 13852, 59, 1, 8716, 59, 1, 8958, 59, 1, 8957, 4, 3, 97, 111, 114, 13863, 13892, 13899, 114, 4, 4, 59, 97, 115, 116, 13874, 13876, 13883, 13888, 1, 8742, 108, 108, 101, 108, 59, 1, 8742, 108, 59, 3, 11005, 8421, 59, 3, 8706, 824, 108, 105, 110, 116, 59, 1, 10772, 4, 3, 59, 99, 101, 13907, 13909, 13914, 1, 8832, 117, 101, 59, 1, 8928, 4, 2, 59, 99, 13920, 13923, 3, 10927, 824, 4, 2, 59, 101, 13929, 13931, 1, 8832, 113, 59, 3, 10927, 824, 4, 4, 65, 97, 105, 116, 13946, 13951, 13971, 13982, 114, 114, 59, 1, 8655, 114, 114, 4, 3, 59, 99, 119, 13961, 13963, 13967, 1, 8603, 59, 3, 10547, 824, 59, 3, 8605, 824, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8603, 114, 105, 4, 2, 59, 101, 13990, 13992, 1, 8939, 59, 1, 8941, 4, 7, 99, 104, 105, 109, 112, 113, 117, 14011, 14036, 14060, 14080, 14085, 14090, 14106, 4, 4, 59, 99, 101, 114, 14021, 14023, 14028, 14032, 1, 8833, 117, 101, 59, 1, 8929, 59, 3, 10928, 824, 59, 3, 55349, 56515, 111, 114, 116, 4, 2, 109, 112, 14045, 14050, 105, 100, 59, 1, 8740, 97, 114, 97, 108, 108, 101, 108, 59, 1, 8742, 109, 4, 2, 59, 101, 14067, 14069, 1, 8769, 4, 2, 59, 113, 14075, 14077, 1, 8772, 59, 1, 8772, 105, 100, 59, 1, 8740, 97, 114, 59, 1, 8742, 115, 117, 4, 2, 98, 112, 14098, 14102, 101, 59, 1, 8930, 101, 59, 1, 8931, 4, 3, 98, 99, 112, 14114, 14157, 14171, 4, 4, 59, 69, 101, 115, 14124, 14126, 14130, 14133, 1, 8836, 59, 3, 10949, 824, 59, 1, 8840, 101, 116, 4, 2, 59, 101, 14141, 14144, 3, 8834, 8402, 113, 4, 2, 59, 113, 14151, 14153, 1, 8840, 59, 3, 10949, 824, 99, 4, 2, 59, 101, 14164, 14166, 1, 8833, 113, 59, 3, 10928, 824, 4, 4, 59, 69, 101, 115, 14181, 14183, 14187, 14190, 1, 8837, 59, 3, 10950, 824, 59, 1, 8841, 101, 116, 4, 2, 59, 101, 14198, 14201, 3, 8835, 8402, 113, 4, 2, 59, 113, 14208, 14210, 1, 8841, 59, 3, 10950, 824, 4, 4, 103, 105, 108, 114, 14224, 14228, 14238, 14242, 108, 59, 1, 8825, 108, 100, 101, 5, 241, 1, 59, 14236, 1, 241, 103, 59, 1, 8824, 105, 97, 110, 103, 108, 101, 4, 2, 108, 114, 14254, 14269, 101, 102, 116, 4, 2, 59, 101, 14263, 14265, 1, 8938, 113, 59, 1, 8940, 105, 103, 104, 116, 4, 2, 59, 101, 14279, 14281, 1, 8939, 113, 59, 1, 8941, 4, 2, 59, 109, 14291, 14293, 1, 957, 4, 3, 59, 101, 115, 14301, 14303, 14308, 1, 35, 114, 111, 59, 1, 8470, 112, 59, 1, 8199, 4, 9, 68, 72, 97, 100, 103, 105, 108, 114, 115, 14332, 14338, 14344, 14349, 14355, 14369, 14376, 14408, 14426, 97, 115, 104, 59, 1, 8877, 97, 114, 114, 59, 1, 10500, 112, 59, 3, 8781, 8402, 97, 115, 104, 59, 1, 8876, 4, 2, 101, 116, 14361, 14365, 59, 3, 8805, 8402, 59, 3, 62, 8402, 110, 102, 105, 110, 59, 1, 10718, 4, 3, 65, 101, 116, 14384, 14389, 14393, 114, 114, 59, 1, 10498, 59, 3, 8804, 8402, 4, 2, 59, 114, 14399, 14402, 3, 60, 8402, 105, 101, 59, 3, 8884, 8402, 4, 2, 65, 116, 14414, 14419, 114, 114, 59, 1, 10499, 114, 105, 101, 59, 3, 8885, 8402, 105, 109, 59, 3, 8764, 8402, 4, 3, 65, 97, 110, 14440, 14445, 14468, 114, 114, 59, 1, 8662, 114, 4, 2, 104, 114, 14452, 14456, 107, 59, 1, 10531, 4, 2, 59, 111, 14462, 14464, 1, 8598, 119, 59, 1, 8598, 101, 97, 114, 59, 1, 10535, 4, 18, 83, 97, 99, 100, 101, 102, 103, 104, 105, 108, 109, 111, 112, 114, 115, 116, 117, 118, 14512, 14515, 14535, 14560, 14597, 14603, 14618, 14643, 14657, 14662, 14701, 14741, 14747, 14769, 14851, 14877, 14907, 14916, 59, 1, 9416, 4, 2, 99, 115, 14521, 14531, 117, 116, 101, 5, 243, 1, 59, 14529, 1, 243, 116, 59, 1, 8859, 4, 2, 105, 121, 14541, 14557, 114, 4, 2, 59, 99, 14548, 14550, 1, 8858, 5, 244, 1, 59, 14555, 1, 244, 59, 1, 1086, 4, 5, 97, 98, 105, 111, 115, 14572, 14577, 14583, 14587, 14591, 115, 104, 59, 1, 8861, 108, 97, 99, 59, 1, 337, 118, 59, 1, 10808, 116, 59, 1, 8857, 111, 108, 100, 59, 1, 10684, 108, 105, 103, 59, 1, 339, 4, 2, 99, 114, 14609, 14614, 105, 114, 59, 1, 10687, 59, 3, 55349, 56620, 4, 3, 111, 114, 116, 14626, 14630, 14640, 110, 59, 1, 731, 97, 118, 101, 5, 242, 1, 59, 14638, 1, 242, 59, 1, 10689, 4, 2, 98, 109, 14649, 14654, 97, 114, 59, 1, 10677, 59, 1, 937, 110, 116, 59, 1, 8750, 4, 4, 97, 99, 105, 116, 14672, 14677, 14693, 14698, 114, 114, 59, 1, 8634, 4, 2, 105, 114, 14683, 14687, 114, 59, 1, 10686, 111, 115, 115, 59, 1, 10683, 110, 101, 59, 1, 8254, 59, 1, 10688, 4, 3, 97, 101, 105, 14709, 14714, 14719, 99, 114, 59, 1, 333, 103, 97, 59, 1, 969, 4, 3, 99, 100, 110, 14727, 14733, 14736, 114, 111, 110, 59, 1, 959, 59, 1, 10678, 117, 115, 59, 1, 8854, 112, 102, 59, 3, 55349, 56672, 4, 3, 97, 101, 108, 14755, 14759, 14764, 114, 59, 1, 10679, 114, 112, 59, 1, 10681, 117, 115, 59, 1, 8853, 4, 7, 59, 97, 100, 105, 111, 115, 118, 14785, 14787, 14792, 14831, 14837, 14841, 14848, 1, 8744, 114, 114, 59, 1, 8635, 4, 4, 59, 101, 102, 109, 14802, 14804, 14817, 14824, 1, 10845, 114, 4, 2, 59, 111, 14811, 14813, 1, 8500, 102, 59, 1, 8500, 5, 170, 1, 59, 14822, 1, 170, 5, 186, 1, 59, 14829, 1, 186, 103, 111, 102, 59, 1, 8886, 114, 59, 1, 10838, 108, 111, 112, 101, 59, 1, 10839, 59, 1, 10843, 4, 3, 99, 108, 111, 14859, 14863, 14873, 114, 59, 1, 8500, 97, 115, 104, 5, 248, 1, 59, 14871, 1, 248, 108, 59, 1, 8856, 105, 4, 2, 108, 109, 14884, 14893, 100, 101, 5, 245, 1, 59, 14891, 1, 245, 101, 115, 4, 2, 59, 97, 14901, 14903, 1, 8855, 115, 59, 1, 10806, 109, 108, 5, 246, 1, 59, 14914, 1, 246, 98, 97, 114, 59, 1, 9021, 4, 12, 97, 99, 101, 102, 104, 105, 108, 109, 111, 114, 115, 117, 14948, 14992, 14996, 15033, 15038, 15068, 15090, 15189, 15192, 15222, 15427, 15441, 114, 4, 4, 59, 97, 115, 116, 14959, 14961, 14976, 14989, 1, 8741, 5, 182, 2, 59, 108, 14968, 14970, 1, 182, 108, 101, 108, 59, 1, 8741, 4, 2, 105, 108, 14982, 14986, 109, 59, 1, 10995, 59, 1, 11005, 59, 1, 8706, 121, 59, 1, 1087, 114, 4, 5, 99, 105, 109, 112, 116, 15009, 15014, 15019, 15024, 15027, 110, 116, 59, 1, 37, 111, 100, 59, 1, 46, 105, 108, 59, 1, 8240, 59, 1, 8869, 101, 110, 107, 59, 1, 8241, 114, 59, 3, 55349, 56621, 4, 3, 105, 109, 111, 15046, 15057, 15063, 4, 2, 59, 118, 15052, 15054, 1, 966, 59, 1, 981, 109, 97, 116, 59, 1, 8499, 110, 101, 59, 1, 9742, 4, 3, 59, 116, 118, 15076, 15078, 15087, 1, 960, 99, 104, 102, 111, 114, 107, 59, 1, 8916, 59, 1, 982, 4, 2, 97, 117, 15096, 15119, 110, 4, 2, 99, 107, 15103, 15115, 107, 4, 2, 59, 104, 15110, 15112, 1, 8463, 59, 1, 8462, 118, 59, 1, 8463, 115, 4, 9, 59, 97, 98, 99, 100, 101, 109, 115, 116, 15140, 15142, 15148, 15151, 15156, 15168, 15171, 15179, 15184, 1, 43, 99, 105, 114, 59, 1, 10787, 59, 1, 8862, 105, 114, 59, 1, 10786, 4, 2, 111, 117, 15162, 15165, 59, 1, 8724, 59, 1, 10789, 59, 1, 10866, 110, 5, 177, 1, 59, 15177, 1, 177, 105, 109, 59, 1, 10790, 119, 111, 59, 1, 10791, 59, 1, 177, 4, 3, 105, 112, 117, 15200, 15208, 15213, 110, 116, 105, 110, 116, 59, 1, 10773, 102, 59, 3, 55349, 56673, 110, 100, 5, 163, 1, 59, 15220, 1, 163, 4, 10, 59, 69, 97, 99, 101, 105, 110, 111, 115, 117, 15244, 15246, 15249, 15253, 15258, 15334, 15347, 15367, 15416, 15421, 1, 8826, 59, 1, 10931, 112, 59, 1, 10935, 117, 101, 59, 1, 8828, 4, 2, 59, 99, 15264, 15266, 1, 10927, 4, 6, 59, 97, 99, 101, 110, 115, 15280, 15282, 15290, 15299, 15303, 15329, 1, 8826, 112, 112, 114, 111, 120, 59, 1, 10935, 117, 114, 108, 121, 101, 113, 59, 1, 8828, 113, 59, 1, 10927, 4, 3, 97, 101, 115, 15311, 15319, 15324, 112, 112, 114, 111, 120, 59, 1, 10937, 113, 113, 59, 1, 10933, 105, 109, 59, 1, 8936, 105, 109, 59, 1, 8830, 109, 101, 4, 2, 59, 115, 15342, 15344, 1, 8242, 59, 1, 8473, 4, 3, 69, 97, 115, 15355, 15358, 15362, 59, 1, 10933, 112, 59, 1, 10937, 105, 109, 59, 1, 8936, 4, 3, 100, 102, 112, 15375, 15378, 15404, 59, 1, 8719, 4, 3, 97, 108, 115, 15386, 15392, 15398, 108, 97, 114, 59, 1, 9006, 105, 110, 101, 59, 1, 8978, 117, 114, 102, 59, 1, 8979, 4, 2, 59, 116, 15410, 15412, 1, 8733, 111, 59, 1, 8733, 105, 109, 59, 1, 8830, 114, 101, 108, 59, 1, 8880, 4, 2, 99, 105, 15433, 15438, 114, 59, 3, 55349, 56517, 59, 1, 968, 110, 99, 115, 112, 59, 1, 8200, 4, 6, 102, 105, 111, 112, 115, 117, 15462, 15467, 15472, 15478, 15485, 15491, 114, 59, 3, 55349, 56622, 110, 116, 59, 1, 10764, 112, 102, 59, 3, 55349, 56674, 114, 105, 109, 101, 59, 1, 8279, 99, 114, 59, 3, 55349, 56518, 4, 3, 97, 101, 111, 15499, 15520, 15534, 116, 4, 2, 101, 105, 15506, 15515, 114, 110, 105, 111, 110, 115, 59, 1, 8461, 110, 116, 59, 1, 10774, 115, 116, 4, 2, 59, 101, 15528, 15530, 1, 63, 113, 59, 1, 8799, 116, 5, 34, 1, 59, 15540, 1, 34, 4, 21, 65, 66, 72, 97, 98, 99, 100, 101, 102, 104, 105, 108, 109, 110, 111, 112, 114, 115, 116, 117, 120, 15586, 15609, 15615, 15620, 15796, 15855, 15893, 15931, 15977, 16001, 16039, 16183, 16204, 16222, 16228, 16285, 16312, 16318, 16363, 16408, 16416, 4, 3, 97, 114, 116, 15594, 15599, 15603, 114, 114, 59, 1, 8667, 114, 59, 1, 8658, 97, 105, 108, 59, 1, 10524, 97, 114, 114, 59, 1, 10511, 97, 114, 59, 1, 10596, 4, 7, 99, 100, 101, 110, 113, 114, 116, 15636, 15651, 15656, 15664, 15687, 15696, 15770, 4, 2, 101, 117, 15642, 15646, 59, 3, 8765, 817, 116, 101, 59, 1, 341, 105, 99, 59, 1, 8730, 109, 112, 116, 121, 118, 59, 1, 10675, 103, 4, 4, 59, 100, 101, 108, 15675, 15677, 15680, 15683, 1, 10217, 59, 1, 10642, 59, 1, 10661, 101, 59, 1, 10217, 117, 111, 5, 187, 1, 59, 15694, 1, 187, 114, 4, 11, 59, 97, 98, 99, 102, 104, 108, 112, 115, 116, 119, 15721, 15723, 15727, 15739, 15742, 15746, 15750, 15754, 15758, 15763, 15767, 1, 8594, 112, 59, 1, 10613, 4, 2, 59, 102, 15733, 15735, 1, 8677, 115, 59, 1, 10528, 59, 1, 10547, 115, 59, 1, 10526, 107, 59, 1, 8618, 112, 59, 1, 8620, 108, 59, 1, 10565, 105, 109, 59, 1, 10612, 108, 59, 1, 8611, 59, 1, 8605, 4, 2, 97, 105, 15776, 15781, 105, 108, 59, 1, 10522, 111, 4, 2, 59, 110, 15788, 15790, 1, 8758, 97, 108, 115, 59, 1, 8474, 4, 3, 97, 98, 114, 15804, 15809, 15814, 114, 114, 59, 1, 10509, 114, 107, 59, 1, 10099, 4, 2, 97, 107, 15820, 15833, 99, 4, 2, 101, 107, 15827, 15830, 59, 1, 125, 59, 1, 93, 4, 2, 101, 115, 15839, 15842, 59, 1, 10636, 108, 4, 2, 100, 117, 15849, 15852, 59, 1, 10638, 59, 1, 10640, 4, 4, 97, 101, 117, 121, 15865, 15871, 15886, 15890, 114, 111, 110, 59, 1, 345, 4, 2, 100, 105, 15877, 15882, 105, 108, 59, 1, 343, 108, 59, 1, 8969, 98, 59, 1, 125, 59, 1, 1088, 4, 4, 99, 108, 113, 115, 15903, 15907, 15914, 15927, 97, 59, 1, 10551, 100, 104, 97, 114, 59, 1, 10601, 117, 111, 4, 2, 59, 114, 15922, 15924, 1, 8221, 59, 1, 8221, 104, 59, 1, 8627, 4, 3, 97, 99, 103, 15939, 15966, 15970, 108, 4, 4, 59, 105, 112, 115, 15950, 15952, 15957, 15963, 1, 8476, 110, 101, 59, 1, 8475, 97, 114, 116, 59, 1, 8476, 59, 1, 8477, 116, 59, 1, 9645, 5, 174, 1, 59, 15975, 1, 174, 4, 3, 105, 108, 114, 15985, 15991, 15997, 115, 104, 116, 59, 1, 10621, 111, 111, 114, 59, 1, 8971, 59, 3, 55349, 56623, 4, 2, 97, 111, 16007, 16028, 114, 4, 2, 100, 117, 16014, 16017, 59, 1, 8641, 4, 2, 59, 108, 16023, 16025, 1, 8640, 59, 1, 10604, 4, 2, 59, 118, 16034, 16036, 1, 961, 59, 1, 1009, 4, 3, 103, 110, 115, 16047, 16167, 16171, 104, 116, 4, 6, 97, 104, 108, 114, 115, 116, 16063, 16081, 16103, 16130, 16143, 16155, 114, 114, 111, 119, 4, 2, 59, 116, 16073, 16075, 1, 8594, 97, 105, 108, 59, 1, 8611, 97, 114, 112, 111, 111, 110, 4, 2, 100, 117, 16093, 16099, 111, 119, 110, 59, 1, 8641, 112, 59, 1, 8640, 101, 102, 116, 4, 2, 97, 104, 16112, 16120, 114, 114, 111, 119, 115, 59, 1, 8644, 97, 114, 112, 111, 111, 110, 115, 59, 1, 8652, 105, 103, 104, 116, 97, 114, 114, 111, 119, 115, 59, 1, 8649, 113, 117, 105, 103, 97, 114, 114, 111, 119, 59, 1, 8605, 104, 114, 101, 101, 116, 105, 109, 101, 115, 59, 1, 8908, 103, 59, 1, 730, 105, 110, 103, 100, 111, 116, 115, 101, 113, 59, 1, 8787, 4, 3, 97, 104, 109, 16191, 16196, 16201, 114, 114, 59, 1, 8644, 97, 114, 59, 1, 8652, 59, 1, 8207, 111, 117, 115, 116, 4, 2, 59, 97, 16214, 16216, 1, 9137, 99, 104, 101, 59, 1, 9137, 109, 105, 100, 59, 1, 10990, 4, 4, 97, 98, 112, 116, 16238, 16252, 16257, 16278, 4, 2, 110, 114, 16244, 16248, 103, 59, 1, 10221, 114, 59, 1, 8702, 114, 107, 59, 1, 10215, 4, 3, 97, 102, 108, 16265, 16269, 16273, 114, 59, 1, 10630, 59, 3, 55349, 56675, 117, 115, 59, 1, 10798, 105, 109, 101, 115, 59, 1, 10805, 4, 2, 97, 112, 16291, 16304, 114, 4, 2, 59, 103, 16298, 16300, 1, 41, 116, 59, 1, 10644, 111, 108, 105, 110, 116, 59, 1, 10770, 97, 114, 114, 59, 1, 8649, 4, 4, 97, 99, 104, 113, 16328, 16334, 16339, 16342, 113, 117, 111, 59, 1, 8250, 114, 59, 3, 55349, 56519, 59, 1, 8625, 4, 2, 98, 117, 16348, 16351, 59, 1, 93, 111, 4, 2, 59, 114, 16358, 16360, 1, 8217, 59, 1, 8217, 4, 3, 104, 105, 114, 16371, 16377, 16383, 114, 101, 101, 59, 1, 8908, 109, 101, 115, 59, 1, 8906, 105, 4, 4, 59, 101, 102, 108, 16394, 16396, 16399, 16402, 1, 9657, 59, 1, 8885, 59, 1, 9656, 116, 114, 105, 59, 1, 10702, 108, 117, 104, 97, 114, 59, 1, 10600, 59, 1, 8478, 4, 19, 97, 98, 99, 100, 101, 102, 104, 105, 108, 109, 111, 112, 113, 114, 115, 116, 117, 119, 122, 16459, 16466, 16472, 16572, 16590, 16672, 16687, 16746, 16844, 16850, 16924, 16963, 16988, 17115, 17121, 17154, 17206, 17614, 17656, 99, 117, 116, 101, 59, 1, 347, 113, 117, 111, 59, 1, 8218, 4, 10, 59, 69, 97, 99, 101, 105, 110, 112, 115, 121, 16494, 16496, 16499, 16513, 16518, 16531, 16536, 16556, 16564, 16569, 1, 8827, 59, 1, 10932, 4, 2, 112, 114, 16505, 16508, 59, 1, 10936, 111, 110, 59, 1, 353, 117, 101, 59, 1, 8829, 4, 2, 59, 100, 16524, 16526, 1, 10928, 105, 108, 59, 1, 351, 114, 99, 59, 1, 349, 4, 3, 69, 97, 115, 16544, 16547, 16551, 59, 1, 10934, 112, 59, 1, 10938, 105, 109, 59, 1, 8937, 111, 108, 105, 110, 116, 59, 1, 10771, 105, 109, 59, 1, 8831, 59, 1, 1089, 111, 116, 4, 3, 59, 98, 101, 16582, 16584, 16587, 1, 8901, 59, 1, 8865, 59, 1, 10854, 4, 7, 65, 97, 99, 109, 115, 116, 120, 16606, 16611, 16634, 16642, 16646, 16652, 16668, 114, 114, 59, 1, 8664, 114, 4, 2, 104, 114, 16618, 16622, 107, 59, 1, 10533, 4, 2, 59, 111, 16628, 16630, 1, 8600, 119, 59, 1, 8600, 116, 5, 167, 1, 59, 16640, 1, 167, 105, 59, 1, 59, 119, 97, 114, 59, 1, 10537, 109, 4, 2, 105, 110, 16659, 16665, 110, 117, 115, 59, 1, 8726, 59, 1, 8726, 116, 59, 1, 10038, 114, 4, 2, 59, 111, 16679, 16682, 3, 55349, 56624, 119, 110, 59, 1, 8994, 4, 4, 97, 99, 111, 121, 16697, 16702, 16716, 16739, 114, 112, 59, 1, 9839, 4, 2, 104, 121, 16708, 16713, 99, 121, 59, 1, 1097, 59, 1, 1096, 114, 116, 4, 2, 109, 112, 16724, 16729, 105, 100, 59, 1, 8739, 97, 114, 97, 108, 108, 101, 108, 59, 1, 8741, 5, 173, 1, 59, 16744, 1, 173, 4, 2, 103, 109, 16752, 16770, 109, 97, 4, 3, 59, 102, 118, 16762, 16764, 16767, 1, 963, 59, 1, 962, 59, 1, 962, 4, 8, 59, 100, 101, 103, 108, 110, 112, 114, 16788, 16790, 16795, 16806, 16817, 16828, 16832, 16838, 1, 8764, 111, 116, 59, 1, 10858, 4, 2, 59, 113, 16801, 16803, 1, 8771, 59, 1, 8771, 4, 2, 59, 69, 16812, 16814, 1, 10910, 59, 1, 10912, 4, 2, 59, 69, 16823, 16825, 1, 10909, 59, 1, 10911, 101, 59, 1, 8774, 108, 117, 115, 59, 1, 10788, 97, 114, 114, 59, 1, 10610, 97, 114, 114, 59, 1, 8592, 4, 4, 97, 101, 105, 116, 16860, 16883, 16891, 16904, 4, 2, 108, 115, 16866, 16878, 108, 115, 101, 116, 109, 105, 110, 117, 115, 59, 1, 8726, 104, 112, 59, 1, 10803, 112, 97, 114, 115, 108, 59, 1, 10724, 4, 2, 100, 108, 16897, 16900, 59, 1, 8739, 101, 59, 1, 8995, 4, 2, 59, 101, 16910, 16912, 1, 10922, 4, 2, 59, 115, 16918, 16920, 1, 10924, 59, 3, 10924, 65024, 4, 3, 102, 108, 112, 16932, 16938, 16958, 116, 99, 121, 59, 1, 1100, 4, 2, 59, 98, 16944, 16946, 1, 47, 4, 2, 59, 97, 16952, 16954, 1, 10692, 114, 59, 1, 9023, 102, 59, 3, 55349, 56676, 97, 4, 2, 100, 114, 16970, 16985, 101, 115, 4, 2, 59, 117, 16978, 16980, 1, 9824, 105, 116, 59, 1, 9824, 59, 1, 8741, 4, 3, 99, 115, 117, 16996, 17028, 17089, 4, 2, 97, 117, 17002, 17015, 112, 4, 2, 59, 115, 17009, 17011, 1, 8851, 59, 3, 8851, 65024, 112, 4, 2, 59, 115, 17022, 17024, 1, 8852, 59, 3, 8852, 65024, 117, 4, 2, 98, 112, 17035, 17062, 4, 3, 59, 101, 115, 17043, 17045, 17048, 1, 8847, 59, 1, 8849, 101, 116, 4, 2, 59, 101, 17056, 17058, 1, 8847, 113, 59, 1, 8849, 4, 3, 59, 101, 115, 17070, 17072, 17075, 1, 8848, 59, 1, 8850, 101, 116, 4, 2, 59, 101, 17083, 17085, 1, 8848, 113, 59, 1, 8850, 4, 3, 59, 97, 102, 17097, 17099, 17112, 1, 9633, 114, 4, 2, 101, 102, 17106, 17109, 59, 1, 9633, 59, 1, 9642, 59, 1, 9642, 97, 114, 114, 59, 1, 8594, 4, 4, 99, 101, 109, 116, 17131, 17136, 17142, 17148, 114, 59, 3, 55349, 56520, 116, 109, 110, 59, 1, 8726, 105, 108, 101, 59, 1, 8995, 97, 114, 102, 59, 1, 8902, 4, 2, 97, 114, 17160, 17172, 114, 4, 2, 59, 102, 17167, 17169, 1, 9734, 59, 1, 9733, 4, 2, 97, 110, 17178, 17202, 105, 103, 104, 116, 4, 2, 101, 112, 17188, 17197, 112, 115, 105, 108, 111, 110, 59, 1, 1013, 104, 105, 59, 1, 981, 115, 59, 1, 175, 4, 5, 98, 99, 109, 110, 112, 17218, 17351, 17420, 17423, 17427, 4, 9, 59, 69, 100, 101, 109, 110, 112, 114, 115, 17238, 17240, 17243, 17248, 17261, 17267, 17279, 17285, 17291, 1, 8834, 59, 1, 10949, 111, 116, 59, 1, 10941, 4, 2, 59, 100, 17254, 17256, 1, 8838, 111, 116, 59, 1, 10947, 117, 108, 116, 59, 1, 10945, 4, 2, 69, 101, 17273, 17276, 59, 1, 10955, 59, 1, 8842, 108, 117, 115, 59, 1, 10943, 97, 114, 114, 59, 1, 10617, 4, 3, 101, 105, 117, 17299, 17335, 17339, 116, 4, 3, 59, 101, 110, 17308, 17310, 17322, 1, 8834, 113, 4, 2, 59, 113, 17317, 17319, 1, 8838, 59, 1, 10949, 101, 113, 4, 2, 59, 113, 17330, 17332, 1, 8842, 59, 1, 10955, 109, 59, 1, 10951, 4, 2, 98, 112, 17345, 17348, 59, 1, 10965, 59, 1, 10963, 99, 4, 6, 59, 97, 99, 101, 110, 115, 17366, 17368, 17376, 17385, 17389, 17415, 1, 8827, 112, 112, 114, 111, 120, 59, 1, 10936, 117, 114, 108, 121, 101, 113, 59, 1, 8829, 113, 59, 1, 10928, 4, 3, 97, 101, 115, 17397, 17405, 17410, 112, 112, 114, 111, 120, 59, 1, 10938, 113, 113, 59, 1, 10934, 105, 109, 59, 1, 8937, 105, 109, 59, 1, 8831, 59, 1, 8721, 103, 59, 1, 9834, 4, 13, 49, 50, 51, 59, 69, 100, 101, 104, 108, 109, 110, 112, 115, 17455, 17462, 17469, 17476, 17478, 17481, 17496, 17509, 17524, 17530, 17536, 17548, 17554, 5, 185, 1, 59, 17460, 1, 185, 5, 178, 1, 59, 17467, 1, 178, 5, 179, 1, 59, 17474, 1, 179, 1, 8835, 59, 1, 10950, 4, 2, 111, 115, 17487, 17491, 116, 59, 1, 10942, 117, 98, 59, 1, 10968, 4, 2, 59, 100, 17502, 17504, 1, 8839, 111, 116, 59, 1, 10948, 115, 4, 2, 111, 117, 17516, 17520, 108, 59, 1, 10185, 98, 59, 1, 10967, 97, 114, 114, 59, 1, 10619, 117, 108, 116, 59, 1, 10946, 4, 2, 69, 101, 17542, 17545, 59, 1, 10956, 59, 1, 8843, 108, 117, 115, 59, 1, 10944, 4, 3, 101, 105, 117, 17562, 17598, 17602, 116, 4, 3, 59, 101, 110, 17571, 17573, 17585, 1, 8835, 113, 4, 2, 59, 113, 17580, 17582, 1, 8839, 59, 1, 10950, 101, 113, 4, 2, 59, 113, 17593, 17595, 1, 8843, 59, 1, 10956, 109, 59, 1, 10952, 4, 2, 98, 112, 17608, 17611, 59, 1, 10964, 59, 1, 10966, 4, 3, 65, 97, 110, 17622, 17627, 17650, 114, 114, 59, 1, 8665, 114, 4, 2, 104, 114, 17634, 17638, 107, 59, 1, 10534, 4, 2, 59, 111, 17644, 17646, 1, 8601, 119, 59, 1, 8601, 119, 97, 114, 59, 1, 10538, 108, 105, 103, 5, 223, 1, 59, 17664, 1, 223, 4, 13, 97, 98, 99, 100, 101, 102, 104, 105, 111, 112, 114, 115, 119, 17694, 17709, 17714, 17737, 17742, 17749, 17754, 17860, 17905, 17957, 17964, 18090, 18122, 4, 2, 114, 117, 17700, 17706, 103, 101, 116, 59, 1, 8982, 59, 1, 964, 114, 107, 59, 1, 9140, 4, 3, 97, 101, 121, 17722, 17728, 17734, 114, 111, 110, 59, 1, 357, 100, 105, 108, 59, 1, 355, 59, 1, 1090, 111, 116, 59, 1, 8411, 108, 114, 101, 99, 59, 1, 8981, 114, 59, 3, 55349, 56625, 4, 4, 101, 105, 107, 111, 17764, 17805, 17836, 17851, 4, 2, 114, 116, 17770, 17786, 101, 4, 2, 52, 102, 17777, 17780, 59, 1, 8756, 111, 114, 101, 59, 1, 8756, 97, 4, 3, 59, 115, 118, 17795, 17797, 17802, 1, 952, 121, 109, 59, 1, 977, 59, 1, 977, 4, 2, 99, 110, 17811, 17831, 107, 4, 2, 97, 115, 17818, 17826, 112, 112, 114, 111, 120, 59, 1, 8776, 105, 109, 59, 1, 8764, 115, 112, 59, 1, 8201, 4, 2, 97, 115, 17842, 17846, 112, 59, 1, 8776, 105, 109, 59, 1, 8764, 114, 110, 5, 254, 1, 59, 17858, 1, 254, 4, 3, 108, 109, 110, 17868, 17873, 17901, 100, 101, 59, 1, 732, 101, 115, 5, 215, 3, 59, 98, 100, 17884, 17886, 17898, 1, 215, 4, 2, 59, 97, 17892, 17894, 1, 8864, 114, 59, 1, 10801, 59, 1, 10800, 116, 59, 1, 8749, 4, 3, 101, 112, 115, 17913, 17917, 17953, 97, 59, 1, 10536, 4, 4, 59, 98, 99, 102, 17927, 17929, 17934, 17939, 1, 8868, 111, 116, 59, 1, 9014, 105, 114, 59, 1, 10993, 4, 2, 59, 111, 17945, 17948, 3, 55349, 56677, 114, 107, 59, 1, 10970, 97, 59, 1, 10537, 114, 105, 109, 101, 59, 1, 8244, 4, 3, 97, 105, 112, 17972, 17977, 18082, 100, 101, 59, 1, 8482, 4, 7, 97, 100, 101, 109, 112, 115, 116, 17993, 18051, 18056, 18059, 18066, 18072, 18076, 110, 103, 108, 101, 4, 5, 59, 100, 108, 113, 114, 18009, 18011, 18017, 18032, 18035, 1, 9653, 111, 119, 110, 59, 1, 9663, 101, 102, 116, 4, 2, 59, 101, 18026, 18028, 1, 9667, 113, 59, 1, 8884, 59, 1, 8796, 105, 103, 104, 116, 4, 2, 59, 101, 18045, 18047, 1, 9657, 113, 59, 1, 8885, 111, 116, 59, 1, 9708, 59, 1, 8796, 105, 110, 117, 115, 59, 1, 10810, 108, 117, 115, 59, 1, 10809, 98, 59, 1, 10701, 105, 109, 101, 59, 1, 10811, 101, 122, 105, 117, 109, 59, 1, 9186, 4, 3, 99, 104, 116, 18098, 18111, 18116, 4, 2, 114, 121, 18104, 18108, 59, 3, 55349, 56521, 59, 1, 1094, 99, 121, 59, 1, 1115, 114, 111, 107, 59, 1, 359, 4, 2, 105, 111, 18128, 18133, 120, 116, 59, 1, 8812, 104, 101, 97, 100, 4, 2, 108, 114, 18143, 18154, 101, 102, 116, 97, 114, 114, 111, 119, 59, 1, 8606, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 1, 8608, 4, 18, 65, 72, 97, 98, 99, 100, 102, 103, 104, 108, 109, 111, 112, 114, 115, 116, 117, 119, 18204, 18209, 18214, 18234, 18250, 18268, 18292, 18308, 18319, 18343, 18379, 18397, 18413, 18504, 18547, 18553, 18584, 18603, 114, 114, 59, 1, 8657, 97, 114, 59, 1, 10595, 4, 2, 99, 114, 18220, 18230, 117, 116, 101, 5, 250, 1, 59, 18228, 1, 250, 114, 59, 1, 8593, 114, 4, 2, 99, 101, 18241, 18245, 121, 59, 1, 1118, 118, 101, 59, 1, 365, 4, 2, 105, 121, 18256, 18265, 114, 99, 5, 251, 1, 59, 18263, 1, 251, 59, 1, 1091, 4, 3, 97, 98, 104, 18276, 18281, 18287, 114, 114, 59, 1, 8645, 108, 97, 99, 59, 1, 369, 97, 114, 59, 1, 10606, 4, 2, 105, 114, 18298, 18304, 115, 104, 116, 59, 1, 10622, 59, 3, 55349, 56626, 114, 97, 118, 101, 5, 249, 1, 59, 18317, 1, 249, 4, 2, 97, 98, 18325, 18338, 114, 4, 2, 108, 114, 18332, 18335, 59, 1, 8639, 59, 1, 8638, 108, 107, 59, 1, 9600, 4, 2, 99, 116, 18349, 18374, 4, 2, 111, 114, 18355, 18369, 114, 110, 4, 2, 59, 101, 18363, 18365, 1, 8988, 114, 59, 1, 8988, 111, 112, 59, 1, 8975, 114, 105, 59, 1, 9720, 4, 2, 97, 108, 18385, 18390, 99, 114, 59, 1, 363, 5, 168, 1, 59, 18395, 1, 168, 4, 2, 103, 112, 18403, 18408, 111, 110, 59, 1, 371, 102, 59, 3, 55349, 56678, 4, 6, 97, 100, 104, 108, 115, 117, 18427, 18434, 18445, 18470, 18475, 18494, 114, 114, 111, 119, 59, 1, 8593, 111, 119, 110, 97, 114, 114, 111, 119, 59, 1, 8597, 97, 114, 112, 111, 111, 110, 4, 2, 108, 114, 18457, 18463, 101, 102, 116, 59, 1, 8639, 105, 103, 104, 116, 59, 1, 8638, 117, 115, 59, 1, 8846, 105, 4, 3, 59, 104, 108, 18484, 18486, 18489, 1, 965, 59, 1, 978, 111, 110, 59, 1, 965, 112, 97, 114, 114, 111, 119, 115, 59, 1, 8648, 4, 3, 99, 105, 116, 18512, 18537, 18542, 4, 2, 111, 114, 18518, 18532, 114, 110, 4, 2, 59, 101, 18526, 18528, 1, 8989, 114, 59, 1, 8989, 111, 112, 59, 1, 8974, 110, 103, 59, 1, 367, 114, 105, 59, 1, 9721, 99, 114, 59, 3, 55349, 56522, 4, 3, 100, 105, 114, 18561, 18566, 18572, 111, 116, 59, 1, 8944, 108, 100, 101, 59, 1, 361, 105, 4, 2, 59, 102, 18579, 18581, 1, 9653, 59, 1, 9652, 4, 2, 97, 109, 18590, 18595, 114, 114, 59, 1, 8648, 108, 5, 252, 1, 59, 18601, 1, 252, 97, 110, 103, 108, 101, 59, 1, 10663, 4, 15, 65, 66, 68, 97, 99, 100, 101, 102, 108, 110, 111, 112, 114, 115, 122, 18643, 18648, 18661, 18667, 18847, 18851, 18857, 18904, 18909, 18915, 18931, 18937, 18943, 18949, 18996, 114, 114, 59, 1, 8661, 97, 114, 4, 2, 59, 118, 18656, 18658, 1, 10984, 59, 1, 10985, 97, 115, 104, 59, 1, 8872, 4, 2, 110, 114, 18673, 18679, 103, 114, 116, 59, 1, 10652, 4, 7, 101, 107, 110, 112, 114, 115, 116, 18695, 18704, 18711, 18720, 18742, 18754, 18810, 112, 115, 105, 108, 111, 110, 59, 1, 1013, 97, 112, 112, 97, 59, 1, 1008, 111, 116, 104, 105, 110, 103, 59, 1, 8709, 4, 3, 104, 105, 114, 18728, 18732, 18735, 105, 59, 1, 981, 59, 1, 982, 111, 112, 116, 111, 59, 1, 8733, 4, 2, 59, 104, 18748, 18750, 1, 8597, 111, 59, 1, 1009, 4, 2, 105, 117, 18760, 18766, 103, 109, 97, 59, 1, 962, 4, 2, 98, 112, 18772, 18791, 115, 101, 116, 110, 101, 113, 4, 2, 59, 113, 18784, 18787, 3, 8842, 65024, 59, 3, 10955, 65024, 115, 101, 116, 110, 101, 113, 4, 2, 59, 113, 18803, 18806, 3, 8843, 65024, 59, 3, 10956, 65024, 4, 2, 104, 114, 18816, 18822, 101, 116, 97, 59, 1, 977, 105, 97, 110, 103, 108, 101, 4, 2, 108, 114, 18834, 18840, 101, 102, 116, 59, 1, 8882, 105, 103, 104, 116, 59, 1, 8883, 121, 59, 1, 1074, 97, 115, 104, 59, 1, 8866, 4, 3, 101, 108, 114, 18865, 18884, 18890, 4, 3, 59, 98, 101, 18873, 18875, 18880, 1, 8744, 97, 114, 59, 1, 8891, 113, 59, 1, 8794, 108, 105, 112, 59, 1, 8942, 4, 2, 98, 116, 18896, 18901, 97, 114, 59, 1, 124, 59, 1, 124, 114, 59, 3, 55349, 56627, 116, 114, 105, 59, 1, 8882, 115, 117, 4, 2, 98, 112, 18923, 18927, 59, 3, 8834, 8402, 59, 3, 8835, 8402, 112, 102, 59, 3, 55349, 56679, 114, 111, 112, 59, 1, 8733, 116, 114, 105, 59, 1, 8883, 4, 2, 99, 117, 18955, 18960, 114, 59, 3, 55349, 56523, 4, 2, 98, 112, 18966, 18981, 110, 4, 2, 69, 101, 18973, 18977, 59, 3, 10955, 65024, 59, 3, 8842, 65024, 110, 4, 2, 69, 101, 18988, 18992, 59, 3, 10956, 65024, 59, 3, 8843, 65024, 105, 103, 122, 97, 103, 59, 1, 10650, 4, 7, 99, 101, 102, 111, 112, 114, 115, 19020, 19026, 19061, 19066, 19072, 19075, 19089, 105, 114, 99, 59, 1, 373, 4, 2, 100, 105, 19032, 19055, 4, 2, 98, 103, 19038, 19043, 97, 114, 59, 1, 10847, 101, 4, 2, 59, 113, 19050, 19052, 1, 8743, 59, 1, 8793, 101, 114, 112, 59, 1, 8472, 114, 59, 3, 55349, 56628, 112, 102, 59, 3, 55349, 56680, 59, 1, 8472, 4, 2, 59, 101, 19081, 19083, 1, 8768, 97, 116, 104, 59, 1, 8768, 99, 114, 59, 3, 55349, 56524, 4, 14, 99, 100, 102, 104, 105, 108, 109, 110, 111, 114, 115, 117, 118, 119, 19125, 19146, 19152, 19157, 19173, 19176, 19192, 19197, 19202, 19236, 19252, 19269, 19286, 19291, 4, 3, 97, 105, 117, 19133, 19137, 19142, 112, 59, 1, 8898, 114, 99, 59, 1, 9711, 112, 59, 1, 8899, 116, 114, 105, 59, 1, 9661, 114, 59, 3, 55349, 56629, 4, 2, 65, 97, 19163, 19168, 114, 114, 59, 1, 10234, 114, 114, 59, 1, 10231, 59, 1, 958, 4, 2, 65, 97, 19182, 19187, 114, 114, 59, 1, 10232, 114, 114, 59, 1, 10229, 97, 112, 59, 1, 10236, 105, 115, 59, 1, 8955, 4, 3, 100, 112, 116, 19210, 19215, 19230, 111, 116, 59, 1, 10752, 4, 2, 102, 108, 19221, 19225, 59, 3, 55349, 56681, 117, 115, 59, 1, 10753, 105, 109, 101, 59, 1, 10754, 4, 2, 65, 97, 19242, 19247, 114, 114, 59, 1, 10233, 114, 114, 59, 1, 10230, 4, 2, 99, 113, 19258, 19263, 114, 59, 3, 55349, 56525, 99, 117, 112, 59, 1, 10758, 4, 2, 112, 116, 19275, 19281, 108, 117, 115, 59, 1, 10756, 114, 105, 59, 1, 9651, 101, 101, 59, 1, 8897, 101, 100, 103, 101, 59, 1, 8896, 4, 8, 97, 99, 101, 102, 105, 111, 115, 117, 19316, 19335, 19349, 19357, 19362, 19367, 19373, 19379, 99, 4, 2, 117, 121, 19323, 19332, 116, 101, 5, 253, 1, 59, 19330, 1, 253, 59, 1, 1103, 4, 2, 105, 121, 19341, 19346, 114, 99, 59, 1, 375, 59, 1, 1099, 110, 5, 165, 1, 59, 19355, 1, 165, 114, 59, 3, 55349, 56630, 99, 121, 59, 1, 1111, 112, 102, 59, 3, 55349, 56682, 99, 114, 59, 3, 55349, 56526, 4, 2, 99, 109, 19385, 19389, 121, 59, 1, 1102, 108, 5, 255, 1, 59, 19395, 1, 255, 4, 10, 97, 99, 100, 101, 102, 104, 105, 111, 115, 119, 19419, 19426, 19441, 19446, 19462, 19467, 19472, 19480, 19486, 19492, 99, 117, 116, 101, 59, 1, 378, 4, 2, 97, 121, 19432, 19438, 114, 111, 110, 59, 1, 382, 59, 1, 1079, 111, 116, 59, 1, 380, 4, 2, 101, 116, 19452, 19458, 116, 114, 102, 59, 1, 8488, 97, 59, 1, 950, 114, 59, 3, 55349, 56631, 99, 121, 59, 1, 1078, 103, 114, 97, 114, 114, 59, 1, 8669, 112, 102, 59, 3, 55349, 56683, 99, 114, 59, 3, 55349, 56527, 4, 2, 106, 110, 19498, 19501, 59, 1, 8205, 106, 59, 1, 8204]);
const Lu = Ru, X = Qe, Dt = ku, y = wr, p = X.CODE_POINTS, kt = X.CODE_POINT_SEQUENCES, Mu = {
  128: 8364,
  130: 8218,
  131: 402,
  132: 8222,
  133: 8230,
  134: 8224,
  135: 8225,
  136: 710,
  137: 8240,
  138: 352,
  139: 8249,
  140: 338,
  142: 381,
  145: 8216,
  146: 8217,
  147: 8220,
  148: 8221,
  149: 8226,
  150: 8211,
  151: 8212,
  152: 732,
  153: 8482,
  154: 353,
  155: 8250,
  156: 339,
  158: 382,
  159: 376
}, jo = 1 << 0, Qo = 1 << 1, qo = 1 << 2, Pu = jo | Qo | qo, j = "DATA_STATE", qt = "RCDATA_STATE", C1 = "RAWTEXT_STATE", ft = "SCRIPT_DATA_STATE", Wo = "PLAINTEXT_STATE", Mi = "TAG_OPEN_STATE", Pi = "END_TAG_OPEN_STATE", Qn = "TAG_NAME_STATE", Di = "RCDATA_LESS_THAN_SIGN_STATE", wi = "RCDATA_END_TAG_OPEN_STATE", Fi = "RCDATA_END_TAG_NAME_STATE", Hi = "RAWTEXT_LESS_THAN_SIGN_STATE", Bi = "RAWTEXT_END_TAG_OPEN_STATE", Ui = "RAWTEXT_END_TAG_NAME_STATE", vi = "SCRIPT_DATA_LESS_THAN_SIGN_STATE", Gi = "SCRIPT_DATA_END_TAG_OPEN_STATE", Ki = "SCRIPT_DATA_END_TAG_NAME_STATE", zi = "SCRIPT_DATA_ESCAPE_START_STATE", $i = "SCRIPT_DATA_ESCAPE_START_DASH_STATE", Ke = "SCRIPT_DATA_ESCAPED_STATE", Yi = "SCRIPT_DATA_ESCAPED_DASH_STATE", qn = "SCRIPT_DATA_ESCAPED_DASH_DASH_STATE", U1 = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE", ji = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE", Qi = "SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE", qi = "SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE", ot = "SCRIPT_DATA_DOUBLE_ESCAPED_STATE", Wi = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE", Vi = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE", v1 = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE", Xi = "SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE", Ve = "BEFORE_ATTRIBUTE_NAME_STATE", G1 = "ATTRIBUTE_NAME_STATE", Wn = "AFTER_ATTRIBUTE_NAME_STATE", Vn = "BEFORE_ATTRIBUTE_VALUE_STATE", K1 = "ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE", z1 = "ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE", $1 = "ATTRIBUTE_VALUE_UNQUOTED_STATE", Xn = "AFTER_ATTRIBUTE_VALUE_QUOTED_STATE", Et = "SELF_CLOSING_START_TAG_STATE", p1 = "BOGUS_COMMENT_STATE", Zi = "MARKUP_DECLARATION_OPEN_STATE", Ji = "COMMENT_START_STATE", es = "COMMENT_START_DASH_STATE", gt = "COMMENT_STATE", ts = "COMMENT_LESS_THAN_SIGN_STATE", ns = "COMMENT_LESS_THAN_SIGN_BANG_STATE", rs = "COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE", is = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE", Y1 = "COMMENT_END_DASH_STATE", j1 = "COMMENT_END_STATE", ss = "COMMENT_END_BANG_STATE", os = "DOCTYPE_STATE", Q1 = "BEFORE_DOCTYPE_NAME_STATE", q1 = "DOCTYPE_NAME_STATE", as = "AFTER_DOCTYPE_NAME_STATE", ls = "AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE", us = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE", Zn = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE", Jn = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE", er = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE", cs = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE", fs = "AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE", hs = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE", d1 = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE", m1 = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE", tr = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE", at = "BOGUS_DOCTYPE_STATE", W1 = "CDATA_SECTION_STATE", ps = "CDATA_SECTION_BRACKET_STATE", ds = "CDATA_SECTION_END_STATE", zt = "CHARACTER_REFERENCE_STATE", ms = "NAMED_CHARACTER_REFERENCE_STATE", Ts = "AMBIGUOS_AMPERSAND_STATE", Es = "NUMERIC_CHARACTER_REFERENCE_STATE", gs = "HEXADEMICAL_CHARACTER_REFERENCE_START_STATE", _s = "DECIMAL_CHARACTER_REFERENCE_START_STATE", As = "HEXADEMICAL_CHARACTER_REFERENCE_STATE", Cs = "DECIMAL_CHARACTER_REFERENCE_STATE", T1 = "NUMERIC_CHARACTER_REFERENCE_END_STATE";
function ne(e) {
  return e === p.SPACE || e === p.LINE_FEED || e === p.TABULATION || e === p.FORM_FEED;
}
function S1(e) {
  return e >= p.DIGIT_0 && e <= p.DIGIT_9;
}
function $e(e) {
  return e >= p.LATIN_CAPITAL_A && e <= p.LATIN_CAPITAL_Z;
}
function Pt(e) {
  return e >= p.LATIN_SMALL_A && e <= p.LATIN_SMALL_Z;
}
function Nt(e) {
  return Pt(e) || $e(e);
}
function nr(e) {
  return Nt(e) || S1(e);
}
function Vo(e) {
  return e >= p.LATIN_CAPITAL_A && e <= p.LATIN_CAPITAL_F;
}
function Xo(e) {
  return e >= p.LATIN_SMALL_A && e <= p.LATIN_SMALL_F;
}
function Du(e) {
  return S1(e) || Vo(e) || Xo(e);
}
function an(e) {
  return e + 32;
}
function se(e) {
  return e <= 65535 ? String.fromCharCode(e) : (e -= 65536, String.fromCharCode(e >>> 10 & 1023 | 55296) + String.fromCharCode(56320 | e & 1023));
}
function _t(e) {
  return String.fromCharCode(an(e));
}
function Ns(e, t) {
  const n = Dt[++e];
  let r = ++e, i = r + n - 1;
  for (; r <= i; ) {
    const s = r + i >>> 1, o = Dt[s];
    if (o < t)
      r = s + 1;
    else if (o > t)
      i = s - 1;
    else
      return Dt[s + n];
  }
  return -1;
}
let Fe = class Se {
  constructor() {
    this.preprocessor = new Lu(), this.tokenQueue = [], this.allowCDATA = !1, this.state = j, this.returnState = "", this.charRefCode = -1, this.tempBuff = [], this.lastStartTagName = "", this.consumedAfterSnapshot = -1, this.active = !1, this.currentCharacterToken = null, this.currentToken = null, this.currentAttr = null;
  }
  //Errors
  _err() {
  }
  _errOnNextCodePoint(t) {
    this._consume(), this._err(t), this._unconsume();
  }
  //API
  getNextToken() {
    for (; !this.tokenQueue.length && this.active; ) {
      this.consumedAfterSnapshot = 0;
      const t = this._consume();
      this._ensureHibernation() || this[this.state](t);
    }
    return this.tokenQueue.shift();
  }
  write(t, n) {
    this.active = !0, this.preprocessor.write(t, n);
  }
  insertHtmlAtCurrentPos(t) {
    this.active = !0, this.preprocessor.insertHtmlAtCurrentPos(t);
  }
  //Hibernation
  _ensureHibernation() {
    if (this.preprocessor.endOfChunkHit) {
      for (; this.consumedAfterSnapshot > 0; this.consumedAfterSnapshot--)
        this.preprocessor.retreat();
      return this.active = !1, this.tokenQueue.push({ type: Se.HIBERNATION_TOKEN }), !0;
    }
    return !1;
  }
  //Consumption
  _consume() {
    return this.consumedAfterSnapshot++, this.preprocessor.advance();
  }
  _unconsume() {
    this.consumedAfterSnapshot--, this.preprocessor.retreat();
  }
  _reconsumeInState(t) {
    this.state = t, this._unconsume();
  }
  _consumeSequenceIfMatch(t, n, r) {
    let i = 0, s = !0;
    const o = t.length;
    let a = 0, u = n, c;
    for (; a < o; a++) {
      if (a > 0 && (u = this._consume(), i++), u === p.EOF) {
        s = !1;
        break;
      }
      if (c = t[a], u !== c && (r || u !== an(c))) {
        s = !1;
        break;
      }
    }
    if (!s)
      for (; i--; )
        this._unconsume();
    return s;
  }
  //Temp buffer
  _isTempBufferEqualToScriptString() {
    if (this.tempBuff.length !== kt.SCRIPT_STRING.length)
      return !1;
    for (let t = 0; t < this.tempBuff.length; t++)
      if (this.tempBuff[t] !== kt.SCRIPT_STRING[t])
        return !1;
    return !0;
  }
  //Token creation
  _createStartTagToken() {
    this.currentToken = {
      type: Se.START_TAG_TOKEN,
      tagName: "",
      selfClosing: !1,
      ackSelfClosing: !1,
      attrs: []
    };
  }
  _createEndTagToken() {
    this.currentToken = {
      type: Se.END_TAG_TOKEN,
      tagName: "",
      selfClosing: !1,
      attrs: []
    };
  }
  _createCommentToken() {
    this.currentToken = {
      type: Se.COMMENT_TOKEN,
      data: ""
    };
  }
  _createDoctypeToken(t) {
    this.currentToken = {
      type: Se.DOCTYPE_TOKEN,
      name: t,
      forceQuirks: !1,
      publicId: null,
      systemId: null
    };
  }
  _createCharacterToken(t, n) {
    this.currentCharacterToken = {
      type: t,
      chars: n
    };
  }
  _createEOFToken() {
    this.currentToken = { type: Se.EOF_TOKEN };
  }
  //Tag attributes
  _createAttr(t) {
    this.currentAttr = {
      name: t,
      value: ""
    };
  }
  _leaveAttrName(t) {
    Se.getTokenAttr(this.currentToken, this.currentAttr.name) === null ? this.currentToken.attrs.push(this.currentAttr) : this._err(y.duplicateAttribute), this.state = t;
  }
  _leaveAttrValue(t) {
    this.state = t;
  }
  //Token emission
  _emitCurrentToken() {
    this._emitCurrentCharacterToken();
    const t = this.currentToken;
    this.currentToken = null, t.type === Se.START_TAG_TOKEN ? this.lastStartTagName = t.tagName : t.type === Se.END_TAG_TOKEN && (t.attrs.length > 0 && this._err(y.endTagWithAttributes), t.selfClosing && this._err(y.endTagWithTrailingSolidus)), this.tokenQueue.push(t);
  }
  _emitCurrentCharacterToken() {
    this.currentCharacterToken && (this.tokenQueue.push(this.currentCharacterToken), this.currentCharacterToken = null);
  }
  _emitEOFToken() {
    this._createEOFToken(), this._emitCurrentToken();
  }
  //Characters emission
  //OPTIMIZATION: specification uses only one type of character tokens (one token per character).
  //This causes a huge memory overhead and a lot of unnecessary parser loops. parse5 uses 3 groups of characters.
  //If we have a sequence of characters that belong to the same group, parser can process it
  //as a single solid character token.
  //So, there are 3 types of character tokens in parse5:
  //1)NULL_CHARACTER_TOKEN - \u0000-character sequences (e.g. '\u0000\u0000\u0000')
  //2)WHITESPACE_CHARACTER_TOKEN - any whitespace/new-line character sequences (e.g. '\n  \r\t   \f')
  //3)CHARACTER_TOKEN - any character sequence which don't belong to groups 1 and 2 (e.g. 'abcdef1234@@#$%^')
  _appendCharToCurrentCharacterToken(t, n) {
    this.currentCharacterToken && this.currentCharacterToken.type !== t && this._emitCurrentCharacterToken(), this.currentCharacterToken ? this.currentCharacterToken.chars += n : this._createCharacterToken(t, n);
  }
  _emitCodePoint(t) {
    let n = Se.CHARACTER_TOKEN;
    ne(t) ? n = Se.WHITESPACE_CHARACTER_TOKEN : t === p.NULL && (n = Se.NULL_CHARACTER_TOKEN), this._appendCharToCurrentCharacterToken(n, se(t));
  }
  _emitSeveralCodePoints(t) {
    for (let n = 0; n < t.length; n++)
      this._emitCodePoint(t[n]);
  }
  //NOTE: used then we emit character explicitly. This is always a non-whitespace and a non-null character.
  //So we can avoid additional checks here.
  _emitChars(t) {
    this._appendCharToCurrentCharacterToken(Se.CHARACTER_TOKEN, t);
  }
  // Character reference helpers
  _matchNamedCharacterReference(t) {
    let n = null, r = 1, i = Ns(0, t);
    for (this.tempBuff.push(t); i > -1; ) {
      const s = Dt[i], o = s < Pu;
      o && s & jo && (n = s & Qo ? [Dt[++i], Dt[++i]] : [Dt[++i]], r = 0);
      const u = this._consume();
      if (this.tempBuff.push(u), r++, u === p.EOF)
        break;
      o ? i = s & qo ? Ns(i, u) : -1 : i = u === s ? ++i : -1;
    }
    for (; r--; )
      this.tempBuff.pop(), this._unconsume();
    return n;
  }
  _isCharacterReferenceInAttribute() {
    return this.returnState === K1 || this.returnState === z1 || this.returnState === $1;
  }
  _isCharacterReferenceAttributeQuirk(t) {
    if (!t && this._isCharacterReferenceInAttribute()) {
      const n = this._consume();
      return this._unconsume(), n === p.EQUALS_SIGN || nr(n);
    }
    return !1;
  }
  _flushCodePointsConsumedAsCharacterReference() {
    if (this._isCharacterReferenceInAttribute())
      for (let t = 0; t < this.tempBuff.length; t++)
        this.currentAttr.value += se(this.tempBuff[t]);
    else
      this._emitSeveralCodePoints(this.tempBuff);
    this.tempBuff = [];
  }
  // State machine
  // Data state
  //------------------------------------------------------------------
  [j](t) {
    this.preprocessor.dropParsedChunk(), t === p.LESS_THAN_SIGN ? this.state = Mi : t === p.AMPERSAND ? (this.returnState = j, this.state = zt) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitCodePoint(t)) : t === p.EOF ? this._emitEOFToken() : this._emitCodePoint(t);
  }
  //  RCDATA state
  //------------------------------------------------------------------
  [qt](t) {
    this.preprocessor.dropParsedChunk(), t === p.AMPERSAND ? (this.returnState = qt, this.state = zt) : t === p.LESS_THAN_SIGN ? this.state = Di : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? this._emitEOFToken() : this._emitCodePoint(t);
  }
  // RAWTEXT state
  //------------------------------------------------------------------
  [C1](t) {
    this.preprocessor.dropParsedChunk(), t === p.LESS_THAN_SIGN ? this.state = Hi : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? this._emitEOFToken() : this._emitCodePoint(t);
  }
  // Script data state
  //------------------------------------------------------------------
  [ft](t) {
    this.preprocessor.dropParsedChunk(), t === p.LESS_THAN_SIGN ? this.state = vi : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? this._emitEOFToken() : this._emitCodePoint(t);
  }
  // PLAINTEXT state
  //------------------------------------------------------------------
  [Wo](t) {
    this.preprocessor.dropParsedChunk(), t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? this._emitEOFToken() : this._emitCodePoint(t);
  }
  // Tag open state
  //------------------------------------------------------------------
  [Mi](t) {
    t === p.EXCLAMATION_MARK ? this.state = Zi : t === p.SOLIDUS ? this.state = Pi : Nt(t) ? (this._createStartTagToken(), this._reconsumeInState(Qn)) : t === p.QUESTION_MARK ? (this._err(y.unexpectedQuestionMarkInsteadOfTagName), this._createCommentToken(), this._reconsumeInState(p1)) : t === p.EOF ? (this._err(y.eofBeforeTagName), this._emitChars("<"), this._emitEOFToken()) : (this._err(y.invalidFirstCharacterOfTagName), this._emitChars("<"), this._reconsumeInState(j));
  }
  // End tag open state
  //------------------------------------------------------------------
  [Pi](t) {
    Nt(t) ? (this._createEndTagToken(), this._reconsumeInState(Qn)) : t === p.GREATER_THAN_SIGN ? (this._err(y.missingEndTagName), this.state = j) : t === p.EOF ? (this._err(y.eofBeforeTagName), this._emitChars("</"), this._emitEOFToken()) : (this._err(y.invalidFirstCharacterOfTagName), this._createCommentToken(), this._reconsumeInState(p1));
  }
  // Tag name state
  //------------------------------------------------------------------
  [Qn](t) {
    ne(t) ? this.state = Ve : t === p.SOLIDUS ? this.state = Et : t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : $e(t) ? this.currentToken.tagName += _t(t) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.tagName += X.REPLACEMENT_CHARACTER) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : this.currentToken.tagName += se(t);
  }
  // RCDATA less-than sign state
  //------------------------------------------------------------------
  [Di](t) {
    t === p.SOLIDUS ? (this.tempBuff = [], this.state = wi) : (this._emitChars("<"), this._reconsumeInState(qt));
  }
  // RCDATA end tag open state
  //------------------------------------------------------------------
  [wi](t) {
    Nt(t) ? (this._createEndTagToken(), this._reconsumeInState(Fi)) : (this._emitChars("</"), this._reconsumeInState(qt));
  }
  // RCDATA end tag name state
  //------------------------------------------------------------------
  [Fi](t) {
    if ($e(t))
      this.currentToken.tagName += _t(t), this.tempBuff.push(t);
    else if (Pt(t))
      this.currentToken.tagName += se(t), this.tempBuff.push(t);
    else {
      if (this.lastStartTagName === this.currentToken.tagName) {
        if (ne(t)) {
          this.state = Ve;
          return;
        }
        if (t === p.SOLIDUS) {
          this.state = Et;
          return;
        }
        if (t === p.GREATER_THAN_SIGN) {
          this.state = j, this._emitCurrentToken();
          return;
        }
      }
      this._emitChars("</"), this._emitSeveralCodePoints(this.tempBuff), this._reconsumeInState(qt);
    }
  }
  // RAWTEXT less-than sign state
  //------------------------------------------------------------------
  [Hi](t) {
    t === p.SOLIDUS ? (this.tempBuff = [], this.state = Bi) : (this._emitChars("<"), this._reconsumeInState(C1));
  }
  // RAWTEXT end tag open state
  //------------------------------------------------------------------
  [Bi](t) {
    Nt(t) ? (this._createEndTagToken(), this._reconsumeInState(Ui)) : (this._emitChars("</"), this._reconsumeInState(C1));
  }
  // RAWTEXT end tag name state
  //------------------------------------------------------------------
  [Ui](t) {
    if ($e(t))
      this.currentToken.tagName += _t(t), this.tempBuff.push(t);
    else if (Pt(t))
      this.currentToken.tagName += se(t), this.tempBuff.push(t);
    else {
      if (this.lastStartTagName === this.currentToken.tagName) {
        if (ne(t)) {
          this.state = Ve;
          return;
        }
        if (t === p.SOLIDUS) {
          this.state = Et;
          return;
        }
        if (t === p.GREATER_THAN_SIGN) {
          this._emitCurrentToken(), this.state = j;
          return;
        }
      }
      this._emitChars("</"), this._emitSeveralCodePoints(this.tempBuff), this._reconsumeInState(C1);
    }
  }
  // Script data less-than sign state
  //------------------------------------------------------------------
  [vi](t) {
    t === p.SOLIDUS ? (this.tempBuff = [], this.state = Gi) : t === p.EXCLAMATION_MARK ? (this.state = zi, this._emitChars("<!")) : (this._emitChars("<"), this._reconsumeInState(ft));
  }
  // Script data end tag open state
  //------------------------------------------------------------------
  [Gi](t) {
    Nt(t) ? (this._createEndTagToken(), this._reconsumeInState(Ki)) : (this._emitChars("</"), this._reconsumeInState(ft));
  }
  // Script data end tag name state
  //------------------------------------------------------------------
  [Ki](t) {
    if ($e(t))
      this.currentToken.tagName += _t(t), this.tempBuff.push(t);
    else if (Pt(t))
      this.currentToken.tagName += se(t), this.tempBuff.push(t);
    else {
      if (this.lastStartTagName === this.currentToken.tagName) {
        if (ne(t)) {
          this.state = Ve;
          return;
        } else if (t === p.SOLIDUS) {
          this.state = Et;
          return;
        } else if (t === p.GREATER_THAN_SIGN) {
          this._emitCurrentToken(), this.state = j;
          return;
        }
      }
      this._emitChars("</"), this._emitSeveralCodePoints(this.tempBuff), this._reconsumeInState(ft);
    }
  }
  // Script data escape start state
  //------------------------------------------------------------------
  [zi](t) {
    t === p.HYPHEN_MINUS ? (this.state = $i, this._emitChars("-")) : this._reconsumeInState(ft);
  }
  // Script data escape start dash state
  //------------------------------------------------------------------
  [$i](t) {
    t === p.HYPHEN_MINUS ? (this.state = qn, this._emitChars("-")) : this._reconsumeInState(ft);
  }
  // Script data escaped state
  //------------------------------------------------------------------
  [Ke](t) {
    t === p.HYPHEN_MINUS ? (this.state = Yi, this._emitChars("-")) : t === p.LESS_THAN_SIGN ? this.state = U1 : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? (this._err(y.eofInScriptHtmlCommentLikeText), this._emitEOFToken()) : this._emitCodePoint(t);
  }
  // Script data escaped dash state
  //------------------------------------------------------------------
  [Yi](t) {
    t === p.HYPHEN_MINUS ? (this.state = qn, this._emitChars("-")) : t === p.LESS_THAN_SIGN ? this.state = U1 : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.state = Ke, this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? (this._err(y.eofInScriptHtmlCommentLikeText), this._emitEOFToken()) : (this.state = Ke, this._emitCodePoint(t));
  }
  // Script data escaped dash dash state
  //------------------------------------------------------------------
  [qn](t) {
    t === p.HYPHEN_MINUS ? this._emitChars("-") : t === p.LESS_THAN_SIGN ? this.state = U1 : t === p.GREATER_THAN_SIGN ? (this.state = ft, this._emitChars(">")) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.state = Ke, this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? (this._err(y.eofInScriptHtmlCommentLikeText), this._emitEOFToken()) : (this.state = Ke, this._emitCodePoint(t));
  }
  // Script data escaped less-than sign state
  //------------------------------------------------------------------
  [U1](t) {
    t === p.SOLIDUS ? (this.tempBuff = [], this.state = ji) : Nt(t) ? (this.tempBuff = [], this._emitChars("<"), this._reconsumeInState(qi)) : (this._emitChars("<"), this._reconsumeInState(Ke));
  }
  // Script data escaped end tag open state
  //------------------------------------------------------------------
  [ji](t) {
    Nt(t) ? (this._createEndTagToken(), this._reconsumeInState(Qi)) : (this._emitChars("</"), this._reconsumeInState(Ke));
  }
  // Script data escaped end tag name state
  //------------------------------------------------------------------
  [Qi](t) {
    if ($e(t))
      this.currentToken.tagName += _t(t), this.tempBuff.push(t);
    else if (Pt(t))
      this.currentToken.tagName += se(t), this.tempBuff.push(t);
    else {
      if (this.lastStartTagName === this.currentToken.tagName) {
        if (ne(t)) {
          this.state = Ve;
          return;
        }
        if (t === p.SOLIDUS) {
          this.state = Et;
          return;
        }
        if (t === p.GREATER_THAN_SIGN) {
          this._emitCurrentToken(), this.state = j;
          return;
        }
      }
      this._emitChars("</"), this._emitSeveralCodePoints(this.tempBuff), this._reconsumeInState(Ke);
    }
  }
  // Script data double escape start state
  //------------------------------------------------------------------
  [qi](t) {
    ne(t) || t === p.SOLIDUS || t === p.GREATER_THAN_SIGN ? (this.state = this._isTempBufferEqualToScriptString() ? ot : Ke, this._emitCodePoint(t)) : $e(t) ? (this.tempBuff.push(an(t)), this._emitCodePoint(t)) : Pt(t) ? (this.tempBuff.push(t), this._emitCodePoint(t)) : this._reconsumeInState(Ke);
  }
  // Script data double escaped state
  //------------------------------------------------------------------
  [ot](t) {
    t === p.HYPHEN_MINUS ? (this.state = Wi, this._emitChars("-")) : t === p.LESS_THAN_SIGN ? (this.state = v1, this._emitChars("<")) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? (this._err(y.eofInScriptHtmlCommentLikeText), this._emitEOFToken()) : this._emitCodePoint(t);
  }
  // Script data double escaped dash state
  //------------------------------------------------------------------
  [Wi](t) {
    t === p.HYPHEN_MINUS ? (this.state = Vi, this._emitChars("-")) : t === p.LESS_THAN_SIGN ? (this.state = v1, this._emitChars("<")) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.state = ot, this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? (this._err(y.eofInScriptHtmlCommentLikeText), this._emitEOFToken()) : (this.state = ot, this._emitCodePoint(t));
  }
  // Script data double escaped dash dash state
  //------------------------------------------------------------------
  [Vi](t) {
    t === p.HYPHEN_MINUS ? this._emitChars("-") : t === p.LESS_THAN_SIGN ? (this.state = v1, this._emitChars("<")) : t === p.GREATER_THAN_SIGN ? (this.state = ft, this._emitChars(">")) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.state = ot, this._emitChars(X.REPLACEMENT_CHARACTER)) : t === p.EOF ? (this._err(y.eofInScriptHtmlCommentLikeText), this._emitEOFToken()) : (this.state = ot, this._emitCodePoint(t));
  }
  // Script data double escaped less-than sign state
  //------------------------------------------------------------------
  [v1](t) {
    t === p.SOLIDUS ? (this.tempBuff = [], this.state = Xi, this._emitChars("/")) : this._reconsumeInState(ot);
  }
  // Script data double escape end state
  //------------------------------------------------------------------
  [Xi](t) {
    ne(t) || t === p.SOLIDUS || t === p.GREATER_THAN_SIGN ? (this.state = this._isTempBufferEqualToScriptString() ? Ke : ot, this._emitCodePoint(t)) : $e(t) ? (this.tempBuff.push(an(t)), this._emitCodePoint(t)) : Pt(t) ? (this.tempBuff.push(t), this._emitCodePoint(t)) : this._reconsumeInState(ot);
  }
  // Before attribute name state
  //------------------------------------------------------------------
  [Ve](t) {
    ne(t) || (t === p.SOLIDUS || t === p.GREATER_THAN_SIGN || t === p.EOF ? this._reconsumeInState(Wn) : t === p.EQUALS_SIGN ? (this._err(y.unexpectedEqualsSignBeforeAttributeName), this._createAttr("="), this.state = G1) : (this._createAttr(""), this._reconsumeInState(G1)));
  }
  // Attribute name state
  //------------------------------------------------------------------
  [G1](t) {
    ne(t) || t === p.SOLIDUS || t === p.GREATER_THAN_SIGN || t === p.EOF ? (this._leaveAttrName(Wn), this._unconsume()) : t === p.EQUALS_SIGN ? this._leaveAttrName(Vn) : $e(t) ? this.currentAttr.name += _t(t) : t === p.QUOTATION_MARK || t === p.APOSTROPHE || t === p.LESS_THAN_SIGN ? (this._err(y.unexpectedCharacterInAttributeName), this.currentAttr.name += se(t)) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentAttr.name += X.REPLACEMENT_CHARACTER) : this.currentAttr.name += se(t);
  }
  // After attribute name state
  //------------------------------------------------------------------
  [Wn](t) {
    ne(t) || (t === p.SOLIDUS ? this.state = Et : t === p.EQUALS_SIGN ? this.state = Vn : t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : (this._createAttr(""), this._reconsumeInState(G1)));
  }
  // Before attribute value state
  //------------------------------------------------------------------
  [Vn](t) {
    ne(t) || (t === p.QUOTATION_MARK ? this.state = K1 : t === p.APOSTROPHE ? this.state = z1 : t === p.GREATER_THAN_SIGN ? (this._err(y.missingAttributeValue), this.state = j, this._emitCurrentToken()) : this._reconsumeInState($1));
  }
  // Attribute value (double-quoted) state
  //------------------------------------------------------------------
  [K1](t) {
    t === p.QUOTATION_MARK ? this.state = Xn : t === p.AMPERSAND ? (this.returnState = K1, this.state = zt) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentAttr.value += X.REPLACEMENT_CHARACTER) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : this.currentAttr.value += se(t);
  }
  // Attribute value (single-quoted) state
  //------------------------------------------------------------------
  [z1](t) {
    t === p.APOSTROPHE ? this.state = Xn : t === p.AMPERSAND ? (this.returnState = z1, this.state = zt) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentAttr.value += X.REPLACEMENT_CHARACTER) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : this.currentAttr.value += se(t);
  }
  // Attribute value (unquoted) state
  //------------------------------------------------------------------
  [$1](t) {
    ne(t) ? this._leaveAttrValue(Ve) : t === p.AMPERSAND ? (this.returnState = $1, this.state = zt) : t === p.GREATER_THAN_SIGN ? (this._leaveAttrValue(j), this._emitCurrentToken()) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentAttr.value += X.REPLACEMENT_CHARACTER) : t === p.QUOTATION_MARK || t === p.APOSTROPHE || t === p.LESS_THAN_SIGN || t === p.EQUALS_SIGN || t === p.GRAVE_ACCENT ? (this._err(y.unexpectedCharacterInUnquotedAttributeValue), this.currentAttr.value += se(t)) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : this.currentAttr.value += se(t);
  }
  // After attribute value (quoted) state
  //------------------------------------------------------------------
  [Xn](t) {
    ne(t) ? this._leaveAttrValue(Ve) : t === p.SOLIDUS ? this._leaveAttrValue(Et) : t === p.GREATER_THAN_SIGN ? (this._leaveAttrValue(j), this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : (this._err(y.missingWhitespaceBetweenAttributes), this._reconsumeInState(Ve));
  }
  // Self-closing start tag state
  //------------------------------------------------------------------
  [Et](t) {
    t === p.GREATER_THAN_SIGN ? (this.currentToken.selfClosing = !0, this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInTag), this._emitEOFToken()) : (this._err(y.unexpectedSolidusInTag), this._reconsumeInState(Ve));
  }
  // Bogus comment state
  //------------------------------------------------------------------
  [p1](t) {
    t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._emitCurrentToken(), this._emitEOFToken()) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.data += X.REPLACEMENT_CHARACTER) : this.currentToken.data += se(t);
  }
  // Markup declaration open state
  //------------------------------------------------------------------
  [Zi](t) {
    this._consumeSequenceIfMatch(kt.DASH_DASH_STRING, t, !0) ? (this._createCommentToken(), this.state = Ji) : this._consumeSequenceIfMatch(kt.DOCTYPE_STRING, t, !1) ? this.state = os : this._consumeSequenceIfMatch(kt.CDATA_START_STRING, t, !0) ? this.allowCDATA ? this.state = W1 : (this._err(y.cdataInHtmlContent), this._createCommentToken(), this.currentToken.data = "[CDATA[", this.state = p1) : this._ensureHibernation() || (this._err(y.incorrectlyOpenedComment), this._createCommentToken(), this._reconsumeInState(p1));
  }
  // Comment start state
  //------------------------------------------------------------------
  [Ji](t) {
    t === p.HYPHEN_MINUS ? this.state = es : t === p.GREATER_THAN_SIGN ? (this._err(y.abruptClosingOfEmptyComment), this.state = j, this._emitCurrentToken()) : this._reconsumeInState(gt);
  }
  // Comment start dash state
  //------------------------------------------------------------------
  [es](t) {
    t === p.HYPHEN_MINUS ? this.state = j1 : t === p.GREATER_THAN_SIGN ? (this._err(y.abruptClosingOfEmptyComment), this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInComment), this._emitCurrentToken(), this._emitEOFToken()) : (this.currentToken.data += "-", this._reconsumeInState(gt));
  }
  // Comment state
  //------------------------------------------------------------------
  [gt](t) {
    t === p.HYPHEN_MINUS ? this.state = Y1 : t === p.LESS_THAN_SIGN ? (this.currentToken.data += "<", this.state = ts) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.data += X.REPLACEMENT_CHARACTER) : t === p.EOF ? (this._err(y.eofInComment), this._emitCurrentToken(), this._emitEOFToken()) : this.currentToken.data += se(t);
  }
  // Comment less-than sign state
  //------------------------------------------------------------------
  [ts](t) {
    t === p.EXCLAMATION_MARK ? (this.currentToken.data += "!", this.state = ns) : t === p.LESS_THAN_SIGN ? this.currentToken.data += "!" : this._reconsumeInState(gt);
  }
  // Comment less-than sign bang state
  //------------------------------------------------------------------
  [ns](t) {
    t === p.HYPHEN_MINUS ? this.state = rs : this._reconsumeInState(gt);
  }
  // Comment less-than sign bang dash state
  //------------------------------------------------------------------
  [rs](t) {
    t === p.HYPHEN_MINUS ? this.state = is : this._reconsumeInState(Y1);
  }
  // Comment less-than sign bang dash dash state
  //------------------------------------------------------------------
  [is](t) {
    t !== p.GREATER_THAN_SIGN && t !== p.EOF && this._err(y.nestedComment), this._reconsumeInState(j1);
  }
  // Comment end dash state
  //------------------------------------------------------------------
  [Y1](t) {
    t === p.HYPHEN_MINUS ? this.state = j1 : t === p.EOF ? (this._err(y.eofInComment), this._emitCurrentToken(), this._emitEOFToken()) : (this.currentToken.data += "-", this._reconsumeInState(gt));
  }
  // Comment end state
  //------------------------------------------------------------------
  [j1](t) {
    t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : t === p.EXCLAMATION_MARK ? this.state = ss : t === p.HYPHEN_MINUS ? this.currentToken.data += "-" : t === p.EOF ? (this._err(y.eofInComment), this._emitCurrentToken(), this._emitEOFToken()) : (this.currentToken.data += "--", this._reconsumeInState(gt));
  }
  // Comment end bang state
  //------------------------------------------------------------------
  [ss](t) {
    t === p.HYPHEN_MINUS ? (this.currentToken.data += "--!", this.state = Y1) : t === p.GREATER_THAN_SIGN ? (this._err(y.incorrectlyClosedComment), this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInComment), this._emitCurrentToken(), this._emitEOFToken()) : (this.currentToken.data += "--!", this._reconsumeInState(gt));
  }
  // DOCTYPE state
  //------------------------------------------------------------------
  [os](t) {
    ne(t) ? this.state = Q1 : t === p.GREATER_THAN_SIGN ? this._reconsumeInState(Q1) : t === p.EOF ? (this._err(y.eofInDoctype), this._createDoctypeToken(null), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingWhitespaceBeforeDoctypeName), this._reconsumeInState(Q1));
  }
  // Before DOCTYPE name state
  //------------------------------------------------------------------
  [Q1](t) {
    ne(t) || ($e(t) ? (this._createDoctypeToken(_t(t)), this.state = q1) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this._createDoctypeToken(X.REPLACEMENT_CHARACTER), this.state = q1) : t === p.GREATER_THAN_SIGN ? (this._err(y.missingDoctypeName), this._createDoctypeToken(null), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this.state = j) : t === p.EOF ? (this._err(y.eofInDoctype), this._createDoctypeToken(null), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._createDoctypeToken(se(t)), this.state = q1));
  }
  // DOCTYPE name state
  //------------------------------------------------------------------
  [q1](t) {
    ne(t) ? this.state = as : t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : $e(t) ? this.currentToken.name += _t(t) : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.name += X.REPLACEMENT_CHARACTER) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : this.currentToken.name += se(t);
  }
  // After DOCTYPE name state
  //------------------------------------------------------------------
  [as](t) {
    ne(t) || (t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : this._consumeSequenceIfMatch(kt.PUBLIC_STRING, t, !1) ? this.state = ls : this._consumeSequenceIfMatch(kt.SYSTEM_STRING, t, !1) ? this.state = fs : this._ensureHibernation() || (this._err(y.invalidCharacterSequenceAfterDoctypeName), this.currentToken.forceQuirks = !0, this._reconsumeInState(at)));
  }
  // After DOCTYPE public keyword state
  //------------------------------------------------------------------
  [ls](t) {
    ne(t) ? this.state = us : t === p.QUOTATION_MARK ? (this._err(y.missingWhitespaceAfterDoctypePublicKeyword), this.currentToken.publicId = "", this.state = Zn) : t === p.APOSTROPHE ? (this._err(y.missingWhitespaceAfterDoctypePublicKeyword), this.currentToken.publicId = "", this.state = Jn) : t === p.GREATER_THAN_SIGN ? (this._err(y.missingDoctypePublicIdentifier), this.currentToken.forceQuirks = !0, this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingQuoteBeforeDoctypePublicIdentifier), this.currentToken.forceQuirks = !0, this._reconsumeInState(at));
  }
  // Before DOCTYPE public identifier state
  //------------------------------------------------------------------
  [us](t) {
    ne(t) || (t === p.QUOTATION_MARK ? (this.currentToken.publicId = "", this.state = Zn) : t === p.APOSTROPHE ? (this.currentToken.publicId = "", this.state = Jn) : t === p.GREATER_THAN_SIGN ? (this._err(y.missingDoctypePublicIdentifier), this.currentToken.forceQuirks = !0, this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingQuoteBeforeDoctypePublicIdentifier), this.currentToken.forceQuirks = !0, this._reconsumeInState(at)));
  }
  // DOCTYPE public identifier (double-quoted) state
  //------------------------------------------------------------------
  [Zn](t) {
    t === p.QUOTATION_MARK ? this.state = er : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.publicId += X.REPLACEMENT_CHARACTER) : t === p.GREATER_THAN_SIGN ? (this._err(y.abruptDoctypePublicIdentifier), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this.state = j) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : this.currentToken.publicId += se(t);
  }
  // DOCTYPE public identifier (single-quoted) state
  //------------------------------------------------------------------
  [Jn](t) {
    t === p.APOSTROPHE ? this.state = er : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.publicId += X.REPLACEMENT_CHARACTER) : t === p.GREATER_THAN_SIGN ? (this._err(y.abruptDoctypePublicIdentifier), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this.state = j) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : this.currentToken.publicId += se(t);
  }
  // After DOCTYPE public identifier state
  //------------------------------------------------------------------
  [er](t) {
    ne(t) ? this.state = cs : t === p.GREATER_THAN_SIGN ? (this.state = j, this._emitCurrentToken()) : t === p.QUOTATION_MARK ? (this._err(y.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers), this.currentToken.systemId = "", this.state = d1) : t === p.APOSTROPHE ? (this._err(y.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers), this.currentToken.systemId = "", this.state = m1) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingQuoteBeforeDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this._reconsumeInState(at));
  }
  // Between DOCTYPE public and system identifiers state
  //------------------------------------------------------------------
  [cs](t) {
    ne(t) || (t === p.GREATER_THAN_SIGN ? (this._emitCurrentToken(), this.state = j) : t === p.QUOTATION_MARK ? (this.currentToken.systemId = "", this.state = d1) : t === p.APOSTROPHE ? (this.currentToken.systemId = "", this.state = m1) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingQuoteBeforeDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this._reconsumeInState(at)));
  }
  // After DOCTYPE system keyword state
  //------------------------------------------------------------------
  [fs](t) {
    ne(t) ? this.state = hs : t === p.QUOTATION_MARK ? (this._err(y.missingWhitespaceAfterDoctypeSystemKeyword), this.currentToken.systemId = "", this.state = d1) : t === p.APOSTROPHE ? (this._err(y.missingWhitespaceAfterDoctypeSystemKeyword), this.currentToken.systemId = "", this.state = m1) : t === p.GREATER_THAN_SIGN ? (this._err(y.missingDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingQuoteBeforeDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this._reconsumeInState(at));
  }
  // Before DOCTYPE system identifier state
  //------------------------------------------------------------------
  [hs](t) {
    ne(t) || (t === p.QUOTATION_MARK ? (this.currentToken.systemId = "", this.state = d1) : t === p.APOSTROPHE ? (this.currentToken.systemId = "", this.state = m1) : t === p.GREATER_THAN_SIGN ? (this._err(y.missingDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this.state = j, this._emitCurrentToken()) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.missingQuoteBeforeDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this._reconsumeInState(at)));
  }
  // DOCTYPE system identifier (double-quoted) state
  //------------------------------------------------------------------
  [d1](t) {
    t === p.QUOTATION_MARK ? this.state = tr : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.systemId += X.REPLACEMENT_CHARACTER) : t === p.GREATER_THAN_SIGN ? (this._err(y.abruptDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this.state = j) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : this.currentToken.systemId += se(t);
  }
  // DOCTYPE system identifier (single-quoted) state
  //------------------------------------------------------------------
  [m1](t) {
    t === p.APOSTROPHE ? this.state = tr : t === p.NULL ? (this._err(y.unexpectedNullCharacter), this.currentToken.systemId += X.REPLACEMENT_CHARACTER) : t === p.GREATER_THAN_SIGN ? (this._err(y.abruptDoctypeSystemIdentifier), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this.state = j) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : this.currentToken.systemId += se(t);
  }
  // After DOCTYPE system identifier state
  //------------------------------------------------------------------
  [tr](t) {
    ne(t) || (t === p.GREATER_THAN_SIGN ? (this._emitCurrentToken(), this.state = j) : t === p.EOF ? (this._err(y.eofInDoctype), this.currentToken.forceQuirks = !0, this._emitCurrentToken(), this._emitEOFToken()) : (this._err(y.unexpectedCharacterAfterDoctypeSystemIdentifier), this._reconsumeInState(at)));
  }
  // Bogus DOCTYPE state
  //------------------------------------------------------------------
  [at](t) {
    t === p.GREATER_THAN_SIGN ? (this._emitCurrentToken(), this.state = j) : t === p.NULL ? this._err(y.unexpectedNullCharacter) : t === p.EOF && (this._emitCurrentToken(), this._emitEOFToken());
  }
  // CDATA section state
  //------------------------------------------------------------------
  [W1](t) {
    t === p.RIGHT_SQUARE_BRACKET ? this.state = ps : t === p.EOF ? (this._err(y.eofInCdata), this._emitEOFToken()) : this._emitCodePoint(t);
  }
  // CDATA section bracket state
  //------------------------------------------------------------------
  [ps](t) {
    t === p.RIGHT_SQUARE_BRACKET ? this.state = ds : (this._emitChars("]"), this._reconsumeInState(W1));
  }
  // CDATA section end state
  //------------------------------------------------------------------
  [ds](t) {
    t === p.GREATER_THAN_SIGN ? this.state = j : t === p.RIGHT_SQUARE_BRACKET ? this._emitChars("]") : (this._emitChars("]]"), this._reconsumeInState(W1));
  }
  // Character reference state
  //------------------------------------------------------------------
  [zt](t) {
    this.tempBuff = [p.AMPERSAND], t === p.NUMBER_SIGN ? (this.tempBuff.push(t), this.state = Es) : nr(t) ? this._reconsumeInState(ms) : (this._flushCodePointsConsumedAsCharacterReference(), this._reconsumeInState(this.returnState));
  }
  // Named character reference state
  //------------------------------------------------------------------
  [ms](t) {
    const n = this._matchNamedCharacterReference(t);
    if (this._ensureHibernation())
      this.tempBuff = [p.AMPERSAND];
    else if (n) {
      const r = this.tempBuff[this.tempBuff.length - 1] === p.SEMICOLON;
      this._isCharacterReferenceAttributeQuirk(r) || (r || this._errOnNextCodePoint(y.missingSemicolonAfterCharacterReference), this.tempBuff = n), this._flushCodePointsConsumedAsCharacterReference(), this.state = this.returnState;
    } else
      this._flushCodePointsConsumedAsCharacterReference(), this.state = Ts;
  }
  // Ambiguos ampersand state
  //------------------------------------------------------------------
  [Ts](t) {
    nr(t) ? this._isCharacterReferenceInAttribute() ? this.currentAttr.value += se(t) : this._emitCodePoint(t) : (t === p.SEMICOLON && this._err(y.unknownNamedCharacterReference), this._reconsumeInState(this.returnState));
  }
  // Numeric character reference state
  //------------------------------------------------------------------
  [Es](t) {
    this.charRefCode = 0, t === p.LATIN_SMALL_X || t === p.LATIN_CAPITAL_X ? (this.tempBuff.push(t), this.state = gs) : this._reconsumeInState(_s);
  }
  // Hexademical character reference start state
  //------------------------------------------------------------------
  [gs](t) {
    Du(t) ? this._reconsumeInState(As) : (this._err(y.absenceOfDigitsInNumericCharacterReference), this._flushCodePointsConsumedAsCharacterReference(), this._reconsumeInState(this.returnState));
  }
  // Decimal character reference start state
  //------------------------------------------------------------------
  [_s](t) {
    S1(t) ? this._reconsumeInState(Cs) : (this._err(y.absenceOfDigitsInNumericCharacterReference), this._flushCodePointsConsumedAsCharacterReference(), this._reconsumeInState(this.returnState));
  }
  // Hexademical character reference state
  //------------------------------------------------------------------
  [As](t) {
    Vo(t) ? this.charRefCode = this.charRefCode * 16 + t - 55 : Xo(t) ? this.charRefCode = this.charRefCode * 16 + t - 87 : S1(t) ? this.charRefCode = this.charRefCode * 16 + t - 48 : t === p.SEMICOLON ? this.state = T1 : (this._err(y.missingSemicolonAfterCharacterReference), this._reconsumeInState(T1));
  }
  // Decimal character reference state
  //------------------------------------------------------------------
  [Cs](t) {
    S1(t) ? this.charRefCode = this.charRefCode * 10 + t - 48 : t === p.SEMICOLON ? this.state = T1 : (this._err(y.missingSemicolonAfterCharacterReference), this._reconsumeInState(T1));
  }
  // Numeric character reference end state
  //------------------------------------------------------------------
  [T1]() {
    if (this.charRefCode === p.NULL)
      this._err(y.nullCharacterReference), this.charRefCode = p.REPLACEMENT_CHARACTER;
    else if (this.charRefCode > 1114111)
      this._err(y.characterReferenceOutsideUnicodeRange), this.charRefCode = p.REPLACEMENT_CHARACTER;
    else if (X.isSurrogate(this.charRefCode))
      this._err(y.surrogateCharacterReference), this.charRefCode = p.REPLACEMENT_CHARACTER;
    else if (X.isUndefinedCodePoint(this.charRefCode))
      this._err(y.noncharacterCharacterReference);
    else if (X.isControlCodePoint(this.charRefCode) || this.charRefCode === p.CARRIAGE_RETURN) {
      this._err(y.controlCharacterReference);
      const t = Mu[this.charRefCode];
      t && (this.charRefCode = t);
    }
    this.tempBuff = [this.charRefCode], this._flushCodePointsConsumedAsCharacterReference(), this._reconsumeInState(this.returnState);
  }
};
Fe.CHARACTER_TOKEN = "CHARACTER_TOKEN";
Fe.NULL_CHARACTER_TOKEN = "NULL_CHARACTER_TOKEN";
Fe.WHITESPACE_CHARACTER_TOKEN = "WHITESPACE_CHARACTER_TOKEN";
Fe.START_TAG_TOKEN = "START_TAG_TOKEN";
Fe.END_TAG_TOKEN = "END_TAG_TOKEN";
Fe.COMMENT_TOKEN = "COMMENT_TOKEN";
Fe.DOCTYPE_TOKEN = "DOCTYPE_TOKEN";
Fe.EOF_TOKEN = "EOF_TOKEN";
Fe.HIBERNATION_TOKEN = "HIBERNATION_TOKEN";
Fe.MODE = {
  DATA: j,
  RCDATA: qt,
  RAWTEXT: C1,
  SCRIPT_DATA: ft,
  PLAINTEXT: Wo
};
Fe.getTokenAttr = function(e, t) {
  for (let n = e.attrs.length - 1; n >= 0; n--)
    if (e.attrs[n].name === t)
      return e.attrs[n].value;
  return null;
};
var Sn = Fe, qe = {};
const rr = qe.NAMESPACES = {
  HTML: "http://www.w3.org/1999/xhtml",
  MATHML: "http://www.w3.org/1998/Math/MathML",
  SVG: "http://www.w3.org/2000/svg",
  XLINK: "http://www.w3.org/1999/xlink",
  XML: "http://www.w3.org/XML/1998/namespace",
  XMLNS: "http://www.w3.org/2000/xmlns/"
};
qe.ATTRS = {
  TYPE: "type",
  ACTION: "action",
  ENCODING: "encoding",
  PROMPT: "prompt",
  NAME: "name",
  COLOR: "color",
  FACE: "face",
  SIZE: "size"
};
qe.DOCUMENT_MODE = {
  NO_QUIRKS: "no-quirks",
  QUIRKS: "quirks",
  LIMITED_QUIRKS: "limited-quirks"
};
const O = qe.TAG_NAMES = {
  A: "a",
  ADDRESS: "address",
  ANNOTATION_XML: "annotation-xml",
  APPLET: "applet",
  AREA: "area",
  ARTICLE: "article",
  ASIDE: "aside",
  B: "b",
  BASE: "base",
  BASEFONT: "basefont",
  BGSOUND: "bgsound",
  BIG: "big",
  BLOCKQUOTE: "blockquote",
  BODY: "body",
  BR: "br",
  BUTTON: "button",
  CAPTION: "caption",
  CENTER: "center",
  CODE: "code",
  COL: "col",
  COLGROUP: "colgroup",
  DD: "dd",
  DESC: "desc",
  DETAILS: "details",
  DIALOG: "dialog",
  DIR: "dir",
  DIV: "div",
  DL: "dl",
  DT: "dt",
  EM: "em",
  EMBED: "embed",
  FIELDSET: "fieldset",
  FIGCAPTION: "figcaption",
  FIGURE: "figure",
  FONT: "font",
  FOOTER: "footer",
  FOREIGN_OBJECT: "foreignObject",
  FORM: "form",
  FRAME: "frame",
  FRAMESET: "frameset",
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
  HEAD: "head",
  HEADER: "header",
  HGROUP: "hgroup",
  HR: "hr",
  HTML: "html",
  I: "i",
  IMG: "img",
  IMAGE: "image",
  INPUT: "input",
  IFRAME: "iframe",
  KEYGEN: "keygen",
  LABEL: "label",
  LI: "li",
  LINK: "link",
  LISTING: "listing",
  MAIN: "main",
  MALIGNMARK: "malignmark",
  MARQUEE: "marquee",
  MATH: "math",
  MENU: "menu",
  META: "meta",
  MGLYPH: "mglyph",
  MI: "mi",
  MO: "mo",
  MN: "mn",
  MS: "ms",
  MTEXT: "mtext",
  NAV: "nav",
  NOBR: "nobr",
  NOFRAMES: "noframes",
  NOEMBED: "noembed",
  NOSCRIPT: "noscript",
  OBJECT: "object",
  OL: "ol",
  OPTGROUP: "optgroup",
  OPTION: "option",
  P: "p",
  PARAM: "param",
  PLAINTEXT: "plaintext",
  PRE: "pre",
  RB: "rb",
  RP: "rp",
  RT: "rt",
  RTC: "rtc",
  RUBY: "ruby",
  S: "s",
  SCRIPT: "script",
  SECTION: "section",
  SELECT: "select",
  SOURCE: "source",
  SMALL: "small",
  SPAN: "span",
  STRIKE: "strike",
  STRONG: "strong",
  STYLE: "style",
  SUB: "sub",
  SUMMARY: "summary",
  SUP: "sup",
  TABLE: "table",
  TBODY: "tbody",
  TEMPLATE: "template",
  TEXTAREA: "textarea",
  TFOOT: "tfoot",
  TD: "td",
  TH: "th",
  THEAD: "thead",
  TITLE: "title",
  TR: "tr",
  TRACK: "track",
  TT: "tt",
  U: "u",
  UL: "ul",
  SVG: "svg",
  VAR: "var",
  WBR: "wbr",
  XMP: "xmp"
};
qe.SPECIAL_ELEMENTS = {
  [rr.HTML]: {
    [O.ADDRESS]: !0,
    [O.APPLET]: !0,
    [O.AREA]: !0,
    [O.ARTICLE]: !0,
    [O.ASIDE]: !0,
    [O.BASE]: !0,
    [O.BASEFONT]: !0,
    [O.BGSOUND]: !0,
    [O.BLOCKQUOTE]: !0,
    [O.BODY]: !0,
    [O.BR]: !0,
    [O.BUTTON]: !0,
    [O.CAPTION]: !0,
    [O.CENTER]: !0,
    [O.COL]: !0,
    [O.COLGROUP]: !0,
    [O.DD]: !0,
    [O.DETAILS]: !0,
    [O.DIR]: !0,
    [O.DIV]: !0,
    [O.DL]: !0,
    [O.DT]: !0,
    [O.EMBED]: !0,
    [O.FIELDSET]: !0,
    [O.FIGCAPTION]: !0,
    [O.FIGURE]: !0,
    [O.FOOTER]: !0,
    [O.FORM]: !0,
    [O.FRAME]: !0,
    [O.FRAMESET]: !0,
    [O.H1]: !0,
    [O.H2]: !0,
    [O.H3]: !0,
    [O.H4]: !0,
    [O.H5]: !0,
    [O.H6]: !0,
    [O.HEAD]: !0,
    [O.HEADER]: !0,
    [O.HGROUP]: !0,
    [O.HR]: !0,
    [O.HTML]: !0,
    [O.IFRAME]: !0,
    [O.IMG]: !0,
    [O.INPUT]: !0,
    [O.LI]: !0,
    [O.LINK]: !0,
    [O.LISTING]: !0,
    [O.MAIN]: !0,
    [O.MARQUEE]: !0,
    [O.MENU]: !0,
    [O.META]: !0,
    [O.NAV]: !0,
    [O.NOEMBED]: !0,
    [O.NOFRAMES]: !0,
    [O.NOSCRIPT]: !0,
    [O.OBJECT]: !0,
    [O.OL]: !0,
    [O.P]: !0,
    [O.PARAM]: !0,
    [O.PLAINTEXT]: !0,
    [O.PRE]: !0,
    [O.SCRIPT]: !0,
    [O.SECTION]: !0,
    [O.SELECT]: !0,
    [O.SOURCE]: !0,
    [O.STYLE]: !0,
    [O.SUMMARY]: !0,
    [O.TABLE]: !0,
    [O.TBODY]: !0,
    [O.TD]: !0,
    [O.TEMPLATE]: !0,
    [O.TEXTAREA]: !0,
    [O.TFOOT]: !0,
    [O.TH]: !0,
    [O.THEAD]: !0,
    [O.TITLE]: !0,
    [O.TR]: !0,
    [O.TRACK]: !0,
    [O.UL]: !0,
    [O.WBR]: !0,
    [O.XMP]: !0
  },
  [rr.MATHML]: {
    [O.MI]: !0,
    [O.MO]: !0,
    [O.MN]: !0,
    [O.MS]: !0,
    [O.MTEXT]: !0,
    [O.ANNOTATION_XML]: !0
  },
  [rr.SVG]: {
    [O.TITLE]: !0,
    [O.FOREIGN_OBJECT]: !0,
    [O.DESC]: !0
  }
};
const Zo = qe, R = Zo.TAG_NAMES, Z = Zo.NAMESPACES;
function Ss(e) {
  switch (e.length) {
    case 1:
      return e === R.P;
    case 2:
      return e === R.RB || e === R.RP || e === R.RT || e === R.DD || e === R.DT || e === R.LI;
    case 3:
      return e === R.RTC;
    case 6:
      return e === R.OPTION;
    case 8:
      return e === R.OPTGROUP;
  }
  return !1;
}
function wu(e) {
  switch (e.length) {
    case 1:
      return e === R.P;
    case 2:
      return e === R.RB || e === R.RP || e === R.RT || e === R.DD || e === R.DT || e === R.LI || e === R.TD || e === R.TH || e === R.TR;
    case 3:
      return e === R.RTC;
    case 5:
      return e === R.TBODY || e === R.TFOOT || e === R.THEAD;
    case 6:
      return e === R.OPTION;
    case 7:
      return e === R.CAPTION;
    case 8:
      return e === R.OPTGROUP || e === R.COLGROUP;
  }
  return !1;
}
function V1(e, t) {
  switch (e.length) {
    case 2:
      if (e === R.TD || e === R.TH)
        return t === Z.HTML;
      if (e === R.MI || e === R.MO || e === R.MN || e === R.MS)
        return t === Z.MATHML;
      break;
    case 4:
      if (e === R.HTML)
        return t === Z.HTML;
      if (e === R.DESC)
        return t === Z.SVG;
      break;
    case 5:
      if (e === R.TABLE)
        return t === Z.HTML;
      if (e === R.MTEXT)
        return t === Z.MATHML;
      if (e === R.TITLE)
        return t === Z.SVG;
      break;
    case 6:
      return (e === R.APPLET || e === R.OBJECT) && t === Z.HTML;
    case 7:
      return (e === R.CAPTION || e === R.MARQUEE) && t === Z.HTML;
    case 8:
      return e === R.TEMPLATE && t === Z.HTML;
    case 13:
      return e === R.FOREIGN_OBJECT && t === Z.SVG;
    case 14:
      return e === R.ANNOTATION_XML && t === Z.MATHML;
  }
  return !1;
}
let Fu = class {
  constructor(t, n) {
    this.stackTop = -1, this.items = [], this.current = t, this.currentTagName = null, this.currentTmplContent = null, this.tmplCount = 0, this.treeAdapter = n;
  }
  //Index of element
  _indexOf(t) {
    let n = -1;
    for (let r = this.stackTop; r >= 0; r--)
      if (this.items[r] === t) {
        n = r;
        break;
      }
    return n;
  }
  //Update current element
  _isInTemplate() {
    return this.currentTagName === R.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === Z.HTML;
  }
  _updateCurrentElement() {
    this.current = this.items[this.stackTop], this.currentTagName = this.current && this.treeAdapter.getTagName(this.current), this.currentTmplContent = this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : null;
  }
  //Mutations
  push(t) {
    this.items[++this.stackTop] = t, this._updateCurrentElement(), this._isInTemplate() && this.tmplCount++;
  }
  pop() {
    this.stackTop--, this.tmplCount > 0 && this._isInTemplate() && this.tmplCount--, this._updateCurrentElement();
  }
  replace(t, n) {
    const r = this._indexOf(t);
    this.items[r] = n, r === this.stackTop && this._updateCurrentElement();
  }
  insertAfter(t, n) {
    const r = this._indexOf(t) + 1;
    this.items.splice(r, 0, n), r === ++this.stackTop && this._updateCurrentElement();
  }
  popUntilTagNamePopped(t) {
    for (; this.stackTop > -1; ) {
      const n = this.currentTagName, r = this.treeAdapter.getNamespaceURI(this.current);
      if (this.pop(), n === t && r === Z.HTML)
        break;
    }
  }
  popUntilElementPopped(t) {
    for (; this.stackTop > -1; ) {
      const n = this.current;
      if (this.pop(), n === t)
        break;
    }
  }
  popUntilNumberedHeaderPopped() {
    for (; this.stackTop > -1; ) {
      const t = this.currentTagName, n = this.treeAdapter.getNamespaceURI(this.current);
      if (this.pop(), t === R.H1 || t === R.H2 || t === R.H3 || t === R.H4 || t === R.H5 || t === R.H6 && n === Z.HTML)
        break;
    }
  }
  popUntilTableCellPopped() {
    for (; this.stackTop > -1; ) {
      const t = this.currentTagName, n = this.treeAdapter.getNamespaceURI(this.current);
      if (this.pop(), t === R.TD || t === R.TH && n === Z.HTML)
        break;
    }
  }
  popAllUpToHtmlElement() {
    this.stackTop = 0, this._updateCurrentElement();
  }
  clearBackToTableContext() {
    for (; this.currentTagName !== R.TABLE && this.currentTagName !== R.TEMPLATE && this.currentTagName !== R.HTML || this.treeAdapter.getNamespaceURI(this.current) !== Z.HTML; )
      this.pop();
  }
  clearBackToTableBodyContext() {
    for (; this.currentTagName !== R.TBODY && this.currentTagName !== R.TFOOT && this.currentTagName !== R.THEAD && this.currentTagName !== R.TEMPLATE && this.currentTagName !== R.HTML || this.treeAdapter.getNamespaceURI(this.current) !== Z.HTML; )
      this.pop();
  }
  clearBackToTableRowContext() {
    for (; this.currentTagName !== R.TR && this.currentTagName !== R.TEMPLATE && this.currentTagName !== R.HTML || this.treeAdapter.getNamespaceURI(this.current) !== Z.HTML; )
      this.pop();
  }
  remove(t) {
    for (let n = this.stackTop; n >= 0; n--)
      if (this.items[n] === t) {
        this.items.splice(n, 1), this.stackTop--, this._updateCurrentElement();
        break;
      }
  }
  //Search
  tryPeekProperlyNestedBodyElement() {
    const t = this.items[1];
    return t && this.treeAdapter.getTagName(t) === R.BODY ? t : null;
  }
  contains(t) {
    return this._indexOf(t) > -1;
  }
  getCommonAncestor(t) {
    let n = this._indexOf(t);
    return --n >= 0 ? this.items[n] : null;
  }
  isRootHtmlElementCurrent() {
    return this.stackTop === 0 && this.currentTagName === R.HTML;
  }
  //Element in scope
  hasInScope(t) {
    for (let n = this.stackTop; n >= 0; n--) {
      const r = this.treeAdapter.getTagName(this.items[n]), i = this.treeAdapter.getNamespaceURI(this.items[n]);
      if (r === t && i === Z.HTML)
        return !0;
      if (V1(r, i))
        return !1;
    }
    return !0;
  }
  hasNumberedHeaderInScope() {
    for (let t = this.stackTop; t >= 0; t--) {
      const n = this.treeAdapter.getTagName(this.items[t]), r = this.treeAdapter.getNamespaceURI(this.items[t]);
      if ((n === R.H1 || n === R.H2 || n === R.H3 || n === R.H4 || n === R.H5 || n === R.H6) && r === Z.HTML)
        return !0;
      if (V1(n, r))
        return !1;
    }
    return !0;
  }
  hasInListItemScope(t) {
    for (let n = this.stackTop; n >= 0; n--) {
      const r = this.treeAdapter.getTagName(this.items[n]), i = this.treeAdapter.getNamespaceURI(this.items[n]);
      if (r === t && i === Z.HTML)
        return !0;
      if ((r === R.UL || r === R.OL) && i === Z.HTML || V1(r, i))
        return !1;
    }
    return !0;
  }
  hasInButtonScope(t) {
    for (let n = this.stackTop; n >= 0; n--) {
      const r = this.treeAdapter.getTagName(this.items[n]), i = this.treeAdapter.getNamespaceURI(this.items[n]);
      if (r === t && i === Z.HTML)
        return !0;
      if (r === R.BUTTON && i === Z.HTML || V1(r, i))
        return !1;
    }
    return !0;
  }
  hasInTableScope(t) {
    for (let n = this.stackTop; n >= 0; n--) {
      const r = this.treeAdapter.getTagName(this.items[n]);
      if (this.treeAdapter.getNamespaceURI(this.items[n]) === Z.HTML) {
        if (r === t)
          return !0;
        if (r === R.TABLE || r === R.TEMPLATE || r === R.HTML)
          return !1;
      }
    }
    return !0;
  }
  hasTableBodyContextInTableScope() {
    for (let t = this.stackTop; t >= 0; t--) {
      const n = this.treeAdapter.getTagName(this.items[t]);
      if (this.treeAdapter.getNamespaceURI(this.items[t]) === Z.HTML) {
        if (n === R.TBODY || n === R.THEAD || n === R.TFOOT)
          return !0;
        if (n === R.TABLE || n === R.HTML)
          return !1;
      }
    }
    return !0;
  }
  hasInSelectScope(t) {
    for (let n = this.stackTop; n >= 0; n--) {
      const r = this.treeAdapter.getTagName(this.items[n]);
      if (this.treeAdapter.getNamespaceURI(this.items[n]) === Z.HTML) {
        if (r === t)
          return !0;
        if (r !== R.OPTION && r !== R.OPTGROUP)
          return !1;
      }
    }
    return !0;
  }
  //Implied end tags
  generateImpliedEndTags() {
    for (; Ss(this.currentTagName); )
      this.pop();
  }
  generateImpliedEndTagsThoroughly() {
    for (; wu(this.currentTagName); )
      this.pop();
  }
  generateImpliedEndTagsWithExclusion(t) {
    for (; Ss(this.currentTagName) && this.currentTagName !== t; )
      this.pop();
  }
};
var Hu = Fu;
const X1 = 3;
let Fr = class St {
  constructor(t) {
    this.length = 0, this.entries = [], this.treeAdapter = t, this.bookmark = null;
  }
  //Noah Ark's condition
  //OPTIMIZATION: at first we try to find possible candidates for exclusion using
  //lightweight heuristics without thorough attributes check.
  _getNoahArkConditionCandidates(t) {
    const n = [];
    if (this.length >= X1) {
      const r = this.treeAdapter.getAttrList(t).length, i = this.treeAdapter.getTagName(t), s = this.treeAdapter.getNamespaceURI(t);
      for (let o = this.length - 1; o >= 0; o--) {
        const a = this.entries[o];
        if (a.type === St.MARKER_ENTRY)
          break;
        const u = a.element, c = this.treeAdapter.getAttrList(u);
        this.treeAdapter.getTagName(u) === i && this.treeAdapter.getNamespaceURI(u) === s && c.length === r && n.push({ idx: o, attrs: c });
      }
    }
    return n.length < X1 ? [] : n;
  }
  _ensureNoahArkCondition(t) {
    const n = this._getNoahArkConditionCandidates(t);
    let r = n.length;
    if (r) {
      const i = this.treeAdapter.getAttrList(t), s = i.length, o = /* @__PURE__ */ Object.create(null);
      for (let a = 0; a < s; a++) {
        const u = i[a];
        o[u.name] = u.value;
      }
      for (let a = 0; a < s; a++)
        for (let u = 0; u < r; u++) {
          const c = n[u].attrs[a];
          if (o[c.name] !== c.value && (n.splice(u, 1), r--), n.length < X1)
            return;
        }
      for (let a = r - 1; a >= X1 - 1; a--)
        this.entries.splice(n[a].idx, 1), this.length--;
    }
  }
  //Mutations
  insertMarker() {
    this.entries.push({ type: St.MARKER_ENTRY }), this.length++;
  }
  pushElement(t, n) {
    this._ensureNoahArkCondition(t), this.entries.push({
      type: St.ELEMENT_ENTRY,
      element: t,
      token: n
    }), this.length++;
  }
  insertElementAfterBookmark(t, n) {
    let r = this.length - 1;
    for (; r >= 0 && this.entries[r] !== this.bookmark; r--)
      ;
    this.entries.splice(r + 1, 0, {
      type: St.ELEMENT_ENTRY,
      element: t,
      token: n
    }), this.length++;
  }
  removeEntry(t) {
    for (let n = this.length - 1; n >= 0; n--)
      if (this.entries[n] === t) {
        this.entries.splice(n, 1), this.length--;
        break;
      }
  }
  clearToLastMarker() {
    for (; this.length; ) {
      const t = this.entries.pop();
      if (this.length--, t.type === St.MARKER_ENTRY)
        break;
    }
  }
  //Search
  getElementEntryInScopeWithTagName(t) {
    for (let n = this.length - 1; n >= 0; n--) {
      const r = this.entries[n];
      if (r.type === St.MARKER_ENTRY)
        return null;
      if (this.treeAdapter.getTagName(r.element) === t)
        return r;
    }
    return null;
  }
  getElementEntry(t) {
    for (let n = this.length - 1; n >= 0; n--) {
      const r = this.entries[n];
      if (r.type === St.ELEMENT_ENTRY && r.element === t)
        return r;
    }
    return null;
  }
};
Fr.MARKER_ENTRY = "MARKER_ENTRY";
Fr.ELEMENT_ENTRY = "ELEMENT_ENTRY";
var Bu = Fr;
let Jo = class {
  constructor(t) {
    const n = {}, r = this._getOverriddenMethods(this, n);
    for (const i of Object.keys(r))
      typeof r[i] == "function" && (n[i] = t[i], t[i] = r[i]);
  }
  _getOverriddenMethods() {
    throw new Error("Not implemented");
  }
};
Jo.install = function(e, t, n) {
  e.__mixins || (e.__mixins = []);
  for (let i = 0; i < e.__mixins.length; i++)
    if (e.__mixins[i].constructor === t)
      return e.__mixins[i];
  const r = new t(e, n);
  return e.__mixins.push(r), r;
};
var pt = Jo;
const Uu = pt;
let vu = class extends Uu {
  constructor(t) {
    super(t), this.preprocessor = t, this.isEol = !1, this.lineStartPos = 0, this.droppedBufferSize = 0, this.offset = 0, this.col = 0, this.line = 1;
  }
  _getOverriddenMethods(t, n) {
    return {
      advance() {
        const r = this.pos + 1, i = this.html[r];
        return t.isEol && (t.isEol = !1, t.line++, t.lineStartPos = r), (i === `
` || i === "\r" && this.html[r + 1] !== `
`) && (t.isEol = !0), t.col = r - t.lineStartPos + 1, t.offset = t.droppedBufferSize + r, n.advance.call(this);
      },
      retreat() {
        n.retreat.call(this), t.isEol = !1, t.col = this.pos - t.lineStartPos + 1;
      },
      dropParsedChunk() {
        const r = this.pos;
        n.dropParsedChunk.call(this);
        const i = r - this.pos;
        t.lineStartPos -= i, t.droppedBufferSize += i, t.offset = t.droppedBufferSize + this.pos;
      }
    };
  }
};
var ea = vu;
const ys = pt, ir = Sn, Gu = ea;
let Ku = class extends ys {
  constructor(t) {
    super(t), this.tokenizer = t, this.posTracker = ys.install(t.preprocessor, Gu), this.currentAttrLocation = null, this.ctLoc = null;
  }
  _getCurrentLocation() {
    return {
      startLine: this.posTracker.line,
      startCol: this.posTracker.col,
      startOffset: this.posTracker.offset,
      endLine: -1,
      endCol: -1,
      endOffset: -1
    };
  }
  _attachCurrentAttrLocationInfo() {
    this.currentAttrLocation.endLine = this.posTracker.line, this.currentAttrLocation.endCol = this.posTracker.col, this.currentAttrLocation.endOffset = this.posTracker.offset;
    const t = this.tokenizer.currentToken, n = this.tokenizer.currentAttr;
    t.location.attrs || (t.location.attrs = /* @__PURE__ */ Object.create(null)), t.location.attrs[n.name] = this.currentAttrLocation;
  }
  _getOverriddenMethods(t, n) {
    const r = {
      _createStartTagToken() {
        n._createStartTagToken.call(this), this.currentToken.location = t.ctLoc;
      },
      _createEndTagToken() {
        n._createEndTagToken.call(this), this.currentToken.location = t.ctLoc;
      },
      _createCommentToken() {
        n._createCommentToken.call(this), this.currentToken.location = t.ctLoc;
      },
      _createDoctypeToken(i) {
        n._createDoctypeToken.call(this, i), this.currentToken.location = t.ctLoc;
      },
      _createCharacterToken(i, s) {
        n._createCharacterToken.call(this, i, s), this.currentCharacterToken.location = t.ctLoc;
      },
      _createEOFToken() {
        n._createEOFToken.call(this), this.currentToken.location = t._getCurrentLocation();
      },
      _createAttr(i) {
        n._createAttr.call(this, i), t.currentAttrLocation = t._getCurrentLocation();
      },
      _leaveAttrName(i) {
        n._leaveAttrName.call(this, i), t._attachCurrentAttrLocationInfo();
      },
      _leaveAttrValue(i) {
        n._leaveAttrValue.call(this, i), t._attachCurrentAttrLocationInfo();
      },
      _emitCurrentToken() {
        const i = this.currentToken.location;
        this.currentCharacterToken && (this.currentCharacterToken.location.endLine = i.startLine, this.currentCharacterToken.location.endCol = i.startCol, this.currentCharacterToken.location.endOffset = i.startOffset), this.currentToken.type === ir.EOF_TOKEN ? (i.endLine = i.startLine, i.endCol = i.startCol, i.endOffset = i.startOffset) : (i.endLine = t.posTracker.line, i.endCol = t.posTracker.col + 1, i.endOffset = t.posTracker.offset + 1), n._emitCurrentToken.call(this);
      },
      _emitCurrentCharacterToken() {
        const i = this.currentCharacterToken && this.currentCharacterToken.location;
        i && i.endOffset === -1 && (i.endLine = t.posTracker.line, i.endCol = t.posTracker.col, i.endOffset = t.posTracker.offset), n._emitCurrentCharacterToken.call(this);
      }
    };
    return Object.keys(ir.MODE).forEach((i) => {
      const s = ir.MODE[i];
      r[s] = function(o) {
        t.ctLoc = t._getCurrentLocation(), n[s].call(this, o);
      };
    }), r;
  }
};
var ta = Ku;
const zu = pt;
let $u = class extends zu {
  constructor(t, n) {
    super(t), this.onItemPop = n.onItemPop;
  }
  _getOverriddenMethods(t, n) {
    return {
      pop() {
        t.onItemPop(this.current), n.pop.call(this);
      },
      popAllUpToHtmlElement() {
        for (let r = this.stackTop; r > 0; r--)
          t.onItemPop(this.items[r]);
        n.popAllUpToHtmlElement.call(this);
      },
      remove(r) {
        t.onItemPop(this.current), n.remove.call(this, r);
      }
    };
  }
};
var Yu = $u;
const sr = pt, Is = Sn, ju = ta, Qu = Yu, qu = qe, or = qu.TAG_NAMES;
let Wu = class extends sr {
  constructor(t) {
    super(t), this.parser = t, this.treeAdapter = this.parser.treeAdapter, this.posTracker = null, this.lastStartTagToken = null, this.lastFosterParentingLocation = null, this.currentToken = null;
  }
  _setStartLocation(t) {
    let n = null;
    this.lastStartTagToken && (n = Object.assign({}, this.lastStartTagToken.location), n.startTag = this.lastStartTagToken.location), this.treeAdapter.setNodeSourceCodeLocation(t, n);
  }
  _setEndLocation(t, n) {
    if (this.treeAdapter.getNodeSourceCodeLocation(t) && n.location) {
      const i = n.location, s = this.treeAdapter.getTagName(t), o = n.type === Is.END_TAG_TOKEN && s === n.tagName, a = {};
      o ? (a.endTag = Object.assign({}, i), a.endLine = i.endLine, a.endCol = i.endCol, a.endOffset = i.endOffset) : (a.endLine = i.startLine, a.endCol = i.startCol, a.endOffset = i.startOffset), this.treeAdapter.updateNodeSourceCodeLocation(t, a);
    }
  }
  _getOverriddenMethods(t, n) {
    return {
      _bootstrap(r, i) {
        n._bootstrap.call(this, r, i), t.lastStartTagToken = null, t.lastFosterParentingLocation = null, t.currentToken = null;
        const s = sr.install(this.tokenizer, ju);
        t.posTracker = s.posTracker, sr.install(this.openElements, Qu, {
          onItemPop: function(o) {
            t._setEndLocation(o, t.currentToken);
          }
        });
      },
      _runParsingLoop(r) {
        n._runParsingLoop.call(this, r);
        for (let i = this.openElements.stackTop; i >= 0; i--)
          t._setEndLocation(this.openElements.items[i], t.currentToken);
      },
      //Token processing
      _processTokenInForeignContent(r) {
        t.currentToken = r, n._processTokenInForeignContent.call(this, r);
      },
      _processToken(r) {
        if (t.currentToken = r, n._processToken.call(this, r), r.type === Is.END_TAG_TOKEN && (r.tagName === or.HTML || r.tagName === or.BODY && this.openElements.hasInScope(or.BODY)))
          for (let s = this.openElements.stackTop; s >= 0; s--) {
            const o = this.openElements.items[s];
            if (this.treeAdapter.getTagName(o) === r.tagName) {
              t._setEndLocation(o, r);
              break;
            }
          }
      },
      //Doctype
      _setDocumentType(r) {
        n._setDocumentType.call(this, r);
        const i = this.treeAdapter.getChildNodes(this.document), s = i.length;
        for (let o = 0; o < s; o++) {
          const a = i[o];
          if (this.treeAdapter.isDocumentTypeNode(a)) {
            this.treeAdapter.setNodeSourceCodeLocation(a, r.location);
            break;
          }
        }
      },
      //Elements
      _attachElementToTree(r) {
        t._setStartLocation(r), t.lastStartTagToken = null, n._attachElementToTree.call(this, r);
      },
      _appendElement(r, i) {
        t.lastStartTagToken = r, n._appendElement.call(this, r, i);
      },
      _insertElement(r, i) {
        t.lastStartTagToken = r, n._insertElement.call(this, r, i);
      },
      _insertTemplate(r) {
        t.lastStartTagToken = r, n._insertTemplate.call(this, r);
        const i = this.treeAdapter.getTemplateContent(this.openElements.current);
        this.treeAdapter.setNodeSourceCodeLocation(i, null);
      },
      _insertFakeRootElement() {
        n._insertFakeRootElement.call(this), this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current, null);
      },
      //Comments
      _appendCommentNode(r, i) {
        n._appendCommentNode.call(this, r, i);
        const s = this.treeAdapter.getChildNodes(i), o = s[s.length - 1];
        this.treeAdapter.setNodeSourceCodeLocation(o, r.location);
      },
      //Text
      _findFosterParentingLocation() {
        return t.lastFosterParentingLocation = n._findFosterParentingLocation.call(this), t.lastFosterParentingLocation;
      },
      _insertCharacters(r) {
        n._insertCharacters.call(this, r);
        const i = this._shouldFosterParentOnInsertion(), s = i && t.lastFosterParentingLocation.parent || this.openElements.currentTmplContent || this.openElements.current, o = this.treeAdapter.getChildNodes(s), a = i && t.lastFosterParentingLocation.beforeElement ? o.indexOf(t.lastFosterParentingLocation.beforeElement) - 1 : o.length - 1, u = o[a];
        if (this.treeAdapter.getNodeSourceCodeLocation(u)) {
          const { endLine: f, endCol: h, endOffset: E } = r.location;
          this.treeAdapter.updateNodeSourceCodeLocation(u, { endLine: f, endCol: h, endOffset: E });
        } else
          this.treeAdapter.setNodeSourceCodeLocation(u, r.location);
      }
    };
  }
};
var Vu = Wu;
const Xu = pt;
let Zu = class extends Xu {
  constructor(t, n) {
    super(t), this.posTracker = null, this.onParseError = n.onParseError;
  }
  _setErrorLocation(t) {
    t.startLine = t.endLine = this.posTracker.line, t.startCol = t.endCol = this.posTracker.col, t.startOffset = t.endOffset = this.posTracker.offset;
  }
  _reportError(t) {
    const n = {
      code: t,
      startLine: -1,
      startCol: -1,
      startOffset: -1,
      endLine: -1,
      endCol: -1,
      endOffset: -1
    };
    this._setErrorLocation(n), this.onParseError(n);
  }
  _getOverriddenMethods(t) {
    return {
      _err(n) {
        t._reportError(n);
      }
    };
  }
};
var Hr = Zu;
const Ju = Hr, ec = ea, tc = pt;
let nc = class extends Ju {
  constructor(t, n) {
    super(t, n), this.posTracker = tc.install(t, ec), this.lastErrOffset = -1;
  }
  _reportError(t) {
    this.lastErrOffset !== this.posTracker.offset && (this.lastErrOffset = this.posTracker.offset, super._reportError(t));
  }
};
var rc = nc;
const ic = Hr, sc = rc, oc = pt;
let ac = class extends ic {
  constructor(t, n) {
    super(t, n);
    const r = oc.install(t.preprocessor, sc, n);
    this.posTracker = r.posTracker;
  }
};
var lc = ac;
const uc = Hr, cc = lc, fc = ta, Os = pt;
let hc = class extends uc {
  constructor(t, n) {
    super(t, n), this.opts = n, this.ctLoc = null, this.locBeforeToken = !1;
  }
  _setErrorLocation(t) {
    this.ctLoc && (t.startLine = this.ctLoc.startLine, t.startCol = this.ctLoc.startCol, t.startOffset = this.ctLoc.startOffset, t.endLine = this.locBeforeToken ? this.ctLoc.startLine : this.ctLoc.endLine, t.endCol = this.locBeforeToken ? this.ctLoc.startCol : this.ctLoc.endCol, t.endOffset = this.locBeforeToken ? this.ctLoc.startOffset : this.ctLoc.endOffset);
  }
  _getOverriddenMethods(t, n) {
    return {
      _bootstrap(r, i) {
        n._bootstrap.call(this, r, i), Os.install(this.tokenizer, cc, t.opts), Os.install(this.tokenizer, fc);
      },
      _processInputToken(r) {
        t.ctLoc = r.location, n._processInputToken.call(this, r);
      },
      _err(r, i) {
        t.locBeforeToken = i && i.beforeToken, t._reportError(r);
      }
    };
  }
};
var pc = hc, q = {};
const { DOCUMENT_MODE: dc } = qe;
q.createDocument = function() {
  return {
    nodeName: "#document",
    mode: dc.NO_QUIRKS,
    childNodes: []
  };
};
q.createDocumentFragment = function() {
  return {
    nodeName: "#document-fragment",
    childNodes: []
  };
};
q.createElement = function(e, t, n) {
  return {
    nodeName: e,
    tagName: e,
    attrs: n,
    namespaceURI: t,
    childNodes: [],
    parentNode: null
  };
};
q.createCommentNode = function(e) {
  return {
    nodeName: "#comment",
    data: e,
    parentNode: null
  };
};
const na = function(e) {
  return {
    nodeName: "#text",
    value: e,
    parentNode: null
  };
}, ra = q.appendChild = function(e, t) {
  e.childNodes.push(t), t.parentNode = e;
}, mc = q.insertBefore = function(e, t, n) {
  const r = e.childNodes.indexOf(n);
  e.childNodes.splice(r, 0, t), t.parentNode = e;
};
q.setTemplateContent = function(e, t) {
  e.content = t;
};
q.getTemplateContent = function(e) {
  return e.content;
};
q.setDocumentType = function(e, t, n, r) {
  let i = null;
  for (let s = 0; s < e.childNodes.length; s++)
    if (e.childNodes[s].nodeName === "#documentType") {
      i = e.childNodes[s];
      break;
    }
  i ? (i.name = t, i.publicId = n, i.systemId = r) : ra(e, {
    nodeName: "#documentType",
    name: t,
    publicId: n,
    systemId: r
  });
};
q.setDocumentMode = function(e, t) {
  e.mode = t;
};
q.getDocumentMode = function(e) {
  return e.mode;
};
q.detachNode = function(e) {
  if (e.parentNode) {
    const t = e.parentNode.childNodes.indexOf(e);
    e.parentNode.childNodes.splice(t, 1), e.parentNode = null;
  }
};
q.insertText = function(e, t) {
  if (e.childNodes.length) {
    const n = e.childNodes[e.childNodes.length - 1];
    if (n.nodeName === "#text") {
      n.value += t;
      return;
    }
  }
  ra(e, na(t));
};
q.insertTextBefore = function(e, t, n) {
  const r = e.childNodes[e.childNodes.indexOf(n) - 1];
  r && r.nodeName === "#text" ? r.value += t : mc(e, na(t), n);
};
q.adoptAttributes = function(e, t) {
  const n = [];
  for (let r = 0; r < e.attrs.length; r++)
    n.push(e.attrs[r].name);
  for (let r = 0; r < t.length; r++)
    n.indexOf(t[r].name) === -1 && e.attrs.push(t[r]);
};
q.getFirstChild = function(e) {
  return e.childNodes[0];
};
q.getChildNodes = function(e) {
  return e.childNodes;
};
q.getParentNode = function(e) {
  return e.parentNode;
};
q.getAttrList = function(e) {
  return e.attrs;
};
q.getTagName = function(e) {
  return e.tagName;
};
q.getNamespaceURI = function(e) {
  return e.namespaceURI;
};
q.getTextNodeContent = function(e) {
  return e.value;
};
q.getCommentNodeContent = function(e) {
  return e.data;
};
q.getDocumentTypeNodeName = function(e) {
  return e.name;
};
q.getDocumentTypeNodePublicId = function(e) {
  return e.publicId;
};
q.getDocumentTypeNodeSystemId = function(e) {
  return e.systemId;
};
q.isTextNode = function(e) {
  return e.nodeName === "#text";
};
q.isCommentNode = function(e) {
  return e.nodeName === "#comment";
};
q.isDocumentTypeNode = function(e) {
  return e.nodeName === "#documentType";
};
q.isElementNode = function(e) {
  return !!e.tagName;
};
q.setNodeSourceCodeLocation = function(e, t) {
  e.sourceCodeLocation = t;
};
q.getNodeSourceCodeLocation = function(e) {
  return e.sourceCodeLocation;
};
q.updateNodeSourceCodeLocation = function(e, t) {
  e.sourceCodeLocation = Object.assign(e.sourceCodeLocation, t);
};
var Tc = function(t, n) {
  return n = n || /* @__PURE__ */ Object.create(null), [t, n].reduce((r, i) => (Object.keys(i).forEach((s) => {
    r[s] = i[s];
  }), r), /* @__PURE__ */ Object.create(null));
}, yn = {};
const { DOCUMENT_MODE: $t } = qe, ia = "html", Ec = "about:legacy-compat", gc = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd", sa = [
  "+//silmaril//dtd html pro v0r11 19970101//",
  "-//as//dtd html 3.0 aswedit + extensions//",
  "-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
  "-//ietf//dtd html 2.0 level 1//",
  "-//ietf//dtd html 2.0 level 2//",
  "-//ietf//dtd html 2.0 strict level 1//",
  "-//ietf//dtd html 2.0 strict level 2//",
  "-//ietf//dtd html 2.0 strict//",
  "-//ietf//dtd html 2.0//",
  "-//ietf//dtd html 2.1e//",
  "-//ietf//dtd html 3.0//",
  "-//ietf//dtd html 3.2 final//",
  "-//ietf//dtd html 3.2//",
  "-//ietf//dtd html 3//",
  "-//ietf//dtd html level 0//",
  "-//ietf//dtd html level 1//",
  "-//ietf//dtd html level 2//",
  "-//ietf//dtd html level 3//",
  "-//ietf//dtd html strict level 0//",
  "-//ietf//dtd html strict level 1//",
  "-//ietf//dtd html strict level 2//",
  "-//ietf//dtd html strict level 3//",
  "-//ietf//dtd html strict//",
  "-//ietf//dtd html//",
  "-//metrius//dtd metrius presentational//",
  "-//microsoft//dtd internet explorer 2.0 html strict//",
  "-//microsoft//dtd internet explorer 2.0 html//",
  "-//microsoft//dtd internet explorer 2.0 tables//",
  "-//microsoft//dtd internet explorer 3.0 html strict//",
  "-//microsoft//dtd internet explorer 3.0 html//",
  "-//microsoft//dtd internet explorer 3.0 tables//",
  "-//netscape comm. corp.//dtd html//",
  "-//netscape comm. corp.//dtd strict html//",
  "-//o'reilly and associates//dtd html 2.0//",
  "-//o'reilly and associates//dtd html extended 1.0//",
  "-//o'reilly and associates//dtd html extended relaxed 1.0//",
  "-//sq//dtd html 2.0 hotmetal + extensions//",
  "-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
  "-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
  "-//spyglass//dtd html 2.0 extended//",
  "-//sun microsystems corp.//dtd hotjava html//",
  "-//sun microsystems corp.//dtd hotjava strict html//",
  "-//w3c//dtd html 3 1995-03-24//",
  "-//w3c//dtd html 3.2 draft//",
  "-//w3c//dtd html 3.2 final//",
  "-//w3c//dtd html 3.2//",
  "-//w3c//dtd html 3.2s draft//",
  "-//w3c//dtd html 4.0 frameset//",
  "-//w3c//dtd html 4.0 transitional//",
  "-//w3c//dtd html experimental 19960712//",
  "-//w3c//dtd html experimental 970421//",
  "-//w3c//dtd w3 html//",
  "-//w3o//dtd w3 html 3.0//",
  "-//webtechs//dtd mozilla html 2.0//",
  "-//webtechs//dtd mozilla html//"
], _c = sa.concat([
  "-//w3c//dtd html 4.01 frameset//",
  "-//w3c//dtd html 4.01 transitional//"
]), Ac = ["-//w3o//dtd w3 html strict 3.0//en//", "-/w3c/dtd html 4.0 transitional/en", "html"], oa = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"], Cc = oa.concat([
  "-//w3c//dtd html 4.01 frameset//",
  "-//w3c//dtd html 4.01 transitional//"
]);
function xs(e) {
  const t = e.indexOf('"') !== -1 ? "'" : '"';
  return t + e + t;
}
function bs(e, t) {
  for (let n = 0; n < t.length; n++)
    if (e.indexOf(t[n]) === 0)
      return !0;
  return !1;
}
yn.isConforming = function(e) {
  return e.name === ia && e.publicId === null && (e.systemId === null || e.systemId === Ec);
};
yn.getDocumentMode = function(e) {
  if (e.name !== ia)
    return $t.QUIRKS;
  const t = e.systemId;
  if (t && t.toLowerCase() === gc)
    return $t.QUIRKS;
  let n = e.publicId;
  if (n !== null) {
    if (n = n.toLowerCase(), Ac.indexOf(n) > -1)
      return $t.QUIRKS;
    let r = t === null ? _c : sa;
    if (bs(n, r))
      return $t.QUIRKS;
    if (r = t === null ? oa : Cc, bs(n, r))
      return $t.LIMITED_QUIRKS;
  }
  return $t.NO_QUIRKS;
};
yn.serializeContent = function(e, t, n) {
  let r = "!DOCTYPE ";
  return e && (r += e), t ? r += " PUBLIC " + xs(t) : n && (r += " SYSTEM"), n !== null && (r += " " + xs(n)), r;
};
var xt = {};
const ar = Sn, Br = qe, F = Br.TAG_NAMES, ge = Br.NAMESPACES, ln = Br.ATTRS, Rs = {
  TEXT_HTML: "text/html",
  APPLICATION_XML: "application/xhtml+xml"
}, Nc = "definitionurl", Sc = "definitionURL", yc = {
  attributename: "attributeName",
  attributetype: "attributeType",
  basefrequency: "baseFrequency",
  baseprofile: "baseProfile",
  calcmode: "calcMode",
  clippathunits: "clipPathUnits",
  diffuseconstant: "diffuseConstant",
  edgemode: "edgeMode",
  filterunits: "filterUnits",
  glyphref: "glyphRef",
  gradienttransform: "gradientTransform",
  gradientunits: "gradientUnits",
  kernelmatrix: "kernelMatrix",
  kernelunitlength: "kernelUnitLength",
  keypoints: "keyPoints",
  keysplines: "keySplines",
  keytimes: "keyTimes",
  lengthadjust: "lengthAdjust",
  limitingconeangle: "limitingConeAngle",
  markerheight: "markerHeight",
  markerunits: "markerUnits",
  markerwidth: "markerWidth",
  maskcontentunits: "maskContentUnits",
  maskunits: "maskUnits",
  numoctaves: "numOctaves",
  pathlength: "pathLength",
  patterncontentunits: "patternContentUnits",
  patterntransform: "patternTransform",
  patternunits: "patternUnits",
  pointsatx: "pointsAtX",
  pointsaty: "pointsAtY",
  pointsatz: "pointsAtZ",
  preservealpha: "preserveAlpha",
  preserveaspectratio: "preserveAspectRatio",
  primitiveunits: "primitiveUnits",
  refx: "refX",
  refy: "refY",
  repeatcount: "repeatCount",
  repeatdur: "repeatDur",
  requiredextensions: "requiredExtensions",
  requiredfeatures: "requiredFeatures",
  specularconstant: "specularConstant",
  specularexponent: "specularExponent",
  spreadmethod: "spreadMethod",
  startoffset: "startOffset",
  stddeviation: "stdDeviation",
  stitchtiles: "stitchTiles",
  surfacescale: "surfaceScale",
  systemlanguage: "systemLanguage",
  tablevalues: "tableValues",
  targetx: "targetX",
  targety: "targetY",
  textlength: "textLength",
  viewbox: "viewBox",
  viewtarget: "viewTarget",
  xchannelselector: "xChannelSelector",
  ychannelselector: "yChannelSelector",
  zoomandpan: "zoomAndPan"
}, Ic = {
  "xlink:actuate": { prefix: "xlink", name: "actuate", namespace: ge.XLINK },
  "xlink:arcrole": { prefix: "xlink", name: "arcrole", namespace: ge.XLINK },
  "xlink:href": { prefix: "xlink", name: "href", namespace: ge.XLINK },
  "xlink:role": { prefix: "xlink", name: "role", namespace: ge.XLINK },
  "xlink:show": { prefix: "xlink", name: "show", namespace: ge.XLINK },
  "xlink:title": { prefix: "xlink", name: "title", namespace: ge.XLINK },
  "xlink:type": { prefix: "xlink", name: "type", namespace: ge.XLINK },
  "xml:base": { prefix: "xml", name: "base", namespace: ge.XML },
  "xml:lang": { prefix: "xml", name: "lang", namespace: ge.XML },
  "xml:space": { prefix: "xml", name: "space", namespace: ge.XML },
  xmlns: { prefix: "", name: "xmlns", namespace: ge.XMLNS },
  "xmlns:xlink": { prefix: "xmlns", name: "xlink", namespace: ge.XMLNS }
}, Oc = xt.SVG_TAG_NAMES_ADJUSTMENT_MAP = {
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient",
  textpath: "textPath"
}, xc = {
  [F.B]: !0,
  [F.BIG]: !0,
  [F.BLOCKQUOTE]: !0,
  [F.BODY]: !0,
  [F.BR]: !0,
  [F.CENTER]: !0,
  [F.CODE]: !0,
  [F.DD]: !0,
  [F.DIV]: !0,
  [F.DL]: !0,
  [F.DT]: !0,
  [F.EM]: !0,
  [F.EMBED]: !0,
  [F.H1]: !0,
  [F.H2]: !0,
  [F.H3]: !0,
  [F.H4]: !0,
  [F.H5]: !0,
  [F.H6]: !0,
  [F.HEAD]: !0,
  [F.HR]: !0,
  [F.I]: !0,
  [F.IMG]: !0,
  [F.LI]: !0,
  [F.LISTING]: !0,
  [F.MENU]: !0,
  [F.META]: !0,
  [F.NOBR]: !0,
  [F.OL]: !0,
  [F.P]: !0,
  [F.PRE]: !0,
  [F.RUBY]: !0,
  [F.S]: !0,
  [F.SMALL]: !0,
  [F.SPAN]: !0,
  [F.STRONG]: !0,
  [F.STRIKE]: !0,
  [F.SUB]: !0,
  [F.SUP]: !0,
  [F.TABLE]: !0,
  [F.TT]: !0,
  [F.U]: !0,
  [F.UL]: !0,
  [F.VAR]: !0
};
xt.causesExit = function(e) {
  const t = e.tagName;
  return t === F.FONT && (ar.getTokenAttr(e, ln.COLOR) !== null || ar.getTokenAttr(e, ln.SIZE) !== null || ar.getTokenAttr(e, ln.FACE) !== null) ? !0 : xc[t];
};
xt.adjustTokenMathMLAttrs = function(e) {
  for (let t = 0; t < e.attrs.length; t++)
    if (e.attrs[t].name === Nc) {
      e.attrs[t].name = Sc;
      break;
    }
};
xt.adjustTokenSVGAttrs = function(e) {
  for (let t = 0; t < e.attrs.length; t++) {
    const n = yc[e.attrs[t].name];
    n && (e.attrs[t].name = n);
  }
};
xt.adjustTokenXMLAttrs = function(e) {
  for (let t = 0; t < e.attrs.length; t++) {
    const n = Ic[e.attrs[t].name];
    n && (e.attrs[t].prefix = n.prefix, e.attrs[t].name = n.name, e.attrs[t].namespace = n.namespace);
  }
};
xt.adjustTokenSVGTagName = function(e) {
  const t = Oc[e.tagName];
  t && (e.tagName = t);
};
function bc(e, t) {
  return t === ge.MATHML && (e === F.MI || e === F.MO || e === F.MN || e === F.MS || e === F.MTEXT);
}
function Rc(e, t, n) {
  if (t === ge.MATHML && e === F.ANNOTATION_XML) {
    for (let r = 0; r < n.length; r++)
      if (n[r].name === ln.ENCODING) {
        const i = n[r].value.toLowerCase();
        return i === Rs.TEXT_HTML || i === Rs.APPLICATION_XML;
      }
  }
  return t === ge.SVG && (e === F.FOREIGN_OBJECT || e === F.DESC || e === F.TITLE);
}
xt.isIntegrationPoint = function(e, t, n, r) {
  return !!((!r || r === ge.HTML) && Rc(e, t, n) || (!r || r === ge.MATHML) && bc(e, t));
};
const d = Sn, kc = Hu, ks = Bu, Lc = Vu, Mc = pc, Ls = pt, Pc = q, Dc = Tc, Ms = yn, Je = xt, _e = wr, wc = Qe, Ft = qe, l = Ft.TAG_NAMES, P = Ft.NAMESPACES, aa = Ft.ATTRS, Fc = {
  scriptingEnabled: !0,
  sourceCodeLocationInfo: !1,
  onParseError: null,
  treeAdapter: Pc
}, la = "hidden", Hc = 8, Bc = 3, ua = "INITIAL_MODE", Ur = "BEFORE_HTML_MODE", In = "BEFORE_HEAD_MODE", t1 = "IN_HEAD_MODE", ca = "IN_HEAD_NO_SCRIPT_MODE", On = "AFTER_HEAD_MODE", tt = "IN_BODY_MODE", Tn = "TEXT_MODE", Ce = "IN_TABLE_MODE", fa = "IN_TABLE_TEXT_MODE", xn = "IN_CAPTION_MODE", D1 = "IN_COLUMN_GROUP_MODE", Pe = "IN_TABLE_BODY_MODE", ht = "IN_ROW_MODE", bn = "IN_CELL_MODE", vr = "IN_SELECT_MODE", Gr = "IN_SELECT_IN_TABLE_MODE", En = "IN_TEMPLATE_MODE", Kr = "AFTER_BODY_MODE", Rn = "IN_FRAMESET_MODE", ha = "AFTER_FRAMESET_MODE", pa = "AFTER_AFTER_BODY_MODE", da = "AFTER_AFTER_FRAMESET_MODE", Uc = {
  [l.TR]: ht,
  [l.TBODY]: Pe,
  [l.THEAD]: Pe,
  [l.TFOOT]: Pe,
  [l.CAPTION]: xn,
  [l.COLGROUP]: D1,
  [l.TABLE]: Ce,
  [l.BODY]: tt,
  [l.FRAMESET]: Rn
}, vc = {
  [l.CAPTION]: Ce,
  [l.COLGROUP]: Ce,
  [l.TBODY]: Ce,
  [l.TFOOT]: Ce,
  [l.THEAD]: Ce,
  [l.COL]: D1,
  [l.TR]: Pe,
  [l.TD]: ht,
  [l.TH]: ht
}, Ps = {
  [ua]: {
    [d.CHARACTER_TOKEN]: g1,
    [d.NULL_CHARACTER_TOKEN]: g1,
    [d.WHITESPACE_CHARACTER_TOKEN]: Q,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Vc,
    [d.START_TAG_TOKEN]: g1,
    [d.END_TAG_TOKEN]: g1,
    [d.EOF_TOKEN]: g1
  },
  [Ur]: {
    [d.CHARACTER_TOKEN]: y1,
    [d.NULL_CHARACTER_TOKEN]: y1,
    [d.WHITESPACE_CHARACTER_TOKEN]: Q,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: Xc,
    [d.END_TAG_TOKEN]: Zc,
    [d.EOF_TOKEN]: y1
  },
  [In]: {
    [d.CHARACTER_TOKEN]: I1,
    [d.NULL_CHARACTER_TOKEN]: I1,
    [d.WHITESPACE_CHARACTER_TOKEN]: Q,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Z1,
    [d.START_TAG_TOKEN]: Jc,
    [d.END_TAG_TOKEN]: e0,
    [d.EOF_TOKEN]: I1
  },
  [t1]: {
    [d.CHARACTER_TOKEN]: O1,
    [d.NULL_CHARACTER_TOKEN]: O1,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Z1,
    [d.START_TAG_TOKEN]: Te,
    [d.END_TAG_TOKEN]: Ht,
    [d.EOF_TOKEN]: O1
  },
  [ca]: {
    [d.CHARACTER_TOKEN]: x1,
    [d.NULL_CHARACTER_TOKEN]: x1,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Z1,
    [d.START_TAG_TOKEN]: t0,
    [d.END_TAG_TOKEN]: n0,
    [d.EOF_TOKEN]: x1
  },
  [On]: {
    [d.CHARACTER_TOKEN]: b1,
    [d.NULL_CHARACTER_TOKEN]: b1,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Z1,
    [d.START_TAG_TOKEN]: r0,
    [d.END_TAG_TOKEN]: i0,
    [d.EOF_TOKEN]: b1
  },
  [tt]: {
    [d.CHARACTER_TOKEN]: J1,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: Oe,
    [d.END_TAG_TOKEN]: zr,
    [d.EOF_TOKEN]: ut
  },
  [Tn]: {
    [d.CHARACTER_TOKEN]: ye,
    [d.NULL_CHARACTER_TOKEN]: ye,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: Q,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: Q,
    [d.END_TAG_TOKEN]: w0,
    [d.EOF_TOKEN]: F0
  },
  [Ce]: {
    [d.CHARACTER_TOKEN]: ct,
    [d.NULL_CHARACTER_TOKEN]: ct,
    [d.WHITESPACE_CHARACTER_TOKEN]: ct,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: $r,
    [d.END_TAG_TOKEN]: Yr,
    [d.EOF_TOKEN]: ut
  },
  [fa]: {
    [d.CHARACTER_TOKEN]: j0,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: Y0,
    [d.COMMENT_TOKEN]: _1,
    [d.DOCTYPE_TOKEN]: _1,
    [d.START_TAG_TOKEN]: _1,
    [d.END_TAG_TOKEN]: _1,
    [d.EOF_TOKEN]: _1
  },
  [xn]: {
    [d.CHARACTER_TOKEN]: J1,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: Q0,
    [d.END_TAG_TOKEN]: q0,
    [d.EOF_TOKEN]: ut
  },
  [D1]: {
    [d.CHARACTER_TOKEN]: gn,
    [d.NULL_CHARACTER_TOKEN]: gn,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: W0,
    [d.END_TAG_TOKEN]: V0,
    [d.EOF_TOKEN]: ut
  },
  [Pe]: {
    [d.CHARACTER_TOKEN]: ct,
    [d.NULL_CHARACTER_TOKEN]: ct,
    [d.WHITESPACE_CHARACTER_TOKEN]: ct,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: X0,
    [d.END_TAG_TOKEN]: Z0,
    [d.EOF_TOKEN]: ut
  },
  [ht]: {
    [d.CHARACTER_TOKEN]: ct,
    [d.NULL_CHARACTER_TOKEN]: ct,
    [d.WHITESPACE_CHARACTER_TOKEN]: ct,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: J0,
    [d.END_TAG_TOKEN]: e9,
    [d.EOF_TOKEN]: ut
  },
  [bn]: {
    [d.CHARACTER_TOKEN]: J1,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: t9,
    [d.END_TAG_TOKEN]: n9,
    [d.EOF_TOKEN]: ut
  },
  [vr]: {
    [d.CHARACTER_TOKEN]: ye,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: ma,
    [d.END_TAG_TOKEN]: Ta,
    [d.EOF_TOKEN]: ut
  },
  [Gr]: {
    [d.CHARACTER_TOKEN]: ye,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: r9,
    [d.END_TAG_TOKEN]: i9,
    [d.EOF_TOKEN]: ut
  },
  [En]: {
    [d.CHARACTER_TOKEN]: J1,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: s9,
    [d.END_TAG_TOKEN]: o9,
    [d.EOF_TOKEN]: Ea
  },
  [Kr]: {
    [d.CHARACTER_TOKEN]: _n,
    [d.NULL_CHARACTER_TOKEN]: _n,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: Wc,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: a9,
    [d.END_TAG_TOKEN]: l9,
    [d.EOF_TOKEN]: E1
  },
  [Rn]: {
    [d.CHARACTER_TOKEN]: Q,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: u9,
    [d.END_TAG_TOKEN]: c9,
    [d.EOF_TOKEN]: E1
  },
  [ha]: {
    [d.CHARACTER_TOKEN]: Q,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: ye,
    [d.COMMENT_TOKEN]: pe,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: f9,
    [d.END_TAG_TOKEN]: h9,
    [d.EOF_TOKEN]: E1
  },
  [pa]: {
    [d.CHARACTER_TOKEN]: un,
    [d.NULL_CHARACTER_TOKEN]: un,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: Ds,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: p9,
    [d.END_TAG_TOKEN]: un,
    [d.EOF_TOKEN]: E1
  },
  [da]: {
    [d.CHARACTER_TOKEN]: Q,
    [d.NULL_CHARACTER_TOKEN]: Q,
    [d.WHITESPACE_CHARACTER_TOKEN]: Lt,
    [d.COMMENT_TOKEN]: Ds,
    [d.DOCTYPE_TOKEN]: Q,
    [d.START_TAG_TOKEN]: d9,
    [d.END_TAG_TOKEN]: Q,
    [d.EOF_TOKEN]: E1
  }
};
class Gc {
  constructor(t) {
    this.options = Dc(Fc, t), this.treeAdapter = this.options.treeAdapter, this.pendingScript = null, this.options.sourceCodeLocationInfo && Ls.install(this, Lc), this.options.onParseError && Ls.install(this, Mc, { onParseError: this.options.onParseError });
  }
  // API
  parse(t) {
    const n = this.treeAdapter.createDocument();
    return this._bootstrap(n, null), this.tokenizer.write(t, !0), this._runParsingLoop(null), n;
  }
  parseFragment(t, n) {
    n || (n = this.treeAdapter.createElement(l.TEMPLATE, P.HTML, []));
    const r = this.treeAdapter.createElement("documentmock", P.HTML, []);
    this._bootstrap(r, n), this.treeAdapter.getTagName(n) === l.TEMPLATE && this._pushTmplInsertionMode(En), this._initTokenizerForFragmentParsing(), this._insertFakeRootElement(), this._resetInsertionMode(), this._findFormInFragmentContext(), this.tokenizer.write(t, !0), this._runParsingLoop(null);
    const i = this.treeAdapter.getFirstChild(r), s = this.treeAdapter.createDocumentFragment();
    return this._adoptNodes(i, s), s;
  }
  //Bootstrap parser
  _bootstrap(t, n) {
    this.tokenizer = new d(this.options), this.stopped = !1, this.insertionMode = ua, this.originalInsertionMode = "", this.document = t, this.fragmentContext = n, this.headElement = null, this.formElement = null, this.openElements = new kc(this.document, this.treeAdapter), this.activeFormattingElements = new ks(this.treeAdapter), this.tmplInsertionModeStack = [], this.tmplInsertionModeStackTop = -1, this.currentTmplInsertionMode = null, this.pendingCharacterTokens = [], this.hasNonWhitespacePendingCharacterToken = !1, this.framesetOk = !0, this.skipNextNewLine = !1, this.fosterParentingEnabled = !1;
  }
  //Errors
  _err() {
  }
  //Parsing loop
  _runParsingLoop(t) {
    for (; !this.stopped; ) {
      this._setupTokenizerCDATAMode();
      const n = this.tokenizer.getNextToken();
      if (n.type === d.HIBERNATION_TOKEN)
        break;
      if (this.skipNextNewLine && (this.skipNextNewLine = !1, n.type === d.WHITESPACE_CHARACTER_TOKEN && n.chars[0] === `
`)) {
        if (n.chars.length === 1)
          continue;
        n.chars = n.chars.substr(1);
      }
      if (this._processInputToken(n), t && this.pendingScript)
        break;
    }
  }
  runParsingLoopForCurrentChunk(t, n) {
    if (this._runParsingLoop(n), n && this.pendingScript) {
      const r = this.pendingScript;
      this.pendingScript = null, n(r);
      return;
    }
    t && t();
  }
  //Text parsing
  _setupTokenizerCDATAMode() {
    const t = this._getAdjustedCurrentElement();
    this.tokenizer.allowCDATA = t && t !== this.document && this.treeAdapter.getNamespaceURI(t) !== P.HTML && !this._isIntegrationPoint(t);
  }
  _switchToTextParsing(t, n) {
    this._insertElement(t, P.HTML), this.tokenizer.state = n, this.originalInsertionMode = this.insertionMode, this.insertionMode = Tn;
  }
  switchToPlaintextParsing() {
    this.insertionMode = Tn, this.originalInsertionMode = tt, this.tokenizer.state = d.MODE.PLAINTEXT;
  }
  //Fragment parsing
  _getAdjustedCurrentElement() {
    return this.openElements.stackTop === 0 && this.fragmentContext ? this.fragmentContext : this.openElements.current;
  }
  _findFormInFragmentContext() {
    let t = this.fragmentContext;
    do {
      if (this.treeAdapter.getTagName(t) === l.FORM) {
        this.formElement = t;
        break;
      }
      t = this.treeAdapter.getParentNode(t);
    } while (t);
  }
  _initTokenizerForFragmentParsing() {
    if (this.treeAdapter.getNamespaceURI(this.fragmentContext) === P.HTML) {
      const t = this.treeAdapter.getTagName(this.fragmentContext);
      t === l.TITLE || t === l.TEXTAREA ? this.tokenizer.state = d.MODE.RCDATA : t === l.STYLE || t === l.XMP || t === l.IFRAME || t === l.NOEMBED || t === l.NOFRAMES || t === l.NOSCRIPT ? this.tokenizer.state = d.MODE.RAWTEXT : t === l.SCRIPT ? this.tokenizer.state = d.MODE.SCRIPT_DATA : t === l.PLAINTEXT && (this.tokenizer.state = d.MODE.PLAINTEXT);
    }
  }
  //Tree mutation
  _setDocumentType(t) {
    const n = t.name || "", r = t.publicId || "", i = t.systemId || "";
    this.treeAdapter.setDocumentType(this.document, n, r, i);
  }
  _attachElementToTree(t) {
    if (this._shouldFosterParentOnInsertion())
      this._fosterParentElement(t);
    else {
      const n = this.openElements.currentTmplContent || this.openElements.current;
      this.treeAdapter.appendChild(n, t);
    }
  }
  _appendElement(t, n) {
    const r = this.treeAdapter.createElement(t.tagName, n, t.attrs);
    this._attachElementToTree(r);
  }
  _insertElement(t, n) {
    const r = this.treeAdapter.createElement(t.tagName, n, t.attrs);
    this._attachElementToTree(r), this.openElements.push(r);
  }
  _insertFakeElement(t) {
    const n = this.treeAdapter.createElement(t, P.HTML, []);
    this._attachElementToTree(n), this.openElements.push(n);
  }
  _insertTemplate(t) {
    const n = this.treeAdapter.createElement(t.tagName, P.HTML, t.attrs), r = this.treeAdapter.createDocumentFragment();
    this.treeAdapter.setTemplateContent(n, r), this._attachElementToTree(n), this.openElements.push(n);
  }
  _insertFakeRootElement() {
    const t = this.treeAdapter.createElement(l.HTML, P.HTML, []);
    this.treeAdapter.appendChild(this.openElements.current, t), this.openElements.push(t);
  }
  _appendCommentNode(t, n) {
    const r = this.treeAdapter.createCommentNode(t.data);
    this.treeAdapter.appendChild(n, r);
  }
  _insertCharacters(t) {
    if (this._shouldFosterParentOnInsertion())
      this._fosterParentText(t.chars);
    else {
      const n = this.openElements.currentTmplContent || this.openElements.current;
      this.treeAdapter.insertText(n, t.chars);
    }
  }
  _adoptNodes(t, n) {
    for (let r = this.treeAdapter.getFirstChild(t); r; r = this.treeAdapter.getFirstChild(t))
      this.treeAdapter.detachNode(r), this.treeAdapter.appendChild(n, r);
  }
  //Token processing
  _shouldProcessTokenInForeignContent(t) {
    const n = this._getAdjustedCurrentElement();
    if (!n || n === this.document)
      return !1;
    const r = this.treeAdapter.getNamespaceURI(n);
    if (r === P.HTML || this.treeAdapter.getTagName(n) === l.ANNOTATION_XML && r === P.MATHML && t.type === d.START_TAG_TOKEN && t.tagName === l.SVG)
      return !1;
    const i = t.type === d.CHARACTER_TOKEN || t.type === d.NULL_CHARACTER_TOKEN || t.type === d.WHITESPACE_CHARACTER_TOKEN;
    return (t.type === d.START_TAG_TOKEN && t.tagName !== l.MGLYPH && t.tagName !== l.MALIGNMARK || i) && this._isIntegrationPoint(n, P.MATHML) || (t.type === d.START_TAG_TOKEN || i) && this._isIntegrationPoint(n, P.HTML) ? !1 : t.type !== d.EOF_TOKEN;
  }
  _processToken(t) {
    Ps[this.insertionMode][t.type](this, t);
  }
  _processTokenInBodyMode(t) {
    Ps[tt][t.type](this, t);
  }
  _processTokenInForeignContent(t) {
    t.type === d.CHARACTER_TOKEN ? T9(this, t) : t.type === d.NULL_CHARACTER_TOKEN ? m9(this, t) : t.type === d.WHITESPACE_CHARACTER_TOKEN ? ye(this, t) : t.type === d.COMMENT_TOKEN ? pe(this, t) : t.type === d.START_TAG_TOKEN ? E9(this, t) : t.type === d.END_TAG_TOKEN && g9(this, t);
  }
  _processInputToken(t) {
    this._shouldProcessTokenInForeignContent(t) ? this._processTokenInForeignContent(t) : this._processToken(t), t.type === d.START_TAG_TOKEN && t.selfClosing && !t.ackSelfClosing && this._err(_e.nonVoidHtmlElementStartTagWithTrailingSolidus);
  }
  //Integration points
  _isIntegrationPoint(t, n) {
    const r = this.treeAdapter.getTagName(t), i = this.treeAdapter.getNamespaceURI(t), s = this.treeAdapter.getAttrList(t);
    return Je.isIntegrationPoint(r, i, s, n);
  }
  //Active formatting elements reconstruction
  _reconstructActiveFormattingElements() {
    const t = this.activeFormattingElements.length;
    if (t) {
      let n = t, r = null;
      do
        if (n--, r = this.activeFormattingElements.entries[n], r.type === ks.MARKER_ENTRY || this.openElements.contains(r.element)) {
          n++;
          break;
        }
      while (n > 0);
      for (let i = n; i < t; i++)
        r = this.activeFormattingElements.entries[i], this._insertElement(r.token, this.treeAdapter.getNamespaceURI(r.element)), r.element = this.openElements.current;
    }
  }
  //Close elements
  _closeTableCell() {
    this.openElements.generateImpliedEndTags(), this.openElements.popUntilTableCellPopped(), this.activeFormattingElements.clearToLastMarker(), this.insertionMode = ht;
  }
  _closePElement() {
    this.openElements.generateImpliedEndTagsWithExclusion(l.P), this.openElements.popUntilTagNamePopped(l.P);
  }
  //Insertion modes
  _resetInsertionMode() {
    for (let t = this.openElements.stackTop, n = !1; t >= 0; t--) {
      let r = this.openElements.items[t];
      t === 0 && (n = !0, this.fragmentContext && (r = this.fragmentContext));
      const i = this.treeAdapter.getTagName(r), s = Uc[i];
      if (s) {
        this.insertionMode = s;
        break;
      } else if (!n && (i === l.TD || i === l.TH)) {
        this.insertionMode = bn;
        break;
      } else if (!n && i === l.HEAD) {
        this.insertionMode = t1;
        break;
      } else if (i === l.SELECT) {
        this._resetInsertionModeForSelect(t);
        break;
      } else if (i === l.TEMPLATE) {
        this.insertionMode = this.currentTmplInsertionMode;
        break;
      } else if (i === l.HTML) {
        this.insertionMode = this.headElement ? On : In;
        break;
      } else if (n) {
        this.insertionMode = tt;
        break;
      }
    }
  }
  _resetInsertionModeForSelect(t) {
    if (t > 0)
      for (let n = t - 1; n > 0; n--) {
        const r = this.openElements.items[n], i = this.treeAdapter.getTagName(r);
        if (i === l.TEMPLATE)
          break;
        if (i === l.TABLE) {
          this.insertionMode = Gr;
          return;
        }
      }
    this.insertionMode = vr;
  }
  _pushTmplInsertionMode(t) {
    this.tmplInsertionModeStack.push(t), this.tmplInsertionModeStackTop++, this.currentTmplInsertionMode = t;
  }
  _popTmplInsertionMode() {
    this.tmplInsertionModeStack.pop(), this.tmplInsertionModeStackTop--, this.currentTmplInsertionMode = this.tmplInsertionModeStack[this.tmplInsertionModeStackTop];
  }
  //Foster parenting
  _isElementCausesFosterParenting(t) {
    const n = this.treeAdapter.getTagName(t);
    return n === l.TABLE || n === l.TBODY || n === l.TFOOT || n === l.THEAD || n === l.TR;
  }
  _shouldFosterParentOnInsertion() {
    return this.fosterParentingEnabled && this._isElementCausesFosterParenting(this.openElements.current);
  }
  _findFosterParentingLocation() {
    const t = {
      parent: null,
      beforeElement: null
    };
    for (let n = this.openElements.stackTop; n >= 0; n--) {
      const r = this.openElements.items[n], i = this.treeAdapter.getTagName(r), s = this.treeAdapter.getNamespaceURI(r);
      if (i === l.TEMPLATE && s === P.HTML) {
        t.parent = this.treeAdapter.getTemplateContent(r);
        break;
      } else if (i === l.TABLE) {
        t.parent = this.treeAdapter.getParentNode(r), t.parent ? t.beforeElement = r : t.parent = this.openElements.items[n - 1];
        break;
      }
    }
    return t.parent || (t.parent = this.openElements.items[0]), t;
  }
  _fosterParentElement(t) {
    const n = this._findFosterParentingLocation();
    n.beforeElement ? this.treeAdapter.insertBefore(n.parent, t, n.beforeElement) : this.treeAdapter.appendChild(n.parent, t);
  }
  _fosterParentText(t) {
    const n = this._findFosterParentingLocation();
    n.beforeElement ? this.treeAdapter.insertTextBefore(n.parent, t, n.beforeElement) : this.treeAdapter.insertText(n.parent, t);
  }
  //Special elements
  _isSpecialElement(t) {
    const n = this.treeAdapter.getTagName(t), r = this.treeAdapter.getNamespaceURI(t);
    return Ft.SPECIAL_ELEMENTS[r][n];
  }
}
var Kc = Gc;
function zc(e, t) {
  let n = e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);
  return n ? e.openElements.contains(n.element) ? e.openElements.hasInScope(t.tagName) || (n = null) : (e.activeFormattingElements.removeEntry(n), n = null) : Ye(e, t), n;
}
function $c(e, t) {
  let n = null;
  for (let r = e.openElements.stackTop; r >= 0; r--) {
    const i = e.openElements.items[r];
    if (i === t.element)
      break;
    e._isSpecialElement(i) && (n = i);
  }
  return n || (e.openElements.popUntilElementPopped(t.element), e.activeFormattingElements.removeEntry(t)), n;
}
function Yc(e, t, n) {
  let r = t, i = e.openElements.getCommonAncestor(t);
  for (let s = 0, o = i; o !== n; s++, o = i) {
    i = e.openElements.getCommonAncestor(o);
    const a = e.activeFormattingElements.getElementEntry(o), u = a && s >= Bc;
    !a || u ? (u && e.activeFormattingElements.removeEntry(a), e.openElements.remove(o)) : (o = jc(e, a), r === t && (e.activeFormattingElements.bookmark = a), e.treeAdapter.detachNode(r), e.treeAdapter.appendChild(o, r), r = o);
  }
  return r;
}
function jc(e, t) {
  const n = e.treeAdapter.getNamespaceURI(t.element), r = e.treeAdapter.createElement(t.token.tagName, n, t.token.attrs);
  return e.openElements.replace(t.element, r), t.element = r, r;
}
function Qc(e, t, n) {
  if (e._isElementCausesFosterParenting(t))
    e._fosterParentElement(n);
  else {
    const r = e.treeAdapter.getTagName(t), i = e.treeAdapter.getNamespaceURI(t);
    r === l.TEMPLATE && i === P.HTML && (t = e.treeAdapter.getTemplateContent(t)), e.treeAdapter.appendChild(t, n);
  }
}
function qc(e, t, n) {
  const r = e.treeAdapter.getNamespaceURI(n.element), i = n.token, s = e.treeAdapter.createElement(i.tagName, r, i.attrs);
  e._adoptNodes(t, s), e.treeAdapter.appendChild(t, s), e.activeFormattingElements.insertElementAfterBookmark(s, n.token), e.activeFormattingElements.removeEntry(n), e.openElements.remove(n.element), e.openElements.insertAfter(t, s);
}
function yt(e, t) {
  let n;
  for (let r = 0; r < Hc && (n = zc(e, t), !!n); r++) {
    const i = $c(e, n);
    if (!i)
      break;
    e.activeFormattingElements.bookmark = n;
    const s = Yc(e, i, n.element), o = e.openElements.getCommonAncestor(n.element);
    e.treeAdapter.detachNode(s), Qc(e, o, s), qc(e, i, n);
  }
}
function Q() {
}
function Z1(e) {
  e._err(_e.misplacedDoctype);
}
function pe(e, t) {
  e._appendCommentNode(t, e.openElements.currentTmplContent || e.openElements.current);
}
function Wc(e, t) {
  e._appendCommentNode(t, e.openElements.items[0]);
}
function Ds(e, t) {
  e._appendCommentNode(t, e.document);
}
function ye(e, t) {
  e._insertCharacters(t);
}
function E1(e) {
  e.stopped = !0;
}
function Vc(e, t) {
  e._setDocumentType(t);
  const n = t.forceQuirks ? Ft.DOCUMENT_MODE.QUIRKS : Ms.getDocumentMode(t);
  Ms.isConforming(t) || e._err(_e.nonConformingDoctype), e.treeAdapter.setDocumentMode(e.document, n), e.insertionMode = Ur;
}
function g1(e, t) {
  e._err(_e.missingDoctype, { beforeToken: !0 }), e.treeAdapter.setDocumentMode(e.document, Ft.DOCUMENT_MODE.QUIRKS), e.insertionMode = Ur, e._processToken(t);
}
function Xc(e, t) {
  t.tagName === l.HTML ? (e._insertElement(t, P.HTML), e.insertionMode = In) : y1(e, t);
}
function Zc(e, t) {
  const n = t.tagName;
  (n === l.HTML || n === l.HEAD || n === l.BODY || n === l.BR) && y1(e, t);
}
function y1(e, t) {
  e._insertFakeRootElement(), e.insertionMode = In, e._processToken(t);
}
function Jc(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.HEAD ? (e._insertElement(t, P.HTML), e.headElement = e.openElements.current, e.insertionMode = t1) : I1(e, t);
}
function e0(e, t) {
  const n = t.tagName;
  n === l.HEAD || n === l.BODY || n === l.HTML || n === l.BR ? I1(e, t) : e._err(_e.endTagWithoutMatchingOpenElement);
}
function I1(e, t) {
  e._insertFakeElement(l.HEAD), e.headElement = e.openElements.current, e.insertionMode = t1, e._processToken(t);
}
function Te(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.BASE || n === l.BASEFONT || n === l.BGSOUND || n === l.LINK || n === l.META ? (e._appendElement(t, P.HTML), t.ackSelfClosing = !0) : n === l.TITLE ? e._switchToTextParsing(t, d.MODE.RCDATA) : n === l.NOSCRIPT ? e.options.scriptingEnabled ? e._switchToTextParsing(t, d.MODE.RAWTEXT) : (e._insertElement(t, P.HTML), e.insertionMode = ca) : n === l.NOFRAMES || n === l.STYLE ? e._switchToTextParsing(t, d.MODE.RAWTEXT) : n === l.SCRIPT ? e._switchToTextParsing(t, d.MODE.SCRIPT_DATA) : n === l.TEMPLATE ? (e._insertTemplate(t, P.HTML), e.activeFormattingElements.insertMarker(), e.framesetOk = !1, e.insertionMode = En, e._pushTmplInsertionMode(En)) : n === l.HEAD ? e._err(_e.misplacedStartTagForHeadElement) : O1(e, t);
}
function Ht(e, t) {
  const n = t.tagName;
  n === l.HEAD ? (e.openElements.pop(), e.insertionMode = On) : n === l.BODY || n === l.BR || n === l.HTML ? O1(e, t) : n === l.TEMPLATE && e.openElements.tmplCount > 0 ? (e.openElements.generateImpliedEndTagsThoroughly(), e.openElements.currentTagName !== l.TEMPLATE && e._err(_e.closingOfElementWithOpenChildElements), e.openElements.popUntilTagNamePopped(l.TEMPLATE), e.activeFormattingElements.clearToLastMarker(), e._popTmplInsertionMode(), e._resetInsertionMode()) : e._err(_e.endTagWithoutMatchingOpenElement);
}
function O1(e, t) {
  e.openElements.pop(), e.insertionMode = On, e._processToken(t);
}
function t0(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.BASEFONT || n === l.BGSOUND || n === l.HEAD || n === l.LINK || n === l.META || n === l.NOFRAMES || n === l.STYLE ? Te(e, t) : n === l.NOSCRIPT ? e._err(_e.nestedNoscriptInHead) : x1(e, t);
}
function n0(e, t) {
  const n = t.tagName;
  n === l.NOSCRIPT ? (e.openElements.pop(), e.insertionMode = t1) : n === l.BR ? x1(e, t) : e._err(_e.endTagWithoutMatchingOpenElement);
}
function x1(e, t) {
  const n = t.type === d.EOF_TOKEN ? _e.openElementsLeftAfterEof : _e.disallowedContentInNoscriptInHead;
  e._err(n), e.openElements.pop(), e.insertionMode = t1, e._processToken(t);
}
function r0(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.BODY ? (e._insertElement(t, P.HTML), e.framesetOk = !1, e.insertionMode = tt) : n === l.FRAMESET ? (e._insertElement(t, P.HTML), e.insertionMode = Rn) : n === l.BASE || n === l.BASEFONT || n === l.BGSOUND || n === l.LINK || n === l.META || n === l.NOFRAMES || n === l.SCRIPT || n === l.STYLE || n === l.TEMPLATE || n === l.TITLE ? (e._err(_e.abandonedHeadElementChild), e.openElements.push(e.headElement), Te(e, t), e.openElements.remove(e.headElement)) : n === l.HEAD ? e._err(_e.misplacedStartTagForHeadElement) : b1(e, t);
}
function i0(e, t) {
  const n = t.tagName;
  n === l.BODY || n === l.HTML || n === l.BR ? b1(e, t) : n === l.TEMPLATE ? Ht(e, t) : e._err(_e.endTagWithoutMatchingOpenElement);
}
function b1(e, t) {
  e._insertFakeElement(l.BODY), e.insertionMode = tt, e._processToken(t);
}
function Lt(e, t) {
  e._reconstructActiveFormattingElements(), e._insertCharacters(t);
}
function J1(e, t) {
  e._reconstructActiveFormattingElements(), e._insertCharacters(t), e.framesetOk = !1;
}
function s0(e, t) {
  e.openElements.tmplCount === 0 && e.treeAdapter.adoptAttributes(e.openElements.items[0], t.attrs);
}
function o0(e, t) {
  const n = e.openElements.tryPeekProperlyNestedBodyElement();
  n && e.openElements.tmplCount === 0 && (e.framesetOk = !1, e.treeAdapter.adoptAttributes(n, t.attrs));
}
function a0(e, t) {
  const n = e.openElements.tryPeekProperlyNestedBodyElement();
  e.framesetOk && n && (e.treeAdapter.detachNode(n), e.openElements.popAllUpToHtmlElement(), e._insertElement(t, P.HTML), e.insertionMode = Rn);
}
function lt(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML);
}
function l0(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement();
  const n = e.openElements.currentTagName;
  (n === l.H1 || n === l.H2 || n === l.H3 || n === l.H4 || n === l.H5 || n === l.H6) && e.openElements.pop(), e._insertElement(t, P.HTML);
}
function ws(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML), e.skipNextNewLine = !0, e.framesetOk = !1;
}
function u0(e, t) {
  const n = e.openElements.tmplCount > 0;
  (!e.formElement || n) && (e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML), n || (e.formElement = e.openElements.current));
}
function c0(e, t) {
  e.framesetOk = !1;
  const n = t.tagName;
  for (let r = e.openElements.stackTop; r >= 0; r--) {
    const i = e.openElements.items[r], s = e.treeAdapter.getTagName(i);
    let o = null;
    if (n === l.LI && s === l.LI ? o = l.LI : (n === l.DD || n === l.DT) && (s === l.DD || s === l.DT) && (o = s), o) {
      e.openElements.generateImpliedEndTagsWithExclusion(o), e.openElements.popUntilTagNamePopped(o);
      break;
    }
    if (s !== l.ADDRESS && s !== l.DIV && s !== l.P && e._isSpecialElement(i))
      break;
  }
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML);
}
function f0(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML), e.tokenizer.state = d.MODE.PLAINTEXT;
}
function h0(e, t) {
  e.openElements.hasInScope(l.BUTTON) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(l.BUTTON)), e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML), e.framesetOk = !1;
}
function p0(e, t) {
  const n = e.activeFormattingElements.getElementEntryInScopeWithTagName(l.A);
  n && (yt(e, t), e.openElements.remove(n.element), e.activeFormattingElements.removeEntry(n)), e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML), e.activeFormattingElements.pushElement(e.openElements.current, t);
}
function Yt(e, t) {
  e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML), e.activeFormattingElements.pushElement(e.openElements.current, t);
}
function d0(e, t) {
  e._reconstructActiveFormattingElements(), e.openElements.hasInScope(l.NOBR) && (yt(e, t), e._reconstructActiveFormattingElements()), e._insertElement(t, P.HTML), e.activeFormattingElements.pushElement(e.openElements.current, t);
}
function Fs(e, t) {
  e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML), e.activeFormattingElements.insertMarker(), e.framesetOk = !1;
}
function m0(e, t) {
  e.treeAdapter.getDocumentMode(e.document) !== Ft.DOCUMENT_MODE.QUIRKS && e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML), e.framesetOk = !1, e.insertionMode = Ce;
}
function Wt(e, t) {
  e._reconstructActiveFormattingElements(), e._appendElement(t, P.HTML), e.framesetOk = !1, t.ackSelfClosing = !0;
}
function T0(e, t) {
  e._reconstructActiveFormattingElements(), e._appendElement(t, P.HTML);
  const n = d.getTokenAttr(t, aa.TYPE);
  (!n || n.toLowerCase() !== la) && (e.framesetOk = !1), t.ackSelfClosing = !0;
}
function Hs(e, t) {
  e._appendElement(t, P.HTML), t.ackSelfClosing = !0;
}
function E0(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._appendElement(t, P.HTML), e.framesetOk = !1, t.ackSelfClosing = !0;
}
function g0(e, t) {
  t.tagName = l.IMG, Wt(e, t);
}
function _0(e, t) {
  e._insertElement(t, P.HTML), e.skipNextNewLine = !0, e.tokenizer.state = d.MODE.RCDATA, e.originalInsertionMode = e.insertionMode, e.framesetOk = !1, e.insertionMode = Tn;
}
function A0(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._reconstructActiveFormattingElements(), e.framesetOk = !1, e._switchToTextParsing(t, d.MODE.RAWTEXT);
}
function C0(e, t) {
  e.framesetOk = !1, e._switchToTextParsing(t, d.MODE.RAWTEXT);
}
function Bs(e, t) {
  e._switchToTextParsing(t, d.MODE.RAWTEXT);
}
function N0(e, t) {
  e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML), e.framesetOk = !1, e.insertionMode === Ce || e.insertionMode === xn || e.insertionMode === Pe || e.insertionMode === ht || e.insertionMode === bn ? e.insertionMode = Gr : e.insertionMode = vr;
}
function Us(e, t) {
  e.openElements.currentTagName === l.OPTION && e.openElements.pop(), e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML);
}
function vs(e, t) {
  e.openElements.hasInScope(l.RUBY) && e.openElements.generateImpliedEndTags(), e._insertElement(t, P.HTML);
}
function S0(e, t) {
  e.openElements.hasInScope(l.RUBY) && e.openElements.generateImpliedEndTagsWithExclusion(l.RTC), e._insertElement(t, P.HTML);
}
function y0(e, t) {
  e.openElements.hasInButtonScope(l.P) && e._closePElement(), e._insertElement(t, P.HTML);
}
function I0(e, t) {
  e._reconstructActiveFormattingElements(), Je.adjustTokenMathMLAttrs(t), Je.adjustTokenXMLAttrs(t), t.selfClosing ? e._appendElement(t, P.MATHML) : e._insertElement(t, P.MATHML), t.ackSelfClosing = !0;
}
function O0(e, t) {
  e._reconstructActiveFormattingElements(), Je.adjustTokenSVGAttrs(t), Je.adjustTokenXMLAttrs(t), t.selfClosing ? e._appendElement(t, P.SVG) : e._insertElement(t, P.SVG), t.ackSelfClosing = !0;
}
function ke(e, t) {
  e._reconstructActiveFormattingElements(), e._insertElement(t, P.HTML);
}
function Oe(e, t) {
  const n = t.tagName;
  switch (n.length) {
    case 1:
      n === l.I || n === l.S || n === l.B || n === l.U ? Yt(e, t) : n === l.P ? lt(e, t) : n === l.A ? p0(e, t) : ke(e, t);
      break;
    case 2:
      n === l.DL || n === l.OL || n === l.UL ? lt(e, t) : n === l.H1 || n === l.H2 || n === l.H3 || n === l.H4 || n === l.H5 || n === l.H6 ? l0(e, t) : n === l.LI || n === l.DD || n === l.DT ? c0(e, t) : n === l.EM || n === l.TT ? Yt(e, t) : n === l.BR ? Wt(e, t) : n === l.HR ? E0(e, t) : n === l.RB ? vs(e, t) : n === l.RT || n === l.RP ? S0(e, t) : n !== l.TH && n !== l.TD && n !== l.TR && ke(e, t);
      break;
    case 3:
      n === l.DIV || n === l.DIR || n === l.NAV ? lt(e, t) : n === l.PRE ? ws(e, t) : n === l.BIG ? Yt(e, t) : n === l.IMG || n === l.WBR ? Wt(e, t) : n === l.XMP ? A0(e, t) : n === l.SVG ? O0(e, t) : n === l.RTC ? vs(e, t) : n !== l.COL && ke(e, t);
      break;
    case 4:
      n === l.HTML ? s0(e, t) : n === l.BASE || n === l.LINK || n === l.META ? Te(e, t) : n === l.BODY ? o0(e, t) : n === l.MAIN || n === l.MENU ? lt(e, t) : n === l.FORM ? u0(e, t) : n === l.CODE || n === l.FONT ? Yt(e, t) : n === l.NOBR ? d0(e, t) : n === l.AREA ? Wt(e, t) : n === l.MATH ? I0(e, t) : n === l.MENU ? y0(e, t) : n !== l.HEAD && ke(e, t);
      break;
    case 5:
      n === l.STYLE || n === l.TITLE ? Te(e, t) : n === l.ASIDE ? lt(e, t) : n === l.SMALL ? Yt(e, t) : n === l.TABLE ? m0(e, t) : n === l.EMBED ? Wt(e, t) : n === l.INPUT ? T0(e, t) : n === l.PARAM || n === l.TRACK ? Hs(e, t) : n === l.IMAGE ? g0(e, t) : n !== l.FRAME && n !== l.TBODY && n !== l.TFOOT && n !== l.THEAD && ke(e, t);
      break;
    case 6:
      n === l.SCRIPT ? Te(e, t) : n === l.CENTER || n === l.FIGURE || n === l.FOOTER || n === l.HEADER || n === l.HGROUP || n === l.DIALOG ? lt(e, t) : n === l.BUTTON ? h0(e, t) : n === l.STRIKE || n === l.STRONG ? Yt(e, t) : n === l.APPLET || n === l.OBJECT ? Fs(e, t) : n === l.KEYGEN ? Wt(e, t) : n === l.SOURCE ? Hs(e, t) : n === l.IFRAME ? C0(e, t) : n === l.SELECT ? N0(e, t) : n === l.OPTION ? Us(e, t) : ke(e, t);
      break;
    case 7:
      n === l.BGSOUND ? Te(e, t) : n === l.DETAILS || n === l.ADDRESS || n === l.ARTICLE || n === l.SECTION || n === l.SUMMARY ? lt(e, t) : n === l.LISTING ? ws(e, t) : n === l.MARQUEE ? Fs(e, t) : n === l.NOEMBED ? Bs(e, t) : n !== l.CAPTION && ke(e, t);
      break;
    case 8:
      n === l.BASEFONT ? Te(e, t) : n === l.FRAMESET ? a0(e, t) : n === l.FIELDSET ? lt(e, t) : n === l.TEXTAREA ? _0(e, t) : n === l.TEMPLATE ? Te(e, t) : n === l.NOSCRIPT ? e.options.scriptingEnabled ? Bs(e, t) : ke(e, t) : n === l.OPTGROUP ? Us(e, t) : n !== l.COLGROUP && ke(e, t);
      break;
    case 9:
      n === l.PLAINTEXT ? f0(e, t) : ke(e, t);
      break;
    case 10:
      n === l.BLOCKQUOTE || n === l.FIGCAPTION ? lt(e, t) : ke(e, t);
      break;
    default:
      ke(e, t);
  }
}
function x0(e) {
  e.openElements.hasInScope(l.BODY) && (e.insertionMode = Kr);
}
function b0(e, t) {
  e.openElements.hasInScope(l.BODY) && (e.insertionMode = Kr, e._processToken(t));
}
function At(e, t) {
  const n = t.tagName;
  e.openElements.hasInScope(n) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(n));
}
function R0(e) {
  const t = e.openElements.tmplCount > 0, n = e.formElement;
  t || (e.formElement = null), (n || t) && e.openElements.hasInScope(l.FORM) && (e.openElements.generateImpliedEndTags(), t ? e.openElements.popUntilTagNamePopped(l.FORM) : e.openElements.remove(n));
}
function k0(e) {
  e.openElements.hasInButtonScope(l.P) || e._insertFakeElement(l.P), e._closePElement();
}
function L0(e) {
  e.openElements.hasInListItemScope(l.LI) && (e.openElements.generateImpliedEndTagsWithExclusion(l.LI), e.openElements.popUntilTagNamePopped(l.LI));
}
function M0(e, t) {
  const n = t.tagName;
  e.openElements.hasInScope(n) && (e.openElements.generateImpliedEndTagsWithExclusion(n), e.openElements.popUntilTagNamePopped(n));
}
function P0(e) {
  e.openElements.hasNumberedHeaderInScope() && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilNumberedHeaderPopped());
}
function Gs(e, t) {
  const n = t.tagName;
  e.openElements.hasInScope(n) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(n), e.activeFormattingElements.clearToLastMarker());
}
function D0(e) {
  e._reconstructActiveFormattingElements(), e._insertFakeElement(l.BR), e.openElements.pop(), e.framesetOk = !1;
}
function Ye(e, t) {
  const n = t.tagName;
  for (let r = e.openElements.stackTop; r > 0; r--) {
    const i = e.openElements.items[r];
    if (e.treeAdapter.getTagName(i) === n) {
      e.openElements.generateImpliedEndTagsWithExclusion(n), e.openElements.popUntilElementPopped(i);
      break;
    }
    if (e._isSpecialElement(i))
      break;
  }
}
function zr(e, t) {
  const n = t.tagName;
  switch (n.length) {
    case 1:
      n === l.A || n === l.B || n === l.I || n === l.S || n === l.U ? yt(e, t) : n === l.P ? k0(e) : Ye(e, t);
      break;
    case 2:
      n === l.DL || n === l.UL || n === l.OL ? At(e, t) : n === l.LI ? L0(e) : n === l.DD || n === l.DT ? M0(e, t) : n === l.H1 || n === l.H2 || n === l.H3 || n === l.H4 || n === l.H5 || n === l.H6 ? P0(e) : n === l.BR ? D0(e) : n === l.EM || n === l.TT ? yt(e, t) : Ye(e, t);
      break;
    case 3:
      n === l.BIG ? yt(e, t) : n === l.DIR || n === l.DIV || n === l.NAV || n === l.PRE ? At(e, t) : Ye(e, t);
      break;
    case 4:
      n === l.BODY ? x0(e) : n === l.HTML ? b0(e, t) : n === l.FORM ? R0(e) : n === l.CODE || n === l.FONT || n === l.NOBR ? yt(e, t) : n === l.MAIN || n === l.MENU ? At(e, t) : Ye(e, t);
      break;
    case 5:
      n === l.ASIDE ? At(e, t) : n === l.SMALL ? yt(e, t) : Ye(e, t);
      break;
    case 6:
      n === l.CENTER || n === l.FIGURE || n === l.FOOTER || n === l.HEADER || n === l.HGROUP || n === l.DIALOG ? At(e, t) : n === l.APPLET || n === l.OBJECT ? Gs(e, t) : n === l.STRIKE || n === l.STRONG ? yt(e, t) : Ye(e, t);
      break;
    case 7:
      n === l.ADDRESS || n === l.ARTICLE || n === l.DETAILS || n === l.SECTION || n === l.SUMMARY || n === l.LISTING ? At(e, t) : n === l.MARQUEE ? Gs(e, t) : Ye(e, t);
      break;
    case 8:
      n === l.FIELDSET ? At(e, t) : n === l.TEMPLATE ? Ht(e, t) : Ye(e, t);
      break;
    case 10:
      n === l.BLOCKQUOTE || n === l.FIGCAPTION ? At(e, t) : Ye(e, t);
      break;
    default:
      Ye(e, t);
  }
}
function ut(e, t) {
  e.tmplInsertionModeStackTop > -1 ? Ea(e, t) : e.stopped = !0;
}
function w0(e, t) {
  t.tagName === l.SCRIPT && (e.pendingScript = e.openElements.current), e.openElements.pop(), e.insertionMode = e.originalInsertionMode;
}
function F0(e, t) {
  e._err(_e.eofInElementThatCanContainOnlyText), e.openElements.pop(), e.insertionMode = e.originalInsertionMode, e._processToken(t);
}
function ct(e, t) {
  const n = e.openElements.currentTagName;
  n === l.TABLE || n === l.TBODY || n === l.TFOOT || n === l.THEAD || n === l.TR ? (e.pendingCharacterTokens = [], e.hasNonWhitespacePendingCharacterToken = !1, e.originalInsertionMode = e.insertionMode, e.insertionMode = fa, e._processToken(t)) : Le(e, t);
}
function H0(e, t) {
  e.openElements.clearBackToTableContext(), e.activeFormattingElements.insertMarker(), e._insertElement(t, P.HTML), e.insertionMode = xn;
}
function B0(e, t) {
  e.openElements.clearBackToTableContext(), e._insertElement(t, P.HTML), e.insertionMode = D1;
}
function U0(e, t) {
  e.openElements.clearBackToTableContext(), e._insertFakeElement(l.COLGROUP), e.insertionMode = D1, e._processToken(t);
}
function v0(e, t) {
  e.openElements.clearBackToTableContext(), e._insertElement(t, P.HTML), e.insertionMode = Pe;
}
function G0(e, t) {
  e.openElements.clearBackToTableContext(), e._insertFakeElement(l.TBODY), e.insertionMode = Pe, e._processToken(t);
}
function K0(e, t) {
  e.openElements.hasInTableScope(l.TABLE) && (e.openElements.popUntilTagNamePopped(l.TABLE), e._resetInsertionMode(), e._processToken(t));
}
function z0(e, t) {
  const n = d.getTokenAttr(t, aa.TYPE);
  n && n.toLowerCase() === la ? e._appendElement(t, P.HTML) : Le(e, t), t.ackSelfClosing = !0;
}
function $0(e, t) {
  !e.formElement && e.openElements.tmplCount === 0 && (e._insertElement(t, P.HTML), e.formElement = e.openElements.current, e.openElements.pop());
}
function $r(e, t) {
  const n = t.tagName;
  switch (n.length) {
    case 2:
      n === l.TD || n === l.TH || n === l.TR ? G0(e, t) : Le(e, t);
      break;
    case 3:
      n === l.COL ? U0(e, t) : Le(e, t);
      break;
    case 4:
      n === l.FORM ? $0(e, t) : Le(e, t);
      break;
    case 5:
      n === l.TABLE ? K0(e, t) : n === l.STYLE ? Te(e, t) : n === l.TBODY || n === l.TFOOT || n === l.THEAD ? v0(e, t) : n === l.INPUT ? z0(e, t) : Le(e, t);
      break;
    case 6:
      n === l.SCRIPT ? Te(e, t) : Le(e, t);
      break;
    case 7:
      n === l.CAPTION ? H0(e, t) : Le(e, t);
      break;
    case 8:
      n === l.COLGROUP ? B0(e, t) : n === l.TEMPLATE ? Te(e, t) : Le(e, t);
      break;
    default:
      Le(e, t);
  }
}
function Yr(e, t) {
  const n = t.tagName;
  n === l.TABLE ? e.openElements.hasInTableScope(l.TABLE) && (e.openElements.popUntilTagNamePopped(l.TABLE), e._resetInsertionMode()) : n === l.TEMPLATE ? Ht(e, t) : n !== l.BODY && n !== l.CAPTION && n !== l.COL && n !== l.COLGROUP && n !== l.HTML && n !== l.TBODY && n !== l.TD && n !== l.TFOOT && n !== l.TH && n !== l.THEAD && n !== l.TR && Le(e, t);
}
function Le(e, t) {
  const n = e.fosterParentingEnabled;
  e.fosterParentingEnabled = !0, e._processTokenInBodyMode(t), e.fosterParentingEnabled = n;
}
function Y0(e, t) {
  e.pendingCharacterTokens.push(t);
}
function j0(e, t) {
  e.pendingCharacterTokens.push(t), e.hasNonWhitespacePendingCharacterToken = !0;
}
function _1(e, t) {
  let n = 0;
  if (e.hasNonWhitespacePendingCharacterToken)
    for (; n < e.pendingCharacterTokens.length; n++)
      Le(e, e.pendingCharacterTokens[n]);
  else
    for (; n < e.pendingCharacterTokens.length; n++)
      e._insertCharacters(e.pendingCharacterTokens[n]);
  e.insertionMode = e.originalInsertionMode, e._processToken(t);
}
function Q0(e, t) {
  const n = t.tagName;
  n === l.CAPTION || n === l.COL || n === l.COLGROUP || n === l.TBODY || n === l.TD || n === l.TFOOT || n === l.TH || n === l.THEAD || n === l.TR ? e.openElements.hasInTableScope(l.CAPTION) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(l.CAPTION), e.activeFormattingElements.clearToLastMarker(), e.insertionMode = Ce, e._processToken(t)) : Oe(e, t);
}
function q0(e, t) {
  const n = t.tagName;
  n === l.CAPTION || n === l.TABLE ? e.openElements.hasInTableScope(l.CAPTION) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(l.CAPTION), e.activeFormattingElements.clearToLastMarker(), e.insertionMode = Ce, n === l.TABLE && e._processToken(t)) : n !== l.BODY && n !== l.COL && n !== l.COLGROUP && n !== l.HTML && n !== l.TBODY && n !== l.TD && n !== l.TFOOT && n !== l.TH && n !== l.THEAD && n !== l.TR && zr(e, t);
}
function W0(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.COL ? (e._appendElement(t, P.HTML), t.ackSelfClosing = !0) : n === l.TEMPLATE ? Te(e, t) : gn(e, t);
}
function V0(e, t) {
  const n = t.tagName;
  n === l.COLGROUP ? e.openElements.currentTagName === l.COLGROUP && (e.openElements.pop(), e.insertionMode = Ce) : n === l.TEMPLATE ? Ht(e, t) : n !== l.COL && gn(e, t);
}
function gn(e, t) {
  e.openElements.currentTagName === l.COLGROUP && (e.openElements.pop(), e.insertionMode = Ce, e._processToken(t));
}
function X0(e, t) {
  const n = t.tagName;
  n === l.TR ? (e.openElements.clearBackToTableBodyContext(), e._insertElement(t, P.HTML), e.insertionMode = ht) : n === l.TH || n === l.TD ? (e.openElements.clearBackToTableBodyContext(), e._insertFakeElement(l.TR), e.insertionMode = ht, e._processToken(t)) : n === l.CAPTION || n === l.COL || n === l.COLGROUP || n === l.TBODY || n === l.TFOOT || n === l.THEAD ? e.openElements.hasTableBodyContextInTableScope() && (e.openElements.clearBackToTableBodyContext(), e.openElements.pop(), e.insertionMode = Ce, e._processToken(t)) : $r(e, t);
}
function Z0(e, t) {
  const n = t.tagName;
  n === l.TBODY || n === l.TFOOT || n === l.THEAD ? e.openElements.hasInTableScope(n) && (e.openElements.clearBackToTableBodyContext(), e.openElements.pop(), e.insertionMode = Ce) : n === l.TABLE ? e.openElements.hasTableBodyContextInTableScope() && (e.openElements.clearBackToTableBodyContext(), e.openElements.pop(), e.insertionMode = Ce, e._processToken(t)) : (n !== l.BODY && n !== l.CAPTION && n !== l.COL && n !== l.COLGROUP || n !== l.HTML && n !== l.TD && n !== l.TH && n !== l.TR) && Yr(e, t);
}
function J0(e, t) {
  const n = t.tagName;
  n === l.TH || n === l.TD ? (e.openElements.clearBackToTableRowContext(), e._insertElement(t, P.HTML), e.insertionMode = bn, e.activeFormattingElements.insertMarker()) : n === l.CAPTION || n === l.COL || n === l.COLGROUP || n === l.TBODY || n === l.TFOOT || n === l.THEAD || n === l.TR ? e.openElements.hasInTableScope(l.TR) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Pe, e._processToken(t)) : $r(e, t);
}
function e9(e, t) {
  const n = t.tagName;
  n === l.TR ? e.openElements.hasInTableScope(l.TR) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Pe) : n === l.TABLE ? e.openElements.hasInTableScope(l.TR) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Pe, e._processToken(t)) : n === l.TBODY || n === l.TFOOT || n === l.THEAD ? (e.openElements.hasInTableScope(n) || e.openElements.hasInTableScope(l.TR)) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Pe, e._processToken(t)) : (n !== l.BODY && n !== l.CAPTION && n !== l.COL && n !== l.COLGROUP || n !== l.HTML && n !== l.TD && n !== l.TH) && Yr(e, t);
}
function t9(e, t) {
  const n = t.tagName;
  n === l.CAPTION || n === l.COL || n === l.COLGROUP || n === l.TBODY || n === l.TD || n === l.TFOOT || n === l.TH || n === l.THEAD || n === l.TR ? (e.openElements.hasInTableScope(l.TD) || e.openElements.hasInTableScope(l.TH)) && (e._closeTableCell(), e._processToken(t)) : Oe(e, t);
}
function n9(e, t) {
  const n = t.tagName;
  n === l.TD || n === l.TH ? e.openElements.hasInTableScope(n) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(n), e.activeFormattingElements.clearToLastMarker(), e.insertionMode = ht) : n === l.TABLE || n === l.TBODY || n === l.TFOOT || n === l.THEAD || n === l.TR ? e.openElements.hasInTableScope(n) && (e._closeTableCell(), e._processToken(t)) : n !== l.BODY && n !== l.CAPTION && n !== l.COL && n !== l.COLGROUP && n !== l.HTML && zr(e, t);
}
function ma(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.OPTION ? (e.openElements.currentTagName === l.OPTION && e.openElements.pop(), e._insertElement(t, P.HTML)) : n === l.OPTGROUP ? (e.openElements.currentTagName === l.OPTION && e.openElements.pop(), e.openElements.currentTagName === l.OPTGROUP && e.openElements.pop(), e._insertElement(t, P.HTML)) : n === l.INPUT || n === l.KEYGEN || n === l.TEXTAREA || n === l.SELECT ? e.openElements.hasInSelectScope(l.SELECT) && (e.openElements.popUntilTagNamePopped(l.SELECT), e._resetInsertionMode(), n !== l.SELECT && e._processToken(t)) : (n === l.SCRIPT || n === l.TEMPLATE) && Te(e, t);
}
function Ta(e, t) {
  const n = t.tagName;
  if (n === l.OPTGROUP) {
    const r = e.openElements.items[e.openElements.stackTop - 1], i = r && e.treeAdapter.getTagName(r);
    e.openElements.currentTagName === l.OPTION && i === l.OPTGROUP && e.openElements.pop(), e.openElements.currentTagName === l.OPTGROUP && e.openElements.pop();
  } else
    n === l.OPTION ? e.openElements.currentTagName === l.OPTION && e.openElements.pop() : n === l.SELECT && e.openElements.hasInSelectScope(l.SELECT) ? (e.openElements.popUntilTagNamePopped(l.SELECT), e._resetInsertionMode()) : n === l.TEMPLATE && Ht(e, t);
}
function r9(e, t) {
  const n = t.tagName;
  n === l.CAPTION || n === l.TABLE || n === l.TBODY || n === l.TFOOT || n === l.THEAD || n === l.TR || n === l.TD || n === l.TH ? (e.openElements.popUntilTagNamePopped(l.SELECT), e._resetInsertionMode(), e._processToken(t)) : ma(e, t);
}
function i9(e, t) {
  const n = t.tagName;
  n === l.CAPTION || n === l.TABLE || n === l.TBODY || n === l.TFOOT || n === l.THEAD || n === l.TR || n === l.TD || n === l.TH ? e.openElements.hasInTableScope(n) && (e.openElements.popUntilTagNamePopped(l.SELECT), e._resetInsertionMode(), e._processToken(t)) : Ta(e, t);
}
function s9(e, t) {
  const n = t.tagName;
  if (n === l.BASE || n === l.BASEFONT || n === l.BGSOUND || n === l.LINK || n === l.META || n === l.NOFRAMES || n === l.SCRIPT || n === l.STYLE || n === l.TEMPLATE || n === l.TITLE)
    Te(e, t);
  else {
    const r = vc[n] || tt;
    e._popTmplInsertionMode(), e._pushTmplInsertionMode(r), e.insertionMode = r, e._processToken(t);
  }
}
function o9(e, t) {
  t.tagName === l.TEMPLATE && Ht(e, t);
}
function Ea(e, t) {
  e.openElements.tmplCount > 0 ? (e.openElements.popUntilTagNamePopped(l.TEMPLATE), e.activeFormattingElements.clearToLastMarker(), e._popTmplInsertionMode(), e._resetInsertionMode(), e._processToken(t)) : e.stopped = !0;
}
function a9(e, t) {
  t.tagName === l.HTML ? Oe(e, t) : _n(e, t);
}
function l9(e, t) {
  t.tagName === l.HTML ? e.fragmentContext || (e.insertionMode = pa) : _n(e, t);
}
function _n(e, t) {
  e.insertionMode = tt, e._processToken(t);
}
function u9(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.FRAMESET ? e._insertElement(t, P.HTML) : n === l.FRAME ? (e._appendElement(t, P.HTML), t.ackSelfClosing = !0) : n === l.NOFRAMES && Te(e, t);
}
function c9(e, t) {
  t.tagName === l.FRAMESET && !e.openElements.isRootHtmlElementCurrent() && (e.openElements.pop(), !e.fragmentContext && e.openElements.currentTagName !== l.FRAMESET && (e.insertionMode = ha));
}
function f9(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.NOFRAMES && Te(e, t);
}
function h9(e, t) {
  t.tagName === l.HTML && (e.insertionMode = da);
}
function p9(e, t) {
  t.tagName === l.HTML ? Oe(e, t) : un(e, t);
}
function un(e, t) {
  e.insertionMode = tt, e._processToken(t);
}
function d9(e, t) {
  const n = t.tagName;
  n === l.HTML ? Oe(e, t) : n === l.NOFRAMES && Te(e, t);
}
function m9(e, t) {
  t.chars = wc.REPLACEMENT_CHARACTER, e._insertCharacters(t);
}
function T9(e, t) {
  e._insertCharacters(t), e.framesetOk = !1;
}
function E9(e, t) {
  if (Je.causesExit(t) && !e.fragmentContext) {
    for (; e.treeAdapter.getNamespaceURI(e.openElements.current) !== P.HTML && !e._isIntegrationPoint(e.openElements.current); )
      e.openElements.pop();
    e._processToken(t);
  } else {
    const n = e._getAdjustedCurrentElement(), r = e.treeAdapter.getNamespaceURI(n);
    r === P.MATHML ? Je.adjustTokenMathMLAttrs(t) : r === P.SVG && (Je.adjustTokenSVGTagName(t), Je.adjustTokenSVGAttrs(t)), Je.adjustTokenXMLAttrs(t), t.selfClosing ? e._appendElement(t, r) : e._insertElement(t, r), t.ackSelfClosing = !0;
  }
}
function g9(e, t) {
  for (let n = e.openElements.stackTop; n > 0; n--) {
    const r = e.openElements.items[n];
    if (e.treeAdapter.getNamespaceURI(r) === P.HTML) {
      e._processToken(t);
      break;
    }
    if (e.treeAdapter.getTagName(r).toLowerCase() === t.tagName) {
      e.openElements.popUntilElementPopped(r);
      break;
    }
  }
}
const ga = Kc;
class w1 {
  /**
   * @constructor
   * @param {Properties} property
   * @param {Normal} normal
   * @param {string} [space]
   */
  constructor(t, n, r) {
    this.property = t, this.normal = n, r && (this.space = r);
  }
}
w1.prototype.property = {};
w1.prototype.normal = {};
w1.prototype.space = null;
function _a(e, t) {
  const n = {}, r = {};
  let i = -1;
  for (; ++i < e.length; )
    Object.assign(n, e[i].property), Object.assign(r, e[i].normal);
  return new w1(n, r, t);
}
function k1(e) {
  return e.toLowerCase();
}
class He {
  /**
   * @constructor
   * @param {string} property
   * @param {string} attribute
   */
  constructor(t, n) {
    this.property = t, this.attribute = n;
  }
}
He.prototype.space = null;
He.prototype.boolean = !1;
He.prototype.booleanish = !1;
He.prototype.overloadedBoolean = !1;
He.prototype.number = !1;
He.prototype.commaSeparated = !1;
He.prototype.spaceSeparated = !1;
He.prototype.commaOrSpaceSeparated = !1;
He.prototype.mustUseProperty = !1;
He.prototype.defined = !1;
let _9 = 0;
const $ = Bt(), le = Bt(), Aa = Bt(), I = Bt(), re = Bt(), Zt = Bt(), be = Bt();
function Bt() {
  return 2 ** ++_9;
}
const yr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: $,
  booleanish: le,
  commaOrSpaceSeparated: be,
  commaSeparated: Zt,
  number: I,
  overloadedBoolean: Aa,
  spaceSeparated: re
}, Symbol.toStringTag, { value: "Module" })), lr = Object.keys(yr);
class jr extends He {
  /**
   * @constructor
   * @param {string} property
   * @param {string} attribute
   * @param {number|null} [mask]
   * @param {string} [space]
   */
  constructor(t, n, r, i) {
    let s = -1;
    if (super(t, n), Ks(this, "space", i), typeof r == "number")
      for (; ++s < lr.length; ) {
        const o = lr[s];
        Ks(this, lr[s], (r & yr[o]) === yr[o]);
      }
  }
}
jr.prototype.defined = !0;
function Ks(e, t, n) {
  n && (e[t] = n);
}
const A9 = {}.hasOwnProperty;
function n1(e) {
  const t = {}, n = {};
  let r;
  for (r in e.properties)
    if (A9.call(e.properties, r)) {
      const i = e.properties[r], s = new jr(
        r,
        e.transform(e.attributes || {}, r),
        i,
        e.space
      );
      e.mustUseProperty && e.mustUseProperty.includes(r) && (s.mustUseProperty = !0), t[r] = s, n[k1(r)] = r, n[k1(s.attribute)] = r;
    }
  return new w1(t, n, e.space);
}
const Ca = n1({
  space: "xlink",
  transform(e, t) {
    return "xlink:" + t.slice(5).toLowerCase();
  },
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  }
}), Na = n1({
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  },
  properties: { xmlLang: null, xmlBase: null, xmlSpace: null }
});
function Sa(e, t) {
  return t in e ? e[t] : t;
}
function ya(e, t) {
  return Sa(e, t.toLowerCase());
}
const Ia = n1({
  space: "xmlns",
  attributes: { xmlnsxlink: "xmlns:xlink" },
  transform: ya,
  properties: { xmlns: null, xmlnsXLink: null }
}), Oa = n1({
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  },
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: le,
    ariaAutoComplete: null,
    ariaBusy: le,
    ariaChecked: le,
    ariaColCount: I,
    ariaColIndex: I,
    ariaColSpan: I,
    ariaControls: re,
    ariaCurrent: null,
    ariaDescribedBy: re,
    ariaDetails: null,
    ariaDisabled: le,
    ariaDropEffect: re,
    ariaErrorMessage: null,
    ariaExpanded: le,
    ariaFlowTo: re,
    ariaGrabbed: le,
    ariaHasPopup: null,
    ariaHidden: le,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: re,
    ariaLevel: I,
    ariaLive: null,
    ariaModal: le,
    ariaMultiLine: le,
    ariaMultiSelectable: le,
    ariaOrientation: null,
    ariaOwns: re,
    ariaPlaceholder: null,
    ariaPosInSet: I,
    ariaPressed: le,
    ariaReadOnly: le,
    ariaRelevant: null,
    ariaRequired: le,
    ariaRoleDescription: re,
    ariaRowCount: I,
    ariaRowIndex: I,
    ariaRowSpan: I,
    ariaSelected: le,
    ariaSetSize: I,
    ariaSort: null,
    ariaValueMax: I,
    ariaValueMin: I,
    ariaValueNow: I,
    ariaValueText: null,
    role: null
  }
}), C9 = n1({
  space: "html",
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  transform: ya,
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: Zt,
    acceptCharset: re,
    accessKey: re,
    action: null,
    allow: null,
    allowFullScreen: $,
    allowPaymentRequest: $,
    allowUserMedia: $,
    alt: null,
    as: null,
    async: $,
    autoCapitalize: null,
    autoComplete: re,
    autoFocus: $,
    autoPlay: $,
    capture: $,
    charSet: null,
    checked: $,
    cite: null,
    className: re,
    cols: I,
    colSpan: null,
    content: null,
    contentEditable: le,
    controls: $,
    controlsList: re,
    coords: I | Zt,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: $,
    defer: $,
    dir: null,
    dirName: null,
    disabled: $,
    download: Aa,
    draggable: le,
    encType: null,
    enterKeyHint: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: $,
    formTarget: null,
    headers: re,
    height: I,
    hidden: $,
    high: I,
    href: null,
    hrefLang: null,
    htmlFor: re,
    httpEquiv: re,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: $,
    itemId: null,
    itemProp: re,
    itemRef: re,
    itemScope: $,
    itemType: re,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: $,
    low: I,
    manifest: null,
    max: null,
    maxLength: I,
    media: null,
    method: null,
    min: null,
    minLength: I,
    multiple: $,
    muted: $,
    name: null,
    nonce: null,
    noModule: $,
    noValidate: $,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: $,
    optimum: I,
    pattern: null,
    ping: re,
    placeholder: null,
    playsInline: $,
    poster: null,
    preload: null,
    readOnly: $,
    referrerPolicy: null,
    rel: re,
    required: $,
    reversed: $,
    rows: I,
    rowSpan: I,
    sandbox: re,
    scope: null,
    scoped: $,
    seamless: $,
    selected: $,
    shape: null,
    size: I,
    sizes: null,
    slot: null,
    span: I,
    spellCheck: le,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: I,
    step: null,
    style: null,
    tabIndex: I,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: $,
    useMap: null,
    value: le,
    width: I,
    wrap: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: re,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: I,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: I,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: $,
    // Lists. Use CSS to reduce space between items instead
    declare: $,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: I,
    // `<img>` and `<object>`
    leftMargin: I,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: I,
    // `<body>`
    marginWidth: I,
    // `<body>`
    noResize: $,
    // `<frame>`
    noHref: $,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: $,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: $,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: I,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: le,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: I,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: I,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: $,
    disableRemotePlayback: $,
    prefix: null,
    property: null,
    results: I,
    security: null,
    unselectable: null
  }
}), N9 = n1({
  space: "svg",
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  transform: Sa,
  properties: {
    about: be,
    accentHeight: I,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: I,
    amplitude: I,
    arabicForm: null,
    ascent: I,
    attributeName: null,
    attributeType: null,
    azimuth: I,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: I,
    by: null,
    calcMode: null,
    capHeight: I,
    className: re,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: I,
    diffuseConstant: I,
    direction: null,
    display: null,
    dur: null,
    divisor: I,
    dominantBaseline: null,
    download: $,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: I,
    enableBackground: null,
    end: null,
    event: null,
    exponent: I,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: I,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: Zt,
    g2: Zt,
    glyphName: Zt,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: I,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: I,
    horizOriginX: I,
    horizOriginY: I,
    id: null,
    ideographic: I,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: I,
    k: I,
    k1: I,
    k2: I,
    k3: I,
    k4: I,
    kernelMatrix: be,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: I,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: I,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: I,
    overlineThickness: I,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: I,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: re,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: I,
    pointsAtY: I,
    pointsAtZ: I,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: be,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: be,
    rev: be,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: be,
    requiredFeatures: be,
    requiredFonts: be,
    requiredFormats: be,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: I,
    specularExponent: I,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: I,
    strikethroughThickness: I,
    string: null,
    stroke: null,
    strokeDashArray: be,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: I,
    strokeOpacity: I,
    strokeWidth: null,
    style: null,
    surfaceScale: I,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: be,
    tabIndex: I,
    tableValues: null,
    target: null,
    targetX: I,
    targetY: I,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: be,
    to: null,
    transform: null,
    u1: null,
    u2: null,
    underlinePosition: I,
    underlineThickness: I,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: I,
    values: null,
    vAlphabetic: I,
    vMathematical: I,
    vectorEffect: null,
    vHanging: I,
    vIdeographic: I,
    version: null,
    vertAdvY: I,
    vertOriginX: I,
    vertOriginY: I,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: I,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  }
}), S9 = /^data[-\w.:]+$/i, zs = /-[a-z]/g, y9 = /[A-Z]/g;
function F1(e, t) {
  const n = k1(t);
  let r = t, i = He;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && S9.test(t)) {
    if (t.charAt(4) === "-") {
      const s = t.slice(5).replace(zs, O9);
      r = "data" + s.charAt(0).toUpperCase() + s.slice(1);
    } else {
      const s = t.slice(4);
      if (!zs.test(s)) {
        let o = s.replace(y9, I9);
        o.charAt(0) !== "-" && (o = "-" + o), t = "data" + o;
      }
    }
    i = jr;
  }
  return new i(r, t);
}
function I9(e) {
  return "-" + e.toLowerCase();
}
function O9(e) {
  return e.charAt(1).toUpperCase();
}
const r1 = _a([Na, Ca, Ia, Oa, C9], "html"), dt = _a([Na, Ca, Ia, Oa, N9], "svg"), $s = /[#.]/g;
function x9(e, t) {
  const n = e || "", r = {};
  let i = 0, s, o;
  for (; i < n.length; ) {
    $s.lastIndex = i;
    const a = $s.exec(n), u = n.slice(i, a ? a.index : n.length);
    u && (s ? s === "#" ? r.id = u : Array.isArray(r.className) ? r.className.push(u) : r.className = [u] : o = u, i += u.length), a && (s = a[0], i++);
  }
  return {
    type: "element",
    // @ts-expect-error: fine.
    tagName: o || t || "div",
    properties: r,
    children: []
  };
}
function Ys(e) {
  const t = String(e || "").trim();
  return t ? t.split(/[ \t\n\r\f]+/g) : [];
}
function Qr(e) {
  return e.join(" ").trim();
}
function Ir(e) {
  const t = [], n = String(e || "");
  let r = n.indexOf(","), i = 0, s = !1;
  for (; !s; ) {
    r === -1 && (r = n.length, s = !0);
    const o = n.slice(i, r).trim();
    (o || !s) && t.push(o), i = r + 1, r = n.indexOf(",", i);
  }
  return t;
}
function qr(e, t) {
  const n = t || {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const b9 = /* @__PURE__ */ new Set(["menu", "submit", "reset", "button"]), Or = {}.hasOwnProperty;
function xa(e, t, n) {
  const r = n && M9(n);
  return (
    /**
     * @type {{
     *   (): Root
     *   (selector: null | undefined, ...children: Array<HChild>): Root
     *   (selector: string, properties?: HProperties, ...children: Array<HChild>): Element
     *   (selector: string, ...children: Array<HChild>): Element
     * }}
     */
    /**
     * Hyperscript compatible DSL for creating virtual hast trees.
     *
     * @param {string | null} [selector]
     * @param {HProperties | HChild} [properties]
     * @param {Array<HChild>} children
     * @returns {HResult}
     */
    function(s, o, ...a) {
      let u = -1, c;
      if (s == null)
        c = { type: "root", children: [] }, a.unshift(o);
      else if (c = x9(s, t), c.tagName = c.tagName.toLowerCase(), r && Or.call(r, c.tagName) && (c.tagName = r[c.tagName]), R9(o, c.tagName)) {
        let f;
        for (f in o)
          Or.call(o, f) && k9(e, c.properties, f, o[f]);
      } else
        a.unshift(o);
      for (; ++u < a.length; )
        xr(c.children, a[u]);
      return c.type === "element" && c.tagName === "template" && (c.content = { type: "root", children: c.children }, c.children = []), c;
    }
  );
}
function R9(e, t) {
  return e == null || typeof e != "object" || Array.isArray(e) ? !1 : t === "input" || !e.type || typeof e.type != "string" ? !0 : "children" in e && Array.isArray(e.children) ? !1 : t === "button" ? b9.has(e.type.toLowerCase()) : !("value" in e);
}
function k9(e, t, n, r) {
  const i = F1(e, n);
  let s = -1, o;
  if (r != null) {
    if (typeof r == "number") {
      if (Number.isNaN(r))
        return;
      o = r;
    } else
      typeof r == "boolean" ? o = r : typeof r == "string" ? i.spaceSeparated ? o = Ys(r) : i.commaSeparated ? o = Ir(r) : i.commaOrSpaceSeparated ? o = Ys(Ir(r).join(" ")) : o = js(i, i.property, r) : Array.isArray(r) ? o = r.concat() : o = i.property === "style" ? L9(r) : String(r);
    if (Array.isArray(o)) {
      const a = [];
      for (; ++s < o.length; )
        a[s] = js(i, i.property, o[s]);
      o = a;
    }
    i.property === "className" && Array.isArray(t.className) && (o = t.className.concat(o)), t[i.property] = o;
  }
}
function xr(e, t) {
  let n = -1;
  if (t != null)
    if (typeof t == "string" || typeof t == "number")
      e.push({ type: "text", value: String(t) });
    else if (Array.isArray(t))
      for (; ++n < t.length; )
        xr(e, t[n]);
    else if (typeof t == "object" && "type" in t)
      t.type === "root" ? xr(e, t.children) : e.push(t);
    else
      throw new Error("Expected node, nodes, or string, got `" + t + "`");
}
function js(e, t, n) {
  if (typeof n == "string") {
    if (e.number && n && !Number.isNaN(Number(n)))
      return Number(n);
    if ((e.boolean || e.overloadedBoolean) && (n === "" || k1(n) === k1(t)))
      return !0;
  }
  return n;
}
function L9(e) {
  const t = [];
  let n;
  for (n in e)
    Or.call(e, n) && t.push([n, e[n]].join(": "));
  return t.join("; ");
}
function M9(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    t[e[n].toLowerCase()] = e[n];
  return t;
}
const P9 = xa(r1, "div"), D9 = [
  "altGlyph",
  "altGlyphDef",
  "altGlyphItem",
  "animateColor",
  "animateMotion",
  "animateTransform",
  "clipPath",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "foreignObject",
  "glyphRef",
  "linearGradient",
  "radialGradient",
  "solidColor",
  "textArea",
  "textPath"
], w9 = xa(dt, "g", D9);
function F9(e) {
  const t = String(e), n = [], r = /\r?\n|\r/g;
  for (; r.test(t); )
    n.push(r.lastIndex);
  return n.push(t.length + 1), { toPoint: i, toOffset: s };
  function i(o) {
    let a = -1;
    if (typeof o == "number" && o > -1 && o < n[n.length - 1]) {
      for (; ++a < n.length; )
        if (n[a] > o)
          return {
            line: a + 1,
            column: o - (a > 0 ? n[a - 1] : 0) + 1,
            offset: o
          };
    }
    return { line: void 0, column: void 0, offset: void 0 };
  }
  function s(o) {
    const a = o && o.line, u = o && o.column;
    if (typeof a == "number" && typeof u == "number" && !Number.isNaN(a) && !Number.isNaN(u) && a - 1 in n) {
      const c = (n[a - 2] || 0) + u - 1 || 0;
      if (c > -1 && c < n[n.length - 1])
        return c;
    }
    return -1;
  }
}
const L1 = {
  html: "http://www.w3.org/1999/xhtml",
  mathml: "http://www.w3.org/1998/Math/MathML",
  svg: "http://www.w3.org/2000/svg",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
}, ba = {}.hasOwnProperty, H9 = Object.prototype;
function Ra(e, t) {
  const n = t || {};
  let r, i;
  return v9(n) ? (i = n, r = {}) : (i = n.file || void 0, r = n), Wr(
    {
      schema: r.space === "svg" ? dt : r1,
      file: i,
      verbose: r.verbose,
      location: !1
    },
    e
  );
}
function Wr(e, t) {
  let n;
  switch (t.nodeName) {
    case "#comment": {
      const r = (
        /** @type {P5Comment} */
        t
      );
      return n = { type: "comment", value: r.data }, cn(e, r, n), n;
    }
    case "#document":
    case "#document-fragment": {
      const r = (
        /** @type {P5Document | P5DocumentFragment} */
        t
      ), i = "mode" in r ? r.mode === "quirks" || r.mode === "limited-quirks" : !1;
      if (n = {
        type: "root",
        children: ka(e, t.childNodes),
        data: { quirksMode: i }
      }, e.file && e.location) {
        const s = String(e.file), o = F9(s), a = o.toPoint(0), u = o.toPoint(s.length);
        n.position = { start: a, end: u };
      }
      return n;
    }
    case "#documentType": {
      const r = (
        /** @type {P5DocumentType} */
        t
      );
      return n = { type: "doctype" }, cn(e, r, n), n;
    }
    case "#text": {
      const r = (
        /** @type {P5Text} */
        t
      );
      return n = { type: "text", value: r.value }, cn(e, r, n), n;
    }
    default:
      return n = B9(
        e,
        /** @type {P5Element} */
        t
      ), n;
  }
}
function ka(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    r[n] = Wr(e, t[n]);
  return r;
}
function B9(e, t) {
  const n = e.schema;
  e.schema = t.namespaceURI === L1.svg ? dt : r1;
  let r = -1;
  const i = {};
  for (; ++r < t.attrs.length; ) {
    const a = t.attrs[r], u = (a.prefix ? a.prefix + ":" : "") + a.name;
    ba.call(H9, u) || (i[u] = a.value);
  }
  const o = (e.schema.space === "svg" ? w9 : P9)(t.tagName, i, ka(e, t.childNodes));
  if (cn(e, t, o), o.tagName === "template") {
    const a = (
      /** @type {P5Template} */
      t
    ), u = a.sourceCodeLocation, c = u && u.startTag && Vt(u.startTag), f = u && u.endTag && Vt(u.endTag), h = Wr(e, a.content);
    c && f && e.file && (h.position = { start: c.end, end: f.start }), o.content = h;
  }
  return e.schema = n, o;
}
function cn(e, t, n) {
  if ("sourceCodeLocation" in t && t.sourceCodeLocation && e.file) {
    const r = U9(e, n, t.sourceCodeLocation);
    r && (e.location = !0, n.position = r);
  }
}
function U9(e, t, n) {
  const r = Vt(n);
  if (t.type === "element") {
    const i = t.children[t.children.length - 1];
    if (r && !n.endTag && i && i.position && i.position.end && (r.end = Object.assign({}, i.position.end)), e.verbose) {
      const s = {};
      let o;
      if (n.attrs)
        for (o in n.attrs)
          ba.call(n.attrs, o) && (s[F1(e.schema, o).property] = Vt(
            n.attrs[o]
          ));
      t.data = {
        position: {
          // @ts-expect-error: assume not `undefined`.
          opening: Vt(n.startTag),
          closing: n.endTag ? Vt(n.endTag) : null,
          properties: s
        }
      };
    }
  }
  return r;
}
function Vt(e) {
  const t = Qs({
    line: e.startLine,
    column: e.startCol,
    offset: e.startOffset
  }), n = Qs({
    line: e.endLine,
    column: e.endCol,
    offset: e.endOffset
  });
  return t || n ? { start: t, end: n } : void 0;
}
function Qs(e) {
  return e.line && e.column ? e : void 0;
}
function v9(e) {
  return "messages" in e;
}
const G9 = {
  abandonedHeadElementChild: {
    reason: "Unexpected metadata element after head",
    description: "Unexpected element after head. Expected the element before `</head>`",
    url: !1
  },
  abruptClosingOfEmptyComment: {
    reason: "Unexpected abruptly closed empty comment",
    description: "Unexpected `>` or `->`. Expected `-->` to close comments"
  },
  abruptDoctypePublicIdentifier: {
    reason: "Unexpected abruptly closed public identifier",
    description: "Unexpected `>`. Expected a closing `\"` or `'` after the public identifier"
  },
  abruptDoctypeSystemIdentifier: {
    reason: "Unexpected abruptly closed system identifier",
    description: "Unexpected `>`. Expected a closing `\"` or `'` after the identifier identifier"
  },
  absenceOfDigitsInNumericCharacterReference: {
    reason: "Unexpected non-digit at start of numeric character reference",
    description: "Unexpected `%c`. Expected `[0-9]` for decimal references or `[0-9a-fA-F]` for hexadecimal references"
  },
  cdataInHtmlContent: {
    reason: "Unexpected CDATA section in HTML",
    description: "Unexpected `<![CDATA[` in HTML. Remove it, use a comment, or encode special characters instead"
  },
  characterReferenceOutsideUnicodeRange: {
    reason: "Unexpected too big numeric character reference",
    description: "Unexpectedly high character reference. Expected character references to be at most hexadecimal 10ffff (or decimal 1114111)"
  },
  closingOfElementWithOpenChildElements: {
    reason: "Unexpected closing tag with open child elements",
    description: "Unexpectedly closing tag. Expected other tags to be closed first",
    url: !1
  },
  controlCharacterInInputStream: {
    reason: "Unexpected control character",
    description: "Unexpected control character `%x`. Expected a non-control code point, 0x00, or ASCII whitespace"
  },
  controlCharacterReference: {
    reason: "Unexpected control character reference",
    description: "Unexpectedly control character in reference. Expected a non-control code point, 0x00, or ASCII whitespace"
  },
  disallowedContentInNoscriptInHead: {
    reason: "Disallowed content inside `<noscript>` in `<head>`",
    description: "Unexpected text character `%c`. Only use text in `<noscript>`s in `<body>`",
    url: !1
  },
  duplicateAttribute: {
    reason: "Unexpected duplicate attribute",
    description: "Unexpectedly double attribute. Expected attributes to occur only once"
  },
  endTagWithAttributes: {
    reason: "Unexpected attribute on closing tag",
    description: "Unexpected attribute. Expected `>` instead"
  },
  endTagWithTrailingSolidus: {
    reason: "Unexpected slash at end of closing tag",
    description: "Unexpected `%c-1`. Expected `>` instead"
  },
  endTagWithoutMatchingOpenElement: {
    reason: "Unexpected unopened end tag",
    description: "Unexpected end tag. Expected no end tag or another end tag",
    url: !1
  },
  eofBeforeTagName: {
    reason: "Unexpected end of file",
    description: "Unexpected end of file. Expected tag name instead"
  },
  eofInCdata: {
    reason: "Unexpected end of file in CDATA",
    description: "Unexpected end of file. Expected `]]>` to close the CDATA"
  },
  eofInComment: {
    reason: "Unexpected end of file in comment",
    description: "Unexpected end of file. Expected `-->` to close the comment"
  },
  eofInDoctype: {
    reason: "Unexpected end of file in doctype",
    description: "Unexpected end of file. Expected a valid doctype (such as `<!doctype html>`)"
  },
  eofInElementThatCanContainOnlyText: {
    reason: "Unexpected end of file in element that can only contain text",
    description: "Unexpected end of file. Expected text or a closing tag",
    url: !1
  },
  eofInScriptHtmlCommentLikeText: {
    reason: "Unexpected end of file in comment inside script",
    description: "Unexpected end of file. Expected `-->` to close the comment"
  },
  eofInTag: {
    reason: "Unexpected end of file in tag",
    description: "Unexpected end of file. Expected `>` to close the tag"
  },
  incorrectlyClosedComment: {
    reason: "Incorrectly closed comment",
    description: "Unexpected `%c-1`. Expected `-->` to close the comment"
  },
  incorrectlyOpenedComment: {
    reason: "Incorrectly opened comment",
    description: "Unexpected `%c`. Expected `<!--` to open the comment"
  },
  invalidCharacterSequenceAfterDoctypeName: {
    reason: "Invalid sequence after doctype name",
    description: "Unexpected sequence at `%c`. Expected `public` or `system`"
  },
  invalidFirstCharacterOfTagName: {
    reason: "Invalid first character in tag name",
    description: "Unexpected `%c`. Expected an ASCII letter instead"
  },
  misplacedDoctype: {
    reason: "Misplaced doctype",
    description: "Unexpected doctype. Expected doctype before head",
    url: !1
  },
  misplacedStartTagForHeadElement: {
    reason: "Misplaced `<head>` start tag",
    description: "Unexpected start tag `<head>`. Expected `<head>` directly after doctype",
    url: !1
  },
  missingAttributeValue: {
    reason: "Missing attribute value",
    description: "Unexpected `%c-1`. Expected an attribute value or no `%c-1` instead"
  },
  missingDoctype: {
    reason: "Missing doctype before other content",
    description: "Expected a `<!doctype html>` before anything else",
    url: !1
  },
  missingDoctypeName: {
    reason: "Missing doctype name",
    description: "Unexpected doctype end at `%c`. Expected `html` instead"
  },
  missingDoctypePublicIdentifier: {
    reason: "Missing public identifier in doctype",
    description: "Unexpected `%c`. Expected identifier for `public` instead"
  },
  missingDoctypeSystemIdentifier: {
    reason: "Missing system identifier in doctype",
    description: 'Unexpected `%c`. Expected identifier for `system` instead (suggested: `"about:legacy-compat"`)'
  },
  missingEndTagName: {
    reason: "Missing name in end tag",
    description: "Unexpected `%c`. Expected an ASCII letter instead"
  },
  missingQuoteBeforeDoctypePublicIdentifier: {
    reason: "Missing quote before public identifier in doctype",
    description: "Unexpected `%c`. Expected `\"` or `'` instead"
  },
  missingQuoteBeforeDoctypeSystemIdentifier: {
    reason: "Missing quote before system identifier in doctype",
    description: "Unexpected `%c`. Expected `\"` or `'` instead"
  },
  missingSemicolonAfterCharacterReference: {
    reason: "Missing semicolon after character reference",
    description: "Unexpected `%c`. Expected `;` instead"
  },
  missingWhitespaceAfterDoctypePublicKeyword: {
    reason: "Missing whitespace after public identifier in doctype",
    description: "Unexpected `%c`. Expected ASCII whitespace instead"
  },
  missingWhitespaceAfterDoctypeSystemKeyword: {
    reason: "Missing whitespace after system identifier in doctype",
    description: "Unexpected `%c`. Expected ASCII whitespace instead"
  },
  missingWhitespaceBeforeDoctypeName: {
    reason: "Missing whitespace before doctype name",
    description: "Unexpected `%c`. Expected ASCII whitespace instead"
  },
  missingWhitespaceBetweenAttributes: {
    reason: "Missing whitespace between attributes",
    description: "Unexpected `%c`. Expected ASCII whitespace instead"
  },
  missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers: {
    reason: "Missing whitespace between public and system identifiers in doctype",
    description: "Unexpected `%c`. Expected ASCII whitespace instead"
  },
  nestedComment: {
    reason: "Unexpected nested comment",
    description: "Unexpected `<!--`. Expected `-->`"
  },
  nestedNoscriptInHead: {
    reason: "Unexpected nested `<noscript>` in `<head>`",
    description: "Unexpected `<noscript>`. Expected a closing tag or a meta element",
    url: !1
  },
  nonConformingDoctype: {
    reason: "Unexpected non-conforming doctype declaration",
    description: 'Expected `<!doctype html>` or `<!doctype html system "about:legacy-compat">`',
    url: !1
  },
  nonVoidHtmlElementStartTagWithTrailingSolidus: {
    reason: "Unexpected trailing slash on start tag of non-void element",
    description: "Unexpected `/`. Expected `>` instead"
  },
  noncharacterCharacterReference: {
    reason: "Unexpected noncharacter code point referenced by character reference",
    description: "Unexpected code point. Do not use noncharacters in HTML"
  },
  noncharacterInInputStream: {
    reason: "Unexpected noncharacter character",
    description: "Unexpected code point `%x`. Do not use noncharacters in HTML"
  },
  nullCharacterReference: {
    reason: "Unexpected NULL character referenced by character reference",
    description: "Unexpected code point. Do not use NULL characters in HTML"
  },
  openElementsLeftAfterEof: {
    reason: "Unexpected end of file",
    description: "Unexpected end of file. Expected closing tag instead",
    url: !1
  },
  surrogateCharacterReference: {
    reason: "Unexpected surrogate character referenced by character reference",
    description: "Unexpected code point. Do not use lone surrogate characters in HTML"
  },
  surrogateInInputStream: {
    reason: "Unexpected surrogate character",
    description: "Unexpected code point `%x`. Do not use lone surrogate characters in HTML"
  },
  unexpectedCharacterAfterDoctypeSystemIdentifier: {
    reason: "Invalid character after system identifier in doctype",
    description: "Unexpected character at `%c`. Expected `>`"
  },
  unexpectedCharacterInAttributeName: {
    reason: "Unexpected character in attribute name",
    description: "Unexpected `%c`. Expected whitespace, `/`, `>`, `=`, or probably an ASCII letter"
  },
  unexpectedCharacterInUnquotedAttributeValue: {
    reason: "Unexpected character in unquoted attribute value",
    description: "Unexpected `%c`. Quote the attribute value to include it"
  },
  unexpectedEqualsSignBeforeAttributeName: {
    reason: "Unexpected equals sign before attribute name",
    description: "Unexpected `%c`. Add an attribute name before it"
  },
  unexpectedNullCharacter: {
    reason: "Unexpected NULL character",
    description: "Unexpected code point `%x`. Do not use NULL characters in HTML"
  },
  unexpectedQuestionMarkInsteadOfTagName: {
    reason: "Unexpected question mark instead of tag name",
    description: "Unexpected `%c`. Expected an ASCII letter instead"
  },
  unexpectedSolidusInTag: {
    reason: "Unexpected slash in tag",
    description: "Unexpected `%c-1`. Expected it followed by `>` or in a quoted attribute value"
  },
  unknownNamedCharacterReference: {
    reason: "Unexpected unknown named character reference",
    description: "Unexpected character reference. Expected known named character references"
  }
}, K9 = "https://html.spec.whatwg.org/multipage/parsing.html#parse-error-", z9 = { 2: !0, 1: !1, 0: null };
function $9(e) {
  const t = (
    /** @type {Options} */
    this.data("settings")
  ), n = Object.assign({}, t, e);
  Object.assign(this, { Parser: r });
  function r(i, s) {
    const o = n.fragment ? "parseFragment" : "parse", a = n.emitParseErrors ? c : null, u = new ga({
      sourceCodeLocationInfo: !0,
      onParseError: a,
      scriptingEnabled: !1
    });
    return Ra(u[o](i), {
      space: n.space,
      file: s,
      verbose: n.verbose
    });
    function c(f) {
      const h = f.code, E = Y9(h), g = n[E], A = g ?? !0, _ = typeof A == "number" ? A : A ? 1 : 0, b = {
        line: f.startLine,
        column: f.startCol,
        offset: f.startOffset
      }, N = {
        line: f.endLine,
        column: f.endCol,
        offset: f.endOffset
      };
      if (_) {
        const L = G9[E] || { reason: "", description: "", url: "" }, B = s.message(D(L.reason), { start: b, end: N });
        B.source = "parse-error", B.ruleId = h, B.fatal = z9[_], B.note = D(L.description), B.url = "url" in L && L.url === !1 ? null : K9 + h;
      }
      function D(L) {
        return L.replace(/%c(?:-(\d+))?/g, (B, U) => {
          const C = U ? -Number.parseInt(U, 10) : 0, x = i.charAt(f.startOffset + C);
          return x === "`" ? "` ` `" : x;
        }).replace(
          /%x/g,
          () => "0x" + i.charCodeAt(f.startOffset).toString(16).toUpperCase()
        );
      }
    }
  }
}
function Y9(e) {
  return e.replace(/-[a-z]/g, (t) => t.charAt(1).toUpperCase());
}
const It = (
  /**
   * @type {(
   *   (() => false) &
   *   (<T extends Element = Element>(node: unknown, test?: PredicateTest<T>, index?: number, parent?: Parent, context?: unknown) => node is T) &
   *   ((node: unknown, test: Test, index?: number, parent?: Parent, context?: unknown) => boolean)
   * )}
   */
  /**
   * @param {unknown} [node]
   * @param {Test | undefined} [test]
   * @param {number | null | undefined} [index]
   * @param {Parent | null | undefined} [parent]
   * @param {unknown} [context]
   * @returns {boolean}
   */
  // eslint-disable-next-line max-params
  function(e, t, n, r, i) {
    const s = te(t);
    if (n != null && (typeof n != "number" || n < 0 || n === Number.POSITIVE_INFINITY))
      throw new Error("Expected positive finite index for child node");
    if (r != null && (!r.type || !r.children))
      throw new Error("Expected parent node");
    if (!e || !e.type || typeof e.type != "string")
      return !1;
    if (r == null != (n == null))
      throw new Error("Expected both parent and index");
    return s.call(i, e, n, r);
  }
), te = (
  /**
   * @type {(
   *   (<T extends Element>(test: T['tagName'] | TestFunctionPredicate<T>) => AssertPredicate<T>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  /**
   * @param {Test | null | undefined} [test]
   * @returns {AssertAnything}
   */
  function(e) {
    if (e == null)
      return Vr;
    if (typeof e == "string")
      return Q9(e);
    if (typeof e == "object")
      return j9(e);
    if (typeof e == "function")
      return La(e);
    throw new Error("Expected function, string, or array as test");
  }
);
function j9(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = te(e[n]);
  return La(r);
  function r(...i) {
    let s = -1;
    for (; ++s < t.length; )
      if (t[s].call(this, ...i))
        return !0;
    return !1;
  }
}
function Q9(e) {
  return t;
  function t(n) {
    return Vr(n) && n.tagName === e;
  }
}
function La(e) {
  return t;
  function t(n, ...r) {
    return Vr(n) && Boolean(e.call(this, n, ...r));
  }
}
function Vr(e) {
  return Boolean(
    e && typeof e == "object" && // @ts-expect-error Looks like a node.
    e.type === "element" && // @ts-expect-error Looks like an element.
    typeof e.tagName == "string"
  );
}
const Xr = te([
  "audio",
  "canvas",
  "embed",
  "iframe",
  "img",
  "math",
  "object",
  "picture",
  "svg",
  "video"
]), i1 = (
  /**
   * @type {(
   *   (<Kind extends Node>(test: PredicateTest<Kind>) => AssertPredicate<Kind>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {AssertAnything}
   */
  function(e) {
    if (e == null)
      return X9;
    if (typeof e == "string")
      return V9(e);
    if (typeof e == "object")
      return Array.isArray(e) ? q9(e) : W9(e);
    if (typeof e == "function")
      return kn(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function q9(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = i1(e[n]);
  return kn(r);
  function r(...i) {
    let s = -1;
    for (; ++s < t.length; )
      if (t[s].call(this, ...i))
        return !0;
    return !1;
  }
}
function W9(e) {
  return kn(t);
  function t(n) {
    let r;
    for (r in e)
      if (n[r] !== e[r])
        return !1;
    return !0;
  }
}
function V9(e) {
  return kn(t);
  function t(n) {
    return n && n.type === e;
  }
}
function kn(e) {
  return t;
  function t(n, ...r) {
    return Boolean(
      n && typeof n == "object" && "type" in n && // @ts-expect-error: fine.
      Boolean(e.call(this, n, ...r))
    );
  }
}
function X9() {
  return !0;
}
function Ot(e) {
  const t = (
    // @ts-expect-error looks like a node.
    e && typeof e == "object" && e.type === "text" ? (
      // @ts-expect-error looks like a text.
      e.value || ""
    ) : e
  );
  return typeof t == "string" && t.replace(/[ \t\n\f\r]/g, "") === "";
}
const Z9 = [
  "address",
  // Flow content.
  "article",
  // Sections and headings.
  "aside",
  // Sections and headings.
  "blockquote",
  // Flow content.
  "body",
  // Page.
  "br",
  // Contribute whitespace intrinsically.
  "caption",
  // Similar to block.
  "center",
  // Flow content, legacy.
  "col",
  // Similar to block.
  "colgroup",
  // Similar to block.
  "dd",
  // Lists.
  "dialog",
  // Flow content.
  "dir",
  // Lists, legacy.
  "div",
  // Flow content.
  "dl",
  // Lists.
  "dt",
  // Lists.
  "figcaption",
  // Flow content.
  "figure",
  // Flow content.
  "footer",
  // Flow content.
  "form",
  // Flow content.
  "h1",
  // Sections and headings.
  "h2",
  // Sections and headings.
  "h3",
  // Sections and headings.
  "h4",
  // Sections and headings.
  "h5",
  // Sections and headings.
  "h6",
  // Sections and headings.
  "head",
  // Page.
  "header",
  // Flow content.
  "hgroup",
  // Sections and headings.
  "hr",
  // Flow content.
  "html",
  // Page.
  "legend",
  // Flow content.
  "li",
  // Block-like.
  "li",
  // Similar to block.
  "listing",
  // Flow content, legacy
  "main",
  // Flow content.
  "menu",
  // Lists.
  "nav",
  // Sections and headings.
  "ol",
  // Lists.
  "optgroup",
  // Similar to block.
  "option",
  // Similar to block.
  "p",
  // Flow content.
  "plaintext",
  // Flow content, legacy
  "pre",
  // Flow content.
  "section",
  // Sections and headings.
  "summary",
  // Similar to block.
  "table",
  // Similar to block.
  "tbody",
  // Similar to block.
  "td",
  // Block-like.
  "td",
  // Similar to block.
  "tfoot",
  // Similar to block.
  "th",
  // Block-like.
  "th",
  // Similar to block.
  "thead",
  // Similar to block.
  "tr",
  // Similar to block.
  "ul",
  // Lists.
  "wbr",
  // Contribute whitespace intrinsically.
  "xmp"
  // Flow content, legacy
], J9 = [
  // Form.
  "button",
  "input",
  "select",
  "textarea"
], e5 = [
  "area",
  "base",
  "basefont",
  "dialog",
  "datalist",
  "head",
  "link",
  "meta",
  "noembed",
  "noframes",
  "param",
  "rp",
  "script",
  "source",
  "style",
  "template",
  "track",
  "title"
], Zr = i1(["doctype", "comment"]);
function Ma(e = {}) {
  const t = a5(
    e.newlines ? s5 : o5
  );
  return (n) => {
    Pa(n, { collapse: t, whitespace: "normal" });
  };
}
function Pa(e, t) {
  if ("children" in e) {
    const n = Object.assign({}, t);
    return (e.type === "root" || Fa(e)) && (n.before = !0, n.after = !0), n.whitespace = l5(e, t), n5(e, n);
  }
  if (e.type === "text") {
    if (t.whitespace === "normal")
      return t5(e, t);
    t.whitespace === "nowrap" && (e.value = t.collapse(e.value));
  }
  return { remove: !1, ignore: Zr(e), stripAtStart: !1 };
}
function t5(e, t) {
  const n = t.collapse(e.value), r = { remove: !1, ignore: !1, stripAtStart: !1 };
  let i = 0, s = n.length;
  return t.before && qs(n.charAt(0)) && i++, i !== s && qs(n.charAt(s - 1)) && (t.after ? s-- : r.stripAtStart = !0), i === s ? r.remove = !0 : e.value = n.slice(i, s), r;
}
function n5(e, t) {
  let n = t.before;
  const r = t.after, i = e.children;
  let s = i.length, o = -1;
  for (; ++o < s; ) {
    const a = Pa(
      i[o],
      Object.assign({}, t, {
        before: n,
        after: Da(i, o, r)
      })
    );
    a.remove ? (i.splice(o, 1), o--, s--) : a.ignore || (n = a.stripAtStart), wa(i[o]) && (n = !1);
  }
  return { remove: !1, ignore: !1, stripAtStart: Boolean(n || r) };
}
function Da(e, t, n) {
  for (; ++t < e.length; ) {
    const r = e[t];
    let i = r5(r);
    if (i === void 0 && "children" in r && !i5(r) && (i = Da(r.children, -1)), typeof i == "boolean")
      return i;
  }
  return n;
}
function r5(e) {
  if (e.type === "element") {
    if (wa(e))
      return !1;
    if (Fa(e))
      return !0;
  } else if (e.type === "text") {
    if (!Ot(e))
      return !1;
  } else if (!Zr(e))
    return !1;
}
function wa(e) {
  return Xr(e) || It(e, J9);
}
function Fa(e) {
  return It(e, Z9);
}
function i5(e) {
  return Boolean(
    "properties" in e && e.properties && e.properties.hidden
  ) || Zr(e) || It(e, e5);
}
function qs(e) {
  return e === " " || e === `
`;
}
function s5(e) {
  const t = /\r?\n|\r/.exec(e);
  return t ? t[0] : " ";
}
function o5() {
  return " ";
}
function a5(e) {
  return t;
  function t(n) {
    return String(n).replace(/[\t\n\v\f\r ]+/g, e);
  }
}
function l5(e, t) {
  if ("tagName" in e && e.properties)
    switch (e.tagName) {
      case "listing":
      case "plaintext":
      case "script":
      case "style":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return e.properties.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return e.properties.noWrap ? "nowrap" : t.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  return t.whitespace;
}
const u5 = !0, M1 = !1, Ln = "skip", Ha = (
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {Test} test
   * @param {Visitor<Node>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {void}
   */
  function(e, t, n, r) {
    typeof t == "function" && typeof n != "function" && (r = n, n = t, t = null);
    const i = i1(t), s = r ? -1 : 1;
    o(e, void 0, [])();
    function o(a, u, c) {
      const f = a && typeof a == "object" ? a : {};
      if (typeof f.type == "string") {
        const E = (
          // `hast`
          typeof f.tagName == "string" ? f.tagName : (
            // `xast`
            typeof f.name == "string" ? f.name : void 0
          )
        );
        Object.defineProperty(h, "name", {
          value: "node (" + (a.type + (E ? "<" + E + ">" : "")) + ")"
        });
      }
      return h;
      function h() {
        let E = [], g, A, _;
        if ((!t || i(a, u, c[c.length - 1] || null)) && (E = c5(n(a, c)), E[0] === M1))
          return E;
        if (a.children && E[0] !== Ln)
          for (A = (r ? a.children.length : -1) + s, _ = c.concat(a); A > -1 && A < a.children.length; ) {
            if (g = o(a.children[A], A, _)(), g[0] === M1)
              return g;
            A = typeof g[1] == "number" ? g[1] : A + s;
          }
        return E;
      }
    }
  }
);
function c5(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [u5, e] : [e];
}
const je = (
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {Test} test
   * @param {Visitor} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {void}
   */
  function(e, t, n, r) {
    typeof t == "function" && typeof n != "function" && (r = n, n = t, t = null), Ha(e, t, i, r);
    function i(s, o) {
      const a = o[o.length - 1];
      return n(
        s,
        a ? a.children.indexOf(s) : null,
        a
      );
    }
  }
);
function H(e, t) {
  const n = t.children || [], r = [];
  let i = -1;
  for (; ++i < n.length; ) {
    const a = Ba(e, n[i], t);
    Array.isArray(a) ? r.push(...a) : a && r.push(a);
  }
  let s = 0, o = r.length;
  for (; s < o && r[s].type === "break"; )
    s++;
  for (; o > s && r[o - 1].type === "break"; )
    o--;
  return s === 0 && o === r.length ? r : r.slice(s, o);
}
const An = {}.hasOwnProperty;
function Ae(e, t) {
  return e.wrapText ? t : t.replace(/\r?\n|\r/g, " ");
}
function Ba(e, t, n) {
  let r;
  if (t.type === "element") {
    if (t.properties && t.properties.dataMdast === "ignore")
      return;
    An.call(e.handlers, t.tagName) && (r = e.handlers[t.tagName]);
  } else
    An.call(e.handlers, t.type) && (r = e.handlers[t.type]);
  return typeof r == "function" ? r(e, t, n) : f5(e, t);
}
function f5(e, t) {
  return typeof t.value == "string" ? e(t, "text", Ae(e, t.value)) : H(e, t);
}
const h5 = {}.hasOwnProperty;
function de(e, t) {
  const n = typeof t == "string" && p5(e) && e.type === "element" && e.properties && h5.call(e.properties, t) && e.properties[t];
  return n != null && n !== !1;
}
function p5(e) {
  return Boolean(e && typeof e == "object" && "type" in e);
}
const d5 = /* @__PURE__ */ new Set(["pingback", "prefetch", "stylesheet"]);
function m5(e) {
  if (!It(e, "link"))
    return !1;
  if (de(e, "itemProp"))
    return !0;
  const n = (e.properties || {}).rel || [];
  let r = -1;
  if (!Array.isArray(n) || n.length === 0)
    return !1;
  for (; ++r < n.length; )
    if (!d5.has(String(n[r])))
      return !1;
  return !0;
}
const T5 = te([
  "a",
  "abbr",
  // `area` is in fact only phrasing if it is inside a `map` element.
  // However, since `area`s are required to be inside a `map` element, and it’s
  // a rather involved check, it’s ignored here for now.
  "area",
  "b",
  "bdi",
  "bdo",
  "br",
  "button",
  "cite",
  "code",
  "data",
  "datalist",
  "del",
  "dfn",
  "em",
  "i",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "map",
  "mark",
  "meter",
  "noscript",
  "output",
  "progress",
  "q",
  "ruby",
  "s",
  "samp",
  "script",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "template",
  "textarea",
  "time",
  "u",
  "var",
  "wbr"
]), E5 = te("meta");
function Ua(e) {
  return Boolean(
    g5(e) && (e.type === "text" || T5(e) || Xr(e) || m5(e) || E5(e) && de(e, "itemProp"))
  );
}
function g5(e) {
  return e && typeof e == "object" && "type" in e;
}
const va = (
  /** @type {AssertPredicatePhrasing} */
  i1([
    "break",
    "delete",
    "emphasis",
    "footnote",
    "footnoteReference",
    "image",
    "imageReference",
    "inlineCode",
    "link",
    "linkReference",
    "strong",
    "text"
  ])
);
function Ga(e) {
  return Ka(e, t);
  function t(n) {
    const r = n[0];
    return n.length === 1 && r.type === "text" && (r.value === " " || r.value === `
`) ? [] : { type: "paragraph", children: n };
  }
}
function Mn(e) {
  let t = -1, n;
  for (; ++t < e.length; )
    if (n = e[t], !za(n) || "children" in n && Mn(n.children))
      return !0;
  return !1;
}
function Ka(e, t, n) {
  const r = n || C5, i = _5(e);
  let s = [], o = -1, a, u;
  for (; ++o < i.length; )
    u = i[o], za(u) ? (a || (a = []), a.push(u)) : (a && (s = s.concat(t(a)), a = void 0), s = s.concat(r(u)));
  return a && (s = s.concat(t(a))), s;
}
function _5(e) {
  let t = [], n = -1, r;
  for (; ++n < e.length; )
    r = e[n], (r.type === "delete" || r.type === "link") && Mn(r.children) ? t = t.concat(A5(r)) : t.push(r);
  return t;
}
function A5(e) {
  return Ka(e.children, n, t);
  function t(r) {
    if ("children" in r && "children" in e) {
      const { children: i, ...s } = e;
      return {
        ...r,
        // @ts-expect-error: assume matching parent & child.
        children: [{ ...mn(!0, {}, s), children: r.children }]
      };
    }
    return { ...r };
  }
  function n(r) {
    const { children: i, ...s } = e;
    return { ...mn(!0, {}, s), children: r };
  }
}
function za(e) {
  return e.data && e.data.hName ? Ua({
    type: "element",
    tagName: e.data.hName,
    properties: {},
    children: []
  }) : va(e);
}
function C5(e) {
  return e;
}
function oe(e, t) {
  return Ga(H(e, t));
}
function wt(e, t) {
  return t == null ? "" : e.frozenBaseUrl ? String(new URL(t, e.frozenBaseUrl)) : t;
}
function N5(e, t) {
  const n = t.properties;
  return e(
    t,
    "link",
    {
      title: n.title || null,
      url: wt(e, String(n.href || "") || null)
    },
    H(e, t)
  );
}
function S5(e, t) {
  e.baseFound || (e.frozenBaseUrl = String(t.properties && t.properties.href || "") || null, e.baseFound = !0);
}
function y5(e, t) {
  return e(t, "blockquote", oe(e, t));
}
function I5(e, t) {
  return e.wrapText ? e(t, "break") : e(t, "text", " ");
}
const Ws = (
  /**
   * @type {(
   *  (<T extends Node>(node: Parent, index: Node | number, test: import('unist-util-is').PredicateTest<T>) => T | null) &
   *  ((node: Parent, index: Node | number, test?: Test) => Node | null)
   * )}
   */
  /**
   * @param {Parent} parent
   * @param {Node | number} index
   * @param {Test} [test]
   * @returns {Node | null}
   */
  function(e, t, n) {
    const r = i1(n);
    if (!e || !e.type || !e.children)
      throw new Error("Expected parent node");
    if (typeof t == "number") {
      if (t < 0 || t === Number.POSITIVE_INFINITY)
        throw new Error("Expected positive finite number as index");
    } else if (t = e.children.indexOf(t), t < 0)
      throw new Error("Expected child node or index");
    for (; ++t < e.children.length; )
      if (r(e.children[t], t, e))
        return e.children[t];
    return null;
  }
), Vs = /\n/g, Xs = /[\t ]+/g, br = te("br"), O5 = te("p"), Zs = te(["th", "td"]), Js = te("tr"), x5 = te([
  // List from: <https://html.spec.whatwg.org/#hidden-elements>
  "datalist",
  "head",
  "noembed",
  "noframes",
  "noscript",
  // Act as if we support scripting.
  "rp",
  "script",
  "style",
  "template",
  "title",
  // Hidden attribute.
  L5,
  // From: <https://html.spec.whatwg.org/#flow-content-3>
  M5
]), $a = te([
  "address",
  // Flow content
  "article",
  // Sections and headings
  "aside",
  // Sections and headings
  "blockquote",
  // Flow content
  "body",
  // Page
  "caption",
  // `table-caption`
  "center",
  // Flow content (legacy)
  "dd",
  // Lists
  "dialog",
  // Flow content
  "dir",
  // Lists (legacy)
  "dl",
  // Lists
  "dt",
  // Lists
  "div",
  // Flow content
  "figure",
  // Flow content
  "figcaption",
  // Flow content
  "footer",
  // Flow content
  "form,",
  // Flow content
  "h1",
  // Sections and headings
  "h2",
  // Sections and headings
  "h3",
  // Sections and headings
  "h4",
  // Sections and headings
  "h5",
  // Sections and headings
  "h6",
  // Sections and headings
  "header",
  // Flow content
  "hgroup",
  // Sections and headings
  "hr",
  // Flow content
  "html",
  // Page
  "legend",
  // Flow content
  "listing",
  // Flow content (legacy)
  "main",
  // Flow content
  "menu",
  // Lists
  "nav",
  // Sections and headings
  "ol",
  // Lists
  "p",
  // Flow content
  "plaintext",
  // Flow content (legacy)
  "pre",
  // Flow content
  "section",
  // Sections and headings
  "ul",
  // Lists
  "xmp"
  // Flow content (legacy)
]);
function H1(e, t = {}) {
  const n = "children" in e ? e.children : [], r = $a(e), i = Qa(e, {
    whitespace: t.whitespace || "normal",
    breakBefore: !1,
    breakAfter: !1
  }), s = [];
  (e.type === "text" || e.type === "comment") && s.push(
    ...ja(e, {
      whitespace: i,
      breakBefore: !0,
      breakAfter: !0
    })
  );
  let o = -1;
  for (; ++o < n.length; )
    s.push(
      ...Ya(n[o], e, {
        whitespace: i,
        breakBefore: o ? void 0 : r,
        breakAfter: o < n.length - 1 ? br(n[o + 1]) : r
      })
    );
  const a = [];
  let u;
  for (o = -1; ++o < s.length; ) {
    const c = s[o];
    typeof c == "number" ? u !== void 0 && c > u && (u = c) : c && (u !== void 0 && u > -1 && a.push(`
`.repeat(u) || " "), u = -1, a.push(c));
  }
  return a.join("");
}
function Ya(e, t, n) {
  return e.type === "element" ? b5(e, t, n) : e.type === "text" ? n.whitespace === "normal" ? ja(e, n) : R5(e) : [];
}
function b5(e, t, n) {
  const r = Qa(e, n), i = e.children || [];
  let s = -1, o = [];
  if (x5(e))
    return o;
  let a, u;
  for (br(e) || Js(e) && Ws(t, e, Js) ? u = `
` : O5(e) ? (a = 2, u = 2) : $a(e) && (a = 1, u = 1); ++s < i.length; )
    o = o.concat(
      Ya(i[s], e, {
        whitespace: r,
        breakBefore: s ? void 0 : a,
        breakAfter: s < i.length - 1 ? br(i[s + 1]) : u
      })
    );
  return Zs(e) && Ws(t, e, Zs) && o.push("	"), a && o.unshift(a), u && o.push(u), o;
}
function ja(e, t) {
  const n = String(e.value), r = [], i = [];
  let s = 0;
  for (; s <= n.length; ) {
    Vs.lastIndex = s;
    const u = Vs.exec(n), c = u && "index" in u ? u.index : n.length;
    r.push(
      // Any sequence of collapsible spaces and tabs immediately preceding or
      // following a segment break is removed.
      k5(
        // […] ignoring bidi formatting characters (characters with the
        // Bidi_Control property [UAX9]: ALM, LTR, RTL, LRE-RLO, LRI-PDI) as if
        // they were not there.
        n.slice(s, c).replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""),
        s === 0 ? t.breakBefore : !0,
        c === n.length ? t.breakAfter : !0
      )
    ), s = c + 1;
  }
  let o = -1, a;
  for (; ++o < r.length; )
    r[o].charCodeAt(r[o].length - 1) === 8203 || o < r.length - 1 && r[o + 1].charCodeAt(0) === 8203 ? (i.push(r[o]), a = void 0) : r[o] ? (typeof a == "number" && i.push(a), i.push(r[o]), a = 0) : (o === 0 || o === r.length - 1) && i.push(0);
  return i;
}
function R5(e) {
  return [String(e.value)];
}
function k5(e, t, n) {
  const r = [];
  let i = 0, s;
  for (; i < e.length; ) {
    Xs.lastIndex = i;
    const o = Xs.exec(e);
    s = o ? o.index : e.length, !i && !s && o && !t && r.push(""), i !== s && r.push(e.slice(i, s)), i = o ? s + o[0].length : s;
  }
  return i !== s && !n && r.push(""), r.join(" ");
}
function Qa(e, t) {
  if (e.type === "element") {
    const n = e.properties || {};
    switch (e.tagName) {
      case "listing":
      case "plaintext":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return n.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return n.noWrap ? "nowrap" : t.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  }
  return t.whitespace;
}
function L5(e) {
  return Boolean((e.properties || {}).hidden);
}
function M5(e) {
  return e.tagName === "dialog" && !(e.properties || {}).open;
}
function P5(e) {
  const t = String(e);
  let n = t.length;
  for (; n > 0; ) {
    const r = t.codePointAt(n - 1);
    if (r !== void 0 && (r === 10 || r === 13))
      n--;
    else
      break;
  }
  return t.slice(0, n);
}
const ur = "language-", D5 = te("pre"), w5 = te("code");
function en(e, t) {
  const n = t.children;
  let r = -1, i, s;
  if (D5(t))
    for (; ++r < n.length; ) {
      const o = n[r];
      if (w5(o) && o.properties && o.properties.className && Array.isArray(o.properties.className)) {
        i = o.properties.className;
        break;
      }
    }
  if (i) {
    for (r = -1; ++r < i.length; )
      if (String(i[r]).slice(0, ur.length) === ur) {
        s = String(i[r]).slice(ur.length);
        break;
      }
  }
  return e(
    t,
    "code",
    { lang: s || null, meta: null },
    P5(Ae(e, H1(t)))
  );
}
function F5(e, t) {
  return e(t, "html", "<!--" + Ae(e, t.value) + "-->");
}
function cr(e, t) {
  return e(t, "delete", H(e, t));
}
function Jr(e) {
  let t = -1;
  if (e.length > 1) {
    for (; ++t < e.length; )
      if (e[t].spread)
        return !0;
  }
  return !1;
}
function qa(e, t) {
  const n = H(e, t);
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    i.type !== "listItem" && (n[r] = {
      type: "listItem",
      spread: !1,
      checked: null,
      // @ts-expect-error Assume `children[index]` is block content.
      children: [i]
    });
  }
  return n;
}
const H5 = te("div"), B5 = te("dt"), U5 = te("dd");
function v5(e, t) {
  const n = t.children;
  let r = -1, i = [];
  const s = [];
  let o = { titles: [], definitions: [] }, a, u;
  for (; ++r < n.length; )
    a = n[r], i = i.concat(H5(a) ? a.children : a);
  for (r = -1; ++r < i.length; )
    a = i[r], B5(a) ? (U5(i[r - 1]) && (s.push(o), o = { titles: [], definitions: [] }), o.titles.push(a)) : o.definitions.push(a);
  s.push(o), r = -1;
  const c = [];
  for (; ++r < s.length; )
    u = [
      ...eo(e, s[r].titles),
      ...eo(e, s[r].definitions)
    ], u.length > 0 && c.push({
      type: "listItem",
      spread: u.length > 1,
      checked: null,
      children: u
    });
  if (c.length > 0)
    return e(
      t,
      "list",
      { ordered: !1, start: null, spread: Jr(c) },
      c
    );
}
function eo(e, t) {
  const n = qa(e, { type: "element", tagName: "x", children: t });
  return n.length === 0 ? [] : n.length === 1 ? n[0].children : [
    {
      type: "list",
      ordered: !1,
      start: null,
      spread: Jr(n),
      children: n
    }
  ];
}
function tn(e, t) {
  return e(t, "emphasis", H(e, t));
}
function jt(e, t) {
  const n = Number(t.tagName.charAt(1)) || 1, r = e.wrapText;
  e.wrapText = !1;
  const i = e(t, "heading", { depth: n }, H(e, t));
  return e.wrapText = r, i;
}
function G5(e, t) {
  return e(t, "thematicBreak");
}
function K5(e, t) {
  const n = t.properties, r = String(n.src || ""), i = String(n.title || "");
  if (r && i)
    return {
      type: "link",
      title: null,
      url: wt(e, r),
      children: [{ type: "text", value: Ae(e, i) }]
    };
}
function to(e, t) {
  const n = t.properties;
  return e(t, "image", {
    url: wt(e, String(n.src || "") || null),
    title: n.title || null,
    alt: n.alt || ""
  });
}
function A1(e, t) {
  return e(t, "inlineCode", Ae(e, H1(t)));
}
const z5 = te("option");
function Wa(e, t, n) {
  const r = n || t.properties;
  let i = Va(t);
  const s = Math.min(Number.parseInt(String(r.size), 10), 0) || (r.multiple ? 4 : 1);
  let o = -1;
  const a = [], u = [];
  for (; ++o < i.length; )
    de(i[o], "selected") && a.push(i[o]);
  for (i = (a.length > 0 ? a : i).slice(0, s), o = -1; ++o < i.length; ) {
    const f = i[o], h = Ae(e, H1(f)), E = f.properties, g = h || String(E.label || ""), A = String(E.value || "") || h;
    u.push([A, g === A ? null : g]);
  }
  return u;
}
function Va(e) {
  const t = e.children;
  let n = -1, r = [], i;
  for (; ++n < t.length; )
    i = t[n], Array.isArray(i.children) && (r = r.concat(Va(i))), z5(i) && !de(i, "disabled") && r.push(i);
  return r;
}
const $5 = te("datalist");
function Y5(e, t) {
  const n = t.properties;
  let r = String(n.value || n.placeholder || "");
  const i = [], s = [];
  let o = [], a = -1, u;
  if (!(n.disabled || n.type === "hidden" || n.type === "file")) {
    if (n.type === "checkbox" || n.type === "radio")
      return e(
        t,
        "text",
        Ae(e, e[n.checked ? "checked" : "unchecked"])
      );
    if (n.type === "image")
      return n.alt || r ? e(t, "image", {
        url: wt(e, String(n.src || "") || null),
        title: Ae(e, String(n.title || "")) || null,
        alt: Ae(e, String(n.alt || r))
      }) : [];
    if (r ? o = [[r, null]] : (
      // `list` is not supported on these types:
      n.type !== "password" && n.type !== "file" && n.type !== "submit" && n.type !== "reset" && n.type !== "button" && n.list && (u = String(n.list).toUpperCase(), An.call(e.nodeById, u) && $5(e.nodeById[u]) && (o = Wa(e, e.nodeById[u], n)))
    ), o.length !== 0) {
      if (n.type === "password" && (o[0] = ["•".repeat(o[0][0].length), null]), n.type === "url" || n.type === "email") {
        for (; ++a < o.length; )
          r = wt(e, o[a][0]), i.push(
            e(
              t,
              "link",
              {
                title: null,
                url: Ae(e, n.type === "email" ? "mailto:" + r : r)
              },
              [{ type: "text", value: Ae(e, o[a][1] || r) }]
            )
          ), a !== o.length - 1 && i.push({ type: "text", value: ", " });
        return i;
      }
      for (; ++a < o.length; )
        s.push(
          o[a][1] ? o[a][1] + " (" + o[a][0] + ")" : o[a][0]
        );
      return e(t, "text", Ae(e, s.join(", ")));
    }
  }
}
const j5 = te("p"), Q5 = te("input");
function fr(e, t) {
  const n = t.children[0];
  let r = null, i, s;
  j5(n) && (i = n.children[0], Q5(i) && i.properties && (i.properties.type === "checkbox" || i.properties.type === "radio") && (r = Boolean(i.properties.checked), s = {
    ...t,
    children: [
      { ...n, children: n.children.slice(1) },
      ...t.children.slice(1)
    ]
  }));
  const o = oe(e, s || t);
  return e(t, "listItem", { spread: o.length > 1, checked: r }, o);
}
const q5 = te("ol");
function hr(e, t) {
  const n = q5(t), r = qa(e, t);
  let i = null;
  return n && (i = de(t, "start") ? (
    // @ts-expect-error: `props` exist.
    Number.parseInt(String(t.properties.start), 10)
  ) : 1), e(
    t,
    "list",
    { ordered: n, start: i, spread: Jr(r) },
    r
  );
}
function Pn(e, t) {
  const n = (t || {}).includeImageAlt;
  return Xa(
    e,
    typeof n == "boolean" ? n : !0
  );
}
function Xa(e, t) {
  return W5(e) && ("value" in e && e.value || t && "alt" in e && e.alt || "children" in e && no(e.children, t)) || Array.isArray(e) && no(e, t) || "";
}
function no(e, t) {
  const n = [];
  let r = -1;
  for (; ++r < e.length; )
    n[r] = Xa(e[r], t);
  return n.join("");
}
function W5(e) {
  return Boolean(e && typeof e == "object");
}
const V5 = te("source"), X5 = te("video");
function ro(e, t) {
  let n = H(e, t);
  const r = t.properties, i = X5(t) && String(r.poster || "");
  let s = String(r.src || ""), o = -1, a = !1, u;
  if (je({ type: "root", children: n }, "link", c), a || Mn(n))
    return n;
  for (; !s && ++o < t.children.length; )
    u = t.children[o], V5(u) && (s = String(u.properties.src || ""));
  return i && (n = [
    {
      type: "image",
      title: null,
      url: wt(e, i),
      alt: Pn({ children: n })
    }
  ]), {
    type: "link",
    // @ts-expect-error Types are broken.
    title: t.properties.title || null,
    url: wt(e, s),
    // @ts-expect-error Assume phrasing content.
    children: n
  };
  function c() {
    return a = !0, M1;
  }
}
function io(e, t) {
  const n = H(e, t);
  if (n.length > 0)
    return e(t, "paragraph", n);
}
function Z5(e, t) {
  const n = e.quotes[e.qNesting % e.quotes.length];
  e.qNesting++;
  const r = H(e, t);
  return e.qNesting--, r.unshift({ type: "text", value: n.charAt(0) }), r.push({
    type: "text",
    value: n.length > 1 ? n.charAt(1) : n
  }), r;
}
function J5(e, t) {
  let n = H(e, t);
  return (e.document || Mn(n)) && (n = Ga(n)), e(t, "root", n);
}
function ef(e, t) {
  const n = Wa(e, t);
  let r = -1;
  const i = [];
  let s;
  for (; ++r < n.length; )
    s = n[r], i.push(s[1] ? s[1] + " (" + s[0] + ")" : s[0]);
  if (i.length > 0)
    return e(t, "text", Ae(e, i.join(", ")));
}
function so(e, t) {
  return e(t, "strong", H(e, t));
}
function oo(e, t) {
  const n = e.wrapText;
  e.wrapText = !1;
  const r = e(t, "tableCell", H(e, t));
  if (t.properties && (t.properties.rowSpan || t.properties.colSpan)) {
    const i = r.data || (r.data = {});
    t.properties.rowSpan && (i.rowSpan = t.properties.rowSpan), t.properties.colSpan && (i.colSpan = t.properties.colSpan);
  }
  return e.wrapText = n, r;
}
function tf(e, t) {
  return e(t, "tableRow", H(e, t));
}
const nf = te("thead"), rf = te("tr"), sf = te(["th", "td"]);
function of(e, t) {
  if (e.inTable)
    return e(t, "text", Ae(e, H1(t)));
  e.inTable = !0;
  const { headless: n, align: r } = af(t), i = lf(H(e, t), n);
  let s = 1, o = -1;
  for (; ++o < i.length; ) {
    const u = i[o].children;
    let c = -1;
    for (; ++c < u.length; ) {
      const f = u[c];
      if (f.data) {
        const h = Number.parseInt(String(f.data.colSpan), 10) || 1, E = Number.parseInt(String(f.data.rowSpan), 10) || 1;
        if (h > 1 || E > 1) {
          let g = o - 1;
          for (; ++g < o + E; ) {
            let A = c - 1;
            for (; ++A < c + h && i[g]; ) {
              const _ = [];
              (g !== o || A !== c) && _.push({ type: "tableCell", children: [] }), i[g].children.splice(A, 0, ..._);
            }
          }
        }
        "colSpan" in f.data && delete f.data.colSpan, "rowSpan" in f.data && delete f.data.rowSpan, Object.keys(f.data).length === 0 && delete f.data;
      }
    }
    u.length > s && (s = u.length);
  }
  for (o = -1; ++o < i.length; ) {
    const u = i[o].children;
    let c = u.length - 1;
    for (; ++c < s; )
      u.push({ type: "tableCell", children: [] });
  }
  let a = r.length - 1;
  for (; ++a < s; )
    r.push(null);
  return e.inTable = !1, e(t, "table", { align: r }, i);
}
function af(e) {
  let t = !0, n = 0, r = 0;
  const i = [null];
  return je(e, "element", (s) => {
    if (s.tagName === "table" && e !== s)
      return Ln;
    sf(s) && s.properties ? (i[r] || (i[r] = String(s.properties.align || "") || null), t && n < 2 && s.tagName === "th" && (t = !1), r++) : nf(s) ? t = !1 : rf(s) && (n++, r = 0);
  }), { align: i, headless: t };
}
function lf(e, t) {
  let n = -1;
  const r = [];
  let i;
  for (t && r.push({ type: "tableRow", children: [] }); ++n < e.length; ) {
    const s = e[n];
    s.type === "tableRow" ? (i && (s.children.unshift(...i), i = void 0), r.push(s)) : (i || (i = []), i.push(s));
  }
  for (i && r[r.length - 1].children.push(...i), n = -1; ++n < r.length; )
    r[n].children = uf(r[n].children);
  return r;
}
function uf(e) {
  const t = [];
  let n = -1, r, i;
  for (; ++n < e.length; )
    r = e[n], r.type === "tableCell" ? (i && (r.children.unshift(...i), i = void 0), t.push(r)) : (i || (i = []), i.push(r));
  return i && (r = t[t.length - 1], r || (r = { type: "tableCell", children: [] }, t.push(r)), r.children.push(...i)), t;
}
function cf(e, t) {
  return e(t, "text", Ae(e, t.value));
}
function ff(e, t) {
  return e(t, "text", Ae(e, H1(t)));
}
function hf(e, t) {
  return e(t, "text", "​");
}
const ao = {
  root: J5,
  text: cf,
  comment: F5,
  doctype: Y,
  applet: Y,
  area: Y,
  basefont: Y,
  bgsound: Y,
  caption: Y,
  col: Y,
  colgroup: Y,
  command: Y,
  content: Y,
  datalist: Y,
  dialog: Y,
  element: Y,
  embed: Y,
  frame: Y,
  frameset: Y,
  isindex: Y,
  keygen: Y,
  link: Y,
  math: Y,
  menu: Y,
  menuitem: Y,
  meta: Y,
  nextid: Y,
  noembed: Y,
  noframes: Y,
  optgroup: Y,
  option: Y,
  param: Y,
  script: Y,
  shadow: Y,
  source: Y,
  spacer: Y,
  style: Y,
  svg: Y,
  template: Y,
  title: Y,
  track: Y,
  abbr: H,
  acronym: H,
  bdi: H,
  bdo: H,
  big: H,
  blink: H,
  button: H,
  canvas: H,
  cite: H,
  data: H,
  details: H,
  dfn: H,
  font: H,
  ins: H,
  label: H,
  map: H,
  marquee: H,
  meter: H,
  nobr: H,
  noscript: H,
  object: H,
  output: H,
  progress: H,
  rb: H,
  rbc: H,
  rp: H,
  rt: H,
  rtc: H,
  ruby: H,
  slot: H,
  small: H,
  span: H,
  sup: H,
  sub: H,
  tbody: H,
  tfoot: H,
  thead: H,
  time: H,
  address: oe,
  article: oe,
  aside: oe,
  body: oe,
  center: oe,
  div: oe,
  fieldset: oe,
  figcaption: oe,
  figure: oe,
  form: oe,
  footer: oe,
  header: oe,
  hgroup: oe,
  html: oe,
  legend: oe,
  main: oe,
  multicol: oe,
  nav: oe,
  picture: oe,
  section: oe,
  a: N5,
  audio: ro,
  b: so,
  base: S5,
  blockquote: y5,
  br: I5,
  code: A1,
  dir: hr,
  dl: v5,
  dt: fr,
  dd: fr,
  del: cr,
  em: tn,
  h1: jt,
  h2: jt,
  h3: jt,
  h4: jt,
  h5: jt,
  h6: jt,
  hr: G5,
  i: tn,
  iframe: K5,
  img: to,
  image: to,
  input: Y5,
  kbd: A1,
  li: fr,
  listing: en,
  mark: tn,
  ol: hr,
  p: io,
  plaintext: en,
  pre: en,
  q: Z5,
  s: cr,
  samp: A1,
  select: ef,
  strike: cr,
  strong: so,
  summary: io,
  table: of,
  td: oo,
  textarea: ff,
  th: oo,
  tr: tf,
  tt: A1,
  u: tn,
  ul: hr,
  var: A1,
  video: ro,
  wbr: hf,
  xmp: en
};
function Y() {
}
const pf = i1(["heading", "paragraph", "root"]);
function Za(e, t = {}) {
  const n = {};
  let r;
  const i = Object.assign(
    /**
     * @type {HWithProps & HWithoutProps}
     */
    /**
     * @param {Node} node
     * @param {string} type
     * @param {Properties|string|Array<Node>} [props]
     * @param {string|Array<Node>} [children]
     */
    (a, u, c, f) => {
      let h;
      typeof c == "string" || Array.isArray(c) ? (f = c, h = {}) : h = c;
      const E = { type: u, ...h };
      return typeof f == "string" ? E.value = f : f && (E.children = f), a.position && (E.position = a.position), E;
    },
    {
      nodeById: n,
      baseFound: !1,
      inTable: !1,
      wrapText: !0,
      /** @type {string|null} */
      frozenBaseUrl: null,
      qNesting: 0,
      handlers: t.handlers ? { ...ao, ...t.handlers } : ao,
      document: t.document,
      checked: t.checked || "[x]",
      unchecked: t.unchecked || "[ ]",
      quotes: t.quotes || ['"']
    }
  );
  je(e, "element", (a) => {
    const u = a.properties && "id" in a.properties && String(a.properties.id).toUpperCase();
    u && !An.call(n, u) && (n[u] = a);
  }), Ma({ newlines: t.newlines === !0 })(e);
  const s = Ba(i, e, void 0);
  return s ? Array.isArray(s) ? r = { type: "root", children: s } : r = s : r = { type: "root", children: [] }, je(r, "text", o), r;
  function o(a, u, c) {
    if (u === null || !c)
      return;
    const f = c.children[u - 1];
    if (f && f.type === a.type)
      return f.value += a.value, c.children.splice(u, 1), f.position && a.position && (f.position.end = a.position.end), u - 1;
    if (a.value = a.value.replace(/[\t ]*(\r?\n|\r)[\t ]*/, "$1"), c && pf(c) && (u || (a.value = a.value.replace(/^[\t ]+/, "")), u === c.children.length - 1 && (a.value = a.value.replace(/[\t ]+$/, ""))), !a.value)
      return c.children.splice(u, 1), u;
  }
}
const df = (
  /**
   * @type {(import('unified').Plugin<[Processor, Options?], HastRoot> & import('unified').Plugin<[Options?]|void[], HastRoot, MdastRoot>)}
   */
  /**
   * @param {Processor|Options} [destination]
   * @param {Options} [options]
   */
  function(e, t) {
    let n, r;
    return typeof e == "function" ? (r = e, n = t || {}) : n = e || {}, (n.document === void 0 || n.document === null) && (n = Object.assign({}, n, { document: !0 })), r ? Tf(r, n) : Ef(n);
  }
), mf = df;
function Tf(e, t) {
  return (n, r, i) => {
    e.run(Za(n, t), r, (s) => {
      i(s);
    });
  };
}
function Ef(e = {}) {
  return (t) => (
    /** @type {MdastRoot} */
    Za(t, e)
  );
}
const lo = {}.hasOwnProperty;
function s1(e, t) {
  const n = t || {};
  function r(i, ...s) {
    let o = r.invalid;
    const a = r.handlers;
    if (i && lo.call(i, e)) {
      const u = String(i[e]);
      o = lo.call(a, u) ? a[u] : r.unknown;
    }
    if (o)
      return o.call(this, i, ...s);
  }
  return r.handlers = n.handlers || {}, r.invalid = n.invalid, r.unknown = n.unknown, r;
}
function fn(e, t) {
  let n = -1, r;
  if (t.extensions)
    for (; ++n < t.extensions.length; )
      fn(e, t.extensions[n]);
  for (r in t)
    r === "extensions" || (r === "unsafe" || r === "join" ? e[r] = [...e[r] || [], ...t[r] || []] : r === "handlers" ? e[r] = Object.assign(e[r], t[r] || {}) : e.options[r] = t[r]);
  return e;
}
function gf(e, t, n, r) {
  const i = n.enter("blockquote"), s = n.createTracker(r);
  s.move("> "), s.shift(2);
  const o = n.indentLines(
    n.containerFlow(e, s.current()),
    _f
  );
  return i(), o;
}
function _f(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function Ja(e, t) {
  return uo(e, t.inConstruct, !0) && !uo(e, t.notInConstruct, !1);
}
function uo(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function co(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && Ja(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function Af(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, s = 0, o = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++s > o && (o = s) : s = 1, i = r + t.length, r = n.indexOf(t, i);
  return o;
}
function Rr(e, t) {
  return Boolean(
    !t.options.fences && e.value && // If there’s no info…
    !e.lang && // And there’s a non-whitespace character…
    /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
    !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value)
  );
}
function Cf(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function Nf(e, t, n, r) {
  const i = Cf(n), s = e.value || "", o = i === "`" ? "GraveAccent" : "Tilde";
  if (Rr(e, n)) {
    const h = n.enter("codeIndented"), E = n.indentLines(s, Sf);
    return h(), E;
  }
  const a = n.createTracker(r), u = i.repeat(Math.max(Af(s, i) + 1, 3)), c = n.enter("codeFenced");
  let f = a.move(u);
  if (e.lang) {
    const h = n.enter(`codeFencedLang${o}`);
    f += a.move(
      n.safe(e.lang, {
        before: f,
        after: " ",
        encode: ["`"],
        ...a.current()
      })
    ), h();
  }
  if (e.lang && e.meta) {
    const h = n.enter(`codeFencedMeta${o}`);
    f += a.move(" "), f += a.move(
      n.safe(e.meta, {
        before: f,
        after: `
`,
        encode: ["`"],
        ...a.current()
      })
    ), h();
  }
  return f += a.move(`
`), s && (f += a.move(s + `
`)), f += a.move(u), c(), f;
}
function Sf(e, t, n) {
  return (n ? "" : "    ") + e;
}
function ei(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function yf(e, t, n, r) {
  const i = ei(n), s = i === '"' ? "Quote" : "Apostrophe", o = n.enter("definition");
  let a = n.enter("label");
  const u = n.createTracker(r);
  let c = u.move("[");
  return c += u.move(
    n.safe(n.associationId(e), {
      before: c,
      after: "]",
      ...u.current()
    })
  ), c += u.move("]: "), a(), // If there’s no url, or…
  !e.url || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (a = n.enter("destinationLiteral"), c += u.move("<"), c += u.move(
    n.safe(e.url, { before: c, after: ">", ...u.current() })
  ), c += u.move(">")) : (a = n.enter("destinationRaw"), c += u.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : `
`,
      ...u.current()
    })
  )), a(), e.title && (a = n.enter(`title${s}`), c += u.move(" " + i), c += u.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...u.current()
    })
  ), c += u.move(i), a()), o(), c;
}
function If(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
el.peek = Of;
function el(e, t, n, r) {
  const i = If(n), s = n.enter("emphasis"), o = n.createTracker(r);
  let a = o.move(i);
  return a += o.move(
    n.containerPhrasing(e, {
      before: a,
      after: i,
      ...o.current()
    })
  ), a += o.move(i), s(), a;
}
function Of(e, t, n) {
  return n.options.emphasis || "*";
}
function tl(e, t) {
  let n = !1;
  return je(e, (r) => {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, M1;
  }), Boolean(
    (!e.depth || e.depth < 3) && Pn(e) && (t.options.setext || n)
  );
}
function xf(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), s = n.createTracker(r);
  if (tl(e, n)) {
    const f = n.enter("headingSetext"), h = n.enter("phrasing"), E = n.containerPhrasing(e, {
      ...s.current(),
      before: `
`,
      after: `
`
    });
    return h(), f(), E + `
` + (i === 1 ? "=" : "-").repeat(
      // The whole size…
      E.length - // Minus the position of the character after the last EOL (or
      // 0 if there is none)…
      (Math.max(E.lastIndexOf("\r"), E.lastIndexOf(`
`)) + 1)
    );
  }
  const o = "#".repeat(i), a = n.enter("headingAtx"), u = n.enter("phrasing");
  s.move(o + " ");
  let c = n.containerPhrasing(e, {
    before: "# ",
    after: `
`,
    ...s.current()
  });
  return /^[\t ]/.test(c) && (c = "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";" + c.slice(1)), c = c ? o + " " + c : o, n.options.closeAtx && (c += " " + o), u(), a(), c;
}
nl.peek = bf;
function nl(e) {
  return e.value || "";
}
function bf() {
  return "<";
}
rl.peek = Rf;
function rl(e, t, n, r) {
  const i = ei(n), s = i === '"' ? "Quote" : "Apostrophe", o = n.enter("image");
  let a = n.enter("label");
  const u = n.createTracker(r);
  let c = u.move("![");
  return c += u.move(
    n.safe(e.alt, { before: c, after: "]", ...u.current() })
  ), c += u.move("]("), a(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (a = n.enter("destinationLiteral"), c += u.move("<"), c += u.move(
    n.safe(e.url, { before: c, after: ">", ...u.current() })
  ), c += u.move(">")) : (a = n.enter("destinationRaw"), c += u.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...u.current()
    })
  )), a(), e.title && (a = n.enter(`title${s}`), c += u.move(" " + i), c += u.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...u.current()
    })
  ), c += u.move(i), a()), c += u.move(")"), o(), c;
}
function Rf() {
  return "!";
}
il.peek = kf;
function il(e, t, n, r) {
  const i = e.referenceType, s = n.enter("imageReference");
  let o = n.enter("label");
  const a = n.createTracker(r);
  let u = a.move("![");
  const c = n.safe(e.alt, {
    before: u,
    after: "]",
    ...a.current()
  });
  u += a.move(c + "]["), o();
  const f = n.stack;
  n.stack = [], o = n.enter("reference");
  const h = n.safe(n.associationId(e), {
    before: u,
    after: "]",
    ...a.current()
  });
  return o(), n.stack = f, s(), i === "full" || !c || c !== h ? u += a.move(h + "]") : i === "shortcut" ? u = u.slice(0, -1) : u += a.move("]"), u;
}
function kf() {
  return "!";
}
function sl(e) {
  if (!e._compiled) {
    const t = (e.atBreak ? "[\\r\\n][\\t ]*" : "") + (e.before ? "(?:" + e.before + ")" : "");
    e._compiled = new RegExp(
      (t ? "(" + t + ")" : "") + (/[|\\{}()[\]^$+*?.-]/.test(e.character) ? "\\" : "") + e.character + (e.after ? "(?:" + e.after + ")" : ""),
      "g"
    );
  }
  return e._compiled;
}
ol.peek = Lf;
function ol(e, t, n) {
  let r = e.value || "", i = "`", s = -1;
  for (; new RegExp("(^|[^`])" + i + "([^`]|$)").test(r); )
    i += "`";
  for (/[^ \r\n]/.test(r) && (/^[ \r\n]/.test(r) && /[ \r\n]$/.test(r) || /^`|`$/.test(r)) && (r = " " + r + " "); ++s < n.unsafe.length; ) {
    const o = n.unsafe[s], a = sl(o);
    let u;
    if (o.atBreak)
      for (; u = a.exec(r); ) {
        let c = u.index;
        r.charCodeAt(c) === 10 && r.charCodeAt(c - 1) === 13 && c--, r = r.slice(0, c) + " " + r.slice(u.index + 1);
      }
  }
  return i + r + i;
}
function Lf() {
  return "`";
}
function al(e, t) {
  const n = Pn(e);
  return Boolean(
    !t.options.resourceLink && // If there’s a url…
    e.url && // And there’s a no title…
    !e.title && // And the content of `node` is a single text node…
    e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
    (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
    /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
    // references don’t work), space, or angle brackets…
    !/[\0- <>\u007F]/.test(e.url)
  );
}
ll.peek = Mf;
function ll(e, t, n, r) {
  const i = ei(n), s = i === '"' ? "Quote" : "Apostrophe", o = n.createTracker(r);
  let a, u;
  if (al(e, n)) {
    const f = n.stack;
    n.stack = [], a = n.enter("autolink");
    let h = o.move("<");
    return h += o.move(
      n.containerPhrasing(e, {
        before: h,
        after: ">",
        ...o.current()
      })
    ), h += o.move(">"), a(), n.stack = f, h;
  }
  a = n.enter("link"), u = n.enter("label");
  let c = o.move("[");
  return c += o.move(
    n.containerPhrasing(e, {
      before: c,
      after: "](",
      ...o.current()
    })
  ), c += o.move("]("), u(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (u = n.enter("destinationLiteral"), c += o.move("<"), c += o.move(
    n.safe(e.url, { before: c, after: ">", ...o.current() })
  ), c += o.move(">")) : (u = n.enter("destinationRaw"), c += o.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...o.current()
    })
  )), u(), e.title && (u = n.enter(`title${s}`), c += o.move(" " + i), c += o.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...o.current()
    })
  ), c += o.move(i), u()), c += o.move(")"), a(), c;
}
function Mf(e, t, n) {
  return al(e, n) ? "<" : "[";
}
ul.peek = Pf;
function ul(e, t, n, r) {
  const i = e.referenceType, s = n.enter("linkReference");
  let o = n.enter("label");
  const a = n.createTracker(r);
  let u = a.move("[");
  const c = n.containerPhrasing(e, {
    before: u,
    after: "]",
    ...a.current()
  });
  u += a.move(c + "]["), o();
  const f = n.stack;
  n.stack = [], o = n.enter("reference");
  const h = n.safe(n.associationId(e), {
    before: u,
    after: "]",
    ...a.current()
  });
  return o(), n.stack = f, s(), i === "full" || !c || c !== h ? u += a.move(h + "]") : i === "shortcut" ? u = u.slice(0, -1) : u += a.move("]"), u;
}
function Pf() {
  return "[";
}
function ti(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function Df(e) {
  const t = ti(e), n = e.options.bulletOther;
  if (!n)
    return t === "*" ? "-" : "*";
  if (n !== "*" && n !== "+" && n !== "-")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
    );
  if (n === t)
    throw new Error(
      "Expected `bullet` (`" + t + "`) and `bulletOther` (`" + n + "`) to be different"
    );
  return n;
}
function cl(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function wf(e) {
  const t = cl(e), n = e.options.bulletOrderedOther;
  if (!n)
    return t === "." ? ")" : ".";
  if (n !== "." && n !== ")")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOrderedOther`, expected `*`, `+`, or `-`"
    );
  if (n === t)
    throw new Error(
      "Expected `bulletOrdered` (`" + t + "`) and `bulletOrderedOther` (`" + n + "`) to be different"
    );
  return n;
}
function fl(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function Ff(e, t, n, r) {
  const i = n.enter("list"), s = n.bulletCurrent;
  let o = e.ordered ? cl(n) : ti(n);
  const a = e.ordered ? wf(n) : Df(n), u = n.bulletLastUsed;
  let c = !1;
  if (t && // Explicit `other` set.
  (e.ordered ? n.options.bulletOrderedOther : n.options.bulletOther) && u && o === u && (c = !0), !e.ordered) {
    const h = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (o === "*" || o === "-") && // Empty first list item:
      h && (!h.children || !h.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (c = !0), fl(n) === o && h
    ) {
      let E = -1;
      for (; ++E < e.children.length; ) {
        const g = e.children[E];
        if (g && g.type === "listItem" && g.children && g.children[0] && g.children[0].type === "thematicBreak") {
          c = !0;
          break;
        }
      }
    }
  }
  c && (o = a), n.bulletCurrent = o;
  const f = n.containerFlow(e, r);
  return n.bulletLastUsed = o, n.bulletCurrent = s, i(), f;
}
function Hf(e) {
  const t = e.options.listItemIndent || "tab";
  if (t === 1 || t === "1")
    return "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function Bf(e, t, n, r) {
  const i = Hf(n);
  let s = n.bulletCurrent || ti(n);
  t && t.type === "list" && t.ordered && (s = (typeof t.start == "number" && t.start > -1 ? t.start : 1) + (n.options.incrementListMarker === !1 ? 0 : t.children.indexOf(e)) + s);
  let o = s.length + 1;
  (i === "tab" || i === "mixed" && (t && t.type === "list" && t.spread || e.spread)) && (o = Math.ceil(o / 4) * 4);
  const a = n.createTracker(r);
  a.move(s + " ".repeat(o - s.length)), a.shift(o);
  const u = n.enter("listItem"), c = n.indentLines(
    n.containerFlow(e, a.current()),
    f
  );
  return u(), c;
  function f(h, E, g) {
    return E ? (g ? "" : " ".repeat(o)) + h : (g ? s : s + " ".repeat(o - s.length)) + h;
  }
}
function Uf(e, t, n, r) {
  const i = n.enter("paragraph"), s = n.enter("phrasing"), o = n.containerPhrasing(e, r);
  return s(), i(), o;
}
function vf(e, t, n, r) {
  return (e.children.some((o) => va(o)) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function Gf(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
hl.peek = Kf;
function hl(e, t, n, r) {
  const i = Gf(n), s = n.enter("strong"), o = n.createTracker(r);
  let a = o.move(i + i);
  return a += o.move(
    n.containerPhrasing(e, {
      before: a,
      after: i,
      ...o.current()
    })
  ), a += o.move(i + i), s(), a;
}
function Kf(e, t, n) {
  return n.options.strong || "*";
}
function zf(e, t, n, r) {
  return n.safe(e.value, r);
}
function $f(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function Yf(e, t, n) {
  const r = (fl(n) + (n.options.ruleSpaces ? " " : "")).repeat($f(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const jf = {
  blockquote: gf,
  break: co,
  code: Nf,
  definition: yf,
  emphasis: el,
  hardBreak: co,
  heading: xf,
  html: nl,
  image: rl,
  imageReference: il,
  inlineCode: ol,
  link: ll,
  linkReference: ul,
  list: Ff,
  listItem: Bf,
  paragraph: Uf,
  root: vf,
  strong: hl,
  text: zf,
  thematicBreak: Yf
}, Qf = [qf];
function qf(e, t, n, r) {
  if (t.type === "code" && Rr(t, r) && (e.type === "list" || e.type === t.type && Rr(e, r)) || e.type === "list" && e.type === t.type && Boolean(e.ordered) === Boolean(t.ordered) && !(e.ordered ? r.options.bulletOrderedOther : r.options.bulletOther))
    return !1;
  if ("spread" in n && typeof n.spread == "boolean")
    return e.type === "paragraph" && // Two paragraphs.
    (e.type === t.type || t.type === "definition" || // Paragraph followed by a setext heading.
    t.type === "heading" && tl(t, r)) ? void 0 : n.spread ? 1 : 0;
}
const Mt = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
], Wf = [
  { character: "	", after: "[\\r\\n]", inConstruct: "phrasing" },
  { character: "	", before: "[\\r\\n]", inConstruct: "phrasing" },
  {
    character: "	",
    inConstruct: ["codeFencedLangGraveAccent", "codeFencedLangTilde"]
  },
  {
    character: "\r",
    inConstruct: [
      "codeFencedLangGraveAccent",
      "codeFencedLangTilde",
      "codeFencedMetaGraveAccent",
      "codeFencedMetaTilde",
      "destinationLiteral",
      "headingAtx"
    ]
  },
  {
    character: `
`,
    inConstruct: [
      "codeFencedLangGraveAccent",
      "codeFencedLangTilde",
      "codeFencedMetaGraveAccent",
      "codeFencedMetaTilde",
      "destinationLiteral",
      "headingAtx"
    ]
  },
  { character: " ", after: "[\\r\\n]", inConstruct: "phrasing" },
  { character: " ", before: "[\\r\\n]", inConstruct: "phrasing" },
  {
    character: " ",
    inConstruct: ["codeFencedLangGraveAccent", "codeFencedLangTilde"]
  },
  // An exclamation mark can start an image, if it is followed by a link or
  // a link reference.
  {
    character: "!",
    after: "\\[",
    inConstruct: "phrasing",
    notInConstruct: Mt
  },
  // A quote can break out of a title.
  { character: '"', inConstruct: "titleQuote" },
  // A number sign could start an ATX heading if it starts a line.
  { atBreak: !0, character: "#" },
  { character: "#", inConstruct: "headingAtx", after: `(?:[\r
]|$)` },
  // Dollar sign and percentage are not used in markdown.
  // An ampersand could start a character reference.
  { character: "&", after: "[#A-Za-z]", inConstruct: "phrasing" },
  // An apostrophe can break out of a title.
  { character: "'", inConstruct: "titleApostrophe" },
  // A left paren could break out of a destination raw.
  { character: "(", inConstruct: "destinationRaw" },
  // A left paren followed by `]` could make something into a link or image.
  {
    before: "\\]",
    character: "(",
    inConstruct: "phrasing",
    notInConstruct: Mt
  },
  // A right paren could start a list item or break out of a destination
  // raw.
  { atBreak: !0, before: "\\d+", character: ")" },
  { character: ")", inConstruct: "destinationRaw" },
  // An asterisk can start thematic breaks, list items, emphasis, strong.
  { atBreak: !0, character: "*", after: `(?:[ 	\r
*])` },
  { character: "*", inConstruct: "phrasing", notInConstruct: Mt },
  // A plus sign could start a list item.
  { atBreak: !0, character: "+", after: `(?:[ 	\r
])` },
  // A dash can start thematic breaks, list items, and setext heading
  // underlines.
  { atBreak: !0, character: "-", after: `(?:[ 	\r
-])` },
  // A dot could start a list item.
  { atBreak: !0, before: "\\d+", character: ".", after: `(?:[ 	\r
]|$)` },
  // Slash, colon, and semicolon are not used in markdown for constructs.
  // A less than can start html (flow or text) or an autolink.
  // HTML could start with an exclamation mark (declaration, cdata, comment),
  // slash (closing tag), question mark (instruction), or a letter (tag).
  // An autolink also starts with a letter.
  // Finally, it could break out of a destination literal.
  { atBreak: !0, character: "<", after: "[!/?A-Za-z]" },
  {
    character: "<",
    after: "[!/?A-Za-z]",
    inConstruct: "phrasing",
    notInConstruct: Mt
  },
  { character: "<", inConstruct: "destinationLiteral" },
  // An equals to can start setext heading underlines.
  { atBreak: !0, character: "=" },
  // A greater than can start block quotes and it can break out of a
  // destination literal.
  { atBreak: !0, character: ">" },
  { character: ">", inConstruct: "destinationLiteral" },
  // Question mark and at sign are not used in markdown for constructs.
  // A left bracket can start definitions, references, labels,
  { atBreak: !0, character: "[" },
  { character: "[", inConstruct: "phrasing", notInConstruct: Mt },
  { character: "[", inConstruct: ["label", "reference"] },
  // A backslash can start an escape (when followed by punctuation) or a
  // hard break (when followed by an eol).
  // Note: typical escapes are handled in `safe`!
  { character: "\\", after: "[\\r\\n]", inConstruct: "phrasing" },
  // A right bracket can exit labels.
  { character: "]", inConstruct: ["label", "reference"] },
  // Caret is not used in markdown for constructs.
  // An underscore can start emphasis, strong, or a thematic break.
  { atBreak: !0, character: "_" },
  { character: "_", inConstruct: "phrasing", notInConstruct: Mt },
  // A grave accent can start code (fenced or text), or it can break out of
  // a grave accent code fence.
  { atBreak: !0, character: "`" },
  {
    character: "`",
    inConstruct: ["codeFencedLangGraveAccent", "codeFencedMetaGraveAccent"]
  },
  { character: "`", inConstruct: "phrasing", notInConstruct: Mt },
  // Left brace, vertical bar, right brace are not used in markdown for
  // constructs.
  // A tilde can start code (fenced).
  { atBreak: !0, character: "~" }
], fo = document.createElement("i");
function ni(e) {
  const t = "&" + e + ";";
  fo.innerHTML = t;
  const n = fo.textContent;
  return n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n;
}
function pl(e, t) {
  const n = Number.parseInt(e, t);
  return (
    // C0 except for HT, LF, FF, CR, space
    n < 9 || n === 11 || n > 13 && n < 32 || // Control character (DEL) of the basic block and C1 controls.
    n > 126 && n < 160 || // Lone high surrogates and low surrogates.
    n > 55295 && n < 57344 || // Noncharacters.
    n > 64975 && n < 65008 || (n & 65535) === 65535 || (n & 65535) === 65534 || // Out of range
    n > 1114111 ? "�" : String.fromCharCode(n)
  );
}
const Vf = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function dl(e) {
  return e.replace(Vf, Xf);
}
function Xf(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), s = i === 120 || i === 88;
    return pl(n.slice(s ? 2 : 1), s ? 16 : 10);
  }
  return ni(n) || e;
}
function Zf(e) {
  return e.label || !e.identifier ? e.label || "" : dl(e.identifier);
}
function Jf(e, t, n) {
  const r = t.indexStack, i = e.children || [], s = [];
  let o = -1, a = n.before;
  r.push(-1);
  let u = t.createTracker(n);
  for (; ++o < i.length; ) {
    const c = i[o];
    let f;
    if (r[r.length - 1] = o, o + 1 < i.length) {
      let h = t.handle.handlers[i[o + 1].type];
      h && h.peek && (h = h.peek), f = h ? h(i[o + 1], e, t, {
        before: "",
        after: "",
        ...u.current()
      }).charAt(0) : "";
    } else
      f = n.after;
    s.length > 0 && (a === "\r" || a === `
`) && c.type === "html" && (s[s.length - 1] = s[s.length - 1].replace(
      /(\r?\n|\r)$/,
      " "
    ), a = " ", u = t.createTracker(n), u.move(s.join(""))), s.push(
      u.move(
        t.handle(c, e, t, {
          ...u.current(),
          before: a,
          after: f
        })
      )
    ), a = s[s.length - 1].slice(-1);
  }
  return r.pop(), s.join("");
}
function eh(e, t, n) {
  const r = t.indexStack, i = e.children || [], s = t.createTracker(n), o = [];
  let a = -1;
  for (r.push(-1); ++a < i.length; ) {
    const u = i[a];
    r[r.length - 1] = a, o.push(
      s.move(
        t.handle(u, e, t, {
          before: `
`,
          after: `
`,
          ...s.current()
        })
      )
    ), u.type !== "list" && (t.bulletLastUsed = void 0), a < i.length - 1 && o.push(
      s.move(th(u, i[a + 1], e, t))
    );
  }
  return r.pop(), o.join("");
}
function th(e, t, n, r) {
  let i = r.join.length;
  for (; i--; ) {
    const s = r.join[i](e, t, n, r);
    if (s === !0 || s === 1)
      break;
    if (typeof s == "number")
      return `
`.repeat(1 + s);
    if (s === !1)
      return `

<!---->

`;
  }
  return `

`;
}
const nh = /\r?\n|\r/g;
function rh(e, t) {
  const n = [];
  let r = 0, i = 0, s;
  for (; s = nh.exec(e); )
    o(e.slice(r, s.index)), n.push(s[0]), r = s.index + s[0].length, i++;
  return o(e.slice(r)), n.join("");
  function o(a) {
    n.push(t(a, i, !a));
  }
}
function ih(e, t, n) {
  const r = (n.before || "") + (t || "") + (n.after || ""), i = [], s = [], o = {};
  let a = -1;
  for (; ++a < e.unsafe.length; ) {
    const f = e.unsafe[a];
    if (!Ja(e.stack, f))
      continue;
    const h = sl(f);
    let E;
    for (; E = h.exec(r); ) {
      const g = "before" in f || Boolean(f.atBreak), A = "after" in f, _ = E.index + (g ? E[1].length : 0);
      i.includes(_) ? (o[_].before && !g && (o[_].before = !1), o[_].after && !A && (o[_].after = !1)) : (i.push(_), o[_] = { before: g, after: A });
    }
  }
  i.sort(sh);
  let u = n.before ? n.before.length : 0;
  const c = r.length - (n.after ? n.after.length : 0);
  for (a = -1; ++a < i.length; ) {
    const f = i[a];
    f < u || f >= c || f + 1 < c && i[a + 1] === f + 1 && o[f].after && !o[f + 1].before && !o[f + 1].after || i[a - 1] === f - 1 && o[f].before && !o[f - 1].before && !o[f - 1].after || (u !== f && s.push(ho(r.slice(u, f), "\\")), u = f, /[!-/:-@[-`{-~]/.test(r.charAt(f)) && (!n.encode || !n.encode.includes(r.charAt(f))) ? s.push("\\") : (s.push(
      "&#x" + r.charCodeAt(f).toString(16).toUpperCase() + ";"
    ), u++));
  }
  return s.push(ho(r.slice(u, c), n.after)), s.join("");
}
function sh(e, t) {
  return e - t;
}
function ho(e, t) {
  const n = /\\(?=[!-/:-@[-`{-~])/g, r = [], i = [], s = e + t;
  let o = -1, a = 0, u;
  for (; u = n.exec(s); )
    r.push(u.index);
  for (; ++o < r.length; )
    a !== r[o] && i.push(e.slice(a, r[o])), i.push("\\"), a = r[o];
  return i.push(e.slice(a)), i.join("");
}
function oh(e) {
  const t = e || {}, n = t.now || {};
  let r = t.lineShift || 0, i = n.line || 1, s = n.column || 1;
  return { move: u, current: o, shift: a };
  function o() {
    return { now: { line: i, column: s }, lineShift: r };
  }
  function a(c) {
    r += c;
  }
  function u(c) {
    const f = c || "", h = f.split(/\r?\n|\r/g), E = h[h.length - 1];
    return i += h.length - 1, s = h.length === 1 ? s + E.length : 1 + E.length + r, f;
  }
}
function ah(e, t = {}) {
  const n = {
    enter: i,
    indentLines: rh,
    associationId: Zf,
    containerPhrasing: fh,
    containerFlow: hh,
    createTracker: oh,
    safe: ph,
    stack: [],
    unsafe: [],
    join: [],
    // @ts-expect-error: we’ll fill it next.
    handlers: {},
    options: {},
    indexStack: [],
    // @ts-expect-error: we’ll add `handle` later.
    handle: void 0
  };
  fn(n, { unsafe: Wf, join: Qf, handlers: jf }), fn(n, t), n.options.tightDefinitions && fn(n, { join: [ch] }), n.handle = s1("type", {
    invalid: lh,
    unknown: uh,
    handlers: n.handlers
  });
  let r = n.handle(e, void 0, n, {
    before: `
`,
    after: `
`,
    now: { line: 1, column: 1 },
    lineShift: 0
  });
  return r && r.charCodeAt(r.length - 1) !== 10 && r.charCodeAt(r.length - 1) !== 13 && (r += `
`), r;
  function i(s) {
    return n.stack.push(s), o;
    function o() {
      n.stack.pop();
    }
  }
}
function lh(e) {
  throw new Error("Cannot handle value `" + e + "`, expected node");
}
function uh(e) {
  throw new Error("Cannot handle unknown node `" + e.type + "`");
}
function ch(e, t) {
  if (e.type === "definition" && e.type === t.type)
    return 0;
}
function fh(e, t) {
  return Jf(e, this, t);
}
function hh(e, t) {
  return eh(e, this, t);
}
function ph(e, t) {
  return ih(this, e, t);
}
function dh(e) {
  Object.assign(this, { Compiler: (n) => {
    const r = (
      /** @type {Options} */
      this.data("settings")
    );
    return ah(
      n,
      Object.assign({}, r, e, {
        // Note: this option is not in the readme.
        // The goal is for it to be set by plugins on `data` instead of being
        // passed by users.
        extensions: (
          /** @type {ToMarkdownOptions['extensions']} */
          this.data("toMarkdownExtensions") || []
        )
      })
    );
  } });
}
const ml = [
  "area",
  "base",
  "basefont",
  "bgsound",
  "br",
  "col",
  "command",
  "embed",
  "frame",
  "hr",
  "image",
  "img",
  "input",
  "isindex",
  "keygen",
  "link",
  "menuitem",
  "meta",
  "nextid",
  "param",
  "source",
  "track",
  "wbr"
];
function mh(e, t) {
  if (e = e.replace(
    t.subset ? Th(t.subset) : /["&'<>`]/g,
    r
  ), t.subset || t.escapeOnly)
    return e;
  return e.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, n).replace(
    // eslint-disable-next-line no-control-regex, unicorn/no-hex-escape
    /[\x01-\t\v\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g,
    r
  );
  function n(i, s, o) {
    return t.format(
      (i.charCodeAt(0) - 55296) * 1024 + i.charCodeAt(1) - 56320 + 65536,
      o.charCodeAt(s + 2),
      t
    );
  }
  function r(i, s, o) {
    return t.format(
      i.charCodeAt(0),
      o.charCodeAt(s + 1),
      t
    );
  }
}
function Th(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t.push(e[n].replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"));
  return new RegExp("(?:" + t.join("|") + ")", "g");
}
function Eh(e, t, n) {
  const r = "&#x" + e.toString(16).toUpperCase();
  return n && t && !/[\dA-Fa-f]/.test(String.fromCharCode(t)) ? r : r + ";";
}
function gh(e, t, n) {
  const r = "&#" + String(e);
  return n && t && !/\d/.test(String.fromCharCode(t)) ? r : r + ";";
}
const _h = [
  "AElig",
  "AMP",
  "Aacute",
  "Acirc",
  "Agrave",
  "Aring",
  "Atilde",
  "Auml",
  "COPY",
  "Ccedil",
  "ETH",
  "Eacute",
  "Ecirc",
  "Egrave",
  "Euml",
  "GT",
  "Iacute",
  "Icirc",
  "Igrave",
  "Iuml",
  "LT",
  "Ntilde",
  "Oacute",
  "Ocirc",
  "Ograve",
  "Oslash",
  "Otilde",
  "Ouml",
  "QUOT",
  "REG",
  "THORN",
  "Uacute",
  "Ucirc",
  "Ugrave",
  "Uuml",
  "Yacute",
  "aacute",
  "acirc",
  "acute",
  "aelig",
  "agrave",
  "amp",
  "aring",
  "atilde",
  "auml",
  "brvbar",
  "ccedil",
  "cedil",
  "cent",
  "copy",
  "curren",
  "deg",
  "divide",
  "eacute",
  "ecirc",
  "egrave",
  "eth",
  "euml",
  "frac12",
  "frac14",
  "frac34",
  "gt",
  "iacute",
  "icirc",
  "iexcl",
  "igrave",
  "iquest",
  "iuml",
  "laquo",
  "lt",
  "macr",
  "micro",
  "middot",
  "nbsp",
  "not",
  "ntilde",
  "oacute",
  "ocirc",
  "ograve",
  "ordf",
  "ordm",
  "oslash",
  "otilde",
  "ouml",
  "para",
  "plusmn",
  "pound",
  "quot",
  "raquo",
  "reg",
  "sect",
  "shy",
  "sup1",
  "sup2",
  "sup3",
  "szlig",
  "thorn",
  "times",
  "uacute",
  "ucirc",
  "ugrave",
  "uml",
  "uuml",
  "yacute",
  "yen",
  "yuml"
], pr = {
  nbsp: " ",
  iexcl: "¡",
  cent: "¢",
  pound: "£",
  curren: "¤",
  yen: "¥",
  brvbar: "¦",
  sect: "§",
  uml: "¨",
  copy: "©",
  ordf: "ª",
  laquo: "«",
  not: "¬",
  shy: "­",
  reg: "®",
  macr: "¯",
  deg: "°",
  plusmn: "±",
  sup2: "²",
  sup3: "³",
  acute: "´",
  micro: "µ",
  para: "¶",
  middot: "·",
  cedil: "¸",
  sup1: "¹",
  ordm: "º",
  raquo: "»",
  frac14: "¼",
  frac12: "½",
  frac34: "¾",
  iquest: "¿",
  Agrave: "À",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Auml: "Ä",
  Aring: "Å",
  AElig: "Æ",
  Ccedil: "Ç",
  Egrave: "È",
  Eacute: "É",
  Ecirc: "Ê",
  Euml: "Ë",
  Igrave: "Ì",
  Iacute: "Í",
  Icirc: "Î",
  Iuml: "Ï",
  ETH: "Ð",
  Ntilde: "Ñ",
  Ograve: "Ò",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Ouml: "Ö",
  times: "×",
  Oslash: "Ø",
  Ugrave: "Ù",
  Uacute: "Ú",
  Ucirc: "Û",
  Uuml: "Ü",
  Yacute: "Ý",
  THORN: "Þ",
  szlig: "ß",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  eth: "ð",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  divide: "÷",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  thorn: "þ",
  yuml: "ÿ",
  fnof: "ƒ",
  Alpha: "Α",
  Beta: "Β",
  Gamma: "Γ",
  Delta: "Δ",
  Epsilon: "Ε",
  Zeta: "Ζ",
  Eta: "Η",
  Theta: "Θ",
  Iota: "Ι",
  Kappa: "Κ",
  Lambda: "Λ",
  Mu: "Μ",
  Nu: "Ν",
  Xi: "Ξ",
  Omicron: "Ο",
  Pi: "Π",
  Rho: "Ρ",
  Sigma: "Σ",
  Tau: "Τ",
  Upsilon: "Υ",
  Phi: "Φ",
  Chi: "Χ",
  Psi: "Ψ",
  Omega: "Ω",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  omicron: "ο",
  pi: "π",
  rho: "ρ",
  sigmaf: "ς",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  thetasym: "ϑ",
  upsih: "ϒ",
  piv: "ϖ",
  bull: "•",
  hellip: "…",
  prime: "′",
  Prime: "″",
  oline: "‾",
  frasl: "⁄",
  weierp: "℘",
  image: "ℑ",
  real: "ℜ",
  trade: "™",
  alefsym: "ℵ",
  larr: "←",
  uarr: "↑",
  rarr: "→",
  darr: "↓",
  harr: "↔",
  crarr: "↵",
  lArr: "⇐",
  uArr: "⇑",
  rArr: "⇒",
  dArr: "⇓",
  hArr: "⇔",
  forall: "∀",
  part: "∂",
  exist: "∃",
  empty: "∅",
  nabla: "∇",
  isin: "∈",
  notin: "∉",
  ni: "∋",
  prod: "∏",
  sum: "∑",
  minus: "−",
  lowast: "∗",
  radic: "√",
  prop: "∝",
  infin: "∞",
  ang: "∠",
  and: "∧",
  or: "∨",
  cap: "∩",
  cup: "∪",
  int: "∫",
  there4: "∴",
  sim: "∼",
  cong: "≅",
  asymp: "≈",
  ne: "≠",
  equiv: "≡",
  le: "≤",
  ge: "≥",
  sub: "⊂",
  sup: "⊃",
  nsub: "⊄",
  sube: "⊆",
  supe: "⊇",
  oplus: "⊕",
  otimes: "⊗",
  perp: "⊥",
  sdot: "⋅",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  lang: "〈",
  rang: "〉",
  loz: "◊",
  spades: "♠",
  clubs: "♣",
  hearts: "♥",
  diams: "♦",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  OElig: "Œ",
  oelig: "œ",
  Scaron: "Š",
  scaron: "š",
  Yuml: "Ÿ",
  circ: "ˆ",
  tilde: "˜",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  zwnj: "‌",
  zwj: "‍",
  lrm: "‎",
  rlm: "‏",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  sbquo: "‚",
  ldquo: "“",
  rdquo: "”",
  bdquo: "„",
  dagger: "†",
  Dagger: "‡",
  permil: "‰",
  lsaquo: "‹",
  rsaquo: "›",
  euro: "€"
}, Ah = [
  "cent",
  "copy",
  "divide",
  "gt",
  "lt",
  "not",
  "para",
  "times"
], Tl = {}.hasOwnProperty, kr = {};
let nn;
for (nn in pr)
  Tl.call(pr, nn) && (kr[pr[nn]] = nn);
function Ch(e, t, n, r) {
  const i = String.fromCharCode(e);
  if (Tl.call(kr, i)) {
    const s = kr[i], o = "&" + s;
    return n && _h.includes(s) && !Ah.includes(s) && (!r || t && t !== 61 && /[^\da-z]/i.test(String.fromCharCode(t))) ? o : o + ";";
  }
  return "";
}
function Nh(e, t, n) {
  let r = Eh(e, t, n.omitOptionalSemicolons), i;
  if ((n.useNamedReferences || n.useShortestReferences) && (i = Ch(
    e,
    t,
    n.omitOptionalSemicolons,
    n.attribute
  )), (n.useShortestReferences || !i) && n.useShortestReferences) {
    const s = gh(e, t, n.omitOptionalSemicolons);
    s.length < r.length && (r = s);
  }
  return i && (!n.useShortestReferences || i.length < r.length) ? i : r;
}
function Jt(e, t) {
  return mh(e, Object.assign({ format: Nh }, t));
}
function Sh(e, t, n, r) {
  return r.settings.bogusComments ? "<?" + Jt(
    e.value,
    Object.assign({}, r.settings.characterReferences, { subset: [">"] })
  ) + ">" : "<!--" + e.value.replace(/^>|^->|<!--|-->|--!>|<!-$/g, i) + "-->";
  function i(s) {
    return Jt(
      s,
      Object.assign({}, r.settings.characterReferences, {
        subset: ["<", ">"]
      })
    );
  }
}
function yh(e, t, n, r) {
  return "<!" + (r.settings.upperDoctype ? "DOCTYPE" : "doctype") + (r.settings.tightDoctype ? "" : " ") + "html>";
}
function po(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
const ce = gl(1), El = gl(-1);
function gl(e) {
  return t;
  function t(n, r, i) {
    const s = n ? n.children : [];
    let o = (r || 0) + e, a = s && s[o];
    if (!i)
      for (; a && Ot(a); )
        o += e, a = s[o];
    return a;
  }
}
const Ih = {}.hasOwnProperty;
function _l(e) {
  return t;
  function t(n, r, i) {
    return Ih.call(e, n.tagName) && e[n.tagName](n, r, i);
  }
}
const ri = _l({
  html: Oh,
  head: dr,
  body: xh,
  p: bh,
  li: Rh,
  dt: kh,
  dd: Lh,
  rt: mo,
  rp: mo,
  optgroup: Mh,
  option: Ph,
  menuitem: Dh,
  colgroup: dr,
  caption: dr,
  thead: wh,
  tbody: Fh,
  tfoot: Hh,
  tr: Bh,
  td: To,
  th: To
});
function dr(e, t, n) {
  const r = ce(n, t, !0);
  return !r || r.type !== "comment" && !(r.type === "text" && Ot(r.value.charAt(0)));
}
function Oh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type !== "comment";
}
function xh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type !== "comment";
}
function bh(e, t, n) {
  const r = ce(n, t);
  return r ? r.type === "element" && (r.tagName === "address" || r.tagName === "article" || r.tagName === "aside" || r.tagName === "blockquote" || r.tagName === "details" || r.tagName === "div" || r.tagName === "dl" || r.tagName === "fieldset" || r.tagName === "figcaption" || r.tagName === "figure" || r.tagName === "footer" || r.tagName === "form" || r.tagName === "h1" || r.tagName === "h2" || r.tagName === "h3" || r.tagName === "h4" || r.tagName === "h5" || r.tagName === "h6" || r.tagName === "header" || r.tagName === "hgroup" || r.tagName === "hr" || r.tagName === "main" || r.tagName === "menu" || r.tagName === "nav" || r.tagName === "ol" || r.tagName === "p" || r.tagName === "pre" || r.tagName === "section" || r.tagName === "table" || r.tagName === "ul") : !n || // Confusing parent.
  !(n.type === "element" && (n.tagName === "a" || n.tagName === "audio" || n.tagName === "del" || n.tagName === "ins" || n.tagName === "map" || n.tagName === "noscript" || n.tagName === "video"));
}
function Rh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && r.tagName === "li";
}
function kh(e, t, n) {
  const r = ce(n, t);
  return r && r.type === "element" && (r.tagName === "dt" || r.tagName === "dd");
}
function Lh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && (r.tagName === "dt" || r.tagName === "dd");
}
function mo(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && (r.tagName === "rp" || r.tagName === "rt");
}
function Mh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && r.tagName === "optgroup";
}
function Ph(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && (r.tagName === "option" || r.tagName === "optgroup");
}
function Dh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && (r.tagName === "menuitem" || r.tagName === "hr" || r.tagName === "menu");
}
function wh(e, t, n) {
  const r = ce(n, t);
  return r && r.type === "element" && (r.tagName === "tbody" || r.tagName === "tfoot");
}
function Fh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && (r.tagName === "tbody" || r.tagName === "tfoot");
}
function Hh(e, t, n) {
  return !ce(n, t);
}
function Bh(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && r.tagName === "tr";
}
function To(e, t, n) {
  const r = ce(n, t);
  return !r || r.type === "element" && (r.tagName === "td" || r.tagName === "th");
}
const Uh = _l({
  html: vh,
  head: Gh,
  body: Kh,
  colgroup: zh,
  tbody: $h
});
function vh(e) {
  const t = ce(e, -1);
  return !t || t.type !== "comment";
}
function Gh(e) {
  const t = e.children, n = [];
  let r = -1;
  for (; ++r < t.length; ) {
    const i = t[r];
    if (i.type === "element" && (i.tagName === "title" || i.tagName === "base")) {
      if (n.includes(i.tagName))
        return !1;
      n.push(i.tagName);
    }
  }
  return t.length > 0;
}
function Kh(e) {
  const t = ce(e, -1, !0);
  return !t || t.type !== "comment" && !(t.type === "text" && Ot(t.value.charAt(0))) && !(t.type === "element" && (t.tagName === "meta" || t.tagName === "link" || t.tagName === "script" || t.tagName === "style" || t.tagName === "template"));
}
function zh(e, t, n) {
  const r = El(n, t), i = ce(e, -1, !0);
  return n && r && r.type === "element" && r.tagName === "colgroup" && ri(r, n.children.indexOf(r), n) ? !1 : i && i.type === "element" && i.tagName === "col";
}
function $h(e, t, n) {
  const r = El(n, t), i = ce(e, -1);
  return n && r && r.type === "element" && (r.tagName === "thead" || r.tagName === "tbody") && ri(r, n.children.indexOf(r), n) ? !1 : i && i.type === "element" && i.tagName === "tr";
}
const rn = {
  // See: <https://html.spec.whatwg.org/#attribute-name-state>.
  name: [
    [`	
\f\r &/=>`.split(""), `	
\f\r "&'/=>\``.split("")],
    [`\0	
\f\r "&'/<=>`.split(""), `\0	
\f\r "&'/<=>\``.split("")]
  ],
  // See: <https://html.spec.whatwg.org/#attribute-value-(unquoted)-state>.
  unquoted: [
    [`	
\f\r &>`.split(""), `\0	
\f\r "&'<=>\``.split("")],
    [`\0	
\f\r "&'<=>\``.split(""), `\0	
\f\r "&'<=>\``.split("")]
  ],
  // See: <https://html.spec.whatwg.org/#attribute-value-(single-quoted)-state>.
  single: [
    ["&'".split(""), "\"&'`".split("")],
    ["\0&'".split(""), "\0\"&'`".split("")]
  ],
  // See: <https://html.spec.whatwg.org/#attribute-value-(double-quoted)-state>.
  double: [
    ['"&'.split(""), "\"&'`".split("")],
    ['\0"&'.split(""), "\0\"&'`".split("")]
  ]
};
function Yh(e, t, n, r) {
  const i = r.schema, s = i.space === "svg" ? !1 : r.settings.omitOptionalTags;
  let o = i.space === "svg" ? r.settings.closeEmptyElements : r.settings.voids.includes(e.tagName.toLowerCase());
  const a = [];
  let u;
  i.space === "html" && e.tagName === "svg" && (r.schema = dt);
  const c = jh(r, e.properties), f = r.all(
    i.space === "html" && e.tagName === "template" ? e.content : e
  );
  return r.schema = i, f && (o = !1), (c || !s || !Uh(e, t, n)) && (a.push("<", e.tagName, c ? " " + c : ""), o && (i.space === "svg" || r.settings.closeSelfClosing) && (u = c.charAt(c.length - 1), (!r.settings.tightSelfClosing || u === "/" || u && u !== '"' && u !== "'") && a.push(" "), a.push("/")), a.push(">")), a.push(f), !o && (!s || !ri(e, t, n)) && a.push("</" + e.tagName + ">"), a.join("");
}
function jh(e, t) {
  const n = [];
  let r = -1, i;
  if (t) {
    for (i in t)
      if (t[i] !== void 0 && t[i] !== null) {
        const s = Qh(e, i, t[i]);
        s && n.push(s);
      }
  }
  for (; ++r < n.length; ) {
    const s = e.settings.tightAttributes ? n[r].charAt(n[r].length - 1) : null;
    r !== n.length - 1 && s !== '"' && s !== "'" && (n[r] += " ");
  }
  return n.join("");
}
function Qh(e, t, n) {
  const r = F1(e.schema, t), i = e.settings.allowParseErrors && e.schema.space === "html" ? 0 : 1, s = e.settings.allowDangerousCharacters ? 0 : 1;
  let o = e.quote, a;
  if (r.overloadedBoolean && (n === r.attribute || n === "") ? n = !0 : (r.boolean || r.overloadedBoolean && typeof n != "string") && (n = Boolean(n)), n == null || n === !1 || typeof n == "number" && Number.isNaN(n))
    return "";
  const u = Jt(
    r.attribute,
    Object.assign({}, e.settings.characterReferences, {
      // Always encode without parse errors in non-HTML.
      subset: rn.name[i][s]
    })
  );
  return n === !0 || (n = Array.isArray(n) ? (r.commaSeparated ? qr : Qr)(n, {
    padLeft: !e.settings.tightCommaSeparatedLists
  }) : String(n), e.settings.collapseEmptyAttributes && !n) ? u : (e.settings.preferUnquoted && (a = Jt(
    n,
    Object.assign({}, e.settings.characterReferences, {
      subset: rn.unquoted[i][s],
      attribute: !0
    })
  )), a !== n && (e.settings.quoteSmart && po(n, o) > po(n, e.alternative) && (o = e.alternative), a = o + Jt(
    n,
    Object.assign({}, e.settings.characterReferences, {
      // Always encode without parse errors in non-HTML.
      subset: (o === "'" ? rn.single : rn.double)[i][s],
      attribute: !0
    })
  ) + o), u + (a && "=" + a));
}
function Al(e, t, n, r) {
  return n && n.type === "element" && (n.tagName === "script" || n.tagName === "style") ? e.value : Jt(
    e.value,
    Object.assign({}, r.settings.characterReferences, {
      subset: ["<", "&"]
    })
  );
}
function qh(e, t, n, r) {
  return r.settings.allowDangerousHtml ? e.value : Al(e, t, n, r);
}
function Wh(e, t, n, r) {
  return r.all(e);
}
const Vh = s1("type", {
  invalid: Xh,
  unknown: Zh,
  handlers: { comment: Sh, doctype: yh, element: Yh, raw: qh, root: Wh, text: Al }
});
function Xh(e) {
  throw new Error("Expected node, not `" + e + "`");
}
function Zh(e) {
  throw new Error("Cannot compile unknown node `" + e.type + "`");
}
function Cl(e, t) {
  const n = t || {}, r = n.quote || '"', i = r === '"' ? "'" : '"';
  if (r !== '"' && r !== "'")
    throw new Error("Invalid quote `" + r + "`, expected `'` or `\"`");
  return {
    one: Jh,
    all: e4,
    settings: {
      omitOptionalTags: n.omitOptionalTags || !1,
      allowParseErrors: n.allowParseErrors || !1,
      allowDangerousCharacters: n.allowDangerousCharacters || !1,
      quoteSmart: n.quoteSmart || !1,
      preferUnquoted: n.preferUnquoted || !1,
      tightAttributes: n.tightAttributes || !1,
      upperDoctype: n.upperDoctype || !1,
      tightDoctype: n.tightDoctype || !1,
      bogusComments: n.bogusComments || !1,
      tightCommaSeparatedLists: n.tightCommaSeparatedLists || !1,
      tightSelfClosing: n.tightSelfClosing || !1,
      collapseEmptyAttributes: n.collapseEmptyAttributes || !1,
      allowDangerousHtml: n.allowDangerousHtml || !1,
      voids: n.voids || ml,
      characterReferences: n.characterReferences || n.entities || {},
      closeSelfClosing: n.closeSelfClosing || !1,
      closeEmptyElements: n.closeEmptyElements || !1
    },
    schema: n.space === "svg" ? dt : r1,
    quote: r,
    alternative: i
  }.one(
    Array.isArray(e) ? { type: "root", children: e } : e,
    void 0,
    void 0
  );
}
function Jh(e, t, n) {
  return Vh(e, t, n, this);
}
function e4(e) {
  const t = [], n = e && e.children || [];
  let r = -1;
  for (; ++r < n.length; )
    t[r] = this.one(n[r], r, e);
  return t.join("");
}
const t4 = zo().use($9, { fragment: !0 }).use(mf, {
  handlers: {
    figure(e, t) {
      return e(
        t,
        "html",
        Cl(t, {
          closeSelfClosing: !0,
          closeEmptyElements: !0,
          tightSelfClosing: !1
        })
      );
    }
  }
}).use(dh, {
  bullet: "*",
  listItemIndent: "one",
  rule: "-",
  emphasis: "_"
}), q8 = async (e) => {
  const t = await t4.process(e);
  return String(t);
};
function nt(e, t, n, r) {
  const i = e.length;
  let s = 0, o;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    o = Array.from(r), o.unshift(t, n), [].splice.apply(e, o);
  else
    for (n && [].splice.apply(e, [t, n]); s < r.length; )
      o = r.slice(s, s + 1e4), o.unshift(t, 0), [].splice.apply(e, o), s += 1e4, t += 1e4;
}
function Me(e, t) {
  return e.length > 0 ? (nt(e, e.length, 0, t), e) : t;
}
const Eo = {}.hasOwnProperty;
function n4(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    r4(t, e[n]);
  return t;
}
function r4(e, t) {
  let n;
  for (n in t) {
    const i = (Eo.call(e, n) ? e[n] : void 0) || (e[n] = {}), s = t[n];
    let o;
    for (o in s) {
      Eo.call(i, o) || (i[o] = []);
      const a = s[o];
      i4(
        // @ts-expect-error Looks like a list.
        i[o],
        Array.isArray(a) ? a : a ? [a] : []
      );
    }
  }
}
function i4(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  nt(e, 0, 0, r);
}
const s4 = /[!-/:-@[-`{-~\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/, et = bt(/[A-Za-z]/), Lr = bt(/\d/), o4 = bt(/[\dA-Fa-f]/), Re = bt(/[\dA-Za-z]/), a4 = bt(/[!-/:-@[-`{-~]/), go = bt(/[#-'*+\--9=?A-Z^-~]/);
function Mr(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
function De(e) {
  return e !== null && (e < 0 || e === 32);
}
function K(e) {
  return e !== null && e < -2;
}
function ue(e) {
  return e === -2 || e === -1 || e === 32;
}
const l4 = bt(/\s/), u4 = bt(s4);
function bt(e) {
  return t;
  function t(n) {
    return n !== null && e.test(String.fromCharCode(n));
  }
}
function ee(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let s = 0;
  return o;
  function o(u) {
    return ue(u) ? (e.enter(n), a(u)) : t(u);
  }
  function a(u) {
    return ue(u) && s++ < i ? (e.consume(u), a) : (e.exit(n), t(u));
  }
}
const c4 = {
  tokenize: f4
};
function f4(e) {
  const t = e.attempt(
    this.parser.constructs.contentInitial,
    r,
    i
  );
  let n;
  return t;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), ee(e, t, "linePrefix");
  }
  function i(a) {
    return e.enter("paragraph"), s(a);
  }
  function s(a) {
    const u = e.enter("chunkText", {
      contentType: "text",
      previous: n
    });
    return n && (n.next = u), n = u, o(a);
  }
  function o(a) {
    if (a === null) {
      e.exit("chunkText"), e.exit("paragraph"), e.consume(a);
      return;
    }
    return K(a) ? (e.consume(a), e.exit("chunkText"), s) : (e.consume(a), o);
  }
}
const h4 = {
  tokenize: p4
}, _o = {
  tokenize: d4
};
function p4(e) {
  const t = this, n = [];
  let r = 0, i, s, o;
  return a;
  function a(L) {
    if (r < n.length) {
      const B = n[r];
      return t.containerState = B[1], e.attempt(
        B[0].continuation,
        u,
        c
      )(L);
    }
    return c(L);
  }
  function u(L) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && D();
      const B = t.events.length;
      let U = B, C;
      for (; U--; )
        if (t.events[U][0] === "exit" && t.events[U][1].type === "chunkFlow") {
          C = t.events[U][1].end;
          break;
        }
      N(r);
      let x = B;
      for (; x < t.events.length; )
        t.events[x][1].end = Object.assign({}, C), x++;
      return nt(
        t.events,
        U + 1,
        0,
        t.events.slice(B)
      ), t.events.length = x, c(L);
    }
    return a(L);
  }
  function c(L) {
    if (r === n.length) {
      if (!i)
        return E(L);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return A(L);
      t.interrupt = Boolean(
        i.currentConstruct && !i._gfmTableDynamicInterruptHack
      );
    }
    return t.containerState = {}, e.check(
      _o,
      f,
      h
    )(L);
  }
  function f(L) {
    return i && D(), N(r), E(L);
  }
  function h(L) {
    return t.parser.lazy[t.now().line] = r !== n.length, o = t.now().offset, A(L);
  }
  function E(L) {
    return t.containerState = {}, e.attempt(
      _o,
      g,
      A
    )(L);
  }
  function g(L) {
    return r++, n.push([t.currentConstruct, t.containerState]), E(L);
  }
  function A(L) {
    if (L === null) {
      i && D(), N(0), e.consume(L);
      return;
    }
    return i = i || t.parser.flow(t.now()), e.enter("chunkFlow", {
      contentType: "flow",
      previous: s,
      _tokenizer: i
    }), _(L);
  }
  function _(L) {
    if (L === null) {
      b(e.exit("chunkFlow"), !0), N(0), e.consume(L);
      return;
    }
    return K(L) ? (e.consume(L), b(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, a) : (e.consume(L), _);
  }
  function b(L, B) {
    const U = t.sliceStream(L);
    if (B && U.push(null), L.previous = s, s && (s.next = L), s = L, i.defineSkip(L.start), i.write(U), t.parser.lazy[L.start.line]) {
      let C = i.events.length;
      for (; C--; )
        if (
          // The token starts before the line ending…
          i.events[C][1].start.offset < o && // …and either is not ended yet…
          (!i.events[C][1].end || // …or ends after it.
          i.events[C][1].end.offset > o)
        )
          return;
      const x = t.events.length;
      let w = x, z, ie;
      for (; w--; )
        if (t.events[w][0] === "exit" && t.events[w][1].type === "chunkFlow") {
          if (z) {
            ie = t.events[w][1].end;
            break;
          }
          z = !0;
        }
      for (N(r), C = x; C < t.events.length; )
        t.events[C][1].end = Object.assign({}, ie), C++;
      nt(
        t.events,
        w + 1,
        0,
        t.events.slice(x)
      ), t.events.length = C;
    }
  }
  function N(L) {
    let B = n.length;
    for (; B-- > L; ) {
      const U = n[B];
      t.containerState = U[1], U[0].exit.call(t, e);
    }
    n.length = L;
  }
  function D() {
    i.write([null]), s = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function d4(e, t, n) {
  return ee(
    e,
    e.attempt(this.parser.constructs.document, t, n),
    "linePrefix",
    this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4
  );
}
function Ao(e) {
  if (e === null || De(e) || l4(e))
    return 1;
  if (u4(e))
    return 2;
}
function ii(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const s = e[i].resolveAll;
    s && !r.includes(s) && (t = s(t, n), r.push(s));
  }
  return t;
}
const Pr = {
  name: "attention",
  tokenize: T4,
  resolveAll: m4
};
function m4(e, t) {
  let n = -1, r, i, s, o, a, u, c, f;
  for (; ++n < e.length; )
    if (e[n][0] === "enter" && e[n][1].type === "attentionSequence" && e[n][1]._close) {
      for (r = n; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        t.sliceSerialize(e[r][1]).charCodeAt(0) === t.sliceSerialize(e[n][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[n][1]._open) && (e[n][1].end.offset - e[n][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[n][1].end.offset - e[n][1].start.offset) % 3))
            continue;
          u = e[r][1].end.offset - e[r][1].start.offset > 1 && e[n][1].end.offset - e[n][1].start.offset > 1 ? 2 : 1;
          const h = Object.assign({}, e[r][1].end), E = Object.assign({}, e[n][1].start);
          Co(h, -u), Co(E, u), o = {
            type: u > 1 ? "strongSequence" : "emphasisSequence",
            start: h,
            end: Object.assign({}, e[r][1].end)
          }, a = {
            type: u > 1 ? "strongSequence" : "emphasisSequence",
            start: Object.assign({}, e[n][1].start),
            end: E
          }, s = {
            type: u > 1 ? "strongText" : "emphasisText",
            start: Object.assign({}, e[r][1].end),
            end: Object.assign({}, e[n][1].start)
          }, i = {
            type: u > 1 ? "strong" : "emphasis",
            start: Object.assign({}, o.start),
            end: Object.assign({}, a.end)
          }, e[r][1].end = Object.assign({}, o.start), e[n][1].start = Object.assign({}, a.end), c = [], e[r][1].end.offset - e[r][1].start.offset && (c = Me(c, [
            ["enter", e[r][1], t],
            ["exit", e[r][1], t]
          ])), c = Me(c, [
            ["enter", i, t],
            ["enter", o, t],
            ["exit", o, t],
            ["enter", s, t]
          ]), c = Me(
            c,
            ii(
              t.parser.constructs.insideSpan.null,
              e.slice(r + 1, n),
              t
            )
          ), c = Me(c, [
            ["exit", s, t],
            ["enter", a, t],
            ["exit", a, t],
            ["exit", i, t]
          ]), e[n][1].end.offset - e[n][1].start.offset ? (f = 2, c = Me(c, [
            ["enter", e[n][1], t],
            ["exit", e[n][1], t]
          ])) : f = 0, nt(e, r - 1, n - r + 3, c), n = r + c.length - f - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function T4(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = Ao(r);
  let s;
  return o;
  function o(u) {
    return e.enter("attentionSequence"), s = u, a(u);
  }
  function a(u) {
    if (u === s)
      return e.consume(u), a;
    const c = e.exit("attentionSequence"), f = Ao(u), h = !f || f === 2 && i || n.includes(u), E = !i || i === 2 && f || n.includes(r);
    return c._open = Boolean(s === 42 ? h : h && (i || !E)), c._close = Boolean(s === 42 ? E : E && (f || !h)), t(u);
  }
}
function Co(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const E4 = {
  name: "autolink",
  tokenize: g4
};
function g4(e, t, n) {
  let r = 1;
  return i;
  function i(A) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(A), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), s;
  }
  function s(A) {
    return et(A) ? (e.consume(A), o) : go(A) ? c(A) : n(A);
  }
  function o(A) {
    return A === 43 || A === 45 || A === 46 || Re(A) ? a(A) : c(A);
  }
  function a(A) {
    return A === 58 ? (e.consume(A), u) : (A === 43 || A === 45 || A === 46 || Re(A)) && r++ < 32 ? (e.consume(A), a) : c(A);
  }
  function u(A) {
    return A === 62 ? (e.exit("autolinkProtocol"), g(A)) : A === null || A === 32 || A === 60 || Mr(A) ? n(A) : (e.consume(A), u);
  }
  function c(A) {
    return A === 64 ? (e.consume(A), r = 0, f) : go(A) ? (e.consume(A), c) : n(A);
  }
  function f(A) {
    return Re(A) ? h(A) : n(A);
  }
  function h(A) {
    return A === 46 ? (e.consume(A), r = 0, f) : A === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", g(A)) : E(A);
  }
  function E(A) {
    return (A === 45 || Re(A)) && r++ < 63 ? (e.consume(A), A === 45 ? E : h) : n(A);
  }
  function g(A) {
    return e.enter("autolinkMarker"), e.consume(A), e.exit("autolinkMarker"), e.exit("autolink"), t;
  }
}
const Dn = {
  tokenize: _4,
  partial: !0
};
function _4(e, t, n) {
  return ee(e, r, "linePrefix");
  function r(i) {
    return i === null || K(i) ? t(i) : n(i);
  }
}
const Nl = {
  name: "blockQuote",
  tokenize: A4,
  continuation: {
    tokenize: C4
  },
  exit: N4
};
function A4(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    if (o === 62) {
      const a = r.containerState;
      return a.open || (e.enter("blockQuote", {
        _container: !0
      }), a.open = !0), e.enter("blockQuotePrefix"), e.enter("blockQuoteMarker"), e.consume(o), e.exit("blockQuoteMarker"), s;
    }
    return n(o);
  }
  function s(o) {
    return ue(o) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(o), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(o));
  }
}
function C4(e, t, n) {
  return ee(
    e,
    e.attempt(Nl, t, n),
    "linePrefix",
    this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4
  );
}
function N4(e) {
  e.exit("blockQuote");
}
const Sl = {
  name: "characterEscape",
  tokenize: S4
};
function S4(e, t, n) {
  return r;
  function r(s) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(s), e.exit("escapeMarker"), i;
  }
  function i(s) {
    return a4(s) ? (e.enter("characterEscapeValue"), e.consume(s), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(s);
  }
}
const yl = {
  name: "characterReference",
  tokenize: y4
};
function y4(e, t, n) {
  const r = this;
  let i = 0, s, o;
  return a;
  function a(h) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(h), e.exit("characterReferenceMarker"), u;
  }
  function u(h) {
    return h === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(h), e.exit("characterReferenceMarkerNumeric"), c) : (e.enter("characterReferenceValue"), s = 31, o = Re, f(h));
  }
  function c(h) {
    return h === 88 || h === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(h), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), s = 6, o = o4, f) : (e.enter("characterReferenceValue"), s = 7, o = Lr, f(h));
  }
  function f(h) {
    let E;
    return h === 59 && i ? (E = e.exit("characterReferenceValue"), o === Re && !ni(r.sliceSerialize(E)) ? n(h) : (e.enter("characterReferenceMarker"), e.consume(h), e.exit("characterReferenceMarker"), e.exit("characterReference"), t)) : o(h) && i++ < s ? (e.consume(h), f) : n(h);
  }
}
const No = {
  name: "codeFenced",
  tokenize: I4,
  concrete: !0
};
function I4(e, t, n) {
  const r = this, i = {
    tokenize: U,
    partial: !0
  }, s = {
    tokenize: B,
    partial: !0
  }, o = this.events[this.events.length - 1], a = o && o[1].type === "linePrefix" ? o[2].sliceSerialize(o[1], !0).length : 0;
  let u = 0, c;
  return f;
  function f(C) {
    return e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), c = C, h(C);
  }
  function h(C) {
    return C === c ? (e.consume(C), u++, h) : (e.exit("codeFencedFenceSequence"), u < 3 ? n(C) : ee(e, E, "whitespace")(C));
  }
  function E(C) {
    return C === null || K(C) ? b(C) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), g(C));
  }
  function g(C) {
    return C === null || De(C) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), ee(e, A, "whitespace")(C)) : C === 96 && C === c ? n(C) : (e.consume(C), g);
  }
  function A(C) {
    return C === null || K(C) ? b(C) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), _(C));
  }
  function _(C) {
    return C === null || K(C) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), b(C)) : C === 96 && C === c ? n(C) : (e.consume(C), _);
  }
  function b(C) {
    return e.exit("codeFencedFence"), r.interrupt ? t(C) : N(C);
  }
  function N(C) {
    return C === null ? L(C) : K(C) ? e.attempt(
      s,
      e.attempt(
        i,
        L,
        a ? ee(
          e,
          N,
          "linePrefix",
          a + 1
        ) : N
      ),
      L
    )(C) : (e.enter("codeFlowValue"), D(C));
  }
  function D(C) {
    return C === null || K(C) ? (e.exit("codeFlowValue"), N(C)) : (e.consume(C), D);
  }
  function L(C) {
    return e.exit("codeFenced"), t(C);
  }
  function B(C, x, w) {
    const z = this;
    return ie;
    function ie(v) {
      return C.enter("lineEnding"), C.consume(v), C.exit("lineEnding"), M;
    }
    function M(v) {
      return z.parser.lazy[z.now().line] ? w(v) : x(v);
    }
  }
  function U(C, x, w) {
    let z = 0;
    return ee(
      C,
      ie,
      "linePrefix",
      this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4
    );
    function ie(W) {
      return C.enter("codeFencedFence"), C.enter("codeFencedFenceSequence"), M(W);
    }
    function M(W) {
      return W === c ? (C.consume(W), z++, M) : z < u ? w(W) : (C.exit("codeFencedFenceSequence"), ee(C, v, "whitespace")(W));
    }
    function v(W) {
      return W === null || K(W) ? (C.exit("codeFencedFence"), x(W)) : w(W);
    }
  }
}
const mr = {
  name: "codeIndented",
  tokenize: x4
}, O4 = {
  tokenize: b4,
  partial: !0
};
function x4(e, t, n) {
  const r = this;
  return i;
  function i(c) {
    return e.enter("codeIndented"), ee(e, s, "linePrefix", 4 + 1)(c);
  }
  function s(c) {
    const f = r.events[r.events.length - 1];
    return f && f[1].type === "linePrefix" && f[2].sliceSerialize(f[1], !0).length >= 4 ? o(c) : n(c);
  }
  function o(c) {
    return c === null ? u(c) : K(c) ? e.attempt(O4, o, u)(c) : (e.enter("codeFlowValue"), a(c));
  }
  function a(c) {
    return c === null || K(c) ? (e.exit("codeFlowValue"), o(c)) : (e.consume(c), a);
  }
  function u(c) {
    return e.exit("codeIndented"), t(c);
  }
}
function b4(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return r.parser.lazy[r.now().line] ? n(o) : K(o) ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), i) : ee(e, s, "linePrefix", 4 + 1)(o);
  }
  function s(o) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(o) : K(o) ? i(o) : n(o);
  }
}
const R4 = {
  name: "codeText",
  tokenize: M4,
  resolve: k4,
  previous: L4
};
function k4(e) {
  let t = e.length - 4, n = 3, r, i;
  if ((e[n][1].type === "lineEnding" || e[n][1].type === "space") && (e[t][1].type === "lineEnding" || e[t][1].type === "space")) {
    for (r = n; ++r < t; )
      if (e[r][1].type === "codeTextData") {
        e[n][1].type = "codeTextPadding", e[t][1].type = "codeTextPadding", n += 2, t -= 2;
        break;
      }
  }
  for (r = n - 1, t++; ++r <= t; )
    i === void 0 ? r !== t && e[r][1].type !== "lineEnding" && (i = r) : (r === t || e[r][1].type === "lineEnding") && (e[i][1].type = "codeTextData", r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), t -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function L4(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function M4(e, t, n) {
  let r = 0, i, s;
  return o;
  function o(h) {
    return e.enter("codeText"), e.enter("codeTextSequence"), a(h);
  }
  function a(h) {
    return h === 96 ? (e.consume(h), r++, a) : (e.exit("codeTextSequence"), u(h));
  }
  function u(h) {
    return h === null ? n(h) : h === 96 ? (s = e.enter("codeTextSequence"), i = 0, f(h)) : h === 32 ? (e.enter("space"), e.consume(h), e.exit("space"), u) : K(h) ? (e.enter("lineEnding"), e.consume(h), e.exit("lineEnding"), u) : (e.enter("codeTextData"), c(h));
  }
  function c(h) {
    return h === null || h === 32 || h === 96 || K(h) ? (e.exit("codeTextData"), u(h)) : (e.consume(h), c);
  }
  function f(h) {
    return h === 96 ? (e.consume(h), i++, f) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(h)) : (s.type = "codeTextData", c(h));
  }
}
function Il(e) {
  const t = {};
  let n = -1, r, i, s, o, a, u, c;
  for (; ++n < e.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = e[n], n && r[1].type === "chunkFlow" && e[n - 1][1].type === "listItemPrefix" && (u = r[1]._tokenizer.events, s = 0, s < u.length && u[s][1].type === "lineEndingBlank" && (s += 2), s < u.length && u[s][1].type === "content"))
      for (; ++s < u.length && u[s][1].type !== "content"; )
        u[s][1].type === "chunkText" && (u[s][1]._isInFirstContentOfListItem = !0, s++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, P4(e, n)), n = t[n], c = !0);
    else if (r[1]._container) {
      for (s = n, i = void 0; s-- && (o = e[s], o[1].type === "lineEnding" || o[1].type === "lineEndingBlank"); )
        o[0] === "enter" && (i && (e[i][1].type = "lineEndingBlank"), o[1].type = "lineEnding", i = s);
      i && (r[1].end = Object.assign({}, e[i][1].start), a = e.slice(i, n), a.unshift(r), nt(e, i, n - i + 1, a));
    }
  }
  return !c;
}
function P4(e, t) {
  const n = e[t][1], r = e[t][2];
  let i = t - 1;
  const s = [], o = n._tokenizer || r.parser[n.contentType](n.start), a = o.events, u = [], c = {};
  let f, h, E = -1, g = n, A = 0, _ = 0;
  const b = [_];
  for (; g; ) {
    for (; e[++i][1] !== g; )
      ;
    s.push(i), g._tokenizer || (f = r.sliceStream(g), g.next || f.push(null), h && o.defineSkip(g.start), g._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = !0), o.write(f), g._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = void 0)), h = g, g = g.next;
  }
  for (g = n; ++E < a.length; )
    // Find a void token that includes a break.
    a[E][0] === "exit" && a[E - 1][0] === "enter" && a[E][1].type === a[E - 1][1].type && a[E][1].start.line !== a[E][1].end.line && (_ = E + 1, b.push(_), g._tokenizer = void 0, g.previous = void 0, g = g.next);
  for (o.events = [], g ? (g._tokenizer = void 0, g.previous = void 0) : b.pop(), E = b.length; E--; ) {
    const N = a.slice(b[E], b[E + 1]), D = s.pop();
    u.unshift([D, D + N.length - 1]), nt(e, D, 2, N);
  }
  for (E = -1; ++E < u.length; )
    c[A + u[E][0]] = A + u[E][1], A += u[E][1] - u[E][0] - 1;
  return c;
}
const D4 = {
  tokenize: H4,
  resolve: F4
}, w4 = {
  tokenize: B4,
  partial: !0
};
function F4(e) {
  return Il(e), e;
}
function H4(e, t) {
  let n;
  return r;
  function r(a) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(a);
  }
  function i(a) {
    return a === null ? s(a) : K(a) ? e.check(
      w4,
      o,
      s
    )(a) : (e.consume(a), i);
  }
  function s(a) {
    return e.exit("chunkContent"), e.exit("content"), t(a);
  }
  function o(a) {
    return e.consume(a), e.exit("chunkContent"), n.next = e.enter("chunkContent", {
      contentType: "content",
      previous: n
    }), n = n.next, i;
  }
}
function B4(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), ee(e, s, "linePrefix");
  }
  function s(o) {
    if (o === null || K(o))
      return n(o);
    const a = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(o) : e.interrupt(r.parser.constructs.flow, n, t)(o);
  }
}
function Ol(e, t, n, r, i, s, o, a, u) {
  const c = u || Number.POSITIVE_INFINITY;
  let f = 0;
  return h;
  function h(N) {
    return N === 60 ? (e.enter(r), e.enter(i), e.enter(s), e.consume(N), e.exit(s), E) : N === null || N === 41 || Mr(N) ? n(N) : (e.enter(r), e.enter(o), e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), _(N));
  }
  function E(N) {
    return N === 62 ? (e.enter(s), e.consume(N), e.exit(s), e.exit(i), e.exit(r), t) : (e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), g(N));
  }
  function g(N) {
    return N === 62 ? (e.exit("chunkString"), e.exit(a), E(N)) : N === null || N === 60 || K(N) ? n(N) : (e.consume(N), N === 92 ? A : g);
  }
  function A(N) {
    return N === 60 || N === 62 || N === 92 ? (e.consume(N), g) : g(N);
  }
  function _(N) {
    return N === 40 ? ++f > c ? n(N) : (e.consume(N), _) : N === 41 ? f-- ? (e.consume(N), _) : (e.exit("chunkString"), e.exit(a), e.exit(o), e.exit(r), t(N)) : N === null || De(N) ? f ? n(N) : (e.exit("chunkString"), e.exit(a), e.exit(o), e.exit(r), t(N)) : Mr(N) ? n(N) : (e.consume(N), N === 92 ? b : _);
  }
  function b(N) {
    return N === 40 || N === 41 || N === 92 ? (e.consume(N), _) : _(N);
  }
}
function xl(e, t, n, r, i, s) {
  const o = this;
  let a = 0, u;
  return c;
  function c(g) {
    return e.enter(r), e.enter(i), e.consume(g), e.exit(i), e.enter(s), f;
  }
  function f(g) {
    return g === null || g === 91 || g === 93 && !u || /* To do: remove in the future once we’ve switched from
     * `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
     * which doesn’t need this */
    /* Hidden footnotes hook */
    /* c8 ignore next 3 */
    g === 94 && !a && "_hiddenFootnoteSupport" in o.parser.constructs || a > 999 ? n(g) : g === 93 ? (e.exit(s), e.enter(i), e.consume(g), e.exit(i), e.exit(r), t) : K(g) ? (e.enter("lineEnding"), e.consume(g), e.exit("lineEnding"), f) : (e.enter("chunkString", {
      contentType: "string"
    }), h(g));
  }
  function h(g) {
    return g === null || g === 91 || g === 93 || K(g) || a++ > 999 ? (e.exit("chunkString"), f(g)) : (e.consume(g), u = u || !ue(g), g === 92 ? E : h);
  }
  function E(g) {
    return g === 91 || g === 92 || g === 93 ? (e.consume(g), a++, h) : h(g);
  }
}
function bl(e, t, n, r, i, s) {
  let o;
  return a;
  function a(E) {
    return e.enter(r), e.enter(i), e.consume(E), e.exit(i), o = E === 40 ? 41 : E, u;
  }
  function u(E) {
    return E === o ? (e.enter(i), e.consume(E), e.exit(i), e.exit(r), t) : (e.enter(s), c(E));
  }
  function c(E) {
    return E === o ? (e.exit(s), u(o)) : E === null ? n(E) : K(E) ? (e.enter("lineEnding"), e.consume(E), e.exit("lineEnding"), ee(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), f(E));
  }
  function f(E) {
    return E === o || E === null || K(E) ? (e.exit("chunkString"), c(E)) : (e.consume(E), E === 92 ? h : f);
  }
  function h(E) {
    return E === o || E === 92 ? (e.consume(E), f) : f(E);
  }
}
function R1(e, t) {
  let n;
  return r;
  function r(i) {
    return K(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : ue(i) ? ee(
      e,
      r,
      n ? "linePrefix" : "lineSuffix"
    )(i) : t(i);
  }
}
function e1(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const U4 = {
  name: "definition",
  tokenize: G4
}, v4 = {
  tokenize: K4,
  partial: !0
};
function G4(e, t, n) {
  const r = this;
  let i;
  return s;
  function s(u) {
    return e.enter("definition"), xl.call(
      r,
      e,
      o,
      n,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(u);
  }
  function o(u) {
    return i = e1(
      r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)
    ), u === 58 ? (e.enter("definitionMarker"), e.consume(u), e.exit("definitionMarker"), R1(
      e,
      Ol(
        e,
        e.attempt(
          v4,
          ee(e, a, "whitespace"),
          ee(e, a, "whitespace")
        ),
        n,
        "definitionDestination",
        "definitionDestinationLiteral",
        "definitionDestinationLiteralMarker",
        "definitionDestinationRaw",
        "definitionDestinationString"
      )
    )) : n(u);
  }
  function a(u) {
    return u === null || K(u) ? (e.exit("definition"), r.parser.defined.includes(i) || r.parser.defined.push(i), t(u)) : n(u);
  }
}
function K4(e, t, n) {
  return r;
  function r(o) {
    return De(o) ? R1(e, i)(o) : n(o);
  }
  function i(o) {
    return o === 34 || o === 39 || o === 40 ? bl(
      e,
      ee(e, s, "whitespace"),
      n,
      "definitionTitle",
      "definitionTitleMarker",
      "definitionTitleString"
    )(o) : n(o);
  }
  function s(o) {
    return o === null || K(o) ? t(o) : n(o);
  }
}
const z4 = {
  name: "hardBreakEscape",
  tokenize: $4
};
function $4(e, t, n) {
  return r;
  function r(s) {
    return e.enter("hardBreakEscape"), e.enter("escapeMarker"), e.consume(s), i;
  }
  function i(s) {
    return K(s) ? (e.exit("escapeMarker"), e.exit("hardBreakEscape"), t(s)) : n(s);
  }
}
const Y4 = {
  name: "headingAtx",
  tokenize: Q4,
  resolve: j4
};
function j4(e, t) {
  let n = e.length - 2, r = 3, i, s;
  return e[r][1].type === "whitespace" && (r += 2), n - 2 > r && e[n][1].type === "whitespace" && (n -= 2), e[n][1].type === "atxHeadingSequence" && (r === n - 1 || n - 4 > r && e[n - 2][1].type === "whitespace") && (n -= r + 1 === n ? 2 : 4), n > r && (i = {
    type: "atxHeadingText",
    start: e[r][1].start,
    end: e[n][1].end
  }, s = {
    type: "chunkText",
    start: e[r][1].start,
    end: e[n][1].end,
    // @ts-expect-error Constants are fine to assign.
    contentType: "text"
  }, nt(e, r, n - r + 1, [
    ["enter", i, t],
    ["enter", s, t],
    ["exit", s, t],
    ["exit", i, t]
  ])), e;
}
function Q4(e, t, n) {
  const r = this;
  let i = 0;
  return s;
  function s(f) {
    return e.enter("atxHeading"), e.enter("atxHeadingSequence"), o(f);
  }
  function o(f) {
    return f === 35 && i++ < 6 ? (e.consume(f), o) : f === null || De(f) ? (e.exit("atxHeadingSequence"), r.interrupt ? t(f) : a(f)) : n(f);
  }
  function a(f) {
    return f === 35 ? (e.enter("atxHeadingSequence"), u(f)) : f === null || K(f) ? (e.exit("atxHeading"), t(f)) : ue(f) ? ee(e, a, "whitespace")(f) : (e.enter("atxHeadingText"), c(f));
  }
  function u(f) {
    return f === 35 ? (e.consume(f), u) : (e.exit("atxHeadingSequence"), a(f));
  }
  function c(f) {
    return f === null || f === 35 || De(f) ? (e.exit("atxHeadingText"), a(f)) : (e.consume(f), c);
  }
}
const q4 = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], So = ["pre", "script", "style", "textarea"], W4 = {
  name: "htmlFlow",
  tokenize: Z4,
  resolveTo: X4,
  concrete: !0
}, V4 = {
  tokenize: J4,
  partial: !0
};
function X4(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function Z4(e, t, n) {
  const r = this;
  let i, s, o, a, u;
  return c;
  function c(m) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(m), f;
  }
  function f(m) {
    return m === 33 ? (e.consume(m), h) : m === 47 ? (e.consume(m), A) : m === 63 ? (e.consume(m), i = 3, r.interrupt ? t : Ne) : et(m) ? (e.consume(m), o = String.fromCharCode(m), s = !0, _) : n(m);
  }
  function h(m) {
    return m === 45 ? (e.consume(m), i = 2, E) : m === 91 ? (e.consume(m), i = 5, o = "CDATA[", a = 0, g) : et(m) ? (e.consume(m), i = 4, r.interrupt ? t : Ne) : n(m);
  }
  function E(m) {
    return m === 45 ? (e.consume(m), r.interrupt ? t : Ne) : n(m);
  }
  function g(m) {
    return m === o.charCodeAt(a++) ? (e.consume(m), a === o.length ? r.interrupt ? t : M : g) : n(m);
  }
  function A(m) {
    return et(m) ? (e.consume(m), o = String.fromCharCode(m), _) : n(m);
  }
  function _(m) {
    return m === null || m === 47 || m === 62 || De(m) ? m !== 47 && s && So.includes(o.toLowerCase()) ? (i = 1, r.interrupt ? t(m) : M(m)) : q4.includes(o.toLowerCase()) ? (i = 6, m === 47 ? (e.consume(m), b) : r.interrupt ? t(m) : M(m)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(m) : s ? D(m) : N(m)) : m === 45 || Re(m) ? (e.consume(m), o += String.fromCharCode(m), _) : n(m);
  }
  function b(m) {
    return m === 62 ? (e.consume(m), r.interrupt ? t : M) : n(m);
  }
  function N(m) {
    return ue(m) ? (e.consume(m), N) : z(m);
  }
  function D(m) {
    return m === 47 ? (e.consume(m), z) : m === 58 || m === 95 || et(m) ? (e.consume(m), L) : ue(m) ? (e.consume(m), D) : z(m);
  }
  function L(m) {
    return m === 45 || m === 46 || m === 58 || m === 95 || Re(m) ? (e.consume(m), L) : B(m);
  }
  function B(m) {
    return m === 61 ? (e.consume(m), U) : ue(m) ? (e.consume(m), B) : D(m);
  }
  function U(m) {
    return m === null || m === 60 || m === 61 || m === 62 || m === 96 ? n(m) : m === 34 || m === 39 ? (e.consume(m), u = m, C) : ue(m) ? (e.consume(m), U) : (u = null, x(m));
  }
  function C(m) {
    return m === null || K(m) ? n(m) : m === u ? (e.consume(m), w) : (e.consume(m), C);
  }
  function x(m) {
    return m === null || m === 34 || m === 39 || m === 60 || m === 61 || m === 62 || m === 96 || De(m) ? B(m) : (e.consume(m), x);
  }
  function w(m) {
    return m === 47 || m === 62 || ue(m) ? D(m) : n(m);
  }
  function z(m) {
    return m === 62 ? (e.consume(m), ie) : n(m);
  }
  function ie(m) {
    return ue(m) ? (e.consume(m), ie) : m === null || K(m) ? M(m) : n(m);
  }
  function M(m) {
    return m === 45 && i === 2 ? (e.consume(m), Be) : m === 60 && i === 1 ? (e.consume(m), We) : m === 62 && i === 4 ? (e.consume(m), fe) : m === 63 && i === 3 ? (e.consume(m), Ne) : m === 93 && i === 5 ? (e.consume(m), me) : K(m) && (i === 6 || i === 7) ? e.check(
      V4,
      fe,
      v
    )(m) : m === null || K(m) ? v(m) : (e.consume(m), M);
  }
  function v(m) {
    return e.exit("htmlFlowData"), W(m);
  }
  function W(m) {
    return m === null ? T(m) : K(m) ? e.attempt(
      {
        tokenize: Ee,
        partial: !0
      },
      W,
      T
    )(m) : (e.enter("htmlFlowData"), M(m));
  }
  function Ee(m, Ut, u1) {
    return vt;
    function vt(ve) {
      return m.enter("lineEnding"), m.consume(ve), m.exit("lineEnding"), he;
    }
    function he(ve) {
      return r.parser.lazy[r.now().line] ? u1(ve) : Ut(ve);
    }
  }
  function Be(m) {
    return m === 45 ? (e.consume(m), Ne) : M(m);
  }
  function We(m) {
    return m === 47 ? (e.consume(m), o = "", Ue) : M(m);
  }
  function Ue(m) {
    return m === 62 && So.includes(o.toLowerCase()) ? (e.consume(m), fe) : et(m) && o.length < 8 ? (e.consume(m), o += String.fromCharCode(m), Ue) : M(m);
  }
  function me(m) {
    return m === 93 ? (e.consume(m), Ne) : M(m);
  }
  function Ne(m) {
    return m === 62 ? (e.consume(m), fe) : m === 45 && i === 2 ? (e.consume(m), Ne) : M(m);
  }
  function fe(m) {
    return m === null || K(m) ? (e.exit("htmlFlowData"), T(m)) : (e.consume(m), fe);
  }
  function T(m) {
    return e.exit("htmlFlow"), t(m);
  }
}
function J4(e, t, n) {
  return r;
  function r(i) {
    return e.exit("htmlFlowData"), e.enter("lineEndingBlank"), e.consume(i), e.exit("lineEndingBlank"), e.attempt(Dn, t, n);
  }
}
const ep = {
  name: "htmlText",
  tokenize: tp
};
function tp(e, t, n) {
  const r = this;
  let i, s, o, a;
  return u;
  function u(T) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(T), c;
  }
  function c(T) {
    return T === 33 ? (e.consume(T), f) : T === 47 ? (e.consume(T), x) : T === 63 ? (e.consume(T), U) : et(T) ? (e.consume(T), ie) : n(T);
  }
  function f(T) {
    return T === 45 ? (e.consume(T), h) : T === 91 ? (e.consume(T), s = "CDATA[", o = 0, b) : et(T) ? (e.consume(T), B) : n(T);
  }
  function h(T) {
    return T === 45 ? (e.consume(T), E) : n(T);
  }
  function E(T) {
    return T === null || T === 62 ? n(T) : T === 45 ? (e.consume(T), g) : A(T);
  }
  function g(T) {
    return T === null || T === 62 ? n(T) : A(T);
  }
  function A(T) {
    return T === null ? n(T) : T === 45 ? (e.consume(T), _) : K(T) ? (a = A, me(T)) : (e.consume(T), A);
  }
  function _(T) {
    return T === 45 ? (e.consume(T), fe) : A(T);
  }
  function b(T) {
    return T === s.charCodeAt(o++) ? (e.consume(T), o === s.length ? N : b) : n(T);
  }
  function N(T) {
    return T === null ? n(T) : T === 93 ? (e.consume(T), D) : K(T) ? (a = N, me(T)) : (e.consume(T), N);
  }
  function D(T) {
    return T === 93 ? (e.consume(T), L) : N(T);
  }
  function L(T) {
    return T === 62 ? fe(T) : T === 93 ? (e.consume(T), L) : N(T);
  }
  function B(T) {
    return T === null || T === 62 ? fe(T) : K(T) ? (a = B, me(T)) : (e.consume(T), B);
  }
  function U(T) {
    return T === null ? n(T) : T === 63 ? (e.consume(T), C) : K(T) ? (a = U, me(T)) : (e.consume(T), U);
  }
  function C(T) {
    return T === 62 ? fe(T) : U(T);
  }
  function x(T) {
    return et(T) ? (e.consume(T), w) : n(T);
  }
  function w(T) {
    return T === 45 || Re(T) ? (e.consume(T), w) : z(T);
  }
  function z(T) {
    return K(T) ? (a = z, me(T)) : ue(T) ? (e.consume(T), z) : fe(T);
  }
  function ie(T) {
    return T === 45 || Re(T) ? (e.consume(T), ie) : T === 47 || T === 62 || De(T) ? M(T) : n(T);
  }
  function M(T) {
    return T === 47 ? (e.consume(T), fe) : T === 58 || T === 95 || et(T) ? (e.consume(T), v) : K(T) ? (a = M, me(T)) : ue(T) ? (e.consume(T), M) : fe(T);
  }
  function v(T) {
    return T === 45 || T === 46 || T === 58 || T === 95 || Re(T) ? (e.consume(T), v) : W(T);
  }
  function W(T) {
    return T === 61 ? (e.consume(T), Ee) : K(T) ? (a = W, me(T)) : ue(T) ? (e.consume(T), W) : M(T);
  }
  function Ee(T) {
    return T === null || T === 60 || T === 61 || T === 62 || T === 96 ? n(T) : T === 34 || T === 39 ? (e.consume(T), i = T, Be) : K(T) ? (a = Ee, me(T)) : ue(T) ? (e.consume(T), Ee) : (e.consume(T), i = void 0, Ue);
  }
  function Be(T) {
    return T === i ? (e.consume(T), We) : T === null ? n(T) : K(T) ? (a = Be, me(T)) : (e.consume(T), Be);
  }
  function We(T) {
    return T === 62 || T === 47 || De(T) ? M(T) : n(T);
  }
  function Ue(T) {
    return T === null || T === 34 || T === 39 || T === 60 || T === 61 || T === 96 ? n(T) : T === 62 || De(T) ? M(T) : (e.consume(T), Ue);
  }
  function me(T) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(T), e.exit("lineEnding"), ee(
      e,
      Ne,
      "linePrefix",
      r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4
    );
  }
  function Ne(T) {
    return e.enter("htmlTextData"), a(T);
  }
  function fe(T) {
    return T === 62 ? (e.consume(T), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(T);
  }
}
const si = {
  name: "labelEnd",
  tokenize: ap,
  resolveTo: op,
  resolveAll: sp
}, np = {
  tokenize: lp
}, rp = {
  tokenize: up
}, ip = {
  tokenize: cp
};
function sp(e) {
  let t = -1, n;
  for (; ++t < e.length; )
    n = e[t][1], (n.type === "labelImage" || n.type === "labelLink" || n.type === "labelEnd") && (e.splice(t + 1, n.type === "labelImage" ? 4 : 2), n.type = "data", t++);
  return e;
}
function op(e, t) {
  let n = e.length, r = 0, i, s, o, a;
  for (; n--; )
    if (i = e[n][1], s) {
      if (i.type === "link" || i.type === "labelLink" && i._inactive)
        break;
      e[n][0] === "enter" && i.type === "labelLink" && (i._inactive = !0);
    } else if (o) {
      if (e[n][0] === "enter" && (i.type === "labelImage" || i.type === "labelLink") && !i._balanced && (s = n, i.type !== "labelLink")) {
        r = 2;
        break;
      }
    } else
      i.type === "labelEnd" && (o = n);
  const u = {
    type: e[s][1].type === "labelLink" ? "link" : "image",
    start: Object.assign({}, e[s][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, c = {
    type: "label",
    start: Object.assign({}, e[s][1].start),
    end: Object.assign({}, e[o][1].end)
  }, f = {
    type: "labelText",
    start: Object.assign({}, e[s + r + 2][1].end),
    end: Object.assign({}, e[o - 2][1].start)
  };
  return a = [
    ["enter", u, t],
    ["enter", c, t]
  ], a = Me(a, e.slice(s + 1, s + r + 3)), a = Me(a, [["enter", f, t]]), a = Me(
    a,
    ii(
      t.parser.constructs.insideSpan.null,
      e.slice(s + r + 4, o - 3),
      t
    )
  ), a = Me(a, [
    ["exit", f, t],
    e[o - 2],
    e[o - 1],
    ["exit", c, t]
  ]), a = Me(a, e.slice(o + 1)), a = Me(a, [["exit", u, t]]), nt(e, s, e.length, a), e;
}
function ap(e, t, n) {
  const r = this;
  let i = r.events.length, s, o;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      s = r.events[i][1];
      break;
    }
  return a;
  function a(f) {
    return s ? s._inactive ? c(f) : (o = r.parser.defined.includes(
      e1(
        r.sliceSerialize({
          start: s.end,
          end: r.now()
        })
      )
    ), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(f), e.exit("labelMarker"), e.exit("labelEnd"), u) : n(f);
  }
  function u(f) {
    return f === 40 ? e.attempt(
      np,
      t,
      o ? t : c
    )(f) : f === 91 ? e.attempt(
      rp,
      t,
      o ? e.attempt(ip, t, c) : c
    )(f) : o ? t(f) : c(f);
  }
  function c(f) {
    return s._balanced = !0, n(f);
  }
}
function lp(e, t, n) {
  return r;
  function r(u) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(u), e.exit("resourceMarker"), R1(e, i);
  }
  function i(u) {
    return u === 41 ? a(u) : Ol(
      e,
      s,
      n,
      "resourceDestination",
      "resourceDestinationLiteral",
      "resourceDestinationLiteralMarker",
      "resourceDestinationRaw",
      "resourceDestinationString",
      32
    )(u);
  }
  function s(u) {
    return De(u) ? R1(e, o)(u) : a(u);
  }
  function o(u) {
    return u === 34 || u === 39 || u === 40 ? bl(
      e,
      R1(e, a),
      n,
      "resourceTitle",
      "resourceTitleMarker",
      "resourceTitleString"
    )(u) : a(u);
  }
  function a(u) {
    return u === 41 ? (e.enter("resourceMarker"), e.consume(u), e.exit("resourceMarker"), e.exit("resource"), t) : n(u);
  }
}
function up(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return xl.call(
      r,
      e,
      s,
      n,
      "reference",
      "referenceMarker",
      "referenceString"
    )(o);
  }
  function s(o) {
    return r.parser.defined.includes(
      e1(
        r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)
      )
    ) ? t(o) : n(o);
  }
}
function cp(e, t, n) {
  return r;
  function r(s) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(s), e.exit("referenceMarker"), i;
  }
  function i(s) {
    return s === 93 ? (e.enter("referenceMarker"), e.consume(s), e.exit("referenceMarker"), e.exit("reference"), t) : n(s);
  }
}
const fp = {
  name: "labelStartImage",
  tokenize: hp,
  resolveAll: si.resolveAll
};
function hp(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return e.enter("labelImage"), e.enter("labelImageMarker"), e.consume(a), e.exit("labelImageMarker"), s;
  }
  function s(a) {
    return a === 91 ? (e.enter("labelMarker"), e.consume(a), e.exit("labelMarker"), e.exit("labelImage"), o) : n(a);
  }
  function o(a) {
    return a === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(a) : t(a);
  }
}
const pp = {
  name: "labelStartLink",
  tokenize: dp,
  resolveAll: si.resolveAll
};
function dp(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(o), e.exit("labelMarker"), e.exit("labelLink"), s;
  }
  function s(o) {
    return o === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(o) : t(o);
  }
}
const Tr = {
  name: "lineEnding",
  tokenize: mp
};
function mp(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), ee(e, t, "linePrefix");
  }
}
const hn = {
  name: "thematicBreak",
  tokenize: Tp
};
function Tp(e, t, n) {
  let r = 0, i;
  return s;
  function s(u) {
    return e.enter("thematicBreak"), i = u, o(u);
  }
  function o(u) {
    return u === i ? (e.enter("thematicBreakSequence"), a(u)) : ue(u) ? ee(e, o, "whitespace")(u) : r < 3 || u !== null && !K(u) ? n(u) : (e.exit("thematicBreak"), t(u));
  }
  function a(u) {
    return u === i ? (e.consume(u), r++, a) : (e.exit("thematicBreakSequence"), o(u));
  }
}
const Ie = {
  name: "list",
  tokenize: _p,
  continuation: {
    tokenize: Ap
  },
  exit: Np
}, Ep = {
  tokenize: Sp,
  partial: !0
}, gp = {
  tokenize: Cp,
  partial: !0
};
function _p(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let s = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, o = 0;
  return a;
  function a(g) {
    const A = r.containerState.type || (g === 42 || g === 43 || g === 45 ? "listUnordered" : "listOrdered");
    if (A === "listUnordered" ? !r.containerState.marker || g === r.containerState.marker : Lr(g)) {
      if (r.containerState.type || (r.containerState.type = A, e.enter(A, {
        _container: !0
      })), A === "listUnordered")
        return e.enter("listItemPrefix"), g === 42 || g === 45 ? e.check(hn, n, c)(g) : c(g);
      if (!r.interrupt || g === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), u(g);
    }
    return n(g);
  }
  function u(g) {
    return Lr(g) && ++o < 10 ? (e.consume(g), u) : (!r.interrupt || o < 2) && (r.containerState.marker ? g === r.containerState.marker : g === 41 || g === 46) ? (e.exit("listItemValue"), c(g)) : n(g);
  }
  function c(g) {
    return e.enter("listItemMarker"), e.consume(g), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || g, e.check(
      Dn,
      // Can’t be empty when interrupting.
      r.interrupt ? n : f,
      e.attempt(
        Ep,
        E,
        h
      )
    );
  }
  function f(g) {
    return r.containerState.initialBlankLine = !0, s++, E(g);
  }
  function h(g) {
    return ue(g) ? (e.enter("listItemPrefixWhitespace"), e.consume(g), e.exit("listItemPrefixWhitespace"), E) : n(g);
  }
  function E(g) {
    return r.containerState.size = s + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(g);
  }
}
function Ap(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(Dn, i, s);
  function i(a) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, ee(
      e,
      t,
      "listItemIndent",
      r.containerState.size + 1
    )(a);
  }
  function s(a) {
    return r.containerState.furtherBlankLines || !ue(a) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, o(a)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(gp, t, o)(a));
  }
  function o(a) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, ee(
      e,
      e.attempt(Ie, t, n),
      "linePrefix",
      r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4
    )(a);
  }
}
function Cp(e, t, n) {
  const r = this;
  return ee(
    e,
    i,
    "listItemIndent",
    r.containerState.size + 1
  );
  function i(s) {
    const o = r.events[r.events.length - 1];
    return o && o[1].type === "listItemIndent" && o[2].sliceSerialize(o[1], !0).length === r.containerState.size ? t(s) : n(s);
  }
}
function Np(e) {
  e.exit(this.containerState.type);
}
function Sp(e, t, n) {
  const r = this;
  return ee(
    e,
    i,
    "listItemPrefixWhitespace",
    r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4 + 1
  );
  function i(s) {
    const o = r.events[r.events.length - 1];
    return !ue(s) && o && o[1].type === "listItemPrefixWhitespace" ? t(s) : n(s);
  }
}
const yo = {
  name: "setextUnderline",
  tokenize: Ip,
  resolveTo: yp
};
function yp(e, t) {
  let n = e.length, r, i, s;
  for (; n--; )
    if (e[n][0] === "enter") {
      if (e[n][1].type === "content") {
        r = n;
        break;
      }
      e[n][1].type === "paragraph" && (i = n);
    } else
      e[n][1].type === "content" && e.splice(n, 1), !s && e[n][1].type === "definition" && (s = n);
  const o = {
    type: "setextHeading",
    start: Object.assign({}, e[i][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  };
  return e[i][1].type = "setextHeadingText", s ? (e.splice(i, 0, ["enter", o, t]), e.splice(s + 1, 0, ["exit", e[r][1], t]), e[r][1].end = Object.assign({}, e[s][1].end)) : e[r][1] = o, e.push(["exit", o, t]), e;
}
function Ip(e, t, n) {
  const r = this;
  let i = r.events.length, s, o;
  for (; i--; )
    if (r.events[i][1].type !== "lineEnding" && r.events[i][1].type !== "linePrefix" && r.events[i][1].type !== "content") {
      o = r.events[i][1].type === "paragraph";
      break;
    }
  return a;
  function a(f) {
    return !r.parser.lazy[r.now().line] && (r.interrupt || o) ? (e.enter("setextHeadingLine"), e.enter("setextHeadingLineSequence"), s = f, u(f)) : n(f);
  }
  function u(f) {
    return f === s ? (e.consume(f), u) : (e.exit("setextHeadingLineSequence"), ee(e, c, "lineSuffix")(f));
  }
  function c(f) {
    return f === null || K(f) ? (e.exit("setextHeadingLine"), t(f)) : n(f);
  }
}
const Op = {
  tokenize: xp
};
function xp(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    Dn,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(
      this.parser.constructs.flowInitial,
      i,
      ee(
        e,
        e.attempt(
          this.parser.constructs.flow,
          i,
          e.attempt(D4, i)
        ),
        "linePrefix"
      )
    )
  );
  return n;
  function r(s) {
    if (s === null) {
      e.consume(s);
      return;
    }
    return e.enter("lineEndingBlank"), e.consume(s), e.exit("lineEndingBlank"), t.currentConstruct = void 0, n;
  }
  function i(s) {
    if (s === null) {
      e.consume(s);
      return;
    }
    return e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), t.currentConstruct = void 0, n;
  }
}
const bp = {
  resolveAll: kl()
}, Rp = Rl("string"), kp = Rl("text");
function Rl(e) {
  return {
    tokenize: t,
    resolveAll: kl(
      e === "text" ? Lp : void 0
    )
  };
  function t(n) {
    const r = this, i = this.parser.constructs[e], s = n.attempt(i, o, a);
    return o;
    function o(f) {
      return c(f) ? s(f) : a(f);
    }
    function a(f) {
      if (f === null) {
        n.consume(f);
        return;
      }
      return n.enter("data"), n.consume(f), u;
    }
    function u(f) {
      return c(f) ? (n.exit("data"), s(f)) : (n.consume(f), u);
    }
    function c(f) {
      if (f === null)
        return !0;
      const h = i[f];
      let E = -1;
      if (h)
        for (; ++E < h.length; ) {
          const g = h[E];
          if (!g.previous || g.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function kl(e) {
  return t;
  function t(n, r) {
    let i = -1, s;
    for (; ++i <= n.length; )
      s === void 0 ? n[i] && n[i][1].type === "data" && (s = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== s + 2 && (n[s][1].end = n[i - 1][1].end, n.splice(s + 2, i - s - 2), i = s + 2), s = void 0);
    return e ? e(n, r) : n;
  }
}
function Lp(e, t) {
  let n = 0;
  for (; ++n <= e.length; )
    if ((n === e.length || e[n][1].type === "lineEnding") && e[n - 1][1].type === "data") {
      const r = e[n - 1][1], i = t.sliceStream(r);
      let s = i.length, o = -1, a = 0, u;
      for (; s--; ) {
        const c = i[s];
        if (typeof c == "string") {
          for (o = c.length; c.charCodeAt(o - 1) === 32; )
            a++, o--;
          if (o)
            break;
          o = -1;
        } else if (c === -2)
          u = !0, a++;
        else if (c !== -1) {
          s++;
          break;
        }
      }
      if (a) {
        const c = {
          type: n === e.length || u || a < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            line: r.end.line,
            column: r.end.column - a,
            offset: r.end.offset - a,
            _index: r.start._index + s,
            _bufferIndex: s ? o : r.start._bufferIndex + o
          },
          end: Object.assign({}, r.end)
        };
        r.end = Object.assign({}, c.start), r.start.offset === r.end.offset ? Object.assign(r, c) : (e.splice(
          n,
          0,
          ["enter", c, t],
          ["exit", c, t]
        ), n += 2);
      }
      n++;
    }
  return e;
}
function Mp(e, t, n) {
  let r = Object.assign(
    n ? Object.assign({}, n) : {
      line: 1,
      column: 1,
      offset: 0
    },
    {
      _index: 0,
      _bufferIndex: -1
    }
  );
  const i = {}, s = [];
  let o = [], a = [];
  const u = {
    consume: D,
    enter: L,
    exit: B,
    attempt: x(U),
    check: x(C),
    interrupt: x(C, {
      interrupt: !0
    })
  }, c = {
    previous: null,
    code: null,
    containerState: {},
    events: [],
    parser: e,
    sliceStream: g,
    sliceSerialize: E,
    now: A,
    defineSkip: _,
    write: h
  };
  let f = t.tokenize.call(c, u);
  return t.resolveAll && s.push(t), c;
  function h(M) {
    return o = Me(o, M), b(), o[o.length - 1] !== null ? [] : (w(t, 0), c.events = ii(s, c.events, c), c.events);
  }
  function E(M, v) {
    return Dp(g(M), v);
  }
  function g(M) {
    return Pp(o, M);
  }
  function A() {
    return Object.assign({}, r);
  }
  function _(M) {
    i[M.line] = M.column, ie();
  }
  function b() {
    let M;
    for (; r._index < o.length; ) {
      const v = o[r._index];
      if (typeof v == "string")
        for (M = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === M && r._bufferIndex < v.length; )
          N(v.charCodeAt(r._bufferIndex));
      else
        N(v);
    }
  }
  function N(M) {
    f = f(M);
  }
  function D(M) {
    K(M) ? (r.line++, r.column = 1, r.offset += M === -3 ? 2 : 1, ie()) : M !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === o[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = M;
  }
  function L(M, v) {
    const W = v || {};
    return W.type = M, W.start = A(), c.events.push(["enter", W, c]), a.push(W), W;
  }
  function B(M) {
    const v = a.pop();
    return v.end = A(), c.events.push(["exit", v, c]), v;
  }
  function U(M, v) {
    w(M, v.from);
  }
  function C(M, v) {
    v.restore();
  }
  function x(M, v) {
    return W;
    function W(Ee, Be, We) {
      let Ue, me, Ne, fe;
      return Array.isArray(Ee) ? (
        /* c8 ignore next 1 */
        m(Ee)
      ) : "tokenize" in Ee ? m([Ee]) : T(Ee);
      function T(he) {
        return ve;
        function ve(mt) {
          const Gt = mt !== null && he[mt], Kt = mt !== null && he.null, Bn = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(Gt) ? Gt : Gt ? [Gt] : [],
            ...Array.isArray(Kt) ? Kt : Kt ? [Kt] : []
          ];
          return m(Bn)(mt);
        }
      }
      function m(he) {
        return Ue = he, me = 0, he.length === 0 ? We : Ut(he[me]);
      }
      function Ut(he) {
        return ve;
        function ve(mt) {
          return fe = z(), Ne = he, he.partial || (c.currentConstruct = he), he.name && c.parser.constructs.disable.null.includes(he.name) ? vt() : he.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            v ? Object.assign(Object.create(c), v) : c,
            u,
            u1,
            vt
          )(mt);
        }
      }
      function u1(he) {
        return M(Ne, fe), Be;
      }
      function vt(he) {
        return fe.restore(), ++me < Ue.length ? Ut(Ue[me]) : We;
      }
    }
  }
  function w(M, v) {
    M.resolveAll && !s.includes(M) && s.push(M), M.resolve && nt(
      c.events,
      v,
      c.events.length - v,
      M.resolve(c.events.slice(v), c)
    ), M.resolveTo && (c.events = M.resolveTo(c.events, c));
  }
  function z() {
    const M = A(), v = c.previous, W = c.currentConstruct, Ee = c.events.length, Be = Array.from(a);
    return {
      restore: We,
      from: Ee
    };
    function We() {
      r = M, c.previous = v, c.currentConstruct = W, c.events.length = Ee, a = Be, ie();
    }
  }
  function ie() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function Pp(e, t) {
  const n = t.start._index, r = t.start._bufferIndex, i = t.end._index, s = t.end._bufferIndex;
  let o;
  return n === i ? o = [e[n].slice(r, s)] : (o = e.slice(n, i), r > -1 && (o[0] = o[0].slice(r)), s > 0 && o.push(e[i].slice(0, s))), o;
}
function Dp(e, t) {
  let n = -1;
  const r = [];
  let i;
  for (; ++n < e.length; ) {
    const s = e[n];
    let o;
    if (typeof s == "string")
      o = s;
    else
      switch (s) {
        case -5: {
          o = "\r";
          break;
        }
        case -4: {
          o = `
`;
          break;
        }
        case -3: {
          o = `\r
`;
          break;
        }
        case -2: {
          o = t ? " " : "	";
          break;
        }
        case -1: {
          if (!t && i)
            continue;
          o = " ";
          break;
        }
        default:
          o = String.fromCharCode(s);
      }
    i = s === -2, r.push(o);
  }
  return r.join("");
}
const wp = {
  [42]: Ie,
  [43]: Ie,
  [45]: Ie,
  [48]: Ie,
  [49]: Ie,
  [50]: Ie,
  [51]: Ie,
  [52]: Ie,
  [53]: Ie,
  [54]: Ie,
  [55]: Ie,
  [56]: Ie,
  [57]: Ie,
  [62]: Nl
}, Fp = {
  [91]: U4
}, Hp = {
  [-2]: mr,
  [-1]: mr,
  [32]: mr
}, Bp = {
  [35]: Y4,
  [42]: hn,
  [45]: [yo, hn],
  [60]: W4,
  [61]: yo,
  [95]: hn,
  [96]: No,
  [126]: No
}, Up = {
  [38]: yl,
  [92]: Sl
}, vp = {
  [-5]: Tr,
  [-4]: Tr,
  [-3]: Tr,
  [33]: fp,
  [38]: yl,
  [42]: Pr,
  [60]: [E4, ep],
  [91]: pp,
  [92]: [z4, Sl],
  [93]: si,
  [95]: Pr,
  [96]: R4
}, Gp = {
  null: [Pr, bp]
}, Kp = {
  null: [42, 95]
}, zp = {
  null: []
}, $p = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: Kp,
  contentInitial: Fp,
  disable: zp,
  document: wp,
  flow: Bp,
  flowInitial: Hp,
  insideSpan: Gp,
  string: Up,
  text: vp
}, Symbol.toStringTag, { value: "Module" }));
function Yp(e = {}) {
  const t = n4(
    // @ts-expect-error Same as above.
    [$p].concat(e.extensions || [])
  ), n = {
    defined: [],
    lazy: {},
    constructs: t,
    content: r(c4),
    document: r(h4),
    flow: r(Op),
    string: r(Rp),
    text: r(kp)
  };
  return n;
  function r(i) {
    return s;
    function s(o) {
      return Mp(n, i, o);
    }
  }
}
const Io = /[\0\t\n\r]/g;
function jp() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(s, o, a) {
    const u = [];
    let c, f, h, E, g;
    for (s = t + s.toString(o), h = 0, t = "", n && (s.charCodeAt(0) === 65279 && h++, n = void 0); h < s.length; ) {
      if (Io.lastIndex = h, c = Io.exec(s), E = c && c.index !== void 0 ? c.index : s.length, g = s.charCodeAt(E), !c) {
        t = s.slice(h);
        break;
      }
      if (g === 10 && h === E && r)
        u.push(-3), r = void 0;
      else
        switch (r && (u.push(-5), r = void 0), h < E && (u.push(s.slice(h, E)), e += E - h), g) {
          case 0: {
            u.push(65533), e++;
            break;
          }
          case 9: {
            for (f = Math.ceil(e / 4) * 4, u.push(-2); e++ < f; )
              u.push(-1);
            break;
          }
          case 10: {
            u.push(-4), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      h = E + 1;
    }
    return a && (r && u.push(-5), t && u.push(t), u.push(null)), u;
  }
}
function Qp(e) {
  for (; !Il(e); )
    ;
  return e;
}
const Ll = {}.hasOwnProperty, qp = (
  /**
   * @type {(
   *   ((value: Value, encoding: Encoding, options?: Options | null | undefined) => Root) &
   *   ((value: Value, options?: Options | null | undefined) => Root)
   * )}
   */
  /**
   * @param {Value} value
   * @param {Encoding | Options | null | undefined} [encoding]
   * @param {Options | null | undefined} [options]
   * @returns {Root}
   */
  function(e, t, n) {
    return typeof t != "string" && (n = t, t = void 0), Wp(n)(
      Qp(
        // @ts-expect-error: micromark types need to accept `null`.
        Yp(n).document().write(jp()(e, t, !0))
      )
    );
  }
);
function Wp(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: a(Ei),
      autolinkProtocol: M,
      autolinkEmail: M,
      atxHeading: a(di),
      blockQuote: a(Bn),
      characterEscape: M,
      characterReference: M,
      codeFenced: a(pi),
      codeFencedFenceInfo: u,
      codeFencedFenceMeta: u,
      codeIndented: a(pi, u),
      codeText: a(eu, u),
      codeTextData: M,
      data: M,
      codeFlowValue: M,
      definition: a(tu),
      definitionDestinationString: u,
      definitionLabelString: u,
      definitionTitleString: u,
      emphasis: a(nu),
      hardBreakEscape: a(mi),
      hardBreakTrailing: a(mi),
      htmlFlow: a(Ti, u),
      htmlFlowData: M,
      htmlText: a(Ti, u),
      htmlTextData: M,
      image: a(ru),
      label: u,
      link: a(Ei),
      listItem: a(iu),
      listItemValue: A,
      listOrdered: a(gi, g),
      listUnordered: a(gi),
      paragraph: a(su),
      reference: vt,
      referenceString: u,
      resourceDestinationString: u,
      resourceTitleString: u,
      setextHeading: a(di),
      strong: a(ou),
      thematicBreak: a(lu)
    },
    exit: {
      atxHeading: f(),
      atxHeadingSequence: x,
      autolink: f(),
      autolinkEmail: Kt,
      autolinkProtocol: Gt,
      blockQuote: f(),
      characterEscapeValue: v,
      characterReferenceMarkerHexadecimal: ve,
      characterReferenceMarkerNumeric: ve,
      characterReferenceValue: mt,
      codeFenced: f(D),
      codeFencedFence: N,
      codeFencedFenceInfo: _,
      codeFencedFenceMeta: b,
      codeFlowValue: v,
      codeIndented: f(L),
      codeText: f(Ue),
      codeTextData: v,
      data: v,
      definition: f(),
      definitionDestinationString: C,
      definitionLabelString: B,
      definitionTitleString: U,
      emphasis: f(),
      hardBreakEscape: f(Ee),
      hardBreakTrailing: f(Ee),
      htmlFlow: f(Be),
      htmlFlowData: v,
      htmlText: f(We),
      htmlTextData: v,
      image: f(Ne),
      label: T,
      labelText: fe,
      lineEnding: W,
      link: f(me),
      listItem: f(),
      listOrdered: f(),
      listUnordered: f(),
      paragraph: f(),
      referenceString: he,
      resourceDestinationString: m,
      resourceTitleString: Ut,
      resource: u1,
      setextHeading: f(ie),
      setextHeadingLineSequence: z,
      setextHeadingText: w,
      strong: f(),
      thematicBreak: f()
    }
  };
  Ml(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(S) {
    let k = {
      type: "root",
      children: []
    };
    const G = {
      stack: [k],
      tokenStack: [],
      config: t,
      enter: c,
      exit: h,
      buffer: u,
      resume: E,
      setData: s,
      getData: o
    }, V = [];
    let J = -1;
    for (; ++J < S.length; )
      if (S[J][1].type === "listOrdered" || S[J][1].type === "listUnordered")
        if (S[J][0] === "enter")
          V.push(J);
        else {
          const Ge = V.pop();
          J = i(S, Ge, J);
        }
    for (J = -1; ++J < S.length; ) {
      const Ge = t[S[J][0]];
      Ll.call(Ge, S[J][1].type) && Ge[S[J][1].type].call(
        Object.assign(
          {
            sliceSerialize: S[J][2].sliceSerialize
          },
          G
        ),
        S[J][1]
      );
    }
    if (G.tokenStack.length > 0) {
      const Ge = G.tokenStack[G.tokenStack.length - 1];
      (Ge[1] || Oo).call(G, void 0, Ge[0]);
    }
    for (k.position = {
      start: Ct(
        S.length > 0 ? S[0][1].start : {
          line: 1,
          column: 1,
          offset: 0
        }
      ),
      end: Ct(
        S.length > 0 ? S[S.length - 2][1].end : {
          line: 1,
          column: 1,
          offset: 0
        }
      )
    }, J = -1; ++J < t.transforms.length; )
      k = t.transforms[J](k) || k;
    return k;
  }
  function i(S, k, G) {
    let V = k - 1, J = -1, Ge = !1, Tt, it, c1, f1;
    for (; ++V <= G; ) {
      const ae = S[V];
      if (ae[1].type === "listUnordered" || ae[1].type === "listOrdered" || ae[1].type === "blockQuote" ? (ae[0] === "enter" ? J++ : J--, f1 = void 0) : ae[1].type === "lineEndingBlank" ? ae[0] === "enter" && (Tt && !f1 && !J && !c1 && (c1 = V), f1 = void 0) : ae[1].type === "linePrefix" || ae[1].type === "listItemValue" || ae[1].type === "listItemMarker" || ae[1].type === "listItemPrefix" || ae[1].type === "listItemPrefixWhitespace" || (f1 = void 0), !J && ae[0] === "enter" && ae[1].type === "listItemPrefix" || J === -1 && ae[0] === "exit" && (ae[1].type === "listUnordered" || ae[1].type === "listOrdered")) {
        if (Tt) {
          let Un = V;
          for (it = void 0; Un--; ) {
            const st = S[Un];
            if (st[1].type === "lineEnding" || st[1].type === "lineEndingBlank") {
              if (st[0] === "exit")
                continue;
              it && (S[it][1].type = "lineEndingBlank", Ge = !0), st[1].type = "lineEnding", it = Un;
            } else if (!(st[1].type === "linePrefix" || st[1].type === "blockQuotePrefix" || st[1].type === "blockQuotePrefixWhitespace" || st[1].type === "blockQuoteMarker" || st[1].type === "listItemIndent"))
              break;
          }
          c1 && (!it || c1 < it) && (Tt._spread = !0), Tt.end = Object.assign(
            {},
            it ? S[it][1].start : ae[1].end
          ), S.splice(it || V, 0, ["exit", Tt, ae[2]]), V++, G++;
        }
        ae[1].type === "listItemPrefix" && (Tt = {
          type: "listItem",
          // @ts-expect-error Patched
          _spread: !1,
          start: Object.assign({}, ae[1].start)
        }, S.splice(V, 0, ["enter", Tt, ae[2]]), V++, G++, c1 = void 0, f1 = !0);
      }
    }
    return S[k][1]._spread = Ge, G;
  }
  function s(S, k) {
    n[S] = k;
  }
  function o(S) {
    return n[S];
  }
  function a(S, k) {
    return G;
    function G(V) {
      c.call(this, S(V), V), k && k.call(this, V);
    }
  }
  function u() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function c(S, k, G) {
    return this.stack[this.stack.length - 1].children.push(S), this.stack.push(S), this.tokenStack.push([k, G]), S.position = {
      start: Ct(k.start)
    }, S;
  }
  function f(S) {
    return k;
    function k(G) {
      S && S.call(this, G), h.call(this, G);
    }
  }
  function h(S, k) {
    const G = this.stack.pop(), V = this.tokenStack.pop();
    if (V)
      V[0].type !== S.type && (k ? k.call(this, S, V[0]) : (V[1] || Oo).call(this, S, V[0]));
    else
      throw new Error(
        "Cannot close `" + S.type + "` (" + N1({
          start: S.start,
          end: S.end
        }) + "): it’s not open"
      );
    return G.position.end = Ct(S.end), G;
  }
  function E() {
    return Pn(this.stack.pop());
  }
  function g() {
    s("expectingFirstListItemValue", !0);
  }
  function A(S) {
    if (o("expectingFirstListItemValue")) {
      const k = this.stack[this.stack.length - 2];
      k.start = Number.parseInt(this.sliceSerialize(S), 10), s("expectingFirstListItemValue");
    }
  }
  function _() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.lang = S;
  }
  function b() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.meta = S;
  }
  function N() {
    o("flowCodeInside") || (this.buffer(), s("flowCodeInside", !0));
  }
  function D() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.value = S.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), s("flowCodeInside");
  }
  function L() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.value = S.replace(/(\r?\n|\r)$/g, "");
  }
  function B(S) {
    const k = this.resume(), G = this.stack[this.stack.length - 1];
    G.label = k, G.identifier = e1(
      this.sliceSerialize(S)
    ).toLowerCase();
  }
  function U() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.title = S;
  }
  function C() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.url = S;
  }
  function x(S) {
    const k = this.stack[this.stack.length - 1];
    if (!k.depth) {
      const G = this.sliceSerialize(S).length;
      k.depth = G;
    }
  }
  function w() {
    s("setextHeadingSlurpLineEnding", !0);
  }
  function z(S) {
    const k = this.stack[this.stack.length - 1];
    k.depth = this.sliceSerialize(S).charCodeAt(0) === 61 ? 1 : 2;
  }
  function ie() {
    s("setextHeadingSlurpLineEnding");
  }
  function M(S) {
    const k = this.stack[this.stack.length - 1];
    let G = k.children[k.children.length - 1];
    (!G || G.type !== "text") && (G = au(), G.position = {
      start: Ct(S.start)
    }, k.children.push(G)), this.stack.push(G);
  }
  function v(S) {
    const k = this.stack.pop();
    k.value += this.sliceSerialize(S), k.position.end = Ct(S.end);
  }
  function W(S) {
    const k = this.stack[this.stack.length - 1];
    if (o("atHardBreak")) {
      const G = k.children[k.children.length - 1];
      G.position.end = Ct(S.end), s("atHardBreak");
      return;
    }
    !o("setextHeadingSlurpLineEnding") && t.canContainEols.includes(k.type) && (M.call(this, S), v.call(this, S));
  }
  function Ee() {
    s("atHardBreak", !0);
  }
  function Be() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.value = S;
  }
  function We() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.value = S;
  }
  function Ue() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.value = S;
  }
  function me() {
    const S = this.stack[this.stack.length - 1];
    if (o("inReference")) {
      const k = o("referenceType") || "shortcut";
      S.type += "Reference", S.referenceType = k, delete S.url, delete S.title;
    } else
      delete S.identifier, delete S.label;
    s("referenceType");
  }
  function Ne() {
    const S = this.stack[this.stack.length - 1];
    if (o("inReference")) {
      const k = o("referenceType") || "shortcut";
      S.type += "Reference", S.referenceType = k, delete S.url, delete S.title;
    } else
      delete S.identifier, delete S.label;
    s("referenceType");
  }
  function fe(S) {
    const k = this.sliceSerialize(S), G = this.stack[this.stack.length - 2];
    G.label = dl(k), G.identifier = e1(k).toLowerCase();
  }
  function T() {
    const S = this.stack[this.stack.length - 1], k = this.resume(), G = this.stack[this.stack.length - 1];
    if (s("inReference", !0), G.type === "link") {
      const V = S.children;
      G.children = V;
    } else
      G.alt = k;
  }
  function m() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.url = S;
  }
  function Ut() {
    const S = this.resume(), k = this.stack[this.stack.length - 1];
    k.title = S;
  }
  function u1() {
    s("inReference");
  }
  function vt() {
    s("referenceType", "collapsed");
  }
  function he(S) {
    const k = this.resume(), G = this.stack[this.stack.length - 1];
    G.label = k, G.identifier = e1(
      this.sliceSerialize(S)
    ).toLowerCase(), s("referenceType", "full");
  }
  function ve(S) {
    s("characterReferenceType", S.type);
  }
  function mt(S) {
    const k = this.sliceSerialize(S), G = o("characterReferenceType");
    let V;
    G ? (V = pl(
      k,
      G === "characterReferenceMarkerNumeric" ? 10 : 16
    ), s("characterReferenceType")) : V = ni(k);
    const J = this.stack.pop();
    J.value += V, J.position.end = Ct(S.end);
  }
  function Gt(S) {
    v.call(this, S);
    const k = this.stack[this.stack.length - 1];
    k.url = this.sliceSerialize(S);
  }
  function Kt(S) {
    v.call(this, S);
    const k = this.stack[this.stack.length - 1];
    k.url = "mailto:" + this.sliceSerialize(S);
  }
  function Bn() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function pi() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function eu() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function tu() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function nu() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function di() {
    return {
      type: "heading",
      depth: void 0,
      children: []
    };
  }
  function mi() {
    return {
      type: "break"
    };
  }
  function Ti() {
    return {
      type: "html",
      value: ""
    };
  }
  function ru() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function Ei() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function gi(S) {
    return {
      type: "list",
      ordered: S.type === "listOrdered",
      start: null,
      // @ts-expect-error Patched.
      spread: S._spread,
      children: []
    };
  }
  function iu(S) {
    return {
      type: "listItem",
      // @ts-expect-error Patched.
      spread: S._spread,
      checked: null,
      children: []
    };
  }
  function su() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function ou() {
    return {
      type: "strong",
      children: []
    };
  }
  function au() {
    return {
      type: "text",
      value: ""
    };
  }
  function lu() {
    return {
      type: "thematicBreak"
    };
  }
}
function Ct(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Ml(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? Ml(e, r) : Vp(e, r);
  }
}
function Vp(e, t) {
  let n;
  for (n in t)
    if (Ll.call(t, n)) {
      if (n === "canContainEols") {
        const r = t[n];
        r && e[n].push(...r);
      } else if (n === "transforms") {
        const r = t[n];
        r && e[n].push(...r);
      } else if (n === "enter" || n === "exit") {
        const r = t[n];
        r && Object.assign(e[n], r);
      }
    }
}
function Oo(e, t) {
  throw e ? new Error(
    "Cannot close `" + e.type + "` (" + N1({
      start: e.start,
      end: e.end
    }) + "): a different token (`" + t.type + "`, " + N1({
      start: t.start,
      end: t.end
    }) + ") is open"
  ) : new Error(
    "Cannot close document, a token (`" + t.type + "`, " + N1({
      start: t.start,
      end: t.end
    }) + ") is still open"
  );
}
function Xp(e) {
  Object.assign(this, { Parser: (n) => {
    const r = (
      /** @type {Options} */
      this.data("settings")
    );
    return qp(
      n,
      Object.assign({}, r, e, {
        // Note: these options are not in the readme.
        // The goal is for them to be set by plugins on `data` instead of being
        // passed by users.
        extensions: this.data("micromarkExtensions") || [],
        mdastExtensions: this.data("fromMarkdownExtensions") || []
      })
    );
  } });
}
function Zp(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Jp(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function ed(e, t) {
  const n = t.value ? t.value + `
` : "", r = t.lang ? t.lang.match(/^[^ \t]+(?=[ \t]|$)/) : null, i = {};
  r && (i.className = ["language-" + r]);
  let s = {
    type: "element",
    tagName: "code",
    properties: i,
    children: [{ type: "text", value: n }]
  };
  return t.meta && (s.data = { meta: t.meta }), e.patch(t, s), s = e.applyData(t, s), s = { type: "element", tagName: "pre", properties: {}, children: [s] }, e.patch(t, s), s;
}
function td(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function nd(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function o1(e) {
  const t = [];
  let n = -1, r = 0, i = 0;
  for (; ++n < e.length; ) {
    const s = e.charCodeAt(n);
    let o = "";
    if (s === 37 && Re(e.charCodeAt(n + 1)) && Re(e.charCodeAt(n + 2)))
      i = 2;
    else if (s < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(s)) || (o = String.fromCharCode(s));
    else if (s > 55295 && s < 57344) {
      const a = e.charCodeAt(n + 1);
      s < 56320 && a > 56319 && a < 57344 ? (o = String.fromCharCode(s, a), i = 1) : o = "�";
    } else
      o = String.fromCharCode(s);
    o && (t.push(e.slice(r, n), encodeURIComponent(o)), r = n + i + 1, o = ""), i && (n += i, i = 0);
  }
  return t.join("") + e.slice(r);
}
function Pl(e, t) {
  const n = String(t.identifier).toUpperCase(), r = o1(n.toLowerCase()), i = e.footnoteOrder.indexOf(n);
  let s;
  i === -1 ? (e.footnoteOrder.push(n), e.footnoteCounts[n] = 1, s = e.footnoteOrder.length) : (e.footnoteCounts[n]++, s = i + 1);
  const o = e.footnoteCounts[n], a = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + e.clobberPrefix + "fn-" + r,
      id: e.clobberPrefix + "fnref-" + r + (o > 1 ? "-" + o : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(s) }]
  };
  e.patch(t, a);
  const u = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [a]
  };
  return e.patch(t, u), e.applyData(t, u);
}
function rd(e, t) {
  const n = e.footnoteById;
  let r = 1;
  for (; r in n; )
    r++;
  const i = String(r);
  return n[i] = {
    type: "footnoteDefinition",
    identifier: i,
    children: [{ type: "paragraph", children: t.children }],
    position: t.position
  }, Pl(e, {
    type: "footnoteReference",
    identifier: i,
    position: t.position
  });
}
function id(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function sd(e, t) {
  if (e.dangerous) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
  return null;
}
function Dl(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return { type: "text", value: "![" + t.alt + r };
  const i = e.all(t), s = i[0];
  s && s.type === "text" ? s.value = "[" + s.value : i.unshift({ type: "text", value: "[" });
  const o = i[i.length - 1];
  return o && o.type === "text" ? o.value += r : i.push({ type: "text", value: r }), i;
}
function od(e, t) {
  const n = e.definition(t.identifier);
  if (!n)
    return Dl(e, t);
  const r = { src: o1(n.url || ""), alt: t.alt };
  n.title !== null && n.title !== void 0 && (r.title = n.title);
  const i = { type: "element", tagName: "img", properties: r, children: [] };
  return e.patch(t, i), e.applyData(t, i);
}
function ad(e, t) {
  const n = { src: o1(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function ld(e, t) {
  const n = { type: "text", value: t.value.replace(/\r?\n|\r/g, " ") };
  e.patch(t, n);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [n]
  };
  return e.patch(t, r), e.applyData(t, r);
}
function ud(e, t) {
  const n = e.definition(t.identifier);
  if (!n)
    return Dl(e, t);
  const r = { href: o1(n.url || "") };
  n.title !== null && n.title !== void 0 && (r.title = n.title);
  const i = {
    type: "element",
    tagName: "a",
    properties: r,
    children: e.all(t)
  };
  return e.patch(t, i), e.applyData(t, i);
}
function cd(e, t) {
  const n = { href: o1(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function fd(e, t, n) {
  const r = e.all(t), i = n ? hd(n) : wl(t), s = {}, o = [];
  if (typeof t.checked == "boolean") {
    const f = r[0];
    let h;
    f && f.type === "element" && f.tagName === "p" ? h = f : (h = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(h)), h.children.length > 0 && h.children.unshift({ type: "text", value: " " }), h.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: t.checked, disabled: !0 },
      children: []
    }), s.className = ["task-list-item"];
  }
  let a = -1;
  for (; ++a < r.length; ) {
    const f = r[a];
    (i || a !== 0 || f.type !== "element" || f.tagName !== "p") && o.push({ type: "text", value: `
` }), f.type === "element" && f.tagName === "p" && !i ? o.push(...f.children) : o.push(f);
  }
  const u = r[r.length - 1];
  u && (i || u.type !== "element" || u.tagName !== "p") && o.push({ type: "text", value: `
` });
  const c = { type: "element", tagName: "li", properties: s, children: o };
  return e.patch(t, c), e.applyData(t, c);
}
function hd(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = wl(n[r]);
  }
  return t;
}
function wl(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function pd(e, t) {
  const n = {}, r = e.all(t);
  let i = -1;
  for (typeof t.start == "number" && t.start !== 1 && (n.start = t.start); ++i < r.length; ) {
    const o = r[i];
    if (o.type === "element" && o.tagName === "li" && o.properties && Array.isArray(o.properties.className) && o.properties.className.includes("task-list-item")) {
      n.className = ["contains-task-list"];
      break;
    }
  }
  const s = {
    type: "element",
    tagName: t.ordered ? "ol" : "ul",
    properties: n,
    children: e.wrap(r, !0)
  };
  return e.patch(t, s), e.applyData(t, s);
}
function dd(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function md(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function Td(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const B1 = Fl("start"), wn = Fl("end");
function Ed(e) {
  return { start: B1(e), end: wn(e) };
}
function Fl(e) {
  return t;
  function t(n) {
    const r = n && n.position && n.position[e] || {};
    return {
      // @ts-expect-error: in practice, null is allowed.
      line: r.line || null,
      // @ts-expect-error: in practice, null is allowed.
      column: r.column || null,
      // @ts-expect-error: in practice, null is allowed.
      offset: r.offset > -1 ? r.offset : null
    };
  }
}
function gd(e, t) {
  const n = e.all(t), r = n.shift(), i = [];
  if (r) {
    const o = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(t.children[0], o), i.push(o);
  }
  if (n.length > 0) {
    const o = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(n, !0)
    }, a = B1(t.children[1]), u = wn(t.children[t.children.length - 1]);
    a.line && u.line && (o.position = { start: a, end: u }), i.push(o);
  }
  const s = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(t, s), e.applyData(t, s);
}
function _d(e, t, n) {
  const r = n ? n.children : void 0, s = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td", o = n && n.type === "table" ? n.align : void 0, a = o ? o.length : t.children.length;
  let u = -1;
  const c = [];
  for (; ++u < a; ) {
    const h = t.children[u], E = {}, g = o ? o[u] : void 0;
    g && (E.align = g);
    let A = { type: "element", tagName: s, properties: E, children: [] };
    h && (A.children = e.all(h), e.patch(h, A), A = e.applyData(t, A)), c.push(A);
  }
  const f = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(c, !0)
  };
  return e.patch(t, f), e.applyData(t, f);
}
function Ad(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const xo = 9, bo = 32;
function Cd(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const s = [];
  for (; r; )
    s.push(
      Ro(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return s.push(Ro(t.slice(i), i > 0, !1)), s.join("");
}
function Ro(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let s = e.codePointAt(r);
    for (; s === xo || s === bo; )
      r++, s = e.codePointAt(r);
  }
  if (n) {
    let s = e.codePointAt(i - 1);
    for (; s === xo || s === bo; )
      i--, s = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function Nd(e, t) {
  const n = { type: "text", value: Cd(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function Sd(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const yd = {
  blockquote: Zp,
  break: Jp,
  code: ed,
  delete: td,
  emphasis: nd,
  footnoteReference: Pl,
  footnote: rd,
  heading: id,
  html: sd,
  imageReference: od,
  image: ad,
  inlineCode: ld,
  linkReference: ud,
  link: cd,
  listItem: fd,
  list: pd,
  paragraph: dd,
  root: md,
  strong: Td,
  table: gd,
  tableCell: Ad,
  tableRow: _d,
  text: Nd,
  thematicBreak: Sd,
  toml: sn,
  yaml: sn,
  definition: sn,
  footnoteDefinition: sn
};
function sn() {
  return null;
}
function Id(e) {
  return !e || !e.position || !e.position.start || !e.position.start.line || !e.position.start.column || !e.position.end || !e.position.end.line || !e.position.end.column;
}
const ko = {}.hasOwnProperty;
function Od(e) {
  const t = /* @__PURE__ */ Object.create(null);
  if (!e || !e.type)
    throw new Error("mdast-util-definitions expected node");
  return je(e, "definition", (r) => {
    const i = Lo(r.identifier);
    i && !ko.call(t, i) && (t[i] = r);
  }), n;
  function n(r) {
    const i = Lo(r);
    return i && ko.call(t, i) ? t[i] : null;
  }
}
function Lo(e) {
  return String(e || "").toUpperCase();
}
const Cn = {}.hasOwnProperty;
function xd(e, t) {
  const n = t || {}, r = n.allowDangerousHtml || !1, i = {};
  return o.dangerous = r, o.clobberPrefix = n.clobberPrefix === void 0 || n.clobberPrefix === null ? "user-content-" : n.clobberPrefix, o.footnoteLabel = n.footnoteLabel || "Footnotes", o.footnoteLabelTagName = n.footnoteLabelTagName || "h2", o.footnoteLabelProperties = n.footnoteLabelProperties || {
    className: ["sr-only"]
  }, o.footnoteBackLabel = n.footnoteBackLabel || "Back to content", o.unknownHandler = n.unknownHandler, o.passThrough = n.passThrough, o.handlers = { ...yd, ...n.handlers }, o.definition = Od(e), o.footnoteById = i, o.footnoteOrder = [], o.footnoteCounts = {}, o.patch = bd, o.applyData = Rd, o.one = a, o.all = u, o.wrap = Ld, o.augment = s, je(e, "footnoteDefinition", (c) => {
    const f = String(c.identifier).toUpperCase();
    Cn.call(i, f) || (i[f] = c);
  }), o;
  function s(c, f) {
    if (c && "data" in c && c.data) {
      const h = c.data;
      h.hName && (f.type !== "element" && (f = {
        type: "element",
        tagName: "",
        properties: {},
        children: []
      }), f.tagName = h.hName), f.type === "element" && h.hProperties && (f.properties = { ...f.properties, ...h.hProperties }), "children" in f && f.children && h.hChildren && (f.children = h.hChildren);
    }
    if (c) {
      const h = "type" in c ? c : { position: c };
      Id(h) || (f.position = { start: B1(h), end: wn(h) });
    }
    return f;
  }
  function o(c, f, h, E) {
    return Array.isArray(h) && (E = h, h = {}), s(c, {
      type: "element",
      tagName: f,
      properties: h || {},
      children: E || []
    });
  }
  function a(c, f) {
    return Hl(o, c, f);
  }
  function u(c) {
    return oi(o, c);
  }
}
function bd(e, t) {
  e.position && (t.position = Ed(e));
}
function Rd(e, t) {
  let n = t;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, s = e.data.hProperties;
    typeof r == "string" && (n.type === "element" ? n.tagName = r : n = {
      type: "element",
      tagName: r,
      properties: {},
      children: []
    }), n.type === "element" && s && (n.properties = { ...n.properties, ...s }), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function Hl(e, t, n) {
  const r = t && t.type;
  if (!r)
    throw new Error("Expected node, got `" + t + "`");
  return Cn.call(e.handlers, r) ? e.handlers[r](e, t, n) : e.passThrough && e.passThrough.includes(r) ? "children" in t ? { ...t, children: oi(e, t) } : t : e.unknownHandler ? e.unknownHandler(e, t, n) : kd(e, t);
}
function oi(e, t) {
  const n = [];
  if ("children" in t) {
    const r = t.children;
    let i = -1;
    for (; ++i < r.length; ) {
      const s = Hl(e, r[i], t);
      if (s) {
        if (i && r[i - 1].type === "break" && (!Array.isArray(s) && s.type === "text" && (s.value = s.value.replace(/^\s+/, "")), !Array.isArray(s) && s.type === "element")) {
          const o = s.children[0];
          o && o.type === "text" && (o.value = o.value.replace(/^\s+/, ""));
        }
        Array.isArray(s) ? n.push(...s) : n.push(s);
      }
    }
  }
  return n;
}
function kd(e, t) {
  const n = t.data || {}, r = "value" in t && !(Cn.call(n, "hProperties") || Cn.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: oi(e, t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function Ld(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function Md(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.footnoteOrder.length; ) {
    const r = e.footnoteById[e.footnoteOrder[n]];
    if (!r)
      continue;
    const i = e.all(r), s = String(r.identifier).toUpperCase(), o = o1(s.toLowerCase());
    let a = 0;
    const u = [];
    for (; ++a <= e.footnoteCounts[s]; ) {
      const h = {
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + e.clobberPrefix + "fnref-" + o + (a > 1 ? "-" + a : ""),
          dataFootnoteBackref: !0,
          className: ["data-footnote-backref"],
          ariaLabel: e.footnoteBackLabel
        },
        children: [{ type: "text", value: "↩" }]
      };
      a > 1 && h.children.push({
        type: "element",
        tagName: "sup",
        children: [{ type: "text", value: String(a) }]
      }), u.length > 0 && u.push({ type: "text", value: " " }), u.push(h);
    }
    const c = i[i.length - 1];
    if (c && c.type === "element" && c.tagName === "p") {
      const h = c.children[c.children.length - 1];
      h && h.type === "text" ? h.value += " " : c.children.push({ type: "text", value: " " }), c.children.push(...u);
    } else
      i.push(...u);
    const f = {
      type: "element",
      tagName: "li",
      properties: { id: e.clobberPrefix + "fn-" + o },
      children: e.wrap(i, !0)
    };
    e.patch(r, f), t.push(f);
  }
  if (t.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: e.footnoteLabelTagName,
          properties: {
            // To do: use structured clone.
            ...JSON.parse(JSON.stringify(e.footnoteLabelProperties)),
            id: "footnote-label"
          },
          children: [{ type: "text", value: e.footnoteLabel }]
        },
        { type: "text", value: `
` },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: e.wrap(t, !0)
        },
        { type: "text", value: `
` }
      ]
    };
}
function Bl(e, t) {
  const n = xd(e, t), r = n.one(e, null), i = Md(n);
  return i && r.children.push({ type: "text", value: `
` }, i), Array.isArray(r) ? { type: "root", children: r } : r;
}
const Pd = (
  /** @type {(import('unified').Plugin<[Processor, Options?]|[null|undefined, Options?]|[Options]|[], MdastRoot>)} */
  function(e, t) {
    return e && "run" in e ? wd(e, t) : Fd(e || t);
  }
), Dd = Pd;
function wd(e, t) {
  return (n, r, i) => {
    e.run(Bl(n, t), r, (s) => {
      i(s);
    });
  };
}
function Fd(e) {
  return (t) => Bl(t, e);
}
function Hd(e) {
  const t = (
    /** @type {Options} */
    this.data("settings")
  ), n = Object.assign({}, t, e);
  Object.assign(this, { Compiler: r });
  function r(i) {
    return Cl(i, n);
  }
}
const Bd = {}.hasOwnProperty, Ul = s1("type", { handlers: { root: vd, element: Yd, text: zd, comment: $d, doctype: Kd } });
function Ud(e, t) {
  const n = t && typeof t == "object" ? t.space : t;
  return Ul(e, n === "svg" ? dt : r1);
}
function vd(e, t) {
  const n = {
    nodeName: "#document",
    // @ts-expect-error: `parse5` uses enums, which are actually strings.
    mode: (e.data || {}).quirksMode ? "quirks" : "no-quirks",
    childNodes: []
  };
  return n.childNodes = ai(e.children, n, t), a1(e, n), n;
}
function Gd(e, t) {
  const n = { nodeName: "#document-fragment", childNodes: [] };
  return n.childNodes = ai(e.children, n, t), a1(e, n), n;
}
function Kd(e) {
  const t = {
    nodeName: "#documentType",
    name: "html",
    publicId: "",
    systemId: "",
    // @ts-expect-error: change to `null` in a major?
    parentNode: void 0
  };
  return a1(e, t), t;
}
function zd(e) {
  const t = {
    nodeName: "#text",
    value: e.value,
    // @ts-expect-error: no `parentNode`
    parentNode: void 0
  };
  return a1(e, t), t;
}
function $d(e) {
  const t = {
    nodeName: "#comment",
    data: e.value,
    // @ts-expect-error: no `parentNode`
    parentNode: void 0
  };
  return a1(e, t), t;
}
function Yd(e, t) {
  const n = t;
  let r = n;
  e.type === "element" && e.tagName.toLowerCase() === "svg" && n.space === "html" && (r = dt);
  const i = [];
  let s;
  if (e.properties) {
    for (s in e.properties)
      if (s !== "children" && Bd.call(e.properties, s)) {
        const a = jd(
          r,
          s,
          e.properties[s]
        );
        a && i.push(a);
      }
  }
  const o = {
    nodeName: e.tagName,
    tagName: e.tagName,
    attrs: i,
    // @ts-expect-error: html and svg both have a space.
    namespaceURI: L1[r.space],
    childNodes: [],
    // @ts-expect-error: no `parentNode`
    parentNode: void 0
  };
  return o.childNodes = ai(e.children, o, r), a1(e, o), e.tagName === "template" && e.content && (o.content = Gd(e.content, r)), o;
}
function jd(e, t, n) {
  const r = F1(e, t);
  if (n == null || n === !1 || typeof n == "number" && Number.isNaN(n) || !n && r.boolean)
    return;
  Array.isArray(n) && (n = r.commaSeparated ? qr(n) : Qr(n));
  const i = {
    name: r.attribute,
    value: n === !0 ? "" : String(n)
  };
  if (r.space && r.space !== "html" && r.space !== "svg") {
    const s = i.name.indexOf(":");
    s < 0 ? i.prefix = "" : (i.name = i.name.slice(s + 1), i.prefix = r.attribute.slice(0, s)), i.namespace = L1[r.space];
  }
  return i;
}
function ai(e, t, n) {
  let r = -1;
  const i = [];
  if (e)
    for (; ++r < e.length; ) {
      const s = Ul(e[r], n);
      s.parentNode = t, i.push(s);
    }
  return i;
}
function a1(e, t) {
  const n = e.position;
  n && n.start && n.end && (t.sourceCodeLocation = {
    startLine: n.start.line,
    startCol: n.start.column,
    // @ts-expect-error assume this is set.
    startOffset: n.start.offset,
    endLine: n.end.line,
    endCol: n.end.column,
    // @ts-expect-error assume this is set.
    endOffset: n.end.offset
  });
}
const Qd = "IN_TEMPLATE_MODE", qd = "DATA_STATE", Wd = "CHARACTER_TOKEN", Vd = "START_TAG_TOKEN", Xd = "END_TAG_TOKEN", Zd = "COMMENT_TOKEN", Jd = "DOCTYPE_TOKEN", em = { sourceCodeLocationInfo: !0, scriptingEnabled: !1 }, vl = (
  /**
   * @type {(
   *   ((tree: Node, file: VFile|undefined, options?: Options) => Node) &
   *   ((tree: Node, options?: Options) => Node)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {VFile} [file]
   * @param {Options} [options]
   */
  function(e, t, n) {
    let r = -1;
    const i = new ga(em), s = s1("type", {
      handlers: { root: _, element: b, text: N, comment: L, doctype: D, raw: B },
      // @ts-expect-error: hush.
      unknown: im
    });
    let o, a, u, c, f;
    if (om(t) && (n = t, t = void 0), n && n.passThrough)
      for (; ++r < n.passThrough.length; )
        s.handlers[n.passThrough[r]] = U;
    const h = Ra(
      sm(e) ? g() : E(),
      t
    );
    if (o && je(h, "comment", (x, w, z) => {
      const ie = (
        /** @type {Stitch} */
        /** @type {unknown} */
        x
      );
      if (ie.value.stitch && z !== null && w !== null)
        return z.children[w] = ie.value.stitch, w;
    }), e.type !== "root" && h.type === "root" && h.children.length === 1)
      return h.children[0];
    return h;
    function E() {
      const x = {
        nodeName: "template",
        tagName: "template",
        attrs: [],
        namespaceURI: L1.html,
        childNodes: []
      }, w = {
        nodeName: "documentmock",
        tagName: "documentmock",
        attrs: [],
        namespaceURI: L1.html,
        childNodes: []
      }, z = { nodeName: "#document-fragment", childNodes: [] };
      if (i._bootstrap(w, x), i._pushTmplInsertionMode(Qd), i._initTokenizerForFragmentParsing(), i._insertFakeRootElement(), i._resetInsertionMode(), i._findFormInFragmentContext(), a = i.tokenizer, !a)
        throw new Error("Expected `tokenizer`");
      return u = a.preprocessor, f = a.__mixins[0], c = f.posTracker, s(e), C(), i._adoptNodes(w.childNodes[0], z), z;
    }
    function g() {
      const x = i.treeAdapter.createDocument();
      if (i._bootstrap(x, void 0), a = i.tokenizer, !a)
        throw new Error("Expected `tokenizer`");
      return u = a.preprocessor, f = a.__mixins[0], c = f.posTracker, s(e), C(), x;
    }
    function A(x) {
      let w = -1;
      if (x)
        for (; ++w < x.length; )
          s(x[w]);
    }
    function _(x) {
      A(x.children);
    }
    function b(x) {
      C(), i._processInputToken(tm(x)), A(x.children), ml.includes(x.tagName) || (C(), i._processInputToken(rm(x)));
    }
    function N(x) {
      C(), i._processInputToken({
        type: Wd,
        chars: x.value,
        location: Xt(x)
      });
    }
    function D(x) {
      C(), i._processInputToken({
        type: Jd,
        name: "html",
        forceQuirks: !1,
        publicId: "",
        systemId: "",
        location: Xt(x)
      });
    }
    function L(x) {
      C(), i._processInputToken({
        type: Zd,
        data: x.value,
        location: Xt(x)
      });
    }
    function B(x) {
      const w = B1(x), z = w.line || 1, ie = w.column || 1, M = w.offset || 0;
      if (!u)
        throw new Error("Expected `preprocessor`");
      if (!a)
        throw new Error("Expected `tokenizer`");
      if (!c)
        throw new Error("Expected `posTracker`");
      if (!f)
        throw new Error("Expected `locationTracker`");
      u.html = void 0, u.pos = -1, u.lastGapPos = -1, u.lastCharPos = -1, u.gapStack = [], u.skipNextNewLine = !1, u.lastChunkWritten = !1, u.endOfChunkHit = !1, c.isEol = !1, c.lineStartPos = -ie + 1, c.droppedBufferSize = M, c.offset = 0, c.col = 1, c.line = z, f.currentAttrLocation = void 0, f.ctLoc = Xt(x), a.write(x.value), i._runParsingLoop(null), (a.state === "NAMED_CHARACTER_REFERENCE_STATE" || a.state === "NUMERIC_CHARACTER_REFERENCE_END_STATE") && (u.lastChunkWritten = !0, a[a.state](a._consume()));
    }
    function U(x) {
      o = !0;
      let w;
      "children" in x ? w = {
        ...x,
        children: vl(
          { type: "root", children: x.children },
          t,
          n
          // @ts-expect-error Assume a given parent yields a parent.
        ).children
      } : w = { ...x }, L({ type: "comment", value: { stitch: w } });
    }
    function C() {
      if (!a)
        throw new Error("Expected `tokenizer`");
      if (!c)
        throw new Error("Expected `posTracker`");
      const x = a.currentCharacterToken;
      x && (x.location.endLine = c.line, x.location.endCol = c.col + 1, x.location.endOffset = c.offset + 1, i._processInputToken(x)), a.tokenQueue = [], a.state = qd, a.returnState = "", a.charRefCode = -1, a.tempBuff = [], a.lastStartTagName = "", a.consumedAfterSnapshot = -1, a.active = !1, a.currentCharacterToken = void 0, a.currentToken = void 0, a.currentAttr = void 0;
    }
  }
);
function tm(e) {
  const t = Object.assign(Xt(e));
  return t.startTag = Object.assign({}, t), {
    type: Vd,
    tagName: e.tagName,
    selfClosing: !1,
    attrs: nm(e),
    location: t
  };
}
function nm(e) {
  return Ud({
    tagName: e.tagName,
    type: "element",
    properties: e.properties,
    children: []
    // @ts-expect-error Assume element.
  }).attrs;
}
function rm(e) {
  const t = Object.assign(Xt(e));
  return t.startTag = Object.assign({}, t), {
    type: Xd,
    tagName: e.tagName,
    attrs: [],
    location: t
  };
}
function im(e) {
  throw new Error("Cannot compile `" + e.type + "` node");
}
function sm(e) {
  const t = e.type === "root" ? e.children[0] : e;
  return Boolean(
    t && (t.type === "doctype" || t.type === "element" && t.tagName === "html")
  );
}
function Xt(e) {
  const t = B1(e), n = wn(e);
  return {
    startLine: t.line,
    startCol: t.column,
    startOffset: t.offset,
    endLine: n.line,
    endCol: n.column,
    endOffset: n.offset
  };
}
function om(e) {
  return Boolean(e && !("message" in e && "messages" in e));
}
function am(e = {}) {
  return (t, n) => (
    /** @type {Root} */
    vl(t, n, e)
  );
}
const Nn = {
  strip: ["script"],
  clobberPrefix: "user-content-",
  clobber: ["name", "id"],
  ancestors: {
    tbody: ["table"],
    tfoot: ["table"],
    thead: ["table"],
    td: ["table"],
    th: ["table"],
    tr: ["table"]
  },
  protocols: {
    href: ["http", "https", "mailto", "xmpp", "irc", "ircs"],
    cite: ["http", "https"],
    src: ["http", "https"],
    longDesc: ["http", "https"]
  },
  tagNames: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "br",
    "b",
    "i",
    "strong",
    "em",
    "a",
    "pre",
    "code",
    "img",
    "tt",
    "div",
    "ins",
    "del",
    "sup",
    "sub",
    "p",
    "ol",
    "ul",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "blockquote",
    "dl",
    "dt",
    "dd",
    "kbd",
    "q",
    "samp",
    "var",
    "hr",
    "ruby",
    "rt",
    "rp",
    "li",
    "tr",
    "td",
    "th",
    "s",
    "strike",
    "summary",
    "details",
    "caption",
    "figure",
    "figcaption",
    "abbr",
    "bdo",
    "cite",
    "dfn",
    "mark",
    "small",
    "span",
    "time",
    "wbr",
    "input"
  ],
  attributes: {
    a: ["href"],
    img: ["src", "longDesc"],
    input: [
      ["type", "checkbox"],
      ["disabled", !0]
    ],
    li: [["className", "task-list-item"]],
    div: ["itemScope", "itemType"],
    blockquote: ["cite"],
    del: ["cite"],
    ins: ["cite"],
    q: ["cite"],
    "*": [
      "abbr",
      "accept",
      "acceptCharset",
      "accessKey",
      "action",
      "align",
      "alt",
      "ariaDescribedBy",
      "ariaHidden",
      "ariaLabel",
      "ariaLabelledBy",
      "axis",
      "border",
      "cellPadding",
      "cellSpacing",
      "char",
      "charOff",
      "charSet",
      "checked",
      "clear",
      "cols",
      "colSpan",
      "color",
      "compact",
      "coords",
      "dateTime",
      "dir",
      "disabled",
      "encType",
      "htmlFor",
      "frame",
      "headers",
      "height",
      "hrefLang",
      "hSpace",
      "isMap",
      "id",
      "label",
      "lang",
      "maxLength",
      "media",
      "method",
      "multiple",
      "name",
      "noHref",
      "noShade",
      "noWrap",
      "open",
      "prompt",
      "readOnly",
      "rel",
      "rev",
      "rows",
      "rowSpan",
      "rules",
      "scope",
      "selected",
      "shape",
      "size",
      "span",
      "start",
      "summary",
      "tabIndex",
      "target",
      "title",
      "type",
      "useMap",
      "vAlign",
      "value",
      "vSpace",
      "width",
      "itemProp"
    ]
  },
  required: {
    input: {
      type: "checkbox",
      disabled: !0
    }
  }
}, Ze = {}.hasOwnProperty, Er = {
  root: { children: Mo },
  doctype: um,
  comment: cm,
  element: {
    tagName: Kl,
    properties: fm,
    children: Mo
  },
  text: { value: dm },
  "*": { data: Po, position: Po }
};
function lm(e, t) {
  let n = { type: "root", children: [] };
  if (e && typeof e == "object" && e.type) {
    const r = Gl(
      Object.assign({}, Nn, t || {}),
      e,
      []
    );
    r && (Array.isArray(r) ? r.length === 1 ? n = r[0] : n.children = r : n = r);
  }
  return n;
}
function Gl(e, t, n) {
  const r = t && t.type, i = { type: t.type };
  let s;
  if (Ze.call(Er, r)) {
    let o = Er[r];
    if (typeof o == "function" && (o = o(e, t)), o) {
      const a = Object.assign({}, o, Er["*"]);
      let u;
      s = !0;
      for (u in a)
        if (Ze.call(a, u)) {
          const c = a[u](e, t[u], t, n);
          c === !1 ? (s = void 0, i[u] = t[u]) : c != null && (i[u] = c);
        }
    }
  }
  return s ? i : i.type === "element" && e.strip && !e.strip.includes(i.tagName) ? i.children : void 0;
}
function Mo(e, t, n, r) {
  const i = [];
  if (Array.isArray(t)) {
    let s = -1;
    for (n.type === "element" && r.push(n.tagName); ++s < t.length; ) {
      const o = Gl(e, t[s], r);
      o && (Array.isArray(o) ? i.push(...o) : i.push(o));
    }
    n.type === "element" && r.pop();
  }
  return i;
}
function um(e) {
  return e.allowDoctypes ? { name: hm } : void 0;
}
function cm(e) {
  return e.allowComments ? { value: pm } : void 0;
}
function fm(e, t, n, r) {
  const i = Kl(e, n.tagName, n, r), s = e.attributes || {}, o = e.required || {}, a = t || {}, u = Object.assign(
    {},
    Do(s["*"]),
    Do(i && Ze.call(s, i) ? s[i] : [])
  ), c = {};
  let f;
  for (f in a)
    if (Ze.call(a, f)) {
      let h = a[f], E;
      if (Ze.call(u, f))
        E = u[f];
      else if (Em(f) && Ze.call(u, "data*"))
        E = u["data*"];
      else
        continue;
      h = Array.isArray(h) ? mm(e, h, f, E) : zl(e, h, f, E), h != null && (c[f] = h);
    }
  if (i && Ze.call(o, i))
    for (f in o[i])
      Ze.call(c, f) || (c[f] = o[i][f]);
  return c;
}
function hm() {
  return "html";
}
function Kl(e, t, n, r) {
  const i = typeof t == "string" ? t : "";
  let s = -1;
  if (!i || i === "*" || e.tagNames && !e.tagNames.includes(i))
    return !1;
  if (e.ancestors && Ze.call(e.ancestors, i)) {
    for (; ++s < e.ancestors[i].length; )
      if (r.includes(e.ancestors[i][s]))
        return i;
    return !1;
  }
  return i;
}
function pm(e, t) {
  const n = typeof t == "string" ? t : "", r = n.indexOf("-->");
  return r < 0 ? n : n.slice(0, r);
}
function dm(e, t) {
  return typeof t == "string" ? t : "";
}
function Po(e, t) {
  return t;
}
function mm(e, t, n, r) {
  let i = -1;
  const s = [];
  for (; ++i < t.length; ) {
    const o = zl(e, t[i], n, r);
    o != null && s.push(o);
  }
  return s;
}
function zl(e, t, n, r) {
  if ((typeof t == "boolean" || typeof t == "number" || typeof t == "string") && Tm(e, t, n) && (r.length === 0 || r.some(
    (i) => i && typeof i == "object" && "flags" in i ? i.test(String(t)) : i === t
  )))
    return e.clobberPrefix && e.clobber && e.clobber.includes(n) ? e.clobberPrefix + t : t;
}
function Tm(e, t, n) {
  const r = String(t), i = r.indexOf(":"), s = r.indexOf("?"), o = r.indexOf("#"), a = r.indexOf("/"), u = e.protocols && Ze.call(e.protocols, n) ? e.protocols[n].concat() : [];
  let c = -1;
  if (u.length === 0 || i < 0 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
  a > -1 && i > a || s > -1 && i > s || o > -1 && i > o)
    return !0;
  for (; ++c < u.length; )
    if (i === u[c].length && r.slice(0, u[c].length) === u[c])
      return !0;
  return !1;
}
function Do(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; ) {
    const r = e[n];
    Array.isArray(r) ? t[r[0]] = r.slice(1) : t[r] = [];
  }
  return t;
}
function Em(e) {
  return e.length > 4 && e.slice(0, 4).toLowerCase() === "data";
}
function gm(e = Nn) {
  return (t) => lm(t, e);
}
const _m = [
  "pre",
  "script",
  "style",
  "textarea"
], Am = Ma({ newlines: !0 });
function Cm(e = {}) {
  let t = e.indent || 2, n = e.indentInitial;
  return typeof t == "number" && (t = " ".repeat(t)), n == null && (n = !0), (s) => {
    let o;
    Am(s), Ha(s, (a, u) => {
      let c = -1;
      if (!("children" in a))
        return;
      if (It(a, "head") && (o = !0), o && It(a, "body") && (o = void 0), It(a, _m))
        return Ln;
      const f = a.children;
      let h = u.length;
      if (f.length === 0 || !gr(a, o))
        return;
      n || h--;
      let E;
      for (; ++c < f.length; ) {
        const _ = f[c];
        (_.type === "text" || _.type === "comment") && (_.value.includes(`
`) && (E = !0), _.value = _.value.replace(
          / *\n/g,
          "$&" + String(t).repeat(h)
        ));
      }
      const g = [];
      let A;
      for (c = -1; ++c < f.length; ) {
        const _ = f[c];
        (gr(_, o) || E && !c) && (r(g, h, _), E = !0), A = _, g.push(_);
      }
      A && (E || gr(A, o)) && (Ot(A) && (g.pop(), A = g[g.length - 1]), r(g, h - 1)), a.children = g;
    });
  };
  function r(s, o, a) {
    const u = s[s.length - 1], c = Ot(u) ? s[s.length - 2] : u, f = (i(c) && i(a) ? `

` : `
`) + String(t).repeat(Math.max(o, 0));
    u && u.type === "text" ? u.value = Ot(u) ? f : u.value + f : s.push({ type: "text", value: f });
  }
  function i(s) {
    return Boolean(
      s && s.type === "element" && e.blanks && e.blanks.length > 0 && e.blanks.includes(s.tagName)
    );
  }
}
function gr(e, t) {
  return e.type === "root" || (e.type === "element" ? t || It(e, "script") || Xr(e) || !Ua(e) : !1);
}
const $l = "֑-߿יִ-﷽ﹰ-ﻼ", Yl = "A-Za-zÀ-ÖØ-öø-ʸ̀-֐ࠀ-῿‎Ⰰ-﬜︀-﹯﻽-￿", Nm = new RegExp("^[^" + Yl + "]*[" + $l + "]"), Sm = new RegExp("^[^" + $l + "]*[" + Yl + "]");
function ym(e) {
  const t = String(e || "");
  return Nm.test(t) ? "rtl" : Sm.test(t) ? "ltr" : "neutral";
}
function Im(e) {
  return "children" in e ? jl(e) : "value" in e ? e.value : "";
}
function Om(e) {
  return e.type === "text" ? e.value : "children" in e ? jl(e) : "";
}
function jl(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.children.length; )
    n[t] = Om(e.children[t]);
  return n.join("");
}
function xm(e, t) {
  const n = e.schema, r = e.language, i = e.direction, s = e.editableOrEditingHost;
  let o;
  if (t.type === "element" && t.properties) {
    const c = t.properties.xmlLang || t.properties.lang, f = t.properties.type || "text", h = wo(t);
    c != null && (e.language = String(c)), n && n.space === "html" ? (t.properties.contentEditable === "true" && (e.editableOrEditingHost = !0), t.tagName === "svg" && (e.schema = dt), h === "rtl" ? o = h : /* Explicit `[dir=ltr]`. */ h === "ltr" || // HTML with an invalid or no `[dir]`.
    h !== "auto" && t.tagName === "html" || // `input[type=tel]` with an invalid or no `[dir]`.
    h !== "auto" && t.tagName === "input" && f === "tel" ? o = "ltr" : (h === "auto" || t.tagName === "bdi") && (t.tagName === "textarea" ? o = _r(Im(t)) : t.tagName === "input" && (f === "email" || f === "search" || f === "tel" || f === "text") ? o = t.properties.value ? (
      // @ts-expect-error Assume string
      _r(t.properties.value)
    ) : "ltr" : je(t, u)), o && (e.direction = o)) : e.editableOrEditingHost && (e.editableOrEditingHost = !1);
  }
  return a;
  function a() {
    e.schema = n, e.language = r, e.direction = i, e.editableOrEditingHost = s;
  }
  function u(c) {
    if (c.type === "text")
      return o = _r(c.value), o ? M1 : void 0;
    if (c !== t && c.type === "element" && (c.tagName === "bdi" || c.tagName === "script" || c.tagName === "style" || c.tagName === "textare" || wo(c)))
      return Ln;
  }
}
function _r(e) {
  const t = ym(e);
  return t === "neutral" ? void 0 : t;
}
function wo(e) {
  const t = e.type === "element" && e.properties && typeof e.properties.dir == "string" ? e.properties.dir.toLowerCase() : void 0;
  return t === "auto" || t === "ltr" || t === "rtl" ? t : void 0;
}
const bm = s1("operator", {
  unknown: Hm,
  // @ts-expect-error: hush.
  invalid: km,
  handlers: {
    "=": Lm,
    "~=": Mm,
    "|=": Pm,
    "^=": Dm,
    "$=": wm,
    "*=": Fm
  }
});
function Rm(e, t, n) {
  const r = e.attrs;
  let i = -1;
  for (; ++i < r.length; )
    if (!bm(r[i], t, F1(n, r[i].name)))
      return !1;
  return !0;
}
function km(e, t, n) {
  return de(t, n.property);
}
function Lm(e, t, n) {
  return Boolean(
    de(t, n.property) && t.properties && l1(t.properties[n.property], n) === e.value
  );
}
function Mm(e, t, n) {
  const r = t.properties && t.properties[n.property];
  return (
    // If this is a space-separated list, and the query is contained in it, return
    // true.
    !n.commaSeparated && r && typeof r == "object" && e.value && r.includes(e.value) || // For all other values (including comma-separated lists), return whether this
    // is an exact match.
    de(t, n.property) && l1(r, n) === e.value
  );
}
function Pm(e, t, n) {
  const r = l1(
    t.properties && t.properties[n.property],
    n
  );
  return Boolean(
    de(t, n.property) && e.value && (r === e.value || r.slice(0, e.value.length) === e.value && r.charAt(e.value.length) === "-")
  );
}
function Dm(e, t, n) {
  return Boolean(
    de(t, n.property) && t.properties && e.value && l1(t.properties[n.property], n).slice(
      0,
      e.value.length
    ) === e.value
  );
}
function wm(e, t, n) {
  return Boolean(
    de(t, n.property) && t.properties && e.value && l1(t.properties[n.property], n).slice(
      -e.value.length
    ) === e.value
  );
}
function Fm(e, t, n) {
  return Boolean(
    de(t, n.property) && t.properties && e.value && l1(t.properties[n.property], n).includes(
      e.value
    )
  );
}
function Hm(e) {
  throw new Error("Unknown operator `" + e.operator + "`");
}
function l1(e, t) {
  return typeof e == "boolean" ? t.attribute : Array.isArray(e) ? (t.commaSeparated ? qr : Qr)(e) : String(e);
}
function Bm(e, t) {
  const n = t.properties.className || [];
  let r = -1;
  if (e.classNames) {
    for (; ++r < e.classNames.length; )
      if (!n.includes(e.classNames[r]))
        return !1;
  }
  return !0;
}
function Um(e, t) {
  return Boolean(t.properties && t.properties.id === e.id);
}
function vm(e, t) {
  return e.tagName === "*" || e.tagName === t.tagName;
}
function Gm(e, t) {
  return function(n, r) {
    let i = Fo(n, "tag");
    const s = Fo(
      r ?? "*",
      "range"
    ), o = [];
    let a = -1;
    for (; ++a < s.length; ) {
      const u = s[a].toLowerCase();
      if (!t && u === "*")
        continue;
      let c = -1;
      const f = [];
      for (; ++c < i.length; )
        if (e(i[c].toLowerCase(), u)) {
          if (!t)
            return (
              /** @type {IsFilter extends true ? Tags : Tag|undefined} */
              i[c]
            );
          o.push(i[c]);
        } else
          f.push(i[c]);
      i = f;
    }
    return (
      /** @type {IsFilter extends true ? Tags : Tag|undefined} */
      t ? o : void 0
    );
  };
}
const Km = Gm(function(e, t) {
  const n = e.split("-"), r = t.split("-");
  let i = 0, s = 0;
  if (r[s] !== "*" && n[i] !== r[s])
    return !1;
  for (i++, s++; s < r.length; ) {
    if (r[s] === "*") {
      s++;
      continue;
    }
    if (!n[i])
      return !1;
    if (n[i] === r[s]) {
      i++, s++;
      continue;
    }
    if (n[i].length === 1)
      return !1;
    i++;
  }
  return !0;
}, !0);
function Fo(e, t) {
  const n = e && typeof e == "string" ? [e] : e;
  if (!n || typeof n != "object" || !("length" in n))
    throw new Error(
      "Invalid " + t + " `" + n + "`, expected non-empty string"
    );
  return n;
}
const zm = /* @__PURE__ */ new Set([9, 10, 12, 13, 32]), Ho = "0".charCodeAt(0), $m = "9".charCodeAt(0);
function Ym(e) {
  if (e = e.trim().toLowerCase(), e === "even")
    return [2, 0];
  if (e === "odd")
    return [2, 1];
  let t = 0, n = 0, r = s(), i = o();
  if (t < e.length && e.charAt(t) === "n" && (t++, n = r * (i ?? 1), a(), t < e.length ? (r = s(), a(), i = o()) : r = i = 0), i === null || t < e.length)
    throw new Error(`n-th rule couldn't be parsed ('${e}')`);
  return [n, r * i];
  function s() {
    return e.charAt(t) === "-" ? (t++, -1) : (e.charAt(t) === "+" && t++, 1);
  }
  function o() {
    const u = t;
    let c = 0;
    for (; t < e.length && e.charCodeAt(t) >= Ho && e.charCodeAt(t) <= $m; )
      c = c * 10 + (e.charCodeAt(t) - Ho), t++;
    return t === u ? null : c;
  }
  function a() {
    for (; t < e.length && zm.has(e.charCodeAt(t)); )
      t++;
  }
}
var Bo = {
  trueFunc: function() {
    return !0;
  },
  falseFunc: function() {
    return !1;
  }
};
function jm(e) {
  const t = e[0], n = e[1] - 1;
  if (n < 0 && t <= 0)
    return Bo.falseFunc;
  if (t === -1)
    return (s) => s <= n;
  if (t === 0)
    return (s) => s === n;
  if (t === 1)
    return n < 0 ? Bo.trueFunc : (s) => s >= n;
  const r = Math.abs(t), i = (n % r + r) % r;
  return t > 1 ? (s) => s >= n && s % r === i : (s) => s <= n && s % r === i;
}
function Uo(e) {
  return jm(Ym(e));
}
const Qm = Uo.default || Uo, qm = s1("name", {
  unknown: _8,
  invalid: g8,
  handlers: {
    any: Dr,
    "any-link": Wm,
    blank: Vm,
    checked: Xm,
    dir: Zm,
    disabled: ql,
    empty: Jm,
    enabled: e8,
    "first-child": t8,
    "first-of-type": n8,
    has: r8,
    lang: i8,
    "last-child": s8,
    "last-of-type": o8,
    matches: Dr,
    not: a8,
    "nth-child": l8,
    "nth-last-child": u8,
    "nth-of-type": f8,
    "nth-last-of-type": c8,
    "only-child": h8,
    "only-of-type": p8,
    optional: d8,
    "read-only": m8,
    "read-write": Wl,
    required: Vl,
    root: T8,
    scope: E8
  }
});
Ql.needsIndex = [
  "any",
  "first-child",
  "first-of-type",
  "last-child",
  "last-of-type",
  "matches",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-of-type",
  "nth-last-of-type",
  "only-child",
  "only-of-type"
];
function Ql(e, t, n, r, i) {
  const s = e.pseudos;
  let o = -1;
  for (; ++o < s.length; )
    if (!qm(s[o], t, n, r, i))
      return !1;
  return !0;
}
function Wm(e, t) {
  return (t.tagName === "a" || t.tagName === "area" || t.tagName === "link") && de(t, "href");
}
function Vm(e, t) {
  return !Xl(t, n);
  function n(r) {
    return r.type === "element" || r.type === "text" && !Ot(r);
  }
}
function Xm(e, t) {
  return t.tagName === "input" || t.tagName === "menuitem" ? Boolean(
    t.properties && (t.properties.type === "checkbox" || t.properties.type === "radio") && de(t, "checked")
  ) : t.tagName === "option" ? de(t, "selected") : !1;
}
function Zm(e, t, n, r, i) {
  return i.direction === e.value;
}
function ql(e, t) {
  return (t.tagName === "button" || t.tagName === "input" || t.tagName === "select" || t.tagName === "textarea" || t.tagName === "optgroup" || t.tagName === "option" || t.tagName === "menuitem" || t.tagName === "fieldset") && de(t, "disabled");
}
function Jm(e, t) {
  return !Xl(t, n);
  function n(r) {
    return r.type === "element" || r.type === "text";
  }
}
function e8(e, t) {
  return !ql(e, t);
}
function t8(e, t, n, r, i) {
  return rt(i, e), i.elementIndex === 0;
}
function n8(e, t, n, r, i) {
  return rt(i, e), i.typeIndex === 0;
}
function r8(e, t, n, r, i) {
  const s = {
    ...i,
    // Not found yet.
    found: !1,
    // Do walk deep.
    shallow: !1,
    // One result is enough.
    one: !0,
    scopeElements: [t],
    results: [],
    rootQuery: li(e.value)
  };
  return ui(s, { type: "root", children: t.children }), s.results.length > 0;
}
function i8(e, t, n, r, i) {
  return i.language !== "" && i.language !== void 0 && // @ts-expect-error never `selectors`.
  Km(i.language, Ir(e.value)).length > 0;
}
function s8(e, t, n, r, i) {
  return rt(i, e), Boolean(
    i.elementCount && i.elementIndex === i.elementCount - 1
  );
}
function o8(e, t, n, r, i) {
  return rt(i, e), typeof i.typeIndex == "number" && typeof i.typeCount == "number" && i.typeIndex === i.typeCount - 1;
}
function Dr(e, t, n, r, i) {
  const s = {
    ...i,
    // Not found yet.
    found: !1,
    // Do walk deep.
    shallow: !1,
    // One result is enough.
    one: !0,
    scopeElements: [t],
    results: [],
    rootQuery: li(e.value)
  };
  return ui(s, t), s.results[0] === t;
}
function a8(e, t, n, r, i) {
  return !Dr(e, t, n, r, i);
}
function l8(e, t, n, r, i) {
  const s = Fn(e);
  return rt(i, e), typeof i.elementIndex == "number" && s(i.elementIndex);
}
function u8(e, t, n, r, i) {
  const s = Fn(e);
  return rt(i, e), Boolean(
    typeof i.elementCount == "number" && typeof i.elementIndex == "number" && s(i.elementCount - i.elementIndex - 1)
  );
}
function c8(e, t, n, r, i) {
  const s = Fn(e);
  return rt(i, e), typeof i.typeCount == "number" && typeof i.typeIndex == "number" && s(i.typeCount - 1 - i.typeIndex);
}
function f8(e, t, n, r, i) {
  const s = Fn(e);
  return rt(i, e), typeof i.typeIndex == "number" && s(i.typeIndex);
}
function h8(e, t, n, r, i) {
  return rt(i, e), i.elementCount === 1;
}
function p8(e, t, n, r, i) {
  return rt(i, e), i.typeCount === 1;
}
function d8(e, t) {
  return !Vl(e, t);
}
function m8(e, t, n, r, i) {
  return !Wl(e, t, n, r, i);
}
function Wl(e, t, n, r, i) {
  return t.tagName === "input" || t.tagName === "textarea" ? !de(t, "readOnly") && !de(t, "disabled") : Boolean(i.editableOrEditingHost);
}
function Vl(e, t) {
  return (t.tagName === "input" || t.tagName === "textarea" || t.tagName === "select") && de(t, "required");
}
function T8(e, t, n, r, i) {
  return Boolean(
    (!r || r.type === "root") && i.schema && (i.schema.space === "html" || i.schema.space === "svg") && (t.tagName === "html" || t.tagName === "svg")
  );
}
function E8(e, t, n, r, i) {
  return i.scopeElements.includes(t);
}
function g8() {
  throw new Error("Invalid pseudo-selector");
}
function _8(e) {
  throw e.name ? new Error("Unknown pseudo-selector `" + e.name + "`") : new Error("Unexpected pseudo-element or empty pseudo-class");
}
function Xl(e, t) {
  const n = e.children;
  let r = -1;
  for (; ++r < n.length; )
    if (t(n[r]))
      return !0;
  return !1;
}
function rt(e, t) {
  if (e.shallow)
    throw new Error("Cannot use `:" + t.name + "` without parent");
}
function Fn(e) {
  let t = e._cachedFn;
  return t || (t = Qm(e.value), e._cachedFn = t), t;
}
function A8(e, t, n, r, i) {
  return Boolean(
    (!e.tagName || vm(e, t)) && (!e.classNames || Bm(e, t)) && (!e.id || Um(e, t)) && (!e.attrs || Rm(e, t, i.schema)) && (!e.pseudos || Ql(e, t, n, r, i))
  );
}
const C8 = [];
function li(e) {
  return e === null ? { type: "selectors", selectors: [] } : e.type === "ruleSet" ? { type: "selectors", selectors: [e] } : e;
}
function ui(e, t) {
  t && Zl(e, [], t, void 0, void 0);
}
function Zl(e, t, n, r, i) {
  let s = {
    directChild: void 0,
    descendant: void 0,
    adjacentSibling: void 0,
    generalSibling: void 0
  };
  const o = xm(e, n);
  return n.type === "element" && (s = S8(
    e,
    // Try the root rules for this element too.
    pn(t, e.rootQuery.selectors),
    n,
    r,
    i
  )), "children" in n && !e.shallow && !(e.one && e.found) && N8(e, s, n), o(), s;
}
function N8(e, t, n) {
  const r = pn(t.descendant, t.directChild);
  let i, s = -1;
  const o = { count: 0, types: /* @__PURE__ */ new Map() }, a = { count: 0, types: /* @__PURE__ */ new Map() };
  for (; ++s < n.children.length; )
    vo(o, n.children[s]);
  for (s = -1; ++s < n.children.length; ) {
    const u = n.children[s], c = u.type === "element" ? u.tagName.toUpperCase() : void 0;
    if (e.elementIndex = a.count, e.typeIndex = c && a.types.get(c) || 0, e.elementCount = o.count, e.typeCount = c ? o.types.get(c) : 0, "children" in u) {
      const f = pn(r, i), h = Zl(e, f, n.children[s], s, n);
      i = pn(h.generalSibling, h.adjacentSibling);
    }
    if (e.one && e.found)
      break;
    vo(a, n.children[s]);
  }
}
function S8(e, t, n, r, i) {
  const s = {
    directChild: void 0,
    descendant: void 0,
    adjacentSibling: void 0,
    generalSibling: void 0
  };
  let o = -1;
  for (; ++o < t.length; ) {
    const a = t[o];
    if (e.one && e.found)
      break;
    if (e.shallow && a.rule.rule)
      throw new Error("Expected selector without nesting");
    if (A8(a.rule, n, r, i, e)) {
      const u = a.rule.rule;
      if (u) {
        const c = { type: "ruleSet", rule: u }, f = u.nestingOperator === "+" ? "adjacentSibling" : u.nestingOperator === "~" ? "generalSibling" : u.nestingOperator === ">" ? "directChild" : "descendant";
        Ar(s, f, c);
      } else
        e.found = !0, e.results.includes(n) || e.results.push(n);
    }
    a.rule.nestingOperator === null ? Ar(s, "descendant", a) : a.rule.nestingOperator === "~" && Ar(s, "generalSibling", a);
  }
  return s;
}
function pn(e, t) {
  return e && t && e.length > 0 && t.length > 0 ? [...e, ...t] : e && e.length > 0 ? e : t && t.length > 0 ? t : C8;
}
function Ar(e, t, n) {
  const r = e[t];
  r ? r.push(n) : e[t] = [n];
}
function vo(e, t) {
  if (t.type === "element") {
    const n = t.tagName.toUpperCase(), r = (e.types.get(n) || 0) + 1;
    e.count++, e.types.set(n, r);
  }
}
var Jl = {}, ci = {}, fi = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 });
  function t(o) {
    return o >= "a" && o <= "z" || o >= "A" && o <= "Z" || o === "-" || o === "_";
  }
  e.isIdentStart = t;
  function n(o) {
    return o >= "a" && o <= "z" || o >= "A" && o <= "Z" || o >= "0" && o <= "9" || o === "-" || o === "_";
  }
  e.isIdent = n;
  function r(o) {
    return o >= "a" && o <= "f" || o >= "A" && o <= "F" || o >= "0" && o <= "9";
  }
  e.isHex = r;
  function i(o) {
    for (var a = o.length, u = "", c = 0; c < a; ) {
      var f = o.charAt(c);
      if (e.identSpecialChars[f])
        u += "\\" + f;
      else if (f === "_" || f === "-" || f >= "A" && f <= "Z" || f >= "a" && f <= "z" || c !== 0 && f >= "0" && f <= "9")
        u += f;
      else {
        var h = f.charCodeAt(0);
        if ((h & 63488) === 55296) {
          var E = o.charCodeAt(c++);
          if ((h & 64512) !== 55296 || (E & 64512) !== 56320)
            throw Error("UCS-2(decode): illegal sequence");
          h = ((h & 1023) << 10) + (E & 1023) + 65536;
        }
        u += "\\" + h.toString(16) + " ";
      }
      c++;
    }
    return u;
  }
  e.escapeIdentifier = i;
  function s(o) {
    for (var a = o.length, u = "", c = 0, f; c < a; ) {
      var h = o.charAt(c);
      h === '"' ? h = '\\"' : h === "\\" ? h = "\\\\" : (f = e.strReplacementsRev[h]) !== void 0 && (h = f), u += h, c++;
    }
    return '"' + u + '"';
  }
  e.escapeStr = s, e.identSpecialChars = {
    "!": !0,
    '"': !0,
    "#": !0,
    $: !0,
    "%": !0,
    "&": !0,
    "'": !0,
    "(": !0,
    ")": !0,
    "*": !0,
    "+": !0,
    ",": !0,
    ".": !0,
    "/": !0,
    ";": !0,
    "<": !0,
    "=": !0,
    ">": !0,
    "?": !0,
    "@": !0,
    "[": !0,
    "\\": !0,
    "]": !0,
    "^": !0,
    "`": !0,
    "{": !0,
    "|": !0,
    "}": !0,
    "~": !0
  }, e.strReplacementsRev = {
    "\n": "\\n",
    "\r": "\\r",
    "	": "\\t",
    "\f": "\\f",
    "\v": "\\v"
  }, e.singleQuoteEscapeChars = {
    n: `
`,
    r: "\r",
    t: "	",
    f: "\f",
    "\\": "\\",
    "'": "'"
  }, e.doubleQuotesEscapeChars = {
    n: `
`,
    r: "\r",
    t: "	",
    f: "\f",
    "\\": "\\",
    '"': '"'
  };
})(fi);
Object.defineProperty(ci, "__esModule", { value: !0 });
var ze = fi;
function y8(e, t, n, r, i, s) {
  var o = e.length, a = "";
  function u(_, b) {
    var N = "";
    for (t++, a = e.charAt(t); t < o; ) {
      if (a === _)
        return t++, N;
      if (a === "\\") {
        t++, a = e.charAt(t);
        var D = void 0;
        if (a === _)
          N += _;
        else if ((D = b[a]) !== void 0)
          N += D;
        else if (ze.isHex(a)) {
          var L = a;
          for (t++, a = e.charAt(t); ze.isHex(a); )
            L += a, t++, a = e.charAt(t);
          a === " " && (t++, a = e.charAt(t)), N += String.fromCharCode(parseInt(L, 16));
          continue;
        } else
          N += a;
      } else
        N += a;
      t++, a = e.charAt(t);
    }
    return N;
  }
  function c() {
    var _ = "";
    for (a = e.charAt(t); t < o; ) {
      if (ze.isIdent(a))
        _ += a;
      else if (a === "\\") {
        if (t++, t >= o)
          throw Error("Expected symbol but end of file reached.");
        if (a = e.charAt(t), ze.identSpecialChars[a])
          _ += a;
        else if (ze.isHex(a)) {
          var b = a;
          for (t++, a = e.charAt(t); ze.isHex(a); )
            b += a, t++, a = e.charAt(t);
          a === " " && (t++, a = e.charAt(t)), _ += String.fromCharCode(parseInt(b, 16));
          continue;
        } else
          _ += a;
      } else
        return _;
      t++, a = e.charAt(t);
    }
    return _;
  }
  function f() {
    a = e.charAt(t);
    for (var _ = !1; a === " " || a === "	" || a === `
` || a === "\r" || a === "\f"; )
      _ = !0, t++, a = e.charAt(t);
    return _;
  }
  function h() {
    var _ = E();
    if (t < o)
      throw Error('Rule expected but "' + e.charAt(t) + '" found.');
    return _;
  }
  function E() {
    var _ = g();
    if (!_)
      return null;
    var b = _;
    for (a = e.charAt(t); a === ","; ) {
      if (t++, f(), b.type !== "selectors" && (b = {
        type: "selectors",
        selectors: [_]
      }), _ = g(), !_)
        throw Error('Rule expected after ",".');
      b.selectors.push(_);
    }
    return b;
  }
  function g() {
    f();
    var _ = {
      type: "ruleSet"
    }, b = A();
    if (!b)
      return null;
    for (var N = _; b && (b.type = "rule", N.rule = b, N = b, f(), a = e.charAt(t), !(t >= o || a === "," || a === ")")); )
      if (i[a]) {
        var D = a;
        if (t++, f(), b = A(), !b)
          throw Error('Rule expected after "' + D + '".');
        b.nestingOperator = D;
      } else
        b = A(), b && (b.nestingOperator = null);
    return _;
  }
  function A() {
    for (var _ = null; t < o; )
      if (a = e.charAt(t), a === "*")
        t++, (_ = _ || {}).tagName = "*";
      else if (ze.isIdentStart(a) || a === "\\")
        (_ = _ || {}).tagName = c();
      else if (a === ".")
        t++, _ = _ || {}, (_.classNames = _.classNames || []).push(c());
      else if (a === "#")
        t++, (_ = _ || {}).id = c();
      else if (a === "[") {
        t++, f();
        var b = {
          name: c()
        };
        if (f(), a === "]")
          t++;
        else {
          var N = "";
          if (r[a] && (N = a, t++, a = e.charAt(t)), t >= o)
            throw Error('Expected "=" but end of file reached.');
          if (a !== "=")
            throw Error('Expected "=" but "' + a + '" found.');
          b.operator = N + "=", t++, f();
          var D = "";
          if (b.valueType = "string", a === '"')
            D = u('"', ze.doubleQuotesEscapeChars);
          else if (a === "'")
            D = u("'", ze.singleQuoteEscapeChars);
          else if (s && a === "$")
            t++, D = c(), b.valueType = "substitute";
          else {
            for (; t < o && a !== "]"; )
              D += a, t++, a = e.charAt(t);
            D = D.trim();
          }
          if (f(), t >= o)
            throw Error('Expected "]" but end of file reached.');
          if (a !== "]")
            throw Error('Expected "]" but "' + a + '" found.');
          t++, b.value = D;
        }
        _ = _ || {}, (_.attrs = _.attrs || []).push(b);
      } else if (a === ":") {
        t++;
        var L = c(), B = {
          name: L
        };
        if (a === "(") {
          t++;
          var U = "";
          if (f(), n[L] === "selector")
            B.valueType = "selector", U = E();
          else {
            if (B.valueType = n[L] || "string", a === '"')
              U = u('"', ze.doubleQuotesEscapeChars);
            else if (a === "'")
              U = u("'", ze.singleQuoteEscapeChars);
            else if (s && a === "$")
              t++, U = c(), B.valueType = "substitute";
            else {
              for (; t < o && a !== ")"; )
                U += a, t++, a = e.charAt(t);
              U = U.trim();
            }
            f();
          }
          if (t >= o)
            throw Error('Expected ")" but end of file reached.');
          if (a !== ")")
            throw Error('Expected ")" but "' + a + '" found.');
          t++, B.value = U;
        }
        _ = _ || {}, (_.pseudos = _.pseudos || []).push(B);
      } else
        break;
    return _;
  }
  return h();
}
ci.parseCssSelector = y8;
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
var xe = fi;
function dn(e) {
  var t = "";
  switch (e.type) {
    case "ruleSet":
      for (var n = e.rule, r = []; n; )
        n.nestingOperator && r.push(n.nestingOperator), r.push(dn(n)), n = n.rule;
      t = r.join(" ");
      break;
    case "selectors":
      t = e.selectors.map(dn).join(", ");
      break;
    case "rule":
      e.tagName && (e.tagName === "*" ? t = "*" : t = xe.escapeIdentifier(e.tagName)), e.id && (t += "#" + xe.escapeIdentifier(e.id)), e.classNames && (t += e.classNames.map(function(i) {
        return "." + xe.escapeIdentifier(i);
      }).join("")), e.attrs && (t += e.attrs.map(function(i) {
        return "operator" in i ? i.valueType === "substitute" ? "[" + xe.escapeIdentifier(i.name) + i.operator + "$" + i.value + "]" : "[" + xe.escapeIdentifier(i.name) + i.operator + xe.escapeStr(i.value) + "]" : "[" + xe.escapeIdentifier(i.name) + "]";
      }).join("")), e.pseudos && (t += e.pseudos.map(function(i) {
        return i.valueType ? i.valueType === "selector" ? ":" + xe.escapeIdentifier(i.name) + "(" + dn(i.value) + ")" : i.valueType === "substitute" ? ":" + xe.escapeIdentifier(i.name) + "($" + i.value + ")" : i.valueType === "numeric" ? ":" + xe.escapeIdentifier(i.name) + "(" + i.value + ")" : ":" + xe.escapeIdentifier(i.name) + "(" + xe.escapeIdentifier(i.value) + ")" : ":" + xe.escapeIdentifier(i.name);
      }).join(""));
      break;
    default:
      throw Error('Unknown entity type: "' + e.type + '".');
  }
  return t;
}
hi.renderEntity = dn;
Object.defineProperty(Jl, "__esModule", { value: !0 });
var I8 = ci, O8 = hi, x8 = (
  /** @class */
  function() {
    function e() {
      this.pseudos = {}, this.attrEqualityMods = {}, this.ruleNestingOperators = {}, this.substitutesEnabled = !1;
    }
    return e.prototype.registerSelectorPseudos = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        this.pseudos[s] = "selector";
      }
      return this;
    }, e.prototype.unregisterSelectorPseudos = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        delete this.pseudos[s];
      }
      return this;
    }, e.prototype.registerNumericPseudos = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        this.pseudos[s] = "numeric";
      }
      return this;
    }, e.prototype.unregisterNumericPseudos = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        delete this.pseudos[s];
      }
      return this;
    }, e.prototype.registerNestingOperators = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        this.ruleNestingOperators[s] = !0;
      }
      return this;
    }, e.prototype.unregisterNestingOperators = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        delete this.ruleNestingOperators[s];
      }
      return this;
    }, e.prototype.registerAttrEqualityMods = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        this.attrEqualityMods[s] = !0;
      }
      return this;
    }, e.prototype.unregisterAttrEqualityMods = function() {
      for (var t = [], n = 0; n < arguments.length; n++)
        t[n] = arguments[n];
      for (var r = 0, i = t; r < i.length; r++) {
        var s = i[r];
        delete this.attrEqualityMods[s];
      }
      return this;
    }, e.prototype.enableSubstitutes = function() {
      return this.substitutesEnabled = !0, this;
    }, e.prototype.disableSubstitutes = function() {
      return this.substitutesEnabled = !1, this;
    }, e.prototype.parse = function(t) {
      return I8.parseCssSelector(t, 0, this.pseudos, this.attrEqualityMods, this.ruleNestingOperators, this.substitutesEnabled);
    }, e.prototype.render = function(t) {
      return O8.renderEntity(t).trim();
    }, e;
  }()
), b8 = Jl.CssSelectorParser = x8;
const Hn = new b8();
Hn.registerAttrEqualityMods("~", "|", "^", "$", "*");
Hn.registerSelectorPseudos("any", "matches", "not", "has");
Hn.registerNestingOperators(">", "+", "~");
function R8(e) {
  if (typeof e != "string")
    throw new TypeError("Expected `string` as selector, not `" + e + "`");
  return Hn.parse(e);
}
function k8(e, t, n) {
  const r = L8(e, t, n);
  return ui(r, t || void 0), r.results;
}
function L8(e, t, n) {
  return {
    // State of the query.
    rootQuery: li(R8(e)),
    results: [],
    // @ts-expect-error assume elements.
    scopeElements: t ? t.type === "root" ? t.children : [t] : [],
    one: !1,
    shallow: !1,
    found: !1,
    // State in the tree.
    schema: n === "svg" ? dt : r1,
    language: void 0,
    direction: "ltr",
    editableOrEditingHost: !1,
    typeIndex: void 0,
    elementIndex: void 0,
    typeCount: void 0,
    elementCount: void 0
  };
}
const M8 = (e) => {
  const { selector: t, rewrite: n } = e || {};
  return (r) => {
    if (!(!n || typeof n != "function")) {
      if (t && typeof t == "string") {
        const i = k8(t, r);
        i && i.length > 0 && je(r, i, (s, o, a) => {
          n(s, o, a);
        });
        return;
      }
      je(r, (i, s, o) => {
        n(i, s, o);
      });
    }
  };
}, P8 = M8, D8 = zo().use(Xp).use(Dd, { allowDangerousHtml: !0 }).use(P8, {
  rewrite: (e, t, n) => {
    e.type == "element" && e.tagName == "a" && e.properties && (e.properties.target = "_blank", e.properties.rel = "noopener noreferrer nofollow");
  }
}).use(am).use(gm, {
  tagNames: [
    ...Nn.tagNames,
    "iframe",
    "footer",
    "header",
    "audio",
    "source"
  ],
  attributes: {
    ...Nn.attributes,
    a: ["href", "ref", "target"],
    img: ["src", "srcSet", "data*"],
    audio: ["controls", "data*", ["preload", "metadata"]],
    source: ["src", "type", "data*"],
    figure: [["className", "image", "audio", "embed-code", "embed-video"]],
    div: [
      [
        "className",
        "player",
        "progress-bar",
        "meta",
        "time",
        "iframe-container"
      ],
      "data*"
    ],
    h4: [["className", "title"]],
    span: [["className", "play", "current", "duration"], "data*"],
    iframe: [
      "src",
      "allowFullScreen",
      ["loading", "lazy"],
      ["frameBorder", "0"],
      ["sandbox", "allow-scripts", "allow-same-origin", "allow-popups"]
    ]
  }
}).use(Cm).use(Hd, {
  closeSelfClosing: !0,
  closeEmptyElements: !0,
  tightSelfClosing: !1
}), W8 = async (e) => {
  const t = await D8.process(e);
  return String(t);
};
export {
  w8 as ArticleEditor,
  F8 as CommentEditor,
  q8 as html2md,
  W8 as md2html
};
