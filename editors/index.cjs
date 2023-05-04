'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

// ::- Persistent data structure representing an ordered mapping from
// strings to values, with some convenient update methods.
function OrderedMap(content) {
  this.content = content;
}

OrderedMap.prototype = {
  constructor: OrderedMap,

  find: function(key) {
    for (var i = 0; i < this.content.length; i += 2)
      if (this.content[i] === key) return i
    return -1
  },

  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(key) {
    var found = this.find(key);
    return found == -1 ? undefined : this.content[found + 1]
  },

  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(key, value, newKey) {
    var self = newKey && newKey != key ? this.remove(newKey) : this;
    var found = self.find(key), content = self.content.slice();
    if (found == -1) {
      content.push(newKey || key, value);
    } else {
      content[found + 1] = value;
      if (newKey) content[found] = newKey;
    }
    return new OrderedMap(content)
  },

  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(key) {
    var found = this.find(key);
    if (found == -1) return this
    var content = this.content.slice();
    content.splice(found, 2);
    return new OrderedMap(content)
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(key, value) {
    return new OrderedMap([key, value].concat(this.remove(key).content))
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(key, value) {
    var content = this.remove(key).content.slice();
    content.push(key, value);
    return new OrderedMap(content)
  },

  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(place, key, value) {
    var without = this.remove(key), content = without.content.slice();
    var found = without.find(place);
    content.splice(found == -1 ? content.length : found, 0, key, value);
    return new OrderedMap(content)
  },

  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(f) {
    for (var i = 0; i < this.content.length; i += 2)
      f(this.content[i], this.content[i + 1]);
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(map) {
    map = OrderedMap.from(map);
    if (!map.size) return this
    return new OrderedMap(map.content.concat(this.subtract(map).content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(map) {
    map = OrderedMap.from(map);
    if (!map.size) return this
    return new OrderedMap(this.subtract(map).content.concat(map.content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(map) {
    var result = this;
    map = OrderedMap.from(map);
    for (var i = 0; i < map.content.length; i += 2)
      result = result.remove(map.content[i]);
    return result
  },

  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var result = {};
    this.forEach(function(key, value) { result[key] = value; });
    return result
  },

  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1
  }
};

// :: (?union<Object, OrderedMap>) → OrderedMap
// Return a map with the given content. If null, create an empty
// map. If given an ordered map, return that map itself. If given an
// object, create a map from the object's properties.
OrderedMap.from = function(value) {
  if (value instanceof OrderedMap) return value
  var content = [];
  if (value) for (var prop in value) content.push(prop, value[prop]);
  return new OrderedMap(content)
};

function findDiffStart(a, b, pos) {
    for (let i = 0;; i++) {
        if (i == a.childCount || i == b.childCount)
            return a.childCount == b.childCount ? null : pos;
        let childA = a.child(i), childB = b.child(i);
        if (childA == childB) {
            pos += childA.nodeSize;
            continue;
        }
        if (!childA.sameMarkup(childB))
            return pos;
        if (childA.isText && childA.text != childB.text) {
            for (let j = 0; childA.text[j] == childB.text[j]; j++)
                pos++;
            return pos;
        }
        if (childA.content.size || childB.content.size) {
            let inner = findDiffStart(childA.content, childB.content, pos + 1);
            if (inner != null)
                return inner;
        }
        pos += childA.nodeSize;
    }
}
function findDiffEnd(a, b, posA, posB) {
    for (let iA = a.childCount, iB = b.childCount;;) {
        if (iA == 0 || iB == 0)
            return iA == iB ? null : { a: posA, b: posB };
        let childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
        if (childA == childB) {
            posA -= size;
            posB -= size;
            continue;
        }
        if (!childA.sameMarkup(childB))
            return { a: posA, b: posB };
        if (childA.isText && childA.text != childB.text) {
            let same = 0, minSize = Math.min(childA.text.length, childB.text.length);
            while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
                same++;
                posA--;
                posB--;
            }
            return { a: posA, b: posB };
        }
        if (childA.content.size || childB.content.size) {
            let inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
            if (inner)
                return inner;
        }
        posA -= size;
        posB -= size;
    }
}

/**
A fragment represents a node's collection of child nodes.

Like nodes, fragments are persistent data structures, and you
should not mutate them or their content. Rather, you create new
instances whenever needed. The API tries to make this easy.
*/
class Fragment {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    content, size) {
        this.content = content;
        this.size = size || 0;
        if (size == null)
            for (let i = 0; i < content.length; i++)
                this.size += content[i].nodeSize;
    }
    /**
    Invoke a callback for all descendant nodes between the given two
    positions (relative to start of this fragment). Doesn't descend
    into a node when the callback returns `false`.
    */
    nodesBetween(from, to, f, nodeStart = 0, parent) {
        for (let i = 0, pos = 0; pos < to; i++) {
            let child = this.content[i], end = pos + child.nodeSize;
            if (end > from && f(child, nodeStart + pos, parent || null, i) !== false && child.content.size) {
                let start = pos + 1;
                child.nodesBetween(Math.max(0, from - start), Math.min(child.content.size, to - start), f, nodeStart + start);
            }
            pos = end;
        }
    }
    /**
    Call the given callback for every descendant node. `pos` will be
    relative to the start of the fragment. The callback may return
    `false` to prevent traversal of a given node's children.
    */
    descendants(f) {
        this.nodesBetween(0, this.size, f);
    }
    /**
    Extract the text between `from` and `to`. See the same method on
    [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
    */
    textBetween(from, to, blockSeparator, leafText) {
        let text = "", separated = true;
        this.nodesBetween(from, to, (node, pos) => {
            if (node.isText) {
                text += node.text.slice(Math.max(from, pos) - pos, to - pos);
                separated = !blockSeparator;
            }
            else if (node.isLeaf) {
                if (leafText) {
                    text += typeof leafText === "function" ? leafText(node) : leafText;
                }
                else if (node.type.spec.leafText) {
                    text += node.type.spec.leafText(node);
                }
                separated = !blockSeparator;
            }
            else if (!separated && node.isBlock) {
                text += blockSeparator;
                separated = true;
            }
        }, 0);
        return text;
    }
    /**
    Create a new fragment containing the combined content of this
    fragment and the other.
    */
    append(other) {
        if (!other.size)
            return this;
        if (!this.size)
            return other;
        let last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0;
        if (last.isText && last.sameMarkup(first)) {
            content[content.length - 1] = last.withText(last.text + first.text);
            i = 1;
        }
        for (; i < other.content.length; i++)
            content.push(other.content[i]);
        return new Fragment(content, this.size + other.size);
    }
    /**
    Cut out the sub-fragment between the two given positions.
    */
    cut(from, to = this.size) {
        if (from == 0 && to == this.size)
            return this;
        let result = [], size = 0;
        if (to > from)
            for (let i = 0, pos = 0; pos < to; i++) {
                let child = this.content[i], end = pos + child.nodeSize;
                if (end > from) {
                    if (pos < from || end > to) {
                        if (child.isText)
                            child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos));
                        else
                            child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1));
                    }
                    result.push(child);
                    size += child.nodeSize;
                }
                pos = end;
            }
        return new Fragment(result, size);
    }
    /**
    @internal
    */
    cutByIndex(from, to) {
        if (from == to)
            return Fragment.empty;
        if (from == 0 && to == this.content.length)
            return this;
        return new Fragment(this.content.slice(from, to));
    }
    /**
    Create a new fragment in which the node at the given index is
    replaced by the given node.
    */
    replaceChild(index, node) {
        let current = this.content[index];
        if (current == node)
            return this;
        let copy = this.content.slice();
        let size = this.size + node.nodeSize - current.nodeSize;
        copy[index] = node;
        return new Fragment(copy, size);
    }
    /**
    Create a new fragment by prepending the given node to this
    fragment.
    */
    addToStart(node) {
        return new Fragment([node].concat(this.content), this.size + node.nodeSize);
    }
    /**
    Create a new fragment by appending the given node to this
    fragment.
    */
    addToEnd(node) {
        return new Fragment(this.content.concat(node), this.size + node.nodeSize);
    }
    /**
    Compare this fragment to another one.
    */
    eq(other) {
        if (this.content.length != other.content.length)
            return false;
        for (let i = 0; i < this.content.length; i++)
            if (!this.content[i].eq(other.content[i]))
                return false;
        return true;
    }
    /**
    The first child of the fragment, or `null` if it is empty.
    */
    get firstChild() { return this.content.length ? this.content[0] : null; }
    /**
    The last child of the fragment, or `null` if it is empty.
    */
    get lastChild() { return this.content.length ? this.content[this.content.length - 1] : null; }
    /**
    The number of child nodes in this fragment.
    */
    get childCount() { return this.content.length; }
    /**
    Get the child node at the given index. Raise an error when the
    index is out of range.
    */
    child(index) {
        let found = this.content[index];
        if (!found)
            throw new RangeError("Index " + index + " out of range for " + this);
        return found;
    }
    /**
    Get the child node at the given index, if it exists.
    */
    maybeChild(index) {
        return this.content[index] || null;
    }
    /**
    Call `f` for every child node, passing the node, its offset
    into this parent node, and its index.
    */
    forEach(f) {
        for (let i = 0, p = 0; i < this.content.length; i++) {
            let child = this.content[i];
            f(child, p, i);
            p += child.nodeSize;
        }
    }
    /**
    Find the first position at which this fragment and another
    fragment differ, or `null` if they are the same.
    */
    findDiffStart(other, pos = 0) {
        return findDiffStart(this, other, pos);
    }
    /**
    Find the first position, searching from the end, at which this
    fragment and the given fragment differ, or `null` if they are
    the same. Since this position will not be the same in both
    nodes, an object with two separate positions is returned.
    */
    findDiffEnd(other, pos = this.size, otherPos = other.size) {
        return findDiffEnd(this, other, pos, otherPos);
    }
    /**
    Find the index and inner offset corresponding to a given relative
    position in this fragment. The result object will be reused
    (overwritten) the next time the function is called. (Not public.)
    */
    findIndex(pos, round = -1) {
        if (pos == 0)
            return retIndex(0, pos);
        if (pos == this.size)
            return retIndex(this.content.length, pos);
        if (pos > this.size || pos < 0)
            throw new RangeError(`Position ${pos} outside of fragment (${this})`);
        for (let i = 0, curPos = 0;; i++) {
            let cur = this.child(i), end = curPos + cur.nodeSize;
            if (end >= pos) {
                if (end == pos || round > 0)
                    return retIndex(i + 1, end);
                return retIndex(i, curPos);
            }
            curPos = end;
        }
    }
    /**
    Return a debugging string that describes this fragment.
    */
    toString() { return "<" + this.toStringInner() + ">"; }
    /**
    @internal
    */
    toStringInner() { return this.content.join(", "); }
    /**
    Create a JSON-serializeable representation of this fragment.
    */
    toJSON() {
        return this.content.length ? this.content.map(n => n.toJSON()) : null;
    }
    /**
    Deserialize a fragment from its JSON representation.
    */
    static fromJSON(schema, value) {
        if (!value)
            return Fragment.empty;
        if (!Array.isArray(value))
            throw new RangeError("Invalid input for Fragment.fromJSON");
        return new Fragment(value.map(schema.nodeFromJSON));
    }
    /**
    Build a fragment from an array of nodes. Ensures that adjacent
    text nodes with the same marks are joined together.
    */
    static fromArray(array) {
        if (!array.length)
            return Fragment.empty;
        let joined, size = 0;
        for (let i = 0; i < array.length; i++) {
            let node = array[i];
            size += node.nodeSize;
            if (i && node.isText && array[i - 1].sameMarkup(node)) {
                if (!joined)
                    joined = array.slice(0, i);
                joined[joined.length - 1] = node
                    .withText(joined[joined.length - 1].text + node.text);
            }
            else if (joined) {
                joined.push(node);
            }
        }
        return new Fragment(joined || array, size);
    }
    /**
    Create a fragment from something that can be interpreted as a
    set of nodes. For `null`, it returns the empty fragment. For a
    fragment, the fragment itself. For a node or array of nodes, a
    fragment containing those nodes.
    */
    static from(nodes) {
        if (!nodes)
            return Fragment.empty;
        if (nodes instanceof Fragment)
            return nodes;
        if (Array.isArray(nodes))
            return this.fromArray(nodes);
        if (nodes.attrs)
            return new Fragment([nodes], nodes.nodeSize);
        throw new RangeError("Can not convert " + nodes + " to a Fragment" +
            (nodes.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
    }
}
/**
An empty fragment. Intended to be reused whenever a node doesn't
contain anything (rather than allocating a new empty fragment for
each leaf node).
*/
Fragment.empty = new Fragment([], 0);
const found = { index: 0, offset: 0 };
function retIndex(index, offset) {
    found.index = index;
    found.offset = offset;
    return found;
}

function compareDeep(a, b) {
    if (a === b)
        return true;
    if (!(a && typeof a == "object") ||
        !(b && typeof b == "object"))
        return false;
    let array = Array.isArray(a);
    if (Array.isArray(b) != array)
        return false;
    if (array) {
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!compareDeep(a[i], b[i]))
                return false;
    }
    else {
        for (let p in a)
            if (!(p in b) || !compareDeep(a[p], b[p]))
                return false;
        for (let p in b)
            if (!(p in a))
                return false;
    }
    return true;
}

/**
A mark is a piece of information that can be attached to a node,
such as it being emphasized, in code font, or a link. It has a
type and optionally a set of attributes that provide further
information (such as the target of the link). Marks are created
through a `Schema`, which controls which types exist and which
attributes they have.
*/
let Mark$1 = class Mark {
    /**
    @internal
    */
    constructor(
    /**
    The type of this mark.
    */
    type, 
    /**
    The attributes associated with this mark.
    */
    attrs) {
        this.type = type;
        this.attrs = attrs;
    }
    /**
    Given a set of marks, create a new set which contains this one as
    well, in the right position. If this mark is already in the set,
    the set itself is returned. If any marks that are set to be
    [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
    those are replaced by this one.
    */
    addToSet(set) {
        let copy, placed = false;
        for (let i = 0; i < set.length; i++) {
            let other = set[i];
            if (this.eq(other))
                return set;
            if (this.type.excludes(other.type)) {
                if (!copy)
                    copy = set.slice(0, i);
            }
            else if (other.type.excludes(this.type)) {
                return set;
            }
            else {
                if (!placed && other.type.rank > this.type.rank) {
                    if (!copy)
                        copy = set.slice(0, i);
                    copy.push(this);
                    placed = true;
                }
                if (copy)
                    copy.push(other);
            }
        }
        if (!copy)
            copy = set.slice();
        if (!placed)
            copy.push(this);
        return copy;
    }
    /**
    Remove this mark from the given set, returning a new set. If this
    mark is not in the set, the set itself is returned.
    */
    removeFromSet(set) {
        for (let i = 0; i < set.length; i++)
            if (this.eq(set[i]))
                return set.slice(0, i).concat(set.slice(i + 1));
        return set;
    }
    /**
    Test whether this mark is in the given set of marks.
    */
    isInSet(set) {
        for (let i = 0; i < set.length; i++)
            if (this.eq(set[i]))
                return true;
        return false;
    }
    /**
    Test whether this mark has the same type and attributes as
    another mark.
    */
    eq(other) {
        return this == other ||
            (this.type == other.type && compareDeep(this.attrs, other.attrs));
    }
    /**
    Convert this mark to a JSON-serializeable representation.
    */
    toJSON() {
        let obj = { type: this.type.name };
        for (let _ in this.attrs) {
            obj.attrs = this.attrs;
            break;
        }
        return obj;
    }
    /**
    Deserialize a mark from JSON.
    */
    static fromJSON(schema, json) {
        if (!json)
            throw new RangeError("Invalid input for Mark.fromJSON");
        let type = schema.marks[json.type];
        if (!type)
            throw new RangeError(`There is no mark type ${json.type} in this schema`);
        return type.create(json.attrs);
    }
    /**
    Test whether two sets of marks are identical.
    */
    static sameSet(a, b) {
        if (a == b)
            return true;
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!a[i].eq(b[i]))
                return false;
        return true;
    }
    /**
    Create a properly sorted mark set from null, a single mark, or an
    unsorted array of marks.
    */
    static setFrom(marks) {
        if (!marks || Array.isArray(marks) && marks.length == 0)
            return Mark.none;
        if (marks instanceof Mark)
            return [marks];
        let copy = marks.slice();
        copy.sort((a, b) => a.type.rank - b.type.rank);
        return copy;
    }
};
/**
The empty set of marks.
*/
Mark$1.none = [];

/**
Error type raised by [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) when
given an invalid replacement.
*/
class ReplaceError extends Error {
}
/*
ReplaceError = function(this: any, message: string) {
  let err = Error.call(this, message)
  ;(err as any).__proto__ = ReplaceError.prototype
  return err
} as any

ReplaceError.prototype = Object.create(Error.prototype)
ReplaceError.prototype.constructor = ReplaceError
ReplaceError.prototype.name = "ReplaceError"
*/
/**
A slice represents a piece cut out of a larger document. It
stores not only a fragment, but also the depth up to which nodes on
both side are ‘open’ (cut through).
*/
class Slice {
    /**
    Create a slice. When specifying a non-zero open depth, you must
    make sure that there are nodes of at least that depth at the
    appropriate side of the fragment—i.e. if the fragment is an
    empty paragraph node, `openStart` and `openEnd` can't be greater
    than 1.
    
    It is not necessary for the content of open nodes to conform to
    the schema's content constraints, though it should be a valid
    start/end/middle for such a node, depending on which sides are
    open.
    */
    constructor(
    /**
    The slice's content.
    */
    content, 
    /**
    The open depth at the start of the fragment.
    */
    openStart, 
    /**
    The open depth at the end.
    */
    openEnd) {
        this.content = content;
        this.openStart = openStart;
        this.openEnd = openEnd;
    }
    /**
    The size this slice would add when inserted into a document.
    */
    get size() {
        return this.content.size - this.openStart - this.openEnd;
    }
    /**
    @internal
    */
    insertAt(pos, fragment) {
        let content = insertInto(this.content, pos + this.openStart, fragment);
        return content && new Slice(content, this.openStart, this.openEnd);
    }
    /**
    @internal
    */
    removeBetween(from, to) {
        return new Slice(removeRange(this.content, from + this.openStart, to + this.openStart), this.openStart, this.openEnd);
    }
    /**
    Tests whether this slice is equal to another slice.
    */
    eq(other) {
        return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd;
    }
    /**
    @internal
    */
    toString() {
        return this.content + "(" + this.openStart + "," + this.openEnd + ")";
    }
    /**
    Convert a slice to a JSON-serializable representation.
    */
    toJSON() {
        if (!this.content.size)
            return null;
        let json = { content: this.content.toJSON() };
        if (this.openStart > 0)
            json.openStart = this.openStart;
        if (this.openEnd > 0)
            json.openEnd = this.openEnd;
        return json;
    }
    /**
    Deserialize a slice from its JSON representation.
    */
    static fromJSON(schema, json) {
        if (!json)
            return Slice.empty;
        let openStart = json.openStart || 0, openEnd = json.openEnd || 0;
        if (typeof openStart != "number" || typeof openEnd != "number")
            throw new RangeError("Invalid input for Slice.fromJSON");
        return new Slice(Fragment.fromJSON(schema, json.content), openStart, openEnd);
    }
    /**
    Create a slice from a fragment by taking the maximum possible
    open value on both side of the fragment.
    */
    static maxOpen(fragment, openIsolating = true) {
        let openStart = 0, openEnd = 0;
        for (let n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild)
            openStart++;
        for (let n = fragment.lastChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.lastChild)
            openEnd++;
        return new Slice(fragment, openStart, openEnd);
    }
}
/**
The empty slice.
*/
Slice.empty = new Slice(Fragment.empty, 0, 0);
function removeRange(content, from, to) {
    let { index, offset } = content.findIndex(from), child = content.maybeChild(index);
    let { index: indexTo, offset: offsetTo } = content.findIndex(to);
    if (offset == from || child.isText) {
        if (offsetTo != to && !content.child(indexTo).isText)
            throw new RangeError("Removing non-flat range");
        return content.cut(0, from).append(content.cut(to));
    }
    if (index != indexTo)
        throw new RangeError("Removing non-flat range");
    return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)));
}
function insertInto(content, dist, insert, parent) {
    let { index, offset } = content.findIndex(dist), child = content.maybeChild(index);
    if (offset == dist || child.isText) {
        if (parent && !parent.canReplace(index, index, insert))
            return null;
        return content.cut(0, dist).append(insert).append(content.cut(dist));
    }
    let inner = insertInto(child.content, dist - offset - 1, insert);
    return inner && content.replaceChild(index, child.copy(inner));
}
function replace($from, $to, slice) {
    if (slice.openStart > $from.depth)
        throw new ReplaceError("Inserted content deeper than insertion position");
    if ($from.depth - slice.openStart != $to.depth - slice.openEnd)
        throw new ReplaceError("Inconsistent open depths");
    return replaceOuter($from, $to, slice, 0);
}
function replaceOuter($from, $to, slice, depth) {
    let index = $from.index(depth), node = $from.node(depth);
    if (index == $to.index(depth) && depth < $from.depth - slice.openStart) {
        let inner = replaceOuter($from, $to, slice, depth + 1);
        return node.copy(node.content.replaceChild(index, inner));
    }
    else if (!slice.content.size) {
        return close(node, replaceTwoWay($from, $to, depth));
    }
    else if (!slice.openStart && !slice.openEnd && $from.depth == depth && $to.depth == depth) { // Simple, flat case
        let parent = $from.parent, content = parent.content;
        return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)));
    }
    else {
        let { start, end } = prepareSliceForReplace(slice, $from);
        return close(node, replaceThreeWay($from, start, end, $to, depth));
    }
}
function checkJoin(main, sub) {
    if (!sub.type.compatibleContent(main.type))
        throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name);
}
function joinable$1($before, $after, depth) {
    let node = $before.node(depth);
    checkJoin(node, $after.node(depth));
    return node;
}
function addNode(child, target) {
    let last = target.length - 1;
    if (last >= 0 && child.isText && child.sameMarkup(target[last]))
        target[last] = child.withText(target[last].text + child.text);
    else
        target.push(child);
}
function addRange($start, $end, depth, target) {
    let node = ($end || $start).node(depth);
    let startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount;
    if ($start) {
        startIndex = $start.index(depth);
        if ($start.depth > depth) {
            startIndex++;
        }
        else if ($start.textOffset) {
            addNode($start.nodeAfter, target);
            startIndex++;
        }
    }
    for (let i = startIndex; i < endIndex; i++)
        addNode(node.child(i), target);
    if ($end && $end.depth == depth && $end.textOffset)
        addNode($end.nodeBefore, target);
}
function close(node, content) {
    node.type.checkContent(content);
    return node.copy(content);
}
function replaceThreeWay($from, $start, $end, $to, depth) {
    let openStart = $from.depth > depth && joinable$1($from, $start, depth + 1);
    let openEnd = $to.depth > depth && joinable$1($end, $to, depth + 1);
    let content = [];
    addRange(null, $from, depth, content);
    if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
        checkJoin(openStart, openEnd);
        addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content);
    }
    else {
        if (openStart)
            addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content);
        addRange($start, $end, depth, content);
        if (openEnd)
            addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content);
    }
    addRange($to, null, depth, content);
    return new Fragment(content);
}
function replaceTwoWay($from, $to, depth) {
    let content = [];
    addRange(null, $from, depth, content);
    if ($from.depth > depth) {
        let type = joinable$1($from, $to, depth + 1);
        addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content);
    }
    addRange($to, null, depth, content);
    return new Fragment(content);
}
function prepareSliceForReplace(slice, $along) {
    let extra = $along.depth - slice.openStart, parent = $along.node(extra);
    let node = parent.copy(slice.content);
    for (let i = extra - 1; i >= 0; i--)
        node = $along.node(i).copy(Fragment.from(node));
    return { start: node.resolveNoCache(slice.openStart + extra),
        end: node.resolveNoCache(node.content.size - slice.openEnd - extra) };
}

/**
You can [_resolve_](https://prosemirror.net/docs/ref/#model.Node.resolve) a position to get more
information about it. Objects of this class represent such a
resolved position, providing various pieces of context
information, and some helper methods.

Throughout this interface, methods that take an optional `depth`
parameter will interpret undefined as `this.depth` and negative
numbers as `this.depth + value`.
*/
class ResolvedPos {
    /**
    @internal
    */
    constructor(
    /**
    The position that was resolved.
    */
    pos, 
    /**
    @internal
    */
    path, 
    /**
    The offset this position has into its parent node.
    */
    parentOffset) {
        this.pos = pos;
        this.path = path;
        this.parentOffset = parentOffset;
        this.depth = path.length / 3 - 1;
    }
    /**
    @internal
    */
    resolveDepth(val) {
        if (val == null)
            return this.depth;
        if (val < 0)
            return this.depth + val;
        return val;
    }
    /**
    The parent node that the position points into. Note that even if
    a position points into a text node, that node is not considered
    the parent—text nodes are ‘flat’ in this model, and have no content.
    */
    get parent() { return this.node(this.depth); }
    /**
    The root node in which the position was resolved.
    */
    get doc() { return this.node(0); }
    /**
    The ancestor node at the given level. `p.node(p.depth)` is the
    same as `p.parent`.
    */
    node(depth) { return this.path[this.resolveDepth(depth) * 3]; }
    /**
    The index into the ancestor at the given level. If this points
    at the 3rd node in the 2nd paragraph on the top level, for
    example, `p.index(0)` is 1 and `p.index(1)` is 2.
    */
    index(depth) { return this.path[this.resolveDepth(depth) * 3 + 1]; }
    /**
    The index pointing after this position into the ancestor at the
    given level.
    */
    indexAfter(depth) {
        depth = this.resolveDepth(depth);
        return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1);
    }
    /**
    The (absolute) position at the start of the node at the given
    level.
    */
    start(depth) {
        depth = this.resolveDepth(depth);
        return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
    }
    /**
    The (absolute) position at the end of the node at the given
    level.
    */
    end(depth) {
        depth = this.resolveDepth(depth);
        return this.start(depth) + this.node(depth).content.size;
    }
    /**
    The (absolute) position directly before the wrapping node at the
    given level, or, when `depth` is `this.depth + 1`, the original
    position.
    */
    before(depth) {
        depth = this.resolveDepth(depth);
        if (!depth)
            throw new RangeError("There is no position before the top-level node");
        return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1];
    }
    /**
    The (absolute) position directly after the wrapping node at the
    given level, or the original position when `depth` is `this.depth + 1`.
    */
    after(depth) {
        depth = this.resolveDepth(depth);
        if (!depth)
            throw new RangeError("There is no position after the top-level node");
        return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize;
    }
    /**
    When this position points into a text node, this returns the
    distance between the position and the start of the text node.
    Will be zero for positions that point between nodes.
    */
    get textOffset() { return this.pos - this.path[this.path.length - 1]; }
    /**
    Get the node directly after the position, if any. If the position
    points into a text node, only the part of that node after the
    position is returned.
    */
    get nodeAfter() {
        let parent = this.parent, index = this.index(this.depth);
        if (index == parent.childCount)
            return null;
        let dOff = this.pos - this.path[this.path.length - 1], child = parent.child(index);
        return dOff ? parent.child(index).cut(dOff) : child;
    }
    /**
    Get the node directly before the position, if any. If the
    position points into a text node, only the part of that node
    before the position is returned.
    */
    get nodeBefore() {
        let index = this.index(this.depth);
        let dOff = this.pos - this.path[this.path.length - 1];
        if (dOff)
            return this.parent.child(index).cut(0, dOff);
        return index == 0 ? null : this.parent.child(index - 1);
    }
    /**
    Get the position at the given index in the parent node at the
    given depth (which defaults to `this.depth`).
    */
    posAtIndex(index, depth) {
        depth = this.resolveDepth(depth);
        let node = this.path[depth * 3], pos = depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
        for (let i = 0; i < index; i++)
            pos += node.child(i).nodeSize;
        return pos;
    }
    /**
    Get the marks at this position, factoring in the surrounding
    marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
    position is at the start of a non-empty node, the marks of the
    node after it (if any) are returned.
    */
    marks() {
        let parent = this.parent, index = this.index();
        // In an empty parent, return the empty array
        if (parent.content.size == 0)
            return Mark$1.none;
        // When inside a text node, just return the text node's marks
        if (this.textOffset)
            return parent.child(index).marks;
        let main = parent.maybeChild(index - 1), other = parent.maybeChild(index);
        // If the `after` flag is true of there is no node before, make
        // the node after this position the main reference.
        if (!main) {
            let tmp = main;
            main = other;
            other = tmp;
        }
        // Use all marks in the main node, except those that have
        // `inclusive` set to false and are not present in the other node.
        let marks = main.marks;
        for (var i = 0; i < marks.length; i++)
            if (marks[i].type.spec.inclusive === false && (!other || !marks[i].isInSet(other.marks)))
                marks = marks[i--].removeFromSet(marks);
        return marks;
    }
    /**
    Get the marks after the current position, if any, except those
    that are non-inclusive and not present at position `$end`. This
    is mostly useful for getting the set of marks to preserve after a
    deletion. Will return `null` if this position is at the end of
    its parent node or its parent node isn't a textblock (in which
    case no marks should be preserved).
    */
    marksAcross($end) {
        let after = this.parent.maybeChild(this.index());
        if (!after || !after.isInline)
            return null;
        let marks = after.marks, next = $end.parent.maybeChild($end.index());
        for (var i = 0; i < marks.length; i++)
            if (marks[i].type.spec.inclusive === false && (!next || !marks[i].isInSet(next.marks)))
                marks = marks[i--].removeFromSet(marks);
        return marks;
    }
    /**
    The depth up to which this position and the given (non-resolved)
    position share the same parent nodes.
    */
    sharedDepth(pos) {
        for (let depth = this.depth; depth > 0; depth--)
            if (this.start(depth) <= pos && this.end(depth) >= pos)
                return depth;
        return 0;
    }
    /**
    Returns a range based on the place where this position and the
    given position diverge around block content. If both point into
    the same textblock, for example, a range around that textblock
    will be returned. If they point into different blocks, the range
    around those blocks in their shared ancestor is returned. You can
    pass in an optional predicate that will be called with a parent
    node to see if a range into that parent is acceptable.
    */
    blockRange(other = this, pred) {
        if (other.pos < this.pos)
            return other.blockRange(this);
        for (let d = this.depth - (this.parent.inlineContent || this.pos == other.pos ? 1 : 0); d >= 0; d--)
            if (other.pos <= this.end(d) && (!pred || pred(this.node(d))))
                return new NodeRange(this, other, d);
        return null;
    }
    /**
    Query whether the given position shares the same parent node.
    */
    sameParent(other) {
        return this.pos - this.parentOffset == other.pos - other.parentOffset;
    }
    /**
    Return the greater of this and the given position.
    */
    max(other) {
        return other.pos > this.pos ? other : this;
    }
    /**
    Return the smaller of this and the given position.
    */
    min(other) {
        return other.pos < this.pos ? other : this;
    }
    /**
    @internal
    */
    toString() {
        let str = "";
        for (let i = 1; i <= this.depth; i++)
            str += (str ? "/" : "") + this.node(i).type.name + "_" + this.index(i - 1);
        return str + ":" + this.parentOffset;
    }
    /**
    @internal
    */
    static resolve(doc, pos) {
        if (!(pos >= 0 && pos <= doc.content.size))
            throw new RangeError("Position " + pos + " out of range");
        let path = [];
        let start = 0, parentOffset = pos;
        for (let node = doc;;) {
            let { index, offset } = node.content.findIndex(parentOffset);
            let rem = parentOffset - offset;
            path.push(node, index, start + offset);
            if (!rem)
                break;
            node = node.child(index);
            if (node.isText)
                break;
            parentOffset = rem - 1;
            start += offset + 1;
        }
        return new ResolvedPos(pos, path, parentOffset);
    }
    /**
    @internal
    */
    static resolveCached(doc, pos) {
        for (let i = 0; i < resolveCache.length; i++) {
            let cached = resolveCache[i];
            if (cached.pos == pos && cached.doc == doc)
                return cached;
        }
        let result = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc, pos);
        resolveCachePos = (resolveCachePos + 1) % resolveCacheSize;
        return result;
    }
}
let resolveCache = [], resolveCachePos = 0, resolveCacheSize = 12;
/**
Represents a flat range of content, i.e. one that starts and
ends in the same node.
*/
class NodeRange {
    /**
    Construct a node range. `$from` and `$to` should point into the
    same node until at least the given `depth`, since a node range
    denotes an adjacent set of nodes in a single parent node.
    */
    constructor(
    /**
    A resolved position along the start of the content. May have a
    `depth` greater than this object's `depth` property, since
    these are the positions that were used to compute the range,
    not re-resolved positions directly at its boundaries.
    */
    $from, 
    /**
    A position along the end of the content. See
    caveat for [`$from`](https://prosemirror.net/docs/ref/#model.NodeRange.$from).
    */
    $to, 
    /**
    The depth of the node that this range points into.
    */
    depth) {
        this.$from = $from;
        this.$to = $to;
        this.depth = depth;
    }
    /**
    The position at the start of the range.
    */
    get start() { return this.$from.before(this.depth + 1); }
    /**
    The position at the end of the range.
    */
    get end() { return this.$to.after(this.depth + 1); }
    /**
    The parent node that the range points into.
    */
    get parent() { return this.$from.node(this.depth); }
    /**
    The start index of the range in the parent node.
    */
    get startIndex() { return this.$from.index(this.depth); }
    /**
    The end index of the range in the parent node.
    */
    get endIndex() { return this.$to.indexAfter(this.depth); }
}

const emptyAttrs = Object.create(null);
/**
This class represents a node in the tree that makes up a
ProseMirror document. So a document is an instance of `Node`, with
children that are also instances of `Node`.

Nodes are persistent data structures. Instead of changing them, you
create new ones with the content you want. Old ones keep pointing
at the old document shape. This is made cheaper by sharing
structure between the old and new data as much as possible, which a
tree shape like this (without back pointers) makes easy.

**Do not** directly mutate the properties of a `Node` object. See
[the guide](/docs/guide/#doc) for more information.
*/
let Node$1 = class Node {
    /**
    @internal
    */
    constructor(
    /**
    The type of node that this is.
    */
    type, 
    /**
    An object mapping attribute names to values. The kind of
    attributes allowed and required are
    [determined](https://prosemirror.net/docs/ref/#model.NodeSpec.attrs) by the node type.
    */
    attrs, 
    // A fragment holding the node's children.
    content, 
    /**
    The marks (things like whether it is emphasized or part of a
    link) applied to this node.
    */
    marks = Mark$1.none) {
        this.type = type;
        this.attrs = attrs;
        this.marks = marks;
        this.content = content || Fragment.empty;
    }
    /**
    The size of this node, as defined by the integer-based [indexing
    scheme](/docs/guide/#doc.indexing). For text nodes, this is the
    amount of characters. For other leaf nodes, it is one. For
    non-leaf nodes, it is the size of the content plus two (the
    start and end token).
    */
    get nodeSize() { return this.isLeaf ? 1 : 2 + this.content.size; }
    /**
    The number of children that the node has.
    */
    get childCount() { return this.content.childCount; }
    /**
    Get the child node at the given index. Raises an error when the
    index is out of range.
    */
    child(index) { return this.content.child(index); }
    /**
    Get the child node at the given index, if it exists.
    */
    maybeChild(index) { return this.content.maybeChild(index); }
    /**
    Call `f` for every child node, passing the node, its offset
    into this parent node, and its index.
    */
    forEach(f) { this.content.forEach(f); }
    /**
    Invoke a callback for all descendant nodes recursively between
    the given two positions that are relative to start of this
    node's content. The callback is invoked with the node, its
    parent-relative position, its parent node, and its child index.
    When the callback returns false for a given node, that node's
    children will not be recursed over. The last parameter can be
    used to specify a starting position to count from.
    */
    nodesBetween(from, to, f, startPos = 0) {
        this.content.nodesBetween(from, to, f, startPos, this);
    }
    /**
    Call the given callback for every descendant node. Doesn't
    descend into a node when the callback returns `false`.
    */
    descendants(f) {
        this.nodesBetween(0, this.content.size, f);
    }
    /**
    Concatenates all the text nodes found in this fragment and its
    children.
    */
    get textContent() {
        return (this.isLeaf && this.type.spec.leafText)
            ? this.type.spec.leafText(this)
            : this.textBetween(0, this.content.size, "");
    }
    /**
    Get all text between positions `from` and `to`. When
    `blockSeparator` is given, it will be inserted to separate text
    from different block nodes. If `leafText` is given, it'll be
    inserted for every non-text leaf node encountered, otherwise
    [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec^leafText) will be used.
    */
    textBetween(from, to, blockSeparator, leafText) {
        return this.content.textBetween(from, to, blockSeparator, leafText);
    }
    /**
    Returns this node's first child, or `null` if there are no
    children.
    */
    get firstChild() { return this.content.firstChild; }
    /**
    Returns this node's last child, or `null` if there are no
    children.
    */
    get lastChild() { return this.content.lastChild; }
    /**
    Test whether two nodes represent the same piece of document.
    */
    eq(other) {
        return this == other || (this.sameMarkup(other) && this.content.eq(other.content));
    }
    /**
    Compare the markup (type, attributes, and marks) of this node to
    those of another. Returns `true` if both have the same markup.
    */
    sameMarkup(other) {
        return this.hasMarkup(other.type, other.attrs, other.marks);
    }
    /**
    Check whether this node's markup correspond to the given type,
    attributes, and marks.
    */
    hasMarkup(type, attrs, marks) {
        return this.type == type &&
            compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) &&
            Mark$1.sameSet(this.marks, marks || Mark$1.none);
    }
    /**
    Create a new node with the same markup as this node, containing
    the given content (or empty, if no content is given).
    */
    copy(content = null) {
        if (content == this.content)
            return this;
        return new Node(this.type, this.attrs, content, this.marks);
    }
    /**
    Create a copy of this node, with the given set of marks instead
    of the node's own marks.
    */
    mark(marks) {
        return marks == this.marks ? this : new Node(this.type, this.attrs, this.content, marks);
    }
    /**
    Create a copy of this node with only the content between the
    given positions. If `to` is not given, it defaults to the end of
    the node.
    */
    cut(from, to = this.content.size) {
        if (from == 0 && to == this.content.size)
            return this;
        return this.copy(this.content.cut(from, to));
    }
    /**
    Cut out the part of the document between the given positions, and
    return it as a `Slice` object.
    */
    slice(from, to = this.content.size, includeParents = false) {
        if (from == to)
            return Slice.empty;
        let $from = this.resolve(from), $to = this.resolve(to);
        let depth = includeParents ? 0 : $from.sharedDepth(to);
        let start = $from.start(depth), node = $from.node(depth);
        let content = node.content.cut($from.pos - start, $to.pos - start);
        return new Slice(content, $from.depth - depth, $to.depth - depth);
    }
    /**
    Replace the part of the document between the given positions with
    the given slice. The slice must 'fit', meaning its open sides
    must be able to connect to the surrounding content, and its
    content nodes must be valid children for the node they are placed
    into. If any of this is violated, an error of type
    [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
    */
    replace(from, to, slice) {
        return replace(this.resolve(from), this.resolve(to), slice);
    }
    /**
    Find the node directly after the given position.
    */
    nodeAt(pos) {
        for (let node = this;;) {
            let { index, offset } = node.content.findIndex(pos);
            node = node.maybeChild(index);
            if (!node)
                return null;
            if (offset == pos || node.isText)
                return node;
            pos -= offset + 1;
        }
    }
    /**
    Find the (direct) child node after the given offset, if any,
    and return it along with its index and offset relative to this
    node.
    */
    childAfter(pos) {
        let { index, offset } = this.content.findIndex(pos);
        return { node: this.content.maybeChild(index), index, offset };
    }
    /**
    Find the (direct) child node before the given offset, if any,
    and return it along with its index and offset relative to this
    node.
    */
    childBefore(pos) {
        if (pos == 0)
            return { node: null, index: 0, offset: 0 };
        let { index, offset } = this.content.findIndex(pos);
        if (offset < pos)
            return { node: this.content.child(index), index, offset };
        let node = this.content.child(index - 1);
        return { node, index: index - 1, offset: offset - node.nodeSize };
    }
    /**
    Resolve the given position in the document, returning an
    [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
    */
    resolve(pos) { return ResolvedPos.resolveCached(this, pos); }
    /**
    @internal
    */
    resolveNoCache(pos) { return ResolvedPos.resolve(this, pos); }
    /**
    Test whether a given mark or mark type occurs in this document
    between the two given positions.
    */
    rangeHasMark(from, to, type) {
        let found = false;
        if (to > from)
            this.nodesBetween(from, to, node => {
                if (type.isInSet(node.marks))
                    found = true;
                return !found;
            });
        return found;
    }
    /**
    True when this is a block (non-inline node)
    */
    get isBlock() { return this.type.isBlock; }
    /**
    True when this is a textblock node, a block node with inline
    content.
    */
    get isTextblock() { return this.type.isTextblock; }
    /**
    True when this node allows inline content.
    */
    get inlineContent() { return this.type.inlineContent; }
    /**
    True when this is an inline node (a text node or a node that can
    appear among text).
    */
    get isInline() { return this.type.isInline; }
    /**
    True when this is a text node.
    */
    get isText() { return this.type.isText; }
    /**
    True when this is a leaf node.
    */
    get isLeaf() { return this.type.isLeaf; }
    /**
    True when this is an atom, i.e. when it does not have directly
    editable content. This is usually the same as `isLeaf`, but can
    be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
    on a node's spec (typically used when the node is displayed as
    an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
    */
    get isAtom() { return this.type.isAtom; }
    /**
    Return a string representation of this node for debugging
    purposes.
    */
    toString() {
        if (this.type.spec.toDebugString)
            return this.type.spec.toDebugString(this);
        let name = this.type.name;
        if (this.content.size)
            name += "(" + this.content.toStringInner() + ")";
        return wrapMarks(this.marks, name);
    }
    /**
    Get the content match in this node at the given index.
    */
    contentMatchAt(index) {
        let match = this.type.contentMatch.matchFragment(this.content, 0, index);
        if (!match)
            throw new Error("Called contentMatchAt on a node with invalid content");
        return match;
    }
    /**
    Test whether replacing the range between `from` and `to` (by
    child index) with the given replacement fragment (which defaults
    to the empty fragment) would leave the node's content valid. You
    can optionally pass `start` and `end` indices into the
    replacement fragment.
    */
    canReplace(from, to, replacement = Fragment.empty, start = 0, end = replacement.childCount) {
        let one = this.contentMatchAt(from).matchFragment(replacement, start, end);
        let two = one && one.matchFragment(this.content, to);
        if (!two || !two.validEnd)
            return false;
        for (let i = start; i < end; i++)
            if (!this.type.allowsMarks(replacement.child(i).marks))
                return false;
        return true;
    }
    /**
    Test whether replacing the range `from` to `to` (by index) with
    a node of the given type would leave the node's content valid.
    */
    canReplaceWith(from, to, type, marks) {
        if (marks && !this.type.allowsMarks(marks))
            return false;
        let start = this.contentMatchAt(from).matchType(type);
        let end = start && start.matchFragment(this.content, to);
        return end ? end.validEnd : false;
    }
    /**
    Test whether the given node's content could be appended to this
    node. If that node is empty, this will only return true if there
    is at least one node type that can appear in both nodes (to avoid
    merging completely incompatible nodes).
    */
    canAppend(other) {
        if (other.content.size)
            return this.canReplace(this.childCount, this.childCount, other.content);
        else
            return this.type.compatibleContent(other.type);
    }
    /**
    Check whether this node and its descendants conform to the
    schema, and raise error when they do not.
    */
    check() {
        this.type.checkContent(this.content);
        let copy = Mark$1.none;
        for (let i = 0; i < this.marks.length; i++)
            copy = this.marks[i].addToSet(copy);
        if (!Mark$1.sameSet(copy, this.marks))
            throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map(m => m.type.name)}`);
        this.content.forEach(node => node.check());
    }
    /**
    Return a JSON-serializeable representation of this node.
    */
    toJSON() {
        let obj = { type: this.type.name };
        for (let _ in this.attrs) {
            obj.attrs = this.attrs;
            break;
        }
        if (this.content.size)
            obj.content = this.content.toJSON();
        if (this.marks.length)
            obj.marks = this.marks.map(n => n.toJSON());
        return obj;
    }
    /**
    Deserialize a node from its JSON representation.
    */
    static fromJSON(schema, json) {
        if (!json)
            throw new RangeError("Invalid input for Node.fromJSON");
        let marks = null;
        if (json.marks) {
            if (!Array.isArray(json.marks))
                throw new RangeError("Invalid mark data for Node.fromJSON");
            marks = json.marks.map(schema.markFromJSON);
        }
        if (json.type == "text") {
            if (typeof json.text != "string")
                throw new RangeError("Invalid text node in JSON");
            return schema.text(json.text, marks);
        }
        let content = Fragment.fromJSON(schema, json.content);
        return schema.nodeType(json.type).create(json.attrs, content, marks);
    }
};
Node$1.prototype.text = undefined;
class TextNode extends Node$1 {
    /**
    @internal
    */
    constructor(type, attrs, content, marks) {
        super(type, attrs, null, marks);
        if (!content)
            throw new RangeError("Empty text nodes are not allowed");
        this.text = content;
    }
    toString() {
        if (this.type.spec.toDebugString)
            return this.type.spec.toDebugString(this);
        return wrapMarks(this.marks, JSON.stringify(this.text));
    }
    get textContent() { return this.text; }
    textBetween(from, to) { return this.text.slice(from, to); }
    get nodeSize() { return this.text.length; }
    mark(marks) {
        return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks);
    }
    withText(text) {
        if (text == this.text)
            return this;
        return new TextNode(this.type, this.attrs, text, this.marks);
    }
    cut(from = 0, to = this.text.length) {
        if (from == 0 && to == this.text.length)
            return this;
        return this.withText(this.text.slice(from, to));
    }
    eq(other) {
        return this.sameMarkup(other) && this.text == other.text;
    }
    toJSON() {
        let base = super.toJSON();
        base.text = this.text;
        return base;
    }
}
function wrapMarks(marks, str) {
    for (let i = marks.length - 1; i >= 0; i--)
        str = marks[i].type.name + "(" + str + ")";
    return str;
}

/**
Instances of this class represent a match state of a node type's
[content expression](https://prosemirror.net/docs/ref/#model.NodeSpec.content), and can be used to
find out whether further content matches here, and whether a given
position is a valid end of the node.
*/
class ContentMatch {
    /**
    @internal
    */
    constructor(
    /**
    True when this match state represents a valid end of the node.
    */
    validEnd) {
        this.validEnd = validEnd;
        /**
        @internal
        */
        this.next = [];
        /**
        @internal
        */
        this.wrapCache = [];
    }
    /**
    @internal
    */
    static parse(string, nodeTypes) {
        let stream = new TokenStream(string, nodeTypes);
        if (stream.next == null)
            return ContentMatch.empty;
        let expr = parseExpr(stream);
        if (stream.next)
            stream.err("Unexpected trailing text");
        let match = dfa(nfa(expr));
        checkForDeadEnds(match, stream);
        return match;
    }
    /**
    Match a node type, returning a match after that node if
    successful.
    */
    matchType(type) {
        for (let i = 0; i < this.next.length; i++)
            if (this.next[i].type == type)
                return this.next[i].next;
        return null;
    }
    /**
    Try to match a fragment. Returns the resulting match when
    successful.
    */
    matchFragment(frag, start = 0, end = frag.childCount) {
        let cur = this;
        for (let i = start; cur && i < end; i++)
            cur = cur.matchType(frag.child(i).type);
        return cur;
    }
    /**
    @internal
    */
    get inlineContent() {
        return this.next.length != 0 && this.next[0].type.isInline;
    }
    /**
    Get the first matching node type at this match position that can
    be generated.
    */
    get defaultType() {
        for (let i = 0; i < this.next.length; i++) {
            let { type } = this.next[i];
            if (!(type.isText || type.hasRequiredAttrs()))
                return type;
        }
        return null;
    }
    /**
    @internal
    */
    compatible(other) {
        for (let i = 0; i < this.next.length; i++)
            for (let j = 0; j < other.next.length; j++)
                if (this.next[i].type == other.next[j].type)
                    return true;
        return false;
    }
    /**
    Try to match the given fragment, and if that fails, see if it can
    be made to match by inserting nodes in front of it. When
    successful, return a fragment of inserted nodes (which may be
    empty if nothing had to be inserted). When `toEnd` is true, only
    return a fragment if the resulting match goes to the end of the
    content expression.
    */
    fillBefore(after, toEnd = false, startIndex = 0) {
        let seen = [this];
        function search(match, types) {
            let finished = match.matchFragment(after, startIndex);
            if (finished && (!toEnd || finished.validEnd))
                return Fragment.from(types.map(tp => tp.createAndFill()));
            for (let i = 0; i < match.next.length; i++) {
                let { type, next } = match.next[i];
                if (!(type.isText || type.hasRequiredAttrs()) && seen.indexOf(next) == -1) {
                    seen.push(next);
                    let found = search(next, types.concat(type));
                    if (found)
                        return found;
                }
            }
            return null;
        }
        return search(this, []);
    }
    /**
    Find a set of wrapping node types that would allow a node of the
    given type to appear at this position. The result may be empty
    (when it fits directly) and will be null when no such wrapping
    exists.
    */
    findWrapping(target) {
        for (let i = 0; i < this.wrapCache.length; i += 2)
            if (this.wrapCache[i] == target)
                return this.wrapCache[i + 1];
        let computed = this.computeWrapping(target);
        this.wrapCache.push(target, computed);
        return computed;
    }
    /**
    @internal
    */
    computeWrapping(target) {
        let seen = Object.create(null), active = [{ match: this, type: null, via: null }];
        while (active.length) {
            let current = active.shift(), match = current.match;
            if (match.matchType(target)) {
                let result = [];
                for (let obj = current; obj.type; obj = obj.via)
                    result.push(obj.type);
                return result.reverse();
            }
            for (let i = 0; i < match.next.length; i++) {
                let { type, next } = match.next[i];
                if (!type.isLeaf && !type.hasRequiredAttrs() && !(type.name in seen) && (!current.type || next.validEnd)) {
                    active.push({ match: type.contentMatch, type, via: current });
                    seen[type.name] = true;
                }
            }
        }
        return null;
    }
    /**
    The number of outgoing edges this node has in the finite
    automaton that describes the content expression.
    */
    get edgeCount() {
        return this.next.length;
    }
    /**
    Get the _n_​th outgoing edge from this node in the finite
    automaton that describes the content expression.
    */
    edge(n) {
        if (n >= this.next.length)
            throw new RangeError(`There's no ${n}th edge in this content match`);
        return this.next[n];
    }
    /**
    @internal
    */
    toString() {
        let seen = [];
        function scan(m) {
            seen.push(m);
            for (let i = 0; i < m.next.length; i++)
                if (seen.indexOf(m.next[i].next) == -1)
                    scan(m.next[i].next);
        }
        scan(this);
        return seen.map((m, i) => {
            let out = i + (m.validEnd ? "*" : " ") + " ";
            for (let i = 0; i < m.next.length; i++)
                out += (i ? ", " : "") + m.next[i].type.name + "->" + seen.indexOf(m.next[i].next);
            return out;
        }).join("\n");
    }
}
/**
@internal
*/
ContentMatch.empty = new ContentMatch(true);
class TokenStream {
    constructor(string, nodeTypes) {
        this.string = string;
        this.nodeTypes = nodeTypes;
        this.inline = null;
        this.pos = 0;
        this.tokens = string.split(/\s*(?=\b|\W|$)/);
        if (this.tokens[this.tokens.length - 1] == "")
            this.tokens.pop();
        if (this.tokens[0] == "")
            this.tokens.shift();
    }
    get next() { return this.tokens[this.pos]; }
    eat(tok) { return this.next == tok && (this.pos++ || true); }
    err(str) { throw new SyntaxError(str + " (in content expression '" + this.string + "')"); }
}
function parseExpr(stream) {
    let exprs = [];
    do {
        exprs.push(parseExprSeq(stream));
    } while (stream.eat("|"));
    return exprs.length == 1 ? exprs[0] : { type: "choice", exprs };
}
function parseExprSeq(stream) {
    let exprs = [];
    do {
        exprs.push(parseExprSubscript(stream));
    } while (stream.next && stream.next != ")" && stream.next != "|");
    return exprs.length == 1 ? exprs[0] : { type: "seq", exprs };
}
function parseExprSubscript(stream) {
    let expr = parseExprAtom(stream);
    for (;;) {
        if (stream.eat("+"))
            expr = { type: "plus", expr };
        else if (stream.eat("*"))
            expr = { type: "star", expr };
        else if (stream.eat("?"))
            expr = { type: "opt", expr };
        else if (stream.eat("{"))
            expr = parseExprRange(stream, expr);
        else
            break;
    }
    return expr;
}
function parseNum(stream) {
    if (/\D/.test(stream.next))
        stream.err("Expected number, got '" + stream.next + "'");
    let result = Number(stream.next);
    stream.pos++;
    return result;
}
function parseExprRange(stream, expr) {
    let min = parseNum(stream), max = min;
    if (stream.eat(",")) {
        if (stream.next != "}")
            max = parseNum(stream);
        else
            max = -1;
    }
    if (!stream.eat("}"))
        stream.err("Unclosed braced range");
    return { type: "range", min, max, expr };
}
function resolveName(stream, name) {
    let types = stream.nodeTypes, type = types[name];
    if (type)
        return [type];
    let result = [];
    for (let typeName in types) {
        let type = types[typeName];
        if (type.groups.indexOf(name) > -1)
            result.push(type);
    }
    if (result.length == 0)
        stream.err("No node type or group '" + name + "' found");
    return result;
}
function parseExprAtom(stream) {
    if (stream.eat("(")) {
        let expr = parseExpr(stream);
        if (!stream.eat(")"))
            stream.err("Missing closing paren");
        return expr;
    }
    else if (!/\W/.test(stream.next)) {
        let exprs = resolveName(stream, stream.next).map(type => {
            if (stream.inline == null)
                stream.inline = type.isInline;
            else if (stream.inline != type.isInline)
                stream.err("Mixing inline and block content");
            return { type: "name", value: type };
        });
        stream.pos++;
        return exprs.length == 1 ? exprs[0] : { type: "choice", exprs };
    }
    else {
        stream.err("Unexpected token '" + stream.next + "'");
    }
}
/**
Construct an NFA from an expression as returned by the parser. The
NFA is represented as an array of states, which are themselves
arrays of edges, which are `{term, to}` objects. The first state is
the entry state and the last node is the success state.

Note that unlike typical NFAs, the edge ordering in this one is
significant, in that it is used to contruct filler content when
necessary.
*/
function nfa(expr) {
    let nfa = [[]];
    connect(compile(expr, 0), node());
    return nfa;
    function node() { return nfa.push([]) - 1; }
    function edge(from, to, term) {
        let edge = { term, to };
        nfa[from].push(edge);
        return edge;
    }
    function connect(edges, to) {
        edges.forEach(edge => edge.to = to);
    }
    function compile(expr, from) {
        if (expr.type == "choice") {
            return expr.exprs.reduce((out, expr) => out.concat(compile(expr, from)), []);
        }
        else if (expr.type == "seq") {
            for (let i = 0;; i++) {
                let next = compile(expr.exprs[i], from);
                if (i == expr.exprs.length - 1)
                    return next;
                connect(next, from = node());
            }
        }
        else if (expr.type == "star") {
            let loop = node();
            edge(from, loop);
            connect(compile(expr.expr, loop), loop);
            return [edge(loop)];
        }
        else if (expr.type == "plus") {
            let loop = node();
            connect(compile(expr.expr, from), loop);
            connect(compile(expr.expr, loop), loop);
            return [edge(loop)];
        }
        else if (expr.type == "opt") {
            return [edge(from)].concat(compile(expr.expr, from));
        }
        else if (expr.type == "range") {
            let cur = from;
            for (let i = 0; i < expr.min; i++) {
                let next = node();
                connect(compile(expr.expr, cur), next);
                cur = next;
            }
            if (expr.max == -1) {
                connect(compile(expr.expr, cur), cur);
            }
            else {
                for (let i = expr.min; i < expr.max; i++) {
                    let next = node();
                    edge(cur, next);
                    connect(compile(expr.expr, cur), next);
                    cur = next;
                }
            }
            return [edge(cur)];
        }
        else if (expr.type == "name") {
            return [edge(from, undefined, expr.value)];
        }
        else {
            throw new Error("Unknown expr type");
        }
    }
}
function cmp(a, b) { return b - a; }
// Get the set of nodes reachable by null edges from `node`. Omit
// nodes with only a single null-out-edge, since they may lead to
// needless duplicated nodes.
function nullFrom(nfa, node) {
    let result = [];
    scan(node);
    return result.sort(cmp);
    function scan(node) {
        let edges = nfa[node];
        if (edges.length == 1 && !edges[0].term)
            return scan(edges[0].to);
        result.push(node);
        for (let i = 0; i < edges.length; i++) {
            let { term, to } = edges[i];
            if (!term && result.indexOf(to) == -1)
                scan(to);
        }
    }
}
// Compiles an NFA as produced by `nfa` into a DFA, modeled as a set
// of state objects (`ContentMatch` instances) with transitions
// between them.
function dfa(nfa) {
    let labeled = Object.create(null);
    return explore(nullFrom(nfa, 0));
    function explore(states) {
        let out = [];
        states.forEach(node => {
            nfa[node].forEach(({ term, to }) => {
                if (!term)
                    return;
                let set;
                for (let i = 0; i < out.length; i++)
                    if (out[i][0] == term)
                        set = out[i][1];
                nullFrom(nfa, to).forEach(node => {
                    if (!set)
                        out.push([term, set = []]);
                    if (set.indexOf(node) == -1)
                        set.push(node);
                });
            });
        });
        let state = labeled[states.join(",")] = new ContentMatch(states.indexOf(nfa.length - 1) > -1);
        for (let i = 0; i < out.length; i++) {
            let states = out[i][1].sort(cmp);
            state.next.push({ type: out[i][0], next: labeled[states.join(",")] || explore(states) });
        }
        return state;
    }
}
function checkForDeadEnds(match, stream) {
    for (let i = 0, work = [match]; i < work.length; i++) {
        let state = work[i], dead = !state.validEnd, nodes = [];
        for (let j = 0; j < state.next.length; j++) {
            let { type, next } = state.next[j];
            nodes.push(type.name);
            if (dead && !(type.isText || type.hasRequiredAttrs()))
                dead = false;
            if (work.indexOf(next) == -1)
                work.push(next);
        }
        if (dead)
            stream.err("Only non-generatable nodes (" + nodes.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
    }
}

// For node types where all attrs have a default value (or which don't
// have any attributes), build up a single reusable default attribute
// object, and use it for all nodes that don't specify specific
// attributes.
function defaultAttrs(attrs) {
    let defaults = Object.create(null);
    for (let attrName in attrs) {
        let attr = attrs[attrName];
        if (!attr.hasDefault)
            return null;
        defaults[attrName] = attr.default;
    }
    return defaults;
}
function computeAttrs(attrs, value) {
    let built = Object.create(null);
    for (let name in attrs) {
        let given = value && value[name];
        if (given === undefined) {
            let attr = attrs[name];
            if (attr.hasDefault)
                given = attr.default;
            else
                throw new RangeError("No value supplied for attribute " + name);
        }
        built[name] = given;
    }
    return built;
}
function initAttrs(attrs) {
    let result = Object.create(null);
    if (attrs)
        for (let name in attrs)
            result[name] = new Attribute(attrs[name]);
    return result;
}
/**
Node types are objects allocated once per `Schema` and used to
[tag](https://prosemirror.net/docs/ref/#model.Node.type) `Node` instances. They contain information
about the node type, such as its name and what kind of node it
represents.
*/
let NodeType$1 = class NodeType {
    /**
    @internal
    */
    constructor(
    /**
    The name the node type has in this schema.
    */
    name, 
    /**
    A link back to the `Schema` the node type belongs to.
    */
    schema, 
    /**
    The spec that this type is based on
    */
    spec) {
        this.name = name;
        this.schema = schema;
        this.spec = spec;
        /**
        The set of marks allowed in this node. `null` means all marks
        are allowed.
        */
        this.markSet = null;
        this.groups = spec.group ? spec.group.split(" ") : [];
        this.attrs = initAttrs(spec.attrs);
        this.defaultAttrs = defaultAttrs(this.attrs);
        this.contentMatch = null;
        this.inlineContent = null;
        this.isBlock = !(spec.inline || name == "text");
        this.isText = name == "text";
    }
    /**
    True if this is an inline type.
    */
    get isInline() { return !this.isBlock; }
    /**
    True if this is a textblock type, a block that contains inline
    content.
    */
    get isTextblock() { return this.isBlock && this.inlineContent; }
    /**
    True for node types that allow no content.
    */
    get isLeaf() { return this.contentMatch == ContentMatch.empty; }
    /**
    True when this node is an atom, i.e. when it does not have
    directly editable content.
    */
    get isAtom() { return this.isLeaf || !!this.spec.atom; }
    /**
    The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
    */
    get whitespace() {
        return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
    }
    /**
    Tells you whether this node type has any required attributes.
    */
    hasRequiredAttrs() {
        for (let n in this.attrs)
            if (this.attrs[n].isRequired)
                return true;
        return false;
    }
    /**
    Indicates whether this node allows some of the same content as
    the given node type.
    */
    compatibleContent(other) {
        return this == other || this.contentMatch.compatible(other.contentMatch);
    }
    /**
    @internal
    */
    computeAttrs(attrs) {
        if (!attrs && this.defaultAttrs)
            return this.defaultAttrs;
        else
            return computeAttrs(this.attrs, attrs);
    }
    /**
    Create a `Node` of this type. The given attributes are
    checked and defaulted (you can pass `null` to use the type's
    defaults entirely, if no required attributes exist). `content`
    may be a `Fragment`, a node, an array of nodes, or
    `null`. Similarly `marks` may be `null` to default to the empty
    set of marks.
    */
    create(attrs = null, content, marks) {
        if (this.isText)
            throw new Error("NodeType.create can't construct text nodes");
        return new Node$1(this, this.computeAttrs(attrs), Fragment.from(content), Mark$1.setFrom(marks));
    }
    /**
    Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
    against the node type's content restrictions, and throw an error
    if it doesn't match.
    */
    createChecked(attrs = null, content, marks) {
        content = Fragment.from(content);
        this.checkContent(content);
        return new Node$1(this, this.computeAttrs(attrs), content, Mark$1.setFrom(marks));
    }
    /**
    Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
    necessary to add nodes to the start or end of the given fragment
    to make it fit the node. If no fitting wrapping can be found,
    return null. Note that, due to the fact that required nodes can
    always be created, this will always succeed if you pass null or
    `Fragment.empty` as content.
    */
    createAndFill(attrs = null, content, marks) {
        attrs = this.computeAttrs(attrs);
        content = Fragment.from(content);
        if (content.size) {
            let before = this.contentMatch.fillBefore(content);
            if (!before)
                return null;
            content = before.append(content);
        }
        let matched = this.contentMatch.matchFragment(content);
        let after = matched && matched.fillBefore(Fragment.empty, true);
        if (!after)
            return null;
        return new Node$1(this, attrs, content.append(after), Mark$1.setFrom(marks));
    }
    /**
    Returns true if the given fragment is valid content for this node
    type with the given attributes.
    */
    validContent(content) {
        let result = this.contentMatch.matchFragment(content);
        if (!result || !result.validEnd)
            return false;
        for (let i = 0; i < content.childCount; i++)
            if (!this.allowsMarks(content.child(i).marks))
                return false;
        return true;
    }
    /**
    Throws a RangeError if the given fragment is not valid content for this
    node type.
    @internal
    */
    checkContent(content) {
        if (!this.validContent(content))
            throw new RangeError(`Invalid content for node ${this.name}: ${content.toString().slice(0, 50)}`);
    }
    /**
    Check whether the given mark type is allowed in this node.
    */
    allowsMarkType(markType) {
        return this.markSet == null || this.markSet.indexOf(markType) > -1;
    }
    /**
    Test whether the given set of marks are allowed in this node.
    */
    allowsMarks(marks) {
        if (this.markSet == null)
            return true;
        for (let i = 0; i < marks.length; i++)
            if (!this.allowsMarkType(marks[i].type))
                return false;
        return true;
    }
    /**
    Removes the marks that are not allowed in this node from the given set.
    */
    allowedMarks(marks) {
        if (this.markSet == null)
            return marks;
        let copy;
        for (let i = 0; i < marks.length; i++) {
            if (!this.allowsMarkType(marks[i].type)) {
                if (!copy)
                    copy = marks.slice(0, i);
            }
            else if (copy) {
                copy.push(marks[i]);
            }
        }
        return !copy ? marks : copy.length ? copy : Mark$1.none;
    }
    /**
    @internal
    */
    static compile(nodes, schema) {
        let result = Object.create(null);
        nodes.forEach((name, spec) => result[name] = new NodeType(name, schema, spec));
        let topType = schema.spec.topNode || "doc";
        if (!result[topType])
            throw new RangeError("Schema is missing its top node type ('" + topType + "')");
        if (!result.text)
            throw new RangeError("Every schema needs a 'text' type");
        for (let _ in result.text.attrs)
            throw new RangeError("The text node type should not have attributes");
        return result;
    }
};
// Attribute descriptors
class Attribute {
    constructor(options) {
        this.hasDefault = Object.prototype.hasOwnProperty.call(options, "default");
        this.default = options.default;
    }
    get isRequired() {
        return !this.hasDefault;
    }
}
// Marks
/**
Like nodes, marks (which are associated with nodes to signify
things like emphasis or being part of a link) are
[tagged](https://prosemirror.net/docs/ref/#model.Mark.type) with type objects, which are
instantiated once per `Schema`.
*/
class MarkType {
    /**
    @internal
    */
    constructor(
    /**
    The name of the mark type.
    */
    name, 
    /**
    @internal
    */
    rank, 
    /**
    The schema that this mark type instance is part of.
    */
    schema, 
    /**
    The spec on which the type is based.
    */
    spec) {
        this.name = name;
        this.rank = rank;
        this.schema = schema;
        this.spec = spec;
        this.attrs = initAttrs(spec.attrs);
        this.excluded = null;
        let defaults = defaultAttrs(this.attrs);
        this.instance = defaults ? new Mark$1(this, defaults) : null;
    }
    /**
    Create a mark of this type. `attrs` may be `null` or an object
    containing only some of the mark's attributes. The others, if
    they have defaults, will be added.
    */
    create(attrs = null) {
        if (!attrs && this.instance)
            return this.instance;
        return new Mark$1(this, computeAttrs(this.attrs, attrs));
    }
    /**
    @internal
    */
    static compile(marks, schema) {
        let result = Object.create(null), rank = 0;
        marks.forEach((name, spec) => result[name] = new MarkType(name, rank++, schema, spec));
        return result;
    }
    /**
    When there is a mark of this type in the given set, a new set
    without it is returned. Otherwise, the input set is returned.
    */
    removeFromSet(set) {
        for (var i = 0; i < set.length; i++)
            if (set[i].type == this) {
                set = set.slice(0, i).concat(set.slice(i + 1));
                i--;
            }
        return set;
    }
    /**
    Tests whether there is a mark of this type in the given set.
    */
    isInSet(set) {
        for (let i = 0; i < set.length; i++)
            if (set[i].type == this)
                return set[i];
    }
    /**
    Queries whether a given mark type is
    [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
    */
    excludes(other) {
        return this.excluded.indexOf(other) > -1;
    }
}
/**
A document schema. Holds [node](https://prosemirror.net/docs/ref/#model.NodeType) and [mark
type](https://prosemirror.net/docs/ref/#model.MarkType) objects for the nodes and marks that may
occur in conforming documents, and provides functionality for
creating and deserializing such documents.

When given, the type parameters provide the names of the nodes and
marks in this schema.
*/
class Schema {
    /**
    Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
    */
    constructor(spec) {
        /**
        An object for storing whatever values modules may want to
        compute and cache per schema. (If you want to store something
        in it, try to use property names unlikely to clash.)
        */
        this.cached = Object.create(null);
        let instanceSpec = this.spec = {};
        for (let prop in spec)
            instanceSpec[prop] = spec[prop];
        instanceSpec.nodes = OrderedMap.from(spec.nodes),
            instanceSpec.marks = OrderedMap.from(spec.marks || {}),
            this.nodes = NodeType$1.compile(this.spec.nodes, this);
        this.marks = MarkType.compile(this.spec.marks, this);
        let contentExprCache = Object.create(null);
        for (let prop in this.nodes) {
            if (prop in this.marks)
                throw new RangeError(prop + " can not be both a node and a mark");
            let type = this.nodes[prop], contentExpr = type.spec.content || "", markExpr = type.spec.marks;
            type.contentMatch = contentExprCache[contentExpr] ||
                (contentExprCache[contentExpr] = ContentMatch.parse(contentExpr, this.nodes));
            type.inlineContent = type.contentMatch.inlineContent;
            type.markSet = markExpr == "_" ? null :
                markExpr ? gatherMarks(this, markExpr.split(" ")) :
                    markExpr == "" || !type.inlineContent ? [] : null;
        }
        for (let prop in this.marks) {
            let type = this.marks[prop], excl = type.spec.excludes;
            type.excluded = excl == null ? [type] : excl == "" ? [] : gatherMarks(this, excl.split(" "));
        }
        this.nodeFromJSON = this.nodeFromJSON.bind(this);
        this.markFromJSON = this.markFromJSON.bind(this);
        this.topNodeType = this.nodes[this.spec.topNode || "doc"];
        this.cached.wrappings = Object.create(null);
    }
    /**
    Create a node in this schema. The `type` may be a string or a
    `NodeType` instance. Attributes will be extended with defaults,
    `content` may be a `Fragment`, `null`, a `Node`, or an array of
    nodes.
    */
    node(type, attrs = null, content, marks) {
        if (typeof type == "string")
            type = this.nodeType(type);
        else if (!(type instanceof NodeType$1))
            throw new RangeError("Invalid node type: " + type);
        else if (type.schema != this)
            throw new RangeError("Node type from different schema used (" + type.name + ")");
        return type.createChecked(attrs, content, marks);
    }
    /**
    Create a text node in the schema. Empty text nodes are not
    allowed.
    */
    text(text, marks) {
        let type = this.nodes.text;
        return new TextNode(type, type.defaultAttrs, text, Mark$1.setFrom(marks));
    }
    /**
    Create a mark with the given type and attributes.
    */
    mark(type, attrs) {
        if (typeof type == "string")
            type = this.marks[type];
        return type.create(attrs);
    }
    /**
    Deserialize a node from its JSON representation. This method is
    bound.
    */
    nodeFromJSON(json) {
        return Node$1.fromJSON(this, json);
    }
    /**
    Deserialize a mark from its JSON representation. This method is
    bound.
    */
    markFromJSON(json) {
        return Mark$1.fromJSON(this, json);
    }
    /**
    @internal
    */
    nodeType(name) {
        let found = this.nodes[name];
        if (!found)
            throw new RangeError("Unknown node type: " + name);
        return found;
    }
}
function gatherMarks(schema, marks) {
    let found = [];
    for (let i = 0; i < marks.length; i++) {
        let name = marks[i], mark = schema.marks[name], ok = mark;
        if (mark) {
            found.push(mark);
        }
        else {
            for (let prop in schema.marks) {
                let mark = schema.marks[prop];
                if (name == "_" || (mark.spec.group && mark.spec.group.split(" ").indexOf(name) > -1))
                    found.push(ok = mark);
            }
        }
        if (!ok)
            throw new SyntaxError("Unknown mark type: '" + marks[i] + "'");
    }
    return found;
}

/**
A DOM parser represents a strategy for parsing DOM content into a
ProseMirror document conforming to a given schema. Its behavior is
defined by an array of [rules](https://prosemirror.net/docs/ref/#model.ParseRule).
*/
class DOMParser {
    /**
    Create a parser that targets the given schema, using the given
    parsing rules.
    */
    constructor(
    /**
    The schema into which the parser parses.
    */
    schema, 
    /**
    The set of [parse rules](https://prosemirror.net/docs/ref/#model.ParseRule) that the parser
    uses, in order of precedence.
    */
    rules) {
        this.schema = schema;
        this.rules = rules;
        /**
        @internal
        */
        this.tags = [];
        /**
        @internal
        */
        this.styles = [];
        rules.forEach(rule => {
            if (rule.tag)
                this.tags.push(rule);
            else if (rule.style)
                this.styles.push(rule);
        });
        // Only normalize list elements when lists in the schema can't directly contain themselves
        this.normalizeLists = !this.tags.some(r => {
            if (!/^(ul|ol)\b/.test(r.tag) || !r.node)
                return false;
            let node = schema.nodes[r.node];
            return node.contentMatch.matchType(node);
        });
    }
    /**
    Parse a document from the content of a DOM node.
    */
    parse(dom, options = {}) {
        let context = new ParseContext(this, options, false);
        context.addAll(dom, options.from, options.to);
        return context.finish();
    }
    /**
    Parses the content of the given DOM node, like
    [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
    options. But unlike that method, which produces a whole node,
    this one returns a slice that is open at the sides, meaning that
    the schema constraints aren't applied to the start of nodes to
    the left of the input and the end of nodes at the end.
    */
    parseSlice(dom, options = {}) {
        let context = new ParseContext(this, options, true);
        context.addAll(dom, options.from, options.to);
        return Slice.maxOpen(context.finish());
    }
    /**
    @internal
    */
    matchTag(dom, context, after) {
        for (let i = after ? this.tags.indexOf(after) + 1 : 0; i < this.tags.length; i++) {
            let rule = this.tags[i];
            if (matches(dom, rule.tag) &&
                (rule.namespace === undefined || dom.namespaceURI == rule.namespace) &&
                (!rule.context || context.matchesContext(rule.context))) {
                if (rule.getAttrs) {
                    let result = rule.getAttrs(dom);
                    if (result === false)
                        continue;
                    rule.attrs = result || undefined;
                }
                return rule;
            }
        }
    }
    /**
    @internal
    */
    matchStyle(prop, value, context, after) {
        for (let i = after ? this.styles.indexOf(after) + 1 : 0; i < this.styles.length; i++) {
            let rule = this.styles[i], style = rule.style;
            if (style.indexOf(prop) != 0 ||
                rule.context && !context.matchesContext(rule.context) ||
                // Test that the style string either precisely matches the prop,
                // or has an '=' sign after the prop, followed by the given
                // value.
                style.length > prop.length &&
                    (style.charCodeAt(prop.length) != 61 || style.slice(prop.length + 1) != value))
                continue;
            if (rule.getAttrs) {
                let result = rule.getAttrs(value);
                if (result === false)
                    continue;
                rule.attrs = result || undefined;
            }
            return rule;
        }
    }
    /**
    @internal
    */
    static schemaRules(schema) {
        let result = [];
        function insert(rule) {
            let priority = rule.priority == null ? 50 : rule.priority, i = 0;
            for (; i < result.length; i++) {
                let next = result[i], nextPriority = next.priority == null ? 50 : next.priority;
                if (nextPriority < priority)
                    break;
            }
            result.splice(i, 0, rule);
        }
        for (let name in schema.marks) {
            let rules = schema.marks[name].spec.parseDOM;
            if (rules)
                rules.forEach(rule => {
                    insert(rule = copy(rule));
                    if (!(rule.mark || rule.ignore || rule.clearMark))
                        rule.mark = name;
                });
        }
        for (let name in schema.nodes) {
            let rules = schema.nodes[name].spec.parseDOM;
            if (rules)
                rules.forEach(rule => {
                    insert(rule = copy(rule));
                    if (!(rule.node || rule.ignore || rule.mark))
                        rule.node = name;
                });
        }
        return result;
    }
    /**
    Construct a DOM parser using the parsing rules listed in a
    schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
    [priority](https://prosemirror.net/docs/ref/#model.ParseRule.priority).
    */
    static fromSchema(schema) {
        return schema.cached.domParser ||
            (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)));
    }
}
const blockTags = {
    address: true, article: true, aside: true, blockquote: true, canvas: true,
    dd: true, div: true, dl: true, fieldset: true, figcaption: true, figure: true,
    footer: true, form: true, h1: true, h2: true, h3: true, h4: true, h5: true,
    h6: true, header: true, hgroup: true, hr: true, li: true, noscript: true, ol: true,
    output: true, p: true, pre: true, section: true, table: true, tfoot: true, ul: true
};
const ignoreTags = {
    head: true, noscript: true, object: true, script: true, style: true, title: true
};
const listTags = { ol: true, ul: true };
// Using a bitfield for node context options
const OPT_PRESERVE_WS = 1, OPT_PRESERVE_WS_FULL = 2, OPT_OPEN_LEFT = 4;
function wsOptionsFor(type, preserveWhitespace, base) {
    if (preserveWhitespace != null)
        return (preserveWhitespace ? OPT_PRESERVE_WS : 0) |
            (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0);
    return type && type.whitespace == "pre" ? OPT_PRESERVE_WS | OPT_PRESERVE_WS_FULL : base & ~OPT_OPEN_LEFT;
}
class NodeContext {
    constructor(type, attrs, 
    // Marks applied to this node itself
    marks, 
    // Marks that can't apply here, but will be used in children if possible
    pendingMarks, solid, match, options) {
        this.type = type;
        this.attrs = attrs;
        this.marks = marks;
        this.pendingMarks = pendingMarks;
        this.solid = solid;
        this.options = options;
        this.content = [];
        // Marks applied to the node's children
        this.activeMarks = Mark$1.none;
        // Nested Marks with same type
        this.stashMarks = [];
        this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentMatch);
    }
    findWrapping(node) {
        if (!this.match) {
            if (!this.type)
                return [];
            let fill = this.type.contentMatch.fillBefore(Fragment.from(node));
            if (fill) {
                this.match = this.type.contentMatch.matchFragment(fill);
            }
            else {
                let start = this.type.contentMatch, wrap;
                if (wrap = start.findWrapping(node.type)) {
                    this.match = start;
                    return wrap;
                }
                else {
                    return null;
                }
            }
        }
        return this.match.findWrapping(node.type);
    }
    finish(openEnd) {
        if (!(this.options & OPT_PRESERVE_WS)) { // Strip trailing whitespace
            let last = this.content[this.content.length - 1], m;
            if (last && last.isText && (m = /[ \t\r\n\u000c]+$/.exec(last.text))) {
                let text = last;
                if (last.text.length == m[0].length)
                    this.content.pop();
                else
                    this.content[this.content.length - 1] = text.withText(text.text.slice(0, text.text.length - m[0].length));
            }
        }
        let content = Fragment.from(this.content);
        if (!openEnd && this.match)
            content = content.append(this.match.fillBefore(Fragment.empty, true));
        return this.type ? this.type.create(this.attrs, content, this.marks) : content;
    }
    popFromStashMark(mark) {
        for (let i = this.stashMarks.length - 1; i >= 0; i--)
            if (mark.eq(this.stashMarks[i]))
                return this.stashMarks.splice(i, 1)[0];
    }
    applyPending(nextType) {
        for (let i = 0, pending = this.pendingMarks; i < pending.length; i++) {
            let mark = pending[i];
            if ((this.type ? this.type.allowsMarkType(mark.type) : markMayApply(mark.type, nextType)) &&
                !mark.isInSet(this.activeMarks)) {
                this.activeMarks = mark.addToSet(this.activeMarks);
                this.pendingMarks = mark.removeFromSet(this.pendingMarks);
            }
        }
    }
    inlineContext(node) {
        if (this.type)
            return this.type.inlineContent;
        if (this.content.length)
            return this.content[0].isInline;
        return node.parentNode && !blockTags.hasOwnProperty(node.parentNode.nodeName.toLowerCase());
    }
}
class ParseContext {
    constructor(
    // The parser we are using.
    parser, 
    // The options passed to this parse.
    options, isOpen) {
        this.parser = parser;
        this.options = options;
        this.isOpen = isOpen;
        this.open = 0;
        let topNode = options.topNode, topContext;
        let topOptions = wsOptionsFor(null, options.preserveWhitespace, 0) | (isOpen ? OPT_OPEN_LEFT : 0);
        if (topNode)
            topContext = new NodeContext(topNode.type, topNode.attrs, Mark$1.none, Mark$1.none, true, options.topMatch || topNode.type.contentMatch, topOptions);
        else if (isOpen)
            topContext = new NodeContext(null, null, Mark$1.none, Mark$1.none, true, null, topOptions);
        else
            topContext = new NodeContext(parser.schema.topNodeType, null, Mark$1.none, Mark$1.none, true, null, topOptions);
        this.nodes = [topContext];
        this.find = options.findPositions;
        this.needsBlock = false;
    }
    get top() {
        return this.nodes[this.open];
    }
    // Add a DOM node to the content. Text is inserted as text node,
    // otherwise, the node is passed to `addElement` or, if it has a
    // `style` attribute, `addElementWithStyles`.
    addDOM(dom) {
        if (dom.nodeType == 3) {
            this.addTextNode(dom);
        }
        else if (dom.nodeType == 1) {
            let style = dom.getAttribute("style");
            if (!style) {
                this.addElement(dom);
            }
            else {
                let marks = this.readStyles(parseStyles(style));
                if (!marks)
                    return; // A style with ignore: true
                let [addMarks, removeMarks] = marks, top = this.top;
                for (let i = 0; i < removeMarks.length; i++)
                    this.removePendingMark(removeMarks[i], top);
                for (let i = 0; i < addMarks.length; i++)
                    this.addPendingMark(addMarks[i]);
                this.addElement(dom);
                for (let i = 0; i < addMarks.length; i++)
                    this.removePendingMark(addMarks[i], top);
                for (let i = 0; i < removeMarks.length; i++)
                    this.addPendingMark(removeMarks[i]);
            }
        }
    }
    addTextNode(dom) {
        let value = dom.nodeValue;
        let top = this.top;
        if (top.options & OPT_PRESERVE_WS_FULL ||
            top.inlineContext(dom) ||
            /[^ \t\r\n\u000c]/.test(value)) {
            if (!(top.options & OPT_PRESERVE_WS)) {
                value = value.replace(/[ \t\r\n\u000c]+/g, " ");
                // If this starts with whitespace, and there is no node before it, or
                // a hard break, or a text node that ends with whitespace, strip the
                // leading space.
                if (/^[ \t\r\n\u000c]/.test(value) && this.open == this.nodes.length - 1) {
                    let nodeBefore = top.content[top.content.length - 1];
                    let domNodeBefore = dom.previousSibling;
                    if (!nodeBefore ||
                        (domNodeBefore && domNodeBefore.nodeName == 'BR') ||
                        (nodeBefore.isText && /[ \t\r\n\u000c]$/.test(nodeBefore.text)))
                        value = value.slice(1);
                }
            }
            else if (!(top.options & OPT_PRESERVE_WS_FULL)) {
                value = value.replace(/\r?\n|\r/g, " ");
            }
            else {
                value = value.replace(/\r\n?/g, "\n");
            }
            if (value)
                this.insertNode(this.parser.schema.text(value));
            this.findInText(dom);
        }
        else {
            this.findInside(dom);
        }
    }
    // Try to find a handler for the given tag and use that to parse. If
    // none is found, the element's content nodes are added directly.
    addElement(dom, matchAfter) {
        let name = dom.nodeName.toLowerCase(), ruleID;
        if (listTags.hasOwnProperty(name) && this.parser.normalizeLists)
            normalizeList(dom);
        let rule = (this.options.ruleFromNode && this.options.ruleFromNode(dom)) ||
            (ruleID = this.parser.matchTag(dom, this, matchAfter));
        if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
            this.findInside(dom);
            this.ignoreFallback(dom);
        }
        else if (!rule || rule.skip || rule.closeParent) {
            if (rule && rule.closeParent)
                this.open = Math.max(0, this.open - 1);
            else if (rule && rule.skip.nodeType)
                dom = rule.skip;
            let sync, top = this.top, oldNeedsBlock = this.needsBlock;
            if (blockTags.hasOwnProperty(name)) {
                if (top.content.length && top.content[0].isInline && this.open) {
                    this.open--;
                    top = this.top;
                }
                sync = true;
                if (!top.type)
                    this.needsBlock = true;
            }
            else if (!dom.firstChild) {
                this.leafFallback(dom);
                return;
            }
            this.addAll(dom);
            if (sync)
                this.sync(top);
            this.needsBlock = oldNeedsBlock;
        }
        else {
            this.addElementByRule(dom, rule, rule.consuming === false ? ruleID : undefined);
        }
    }
    // Called for leaf DOM nodes that would otherwise be ignored
    leafFallback(dom) {
        if (dom.nodeName == "BR" && this.top.type && this.top.type.inlineContent)
            this.addTextNode(dom.ownerDocument.createTextNode("\n"));
    }
    // Called for ignored nodes
    ignoreFallback(dom) {
        // Ignored BR nodes should at least create an inline context
        if (dom.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent))
            this.findPlace(this.parser.schema.text("-"));
    }
    // Run any style parser associated with the node's styles. Either
    // return an array of marks, or null to indicate some of the styles
    // had a rule with `ignore` set.
    readStyles(styles) {
        let add = Mark$1.none, remove = Mark$1.none;
        style: for (let i = 0; i < styles.length; i += 2) {
            for (let after = undefined;;) {
                let rule = this.parser.matchStyle(styles[i], styles[i + 1], this, after);
                if (!rule)
                    continue style;
                if (rule.ignore)
                    return null;
                if (rule.clearMark) {
                    this.top.pendingMarks.forEach(m => {
                        if (rule.clearMark(m))
                            remove = m.addToSet(remove);
                    });
                }
                else {
                    add = this.parser.schema.marks[rule.mark].create(rule.attrs).addToSet(add);
                }
                if (rule.consuming === false)
                    after = rule;
                else
                    break;
            }
        }
        return [add, remove];
    }
    // Look up a handler for the given node. If none are found, return
    // false. Otherwise, apply it, use its return value to drive the way
    // the node's content is wrapped, and return true.
    addElementByRule(dom, rule, continueAfter) {
        let sync, nodeType, mark;
        if (rule.node) {
            nodeType = this.parser.schema.nodes[rule.node];
            if (!nodeType.isLeaf) {
                sync = this.enter(nodeType, rule.attrs || null, rule.preserveWhitespace);
            }
            else if (!this.insertNode(nodeType.create(rule.attrs))) {
                this.leafFallback(dom);
            }
        }
        else {
            let markType = this.parser.schema.marks[rule.mark];
            mark = markType.create(rule.attrs);
            this.addPendingMark(mark);
        }
        let startIn = this.top;
        if (nodeType && nodeType.isLeaf) {
            this.findInside(dom);
        }
        else if (continueAfter) {
            this.addElement(dom, continueAfter);
        }
        else if (rule.getContent) {
            this.findInside(dom);
            rule.getContent(dom, this.parser.schema).forEach(node => this.insertNode(node));
        }
        else {
            let contentDOM = dom;
            if (typeof rule.contentElement == "string")
                contentDOM = dom.querySelector(rule.contentElement);
            else if (typeof rule.contentElement == "function")
                contentDOM = rule.contentElement(dom);
            else if (rule.contentElement)
                contentDOM = rule.contentElement;
            this.findAround(dom, contentDOM, true);
            this.addAll(contentDOM);
        }
        if (sync && this.sync(startIn))
            this.open--;
        if (mark)
            this.removePendingMark(mark, startIn);
    }
    // Add all child nodes between `startIndex` and `endIndex` (or the
    // whole node, if not given). If `sync` is passed, use it to
    // synchronize after every block element.
    addAll(parent, startIndex, endIndex) {
        let index = startIndex || 0;
        for (let dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild, end = endIndex == null ? null : parent.childNodes[endIndex]; dom != end; dom = dom.nextSibling, ++index) {
            this.findAtPoint(parent, index);
            this.addDOM(dom);
        }
        this.findAtPoint(parent, index);
    }
    // Try to find a way to fit the given node type into the current
    // context. May add intermediate wrappers and/or leave non-solid
    // nodes that we're in.
    findPlace(node) {
        let route, sync;
        for (let depth = this.open; depth >= 0; depth--) {
            let cx = this.nodes[depth];
            let found = cx.findWrapping(node);
            if (found && (!route || route.length > found.length)) {
                route = found;
                sync = cx;
                if (!found.length)
                    break;
            }
            if (cx.solid)
                break;
        }
        if (!route)
            return false;
        this.sync(sync);
        for (let i = 0; i < route.length; i++)
            this.enterInner(route[i], null, false);
        return true;
    }
    // Try to insert the given node, adjusting the context when needed.
    insertNode(node) {
        if (node.isInline && this.needsBlock && !this.top.type) {
            let block = this.textblockFromContext();
            if (block)
                this.enterInner(block);
        }
        if (this.findPlace(node)) {
            this.closeExtra();
            let top = this.top;
            top.applyPending(node.type);
            if (top.match)
                top.match = top.match.matchType(node.type);
            let marks = top.activeMarks;
            for (let i = 0; i < node.marks.length; i++)
                if (!top.type || top.type.allowsMarkType(node.marks[i].type))
                    marks = node.marks[i].addToSet(marks);
            top.content.push(node.mark(marks));
            return true;
        }
        return false;
    }
    // Try to start a node of the given type, adjusting the context when
    // necessary.
    enter(type, attrs, preserveWS) {
        let ok = this.findPlace(type.create(attrs));
        if (ok)
            this.enterInner(type, attrs, true, preserveWS);
        return ok;
    }
    // Open a node of the given type
    enterInner(type, attrs = null, solid = false, preserveWS) {
        this.closeExtra();
        let top = this.top;
        top.applyPending(type);
        top.match = top.match && top.match.matchType(type);
        let options = wsOptionsFor(type, preserveWS, top.options);
        if ((top.options & OPT_OPEN_LEFT) && top.content.length == 0)
            options |= OPT_OPEN_LEFT;
        this.nodes.push(new NodeContext(type, attrs, top.activeMarks, top.pendingMarks, solid, null, options));
        this.open++;
    }
    // Make sure all nodes above this.open are finished and added to
    // their parents
    closeExtra(openEnd = false) {
        let i = this.nodes.length - 1;
        if (i > this.open) {
            for (; i > this.open; i--)
                this.nodes[i - 1].content.push(this.nodes[i].finish(openEnd));
            this.nodes.length = this.open + 1;
        }
    }
    finish() {
        this.open = 0;
        this.closeExtra(this.isOpen);
        return this.nodes[0].finish(this.isOpen || this.options.topOpen);
    }
    sync(to) {
        for (let i = this.open; i >= 0; i--)
            if (this.nodes[i] == to) {
                this.open = i;
                return true;
            }
        return false;
    }
    get currentPos() {
        this.closeExtra();
        let pos = 0;
        for (let i = this.open; i >= 0; i--) {
            let content = this.nodes[i].content;
            for (let j = content.length - 1; j >= 0; j--)
                pos += content[j].nodeSize;
            if (i)
                pos++;
        }
        return pos;
    }
    findAtPoint(parent, offset) {
        if (this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].node == parent && this.find[i].offset == offset)
                    this.find[i].pos = this.currentPos;
            }
    }
    findInside(parent) {
        if (this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node))
                    this.find[i].pos = this.currentPos;
            }
    }
    findAround(parent, content, before) {
        if (parent != content && this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node)) {
                    let pos = content.compareDocumentPosition(this.find[i].node);
                    if (pos & (before ? 2 : 4))
                        this.find[i].pos = this.currentPos;
                }
            }
    }
    findInText(textNode) {
        if (this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].node == textNode)
                    this.find[i].pos = this.currentPos - (textNode.nodeValue.length - this.find[i].offset);
            }
    }
    // Determines whether the given context string matches this context.
    matchesContext(context) {
        if (context.indexOf("|") > -1)
            return context.split(/\s*\|\s*/).some(this.matchesContext, this);
        let parts = context.split("/");
        let option = this.options.context;
        let useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type);
        let minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1);
        let match = (i, depth) => {
            for (; i >= 0; i--) {
                let part = parts[i];
                if (part == "") {
                    if (i == parts.length - 1 || i == 0)
                        continue;
                    for (; depth >= minDepth; depth--)
                        if (match(i - 1, depth))
                            return true;
                    return false;
                }
                else {
                    let next = depth > 0 || (depth == 0 && useRoot) ? this.nodes[depth].type
                        : option && depth >= minDepth ? option.node(depth - minDepth).type
                            : null;
                    if (!next || (next.name != part && next.groups.indexOf(part) == -1))
                        return false;
                    depth--;
                }
            }
            return true;
        };
        return match(parts.length - 1, this.open);
    }
    textblockFromContext() {
        let $context = this.options.context;
        if ($context)
            for (let d = $context.depth; d >= 0; d--) {
                let deflt = $context.node(d).contentMatchAt($context.indexAfter(d)).defaultType;
                if (deflt && deflt.isTextblock && deflt.defaultAttrs)
                    return deflt;
            }
        for (let name in this.parser.schema.nodes) {
            let type = this.parser.schema.nodes[name];
            if (type.isTextblock && type.defaultAttrs)
                return type;
        }
    }
    addPendingMark(mark) {
        let found = findSameMarkInSet(mark, this.top.pendingMarks);
        if (found)
            this.top.stashMarks.push(found);
        this.top.pendingMarks = mark.addToSet(this.top.pendingMarks);
    }
    removePendingMark(mark, upto) {
        for (let depth = this.open; depth >= 0; depth--) {
            let level = this.nodes[depth];
            let found = level.pendingMarks.lastIndexOf(mark);
            if (found > -1) {
                level.pendingMarks = mark.removeFromSet(level.pendingMarks);
            }
            else {
                level.activeMarks = mark.removeFromSet(level.activeMarks);
                let stashMark = level.popFromStashMark(mark);
                if (stashMark && level.type && level.type.allowsMarkType(stashMark.type))
                    level.activeMarks = stashMark.addToSet(level.activeMarks);
            }
            if (level == upto)
                break;
        }
    }
}
// Kludge to work around directly nested list nodes produced by some
// tools and allowed by browsers to mean that the nested list is
// actually part of the list item above it.
function normalizeList(dom) {
    for (let child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
        let name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null;
        if (name && listTags.hasOwnProperty(name) && prevItem) {
            prevItem.appendChild(child);
            child = prevItem;
        }
        else if (name == "li") {
            prevItem = child;
        }
        else if (name) {
            prevItem = null;
        }
    }
}
// Apply a CSS selector.
function matches(dom, selector) {
    return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector);
}
// Tokenize a style attribute into property/value pairs.
function parseStyles(style) {
    let re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result = [];
    while (m = re.exec(style))
        result.push(m[1], m[2].trim());
    return result;
}
function copy(obj) {
    let copy = {};
    for (let prop in obj)
        copy[prop] = obj[prop];
    return copy;
}
// Used when finding a mark at the top level of a fragment parse.
// Checks whether it would be reasonable to apply a given mark type to
// a given node, by looking at the way the mark occurs in the schema.
function markMayApply(markType, nodeType) {
    let nodes = nodeType.schema.nodes;
    for (let name in nodes) {
        let parent = nodes[name];
        if (!parent.allowsMarkType(markType))
            continue;
        let seen = [], scan = (match) => {
            seen.push(match);
            for (let i = 0; i < match.edgeCount; i++) {
                let { type, next } = match.edge(i);
                if (type == nodeType)
                    return true;
                if (seen.indexOf(next) < 0 && scan(next))
                    return true;
            }
        };
        if (scan(parent.contentMatch))
            return true;
    }
}
function findSameMarkInSet(mark, set) {
    for (let i = 0; i < set.length; i++) {
        if (mark.eq(set[i]))
            return set[i];
    }
}

/**
A DOM serializer knows how to convert ProseMirror nodes and
marks of various types to DOM nodes.
*/
class DOMSerializer {
    /**
    Create a serializer. `nodes` should map node names to functions
    that take a node and return a description of the corresponding
    DOM. `marks` does the same for mark names, but also gets an
    argument that tells it whether the mark's content is block or
    inline content (for typical use, it'll always be inline). A mark
    serializer may be `null` to indicate that marks of that type
    should not be serialized.
    */
    constructor(
    /**
    The node serialization functions.
    */
    nodes, 
    /**
    The mark serialization functions.
    */
    marks) {
        this.nodes = nodes;
        this.marks = marks;
    }
    /**
    Serialize the content of this fragment to a DOM fragment. When
    not in the browser, the `document` option, containing a DOM
    document, should be passed so that the serializer can create
    nodes.
    */
    serializeFragment(fragment, options = {}, target) {
        if (!target)
            target = doc$1(options).createDocumentFragment();
        let top = target, active = [];
        fragment.forEach(node => {
            if (active.length || node.marks.length) {
                let keep = 0, rendered = 0;
                while (keep < active.length && rendered < node.marks.length) {
                    let next = node.marks[rendered];
                    if (!this.marks[next.type.name]) {
                        rendered++;
                        continue;
                    }
                    if (!next.eq(active[keep][0]) || next.type.spec.spanning === false)
                        break;
                    keep++;
                    rendered++;
                }
                while (keep < active.length)
                    top = active.pop()[1];
                while (rendered < node.marks.length) {
                    let add = node.marks[rendered++];
                    let markDOM = this.serializeMark(add, node.isInline, options);
                    if (markDOM) {
                        active.push([add, top]);
                        top.appendChild(markDOM.dom);
                        top = markDOM.contentDOM || markDOM.dom;
                    }
                }
            }
            top.appendChild(this.serializeNodeInner(node, options));
        });
        return target;
    }
    /**
    @internal
    */
    serializeNodeInner(node, options) {
        let { dom, contentDOM } = DOMSerializer.renderSpec(doc$1(options), this.nodes[node.type.name](node));
        if (contentDOM) {
            if (node.isLeaf)
                throw new RangeError("Content hole not allowed in a leaf node spec");
            this.serializeFragment(node.content, options, contentDOM);
        }
        return dom;
    }
    /**
    Serialize this node to a DOM node. This can be useful when you
    need to serialize a part of a document, as opposed to the whole
    document. To serialize a whole document, use
    [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
    its [content](https://prosemirror.net/docs/ref/#model.Node.content).
    */
    serializeNode(node, options = {}) {
        let dom = this.serializeNodeInner(node, options);
        for (let i = node.marks.length - 1; i >= 0; i--) {
            let wrap = this.serializeMark(node.marks[i], node.isInline, options);
            if (wrap) {
                (wrap.contentDOM || wrap.dom).appendChild(dom);
                dom = wrap.dom;
            }
        }
        return dom;
    }
    /**
    @internal
    */
    serializeMark(mark, inline, options = {}) {
        let toDOM = this.marks[mark.type.name];
        return toDOM && DOMSerializer.renderSpec(doc$1(options), toDOM(mark, inline));
    }
    /**
    Render an [output spec](https://prosemirror.net/docs/ref/#model.DOMOutputSpec) to a DOM node. If
    the spec has a hole (zero) in it, `contentDOM` will point at the
    node with the hole.
    */
    static renderSpec(doc, structure, xmlNS = null) {
        if (typeof structure == "string")
            return { dom: doc.createTextNode(structure) };
        if (structure.nodeType != null)
            return { dom: structure };
        if (structure.dom && structure.dom.nodeType != null)
            return structure;
        let tagName = structure[0], space = tagName.indexOf(" ");
        if (space > 0) {
            xmlNS = tagName.slice(0, space);
            tagName = tagName.slice(space + 1);
        }
        let contentDOM;
        let dom = (xmlNS ? doc.createElementNS(xmlNS, tagName) : doc.createElement(tagName));
        let attrs = structure[1], start = 1;
        if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
            start = 2;
            for (let name in attrs)
                if (attrs[name] != null) {
                    let space = name.indexOf(" ");
                    if (space > 0)
                        dom.setAttributeNS(name.slice(0, space), name.slice(space + 1), attrs[name]);
                    else
                        dom.setAttribute(name, attrs[name]);
                }
        }
        for (let i = start; i < structure.length; i++) {
            let child = structure[i];
            if (child === 0) {
                if (i < structure.length - 1 || i > start)
                    throw new RangeError("Content hole must be the only child of its parent node");
                return { dom, contentDOM: dom };
            }
            else {
                let { dom: inner, contentDOM: innerContent } = DOMSerializer.renderSpec(doc, child, xmlNS);
                dom.appendChild(inner);
                if (innerContent) {
                    if (contentDOM)
                        throw new RangeError("Multiple content holes");
                    contentDOM = innerContent;
                }
            }
        }
        return { dom, contentDOM };
    }
    /**
    Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
    properties in a schema's node and mark specs.
    */
    static fromSchema(schema) {
        return schema.cached.domSerializer ||
            (schema.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema), this.marksFromSchema(schema)));
    }
    /**
    Gather the serializers in a schema's node specs into an object.
    This can be useful as a base to build a custom serializer from.
    */
    static nodesFromSchema(schema) {
        let result = gatherToDOM(schema.nodes);
        if (!result.text)
            result.text = node => node.text;
        return result;
    }
    /**
    Gather the serializers in a schema's mark specs into an object.
    */
    static marksFromSchema(schema) {
        return gatherToDOM(schema.marks);
    }
}
function gatherToDOM(obj) {
    let result = {};
    for (let name in obj) {
        let toDOM = obj[name].spec.toDOM;
        if (toDOM)
            result[name] = toDOM;
    }
    return result;
}
function doc$1(options) {
    return options.document || window.document;
}

// Recovery values encode a range index and an offset. They are
// represented as numbers, because tons of them will be created when
// mapping, for example, a large number of decorations. The number's
// lower 16 bits provide the index, the remaining bits the offset.
//
// Note: We intentionally don't use bit shift operators to en- and
// decode these, since those clip to 32 bits, which we might in rare
// cases want to overflow. A 64-bit float can represent 48-bit
// integers precisely.
const lower16 = 0xffff;
const factor16 = Math.pow(2, 16);
function makeRecover(index, offset) { return index + offset * factor16; }
function recoverIndex(value) { return value & lower16; }
function recoverOffset(value) { return (value - (value & lower16)) / factor16; }
const DEL_BEFORE = 1, DEL_AFTER = 2, DEL_ACROSS = 4, DEL_SIDE = 8;
/**
An object representing a mapped position with extra
information.
*/
class MapResult {
    /**
    @internal
    */
    constructor(
    /**
    The mapped version of the position.
    */
    pos, 
    /**
    @internal
    */
    delInfo, 
    /**
    @internal
    */
    recover) {
        this.pos = pos;
        this.delInfo = delInfo;
        this.recover = recover;
    }
    /**
    Tells you whether the position was deleted, that is, whether the
    step removed the token on the side queried (via the `assoc`)
    argument from the document.
    */
    get deleted() { return (this.delInfo & DEL_SIDE) > 0; }
    /**
    Tells you whether the token before the mapped position was deleted.
    */
    get deletedBefore() { return (this.delInfo & (DEL_BEFORE | DEL_ACROSS)) > 0; }
    /**
    True when the token after the mapped position was deleted.
    */
    get deletedAfter() { return (this.delInfo & (DEL_AFTER | DEL_ACROSS)) > 0; }
    /**
    Tells whether any of the steps mapped through deletes across the
    position (including both the token before and after the
    position).
    */
    get deletedAcross() { return (this.delInfo & DEL_ACROSS) > 0; }
}
/**
A map describing the deletions and insertions made by a step, which
can be used to find the correspondence between positions in the
pre-step version of a document and the same position in the
post-step version.
*/
class StepMap {
    /**
    Create a position map. The modifications to the document are
    represented as an array of numbers, in which each group of three
    represents a modified chunk as `[start, oldSize, newSize]`.
    */
    constructor(
    /**
    @internal
    */
    ranges, 
    /**
    @internal
    */
    inverted = false) {
        this.ranges = ranges;
        this.inverted = inverted;
        if (!ranges.length && StepMap.empty)
            return StepMap.empty;
    }
    /**
    @internal
    */
    recover(value) {
        let diff = 0, index = recoverIndex(value);
        if (!this.inverted)
            for (let i = 0; i < index; i++)
                diff += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
        return this.ranges[index * 3] + diff + recoverOffset(value);
    }
    mapResult(pos, assoc = 1) { return this._map(pos, assoc, false); }
    map(pos, assoc = 1) { return this._map(pos, assoc, true); }
    /**
    @internal
    */
    _map(pos, assoc, simple) {
        let diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
        for (let i = 0; i < this.ranges.length; i += 3) {
            let start = this.ranges[i] - (this.inverted ? diff : 0);
            if (start > pos)
                break;
            let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex], end = start + oldSize;
            if (pos <= end) {
                let side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
                let result = start + diff + (side < 0 ? 0 : newSize);
                if (simple)
                    return result;
                let recover = pos == (assoc < 0 ? start : end) ? null : makeRecover(i / 3, pos - start);
                let del = pos == start ? DEL_AFTER : pos == end ? DEL_BEFORE : DEL_ACROSS;
                if (assoc < 0 ? pos != start : pos != end)
                    del |= DEL_SIDE;
                return new MapResult(result, del, recover);
            }
            diff += newSize - oldSize;
        }
        return simple ? pos + diff : new MapResult(pos + diff, 0, null);
    }
    /**
    @internal
    */
    touches(pos, recover) {
        let diff = 0, index = recoverIndex(recover);
        let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
        for (let i = 0; i < this.ranges.length; i += 3) {
            let start = this.ranges[i] - (this.inverted ? diff : 0);
            if (start > pos)
                break;
            let oldSize = this.ranges[i + oldIndex], end = start + oldSize;
            if (pos <= end && i == index * 3)
                return true;
            diff += this.ranges[i + newIndex] - oldSize;
        }
        return false;
    }
    /**
    Calls the given function on each of the changed ranges included in
    this map.
    */
    forEach(f) {
        let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
        for (let i = 0, diff = 0; i < this.ranges.length; i += 3) {
            let start = this.ranges[i], oldStart = start - (this.inverted ? diff : 0), newStart = start + (this.inverted ? 0 : diff);
            let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex];
            f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
            diff += newSize - oldSize;
        }
    }
    /**
    Create an inverted version of this map. The result can be used to
    map positions in the post-step document to the pre-step document.
    */
    invert() {
        return new StepMap(this.ranges, !this.inverted);
    }
    /**
    @internal
    */
    toString() {
        return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
    }
    /**
    Create a map that moves all positions by offset `n` (which may be
    negative). This can be useful when applying steps meant for a
    sub-document to a larger document, or vice-versa.
    */
    static offset(n) {
        return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n]);
    }
}
/**
A StepMap that contains no changed ranges.
*/
StepMap.empty = new StepMap([]);
/**
A mapping represents a pipeline of zero or more [step
maps](https://prosemirror.net/docs/ref/#transform.StepMap). It has special provisions for losslessly
handling mapping positions through a series of steps in which some
steps are inverted versions of earlier steps. (This comes up when
‘[rebasing](/docs/guide/#transform.rebasing)’ steps for
collaboration or history management.)
*/
class Mapping {
    /**
    Create a new mapping with the given position maps.
    */
    constructor(
    /**
    The step maps in this mapping.
    */
    maps = [], 
    /**
    @internal
    */
    mirror, 
    /**
    The starting position in the `maps` array, used when `map` or
    `mapResult` is called.
    */
    from = 0, 
    /**
    The end position in the `maps` array.
    */
    to = maps.length) {
        this.maps = maps;
        this.mirror = mirror;
        this.from = from;
        this.to = to;
    }
    /**
    Create a mapping that maps only through a part of this one.
    */
    slice(from = 0, to = this.maps.length) {
        return new Mapping(this.maps, this.mirror, from, to);
    }
    /**
    @internal
    */
    copy() {
        return new Mapping(this.maps.slice(), this.mirror && this.mirror.slice(), this.from, this.to);
    }
    /**
    Add a step map to the end of this mapping. If `mirrors` is
    given, it should be the index of the step map that is the mirror
    image of this one.
    */
    appendMap(map, mirrors) {
        this.to = this.maps.push(map);
        if (mirrors != null)
            this.setMirror(this.maps.length - 1, mirrors);
    }
    /**
    Add all the step maps in a given mapping to this one (preserving
    mirroring information).
    */
    appendMapping(mapping) {
        for (let i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
            let mirr = mapping.getMirror(i);
            this.appendMap(mapping.maps[i], mirr != null && mirr < i ? startSize + mirr : undefined);
        }
    }
    /**
    Finds the offset of the step map that mirrors the map at the
    given offset, in this mapping (as per the second argument to
    `appendMap`).
    */
    getMirror(n) {
        if (this.mirror)
            for (let i = 0; i < this.mirror.length; i++)
                if (this.mirror[i] == n)
                    return this.mirror[i + (i % 2 ? -1 : 1)];
    }
    /**
    @internal
    */
    setMirror(n, m) {
        if (!this.mirror)
            this.mirror = [];
        this.mirror.push(n, m);
    }
    /**
    Append the inverse of the given mapping to this one.
    */
    appendMappingInverted(mapping) {
        for (let i = mapping.maps.length - 1, totalSize = this.maps.length + mapping.maps.length; i >= 0; i--) {
            let mirr = mapping.getMirror(i);
            this.appendMap(mapping.maps[i].invert(), mirr != null && mirr > i ? totalSize - mirr - 1 : undefined);
        }
    }
    /**
    Create an inverted version of this mapping.
    */
    invert() {
        let inverse = new Mapping;
        inverse.appendMappingInverted(this);
        return inverse;
    }
    /**
    Map a position through this mapping.
    */
    map(pos, assoc = 1) {
        if (this.mirror)
            return this._map(pos, assoc, true);
        for (let i = this.from; i < this.to; i++)
            pos = this.maps[i].map(pos, assoc);
        return pos;
    }
    /**
    Map a position through this mapping, returning a mapping
    result.
    */
    mapResult(pos, assoc = 1) { return this._map(pos, assoc, false); }
    /**
    @internal
    */
    _map(pos, assoc, simple) {
        let delInfo = 0;
        for (let i = this.from; i < this.to; i++) {
            let map = this.maps[i], result = map.mapResult(pos, assoc);
            if (result.recover != null) {
                let corr = this.getMirror(i);
                if (corr != null && corr > i && corr < this.to) {
                    i = corr;
                    pos = this.maps[corr].recover(result.recover);
                    continue;
                }
            }
            delInfo |= result.delInfo;
            pos = result.pos;
        }
        return simple ? pos : new MapResult(pos, delInfo, null);
    }
}

const stepsByID = Object.create(null);
/**
A step object represents an atomic change. It generally applies
only to the document it was created for, since the positions
stored in it will only make sense for that document.

New steps are defined by creating classes that extend `Step`,
overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
methods, and registering your class with a unique
JSON-serialization identifier using
[`Step.jsonID`](https://prosemirror.net/docs/ref/#transform.Step^jsonID).
*/
class Step {
    /**
    Get the step map that represents the changes made by this step,
    and which can be used to transform between positions in the old
    and the new document.
    */
    getMap() { return StepMap.empty; }
    /**
    Try to merge this step with another one, to be applied directly
    after it. Returns the merged step when possible, null if the
    steps can't be merged.
    */
    merge(other) { return null; }
    /**
    Deserialize a step from its JSON representation. Will call
    through to the step class' own implementation of this method.
    */
    static fromJSON(schema, json) {
        if (!json || !json.stepType)
            throw new RangeError("Invalid input for Step.fromJSON");
        let type = stepsByID[json.stepType];
        if (!type)
            throw new RangeError(`No step type ${json.stepType} defined`);
        return type.fromJSON(schema, json);
    }
    /**
    To be able to serialize steps to JSON, each step needs a string
    ID to attach to its JSON representation. Use this method to
    register an ID for your step classes. Try to pick something
    that's unlikely to clash with steps from other modules.
    */
    static jsonID(id, stepClass) {
        if (id in stepsByID)
            throw new RangeError("Duplicate use of step JSON ID " + id);
        stepsByID[id] = stepClass;
        stepClass.prototype.jsonID = id;
        return stepClass;
    }
}
/**
The result of [applying](https://prosemirror.net/docs/ref/#transform.Step.apply) a step. Contains either a
new document or a failure value.
*/
class StepResult {
    /**
    @internal
    */
    constructor(
    /**
    The transformed document, if successful.
    */
    doc, 
    /**
    The failure message, if unsuccessful.
    */
    failed) {
        this.doc = doc;
        this.failed = failed;
    }
    /**
    Create a successful step result.
    */
    static ok(doc) { return new StepResult(doc, null); }
    /**
    Create a failed step result.
    */
    static fail(message) { return new StepResult(null, message); }
    /**
    Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
    arguments. Create a successful result if it succeeds, and a
    failed one if it throws a `ReplaceError`.
    */
    static fromReplace(doc, from, to, slice) {
        try {
            return StepResult.ok(doc.replace(from, to, slice));
        }
        catch (e) {
            if (e instanceof ReplaceError)
                return StepResult.fail(e.message);
            throw e;
        }
    }
}

function mapFragment(fragment, f, parent) {
    let mapped = [];
    for (let i = 0; i < fragment.childCount; i++) {
        let child = fragment.child(i);
        if (child.content.size)
            child = child.copy(mapFragment(child.content, f, child));
        if (child.isInline)
            child = f(child, parent, i);
        mapped.push(child);
    }
    return Fragment.fromArray(mapped);
}
/**
Add a mark to all inline content between two positions.
*/
class AddMarkStep extends Step {
    /**
    Create a mark step.
    */
    constructor(
    /**
    The start of the marked range.
    */
    from, 
    /**
    The end of the marked range.
    */
    to, 
    /**
    The mark to add.
    */
    mark) {
        super();
        this.from = from;
        this.to = to;
        this.mark = mark;
    }
    apply(doc) {
        let oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from);
        let parent = $from.node($from.sharedDepth(this.to));
        let slice = new Slice(mapFragment(oldSlice.content, (node, parent) => {
            if (!node.isAtom || !parent.type.allowsMarkType(this.mark.type))
                return node;
            return node.mark(this.mark.addToSet(node.marks));
        }, parent), oldSlice.openStart, oldSlice.openEnd);
        return StepResult.fromReplace(doc, this.from, this.to, slice);
    }
    invert() {
        return new RemoveMarkStep(this.from, this.to, this.mark);
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        if (from.deleted && to.deleted || from.pos >= to.pos)
            return null;
        return new AddMarkStep(from.pos, to.pos, this.mark);
    }
    merge(other) {
        if (other instanceof AddMarkStep &&
            other.mark.eq(this.mark) &&
            this.from <= other.to && this.to >= other.from)
            return new AddMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
        return null;
    }
    toJSON() {
        return { stepType: "addMark", mark: this.mark.toJSON(),
            from: this.from, to: this.to };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number")
            throw new RangeError("Invalid input for AddMarkStep.fromJSON");
        return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("addMark", AddMarkStep);
/**
Remove a mark from all inline content between two positions.
*/
class RemoveMarkStep extends Step {
    /**
    Create a mark-removing step.
    */
    constructor(
    /**
    The start of the unmarked range.
    */
    from, 
    /**
    The end of the unmarked range.
    */
    to, 
    /**
    The mark to remove.
    */
    mark) {
        super();
        this.from = from;
        this.to = to;
        this.mark = mark;
    }
    apply(doc) {
        let oldSlice = doc.slice(this.from, this.to);
        let slice = new Slice(mapFragment(oldSlice.content, node => {
            return node.mark(this.mark.removeFromSet(node.marks));
        }, doc), oldSlice.openStart, oldSlice.openEnd);
        return StepResult.fromReplace(doc, this.from, this.to, slice);
    }
    invert() {
        return new AddMarkStep(this.from, this.to, this.mark);
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        if (from.deleted && to.deleted || from.pos >= to.pos)
            return null;
        return new RemoveMarkStep(from.pos, to.pos, this.mark);
    }
    merge(other) {
        if (other instanceof RemoveMarkStep &&
            other.mark.eq(this.mark) &&
            this.from <= other.to && this.to >= other.from)
            return new RemoveMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
        return null;
    }
    toJSON() {
        return { stepType: "removeMark", mark: this.mark.toJSON(),
            from: this.from, to: this.to };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number")
            throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
        return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("removeMark", RemoveMarkStep);
/**
Add a mark to a specific node.
*/
class AddNodeMarkStep extends Step {
    /**
    Create a node mark step.
    */
    constructor(
    /**
    The position of the target node.
    */
    pos, 
    /**
    The mark to add.
    */
    mark) {
        super();
        this.pos = pos;
        this.mark = mark;
    }
    apply(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node)
            return StepResult.fail("No node at mark step's position");
        let updated = node.type.create(node.attrs, null, this.mark.addToSet(node.marks));
        return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
    }
    invert(doc) {
        let node = doc.nodeAt(this.pos);
        if (node) {
            let newSet = this.mark.addToSet(node.marks);
            if (newSet.length == node.marks.length) {
                for (let i = 0; i < node.marks.length; i++)
                    if (!node.marks[i].isInSet(newSet))
                        return new AddNodeMarkStep(this.pos, node.marks[i]);
                return new AddNodeMarkStep(this.pos, this.mark);
            }
        }
        return new RemoveNodeMarkStep(this.pos, this.mark);
    }
    map(mapping) {
        let pos = mapping.mapResult(this.pos, 1);
        return pos.deletedAfter ? null : new AddNodeMarkStep(pos.pos, this.mark);
    }
    toJSON() {
        return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.pos != "number")
            throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
        return new AddNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("addNodeMark", AddNodeMarkStep);
/**
Remove a mark from a specific node.
*/
class RemoveNodeMarkStep extends Step {
    /**
    Create a mark-removing step.
    */
    constructor(
    /**
    The position of the target node.
    */
    pos, 
    /**
    The mark to remove.
    */
    mark) {
        super();
        this.pos = pos;
        this.mark = mark;
    }
    apply(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node)
            return StepResult.fail("No node at mark step's position");
        let updated = node.type.create(node.attrs, null, this.mark.removeFromSet(node.marks));
        return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
    }
    invert(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node || !this.mark.isInSet(node.marks))
            return this;
        return new AddNodeMarkStep(this.pos, this.mark);
    }
    map(mapping) {
        let pos = mapping.mapResult(this.pos, 1);
        return pos.deletedAfter ? null : new RemoveNodeMarkStep(pos.pos, this.mark);
    }
    toJSON() {
        return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.pos != "number")
            throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
        return new RemoveNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("removeNodeMark", RemoveNodeMarkStep);

/**
Replace a part of the document with a slice of new content.
*/
class ReplaceStep extends Step {
    /**
    The given `slice` should fit the 'gap' between `from` and
    `to`—the depths must line up, and the surrounding nodes must be
    able to be joined with the open sides of the slice. When
    `structure` is true, the step will fail if the content between
    from and to is not just a sequence of closing and then opening
    tokens (this is to guard against rebased replace steps
    overwriting something they weren't supposed to).
    */
    constructor(
    /**
    The start position of the replaced range.
    */
    from, 
    /**
    The end position of the replaced range.
    */
    to, 
    /**
    The slice to insert.
    */
    slice, 
    /**
    @internal
    */
    structure = false) {
        super();
        this.from = from;
        this.to = to;
        this.slice = slice;
        this.structure = structure;
    }
    apply(doc) {
        if (this.structure && contentBetween(doc, this.from, this.to))
            return StepResult.fail("Structure replace would overwrite content");
        return StepResult.fromReplace(doc, this.from, this.to, this.slice);
    }
    getMap() {
        return new StepMap([this.from, this.to - this.from, this.slice.size]);
    }
    invert(doc) {
        return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to));
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        if (from.deletedAcross && to.deletedAcross)
            return null;
        return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice);
    }
    merge(other) {
        if (!(other instanceof ReplaceStep) || other.structure || this.structure)
            return null;
        if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
            let slice = this.slice.size + other.slice.size == 0 ? Slice.empty
                : new Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
            return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure);
        }
        else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
            let slice = this.slice.size + other.slice.size == 0 ? Slice.empty
                : new Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
            return new ReplaceStep(other.from, this.to, slice, this.structure);
        }
        else {
            return null;
        }
    }
    toJSON() {
        let json = { stepType: "replace", from: this.from, to: this.to };
        if (this.slice.size)
            json.slice = this.slice.toJSON();
        if (this.structure)
            json.structure = true;
        return json;
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number")
            throw new RangeError("Invalid input for ReplaceStep.fromJSON");
        return new ReplaceStep(json.from, json.to, Slice.fromJSON(schema, json.slice), !!json.structure);
    }
}
Step.jsonID("replace", ReplaceStep);
/**
Replace a part of the document with a slice of content, but
preserve a range of the replaced content by moving it into the
slice.
*/
class ReplaceAroundStep extends Step {
    /**
    Create a replace-around step with the given range and gap.
    `insert` should be the point in the slice into which the content
    of the gap should be moved. `structure` has the same meaning as
    it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
    */
    constructor(
    /**
    The start position of the replaced range.
    */
    from, 
    /**
    The end position of the replaced range.
    */
    to, 
    /**
    The start of preserved range.
    */
    gapFrom, 
    /**
    The end of preserved range.
    */
    gapTo, 
    /**
    The slice to insert.
    */
    slice, 
    /**
    The position in the slice where the preserved range should be
    inserted.
    */
    insert, 
    /**
    @internal
    */
    structure = false) {
        super();
        this.from = from;
        this.to = to;
        this.gapFrom = gapFrom;
        this.gapTo = gapTo;
        this.slice = slice;
        this.insert = insert;
        this.structure = structure;
    }
    apply(doc) {
        if (this.structure && (contentBetween(doc, this.from, this.gapFrom) ||
            contentBetween(doc, this.gapTo, this.to)))
            return StepResult.fail("Structure gap-replace would overwrite content");
        let gap = doc.slice(this.gapFrom, this.gapTo);
        if (gap.openStart || gap.openEnd)
            return StepResult.fail("Gap is not a flat range");
        let inserted = this.slice.insertAt(this.insert, gap.content);
        if (!inserted)
            return StepResult.fail("Content does not fit in gap");
        return StepResult.fromReplace(doc, this.from, this.to, inserted);
    }
    getMap() {
        return new StepMap([this.from, this.gapFrom - this.from, this.insert,
            this.gapTo, this.to - this.gapTo, this.slice.size - this.insert]);
    }
    invert(doc) {
        let gap = this.gapTo - this.gapFrom;
        return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap, this.from + this.insert, this.from + this.insert + gap, doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        let gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1);
        if ((from.deletedAcross && to.deletedAcross) || gapFrom < from.pos || gapTo > to.pos)
            return null;
        return new ReplaceAroundStep(from.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure);
    }
    toJSON() {
        let json = { stepType: "replaceAround", from: this.from, to: this.to,
            gapFrom: this.gapFrom, gapTo: this.gapTo, insert: this.insert };
        if (this.slice.size)
            json.slice = this.slice.toJSON();
        if (this.structure)
            json.structure = true;
        return json;
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number" ||
            typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number")
            throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
        return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo, Slice.fromJSON(schema, json.slice), json.insert, !!json.structure);
    }
}
Step.jsonID("replaceAround", ReplaceAroundStep);
function contentBetween(doc, from, to) {
    let $from = doc.resolve(from), dist = to - from, depth = $from.depth;
    while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
        depth--;
        dist--;
    }
    if (dist > 0) {
        let next = $from.node(depth).maybeChild($from.indexAfter(depth));
        while (dist > 0) {
            if (!next || next.isLeaf)
                return true;
            next = next.firstChild;
            dist--;
        }
    }
    return false;
}

function addMark(tr, from, to, mark) {
    let removed = [], added = [];
    let removing, adding;
    tr.doc.nodesBetween(from, to, (node, pos, parent) => {
        if (!node.isInline)
            return;
        let marks = node.marks;
        if (!mark.isInSet(marks) && parent.type.allowsMarkType(mark.type)) {
            let start = Math.max(pos, from), end = Math.min(pos + node.nodeSize, to);
            let newSet = mark.addToSet(marks);
            for (let i = 0; i < marks.length; i++) {
                if (!marks[i].isInSet(newSet)) {
                    if (removing && removing.to == start && removing.mark.eq(marks[i]))
                        removing.to = end;
                    else
                        removed.push(removing = new RemoveMarkStep(start, end, marks[i]));
                }
            }
            if (adding && adding.to == start)
                adding.to = end;
            else
                added.push(adding = new AddMarkStep(start, end, mark));
        }
    });
    removed.forEach(s => tr.step(s));
    added.forEach(s => tr.step(s));
}
function removeMark(tr, from, to, mark) {
    let matched = [], step = 0;
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isInline)
            return;
        step++;
        let toRemove = null;
        if (mark instanceof MarkType) {
            let set = node.marks, found;
            while (found = mark.isInSet(set)) {
                (toRemove || (toRemove = [])).push(found);
                set = found.removeFromSet(set);
            }
        }
        else if (mark) {
            if (mark.isInSet(node.marks))
                toRemove = [mark];
        }
        else {
            toRemove = node.marks;
        }
        if (toRemove && toRemove.length) {
            let end = Math.min(pos + node.nodeSize, to);
            for (let i = 0; i < toRemove.length; i++) {
                let style = toRemove[i], found;
                for (let j = 0; j < matched.length; j++) {
                    let m = matched[j];
                    if (m.step == step - 1 && style.eq(matched[j].style))
                        found = m;
                }
                if (found) {
                    found.to = end;
                    found.step = step;
                }
                else {
                    matched.push({ style, from: Math.max(pos, from), to: end, step });
                }
            }
        }
    });
    matched.forEach(m => tr.step(new RemoveMarkStep(m.from, m.to, m.style)));
}
function clearIncompatible(tr, pos, parentType, match = parentType.contentMatch) {
    let node = tr.doc.nodeAt(pos);
    let delSteps = [], cur = pos + 1;
    for (let i = 0; i < node.childCount; i++) {
        let child = node.child(i), end = cur + child.nodeSize;
        let allowed = match.matchType(child.type);
        if (!allowed) {
            delSteps.push(new ReplaceStep(cur, end, Slice.empty));
        }
        else {
            match = allowed;
            for (let j = 0; j < child.marks.length; j++)
                if (!parentType.allowsMarkType(child.marks[j].type))
                    tr.step(new RemoveMarkStep(cur, end, child.marks[j]));
        }
        cur = end;
    }
    if (!match.validEnd) {
        let fill = match.fillBefore(Fragment.empty, true);
        tr.replace(cur, cur, new Slice(fill, 0, 0));
    }
    for (let i = delSteps.length - 1; i >= 0; i--)
        tr.step(delSteps[i]);
}

function canCut(node, start, end) {
    return (start == 0 || node.canReplace(start, node.childCount)) &&
        (end == node.childCount || node.canReplace(0, end));
}
/**
Try to find a target depth to which the content in the given range
can be lifted. Will not go across
[isolating](https://prosemirror.net/docs/ref/#model.NodeSpec.isolating) parent nodes.
*/
function liftTarget(range) {
    let parent = range.parent;
    let content = parent.content.cutByIndex(range.startIndex, range.endIndex);
    for (let depth = range.depth;; --depth) {
        let node = range.$from.node(depth);
        let index = range.$from.index(depth), endIndex = range.$to.indexAfter(depth);
        if (depth < range.depth && node.canReplace(index, endIndex, content))
            return depth;
        if (depth == 0 || node.type.spec.isolating || !canCut(node, index, endIndex))
            break;
    }
    return null;
}
function lift$2(tr, range, target) {
    let { $from, $to, depth } = range;
    let gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1);
    let start = gapStart, end = gapEnd;
    let before = Fragment.empty, openStart = 0;
    for (let d = depth, splitting = false; d > target; d--)
        if (splitting || $from.index(d) > 0) {
            splitting = true;
            before = Fragment.from($from.node(d).copy(before));
            openStart++;
        }
        else {
            start--;
        }
    let after = Fragment.empty, openEnd = 0;
    for (let d = depth, splitting = false; d > target; d--)
        if (splitting || $to.after(d + 1) < $to.end(d)) {
            splitting = true;
            after = Fragment.from($to.node(d).copy(after));
            openEnd++;
        }
        else {
            end++;
        }
    tr.step(new ReplaceAroundStep(start, end, gapStart, gapEnd, new Slice(before.append(after), openStart, openEnd), before.size - openStart, true));
}
/**
Try to find a valid way to wrap the content in the given range in a
node of the given type. May introduce extra nodes around and inside
the wrapper node, if necessary. Returns null if no valid wrapping
could be found. When `innerRange` is given, that range's content is
used as the content to fit into the wrapping, instead of the
content of `range`.
*/
function findWrapping(range, nodeType, attrs = null, innerRange = range) {
    let around = findWrappingOutside(range, nodeType);
    let inner = around && findWrappingInside(innerRange, nodeType);
    if (!inner)
        return null;
    return around.map(withAttrs)
        .concat({ type: nodeType, attrs }).concat(inner.map(withAttrs));
}
function withAttrs(type) { return { type, attrs: null }; }
function findWrappingOutside(range, type) {
    let { parent, startIndex, endIndex } = range;
    let around = parent.contentMatchAt(startIndex).findWrapping(type);
    if (!around)
        return null;
    let outer = around.length ? around[0] : type;
    return parent.canReplaceWith(startIndex, endIndex, outer) ? around : null;
}
function findWrappingInside(range, type) {
    let { parent, startIndex, endIndex } = range;
    let inner = parent.child(startIndex);
    let inside = type.contentMatch.findWrapping(inner.type);
    if (!inside)
        return null;
    let lastType = inside.length ? inside[inside.length - 1] : type;
    let innerMatch = lastType.contentMatch;
    for (let i = startIndex; innerMatch && i < endIndex; i++)
        innerMatch = innerMatch.matchType(parent.child(i).type);
    if (!innerMatch || !innerMatch.validEnd)
        return null;
    return inside;
}
function wrap(tr, range, wrappers) {
    let content = Fragment.empty;
    for (let i = wrappers.length - 1; i >= 0; i--) {
        if (content.size) {
            let match = wrappers[i].type.contentMatch.matchFragment(content);
            if (!match || !match.validEnd)
                throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
        }
        content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
    }
    let start = range.start, end = range.end;
    tr.step(new ReplaceAroundStep(start, end, start, end, new Slice(content, 0, 0), wrappers.length, true));
}
function setBlockType$1(tr, from, to, type, attrs) {
    if (!type.isTextblock)
        throw new RangeError("Type given to setBlockType should be a textblock");
    let mapFrom = tr.steps.length;
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isTextblock && !node.hasMarkup(type, attrs) && canChangeType(tr.doc, tr.mapping.slice(mapFrom).map(pos), type)) {
            // Ensure all markup that isn't allowed in the new node type is cleared
            tr.clearIncompatible(tr.mapping.slice(mapFrom).map(pos, 1), type);
            let mapping = tr.mapping.slice(mapFrom);
            let startM = mapping.map(pos, 1), endM = mapping.map(pos + node.nodeSize, 1);
            tr.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1, new Slice(Fragment.from(type.create(attrs, null, node.marks)), 0, 0), 1, true));
            return false;
        }
    });
}
function canChangeType(doc, pos, type) {
    let $pos = doc.resolve(pos), index = $pos.index();
    return $pos.parent.canReplaceWith(index, index + 1, type);
}
/**
Change the type, attributes, and/or marks of the node at `pos`.
When `type` isn't given, the existing node type is preserved,
*/
function setNodeMarkup(tr, pos, type, attrs, marks) {
    let node = tr.doc.nodeAt(pos);
    if (!node)
        throw new RangeError("No node at given position");
    if (!type)
        type = node.type;
    let newNode = type.create(attrs, null, marks || node.marks);
    if (node.isLeaf)
        return tr.replaceWith(pos, pos + node.nodeSize, newNode);
    if (!type.validContent(node.content))
        throw new RangeError("Invalid content for node type " + type.name);
    tr.step(new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1, new Slice(Fragment.from(newNode), 0, 0), 1, true));
}
/**
Check whether splitting at the given position is allowed.
*/
function canSplit(doc, pos, depth = 1, typesAfter) {
    let $pos = doc.resolve(pos), base = $pos.depth - depth;
    let innerType = (typesAfter && typesAfter[typesAfter.length - 1]) || $pos.parent;
    if (base < 0 || $pos.parent.type.spec.isolating ||
        !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
        !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount)))
        return false;
    for (let d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
        let node = $pos.node(d), index = $pos.index(d);
        if (node.type.spec.isolating)
            return false;
        let rest = node.content.cutByIndex(index, node.childCount);
        let after = (typesAfter && typesAfter[i]) || node;
        if (after != node)
            rest = rest.replaceChild(0, after.type.create(after.attrs));
        if (!node.canReplace(index + 1, node.childCount) || !after.type.validContent(rest))
            return false;
    }
    let index = $pos.indexAfter(base);
    let baseType = typesAfter && typesAfter[0];
    return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type);
}
function split(tr, pos, depth = 1, typesAfter) {
    let $pos = tr.doc.resolve(pos), before = Fragment.empty, after = Fragment.empty;
    for (let d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
        before = Fragment.from($pos.node(d).copy(before));
        let typeAfter = typesAfter && typesAfter[i];
        after = Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after) : $pos.node(d).copy(after));
    }
    tr.step(new ReplaceStep(pos, pos, new Slice(before.append(after), depth, depth), true));
}
/**
Test whether the blocks before and after a given position can be
joined.
*/
function canJoin(doc, pos) {
    let $pos = doc.resolve(pos), index = $pos.index();
    return joinable($pos.nodeBefore, $pos.nodeAfter) &&
        $pos.parent.canReplace(index, index + 1);
}
function joinable(a, b) {
    return !!(a && b && !a.isLeaf && a.canAppend(b));
}
/**
Find an ancestor of the given position that can be joined to the
block before (or after if `dir` is positive). Returns the joinable
point, if any.
*/
function joinPoint(doc, pos, dir = -1) {
    let $pos = doc.resolve(pos);
    for (let d = $pos.depth;; d--) {
        let before, after, index = $pos.index(d);
        if (d == $pos.depth) {
            before = $pos.nodeBefore;
            after = $pos.nodeAfter;
        }
        else if (dir > 0) {
            before = $pos.node(d + 1);
            index++;
            after = $pos.node(d).maybeChild(index);
        }
        else {
            before = $pos.node(d).maybeChild(index - 1);
            after = $pos.node(d + 1);
        }
        if (before && !before.isTextblock && joinable(before, after) &&
            $pos.node(d).canReplace(index, index + 1))
            return pos;
        if (d == 0)
            break;
        pos = dir < 0 ? $pos.before(d) : $pos.after(d);
    }
}
function join(tr, pos, depth) {
    let step = new ReplaceStep(pos - depth, pos + depth, Slice.empty, true);
    tr.step(step);
}
/**
Try to find a point where a node of the given type can be inserted
near `pos`, by searching up the node hierarchy when `pos` itself
isn't a valid place but is at the start or end of a node. Return
null if no position was found.
*/
function insertPoint(doc, pos, nodeType) {
    let $pos = doc.resolve(pos);
    if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType))
        return pos;
    if ($pos.parentOffset == 0)
        for (let d = $pos.depth - 1; d >= 0; d--) {
            let index = $pos.index(d);
            if ($pos.node(d).canReplaceWith(index, index, nodeType))
                return $pos.before(d + 1);
            if (index > 0)
                return null;
        }
    if ($pos.parentOffset == $pos.parent.content.size)
        for (let d = $pos.depth - 1; d >= 0; d--) {
            let index = $pos.indexAfter(d);
            if ($pos.node(d).canReplaceWith(index, index, nodeType))
                return $pos.after(d + 1);
            if (index < $pos.node(d).childCount)
                return null;
        }
    return null;
}
/**
Finds a position at or around the given position where the given
slice can be inserted. Will look at parent nodes' nearest boundary
and try there, even if the original position wasn't directly at the
start or end of that node. Returns null when no position was found.
*/
function dropPoint(doc, pos, slice) {
    let $pos = doc.resolve(pos);
    if (!slice.content.size)
        return pos;
    let content = slice.content;
    for (let i = 0; i < slice.openStart; i++)
        content = content.firstChild.content;
    for (let pass = 1; pass <= (slice.openStart == 0 && slice.size ? 2 : 1); pass++) {
        for (let d = $pos.depth; d >= 0; d--) {
            let bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1;
            let insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
            let parent = $pos.node(d), fits = false;
            if (pass == 1) {
                fits = parent.canReplace(insertPos, insertPos, content);
            }
            else {
                let wrapping = parent.contentMatchAt(insertPos).findWrapping(content.firstChild.type);
                fits = wrapping && parent.canReplaceWith(insertPos, insertPos, wrapping[0]);
            }
            if (fits)
                return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1);
        }
    }
    return null;
}

/**
‘Fit’ a slice into a given position in the document, producing a
[step](https://prosemirror.net/docs/ref/#transform.Step) that inserts it. Will return null if
there's no meaningful way to insert the slice here, or inserting it
would be a no-op (an empty slice over an empty range).
*/
function replaceStep(doc, from, to = from, slice = Slice.empty) {
    if (from == to && !slice.size)
        return null;
    let $from = doc.resolve(from), $to = doc.resolve(to);
    // Optimization -- avoid work if it's obvious that it's not needed.
    if (fitsTrivially($from, $to, slice))
        return new ReplaceStep(from, to, slice);
    return new Fitter($from, $to, slice).fit();
}
function fitsTrivially($from, $to, slice) {
    return !slice.openStart && !slice.openEnd && $from.start() == $to.start() &&
        $from.parent.canReplace($from.index(), $to.index(), slice.content);
}
// Algorithm for 'placing' the elements of a slice into a gap:
//
// We consider the content of each node that is open to the left to be
// independently placeable. I.e. in <p("foo"), p("bar")>, when the
// paragraph on the left is open, "foo" can be placed (somewhere on
// the left side of the replacement gap) independently from p("bar").
//
// This class tracks the state of the placement progress in the
// following properties:
//
//  - `frontier` holds a stack of `{type, match}` objects that
//    represent the open side of the replacement. It starts at
//    `$from`, then moves forward as content is placed, and is finally
//    reconciled with `$to`.
//
//  - `unplaced` is a slice that represents the content that hasn't
//    been placed yet.
//
//  - `placed` is a fragment of placed content. Its open-start value
//    is implicit in `$from`, and its open-end value in `frontier`.
class Fitter {
    constructor($from, $to, unplaced) {
        this.$from = $from;
        this.$to = $to;
        this.unplaced = unplaced;
        this.frontier = [];
        this.placed = Fragment.empty;
        for (let i = 0; i <= $from.depth; i++) {
            let node = $from.node(i);
            this.frontier.push({
                type: node.type,
                match: node.contentMatchAt($from.indexAfter(i))
            });
        }
        for (let i = $from.depth; i > 0; i--)
            this.placed = Fragment.from($from.node(i).copy(this.placed));
    }
    get depth() { return this.frontier.length - 1; }
    fit() {
        // As long as there's unplaced content, try to place some of it.
        // If that fails, either increase the open score of the unplaced
        // slice, or drop nodes from it, and then try again.
        while (this.unplaced.size) {
            let fit = this.findFittable();
            if (fit)
                this.placeNodes(fit);
            else
                this.openMore() || this.dropNode();
        }
        // When there's inline content directly after the frontier _and_
        // directly after `this.$to`, we must generate a `ReplaceAround`
        // step that pulls that content into the node after the frontier.
        // That means the fitting must be done to the end of the textblock
        // node after `this.$to`, not `this.$to` itself.
        let moveInline = this.mustMoveInline(), placedSize = this.placed.size - this.depth - this.$from.depth;
        let $from = this.$from, $to = this.close(moveInline < 0 ? this.$to : $from.doc.resolve(moveInline));
        if (!$to)
            return null;
        // If closing to `$to` succeeded, create a step
        let content = this.placed, openStart = $from.depth, openEnd = $to.depth;
        while (openStart && openEnd && content.childCount == 1) { // Normalize by dropping open parent nodes
            content = content.firstChild.content;
            openStart--;
            openEnd--;
        }
        let slice = new Slice(content, openStart, openEnd);
        if (moveInline > -1)
            return new ReplaceAroundStep($from.pos, moveInline, this.$to.pos, this.$to.end(), slice, placedSize);
        if (slice.size || $from.pos != this.$to.pos) // Don't generate no-op steps
            return new ReplaceStep($from.pos, $to.pos, slice);
        return null;
    }
    // Find a position on the start spine of `this.unplaced` that has
    // content that can be moved somewhere on the frontier. Returns two
    // depths, one for the slice and one for the frontier.
    findFittable() {
        let startDepth = this.unplaced.openStart;
        for (let cur = this.unplaced.content, d = 0, openEnd = this.unplaced.openEnd; d < startDepth; d++) {
            let node = cur.firstChild;
            if (cur.childCount > 1)
                openEnd = 0;
            if (node.type.spec.isolating && openEnd <= d) {
                startDepth = d;
                break;
            }
            cur = node.content;
        }
        // Only try wrapping nodes (pass 2) after finding a place without
        // wrapping failed.
        for (let pass = 1; pass <= 2; pass++) {
            for (let sliceDepth = pass == 1 ? startDepth : this.unplaced.openStart; sliceDepth >= 0; sliceDepth--) {
                let fragment, parent = null;
                if (sliceDepth) {
                    parent = contentAt(this.unplaced.content, sliceDepth - 1).firstChild;
                    fragment = parent.content;
                }
                else {
                    fragment = this.unplaced.content;
                }
                let first = fragment.firstChild;
                for (let frontierDepth = this.depth; frontierDepth >= 0; frontierDepth--) {
                    let { type, match } = this.frontier[frontierDepth], wrap, inject = null;
                    // In pass 1, if the next node matches, or there is no next
                    // node but the parents look compatible, we've found a
                    // place.
                    if (pass == 1 && (first ? match.matchType(first.type) || (inject = match.fillBefore(Fragment.from(first), false))
                        : parent && type.compatibleContent(parent.type)))
                        return { sliceDepth, frontierDepth, parent, inject };
                    // In pass 2, look for a set of wrapping nodes that make
                    // `first` fit here.
                    else if (pass == 2 && first && (wrap = match.findWrapping(first.type)))
                        return { sliceDepth, frontierDepth, parent, wrap };
                    // Don't continue looking further up if the parent node
                    // would fit here.
                    if (parent && match.matchType(parent.type))
                        break;
                }
            }
        }
    }
    openMore() {
        let { content, openStart, openEnd } = this.unplaced;
        let inner = contentAt(content, openStart);
        if (!inner.childCount || inner.firstChild.isLeaf)
            return false;
        this.unplaced = new Slice(content, openStart + 1, Math.max(openEnd, inner.size + openStart >= content.size - openEnd ? openStart + 1 : 0));
        return true;
    }
    dropNode() {
        let { content, openStart, openEnd } = this.unplaced;
        let inner = contentAt(content, openStart);
        if (inner.childCount <= 1 && openStart > 0) {
            let openAtEnd = content.size - openStart <= openStart + inner.size;
            this.unplaced = new Slice(dropFromFragment(content, openStart - 1, 1), openStart - 1, openAtEnd ? openStart - 1 : openEnd);
        }
        else {
            this.unplaced = new Slice(dropFromFragment(content, openStart, 1), openStart, openEnd);
        }
    }
    // Move content from the unplaced slice at `sliceDepth` to the
    // frontier node at `frontierDepth`. Close that frontier node when
    // applicable.
    placeNodes({ sliceDepth, frontierDepth, parent, inject, wrap }) {
        while (this.depth > frontierDepth)
            this.closeFrontierNode();
        if (wrap)
            for (let i = 0; i < wrap.length; i++)
                this.openFrontierNode(wrap[i]);
        let slice = this.unplaced, fragment = parent ? parent.content : slice.content;
        let openStart = slice.openStart - sliceDepth;
        let taken = 0, add = [];
        let { match, type } = this.frontier[frontierDepth];
        if (inject) {
            for (let i = 0; i < inject.childCount; i++)
                add.push(inject.child(i));
            match = match.matchFragment(inject);
        }
        // Computes the amount of (end) open nodes at the end of the
        // fragment. When 0, the parent is open, but no more. When
        // negative, nothing is open.
        let openEndCount = (fragment.size + sliceDepth) - (slice.content.size - slice.openEnd);
        // Scan over the fragment, fitting as many child nodes as
        // possible.
        while (taken < fragment.childCount) {
            let next = fragment.child(taken), matches = match.matchType(next.type);
            if (!matches)
                break;
            taken++;
            if (taken > 1 || openStart == 0 || next.content.size) { // Drop empty open nodes
                match = matches;
                add.push(closeNodeStart(next.mark(type.allowedMarks(next.marks)), taken == 1 ? openStart : 0, taken == fragment.childCount ? openEndCount : -1));
            }
        }
        let toEnd = taken == fragment.childCount;
        if (!toEnd)
            openEndCount = -1;
        this.placed = addToFragment(this.placed, frontierDepth, Fragment.from(add));
        this.frontier[frontierDepth].match = match;
        // If the parent types match, and the entire node was moved, and
        // it's not open, close this frontier node right away.
        if (toEnd && openEndCount < 0 && parent && parent.type == this.frontier[this.depth].type && this.frontier.length > 1)
            this.closeFrontierNode();
        // Add new frontier nodes for any open nodes at the end.
        for (let i = 0, cur = fragment; i < openEndCount; i++) {
            let node = cur.lastChild;
            this.frontier.push({ type: node.type, match: node.contentMatchAt(node.childCount) });
            cur = node.content;
        }
        // Update `this.unplaced`. Drop the entire node from which we
        // placed it we got to its end, otherwise just drop the placed
        // nodes.
        this.unplaced = !toEnd ? new Slice(dropFromFragment(slice.content, sliceDepth, taken), slice.openStart, slice.openEnd)
            : sliceDepth == 0 ? Slice.empty
                : new Slice(dropFromFragment(slice.content, sliceDepth - 1, 1), sliceDepth - 1, openEndCount < 0 ? slice.openEnd : sliceDepth - 1);
    }
    mustMoveInline() {
        if (!this.$to.parent.isTextblock)
            return -1;
        let top = this.frontier[this.depth], level;
        if (!top.type.isTextblock || !contentAfterFits(this.$to, this.$to.depth, top.type, top.match, false) ||
            (this.$to.depth == this.depth && (level = this.findCloseLevel(this.$to)) && level.depth == this.depth))
            return -1;
        let { depth } = this.$to, after = this.$to.after(depth);
        while (depth > 1 && after == this.$to.end(--depth))
            ++after;
        return after;
    }
    findCloseLevel($to) {
        scan: for (let i = Math.min(this.depth, $to.depth); i >= 0; i--) {
            let { match, type } = this.frontier[i];
            let dropInner = i < $to.depth && $to.end(i + 1) == $to.pos + ($to.depth - (i + 1));
            let fit = contentAfterFits($to, i, type, match, dropInner);
            if (!fit)
                continue;
            for (let d = i - 1; d >= 0; d--) {
                let { match, type } = this.frontier[d];
                let matches = contentAfterFits($to, d, type, match, true);
                if (!matches || matches.childCount)
                    continue scan;
            }
            return { depth: i, fit, move: dropInner ? $to.doc.resolve($to.after(i + 1)) : $to };
        }
    }
    close($to) {
        let close = this.findCloseLevel($to);
        if (!close)
            return null;
        while (this.depth > close.depth)
            this.closeFrontierNode();
        if (close.fit.childCount)
            this.placed = addToFragment(this.placed, close.depth, close.fit);
        $to = close.move;
        for (let d = close.depth + 1; d <= $to.depth; d++) {
            let node = $to.node(d), add = node.type.contentMatch.fillBefore(node.content, true, $to.index(d));
            this.openFrontierNode(node.type, node.attrs, add);
        }
        return $to;
    }
    openFrontierNode(type, attrs = null, content) {
        let top = this.frontier[this.depth];
        top.match = top.match.matchType(type);
        this.placed = addToFragment(this.placed, this.depth, Fragment.from(type.create(attrs, content)));
        this.frontier.push({ type, match: type.contentMatch });
    }
    closeFrontierNode() {
        let open = this.frontier.pop();
        let add = open.match.fillBefore(Fragment.empty, true);
        if (add.childCount)
            this.placed = addToFragment(this.placed, this.frontier.length, add);
    }
}
function dropFromFragment(fragment, depth, count) {
    if (depth == 0)
        return fragment.cutByIndex(count, fragment.childCount);
    return fragment.replaceChild(0, fragment.firstChild.copy(dropFromFragment(fragment.firstChild.content, depth - 1, count)));
}
function addToFragment(fragment, depth, content) {
    if (depth == 0)
        return fragment.append(content);
    return fragment.replaceChild(fragment.childCount - 1, fragment.lastChild.copy(addToFragment(fragment.lastChild.content, depth - 1, content)));
}
function contentAt(fragment, depth) {
    for (let i = 0; i < depth; i++)
        fragment = fragment.firstChild.content;
    return fragment;
}
function closeNodeStart(node, openStart, openEnd) {
    if (openStart <= 0)
        return node;
    let frag = node.content;
    if (openStart > 1)
        frag = frag.replaceChild(0, closeNodeStart(frag.firstChild, openStart - 1, frag.childCount == 1 ? openEnd - 1 : 0));
    if (openStart > 0) {
        frag = node.type.contentMatch.fillBefore(frag).append(frag);
        if (openEnd <= 0)
            frag = frag.append(node.type.contentMatch.matchFragment(frag).fillBefore(Fragment.empty, true));
    }
    return node.copy(frag);
}
function contentAfterFits($to, depth, type, match, open) {
    let node = $to.node(depth), index = open ? $to.indexAfter(depth) : $to.index(depth);
    if (index == node.childCount && !type.compatibleContent(node.type))
        return null;
    let fit = match.fillBefore(node.content, true, index);
    return fit && !invalidMarks(type, node.content, index) ? fit : null;
}
function invalidMarks(type, fragment, start) {
    for (let i = start; i < fragment.childCount; i++)
        if (!type.allowsMarks(fragment.child(i).marks))
            return true;
    return false;
}
function definesContent(type) {
    return type.spec.defining || type.spec.definingForContent;
}
function replaceRange(tr, from, to, slice) {
    if (!slice.size)
        return tr.deleteRange(from, to);
    let $from = tr.doc.resolve(from), $to = tr.doc.resolve(to);
    if (fitsTrivially($from, $to, slice))
        return tr.step(new ReplaceStep(from, to, slice));
    let targetDepths = coveredDepths($from, tr.doc.resolve(to));
    // Can't replace the whole document, so remove 0 if it's present
    if (targetDepths[targetDepths.length - 1] == 0)
        targetDepths.pop();
    // Negative numbers represent not expansion over the whole node at
    // that depth, but replacing from $from.before(-D) to $to.pos.
    let preferredTarget = -($from.depth + 1);
    targetDepths.unshift(preferredTarget);
    // This loop picks a preferred target depth, if one of the covering
    // depths is not outside of a defining node, and adds negative
    // depths for any depth that has $from at its start and does not
    // cross a defining node.
    for (let d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
        let spec = $from.node(d).type.spec;
        if (spec.defining || spec.definingAsContext || spec.isolating)
            break;
        if (targetDepths.indexOf(d) > -1)
            preferredTarget = d;
        else if ($from.before(d) == pos)
            targetDepths.splice(1, 0, -d);
    }
    // Try to fit each possible depth of the slice into each possible
    // target depth, starting with the preferred depths.
    let preferredTargetIndex = targetDepths.indexOf(preferredTarget);
    let leftNodes = [], preferredDepth = slice.openStart;
    for (let content = slice.content, i = 0;; i++) {
        let node = content.firstChild;
        leftNodes.push(node);
        if (i == slice.openStart)
            break;
        content = node.content;
    }
    // Back up preferredDepth to cover defining textblocks directly
    // above it, possibly skipping a non-defining textblock.
    for (let d = preferredDepth - 1; d >= 0; d--) {
        let type = leftNodes[d].type, def = definesContent(type);
        if (def && $from.node(preferredTargetIndex).type != type)
            preferredDepth = d;
        else if (def || !type.isTextblock)
            break;
    }
    for (let j = slice.openStart; j >= 0; j--) {
        let openDepth = (j + preferredDepth + 1) % (slice.openStart + 1);
        let insert = leftNodes[openDepth];
        if (!insert)
            continue;
        for (let i = 0; i < targetDepths.length; i++) {
            // Loop over possible expansion levels, starting with the
            // preferred one
            let targetDepth = targetDepths[(i + preferredTargetIndex) % targetDepths.length], expand = true;
            if (targetDepth < 0) {
                expand = false;
                targetDepth = -targetDepth;
            }
            let parent = $from.node(targetDepth - 1), index = $from.index(targetDepth - 1);
            if (parent.canReplaceWith(index, index, insert.type, insert.marks))
                return tr.replace($from.before(targetDepth), expand ? $to.after(targetDepth) : to, new Slice(closeFragment(slice.content, 0, slice.openStart, openDepth), openDepth, slice.openEnd));
        }
    }
    let startSteps = tr.steps.length;
    for (let i = targetDepths.length - 1; i >= 0; i--) {
        tr.replace(from, to, slice);
        if (tr.steps.length > startSteps)
            break;
        let depth = targetDepths[i];
        if (depth < 0)
            continue;
        from = $from.before(depth);
        to = $to.after(depth);
    }
}
function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
    if (depth < oldOpen) {
        let first = fragment.firstChild;
        fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)));
    }
    if (depth > newOpen) {
        let match = parent.contentMatchAt(0);
        let start = match.fillBefore(fragment).append(fragment);
        fragment = start.append(match.matchFragment(start).fillBefore(Fragment.empty, true));
    }
    return fragment;
}
function replaceRangeWith(tr, from, to, node) {
    if (!node.isInline && from == to && tr.doc.resolve(from).parent.content.size) {
        let point = insertPoint(tr.doc, from, node.type);
        if (point != null)
            from = to = point;
    }
    tr.replaceRange(from, to, new Slice(Fragment.from(node), 0, 0));
}
function deleteRange$1(tr, from, to) {
    let $from = tr.doc.resolve(from), $to = tr.doc.resolve(to);
    let covered = coveredDepths($from, $to);
    for (let i = 0; i < covered.length; i++) {
        let depth = covered[i], last = i == covered.length - 1;
        if ((last && depth == 0) || $from.node(depth).type.contentMatch.validEnd)
            return tr.delete($from.start(depth), $to.end(depth));
        if (depth > 0 && (last || $from.node(depth - 1).canReplace($from.index(depth - 1), $to.indexAfter(depth - 1))))
            return tr.delete($from.before(depth), $to.after(depth));
    }
    for (let d = 1; d <= $from.depth && d <= $to.depth; d++) {
        if (from - $from.start(d) == $from.depth - d && to > $from.end(d) && $to.end(d) - to != $to.depth - d)
            return tr.delete($from.before(d), to);
    }
    tr.delete(from, to);
}
// Returns an array of all depths for which $from - $to spans the
// whole content of the nodes at that depth.
function coveredDepths($from, $to) {
    let result = [], minDepth = Math.min($from.depth, $to.depth);
    for (let d = minDepth; d >= 0; d--) {
        let start = $from.start(d);
        if (start < $from.pos - ($from.depth - d) ||
            $to.end(d) > $to.pos + ($to.depth - d) ||
            $from.node(d).type.spec.isolating ||
            $to.node(d).type.spec.isolating)
            break;
        if (start == $to.start(d) ||
            (d == $from.depth && d == $to.depth && $from.parent.inlineContent && $to.parent.inlineContent &&
                d && $to.start(d - 1) == start - 1))
            result.push(d);
    }
    return result;
}

/**
Update an attribute in a specific node.
*/
class AttrStep extends Step {
    /**
    Construct an attribute step.
    */
    constructor(
    /**
    The position of the target node.
    */
    pos, 
    /**
    The attribute to set.
    */
    attr, 
    // The attribute's new value.
    value) {
        super();
        this.pos = pos;
        this.attr = attr;
        this.value = value;
    }
    apply(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node)
            return StepResult.fail("No node at attribute step's position");
        let attrs = Object.create(null);
        for (let name in node.attrs)
            attrs[name] = node.attrs[name];
        attrs[this.attr] = this.value;
        let updated = node.type.create(attrs, null, node.marks);
        return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
    }
    getMap() {
        return StepMap.empty;
    }
    invert(doc) {
        return new AttrStep(this.pos, this.attr, doc.nodeAt(this.pos).attrs[this.attr]);
    }
    map(mapping) {
        let pos = mapping.mapResult(this.pos, 1);
        return pos.deletedAfter ? null : new AttrStep(pos.pos, this.attr, this.value);
    }
    toJSON() {
        return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
    }
    static fromJSON(schema, json) {
        if (typeof json.pos != "number" || typeof json.attr != "string")
            throw new RangeError("Invalid input for AttrStep.fromJSON");
        return new AttrStep(json.pos, json.attr, json.value);
    }
}
Step.jsonID("attr", AttrStep);

/**
@internal
*/
let TransformError = class extends Error {
};
TransformError = function TransformError(message) {
    let err = Error.call(this, message);
    err.__proto__ = TransformError.prototype;
    return err;
};
TransformError.prototype = Object.create(Error.prototype);
TransformError.prototype.constructor = TransformError;
TransformError.prototype.name = "TransformError";
/**
Abstraction to build up and track an array of
[steps](https://prosemirror.net/docs/ref/#transform.Step) representing a document transformation.

Most transforming methods return the `Transform` object itself, so
that they can be chained.
*/
class Transform {
    /**
    Create a transform that starts with the given document.
    */
    constructor(
    /**
    The current document (the result of applying the steps in the
    transform).
    */
    doc) {
        this.doc = doc;
        /**
        The steps in this transform.
        */
        this.steps = [];
        /**
        The documents before each of the steps.
        */
        this.docs = [];
        /**
        A mapping with the maps for each of the steps in this transform.
        */
        this.mapping = new Mapping;
    }
    /**
    The starting document.
    */
    get before() { return this.docs.length ? this.docs[0] : this.doc; }
    /**
    Apply a new step in this transform, saving the result. Throws an
    error when the step fails.
    */
    step(step) {
        let result = this.maybeStep(step);
        if (result.failed)
            throw new TransformError(result.failed);
        return this;
    }
    /**
    Try to apply a step in this transformation, ignoring it if it
    fails. Returns the step result.
    */
    maybeStep(step) {
        let result = step.apply(this.doc);
        if (!result.failed)
            this.addStep(step, result.doc);
        return result;
    }
    /**
    True when the document has been changed (when there are any
    steps).
    */
    get docChanged() {
        return this.steps.length > 0;
    }
    /**
    @internal
    */
    addStep(step, doc) {
        this.docs.push(this.doc);
        this.steps.push(step);
        this.mapping.appendMap(step.getMap());
        this.doc = doc;
    }
    /**
    Replace the part of the document between `from` and `to` with the
    given `slice`.
    */
    replace(from, to = from, slice = Slice.empty) {
        let step = replaceStep(this.doc, from, to, slice);
        if (step)
            this.step(step);
        return this;
    }
    /**
    Replace the given range with the given content, which may be a
    fragment, node, or array of nodes.
    */
    replaceWith(from, to, content) {
        return this.replace(from, to, new Slice(Fragment.from(content), 0, 0));
    }
    /**
    Delete the content between the given positions.
    */
    delete(from, to) {
        return this.replace(from, to, Slice.empty);
    }
    /**
    Insert the given content at the given position.
    */
    insert(pos, content) {
        return this.replaceWith(pos, pos, content);
    }
    /**
    Replace a range of the document with a given slice, using
    `from`, `to`, and the slice's
    [`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
    than fixed start and end points. This method may grow the
    replaced area or close open nodes in the slice in order to get a
    fit that is more in line with WYSIWYG expectations, by dropping
    fully covered parent nodes of the replaced region when they are
    marked [non-defining as
    context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
    open parent node from the slice that _is_ marked as [defining
    its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
    
    This is the method, for example, to handle paste. The similar
    [`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
    primitive tool which will _not_ move the start and end of its given
    range, and is useful in situations where you need more precise
    control over what happens.
    */
    replaceRange(from, to, slice) {
        replaceRange(this, from, to, slice);
        return this;
    }
    /**
    Replace the given range with a node, but use `from` and `to` as
    hints, rather than precise positions. When from and to are the same
    and are at the start or end of a parent node in which the given
    node doesn't fit, this method may _move_ them out towards a parent
    that does allow the given node to be placed. When the given range
    completely covers a parent node, this method may completely replace
    that parent node.
    */
    replaceRangeWith(from, to, node) {
        replaceRangeWith(this, from, to, node);
        return this;
    }
    /**
    Delete the given range, expanding it to cover fully covered
    parent nodes until a valid replace is found.
    */
    deleteRange(from, to) {
        deleteRange$1(this, from, to);
        return this;
    }
    /**
    Split the content in the given range off from its parent, if there
    is sibling content before or after it, and move it up the tree to
    the depth specified by `target`. You'll probably want to use
    [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
    sure the lift is valid.
    */
    lift(range, target) {
        lift$2(this, range, target);
        return this;
    }
    /**
    Join the blocks around the given position. If depth is 2, their
    last and first siblings are also joined, and so on.
    */
    join(pos, depth = 1) {
        join(this, pos, depth);
        return this;
    }
    /**
    Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
    The wrappers are assumed to be valid in this position, and should
    probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
    */
    wrap(range, wrappers) {
        wrap(this, range, wrappers);
        return this;
    }
    /**
    Set the type of all textblocks (partly) between `from` and `to` to
    the given node type with the given attributes.
    */
    setBlockType(from, to = from, type, attrs = null) {
        setBlockType$1(this, from, to, type, attrs);
        return this;
    }
    /**
    Change the type, attributes, and/or marks of the node at `pos`.
    When `type` isn't given, the existing node type is preserved,
    */
    setNodeMarkup(pos, type, attrs = null, marks) {
        setNodeMarkup(this, pos, type, attrs, marks);
        return this;
    }
    /**
    Set a single attribute on a given node to a new value.
    */
    setNodeAttribute(pos, attr, value) {
        this.step(new AttrStep(pos, attr, value));
        return this;
    }
    /**
    Add a mark to the node at position `pos`.
    */
    addNodeMark(pos, mark) {
        this.step(new AddNodeMarkStep(pos, mark));
        return this;
    }
    /**
    Remove a mark (or a mark of the given type) from the node at
    position `pos`.
    */
    removeNodeMark(pos, mark) {
        if (!(mark instanceof Mark$1)) {
            let node = this.doc.nodeAt(pos);
            if (!node)
                throw new RangeError("No node at position " + pos);
            mark = mark.isInSet(node.marks);
            if (!mark)
                return this;
        }
        this.step(new RemoveNodeMarkStep(pos, mark));
        return this;
    }
    /**
    Split the node at the given position, and optionally, if `depth` is
    greater than one, any number of nodes above that. By default, the
    parts split off will inherit the node type of the original node.
    This can be changed by passing an array of types and attributes to
    use after the split.
    */
    split(pos, depth = 1, typesAfter) {
        split(this, pos, depth, typesAfter);
        return this;
    }
    /**
    Add the given mark to the inline content between `from` and `to`.
    */
    addMark(from, to, mark) {
        addMark(this, from, to, mark);
        return this;
    }
    /**
    Remove marks from inline nodes between `from` and `to`. When
    `mark` is a single mark, remove precisely that mark. When it is
    a mark type, remove all marks of that type. When it is null,
    remove all marks of any type.
    */
    removeMark(from, to, mark) {
        removeMark(this, from, to, mark);
        return this;
    }
    /**
    Removes all marks and nodes from the content of the node at
    `pos` that don't match the given new parent node type. Accepts
    an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
    third argument.
    */
    clearIncompatible(pos, parentType, match) {
        clearIncompatible(this, pos, parentType, match);
        return this;
    }
}

const classesById = Object.create(null);
/**
Superclass for editor selections. Every selection type should
extend this. Should not be instantiated directly.
*/
class Selection {
    /**
    Initialize a selection with the head and anchor and ranges. If no
    ranges are given, constructs a single range across `$anchor` and
    `$head`.
    */
    constructor(
    /**
    The resolved anchor of the selection (the side that stays in
    place when the selection is modified).
    */
    $anchor, 
    /**
    The resolved head of the selection (the side that moves when
    the selection is modified).
    */
    $head, ranges) {
        this.$anchor = $anchor;
        this.$head = $head;
        this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
    }
    /**
    The selection's anchor, as an unresolved position.
    */
    get anchor() { return this.$anchor.pos; }
    /**
    The selection's head.
    */
    get head() { return this.$head.pos; }
    /**
    The lower bound of the selection's main range.
    */
    get from() { return this.$from.pos; }
    /**
    The upper bound of the selection's main range.
    */
    get to() { return this.$to.pos; }
    /**
    The resolved lower  bound of the selection's main range.
    */
    get $from() {
        return this.ranges[0].$from;
    }
    /**
    The resolved upper bound of the selection's main range.
    */
    get $to() {
        return this.ranges[0].$to;
    }
    /**
    Indicates whether the selection contains any content.
    */
    get empty() {
        let ranges = this.ranges;
        for (let i = 0; i < ranges.length; i++)
            if (ranges[i].$from.pos != ranges[i].$to.pos)
                return false;
        return true;
    }
    /**
    Get the content of this selection as a slice.
    */
    content() {
        return this.$from.doc.slice(this.from, this.to, true);
    }
    /**
    Replace the selection with a slice or, if no slice is given,
    delete the selection. Will append to the given transaction.
    */
    replace(tr, content = Slice.empty) {
        // Put the new selection at the position after the inserted
        // content. When that ended in an inline node, search backwards,
        // to get the position after that node. If not, search forward.
        let lastNode = content.content.lastChild, lastParent = null;
        for (let i = 0; i < content.openEnd; i++) {
            lastParent = lastNode;
            lastNode = lastNode.lastChild;
        }
        let mapFrom = tr.steps.length, ranges = this.ranges;
        for (let i = 0; i < ranges.length; i++) {
            let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
            tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i ? Slice.empty : content);
            if (i == 0)
                selectionToInsertionEnd$1(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1);
        }
    }
    /**
    Replace the selection with the given node, appending the changes
    to the given transaction.
    */
    replaceWith(tr, node) {
        let mapFrom = tr.steps.length, ranges = this.ranges;
        for (let i = 0; i < ranges.length; i++) {
            let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
            let from = mapping.map($from.pos), to = mapping.map($to.pos);
            if (i) {
                tr.deleteRange(from, to);
            }
            else {
                tr.replaceRangeWith(from, to, node);
                selectionToInsertionEnd$1(tr, mapFrom, node.isInline ? -1 : 1);
            }
        }
    }
    /**
    Find a valid cursor or leaf node selection starting at the given
    position and searching back if `dir` is negative, and forward if
    positive. When `textOnly` is true, only consider cursor
    selections. Will return null when no valid selection position is
    found.
    */
    static findFrom($pos, dir, textOnly = false) {
        let inner = $pos.parent.inlineContent ? new TextSelection($pos)
            : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
        if (inner)
            return inner;
        for (let depth = $pos.depth - 1; depth >= 0; depth--) {
            let found = dir < 0
                ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly)
                : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
            if (found)
                return found;
        }
        return null;
    }
    /**
    Find a valid cursor or leaf node selection near the given
    position. Searches forward first by default, but if `bias` is
    negative, it will search backwards first.
    */
    static near($pos, bias = 1) {
        return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0));
    }
    /**
    Find the cursor or leaf node selection closest to the start of
    the given document. Will return an
    [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
    exists.
    */
    static atStart(doc) {
        return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc);
    }
    /**
    Find the cursor or leaf node selection closest to the end of the
    given document.
    */
    static atEnd(doc) {
        return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc);
    }
    /**
    Deserialize the JSON representation of a selection. Must be
    implemented for custom classes (as a static class method).
    */
    static fromJSON(doc, json) {
        if (!json || !json.type)
            throw new RangeError("Invalid input for Selection.fromJSON");
        let cls = classesById[json.type];
        if (!cls)
            throw new RangeError(`No selection type ${json.type} defined`);
        return cls.fromJSON(doc, json);
    }
    /**
    To be able to deserialize selections from JSON, custom selection
    classes must register themselves with an ID string, so that they
    can be disambiguated. Try to pick something that's unlikely to
    clash with classes from other modules.
    */
    static jsonID(id, selectionClass) {
        if (id in classesById)
            throw new RangeError("Duplicate use of selection JSON ID " + id);
        classesById[id] = selectionClass;
        selectionClass.prototype.jsonID = id;
        return selectionClass;
    }
    /**
    Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
    which is a value that can be mapped without having access to a
    current document, and later resolved to a real selection for a
    given document again. (This is used mostly by the history to
    track and restore old selections.) The default implementation of
    this method just converts the selection to a text selection and
    returns the bookmark for that.
    */
    getBookmark() {
        return TextSelection.between(this.$anchor, this.$head).getBookmark();
    }
}
Selection.prototype.visible = true;
/**
Represents a selected range in a document.
*/
class SelectionRange {
    /**
    Create a range.
    */
    constructor(
    /**
    The lower bound of the range.
    */
    $from, 
    /**
    The upper bound of the range.
    */
    $to) {
        this.$from = $from;
        this.$to = $to;
    }
}
let warnedAboutTextSelection = false;
function checkTextSelection($pos) {
    if (!warnedAboutTextSelection && !$pos.parent.inlineContent) {
        warnedAboutTextSelection = true;
        console["warn"]("TextSelection endpoint not pointing into a node with inline content (" + $pos.parent.type.name + ")");
    }
}
/**
A text selection represents a classical editor selection, with a
head (the moving side) and anchor (immobile side), both of which
point into textblock nodes. It can be empty (a regular cursor
position).
*/
class TextSelection extends Selection {
    /**
    Construct a text selection between the given points.
    */
    constructor($anchor, $head = $anchor) {
        checkTextSelection($anchor);
        checkTextSelection($head);
        super($anchor, $head);
    }
    /**
    Returns a resolved position if this is a cursor selection (an
    empty text selection), and null otherwise.
    */
    get $cursor() { return this.$anchor.pos == this.$head.pos ? this.$head : null; }
    map(doc, mapping) {
        let $head = doc.resolve(mapping.map(this.head));
        if (!$head.parent.inlineContent)
            return Selection.near($head);
        let $anchor = doc.resolve(mapping.map(this.anchor));
        return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head);
    }
    replace(tr, content = Slice.empty) {
        super.replace(tr, content);
        if (content == Slice.empty) {
            let marks = this.$from.marksAcross(this.$to);
            if (marks)
                tr.ensureMarks(marks);
        }
    }
    eq(other) {
        return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head;
    }
    getBookmark() {
        return new TextBookmark(this.anchor, this.head);
    }
    toJSON() {
        return { type: "text", anchor: this.anchor, head: this.head };
    }
    /**
    @internal
    */
    static fromJSON(doc, json) {
        if (typeof json.anchor != "number" || typeof json.head != "number")
            throw new RangeError("Invalid input for TextSelection.fromJSON");
        return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head));
    }
    /**
    Create a text selection from non-resolved positions.
    */
    static create(doc, anchor, head = anchor) {
        let $anchor = doc.resolve(anchor);
        return new this($anchor, head == anchor ? $anchor : doc.resolve(head));
    }
    /**
    Return a text selection that spans the given positions or, if
    they aren't text positions, find a text selection near them.
    `bias` determines whether the method searches forward (default)
    or backwards (negative number) first. Will fall back to calling
    [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
    doesn't contain a valid text position.
    */
    static between($anchor, $head, bias) {
        let dPos = $anchor.pos - $head.pos;
        if (!bias || dPos)
            bias = dPos >= 0 ? 1 : -1;
        if (!$head.parent.inlineContent) {
            let found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
            if (found)
                $head = found.$head;
            else
                return Selection.near($head, bias);
        }
        if (!$anchor.parent.inlineContent) {
            if (dPos == 0) {
                $anchor = $head;
            }
            else {
                $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
                if (($anchor.pos < $head.pos) != (dPos < 0))
                    $anchor = $head;
            }
        }
        return new TextSelection($anchor, $head);
    }
}
Selection.jsonID("text", TextSelection);
class TextBookmark {
    constructor(anchor, head) {
        this.anchor = anchor;
        this.head = head;
    }
    map(mapping) {
        return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head));
    }
    resolve(doc) {
        return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head));
    }
}
/**
A node selection is a selection that points at a single node. All
nodes marked [selectable](https://prosemirror.net/docs/ref/#model.NodeSpec.selectable) can be the
target of a node selection. In such a selection, `from` and `to`
point directly before and after the selected node, `anchor` equals
`from`, and `head` equals `to`..
*/
class NodeSelection extends Selection {
    /**
    Create a node selection. Does not verify the validity of its
    argument.
    */
    constructor($pos) {
        let node = $pos.nodeAfter;
        let $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
        super($pos, $end);
        this.node = node;
    }
    map(doc, mapping) {
        let { deleted, pos } = mapping.mapResult(this.anchor);
        let $pos = doc.resolve(pos);
        if (deleted)
            return Selection.near($pos);
        return new NodeSelection($pos);
    }
    content() {
        return new Slice(Fragment.from(this.node), 0, 0);
    }
    eq(other) {
        return other instanceof NodeSelection && other.anchor == this.anchor;
    }
    toJSON() {
        return { type: "node", anchor: this.anchor };
    }
    getBookmark() { return new NodeBookmark(this.anchor); }
    /**
    @internal
    */
    static fromJSON(doc, json) {
        if (typeof json.anchor != "number")
            throw new RangeError("Invalid input for NodeSelection.fromJSON");
        return new NodeSelection(doc.resolve(json.anchor));
    }
    /**
    Create a node selection from non-resolved positions.
    */
    static create(doc, from) {
        return new NodeSelection(doc.resolve(from));
    }
    /**
    Determines whether the given node may be selected as a node
    selection.
    */
    static isSelectable(node) {
        return !node.isText && node.type.spec.selectable !== false;
    }
}
NodeSelection.prototype.visible = false;
Selection.jsonID("node", NodeSelection);
class NodeBookmark {
    constructor(anchor) {
        this.anchor = anchor;
    }
    map(mapping) {
        let { deleted, pos } = mapping.mapResult(this.anchor);
        return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos);
    }
    resolve(doc) {
        let $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
        if (node && NodeSelection.isSelectable(node))
            return new NodeSelection($pos);
        return Selection.near($pos);
    }
}
/**
A selection type that represents selecting the whole document
(which can not necessarily be expressed with a text selection, when
there are for example leaf block nodes at the start or end of the
document).
*/
class AllSelection extends Selection {
    /**
    Create an all-selection over the given document.
    */
    constructor(doc) {
        super(doc.resolve(0), doc.resolve(doc.content.size));
    }
    replace(tr, content = Slice.empty) {
        if (content == Slice.empty) {
            tr.delete(0, tr.doc.content.size);
            let sel = Selection.atStart(tr.doc);
            if (!sel.eq(tr.selection))
                tr.setSelection(sel);
        }
        else {
            super.replace(tr, content);
        }
    }
    toJSON() { return { type: "all" }; }
    /**
    @internal
    */
    static fromJSON(doc) { return new AllSelection(doc); }
    map(doc) { return new AllSelection(doc); }
    eq(other) { return other instanceof AllSelection; }
    getBookmark() { return AllBookmark; }
}
Selection.jsonID("all", AllSelection);
const AllBookmark = {
    map() { return this; },
    resolve(doc) { return new AllSelection(doc); }
};
// FIXME we'll need some awareness of text direction when scanning for selections
// Try to find a selection inside the given node. `pos` points at the
// position where the search starts. When `text` is true, only return
// text selections.
function findSelectionIn(doc, node, pos, index, dir, text = false) {
    if (node.inlineContent)
        return TextSelection.create(doc, pos);
    for (let i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
        let child = node.child(i);
        if (!child.isAtom) {
            let inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text);
            if (inner)
                return inner;
        }
        else if (!text && NodeSelection.isSelectable(child)) {
            return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0));
        }
        pos += child.nodeSize * dir;
    }
    return null;
}
function selectionToInsertionEnd$1(tr, startLen, bias) {
    let last = tr.steps.length - 1;
    if (last < startLen)
        return;
    let step = tr.steps[last];
    if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep))
        return;
    let map = tr.mapping.maps[last], end;
    map.forEach((_from, _to, _newFrom, newTo) => { if (end == null)
        end = newTo; });
    tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}

const UPDATED_SEL = 1, UPDATED_MARKS = 2, UPDATED_SCROLL = 4;
/**
An editor state transaction, which can be applied to a state to
create an updated state. Use
[`EditorState.tr`](https://prosemirror.net/docs/ref/#state.EditorState.tr) to create an instance.

Transactions track changes to the document (they are a subclass of
[`Transform`](https://prosemirror.net/docs/ref/#transform.Transform)), but also other state changes,
like selection updates and adjustments of the set of [stored
marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks). In addition, you can store
metadata properties in a transaction, which are extra pieces of
information that client code or plugins can use to describe what a
transaction represents, so that they can update their [own
state](https://prosemirror.net/docs/ref/#state.StateField) accordingly.

The [editor view](https://prosemirror.net/docs/ref/#view.EditorView) uses a few metadata properties:
it will attach a property `"pointer"` with the value `true` to
selection transactions directly caused by mouse or touch input, and
a `"uiEvent"` property of that may be `"paste"`, `"cut"`, or `"drop"`.
*/
class Transaction extends Transform {
    /**
    @internal
    */
    constructor(state) {
        super(state.doc);
        // The step count for which the current selection is valid.
        this.curSelectionFor = 0;
        // Bitfield to track which aspects of the state were updated by
        // this transaction.
        this.updated = 0;
        // Object used to store metadata properties for the transaction.
        this.meta = Object.create(null);
        this.time = Date.now();
        this.curSelection = state.selection;
        this.storedMarks = state.storedMarks;
    }
    /**
    The transaction's current selection. This defaults to the editor
    selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
    transaction, but can be overwritten with
    [`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
    */
    get selection() {
        if (this.curSelectionFor < this.steps.length) {
            this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
            this.curSelectionFor = this.steps.length;
        }
        return this.curSelection;
    }
    /**
    Update the transaction's current selection. Will determine the
    selection that the editor gets when the transaction is applied.
    */
    setSelection(selection) {
        if (selection.$from.doc != this.doc)
            throw new RangeError("Selection passed to setSelection must point at the current document");
        this.curSelection = selection;
        this.curSelectionFor = this.steps.length;
        this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
        this.storedMarks = null;
        return this;
    }
    /**
    Whether the selection was explicitly updated by this transaction.
    */
    get selectionSet() {
        return (this.updated & UPDATED_SEL) > 0;
    }
    /**
    Set the current stored marks.
    */
    setStoredMarks(marks) {
        this.storedMarks = marks;
        this.updated |= UPDATED_MARKS;
        return this;
    }
    /**
    Make sure the current stored marks or, if that is null, the marks
    at the selection, match the given set of marks. Does nothing if
    this is already the case.
    */
    ensureMarks(marks) {
        if (!Mark$1.sameSet(this.storedMarks || this.selection.$from.marks(), marks))
            this.setStoredMarks(marks);
        return this;
    }
    /**
    Add a mark to the set of stored marks.
    */
    addStoredMark(mark) {
        return this.ensureMarks(mark.addToSet(this.storedMarks || this.selection.$head.marks()));
    }
    /**
    Remove a mark or mark type from the set of stored marks.
    */
    removeStoredMark(mark) {
        return this.ensureMarks(mark.removeFromSet(this.storedMarks || this.selection.$head.marks()));
    }
    /**
    Whether the stored marks were explicitly set for this transaction.
    */
    get storedMarksSet() {
        return (this.updated & UPDATED_MARKS) > 0;
    }
    /**
    @internal
    */
    addStep(step, doc) {
        super.addStep(step, doc);
        this.updated = this.updated & ~UPDATED_MARKS;
        this.storedMarks = null;
    }
    /**
    Update the timestamp for the transaction.
    */
    setTime(time) {
        this.time = time;
        return this;
    }
    /**
    Replace the current selection with the given slice.
    */
    replaceSelection(slice) {
        this.selection.replace(this, slice);
        return this;
    }
    /**
    Replace the selection with the given node. When `inheritMarks` is
    true and the content is inline, it inherits the marks from the
    place where it is inserted.
    */
    replaceSelectionWith(node, inheritMarks = true) {
        let selection = this.selection;
        if (inheritMarks)
            node = node.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : (selection.$from.marksAcross(selection.$to) || Mark$1.none)));
        selection.replaceWith(this, node);
        return this;
    }
    /**
    Delete the selection.
    */
    deleteSelection() {
        this.selection.replace(this);
        return this;
    }
    /**
    Replace the given range, or the selection if no range is given,
    with a text node containing the given string.
    */
    insertText(text, from, to) {
        let schema = this.doc.type.schema;
        if (from == null) {
            if (!text)
                return this.deleteSelection();
            return this.replaceSelectionWith(schema.text(text), true);
        }
        else {
            if (to == null)
                to = from;
            to = to == null ? from : to;
            if (!text)
                return this.deleteRange(from, to);
            let marks = this.storedMarks;
            if (!marks) {
                let $from = this.doc.resolve(from);
                marks = to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
            }
            this.replaceRangeWith(from, to, schema.text(text, marks));
            if (!this.selection.empty)
                this.setSelection(Selection.near(this.selection.$to));
            return this;
        }
    }
    /**
    Store a metadata property in this transaction, keyed either by
    name or by plugin.
    */
    setMeta(key, value) {
        this.meta[typeof key == "string" ? key : key.key] = value;
        return this;
    }
    /**
    Retrieve a metadata property for a given name or plugin.
    */
    getMeta(key) {
        return this.meta[typeof key == "string" ? key : key.key];
    }
    /**
    Returns true if this transaction doesn't contain any metadata,
    and can thus safely be extended.
    */
    get isGeneric() {
        for (let _ in this.meta)
            return false;
        return true;
    }
    /**
    Indicate that the editor should scroll the selection into view
    when updated to the state produced by this transaction.
    */
    scrollIntoView() {
        this.updated |= UPDATED_SCROLL;
        return this;
    }
    /**
    True when this transaction has had `scrollIntoView` called on it.
    */
    get scrolledIntoView() {
        return (this.updated & UPDATED_SCROLL) > 0;
    }
}

function bind(f, self) {
    return !self || !f ? f : f.bind(self);
}
class FieldDesc {
    constructor(name, desc, self) {
        this.name = name;
        this.init = bind(desc.init, self);
        this.apply = bind(desc.apply, self);
    }
}
const baseFields = [
    new FieldDesc("doc", {
        init(config) { return config.doc || config.schema.topNodeType.createAndFill(); },
        apply(tr) { return tr.doc; }
    }),
    new FieldDesc("selection", {
        init(config, instance) { return config.selection || Selection.atStart(instance.doc); },
        apply(tr) { return tr.selection; }
    }),
    new FieldDesc("storedMarks", {
        init(config) { return config.storedMarks || null; },
        apply(tr, _marks, _old, state) { return state.selection.$cursor ? tr.storedMarks : null; }
    }),
    new FieldDesc("scrollToSelection", {
        init() { return 0; },
        apply(tr, prev) { return tr.scrolledIntoView ? prev + 1 : prev; }
    })
];
// Object wrapping the part of a state object that stays the same
// across transactions. Stored in the state's `config` property.
class Configuration {
    constructor(schema, plugins) {
        this.schema = schema;
        this.plugins = [];
        this.pluginsByKey = Object.create(null);
        this.fields = baseFields.slice();
        if (plugins)
            plugins.forEach(plugin => {
                if (this.pluginsByKey[plugin.key])
                    throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")");
                this.plugins.push(plugin);
                this.pluginsByKey[plugin.key] = plugin;
                if (plugin.spec.state)
                    this.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin));
            });
    }
}
/**
The state of a ProseMirror editor is represented by an object of
this type. A state is a persistent data structure—it isn't
updated, but rather a new state value is computed from an old one
using the [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) method.

A state holds a number of built-in fields, and plugins can
[define](https://prosemirror.net/docs/ref/#state.PluginSpec.state) additional fields.
*/
class EditorState {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    config) {
        this.config = config;
    }
    /**
    The schema of the state's document.
    */
    get schema() {
        return this.config.schema;
    }
    /**
    The plugins that are active in this state.
    */
    get plugins() {
        return this.config.plugins;
    }
    /**
    Apply the given transaction to produce a new state.
    */
    apply(tr) {
        return this.applyTransaction(tr).state;
    }
    /**
    @internal
    */
    filterTransaction(tr, ignore = -1) {
        for (let i = 0; i < this.config.plugins.length; i++)
            if (i != ignore) {
                let plugin = this.config.plugins[i];
                if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this))
                    return false;
            }
        return true;
    }
    /**
    Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
    returns the precise transactions that were applied (which might
    be influenced by the [transaction
    hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
    plugins) along with the new state.
    */
    applyTransaction(rootTr) {
        if (!this.filterTransaction(rootTr))
            return { state: this, transactions: [] };
        let trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
        // This loop repeatedly gives plugins a chance to respond to
        // transactions as new transactions are added, making sure to only
        // pass the transactions the plugin did not see before.
        for (;;) {
            let haveNew = false;
            for (let i = 0; i < this.config.plugins.length; i++) {
                let plugin = this.config.plugins[i];
                if (plugin.spec.appendTransaction) {
                    let n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this;
                    let tr = n < trs.length &&
                        plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
                    if (tr && newState.filterTransaction(tr, i)) {
                        tr.setMeta("appendedTransaction", rootTr);
                        if (!seen) {
                            seen = [];
                            for (let j = 0; j < this.config.plugins.length; j++)
                                seen.push(j < i ? { state: newState, n: trs.length } : { state: this, n: 0 });
                        }
                        trs.push(tr);
                        newState = newState.applyInner(tr);
                        haveNew = true;
                    }
                    if (seen)
                        seen[i] = { state: newState, n: trs.length };
                }
            }
            if (!haveNew)
                return { state: newState, transactions: trs };
        }
    }
    /**
    @internal
    */
    applyInner(tr) {
        if (!tr.before.eq(this.doc))
            throw new RangeError("Applying a mismatched transaction");
        let newInstance = new EditorState(this.config), fields = this.config.fields;
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            newInstance[field.name] = field.apply(tr, this[field.name], this, newInstance);
        }
        return newInstance;
    }
    /**
    Start a [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
    */
    get tr() { return new Transaction(this); }
    /**
    Create a new state.
    */
    static create(config) {
        let $config = new Configuration(config.doc ? config.doc.type.schema : config.schema, config.plugins);
        let instance = new EditorState($config);
        for (let i = 0; i < $config.fields.length; i++)
            instance[$config.fields[i].name] = $config.fields[i].init(config, instance);
        return instance;
    }
    /**
    Create a new state based on this one, but with an adjusted set
    of active plugins. State fields that exist in both sets of
    plugins are kept unchanged. Those that no longer exist are
    dropped, and those that are new are initialized using their
    [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
    configuration object..
    */
    reconfigure(config) {
        let $config = new Configuration(this.schema, config.plugins);
        let fields = $config.fields, instance = new EditorState($config);
        for (let i = 0; i < fields.length; i++) {
            let name = fields[i].name;
            instance[name] = this.hasOwnProperty(name) ? this[name] : fields[i].init(config, instance);
        }
        return instance;
    }
    /**
    Serialize this state to JSON. If you want to serialize the state
    of plugins, pass an object mapping property names to use in the
    resulting JSON object to plugin objects. The argument may also be
    a string or number, in which case it is ignored, to support the
    way `JSON.stringify` calls `toString` methods.
    */
    toJSON(pluginFields) {
        let result = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
        if (this.storedMarks)
            result.storedMarks = this.storedMarks.map(m => m.toJSON());
        if (pluginFields && typeof pluginFields == 'object')
            for (let prop in pluginFields) {
                if (prop == "doc" || prop == "selection")
                    throw new RangeError("The JSON fields `doc` and `selection` are reserved");
                let plugin = pluginFields[prop], state = plugin.spec.state;
                if (state && state.toJSON)
                    result[prop] = state.toJSON.call(plugin, this[plugin.key]);
            }
        return result;
    }
    /**
    Deserialize a JSON representation of a state. `config` should
    have at least a `schema` field, and should contain array of
    plugins to initialize the state with. `pluginFields` can be used
    to deserialize the state of plugins, by associating plugin
    instances with the property names they use in the JSON object.
    */
    static fromJSON(config, json, pluginFields) {
        if (!json)
            throw new RangeError("Invalid input for EditorState.fromJSON");
        if (!config.schema)
            throw new RangeError("Required config field 'schema' missing");
        let $config = new Configuration(config.schema, config.plugins);
        let instance = new EditorState($config);
        $config.fields.forEach(field => {
            if (field.name == "doc") {
                instance.doc = Node$1.fromJSON(config.schema, json.doc);
            }
            else if (field.name == "selection") {
                instance.selection = Selection.fromJSON(instance.doc, json.selection);
            }
            else if (field.name == "storedMarks") {
                if (json.storedMarks)
                    instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON);
            }
            else {
                if (pluginFields)
                    for (let prop in pluginFields) {
                        let plugin = pluginFields[prop], state = plugin.spec.state;
                        if (plugin.key == field.name && state && state.fromJSON &&
                            Object.prototype.hasOwnProperty.call(json, prop)) {
                            instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance);
                            return;
                        }
                    }
                instance[field.name] = field.init(config, instance);
            }
        });
        return instance;
    }
}

function bindProps(obj, self, target) {
    for (let prop in obj) {
        let val = obj[prop];
        if (val instanceof Function)
            val = val.bind(self);
        else if (prop == "handleDOMEvents")
            val = bindProps(val, self, {});
        target[prop] = val;
    }
    return target;
}
/**
Plugins bundle functionality that can be added to an editor.
They are part of the [editor state](https://prosemirror.net/docs/ref/#state.EditorState) and
may influence that state and the view that contains it.
*/
class Plugin {
    /**
    Create a plugin.
    */
    constructor(
    /**
    The plugin's [spec object](https://prosemirror.net/docs/ref/#state.PluginSpec).
    */
    spec) {
        this.spec = spec;
        /**
        The [props](https://prosemirror.net/docs/ref/#view.EditorProps) exported by this plugin.
        */
        this.props = {};
        if (spec.props)
            bindProps(spec.props, this, this.props);
        this.key = spec.key ? spec.key.key : createKey("plugin");
    }
    /**
    Extract the plugin's state field from an editor state.
    */
    getState(state) { return state[this.key]; }
}
const keys = Object.create(null);
function createKey(name) {
    if (name in keys)
        return name + "$" + ++keys[name];
    keys[name] = 0;
    return name + "$";
}
/**
A key is used to [tag](https://prosemirror.net/docs/ref/#state.PluginSpec.key) plugins in a way
that makes it possible to find them, given an editor state.
Assigning a key does mean only one plugin of that type can be
active in a state.
*/
class PluginKey {
    /**
    Create a plugin key.
    */
    constructor(name = "key") { this.key = createKey(name); }
    /**
    Get the active plugin with this key, if any, from an editor
    state.
    */
    get(state) { return state.config.pluginsByKey[this.key]; }
    /**
    Get the plugin's state from an editor state.
    */
    getState(state) { return state[this.key]; }
}

const domIndex = function (node) {
    for (var index = 0;; index++) {
        node = node.previousSibling;
        if (!node)
            return index;
    }
};
const parentNode = function (node) {
    let parent = node.assignedSlot || node.parentNode;
    return parent && parent.nodeType == 11 ? parent.host : parent;
};
let reusedRange = null;
// Note that this will always return the same range, because DOM range
// objects are every expensive, and keep slowing down subsequent DOM
// updates, for some reason.
const textRange = function (node, from, to) {
    let range = reusedRange || (reusedRange = document.createRange());
    range.setEnd(node, to == null ? node.nodeValue.length : to);
    range.setStart(node, from || 0);
    return range;
};
// Scans forward and backward through DOM positions equivalent to the
// given one to see if the two are in the same place (i.e. after a
// text node vs at the end of that text node)
const isEquivalentPosition = function (node, off, targetNode, targetOff) {
    return targetNode && (scanFor(node, off, targetNode, targetOff, -1) ||
        scanFor(node, off, targetNode, targetOff, 1));
};
const atomElements = /^(img|br|input|textarea|hr)$/i;
function scanFor(node, off, targetNode, targetOff, dir) {
    for (;;) {
        if (node == targetNode && off == targetOff)
            return true;
        if (off == (dir < 0 ? 0 : nodeSize(node))) {
            let parent = node.parentNode;
            if (!parent || parent.nodeType != 1 || hasBlockDesc(node) || atomElements.test(node.nodeName) ||
                node.contentEditable == "false")
                return false;
            off = domIndex(node) + (dir < 0 ? 0 : 1);
            node = parent;
        }
        else if (node.nodeType == 1) {
            node = node.childNodes[off + (dir < 0 ? -1 : 0)];
            if (node.contentEditable == "false")
                return false;
            off = dir < 0 ? nodeSize(node) : 0;
        }
        else {
            return false;
        }
    }
}
function nodeSize(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
function isOnEdge(node, offset, parent) {
    for (let atStart = offset == 0, atEnd = offset == nodeSize(node); atStart || atEnd;) {
        if (node == parent)
            return true;
        let index = domIndex(node);
        node = node.parentNode;
        if (!node)
            return false;
        atStart = atStart && index == 0;
        atEnd = atEnd && index == nodeSize(node);
    }
}
function hasBlockDesc(dom) {
    let desc;
    for (let cur = dom; cur; cur = cur.parentNode)
        if (desc = cur.pmViewDesc)
            break;
    return desc && desc.node && desc.node.isBlock && (desc.dom == dom || desc.contentDOM == dom);
}
// Work around Chrome issue https://bugs.chromium.org/p/chromium/issues/detail?id=447523
// (isCollapsed inappropriately returns true in shadow dom)
const selectionCollapsed = function (domSel) {
    return domSel.focusNode && isEquivalentPosition(domSel.focusNode, domSel.focusOffset, domSel.anchorNode, domSel.anchorOffset);
};
function keyEvent(keyCode, key) {
    let event = document.createEvent("Event");
    event.initEvent("keydown", true, true);
    event.keyCode = keyCode;
    event.key = event.code = key;
    return event;
}
function deepActiveElement(doc) {
    let elt = doc.activeElement;
    while (elt && elt.shadowRoot)
        elt = elt.shadowRoot.activeElement;
    return elt;
}

const nav = typeof navigator != "undefined" ? navigator : null;
const doc = typeof document != "undefined" ? document : null;
const agent = (nav && nav.userAgent) || "";
const ie_edge = /Edge\/(\d+)/.exec(agent);
const ie_upto10 = /MSIE \d/.exec(agent);
const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent);
const ie$1 = !!(ie_upto10 || ie_11up || ie_edge);
const ie_version = ie_upto10 ? document.documentMode : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0;
const gecko = !ie$1 && /gecko\/(\d+)/i.test(agent);
gecko && +(/Firefox\/(\d+)/.exec(agent) || [0, 0])[1];
const _chrome = !ie$1 && /Chrome\/(\d+)/.exec(agent);
const chrome$1 = !!_chrome;
const chrome_version = _chrome ? +_chrome[1] : 0;
const safari = !ie$1 && !!nav && /Apple Computer/.test(nav.vendor);
// Is true for both iOS and iPadOS for convenience
const ios = safari && (/Mobile\/\w+/.test(agent) || !!nav && nav.maxTouchPoints > 2);
const mac$2 = ios || (nav ? /Mac/.test(nav.platform) : false);
const android = /Android \d/.test(agent);
const webkit = !!doc && "webkitFontSmoothing" in doc.documentElement.style;
const webkit_version = webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;

function windowRect(doc) {
    return { left: 0, right: doc.documentElement.clientWidth,
        top: 0, bottom: doc.documentElement.clientHeight };
}
function getSide(value, side) {
    return typeof value == "number" ? value : value[side];
}
function clientRect(node) {
    let rect = node.getBoundingClientRect();
    // Adjust for elements with style "transform: scale()"
    let scaleX = (rect.width / node.offsetWidth) || 1;
    let scaleY = (rect.height / node.offsetHeight) || 1;
    // Make sure scrollbar width isn't included in the rectangle
    return { left: rect.left, right: rect.left + node.clientWidth * scaleX,
        top: rect.top, bottom: rect.top + node.clientHeight * scaleY };
}
function scrollRectIntoView(view, rect, startDOM) {
    let scrollThreshold = view.someProp("scrollThreshold") || 0, scrollMargin = view.someProp("scrollMargin") || 5;
    let doc = view.dom.ownerDocument;
    for (let parent = startDOM || view.dom;; parent = parentNode(parent)) {
        if (!parent)
            break;
        if (parent.nodeType != 1)
            continue;
        let elt = parent;
        let atTop = elt == doc.body;
        let bounding = atTop ? windowRect(doc) : clientRect(elt);
        let moveX = 0, moveY = 0;
        if (rect.top < bounding.top + getSide(scrollThreshold, "top"))
            moveY = -(bounding.top - rect.top + getSide(scrollMargin, "top"));
        else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom"))
            moveY = rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom");
        if (rect.left < bounding.left + getSide(scrollThreshold, "left"))
            moveX = -(bounding.left - rect.left + getSide(scrollMargin, "left"));
        else if (rect.right > bounding.right - getSide(scrollThreshold, "right"))
            moveX = rect.right - bounding.right + getSide(scrollMargin, "right");
        if (moveX || moveY) {
            if (atTop) {
                doc.defaultView.scrollBy(moveX, moveY);
            }
            else {
                let startX = elt.scrollLeft, startY = elt.scrollTop;
                if (moveY)
                    elt.scrollTop += moveY;
                if (moveX)
                    elt.scrollLeft += moveX;
                let dX = elt.scrollLeft - startX, dY = elt.scrollTop - startY;
                rect = { left: rect.left - dX, top: rect.top - dY, right: rect.right - dX, bottom: rect.bottom - dY };
            }
        }
        if (atTop)
            break;
    }
}
// Store the scroll position of the editor's parent nodes, along with
// the top position of an element near the top of the editor, which
// will be used to make sure the visible viewport remains stable even
// when the size of the content above changes.
function storeScrollPos(view) {
    let rect = view.dom.getBoundingClientRect(), startY = Math.max(0, rect.top);
    let refDOM, refTop;
    for (let x = (rect.left + rect.right) / 2, y = startY + 1; y < Math.min(innerHeight, rect.bottom); y += 5) {
        let dom = view.root.elementFromPoint(x, y);
        if (!dom || dom == view.dom || !view.dom.contains(dom))
            continue;
        let localRect = dom.getBoundingClientRect();
        if (localRect.top >= startY - 20) {
            refDOM = dom;
            refTop = localRect.top;
            break;
        }
    }
    return { refDOM: refDOM, refTop: refTop, stack: scrollStack(view.dom) };
}
function scrollStack(dom) {
    let stack = [], doc = dom.ownerDocument;
    for (let cur = dom; cur; cur = parentNode(cur)) {
        stack.push({ dom: cur, top: cur.scrollTop, left: cur.scrollLeft });
        if (dom == doc)
            break;
    }
    return stack;
}
// Reset the scroll position of the editor's parent nodes to that what
// it was before, when storeScrollPos was called.
function resetScrollPos({ refDOM, refTop, stack }) {
    let newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
    restoreScrollStack(stack, newRefTop == 0 ? 0 : newRefTop - refTop);
}
function restoreScrollStack(stack, dTop) {
    for (let i = 0; i < stack.length; i++) {
        let { dom, top, left } = stack[i];
        if (dom.scrollTop != top + dTop)
            dom.scrollTop = top + dTop;
        if (dom.scrollLeft != left)
            dom.scrollLeft = left;
    }
}
let preventScrollSupported = null;
// Feature-detects support for .focus({preventScroll: true}), and uses
// a fallback kludge when not supported.
function focusPreventScroll(dom) {
    if (dom.setActive)
        return dom.setActive(); // in IE
    if (preventScrollSupported)
        return dom.focus(preventScrollSupported);
    let stored = scrollStack(dom);
    dom.focus(preventScrollSupported == null ? {
        get preventScroll() {
            preventScrollSupported = { preventScroll: true };
            return true;
        }
    } : undefined);
    if (!preventScrollSupported) {
        preventScrollSupported = false;
        restoreScrollStack(stored, 0);
    }
}
function findOffsetInNode(node, coords) {
    let closest, dxClosest = 2e8, coordsClosest, offset = 0;
    let rowBot = coords.top, rowTop = coords.top;
    for (let child = node.firstChild, childIndex = 0; child; child = child.nextSibling, childIndex++) {
        let rects;
        if (child.nodeType == 1)
            rects = child.getClientRects();
        else if (child.nodeType == 3)
            rects = textRange(child).getClientRects();
        else
            continue;
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (rect.top <= rowBot && rect.bottom >= rowTop) {
                rowBot = Math.max(rect.bottom, rowBot);
                rowTop = Math.min(rect.top, rowTop);
                let dx = rect.left > coords.left ? rect.left - coords.left
                    : rect.right < coords.left ? coords.left - rect.right : 0;
                if (dx < dxClosest) {
                    closest = child;
                    dxClosest = dx;
                    coordsClosest = dx && closest.nodeType == 3 ? {
                        left: rect.right < coords.left ? rect.right : rect.left,
                        top: coords.top
                    } : coords;
                    if (child.nodeType == 1 && dx)
                        offset = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
                    continue;
                }
            }
            if (!closest && (coords.left >= rect.right && coords.top >= rect.top ||
                coords.left >= rect.left && coords.top >= rect.bottom))
                offset = childIndex + 1;
        }
    }
    if (closest && closest.nodeType == 3)
        return findOffsetInText(closest, coordsClosest);
    if (!closest || (dxClosest && closest.nodeType == 1))
        return { node, offset };
    return findOffsetInNode(closest, coordsClosest);
}
function findOffsetInText(node, coords) {
    let len = node.nodeValue.length;
    let range = document.createRange();
    for (let i = 0; i < len; i++) {
        range.setEnd(node, i + 1);
        range.setStart(node, i);
        let rect = singleRect(range, 1);
        if (rect.top == rect.bottom)
            continue;
        if (inRect(coords, rect))
            return { node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0) };
    }
    return { node, offset: 0 };
}
function inRect(coords, rect) {
    return coords.left >= rect.left - 1 && coords.left <= rect.right + 1 &&
        coords.top >= rect.top - 1 && coords.top <= rect.bottom + 1;
}
function targetKludge(dom, coords) {
    let parent = dom.parentNode;
    if (parent && /^li$/i.test(parent.nodeName) && coords.left < dom.getBoundingClientRect().left)
        return parent;
    return dom;
}
function posFromElement(view, elt, coords) {
    let { node, offset } = findOffsetInNode(elt, coords), bias = -1;
    if (node.nodeType == 1 && !node.firstChild) {
        let rect = node.getBoundingClientRect();
        bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1;
    }
    return view.docView.posFromDOM(node, offset, bias);
}
function posFromCaret(view, node, offset, coords) {
    // Browser (in caretPosition/RangeFromPoint) will agressively
    // normalize towards nearby inline nodes. Since we are interested in
    // positions between block nodes too, we first walk up the hierarchy
    // of nodes to see if there are block nodes that the coordinates
    // fall outside of. If so, we take the position before/after that
    // block. If not, we call `posFromDOM` on the raw node/offset.
    let outsideBlock = -1;
    for (let cur = node, sawBlock = false;;) {
        if (cur == view.dom)
            break;
        let desc = view.docView.nearestDesc(cur, true);
        if (!desc)
            return null;
        if (desc.dom.nodeType == 1 && (desc.node.isBlock && desc.parent && !sawBlock || !desc.contentDOM)) {
            let rect = desc.dom.getBoundingClientRect();
            if (desc.node.isBlock && desc.parent && !sawBlock) {
                sawBlock = true;
                if (rect.left > coords.left || rect.top > coords.top)
                    outsideBlock = desc.posBefore;
                else if (rect.right < coords.left || rect.bottom < coords.top)
                    outsideBlock = desc.posAfter;
            }
            if (!desc.contentDOM && outsideBlock < 0) {
                // If we are inside a leaf, return the side of the leaf closer to the coords
                let before = desc.node.isBlock ? coords.top < (rect.top + rect.bottom) / 2
                    : coords.left < (rect.left + rect.right) / 2;
                return before ? desc.posBefore : desc.posAfter;
            }
        }
        cur = desc.dom.parentNode;
    }
    return outsideBlock > -1 ? outsideBlock : view.docView.posFromDOM(node, offset, -1);
}
function elementFromPoint(element, coords, box) {
    let len = element.childNodes.length;
    if (len && box.top < box.bottom) {
        for (let startI = Math.max(0, Math.min(len - 1, Math.floor(len * (coords.top - box.top) / (box.bottom - box.top)) - 2)), i = startI;;) {
            let child = element.childNodes[i];
            if (child.nodeType == 1) {
                let rects = child.getClientRects();
                for (let j = 0; j < rects.length; j++) {
                    let rect = rects[j];
                    if (inRect(coords, rect))
                        return elementFromPoint(child, coords, rect);
                }
            }
            if ((i = (i + 1) % len) == startI)
                break;
        }
    }
    return element;
}
// Given an x,y position on the editor, get the position in the document.
function posAtCoords(view, coords) {
    let doc = view.dom.ownerDocument, node, offset = 0;
    if (doc.caretPositionFromPoint) {
        try { // Firefox throws for this call in hard-to-predict circumstances (#994)
            let pos = doc.caretPositionFromPoint(coords.left, coords.top);
            if (pos)
                ({ offsetNode: node, offset } = pos);
        }
        catch (_) { }
    }
    if (!node && doc.caretRangeFromPoint) {
        let range = doc.caretRangeFromPoint(coords.left, coords.top);
        if (range)
            ({ startContainer: node, startOffset: offset } = range);
    }
    let elt = (view.root.elementFromPoint ? view.root : doc)
        .elementFromPoint(coords.left, coords.top);
    let pos;
    if (!elt || !view.dom.contains(elt.nodeType != 1 ? elt.parentNode : elt)) {
        let box = view.dom.getBoundingClientRect();
        if (!inRect(coords, box))
            return null;
        elt = elementFromPoint(view.dom, coords, box);
        if (!elt)
            return null;
    }
    // Safari's caretRangeFromPoint returns nonsense when on a draggable element
    if (safari) {
        for (let p = elt; node && p; p = parentNode(p))
            if (p.draggable)
                node = undefined;
    }
    elt = targetKludge(elt, coords);
    if (node) {
        if (gecko && node.nodeType == 1) {
            // Firefox will sometimes return offsets into <input> nodes, which
            // have no actual children, from caretPositionFromPoint (#953)
            offset = Math.min(offset, node.childNodes.length);
            // It'll also move the returned position before image nodes,
            // even if those are behind it.
            if (offset < node.childNodes.length) {
                let next = node.childNodes[offset], box;
                if (next.nodeName == "IMG" && (box = next.getBoundingClientRect()).right <= coords.left &&
                    box.bottom > coords.top)
                    offset++;
            }
        }
        // Suspiciously specific kludge to work around caret*FromPoint
        // never returning a position at the end of the document
        if (node == view.dom && offset == node.childNodes.length - 1 && node.lastChild.nodeType == 1 &&
            coords.top > node.lastChild.getBoundingClientRect().bottom)
            pos = view.state.doc.content.size;
        // Ignore positions directly after a BR, since caret*FromPoint
        // 'round up' positions that would be more accurately placed
        // before the BR node.
        else if (offset == 0 || node.nodeType != 1 || node.childNodes[offset - 1].nodeName != "BR")
            pos = posFromCaret(view, node, offset, coords);
    }
    if (pos == null)
        pos = posFromElement(view, elt, coords);
    let desc = view.docView.nearestDesc(elt, true);
    return { pos, inside: desc ? desc.posAtStart - desc.border : -1 };
}
function singleRect(target, bias) {
    let rects = target.getClientRects();
    return !rects.length ? target.getBoundingClientRect() : rects[bias < 0 ? 0 : rects.length - 1];
}
const BIDI = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
// Given a position in the document model, get a bounding box of the
// character at that position, relative to the window.
function coordsAtPos(view, pos, side) {
    let { node, offset, atom } = view.docView.domFromPos(pos, side < 0 ? -1 : 1);
    let supportEmptyRange = webkit || gecko;
    if (node.nodeType == 3) {
        // These browsers support querying empty text ranges. Prefer that in
        // bidi context or when at the end of a node.
        if (supportEmptyRange && (BIDI.test(node.nodeValue) || (side < 0 ? !offset : offset == node.nodeValue.length))) {
            let rect = singleRect(textRange(node, offset, offset), side);
            // Firefox returns bad results (the position before the space)
            // when querying a position directly after line-broken
            // whitespace. Detect this situation and and kludge around it
            if (gecko && offset && /\s/.test(node.nodeValue[offset - 1]) && offset < node.nodeValue.length) {
                let rectBefore = singleRect(textRange(node, offset - 1, offset - 1), -1);
                if (rectBefore.top == rect.top) {
                    let rectAfter = singleRect(textRange(node, offset, offset + 1), -1);
                    if (rectAfter.top != rect.top)
                        return flattenV(rectAfter, rectAfter.left < rectBefore.left);
                }
            }
            return rect;
        }
        else {
            let from = offset, to = offset, takeSide = side < 0 ? 1 : -1;
            if (side < 0 && !offset) {
                to++;
                takeSide = -1;
            }
            else if (side >= 0 && offset == node.nodeValue.length) {
                from--;
                takeSide = 1;
            }
            else if (side < 0) {
                from--;
            }
            else {
                to++;
            }
            return flattenV(singleRect(textRange(node, from, to), 1), takeSide < 0);
        }
    }
    let $dom = view.state.doc.resolve(pos - (atom || 0));
    // Return a horizontal line in block context
    if (!$dom.parent.inlineContent) {
        if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
            let before = node.childNodes[offset - 1];
            if (before.nodeType == 1)
                return flattenH(before.getBoundingClientRect(), false);
        }
        if (atom == null && offset < nodeSize(node)) {
            let after = node.childNodes[offset];
            if (after.nodeType == 1)
                return flattenH(after.getBoundingClientRect(), true);
        }
        return flattenH(node.getBoundingClientRect(), side >= 0);
    }
    // Inline, not in text node (this is not Bidi-safe)
    if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
        let before = node.childNodes[offset - 1];
        let target = before.nodeType == 3 ? textRange(before, nodeSize(before) - (supportEmptyRange ? 0 : 1))
            // BR nodes tend to only return the rectangle before them.
            // Only use them if they are the last element in their parent
            : before.nodeType == 1 && (before.nodeName != "BR" || !before.nextSibling) ? before : null;
        if (target)
            return flattenV(singleRect(target, 1), false);
    }
    if (atom == null && offset < nodeSize(node)) {
        let after = node.childNodes[offset];
        while (after.pmViewDesc && after.pmViewDesc.ignoreForCoords)
            after = after.nextSibling;
        let target = !after ? null : after.nodeType == 3 ? textRange(after, 0, (supportEmptyRange ? 0 : 1))
            : after.nodeType == 1 ? after : null;
        if (target)
            return flattenV(singleRect(target, -1), true);
    }
    // All else failed, just try to get a rectangle for the target node
    return flattenV(singleRect(node.nodeType == 3 ? textRange(node) : node, -side), side >= 0);
}
function flattenV(rect, left) {
    if (rect.width == 0)
        return rect;
    let x = left ? rect.left : rect.right;
    return { top: rect.top, bottom: rect.bottom, left: x, right: x };
}
function flattenH(rect, top) {
    if (rect.height == 0)
        return rect;
    let y = top ? rect.top : rect.bottom;
    return { top: y, bottom: y, left: rect.left, right: rect.right };
}
function withFlushedState(view, state, f) {
    let viewState = view.state, active = view.root.activeElement;
    if (viewState != state)
        view.updateState(state);
    if (active != view.dom)
        view.focus();
    try {
        return f();
    }
    finally {
        if (viewState != state)
            view.updateState(viewState);
        if (active != view.dom && active)
            active.focus();
    }
}
// Whether vertical position motion in a given direction
// from a position would leave a text block.
function endOfTextblockVertical(view, state, dir) {
    let sel = state.selection;
    let $pos = dir == "up" ? sel.$from : sel.$to;
    return withFlushedState(view, state, () => {
        let { node: dom } = view.docView.domFromPos($pos.pos, dir == "up" ? -1 : 1);
        for (;;) {
            let nearest = view.docView.nearestDesc(dom, true);
            if (!nearest)
                break;
            if (nearest.node.isBlock) {
                dom = nearest.contentDOM || nearest.dom;
                break;
            }
            dom = nearest.dom.parentNode;
        }
        let coords = coordsAtPos(view, $pos.pos, 1);
        for (let child = dom.firstChild; child; child = child.nextSibling) {
            let boxes;
            if (child.nodeType == 1)
                boxes = child.getClientRects();
            else if (child.nodeType == 3)
                boxes = textRange(child, 0, child.nodeValue.length).getClientRects();
            else
                continue;
            for (let i = 0; i < boxes.length; i++) {
                let box = boxes[i];
                if (box.bottom > box.top + 1 &&
                    (dir == "up" ? coords.top - box.top > (box.bottom - coords.top) * 2
                        : box.bottom - coords.bottom > (coords.bottom - box.top) * 2))
                    return false;
            }
        }
        return true;
    });
}
const maybeRTL = /[\u0590-\u08ac]/;
function endOfTextblockHorizontal(view, state, dir) {
    let { $head } = state.selection;
    if (!$head.parent.isTextblock)
        return false;
    let offset = $head.parentOffset, atStart = !offset, atEnd = offset == $head.parent.content.size;
    let sel = view.domSelection();
    // If the textblock is all LTR, or the browser doesn't support
    // Selection.modify (Edge), fall back to a primitive approach
    if (!maybeRTL.test($head.parent.textContent) || !sel.modify)
        return dir == "left" || dir == "backward" ? atStart : atEnd;
    return withFlushedState(view, state, () => {
        // This is a huge hack, but appears to be the best we can
        // currently do: use `Selection.modify` to move the selection by
        // one character, and see if that moves the cursor out of the
        // textblock (or doesn't move it at all, when at the start/end of
        // the document).
        let { focusNode: oldNode, focusOffset: oldOff, anchorNode, anchorOffset } = view.domSelectionRange();
        let oldBidiLevel = sel.caretBidiLevel // Only for Firefox
        ;
        sel.modify("move", dir, "character");
        let parentDOM = $head.depth ? view.docView.domAfterPos($head.before()) : view.dom;
        let { focusNode: newNode, focusOffset: newOff } = view.domSelectionRange();
        let result = newNode && !parentDOM.contains(newNode.nodeType == 1 ? newNode : newNode.parentNode) ||
            (oldNode == newNode && oldOff == newOff);
        // Restore the previous selection
        try {
            sel.collapse(anchorNode, anchorOffset);
            if (oldNode && (oldNode != anchorNode || oldOff != anchorOffset) && sel.extend)
                sel.extend(oldNode, oldOff);
        }
        catch (_) { }
        if (oldBidiLevel != null)
            sel.caretBidiLevel = oldBidiLevel;
        return result;
    });
}
let cachedState = null;
let cachedDir = null;
let cachedResult = false;
function endOfTextblock(view, state, dir) {
    if (cachedState == state && cachedDir == dir)
        return cachedResult;
    cachedState = state;
    cachedDir = dir;
    return cachedResult = dir == "up" || dir == "down"
        ? endOfTextblockVertical(view, state, dir)
        : endOfTextblockHorizontal(view, state, dir);
}

// View descriptions are data structures that describe the DOM that is
// used to represent the editor's content. They are used for:
//
// - Incremental redrawing when the document changes
//
// - Figuring out what part of the document a given DOM position
//   corresponds to
//
// - Wiring in custom implementations of the editing interface for a
//   given node
//
// They form a doubly-linked mutable tree, starting at `view.docView`.
const NOT_DIRTY = 0, CHILD_DIRTY = 1, CONTENT_DIRTY = 2, NODE_DIRTY = 3;
// Superclass for the various kinds of descriptions. Defines their
// basic structure and shared methods.
class ViewDesc {
    constructor(parent, children, dom, 
    // This is the node that holds the child views. It may be null for
    // descs that don't have children.
    contentDOM) {
        this.parent = parent;
        this.children = children;
        this.dom = dom;
        this.contentDOM = contentDOM;
        this.dirty = NOT_DIRTY;
        // An expando property on the DOM node provides a link back to its
        // description.
        dom.pmViewDesc = this;
    }
    // Used to check whether a given description corresponds to a
    // widget/mark/node.
    matchesWidget(widget) { return false; }
    matchesMark(mark) { return false; }
    matchesNode(node, outerDeco, innerDeco) { return false; }
    matchesHack(nodeName) { return false; }
    // When parsing in-editor content (in domchange.js), we allow
    // descriptions to determine the parse rules that should be used to
    // parse them.
    parseRule() { return null; }
    // Used by the editor's event handler to ignore events that come
    // from certain descs.
    stopEvent(event) { return false; }
    // The size of the content represented by this desc.
    get size() {
        let size = 0;
        for (let i = 0; i < this.children.length; i++)
            size += this.children[i].size;
        return size;
    }
    // For block nodes, this represents the space taken up by their
    // start/end tokens.
    get border() { return 0; }
    destroy() {
        this.parent = undefined;
        if (this.dom.pmViewDesc == this)
            this.dom.pmViewDesc = undefined;
        for (let i = 0; i < this.children.length; i++)
            this.children[i].destroy();
    }
    posBeforeChild(child) {
        for (let i = 0, pos = this.posAtStart;; i++) {
            let cur = this.children[i];
            if (cur == child)
                return pos;
            pos += cur.size;
        }
    }
    get posBefore() {
        return this.parent.posBeforeChild(this);
    }
    get posAtStart() {
        return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
    }
    get posAfter() {
        return this.posBefore + this.size;
    }
    get posAtEnd() {
        return this.posAtStart + this.size - 2 * this.border;
    }
    localPosFromDOM(dom, offset, bias) {
        // If the DOM position is in the content, use the child desc after
        // it to figure out a position.
        if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) {
            if (bias < 0) {
                let domBefore, desc;
                if (dom == this.contentDOM) {
                    domBefore = dom.childNodes[offset - 1];
                }
                else {
                    while (dom.parentNode != this.contentDOM)
                        dom = dom.parentNode;
                    domBefore = dom.previousSibling;
                }
                while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this))
                    domBefore = domBefore.previousSibling;
                return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart;
            }
            else {
                let domAfter, desc;
                if (dom == this.contentDOM) {
                    domAfter = dom.childNodes[offset];
                }
                else {
                    while (dom.parentNode != this.contentDOM)
                        dom = dom.parentNode;
                    domAfter = dom.nextSibling;
                }
                while (domAfter && !((desc = domAfter.pmViewDesc) && desc.parent == this))
                    domAfter = domAfter.nextSibling;
                return domAfter ? this.posBeforeChild(desc) : this.posAtEnd;
            }
        }
        // Otherwise, use various heuristics, falling back on the bias
        // parameter, to determine whether to return the position at the
        // start or at the end of this view desc.
        let atEnd;
        if (dom == this.dom && this.contentDOM) {
            atEnd = offset > domIndex(this.contentDOM);
        }
        else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
            atEnd = dom.compareDocumentPosition(this.contentDOM) & 2;
        }
        else if (this.dom.firstChild) {
            if (offset == 0)
                for (let search = dom;; search = search.parentNode) {
                    if (search == this.dom) {
                        atEnd = false;
                        break;
                    }
                    if (search.previousSibling)
                        break;
                }
            if (atEnd == null && offset == dom.childNodes.length)
                for (let search = dom;; search = search.parentNode) {
                    if (search == this.dom) {
                        atEnd = true;
                        break;
                    }
                    if (search.nextSibling)
                        break;
                }
        }
        return (atEnd == null ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart;
    }
    nearestDesc(dom, onlyNodes = false) {
        for (let first = true, cur = dom; cur; cur = cur.parentNode) {
            let desc = this.getDesc(cur), nodeDOM;
            if (desc && (!onlyNodes || desc.node)) {
                // If dom is outside of this desc's nodeDOM, don't count it.
                if (first && (nodeDOM = desc.nodeDOM) &&
                    !(nodeDOM.nodeType == 1 ? nodeDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode) : nodeDOM == dom))
                    first = false;
                else
                    return desc;
            }
        }
    }
    getDesc(dom) {
        let desc = dom.pmViewDesc;
        for (let cur = desc; cur; cur = cur.parent)
            if (cur == this)
                return desc;
    }
    posFromDOM(dom, offset, bias) {
        for (let scan = dom; scan; scan = scan.parentNode) {
            let desc = this.getDesc(scan);
            if (desc)
                return desc.localPosFromDOM(dom, offset, bias);
        }
        return -1;
    }
    // Find the desc for the node after the given pos, if any. (When a
    // parent node overrode rendering, there might not be one.)
    descAt(pos) {
        for (let i = 0, offset = 0; i < this.children.length; i++) {
            let child = this.children[i], end = offset + child.size;
            if (offset == pos && end != offset) {
                while (!child.border && child.children.length)
                    child = child.children[0];
                return child;
            }
            if (pos < end)
                return child.descAt(pos - offset - child.border);
            offset = end;
        }
    }
    domFromPos(pos, side) {
        if (!this.contentDOM)
            return { node: this.dom, offset: 0, atom: pos + 1 };
        // First find the position in the child array
        let i = 0, offset = 0;
        for (let curPos = 0; i < this.children.length; i++) {
            let child = this.children[i], end = curPos + child.size;
            if (end > pos || child instanceof TrailingHackViewDesc) {
                offset = pos - curPos;
                break;
            }
            curPos = end;
        }
        // If this points into the middle of a child, call through
        if (offset)
            return this.children[i].domFromPos(offset - this.children[i].border, side);
        // Go back if there were any zero-length widgets with side >= 0 before this point
        for (let prev; i && !(prev = this.children[i - 1]).size && prev instanceof WidgetViewDesc && prev.side >= 0; i--) { }
        // Scan towards the first useable node
        if (side <= 0) {
            let prev, enter = true;
            for (;; i--, enter = false) {
                prev = i ? this.children[i - 1] : null;
                if (!prev || prev.dom.parentNode == this.contentDOM)
                    break;
            }
            if (prev && side && enter && !prev.border && !prev.domAtom)
                return prev.domFromPos(prev.size, side);
            return { node: this.contentDOM, offset: prev ? domIndex(prev.dom) + 1 : 0 };
        }
        else {
            let next, enter = true;
            for (;; i++, enter = false) {
                next = i < this.children.length ? this.children[i] : null;
                if (!next || next.dom.parentNode == this.contentDOM)
                    break;
            }
            if (next && enter && !next.border && !next.domAtom)
                return next.domFromPos(0, side);
            return { node: this.contentDOM, offset: next ? domIndex(next.dom) : this.contentDOM.childNodes.length };
        }
    }
    // Used to find a DOM range in a single parent for a given changed
    // range.
    parseRange(from, to, base = 0) {
        if (this.children.length == 0)
            return { node: this.contentDOM, from, to, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
        let fromOffset = -1, toOffset = -1;
        for (let offset = base, i = 0;; i++) {
            let child = this.children[i], end = offset + child.size;
            if (fromOffset == -1 && from <= end) {
                let childBase = offset + child.border;
                // FIXME maybe descend mark views to parse a narrower range?
                if (from >= childBase && to <= end - child.border && child.node &&
                    child.contentDOM && this.contentDOM.contains(child.contentDOM))
                    return child.parseRange(from, to, childBase);
                from = offset;
                for (let j = i; j > 0; j--) {
                    let prev = this.children[j - 1];
                    if (prev.size && prev.dom.parentNode == this.contentDOM && !prev.emptyChildAt(1)) {
                        fromOffset = domIndex(prev.dom) + 1;
                        break;
                    }
                    from -= prev.size;
                }
                if (fromOffset == -1)
                    fromOffset = 0;
            }
            if (fromOffset > -1 && (end > to || i == this.children.length - 1)) {
                to = end;
                for (let j = i + 1; j < this.children.length; j++) {
                    let next = this.children[j];
                    if (next.size && next.dom.parentNode == this.contentDOM && !next.emptyChildAt(-1)) {
                        toOffset = domIndex(next.dom);
                        break;
                    }
                    to += next.size;
                }
                if (toOffset == -1)
                    toOffset = this.contentDOM.childNodes.length;
                break;
            }
            offset = end;
        }
        return { node: this.contentDOM, from, to, fromOffset, toOffset };
    }
    emptyChildAt(side) {
        if (this.border || !this.contentDOM || !this.children.length)
            return false;
        let child = this.children[side < 0 ? 0 : this.children.length - 1];
        return child.size == 0 || child.emptyChildAt(side);
    }
    domAfterPos(pos) {
        let { node, offset } = this.domFromPos(pos, 0);
        if (node.nodeType != 1 || offset == node.childNodes.length)
            throw new RangeError("No node after pos " + pos);
        return node.childNodes[offset];
    }
    // View descs are responsible for setting any selection that falls
    // entirely inside of them, so that custom implementations can do
    // custom things with the selection. Note that this falls apart when
    // a selection starts in such a node and ends in another, in which
    // case we just use whatever domFromPos produces as a best effort.
    setSelection(anchor, head, root, force = false) {
        // If the selection falls entirely in a child, give it to that child
        let from = Math.min(anchor, head), to = Math.max(anchor, head);
        for (let i = 0, offset = 0; i < this.children.length; i++) {
            let child = this.children[i], end = offset + child.size;
            if (from > offset && to < end)
                return child.setSelection(anchor - offset - child.border, head - offset - child.border, root, force);
            offset = end;
        }
        let anchorDOM = this.domFromPos(anchor, anchor ? -1 : 1);
        let headDOM = head == anchor ? anchorDOM : this.domFromPos(head, head ? -1 : 1);
        let domSel = root.getSelection();
        let brKludge = false;
        // On Firefox, using Selection.collapse to put the cursor after a
        // BR node for some reason doesn't always work (#1073). On Safari,
        // the cursor sometimes inexplicable visually lags behind its
        // reported position in such situations (#1092).
        if ((gecko || safari) && anchor == head) {
            let { node, offset } = anchorDOM;
            if (node.nodeType == 3) {
                brKludge = !!(offset && node.nodeValue[offset - 1] == "\n");
                // Issue #1128
                if (brKludge && offset == node.nodeValue.length) {
                    for (let scan = node, after; scan; scan = scan.parentNode) {
                        if (after = scan.nextSibling) {
                            if (after.nodeName == "BR")
                                anchorDOM = headDOM = { node: after.parentNode, offset: domIndex(after) + 1 };
                            break;
                        }
                        let desc = scan.pmViewDesc;
                        if (desc && desc.node && desc.node.isBlock)
                            break;
                    }
                }
            }
            else {
                let prev = node.childNodes[offset - 1];
                brKludge = prev && (prev.nodeName == "BR" || prev.contentEditable == "false");
            }
        }
        // Firefox can act strangely when the selection is in front of an
        // uneditable node. See #1163 and https://bugzilla.mozilla.org/show_bug.cgi?id=1709536
        if (gecko && domSel.focusNode && domSel.focusNode != headDOM.node && domSel.focusNode.nodeType == 1) {
            let after = domSel.focusNode.childNodes[domSel.focusOffset];
            if (after && after.contentEditable == "false")
                force = true;
        }
        if (!(force || brKludge && safari) &&
            isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset) &&
            isEquivalentPosition(headDOM.node, headDOM.offset, domSel.focusNode, domSel.focusOffset))
            return;
        // Selection.extend can be used to create an 'inverted' selection
        // (one where the focus is before the anchor), but not all
        // browsers support it yet.
        let domSelExtended = false;
        if ((domSel.extend || anchor == head) && !brKludge) {
            domSel.collapse(anchorDOM.node, anchorDOM.offset);
            try {
                if (anchor != head)
                    domSel.extend(headDOM.node, headDOM.offset);
                domSelExtended = true;
            }
            catch (_) {
                // In some cases with Chrome the selection is empty after calling
                // collapse, even when it should be valid. This appears to be a bug, but
                // it is difficult to isolate. If this happens fallback to the old path
                // without using extend.
                // Similarly, this could crash on Safari if the editor is hidden, and
                // there was no selection.
            }
        }
        if (!domSelExtended) {
            if (anchor > head) {
                let tmp = anchorDOM;
                anchorDOM = headDOM;
                headDOM = tmp;
            }
            let range = document.createRange();
            range.setEnd(headDOM.node, headDOM.offset);
            range.setStart(anchorDOM.node, anchorDOM.offset);
            domSel.removeAllRanges();
            domSel.addRange(range);
        }
    }
    ignoreMutation(mutation) {
        return !this.contentDOM && mutation.type != "selection";
    }
    get contentLost() {
        return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
    }
    // Remove a subtree of the element tree that has been touched
    // by a DOM change, so that the next update will redraw it.
    markDirty(from, to) {
        for (let offset = 0, i = 0; i < this.children.length; i++) {
            let child = this.children[i], end = offset + child.size;
            if (offset == end ? from <= end && to >= offset : from < end && to > offset) {
                let startInside = offset + child.border, endInside = end - child.border;
                if (from >= startInside && to <= endInside) {
                    this.dirty = from == offset || to == end ? CONTENT_DIRTY : CHILD_DIRTY;
                    if (from == startInside && to == endInside &&
                        (child.contentLost || child.dom.parentNode != this.contentDOM))
                        child.dirty = NODE_DIRTY;
                    else
                        child.markDirty(from - startInside, to - startInside);
                    return;
                }
                else {
                    child.dirty = child.dom == child.contentDOM && child.dom.parentNode == this.contentDOM && !child.children.length
                        ? CONTENT_DIRTY : NODE_DIRTY;
                }
            }
            offset = end;
        }
        this.dirty = CONTENT_DIRTY;
    }
    markParentsDirty() {
        let level = 1;
        for (let node = this.parent; node; node = node.parent, level++) {
            let dirty = level == 1 ? CONTENT_DIRTY : CHILD_DIRTY;
            if (node.dirty < dirty)
                node.dirty = dirty;
        }
    }
    get domAtom() { return false; }
    get ignoreForCoords() { return false; }
}
// A widget desc represents a widget decoration, which is a DOM node
// drawn between the document nodes.
class WidgetViewDesc extends ViewDesc {
    constructor(parent, widget, view, pos) {
        let self, dom = widget.type.toDOM;
        if (typeof dom == "function")
            dom = dom(view, () => {
                if (!self)
                    return pos;
                if (self.parent)
                    return self.parent.posBeforeChild(self);
            });
        if (!widget.type.spec.raw) {
            if (dom.nodeType != 1) {
                let wrap = document.createElement("span");
                wrap.appendChild(dom);
                dom = wrap;
            }
            dom.contentEditable = "false";
            dom.classList.add("ProseMirror-widget");
        }
        super(parent, [], dom, null);
        this.widget = widget;
        this.widget = widget;
        self = this;
    }
    matchesWidget(widget) {
        return this.dirty == NOT_DIRTY && widget.type.eq(this.widget.type);
    }
    parseRule() { return { ignore: true }; }
    stopEvent(event) {
        let stop = this.widget.spec.stopEvent;
        return stop ? stop(event) : false;
    }
    ignoreMutation(mutation) {
        return mutation.type != "selection" || this.widget.spec.ignoreSelection;
    }
    destroy() {
        this.widget.type.destroy(this.dom);
        super.destroy();
    }
    get domAtom() { return true; }
    get side() { return this.widget.type.side; }
}
class CompositionViewDesc extends ViewDesc {
    constructor(parent, dom, textDOM, text) {
        super(parent, [], dom, null);
        this.textDOM = textDOM;
        this.text = text;
    }
    get size() { return this.text.length; }
    localPosFromDOM(dom, offset) {
        if (dom != this.textDOM)
            return this.posAtStart + (offset ? this.size : 0);
        return this.posAtStart + offset;
    }
    domFromPos(pos) {
        return { node: this.textDOM, offset: pos };
    }
    ignoreMutation(mut) {
        return mut.type === 'characterData' && mut.target.nodeValue == mut.oldValue;
    }
}
// A mark desc represents a mark. May have multiple children,
// depending on how the mark is split. Note that marks are drawn using
// a fixed nesting order, for simplicity and predictability, so in
// some cases they will be split more often than would appear
// necessary.
class MarkViewDesc extends ViewDesc {
    constructor(parent, mark, dom, contentDOM) {
        super(parent, [], dom, contentDOM);
        this.mark = mark;
    }
    static create(parent, mark, inline, view) {
        let custom = view.nodeViews[mark.type.name];
        let spec = custom && custom(mark, view, inline);
        if (!spec || !spec.dom)
            spec = DOMSerializer.renderSpec(document, mark.type.spec.toDOM(mark, inline));
        return new MarkViewDesc(parent, mark, spec.dom, spec.contentDOM || spec.dom);
    }
    parseRule() {
        if ((this.dirty & NODE_DIRTY) || this.mark.type.spec.reparseInView)
            return null;
        return { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM || undefined };
    }
    matchesMark(mark) { return this.dirty != NODE_DIRTY && this.mark.eq(mark); }
    markDirty(from, to) {
        super.markDirty(from, to);
        // Move dirty info to nearest node view
        if (this.dirty != NOT_DIRTY) {
            let parent = this.parent;
            while (!parent.node)
                parent = parent.parent;
            if (parent.dirty < this.dirty)
                parent.dirty = this.dirty;
            this.dirty = NOT_DIRTY;
        }
    }
    slice(from, to, view) {
        let copy = MarkViewDesc.create(this.parent, this.mark, true, view);
        let nodes = this.children, size = this.size;
        if (to < size)
            nodes = replaceNodes(nodes, to, size, view);
        if (from > 0)
            nodes = replaceNodes(nodes, 0, from, view);
        for (let i = 0; i < nodes.length; i++)
            nodes[i].parent = copy;
        copy.children = nodes;
        return copy;
    }
}
// Node view descs are the main, most common type of view desc, and
// correspond to an actual node in the document. Unlike mark descs,
// they populate their child array themselves.
class NodeViewDesc extends ViewDesc {
    constructor(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos) {
        super(parent, [], dom, contentDOM);
        this.node = node;
        this.outerDeco = outerDeco;
        this.innerDeco = innerDeco;
        this.nodeDOM = nodeDOM;
        if (contentDOM)
            this.updateChildren(view, pos);
    }
    // By default, a node is rendered using the `toDOM` method from the
    // node type spec. But client code can use the `nodeViews` spec to
    // supply a custom node view, which can influence various aspects of
    // the way the node works.
    //
    // (Using subclassing for this was intentionally decided against,
    // since it'd require exposing a whole slew of finicky
    // implementation details to the user code that they probably will
    // never need.)
    static create(parent, node, outerDeco, innerDeco, view, pos) {
        let custom = view.nodeViews[node.type.name], descObj;
        let spec = custom && custom(node, view, () => {
            // (This is a function that allows the custom view to find its
            // own position)
            if (!descObj)
                return pos;
            if (descObj.parent)
                return descObj.parent.posBeforeChild(descObj);
        }, outerDeco, innerDeco);
        let dom = spec && spec.dom, contentDOM = spec && spec.contentDOM;
        if (node.isText) {
            if (!dom)
                dom = document.createTextNode(node.text);
            else if (dom.nodeType != 3)
                throw new RangeError("Text must be rendered as a DOM text node");
        }
        else if (!dom) {
            ({ dom, contentDOM } = DOMSerializer.renderSpec(document, node.type.spec.toDOM(node)));
        }
        if (!contentDOM && !node.isText && dom.nodeName != "BR") { // Chrome gets confused by <br contenteditable=false>
            if (!dom.hasAttribute("contenteditable"))
                dom.contentEditable = "false";
            if (node.type.spec.draggable)
                dom.draggable = true;
        }
        let nodeDOM = dom;
        dom = applyOuterDeco(dom, outerDeco, node);
        if (spec)
            return descObj = new CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM || null, nodeDOM, spec, view, pos + 1);
        else if (node.isText)
            return new TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view);
        else
            return new NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM || null, nodeDOM, view, pos + 1);
    }
    parseRule() {
        // Experimental kludge to allow opt-in re-parsing of nodes
        if (this.node.type.spec.reparseInView)
            return null;
        // FIXME the assumption that this can always return the current
        // attrs means that if the user somehow manages to change the
        // attrs in the dom, that won't be picked up. Not entirely sure
        // whether this is a problem
        let rule = { node: this.node.type.name, attrs: this.node.attrs };
        if (this.node.type.whitespace == "pre")
            rule.preserveWhitespace = "full";
        if (!this.contentDOM) {
            rule.getContent = () => this.node.content;
        }
        else if (!this.contentLost) {
            rule.contentElement = this.contentDOM;
        }
        else {
            // Chrome likes to randomly recreate parent nodes when
            // backspacing things. When that happens, this tries to find the
            // new parent.
            for (let i = this.children.length - 1; i >= 0; i--) {
                let child = this.children[i];
                if (this.dom.contains(child.dom.parentNode)) {
                    rule.contentElement = child.dom.parentNode;
                    break;
                }
            }
            if (!rule.contentElement)
                rule.getContent = () => Fragment.empty;
        }
        return rule;
    }
    matchesNode(node, outerDeco, innerDeco) {
        return this.dirty == NOT_DIRTY && node.eq(this.node) &&
            sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco);
    }
    get size() { return this.node.nodeSize; }
    get border() { return this.node.isLeaf ? 0 : 1; }
    // Syncs `this.children` to match `this.node.content` and the local
    // decorations, possibly introducing nesting for marks. Then, in a
    // separate step, syncs the DOM inside `this.contentDOM` to
    // `this.children`.
    updateChildren(view, pos) {
        let inline = this.node.inlineContent, off = pos;
        let composition = view.composing ? this.localCompositionInfo(view, pos) : null;
        let localComposition = composition && composition.pos > -1 ? composition : null;
        let compositionInChild = composition && composition.pos < 0;
        let updater = new ViewTreeUpdater(this, localComposition && localComposition.node, view);
        iterDeco(this.node, this.innerDeco, (widget, i, insideNode) => {
            if (widget.spec.marks)
                updater.syncToMarks(widget.spec.marks, inline, view);
            else if (widget.type.side >= 0 && !insideNode)
                updater.syncToMarks(i == this.node.childCount ? Mark$1.none : this.node.child(i).marks, inline, view);
            // If the next node is a desc matching this widget, reuse it,
            // otherwise insert the widget as a new view desc.
            updater.placeWidget(widget, view, off);
        }, (child, outerDeco, innerDeco, i) => {
            // Make sure the wrapping mark descs match the node's marks.
            updater.syncToMarks(child.marks, inline, view);
            // Try several strategies for drawing this node
            let compIndex;
            if (updater.findNodeMatch(child, outerDeco, innerDeco, i)) ;
            else if (compositionInChild && view.state.selection.from > off &&
                view.state.selection.to < off + child.nodeSize &&
                (compIndex = updater.findIndexWithChild(composition.node)) > -1 &&
                updater.updateNodeAt(child, outerDeco, innerDeco, compIndex, view)) ;
            else if (updater.updateNextNode(child, outerDeco, innerDeco, view, i)) ;
            else {
                // Add it as a new view
                updater.addNode(child, outerDeco, innerDeco, view, off);
            }
            off += child.nodeSize;
        });
        // Drop all remaining descs after the current position.
        updater.syncToMarks([], inline, view);
        if (this.node.isTextblock)
            updater.addTextblockHacks();
        updater.destroyRest();
        // Sync the DOM if anything changed
        if (updater.changed || this.dirty == CONTENT_DIRTY) {
            // May have to protect focused DOM from being changed if a composition is active
            if (localComposition)
                this.protectLocalComposition(view, localComposition);
            renderDescs(this.contentDOM, this.children, view);
            if (ios)
                iosHacks(this.dom);
        }
    }
    localCompositionInfo(view, pos) {
        // Only do something if both the selection and a focused text node
        // are inside of this node
        let { from, to } = view.state.selection;
        if (!(view.state.selection instanceof TextSelection) || from < pos || to > pos + this.node.content.size)
            return null;
        let sel = view.domSelectionRange();
        let textNode = nearbyTextNode(sel.focusNode, sel.focusOffset);
        if (!textNode || !this.dom.contains(textNode.parentNode))
            return null;
        if (this.node.inlineContent) {
            // Find the text in the focused node in the node, stop if it's not
            // there (may have been modified through other means, in which
            // case it should overwritten)
            let text = textNode.nodeValue;
            let textPos = findTextInFragment(this.node.content, text, from - pos, to - pos);
            return textPos < 0 ? null : { node: textNode, pos: textPos, text };
        }
        else {
            return { node: textNode, pos: -1, text: "" };
        }
    }
    protectLocalComposition(view, { node, pos, text }) {
        // The node is already part of a local view desc, leave it there
        if (this.getDesc(node))
            return;
        // Create a composition view for the orphaned nodes
        let topNode = node;
        for (;; topNode = topNode.parentNode) {
            if (topNode.parentNode == this.contentDOM)
                break;
            while (topNode.previousSibling)
                topNode.parentNode.removeChild(topNode.previousSibling);
            while (topNode.nextSibling)
                topNode.parentNode.removeChild(topNode.nextSibling);
            if (topNode.pmViewDesc)
                topNode.pmViewDesc = undefined;
        }
        let desc = new CompositionViewDesc(this, topNode, node, text);
        view.input.compositionNodes.push(desc);
        // Patch up this.children to contain the composition view
        this.children = replaceNodes(this.children, pos, pos + text.length, view, desc);
    }
    // If this desc must be updated to match the given node decoration,
    // do so and return true.
    update(node, outerDeco, innerDeco, view) {
        if (this.dirty == NODE_DIRTY ||
            !node.sameMarkup(this.node))
            return false;
        this.updateInner(node, outerDeco, innerDeco, view);
        return true;
    }
    updateInner(node, outerDeco, innerDeco, view) {
        this.updateOuterDeco(outerDeco);
        this.node = node;
        this.innerDeco = innerDeco;
        if (this.contentDOM)
            this.updateChildren(view, this.posAtStart);
        this.dirty = NOT_DIRTY;
    }
    updateOuterDeco(outerDeco) {
        if (sameOuterDeco(outerDeco, this.outerDeco))
            return;
        let needsWrap = this.nodeDOM.nodeType != 1;
        let oldDOM = this.dom;
        this.dom = patchOuterDeco(this.dom, this.nodeDOM, computeOuterDeco(this.outerDeco, this.node, needsWrap), computeOuterDeco(outerDeco, this.node, needsWrap));
        if (this.dom != oldDOM) {
            oldDOM.pmViewDesc = undefined;
            this.dom.pmViewDesc = this;
        }
        this.outerDeco = outerDeco;
    }
    // Mark this node as being the selected node.
    selectNode() {
        if (this.nodeDOM.nodeType == 1)
            this.nodeDOM.classList.add("ProseMirror-selectednode");
        if (this.contentDOM || !this.node.type.spec.draggable)
            this.dom.draggable = true;
    }
    // Remove selected node marking from this node.
    deselectNode() {
        if (this.nodeDOM.nodeType == 1)
            this.nodeDOM.classList.remove("ProseMirror-selectednode");
        if (this.contentDOM || !this.node.type.spec.draggable)
            this.dom.removeAttribute("draggable");
    }
    get domAtom() { return this.node.isAtom; }
}
// Create a view desc for the top-level document node, to be exported
// and used by the view class.
function docViewDesc(doc, outerDeco, innerDeco, dom, view) {
    applyOuterDeco(dom, outerDeco, doc);
    return new NodeViewDesc(undefined, doc, outerDeco, innerDeco, dom, dom, dom, view, 0);
}
class TextViewDesc extends NodeViewDesc {
    constructor(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) {
        super(parent, node, outerDeco, innerDeco, dom, null, nodeDOM, view, 0);
    }
    parseRule() {
        let skip = this.nodeDOM.parentNode;
        while (skip && skip != this.dom && !skip.pmIsDeco)
            skip = skip.parentNode;
        return { skip: (skip || true) };
    }
    update(node, outerDeco, innerDeco, view) {
        if (this.dirty == NODE_DIRTY || (this.dirty != NOT_DIRTY && !this.inParent()) ||
            !node.sameMarkup(this.node))
            return false;
        this.updateOuterDeco(outerDeco);
        if ((this.dirty != NOT_DIRTY || node.text != this.node.text) && node.text != this.nodeDOM.nodeValue) {
            this.nodeDOM.nodeValue = node.text;
            if (view.trackWrites == this.nodeDOM)
                view.trackWrites = null;
        }
        this.node = node;
        this.dirty = NOT_DIRTY;
        return true;
    }
    inParent() {
        let parentDOM = this.parent.contentDOM;
        for (let n = this.nodeDOM; n; n = n.parentNode)
            if (n == parentDOM)
                return true;
        return false;
    }
    domFromPos(pos) {
        return { node: this.nodeDOM, offset: pos };
    }
    localPosFromDOM(dom, offset, bias) {
        if (dom == this.nodeDOM)
            return this.posAtStart + Math.min(offset, this.node.text.length);
        return super.localPosFromDOM(dom, offset, bias);
    }
    ignoreMutation(mutation) {
        return mutation.type != "characterData" && mutation.type != "selection";
    }
    slice(from, to, view) {
        let node = this.node.cut(from, to), dom = document.createTextNode(node.text);
        return new TextViewDesc(this.parent, node, this.outerDeco, this.innerDeco, dom, dom, view);
    }
    markDirty(from, to) {
        super.markDirty(from, to);
        if (this.dom != this.nodeDOM && (from == 0 || to == this.nodeDOM.nodeValue.length))
            this.dirty = NODE_DIRTY;
    }
    get domAtom() { return false; }
}
// A dummy desc used to tag trailing BR or IMG nodes created to work
// around contentEditable terribleness.
class TrailingHackViewDesc extends ViewDesc {
    parseRule() { return { ignore: true }; }
    matchesHack(nodeName) { return this.dirty == NOT_DIRTY && this.dom.nodeName == nodeName; }
    get domAtom() { return true; }
    get ignoreForCoords() { return this.dom.nodeName == "IMG"; }
}
// A separate subclass is used for customized node views, so that the
// extra checks only have to be made for nodes that are actually
// customized.
class CustomNodeViewDesc extends NodeViewDesc {
    constructor(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view, pos) {
        super(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos);
        this.spec = spec;
    }
    // A custom `update` method gets to decide whether the update goes
    // through. If it does, and there's a `contentDOM` node, our logic
    // updates the children.
    update(node, outerDeco, innerDeco, view) {
        if (this.dirty == NODE_DIRTY)
            return false;
        if (this.spec.update) {
            let result = this.spec.update(node, outerDeco, innerDeco);
            if (result)
                this.updateInner(node, outerDeco, innerDeco, view);
            return result;
        }
        else if (!this.contentDOM && !node.isLeaf) {
            return false;
        }
        else {
            return super.update(node, outerDeco, innerDeco, view);
        }
    }
    selectNode() {
        this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
    }
    deselectNode() {
        this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
    }
    setSelection(anchor, head, root, force) {
        this.spec.setSelection ? this.spec.setSelection(anchor, head, root)
            : super.setSelection(anchor, head, root, force);
    }
    destroy() {
        if (this.spec.destroy)
            this.spec.destroy();
        super.destroy();
    }
    stopEvent(event) {
        return this.spec.stopEvent ? this.spec.stopEvent(event) : false;
    }
    ignoreMutation(mutation) {
        return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : super.ignoreMutation(mutation);
    }
}
// Sync the content of the given DOM node with the nodes associated
// with the given array of view descs, recursing into mark descs
// because this should sync the subtree for a whole node at a time.
function renderDescs(parentDOM, descs, view) {
    let dom = parentDOM.firstChild, written = false;
    for (let i = 0; i < descs.length; i++) {
        let desc = descs[i], childDOM = desc.dom;
        if (childDOM.parentNode == parentDOM) {
            while (childDOM != dom) {
                dom = rm(dom);
                written = true;
            }
            dom = dom.nextSibling;
        }
        else {
            written = true;
            parentDOM.insertBefore(childDOM, dom);
        }
        if (desc instanceof MarkViewDesc) {
            let pos = dom ? dom.previousSibling : parentDOM.lastChild;
            renderDescs(desc.contentDOM, desc.children, view);
            dom = pos ? pos.nextSibling : parentDOM.firstChild;
        }
    }
    while (dom) {
        dom = rm(dom);
        written = true;
    }
    if (written && view.trackWrites == parentDOM)
        view.trackWrites = null;
}
const OuterDecoLevel = function (nodeName) {
    if (nodeName)
        this.nodeName = nodeName;
};
OuterDecoLevel.prototype = Object.create(null);
const noDeco = [new OuterDecoLevel];
function computeOuterDeco(outerDeco, node, needsWrap) {
    if (outerDeco.length == 0)
        return noDeco;
    let top = needsWrap ? noDeco[0] : new OuterDecoLevel, result = [top];
    for (let i = 0; i < outerDeco.length; i++) {
        let attrs = outerDeco[i].type.attrs;
        if (!attrs)
            continue;
        if (attrs.nodeName)
            result.push(top = new OuterDecoLevel(attrs.nodeName));
        for (let name in attrs) {
            let val = attrs[name];
            if (val == null)
                continue;
            if (needsWrap && result.length == 1)
                result.push(top = new OuterDecoLevel(node.isInline ? "span" : "div"));
            if (name == "class")
                top.class = (top.class ? top.class + " " : "") + val;
            else if (name == "style")
                top.style = (top.style ? top.style + ";" : "") + val;
            else if (name != "nodeName")
                top[name] = val;
        }
    }
    return result;
}
function patchOuterDeco(outerDOM, nodeDOM, prevComputed, curComputed) {
    // Shortcut for trivial case
    if (prevComputed == noDeco && curComputed == noDeco)
        return nodeDOM;
    let curDOM = nodeDOM;
    for (let i = 0; i < curComputed.length; i++) {
        let deco = curComputed[i], prev = prevComputed[i];
        if (i) {
            let parent;
            if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM &&
                (parent = curDOM.parentNode) && parent.nodeName.toLowerCase() == deco.nodeName) {
                curDOM = parent;
            }
            else {
                parent = document.createElement(deco.nodeName);
                parent.pmIsDeco = true;
                parent.appendChild(curDOM);
                prev = noDeco[0];
                curDOM = parent;
            }
        }
        patchAttributes(curDOM, prev || noDeco[0], deco);
    }
    return curDOM;
}
function patchAttributes(dom, prev, cur) {
    for (let name in prev)
        if (name != "class" && name != "style" && name != "nodeName" && !(name in cur))
            dom.removeAttribute(name);
    for (let name in cur)
        if (name != "class" && name != "style" && name != "nodeName" && cur[name] != prev[name])
            dom.setAttribute(name, cur[name]);
    if (prev.class != cur.class) {
        let prevList = prev.class ? prev.class.split(" ").filter(Boolean) : [];
        let curList = cur.class ? cur.class.split(" ").filter(Boolean) : [];
        for (let i = 0; i < prevList.length; i++)
            if (curList.indexOf(prevList[i]) == -1)
                dom.classList.remove(prevList[i]);
        for (let i = 0; i < curList.length; i++)
            if (prevList.indexOf(curList[i]) == -1)
                dom.classList.add(curList[i]);
        if (dom.classList.length == 0)
            dom.removeAttribute("class");
    }
    if (prev.style != cur.style) {
        if (prev.style) {
            let prop = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, m;
            while (m = prop.exec(prev.style))
                dom.style.removeProperty(m[1]);
        }
        if (cur.style)
            dom.style.cssText += cur.style;
    }
}
function applyOuterDeco(dom, deco, node) {
    return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node, dom.nodeType != 1));
}
function sameOuterDeco(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!a[i].type.eq(b[i].type))
            return false;
    return true;
}
// Remove a DOM node and return its next sibling.
function rm(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
}
// Helper class for incrementally updating a tree of mark descs and
// the widget and node descs inside of them.
class ViewTreeUpdater {
    constructor(top, lock, view) {
        this.lock = lock;
        this.view = view;
        // Index into `this.top`'s child array, represents the current
        // update position.
        this.index = 0;
        // When entering a mark, the current top and index are pushed
        // onto this.
        this.stack = [];
        // Tracks whether anything was changed
        this.changed = false;
        this.top = top;
        this.preMatch = preMatch(top.node.content, top);
    }
    // Destroy and remove the children between the given indices in
    // `this.top`.
    destroyBetween(start, end) {
        if (start == end)
            return;
        for (let i = start; i < end; i++)
            this.top.children[i].destroy();
        this.top.children.splice(start, end - start);
        this.changed = true;
    }
    // Destroy all remaining children in `this.top`.
    destroyRest() {
        this.destroyBetween(this.index, this.top.children.length);
    }
    // Sync the current stack of mark descs with the given array of
    // marks, reusing existing mark descs when possible.
    syncToMarks(marks, inline, view) {
        let keep = 0, depth = this.stack.length >> 1;
        let maxKeep = Math.min(depth, marks.length);
        while (keep < maxKeep &&
            (keep == depth - 1 ? this.top : this.stack[(keep + 1) << 1])
                .matchesMark(marks[keep]) && marks[keep].type.spec.spanning !== false)
            keep++;
        while (keep < depth) {
            this.destroyRest();
            this.top.dirty = NOT_DIRTY;
            this.index = this.stack.pop();
            this.top = this.stack.pop();
            depth--;
        }
        while (depth < marks.length) {
            this.stack.push(this.top, this.index + 1);
            let found = -1;
            for (let i = this.index; i < Math.min(this.index + 3, this.top.children.length); i++) {
                let next = this.top.children[i];
                if (next.matchesMark(marks[depth]) && !this.isLocked(next.dom)) {
                    found = i;
                    break;
                }
            }
            if (found > -1) {
                if (found > this.index) {
                    this.changed = true;
                    this.destroyBetween(this.index, found);
                }
                this.top = this.top.children[this.index];
            }
            else {
                let markDesc = MarkViewDesc.create(this.top, marks[depth], inline, view);
                this.top.children.splice(this.index, 0, markDesc);
                this.top = markDesc;
                this.changed = true;
            }
            this.index = 0;
            depth++;
        }
    }
    // Try to find a node desc matching the given data. Skip over it and
    // return true when successful.
    findNodeMatch(node, outerDeco, innerDeco, index) {
        let found = -1, targetDesc;
        if (index >= this.preMatch.index &&
            (targetDesc = this.preMatch.matches[index - this.preMatch.index]).parent == this.top &&
            targetDesc.matchesNode(node, outerDeco, innerDeco)) {
            found = this.top.children.indexOf(targetDesc, this.index);
        }
        else {
            for (let i = this.index, e = Math.min(this.top.children.length, i + 5); i < e; i++) {
                let child = this.top.children[i];
                if (child.matchesNode(node, outerDeco, innerDeco) && !this.preMatch.matched.has(child)) {
                    found = i;
                    break;
                }
            }
        }
        if (found < 0)
            return false;
        this.destroyBetween(this.index, found);
        this.index++;
        return true;
    }
    updateNodeAt(node, outerDeco, innerDeco, index, view) {
        let child = this.top.children[index];
        if (child.dirty == NODE_DIRTY && child.dom == child.contentDOM)
            child.dirty = CONTENT_DIRTY;
        if (!child.update(node, outerDeco, innerDeco, view))
            return false;
        this.destroyBetween(this.index, index);
        this.index++;
        return true;
    }
    findIndexWithChild(domNode) {
        for (;;) {
            let parent = domNode.parentNode;
            if (!parent)
                return -1;
            if (parent == this.top.contentDOM) {
                let desc = domNode.pmViewDesc;
                if (desc)
                    for (let i = this.index; i < this.top.children.length; i++) {
                        if (this.top.children[i] == desc)
                            return i;
                    }
                return -1;
            }
            domNode = parent;
        }
    }
    // Try to update the next node, if any, to the given data. Checks
    // pre-matches to avoid overwriting nodes that could still be used.
    updateNextNode(node, outerDeco, innerDeco, view, index) {
        for (let i = this.index; i < this.top.children.length; i++) {
            let next = this.top.children[i];
            if (next instanceof NodeViewDesc) {
                let preMatch = this.preMatch.matched.get(next);
                if (preMatch != null && preMatch != index)
                    return false;
                let nextDOM = next.dom;
                // Can't update if nextDOM is or contains this.lock, except if
                // it's a text node whose content already matches the new text
                // and whose decorations match the new ones.
                let locked = this.isLocked(nextDOM) &&
                    !(node.isText && next.node && next.node.isText && next.nodeDOM.nodeValue == node.text &&
                        next.dirty != NODE_DIRTY && sameOuterDeco(outerDeco, next.outerDeco));
                if (!locked && next.update(node, outerDeco, innerDeco, view)) {
                    this.destroyBetween(this.index, i);
                    if (next.dom != nextDOM)
                        this.changed = true;
                    this.index++;
                    return true;
                }
                break;
            }
        }
        return false;
    }
    // Insert the node as a newly created node desc.
    addNode(node, outerDeco, innerDeco, view, pos) {
        this.top.children.splice(this.index++, 0, NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos));
        this.changed = true;
    }
    placeWidget(widget, view, pos) {
        let next = this.index < this.top.children.length ? this.top.children[this.index] : null;
        if (next && next.matchesWidget(widget) &&
            (widget == next.widget || !next.widget.type.toDOM.parentNode)) {
            this.index++;
        }
        else {
            let desc = new WidgetViewDesc(this.top, widget, view, pos);
            this.top.children.splice(this.index++, 0, desc);
            this.changed = true;
        }
    }
    // Make sure a textblock looks and behaves correctly in
    // contentEditable.
    addTextblockHacks() {
        let lastChild = this.top.children[this.index - 1], parent = this.top;
        while (lastChild instanceof MarkViewDesc) {
            parent = lastChild;
            lastChild = parent.children[parent.children.length - 1];
        }
        if (!lastChild || // Empty textblock
            !(lastChild instanceof TextViewDesc) ||
            /\n$/.test(lastChild.node.text) ||
            (this.view.requiresGeckoHackNode && /\s$/.test(lastChild.node.text))) {
            // Avoid bugs in Safari's cursor drawing (#1165) and Chrome's mouse selection (#1152)
            if ((safari || chrome$1) && lastChild && lastChild.dom.contentEditable == "false")
                this.addHackNode("IMG", parent);
            this.addHackNode("BR", this.top);
        }
    }
    addHackNode(nodeName, parent) {
        if (parent == this.top && this.index < parent.children.length && parent.children[this.index].matchesHack(nodeName)) {
            this.index++;
        }
        else {
            let dom = document.createElement(nodeName);
            if (nodeName == "IMG") {
                dom.className = "ProseMirror-separator";
                dom.alt = "";
            }
            if (nodeName == "BR")
                dom.className = "ProseMirror-trailingBreak";
            let hack = new TrailingHackViewDesc(this.top, [], dom, null);
            if (parent != this.top)
                parent.children.push(hack);
            else
                parent.children.splice(this.index++, 0, hack);
            this.changed = true;
        }
    }
    isLocked(node) {
        return this.lock && (node == this.lock || node.nodeType == 1 && node.contains(this.lock.parentNode));
    }
}
// Iterate from the end of the fragment and array of descs to find
// directly matching ones, in order to avoid overeagerly reusing those
// for other nodes. Returns the fragment index of the first node that
// is part of the sequence of matched nodes at the end of the
// fragment.
function preMatch(frag, parentDesc) {
    let curDesc = parentDesc, descI = curDesc.children.length;
    let fI = frag.childCount, matched = new Map, matches = [];
    outer: while (fI > 0) {
        let desc;
        for (;;) {
            if (descI) {
                let next = curDesc.children[descI - 1];
                if (next instanceof MarkViewDesc) {
                    curDesc = next;
                    descI = next.children.length;
                }
                else {
                    desc = next;
                    descI--;
                    break;
                }
            }
            else if (curDesc == parentDesc) {
                break outer;
            }
            else {
                // FIXME
                descI = curDesc.parent.children.indexOf(curDesc);
                curDesc = curDesc.parent;
            }
        }
        let node = desc.node;
        if (!node)
            continue;
        if (node != frag.child(fI - 1))
            break;
        --fI;
        matched.set(desc, fI);
        matches.push(desc);
    }
    return { index: fI, matched, matches: matches.reverse() };
}
function compareSide(a, b) {
    return a.type.side - b.type.side;
}
// This function abstracts iterating over the nodes and decorations in
// a fragment. Calls `onNode` for each node, with its local and child
// decorations. Splits text nodes when there is a decoration starting
// or ending inside of them. Calls `onWidget` for each widget.
function iterDeco(parent, deco, onWidget, onNode) {
    let locals = deco.locals(parent), offset = 0;
    // Simple, cheap variant for when there are no local decorations
    if (locals.length == 0) {
        for (let i = 0; i < parent.childCount; i++) {
            let child = parent.child(i);
            onNode(child, locals, deco.forChild(offset, child), i);
            offset += child.nodeSize;
        }
        return;
    }
    let decoIndex = 0, active = [], restNode = null;
    for (let parentIndex = 0;;) {
        if (decoIndex < locals.length && locals[decoIndex].to == offset) {
            let widget = locals[decoIndex++], widgets;
            while (decoIndex < locals.length && locals[decoIndex].to == offset)
                (widgets || (widgets = [widget])).push(locals[decoIndex++]);
            if (widgets) {
                widgets.sort(compareSide);
                for (let i = 0; i < widgets.length; i++)
                    onWidget(widgets[i], parentIndex, !!restNode);
            }
            else {
                onWidget(widget, parentIndex, !!restNode);
            }
        }
        let child, index;
        if (restNode) {
            index = -1;
            child = restNode;
            restNode = null;
        }
        else if (parentIndex < parent.childCount) {
            index = parentIndex;
            child = parent.child(parentIndex++);
        }
        else {
            break;
        }
        for (let i = 0; i < active.length; i++)
            if (active[i].to <= offset)
                active.splice(i--, 1);
        while (decoIndex < locals.length && locals[decoIndex].from <= offset && locals[decoIndex].to > offset)
            active.push(locals[decoIndex++]);
        let end = offset + child.nodeSize;
        if (child.isText) {
            let cutAt = end;
            if (decoIndex < locals.length && locals[decoIndex].from < cutAt)
                cutAt = locals[decoIndex].from;
            for (let i = 0; i < active.length; i++)
                if (active[i].to < cutAt)
                    cutAt = active[i].to;
            if (cutAt < end) {
                restNode = child.cut(cutAt - offset);
                child = child.cut(0, cutAt - offset);
                end = cutAt;
                index = -1;
            }
        }
        let outerDeco = child.isInline && !child.isLeaf ? active.filter(d => !d.inline) : active.slice();
        onNode(child, outerDeco, deco.forChild(offset, child), index);
        offset = end;
    }
}
// List markers in Mobile Safari will mysteriously disappear
// sometimes. This works around that.
function iosHacks(dom) {
    if (dom.nodeName == "UL" || dom.nodeName == "OL") {
        let oldCSS = dom.style.cssText;
        dom.style.cssText = oldCSS + "; list-style: square !important";
        window.getComputedStyle(dom).listStyle;
        dom.style.cssText = oldCSS;
    }
}
function nearbyTextNode(node, offset) {
    for (;;) {
        if (node.nodeType == 3)
            return node;
        if (node.nodeType == 1 && offset > 0) {
            if (node.childNodes.length > offset && node.childNodes[offset].nodeType == 3)
                return node.childNodes[offset];
            node = node.childNodes[offset - 1];
            offset = nodeSize(node);
        }
        else if (node.nodeType == 1 && offset < node.childNodes.length) {
            node = node.childNodes[offset];
            offset = 0;
        }
        else {
            return null;
        }
    }
}
// Find a piece of text in an inline fragment, overlapping from-to
function findTextInFragment(frag, text, from, to) {
    for (let i = 0, pos = 0; i < frag.childCount && pos <= to;) {
        let child = frag.child(i++), childStart = pos;
        pos += child.nodeSize;
        if (!child.isText)
            continue;
        let str = child.text;
        while (i < frag.childCount) {
            let next = frag.child(i++);
            pos += next.nodeSize;
            if (!next.isText)
                break;
            str += next.text;
        }
        if (pos >= from) {
            let found = childStart < to ? str.lastIndexOf(text, to - childStart - 1) : -1;
            if (found >= 0 && found + text.length + childStart >= from)
                return childStart + found;
            if (from == to && str.length >= (to + text.length) - childStart &&
                str.slice(to - childStart, to - childStart + text.length) == text)
                return to;
        }
    }
    return -1;
}
// Replace range from-to in an array of view descs with replacement
// (may be null to just delete). This goes very much against the grain
// of the rest of this code, which tends to create nodes with the
// right shape in one go, rather than messing with them after
// creation, but is necessary in the composition hack.
function replaceNodes(nodes, from, to, view, replacement) {
    let result = [];
    for (let i = 0, off = 0; i < nodes.length; i++) {
        let child = nodes[i], start = off, end = off += child.size;
        if (start >= to || end <= from) {
            result.push(child);
        }
        else {
            if (start < from)
                result.push(child.slice(0, from - start, view));
            if (replacement) {
                result.push(replacement);
                replacement = undefined;
            }
            if (end > to)
                result.push(child.slice(to - start, child.size, view));
        }
    }
    return result;
}

function selectionFromDOM(view, origin = null) {
    let domSel = view.domSelectionRange(), doc = view.state.doc;
    if (!domSel.focusNode)
        return null;
    let nearestDesc = view.docView.nearestDesc(domSel.focusNode), inWidget = nearestDesc && nearestDesc.size == 0;
    let head = view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset, 1);
    if (head < 0)
        return null;
    let $head = doc.resolve(head), $anchor, selection;
    if (selectionCollapsed(domSel)) {
        $anchor = $head;
        while (nearestDesc && !nearestDesc.node)
            nearestDesc = nearestDesc.parent;
        let nearestDescNode = nearestDesc.node;
        if (nearestDesc && nearestDescNode.isAtom && NodeSelection.isSelectable(nearestDescNode) && nearestDesc.parent
            && !(nearestDescNode.isInline && isOnEdge(domSel.focusNode, domSel.focusOffset, nearestDesc.dom))) {
            let pos = nearestDesc.posBefore;
            selection = new NodeSelection(head == pos ? $head : doc.resolve(pos));
        }
    }
    else {
        let anchor = view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset, 1);
        if (anchor < 0)
            return null;
        $anchor = doc.resolve(anchor);
    }
    if (!selection) {
        let bias = origin == "pointer" || (view.state.selection.head < $head.pos && !inWidget) ? 1 : -1;
        selection = selectionBetween(view, $anchor, $head, bias);
    }
    return selection;
}
function editorOwnsSelection(view) {
    return view.editable ? view.hasFocus() :
        hasSelection(view) && document.activeElement && document.activeElement.contains(view.dom);
}
function selectionToDOM(view, force = false) {
    let sel = view.state.selection;
    syncNodeSelection(view, sel);
    if (!editorOwnsSelection(view))
        return;
    // The delayed drag selection causes issues with Cell Selections
    // in Safari. And the drag selection delay is to workarond issues
    // which only present in Chrome.
    if (!force && view.input.mouseDown && view.input.mouseDown.allowDefault && chrome$1) {
        let domSel = view.domSelectionRange(), curSel = view.domObserver.currentSelection;
        if (domSel.anchorNode && curSel.anchorNode &&
            isEquivalentPosition(domSel.anchorNode, domSel.anchorOffset, curSel.anchorNode, curSel.anchorOffset)) {
            view.input.mouseDown.delayedSelectionSync = true;
            view.domObserver.setCurSelection();
            return;
        }
    }
    view.domObserver.disconnectSelection();
    if (view.cursorWrapper) {
        selectCursorWrapper(view);
    }
    else {
        let { anchor, head } = sel, resetEditableFrom, resetEditableTo;
        if (brokenSelectBetweenUneditable && !(sel instanceof TextSelection)) {
            if (!sel.$from.parent.inlineContent)
                resetEditableFrom = temporarilyEditableNear(view, sel.from);
            if (!sel.empty && !sel.$from.parent.inlineContent)
                resetEditableTo = temporarilyEditableNear(view, sel.to);
        }
        view.docView.setSelection(anchor, head, view.root, force);
        if (brokenSelectBetweenUneditable) {
            if (resetEditableFrom)
                resetEditable(resetEditableFrom);
            if (resetEditableTo)
                resetEditable(resetEditableTo);
        }
        if (sel.visible) {
            view.dom.classList.remove("ProseMirror-hideselection");
        }
        else {
            view.dom.classList.add("ProseMirror-hideselection");
            if ("onselectionchange" in document)
                removeClassOnSelectionChange(view);
        }
    }
    view.domObserver.setCurSelection();
    view.domObserver.connectSelection();
}
// Kludge to work around Webkit not allowing a selection to start/end
// between non-editable block nodes. We briefly make something
// editable, set the selection, then set it uneditable again.
const brokenSelectBetweenUneditable = safari || chrome$1 && chrome_version < 63;
function temporarilyEditableNear(view, pos) {
    let { node, offset } = view.docView.domFromPos(pos, 0);
    let after = offset < node.childNodes.length ? node.childNodes[offset] : null;
    let before = offset ? node.childNodes[offset - 1] : null;
    if (safari && after && after.contentEditable == "false")
        return setEditable(after);
    if ((!after || after.contentEditable == "false") &&
        (!before || before.contentEditable == "false")) {
        if (after)
            return setEditable(after);
        else if (before)
            return setEditable(before);
    }
}
function setEditable(element) {
    element.contentEditable = "true";
    if (safari && element.draggable) {
        element.draggable = false;
        element.wasDraggable = true;
    }
    return element;
}
function resetEditable(element) {
    element.contentEditable = "false";
    if (element.wasDraggable) {
        element.draggable = true;
        element.wasDraggable = null;
    }
}
function removeClassOnSelectionChange(view) {
    let doc = view.dom.ownerDocument;
    doc.removeEventListener("selectionchange", view.input.hideSelectionGuard);
    let domSel = view.domSelectionRange();
    let node = domSel.anchorNode, offset = domSel.anchorOffset;
    doc.addEventListener("selectionchange", view.input.hideSelectionGuard = () => {
        if (domSel.anchorNode != node || domSel.anchorOffset != offset) {
            doc.removeEventListener("selectionchange", view.input.hideSelectionGuard);
            setTimeout(() => {
                if (!editorOwnsSelection(view) || view.state.selection.visible)
                    view.dom.classList.remove("ProseMirror-hideselection");
            }, 20);
        }
    });
}
function selectCursorWrapper(view) {
    let domSel = view.domSelection(), range = document.createRange();
    let node = view.cursorWrapper.dom, img = node.nodeName == "IMG";
    if (img)
        range.setEnd(node.parentNode, domIndex(node) + 1);
    else
        range.setEnd(node, 0);
    range.collapse(false);
    domSel.removeAllRanges();
    domSel.addRange(range);
    // Kludge to kill 'control selection' in IE11 when selecting an
    // invisible cursor wrapper, since that would result in those weird
    // resize handles and a selection that considers the absolutely
    // positioned wrapper, rather than the root editable node, the
    // focused element.
    if (!img && !view.state.selection.visible && ie$1 && ie_version <= 11) {
        node.disabled = true;
        node.disabled = false;
    }
}
function syncNodeSelection(view, sel) {
    if (sel instanceof NodeSelection) {
        let desc = view.docView.descAt(sel.from);
        if (desc != view.lastSelectedViewDesc) {
            clearNodeSelection(view);
            if (desc)
                desc.selectNode();
            view.lastSelectedViewDesc = desc;
        }
    }
    else {
        clearNodeSelection(view);
    }
}
// Clear all DOM statefulness of the last node selection.
function clearNodeSelection(view) {
    if (view.lastSelectedViewDesc) {
        if (view.lastSelectedViewDesc.parent)
            view.lastSelectedViewDesc.deselectNode();
        view.lastSelectedViewDesc = undefined;
    }
}
function selectionBetween(view, $anchor, $head, bias) {
    return view.someProp("createSelectionBetween", f => f(view, $anchor, $head))
        || TextSelection.between($anchor, $head, bias);
}
function hasFocusAndSelection(view) {
    if (view.editable && !view.hasFocus())
        return false;
    return hasSelection(view);
}
function hasSelection(view) {
    let sel = view.domSelectionRange();
    if (!sel.anchorNode)
        return false;
    try {
        // Firefox will raise 'permission denied' errors when accessing
        // properties of `sel.anchorNode` when it's in a generated CSS
        // element.
        return view.dom.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode) &&
            (view.editable || view.dom.contains(sel.focusNode.nodeType == 3 ? sel.focusNode.parentNode : sel.focusNode));
    }
    catch (_) {
        return false;
    }
}
function anchorInRightPlace(view) {
    let anchorDOM = view.docView.domFromPos(view.state.selection.anchor, 0);
    let domSel = view.domSelectionRange();
    return isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset);
}

function moveSelectionBlock(state, dir) {
    let { $anchor, $head } = state.selection;
    let $side = dir > 0 ? $anchor.max($head) : $anchor.min($head);
    let $start = !$side.parent.inlineContent ? $side : $side.depth ? state.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null;
    return $start && Selection.findFrom($start, dir);
}
function apply(view, sel) {
    view.dispatch(view.state.tr.setSelection(sel).scrollIntoView());
    return true;
}
function selectHorizontally(view, dir, mods) {
    let sel = view.state.selection;
    if (sel instanceof TextSelection) {
        if (!sel.empty || mods.indexOf("s") > -1) {
            return false;
        }
        else if (view.endOfTextblock(dir > 0 ? "right" : "left")) {
            let next = moveSelectionBlock(view.state, dir);
            if (next && (next instanceof NodeSelection))
                return apply(view, next);
            return false;
        }
        else if (!(mac$2 && mods.indexOf("m") > -1)) {
            let $head = sel.$head, node = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter, desc;
            if (!node || node.isText)
                return false;
            let nodePos = dir < 0 ? $head.pos - node.nodeSize : $head.pos;
            if (!(node.isAtom || (desc = view.docView.descAt(nodePos)) && !desc.contentDOM))
                return false;
            if (NodeSelection.isSelectable(node)) {
                return apply(view, new NodeSelection(dir < 0 ? view.state.doc.resolve($head.pos - node.nodeSize) : $head));
            }
            else if (webkit) {
                // Chrome and Safari will introduce extra pointless cursor
                // positions around inline uneditable nodes, so we have to
                // take over and move the cursor past them (#937)
                return apply(view, new TextSelection(view.state.doc.resolve(dir < 0 ? nodePos : nodePos + node.nodeSize)));
            }
            else {
                return false;
            }
        }
    }
    else if (sel instanceof NodeSelection && sel.node.isInline) {
        return apply(view, new TextSelection(dir > 0 ? sel.$to : sel.$from));
    }
    else {
        let next = moveSelectionBlock(view.state, dir);
        if (next)
            return apply(view, next);
        return false;
    }
}
function nodeLen(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
function isIgnorable(dom) {
    let desc = dom.pmViewDesc;
    return desc && desc.size == 0 && (dom.nextSibling || dom.nodeName != "BR");
}
// Make sure the cursor isn't directly after one or more ignored
// nodes, which will confuse the browser's cursor motion logic.
function skipIgnoredNodesLeft(view) {
    let sel = view.domSelectionRange();
    let node = sel.focusNode, offset = sel.focusOffset;
    if (!node)
        return;
    let moveNode, moveOffset, force = false;
    // Gecko will do odd things when the selection is directly in front
    // of a non-editable node, so in that case, move it into the next
    // node if possible. Issue prosemirror/prosemirror#832.
    if (gecko && node.nodeType == 1 && offset < nodeLen(node) && isIgnorable(node.childNodes[offset]))
        force = true;
    for (;;) {
        if (offset > 0) {
            if (node.nodeType != 1) {
                break;
            }
            else {
                let before = node.childNodes[offset - 1];
                if (isIgnorable(before)) {
                    moveNode = node;
                    moveOffset = --offset;
                }
                else if (before.nodeType == 3) {
                    node = before;
                    offset = node.nodeValue.length;
                }
                else
                    break;
            }
        }
        else if (isBlockNode(node)) {
            break;
        }
        else {
            let prev = node.previousSibling;
            while (prev && isIgnorable(prev)) {
                moveNode = node.parentNode;
                moveOffset = domIndex(prev);
                prev = prev.previousSibling;
            }
            if (!prev) {
                node = node.parentNode;
                if (node == view.dom)
                    break;
                offset = 0;
            }
            else {
                node = prev;
                offset = nodeLen(node);
            }
        }
    }
    if (force)
        setSelFocus(view, node, offset);
    else if (moveNode)
        setSelFocus(view, moveNode, moveOffset);
}
// Make sure the cursor isn't directly before one or more ignored
// nodes.
function skipIgnoredNodesRight(view) {
    let sel = view.domSelectionRange();
    let node = sel.focusNode, offset = sel.focusOffset;
    if (!node)
        return;
    let len = nodeLen(node);
    let moveNode, moveOffset;
    for (;;) {
        if (offset < len) {
            if (node.nodeType != 1)
                break;
            let after = node.childNodes[offset];
            if (isIgnorable(after)) {
                moveNode = node;
                moveOffset = ++offset;
            }
            else
                break;
        }
        else if (isBlockNode(node)) {
            break;
        }
        else {
            let next = node.nextSibling;
            while (next && isIgnorable(next)) {
                moveNode = next.parentNode;
                moveOffset = domIndex(next) + 1;
                next = next.nextSibling;
            }
            if (!next) {
                node = node.parentNode;
                if (node == view.dom)
                    break;
                offset = len = 0;
            }
            else {
                node = next;
                offset = 0;
                len = nodeLen(node);
            }
        }
    }
    if (moveNode)
        setSelFocus(view, moveNode, moveOffset);
}
function isBlockNode(dom) {
    let desc = dom.pmViewDesc;
    return desc && desc.node && desc.node.isBlock;
}
function setSelFocus(view, node, offset) {
    let sel = view.domSelection();
    if (selectionCollapsed(sel)) {
        let range = document.createRange();
        range.setEnd(node, offset);
        range.setStart(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    else if (sel.extend) {
        sel.extend(node, offset);
    }
    view.domObserver.setCurSelection();
    let { state } = view;
    // If no state update ends up happening, reset the selection.
    setTimeout(() => {
        if (view.state == state)
            selectionToDOM(view);
    }, 50);
}
// Check whether vertical selection motion would involve node
// selections. If so, apply it (if not, the result is left to the
// browser)
function selectVertically(view, dir, mods) {
    let sel = view.state.selection;
    if (sel instanceof TextSelection && !sel.empty || mods.indexOf("s") > -1)
        return false;
    if (mac$2 && mods.indexOf("m") > -1)
        return false;
    let { $from, $to } = sel;
    if (!$from.parent.inlineContent || view.endOfTextblock(dir < 0 ? "up" : "down")) {
        let next = moveSelectionBlock(view.state, dir);
        if (next && (next instanceof NodeSelection))
            return apply(view, next);
    }
    if (!$from.parent.inlineContent) {
        let side = dir < 0 ? $from : $to;
        let beyond = sel instanceof AllSelection ? Selection.near(side, dir) : Selection.findFrom(side, dir);
        return beyond ? apply(view, beyond) : false;
    }
    return false;
}
function stopNativeHorizontalDelete(view, dir) {
    if (!(view.state.selection instanceof TextSelection))
        return true;
    let { $head, $anchor, empty } = view.state.selection;
    if (!$head.sameParent($anchor))
        return true;
    if (!empty)
        return false;
    if (view.endOfTextblock(dir > 0 ? "forward" : "backward"))
        return true;
    let nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter);
    if (nextNode && !nextNode.isText) {
        let tr = view.state.tr;
        if (dir < 0)
            tr.delete($head.pos - nextNode.nodeSize, $head.pos);
        else
            tr.delete($head.pos, $head.pos + nextNode.nodeSize);
        view.dispatch(tr);
        return true;
    }
    return false;
}
function switchEditable(view, node, state) {
    view.domObserver.stop();
    node.contentEditable = state;
    view.domObserver.start();
}
// Issue #867 / #1090 / https://bugs.chromium.org/p/chromium/issues/detail?id=903821
// In which Safari (and at some point in the past, Chrome) does really
// wrong things when the down arrow is pressed when the cursor is
// directly at the start of a textblock and has an uneditable node
// after it
function safariDownArrowBug(view) {
    if (!safari || view.state.selection.$head.parentOffset > 0)
        return false;
    let { focusNode, focusOffset } = view.domSelectionRange();
    if (focusNode && focusNode.nodeType == 1 && focusOffset == 0 &&
        focusNode.firstChild && focusNode.firstChild.contentEditable == "false") {
        let child = focusNode.firstChild;
        switchEditable(view, child, "true");
        setTimeout(() => switchEditable(view, child, "false"), 20);
    }
    return false;
}
// A backdrop key mapping used to make sure we always suppress keys
// that have a dangerous default effect, even if the commands they are
// bound to return false, and to make sure that cursor-motion keys
// find a cursor (as opposed to a node selection) when pressed. For
// cursor-motion keys, the code in the handlers also takes care of
// block selections.
function getMods(event) {
    let result = "";
    if (event.ctrlKey)
        result += "c";
    if (event.metaKey)
        result += "m";
    if (event.altKey)
        result += "a";
    if (event.shiftKey)
        result += "s";
    return result;
}
function captureKeyDown(view, event) {
    let code = event.keyCode, mods = getMods(event);
    if (code == 8 || (mac$2 && code == 72 && mods == "c")) { // Backspace, Ctrl-h on Mac
        return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodesLeft(view);
    }
    else if (code == 46 || (mac$2 && code == 68 && mods == "c")) { // Delete, Ctrl-d on Mac
        return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodesRight(view);
    }
    else if (code == 13 || code == 27) { // Enter, Esc
        return true;
    }
    else if (code == 37 || (mac$2 && code == 66 && mods == "c")) { // Left arrow, Ctrl-b on Mac
        return selectHorizontally(view, -1, mods) || skipIgnoredNodesLeft(view);
    }
    else if (code == 39 || (mac$2 && code == 70 && mods == "c")) { // Right arrow, Ctrl-f on Mac
        return selectHorizontally(view, 1, mods) || skipIgnoredNodesRight(view);
    }
    else if (code == 38 || (mac$2 && code == 80 && mods == "c")) { // Up arrow, Ctrl-p on Mac
        return selectVertically(view, -1, mods) || skipIgnoredNodesLeft(view);
    }
    else if (code == 40 || (mac$2 && code == 78 && mods == "c")) { // Down arrow, Ctrl-n on Mac
        return safariDownArrowBug(view) || selectVertically(view, 1, mods) || skipIgnoredNodesRight(view);
    }
    else if (mods == (mac$2 ? "m" : "c") &&
        (code == 66 || code == 73 || code == 89 || code == 90)) { // Mod-[biyz]
        return true;
    }
    return false;
}

function serializeForClipboard(view, slice) {
    view.someProp("transformCopied", f => { slice = f(slice, view); });
    let context = [], { content, openStart, openEnd } = slice;
    while (openStart > 1 && openEnd > 1 && content.childCount == 1 && content.firstChild.childCount == 1) {
        openStart--;
        openEnd--;
        let node = content.firstChild;
        context.push(node.type.name, node.attrs != node.type.defaultAttrs ? node.attrs : null);
        content = node.content;
    }
    let serializer = view.someProp("clipboardSerializer") || DOMSerializer.fromSchema(view.state.schema);
    let doc = detachedDoc(), wrap = doc.createElement("div");
    wrap.appendChild(serializer.serializeFragment(content, { document: doc }));
    let firstChild = wrap.firstChild, needsWrap, wrappers = 0;
    while (firstChild && firstChild.nodeType == 1 && (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])) {
        for (let i = needsWrap.length - 1; i >= 0; i--) {
            let wrapper = doc.createElement(needsWrap[i]);
            while (wrap.firstChild)
                wrapper.appendChild(wrap.firstChild);
            wrap.appendChild(wrapper);
            wrappers++;
        }
        firstChild = wrap.firstChild;
    }
    if (firstChild && firstChild.nodeType == 1)
        firstChild.setAttribute("data-pm-slice", `${openStart} ${openEnd}${wrappers ? ` -${wrappers}` : ""} ${JSON.stringify(context)}`);
    let text = view.someProp("clipboardTextSerializer", f => f(slice, view)) ||
        slice.content.textBetween(0, slice.content.size, "\n\n");
    return { dom: wrap, text };
}
// Read a slice of content from the clipboard (or drop data).
function parseFromClipboard(view, text, html, plainText, $context) {
    let inCode = $context.parent.type.spec.code;
    let dom, slice;
    if (!html && !text)
        return null;
    let asText = text && (plainText || inCode || !html);
    if (asText) {
        view.someProp("transformPastedText", f => { text = f(text, inCode || plainText, view); });
        if (inCode)
            return text ? new Slice(Fragment.from(view.state.schema.text(text.replace(/\r\n?/g, "\n"))), 0, 0) : Slice.empty;
        let parsed = view.someProp("clipboardTextParser", f => f(text, $context, plainText, view));
        if (parsed) {
            slice = parsed;
        }
        else {
            let marks = $context.marks();
            let { schema } = view.state, serializer = DOMSerializer.fromSchema(schema);
            dom = document.createElement("div");
            text.split(/(?:\r\n?|\n)+/).forEach(block => {
                let p = dom.appendChild(document.createElement("p"));
                if (block)
                    p.appendChild(serializer.serializeNode(schema.text(block, marks)));
            });
        }
    }
    else {
        view.someProp("transformPastedHTML", f => { html = f(html, view); });
        dom = readHTML(html);
        if (webkit)
            restoreReplacedSpaces(dom);
    }
    let contextNode = dom && dom.querySelector("[data-pm-slice]");
    let sliceData = contextNode && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(contextNode.getAttribute("data-pm-slice") || "");
    if (sliceData && sliceData[3])
        for (let i = +sliceData[3]; i > 0; i--) {
            let child = dom.firstChild;
            while (child && child.nodeType != 1)
                child = child.nextSibling;
            if (!child)
                break;
            dom = child;
        }
    if (!slice) {
        let parser = view.someProp("clipboardParser") || view.someProp("domParser") || DOMParser.fromSchema(view.state.schema);
        slice = parser.parseSlice(dom, {
            preserveWhitespace: !!(asText || sliceData),
            context: $context,
            ruleFromNode(dom) {
                if (dom.nodeName == "BR" && !dom.nextSibling &&
                    dom.parentNode && !inlineParents.test(dom.parentNode.nodeName))
                    return { ignore: true };
                return null;
            }
        });
    }
    if (sliceData) {
        slice = addContext(closeSlice(slice, +sliceData[1], +sliceData[2]), sliceData[4]);
    }
    else { // HTML wasn't created by ProseMirror. Make sure top-level siblings are coherent
        slice = Slice.maxOpen(normalizeSiblings(slice.content, $context), true);
        if (slice.openStart || slice.openEnd) {
            let openStart = 0, openEnd = 0;
            for (let node = slice.content.firstChild; openStart < slice.openStart && !node.type.spec.isolating; openStart++, node = node.firstChild) { }
            for (let node = slice.content.lastChild; openEnd < slice.openEnd && !node.type.spec.isolating; openEnd++, node = node.lastChild) { }
            slice = closeSlice(slice, openStart, openEnd);
        }
    }
    view.someProp("transformPasted", f => { slice = f(slice, view); });
    return slice;
}
const inlineParents = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
// Takes a slice parsed with parseSlice, which means there hasn't been
// any content-expression checking done on the top nodes, tries to
// find a parent node in the current context that might fit the nodes,
// and if successful, rebuilds the slice so that it fits into that parent.
//
// This addresses the problem that Transform.replace expects a
// coherent slice, and will fail to place a set of siblings that don't
// fit anywhere in the schema.
function normalizeSiblings(fragment, $context) {
    if (fragment.childCount < 2)
        return fragment;
    for (let d = $context.depth; d >= 0; d--) {
        let parent = $context.node(d);
        let match = parent.contentMatchAt($context.index(d));
        let lastWrap, result = [];
        fragment.forEach(node => {
            if (!result)
                return;
            let wrap = match.findWrapping(node.type), inLast;
            if (!wrap)
                return result = null;
            if (inLast = result.length && lastWrap.length && addToSibling(wrap, lastWrap, node, result[result.length - 1], 0)) {
                result[result.length - 1] = inLast;
            }
            else {
                if (result.length)
                    result[result.length - 1] = closeRight(result[result.length - 1], lastWrap.length);
                let wrapped = withWrappers(node, wrap);
                result.push(wrapped);
                match = match.matchType(wrapped.type);
                lastWrap = wrap;
            }
        });
        if (result)
            return Fragment.from(result);
    }
    return fragment;
}
function withWrappers(node, wrap, from = 0) {
    for (let i = wrap.length - 1; i >= from; i--)
        node = wrap[i].create(null, Fragment.from(node));
    return node;
}
// Used to group adjacent nodes wrapped in similar parents by
// normalizeSiblings into the same parent node
function addToSibling(wrap, lastWrap, node, sibling, depth) {
    if (depth < wrap.length && depth < lastWrap.length && wrap[depth] == lastWrap[depth]) {
        let inner = addToSibling(wrap, lastWrap, node, sibling.lastChild, depth + 1);
        if (inner)
            return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner));
        let match = sibling.contentMatchAt(sibling.childCount);
        if (match.matchType(depth == wrap.length - 1 ? node.type : wrap[depth + 1]))
            return sibling.copy(sibling.content.append(Fragment.from(withWrappers(node, wrap, depth + 1))));
    }
}
function closeRight(node, depth) {
    if (depth == 0)
        return node;
    let fragment = node.content.replaceChild(node.childCount - 1, closeRight(node.lastChild, depth - 1));
    let fill = node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true);
    return node.copy(fragment.append(fill));
}
function closeRange(fragment, side, from, to, depth, openEnd) {
    let node = side < 0 ? fragment.firstChild : fragment.lastChild, inner = node.content;
    if (depth < to - 1)
        inner = closeRange(inner, side, from, to, depth + 1, openEnd);
    if (depth >= from)
        inner = side < 0 ? node.contentMatchAt(0).fillBefore(inner, fragment.childCount > 1 || openEnd <= depth).append(inner)
            : inner.append(node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true));
    return fragment.replaceChild(side < 0 ? 0 : fragment.childCount - 1, node.copy(inner));
}
function closeSlice(slice, openStart, openEnd) {
    if (openStart < slice.openStart)
        slice = new Slice(closeRange(slice.content, -1, openStart, slice.openStart, 0, slice.openEnd), openStart, slice.openEnd);
    if (openEnd < slice.openEnd)
        slice = new Slice(closeRange(slice.content, 1, openEnd, slice.openEnd, 0, 0), slice.openStart, openEnd);
    return slice;
}
// Trick from jQuery -- some elements must be wrapped in other
// elements for innerHTML to work. I.e. if you do `div.innerHTML =
// "<td>..</td>"` the table cells are ignored.
const wrapMap = {
    thead: ["table"],
    tbody: ["table"],
    tfoot: ["table"],
    caption: ["table"],
    colgroup: ["table"],
    col: ["table", "colgroup"],
    tr: ["table", "tbody"],
    td: ["table", "tbody", "tr"],
    th: ["table", "tbody", "tr"]
};
let _detachedDoc = null;
function detachedDoc() {
    return _detachedDoc || (_detachedDoc = document.implementation.createHTMLDocument("title"));
}
function readHTML(html) {
    let metas = /^(\s*<meta [^>]*>)*/.exec(html);
    if (metas)
        html = html.slice(metas[0].length);
    let elt = detachedDoc().createElement("div");
    let firstTag = /<([a-z][^>\s]+)/i.exec(html), wrap;
    if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()])
        html = wrap.map(n => "<" + n + ">").join("") + html + wrap.map(n => "</" + n + ">").reverse().join("");
    elt.innerHTML = html;
    if (wrap)
        for (let i = 0; i < wrap.length; i++)
            elt = elt.querySelector(wrap[i]) || elt;
    return elt;
}
// Webkit browsers do some hard-to-predict replacement of regular
// spaces with non-breaking spaces when putting content on the
// clipboard. This tries to convert such non-breaking spaces (which
// will be wrapped in a plain span on Chrome, a span with class
// Apple-converted-space on Safari) back to regular spaces.
function restoreReplacedSpaces(dom) {
    let nodes = dom.querySelectorAll(chrome$1 ? "span:not([class]):not([style])" : "span.Apple-converted-space");
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.childNodes.length == 1 && node.textContent == "\u00a0" && node.parentNode)
            node.parentNode.replaceChild(dom.ownerDocument.createTextNode(" "), node);
    }
}
function addContext(slice, context) {
    if (!slice.size)
        return slice;
    let schema = slice.content.firstChild.type.schema, array;
    try {
        array = JSON.parse(context);
    }
    catch (e) {
        return slice;
    }
    let { content, openStart, openEnd } = slice;
    for (let i = array.length - 2; i >= 0; i -= 2) {
        let type = schema.nodes[array[i]];
        if (!type || type.hasRequiredAttrs())
            break;
        content = Fragment.from(type.create(array[i + 1], content));
        openStart++;
        openEnd++;
    }
    return new Slice(content, openStart, openEnd);
}

// A collection of DOM events that occur within the editor, and callback functions
// to invoke when the event fires.
const handlers = {};
const editHandlers = {};
const passiveHandlers = { touchstart: true, touchmove: true };
class InputState {
    constructor() {
        this.shiftKey = false;
        this.mouseDown = null;
        this.lastKeyCode = null;
        this.lastKeyCodeTime = 0;
        this.lastClick = { time: 0, x: 0, y: 0, type: "" };
        this.lastSelectionOrigin = null;
        this.lastSelectionTime = 0;
        this.lastIOSEnter = 0;
        this.lastIOSEnterFallbackTimeout = -1;
        this.lastFocus = 0;
        this.lastTouch = 0;
        this.lastAndroidDelete = 0;
        this.composing = false;
        this.composingTimeout = -1;
        this.compositionNodes = [];
        this.compositionEndedAt = -2e8;
        this.domChangeCount = 0;
        this.eventHandlers = Object.create(null);
        this.hideSelectionGuard = null;
    }
}
function initInput(view) {
    for (let event in handlers) {
        let handler = handlers[event];
        view.dom.addEventListener(event, view.input.eventHandlers[event] = (event) => {
            if (eventBelongsToView(view, event) && !runCustomHandler(view, event) &&
                (view.editable || !(event.type in editHandlers)))
                handler(view, event);
        }, passiveHandlers[event] ? { passive: true } : undefined);
    }
    // On Safari, for reasons beyond my understanding, adding an input
    // event handler makes an issue where the composition vanishes when
    // you press enter go away.
    if (safari)
        view.dom.addEventListener("input", () => null);
    ensureListeners(view);
}
function setSelectionOrigin(view, origin) {
    view.input.lastSelectionOrigin = origin;
    view.input.lastSelectionTime = Date.now();
}
function destroyInput(view) {
    view.domObserver.stop();
    for (let type in view.input.eventHandlers)
        view.dom.removeEventListener(type, view.input.eventHandlers[type]);
    clearTimeout(view.input.composingTimeout);
    clearTimeout(view.input.lastIOSEnterFallbackTimeout);
}
function ensureListeners(view) {
    view.someProp("handleDOMEvents", currentHandlers => {
        for (let type in currentHandlers)
            if (!view.input.eventHandlers[type])
                view.dom.addEventListener(type, view.input.eventHandlers[type] = event => runCustomHandler(view, event));
    });
}
function runCustomHandler(view, event) {
    return view.someProp("handleDOMEvents", handlers => {
        let handler = handlers[event.type];
        return handler ? handler(view, event) || event.defaultPrevented : false;
    });
}
function eventBelongsToView(view, event) {
    if (!event.bubbles)
        return true;
    if (event.defaultPrevented)
        return false;
    for (let node = event.target; node != view.dom; node = node.parentNode)
        if (!node || node.nodeType == 11 ||
            (node.pmViewDesc && node.pmViewDesc.stopEvent(event)))
            return false;
    return true;
}
function dispatchEvent(view, event) {
    if (!runCustomHandler(view, event) && handlers[event.type] &&
        (view.editable || !(event.type in editHandlers)))
        handlers[event.type](view, event);
}
editHandlers.keydown = (view, _event) => {
    let event = _event;
    view.input.shiftKey = event.keyCode == 16 || event.shiftKey;
    if (inOrNearComposition(view, event))
        return;
    view.input.lastKeyCode = event.keyCode;
    view.input.lastKeyCodeTime = Date.now();
    // Suppress enter key events on Chrome Android, because those tend
    // to be part of a confused sequence of composition events fired,
    // and handling them eagerly tends to corrupt the input.
    if (android && chrome$1 && event.keyCode == 13)
        return;
    if (event.keyCode != 229)
        view.domObserver.forceFlush();
    // On iOS, if we preventDefault enter key presses, the virtual
    // keyboard gets confused. So the hack here is to set a flag that
    // makes the DOM change code recognize that what just happens should
    // be replaced by whatever the Enter key handlers do.
    if (ios && event.keyCode == 13 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        let now = Date.now();
        view.input.lastIOSEnter = now;
        view.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
            if (view.input.lastIOSEnter == now) {
                view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter")));
                view.input.lastIOSEnter = 0;
            }
        }, 200);
    }
    else if (view.someProp("handleKeyDown", f => f(view, event)) || captureKeyDown(view, event)) {
        event.preventDefault();
    }
    else {
        setSelectionOrigin(view, "key");
    }
};
editHandlers.keyup = (view, event) => {
    if (event.keyCode == 16)
        view.input.shiftKey = false;
};
editHandlers.keypress = (view, _event) => {
    let event = _event;
    if (inOrNearComposition(view, event) || !event.charCode ||
        event.ctrlKey && !event.altKey || mac$2 && event.metaKey)
        return;
    if (view.someProp("handleKeyPress", f => f(view, event))) {
        event.preventDefault();
        return;
    }
    let sel = view.state.selection;
    if (!(sel instanceof TextSelection) || !sel.$from.sameParent(sel.$to)) {
        let text = String.fromCharCode(event.charCode);
        if (!/[\r\n]/.test(text) && !view.someProp("handleTextInput", f => f(view, sel.$from.pos, sel.$to.pos, text)))
            view.dispatch(view.state.tr.insertText(text).scrollIntoView());
        event.preventDefault();
    }
};
function eventCoords(event) { return { left: event.clientX, top: event.clientY }; }
function isNear(event, click) {
    let dx = click.x - event.clientX, dy = click.y - event.clientY;
    return dx * dx + dy * dy < 100;
}
function runHandlerOnContext(view, propName, pos, inside, event) {
    if (inside == -1)
        return false;
    let $pos = view.state.doc.resolve(inside);
    for (let i = $pos.depth + 1; i > 0; i--) {
        if (view.someProp(propName, f => i > $pos.depth ? f(view, pos, $pos.nodeAfter, $pos.before(i), event, true)
            : f(view, pos, $pos.node(i), $pos.before(i), event, false)))
            return true;
    }
    return false;
}
function updateSelection(view, selection, origin) {
    if (!view.focused)
        view.focus();
    let tr = view.state.tr.setSelection(selection);
    if (origin == "pointer")
        tr.setMeta("pointer", true);
    view.dispatch(tr);
}
function selectClickedLeaf(view, inside) {
    if (inside == -1)
        return false;
    let $pos = view.state.doc.resolve(inside), node = $pos.nodeAfter;
    if (node && node.isAtom && NodeSelection.isSelectable(node)) {
        updateSelection(view, new NodeSelection($pos), "pointer");
        return true;
    }
    return false;
}
function selectClickedNode(view, inside) {
    if (inside == -1)
        return false;
    let sel = view.state.selection, selectedNode, selectAt;
    if (sel instanceof NodeSelection)
        selectedNode = sel.node;
    let $pos = view.state.doc.resolve(inside);
    for (let i = $pos.depth + 1; i > 0; i--) {
        let node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
        if (NodeSelection.isSelectable(node)) {
            if (selectedNode && sel.$from.depth > 0 &&
                i >= sel.$from.depth && $pos.before(sel.$from.depth + 1) == sel.$from.pos)
                selectAt = $pos.before(sel.$from.depth);
            else
                selectAt = $pos.before(i);
            break;
        }
    }
    if (selectAt != null) {
        updateSelection(view, NodeSelection.create(view.state.doc, selectAt), "pointer");
        return true;
    }
    else {
        return false;
    }
}
function handleSingleClick(view, pos, inside, event, selectNode) {
    return runHandlerOnContext(view, "handleClickOn", pos, inside, event) ||
        view.someProp("handleClick", f => f(view, pos, event)) ||
        (selectNode ? selectClickedNode(view, inside) : selectClickedLeaf(view, inside));
}
function handleDoubleClick(view, pos, inside, event) {
    return runHandlerOnContext(view, "handleDoubleClickOn", pos, inside, event) ||
        view.someProp("handleDoubleClick", f => f(view, pos, event));
}
function handleTripleClick(view, pos, inside, event) {
    return runHandlerOnContext(view, "handleTripleClickOn", pos, inside, event) ||
        view.someProp("handleTripleClick", f => f(view, pos, event)) ||
        defaultTripleClick(view, inside, event);
}
function defaultTripleClick(view, inside, event) {
    if (event.button != 0)
        return false;
    let doc = view.state.doc;
    if (inside == -1) {
        if (doc.inlineContent) {
            updateSelection(view, TextSelection.create(doc, 0, doc.content.size), "pointer");
            return true;
        }
        return false;
    }
    let $pos = doc.resolve(inside);
    for (let i = $pos.depth + 1; i > 0; i--) {
        let node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
        let nodePos = $pos.before(i);
        if (node.inlineContent)
            updateSelection(view, TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size), "pointer");
        else if (NodeSelection.isSelectable(node))
            updateSelection(view, NodeSelection.create(doc, nodePos), "pointer");
        else
            continue;
        return true;
    }
}
function forceDOMFlush(view) {
    return endComposition(view);
}
const selectNodeModifier = mac$2 ? "metaKey" : "ctrlKey";
handlers.mousedown = (view, _event) => {
    let event = _event;
    view.input.shiftKey = event.shiftKey;
    let flushed = forceDOMFlush(view);
    let now = Date.now(), type = "singleClick";
    if (now - view.input.lastClick.time < 500 && isNear(event, view.input.lastClick) && !event[selectNodeModifier]) {
        if (view.input.lastClick.type == "singleClick")
            type = "doubleClick";
        else if (view.input.lastClick.type == "doubleClick")
            type = "tripleClick";
    }
    view.input.lastClick = { time: now, x: event.clientX, y: event.clientY, type };
    let pos = view.posAtCoords(eventCoords(event));
    if (!pos)
        return;
    if (type == "singleClick") {
        if (view.input.mouseDown)
            view.input.mouseDown.done();
        view.input.mouseDown = new MouseDown(view, pos, event, !!flushed);
    }
    else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view, pos.pos, pos.inside, event)) {
        event.preventDefault();
    }
    else {
        setSelectionOrigin(view, "pointer");
    }
};
class MouseDown {
    constructor(view, pos, event, flushed) {
        this.view = view;
        this.pos = pos;
        this.event = event;
        this.flushed = flushed;
        this.delayedSelectionSync = false;
        this.mightDrag = null;
        this.startDoc = view.state.doc;
        this.selectNode = !!event[selectNodeModifier];
        this.allowDefault = event.shiftKey;
        let targetNode, targetPos;
        if (pos.inside > -1) {
            targetNode = view.state.doc.nodeAt(pos.inside);
            targetPos = pos.inside;
        }
        else {
            let $pos = view.state.doc.resolve(pos.pos);
            targetNode = $pos.parent;
            targetPos = $pos.depth ? $pos.before() : 0;
        }
        const target = flushed ? null : event.target;
        const targetDesc = target ? view.docView.nearestDesc(target, true) : null;
        this.target = targetDesc ? targetDesc.dom : null;
        let { selection } = view.state;
        if (event.button == 0 &&
            targetNode.type.spec.draggable && targetNode.type.spec.selectable !== false ||
            selection instanceof NodeSelection && selection.from <= targetPos && selection.to > targetPos)
            this.mightDrag = {
                node: targetNode,
                pos: targetPos,
                addAttr: !!(this.target && !this.target.draggable),
                setUneditable: !!(this.target && gecko && !this.target.hasAttribute("contentEditable"))
            };
        if (this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable)) {
            this.view.domObserver.stop();
            if (this.mightDrag.addAttr)
                this.target.draggable = true;
            if (this.mightDrag.setUneditable)
                setTimeout(() => {
                    if (this.view.input.mouseDown == this)
                        this.target.setAttribute("contentEditable", "false");
                }, 20);
            this.view.domObserver.start();
        }
        view.root.addEventListener("mouseup", this.up = this.up.bind(this));
        view.root.addEventListener("mousemove", this.move = this.move.bind(this));
        setSelectionOrigin(view, "pointer");
    }
    done() {
        this.view.root.removeEventListener("mouseup", this.up);
        this.view.root.removeEventListener("mousemove", this.move);
        if (this.mightDrag && this.target) {
            this.view.domObserver.stop();
            if (this.mightDrag.addAttr)
                this.target.removeAttribute("draggable");
            if (this.mightDrag.setUneditable)
                this.target.removeAttribute("contentEditable");
            this.view.domObserver.start();
        }
        if (this.delayedSelectionSync)
            setTimeout(() => selectionToDOM(this.view));
        this.view.input.mouseDown = null;
    }
    up(event) {
        this.done();
        if (!this.view.dom.contains(event.target))
            return;
        let pos = this.pos;
        if (this.view.state.doc != this.startDoc)
            pos = this.view.posAtCoords(eventCoords(event));
        this.updateAllowDefault(event);
        if (this.allowDefault || !pos) {
            setSelectionOrigin(this.view, "pointer");
        }
        else if (handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)) {
            event.preventDefault();
        }
        else if (event.button == 0 &&
            (this.flushed ||
                // Safari ignores clicks on draggable elements
                (safari && this.mightDrag && !this.mightDrag.node.isAtom) ||
                // Chrome will sometimes treat a node selection as a
                // cursor, but still report that the node is selected
                // when asked through getSelection. You'll then get a
                // situation where clicking at the point where that
                // (hidden) cursor is doesn't change the selection, and
                // thus doesn't get a reaction from ProseMirror. This
                // works around that.
                (chrome$1 && !this.view.state.selection.visible &&
                    Math.min(Math.abs(pos.pos - this.view.state.selection.from), Math.abs(pos.pos - this.view.state.selection.to)) <= 2))) {
            updateSelection(this.view, Selection.near(this.view.state.doc.resolve(pos.pos)), "pointer");
            event.preventDefault();
        }
        else {
            setSelectionOrigin(this.view, "pointer");
        }
    }
    move(event) {
        this.updateAllowDefault(event);
        setSelectionOrigin(this.view, "pointer");
        if (event.buttons == 0)
            this.done();
    }
    updateAllowDefault(event) {
        if (!this.allowDefault && (Math.abs(this.event.x - event.clientX) > 4 ||
            Math.abs(this.event.y - event.clientY) > 4))
            this.allowDefault = true;
    }
}
handlers.touchstart = view => {
    view.input.lastTouch = Date.now();
    forceDOMFlush(view);
    setSelectionOrigin(view, "pointer");
};
handlers.touchmove = view => {
    view.input.lastTouch = Date.now();
    setSelectionOrigin(view, "pointer");
};
handlers.contextmenu = view => forceDOMFlush(view);
function inOrNearComposition(view, event) {
    if (view.composing)
        return true;
    // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
    // On Japanese input method editors (IMEs), the Enter key is used to confirm character
    // selection. On Safari, when Enter is pressed, compositionend and keydown events are
    // emitted. The keydown event triggers newline insertion, which we don't want.
    // This method returns true if the keydown event should be ignored.
    // We only ignore it once, as pressing Enter a second time *should* insert a newline.
    // Furthermore, the keydown event timestamp must be close to the compositionEndedAt timestamp.
    // This guards against the case where compositionend is triggered without the keyboard
    // (e.g. character confirmation may be done with the mouse), and keydown is triggered
    // afterwards- we wouldn't want to ignore the keydown event in this case.
    if (safari && Math.abs(event.timeStamp - view.input.compositionEndedAt) < 500) {
        view.input.compositionEndedAt = -2e8;
        return true;
    }
    return false;
}
// Drop active composition after 5 seconds of inactivity on Android
const timeoutComposition = android ? 5000 : -1;
editHandlers.compositionstart = editHandlers.compositionupdate = view => {
    if (!view.composing) {
        view.domObserver.flush();
        let { state } = view, $pos = state.selection.$from;
        if (state.selection.empty &&
            (state.storedMarks ||
                (!$pos.textOffset && $pos.parentOffset && $pos.nodeBefore.marks.some(m => m.type.spec.inclusive === false)))) {
            // Need to wrap the cursor in mark nodes different from the ones in the DOM context
            view.markCursor = view.state.storedMarks || $pos.marks();
            endComposition(view, true);
            view.markCursor = null;
        }
        else {
            endComposition(view);
            // In firefox, if the cursor is after but outside a marked node,
            // the inserted text won't inherit the marks. So this moves it
            // inside if necessary.
            if (gecko && state.selection.empty && $pos.parentOffset && !$pos.textOffset && $pos.nodeBefore.marks.length) {
                let sel = view.domSelectionRange();
                for (let node = sel.focusNode, offset = sel.focusOffset; node && node.nodeType == 1 && offset != 0;) {
                    let before = offset < 0 ? node.lastChild : node.childNodes[offset - 1];
                    if (!before)
                        break;
                    if (before.nodeType == 3) {
                        view.domSelection().collapse(before, before.nodeValue.length);
                        break;
                    }
                    else {
                        node = before;
                        offset = -1;
                    }
                }
            }
        }
        view.input.composing = true;
    }
    scheduleComposeEnd(view, timeoutComposition);
};
editHandlers.compositionend = (view, event) => {
    if (view.composing) {
        view.input.composing = false;
        view.input.compositionEndedAt = event.timeStamp;
        scheduleComposeEnd(view, 20);
    }
};
function scheduleComposeEnd(view, delay) {
    clearTimeout(view.input.composingTimeout);
    if (delay > -1)
        view.input.composingTimeout = setTimeout(() => endComposition(view), delay);
}
function clearComposition(view) {
    if (view.composing) {
        view.input.composing = false;
        view.input.compositionEndedAt = timestampFromCustomEvent();
    }
    while (view.input.compositionNodes.length > 0)
        view.input.compositionNodes.pop().markParentsDirty();
}
function timestampFromCustomEvent() {
    let event = document.createEvent("Event");
    event.initEvent("event", true, true);
    return event.timeStamp;
}
/**
@internal
*/
function endComposition(view, forceUpdate = false) {
    if (android && view.domObserver.flushingSoon >= 0)
        return;
    view.domObserver.forceFlush();
    clearComposition(view);
    if (forceUpdate || view.docView && view.docView.dirty) {
        let sel = selectionFromDOM(view);
        if (sel && !sel.eq(view.state.selection))
            view.dispatch(view.state.tr.setSelection(sel));
        else
            view.updateState(view.state);
        return true;
    }
    return false;
}
function captureCopy(view, dom) {
    // The extra wrapper is somehow necessary on IE/Edge to prevent the
    // content from being mangled when it is put onto the clipboard
    if (!view.dom.parentNode)
        return;
    let wrap = view.dom.parentNode.appendChild(document.createElement("div"));
    wrap.appendChild(dom);
    wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
    let sel = getSelection(), range = document.createRange();
    range.selectNodeContents(dom);
    // Done because IE will fire a selectionchange moving the selection
    // to its start when removeAllRanges is called and the editor still
    // has focus (which will mess up the editor's selection state).
    view.dom.blur();
    sel.removeAllRanges();
    sel.addRange(range);
    setTimeout(() => {
        if (wrap.parentNode)
            wrap.parentNode.removeChild(wrap);
        view.focus();
    }, 50);
}
// This is very crude, but unfortunately both these browsers _pretend_
// that they have a clipboard API—all the objects and methods are
// there, they just don't work, and they are hard to test.
const brokenClipboardAPI = (ie$1 && ie_version < 15) ||
    (ios && webkit_version < 604);
handlers.copy = editHandlers.cut = (view, _event) => {
    let event = _event;
    let sel = view.state.selection, cut = event.type == "cut";
    if (sel.empty)
        return;
    // IE and Edge's clipboard interface is completely broken
    let data = brokenClipboardAPI ? null : event.clipboardData;
    let slice = sel.content(), { dom, text } = serializeForClipboard(view, slice);
    if (data) {
        event.preventDefault();
        data.clearData();
        data.setData("text/html", dom.innerHTML);
        data.setData("text/plain", text);
    }
    else {
        captureCopy(view, dom);
    }
    if (cut)
        view.dispatch(view.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function sliceSingleNode(slice) {
    return slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1 ? slice.content.firstChild : null;
}
function capturePaste(view, event) {
    if (!view.dom.parentNode)
        return;
    let plainText = view.input.shiftKey || view.state.selection.$from.parent.type.spec.code;
    let target = view.dom.parentNode.appendChild(document.createElement(plainText ? "textarea" : "div"));
    if (!plainText)
        target.contentEditable = "true";
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
        view.focus();
        if (target.parentNode)
            target.parentNode.removeChild(target);
        if (plainText)
            doPaste(view, target.value, null, view.input.shiftKey, event);
        else
            doPaste(view, target.textContent, target.innerHTML, view.input.shiftKey, event);
    }, 50);
}
function doPaste(view, text, html, preferPlain, event) {
    let slice = parseFromClipboard(view, text, html, preferPlain, view.state.selection.$from);
    if (view.someProp("handlePaste", f => f(view, event, slice || Slice.empty)))
        return true;
    if (!slice)
        return false;
    let singleNode = sliceSingleNode(slice);
    let tr = singleNode
        ? view.state.tr.replaceSelectionWith(singleNode, view.input.shiftKey)
        : view.state.tr.replaceSelection(slice);
    view.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
    return true;
}
editHandlers.paste = (view, _event) => {
    let event = _event;
    // Handling paste from JavaScript during composition is very poorly
    // handled by browsers, so as a dodgy but preferable kludge, we just
    // let the browser do its native thing there, except on Android,
    // where the editor is almost always composing.
    if (view.composing && !android)
        return;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data && doPaste(view, data.getData("text/plain"), data.getData("text/html"), view.input.shiftKey, event))
        event.preventDefault();
    else
        capturePaste(view, event);
};
class Dragging {
    constructor(slice, move) {
        this.slice = slice;
        this.move = move;
    }
}
const dragCopyModifier = mac$2 ? "altKey" : "ctrlKey";
handlers.dragstart = (view, _event) => {
    let event = _event;
    let mouseDown = view.input.mouseDown;
    if (mouseDown)
        mouseDown.done();
    if (!event.dataTransfer)
        return;
    let sel = view.state.selection;
    let pos = sel.empty ? null : view.posAtCoords(eventCoords(event));
    if (pos && pos.pos >= sel.from && pos.pos <= (sel instanceof NodeSelection ? sel.to - 1 : sel.to)) ;
    else if (mouseDown && mouseDown.mightDrag) {
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos)));
    }
    else if (event.target && event.target.nodeType == 1) {
        let desc = view.docView.nearestDesc(event.target, true);
        if (desc && desc.node.type.spec.draggable && desc != view.docView)
            view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, desc.posBefore)));
    }
    let slice = view.state.selection.content(), { dom, text } = serializeForClipboard(view, slice);
    event.dataTransfer.clearData();
    event.dataTransfer.setData(brokenClipboardAPI ? "Text" : "text/html", dom.innerHTML);
    // See https://github.com/ProseMirror/prosemirror/issues/1156
    event.dataTransfer.effectAllowed = "copyMove";
    if (!brokenClipboardAPI)
        event.dataTransfer.setData("text/plain", text);
    view.dragging = new Dragging(slice, !event[dragCopyModifier]);
};
handlers.dragend = view => {
    let dragging = view.dragging;
    window.setTimeout(() => {
        if (view.dragging == dragging)
            view.dragging = null;
    }, 50);
};
editHandlers.dragover = editHandlers.dragenter = (_, e) => e.preventDefault();
editHandlers.drop = (view, _event) => {
    let event = _event;
    let dragging = view.dragging;
    view.dragging = null;
    if (!event.dataTransfer)
        return;
    let eventPos = view.posAtCoords(eventCoords(event));
    if (!eventPos)
        return;
    let $mouse = view.state.doc.resolve(eventPos.pos);
    let slice = dragging && dragging.slice;
    if (slice) {
        view.someProp("transformPasted", f => { slice = f(slice, view); });
    }
    else {
        slice = parseFromClipboard(view, event.dataTransfer.getData(brokenClipboardAPI ? "Text" : "text/plain"), brokenClipboardAPI ? null : event.dataTransfer.getData("text/html"), false, $mouse);
    }
    let move = !!(dragging && !event[dragCopyModifier]);
    if (view.someProp("handleDrop", f => f(view, event, slice || Slice.empty, move))) {
        event.preventDefault();
        return;
    }
    if (!slice)
        return;
    event.preventDefault();
    let insertPos = slice ? dropPoint(view.state.doc, $mouse.pos, slice) : $mouse.pos;
    if (insertPos == null)
        insertPos = $mouse.pos;
    let tr = view.state.tr;
    if (move)
        tr.deleteSelection();
    let pos = tr.mapping.map(insertPos);
    let isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1;
    let beforeInsert = tr.doc;
    if (isNode)
        tr.replaceRangeWith(pos, pos, slice.content.firstChild);
    else
        tr.replaceRange(pos, pos, slice);
    if (tr.doc.eq(beforeInsert))
        return;
    let $pos = tr.doc.resolve(pos);
    if (isNode && NodeSelection.isSelectable(slice.content.firstChild) &&
        $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild)) {
        tr.setSelection(new NodeSelection($pos));
    }
    else {
        let end = tr.mapping.map(insertPos);
        tr.mapping.maps[tr.mapping.maps.length - 1].forEach((_from, _to, _newFrom, newTo) => end = newTo);
        tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)));
    }
    view.focus();
    view.dispatch(tr.setMeta("uiEvent", "drop"));
};
handlers.focus = view => {
    view.input.lastFocus = Date.now();
    if (!view.focused) {
        view.domObserver.stop();
        view.dom.classList.add("ProseMirror-focused");
        view.domObserver.start();
        view.focused = true;
        setTimeout(() => {
            if (view.docView && view.hasFocus() && !view.domObserver.currentSelection.eq(view.domSelectionRange()))
                selectionToDOM(view);
        }, 20);
    }
};
handlers.blur = (view, _event) => {
    let event = _event;
    if (view.focused) {
        view.domObserver.stop();
        view.dom.classList.remove("ProseMirror-focused");
        view.domObserver.start();
        if (event.relatedTarget && view.dom.contains(event.relatedTarget))
            view.domObserver.currentSelection.clear();
        view.focused = false;
    }
};
handlers.beforeinput = (view, _event) => {
    let event = _event;
    // We should probably do more with beforeinput events, but support
    // is so spotty that I'm still waiting to see where they are going.
    // Very specific hack to deal with backspace sometimes failing on
    // Chrome Android when after an uneditable node.
    if (chrome$1 && android && event.inputType == "deleteContentBackward") {
        view.domObserver.flushSoon();
        let { domChangeCount } = view.input;
        setTimeout(() => {
            if (view.input.domChangeCount != domChangeCount)
                return; // Event already had some effect
            // This bug tends to close the virtual keyboard, so we refocus
            view.dom.blur();
            view.focus();
            if (view.someProp("handleKeyDown", f => f(view, keyEvent(8, "Backspace"))))
                return;
            let { $cursor } = view.state.selection;
            // Crude approximation of backspace behavior when no command handled it
            if ($cursor && $cursor.pos > 0)
                view.dispatch(view.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView());
        }, 50);
    }
};
// Make sure all handlers get registered
for (let prop in editHandlers)
    handlers[prop] = editHandlers[prop];

function compareObjs(a, b) {
    if (a == b)
        return true;
    for (let p in a)
        if (a[p] !== b[p])
            return false;
    for (let p in b)
        if (!(p in a))
            return false;
    return true;
}
class WidgetType {
    constructor(toDOM, spec) {
        this.toDOM = toDOM;
        this.spec = spec || noSpec;
        this.side = this.spec.side || 0;
    }
    map(mapping, span, offset, oldOffset) {
        let { pos, deleted } = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
        return deleted ? null : new Decoration(pos - offset, pos - offset, this);
    }
    valid() { return true; }
    eq(other) {
        return this == other ||
            (other instanceof WidgetType &&
                (this.spec.key && this.spec.key == other.spec.key ||
                    this.toDOM == other.toDOM && compareObjs(this.spec, other.spec)));
    }
    destroy(node) {
        if (this.spec.destroy)
            this.spec.destroy(node);
    }
}
class InlineType {
    constructor(attrs, spec) {
        this.attrs = attrs;
        this.spec = spec || noSpec;
    }
    map(mapping, span, offset, oldOffset) {
        let from = mapping.map(span.from + oldOffset, this.spec.inclusiveStart ? -1 : 1) - offset;
        let to = mapping.map(span.to + oldOffset, this.spec.inclusiveEnd ? 1 : -1) - offset;
        return from >= to ? null : new Decoration(from, to, this);
    }
    valid(_, span) { return span.from < span.to; }
    eq(other) {
        return this == other ||
            (other instanceof InlineType && compareObjs(this.attrs, other.attrs) &&
                compareObjs(this.spec, other.spec));
    }
    static is(span) { return span.type instanceof InlineType; }
    destroy() { }
}
class NodeType {
    constructor(attrs, spec) {
        this.attrs = attrs;
        this.spec = spec || noSpec;
    }
    map(mapping, span, offset, oldOffset) {
        let from = mapping.mapResult(span.from + oldOffset, 1);
        if (from.deleted)
            return null;
        let to = mapping.mapResult(span.to + oldOffset, -1);
        if (to.deleted || to.pos <= from.pos)
            return null;
        return new Decoration(from.pos - offset, to.pos - offset, this);
    }
    valid(node, span) {
        let { index, offset } = node.content.findIndex(span.from), child;
        return offset == span.from && !(child = node.child(index)).isText && offset + child.nodeSize == span.to;
    }
    eq(other) {
        return this == other ||
            (other instanceof NodeType && compareObjs(this.attrs, other.attrs) &&
                compareObjs(this.spec, other.spec));
    }
    destroy() { }
}
/**
Decoration objects can be provided to the view through the
[`decorations` prop](https://prosemirror.net/docs/ref/#view.EditorProps.decorations). They come in
several variants—see the static members of this class for details.
*/
class Decoration {
    /**
    @internal
    */
    constructor(
    /**
    The start position of the decoration.
    */
    from, 
    /**
    The end position. Will be the same as `from` for [widget
    decorations](https://prosemirror.net/docs/ref/#view.Decoration^widget).
    */
    to, 
    /**
    @internal
    */
    type) {
        this.from = from;
        this.to = to;
        this.type = type;
    }
    /**
    @internal
    */
    copy(from, to) {
        return new Decoration(from, to, this.type);
    }
    /**
    @internal
    */
    eq(other, offset = 0) {
        return this.type.eq(other.type) && this.from + offset == other.from && this.to + offset == other.to;
    }
    /**
    @internal
    */
    map(mapping, offset, oldOffset) {
        return this.type.map(mapping, this, offset, oldOffset);
    }
    /**
    Creates a widget decoration, which is a DOM node that's shown in
    the document at the given position. It is recommended that you
    delay rendering the widget by passing a function that will be
    called when the widget is actually drawn in a view, but you can
    also directly pass a DOM node. `getPos` can be used to find the
    widget's current document position.
    */
    static widget(pos, toDOM, spec) {
        return new Decoration(pos, pos, new WidgetType(toDOM, spec));
    }
    /**
    Creates an inline decoration, which adds the given attributes to
    each inline node between `from` and `to`.
    */
    static inline(from, to, attrs, spec) {
        return new Decoration(from, to, new InlineType(attrs, spec));
    }
    /**
    Creates a node decoration. `from` and `to` should point precisely
    before and after a node in the document. That node, and only that
    node, will receive the given attributes.
    */
    static node(from, to, attrs, spec) {
        return new Decoration(from, to, new NodeType(attrs, spec));
    }
    /**
    The spec provided when creating this decoration. Can be useful
    if you've stored extra information in that object.
    */
    get spec() { return this.type.spec; }
    /**
    @internal
    */
    get inline() { return this.type instanceof InlineType; }
}
const none = [], noSpec = {};
/**
A collection of [decorations](https://prosemirror.net/docs/ref/#view.Decoration), organized in such
a way that the drawing algorithm can efficiently use and compare
them. This is a persistent data structure—it is not modified,
updates create a new value.
*/
class DecorationSet {
    /**
    @internal
    */
    constructor(local, children) {
        this.local = local.length ? local : none;
        this.children = children.length ? children : none;
    }
    /**
    Create a set of decorations, using the structure of the given
    document.
    */
    static create(doc, decorations) {
        return decorations.length ? buildTree(decorations, doc, 0, noSpec) : empty;
    }
    /**
    Find all decorations in this set which touch the given range
    (including decorations that start or end directly at the
    boundaries) and match the given predicate on their spec. When
    `start` and `end` are omitted, all decorations in the set are
    considered. When `predicate` isn't given, all decorations are
    assumed to match.
    */
    find(start, end, predicate) {
        let result = [];
        this.findInner(start == null ? 0 : start, end == null ? 1e9 : end, result, 0, predicate);
        return result;
    }
    findInner(start, end, result, offset, predicate) {
        for (let i = 0; i < this.local.length; i++) {
            let span = this.local[i];
            if (span.from <= end && span.to >= start && (!predicate || predicate(span.spec)))
                result.push(span.copy(span.from + offset, span.to + offset));
        }
        for (let i = 0; i < this.children.length; i += 3) {
            if (this.children[i] < end && this.children[i + 1] > start) {
                let childOff = this.children[i] + 1;
                this.children[i + 2].findInner(start - childOff, end - childOff, result, offset + childOff, predicate);
            }
        }
    }
    /**
    Map the set of decorations in response to a change in the
    document.
    */
    map(mapping, doc, options) {
        if (this == empty || mapping.maps.length == 0)
            return this;
        return this.mapInner(mapping, doc, 0, 0, options || noSpec);
    }
    /**
    @internal
    */
    mapInner(mapping, node, offset, oldOffset, options) {
        let newLocal;
        for (let i = 0; i < this.local.length; i++) {
            let mapped = this.local[i].map(mapping, offset, oldOffset);
            if (mapped && mapped.type.valid(node, mapped))
                (newLocal || (newLocal = [])).push(mapped);
            else if (options.onRemove)
                options.onRemove(this.local[i].spec);
        }
        if (this.children.length)
            return mapChildren(this.children, newLocal || [], mapping, node, offset, oldOffset, options);
        else
            return newLocal ? new DecorationSet(newLocal.sort(byPos), none) : empty;
    }
    /**
    Add the given array of decorations to the ones in the set,
    producing a new set. Needs access to the current document to
    create the appropriate tree structure.
    */
    add(doc, decorations) {
        if (!decorations.length)
            return this;
        if (this == empty)
            return DecorationSet.create(doc, decorations);
        return this.addInner(doc, decorations, 0);
    }
    addInner(doc, decorations, offset) {
        let children, childIndex = 0;
        doc.forEach((childNode, childOffset) => {
            let baseOffset = childOffset + offset, found;
            if (!(found = takeSpansForNode(decorations, childNode, baseOffset)))
                return;
            if (!children)
                children = this.children.slice();
            while (childIndex < children.length && children[childIndex] < childOffset)
                childIndex += 3;
            if (children[childIndex] == childOffset)
                children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found, baseOffset + 1);
            else
                children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found, childNode, baseOffset + 1, noSpec));
            childIndex += 3;
        });
        let local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset);
        for (let i = 0; i < local.length; i++)
            if (!local[i].type.valid(doc, local[i]))
                local.splice(i--, 1);
        return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local, children || this.children);
    }
    /**
    Create a new set that contains the decorations in this set, minus
    the ones in the given array.
    */
    remove(decorations) {
        if (decorations.length == 0 || this == empty)
            return this;
        return this.removeInner(decorations, 0);
    }
    removeInner(decorations, offset) {
        let children = this.children, local = this.local;
        for (let i = 0; i < children.length; i += 3) {
            let found;
            let from = children[i] + offset, to = children[i + 1] + offset;
            for (let j = 0, span; j < decorations.length; j++)
                if (span = decorations[j]) {
                    if (span.from > from && span.to < to) {
                        decorations[j] = null;
                        (found || (found = [])).push(span);
                    }
                }
            if (!found)
                continue;
            if (children == this.children)
                children = this.children.slice();
            let removed = children[i + 2].removeInner(found, from + 1);
            if (removed != empty) {
                children[i + 2] = removed;
            }
            else {
                children.splice(i, 3);
                i -= 3;
            }
        }
        if (local.length)
            for (let i = 0, span; i < decorations.length; i++)
                if (span = decorations[i]) {
                    for (let j = 0; j < local.length; j++)
                        if (local[j].eq(span, offset)) {
                            if (local == this.local)
                                local = this.local.slice();
                            local.splice(j--, 1);
                        }
                }
        if (children == this.children && local == this.local)
            return this;
        return local.length || children.length ? new DecorationSet(local, children) : empty;
    }
    /**
    @internal
    */
    forChild(offset, node) {
        if (this == empty)
            return this;
        if (node.isLeaf)
            return DecorationSet.empty;
        let child, local;
        for (let i = 0; i < this.children.length; i += 3)
            if (this.children[i] >= offset) {
                if (this.children[i] == offset)
                    child = this.children[i + 2];
                break;
            }
        let start = offset + 1, end = start + node.content.size;
        for (let i = 0; i < this.local.length; i++) {
            let dec = this.local[i];
            if (dec.from < end && dec.to > start && (dec.type instanceof InlineType)) {
                let from = Math.max(start, dec.from) - start, to = Math.min(end, dec.to) - start;
                if (from < to)
                    (local || (local = [])).push(dec.copy(from, to));
            }
        }
        if (local) {
            let localSet = new DecorationSet(local.sort(byPos), none);
            return child ? new DecorationGroup([localSet, child]) : localSet;
        }
        return child || empty;
    }
    /**
    @internal
    */
    eq(other) {
        if (this == other)
            return true;
        if (!(other instanceof DecorationSet) ||
            this.local.length != other.local.length ||
            this.children.length != other.children.length)
            return false;
        for (let i = 0; i < this.local.length; i++)
            if (!this.local[i].eq(other.local[i]))
                return false;
        for (let i = 0; i < this.children.length; i += 3)
            if (this.children[i] != other.children[i] ||
                this.children[i + 1] != other.children[i + 1] ||
                !this.children[i + 2].eq(other.children[i + 2]))
                return false;
        return true;
    }
    /**
    @internal
    */
    locals(node) {
        return removeOverlap(this.localsInner(node));
    }
    /**
    @internal
    */
    localsInner(node) {
        if (this == empty)
            return none;
        if (node.inlineContent || !this.local.some(InlineType.is))
            return this.local;
        let result = [];
        for (let i = 0; i < this.local.length; i++) {
            if (!(this.local[i].type instanceof InlineType))
                result.push(this.local[i]);
        }
        return result;
    }
}
/**
The empty set of decorations.
*/
DecorationSet.empty = new DecorationSet([], []);
/**
@internal
*/
DecorationSet.removeOverlap = removeOverlap;
const empty = DecorationSet.empty;
// An abstraction that allows the code dealing with decorations to
// treat multiple DecorationSet objects as if it were a single object
// with (a subset of) the same interface.
class DecorationGroup {
    constructor(members) {
        this.members = members;
    }
    map(mapping, doc) {
        const mappedDecos = this.members.map(member => member.map(mapping, doc, noSpec));
        return DecorationGroup.from(mappedDecos);
    }
    forChild(offset, child) {
        if (child.isLeaf)
            return DecorationSet.empty;
        let found = [];
        for (let i = 0; i < this.members.length; i++) {
            let result = this.members[i].forChild(offset, child);
            if (result == empty)
                continue;
            if (result instanceof DecorationGroup)
                found = found.concat(result.members);
            else
                found.push(result);
        }
        return DecorationGroup.from(found);
    }
    eq(other) {
        if (!(other instanceof DecorationGroup) ||
            other.members.length != this.members.length)
            return false;
        for (let i = 0; i < this.members.length; i++)
            if (!this.members[i].eq(other.members[i]))
                return false;
        return true;
    }
    locals(node) {
        let result, sorted = true;
        for (let i = 0; i < this.members.length; i++) {
            let locals = this.members[i].localsInner(node);
            if (!locals.length)
                continue;
            if (!result) {
                result = locals;
            }
            else {
                if (sorted) {
                    result = result.slice();
                    sorted = false;
                }
                for (let j = 0; j < locals.length; j++)
                    result.push(locals[j]);
            }
        }
        return result ? removeOverlap(sorted ? result : result.sort(byPos)) : none;
    }
    // Create a group for the given array of decoration sets, or return
    // a single set when possible.
    static from(members) {
        switch (members.length) {
            case 0: return empty;
            case 1: return members[0];
            default: return new DecorationGroup(members.every(m => m instanceof DecorationSet) ? members :
                members.reduce((r, m) => r.concat(m instanceof DecorationSet ? m : m.members), []));
        }
    }
}
function mapChildren(oldChildren, newLocal, mapping, node, offset, oldOffset, options) {
    let children = oldChildren.slice();
    // Mark the children that are directly touched by changes, and
    // move those that are after the changes.
    for (let i = 0, baseOffset = oldOffset; i < mapping.maps.length; i++) {
        let moved = 0;
        mapping.maps[i].forEach((oldStart, oldEnd, newStart, newEnd) => {
            let dSize = (newEnd - newStart) - (oldEnd - oldStart);
            for (let i = 0; i < children.length; i += 3) {
                let end = children[i + 1];
                if (end < 0 || oldStart > end + baseOffset - moved)
                    continue;
                let start = children[i] + baseOffset - moved;
                if (oldEnd >= start) {
                    children[i + 1] = oldStart <= start ? -2 : -1;
                }
                else if (newStart >= offset && dSize) {
                    children[i] += dSize;
                    children[i + 1] += dSize;
                }
            }
            moved += dSize;
        });
        baseOffset = mapping.maps[i].map(baseOffset, -1);
    }
    // Find the child nodes that still correspond to a single node,
    // recursively call mapInner on them and update their positions.
    let mustRebuild = false;
    for (let i = 0; i < children.length; i += 3)
        if (children[i + 1] < 0) { // Touched nodes
            if (children[i + 1] == -2) {
                mustRebuild = true;
                children[i + 1] = -1;
                continue;
            }
            let from = mapping.map(oldChildren[i] + oldOffset), fromLocal = from - offset;
            if (fromLocal < 0 || fromLocal >= node.content.size) {
                mustRebuild = true;
                continue;
            }
            // Must read oldChildren because children was tagged with -1
            let to = mapping.map(oldChildren[i + 1] + oldOffset, -1), toLocal = to - offset;
            let { index, offset: childOffset } = node.content.findIndex(fromLocal);
            let childNode = node.maybeChild(index);
            if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
                let mapped = children[i + 2]
                    .mapInner(mapping, childNode, from + 1, oldChildren[i] + oldOffset + 1, options);
                if (mapped != empty) {
                    children[i] = fromLocal;
                    children[i + 1] = toLocal;
                    children[i + 2] = mapped;
                }
                else {
                    children[i + 1] = -2;
                    mustRebuild = true;
                }
            }
            else {
                mustRebuild = true;
            }
        }
    // Remaining children must be collected and rebuilt into the appropriate structure
    if (mustRebuild) {
        let decorations = mapAndGatherRemainingDecorations(children, oldChildren, newLocal, mapping, offset, oldOffset, options);
        let built = buildTree(decorations, node, 0, options);
        newLocal = built.local;
        for (let i = 0; i < children.length; i += 3)
            if (children[i + 1] < 0) {
                children.splice(i, 3);
                i -= 3;
            }
        for (let i = 0, j = 0; i < built.children.length; i += 3) {
            let from = built.children[i];
            while (j < children.length && children[j] < from)
                j += 3;
            children.splice(j, 0, built.children[i], built.children[i + 1], built.children[i + 2]);
        }
    }
    return new DecorationSet(newLocal.sort(byPos), children);
}
function moveSpans(spans, offset) {
    if (!offset || !spans.length)
        return spans;
    let result = [];
    for (let i = 0; i < spans.length; i++) {
        let span = spans[i];
        result.push(new Decoration(span.from + offset, span.to + offset, span.type));
    }
    return result;
}
function mapAndGatherRemainingDecorations(children, oldChildren, decorations, mapping, offset, oldOffset, options) {
    // Gather all decorations from the remaining marked children
    function gather(set, oldOffset) {
        for (let i = 0; i < set.local.length; i++) {
            let mapped = set.local[i].map(mapping, offset, oldOffset);
            if (mapped)
                decorations.push(mapped);
            else if (options.onRemove)
                options.onRemove(set.local[i].spec);
        }
        for (let i = 0; i < set.children.length; i += 3)
            gather(set.children[i + 2], set.children[i] + oldOffset + 1);
    }
    for (let i = 0; i < children.length; i += 3)
        if (children[i + 1] == -1)
            gather(children[i + 2], oldChildren[i] + oldOffset + 1);
    return decorations;
}
function takeSpansForNode(spans, node, offset) {
    if (node.isLeaf)
        return null;
    let end = offset + node.nodeSize, found = null;
    for (let i = 0, span; i < spans.length; i++) {
        if ((span = spans[i]) && span.from > offset && span.to < end) {
            (found || (found = [])).push(span);
            spans[i] = null;
        }
    }
    return found;
}
function withoutNulls(array) {
    let result = [];
    for (let i = 0; i < array.length; i++)
        if (array[i] != null)
            result.push(array[i]);
    return result;
}
// Build up a tree that corresponds to a set of decorations. `offset`
// is a base offset that should be subtracted from the `from` and `to`
// positions in the spans (so that we don't have to allocate new spans
// for recursive calls).
function buildTree(spans, node, offset, options) {
    let children = [], hasNulls = false;
    node.forEach((childNode, localStart) => {
        let found = takeSpansForNode(spans, childNode, localStart + offset);
        if (found) {
            hasNulls = true;
            let subtree = buildTree(found, childNode, offset + localStart + 1, options);
            if (subtree != empty)
                children.push(localStart, localStart + childNode.nodeSize, subtree);
        }
    });
    let locals = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset).sort(byPos);
    for (let i = 0; i < locals.length; i++)
        if (!locals[i].type.valid(node, locals[i])) {
            if (options.onRemove)
                options.onRemove(locals[i].spec);
            locals.splice(i--, 1);
        }
    return locals.length || children.length ? new DecorationSet(locals, children) : empty;
}
// Used to sort decorations so that ones with a low start position
// come first, and within a set with the same start position, those
// with an smaller end position come first.
function byPos(a, b) {
    return a.from - b.from || a.to - b.to;
}
// Scan a sorted array of decorations for partially overlapping spans,
// and split those so that only fully overlapping spans are left (to
// make subsequent rendering easier). Will return the input array if
// no partially overlapping spans are found (the common case).
function removeOverlap(spans) {
    let working = spans;
    for (let i = 0; i < working.length - 1; i++) {
        let span = working[i];
        if (span.from != span.to)
            for (let j = i + 1; j < working.length; j++) {
                let next = working[j];
                if (next.from == span.from) {
                    if (next.to != span.to) {
                        if (working == spans)
                            working = spans.slice();
                        // Followed by a partially overlapping larger span. Split that
                        // span.
                        working[j] = next.copy(next.from, span.to);
                        insertAhead(working, j + 1, next.copy(span.to, next.to));
                    }
                    continue;
                }
                else {
                    if (next.from < span.to) {
                        if (working == spans)
                            working = spans.slice();
                        // The end of this one overlaps with a subsequent span. Split
                        // this one.
                        working[i] = span.copy(span.from, next.from);
                        insertAhead(working, j, span.copy(next.from, span.to));
                    }
                    break;
                }
            }
    }
    return working;
}
function insertAhead(array, i, deco) {
    while (i < array.length && byPos(deco, array[i]) > 0)
        i++;
    array.splice(i, 0, deco);
}
// Get the decorations associated with the current props of a view.
function viewDecorations(view) {
    let found = [];
    view.someProp("decorations", f => {
        let result = f(view.state);
        if (result && result != empty)
            found.push(result);
    });
    if (view.cursorWrapper)
        found.push(DecorationSet.create(view.state.doc, [view.cursorWrapper.deco]));
    return DecorationGroup.from(found);
}

const observeOptions = {
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    attributeOldValue: true,
    subtree: true
};
// IE11 has very broken mutation observers, so we also listen to DOMCharacterDataModified
const useCharData = ie$1 && ie_version <= 11;
class SelectionState {
    constructor() {
        this.anchorNode = null;
        this.anchorOffset = 0;
        this.focusNode = null;
        this.focusOffset = 0;
    }
    set(sel) {
        this.anchorNode = sel.anchorNode;
        this.anchorOffset = sel.anchorOffset;
        this.focusNode = sel.focusNode;
        this.focusOffset = sel.focusOffset;
    }
    clear() {
        this.anchorNode = this.focusNode = null;
    }
    eq(sel) {
        return sel.anchorNode == this.anchorNode && sel.anchorOffset == this.anchorOffset &&
            sel.focusNode == this.focusNode && sel.focusOffset == this.focusOffset;
    }
}
class DOMObserver {
    constructor(view, handleDOMChange) {
        this.view = view;
        this.handleDOMChange = handleDOMChange;
        this.queue = [];
        this.flushingSoon = -1;
        this.observer = null;
        this.currentSelection = new SelectionState;
        this.onCharData = null;
        this.suppressingSelectionUpdates = false;
        this.observer = window.MutationObserver &&
            new window.MutationObserver(mutations => {
                for (let i = 0; i < mutations.length; i++)
                    this.queue.push(mutations[i]);
                // IE11 will sometimes (on backspacing out a single character
                // text node after a BR node) call the observer callback
                // before actually updating the DOM, which will cause
                // ProseMirror to miss the change (see #930)
                if (ie$1 && ie_version <= 11 && mutations.some(m => m.type == "childList" && m.removedNodes.length ||
                    m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
                    this.flushSoon();
                else
                    this.flush();
            });
        if (useCharData) {
            this.onCharData = e => {
                this.queue.push({ target: e.target, type: "characterData", oldValue: e.prevValue });
                this.flushSoon();
            };
        }
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }
    flushSoon() {
        if (this.flushingSoon < 0)
            this.flushingSoon = window.setTimeout(() => { this.flushingSoon = -1; this.flush(); }, 20);
    }
    forceFlush() {
        if (this.flushingSoon > -1) {
            window.clearTimeout(this.flushingSoon);
            this.flushingSoon = -1;
            this.flush();
        }
    }
    start() {
        if (this.observer) {
            this.observer.takeRecords();
            this.observer.observe(this.view.dom, observeOptions);
        }
        if (this.onCharData)
            this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
        this.connectSelection();
    }
    stop() {
        if (this.observer) {
            let take = this.observer.takeRecords();
            if (take.length) {
                for (let i = 0; i < take.length; i++)
                    this.queue.push(take[i]);
                window.setTimeout(() => this.flush(), 20);
            }
            this.observer.disconnect();
        }
        if (this.onCharData)
            this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
        this.disconnectSelection();
    }
    connectSelection() {
        this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
    }
    disconnectSelection() {
        this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
    }
    suppressSelectionUpdates() {
        this.suppressingSelectionUpdates = true;
        setTimeout(() => this.suppressingSelectionUpdates = false, 50);
    }
    onSelectionChange() {
        if (!hasFocusAndSelection(this.view))
            return;
        if (this.suppressingSelectionUpdates)
            return selectionToDOM(this.view);
        // Deletions on IE11 fire their events in the wrong order, giving
        // us a selection change event before the DOM changes are
        // reported.
        if (ie$1 && ie_version <= 11 && !this.view.state.selection.empty) {
            let sel = this.view.domSelectionRange();
            // Selection.isCollapsed isn't reliable on IE
            if (sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
                return this.flushSoon();
        }
        this.flush();
    }
    setCurSelection() {
        this.currentSelection.set(this.view.domSelectionRange());
    }
    ignoreSelectionChange(sel) {
        if (!sel.focusNode)
            return true;
        let ancestors = new Set, container;
        for (let scan = sel.focusNode; scan; scan = parentNode(scan))
            ancestors.add(scan);
        for (let scan = sel.anchorNode; scan; scan = parentNode(scan))
            if (ancestors.has(scan)) {
                container = scan;
                break;
            }
        let desc = container && this.view.docView.nearestDesc(container);
        if (desc && desc.ignoreMutation({
            type: "selection",
            target: container.nodeType == 3 ? container.parentNode : container
        })) {
            this.setCurSelection();
            return true;
        }
    }
    flush() {
        let { view } = this;
        if (!view.docView || this.flushingSoon > -1)
            return;
        let mutations = this.observer ? this.observer.takeRecords() : [];
        if (this.queue.length) {
            mutations = this.queue.concat(mutations);
            this.queue.length = 0;
        }
        let sel = view.domSelectionRange();
        let newSel = !this.suppressingSelectionUpdates && !this.currentSelection.eq(sel) && hasFocusAndSelection(view) && !this.ignoreSelectionChange(sel);
        let from = -1, to = -1, typeOver = false, added = [];
        if (view.editable) {
            for (let i = 0; i < mutations.length; i++) {
                let result = this.registerMutation(mutations[i], added);
                if (result) {
                    from = from < 0 ? result.from : Math.min(result.from, from);
                    to = to < 0 ? result.to : Math.max(result.to, to);
                    if (result.typeOver)
                        typeOver = true;
                }
            }
        }
        if (gecko && added.length > 1) {
            let brs = added.filter(n => n.nodeName == "BR");
            if (brs.length == 2) {
                let a = brs[0], b = brs[1];
                if (a.parentNode && a.parentNode.parentNode == b.parentNode)
                    b.remove();
                else
                    a.remove();
            }
        }
        let readSel = null;
        // If it looks like the browser has reset the selection to the
        // start of the document after focus, restore the selection from
        // the state
        if (from < 0 && newSel && view.input.lastFocus > Date.now() - 200 &&
            Math.max(view.input.lastTouch, view.input.lastClick.time) < Date.now() - 300 &&
            selectionCollapsed(sel) && (readSel = selectionFromDOM(view)) &&
            readSel.eq(Selection.near(view.state.doc.resolve(0), 1))) {
            view.input.lastFocus = 0;
            selectionToDOM(view);
            this.currentSelection.set(sel);
            view.scrollToSelection();
        }
        else if (from > -1 || newSel) {
            if (from > -1) {
                view.docView.markDirty(from, to);
                checkCSS(view);
            }
            this.handleDOMChange(from, to, typeOver, added);
            if (view.docView && view.docView.dirty)
                view.updateState(view.state);
            else if (!this.currentSelection.eq(sel))
                selectionToDOM(view);
            this.currentSelection.set(sel);
        }
    }
    registerMutation(mut, added) {
        // Ignore mutations inside nodes that were already noted as inserted
        if (added.indexOf(mut.target) > -1)
            return null;
        let desc = this.view.docView.nearestDesc(mut.target);
        if (mut.type == "attributes" &&
            (desc == this.view.docView || mut.attributeName == "contenteditable" ||
                // Firefox sometimes fires spurious events for null/empty styles
                (mut.attributeName == "style" && !mut.oldValue && !mut.target.getAttribute("style"))))
            return null;
        if (!desc || desc.ignoreMutation(mut))
            return null;
        if (mut.type == "childList") {
            for (let i = 0; i < mut.addedNodes.length; i++)
                added.push(mut.addedNodes[i]);
            if (desc.contentDOM && desc.contentDOM != desc.dom && !desc.contentDOM.contains(mut.target))
                return { from: desc.posBefore, to: desc.posAfter };
            let prev = mut.previousSibling, next = mut.nextSibling;
            if (ie$1 && ie_version <= 11 && mut.addedNodes.length) {
                // IE11 gives us incorrect next/prev siblings for some
                // insertions, so if there are added nodes, recompute those
                for (let i = 0; i < mut.addedNodes.length; i++) {
                    let { previousSibling, nextSibling } = mut.addedNodes[i];
                    if (!previousSibling || Array.prototype.indexOf.call(mut.addedNodes, previousSibling) < 0)
                        prev = previousSibling;
                    if (!nextSibling || Array.prototype.indexOf.call(mut.addedNodes, nextSibling) < 0)
                        next = nextSibling;
                }
            }
            let fromOffset = prev && prev.parentNode == mut.target
                ? domIndex(prev) + 1 : 0;
            let from = desc.localPosFromDOM(mut.target, fromOffset, -1);
            let toOffset = next && next.parentNode == mut.target
                ? domIndex(next) : mut.target.childNodes.length;
            let to = desc.localPosFromDOM(mut.target, toOffset, 1);
            return { from, to };
        }
        else if (mut.type == "attributes") {
            return { from: desc.posAtStart - desc.border, to: desc.posAtEnd + desc.border };
        }
        else { // "characterData"
            return {
                from: desc.posAtStart,
                to: desc.posAtEnd,
                // An event was generated for a text change that didn't change
                // any text. Mark the dom change to fall back to assuming the
                // selection was typed over with an identical value if it can't
                // find another change.
                typeOver: mut.target.nodeValue == mut.oldValue
            };
        }
    }
}
let cssChecked = new WeakMap();
let cssCheckWarned = false;
function checkCSS(view) {
    if (cssChecked.has(view))
        return;
    cssChecked.set(view, null);
    if (['normal', 'nowrap', 'pre-line'].indexOf(getComputedStyle(view.dom).whiteSpace) !== -1) {
        view.requiresGeckoHackNode = gecko;
        if (cssCheckWarned)
            return;
        console["warn"]("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.");
        cssCheckWarned = true;
    }
}
// Used to work around a Safari Selection/shadow DOM bug
// Based on https://github.com/codemirror/dev/issues/414 fix
function safariShadowSelectionRange(view) {
    let found;
    function read(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        found = event.getTargetRanges()[0];
    }
    // Because Safari (at least in 2018-2022) doesn't provide regular
    // access to the selection inside a shadowRoot, we have to perform a
    // ridiculous hack to get at it—using `execCommand` to trigger a
    // `beforeInput` event so that we can read the target range from the
    // event.
    view.dom.addEventListener("beforeinput", read, true);
    document.execCommand("indent");
    view.dom.removeEventListener("beforeinput", read, true);
    let anchorNode = found.startContainer, anchorOffset = found.startOffset;
    let focusNode = found.endContainer, focusOffset = found.endOffset;
    let currentAnchor = view.domAtPos(view.state.selection.anchor);
    // Since such a range doesn't distinguish between anchor and head,
    // use a heuristic that flips it around if its end matches the
    // current anchor.
    if (isEquivalentPosition(currentAnchor.node, currentAnchor.offset, focusNode, focusOffset))
        [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
}

// Note that all referencing and parsing is done with the
// start-of-operation selection and document, since that's the one
// that the DOM represents. If any changes came in in the meantime,
// the modification is mapped over those before it is applied, in
// readDOMChange.
function parseBetween(view, from_, to_) {
    let { node: parent, fromOffset, toOffset, from, to } = view.docView.parseRange(from_, to_);
    let domSel = view.domSelectionRange();
    let find;
    let anchor = domSel.anchorNode;
    if (anchor && view.dom.contains(anchor.nodeType == 1 ? anchor : anchor.parentNode)) {
        find = [{ node: anchor, offset: domSel.anchorOffset }];
        if (!selectionCollapsed(domSel))
            find.push({ node: domSel.focusNode, offset: domSel.focusOffset });
    }
    // Work around issue in Chrome where backspacing sometimes replaces
    // the deleted content with a random BR node (issues #799, #831)
    if (chrome$1 && view.input.lastKeyCode === 8) {
        for (let off = toOffset; off > fromOffset; off--) {
            let node = parent.childNodes[off - 1], desc = node.pmViewDesc;
            if (node.nodeName == "BR" && !desc) {
                toOffset = off;
                break;
            }
            if (!desc || desc.size)
                break;
        }
    }
    let startDoc = view.state.doc;
    let parser = view.someProp("domParser") || DOMParser.fromSchema(view.state.schema);
    let $from = startDoc.resolve(from);
    let sel = null, doc = parser.parse(parent, {
        topNode: $from.parent,
        topMatch: $from.parent.contentMatchAt($from.index()),
        topOpen: true,
        from: fromOffset,
        to: toOffset,
        preserveWhitespace: $from.parent.type.whitespace == "pre" ? "full" : true,
        findPositions: find,
        ruleFromNode,
        context: $from
    });
    if (find && find[0].pos != null) {
        let anchor = find[0].pos, head = find[1] && find[1].pos;
        if (head == null)
            head = anchor;
        sel = { anchor: anchor + from, head: head + from };
    }
    return { doc, sel, from, to };
}
function ruleFromNode(dom) {
    let desc = dom.pmViewDesc;
    if (desc) {
        return desc.parseRule();
    }
    else if (dom.nodeName == "BR" && dom.parentNode) {
        // Safari replaces the list item or table cell with a BR
        // directly in the list node (?!) if you delete the last
        // character in a list item or table cell (#708, #862)
        if (safari && /^(ul|ol)$/i.test(dom.parentNode.nodeName)) {
            let skip = document.createElement("div");
            skip.appendChild(document.createElement("li"));
            return { skip };
        }
        else if (dom.parentNode.lastChild == dom || safari && /^(tr|table)$/i.test(dom.parentNode.nodeName)) {
            return { ignore: true };
        }
    }
    else if (dom.nodeName == "IMG" && dom.getAttribute("mark-placeholder")) {
        return { ignore: true };
    }
    return null;
}
const isInline = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function readDOMChange(view, from, to, typeOver, addedNodes) {
    if (from < 0) {
        let origin = view.input.lastSelectionTime > Date.now() - 50 ? view.input.lastSelectionOrigin : null;
        let newSel = selectionFromDOM(view, origin);
        if (newSel && !view.state.selection.eq(newSel)) {
            if (chrome$1 && android &&
                view.input.lastKeyCode === 13 && Date.now() - 100 < view.input.lastKeyCodeTime &&
                view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter"))))
                return;
            let tr = view.state.tr.setSelection(newSel);
            if (origin == "pointer")
                tr.setMeta("pointer", true);
            else if (origin == "key")
                tr.scrollIntoView();
            view.dispatch(tr);
        }
        return;
    }
    let $before = view.state.doc.resolve(from);
    let shared = $before.sharedDepth(to);
    from = $before.before(shared + 1);
    to = view.state.doc.resolve(to).after(shared + 1);
    let sel = view.state.selection;
    let parse = parseBetween(view, from, to);
    let doc = view.state.doc, compare = doc.slice(parse.from, parse.to);
    let preferredPos, preferredSide;
    // Prefer anchoring to end when Backspace is pressed
    if (view.input.lastKeyCode === 8 && Date.now() - 100 < view.input.lastKeyCodeTime) {
        preferredPos = view.state.selection.to;
        preferredSide = "end";
    }
    else {
        preferredPos = view.state.selection.from;
        preferredSide = "start";
    }
    view.input.lastKeyCode = null;
    let change = findDiff(compare.content, parse.doc.content, parse.from, preferredPos, preferredSide);
    if ((ios && view.input.lastIOSEnter > Date.now() - 225 || android) &&
        addedNodes.some(n => n.nodeType == 1 && !isInline.test(n.nodeName)) &&
        (!change || change.endA >= change.endB) &&
        view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter")))) {
        view.input.lastIOSEnter = 0;
        return;
    }
    if (!change) {
        if (typeOver && sel instanceof TextSelection && !sel.empty && sel.$head.sameParent(sel.$anchor) &&
            !view.composing && !(parse.sel && parse.sel.anchor != parse.sel.head)) {
            change = { start: sel.from, endA: sel.to, endB: sel.to };
        }
        else {
            if (parse.sel) {
                let sel = resolveSelection(view, view.state.doc, parse.sel);
                if (sel && !sel.eq(view.state.selection))
                    view.dispatch(view.state.tr.setSelection(sel));
            }
            return;
        }
    }
    // Chrome sometimes leaves the cursor before the inserted text when
    // composing after a cursor wrapper. This moves it forward.
    if (chrome$1 && view.cursorWrapper && parse.sel && parse.sel.anchor == view.cursorWrapper.deco.from &&
        parse.sel.head == parse.sel.anchor) {
        let size = change.endB - change.start;
        parse.sel = { anchor: parse.sel.anchor + size, head: parse.sel.anchor + size };
    }
    view.input.domChangeCount++;
    // Handle the case where overwriting a selection by typing matches
    // the start or end of the selected content, creating a change
    // that's smaller than what was actually overwritten.
    if (view.state.selection.from < view.state.selection.to &&
        change.start == change.endB &&
        view.state.selection instanceof TextSelection) {
        if (change.start > view.state.selection.from && change.start <= view.state.selection.from + 2 &&
            view.state.selection.from >= parse.from) {
            change.start = view.state.selection.from;
        }
        else if (change.endA < view.state.selection.to && change.endA >= view.state.selection.to - 2 &&
            view.state.selection.to <= parse.to) {
            change.endB += (view.state.selection.to - change.endA);
            change.endA = view.state.selection.to;
        }
    }
    // IE11 will insert a non-breaking space _ahead_ of the space after
    // the cursor space when adding a space before another space. When
    // that happened, adjust the change to cover the space instead.
    if (ie$1 && ie_version <= 11 && change.endB == change.start + 1 &&
        change.endA == change.start && change.start > parse.from &&
        parse.doc.textBetween(change.start - parse.from - 1, change.start - parse.from + 1) == " \u00a0") {
        change.start--;
        change.endA--;
        change.endB--;
    }
    let $from = parse.doc.resolveNoCache(change.start - parse.from);
    let $to = parse.doc.resolveNoCache(change.endB - parse.from);
    let $fromA = doc.resolve(change.start);
    let inlineChange = $from.sameParent($to) && $from.parent.inlineContent && $fromA.end() >= change.endA;
    let nextSel;
    // If this looks like the effect of pressing Enter (or was recorded
    // as being an iOS enter press), just dispatch an Enter key instead.
    if (((ios && view.input.lastIOSEnter > Date.now() - 225 &&
        (!inlineChange || addedNodes.some(n => n.nodeName == "DIV" || n.nodeName == "P"))) ||
        (!inlineChange && $from.pos < parse.doc.content.size &&
            (nextSel = Selection.findFrom(parse.doc.resolve($from.pos + 1), 1, true)) &&
            nextSel.head == $to.pos)) &&
        view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter")))) {
        view.input.lastIOSEnter = 0;
        return;
    }
    // Same for backspace
    if (view.state.selection.anchor > change.start &&
        looksLikeJoin(doc, change.start, change.endA, $from, $to) &&
        view.someProp("handleKeyDown", f => f(view, keyEvent(8, "Backspace")))) {
        if (android && chrome$1)
            view.domObserver.suppressSelectionUpdates(); // #820
        return;
    }
    // Chrome Android will occasionally, during composition, delete the
    // entire composition and then immediately insert it again. This is
    // used to detect that situation.
    if (chrome$1 && android && change.endB == change.start)
        view.input.lastAndroidDelete = Date.now();
    // This tries to detect Android virtual keyboard
    // enter-and-pick-suggestion action. That sometimes (see issue
    // #1059) first fires a DOM mutation, before moving the selection to
    // the newly created block. And then, because ProseMirror cleans up
    // the DOM selection, it gives up moving the selection entirely,
    // leaving the cursor in the wrong place. When that happens, we drop
    // the new paragraph from the initial change, and fire a simulated
    // enter key afterwards.
    if (android && !inlineChange && $from.start() != $to.start() && $to.parentOffset == 0 && $from.depth == $to.depth &&
        parse.sel && parse.sel.anchor == parse.sel.head && parse.sel.head == change.endA) {
        change.endB -= 2;
        $to = parse.doc.resolveNoCache(change.endB - parse.from);
        setTimeout(() => {
            view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(13, "Enter")); });
        }, 20);
    }
    let chFrom = change.start, chTo = change.endA;
    let tr, storedMarks, markChange;
    if (inlineChange) {
        if ($from.pos == $to.pos) { // Deletion
            // IE11 sometimes weirdly moves the DOM selection around after
            // backspacing out the first element in a textblock
            if (ie$1 && ie_version <= 11 && $from.parentOffset == 0) {
                view.domObserver.suppressSelectionUpdates();
                setTimeout(() => selectionToDOM(view), 20);
            }
            tr = view.state.tr.delete(chFrom, chTo);
            storedMarks = doc.resolve(change.start).marksAcross(doc.resolve(change.endA));
        }
        else if ( // Adding or removing a mark
        change.endA == change.endB &&
            (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset), $fromA.parent.content.cut($fromA.parentOffset, change.endA - $fromA.start())))) {
            tr = view.state.tr;
            if (markChange.type == "add")
                tr.addMark(chFrom, chTo, markChange.mark);
            else
                tr.removeMark(chFrom, chTo, markChange.mark);
        }
        else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
            // Both positions in the same text node -- simply insert text
            let text = $from.parent.textBetween($from.parentOffset, $to.parentOffset);
            if (view.someProp("handleTextInput", f => f(view, chFrom, chTo, text)))
                return;
            tr = view.state.tr.insertText(text, chFrom, chTo);
        }
    }
    if (!tr)
        tr = view.state.tr.replace(chFrom, chTo, parse.doc.slice(change.start - parse.from, change.endB - parse.from));
    if (parse.sel) {
        let sel = resolveSelection(view, tr.doc, parse.sel);
        // Chrome Android will sometimes, during composition, report the
        // selection in the wrong place. If it looks like that is
        // happening, don't update the selection.
        // Edge just doesn't move the cursor forward when you start typing
        // in an empty block or between br nodes.
        if (sel && !(chrome$1 && android && view.composing && sel.empty &&
            (change.start != change.endB || view.input.lastAndroidDelete < Date.now() - 100) &&
            (sel.head == chFrom || sel.head == tr.mapping.map(chTo) - 1) ||
            ie$1 && sel.empty && sel.head == chFrom))
            tr.setSelection(sel);
    }
    if (storedMarks)
        tr.ensureMarks(storedMarks);
    view.dispatch(tr.scrollIntoView());
}
function resolveSelection(view, doc, parsedSel) {
    if (Math.max(parsedSel.anchor, parsedSel.head) > doc.content.size)
        return null;
    return selectionBetween(view, doc.resolve(parsedSel.anchor), doc.resolve(parsedSel.head));
}
// Given two same-length, non-empty fragments of inline content,
// determine whether the first could be created from the second by
// removing or adding a single mark type.
function isMarkChange(cur, prev) {
    let curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks;
    let added = curMarks, removed = prevMarks, type, mark, update;
    for (let i = 0; i < prevMarks.length; i++)
        added = prevMarks[i].removeFromSet(added);
    for (let i = 0; i < curMarks.length; i++)
        removed = curMarks[i].removeFromSet(removed);
    if (added.length == 1 && removed.length == 0) {
        mark = added[0];
        type = "add";
        update = (node) => node.mark(mark.addToSet(node.marks));
    }
    else if (added.length == 0 && removed.length == 1) {
        mark = removed[0];
        type = "remove";
        update = (node) => node.mark(mark.removeFromSet(node.marks));
    }
    else {
        return null;
    }
    let updated = [];
    for (let i = 0; i < prev.childCount; i++)
        updated.push(update(prev.child(i)));
    if (Fragment.from(updated).eq(cur))
        return { mark, type };
}
function looksLikeJoin(old, start, end, $newStart, $newEnd) {
    if (!$newStart.parent.isTextblock ||
        // The content must have shrunk
        end - start <= $newEnd.pos - $newStart.pos ||
        // newEnd must point directly at or after the end of the block that newStart points into
        skipClosingAndOpening($newStart, true, false) < $newEnd.pos)
        return false;
    let $start = old.resolve(start);
    // Start must be at the end of a block
    if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock)
        return false;
    let $next = old.resolve(skipClosingAndOpening($start, true, true));
    // The next textblock must start before end and end near it
    if (!$next.parent.isTextblock || $next.pos > end ||
        skipClosingAndOpening($next, true, false) < end)
        return false;
    // The fragments after the join point must match
    return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content);
}
function skipClosingAndOpening($pos, fromEnd, mayOpen) {
    let depth = $pos.depth, end = fromEnd ? $pos.end() : $pos.pos;
    while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
        depth--;
        end++;
        fromEnd = false;
    }
    if (mayOpen) {
        let next = $pos.node(depth).maybeChild($pos.indexAfter(depth));
        while (next && !next.isLeaf) {
            next = next.firstChild;
            end++;
        }
    }
    return end;
}
function findDiff(a, b, pos, preferredPos, preferredSide) {
    let start = a.findDiffStart(b, pos);
    if (start == null)
        return null;
    let { a: endA, b: endB } = a.findDiffEnd(b, pos + a.size, pos + b.size);
    if (preferredSide == "end") {
        let adjust = Math.max(0, start - Math.min(endA, endB));
        preferredPos -= endA + adjust - start;
    }
    if (endA < start && a.size < b.size) {
        let move = preferredPos <= start && preferredPos >= endA ? start - preferredPos : 0;
        start -= move;
        endB = start + (endB - endA);
        endA = start;
    }
    else if (endB < start) {
        let move = preferredPos <= start && preferredPos >= endB ? start - preferredPos : 0;
        start -= move;
        endA = start + (endA - endB);
        endB = start;
    }
    return { start, endA, endB };
}
/**
An editor view manages the DOM structure that represents an
editable document. Its state and behavior are determined by its
[props](https://prosemirror.net/docs/ref/#view.DirectEditorProps).
*/
class EditorView {
    /**
    Create a view. `place` may be a DOM node that the editor should
    be appended to, a function that will place it into the document,
    or an object whose `mount` property holds the node to use as the
    document container. If it is `null`, the editor will not be
    added to the document.
    */
    constructor(place, props) {
        this._root = null;
        /**
        @internal
        */
        this.focused = false;
        /**
        Kludge used to work around a Chrome bug @internal
        */
        this.trackWrites = null;
        this.mounted = false;
        /**
        @internal
        */
        this.markCursor = null;
        /**
        @internal
        */
        this.cursorWrapper = null;
        /**
        @internal
        */
        this.lastSelectedViewDesc = undefined;
        /**
        @internal
        */
        this.input = new InputState;
        this.prevDirectPlugins = [];
        this.pluginViews = [];
        /**
        Holds `true` when a hack node is needed in Firefox to prevent the
        [space is eaten issue](https://github.com/ProseMirror/prosemirror/issues/651)
        @internal
        */
        this.requiresGeckoHackNode = false;
        /**
        When editor content is being dragged, this object contains
        information about the dragged slice and whether it is being
        copied or moved. At any other time, it is null.
        */
        this.dragging = null;
        this._props = props;
        this.state = props.state;
        this.directPlugins = props.plugins || [];
        this.directPlugins.forEach(checkStateComponent);
        this.dispatch = this.dispatch.bind(this);
        this.dom = (place && place.mount) || document.createElement("div");
        if (place) {
            if (place.appendChild)
                place.appendChild(this.dom);
            else if (typeof place == "function")
                place(this.dom);
            else if (place.mount)
                this.mounted = true;
        }
        this.editable = getEditable(this);
        updateCursorWrapper(this);
        this.nodeViews = buildNodeViews(this);
        this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.dom, this);
        this.domObserver = new DOMObserver(this, (from, to, typeOver, added) => readDOMChange(this, from, to, typeOver, added));
        this.domObserver.start();
        initInput(this);
        this.updatePluginViews();
    }
    /**
    Holds `true` when a
    [composition](https://w3c.github.io/uievents/#events-compositionevents)
    is active.
    */
    get composing() { return this.input.composing; }
    /**
    The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
    */
    get props() {
        if (this._props.state != this.state) {
            let prev = this._props;
            this._props = {};
            for (let name in prev)
                this._props[name] = prev[name];
            this._props.state = this.state;
        }
        return this._props;
    }
    /**
    Update the view's props. Will immediately cause an update to
    the DOM.
    */
    update(props) {
        if (props.handleDOMEvents != this._props.handleDOMEvents)
            ensureListeners(this);
        let prevProps = this._props;
        this._props = props;
        if (props.plugins) {
            props.plugins.forEach(checkStateComponent);
            this.directPlugins = props.plugins;
        }
        this.updateStateInner(props.state, prevProps);
    }
    /**
    Update the view by updating existing props object with the object
    given as argument. Equivalent to `view.update(Object.assign({},
    view.props, props))`.
    */
    setProps(props) {
        let updated = {};
        for (let name in this._props)
            updated[name] = this._props[name];
        updated.state = this.state;
        for (let name in props)
            updated[name] = props[name];
        this.update(updated);
    }
    /**
    Update the editor's `state` prop, without touching any of the
    other props.
    */
    updateState(state) {
        this.updateStateInner(state, this._props);
    }
    updateStateInner(state, prevProps) {
        let prev = this.state, redraw = false, updateSel = false;
        // When stored marks are added, stop composition, so that they can
        // be displayed.
        if (state.storedMarks && this.composing) {
            clearComposition(this);
            updateSel = true;
        }
        this.state = state;
        let pluginsChanged = prev.plugins != state.plugins || this._props.plugins != prevProps.plugins;
        if (pluginsChanged || this._props.plugins != prevProps.plugins || this._props.nodeViews != prevProps.nodeViews) {
            let nodeViews = buildNodeViews(this);
            if (changedNodeViews(nodeViews, this.nodeViews)) {
                this.nodeViews = nodeViews;
                redraw = true;
            }
        }
        if (pluginsChanged || prevProps.handleDOMEvents != this._props.handleDOMEvents) {
            ensureListeners(this);
        }
        this.editable = getEditable(this);
        updateCursorWrapper(this);
        let innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this);
        let scroll = prev.plugins != state.plugins && !prev.doc.eq(state.doc) ? "reset"
            : state.scrollToSelection > prev.scrollToSelection ? "to selection" : "preserve";
        let updateDoc = redraw || !this.docView.matchesNode(state.doc, outerDeco, innerDeco);
        if (updateDoc || !state.selection.eq(prev.selection))
            updateSel = true;
        let oldScrollPos = scroll == "preserve" && updateSel && this.dom.style.overflowAnchor == null && storeScrollPos(this);
        if (updateSel) {
            this.domObserver.stop();
            // Work around an issue in Chrome, IE, and Edge where changing
            // the DOM around an active selection puts it into a broken
            // state where the thing the user sees differs from the
            // selection reported by the Selection object (#710, #973,
            // #1011, #1013, #1035).
            let forceSelUpdate = updateDoc && (ie$1 || chrome$1) && !this.composing &&
                !prev.selection.empty && !state.selection.empty && selectionContextChanged(prev.selection, state.selection);
            if (updateDoc) {
                // If the node that the selection points into is written to,
                // Chrome sometimes starts misreporting the selection, so this
                // tracks that and forces a selection reset when our update
                // did write to the node.
                let chromeKludge = chrome$1 ? (this.trackWrites = this.domSelectionRange().focusNode) : null;
                if (redraw || !this.docView.update(state.doc, outerDeco, innerDeco, this)) {
                    this.docView.updateOuterDeco([]);
                    this.docView.destroy();
                    this.docView = docViewDesc(state.doc, outerDeco, innerDeco, this.dom, this);
                }
                if (chromeKludge && !this.trackWrites)
                    forceSelUpdate = true;
            }
            // Work around for an issue where an update arriving right between
            // a DOM selection change and the "selectionchange" event for it
            // can cause a spurious DOM selection update, disrupting mouse
            // drag selection.
            if (forceSelUpdate ||
                !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) &&
                    anchorInRightPlace(this))) {
                selectionToDOM(this, forceSelUpdate);
            }
            else {
                syncNodeSelection(this, state.selection);
                this.domObserver.setCurSelection();
            }
            this.domObserver.start();
        }
        this.updatePluginViews(prev);
        if (scroll == "reset") {
            this.dom.scrollTop = 0;
        }
        else if (scroll == "to selection") {
            this.scrollToSelection();
        }
        else if (oldScrollPos) {
            resetScrollPos(oldScrollPos);
        }
    }
    /**
    @internal
    */
    scrollToSelection() {
        let startDOM = this.domSelectionRange().focusNode;
        if (this.someProp("handleScrollToSelection", f => f(this))) ;
        else if (this.state.selection instanceof NodeSelection) {
            let target = this.docView.domAfterPos(this.state.selection.from);
            if (target.nodeType == 1)
                scrollRectIntoView(this, target.getBoundingClientRect(), startDOM);
        }
        else {
            scrollRectIntoView(this, this.coordsAtPos(this.state.selection.head, 1), startDOM);
        }
    }
    destroyPluginViews() {
        let view;
        while (view = this.pluginViews.pop())
            if (view.destroy)
                view.destroy();
    }
    updatePluginViews(prevState) {
        if (!prevState || prevState.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
            this.prevDirectPlugins = this.directPlugins;
            this.destroyPluginViews();
            for (let i = 0; i < this.directPlugins.length; i++) {
                let plugin = this.directPlugins[i];
                if (plugin.spec.view)
                    this.pluginViews.push(plugin.spec.view(this));
            }
            for (let i = 0; i < this.state.plugins.length; i++) {
                let plugin = this.state.plugins[i];
                if (plugin.spec.view)
                    this.pluginViews.push(plugin.spec.view(this));
            }
        }
        else {
            for (let i = 0; i < this.pluginViews.length; i++) {
                let pluginView = this.pluginViews[i];
                if (pluginView.update)
                    pluginView.update(this, prevState);
            }
        }
    }
    someProp(propName, f) {
        let prop = this._props && this._props[propName], value;
        if (prop != null && (value = f ? f(prop) : prop))
            return value;
        for (let i = 0; i < this.directPlugins.length; i++) {
            let prop = this.directPlugins[i].props[propName];
            if (prop != null && (value = f ? f(prop) : prop))
                return value;
        }
        let plugins = this.state.plugins;
        if (plugins)
            for (let i = 0; i < plugins.length; i++) {
                let prop = plugins[i].props[propName];
                if (prop != null && (value = f ? f(prop) : prop))
                    return value;
            }
    }
    /**
    Query whether the view has focus.
    */
    hasFocus() {
        // Work around IE not handling focus correctly if resize handles are shown.
        // If the cursor is inside an element with resize handles, activeElement
        // will be that element instead of this.dom.
        if (ie$1) {
            // If activeElement is within this.dom, and there are no other elements
            // setting `contenteditable` to false in between, treat it as focused.
            let node = this.root.activeElement;
            if (node == this.dom)
                return true;
            if (!node || !this.dom.contains(node))
                return false;
            while (node && this.dom != node && this.dom.contains(node)) {
                if (node.contentEditable == 'false')
                    return false;
                node = node.parentElement;
            }
            return true;
        }
        return this.root.activeElement == this.dom;
    }
    /**
    Focus the editor.
    */
    focus() {
        this.domObserver.stop();
        if (this.editable)
            focusPreventScroll(this.dom);
        selectionToDOM(this);
        this.domObserver.start();
    }
    /**
    Get the document root in which the editor exists. This will
    usually be the top-level `document`, but might be a [shadow
    DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
    root if the editor is inside one.
    */
    get root() {
        let cached = this._root;
        if (cached == null)
            for (let search = this.dom.parentNode; search; search = search.parentNode) {
                if (search.nodeType == 9 || (search.nodeType == 11 && search.host)) {
                    if (!search.getSelection)
                        Object.getPrototypeOf(search).getSelection = () => search.ownerDocument.getSelection();
                    return this._root = search;
                }
            }
        return cached || document;
    }
    /**
    Given a pair of viewport coordinates, return the document
    position that corresponds to them. May return null if the given
    coordinates aren't inside of the editor. When an object is
    returned, its `pos` property is the position nearest to the
    coordinates, and its `inside` property holds the position of the
    inner node that the position falls inside of, or -1 if it is at
    the top level, not in any node.
    */
    posAtCoords(coords) {
        return posAtCoords(this, coords);
    }
    /**
    Returns the viewport rectangle at a given document position.
    `left` and `right` will be the same number, as this returns a
    flat cursor-ish rectangle. If the position is between two things
    that aren't directly adjacent, `side` determines which element
    is used. When < 0, the element before the position is used,
    otherwise the element after.
    */
    coordsAtPos(pos, side = 1) {
        return coordsAtPos(this, pos, side);
    }
    /**
    Find the DOM position that corresponds to the given document
    position. When `side` is negative, find the position as close as
    possible to the content before the position. When positive,
    prefer positions close to the content after the position. When
    zero, prefer as shallow a position as possible.
    
    Note that you should **not** mutate the editor's internal DOM,
    only inspect it (and even that is usually not necessary).
    */
    domAtPos(pos, side = 0) {
        return this.docView.domFromPos(pos, side);
    }
    /**
    Find the DOM node that represents the document node after the
    given position. May return `null` when the position doesn't point
    in front of a node or if the node is inside an opaque node view.
    
    This is intended to be able to call things like
    `getBoundingClientRect` on that DOM node. Do **not** mutate the
    editor DOM directly, or add styling this way, since that will be
    immediately overriden by the editor as it redraws the node.
    */
    nodeDOM(pos) {
        let desc = this.docView.descAt(pos);
        return desc ? desc.nodeDOM : null;
    }
    /**
    Find the document position that corresponds to a given DOM
    position. (Whenever possible, it is preferable to inspect the
    document structure directly, rather than poking around in the
    DOM, but sometimes—for example when interpreting an event
    target—you don't have a choice.)
    
    The `bias` parameter can be used to influence which side of a DOM
    node to use when the position is inside a leaf node.
    */
    posAtDOM(node, offset, bias = -1) {
        let pos = this.docView.posFromDOM(node, offset, bias);
        if (pos == null)
            throw new RangeError("DOM position not inside the editor");
        return pos;
    }
    /**
    Find out whether the selection is at the end of a textblock when
    moving in a given direction. When, for example, given `"left"`,
    it will return true if moving left from the current cursor
    position would leave that position's parent textblock. Will apply
    to the view's current state by default, but it is possible to
    pass a different state.
    */
    endOfTextblock(dir, state) {
        return endOfTextblock(this, state || this.state, dir);
    }
    /**
    Run the editor's paste logic with the given HTML string. The
    `event`, if given, will be passed to the
    [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
    */
    pasteHTML(html, event) {
        return doPaste(this, "", html, false, event || new ClipboardEvent("paste"));
    }
    /**
    Run the editor's paste logic with the given plain-text input.
    */
    pasteText(text, event) {
        return doPaste(this, text, null, true, event || new ClipboardEvent("paste"));
    }
    /**
    Removes the editor from the DOM and destroys all [node
    views](https://prosemirror.net/docs/ref/#view.NodeView).
    */
    destroy() {
        if (!this.docView)
            return;
        destroyInput(this);
        this.destroyPluginViews();
        if (this.mounted) {
            this.docView.update(this.state.doc, [], viewDecorations(this), this);
            this.dom.textContent = "";
        }
        else if (this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
        }
        this.docView.destroy();
        this.docView = null;
    }
    /**
    This is true when the view has been
    [destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
    used anymore).
    */
    get isDestroyed() {
        return this.docView == null;
    }
    /**
    Used for testing.
    */
    dispatchEvent(event) {
        return dispatchEvent(this, event);
    }
    /**
    Dispatch a transaction. Will call
    [`dispatchTransaction`](https://prosemirror.net/docs/ref/#view.DirectEditorProps.dispatchTransaction)
    when given, and otherwise defaults to applying the transaction to
    the current state and calling
    [`updateState`](https://prosemirror.net/docs/ref/#view.EditorView.updateState) with the result.
    This method is bound to the view instance, so that it can be
    easily passed around.
    */
    dispatch(tr) {
        let dispatchTransaction = this._props.dispatchTransaction;
        if (dispatchTransaction)
            dispatchTransaction.call(this, tr);
        else
            this.updateState(this.state.apply(tr));
    }
    /**
    @internal
    */
    domSelectionRange() {
        return safari && this.root.nodeType === 11 && deepActiveElement(this.dom.ownerDocument) == this.dom
            ? safariShadowSelectionRange(this) : this.domSelection();
    }
    /**
    @internal
    */
    domSelection() {
        return this.root.getSelection();
    }
}
function computeDocDeco(view) {
    let attrs = Object.create(null);
    attrs.class = "ProseMirror";
    attrs.contenteditable = String(view.editable);
    attrs.translate = "no";
    view.someProp("attributes", value => {
        if (typeof value == "function")
            value = value(view.state);
        if (value)
            for (let attr in value) {
                if (attr == "class")
                    attrs.class += " " + value[attr];
                if (attr == "style") {
                    attrs.style = (attrs.style ? attrs.style + ";" : "") + value[attr];
                }
                else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName")
                    attrs[attr] = String(value[attr]);
            }
    });
    return [Decoration.node(0, view.state.doc.content.size, attrs)];
}
function updateCursorWrapper(view) {
    if (view.markCursor) {
        let dom = document.createElement("img");
        dom.className = "ProseMirror-separator";
        dom.setAttribute("mark-placeholder", "true");
        dom.setAttribute("alt", "");
        view.cursorWrapper = { dom, deco: Decoration.widget(view.state.selection.head, dom, { raw: true, marks: view.markCursor }) };
    }
    else {
        view.cursorWrapper = null;
    }
}
function getEditable(view) {
    return !view.someProp("editable", value => value(view.state) === false);
}
function selectionContextChanged(sel1, sel2) {
    let depth = Math.min(sel1.$anchor.sharedDepth(sel1.head), sel2.$anchor.sharedDepth(sel2.head));
    return sel1.$anchor.start(depth) != sel2.$anchor.start(depth);
}
function buildNodeViews(view) {
    let result = Object.create(null);
    function add(obj) {
        for (let prop in obj)
            if (!Object.prototype.hasOwnProperty.call(result, prop))
                result[prop] = obj[prop];
    }
    view.someProp("nodeViews", add);
    view.someProp("markViews", add);
    return result;
}
function changedNodeViews(a, b) {
    let nA = 0, nB = 0;
    for (let prop in a) {
        if (a[prop] != b[prop])
            return true;
        nA++;
    }
    for (let _ in b)
        nB++;
    return nA != nB;
}
function checkStateComponent(plugin) {
    if (plugin.spec.state || plugin.spec.filterTransaction || plugin.spec.appendTransaction)
        throw new RangeError("Plugins passed directly to the view must not have a state component");
}

var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
};

var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: "\""
};

var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
var mac$1 = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
var brokenModifierNames = mac$1 || chrome && +chrome[1] < 57;

// Fill in the digit keys
for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);

// The function keys
for (var i = 1; i <= 24; i++) base[i + 111] = "F" + i;

// And the alphabetic keys
for (var i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32);
  shift[i] = String.fromCharCode(i);
}

// For each code that doesn't have a shift-equivalent, copy the base name
for (var code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code];

function keyName(event) {
  var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) ||
    ie && event.shiftKey && event.key && event.key.length == 1 ||
    event.key == "Unidentified";
  var name = (!ignoreKey && event.key) ||
    (event.shiftKey ? shift : base)[event.keyCode] ||
    event.key || "Unidentified";
  // Edge sometimes produces wrong names (Issue #3)
  if (name == "Esc") name = "Escape";
  if (name == "Del") name = "Delete";
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
  if (name == "Left") name = "ArrowLeft";
  if (name == "Up") name = "ArrowUp";
  if (name == "Right") name = "ArrowRight";
  if (name == "Down") name = "ArrowDown";
  return name
}

const mac = typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false;
function normalizeKeyName$1(name) {
    let parts = name.split(/-(?!$)/), result = parts[parts.length - 1];
    if (result == "Space")
        result = " ";
    let alt, ctrl, shift, meta;
    for (let i = 0; i < parts.length - 1; i++) {
        let mod = parts[i];
        if (/^(cmd|meta|m)$/i.test(mod))
            meta = true;
        else if (/^a(lt)?$/i.test(mod))
            alt = true;
        else if (/^(c|ctrl|control)$/i.test(mod))
            ctrl = true;
        else if (/^s(hift)?$/i.test(mod))
            shift = true;
        else if (/^mod$/i.test(mod)) {
            if (mac)
                meta = true;
            else
                ctrl = true;
        }
        else
            throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
        result = "Alt-" + result;
    if (ctrl)
        result = "Ctrl-" + result;
    if (meta)
        result = "Meta-" + result;
    if (shift)
        result = "Shift-" + result;
    return result;
}
function normalize(map) {
    let copy = Object.create(null);
    for (let prop in map)
        copy[normalizeKeyName$1(prop)] = map[prop];
    return copy;
}
function modifiers(name, event, shift = true) {
    if (event.altKey)
        name = "Alt-" + name;
    if (event.ctrlKey)
        name = "Ctrl-" + name;
    if (event.metaKey)
        name = "Meta-" + name;
    if (shift && event.shiftKey)
        name = "Shift-" + name;
    return name;
}
/**
Create a keymap plugin for the given set of bindings.

Bindings should map key names to [command](https://prosemirror.net/docs/ref/#commands)-style
functions, which will be called with `(EditorState, dispatch,
EditorView)` arguments, and should return true when they've handled
the key. Note that the view argument isn't part of the command
protocol, but can be used as an escape hatch if a binding needs to
directly interact with the UI.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key
identifier prefixed with zero or more modifiers. Key identifiers
are based on the strings that can appear in
[`KeyEvent.key`](https:developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized. For characters that are created by holding
shift, the `Shift-` prefix is implied, and should not be added
explicitly.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms.

You can add multiple keymap plugins to an editor. The order in
which they appear determines their precedence (the ones early in
the array get to dispatch first).
*/
function keymap(bindings) {
    return new Plugin({ props: { handleKeyDown: keydownHandler(bindings) } });
}
/**
Given a set of bindings (using the same format as
[`keymap`](https://prosemirror.net/docs/ref/#keymap.keymap)), return a [keydown
handler](https://prosemirror.net/docs/ref/#view.EditorProps.handleKeyDown) that handles them.
*/
function keydownHandler(bindings) {
    let map = normalize(bindings);
    return function (view, event) {
        let name = keyName(event), baseName, direct = map[modifiers(name, event)];
        if (direct && direct(view.state, view.dispatch, view))
            return true;
        // A character key
        if (name.length == 1 && name != " ") {
            if (event.shiftKey) {
                // In case the name was already modified by shift, try looking
                // it up without its shift modifier
                let noShift = map[modifiers(name, event, false)];
                if (noShift && noShift(view.state, view.dispatch, view))
                    return true;
            }
            if ((event.shiftKey || event.altKey || event.metaKey || name.charCodeAt(0) > 127) &&
                (baseName = base[event.keyCode]) && baseName != name) {
                // Try falling back to the keyCode when there's a modifier
                // active or the character produced isn't ASCII, and our table
                // produces a different name from the the keyCode. See #668,
                // #1060
                let fromCode = map[modifiers(baseName, event)];
                if (fromCode && fromCode(view.state, view.dispatch, view))
                    return true;
            }
        }
        return false;
    };
}

/**
Delete the selection, if there is one.
*/
const deleteSelection$1 = (state, dispatch) => {
    if (state.selection.empty)
        return false;
    if (dispatch)
        dispatch(state.tr.deleteSelection().scrollIntoView());
    return true;
};
function atBlockStart(state, view) {
    let { $cursor } = state.selection;
    if (!$cursor || (view ? !view.endOfTextblock("backward", state)
        : $cursor.parentOffset > 0))
        return null;
    return $cursor;
}
/**
If the selection is empty and at the start of a textblock, try to
reduce the distance between that block and the one before it—if
there's a block directly before it that can be joined, join them.
If not, try to move the selected block closer to the next one in
the document structure by lifting it out of its parent or moving it
into a parent of the previous block. Will use the view for accurate
(bidi-aware) start-of-textblock detection if given.
*/
const joinBackward$1 = (state, dispatch, view) => {
    let $cursor = atBlockStart(state, view);
    if (!$cursor)
        return false;
    let $cut = findCutBefore($cursor);
    // If there is no node before this, try to lift
    if (!$cut) {
        let range = $cursor.blockRange(), target = range && liftTarget(range);
        if (target == null)
            return false;
        if (dispatch)
            dispatch(state.tr.lift(range, target).scrollIntoView());
        return true;
    }
    let before = $cut.nodeBefore;
    // Apply the joining algorithm
    if (!before.type.spec.isolating && deleteBarrier(state, $cut, dispatch))
        return true;
    // If the node below has no content and the node above is
    // selectable, delete the node below and select the one above.
    if ($cursor.parent.content.size == 0 &&
        (textblockAt(before, "end") || NodeSelection.isSelectable(before))) {
        let delStep = replaceStep(state.doc, $cursor.before(), $cursor.after(), Slice.empty);
        if (delStep && delStep.slice.size < delStep.to - delStep.from) {
            if (dispatch) {
                let tr = state.tr.step(delStep);
                tr.setSelection(textblockAt(before, "end") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1)
                    : NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
    }
    // If the node before is an atom, delete it
    if (before.isAtom && $cut.depth == $cursor.depth - 1) {
        if (dispatch)
            dispatch(state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView());
        return true;
    }
    return false;
};
function textblockAt(node, side, only = false) {
    for (let scan = node; scan; scan = (side == "start" ? scan.firstChild : scan.lastChild)) {
        if (scan.isTextblock)
            return true;
        if (only && scan.childCount != 1)
            return false;
    }
    return false;
}
/**
When the selection is empty and at the start of a textblock, select
the node before that textblock, if possible. This is intended to be
bound to keys like backspace, after
[`joinBackward`](https://prosemirror.net/docs/ref/#commands.joinBackward) or other deleting
commands, as a fall-back behavior when the schema doesn't allow
deletion at the selected point.
*/
const selectNodeBackward$1 = (state, dispatch, view) => {
    let { $head, empty } = state.selection, $cut = $head;
    if (!empty)
        return false;
    if ($head.parent.isTextblock) {
        if (view ? !view.endOfTextblock("backward", state) : $head.parentOffset > 0)
            return false;
        $cut = findCutBefore($head);
    }
    let node = $cut && $cut.nodeBefore;
    if (!node || !NodeSelection.isSelectable(node))
        return false;
    if (dispatch)
        dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos - node.nodeSize)).scrollIntoView());
    return true;
};
function findCutBefore($pos) {
    if (!$pos.parent.type.spec.isolating)
        for (let i = $pos.depth - 1; i >= 0; i--) {
            if ($pos.index(i) > 0)
                return $pos.doc.resolve($pos.before(i + 1));
            if ($pos.node(i).type.spec.isolating)
                break;
        }
    return null;
}
function atBlockEnd(state, view) {
    let { $cursor } = state.selection;
    if (!$cursor || (view ? !view.endOfTextblock("forward", state)
        : $cursor.parentOffset < $cursor.parent.content.size))
        return null;
    return $cursor;
}
/**
If the selection is empty and the cursor is at the end of a
textblock, try to reduce or remove the boundary between that block
and the one after it, either by joining them or by moving the other
block closer to this one in the tree structure. Will use the view
for accurate start-of-textblock detection if given.
*/
const joinForward$1 = (state, dispatch, view) => {
    let $cursor = atBlockEnd(state, view);
    if (!$cursor)
        return false;
    let $cut = findCutAfter($cursor);
    // If there is no node after this, there's nothing to do
    if (!$cut)
        return false;
    let after = $cut.nodeAfter;
    // Try the joining algorithm
    if (deleteBarrier(state, $cut, dispatch))
        return true;
    // If the node above has no content and the node below is
    // selectable, delete the node above and select the one below.
    if ($cursor.parent.content.size == 0 &&
        (textblockAt(after, "start") || NodeSelection.isSelectable(after))) {
        let delStep = replaceStep(state.doc, $cursor.before(), $cursor.after(), Slice.empty);
        if (delStep && delStep.slice.size < delStep.to - delStep.from) {
            if (dispatch) {
                let tr = state.tr.step(delStep);
                tr.setSelection(textblockAt(after, "start") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1)
                    : NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
    }
    // If the next node is an atom, delete it
    if (after.isAtom && $cut.depth == $cursor.depth - 1) {
        if (dispatch)
            dispatch(state.tr.delete($cut.pos, $cut.pos + after.nodeSize).scrollIntoView());
        return true;
    }
    return false;
};
/**
When the selection is empty and at the end of a textblock, select
the node coming after that textblock, if possible. This is intended
to be bound to keys like delete, after
[`joinForward`](https://prosemirror.net/docs/ref/#commands.joinForward) and similar deleting
commands, to provide a fall-back behavior when the schema doesn't
allow deletion at the selected point.
*/
const selectNodeForward$1 = (state, dispatch, view) => {
    let { $head, empty } = state.selection, $cut = $head;
    if (!empty)
        return false;
    if ($head.parent.isTextblock) {
        if (view ? !view.endOfTextblock("forward", state) : $head.parentOffset < $head.parent.content.size)
            return false;
        $cut = findCutAfter($head);
    }
    let node = $cut && $cut.nodeAfter;
    if (!node || !NodeSelection.isSelectable(node))
        return false;
    if (dispatch)
        dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos)).scrollIntoView());
    return true;
};
function findCutAfter($pos) {
    if (!$pos.parent.type.spec.isolating)
        for (let i = $pos.depth - 1; i >= 0; i--) {
            let parent = $pos.node(i);
            if ($pos.index(i) + 1 < parent.childCount)
                return $pos.doc.resolve($pos.after(i + 1));
            if (parent.type.spec.isolating)
                break;
        }
    return null;
}
/**
Join the selected block or, if there is a text selection, the
closest ancestor block of the selection that can be joined, with
the sibling above it.
*/
const joinUp$1 = (state, dispatch) => {
    let sel = state.selection, nodeSel = sel instanceof NodeSelection, point;
    if (nodeSel) {
        if (sel.node.isTextblock || !canJoin(state.doc, sel.from))
            return false;
        point = sel.from;
    }
    else {
        point = joinPoint(state.doc, sel.from, -1);
        if (point == null)
            return false;
    }
    if (dispatch) {
        let tr = state.tr.join(point);
        if (nodeSel)
            tr.setSelection(NodeSelection.create(tr.doc, point - state.doc.resolve(point).nodeBefore.nodeSize));
        dispatch(tr.scrollIntoView());
    }
    return true;
};
/**
Join the selected block, or the closest ancestor of the selection
that can be joined, with the sibling after it.
*/
const joinDown$1 = (state, dispatch) => {
    let sel = state.selection, point;
    if (sel instanceof NodeSelection) {
        if (sel.node.isTextblock || !canJoin(state.doc, sel.to))
            return false;
        point = sel.to;
    }
    else {
        point = joinPoint(state.doc, sel.to, 1);
        if (point == null)
            return false;
    }
    if (dispatch)
        dispatch(state.tr.join(point).scrollIntoView());
    return true;
};
/**
Lift the selected block, or the closest ancestor block of the
selection that can be lifted, out of its parent node.
*/
const lift$1 = (state, dispatch) => {
    let { $from, $to } = state.selection;
    let range = $from.blockRange($to), target = range && liftTarget(range);
    if (target == null)
        return false;
    if (dispatch)
        dispatch(state.tr.lift(range, target).scrollIntoView());
    return true;
};
/**
If the selection is in a node whose type has a truthy
[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, replace the
selection with a newline character.
*/
const newlineInCode$1 = (state, dispatch) => {
    let { $head, $anchor } = state.selection;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor))
        return false;
    if (dispatch)
        dispatch(state.tr.insertText("\n").scrollIntoView());
    return true;
};
function defaultBlockAt$1(match) {
    for (let i = 0; i < match.edgeCount; i++) {
        let { type } = match.edge(i);
        if (type.isTextblock && !type.hasRequiredAttrs())
            return type;
    }
    return null;
}
/**
When the selection is in a node with a truthy
[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, create a
default block after the code block, and move the cursor there.
*/
const exitCode$1 = (state, dispatch) => {
    let { $head, $anchor } = state.selection;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor))
        return false;
    let above = $head.node(-1), after = $head.indexAfter(-1), type = defaultBlockAt$1(above.contentMatchAt(after));
    if (!type || !above.canReplaceWith(after, after, type))
        return false;
    if (dispatch) {
        let pos = $head.after(), tr = state.tr.replaceWith(pos, pos, type.createAndFill());
        tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
        dispatch(tr.scrollIntoView());
    }
    return true;
};
/**
If a block node is selected, create an empty paragraph before (if
it is its parent's first child) or after it.
*/
const createParagraphNear$1 = (state, dispatch) => {
    let sel = state.selection, { $from, $to } = sel;
    if (sel instanceof AllSelection || $from.parent.inlineContent || $to.parent.inlineContent)
        return false;
    let type = defaultBlockAt$1($to.parent.contentMatchAt($to.indexAfter()));
    if (!type || !type.isTextblock)
        return false;
    if (dispatch) {
        let side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
        let tr = state.tr.insert(side, type.createAndFill());
        tr.setSelection(TextSelection.create(tr.doc, side + 1));
        dispatch(tr.scrollIntoView());
    }
    return true;
};
/**
If the cursor is in an empty textblock that can be lifted, lift the
block.
*/
const liftEmptyBlock$1 = (state, dispatch) => {
    let { $cursor } = state.selection;
    if (!$cursor || $cursor.parent.content.size)
        return false;
    if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
        let before = $cursor.before();
        if (canSplit(state.doc, before)) {
            if (dispatch)
                dispatch(state.tr.split(before).scrollIntoView());
            return true;
        }
    }
    let range = $cursor.blockRange(), target = range && liftTarget(range);
    if (target == null)
        return false;
    if (dispatch)
        dispatch(state.tr.lift(range, target).scrollIntoView());
    return true;
};
/**
Move the selection to the node wrapping the current selection, if
any. (Will not select the document node.)
*/
const selectParentNode$1 = (state, dispatch) => {
    let { $from, to } = state.selection, pos;
    let same = $from.sharedDepth(to);
    if (same == 0)
        return false;
    pos = $from.before(same);
    if (dispatch)
        dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
    return true;
};
function joinMaybeClear(state, $pos, dispatch) {
    let before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index();
    if (!before || !after || !before.type.compatibleContent(after.type))
        return false;
    if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
        if (dispatch)
            dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView());
        return true;
    }
    if (!$pos.parent.canReplace(index, index + 1) || !(after.isTextblock || canJoin(state.doc, $pos.pos)))
        return false;
    if (dispatch)
        dispatch(state.tr
            .clearIncompatible($pos.pos, before.type, before.contentMatchAt(before.childCount))
            .join($pos.pos)
            .scrollIntoView());
    return true;
}
function deleteBarrier(state, $cut, dispatch) {
    let before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match;
    if (before.type.spec.isolating || after.type.spec.isolating)
        return false;
    if (joinMaybeClear(state, $cut, dispatch))
        return true;
    let canDelAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
    if (canDelAfter &&
        (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(after.type)) &&
        match.matchType(conn[0] || after.type).validEnd) {
        if (dispatch) {
            let end = $cut.pos + after.nodeSize, wrap = Fragment.empty;
            for (let i = conn.length - 1; i >= 0; i--)
                wrap = Fragment.from(conn[i].create(null, wrap));
            wrap = Fragment.from(before.copy(wrap));
            let tr = state.tr.step(new ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new Slice(wrap, 1, 0), conn.length, true));
            let joinAt = end + 2 * conn.length;
            if (canJoin(tr.doc, joinAt))
                tr.join(joinAt);
            dispatch(tr.scrollIntoView());
        }
        return true;
    }
    let selAfter = Selection.findFrom($cut, 1);
    let range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range);
    if (target != null && target >= $cut.depth) {
        if (dispatch)
            dispatch(state.tr.lift(range, target).scrollIntoView());
        return true;
    }
    if (canDelAfter && textblockAt(after, "start", true) && textblockAt(before, "end")) {
        let at = before, wrap = [];
        for (;;) {
            wrap.push(at);
            if (at.isTextblock)
                break;
            at = at.lastChild;
        }
        let afterText = after, afterDepth = 1;
        for (; !afterText.isTextblock; afterText = afterText.firstChild)
            afterDepth++;
        if (at.canReplace(at.childCount, at.childCount, afterText.content)) {
            if (dispatch) {
                let end = Fragment.empty;
                for (let i = wrap.length - 1; i >= 0; i--)
                    end = Fragment.from(wrap[i].copy(end));
                let tr = state.tr.step(new ReplaceAroundStep($cut.pos - wrap.length, $cut.pos + after.nodeSize, $cut.pos + afterDepth, $cut.pos + after.nodeSize - afterDepth, new Slice(end, wrap.length, 0), 0, true));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
    }
    return false;
}
function selectTextblockSide(side) {
    return function (state, dispatch) {
        let sel = state.selection, $pos = side < 0 ? sel.$from : sel.$to;
        let depth = $pos.depth;
        while ($pos.node(depth).isInline) {
            if (!depth)
                return false;
            depth--;
        }
        if (!$pos.node(depth).isTextblock)
            return false;
        if (dispatch)
            dispatch(state.tr.setSelection(TextSelection.create(state.doc, side < 0 ? $pos.start(depth) : $pos.end(depth))));
        return true;
    };
}
/**
Moves the cursor to the start of current text block.
*/
const selectTextblockStart$1 = selectTextblockSide(-1);
/**
Moves the cursor to the end of current text block.
*/
const selectTextblockEnd$1 = selectTextblockSide(1);
// Parameterized commands
/**
Wrap the selection in a node of the given type with the given
attributes.
*/
function wrapIn$1(nodeType, attrs = null) {
    return function (state, dispatch) {
        let { $from, $to } = state.selection;
        let range = $from.blockRange($to), wrapping = range && findWrapping(range, nodeType, attrs);
        if (!wrapping)
            return false;
        if (dispatch)
            dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
        return true;
    };
}
/**
Returns a command that tries to set the selected textblocks to the
given node type with the given attributes.
*/
function setBlockType(nodeType, attrs = null) {
    return function (state, dispatch) {
        let applicable = false;
        for (let i = 0; i < state.selection.ranges.length && !applicable; i++) {
            let { $from: { pos: from }, $to: { pos: to } } = state.selection.ranges[i];
            state.doc.nodesBetween(from, to, (node, pos) => {
                if (applicable)
                    return false;
                if (!node.isTextblock || node.hasMarkup(nodeType, attrs))
                    return;
                if (node.type == nodeType) {
                    applicable = true;
                }
                else {
                    let $pos = state.doc.resolve(pos), index = $pos.index();
                    applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
                }
            });
        }
        if (!applicable)
            return false;
        if (dispatch) {
            let tr = state.tr;
            for (let i = 0; i < state.selection.ranges.length; i++) {
                let { $from: { pos: from }, $to: { pos: to } } = state.selection.ranges[i];
                tr.setBlockType(from, to, nodeType, attrs);
            }
            dispatch(tr.scrollIntoView());
        }
        return true;
    };
}
typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
    // @ts-ignore
    : typeof os != "undefined" && os.platform ? os.platform() == "darwin" : false;

/**
Returns a command function that wraps the selection in a list with
the given type an attributes. If `dispatch` is null, only return a
value to indicate whether this is possible, but don't actually
perform the change.
*/
function wrapInList$1(listType, attrs = null) {
    return function (state, dispatch) {
        let { $from, $to } = state.selection;
        let range = $from.blockRange($to), doJoin = false, outerRange = range;
        if (!range)
            return false;
        // This is at the top of an existing list item
        if (range.depth >= 2 && $from.node(range.depth - 1).type.compatibleContent(listType) && range.startIndex == 0) {
            // Don't do anything if this is the top of the list
            if ($from.index(range.depth - 1) == 0)
                return false;
            let $insert = state.doc.resolve(range.start - 2);
            outerRange = new NodeRange($insert, $insert, range.depth);
            if (range.endIndex < range.parent.childCount)
                range = new NodeRange($from, state.doc.resolve($to.end(range.depth)), range.depth);
            doJoin = true;
        }
        let wrap = findWrapping(outerRange, listType, attrs, range);
        if (!wrap)
            return false;
        if (dispatch)
            dispatch(doWrapInList(state.tr, range, wrap, doJoin, listType).scrollIntoView());
        return true;
    };
}
function doWrapInList(tr, range, wrappers, joinBefore, listType) {
    let content = Fragment.empty;
    for (let i = wrappers.length - 1; i >= 0; i--)
        content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
    tr.step(new ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end, new Slice(content, 0, 0), wrappers.length, true));
    let found = 0;
    for (let i = 0; i < wrappers.length; i++)
        if (wrappers[i].type == listType)
            found = i + 1;
    let splitDepth = wrappers.length - found;
    let splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0), parent = range.parent;
    for (let i = range.startIndex, e = range.endIndex, first = true; i < e; i++, first = false) {
        if (!first && canSplit(tr.doc, splitPos, splitDepth)) {
            tr.split(splitPos, splitDepth);
            splitPos += 2 * splitDepth;
        }
        splitPos += parent.child(i).nodeSize;
    }
    return tr;
}
/**
Create a command to lift the list item around the selection up into
a wrapping list.
*/
function liftListItem$1(itemType) {
    return function (state, dispatch) {
        let { $from, $to } = state.selection;
        let range = $from.blockRange($to, node => node.childCount > 0 && node.firstChild.type == itemType);
        if (!range)
            return false;
        if (!dispatch)
            return true;
        if ($from.node(range.depth - 1).type == itemType) // Inside a parent list
            return liftToOuterList(state, dispatch, itemType, range);
        else // Outer list node
            return liftOutOfList(state, dispatch, range);
    };
}
function liftToOuterList(state, dispatch, itemType, range) {
    let tr = state.tr, end = range.end, endOfList = range.$to.end(range.depth);
    if (end < endOfList) {
        // There are siblings after the lifted items, which must become
        // children of the last item
        tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, new Slice(Fragment.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true));
        range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
    }
    const target = liftTarget(range);
    if (target == null)
        return false;
    tr.lift(range, target);
    let after = tr.mapping.map(end, -1) - 1;
    if (canJoin(tr.doc, after))
        tr.join(after);
    dispatch(tr.scrollIntoView());
    return true;
}
function liftOutOfList(state, dispatch, range) {
    let tr = state.tr, list = range.parent;
    // Merge the list items into a single big item
    for (let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
        pos -= list.child(i).nodeSize;
        tr.delete(pos - 1, pos + 1);
    }
    let $start = tr.doc.resolve(range.start), item = $start.nodeAfter;
    if (tr.mapping.map(range.end) != range.start + $start.nodeAfter.nodeSize)
        return false;
    let atStart = range.startIndex == 0, atEnd = range.endIndex == list.childCount;
    let parent = $start.node(-1), indexBefore = $start.index(-1);
    if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1, item.content.append(atEnd ? Fragment.empty : Fragment.from(list))))
        return false;
    let start = $start.pos, end = start + item.nodeSize;
    // Strip off the surrounding list. At the sides where we're not at
    // the end of the list, the existing list is closed. At sides where
    // this is the end, it is overwritten to its end.
    tr.step(new ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1, new Slice((atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)))
        .append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))), atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1));
    dispatch(tr.scrollIntoView());
    return true;
}
/**
Create a command to sink the list item around the selection down
into an inner list.
*/
function sinkListItem$1(itemType) {
    return function (state, dispatch) {
        let { $from, $to } = state.selection;
        let range = $from.blockRange($to, node => node.childCount > 0 && node.firstChild.type == itemType);
        if (!range)
            return false;
        let startIndex = range.startIndex;
        if (startIndex == 0)
            return false;
        let parent = range.parent, nodeBefore = parent.child(startIndex - 1);
        if (nodeBefore.type != itemType)
            return false;
        if (dispatch) {
            let nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type == parent.type;
            let inner = Fragment.from(nestedBefore ? itemType.create() : null);
            let slice = new Slice(Fragment.from(itemType.create(null, Fragment.from(parent.type.create(null, inner)))), nestedBefore ? 3 : 1, 0);
            let before = range.start, after = range.end;
            dispatch(state.tr.step(new ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after, before, after, slice, 1, true))
                .scrollIntoView());
        }
        return true;
    };
}

function createChainableState(config) {
    const { state, transaction } = config;
    let { selection } = transaction;
    let { doc } = transaction;
    let { storedMarks } = transaction;
    return {
        ...state,
        apply: state.apply.bind(state),
        applyTransaction: state.applyTransaction.bind(state),
        filterTransaction: state.filterTransaction,
        plugins: state.plugins,
        schema: state.schema,
        reconfigure: state.reconfigure.bind(state),
        toJSON: state.toJSON.bind(state),
        get storedMarks() {
            return storedMarks;
        },
        get selection() {
            return selection;
        },
        get doc() {
            return doc;
        },
        get tr() {
            selection = transaction.selection;
            doc = transaction.doc;
            storedMarks = transaction.storedMarks;
            return transaction;
        },
    };
}

class CommandManager {
    constructor(props) {
        this.editor = props.editor;
        this.rawCommands = this.editor.extensionManager.commands;
        this.customState = props.state;
    }
    get hasCustomState() {
        return !!this.customState;
    }
    get state() {
        return this.customState || this.editor.state;
    }
    get commands() {
        const { rawCommands, editor, state } = this;
        const { view } = editor;
        const { tr } = state;
        const props = this.buildProps(tr);
        return Object.fromEntries(Object.entries(rawCommands).map(([name, command]) => {
            const method = (...args) => {
                const callback = command(...args)(props);
                if (!tr.getMeta('preventDispatch') && !this.hasCustomState) {
                    view.dispatch(tr);
                }
                return callback;
            };
            return [name, method];
        }));
    }
    get chain() {
        return () => this.createChain();
    }
    get can() {
        return () => this.createCan();
    }
    createChain(startTr, shouldDispatch = true) {
        const { rawCommands, editor, state } = this;
        const { view } = editor;
        const callbacks = [];
        const hasStartTransaction = !!startTr;
        const tr = startTr || state.tr;
        const run = () => {
            if (!hasStartTransaction
                && shouldDispatch
                && !tr.getMeta('preventDispatch')
                && !this.hasCustomState) {
                view.dispatch(tr);
            }
            return callbacks.every(callback => callback === true);
        };
        const chain = {
            ...Object.fromEntries(Object.entries(rawCommands).map(([name, command]) => {
                const chainedCommand = (...args) => {
                    const props = this.buildProps(tr, shouldDispatch);
                    const callback = command(...args)(props);
                    callbacks.push(callback);
                    return chain;
                };
                return [name, chainedCommand];
            })),
            run,
        };
        return chain;
    }
    createCan(startTr) {
        const { rawCommands, state } = this;
        const dispatch = false;
        const tr = startTr || state.tr;
        const props = this.buildProps(tr, dispatch);
        const formattedCommands = Object.fromEntries(Object.entries(rawCommands).map(([name, command]) => {
            return [name, (...args) => command(...args)({ ...props, dispatch: undefined })];
        }));
        return {
            ...formattedCommands,
            chain: () => this.createChain(tr, dispatch),
        };
    }
    buildProps(tr, shouldDispatch = true) {
        const { rawCommands, editor, state } = this;
        const { view } = editor;
        if (state.storedMarks) {
            tr.setStoredMarks(state.storedMarks);
        }
        const props = {
            tr,
            editor,
            view,
            state: createChainableState({
                state,
                transaction: tr,
            }),
            dispatch: shouldDispatch ? () => undefined : undefined,
            chain: () => this.createChain(tr),
            can: () => this.createCan(tr),
            get commands() {
                return Object.fromEntries(Object.entries(rawCommands).map(([name, command]) => {
                    return [name, (...args) => command(...args)(props)];
                }));
            },
        };
        return props;
    }
}

class EventEmitter {
    constructor() {
        this.callbacks = {};
    }
    on(event, fn) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(fn);
        return this;
    }
    emit(event, ...args) {
        const callbacks = this.callbacks[event];
        if (callbacks) {
            callbacks.forEach(callback => callback.apply(this, args));
        }
        return this;
    }
    off(event, fn) {
        const callbacks = this.callbacks[event];
        if (callbacks) {
            if (fn) {
                this.callbacks[event] = callbacks.filter(callback => callback !== fn);
            }
            else {
                delete this.callbacks[event];
            }
        }
        return this;
    }
    removeAllListeners() {
        this.callbacks = {};
    }
}

function getExtensionField(extension, field, context) {
    if (extension.config[field] === undefined && extension.parent) {
        return getExtensionField(extension.parent, field, context);
    }
    if (typeof extension.config[field] === 'function') {
        const value = extension.config[field].bind({
            ...context,
            parent: extension.parent
                ? getExtensionField(extension.parent, field, context)
                : null,
        });
        return value;
    }
    return extension.config[field];
}

function splitExtensions(extensions) {
    const baseExtensions = extensions.filter(extension => extension.type === 'extension');
    const nodeExtensions = extensions.filter(extension => extension.type === 'node');
    const markExtensions = extensions.filter(extension => extension.type === 'mark');
    return {
        baseExtensions,
        nodeExtensions,
        markExtensions,
    };
}

/**
 * Get a list of all extension attributes defined in `addAttribute` and `addGlobalAttribute`.
 * @param extensions List of extensions
 */
function getAttributesFromExtensions(extensions) {
    const extensionAttributes = [];
    const { nodeExtensions, markExtensions } = splitExtensions(extensions);
    const nodeAndMarkExtensions = [...nodeExtensions, ...markExtensions];
    const defaultAttribute = {
        default: null,
        rendered: true,
        renderHTML: null,
        parseHTML: null,
        keepOnSplit: true,
        isRequired: false,
    };
    extensions.forEach(extension => {
        const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
        };
        const addGlobalAttributes = getExtensionField(extension, 'addGlobalAttributes', context);
        if (!addGlobalAttributes) {
            return;
        }
        // TODO: remove `as GlobalAttributes`
        const globalAttributes = addGlobalAttributes();
        globalAttributes.forEach(globalAttribute => {
            globalAttribute.types.forEach(type => {
                Object
                    .entries(globalAttribute.attributes)
                    .forEach(([name, attribute]) => {
                    extensionAttributes.push({
                        type,
                        name,
                        attribute: {
                            ...defaultAttribute,
                            ...attribute,
                        },
                    });
                });
            });
        });
    });
    nodeAndMarkExtensions.forEach(extension => {
        const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
        };
        const addAttributes = getExtensionField(extension, 'addAttributes', context);
        if (!addAttributes) {
            return;
        }
        // TODO: remove `as Attributes`
        const attributes = addAttributes();
        Object
            .entries(attributes)
            .forEach(([name, attribute]) => {
            const mergedAttr = {
                ...defaultAttribute,
                ...attribute,
            };
            if ((attribute === null || attribute === void 0 ? void 0 : attribute.isRequired) && (attribute === null || attribute === void 0 ? void 0 : attribute.default) === undefined) {
                delete mergedAttr.default;
            }
            extensionAttributes.push({
                type: extension.name,
                name,
                attribute: mergedAttr,
            });
        });
    });
    return extensionAttributes;
}

function getNodeType(nameOrType, schema) {
    if (typeof nameOrType === 'string') {
        if (!schema.nodes[nameOrType]) {
            throw Error(`There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`);
        }
        return schema.nodes[nameOrType];
    }
    return nameOrType;
}

function mergeAttributes(...objects) {
    return objects
        .filter(item => !!item)
        .reduce((items, item) => {
        const mergedAttributes = { ...items };
        Object.entries(item).forEach(([key, value]) => {
            const exists = mergedAttributes[key];
            if (!exists) {
                mergedAttributes[key] = value;
                return;
            }
            if (key === 'class') {
                mergedAttributes[key] = [mergedAttributes[key], value].join(' ');
            }
            else if (key === 'style') {
                mergedAttributes[key] = [mergedAttributes[key], value].join('; ');
            }
            else {
                mergedAttributes[key] = value;
            }
        });
        return mergedAttributes;
    }, {});
}

function getRenderedAttributes(nodeOrMark, extensionAttributes) {
    return extensionAttributes
        .filter(item => item.attribute.rendered)
        .map(item => {
        if (!item.attribute.renderHTML) {
            return {
                [item.name]: nodeOrMark.attrs[item.name],
            };
        }
        return item.attribute.renderHTML(nodeOrMark.attrs) || {};
    })
        .reduce((attributes, attribute) => mergeAttributes(attributes, attribute), {});
}

function isFunction(value) {
    return typeof value === 'function';
}

/**
 * Optionally calls `value` as a function.
 * Otherwise it is returned directly.
 * @param value Function or any value.
 * @param context Optional context to bind to function.
 * @param props Optional props to pass to function.
 */
function callOrReturn(value, context = undefined, ...props) {
    if (isFunction(value)) {
        if (context) {
            return value.bind(context)(...props);
        }
        return value(...props);
    }
    return value;
}

function isEmptyObject(value = {}) {
    return Object.keys(value).length === 0 && value.constructor === Object;
}

function fromString(value) {
    if (typeof value !== 'string') {
        return value;
    }
    if (value.match(/^[+-]?(?:\d*\.)?\d+$/)) {
        return Number(value);
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return value;
}

/**
 * This function merges extension attributes into parserule attributes (`attrs` or `getAttrs`).
 * Cancels when `getAttrs` returned `false`.
 * @param parseRule ProseMirror ParseRule
 * @param extensionAttributes List of attributes to inject
 */
function injectExtensionAttributesToParseRule(parseRule, extensionAttributes) {
    if (parseRule.style) {
        return parseRule;
    }
    return {
        ...parseRule,
        getAttrs: node => {
            const oldAttributes = parseRule.getAttrs ? parseRule.getAttrs(node) : parseRule.attrs;
            if (oldAttributes === false) {
                return false;
            }
            const newAttributes = extensionAttributes.reduce((items, item) => {
                const value = item.attribute.parseHTML
                    ? item.attribute.parseHTML(node)
                    : fromString(node.getAttribute(item.name));
                if (value === null || value === undefined) {
                    return items;
                }
                return {
                    ...items,
                    [item.name]: value,
                };
            }, {});
            return { ...oldAttributes, ...newAttributes };
        },
    };
}

function cleanUpSchemaItem(data) {
    return Object.fromEntries(Object.entries(data).filter(([key, value]) => {
        if (key === 'attrs' && isEmptyObject(value)) {
            return false;
        }
        return value !== null && value !== undefined;
    }));
}
function getSchemaByResolvedExtensions(extensions) {
    var _a;
    const allAttributes = getAttributesFromExtensions(extensions);
    const { nodeExtensions, markExtensions } = splitExtensions(extensions);
    const topNode = (_a = nodeExtensions.find(extension => getExtensionField(extension, 'topNode'))) === null || _a === void 0 ? void 0 : _a.name;
    const nodes = Object.fromEntries(nodeExtensions.map(extension => {
        const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name);
        const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
        };
        const extraNodeFields = extensions.reduce((fields, e) => {
            const extendNodeSchema = getExtensionField(e, 'extendNodeSchema', context);
            return {
                ...fields,
                ...(extendNodeSchema ? extendNodeSchema(extension) : {}),
            };
        }, {});
        const schema = cleanUpSchemaItem({
            ...extraNodeFields,
            content: callOrReturn(getExtensionField(extension, 'content', context)),
            marks: callOrReturn(getExtensionField(extension, 'marks', context)),
            group: callOrReturn(getExtensionField(extension, 'group', context)),
            inline: callOrReturn(getExtensionField(extension, 'inline', context)),
            atom: callOrReturn(getExtensionField(extension, 'atom', context)),
            selectable: callOrReturn(getExtensionField(extension, 'selectable', context)),
            draggable: callOrReturn(getExtensionField(extension, 'draggable', context)),
            code: callOrReturn(getExtensionField(extension, 'code', context)),
            defining: callOrReturn(getExtensionField(extension, 'defining', context)),
            isolating: callOrReturn(getExtensionField(extension, 'isolating', context)),
            attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
                var _a;
                return [extensionAttribute.name, { default: (_a = extensionAttribute === null || extensionAttribute === void 0 ? void 0 : extensionAttribute.attribute) === null || _a === void 0 ? void 0 : _a.default }];
            })),
        });
        const parseHTML = callOrReturn(getExtensionField(extension, 'parseHTML', context));
        if (parseHTML) {
            schema.parseDOM = parseHTML.map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes));
        }
        const renderHTML = getExtensionField(extension, 'renderHTML', context);
        if (renderHTML) {
            schema.toDOM = node => renderHTML({
                node,
                HTMLAttributes: getRenderedAttributes(node, extensionAttributes),
            });
        }
        const renderText = getExtensionField(extension, 'renderText', context);
        if (renderText) {
            schema.toText = renderText;
        }
        return [extension.name, schema];
    }));
    const marks = Object.fromEntries(markExtensions.map(extension => {
        const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name);
        const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
        };
        const extraMarkFields = extensions.reduce((fields, e) => {
            const extendMarkSchema = getExtensionField(e, 'extendMarkSchema', context);
            return {
                ...fields,
                ...(extendMarkSchema ? extendMarkSchema(extension) : {}),
            };
        }, {});
        const schema = cleanUpSchemaItem({
            ...extraMarkFields,
            inclusive: callOrReturn(getExtensionField(extension, 'inclusive', context)),
            excludes: callOrReturn(getExtensionField(extension, 'excludes', context)),
            group: callOrReturn(getExtensionField(extension, 'group', context)),
            spanning: callOrReturn(getExtensionField(extension, 'spanning', context)),
            code: callOrReturn(getExtensionField(extension, 'code', context)),
            attrs: Object.fromEntries(extensionAttributes.map(extensionAttribute => {
                var _a;
                return [extensionAttribute.name, { default: (_a = extensionAttribute === null || extensionAttribute === void 0 ? void 0 : extensionAttribute.attribute) === null || _a === void 0 ? void 0 : _a.default }];
            })),
        });
        const parseHTML = callOrReturn(getExtensionField(extension, 'parseHTML', context));
        if (parseHTML) {
            schema.parseDOM = parseHTML.map(parseRule => injectExtensionAttributesToParseRule(parseRule, extensionAttributes));
        }
        const renderHTML = getExtensionField(extension, 'renderHTML', context);
        if (renderHTML) {
            schema.toDOM = mark => renderHTML({
                mark,
                HTMLAttributes: getRenderedAttributes(mark, extensionAttributes),
            });
        }
        return [extension.name, schema];
    }));
    return new Schema({
        topNode,
        nodes,
        marks,
    });
}

function getSchemaTypeByName(name, schema) {
    return schema.nodes[name] || schema.marks[name] || null;
}

function isExtensionRulesEnabled(extension, enabled) {
    if (Array.isArray(enabled)) {
        return enabled.some(enabledExtension => {
            const name = typeof enabledExtension === 'string'
                ? enabledExtension
                : enabledExtension.name;
            return name === extension.name;
        });
    }
    return enabled;
}

const getTextContentFromNodes = ($from, maxMatch = 500) => {
    let textBefore = '';
    const sliceEndPos = $from.parentOffset;
    $from.parent.nodesBetween(Math.max(0, sliceEndPos - maxMatch), sliceEndPos, (node, pos, parent, index) => {
        var _a, _b;
        const chunk = ((_b = (_a = node.type.spec).toText) === null || _b === void 0 ? void 0 : _b.call(_a, {
            node,
            pos,
            parent,
            index,
        }))
            || node.textContent
            || '%leaf%';
        textBefore += chunk.slice(0, Math.max(0, sliceEndPos - pos));
    });
    return textBefore;
};

function isRegExp(value) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}

class InputRule {
    constructor(config) {
        this.find = config.find;
        this.handler = config.handler;
    }
}
const inputRuleMatcherHandler = (text, find) => {
    if (isRegExp(find)) {
        return find.exec(text);
    }
    const inputRuleMatch = find(text);
    if (!inputRuleMatch) {
        return null;
    }
    const result = [inputRuleMatch.text];
    result.index = inputRuleMatch.index;
    result.input = text;
    result.data = inputRuleMatch.data;
    if (inputRuleMatch.replaceWith) {
        if (!inputRuleMatch.text.includes(inputRuleMatch.replaceWith)) {
            console.warn('[tiptap warn]: "inputRuleMatch.replaceWith" must be part of "inputRuleMatch.text".');
        }
        result.push(inputRuleMatch.replaceWith);
    }
    return result;
};
function run$1$1(config) {
    var _a;
    const { editor, from, to, text, rules, plugin, } = config;
    const { view } = editor;
    if (view.composing) {
        return false;
    }
    const $from = view.state.doc.resolve(from);
    if (
    // check for code node
    $from.parent.type.spec.code
        // check for code mark
        || !!((_a = ($from.nodeBefore || $from.nodeAfter)) === null || _a === void 0 ? void 0 : _a.marks.find(mark => mark.type.spec.code))) {
        return false;
    }
    let matched = false;
    const textBefore = getTextContentFromNodes($from) + text;
    rules.forEach(rule => {
        if (matched) {
            return;
        }
        const match = inputRuleMatcherHandler(textBefore, rule.find);
        if (!match) {
            return;
        }
        const tr = view.state.tr;
        const state = createChainableState({
            state: view.state,
            transaction: tr,
        });
        const range = {
            from: from - (match[0].length - text.length),
            to,
        };
        const { commands, chain, can } = new CommandManager({
            editor,
            state,
        });
        const handler = rule.handler({
            state,
            range,
            match,
            commands,
            chain,
            can,
        });
        // stop if there are no changes
        if (handler === null || !tr.steps.length) {
            return;
        }
        // store transform as meta data
        // so we can undo input rules within the `undoInputRules` command
        tr.setMeta(plugin, {
            transform: tr,
            from,
            to,
            text,
        });
        view.dispatch(tr);
        matched = true;
    });
    return matched;
}
/**
 * Create an input rules plugin. When enabled, it will cause text
 * input that matches any of the given rules to trigger the rule’s
 * action.
 */
function inputRulesPlugin(props) {
    const { editor, rules } = props;
    const plugin = new Plugin({
        state: {
            init() {
                return null;
            },
            apply(tr, prev) {
                const stored = tr.getMeta(plugin);
                if (stored) {
                    return stored;
                }
                return tr.selectionSet || tr.docChanged ? null : prev;
            },
        },
        props: {
            handleTextInput(view, from, to, text) {
                return run$1$1({
                    editor,
                    from,
                    to,
                    text,
                    rules,
                    plugin,
                });
            },
            handleDOMEvents: {
                compositionend: view => {
                    setTimeout(() => {
                        const { $cursor } = view.state.selection;
                        if ($cursor) {
                            run$1$1({
                                editor,
                                from: $cursor.pos,
                                to: $cursor.pos,
                                text: '',
                                rules,
                                plugin,
                            });
                        }
                    });
                    return false;
                },
            },
            // add support for input rules to trigger on enter
            // this is useful for example for code blocks
            handleKeyDown(view, event) {
                if (event.key !== 'Enter') {
                    return false;
                }
                const { $cursor } = view.state.selection;
                if ($cursor) {
                    return run$1$1({
                        editor,
                        from: $cursor.pos,
                        to: $cursor.pos,
                        text: '\n',
                        rules,
                        plugin,
                    });
                }
                return false;
            },
        },
        // @ts-ignore
        isInputRules: true,
    });
    return plugin;
}

function isNumber(value) {
    return typeof value === 'number';
}

class PasteRule {
    constructor(config) {
        this.find = config.find;
        this.handler = config.handler;
    }
}
const pasteRuleMatcherHandler = (text, find) => {
    if (isRegExp(find)) {
        return [...text.matchAll(find)];
    }
    const matches = find(text);
    if (!matches) {
        return [];
    }
    return matches.map(pasteRuleMatch => {
        const result = [pasteRuleMatch.text];
        result.index = pasteRuleMatch.index;
        result.input = text;
        result.data = pasteRuleMatch.data;
        if (pasteRuleMatch.replaceWith) {
            if (!pasteRuleMatch.text.includes(pasteRuleMatch.replaceWith)) {
                console.warn('[tiptap warn]: "pasteRuleMatch.replaceWith" must be part of "pasteRuleMatch.text".');
            }
            result.push(pasteRuleMatch.replaceWith);
        }
        return result;
    });
};
function run$2(config) {
    const { editor, state, from, to, rule, } = config;
    const { commands, chain, can } = new CommandManager({
        editor,
        state,
    });
    const handlers = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isTextblock || node.type.spec.code) {
            return;
        }
        const resolvedFrom = Math.max(from, pos);
        const resolvedTo = Math.min(to, pos + node.content.size);
        const textToMatch = node.textBetween(resolvedFrom - pos, resolvedTo - pos, undefined, '\ufffc');
        const matches = pasteRuleMatcherHandler(textToMatch, rule.find);
        matches.forEach(match => {
            if (match.index === undefined) {
                return;
            }
            const start = resolvedFrom + match.index + 1;
            const end = start + match[0].length;
            const range = {
                from: state.tr.mapping.map(start),
                to: state.tr.mapping.map(end),
            };
            const handler = rule.handler({
                state,
                range,
                match,
                commands,
                chain,
                can,
            });
            handlers.push(handler);
        });
    });
    const success = handlers.every(handler => handler !== null);
    return success;
}
/**
 * Create an paste rules plugin. When enabled, it will cause pasted
 * text that matches any of the given rules to trigger the rule’s
 * action.
 */
function pasteRulesPlugin(props) {
    const { editor, rules } = props;
    let dragSourceElement = null;
    let isPastedFromProseMirror = false;
    let isDroppedFromProseMirror = false;
    const plugins = rules.map(rule => {
        return new Plugin({
            // we register a global drag handler to track the current drag source element
            view(view) {
                const handleDragstart = (event) => {
                    var _a;
                    dragSourceElement = ((_a = view.dom.parentElement) === null || _a === void 0 ? void 0 : _a.contains(event.target))
                        ? view.dom.parentElement
                        : null;
                };
                window.addEventListener('dragstart', handleDragstart);
                return {
                    destroy() {
                        window.removeEventListener('dragstart', handleDragstart);
                    },
                };
            },
            props: {
                handleDOMEvents: {
                    drop: view => {
                        isDroppedFromProseMirror = dragSourceElement === view.dom.parentElement;
                        return false;
                    },
                    paste: (view, event) => {
                        var _a;
                        const html = (_a = event.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text/html');
                        isPastedFromProseMirror = !!(html === null || html === void 0 ? void 0 : html.includes('data-pm-slice'));
                        return false;
                    },
                },
            },
            appendTransaction: (transactions, oldState, state) => {
                const transaction = transactions[0];
                const isPaste = transaction.getMeta('uiEvent') === 'paste' && !isPastedFromProseMirror;
                const isDrop = transaction.getMeta('uiEvent') === 'drop' && !isDroppedFromProseMirror;
                if (!isPaste && !isDrop) {
                    return;
                }
                // stop if there is no changed range
                const from = oldState.doc.content.findDiffStart(state.doc.content);
                const to = oldState.doc.content.findDiffEnd(state.doc.content);
                if (!isNumber(from) || !to || from === to.b) {
                    return;
                }
                // build a chainable state
                // so we can use a single transaction for all paste rules
                const tr = state.tr;
                const chainableState = createChainableState({
                    state,
                    transaction: tr,
                });
                const handler = run$2({
                    editor,
                    state: chainableState,
                    from: Math.max(from - 1, 0),
                    to: to.b - 1,
                    rule,
                });
                // stop if there are no changes
                if (!handler || !tr.steps.length) {
                    return;
                }
                return tr;
            },
        });
    });
    return plugins;
}

function findDuplicates(items) {
    const filtered = items.filter((el, index) => items.indexOf(el) !== index);
    return [...new Set(filtered)];
}

class ExtensionManager {
    constructor(extensions, editor) {
        this.splittableMarks = [];
        this.editor = editor;
        this.extensions = ExtensionManager.resolve(extensions);
        this.schema = getSchemaByResolvedExtensions(this.extensions);
        this.extensions.forEach(extension => {
            var _a;
            // store extension storage in editor
            this.editor.extensionStorage[extension.name] = extension.storage;
            const context = {
                name: extension.name,
                options: extension.options,
                storage: extension.storage,
                editor: this.editor,
                type: getSchemaTypeByName(extension.name, this.schema),
            };
            if (extension.type === 'mark') {
                const keepOnSplit = (_a = callOrReturn(getExtensionField(extension, 'keepOnSplit', context))) !== null && _a !== void 0 ? _a : true;
                if (keepOnSplit) {
                    this.splittableMarks.push(extension.name);
                }
            }
            const onBeforeCreate = getExtensionField(extension, 'onBeforeCreate', context);
            if (onBeforeCreate) {
                this.editor.on('beforeCreate', onBeforeCreate);
            }
            const onCreate = getExtensionField(extension, 'onCreate', context);
            if (onCreate) {
                this.editor.on('create', onCreate);
            }
            const onUpdate = getExtensionField(extension, 'onUpdate', context);
            if (onUpdate) {
                this.editor.on('update', onUpdate);
            }
            const onSelectionUpdate = getExtensionField(extension, 'onSelectionUpdate', context);
            if (onSelectionUpdate) {
                this.editor.on('selectionUpdate', onSelectionUpdate);
            }
            const onTransaction = getExtensionField(extension, 'onTransaction', context);
            if (onTransaction) {
                this.editor.on('transaction', onTransaction);
            }
            const onFocus = getExtensionField(extension, 'onFocus', context);
            if (onFocus) {
                this.editor.on('focus', onFocus);
            }
            const onBlur = getExtensionField(extension, 'onBlur', context);
            if (onBlur) {
                this.editor.on('blur', onBlur);
            }
            const onDestroy = getExtensionField(extension, 'onDestroy', context);
            if (onDestroy) {
                this.editor.on('destroy', onDestroy);
            }
        });
    }
    static resolve(extensions) {
        const resolvedExtensions = ExtensionManager.sort(ExtensionManager.flatten(extensions));
        const duplicatedNames = findDuplicates(resolvedExtensions.map(extension => extension.name));
        if (duplicatedNames.length) {
            console.warn(`[tiptap warn]: Duplicate extension names found: [${duplicatedNames
                .map(item => `'${item}'`)
                .join(', ')}]. This can lead to issues.`);
        }
        return resolvedExtensions;
    }
    static flatten(extensions) {
        return (extensions
            .map(extension => {
            const context = {
                name: extension.name,
                options: extension.options,
                storage: extension.storage,
            };
            const addExtensions = getExtensionField(extension, 'addExtensions', context);
            if (addExtensions) {
                return [extension, ...this.flatten(addExtensions())];
            }
            return extension;
        })
            // `Infinity` will break TypeScript so we set a number that is probably high enough
            .flat(10));
    }
    static sort(extensions) {
        const defaultPriority = 100;
        return extensions.sort((a, b) => {
            const priorityA = getExtensionField(a, 'priority') || defaultPriority;
            const priorityB = getExtensionField(b, 'priority') || defaultPriority;
            if (priorityA > priorityB) {
                return -1;
            }
            if (priorityA < priorityB) {
                return 1;
            }
            return 0;
        });
    }
    get commands() {
        return this.extensions.reduce((commands, extension) => {
            const context = {
                name: extension.name,
                options: extension.options,
                storage: extension.storage,
                editor: this.editor,
                type: getSchemaTypeByName(extension.name, this.schema),
            };
            const addCommands = getExtensionField(extension, 'addCommands', context);
            if (!addCommands) {
                return commands;
            }
            return {
                ...commands,
                ...addCommands(),
            };
        }, {});
    }
    get plugins() {
        const { editor } = this;
        // With ProseMirror, first plugins within an array are executed first.
        // In tiptap, we provide the ability to override plugins,
        // so it feels more natural to run plugins at the end of an array first.
        // That’s why we have to reverse the `extensions` array and sort again
        // based on the `priority` option.
        const extensions = ExtensionManager.sort([...this.extensions].reverse());
        const inputRules = [];
        const pasteRules = [];
        const allPlugins = extensions
            .map(extension => {
            const context = {
                name: extension.name,
                options: extension.options,
                storage: extension.storage,
                editor,
                type: getSchemaTypeByName(extension.name, this.schema),
            };
            const plugins = [];
            const addKeyboardShortcuts = getExtensionField(extension, 'addKeyboardShortcuts', context);
            let defaultBindings = {};
            // bind exit handling
            if (extension.type === 'mark' && extension.config.exitable) {
                defaultBindings.ArrowRight = () => Mark.handleExit({ editor, mark: extension });
            }
            if (addKeyboardShortcuts) {
                const bindings = Object.fromEntries(Object.entries(addKeyboardShortcuts()).map(([shortcut, method]) => {
                    return [shortcut, () => method({ editor })];
                }));
                defaultBindings = { ...defaultBindings, ...bindings };
            }
            const keyMapPlugin = keymap(defaultBindings);
            plugins.push(keyMapPlugin);
            const addInputRules = getExtensionField(extension, 'addInputRules', context);
            if (isExtensionRulesEnabled(extension, editor.options.enableInputRules) && addInputRules) {
                inputRules.push(...addInputRules());
            }
            const addPasteRules = getExtensionField(extension, 'addPasteRules', context);
            if (isExtensionRulesEnabled(extension, editor.options.enablePasteRules) && addPasteRules) {
                pasteRules.push(...addPasteRules());
            }
            const addProseMirrorPlugins = getExtensionField(extension, 'addProseMirrorPlugins', context);
            if (addProseMirrorPlugins) {
                const proseMirrorPlugins = addProseMirrorPlugins();
                plugins.push(...proseMirrorPlugins);
            }
            return plugins;
        })
            .flat();
        return [
            inputRulesPlugin({
                editor,
                rules: inputRules,
            }),
            ...pasteRulesPlugin({
                editor,
                rules: pasteRules,
            }),
            ...allPlugins,
        ];
    }
    get attributes() {
        return getAttributesFromExtensions(this.extensions);
    }
    get nodeViews() {
        const { editor } = this;
        const { nodeExtensions } = splitExtensions(this.extensions);
        return Object.fromEntries(nodeExtensions
            .filter(extension => !!getExtensionField(extension, 'addNodeView'))
            .map(extension => {
            const extensionAttributes = this.attributes.filter(attribute => attribute.type === extension.name);
            const context = {
                name: extension.name,
                options: extension.options,
                storage: extension.storage,
                editor,
                type: getNodeType(extension.name, this.schema),
            };
            const addNodeView = getExtensionField(extension, 'addNodeView', context);
            if (!addNodeView) {
                return [];
            }
            const nodeview = (node, view, getPos, decorations) => {
                const HTMLAttributes = getRenderedAttributes(node, extensionAttributes);
                return addNodeView()({
                    editor,
                    node,
                    getPos,
                    decorations,
                    HTMLAttributes,
                    extension,
                });
            };
            return [extension.name, nodeview];
        }));
    }
}

// see: https://github.com/mesqueeb/is-what/blob/88d6e4ca92fb2baab6003c54e02eedf4e729e5ab/src/index.ts
function getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1);
}
function isPlainObject(value) {
    if (getType(value) !== 'Object') {
        return false;
    }
    return value.constructor === Object && Object.getPrototypeOf(value) === Object.prototype;
}

function mergeDeep(target, source) {
    const output = { ...target };
    if (isPlainObject(target) && isPlainObject(source)) {
        Object.keys(source).forEach(key => {
            if (isPlainObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                }
                else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

class Extension {
    constructor(config = {}) {
        this.type = 'extension';
        this.name = 'extension';
        this.parent = null;
        this.child = null;
        this.config = {
            name: this.name,
            defaultOptions: {},
        };
        this.config = {
            ...this.config,
            ...config,
        };
        this.name = this.config.name;
        if (config.defaultOptions) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`);
        }
        // TODO: remove `addOptions` fallback
        this.options = this.config.defaultOptions;
        if (this.config.addOptions) {
            this.options = callOrReturn(getExtensionField(this, 'addOptions', {
                name: this.name,
            }));
        }
        this.storage = callOrReturn(getExtensionField(this, 'addStorage', {
            name: this.name,
            options: this.options,
        })) || {};
    }
    static create(config = {}) {
        return new Extension(config);
    }
    configure(options = {}) {
        // return a new instance so we can use the same extension
        // with different calls of `configure`
        const extension = this.extend();
        extension.options = mergeDeep(this.options, options);
        extension.storage = callOrReturn(getExtensionField(extension, 'addStorage', {
            name: extension.name,
            options: extension.options,
        }));
        return extension;
    }
    extend(extendedConfig = {}) {
        const extension = new Extension(extendedConfig);
        extension.parent = this;
        this.child = extension;
        extension.name = extendedConfig.name ? extendedConfig.name : extension.parent.name;
        if (extendedConfig.defaultOptions) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`);
        }
        extension.options = callOrReturn(getExtensionField(extension, 'addOptions', {
            name: extension.name,
        }));
        extension.storage = callOrReturn(getExtensionField(extension, 'addStorage', {
            name: extension.name,
            options: extension.options,
        }));
        return extension;
    }
}

function getTextBetween(startNode, range, options) {
    const { from, to } = range;
    const { blockSeparator = '\n\n', textSerializers = {} } = options || {};
    let text = '';
    let separated = true;
    startNode.nodesBetween(from, to, (node, pos, parent, index) => {
        var _a;
        const textSerializer = textSerializers === null || textSerializers === void 0 ? void 0 : textSerializers[node.type.name];
        if (textSerializer) {
            if (node.isBlock && !separated) {
                text += blockSeparator;
                separated = true;
            }
            if (parent) {
                text += textSerializer({
                    node,
                    pos,
                    parent,
                    index,
                    range,
                });
            }
        }
        else if (node.isText) {
            text += (_a = node === null || node === void 0 ? void 0 : node.text) === null || _a === void 0 ? void 0 : _a.slice(Math.max(from, pos) - pos, to - pos); // eslint-disable-line
            separated = false;
        }
        else if (node.isBlock && !separated) {
            text += blockSeparator;
            separated = true;
        }
    });
    return text;
}

function getTextSerializersFromSchema(schema) {
    return Object.fromEntries(Object.entries(schema.nodes)
        .filter(([, node]) => node.spec.toText)
        .map(([name, node]) => [name, node.spec.toText]));
}

const ClipboardTextSerializer = Extension.create({
    name: 'clipboardTextSerializer',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('clipboardTextSerializer'),
                props: {
                    clipboardTextSerializer: () => {
                        const { editor } = this;
                        const { state, schema } = editor;
                        const { doc, selection } = state;
                        const { ranges } = selection;
                        const from = Math.min(...ranges.map(range => range.$from.pos));
                        const to = Math.max(...ranges.map(range => range.$to.pos));
                        const textSerializers = getTextSerializersFromSchema(schema);
                        const range = { from, to };
                        return getTextBetween(doc, range, {
                            textSerializers,
                        });
                    },
                },
            }),
        ];
    },
});

const blur = () => ({ editor, view }) => {
    requestAnimationFrame(() => {
        var _a;
        if (!editor.isDestroyed) {
            view.dom.blur();
            // Browsers should remove the caret on blur but safari does not.
            // See: https://github.com/ueberdosis/tiptap/issues/2405
            (_a = window === null || window === void 0 ? void 0 : window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
        }
    });
    return true;
};

const clearContent = (emitUpdate = false) => ({ commands }) => {
    return commands.setContent('', emitUpdate);
};

const clearNodes = () => ({ state, tr, dispatch }) => {
    const { selection } = tr;
    const { ranges } = selection;
    if (!dispatch) {
        return true;
    }
    ranges.forEach(({ $from, $to }) => {
        state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
            if (node.type.isText) {
                return;
            }
            const { doc, mapping } = tr;
            const $mappedFrom = doc.resolve(mapping.map(pos));
            const $mappedTo = doc.resolve(mapping.map(pos + node.nodeSize));
            const nodeRange = $mappedFrom.blockRange($mappedTo);
            if (!nodeRange) {
                return;
            }
            const targetLiftDepth = liftTarget(nodeRange);
            if (node.type.isTextblock) {
                const { defaultType } = $mappedFrom.parent.contentMatchAt($mappedFrom.index());
                tr.setNodeMarkup(nodeRange.start, defaultType);
            }
            if (targetLiftDepth || targetLiftDepth === 0) {
                tr.lift(nodeRange, targetLiftDepth);
            }
        });
    });
    return true;
};

const command = fn => props => {
    return fn(props);
};

const createParagraphNear = () => ({ state, dispatch }) => {
    return createParagraphNear$1(state, dispatch);
};

const deleteCurrentNode = () => ({ tr, dispatch }) => {
    const { selection } = tr;
    const currentNode = selection.$anchor.node();
    // if there is content inside the current node, break out of this command
    if (currentNode.content.size > 0) {
        return false;
    }
    const $pos = tr.selection.$anchor;
    for (let depth = $pos.depth; depth > 0; depth -= 1) {
        const node = $pos.node(depth);
        if (node.type === currentNode.type) {
            if (dispatch) {
                const from = $pos.before(depth);
                const to = $pos.after(depth);
                tr.delete(from, to).scrollIntoView();
            }
            return true;
        }
    }
    return false;
};

const deleteNode = typeOrName => ({ tr, state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    const $pos = tr.selection.$anchor;
    for (let depth = $pos.depth; depth > 0; depth -= 1) {
        const node = $pos.node(depth);
        if (node.type === type) {
            if (dispatch) {
                const from = $pos.before(depth);
                const to = $pos.after(depth);
                tr.delete(from, to).scrollIntoView();
            }
            return true;
        }
    }
    return false;
};

const deleteRange = range => ({ tr, dispatch }) => {
    const { from, to } = range;
    if (dispatch) {
        tr.delete(from, to);
    }
    return true;
};

const deleteSelection = () => ({ state, dispatch }) => {
    return deleteSelection$1(state, dispatch);
};

const enter = () => ({ commands }) => {
    return commands.keyboardShortcut('Enter');
};

const exitCode = () => ({ state, dispatch }) => {
    return exitCode$1(state, dispatch);
};

/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
function objectIncludes(object1, object2, options = { strict: true }) {
    const keys = Object.keys(object2);
    if (!keys.length) {
        return true;
    }
    return keys.every(key => {
        if (options.strict) {
            return object2[key] === object1[key];
        }
        if (isRegExp(object2[key])) {
            return object2[key].test(object1[key]);
        }
        return object2[key] === object1[key];
    });
}

function findMarkInSet(marks, type, attributes = {}) {
    return marks.find(item => {
        return item.type === type && objectIncludes(item.attrs, attributes);
    });
}
function isMarkInSet(marks, type, attributes = {}) {
    return !!findMarkInSet(marks, type, attributes);
}
function getMarkRange($pos, type, attributes = {}) {
    if (!$pos || !type) {
        return;
    }
    let start = $pos.parent.childAfter($pos.parentOffset);
    if ($pos.parentOffset === start.offset && start.offset !== 0) {
        start = $pos.parent.childBefore($pos.parentOffset);
    }
    if (!start.node) {
        return;
    }
    const mark = findMarkInSet([...start.node.marks], type, attributes);
    if (!mark) {
        return;
    }
    let startIndex = start.index;
    let startPos = $pos.start() + start.offset;
    let endIndex = startIndex + 1;
    let endPos = startPos + start.node.nodeSize;
    findMarkInSet([...start.node.marks], type, attributes);
    while (startIndex > 0 && mark.isInSet($pos.parent.child(startIndex - 1).marks)) {
        startIndex -= 1;
        startPos -= $pos.parent.child(startIndex).nodeSize;
    }
    while (endIndex < $pos.parent.childCount
        && isMarkInSet([...$pos.parent.child(endIndex).marks], type, attributes)) {
        endPos += $pos.parent.child(endIndex).nodeSize;
        endIndex += 1;
    }
    return {
        from: startPos,
        to: endPos,
    };
}

function getMarkType(nameOrType, schema) {
    if (typeof nameOrType === 'string') {
        if (!schema.marks[nameOrType]) {
            throw Error(`There is no mark type named '${nameOrType}'. Maybe you forgot to add the extension?`);
        }
        return schema.marks[nameOrType];
    }
    return nameOrType;
}

const extendMarkRange = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
    const type = getMarkType(typeOrName, state.schema);
    const { doc, selection } = tr;
    const { $from, from, to } = selection;
    if (dispatch) {
        const range = getMarkRange($from, type, attributes);
        if (range && range.from <= from && range.to >= to) {
            const newSelection = TextSelection.create(doc, range.from, range.to);
            tr.setSelection(newSelection);
        }
    }
    return true;
};

const first = commands => props => {
    const items = typeof commands === 'function'
        ? commands(props)
        : commands;
    for (let i = 0; i < items.length; i += 1) {
        if (items[i](props)) {
            return true;
        }
    }
    return false;
};

function isTextSelection(value) {
    return value instanceof TextSelection;
}

function minMax(value = 0, min = 0, max = 0) {
    return Math.min(Math.max(value, min), max);
}

function resolveFocusPosition(doc, position = null) {
    if (!position) {
        return null;
    }
    const selectionAtStart = Selection.atStart(doc);
    const selectionAtEnd = Selection.atEnd(doc);
    if (position === 'start' || position === true) {
        return selectionAtStart;
    }
    if (position === 'end') {
        return selectionAtEnd;
    }
    const minPos = selectionAtStart.from;
    const maxPos = selectionAtEnd.to;
    if (position === 'all') {
        return TextSelection.create(doc, minMax(0, minPos, maxPos), minMax(doc.content.size, minPos, maxPos));
    }
    return TextSelection.create(doc, minMax(position, minPos, maxPos), minMax(position, minPos, maxPos));
}

function isiOS() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}

const focus = (position = null, options = {}) => ({ editor, view, tr, dispatch, }) => {
    options = {
        scrollIntoView: true,
        ...options,
    };
    const delayedFocus = () => {
        // focus within `requestAnimationFrame` breaks focus on iOS
        // so we have to call this
        if (isiOS()) {
            view.dom.focus();
        }
        // For React we have to focus asynchronously. Otherwise wild things happen.
        // see: https://github.com/ueberdosis/tiptap/issues/1520
        requestAnimationFrame(() => {
            if (!editor.isDestroyed) {
                view.focus();
                if (options === null || options === void 0 ? void 0 : options.scrollIntoView) {
                    editor.commands.scrollIntoView();
                }
            }
        });
    };
    if ((view.hasFocus() && position === null) || position === false) {
        return true;
    }
    // we don’t try to resolve a NodeSelection or CellSelection
    if (dispatch && position === null && !isTextSelection(editor.state.selection)) {
        delayedFocus();
        return true;
    }
    // pass through tr.doc instead of editor.state.doc
    // since transactions could change the editors state before this command has been run
    const selection = resolveFocusPosition(tr.doc, position) || editor.state.selection;
    const isSameSelection = editor.state.selection.eq(selection);
    if (dispatch) {
        if (!isSameSelection) {
            tr.setSelection(selection);
        }
        // `tr.setSelection` resets the stored marks
        // so we’ll restore them if the selection is the same as before
        if (isSameSelection && tr.storedMarks) {
            tr.setStoredMarks(tr.storedMarks);
        }
        delayedFocus();
    }
    return true;
};

const forEach = (items, fn) => props => {
    return items.every((item, index) => fn(item, { ...props, index }));
};

const insertContent = (value, options) => ({ tr, commands }) => {
    return commands.insertContentAt({ from: tr.selection.from, to: tr.selection.to }, value, options);
};

function elementFromString(value) {
    // add a wrapper to preserve leading and trailing whitespace
    const wrappedValue = `<body>${value}</body>`;
    return new window.DOMParser().parseFromString(wrappedValue, 'text/html').body;
}

function createNodeFromContent(content, schema, options) {
    options = {
        slice: true,
        parseOptions: {},
        ...options,
    };
    if (typeof content === 'object' && content !== null) {
        try {
            if (Array.isArray(content) && content.length > 0) {
                return Fragment.fromArray(content.map(item => schema.nodeFromJSON(item)));
            }
            return schema.nodeFromJSON(content);
        }
        catch (error) {
            console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error);
            return createNodeFromContent('', schema, options);
        }
    }
    if (typeof content === 'string') {
        const parser = DOMParser.fromSchema(schema);
        return options.slice
            ? parser.parseSlice(elementFromString(content), options.parseOptions).content
            : parser.parse(elementFromString(content), options.parseOptions);
    }
    return createNodeFromContent('', schema, options);
}

// source: https://github.com/ProseMirror/prosemirror-state/blob/master/src/selection.js#L466
function selectionToInsertionEnd(tr, startLen, bias) {
    const last = tr.steps.length - 1;
    if (last < startLen) {
        return;
    }
    const step = tr.steps[last];
    if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) {
        return;
    }
    const map = tr.mapping.maps[last];
    let end = 0;
    map.forEach((_from, _to, _newFrom, newTo) => {
        if (end === 0) {
            end = newTo;
        }
    });
    tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}

const isFragment = (nodeOrFragment) => {
    return nodeOrFragment.toString().startsWith('<');
};
const insertContentAt = (position, value, options) => ({ tr, dispatch, editor }) => {
    if (dispatch) {
        options = {
            parseOptions: {},
            updateSelection: true,
            ...options,
        };
        const content = createNodeFromContent(value, editor.schema, {
            parseOptions: {
                preserveWhitespace: 'full',
                ...options.parseOptions,
            },
        });
        // don’t dispatch an empty fragment because this can lead to strange errors
        if (content.toString() === '<>') {
            return true;
        }
        let { from, to } = typeof position === 'number' ? { from: position, to: position } : position;
        let isOnlyTextContent = true;
        let isOnlyBlockContent = true;
        const nodes = isFragment(content) ? content : [content];
        nodes.forEach(node => {
            // check if added node is valid
            node.check();
            isOnlyTextContent = isOnlyTextContent ? node.isText && node.marks.length === 0 : false;
            isOnlyBlockContent = isOnlyBlockContent ? node.isBlock : false;
        });
        // check if we can replace the wrapping node by
        // the newly inserted content
        // example:
        // replace an empty paragraph by an inserted image
        // instead of inserting the image below the paragraph
        if (from === to && isOnlyBlockContent) {
            const { parent } = tr.doc.resolve(from);
            const isEmptyTextBlock = parent.isTextblock && !parent.type.spec.code && !parent.childCount;
            if (isEmptyTextBlock) {
                from -= 1;
                to += 1;
            }
        }
        // if there is only plain text we have to use `insertText`
        // because this will keep the current marks
        if (isOnlyTextContent) {
            // if value is string, we can use it directly
            // otherwise if it is an array, we have to join it
            if (Array.isArray(value)) {
                tr.insertText(value.map(v => v.text || '').join(''), from, to);
            }
            else if (typeof value === 'object' && !!value && !!value.text) {
                tr.insertText(value.text, from, to);
            }
            else {
                tr.insertText(value, from, to);
            }
        }
        else {
            tr.replaceWith(from, to, content);
        }
        // set cursor at end of inserted content
        if (options.updateSelection) {
            selectionToInsertionEnd(tr, tr.steps.length - 1, -1);
        }
    }
    return true;
};

const joinUp = () => ({ state, dispatch }) => {
    return joinUp$1(state, dispatch);
};
const joinDown = () => ({ state, dispatch }) => {
    return joinDown$1(state, dispatch);
};
const joinBackward = () => ({ state, dispatch }) => {
    return joinBackward$1(state, dispatch);
};
const joinForward = () => ({ state, dispatch }) => {
    return joinForward$1(state, dispatch);
};

function isMacOS() {
    return typeof navigator !== 'undefined'
        ? /Mac/.test(navigator.platform)
        : false;
}

function normalizeKeyName(name) {
    const parts = name.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result === 'Space') {
        result = ' ';
    }
    let alt;
    let ctrl;
    let shift;
    let meta;
    for (let i = 0; i < parts.length - 1; i += 1) {
        const mod = parts[i];
        if (/^(cmd|meta|m)$/i.test(mod)) {
            meta = true;
        }
        else if (/^a(lt)?$/i.test(mod)) {
            alt = true;
        }
        else if (/^(c|ctrl|control)$/i.test(mod)) {
            ctrl = true;
        }
        else if (/^s(hift)?$/i.test(mod)) {
            shift = true;
        }
        else if (/^mod$/i.test(mod)) {
            if (isiOS() || isMacOS()) {
                meta = true;
            }
            else {
                ctrl = true;
            }
        }
        else {
            throw new Error(`Unrecognized modifier name: ${mod}`);
        }
    }
    if (alt) {
        result = `Alt-${result}`;
    }
    if (ctrl) {
        result = `Ctrl-${result}`;
    }
    if (meta) {
        result = `Meta-${result}`;
    }
    if (shift) {
        result = `Shift-${result}`;
    }
    return result;
}
const keyboardShortcut = name => ({ editor, view, tr, dispatch, }) => {
    const keys = normalizeKeyName(name).split(/-(?!$)/);
    const key = keys.find(item => !['Alt', 'Ctrl', 'Meta', 'Shift'].includes(item));
    const event = new KeyboardEvent('keydown', {
        key: key === 'Space'
            ? ' '
            : key,
        altKey: keys.includes('Alt'),
        ctrlKey: keys.includes('Ctrl'),
        metaKey: keys.includes('Meta'),
        shiftKey: keys.includes('Shift'),
        bubbles: true,
        cancelable: true,
    });
    const capturedTransaction = editor.captureTransaction(() => {
        view.someProp('handleKeyDown', f => f(view, event));
    });
    capturedTransaction === null || capturedTransaction === void 0 ? void 0 : capturedTransaction.steps.forEach(step => {
        const newStep = step.map(tr.mapping);
        if (newStep && dispatch) {
            tr.maybeStep(newStep);
        }
    });
    return true;
};

function isNodeActive(state, typeOrName, attributes = {}) {
    const { from, to, empty } = state.selection;
    const type = typeOrName ? getNodeType(typeOrName, state.schema) : null;
    const nodeRanges = [];
    state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isText) {
            return;
        }
        const relativeFrom = Math.max(from, pos);
        const relativeTo = Math.min(to, pos + node.nodeSize);
        nodeRanges.push({
            node,
            from: relativeFrom,
            to: relativeTo,
        });
    });
    const selectionRange = to - from;
    const matchedNodeRanges = nodeRanges
        .filter(nodeRange => {
        if (!type) {
            return true;
        }
        return type.name === nodeRange.node.type.name;
    })
        .filter(nodeRange => objectIncludes(nodeRange.node.attrs, attributes, { strict: false }));
    if (empty) {
        return !!matchedNodeRanges.length;
    }
    const range = matchedNodeRanges.reduce((sum, nodeRange) => sum + nodeRange.to - nodeRange.from, 0);
    return range >= selectionRange;
}

const lift = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    const isActive = isNodeActive(state, type, attributes);
    if (!isActive) {
        return false;
    }
    return lift$1(state, dispatch);
};

const liftEmptyBlock = () => ({ state, dispatch }) => {
    return liftEmptyBlock$1(state, dispatch);
};

const liftListItem = typeOrName => ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    return liftListItem$1(type)(state, dispatch);
};

const newlineInCode = () => ({ state, dispatch }) => {
    return newlineInCode$1(state, dispatch);
};

function getSchemaTypeNameByName(name, schema) {
    if (schema.nodes[name]) {
        return 'node';
    }
    if (schema.marks[name]) {
        return 'mark';
    }
    return null;
}

/**
 * Remove a property or an array of properties from an object
 * @param obj Object
 * @param key Key to remove
 */
function deleteProps(obj, propOrProps) {
    const props = typeof propOrProps === 'string'
        ? [propOrProps]
        : propOrProps;
    return Object
        .keys(obj)
        .reduce((newObj, prop) => {
        if (!props.includes(prop)) {
            newObj[prop] = obj[prop];
        }
        return newObj;
    }, {});
}

const resetAttributes = (typeOrName, attributes) => ({ tr, state, dispatch }) => {
    let nodeType = null;
    let markType = null;
    const schemaType = getSchemaTypeNameByName(typeof typeOrName === 'string' ? typeOrName : typeOrName.name, state.schema);
    if (!schemaType) {
        return false;
    }
    if (schemaType === 'node') {
        nodeType = getNodeType(typeOrName, state.schema);
    }
    if (schemaType === 'mark') {
        markType = getMarkType(typeOrName, state.schema);
    }
    if (dispatch) {
        tr.selection.ranges.forEach(range => {
            state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
                if (nodeType && nodeType === node.type) {
                    tr.setNodeMarkup(pos, undefined, deleteProps(node.attrs, attributes));
                }
                if (markType && node.marks.length) {
                    node.marks.forEach(mark => {
                        if (markType === mark.type) {
                            tr.addMark(pos, pos + node.nodeSize, markType.create(deleteProps(mark.attrs, attributes)));
                        }
                    });
                }
            });
        });
    }
    return true;
};

const scrollIntoView = () => ({ tr, dispatch }) => {
    if (dispatch) {
        tr.scrollIntoView();
    }
    return true;
};

const selectAll = () => ({ tr, commands }) => {
    return commands.setTextSelection({
        from: 0,
        to: tr.doc.content.size,
    });
};

const selectNodeBackward = () => ({ state, dispatch }) => {
    return selectNodeBackward$1(state, dispatch);
};

const selectNodeForward = () => ({ state, dispatch }) => {
    return selectNodeForward$1(state, dispatch);
};

const selectParentNode = () => ({ state, dispatch }) => {
    return selectParentNode$1(state, dispatch);
};

// @ts-ignore
const selectTextblockEnd = () => ({ state, dispatch }) => {
    return selectTextblockEnd$1(state, dispatch);
};

// @ts-ignore
const selectTextblockStart = () => ({ state, dispatch }) => {
    return selectTextblockStart$1(state, dispatch);
};

function createDocument(content, schema, parseOptions = {}) {
    return createNodeFromContent(content, schema, { slice: false, parseOptions });
}

const setContent$1 = (content, emitUpdate = false, parseOptions = {}) => ({ tr, editor, dispatch }) => {
    const { doc } = tr;
    const document = createDocument(content, editor.schema, parseOptions);
    if (dispatch) {
        tr.replaceWith(0, doc.content.size, document).setMeta('preventUpdate', !emitUpdate);
    }
    return true;
};

/**
 * Returns a new `Transform` based on all steps of the passed transactions.
 */
function combineTransactionSteps(oldDoc, transactions) {
    const transform = new Transform(oldDoc);
    transactions.forEach(transaction => {
        transaction.steps.forEach(step => {
            transform.step(step);
        });
    });
    return transform;
}

function defaultBlockAt(match) {
    for (let i = 0; i < match.edgeCount; i += 1) {
        const { type } = match.edge(i);
        if (type.isTextblock && !type.hasRequiredAttrs()) {
            return type;
        }
    }
    return null;
}

function findChildren(node, predicate) {
    const nodesWithPos = [];
    node.descendants((child, pos) => {
        if (predicate(child)) {
            nodesWithPos.push({
                node: child,
                pos,
            });
        }
    });
    return nodesWithPos;
}

/**
 * Same as `findChildren` but searches only within a `range`.
 */
function findChildrenInRange(node, range, predicate) {
    const nodesWithPos = [];
    // if (range.from === range.to) {
    //   const nodeAt = node.nodeAt(range.from)
    //   if (nodeAt) {
    //     nodesWithPos.push({
    //       node: nodeAt,
    //       pos: range.from,
    //     })
    //   }
    // }
    node.nodesBetween(range.from, range.to, (child, pos) => {
        if (predicate(child)) {
            nodesWithPos.push({
                node: child,
                pos,
            });
        }
    });
    return nodesWithPos;
}

function findParentNodeClosestToPos($pos, predicate) {
    for (let i = $pos.depth; i > 0; i -= 1) {
        const node = $pos.node(i);
        if (predicate(node)) {
            return {
                pos: i > 0 ? $pos.before(i) : 0,
                start: $pos.start(i),
                depth: i,
                node,
            };
        }
    }
}

function findParentNode(predicate) {
    return (selection) => findParentNodeClosestToPos(selection.$from, predicate);
}

function getHTMLFromFragment(fragment, schema) {
    const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment);
    const temporaryDocument = document.implementation.createHTMLDocument();
    const container = temporaryDocument.createElement('div');
    container.appendChild(documentFragment);
    return container.innerHTML;
}

function getSchema(extensions) {
    const resolvedExtensions = ExtensionManager.resolve(extensions);
    return getSchemaByResolvedExtensions(resolvedExtensions);
}

function generateHTML(doc, extensions) {
    const schema = getSchema(extensions);
    const contentNode = Node$1.fromJSON(schema, doc);
    return getHTMLFromFragment(contentNode.content, schema);
}

function generateJSON(html, extensions) {
    const schema = getSchema(extensions);
    const dom = elementFromString(html);
    return DOMParser.fromSchema(schema).parse(dom).toJSON();
}

function getText(node, options) {
    const range = {
        from: 0,
        to: node.content.size,
    };
    return getTextBetween(node, range, options);
}

function generateText(doc, extensions, options) {
    const { blockSeparator = '\n\n', textSerializers = {} } = options || {};
    const schema = getSchema(extensions);
    const contentNode = Node$1.fromJSON(schema, doc);
    return getText(contentNode, {
        blockSeparator,
        textSerializers: {
            ...getTextSerializersFromSchema(schema),
            ...textSerializers,
        },
    });
}

function getMarkAttributes(state, typeOrName) {
    const type = getMarkType(typeOrName, state.schema);
    const { from, to, empty } = state.selection;
    const marks = [];
    if (empty) {
        if (state.storedMarks) {
            marks.push(...state.storedMarks);
        }
        marks.push(...state.selection.$head.marks());
    }
    else {
        state.doc.nodesBetween(from, to, node => {
            marks.push(...node.marks);
        });
    }
    const mark = marks.find(markItem => markItem.type.name === type.name);
    if (!mark) {
        return {};
    }
    return { ...mark.attrs };
}

function getNodeAttributes(state, typeOrName) {
    const type = getNodeType(typeOrName, state.schema);
    const { from, to } = state.selection;
    const nodes = [];
    state.doc.nodesBetween(from, to, node => {
        nodes.push(node);
    });
    const node = nodes.reverse().find(nodeItem => nodeItem.type.name === type.name);
    if (!node) {
        return {};
    }
    return { ...node.attrs };
}

function getAttributes(state, typeOrName) {
    const schemaType = getSchemaTypeNameByName(typeof typeOrName === 'string' ? typeOrName : typeOrName.name, state.schema);
    if (schemaType === 'node') {
        return getNodeAttributes(state, typeOrName);
    }
    if (schemaType === 'mark') {
        return getMarkAttributes(state, typeOrName);
    }
    return {};
}

/**
 * Removes duplicated values within an array.
 * Supports numbers, strings and objects.
 */
function removeDuplicates(array, by = JSON.stringify) {
    const seen = {};
    return array.filter(item => {
        const key = by(item);
        return Object.prototype.hasOwnProperty.call(seen, key)
            ? false
            : (seen[key] = true);
    });
}

/**
 * Removes duplicated ranges and ranges that are
 * fully captured by other ranges.
 */
function simplifyChangedRanges(changes) {
    const uniqueChanges = removeDuplicates(changes);
    return uniqueChanges.length === 1
        ? uniqueChanges
        : uniqueChanges.filter((change, index) => {
            const rest = uniqueChanges.filter((_, i) => i !== index);
            return !rest.some(otherChange => {
                return change.oldRange.from >= otherChange.oldRange.from
                    && change.oldRange.to <= otherChange.oldRange.to
                    && change.newRange.from >= otherChange.newRange.from
                    && change.newRange.to <= otherChange.newRange.to;
            });
        });
}
/**
 * Returns a list of changed ranges
 * based on the first and last state of all steps.
 */
function getChangedRanges(transform) {
    const { mapping, steps } = transform;
    const changes = [];
    mapping.maps.forEach((stepMap, index) => {
        const ranges = [];
        // This accounts for step changes where no range was actually altered
        // e.g. when setting a mark, node attribute, etc.
        // @ts-ignore
        if (!stepMap.ranges.length) {
            const { from, to } = steps[index];
            if (from === undefined || to === undefined) {
                return;
            }
            ranges.push({ from, to });
        }
        else {
            stepMap.forEach((from, to) => {
                ranges.push({ from, to });
            });
        }
        ranges.forEach(({ from, to }) => {
            const newStart = mapping.slice(index).map(from, -1);
            const newEnd = mapping.slice(index).map(to);
            const oldStart = mapping.invert().map(newStart, -1);
            const oldEnd = mapping.invert().map(newEnd);
            changes.push({
                oldRange: {
                    from: oldStart,
                    to: oldEnd,
                },
                newRange: {
                    from: newStart,
                    to: newEnd,
                },
            });
        });
    });
    return simplifyChangedRanges(changes);
}

function getDebugJSON(node, startOffset = 0) {
    const isTopNode = node.type === node.type.schema.topNodeType;
    const increment = isTopNode ? 0 : 1;
    const from = startOffset;
    const to = from + node.nodeSize;
    const marks = node.marks.map(mark => {
        const output = {
            type: mark.type.name,
        };
        if (Object.keys(mark.attrs).length) {
            output.attrs = { ...mark.attrs };
        }
        return output;
    });
    const attrs = { ...node.attrs };
    const output = {
        type: node.type.name,
        from,
        to,
    };
    if (Object.keys(attrs).length) {
        output.attrs = attrs;
    }
    if (marks.length) {
        output.marks = marks;
    }
    if (node.content.childCount) {
        output.content = [];
        node.forEach((child, offset) => {
            var _a;
            (_a = output.content) === null || _a === void 0 ? void 0 : _a.push(getDebugJSON(child, startOffset + offset + increment));
        });
    }
    if (node.text) {
        output.text = node.text;
    }
    return output;
}

function getMarksBetween(from, to, doc) {
    const marks = [];
    // get all inclusive marks on empty selection
    if (from === to) {
        doc
            .resolve(from)
            .marks()
            .forEach(mark => {
            const $pos = doc.resolve(from - 1);
            const range = getMarkRange($pos, mark.type);
            if (!range) {
                return;
            }
            marks.push({
                mark,
                ...range,
            });
        });
    }
    else {
        doc.nodesBetween(from, to, (node, pos) => {
            marks.push(...node.marks.map(mark => ({
                from: pos,
                to: pos + node.nodeSize,
                mark,
            })));
        });
    }
    return marks;
}

function getSplittedAttributes(extensionAttributes, typeName, attributes) {
    return Object.fromEntries(Object
        .entries(attributes)
        .filter(([name]) => {
        const extensionAttribute = extensionAttributes.find(item => {
            return item.type === typeName && item.name === name;
        });
        if (!extensionAttribute) {
            return false;
        }
        return extensionAttribute.attribute.keepOnSplit;
    }));
}

function isMarkActive(state, typeOrName, attributes = {}) {
    const { empty, ranges } = state.selection;
    const type = typeOrName ? getMarkType(typeOrName, state.schema) : null;
    if (empty) {
        return !!(state.storedMarks || state.selection.$from.marks())
            .filter(mark => {
            if (!type) {
                return true;
            }
            return type.name === mark.type.name;
        })
            .find(mark => objectIncludes(mark.attrs, attributes, { strict: false }));
    }
    let selectionRange = 0;
    const markRanges = [];
    ranges.forEach(({ $from, $to }) => {
        const from = $from.pos;
        const to = $to.pos;
        state.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isText && !node.marks.length) {
                return;
            }
            const relativeFrom = Math.max(from, pos);
            const relativeTo = Math.min(to, pos + node.nodeSize);
            const range = relativeTo - relativeFrom;
            selectionRange += range;
            markRanges.push(...node.marks.map(mark => ({
                mark,
                from: relativeFrom,
                to: relativeTo,
            })));
        });
    });
    if (selectionRange === 0) {
        return false;
    }
    // calculate range of matched mark
    const matchedRange = markRanges
        .filter(markRange => {
        if (!type) {
            return true;
        }
        return type.name === markRange.mark.type.name;
    })
        .filter(markRange => objectIncludes(markRange.mark.attrs, attributes, { strict: false }))
        .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
    // calculate range of marks that excludes the searched mark
    // for example `code` doesn’t allow any other marks
    const excludedRange = markRanges
        .filter(markRange => {
        if (!type) {
            return true;
        }
        return markRange.mark.type !== type && markRange.mark.type.excludes(type);
    })
        .reduce((sum, markRange) => sum + markRange.to - markRange.from, 0);
    // we only include the result of `excludedRange`
    // if there is a match at all
    const range = matchedRange > 0 ? matchedRange + excludedRange : matchedRange;
    return range >= selectionRange;
}

function isActive(state, name, attributes = {}) {
    if (!name) {
        return isNodeActive(state, null, attributes) || isMarkActive(state, null, attributes);
    }
    const schemaType = getSchemaTypeNameByName(name, state.schema);
    if (schemaType === 'node') {
        return isNodeActive(state, name, attributes);
    }
    if (schemaType === 'mark') {
        return isMarkActive(state, name, attributes);
    }
    return false;
}

function isList(name, extensions) {
    const { nodeExtensions } = splitExtensions(extensions);
    const extension = nodeExtensions.find(item => item.name === name);
    if (!extension) {
        return false;
    }
    const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
    };
    const group = callOrReturn(getExtensionField(extension, 'group', context));
    if (typeof group !== 'string') {
        return false;
    }
    return group.split(' ').includes('list');
}

function isNodeEmpty(node) {
    var _a;
    const defaultContent = (_a = node.type.createAndFill()) === null || _a === void 0 ? void 0 : _a.toJSON();
    const content = node.toJSON();
    return JSON.stringify(defaultContent) === JSON.stringify(content);
}

function isNodeSelection(value) {
    return value instanceof NodeSelection;
}

function posToDOMRect(view, from, to) {
    const minPos = 0;
    const maxPos = view.state.doc.content.size;
    const resolvedFrom = minMax(from, minPos, maxPos);
    const resolvedEnd = minMax(to, minPos, maxPos);
    const start = view.coordsAtPos(resolvedFrom);
    const end = view.coordsAtPos(resolvedEnd, -1);
    const top = Math.min(start.top, end.top);
    const bottom = Math.max(start.bottom, end.bottom);
    const left = Math.min(start.left, end.left);
    const right = Math.max(start.right, end.right);
    const width = right - left;
    const height = bottom - top;
    const x = left;
    const y = top;
    const data = {
        top,
        bottom,
        left,
        right,
        width,
        height,
        x,
        y,
    };
    return {
        ...data,
        toJSON: () => data,
    };
}

function canSetMark(state, tr, newMarkType) {
    var _a;
    const { selection } = tr;
    let cursor = null;
    if (isTextSelection(selection)) {
        cursor = selection.$cursor;
    }
    if (cursor) {
        const currentMarks = (_a = state.storedMarks) !== null && _a !== void 0 ? _a : cursor.marks();
        // There can be no current marks that exclude the new mark
        return (!!newMarkType.isInSet(currentMarks)
            || !currentMarks.some(mark => mark.type.excludes(newMarkType)));
    }
    const { ranges } = selection;
    return ranges.some(({ $from, $to }) => {
        let someNodeSupportsMark = $from.depth === 0
            ? state.doc.inlineContent && state.doc.type.allowsMarkType(newMarkType)
            : false;
        state.doc.nodesBetween($from.pos, $to.pos, (node, _pos, parent) => {
            // If we already found a mark that we can enable, return false to bypass the remaining search
            if (someNodeSupportsMark) {
                return false;
            }
            if (node.isInline) {
                const parentAllowsMarkType = !parent || parent.type.allowsMarkType(newMarkType);
                const currentMarksAllowMarkType = !!newMarkType.isInSet(node.marks)
                    || !node.marks.some(otherMark => otherMark.type.excludes(newMarkType));
                someNodeSupportsMark = parentAllowsMarkType && currentMarksAllowMarkType;
            }
            return !someNodeSupportsMark;
        });
        return someNodeSupportsMark;
    });
}
const setMark = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
    const { selection } = tr;
    const { empty, ranges } = selection;
    const type = getMarkType(typeOrName, state.schema);
    if (dispatch) {
        if (empty) {
            const oldAttributes = getMarkAttributes(state, type);
            tr.addStoredMark(type.create({
                ...oldAttributes,
                ...attributes,
            }));
        }
        else {
            ranges.forEach(range => {
                const from = range.$from.pos;
                const to = range.$to.pos;
                state.doc.nodesBetween(from, to, (node, pos) => {
                    const trimmedFrom = Math.max(pos, from);
                    const trimmedTo = Math.min(pos + node.nodeSize, to);
                    const someHasMark = node.marks.find(mark => mark.type === type);
                    // if there is already a mark of this type
                    // we know that we have to merge its attributes
                    // otherwise we add a fresh new mark
                    if (someHasMark) {
                        node.marks.forEach(mark => {
                            if (type === mark.type) {
                                tr.addMark(trimmedFrom, trimmedTo, type.create({
                                    ...mark.attrs,
                                    ...attributes,
                                }));
                            }
                        });
                    }
                    else {
                        tr.addMark(trimmedFrom, trimmedTo, type.create(attributes));
                    }
                });
            });
        }
    }
    return canSetMark(state, tr, type);
};

const setMeta = (key, value) => ({ tr }) => {
    tr.setMeta(key, value);
    return true;
};

const setNode = (typeOrName, attributes = {}) => ({ state, dispatch, chain }) => {
    const type = getNodeType(typeOrName, state.schema);
    // TODO: use a fallback like insertContent?
    if (!type.isTextblock) {
        console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.');
        return false;
    }
    return (chain()
        // try to convert node to default node if needed
        .command(({ commands }) => {
        const canSetBlock = setBlockType(type, attributes)(state);
        if (canSetBlock) {
            return true;
        }
        return commands.clearNodes();
    })
        .command(({ state: updatedState }) => {
        return setBlockType(type, attributes)(updatedState, dispatch);
    })
        .run());
};

const setNodeSelection = position => ({ tr, dispatch }) => {
    if (dispatch) {
        const { doc } = tr;
        const from = minMax(position, 0, doc.content.size);
        const selection = NodeSelection.create(doc, from);
        tr.setSelection(selection);
    }
    return true;
};

const setTextSelection = position => ({ tr, dispatch }) => {
    if (dispatch) {
        const { doc } = tr;
        const { from, to } = typeof position === 'number' ? { from: position, to: position } : position;
        const minPos = TextSelection.atStart(doc).from;
        const maxPos = TextSelection.atEnd(doc).to;
        const resolvedFrom = minMax(from, minPos, maxPos);
        const resolvedEnd = minMax(to, minPos, maxPos);
        const selection = TextSelection.create(doc, resolvedFrom, resolvedEnd);
        tr.setSelection(selection);
    }
    return true;
};

const sinkListItem = typeOrName => ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    return sinkListItem$1(type)(state, dispatch);
};

function ensureMarks(state, splittableMarks) {
    const marks = state.storedMarks || (state.selection.$to.parentOffset && state.selection.$from.marks());
    if (marks) {
        const filteredMarks = marks.filter(mark => splittableMarks === null || splittableMarks === void 0 ? void 0 : splittableMarks.includes(mark.type.name));
        state.tr.ensureMarks(filteredMarks);
    }
}
const splitBlock = ({ keepMarks = true } = {}) => ({ tr, state, dispatch, editor, }) => {
    const { selection, doc } = tr;
    const { $from, $to } = selection;
    const extensionAttributes = editor.extensionManager.attributes;
    const newAttributes = getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs);
    if (selection instanceof NodeSelection && selection.node.isBlock) {
        if (!$from.parentOffset || !canSplit(doc, $from.pos)) {
            return false;
        }
        if (dispatch) {
            if (keepMarks) {
                ensureMarks(state, editor.extensionManager.splittableMarks);
            }
            tr.split($from.pos).scrollIntoView();
        }
        return true;
    }
    if (!$from.parent.isBlock) {
        return false;
    }
    if (dispatch) {
        const atEnd = $to.parentOffset === $to.parent.content.size;
        if (selection instanceof TextSelection) {
            tr.deleteSelection();
        }
        const deflt = $from.depth === 0
            ? undefined
            : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
        let types = atEnd && deflt
            ? [
                {
                    type: deflt,
                    attrs: newAttributes,
                },
            ]
            : undefined;
        let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
        if (!types
            && !can
            && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : undefined)) {
            can = true;
            types = deflt
                ? [
                    {
                        type: deflt,
                        attrs: newAttributes,
                    },
                ]
                : undefined;
        }
        if (can) {
            tr.split(tr.mapping.map($from.pos), 1, types);
            if (deflt && !atEnd && !$from.parentOffset && $from.parent.type !== deflt) {
                const first = tr.mapping.map($from.before());
                const $first = tr.doc.resolve(first);
                if ($from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
                    tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
                }
            }
        }
        if (keepMarks) {
            ensureMarks(state, editor.extensionManager.splittableMarks);
        }
        tr.scrollIntoView();
    }
    return true;
};

const splitListItem = typeOrName => ({ tr, state, dispatch, editor, }) => {
    var _a;
    const type = getNodeType(typeOrName, state.schema);
    const { $from, $to } = state.selection;
    // @ts-ignore
    // eslint-disable-next-line
    const node = state.selection.node;
    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
        return false;
    }
    const grandParent = $from.node(-1);
    if (grandParent.type !== type) {
        return false;
    }
    const extensionAttributes = editor.extensionManager.attributes;
    if ($from.parent.content.size === 0 && $from.node(-1).childCount === $from.indexAfter(-1)) {
        // In an empty block. If this is a nested list, the wrapping
        // list item should be split. Otherwise, bail out and let next
        // command handle lifting.
        if ($from.depth === 2
            || $from.node(-3).type !== type
            || $from.index(-2) !== $from.node(-2).childCount - 1) {
            return false;
        }
        if (dispatch) {
            let wrap = Fragment.empty;
            // eslint-disable-next-line
            const depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
            // Build a fragment containing empty versions of the structure
            // from the outer list item to the parent node of the cursor
            for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d -= 1) {
                wrap = Fragment.from($from.node(d).copy(wrap));
            }
            // eslint-disable-next-line
            const depthAfter = $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3;
            // Add a second list item with an empty default start node
            const newNextTypeAttributes = getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs);
            const nextType = ((_a = type.contentMatch.defaultType) === null || _a === void 0 ? void 0 : _a.createAndFill(newNextTypeAttributes)) || undefined;
            wrap = wrap.append(Fragment.from(type.createAndFill(null, nextType) || undefined));
            const start = $from.before($from.depth - (depthBefore - 1));
            tr.replace(start, $from.after(-depthAfter), new Slice(wrap, 4 - depthBefore, 0));
            let sel = -1;
            tr.doc.nodesBetween(start, tr.doc.content.size, (n, pos) => {
                if (sel > -1) {
                    return false;
                }
                if (n.isTextblock && n.content.size === 0) {
                    sel = pos + 1;
                }
            });
            if (sel > -1) {
                tr.setSelection(TextSelection.near(tr.doc.resolve(sel)));
            }
            tr.scrollIntoView();
        }
        return true;
    }
    const nextType = $to.pos === $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
    const newTypeAttributes = getSplittedAttributes(extensionAttributes, grandParent.type.name, grandParent.attrs);
    const newNextTypeAttributes = getSplittedAttributes(extensionAttributes, $from.node().type.name, $from.node().attrs);
    tr.delete($from.pos, $to.pos);
    const types = nextType
        ? [
            { type, attrs: newTypeAttributes },
            { type: nextType, attrs: newNextTypeAttributes },
        ]
        : [{ type, attrs: newTypeAttributes }];
    if (!canSplit(tr.doc, $from.pos, 2)) {
        return false;
    }
    if (dispatch) {
        const { selection, storedMarks } = state;
        const { splittableMarks } = editor.extensionManager;
        const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks());
        tr.split($from.pos, 2, types).scrollIntoView();
        if (!marks || !dispatch) {
            return true;
        }
        const filteredMarks = marks.filter(mark => splittableMarks.includes(mark.type.name));
        tr.ensureMarks(filteredMarks);
    }
    return true;
};

const joinListBackwards = (tr, listType) => {
    const list = findParentNode(node => node.type === listType)(tr.selection);
    if (!list) {
        return true;
    }
    const before = tr.doc.resolve(Math.max(0, list.pos - 1)).before(list.depth);
    if (before === undefined) {
        return true;
    }
    const nodeBefore = tr.doc.nodeAt(before);
    const canJoinBackwards = list.node.type === (nodeBefore === null || nodeBefore === void 0 ? void 0 : nodeBefore.type) && canJoin(tr.doc, list.pos);
    if (!canJoinBackwards) {
        return true;
    }
    tr.join(list.pos);
    return true;
};
const joinListForwards = (tr, listType) => {
    const list = findParentNode(node => node.type === listType)(tr.selection);
    if (!list) {
        return true;
    }
    const after = tr.doc.resolve(list.start).after(list.depth);
    if (after === undefined) {
        return true;
    }
    const nodeAfter = tr.doc.nodeAt(after);
    const canJoinForwards = list.node.type === (nodeAfter === null || nodeAfter === void 0 ? void 0 : nodeAfter.type) && canJoin(tr.doc, after);
    if (!canJoinForwards) {
        return true;
    }
    tr.join(after);
    return true;
};
const toggleList = (listTypeOrName, itemTypeOrName, keepMarks) => ({ editor, tr, state, dispatch, chain, commands, can, }) => {
    const { extensions, splittableMarks } = editor.extensionManager;
    const listType = getNodeType(listTypeOrName, state.schema);
    const itemType = getNodeType(itemTypeOrName, state.schema);
    const { selection, storedMarks } = state;
    const { $from, $to } = selection;
    const range = $from.blockRange($to);
    const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks());
    if (!range) {
        return false;
    }
    const parentList = findParentNode(node => isList(node.type.name, extensions))(selection);
    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
        // remove list
        if (parentList.node.type === listType) {
            return commands.liftListItem(itemType);
        }
        // change list type
        if (isList(parentList.node.type.name, extensions)
            && listType.validContent(parentList.node.content)
            && dispatch) {
            return chain()
                .command(() => {
                tr.setNodeMarkup(parentList.pos, listType);
                return true;
            })
                .command(() => joinListBackwards(tr, listType))
                .command(() => joinListForwards(tr, listType))
                .run();
        }
    }
    if (!keepMarks || !marks || !dispatch) {
        return chain()
            // try to convert node to default node if needed
            .command(() => {
            const canWrapInList = can().wrapInList(listType);
            if (canWrapInList) {
                return true;
            }
            return commands.clearNodes();
        })
            .wrapInList(listType)
            .command(() => joinListBackwards(tr, listType))
            .command(() => joinListForwards(tr, listType))
            .run();
    }
    return (chain()
        // try to convert node to default node if needed
        .command(() => {
        const canWrapInList = can().wrapInList(listType);
        const filteredMarks = marks.filter(mark => splittableMarks.includes(mark.type.name));
        tr.ensureMarks(filteredMarks);
        if (canWrapInList) {
            return true;
        }
        return commands.clearNodes();
    })
        .wrapInList(listType)
        .command(() => joinListBackwards(tr, listType))
        .command(() => joinListForwards(tr, listType))
        .run());
};

const toggleMark = (typeOrName, attributes = {}, options = {}) => ({ state, commands }) => {
    const { extendEmptyMarkRange = false } = options;
    const type = getMarkType(typeOrName, state.schema);
    const isActive = isMarkActive(state, type, attributes);
    if (isActive) {
        return commands.unsetMark(type, { extendEmptyMarkRange });
    }
    return commands.setMark(type, attributes);
};

const toggleNode = (typeOrName, toggleTypeOrName, attributes = {}) => ({ state, commands }) => {
    const type = getNodeType(typeOrName, state.schema);
    const toggleType = getNodeType(toggleTypeOrName, state.schema);
    const isActive = isNodeActive(state, type, attributes);
    if (isActive) {
        return commands.setNode(toggleType);
    }
    return commands.setNode(type, attributes);
};

const toggleWrap = (typeOrName, attributes = {}) => ({ state, commands }) => {
    const type = getNodeType(typeOrName, state.schema);
    const isActive = isNodeActive(state, type, attributes);
    if (isActive) {
        return commands.lift(type);
    }
    return commands.wrapIn(type, attributes);
};

const undoInputRule = () => ({ state, dispatch }) => {
    const plugins = state.plugins;
    for (let i = 0; i < plugins.length; i += 1) {
        const plugin = plugins[i];
        let undoable;
        // @ts-ignore
        // eslint-disable-next-line
        if (plugin.spec.isInputRules && (undoable = plugin.getState(state))) {
            if (dispatch) {
                const tr = state.tr;
                const toUndo = undoable.transform;
                for (let j = toUndo.steps.length - 1; j >= 0; j -= 1) {
                    tr.step(toUndo.steps[j].invert(toUndo.docs[j]));
                }
                if (undoable.text) {
                    const marks = tr.doc.resolve(undoable.from).marks();
                    tr.replaceWith(undoable.from, undoable.to, state.schema.text(undoable.text, marks));
                }
                else {
                    tr.delete(undoable.from, undoable.to);
                }
            }
            return true;
        }
    }
    return false;
};

const unsetAllMarks = () => ({ tr, dispatch }) => {
    const { selection } = tr;
    const { empty, ranges } = selection;
    if (empty) {
        return true;
    }
    if (dispatch) {
        ranges.forEach(range => {
            tr.removeMark(range.$from.pos, range.$to.pos);
        });
    }
    return true;
};

const unsetMark = (typeOrName, options = {}) => ({ tr, state, dispatch }) => {
    var _a;
    const { extendEmptyMarkRange = false } = options;
    const { selection } = tr;
    const type = getMarkType(typeOrName, state.schema);
    const { $from, empty, ranges } = selection;
    if (!dispatch) {
        return true;
    }
    if (empty && extendEmptyMarkRange) {
        let { from, to } = selection;
        const attrs = (_a = $from.marks().find(mark => mark.type === type)) === null || _a === void 0 ? void 0 : _a.attrs;
        const range = getMarkRange($from, type, attrs);
        if (range) {
            from = range.from;
            to = range.to;
        }
        tr.removeMark(from, to, type);
    }
    else {
        ranges.forEach(range => {
            tr.removeMark(range.$from.pos, range.$to.pos, type);
        });
    }
    tr.removeStoredMark(type);
    return true;
};

const updateAttributes = (typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
    let nodeType = null;
    let markType = null;
    const schemaType = getSchemaTypeNameByName(typeof typeOrName === 'string' ? typeOrName : typeOrName.name, state.schema);
    if (!schemaType) {
        return false;
    }
    if (schemaType === 'node') {
        nodeType = getNodeType(typeOrName, state.schema);
    }
    if (schemaType === 'mark') {
        markType = getMarkType(typeOrName, state.schema);
    }
    if (dispatch) {
        tr.selection.ranges.forEach(range => {
            const from = range.$from.pos;
            const to = range.$to.pos;
            state.doc.nodesBetween(from, to, (node, pos) => {
                if (nodeType && nodeType === node.type) {
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        ...attributes,
                    });
                }
                if (markType && node.marks.length) {
                    node.marks.forEach(mark => {
                        if (markType === mark.type) {
                            const trimmedFrom = Math.max(pos, from);
                            const trimmedTo = Math.min(pos + node.nodeSize, to);
                            tr.addMark(trimmedFrom, trimmedTo, markType.create({
                                ...mark.attrs,
                                ...attributes,
                            }));
                        }
                    });
                }
            });
        });
    }
    return true;
};

const wrapIn = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    return wrapIn$1(type, attributes)(state, dispatch);
};

const wrapInList = (typeOrName, attributes = {}) => ({ state, dispatch }) => {
    const type = getNodeType(typeOrName, state.schema);
    return wrapInList$1(type, attributes)(state, dispatch);
};

var commands = /*#__PURE__*/Object.freeze({
  __proto__: null,
  blur: blur,
  clearContent: clearContent,
  clearNodes: clearNodes,
  command: command,
  createParagraphNear: createParagraphNear,
  deleteCurrentNode: deleteCurrentNode,
  deleteNode: deleteNode,
  deleteRange: deleteRange,
  deleteSelection: deleteSelection,
  enter: enter,
  exitCode: exitCode,
  extendMarkRange: extendMarkRange,
  first: first,
  focus: focus,
  forEach: forEach,
  insertContent: insertContent,
  insertContentAt: insertContentAt,
  joinUp: joinUp,
  joinDown: joinDown,
  joinBackward: joinBackward,
  joinForward: joinForward,
  keyboardShortcut: keyboardShortcut,
  lift: lift,
  liftEmptyBlock: liftEmptyBlock,
  liftListItem: liftListItem,
  newlineInCode: newlineInCode,
  resetAttributes: resetAttributes,
  scrollIntoView: scrollIntoView,
  selectAll: selectAll,
  selectNodeBackward: selectNodeBackward,
  selectNodeForward: selectNodeForward,
  selectParentNode: selectParentNode,
  selectTextblockEnd: selectTextblockEnd,
  selectTextblockStart: selectTextblockStart,
  setContent: setContent$1,
  setMark: setMark,
  setMeta: setMeta,
  setNode: setNode,
  setNodeSelection: setNodeSelection,
  setTextSelection: setTextSelection,
  sinkListItem: sinkListItem,
  splitBlock: splitBlock,
  splitListItem: splitListItem,
  toggleList: toggleList,
  toggleMark: toggleMark,
  toggleNode: toggleNode,
  toggleWrap: toggleWrap,
  undoInputRule: undoInputRule,
  unsetAllMarks: unsetAllMarks,
  unsetMark: unsetMark,
  updateAttributes: updateAttributes,
  wrapIn: wrapIn,
  wrapInList: wrapInList
});

const Commands = Extension.create({
    name: 'commands',
    addCommands() {
        return {
            ...commands,
        };
    },
});

const Editable = Extension.create({
    name: 'editable',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('editable'),
                props: {
                    editable: () => this.editor.options.editable,
                },
            }),
        ];
    },
});

const FocusEvents = Extension.create({
    name: 'focusEvents',
    addProseMirrorPlugins() {
        const { editor } = this;
        return [
            new Plugin({
                key: new PluginKey('focusEvents'),
                props: {
                    handleDOMEvents: {
                        focus: (view, event) => {
                            editor.isFocused = true;
                            const transaction = editor.state.tr
                                .setMeta('focus', { event })
                                .setMeta('addToHistory', false);
                            view.dispatch(transaction);
                            return false;
                        },
                        blur: (view, event) => {
                            editor.isFocused = false;
                            const transaction = editor.state.tr
                                .setMeta('blur', { event })
                                .setMeta('addToHistory', false);
                            view.dispatch(transaction);
                            return false;
                        },
                    },
                },
            }),
        ];
    },
});

const Keymap = Extension.create({
    name: 'keymap',
    addKeyboardShortcuts() {
        const handleBackspace = () => this.editor.commands.first(({ commands }) => [
            () => commands.undoInputRule(),
            // maybe convert first text block node to default node
            () => commands.command(({ tr }) => {
                const { selection, doc } = tr;
                const { empty, $anchor } = selection;
                const { pos, parent } = $anchor;
                const isAtStart = Selection.atStart(doc).from === pos;
                if (!empty || !isAtStart || !parent.type.isTextblock || parent.textContent.length) {
                    return false;
                }
                return commands.clearNodes();
            }),
            () => commands.deleteSelection(),
            () => commands.joinBackward(),
            () => commands.selectNodeBackward(),
        ]);
        const handleDelete = () => this.editor.commands.first(({ commands }) => [
            () => commands.deleteSelection(),
            () => commands.deleteCurrentNode(),
            () => commands.joinForward(),
            () => commands.selectNodeForward(),
        ]);
        const handleEnter = () => this.editor.commands.first(({ commands }) => [
            () => commands.newlineInCode(),
            () => commands.createParagraphNear(),
            () => commands.liftEmptyBlock(),
            () => commands.splitBlock(),
        ]);
        const baseKeymap = {
            Enter: handleEnter,
            'Mod-Enter': () => this.editor.commands.exitCode(),
            Backspace: handleBackspace,
            'Mod-Backspace': handleBackspace,
            'Shift-Backspace': handleBackspace,
            Delete: handleDelete,
            'Mod-Delete': handleDelete,
            'Mod-a': () => this.editor.commands.selectAll(),
        };
        const pcKeymap = {
            ...baseKeymap,
        };
        const macKeymap = {
            ...baseKeymap,
            'Ctrl-h': handleBackspace,
            'Alt-Backspace': handleBackspace,
            'Ctrl-d': handleDelete,
            'Ctrl-Alt-Backspace': handleDelete,
            'Alt-Delete': handleDelete,
            'Alt-d': handleDelete,
            'Ctrl-a': () => this.editor.commands.selectTextblockStart(),
            'Ctrl-e': () => this.editor.commands.selectTextblockEnd(),
        };
        if (isiOS() || isMacOS()) {
            return macKeymap;
        }
        return pcKeymap;
    },
    addProseMirrorPlugins() {
        return [
            // With this plugin we check if the whole document was selected and deleted.
            // In this case we will additionally call `clearNodes()` to convert e.g. a heading
            // to a paragraph if necessary.
            // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
            // with many other commands.
            new Plugin({
                key: new PluginKey('clearDocument'),
                appendTransaction: (transactions, oldState, newState) => {
                    const docChanges = transactions.some(transaction => transaction.docChanged)
                        && !oldState.doc.eq(newState.doc);
                    if (!docChanges) {
                        return;
                    }
                    const { empty, from, to } = oldState.selection;
                    const allFrom = Selection.atStart(oldState.doc).from;
                    const allEnd = Selection.atEnd(oldState.doc).to;
                    const allWasSelected = from === allFrom && to === allEnd;
                    const isEmpty = newState.doc.textBetween(0, newState.doc.content.size, ' ', ' ').length === 0;
                    if (empty || !allWasSelected || !isEmpty) {
                        return;
                    }
                    const tr = newState.tr;
                    const state = createChainableState({
                        state: newState,
                        transaction: tr,
                    });
                    const { commands } = new CommandManager({
                        editor: this.editor,
                        state,
                    });
                    commands.clearNodes();
                    if (!tr.steps.length) {
                        return;
                    }
                    return tr;
                },
            }),
        ];
    },
});

const Tabindex = Extension.create({
    name: 'tabindex',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('tabindex'),
                props: {
                    attributes: this.editor.isEditable ? { tabindex: '0' } : {},
                },
            }),
        ];
    },
});

var extensions = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ClipboardTextSerializer: ClipboardTextSerializer,
  Commands: Commands,
  Editable: Editable,
  FocusEvents: FocusEvents,
  Keymap: Keymap,
  Tabindex: Tabindex
});

const style = `.ProseMirror {
  position: relative;
}

.ProseMirror {
  word-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0; /* the above doesn't seem to work in Edge */
}

.ProseMirror [contenteditable="false"] {
  white-space: normal;
}

.ProseMirror [contenteditable="false"] [contenteditable="true"] {
  white-space: pre-wrap;
}

.ProseMirror pre {
  white-space: pre-wrap;
}

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
  width: 1px !important;
  height: 1px !important;
}

.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: absolute;
  margin: 0;
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 1px solid black;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}

.ProseMirror-hideselection *::selection {
  background: transparent;
}

.ProseMirror-hideselection *::-moz-selection {
  background: transparent;
}

.ProseMirror-hideselection * {
  caret-color: transparent;
}

.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}

.tippy-box[data-animation=fade][data-state=hidden] {
  opacity: 0
}`;

function createStyleTag(style, nonce) {
    const tipTapStyleTag = document.querySelector('style[data-tiptap-style]');
    if (tipTapStyleTag !== null) {
        return tipTapStyleTag;
    }
    const styleNode = document.createElement('style');
    if (nonce) {
        styleNode.setAttribute('nonce', nonce);
    }
    styleNode.setAttribute('data-tiptap-style', '');
    styleNode.innerHTML = style;
    document.getElementsByTagName('head')[0].appendChild(styleNode);
    return styleNode;
}

let Editor$1 = class Editor extends EventEmitter {
    constructor(options = {}) {
        super();
        this.isFocused = false;
        this.extensionStorage = {};
        this.options = {
            element: document.createElement('div'),
            content: '',
            injectCSS: true,
            injectNonce: undefined,
            extensions: [],
            autofocus: false,
            editable: true,
            editorProps: {},
            parseOptions: {},
            enableInputRules: true,
            enablePasteRules: true,
            enableCoreExtensions: true,
            onBeforeCreate: () => null,
            onCreate: () => null,
            onUpdate: () => null,
            onSelectionUpdate: () => null,
            onTransaction: () => null,
            onFocus: () => null,
            onBlur: () => null,
            onDestroy: () => null,
        };
        this.isCapturingTransaction = false;
        this.capturedTransaction = null;
        this.setOptions(options);
        this.createExtensionManager();
        this.createCommandManager();
        this.createSchema();
        this.on('beforeCreate', this.options.onBeforeCreate);
        this.emit('beforeCreate', { editor: this });
        this.createView();
        this.injectCSS();
        this.on('create', this.options.onCreate);
        this.on('update', this.options.onUpdate);
        this.on('selectionUpdate', this.options.onSelectionUpdate);
        this.on('transaction', this.options.onTransaction);
        this.on('focus', this.options.onFocus);
        this.on('blur', this.options.onBlur);
        this.on('destroy', this.options.onDestroy);
        window.setTimeout(() => {
            if (this.isDestroyed) {
                return;
            }
            this.commands.focus(this.options.autofocus);
            this.emit('create', { editor: this });
        }, 0);
    }
    /**
     * Returns the editor storage.
     */
    get storage() {
        return this.extensionStorage;
    }
    /**
     * An object of all registered commands.
     */
    get commands() {
        return this.commandManager.commands;
    }
    /**
     * Create a command chain to call multiple commands at once.
     */
    chain() {
        return this.commandManager.chain();
    }
    /**
     * Check if a command or a command chain can be executed. Without executing it.
     */
    can() {
        return this.commandManager.can();
    }
    /**
     * Inject CSS styles.
     */
    injectCSS() {
        if (this.options.injectCSS && document) {
            this.css = createStyleTag(style, this.options.injectNonce);
        }
    }
    /**
     * Update editor options.
     *
     * @param options A list of options
     */
    setOptions(options = {}) {
        this.options = {
            ...this.options,
            ...options,
        };
        if (!this.view || !this.state || this.isDestroyed) {
            return;
        }
        if (this.options.editorProps) {
            this.view.setProps(this.options.editorProps);
        }
        this.view.updateState(this.state);
    }
    /**
     * Update editable state of the editor.
     */
    setEditable(editable, emitUpdate = true) {
        this.setOptions({ editable });
        if (emitUpdate) {
            this.emit('update', { editor: this, transaction: this.state.tr });
        }
    }
    /**
     * Returns whether the editor is editable.
     */
    get isEditable() {
        // since plugins are applied after creating the view
        // `editable` is always `true` for one tick.
        // that’s why we also have to check for `options.editable`
        return this.options.editable && this.view && this.view.editable;
    }
    /**
     * Returns the editor state.
     */
    get state() {
        return this.view.state;
    }
    /**
     * Register a ProseMirror plugin.
     *
     * @param plugin A ProseMirror plugin
     * @param handlePlugins Control how to merge the plugin into the existing plugins.
     */
    registerPlugin(plugin, handlePlugins) {
        const plugins = isFunction(handlePlugins)
            ? handlePlugins(plugin, [...this.state.plugins])
            : [...this.state.plugins, plugin];
        const state = this.state.reconfigure({ plugins });
        this.view.updateState(state);
    }
    /**
     * Unregister a ProseMirror plugin.
     *
     * @param nameOrPluginKey The plugins name
     */
    unregisterPlugin(nameOrPluginKey) {
        if (this.isDestroyed) {
            return;
        }
        // @ts-ignore
        const name = typeof nameOrPluginKey === 'string' ? `${nameOrPluginKey}$` : nameOrPluginKey.key;
        const state = this.state.reconfigure({
            // @ts-ignore
            plugins: this.state.plugins.filter(plugin => !plugin.key.startsWith(name)),
        });
        this.view.updateState(state);
    }
    /**
     * Creates an extension manager.
     */
    createExtensionManager() {
        const coreExtensions = this.options.enableCoreExtensions ? Object.values(extensions) : [];
        const allExtensions = [...coreExtensions, ...this.options.extensions].filter(extension => {
            return ['extension', 'node', 'mark'].includes(extension === null || extension === void 0 ? void 0 : extension.type);
        });
        this.extensionManager = new ExtensionManager(allExtensions, this);
    }
    /**
     * Creates an command manager.
     */
    createCommandManager() {
        this.commandManager = new CommandManager({
            editor: this,
        });
    }
    /**
     * Creates a ProseMirror schema.
     */
    createSchema() {
        this.schema = this.extensionManager.schema;
    }
    /**
     * Creates a ProseMirror view.
     */
    createView() {
        const doc = createDocument(this.options.content, this.schema, this.options.parseOptions);
        const selection = resolveFocusPosition(doc, this.options.autofocus);
        this.view = new EditorView(this.options.element, {
            ...this.options.editorProps,
            dispatchTransaction: this.dispatchTransaction.bind(this),
            state: EditorState.create({
                doc,
                selection: selection || undefined,
            }),
        });
        // `editor.view` is not yet available at this time.
        // Therefore we will add all plugins and node views directly afterwards.
        const newState = this.state.reconfigure({
            plugins: this.extensionManager.plugins,
        });
        this.view.updateState(newState);
        this.createNodeViews();
        // Let’s store the editor instance in the DOM element.
        // So we’ll have access to it for tests.
        const dom = this.view.dom;
        dom.editor = this;
    }
    /**
     * Creates all node views.
     */
    createNodeViews() {
        this.view.setProps({
            nodeViews: this.extensionManager.nodeViews,
        });
    }
    captureTransaction(fn) {
        this.isCapturingTransaction = true;
        fn();
        this.isCapturingTransaction = false;
        const tr = this.capturedTransaction;
        this.capturedTransaction = null;
        return tr;
    }
    /**
     * The callback over which to send transactions (state updates) produced by the view.
     *
     * @param transaction An editor state transaction
     */
    dispatchTransaction(transaction) {
        // if the editor / the view of the editor was destroyed
        // the transaction should not be dispatched as there is no view anymore.
        if (this.view.isDestroyed) {
            return;
        }
        if (this.isCapturingTransaction) {
            if (!this.capturedTransaction) {
                this.capturedTransaction = transaction;
                return;
            }
            transaction.steps.forEach(step => { var _a; return (_a = this.capturedTransaction) === null || _a === void 0 ? void 0 : _a.step(step); });
            return;
        }
        const state = this.state.apply(transaction);
        const selectionHasChanged = !this.state.selection.eq(state.selection);
        this.view.updateState(state);
        this.emit('transaction', {
            editor: this,
            transaction,
        });
        if (selectionHasChanged) {
            this.emit('selectionUpdate', {
                editor: this,
                transaction,
            });
        }
        const focus = transaction.getMeta('focus');
        const blur = transaction.getMeta('blur');
        if (focus) {
            this.emit('focus', {
                editor: this,
                event: focus.event,
                transaction,
            });
        }
        if (blur) {
            this.emit('blur', {
                editor: this,
                event: blur.event,
                transaction,
            });
        }
        if (!transaction.docChanged || transaction.getMeta('preventUpdate')) {
            return;
        }
        this.emit('update', {
            editor: this,
            transaction,
        });
    }
    /**
     * Get attributes of the currently selected node or mark.
     */
    getAttributes(nameOrType) {
        return getAttributes(this.state, nameOrType);
    }
    isActive(nameOrAttributes, attributesOrUndefined) {
        const name = typeof nameOrAttributes === 'string' ? nameOrAttributes : null;
        const attributes = typeof nameOrAttributes === 'string' ? attributesOrUndefined : nameOrAttributes;
        return isActive(this.state, name, attributes);
    }
    /**
     * Get the document as JSON.
     */
    getJSON() {
        return this.state.doc.toJSON();
    }
    /**
     * Get the document as HTML.
     */
    getHTML() {
        return getHTMLFromFragment(this.state.doc.content, this.schema);
    }
    /**
     * Get the document as text.
     */
    getText(options) {
        const { blockSeparator = '\n\n', textSerializers = {} } = options || {};
        return getText(this.state.doc, {
            blockSeparator,
            textSerializers: {
                ...getTextSerializersFromSchema(this.schema),
                ...textSerializers,
            },
        });
    }
    /**
     * Check if there is no content.
     */
    get isEmpty() {
        return isNodeEmpty(this.state.doc);
    }
    /**
     * Get the number of characters for the current document.
     *
     * @deprecated
     */
    getCharacterCount() {
        console.warn('[tiptap warn]: "editor.getCharacterCount()" is deprecated. Please use "editor.storage.characterCount.characters()" instead.');
        return this.state.doc.content.size - 2;
    }
    /**
     * Destroy the editor.
     */
    destroy() {
        this.emit('destroy');
        if (this.view) {
            this.view.destroy();
        }
        this.removeAllListeners();
    }
    /**
     * Check if the editor is already destroyed.
     */
    get isDestroyed() {
        var _a;
        // @ts-ignore
        return !((_a = this.view) === null || _a === void 0 ? void 0 : _a.docView);
    }
};

/**
 * Build an input rule that adds a mark when the
 * matched text is typed into it.
 */
function markInputRule(config) {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            const attributes = callOrReturn(config.getAttributes, undefined, match);
            if (attributes === false || attributes === null) {
                return null;
            }
            const { tr } = state;
            const captureGroup = match[match.length - 1];
            const fullMatch = match[0];
            let markEnd = range.to;
            if (captureGroup) {
                const startSpaces = fullMatch.search(/\S/);
                const textStart = range.from + fullMatch.indexOf(captureGroup);
                const textEnd = textStart + captureGroup.length;
                const excludedMarks = getMarksBetween(range.from, range.to, state.doc)
                    .filter(item => {
                    // @ts-ignore
                    const excluded = item.mark.type.excluded;
                    return excluded.find(type => type === config.type && type !== item.mark.type);
                })
                    .filter(item => item.to > textStart);
                if (excludedMarks.length) {
                    return null;
                }
                if (textEnd < range.to) {
                    tr.delete(textEnd, range.to);
                }
                if (textStart > range.from) {
                    tr.delete(range.from + startSpaces, textStart);
                }
                markEnd = range.from + startSpaces + captureGroup.length;
                tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}));
                tr.removeStoredMark(config.type);
            }
        },
    });
}

/**
 * Build an input rule that adds a node when the
 * matched text is typed into it.
 */
function nodeInputRule(config) {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            const attributes = callOrReturn(config.getAttributes, undefined, match) || {};
            const { tr } = state;
            const start = range.from;
            let end = range.to;
            if (match[1]) {
                const offset = match[0].lastIndexOf(match[1]);
                let matchStart = start + offset;
                if (matchStart > end) {
                    matchStart = end;
                }
                else {
                    end = matchStart + match[1].length;
                }
                // insert last typed character
                const lastChar = match[0][match[0].length - 1];
                tr.insertText(lastChar, start + match[0].length - 1);
                // insert node from input rule
                tr.replaceWith(matchStart, end, config.type.create(attributes));
            }
            else if (match[0]) {
                tr.replaceWith(start, end, config.type.create(attributes));
            }
        },
    });
}

/**
 * Build an input rule that changes the type of a textblock when the
 * matched text is typed into it. When using a regular expresion you’ll
 * probably want the regexp to start with `^`, so that the pattern can
 * only occur at the start of a textblock.
 */
function textblockTypeInputRule(config) {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            const $start = state.doc.resolve(range.from);
            const attributes = callOrReturn(config.getAttributes, undefined, match) || {};
            if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), config.type)) {
                return null;
            }
            state.tr
                .delete(range.from, range.to)
                .setBlockType(range.from, range.from, config.type, attributes);
        },
    });
}

/**
 * Build an input rule that replaces text when the
 * matched text is typed into it.
 */
function textInputRule(config) {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            let insert = config.replace;
            let start = range.from;
            const end = range.to;
            if (match[1]) {
                const offset = match[0].lastIndexOf(match[1]);
                insert += match[0].slice(offset + match[1].length);
                start += offset;
                const cutOff = start - end;
                if (cutOff > 0) {
                    insert = match[0].slice(offset - cutOff, offset) + insert;
                    start = end;
                }
            }
            state.tr.insertText(insert, start, end);
        },
    });
}

/**
 * Build an input rule for automatically wrapping a textblock when a
 * given string is typed. When using a regular expresion you’ll
 * probably want the regexp to start with `^`, so that the pattern can
 * only occur at the start of a textblock.
 *
 * `type` is the type of node to wrap in.
 *
 * By default, if there’s a node with the same type above the newly
 * wrapped node, the rule will try to join those
 * two nodes. You can pass a join predicate, which takes a regular
 * expression match and the node before the wrapped node, and can
 * return a boolean to indicate whether a join should happen.
 */
function wrappingInputRule(config) {
    return new InputRule({
        find: config.find,
        handler: ({ state, range, match, chain, }) => {
            const attributes = callOrReturn(config.getAttributes, undefined, match) || {};
            const tr = state.tr.delete(range.from, range.to);
            const $start = tr.doc.resolve(range.from);
            const blockRange = $start.blockRange();
            const wrapping = blockRange && findWrapping(blockRange, config.type, attributes);
            if (!wrapping) {
                return null;
            }
            tr.wrap(blockRange, wrapping);
            if (config.keepMarks && config.editor) {
                const { selection, storedMarks } = state;
                const { splittableMarks } = config.editor.extensionManager;
                const marks = storedMarks || (selection.$to.parentOffset && selection.$from.marks());
                if (marks) {
                    const filteredMarks = marks.filter(mark => splittableMarks.includes(mark.type.name));
                    tr.ensureMarks(filteredMarks);
                }
            }
            if (config.keepAttributes) {
                /** If the nodeType is `bulletList` or `orderedList` set the `nodeType` as `listItem` */
                const nodeType = config.type.name === 'bulletList' || config.type.name === 'orderedList' ? 'listItem' : 'taskList';
                chain().updateAttributes(nodeType, attributes).run();
            }
            const before = tr.doc.resolve(range.from - 1).nodeBefore;
            if (before
                && before.type === config.type
                && canJoin(tr.doc, range.from - 1)
                && (!config.joinPredicate || config.joinPredicate(match, before))) {
                tr.join(range.from - 1);
            }
        },
    });
}

class Mark {
    constructor(config = {}) {
        this.type = 'mark';
        this.name = 'mark';
        this.parent = null;
        this.child = null;
        this.config = {
            name: this.name,
            defaultOptions: {},
        };
        this.config = {
            ...this.config,
            ...config,
        };
        this.name = this.config.name;
        if (config.defaultOptions) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`);
        }
        // TODO: remove `addOptions` fallback
        this.options = this.config.defaultOptions;
        if (this.config.addOptions) {
            this.options = callOrReturn(getExtensionField(this, 'addOptions', {
                name: this.name,
            }));
        }
        this.storage = callOrReturn(getExtensionField(this, 'addStorage', {
            name: this.name,
            options: this.options,
        })) || {};
    }
    static create(config = {}) {
        return new Mark(config);
    }
    configure(options = {}) {
        // return a new instance so we can use the same extension
        // with different calls of `configure`
        const extension = this.extend();
        extension.options = mergeDeep(this.options, options);
        extension.storage = callOrReturn(getExtensionField(extension, 'addStorage', {
            name: extension.name,
            options: extension.options,
        }));
        return extension;
    }
    extend(extendedConfig = {}) {
        const extension = new Mark(extendedConfig);
        extension.parent = this;
        this.child = extension;
        extension.name = extendedConfig.name ? extendedConfig.name : extension.parent.name;
        if (extendedConfig.defaultOptions) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`);
        }
        extension.options = callOrReturn(getExtensionField(extension, 'addOptions', {
            name: extension.name,
        }));
        extension.storage = callOrReturn(getExtensionField(extension, 'addStorage', {
            name: extension.name,
            options: extension.options,
        }));
        return extension;
    }
    static handleExit({ editor, mark }) {
        const { tr } = editor.state;
        const currentPos = editor.state.selection.$from;
        const isAtEnd = currentPos.pos === currentPos.end();
        if (isAtEnd) {
            const currentMarks = currentPos.marks();
            const isInMark = !!currentMarks.find(m => (m === null || m === void 0 ? void 0 : m.type.name) === mark.name);
            if (!isInMark) {
                return false;
            }
            const removeMark = currentMarks.find(m => (m === null || m === void 0 ? void 0 : m.type.name) === mark.name);
            if (removeMark) {
                tr.removeStoredMark(removeMark);
            }
            tr.insertText(' ', currentPos.pos);
            editor.view.dispatch(tr);
            return true;
        }
        return false;
    }
}

class Node {
    constructor(config = {}) {
        this.type = 'node';
        this.name = 'node';
        this.parent = null;
        this.child = null;
        this.config = {
            name: this.name,
            defaultOptions: {},
        };
        this.config = {
            ...this.config,
            ...config,
        };
        this.name = this.config.name;
        if (config.defaultOptions) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`);
        }
        // TODO: remove `addOptions` fallback
        this.options = this.config.defaultOptions;
        if (this.config.addOptions) {
            this.options = callOrReturn(getExtensionField(this, 'addOptions', {
                name: this.name,
            }));
        }
        this.storage = callOrReturn(getExtensionField(this, 'addStorage', {
            name: this.name,
            options: this.options,
        })) || {};
    }
    static create(config = {}) {
        return new Node(config);
    }
    configure(options = {}) {
        // return a new instance so we can use the same extension
        // with different calls of `configure`
        const extension = this.extend();
        extension.options = mergeDeep(this.options, options);
        extension.storage = callOrReturn(getExtensionField(extension, 'addStorage', {
            name: extension.name,
            options: extension.options,
        }));
        return extension;
    }
    extend(extendedConfig = {}) {
        const extension = new Node(extendedConfig);
        extension.parent = this;
        this.child = extension;
        extension.name = extendedConfig.name ? extendedConfig.name : extension.parent.name;
        if (extendedConfig.defaultOptions) {
            console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`);
        }
        extension.options = callOrReturn(getExtensionField(extension, 'addOptions', {
            name: extension.name,
        }));
        extension.storage = callOrReturn(getExtensionField(extension, 'addStorage', {
            name: extension.name,
            options: extension.options,
        }));
        return extension;
    }
}

class NodeView {
    constructor(component, props, options) {
        this.isDragging = false;
        this.component = component;
        this.editor = props.editor;
        this.options = {
            stopEvent: null,
            ignoreMutation: null,
            ...options,
        };
        this.extension = props.extension;
        this.node = props.node;
        this.decorations = props.decorations;
        this.getPos = props.getPos;
        this.mount();
    }
    mount() {
        // eslint-disable-next-line
        return;
    }
    get dom() {
        return this.editor.view.dom;
    }
    get contentDOM() {
        return null;
    }
    onDragStart(event) {
        var _a, _b, _c, _d, _e, _f, _g;
        const { view } = this.editor;
        const target = event.target;
        // get the drag handle element
        // `closest` is not available for text nodes so we may have to use its parent
        const dragHandle = target.nodeType === 3
            ? (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.closest('[data-drag-handle]')
            : target.closest('[data-drag-handle]');
        if (!this.dom || ((_b = this.contentDOM) === null || _b === void 0 ? void 0 : _b.contains(target)) || !dragHandle) {
            return;
        }
        let x = 0;
        let y = 0;
        // calculate offset for drag element if we use a different drag handle element
        if (this.dom !== dragHandle) {
            const domBox = this.dom.getBoundingClientRect();
            const handleBox = dragHandle.getBoundingClientRect();
            // In React, we have to go through nativeEvent to reach offsetX/offsetY.
            const offsetX = (_c = event.offsetX) !== null && _c !== void 0 ? _c : (_d = event.nativeEvent) === null || _d === void 0 ? void 0 : _d.offsetX;
            const offsetY = (_e = event.offsetY) !== null && _e !== void 0 ? _e : (_f = event.nativeEvent) === null || _f === void 0 ? void 0 : _f.offsetY;
            x = handleBox.x - domBox.x + offsetX;
            y = handleBox.y - domBox.y + offsetY;
        }
        (_g = event.dataTransfer) === null || _g === void 0 ? void 0 : _g.setDragImage(this.dom, x, y);
        // we need to tell ProseMirror that we want to move the whole node
        // so we create a NodeSelection
        const selection = NodeSelection.create(view.state.doc, this.getPos());
        const transaction = view.state.tr.setSelection(selection);
        view.dispatch(transaction);
    }
    stopEvent(event) {
        var _a;
        if (!this.dom) {
            return false;
        }
        if (typeof this.options.stopEvent === 'function') {
            return this.options.stopEvent({ event });
        }
        const target = event.target;
        const isInElement = this.dom.contains(target) && !((_a = this.contentDOM) === null || _a === void 0 ? void 0 : _a.contains(target));
        // any event from child nodes should be handled by ProseMirror
        if (!isInElement) {
            return false;
        }
        const isDragEvent = event.type.startsWith('drag');
        const isDropEvent = event.type === 'drop';
        const isInput = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
        // any input event within node views should be ignored by ProseMirror
        if (isInput && !isDropEvent && !isDragEvent) {
            return true;
        }
        const { isEditable } = this.editor;
        const { isDragging } = this;
        const isDraggable = !!this.node.type.spec.draggable;
        const isSelectable = NodeSelection.isSelectable(this.node);
        const isCopyEvent = event.type === 'copy';
        const isPasteEvent = event.type === 'paste';
        const isCutEvent = event.type === 'cut';
        const isClickEvent = event.type === 'mousedown';
        // ProseMirror tries to drag selectable nodes
        // even if `draggable` is set to `false`
        // this fix prevents that
        if (!isDraggable && isSelectable && isDragEvent) {
            event.preventDefault();
        }
        if (isDraggable && isDragEvent && !isDragging) {
            event.preventDefault();
            return false;
        }
        // we have to store that dragging started
        if (isDraggable && isEditable && !isDragging && isClickEvent) {
            const dragHandle = target.closest('[data-drag-handle]');
            const isValidDragHandle = dragHandle && (this.dom === dragHandle || this.dom.contains(dragHandle));
            if (isValidDragHandle) {
                this.isDragging = true;
                document.addEventListener('dragend', () => {
                    this.isDragging = false;
                }, { once: true });
                document.addEventListener('drop', () => {
                    this.isDragging = false;
                }, { once: true });
                document.addEventListener('mouseup', () => {
                    this.isDragging = false;
                }, { once: true });
            }
        }
        // these events are handled by prosemirror
        if (isDragging
            || isDropEvent
            || isCopyEvent
            || isPasteEvent
            || isCutEvent
            || (isClickEvent && isSelectable)) {
            return false;
        }
        return true;
    }
    ignoreMutation(mutation) {
        if (!this.dom || !this.contentDOM) {
            return true;
        }
        if (typeof this.options.ignoreMutation === 'function') {
            return this.options.ignoreMutation({ mutation });
        }
        // a leaf/atom node is like a black box for ProseMirror
        // and should be fully handled by the node view
        if (this.node.isLeaf || this.node.isAtom) {
            return true;
        }
        // ProseMirror should handle any selections
        if (mutation.type === 'selection') {
            return false;
        }
        // try to prevent a bug on iOS that will break node views on enter
        // this is because ProseMirror can’t preventDispatch on enter
        // this will lead to a re-render of the node view on enter
        // see: https://github.com/ueberdosis/tiptap/issues/1214
        if (this.dom.contains(mutation.target)
            && mutation.type === 'childList'
            && isiOS()
            && this.editor.isFocused) {
            const changedNodes = [
                ...Array.from(mutation.addedNodes),
                ...Array.from(mutation.removedNodes),
            ];
            // we’ll check if every changed node is contentEditable
            // to make sure it’s probably mutated by ProseMirror
            if (changedNodes.every(node => node.isContentEditable)) {
                return false;
            }
        }
        // we will allow mutation contentDOM with attributes
        // so we can for example adding classes within our node view
        if (this.contentDOM === mutation.target && mutation.type === 'attributes') {
            return true;
        }
        // ProseMirror should handle any changes within contentDOM
        if (this.contentDOM.contains(mutation.target)) {
            return false;
        }
        return true;
    }
    updateAttributes(attributes) {
        this.editor.commands.command(({ tr }) => {
            const pos = this.getPos();
            tr.setNodeMarkup(pos, undefined, {
                ...this.node.attrs,
                ...attributes,
            });
            return true;
        });
    }
    deleteNode() {
        const from = this.getPos();
        const to = from + this.node.nodeSize;
        this.editor.commands.deleteRange({ from, to });
    }
}

/**
 * Build an paste rule that adds a mark when the
 * matched text is pasted into it.
 */
function markPasteRule(config) {
    return new PasteRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            const attributes = callOrReturn(config.getAttributes, undefined, match);
            if (attributes === false || attributes === null) {
                return null;
            }
            const { tr } = state;
            const captureGroup = match[match.length - 1];
            const fullMatch = match[0];
            let markEnd = range.to;
            if (captureGroup) {
                const startSpaces = fullMatch.search(/\S/);
                const textStart = range.from + fullMatch.indexOf(captureGroup);
                const textEnd = textStart + captureGroup.length;
                const excludedMarks = getMarksBetween(range.from, range.to, state.doc)
                    .filter(item => {
                    // @ts-ignore
                    const excluded = item.mark.type.excluded;
                    return excluded.find(type => type === config.type && type !== item.mark.type);
                })
                    .filter(item => item.to > textStart);
                if (excludedMarks.length) {
                    return null;
                }
                if (textEnd < range.to) {
                    tr.delete(textEnd, range.to);
                }
                if (textStart > range.from) {
                    tr.delete(range.from + startSpaces, textStart);
                }
                markEnd = range.from + startSpaces + captureGroup.length;
                tr.addMark(range.from + startSpaces, markEnd, config.type.create(attributes || {}));
                tr.removeStoredMark(config.type);
            }
        },
    });
}

// source: https://stackoverflow.com/a/6969486
function escapeForRegEx(string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function isString(value) {
    return typeof value === 'string';
}

/**
 * Build an paste rule that adds a node when the
 * matched text is pasted into it.
 */
function nodePasteRule(config) {
    return new PasteRule({
        find: config.find,
        handler({ match, chain, range }) {
            const attributes = callOrReturn(config.getAttributes, undefined, match);
            if (attributes === false || attributes === null) {
                return null;
            }
            if (match.input) {
                chain().deleteRange(range).insertContentAt(range.from, {
                    type: config.type.name,
                    attrs: attributes,
                });
            }
        },
    });
}

/**
 * Build an paste rule that replaces text when the
 * matched text is pasted into it.
 */
function textPasteRule(config) {
    return new PasteRule({
        find: config.find,
        handler: ({ state, range, match }) => {
            let insert = config.replace;
            let start = range.from;
            const end = range.to;
            if (match[1]) {
                const offset = match[0].lastIndexOf(match[1]);
                insert += match[0].slice(offset + match[1].length);
                start += offset;
                const cutOff = start - end;
                if (cutOff > 0) {
                    insert = match[0].slice(offset - cutOff, offset) + insert;
                    start = end;
                }
            }
            state.tr.insertText(insert, start, end);
        },
    });
}

class Tracker {
    constructor(transaction) {
        this.transaction = transaction;
        this.currentStep = this.transaction.steps.length;
    }
    map(position) {
        let deleted = false;
        const mappedPosition = this.transaction.steps
            .slice(this.currentStep)
            .reduce((newPosition, step) => {
            const mapResult = step.getMap().mapResult(newPosition);
            if (mapResult.deleted) {
                deleted = true;
            }
            return mapResult.pos;
        }, position);
        return {
            position: mappedPosition,
            deleted,
        };
    }
}

var top = 'top';
var bottom = 'bottom';
var right = 'right';
var left = 'left';
var auto = 'auto';
var basePlacements = [top, bottom, right, left];
var start = 'start';
var end = 'end';
var clippingParents = 'clippingParents';
var viewport = 'viewport';
var popper = 'popper';
var reference = 'reference';
var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []); // modifiers that need to read the DOM

var beforeRead = 'beforeRead';
var read = 'read';
var afterRead = 'afterRead'; // pure-logic modifiers

var beforeMain = 'beforeMain';
var main = 'main';
var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

var beforeWrite = 'beforeWrite';
var write = 'write';
var afterWrite = 'afterWrite';
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getWindow(node) {
  if (node == null) {
    return window;
  }

  if (node.toString() !== '[object Window]') {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
}

function isElement$1(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// and applies them to the HTMLElements such as popper and arrow

function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function (name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name]; // arrow is optional + virtual elements

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    } // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]


    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];

      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: '0',
      top: '0',
      margin: '0'
    },
    arrow: {
      position: 'absolute'
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(function (name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

      var style = styleProperties.reduce(function (style, property) {
        style[property] = '';
        return style;
      }, {}); // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
} // eslint-disable-next-line import/no-unused-modules


var applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$2,
  requires: ['computeStyles']
};

function getBasePlacement$1(placement) {
  return placement.split('-')[0];
}

var max = Math.max;
var min = Math.min;
var round = Math.round;

function getUAString() {
  var uaData = navigator.userAgentData;

  if (uaData != null && uaData.brands) {
    return uaData.brands.map(function (item) {
      return item.brand + "/" + item.version;
    }).join(' ');
  }

  return navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }

  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }

  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;

  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }

  var _ref = isElement$1(element) ? getWindow(element) : window,
      visualViewport = _ref.visualViewport;

  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width: width,
    height: height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x: x,
    y: y
  };
}

// means it doesn't take into account transforms.

function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
  // Fixes https://github.com/popperjs/popper-core/issues/1223

  var width = element.offsetWidth;
  var height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }

  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: width,
    height: height
  };
}

function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

  if (parent.contains(child)) {
    return true;
  } // then fallback to custom implementation with Shadow DOM support
  else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...


        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false


  return false;
}

function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getDocumentElement(element) {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return ((isElement$1(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
  element.document) || window.document).documentElement;
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || ( // DOM Element detected
    isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element) // fallback

  );
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle$1(element).position === 'fixed') {
    return null;
  }

  return element.offsetParent;
} // `.offsetParent` reports `null` for fixed elements, while absolute elements
// return the containing block


function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
    var elementCss = getComputedStyle$1(element);

    if (elementCss.position === 'fixed') {
      return null;
    }
  }

  var currentNode = getParentNode(element);

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return null;
} // Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.


function getOffsetParent(element) {
  var window = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
}

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}

function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce(function (hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

var toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow$1(_ref) {
  var _state$modifiersData$;

  var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement$1(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === 'y' ? top : left;
  var maxProp = axis === 'y' ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  var min = paddingObject[minProp];
  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect$1(_ref2) {
  var state = _ref2.state,
      options = _ref2.options;
  var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    if (!isHTMLElement(arrowElement)) {
      console.error(['Popper: "arrow" element must be an HTMLElement (not an SVGElement).', 'To use an SVG arrow, wrap it in an HTMLElement that will be used as', 'the arrow.'].join(' '));
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', 'element.'].join(' '));
    }

    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


var arrow$2 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow$1,
  effect: effect$1,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getVariation(placement) {
  return placement.split('-')[1];
}

var unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
}; // Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.

function roundOffsetsByDPR(_ref) {
  var x = _ref.x,
      y = _ref.y;
  var win = window;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles(_ref2) {
  var _Object$assign2;

  var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;

  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty('x');
  var hasY = offsets.hasOwnProperty('y');
  var sideX = left;
  var sideY = top;
  var win = window;

  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = 'clientHeight';
    var widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


    offsetParent = offsetParent;

    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
      offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
      offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  var commonStyles = Object.assign({
    position: position
  }, adaptive && unsetSides);

  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref4.x;
  y = _ref4.y;

  if (gpuAcceleration) {
    var _Object$assign;

    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }

  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
}

function computeStyles(_ref5) {
  var state = _ref5.state,
      options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;

  if (process.env.NODE_ENV !== "production") {
    var transitionProperty = getComputedStyle$1(state.elements.popper).transitionProperty || '';

    if (adaptive && ['transform', 'top', 'right', 'bottom', 'left'].some(function (property) {
      return transitionProperty.indexOf(property) >= 0;
    })) {
      console.warn(['Popper: Detected CSS transitions on at least one of the following', 'CSS properties: "transform", "top", "right", "bottom", "left".', '\n\n', 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', 'for smooth transitions, or remove these properties from the CSS', 'transition declaration on the popper element if only transitioning', 'opacity or background-color for example.', '\n\n', 'We recommend using the popper element as a wrapper around an inner', 'element that can have any CSS property transitioned for animations.'].join(' '));
    }
  }

  var commonStyles = {
    placement: getBasePlacement$1(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration: gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive: adaptive,
      roundOffsets: roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets: roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

var passive = {
  passive: true
};

function effect(_ref) {
  var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
  var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
  var window = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(function (scrollParent) {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
} // eslint-disable-next-line import/no-unused-modules


var eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function fn() {},
  effect: effect,
  data: {}
};

var hash$1 = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash$1[matched];
  });
}

var hash = {
  start: 'end',
  end: 'start'
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function (matched) {
    return hash[matched];
  });
}

function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  };
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  // Popper 1 is broken in this case and never had a bug report so let's assume
  // it's not an issue. I don't think anyone ever specifies width on <html>
  // anyway.
  // Browsers where the left scrollbar doesn't cause an issue report `0` for
  // this (e.g. Edge 2019, IE11, Safari)
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getViewportRect(element, strategy) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0;

  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    var layoutViewport = isLayoutViewport();

    if (layoutViewport || !layoutViewport && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

// of the `<html>` and `<body>` rect bounds if horizontally scrollable

function getDocumentRect(element) {
  var _element$ownerDocumen;

  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;

  if (getComputedStyle$1(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

function isScrollParent(element) {
  // Firefox wants us to check `-x` and `-y` variations as well
  var _getComputedStyle = getComputedStyle$1(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return node.ownerDocument.body;
  }

  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }

  return getScrollParent(getParentNode(node));
}

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function listScrollParents(element, list) {
  var _element$ownerDocumen;

  if (list === void 0) {
    list = [];
  }

  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
  updatedList.concat(listScrollParents(getParentNode(target)));
}

function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element, strategy) {
  var rect = getBoundingClientRect(element, false, strategy === 'fixed');
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement$1(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
} // A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`


function getClippingParents(element) {
  var clippingParents = listScrollParents(getParentNode(element));
  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement$1(clipperElement)) {
    return [];
  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


  return clippingParents.filter(function (clippingParent) {
    return isElement$1(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
  });
} // Gets the maximum area that the element is visible in due to any number of
// clipping parents


function getClippingRect(element, boundary, rootBoundary, strategy) {
  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents[0];
  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function computeOffsets(_ref) {
  var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement$1(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;

  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;

    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;

    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;

    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;

    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }

  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

  if (mainAxis != null) {
    var len = mainAxis === 'y' ? 'height' : 'width';

    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;

      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }

  return offsets;
}

function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$strategy = _options.strategy,
      strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement$1(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function (key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}

function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
    return getVariation(placement) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function (placement) {
    return allowedAutoPlacements.indexOf(placement) >= 0;
  });

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;

    if (process.env.NODE_ENV !== "production") {
      console.error(['Popper: The `allowedAutoPlacements` option did not allow any', 'placements. Ensure the `placement` option matches the variation', 'of the allowed placements.', 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(' '));
    }
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


  var overflows = allowedPlacements.reduce(function (acc, placement) {
    acc[placement] = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding
    })[getBasePlacement$1(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function (a, b) {
    return overflows[a] - overflows[b];
  });
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement$1(placement) === auto) {
    return [];
  }

  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;

  if (state.modifiersData[name]._skip) {
    return;
  }

  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement$1(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
    return acc.concat(getBasePlacement$1(placement) === auto ? computeAutoPlacement(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      flipVariations: flipVariations,
      allowedAutoPlacements: allowedAutoPlacements
    }) : placement);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements[0];

  for (var i = 0; i < placements.length; i++) {
    var placement = placements[i];

    var _basePlacement = getBasePlacement$1(placement);

    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? 'width' : 'height';
    var overflow = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      altBoundary: altBoundary,
      padding: padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];

    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }

    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }

    if (checks.every(function (check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    var numberOfChecks = flipVariations ? 3 : 1;

    var _loop = function _loop(_i) {
      var fittingPlacement = placements.find(function (placement) {
        var checks = checksMap.get(placement);

        if (checks) {
          return checks.slice(0, _i).every(function (check) {
            return check;
          });
        }
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };

    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);

      if (_ret === "break") break;
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
} // eslint-disable-next-line import/no-unused-modules


var flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: {
    _skip: false
  }
};

function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }

  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function (side) {
    return overflow[side] >= 0;
  });
}

function hide(_ref) {
  var state = _ref.state,
      name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: 'reference'
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets: referenceClippingOffsets,
    popperEscapeOffsets: popperEscapeOffsets,
    isReferenceHidden: isReferenceHidden,
    hasPopperEscaped: hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  });
} // eslint-disable-next-line import/no-unused-modules


var hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement$1(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
    placement: placement
  })) : offset,
      skidding = _ref[0],
      distance = _ref[1];

  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}

function offset(_ref2) {
  var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
  var _options$offset = options.offset,
      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function (acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

function popperOffsets(_ref) {
  var state = _ref.state,
      name = _ref.name;
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function preventOverflow(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  var basePlacement = getBasePlacement$1(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    var _offsetModifierState$;

    var mainSide = mainAxis === 'y' ? top : left;
    var altSide = mainAxis === 'y' ? bottom : right;
    var len = mainAxis === 'y' ? 'height' : 'width';
    var offset = popperOffsets[mainAxis];
    var min$1 = offset + overflow[mainSide];
    var max$1 = offset - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    var _offsetModifierState$2;

    var _mainSide = mainAxis === 'x' ? top : left;

    var _altSide = mainAxis === 'x' ? bottom : right;

    var _offset = popperOffsets[altAxis];

    var _len = altAxis === 'y' ? 'height' : 'width';

    var _min = _offset + overflow[_mainSide];

    var _max = _offset - overflow[_altSide];

    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
} // Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.


function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }

  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function (modifier) {
    map.set(modifier.name, modifier);
  }); // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function (dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);

        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(function (modifier) {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier);
    }
  });
  return result;
}

function orderModifiers(modifiers) {
  // order based on dependencies
  var orderedModifiers = order(modifiers); // order based on phase

  return modifierPhases.reduce(function (acc, phase) {
    return acc.concat(orderedModifiers.filter(function (modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

function debounce$2(fn) {
  var pending;
  return function () {
    if (!pending) {
      pending = new Promise(function (resolve) {
        Promise.resolve().then(function () {
          pending = undefined;
          resolve(fn());
        });
      });
    }

    return pending;
  };
}

function format(str) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return [].concat(args).reduce(function (p, c) {
    return p.replace(/%s/, c);
  }, str);
}

var INVALID_MODIFIER_ERROR = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s';
var MISSING_DEPENDENCY_ERROR = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available';
var VALID_PROPERTIES = ['name', 'enabled', 'phase', 'fn', 'effect', 'requires', 'options'];
function validateModifiers(modifiers) {
  modifiers.forEach(function (modifier) {
    [].concat(Object.keys(modifier), VALID_PROPERTIES) // IE11-compatible replacement for `new Set(iterable)`
    .filter(function (value, index, self) {
      return self.indexOf(value) === index;
    }).forEach(function (key) {
      switch (key) {
        case 'name':
          if (typeof modifier.name !== 'string') {
            console.error(format(INVALID_MODIFIER_ERROR, String(modifier.name), '"name"', '"string"', "\"" + String(modifier.name) + "\""));
          }

          break;

        case 'enabled':
          if (typeof modifier.enabled !== 'boolean') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"enabled"', '"boolean"', "\"" + String(modifier.enabled) + "\""));
          }

          break;

        case 'phase':
          if (modifierPhases.indexOf(modifier.phase) < 0) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"phase"', "either " + modifierPhases.join(', '), "\"" + String(modifier.phase) + "\""));
          }

          break;

        case 'fn':
          if (typeof modifier.fn !== 'function') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"fn"', '"function"', "\"" + String(modifier.fn) + "\""));
          }

          break;

        case 'effect':
          if (modifier.effect != null && typeof modifier.effect !== 'function') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"effect"', '"function"', "\"" + String(modifier.fn) + "\""));
          }

          break;

        case 'requires':
          if (modifier.requires != null && !Array.isArray(modifier.requires)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requires"', '"array"', "\"" + String(modifier.requires) + "\""));
          }

          break;

        case 'requiresIfExists':
          if (!Array.isArray(modifier.requiresIfExists)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requiresIfExists"', '"array"', "\"" + String(modifier.requiresIfExists) + "\""));
          }

          break;

        case 'options':
        case 'data':
          break;

        default:
          console.error("PopperJS: an invalid property has been provided to the \"" + modifier.name + "\" modifier, valid properties are " + VALID_PROPERTIES.map(function (s) {
            return "\"" + s + "\"";
          }).join(', ') + "; but \"" + key + "\" was provided.");
      }

      modifier.requires && modifier.requires.forEach(function (requirement) {
        if (modifiers.find(function (mod) {
          return mod.name === requirement;
        }) == null) {
          console.error(format(MISSING_DEPENDENCY_ERROR, String(modifier.name), requirement, requirement));
        }
      });
    });
  });
}

function uniqueBy(arr, fn) {
  var identifiers = new Set();
  return arr.filter(function (item) {
    var identifier = fn(item);

    if (!identifiers.has(identifier)) {
      identifiers.add(identifier);
      return true;
    }
  });
}

function mergeByName(modifiers) {
  var merged = modifiers.reduce(function (merged, current) {
    var existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {}); // IE11 does not support Object.values

  return Object.keys(merged).map(function (key) {
    return merged[key];
  });
}

var INVALID_ELEMENT_ERROR = 'Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.';
var INFINITE_LOOP_ERROR = 'Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.';
var DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return !args.some(function (element) {
    return !(element && typeof element.getBoundingClientRect === 'function');
  });
}

function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }

  var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference, popper, options) {
    if (options === void 0) {
      options = defaultOptions;
    }

    var state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference,
        popper: popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state,
      setOptions: function setOptions(setOptionsAction) {
        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement$1(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        }; // Orders the modifiers based on their dependencies and `phase`
        // properties

        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

        state.orderedModifiers = orderedModifiers.filter(function (m) {
          return m.enabled;
        }); // Validate the provided modifiers so that the consumer will get warned
        // if one of the modifiers is invalid for any reason

        if (process.env.NODE_ENV !== "production") {
          var modifiers = uniqueBy([].concat(orderedModifiers, state.options.modifiers), function (_ref) {
            var name = _ref.name;
            return name;
          });
          validateModifiers(modifiers);

          if (getBasePlacement$1(state.options.placement) === auto) {
            var flipModifier = state.orderedModifiers.find(function (_ref2) {
              var name = _ref2.name;
              return name === 'flip';
            });

            if (!flipModifier) {
              console.error(['Popper: "auto" placements require the "flip" modifier be', 'present and enabled to work.'].join(' '));
            }
          }

          var _getComputedStyle = getComputedStyle$1(popper),
              marginTop = _getComputedStyle.marginTop,
              marginRight = _getComputedStyle.marginRight,
              marginBottom = _getComputedStyle.marginBottom,
              marginLeft = _getComputedStyle.marginLeft; // We no longer take into account `margins` on the popper, and it can
          // cause bugs with positioning, so we'll warn the consumer


          if ([marginTop, marginRight, marginBottom, marginLeft].some(function (margin) {
            return parseFloat(margin);
          })) {
            console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', 'between the popper and its reference element or boundary.', 'To replicate margin, use the `offset` modifier, as well as', 'the `padding` option in the `preventOverflow` and `flip`', 'modifiers.'].join(' '));
          }
        }

        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }

        var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          if (process.env.NODE_ENV !== "production") {
            console.error(INVALID_ELEMENT_ERROR);
          }

          return;
        } // Store the reference and popper rects to be read by modifiers


        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        }; // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect

        state.reset = false;
        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`

        state.orderedModifiers.forEach(function (modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        var __debug_loops__ = 0;

        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (process.env.NODE_ENV !== "production") {
            __debug_loops__ += 1;

            if (__debug_loops__ > 100) {
              console.error(INFINITE_LOOP_ERROR);
              break;
            }
          }

          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;

          if (typeof fn === 'function') {
            state = fn({
              state: state,
              options: _options,
              name: name,
              instance: instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce$2(function () {
        return new Promise(function (resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      if (process.env.NODE_ENV !== "production") {
        console.error(INVALID_ELEMENT_ERROR);
      }

      return instance;
    }

    instance.setOptions(options).then(function (state) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.

    function runModifierEffects() {
      state.orderedModifiers.forEach(function (_ref3) {
        var name = _ref3.name,
            _ref3$options = _ref3.options,
            options = _ref3$options === void 0 ? {} : _ref3$options,
            effect = _ref3.effect;

        if (typeof effect === 'function') {
          var cleanupFn = effect({
            state: state,
            name: name,
            instance: instance,
            options: options
          });

          var noopFn = function noopFn() {};

          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function (fn) {
        return fn();
      });
      effectCleanupFns = [];
    }

    return instance;
  };
}

var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$2, hide$1];
var createPopper = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers
}); // eslint-disable-next-line import/no-unused-modules

/**!
* tippy.js v6.3.7
* (c) 2017-2021 atomiks
* MIT License
*/
var BOX_CLASS = "tippy-box";
var CONTENT_CLASS = "tippy-content";
var BACKDROP_CLASS = "tippy-backdrop";
var ARROW_CLASS = "tippy-arrow";
var SVG_ARROW_CLASS = "tippy-svg-arrow";
var TOUCH_OPTIONS = {
  passive: true,
  capture: true
};
var TIPPY_DEFAULT_APPEND_TO = function TIPPY_DEFAULT_APPEND_TO() {
  return document.body;
};

function hasOwnProperty$1(obj, key) {
  return {}.hasOwnProperty.call(obj, key);
}
function getValueAtIndexOrReturn(value, index, defaultValue) {
  if (Array.isArray(value)) {
    var v = value[index];
    return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
  }

  return value;
}
function isType(value, type) {
  var str = {}.toString.call(value);
  return str.indexOf('[object') === 0 && str.indexOf(type + "]") > -1;
}
function invokeWithArgsOrReturn(value, args) {
  return typeof value === 'function' ? value.apply(void 0, args) : value;
}
function debounce$1(fn, ms) {
  // Avoid wrapping in `setTimeout` if ms is 0 anyway
  if (ms === 0) {
    return fn;
  }

  var timeout;
  return function (arg) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn(arg);
    }, ms);
  };
}
function removeProperties(obj, keys) {
  var clone = Object.assign({}, obj);
  keys.forEach(function (key) {
    delete clone[key];
  });
  return clone;
}
function splitBySpaces(value) {
  return value.split(/\s+/).filter(Boolean);
}
function normalizeToArray(value) {
  return [].concat(value);
}
function pushIfUnique(arr, value) {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
}
function unique(arr) {
  return arr.filter(function (item, index) {
    return arr.indexOf(item) === index;
  });
}
function getBasePlacement(placement) {
  return placement.split('-')[0];
}
function arrayFrom(value) {
  return [].slice.call(value);
}
function removeUndefinedProps(obj) {
  return Object.keys(obj).reduce(function (acc, key) {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }

    return acc;
  }, {});
}

function div() {
  return document.createElement('div');
}
function isElement(value) {
  return ['Element', 'Fragment'].some(function (type) {
    return isType(value, type);
  });
}
function isNodeList(value) {
  return isType(value, 'NodeList');
}
function isMouseEvent(value) {
  return isType(value, 'MouseEvent');
}
function isReferenceElement(value) {
  return !!(value && value._tippy && value._tippy.reference === value);
}
function getArrayOfElements(value) {
  if (isElement(value)) {
    return [value];
  }

  if (isNodeList(value)) {
    return arrayFrom(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  return arrayFrom(document.querySelectorAll(value));
}
function setTransitionDuration(els, value) {
  els.forEach(function (el) {
    if (el) {
      el.style.transitionDuration = value + "ms";
    }
  });
}
function setVisibilityState(els, state) {
  els.forEach(function (el) {
    if (el) {
      el.setAttribute('data-state', state);
    }
  });
}
function getOwnerDocument(elementOrElements) {
  var _element$ownerDocumen;

  var _normalizeToArray = normalizeToArray(elementOrElements),
      element = _normalizeToArray[0]; // Elements created via a <template> have an ownerDocument with no reference to the body


  return element != null && (_element$ownerDocumen = element.ownerDocument) != null && _element$ownerDocumen.body ? element.ownerDocument : document;
}
function isCursorOutsideInteractiveBorder(popperTreeData, event) {
  var clientX = event.clientX,
      clientY = event.clientY;
  return popperTreeData.every(function (_ref) {
    var popperRect = _ref.popperRect,
        popperState = _ref.popperState,
        props = _ref.props;
    var interactiveBorder = props.interactiveBorder;
    var basePlacement = getBasePlacement(popperState.placement);
    var offsetData = popperState.modifiersData.offset;

    if (!offsetData) {
      return true;
    }

    var topDistance = basePlacement === 'bottom' ? offsetData.top.y : 0;
    var bottomDistance = basePlacement === 'top' ? offsetData.bottom.y : 0;
    var leftDistance = basePlacement === 'right' ? offsetData.left.x : 0;
    var rightDistance = basePlacement === 'left' ? offsetData.right.x : 0;
    var exceedsTop = popperRect.top - clientY + topDistance > interactiveBorder;
    var exceedsBottom = clientY - popperRect.bottom - bottomDistance > interactiveBorder;
    var exceedsLeft = popperRect.left - clientX + leftDistance > interactiveBorder;
    var exceedsRight = clientX - popperRect.right - rightDistance > interactiveBorder;
    return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
  });
}
function updateTransitionEndListener(box, action, listener) {
  var method = action + "EventListener"; // some browsers apparently support `transition` (unprefixed) but only fire
  // `webkitTransitionEnd`...

  ['transitionend', 'webkitTransitionEnd'].forEach(function (event) {
    box[method](event, listener);
  });
}
/**
 * Compared to xxx.contains, this function works for dom structures with shadow
 * dom
 */

function actualContains(parent, child) {
  var target = child;

  while (target) {
    var _target$getRootNode;

    if (parent.contains(target)) {
      return true;
    }

    target = target.getRootNode == null ? void 0 : (_target$getRootNode = target.getRootNode()) == null ? void 0 : _target$getRootNode.host;
  }

  return false;
}

var currentInput = {
  isTouch: false
};
var lastMouseMoveTime = 0;
/**
 * When a `touchstart` event is fired, it's assumed the user is using touch
 * input. We'll bind a `mousemove` event listener to listen for mouse input in
 * the future. This way, the `isTouch` property is fully dynamic and will handle
 * hybrid devices that use a mix of touch + mouse input.
 */

function onDocumentTouchStart() {
  if (currentInput.isTouch) {
    return;
  }

  currentInput.isTouch = true;

  if (window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove);
  }
}
/**
 * When two `mousemove` event are fired consecutively within 20ms, it's assumed
 * the user is using mouse input again. `mousemove` can fire on touch devices as
 * well, but very rarely that quickly.
 */

function onDocumentMouseMove() {
  var now = performance.now();

  if (now - lastMouseMoveTime < 20) {
    currentInput.isTouch = false;
    document.removeEventListener('mousemove', onDocumentMouseMove);
  }

  lastMouseMoveTime = now;
}
/**
 * When an element is in focus and has a tippy, leaving the tab/window and
 * returning causes it to show again. For mouse users this is unexpected, but
 * for keyboard use it makes sense.
 * TODO: find a better technique to solve this problem
 */

function onWindowBlur() {
  var activeElement = document.activeElement;

  if (isReferenceElement(activeElement)) {
    var instance = activeElement._tippy;

    if (activeElement.blur && !instance.state.isVisible) {
      activeElement.blur();
    }
  }
}
function bindGlobalEventListeners() {
  document.addEventListener('touchstart', onDocumentTouchStart, TOUCH_OPTIONS);
  window.addEventListener('blur', onWindowBlur);
}

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
var isIE11 = isBrowser ? // @ts-ignore
!!window.msCrypto : false;

function createMemoryLeakWarning(method) {
  var txt = method === 'destroy' ? 'n already-' : ' ';
  return [method + "() was called on a" + txt + "destroyed instance. This is a no-op but", 'indicates a potential memory leak.'].join(' ');
}
function clean(value) {
  var spacesAndTabs = /[ \t]{2,}/g;
  var lineStartWithSpaces = /^[ \t]*/gm;
  return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
}

function getDevMessage(message) {
  return clean("\n  %ctippy.js\n\n  %c" + clean(message) + "\n\n  %c\uD83D\uDC77\u200D This is a development-only message. It will be removed in production.\n  ");
}

function getFormattedMessage(message) {
  return [getDevMessage(message), // title
  'color: #00C584; font-size: 1.3em; font-weight: bold;', // message
  'line-height: 1.5', // footer
  'color: #a6a095;'];
} // Assume warnings and errors never have the same message

var visitedMessages;

if (process.env.NODE_ENV !== "production") {
  resetVisitedMessages();
}

function resetVisitedMessages() {
  visitedMessages = new Set();
}
function warnWhen(condition, message) {
  if (condition && !visitedMessages.has(message)) {
    var _console;

    visitedMessages.add(message);

    (_console = console).warn.apply(_console, getFormattedMessage(message));
  }
}
function errorWhen(condition, message) {
  if (condition && !visitedMessages.has(message)) {
    var _console2;

    visitedMessages.add(message);

    (_console2 = console).error.apply(_console2, getFormattedMessage(message));
  }
}
function validateTargets(targets) {
  var didPassFalsyValue = !targets;
  var didPassPlainObject = Object.prototype.toString.call(targets) === '[object Object]' && !targets.addEventListener;
  errorWhen(didPassFalsyValue, ['tippy() was passed', '`' + String(targets) + '`', 'as its targets (first) argument. Valid types are: String, Element,', 'Element[], or NodeList.'].join(' '));
  errorWhen(didPassPlainObject, ['tippy() was passed a plain object which is not supported as an argument', 'for virtual positioning. Use props.getReferenceClientRect instead.'].join(' '));
}

var pluginProps = {
  animateFill: false,
  followCursor: false,
  inlinePositioning: false,
  sticky: false
};
var renderProps = {
  allowHTML: false,
  animation: 'fade',
  arrow: true,
  content: '',
  inertia: false,
  maxWidth: 350,
  role: 'tooltip',
  theme: '',
  zIndex: 9999
};
var defaultProps = Object.assign({
  appendTo: TIPPY_DEFAULT_APPEND_TO,
  aria: {
    content: 'auto',
    expanded: 'auto'
  },
  delay: 0,
  duration: [300, 250],
  getReferenceClientRect: null,
  hideOnClick: true,
  ignoreAttributes: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  moveTransition: '',
  offset: [0, 10],
  onAfterUpdate: function onAfterUpdate() {},
  onBeforeUpdate: function onBeforeUpdate() {},
  onCreate: function onCreate() {},
  onDestroy: function onDestroy() {},
  onHidden: function onHidden() {},
  onHide: function onHide() {},
  onMount: function onMount() {},
  onShow: function onShow() {},
  onShown: function onShown() {},
  onTrigger: function onTrigger() {},
  onUntrigger: function onUntrigger() {},
  onClickOutside: function onClickOutside() {},
  placement: 'top',
  plugins: [],
  popperOptions: {},
  render: null,
  showOnCreate: false,
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null
}, pluginProps, renderProps);
var defaultKeys = Object.keys(defaultProps);
var setDefaultProps = function setDefaultProps(partialProps) {
  /* istanbul ignore else */
  if (process.env.NODE_ENV !== "production") {
    validateProps(partialProps, []);
  }

  var keys = Object.keys(partialProps);
  keys.forEach(function (key) {
    defaultProps[key] = partialProps[key];
  });
};
function getExtendedPassedProps(passedProps) {
  var plugins = passedProps.plugins || [];
  var pluginProps = plugins.reduce(function (acc, plugin) {
    var name = plugin.name,
        defaultValue = plugin.defaultValue;

    if (name) {
      var _name;

      acc[name] = passedProps[name] !== undefined ? passedProps[name] : (_name = defaultProps[name]) != null ? _name : defaultValue;
    }

    return acc;
  }, {});
  return Object.assign({}, passedProps, pluginProps);
}
function getDataAttributeProps(reference, plugins) {
  var propKeys = plugins ? Object.keys(getExtendedPassedProps(Object.assign({}, defaultProps, {
    plugins: plugins
  }))) : defaultKeys;
  var props = propKeys.reduce(function (acc, key) {
    var valueAsString = (reference.getAttribute("data-tippy-" + key) || '').trim();

    if (!valueAsString) {
      return acc;
    }

    if (key === 'content') {
      acc[key] = valueAsString;
    } else {
      try {
        acc[key] = JSON.parse(valueAsString);
      } catch (e) {
        acc[key] = valueAsString;
      }
    }

    return acc;
  }, {});
  return props;
}
function evaluateProps(reference, props) {
  var out = Object.assign({}, props, {
    content: invokeWithArgsOrReturn(props.content, [reference])
  }, props.ignoreAttributes ? {} : getDataAttributeProps(reference, props.plugins));
  out.aria = Object.assign({}, defaultProps.aria, out.aria);
  out.aria = {
    expanded: out.aria.expanded === 'auto' ? props.interactive : out.aria.expanded,
    content: out.aria.content === 'auto' ? props.interactive ? null : 'describedby' : out.aria.content
  };
  return out;
}
function validateProps(partialProps, plugins) {
  if (partialProps === void 0) {
    partialProps = {};
  }

  if (plugins === void 0) {
    plugins = [];
  }

  var keys = Object.keys(partialProps);
  keys.forEach(function (prop) {
    var nonPluginProps = removeProperties(defaultProps, Object.keys(pluginProps));
    var didPassUnknownProp = !hasOwnProperty$1(nonPluginProps, prop); // Check if the prop exists in `plugins`

    if (didPassUnknownProp) {
      didPassUnknownProp = plugins.filter(function (plugin) {
        return plugin.name === prop;
      }).length === 0;
    }

    warnWhen(didPassUnknownProp, ["`" + prop + "`", "is not a valid prop. You may have spelled it incorrectly, or if it's", 'a plugin, forgot to pass it in an array as props.plugins.', '\n\n', 'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n', 'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/'].join(' '));
  });
}

var innerHTML = function innerHTML() {
  return 'innerHTML';
};

function dangerouslySetInnerHTML(element, html) {
  element[innerHTML()] = html;
}

function createArrowElement(value) {
  var arrow = div();

  if (value === true) {
    arrow.className = ARROW_CLASS;
  } else {
    arrow.className = SVG_ARROW_CLASS;

    if (isElement(value)) {
      arrow.appendChild(value);
    } else {
      dangerouslySetInnerHTML(arrow, value);
    }
  }

  return arrow;
}

function setContent(content, props) {
  if (isElement(props.content)) {
    dangerouslySetInnerHTML(content, '');
    content.appendChild(props.content);
  } else if (typeof props.content !== 'function') {
    if (props.allowHTML) {
      dangerouslySetInnerHTML(content, props.content);
    } else {
      content.textContent = props.content;
    }
  }
}
function getChildren(popper) {
  var box = popper.firstElementChild;
  var boxChildren = arrayFrom(box.children);
  return {
    box: box,
    content: boxChildren.find(function (node) {
      return node.classList.contains(CONTENT_CLASS);
    }),
    arrow: boxChildren.find(function (node) {
      return node.classList.contains(ARROW_CLASS) || node.classList.contains(SVG_ARROW_CLASS);
    }),
    backdrop: boxChildren.find(function (node) {
      return node.classList.contains(BACKDROP_CLASS);
    })
  };
}
function render(instance) {
  var popper = div();
  var box = div();
  box.className = BOX_CLASS;
  box.setAttribute('data-state', 'hidden');
  box.setAttribute('tabindex', '-1');
  var content = div();
  content.className = CONTENT_CLASS;
  content.setAttribute('data-state', 'hidden');
  setContent(content, instance.props);
  popper.appendChild(box);
  box.appendChild(content);
  onUpdate(instance.props, instance.props);

  function onUpdate(prevProps, nextProps) {
    var _getChildren = getChildren(popper),
        box = _getChildren.box,
        content = _getChildren.content,
        arrow = _getChildren.arrow;

    if (nextProps.theme) {
      box.setAttribute('data-theme', nextProps.theme);
    } else {
      box.removeAttribute('data-theme');
    }

    if (typeof nextProps.animation === 'string') {
      box.setAttribute('data-animation', nextProps.animation);
    } else {
      box.removeAttribute('data-animation');
    }

    if (nextProps.inertia) {
      box.setAttribute('data-inertia', '');
    } else {
      box.removeAttribute('data-inertia');
    }

    box.style.maxWidth = typeof nextProps.maxWidth === 'number' ? nextProps.maxWidth + "px" : nextProps.maxWidth;

    if (nextProps.role) {
      box.setAttribute('role', nextProps.role);
    } else {
      box.removeAttribute('role');
    }

    if (prevProps.content !== nextProps.content || prevProps.allowHTML !== nextProps.allowHTML) {
      setContent(content, instance.props);
    }

    if (nextProps.arrow) {
      if (!arrow) {
        box.appendChild(createArrowElement(nextProps.arrow));
      } else if (prevProps.arrow !== nextProps.arrow) {
        box.removeChild(arrow);
        box.appendChild(createArrowElement(nextProps.arrow));
      }
    } else if (arrow) {
      box.removeChild(arrow);
    }
  }

  return {
    popper: popper,
    onUpdate: onUpdate
  };
} // Runtime check to identify if the render function is the default one; this
// way we can apply default CSS transitions logic and it can be tree-shaken away

render.$$tippy = true;

var idCounter = 1;
var mouseMoveListeners = []; // Used by `hideAll()`

var mountedInstances = [];
function createTippy(reference, passedProps) {
  var props = evaluateProps(reference, Object.assign({}, defaultProps, getExtendedPassedProps(removeUndefinedProps(passedProps)))); // ===========================================================================
  // 🔒 Private members
  // ===========================================================================

  var showTimeout;
  var hideTimeout;
  var scheduleHideAnimationFrame;
  var isVisibleFromClick = false;
  var didHideDueToDocumentMouseDown = false;
  var didTouchMove = false;
  var ignoreOnFirstUpdate = false;
  var lastTriggerEvent;
  var currentTransitionEndListener;
  var onFirstUpdate;
  var listeners = [];
  var debouncedOnMouseMove = debounce$1(onMouseMove, props.interactiveDebounce);
  var currentTarget; // ===========================================================================
  // 🔑 Public members
  // ===========================================================================

  var id = idCounter++;
  var popperInstance = null;
  var plugins = unique(props.plugins);
  var state = {
    // Is the instance currently enabled?
    isEnabled: true,
    // Is the tippy currently showing and not transitioning out?
    isVisible: false,
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the tippy currently mounted to the DOM?
    isMounted: false,
    // Has the tippy finished transitioning in?
    isShown: false
  };
  var instance = {
    // properties
    id: id,
    reference: reference,
    popper: div(),
    popperInstance: popperInstance,
    props: props,
    state: state,
    plugins: plugins,
    // methods
    clearDelayTimeouts: clearDelayTimeouts,
    setProps: setProps,
    setContent: setContent,
    show: show,
    hide: hide,
    hideWithInteractivity: hideWithInteractivity,
    enable: enable,
    disable: disable,
    unmount: unmount,
    destroy: destroy
  }; // TODO: Investigate why this early return causes a TDZ error in the tests —
  // it doesn't seem to happen in the browser

  /* istanbul ignore if */

  if (!props.render) {
    if (process.env.NODE_ENV !== "production") {
      errorWhen(true, 'render() function has not been supplied.');
    }

    return instance;
  } // ===========================================================================
  // Initial mutations
  // ===========================================================================


  var _props$render = props.render(instance),
      popper = _props$render.popper,
      onUpdate = _props$render.onUpdate;

  popper.setAttribute('data-tippy-root', '');
  popper.id = "tippy-" + instance.id;
  instance.popper = popper;
  reference._tippy = instance;
  popper._tippy = instance;
  var pluginsHooks = plugins.map(function (plugin) {
    return plugin.fn(instance);
  });
  var hasAriaExpanded = reference.hasAttribute('aria-expanded');
  addListeners();
  handleAriaExpandedAttribute();
  handleStyles();
  invokeHook('onCreate', [instance]);

  if (props.showOnCreate) {
    scheduleShow();
  } // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding


  popper.addEventListener('mouseenter', function () {
    if (instance.props.interactive && instance.state.isVisible) {
      instance.clearDelayTimeouts();
    }
  });
  popper.addEventListener('mouseleave', function () {
    if (instance.props.interactive && instance.props.trigger.indexOf('mouseenter') >= 0) {
      getDocument().addEventListener('mousemove', debouncedOnMouseMove);
    }
  });
  return instance; // ===========================================================================
  // 🔒 Private methods
  // ===========================================================================

  function getNormalizedTouchSettings() {
    var touch = instance.props.touch;
    return Array.isArray(touch) ? touch : [touch, 0];
  }

  function getIsCustomTouchBehavior() {
    return getNormalizedTouchSettings()[0] === 'hold';
  }

  function getIsDefaultRenderFn() {
    var _instance$props$rende;

    // @ts-ignore
    return !!((_instance$props$rende = instance.props.render) != null && _instance$props$rende.$$tippy);
  }

  function getCurrentTarget() {
    return currentTarget || reference;
  }

  function getDocument() {
    var parent = getCurrentTarget().parentNode;
    return parent ? getOwnerDocument(parent) : document;
  }

  function getDefaultTemplateChildren() {
    return getChildren(popper);
  }

  function getDelay(isShow) {
    // For touch or keyboard input, force `0` delay for UX reasons
    // Also if the instance is mounted but not visible (transitioning out),
    // ignore delay
    if (instance.state.isMounted && !instance.state.isVisible || currentInput.isTouch || lastTriggerEvent && lastTriggerEvent.type === 'focus') {
      return 0;
    }

    return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
  }

  function handleStyles(fromHide) {
    if (fromHide === void 0) {
      fromHide = false;
    }

    popper.style.pointerEvents = instance.props.interactive && !fromHide ? '' : 'none';
    popper.style.zIndex = "" + instance.props.zIndex;
  }

  function invokeHook(hook, args, shouldInvokePropsHook) {
    if (shouldInvokePropsHook === void 0) {
      shouldInvokePropsHook = true;
    }

    pluginsHooks.forEach(function (pluginHooks) {
      if (pluginHooks[hook]) {
        pluginHooks[hook].apply(pluginHooks, args);
      }
    });

    if (shouldInvokePropsHook) {
      var _instance$props;

      (_instance$props = instance.props)[hook].apply(_instance$props, args);
    }
  }

  function handleAriaContentAttribute() {
    var aria = instance.props.aria;

    if (!aria.content) {
      return;
    }

    var attr = "aria-" + aria.content;
    var id = popper.id;
    var nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(function (node) {
      var currentValue = node.getAttribute(attr);

      if (instance.state.isVisible) {
        node.setAttribute(attr, currentValue ? currentValue + " " + id : id);
      } else {
        var nextValue = currentValue && currentValue.replace(id, '').trim();

        if (nextValue) {
          node.setAttribute(attr, nextValue);
        } else {
          node.removeAttribute(attr);
        }
      }
    });
  }

  function handleAriaExpandedAttribute() {
    if (hasAriaExpanded || !instance.props.aria.expanded) {
      return;
    }

    var nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(function (node) {
      if (instance.props.interactive) {
        node.setAttribute('aria-expanded', instance.state.isVisible && node === getCurrentTarget() ? 'true' : 'false');
      } else {
        node.removeAttribute('aria-expanded');
      }
    });
  }

  function cleanupInteractiveMouseListeners() {
    getDocument().removeEventListener('mousemove', debouncedOnMouseMove);
    mouseMoveListeners = mouseMoveListeners.filter(function (listener) {
      return listener !== debouncedOnMouseMove;
    });
  }

  function onDocumentPress(event) {
    // Moved finger to scroll instead of an intentional tap outside
    if (currentInput.isTouch) {
      if (didTouchMove || event.type === 'mousedown') {
        return;
      }
    }

    var actualTarget = event.composedPath && event.composedPath()[0] || event.target; // Clicked on interactive popper

    if (instance.props.interactive && actualContains(popper, actualTarget)) {
      return;
    } // Clicked on the event listeners target


    if (normalizeToArray(instance.props.triggerTarget || reference).some(function (el) {
      return actualContains(el, actualTarget);
    })) {
      if (currentInput.isTouch) {
        return;
      }

      if (instance.state.isVisible && instance.props.trigger.indexOf('click') >= 0) {
        return;
      }
    } else {
      invokeHook('onClickOutside', [instance, event]);
    }

    if (instance.props.hideOnClick === true) {
      instance.clearDelayTimeouts();
      instance.hide(); // `mousedown` event is fired right before `focus` if pressing the
      // currentTarget. This lets a tippy with `focus` trigger know that it
      // should not show

      didHideDueToDocumentMouseDown = true;
      setTimeout(function () {
        didHideDueToDocumentMouseDown = false;
      }); // The listener gets added in `scheduleShow()`, but this may be hiding it
      // before it shows, and hide()'s early bail-out behavior can prevent it
      // from being cleaned up

      if (!instance.state.isMounted) {
        removeDocumentPress();
      }
    }
  }

  function onTouchMove() {
    didTouchMove = true;
  }

  function onTouchStart() {
    didTouchMove = false;
  }

  function addDocumentPress() {
    var doc = getDocument();
    doc.addEventListener('mousedown', onDocumentPress, true);
    doc.addEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
    doc.addEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
    doc.addEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
  }

  function removeDocumentPress() {
    var doc = getDocument();
    doc.removeEventListener('mousedown', onDocumentPress, true);
    doc.removeEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
    doc.removeEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
    doc.removeEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
  }

  function onTransitionedOut(duration, callback) {
    onTransitionEnd(duration, function () {
      if (!instance.state.isVisible && popper.parentNode && popper.parentNode.contains(popper)) {
        callback();
      }
    });
  }

  function onTransitionedIn(duration, callback) {
    onTransitionEnd(duration, callback);
  }

  function onTransitionEnd(duration, callback) {
    var box = getDefaultTemplateChildren().box;

    function listener(event) {
      if (event.target === box) {
        updateTransitionEndListener(box, 'remove', listener);
        callback();
      }
    } // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise


    if (duration === 0) {
      return callback();
    }

    updateTransitionEndListener(box, 'remove', currentTransitionEndListener);
    updateTransitionEndListener(box, 'add', listener);
    currentTransitionEndListener = listener;
  }

  function on(eventType, handler, options) {
    if (options === void 0) {
      options = false;
    }

    var nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(function (node) {
      node.addEventListener(eventType, handler, options);
      listeners.push({
        node: node,
        eventType: eventType,
        handler: handler,
        options: options
      });
    });
  }

  function addListeners() {
    if (getIsCustomTouchBehavior()) {
      on('touchstart', onTrigger, {
        passive: true
      });
      on('touchend', onMouseLeave, {
        passive: true
      });
    }

    splitBySpaces(instance.props.trigger).forEach(function (eventType) {
      if (eventType === 'manual') {
        return;
      }

      on(eventType, onTrigger);

      switch (eventType) {
        case 'mouseenter':
          on('mouseleave', onMouseLeave);
          break;

        case 'focus':
          on(isIE11 ? 'focusout' : 'blur', onBlurOrFocusOut);
          break;

        case 'focusin':
          on('focusout', onBlurOrFocusOut);
          break;
      }
    });
  }

  function removeListeners() {
    listeners.forEach(function (_ref) {
      var node = _ref.node,
          eventType = _ref.eventType,
          handler = _ref.handler,
          options = _ref.options;
      node.removeEventListener(eventType, handler, options);
    });
    listeners = [];
  }

  function onTrigger(event) {
    var _lastTriggerEvent;

    var shouldScheduleClickHide = false;

    if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
      return;
    }

    var wasFocused = ((_lastTriggerEvent = lastTriggerEvent) == null ? void 0 : _lastTriggerEvent.type) === 'focus';
    lastTriggerEvent = event;
    currentTarget = event.currentTarget;
    handleAriaExpandedAttribute();

    if (!instance.state.isVisible && isMouseEvent(event)) {
      // If scrolling, `mouseenter` events can be fired if the cursor lands
      // over a new target, but `mousemove` events don't get fired. This
      // causes interactive tooltips to get stuck open until the cursor is
      // moved
      mouseMoveListeners.forEach(function (listener) {
        return listener(event);
      });
    } // Toggle show/hide when clicking click-triggered tooltips


    if (event.type === 'click' && (instance.props.trigger.indexOf('mouseenter') < 0 || isVisibleFromClick) && instance.props.hideOnClick !== false && instance.state.isVisible) {
      shouldScheduleClickHide = true;
    } else {
      scheduleShow(event);
    }

    if (event.type === 'click') {
      isVisibleFromClick = !shouldScheduleClickHide;
    }

    if (shouldScheduleClickHide && !wasFocused) {
      scheduleHide(event);
    }
  }

  function onMouseMove(event) {
    var target = event.target;
    var isCursorOverReferenceOrPopper = getCurrentTarget().contains(target) || popper.contains(target);

    if (event.type === 'mousemove' && isCursorOverReferenceOrPopper) {
      return;
    }

    var popperTreeData = getNestedPopperTree().concat(popper).map(function (popper) {
      var _instance$popperInsta;

      var instance = popper._tippy;
      var state = (_instance$popperInsta = instance.popperInstance) == null ? void 0 : _instance$popperInsta.state;

      if (state) {
        return {
          popperRect: popper.getBoundingClientRect(),
          popperState: state,
          props: props
        };
      }

      return null;
    }).filter(Boolean);

    if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
      cleanupInteractiveMouseListeners();
      scheduleHide(event);
    }
  }

  function onMouseLeave(event) {
    var shouldBail = isEventListenerStopped(event) || instance.props.trigger.indexOf('click') >= 0 && isVisibleFromClick;

    if (shouldBail) {
      return;
    }

    if (instance.props.interactive) {
      instance.hideWithInteractivity(event);
      return;
    }

    scheduleHide(event);
  }

  function onBlurOrFocusOut(event) {
    if (instance.props.trigger.indexOf('focusin') < 0 && event.target !== getCurrentTarget()) {
      return;
    } // If focus was moved to within the popper


    if (instance.props.interactive && event.relatedTarget && popper.contains(event.relatedTarget)) {
      return;
    }

    scheduleHide(event);
  }

  function isEventListenerStopped(event) {
    return currentInput.isTouch ? getIsCustomTouchBehavior() !== event.type.indexOf('touch') >= 0 : false;
  }

  function createPopperInstance() {
    destroyPopperInstance();
    var _instance$props2 = instance.props,
        popperOptions = _instance$props2.popperOptions,
        placement = _instance$props2.placement,
        offset = _instance$props2.offset,
        getReferenceClientRect = _instance$props2.getReferenceClientRect,
        moveTransition = _instance$props2.moveTransition;
    var arrow = getIsDefaultRenderFn() ? getChildren(popper).arrow : null;
    var computedReference = getReferenceClientRect ? {
      getBoundingClientRect: getReferenceClientRect,
      contextElement: getReferenceClientRect.contextElement || getCurrentTarget()
    } : reference;
    var tippyModifier = {
      name: '$$tippy',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: function fn(_ref2) {
        var state = _ref2.state;

        if (getIsDefaultRenderFn()) {
          var _getDefaultTemplateCh = getDefaultTemplateChildren(),
              box = _getDefaultTemplateCh.box;

          ['placement', 'reference-hidden', 'escaped'].forEach(function (attr) {
            if (attr === 'placement') {
              box.setAttribute('data-placement', state.placement);
            } else {
              if (state.attributes.popper["data-popper-" + attr]) {
                box.setAttribute("data-" + attr, '');
              } else {
                box.removeAttribute("data-" + attr);
              }
            }
          });
          state.attributes.popper = {};
        }
      }
    };
    var modifiers = [{
      name: 'offset',
      options: {
        offset: offset
      }
    }, {
      name: 'preventOverflow',
      options: {
        padding: {
          top: 2,
          bottom: 2,
          left: 5,
          right: 5
        }
      }
    }, {
      name: 'flip',
      options: {
        padding: 5
      }
    }, {
      name: 'computeStyles',
      options: {
        adaptive: !moveTransition
      }
    }, tippyModifier];

    if (getIsDefaultRenderFn() && arrow) {
      modifiers.push({
        name: 'arrow',
        options: {
          element: arrow,
          padding: 3
        }
      });
    }

    modifiers.push.apply(modifiers, (popperOptions == null ? void 0 : popperOptions.modifiers) || []);
    instance.popperInstance = createPopper(computedReference, popper, Object.assign({}, popperOptions, {
      placement: placement,
      onFirstUpdate: onFirstUpdate,
      modifiers: modifiers
    }));
  }

  function destroyPopperInstance() {
    if (instance.popperInstance) {
      instance.popperInstance.destroy();
      instance.popperInstance = null;
    }
  }

  function mount() {
    var appendTo = instance.props.appendTo;
    var parentNode; // By default, we'll append the popper to the triggerTargets's parentNode so
    // it's directly after the reference element so the elements inside the
    // tippy can be tabbed to
    // If there are clipping issues, the user can specify a different appendTo
    // and ensure focus management is handled correctly manually

    var node = getCurrentTarget();

    if (instance.props.interactive && appendTo === TIPPY_DEFAULT_APPEND_TO || appendTo === 'parent') {
      parentNode = node.parentNode;
    } else {
      parentNode = invokeWithArgsOrReturn(appendTo, [node]);
    } // The popper element needs to exist on the DOM before its position can be
    // updated as Popper needs to read its dimensions


    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper);
    }

    instance.state.isMounted = true;
    createPopperInstance();
    /* istanbul ignore else */

    if (process.env.NODE_ENV !== "production") {
      // Accessibility check
      warnWhen(instance.props.interactive && appendTo === defaultProps.appendTo && node.nextElementSibling !== popper, ['Interactive tippy element may not be accessible via keyboard', 'navigation because it is not directly after the reference element', 'in the DOM source order.', '\n\n', 'Using a wrapper <div> or <span> tag around the reference element', 'solves this by creating a new parentNode context.', '\n\n', 'Specifying `appendTo: document.body` silences this warning, but it', 'assumes you are using a focus management solution to handle', 'keyboard navigation.', '\n\n', 'See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity'].join(' '));
    }
  }

  function getNestedPopperTree() {
    return arrayFrom(popper.querySelectorAll('[data-tippy-root]'));
  }

  function scheduleShow(event) {
    instance.clearDelayTimeouts();

    if (event) {
      invokeHook('onTrigger', [instance, event]);
    }

    addDocumentPress();
    var delay = getDelay(true);

    var _getNormalizedTouchSe = getNormalizedTouchSettings(),
        touchValue = _getNormalizedTouchSe[0],
        touchDelay = _getNormalizedTouchSe[1];

    if (currentInput.isTouch && touchValue === 'hold' && touchDelay) {
      delay = touchDelay;
    }

    if (delay) {
      showTimeout = setTimeout(function () {
        instance.show();
      }, delay);
    } else {
      instance.show();
    }
  }

  function scheduleHide(event) {
    instance.clearDelayTimeouts();
    invokeHook('onUntrigger', [instance, event]);

    if (!instance.state.isVisible) {
      removeDocumentPress();
      return;
    } // For interactive tippies, scheduleHide is added to a document.body handler
    // from onMouseLeave so must intercept scheduled hides from mousemove/leave
    // events when trigger contains mouseenter and click, and the tip is
    // currently shown as a result of a click.


    if (instance.props.trigger.indexOf('mouseenter') >= 0 && instance.props.trigger.indexOf('click') >= 0 && ['mouseleave', 'mousemove'].indexOf(event.type) >= 0 && isVisibleFromClick) {
      return;
    }

    var delay = getDelay(false);

    if (delay) {
      hideTimeout = setTimeout(function () {
        if (instance.state.isVisible) {
          instance.hide();
        }
      }, delay);
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      scheduleHideAnimationFrame = requestAnimationFrame(function () {
        instance.hide();
      });
    }
  } // ===========================================================================
  // 🔑 Public methods
  // ===========================================================================


  function enable() {
    instance.state.isEnabled = true;
  }

  function disable() {
    // Disabling the instance should also hide it
    // https://github.com/atomiks/tippy.js-react/issues/106
    instance.hide();
    instance.state.isEnabled = false;
  }

  function clearDelayTimeouts() {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    cancelAnimationFrame(scheduleHideAnimationFrame);
  }

  function setProps(partialProps) {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    invokeHook('onBeforeUpdate', [instance, partialProps]);
    removeListeners();
    var prevProps = instance.props;
    var nextProps = evaluateProps(reference, Object.assign({}, prevProps, removeUndefinedProps(partialProps), {
      ignoreAttributes: true
    }));
    instance.props = nextProps;
    addListeners();

    if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
      cleanupInteractiveMouseListeners();
      debouncedOnMouseMove = debounce$1(onMouseMove, nextProps.interactiveDebounce);
    } // Ensure stale aria-expanded attributes are removed


    if (prevProps.triggerTarget && !nextProps.triggerTarget) {
      normalizeToArray(prevProps.triggerTarget).forEach(function (node) {
        node.removeAttribute('aria-expanded');
      });
    } else if (nextProps.triggerTarget) {
      reference.removeAttribute('aria-expanded');
    }

    handleAriaExpandedAttribute();
    handleStyles();

    if (onUpdate) {
      onUpdate(prevProps, nextProps);
    }

    if (instance.popperInstance) {
      createPopperInstance(); // Fixes an issue with nested tippies if they are all getting re-rendered,
      // and the nested ones get re-rendered first.
      // https://github.com/atomiks/tippyjs-react/issues/177
      // TODO: find a cleaner / more efficient solution(!)

      getNestedPopperTree().forEach(function (nestedPopper) {
        // React (and other UI libs likely) requires a rAF wrapper as it flushes
        // its work in one
        requestAnimationFrame(nestedPopper._tippy.popperInstance.forceUpdate);
      });
    }

    invokeHook('onAfterUpdate', [instance, partialProps]);
  }

  function setContent(content) {
    instance.setProps({
      content: content
    });
  }

  function show() {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
    } // Early bail-out


    var isAlreadyVisible = instance.state.isVisible;
    var isDestroyed = instance.state.isDestroyed;
    var isDisabled = !instance.state.isEnabled;
    var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;
    var duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);

    if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
      return;
    } // Normalize `disabled` behavior across browsers.
    // Firefox allows events on disabled elements, but Chrome doesn't.
    // Using a wrapper element (i.e. <span>) is recommended.


    if (getCurrentTarget().hasAttribute('disabled')) {
      return;
    }

    invokeHook('onShow', [instance], false);

    if (instance.props.onShow(instance) === false) {
      return;
    }

    instance.state.isVisible = true;

    if (getIsDefaultRenderFn()) {
      popper.style.visibility = 'visible';
    }

    handleStyles();
    addDocumentPress();

    if (!instance.state.isMounted) {
      popper.style.transition = 'none';
    } // If flipping to the opposite side after hiding at least once, the
    // animation will use the wrong placement without resetting the duration


    if (getIsDefaultRenderFn()) {
      var _getDefaultTemplateCh2 = getDefaultTemplateChildren(),
          box = _getDefaultTemplateCh2.box,
          content = _getDefaultTemplateCh2.content;

      setTransitionDuration([box, content], 0);
    }

    onFirstUpdate = function onFirstUpdate() {
      var _instance$popperInsta2;

      if (!instance.state.isVisible || ignoreOnFirstUpdate) {
        return;
      }

      ignoreOnFirstUpdate = true; // reflow

      void popper.offsetHeight;
      popper.style.transition = instance.props.moveTransition;

      if (getIsDefaultRenderFn() && instance.props.animation) {
        var _getDefaultTemplateCh3 = getDefaultTemplateChildren(),
            _box = _getDefaultTemplateCh3.box,
            _content = _getDefaultTemplateCh3.content;

        setTransitionDuration([_box, _content], duration);
        setVisibilityState([_box, _content], 'visible');
      }

      handleAriaContentAttribute();
      handleAriaExpandedAttribute();
      pushIfUnique(mountedInstances, instance); // certain modifiers (e.g. `maxSize`) require a second update after the
      // popper has been positioned for the first time

      (_instance$popperInsta2 = instance.popperInstance) == null ? void 0 : _instance$popperInsta2.forceUpdate();
      invokeHook('onMount', [instance]);

      if (instance.props.animation && getIsDefaultRenderFn()) {
        onTransitionedIn(duration, function () {
          instance.state.isShown = true;
          invokeHook('onShown', [instance]);
        });
      }
    };

    mount();
  }

  function hide() {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
    } // Early bail-out


    var isAlreadyHidden = !instance.state.isVisible;
    var isDestroyed = instance.state.isDestroyed;
    var isDisabled = !instance.state.isEnabled;
    var duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return;
    }

    invokeHook('onHide', [instance], false);

    if (instance.props.onHide(instance) === false) {
      return;
    }

    instance.state.isVisible = false;
    instance.state.isShown = false;
    ignoreOnFirstUpdate = false;
    isVisibleFromClick = false;

    if (getIsDefaultRenderFn()) {
      popper.style.visibility = 'hidden';
    }

    cleanupInteractiveMouseListeners();
    removeDocumentPress();
    handleStyles(true);

    if (getIsDefaultRenderFn()) {
      var _getDefaultTemplateCh4 = getDefaultTemplateChildren(),
          box = _getDefaultTemplateCh4.box,
          content = _getDefaultTemplateCh4.content;

      if (instance.props.animation) {
        setTransitionDuration([box, content], duration);
        setVisibilityState([box, content], 'hidden');
      }
    }

    handleAriaContentAttribute();
    handleAriaExpandedAttribute();

    if (instance.props.animation) {
      if (getIsDefaultRenderFn()) {
        onTransitionedOut(duration, instance.unmount);
      }
    } else {
      instance.unmount();
    }
  }

  function hideWithInteractivity(event) {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hideWithInteractivity'));
    }

    getDocument().addEventListener('mousemove', debouncedOnMouseMove);
    pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
    debouncedOnMouseMove(event);
  }

  function unmount() {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('unmount'));
    }

    if (instance.state.isVisible) {
      instance.hide();
    }

    if (!instance.state.isMounted) {
      return;
    }

    destroyPopperInstance(); // If a popper is not interactive, it will be appended outside the popper
    // tree by default. This seems mainly for interactive tippies, but we should
    // find a workaround if possible

    getNestedPopperTree().forEach(function (nestedPopper) {
      nestedPopper._tippy.unmount();
    });

    if (popper.parentNode) {
      popper.parentNode.removeChild(popper);
    }

    mountedInstances = mountedInstances.filter(function (i) {
      return i !== instance;
    });
    instance.state.isMounted = false;
    invokeHook('onHidden', [instance]);
  }

  function destroy() {
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    instance.clearDelayTimeouts();
    instance.unmount();
    removeListeners();
    delete reference._tippy;
    instance.state.isDestroyed = true;
    invokeHook('onDestroy', [instance]);
  }
}

function tippy(targets, optionalProps) {
  if (optionalProps === void 0) {
    optionalProps = {};
  }

  var plugins = defaultProps.plugins.concat(optionalProps.plugins || []);
  /* istanbul ignore else */

  if (process.env.NODE_ENV !== "production") {
    validateTargets(targets);
    validateProps(optionalProps, plugins);
  }

  bindGlobalEventListeners();
  var passedProps = Object.assign({}, optionalProps, {
    plugins: plugins
  });
  var elements = getArrayOfElements(targets);
  /* istanbul ignore else */

  if (process.env.NODE_ENV !== "production") {
    var isSingleContentElement = isElement(passedProps.content);
    var isMoreThanOneReferenceElement = elements.length > 1;
    warnWhen(isSingleContentElement && isMoreThanOneReferenceElement, ['tippy() was passed an Element as the `content` prop, but more than', 'one tippy instance was created by this invocation. This means the', 'content element will only be appended to the last tippy instance.', '\n\n', 'Instead, pass the .innerHTML of the element, or use a function that', 'returns a cloned version of the element instead.', '\n\n', '1) content: element.innerHTML\n', '2) content: () => element.cloneNode(true)'].join(' '));
  }

  var instances = elements.reduce(function (acc, reference) {
    var instance = reference && createTippy(reference, passedProps);

    if (instance) {
      acc.push(instance);
    }

    return acc;
  }, []);
  return isElement(targets) ? instances[0] : instances;
}

tippy.defaultProps = defaultProps;
tippy.setDefaultProps = setDefaultProps;
tippy.currentInput = currentInput;

// every time the popper is destroyed (i.e. a new target), removing the styles
// and causing transitions to break for singletons when the console is open, but
// most notably for non-transform styles being used, `gpuAcceleration: false`.

Object.assign({}, applyStyles$1, {
  effect: function effect(_ref) {
    var state = _ref.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    } // intentionally return no cleanup function
    // return () => { ... }

  }
});

tippy.setDefaultProps({
  render: render
});

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */

function isObject$2(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject$2;

/** Detect free variable `global` from Node.js. */

var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal$1;

var freeGlobal = _freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$2 = freeGlobal || freeSelf || Function('return this')();

var _root = root$2;

var root$1 = _root;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now$1 = function() {
  return root$1.Date.now();
};

var now_1 = now$1;

/** Used to match a single whitespace character. */

var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex$1(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

var _trimmedEndIndex = trimmedEndIndex$1;

var trimmedEndIndex = _trimmedEndIndex;

/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim$1(string) {
  return string
    ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

var _baseTrim = baseTrim$1;

var root = _root;

/** Built-in value references. */
var Symbol$2 = root.Symbol;

var _Symbol = Symbol$2;

var Symbol$1 = _Symbol;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag$1(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag$1;

/** Used for built-in method references. */

var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}

var _objectToString = objectToString$1;

var Symbol = _Symbol,
    getRawTag = _getRawTag,
    objectToString = _objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag$1(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

var _baseGetTag = baseGetTag$1;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

function isObjectLike$1(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike$1;

var baseGetTag = _baseGetTag,
    isObjectLike = isObjectLike_1;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

var isSymbol_1 = isSymbol$1;

var baseTrim = _baseTrim,
    isObject$1 = isObject_1,
    isSymbol = isSymbol_1;

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

var toNumber_1 = toNumber$1;

var isObject = isObject_1,
    now = now_1,
    toNumber = toNumber_1;

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

var debounce_1 = debounce;

class BubbleMenuView {
    constructor({ editor, element, view, tippyOptions = {}, updateDelay = 250, shouldShow, }) {
        this.preventHide = false;
        this.shouldShow = ({ view, state, from, to, }) => {
            const { doc, selection } = state;
            const { empty } = selection;
            // Sometime check for `empty` is not enough.
            // Doubleclick an empty paragraph returns a node size of 2.
            // So we check also for an empty text size.
            const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection);
            // When clicking on a element inside the bubble menu the editor "blur" event
            // is called and the bubble menu item is focussed. In this case we should
            // consider the menu as part of the editor and keep showing the menu
            const isChildOfMenu = this.element.contains(document.activeElement);
            const hasEditorFocus = view.hasFocus() || isChildOfMenu;
            if (!hasEditorFocus || empty || isEmptyTextBlock || !this.editor.isEditable) {
                return false;
            }
            return true;
        };
        this.mousedownHandler = () => {
            this.preventHide = true;
        };
        this.dragstartHandler = () => {
            this.hide();
        };
        this.focusHandler = () => {
            // we use `setTimeout` to make sure `selection` is already updated
            setTimeout(() => this.update(this.editor.view));
        };
        this.blurHandler = ({ event }) => {
            var _a;
            if (this.preventHide) {
                this.preventHide = false;
                return;
            }
            if ((event === null || event === void 0 ? void 0 : event.relatedTarget) && ((_a = this.element.parentNode) === null || _a === void 0 ? void 0 : _a.contains(event.relatedTarget))) {
                return;
            }
            this.hide();
        };
        this.tippyBlurHandler = (event) => {
            this.blurHandler({ event });
        };
        this.updateHandler = (view, oldState) => {
            var _a, _b, _c;
            const { state, composing } = view;
            const { doc, selection } = state;
            const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection);
            if (composing || isSame) {
                return;
            }
            this.createTooltip();
            // support for CellSelections
            const { ranges } = selection;
            const from = Math.min(...ranges.map(range => range.$from.pos));
            const to = Math.max(...ranges.map(range => range.$to.pos));
            const shouldShow = (_a = this.shouldShow) === null || _a === void 0 ? void 0 : _a.call(this, {
                editor: this.editor,
                view,
                state,
                oldState,
                from,
                to,
            });
            if (!shouldShow) {
                this.hide();
                return;
            }
            (_b = this.tippy) === null || _b === void 0 ? void 0 : _b.setProps({
                getReferenceClientRect: ((_c = this.tippyOptions) === null || _c === void 0 ? void 0 : _c.getReferenceClientRect)
                    || (() => {
                        if (isNodeSelection(state.selection)) {
                            const node = view.nodeDOM(from);
                            if (node) {
                                return node.getBoundingClientRect();
                            }
                        }
                        return posToDOMRect(view, from, to);
                    }),
            });
            this.show();
        };
        this.editor = editor;
        this.element = element;
        this.view = view;
        this.updateDelay = updateDelay;
        if (shouldShow) {
            this.shouldShow = shouldShow;
        }
        this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true });
        this.view.dom.addEventListener('dragstart', this.dragstartHandler);
        this.editor.on('focus', this.focusHandler);
        this.editor.on('blur', this.blurHandler);
        this.tippyOptions = tippyOptions;
        // Detaches menu content from its current parent
        this.element.remove();
        this.element.style.visibility = 'visible';
    }
    createTooltip() {
        const { element: editorElement } = this.editor.options;
        const editorIsAttached = !!editorElement.parentElement;
        if (this.tippy || !editorIsAttached) {
            return;
        }
        this.tippy = tippy(editorElement, {
            duration: 0,
            getReferenceClientRect: null,
            content: this.element,
            interactive: true,
            trigger: 'manual',
            placement: 'top',
            hideOnClick: 'toggle',
            ...this.tippyOptions,
        });
        // maybe we have to hide tippy on its own blur event as well
        if (this.tippy.popper.firstChild) {
            this.tippy.popper.firstChild.addEventListener('blur', this.tippyBlurHandler);
        }
    }
    update(view, oldState) {
        const { state } = view;
        const hasValidSelection = state.selection.$from.pos !== state.selection.$to.pos;
        if (this.updateDelay > 0 && hasValidSelection) {
            debounce_1(this.updateHandler, this.updateDelay)(view, oldState);
        }
        else {
            this.updateHandler(view, oldState);
        }
    }
    show() {
        var _a;
        (_a = this.tippy) === null || _a === void 0 ? void 0 : _a.show();
    }
    hide() {
        var _a;
        (_a = this.tippy) === null || _a === void 0 ? void 0 : _a.hide();
    }
    destroy() {
        var _a, _b;
        if ((_a = this.tippy) === null || _a === void 0 ? void 0 : _a.popper.firstChild) {
            this.tippy.popper.firstChild.removeEventListener('blur', this.tippyBlurHandler);
        }
        (_b = this.tippy) === null || _b === void 0 ? void 0 : _b.destroy();
        this.element.removeEventListener('mousedown', this.mousedownHandler, { capture: true });
        this.view.dom.removeEventListener('dragstart', this.dragstartHandler);
        this.editor.off('focus', this.focusHandler);
        this.editor.off('blur', this.blurHandler);
    }
}
const BubbleMenuPlugin = (options) => {
    return new Plugin({
        key: typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
        view: view => new BubbleMenuView({ view, ...options }),
    });
};

Extension.create({
    name: 'bubbleMenu',
    addOptions() {
        return {
            element: null,
            tippyOptions: {},
            pluginKey: 'bubbleMenu',
            updateDelay: undefined,
            shouldShow: null,
        };
    },
    addProseMirrorPlugins() {
        if (!this.options.element) {
            return [];
        }
        return [
            BubbleMenuPlugin({
                pluginKey: this.options.pluginKey,
                editor: this.editor,
                element: this.options.element,
                tippyOptions: this.options.tippyOptions,
                updateDelay: this.options.updateDelay,
                shouldShow: this.options.shouldShow,
            }),
        ];
    },
});

class FloatingMenuView {
    constructor({ editor, element, view, tippyOptions = {}, shouldShow, }) {
        this.preventHide = false;
        this.shouldShow = ({ view, state }) => {
            const { selection } = state;
            const { $anchor, empty } = selection;
            const isRootDepth = $anchor.depth === 1;
            const isEmptyTextBlock = $anchor.parent.isTextblock && !$anchor.parent.type.spec.code && !$anchor.parent.textContent;
            if (!view.hasFocus()
                || !empty
                || !isRootDepth
                || !isEmptyTextBlock
                || !this.editor.isEditable) {
                return false;
            }
            return true;
        };
        this.mousedownHandler = () => {
            this.preventHide = true;
        };
        this.focusHandler = () => {
            // we use `setTimeout` to make sure `selection` is already updated
            setTimeout(() => this.update(this.editor.view));
        };
        this.blurHandler = ({ event }) => {
            var _a;
            if (this.preventHide) {
                this.preventHide = false;
                return;
            }
            if ((event === null || event === void 0 ? void 0 : event.relatedTarget) && ((_a = this.element.parentNode) === null || _a === void 0 ? void 0 : _a.contains(event.relatedTarget))) {
                return;
            }
            this.hide();
        };
        this.tippyBlurHandler = (event) => {
            this.blurHandler({ event });
        };
        this.editor = editor;
        this.element = element;
        this.view = view;
        if (shouldShow) {
            this.shouldShow = shouldShow;
        }
        this.element.addEventListener('mousedown', this.mousedownHandler, { capture: true });
        this.editor.on('focus', this.focusHandler);
        this.editor.on('blur', this.blurHandler);
        this.tippyOptions = tippyOptions;
        // Detaches menu content from its current parent
        this.element.remove();
        this.element.style.visibility = 'visible';
    }
    createTooltip() {
        const { element: editorElement } = this.editor.options;
        const editorIsAttached = !!editorElement.parentElement;
        if (this.tippy || !editorIsAttached) {
            return;
        }
        this.tippy = tippy(editorElement, {
            duration: 0,
            getReferenceClientRect: null,
            content: this.element,
            interactive: true,
            trigger: 'manual',
            placement: 'right',
            hideOnClick: 'toggle',
            ...this.tippyOptions,
        });
        // maybe we have to hide tippy on its own blur event as well
        if (this.tippy.popper.firstChild) {
            this.tippy.popper.firstChild.addEventListener('blur', this.tippyBlurHandler);
        }
    }
    update(view, oldState) {
        var _a, _b, _c;
        const { state } = view;
        const { doc, selection } = state;
        const { from, to } = selection;
        const isSame = oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection);
        if (isSame) {
            return;
        }
        this.createTooltip();
        const shouldShow = (_a = this.shouldShow) === null || _a === void 0 ? void 0 : _a.call(this, {
            editor: this.editor,
            view,
            state,
            oldState,
        });
        if (!shouldShow) {
            this.hide();
            return;
        }
        (_b = this.tippy) === null || _b === void 0 ? void 0 : _b.setProps({
            getReferenceClientRect: ((_c = this.tippyOptions) === null || _c === void 0 ? void 0 : _c.getReferenceClientRect) || (() => posToDOMRect(view, from, to)),
        });
        this.show();
    }
    show() {
        var _a;
        (_a = this.tippy) === null || _a === void 0 ? void 0 : _a.show();
    }
    hide() {
        var _a;
        (_a = this.tippy) === null || _a === void 0 ? void 0 : _a.hide();
    }
    destroy() {
        var _a, _b;
        if ((_a = this.tippy) === null || _a === void 0 ? void 0 : _a.popper.firstChild) {
            this.tippy.popper.firstChild.removeEventListener('blur', this.tippyBlurHandler);
        }
        (_b = this.tippy) === null || _b === void 0 ? void 0 : _b.destroy();
        this.element.removeEventListener('mousedown', this.mousedownHandler, { capture: true });
        this.editor.off('focus', this.focusHandler);
        this.editor.off('blur', this.blurHandler);
    }
}
const FloatingMenuPlugin = (options) => {
    return new Plugin({
        key: typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
        view: view => new FloatingMenuView({ view, ...options }),
    });
};

Extension.create({
    name: 'floatingMenu',
    addOptions() {
        return {
            element: null,
            tippyOptions: {},
            pluginKey: 'floatingMenu',
            shouldShow: null,
        };
    },
    addProseMirrorPlugins() {
        if (!this.options.element) {
            return [];
        }
        return [
            FloatingMenuPlugin({
                pluginKey: this.options.pluginKey,
                editor: this.editor,
                element: this.options.element,
                tippyOptions: this.options.tippyOptions,
                shouldShow: this.options.shouldShow,
            }),
        ];
    },
});

const BubbleMenu = (props) => {
    const [element, setElement] = React.useState(null);
    React.useEffect(() => {
        if (!element) {
            return;
        }
        if (props.editor.isDestroyed) {
            return;
        }
        const { pluginKey = 'bubbleMenu', editor, tippyOptions = {}, updateDelay, shouldShow = null, } = props;
        const plugin = BubbleMenuPlugin({
            updateDelay,
            editor,
            element,
            pluginKey,
            shouldShow,
            tippyOptions,
        });
        editor.registerPlugin(plugin);
        return () => editor.unregisterPlugin(pluginKey);
    }, [props.editor, element]);
    return (React.createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
};

class Editor extends Editor$1 {
    constructor() {
        super(...arguments);
        this.contentComponent = null;
    }
}

const Portals = ({ renderers }) => {
    return (React.createElement(React.Fragment, null, Object.entries(renderers).map(([key, renderer]) => {
        return ReactDOM.createPortal(renderer.reactElement, renderer.element, key);
    })));
};
class PureEditorContent extends React.Component {
    constructor(props) {
        super(props);
        this.editorContentRef = React.createRef();
        this.initialized = false;
        this.state = {
            renderers: {},
        };
    }
    componentDidMount() {
        this.init();
    }
    componentDidUpdate() {
        this.init();
    }
    init() {
        const { editor } = this.props;
        if (editor && editor.options.element) {
            if (editor.contentComponent) {
                return;
            }
            const element = this.editorContentRef.current;
            element.append(...editor.options.element.childNodes);
            editor.setOptions({
                element,
            });
            editor.contentComponent = this;
            editor.createNodeViews();
            this.initialized = true;
        }
    }
    maybeFlushSync(fn) {
        // Avoid calling flushSync until the editor is initialized.
        // Initialization happens during the componentDidMount or componentDidUpdate
        // lifecycle methods, and React doesn't allow calling flushSync from inside
        // a lifecycle method.
        if (this.initialized) {
            queueMicrotask(() => {
                ReactDOM.flushSync(fn);
            });
        }
        else {
            fn();
        }
    }
    setRenderer(id, renderer) {
        this.maybeFlushSync(() => {
            this.setState(({ renderers }) => ({
                renderers: {
                    ...renderers,
                    [id]: renderer,
                },
            }));
        });
    }
    removeRenderer(id) {
        this.maybeFlushSync(() => {
            this.setState(({ renderers }) => {
                const nextRenderers = { ...renderers };
                delete nextRenderers[id];
                return { renderers: nextRenderers };
            });
        });
    }
    componentWillUnmount() {
        const { editor } = this.props;
        if (!editor) {
            return;
        }
        this.initialized = false;
        if (!editor.isDestroyed) {
            editor.view.setProps({
                nodeViews: {},
            });
        }
        editor.contentComponent = null;
        if (!editor.options.element.firstChild) {
            return;
        }
        const newElement = document.createElement('div');
        newElement.append(...editor.options.element.childNodes);
        editor.setOptions({
            element: newElement,
        });
    }
    render() {
        const { editor, ...rest } = this.props;
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { ref: this.editorContentRef, ...rest }),
            React.createElement(Portals, { renderers: this.state.renderers })));
    }
}
const EditorContent = React.memo(PureEditorContent);

const FloatingMenu = (props) => {
    const [element, setElement] = React.useState(null);
    React.useEffect(() => {
        if (!element) {
            return;
        }
        if (props.editor.isDestroyed) {
            return;
        }
        const { pluginKey = 'floatingMenu', editor, tippyOptions = {}, shouldShow = null, } = props;
        const plugin = FloatingMenuPlugin({
            pluginKey,
            editor,
            element,
            tippyOptions,
            shouldShow,
        });
        editor.registerPlugin(plugin);
        return () => editor.unregisterPlugin(pluginKey);
    }, [
        props.editor,
        element,
    ]);
    return (React.createElement("div", { ref: setElement, className: props.className, style: { visibility: 'hidden' } }, props.children));
};

const ReactNodeViewContext = React.createContext({
    onDragStart: undefined,
});
const useReactNodeView = () => React.useContext(ReactNodeViewContext);

const NodeViewContent = props => {
    const Tag = props.as || 'div';
    const { nodeViewContentRef } = useReactNodeView();
    return (React.createElement(Tag, { ...props, ref: nodeViewContentRef, "data-node-view-content": "", style: {
            whiteSpace: 'pre-wrap',
            ...props.style,
        } }));
};

const NodeViewWrapper = React.forwardRef((props, ref) => {
    const { onDragStart } = useReactNodeView();
    const Tag = props.as || 'div';
    return (React.createElement(Tag, { ...props, ref: ref, "data-node-view-wrapper": "", onDragStart: onDragStart, style: {
            whiteSpace: 'normal',
            ...props.style,
        } }));
});

function isClassComponent(Component) {
    return !!(typeof Component === 'function'
        && Component.prototype
        && Component.prototype.isReactComponent);
}
function isForwardRefComponent(Component) {
    var _a;
    return !!(typeof Component === 'object'
        && ((_a = Component.$$typeof) === null || _a === void 0 ? void 0 : _a.toString()) === 'Symbol(react.forward_ref)');
}
class ReactRenderer {
    constructor(component, { editor, props = {}, as = 'div', className = '', }) {
        this.ref = null;
        this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString();
        this.component = component;
        this.editor = editor;
        this.props = props;
        this.element = document.createElement(as);
        this.element.classList.add('react-renderer');
        if (className) {
            this.element.classList.add(...className.split(' '));
        }
        this.render();
    }
    render() {
        var _a, _b;
        const Component = this.component;
        const props = this.props;
        if (isClassComponent(Component) || isForwardRefComponent(Component)) {
            props.ref = (ref) => {
                this.ref = ref;
            };
        }
        this.reactElement = React.createElement(Component, { ...props });
        (_b = (_a = this.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) === null || _b === void 0 ? void 0 : _b.setRenderer(this.id, this);
    }
    updateProps(props = {}) {
        this.props = {
            ...this.props,
            ...props,
        };
        this.render();
    }
    destroy() {
        var _a, _b;
        (_b = (_a = this.editor) === null || _a === void 0 ? void 0 : _a.contentComponent) === null || _b === void 0 ? void 0 : _b.removeRenderer(this.id);
    }
}

class ReactNodeView extends NodeView {
    mount() {
        const props = {
            editor: this.editor,
            node: this.node,
            decorations: this.decorations,
            selected: false,
            extension: this.extension,
            getPos: () => this.getPos(),
            updateAttributes: (attributes = {}) => this.updateAttributes(attributes),
            deleteNode: () => this.deleteNode(),
        };
        if (!this.component.displayName) {
            const capitalizeFirstChar = (string) => {
                return string.charAt(0).toUpperCase() + string.substring(1);
            };
            this.component.displayName = capitalizeFirstChar(this.extension.name);
        }
        const ReactNodeViewProvider = componentProps => {
            const Component = this.component;
            const onDragStart = this.onDragStart.bind(this);
            const nodeViewContentRef = element => {
                if (element && this.contentDOMElement && element.firstChild !== this.contentDOMElement) {
                    element.appendChild(this.contentDOMElement);
                }
            };
            return (React.createElement(React.Fragment, null,
                React.createElement(ReactNodeViewContext.Provider, { value: { onDragStart, nodeViewContentRef } },
                    React.createElement(Component, { ...componentProps }))));
        };
        ReactNodeViewProvider.displayName = 'ReactNodeView';
        this.contentDOMElement = this.node.isLeaf
            ? null
            : document.createElement(this.node.isInline ? 'span' : 'div');
        if (this.contentDOMElement) {
            // For some reason the whiteSpace prop is not inherited properly in Chrome and Safari
            // With this fix it seems to work fine
            // See: https://github.com/ueberdosis/tiptap/issues/1197
            this.contentDOMElement.style.whiteSpace = 'inherit';
        }
        let as = this.node.isInline ? 'span' : 'div';
        if (this.options.as) {
            as = this.options.as;
        }
        const { className = '' } = this.options;
        this.renderer = new ReactRenderer(ReactNodeViewProvider, {
            editor: this.editor,
            props,
            as,
            className: `node-${this.node.type.name} ${className}`.trim(),
        });
    }
    get dom() {
        var _a;
        if (this.renderer.element.firstElementChild
            && !((_a = this.renderer.element.firstElementChild) === null || _a === void 0 ? void 0 : _a.hasAttribute('data-node-view-wrapper'))) {
            throw Error('Please use the NodeViewWrapper component for your node view.');
        }
        return this.renderer.element;
    }
    get contentDOM() {
        if (this.node.isLeaf) {
            return null;
        }
        return this.contentDOMElement;
    }
    update(node, decorations) {
        const updateProps = (props) => {
            this.renderer.updateProps(props);
        };
        if (node.type !== this.node.type) {
            return false;
        }
        if (typeof this.options.update === 'function') {
            const oldNode = this.node;
            const oldDecorations = this.decorations;
            this.node = node;
            this.decorations = decorations;
            return this.options.update({
                oldNode,
                oldDecorations,
                newNode: node,
                newDecorations: decorations,
                updateProps: () => updateProps({ node, decorations }),
            });
        }
        if (node === this.node && this.decorations === decorations) {
            return true;
        }
        this.node = node;
        this.decorations = decorations;
        updateProps({ node, decorations });
        return true;
    }
    selectNode() {
        this.renderer.updateProps({
            selected: true,
        });
    }
    deselectNode() {
        this.renderer.updateProps({
            selected: false,
        });
    }
    destroy() {
        this.renderer.destroy();
        this.contentDOMElement = null;
    }
}
function ReactNodeViewRenderer(component, options) {
    return (props) => {
        // try to get the parent component
        // this is important for vue devtools to show the component hierarchy correctly
        // maybe it’s `undefined` because <editor-content> isn’t rendered yet
        if (!props.editor.contentComponent) {
            return {};
        }
        return new ReactNodeView(component, props, options);
    };
}

function useForceUpdate() {
    const [, setValue] = React.useState(0);
    return () => setValue(value => value + 1);
}
const useEditor = (options = {}, deps = []) => {
    const [editor, setEditor] = React.useState(null);
    const forceUpdate = useForceUpdate();
    React.useEffect(() => {
        let isMounted = true;
        const instance = new Editor(options);
        setEditor(instance);
        instance.on('transaction', () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (isMounted) {
                        forceUpdate();
                    }
                });
            });
        });
        return () => {
            instance.destroy();
            isMounted = false;
        };
    }, deps);
    return editor;
};

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

const inputRegex$4 = /^\s*>\s$/;
const Blockquote = Node.create({
    name: 'blockquote',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    content: 'block+',
    group: 'block',
    defining: true,
    parseHTML() {
        return [
            { tag: 'blockquote' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['blockquote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setBlockquote: () => ({ commands }) => {
                return commands.wrapIn(this.name);
            },
            toggleBlockquote: () => ({ commands }) => {
                return commands.toggleWrap(this.name);
            },
            unsetBlockquote: () => ({ commands }) => {
                return commands.lift(this.name);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
        };
    },
    addInputRules() {
        return [
            wrappingInputRule({
                find: inputRegex$4,
                type: this.type,
            }),
        ];
    },
});

const ListItem$2 = Node.create({
    name: 'listItem',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    content: 'paragraph block*',
    defining: true,
    parseHTML() {
        return [
            {
                tag: 'li',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addKeyboardShortcuts() {
        return {
            Enter: () => this.editor.commands.splitListItem(this.name),
            Tab: () => this.editor.commands.sinkListItem(this.name),
            'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
        };
    },
});

const TextStyle$1 = Mark.create({
    name: 'textStyle',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: element => {
                    const hasStyles = element.hasAttribute('style');
                    if (!hasStyles) {
                        return false;
                    }
                    return {};
                },
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            removeEmptyTextStyle: () => ({ state, commands }) => {
                const attributes = getMarkAttributes(state, this.type);
                const hasStyles = Object.entries(attributes).some(([, value]) => !!value);
                if (hasStyles) {
                    return true;
                }
                return commands.unsetMark(this.name);
            },
        };
    },
});

const inputRegex$3 = /^\s*([-+*])\s$/;
const BulletList = Node.create({
    name: 'bulletList',
    addOptions() {
        return {
            itemTypeName: 'listItem',
            HTMLAttributes: {},
            keepMarks: false,
            keepAttributes: false,
        };
    },
    group: 'block list',
    content() {
        return `${this.options.itemTypeName}+`;
    },
    parseHTML() {
        return [
            { tag: 'ul' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['ul', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            toggleBulletList: () => ({ commands, chain }) => {
                if (this.options.keepAttributes) {
                    return chain().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ListItem$2.name, this.editor.getAttributes(TextStyle$1.name)).run();
                }
                return commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
        };
    },
    addInputRules() {
        let inputRule = wrappingInputRule({
            find: inputRegex$3,
            type: this.type,
        });
        if (this.options.keepMarks || this.options.keepAttributes) {
            inputRule = wrappingInputRule({
                find: inputRegex$3,
                type: this.type,
                keepMarks: this.options.keepMarks,
                keepAttributes: this.options.keepAttributes,
                getAttributes: () => { return this.editor.getAttributes(TextStyle$1.name); },
                editor: this.editor,
            });
        }
        return [
            inputRule,
        ];
    },
});

const inputRegex$2 = /(?:^|\s)((?:`)((?:[^`]+))(?:`))$/;
const pasteRegex$1 = /(?:^|\s)((?:`)((?:[^`]+))(?:`))/g;
const Code = Mark.create({
    name: 'code',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    excludes: '_',
    code: true,
    exitable: true,
    parseHTML() {
        return [
            { tag: 'code' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['code', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setCode: () => ({ commands }) => {
                return commands.setMark(this.name);
            },
            toggleCode: () => ({ commands }) => {
                return commands.toggleMark(this.name);
            },
            unsetCode: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-e': () => this.editor.commands.toggleCode(),
        };
    },
    addInputRules() {
        return [
            markInputRule({
                find: inputRegex$2,
                type: this.type,
            }),
        ];
    },
    addPasteRules() {
        return [
            markPasteRule({
                find: pasteRegex$1,
                type: this.type,
            }),
        ];
    },
});

const backtickInputRegex = /^```([a-z]+)?[\s\n]$/;
const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/;
const CodeBlock = Node.create({
    name: 'codeBlock',
    addOptions() {
        return {
            languageClassPrefix: 'language-',
            exitOnTripleEnter: true,
            exitOnArrowDown: true,
            HTMLAttributes: {},
        };
    },
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    addAttributes() {
        return {
            language: {
                default: null,
                parseHTML: element => {
                    var _a;
                    const { languageClassPrefix } = this.options;
                    const classNames = [...(((_a = element.firstElementChild) === null || _a === void 0 ? void 0 : _a.classList) || [])];
                    const languages = classNames
                        .filter(className => className.startsWith(languageClassPrefix))
                        .map(className => className.replace(languageClassPrefix, ''));
                    const language = languages[0];
                    if (!language) {
                        return null;
                    }
                    return language;
                },
                rendered: false,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'pre',
                preserveWhitespace: 'full',
            },
        ];
    },
    renderHTML({ node, HTMLAttributes }) {
        return [
            'pre',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            [
                'code',
                {
                    class: node.attrs.language
                        ? this.options.languageClassPrefix + node.attrs.language
                        : null,
                },
                0,
            ],
        ];
    },
    addCommands() {
        return {
            setCodeBlock: attributes => ({ commands }) => {
                return commands.setNode(this.name, attributes);
            },
            toggleCodeBlock: attributes => ({ commands }) => {
                return commands.toggleNode(this.name, 'paragraph', attributes);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
            // remove code block when at start of document or code block is empty
            Backspace: () => {
                const { empty, $anchor } = this.editor.state.selection;
                const isAtStart = $anchor.pos === 1;
                if (!empty || $anchor.parent.type.name !== this.name) {
                    return false;
                }
                if (isAtStart || !$anchor.parent.textContent.length) {
                    return this.editor.commands.clearNodes();
                }
                return false;
            },
            // exit node on triple enter
            Enter: ({ editor }) => {
                if (!this.options.exitOnTripleEnter) {
                    return false;
                }
                const { state } = editor;
                const { selection } = state;
                const { $from, empty } = selection;
                if (!empty || $from.parent.type !== this.type) {
                    return false;
                }
                const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
                const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n');
                if (!isAtEnd || !endsWithDoubleNewline) {
                    return false;
                }
                return editor
                    .chain()
                    .command(({ tr }) => {
                    tr.delete($from.pos - 2, $from.pos);
                    return true;
                })
                    .exitCode()
                    .run();
            },
            // exit node on arrow down
            ArrowDown: ({ editor }) => {
                if (!this.options.exitOnArrowDown) {
                    return false;
                }
                const { state } = editor;
                const { selection, doc } = state;
                const { $from, empty } = selection;
                if (!empty || $from.parent.type !== this.type) {
                    return false;
                }
                const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
                if (!isAtEnd) {
                    return false;
                }
                const after = $from.after();
                if (after === undefined) {
                    return false;
                }
                const nodeAfter = doc.nodeAt(after);
                if (nodeAfter) {
                    return false;
                }
                return editor.commands.exitCode();
            },
        };
    },
    addInputRules() {
        return [
            textblockTypeInputRule({
                find: backtickInputRegex,
                type: this.type,
                getAttributes: match => ({
                    language: match[1],
                }),
            }),
            textblockTypeInputRule({
                find: tildeInputRegex,
                type: this.type,
                getAttributes: match => ({
                    language: match[1],
                }),
            }),
        ];
    },
    addProseMirrorPlugins() {
        return [
            // this plugin creates a code block for pasted content from VS Code
            // we can also detect the copied code language
            new Plugin({
                key: new PluginKey('codeBlockVSCodeHandler'),
                props: {
                    handlePaste: (view, event) => {
                        if (!event.clipboardData) {
                            return false;
                        }
                        // don’t create a new code block within code blocks
                        if (this.editor.isActive(this.type.name)) {
                            return false;
                        }
                        const text = event.clipboardData.getData('text/plain');
                        const vscode = event.clipboardData.getData('vscode-editor-data');
                        const vscodeData = vscode ? JSON.parse(vscode) : undefined;
                        const language = vscodeData === null || vscodeData === void 0 ? void 0 : vscodeData.mode;
                        if (!text || !language) {
                            return false;
                        }
                        const { tr } = view.state;
                        // create an empty code block
                        tr.replaceSelectionWith(this.type.create({ language }));
                        // put cursor inside the newly created code block
                        tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, tr.selection.from - 2))));
                        // add text to code block
                        // strip carriage return chars from text pasted as code
                        // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
                        tr.insertText(text.replace(/\r\n?/g, '\n'));
                        // store meta information
                        // this is useful for other plugins that depends on the paste event
                        // like the paste rule plugin
                        tr.setMeta('paste', true);
                        view.dispatch(tr);
                        return true;
                    },
                },
            }),
        ];
    },
});

const Document = Node.create({
    name: 'doc',
    topNode: true,
    content: 'block+',
});

/**
Gap cursor selections are represented using this class. Its
`$anchor` and `$head` properties both point at the cursor position.
*/
class GapCursor extends Selection {
    /**
    Create a gap cursor.
    */
    constructor($pos) {
        super($pos, $pos);
    }
    map(doc, mapping) {
        let $pos = doc.resolve(mapping.map(this.head));
        return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos);
    }
    content() { return Slice.empty; }
    eq(other) {
        return other instanceof GapCursor && other.head == this.head;
    }
    toJSON() {
        return { type: "gapcursor", pos: this.head };
    }
    /**
    @internal
    */
    static fromJSON(doc, json) {
        if (typeof json.pos != "number")
            throw new RangeError("Invalid input for GapCursor.fromJSON");
        return new GapCursor(doc.resolve(json.pos));
    }
    /**
    @internal
    */
    getBookmark() { return new GapBookmark(this.anchor); }
    /**
    @internal
    */
    static valid($pos) {
        let parent = $pos.parent;
        if (parent.isTextblock || !closedBefore($pos) || !closedAfter($pos))
            return false;
        let override = parent.type.spec.allowGapCursor;
        if (override != null)
            return override;
        let deflt = parent.contentMatchAt($pos.index()).defaultType;
        return deflt && deflt.isTextblock;
    }
    /**
    @internal
    */
    static findGapCursorFrom($pos, dir, mustMove = false) {
        search: for (;;) {
            if (!mustMove && GapCursor.valid($pos))
                return $pos;
            let pos = $pos.pos, next = null;
            // Scan up from this position
            for (let d = $pos.depth;; d--) {
                let parent = $pos.node(d);
                if (dir > 0 ? $pos.indexAfter(d) < parent.childCount : $pos.index(d) > 0) {
                    next = parent.child(dir > 0 ? $pos.indexAfter(d) : $pos.index(d) - 1);
                    break;
                }
                else if (d == 0) {
                    return null;
                }
                pos += dir;
                let $cur = $pos.doc.resolve(pos);
                if (GapCursor.valid($cur))
                    return $cur;
            }
            // And then down into the next node
            for (;;) {
                let inside = dir > 0 ? next.firstChild : next.lastChild;
                if (!inside) {
                    if (next.isAtom && !next.isText && !NodeSelection.isSelectable(next)) {
                        $pos = $pos.doc.resolve(pos + next.nodeSize * dir);
                        mustMove = false;
                        continue search;
                    }
                    break;
                }
                next = inside;
                pos += dir;
                let $cur = $pos.doc.resolve(pos);
                if (GapCursor.valid($cur))
                    return $cur;
            }
            return null;
        }
    }
}
GapCursor.prototype.visible = false;
GapCursor.findFrom = GapCursor.findGapCursorFrom;
Selection.jsonID("gapcursor", GapCursor);
class GapBookmark {
    constructor(pos) {
        this.pos = pos;
    }
    map(mapping) {
        return new GapBookmark(mapping.map(this.pos));
    }
    resolve(doc) {
        let $pos = doc.resolve(this.pos);
        return GapCursor.valid($pos) ? new GapCursor($pos) : Selection.near($pos);
    }
}
function closedBefore($pos) {
    for (let d = $pos.depth; d >= 0; d--) {
        let index = $pos.index(d), parent = $pos.node(d);
        // At the start of this parent, look at next one
        if (index == 0) {
            if (parent.type.spec.isolating)
                return true;
            continue;
        }
        // See if the node before (or its first ancestor) is closed
        for (let before = parent.child(index - 1);; before = before.lastChild) {
            if ((before.childCount == 0 && !before.inlineContent) || before.isAtom || before.type.spec.isolating)
                return true;
            if (before.inlineContent)
                return false;
        }
    }
    // Hit start of document
    return true;
}
function closedAfter($pos) {
    for (let d = $pos.depth; d >= 0; d--) {
        let index = $pos.indexAfter(d), parent = $pos.node(d);
        if (index == parent.childCount) {
            if (parent.type.spec.isolating)
                return true;
            continue;
        }
        for (let after = parent.child(index);; after = after.firstChild) {
            if ((after.childCount == 0 && !after.inlineContent) || after.isAtom || after.type.spec.isolating)
                return true;
            if (after.inlineContent)
                return false;
        }
    }
    return true;
}

/**
Create a gap cursor plugin. When enabled, this will capture clicks
near and arrow-key-motion past places that don't have a normally
selectable position nearby, and create a gap cursor selection for
them. The cursor is drawn as an element with class
`ProseMirror-gapcursor`. You can either include
`style/gapcursor.css` from the package's directory or add your own
styles to make it visible.
*/
function gapCursor() {
    return new Plugin({
        props: {
            decorations: drawGapCursor,
            createSelectionBetween(_view, $anchor, $head) {
                return $anchor.pos == $head.pos && GapCursor.valid($head) ? new GapCursor($head) : null;
            },
            handleClick,
            handleKeyDown,
            handleDOMEvents: { beforeinput: beforeinput }
        }
    });
}
const handleKeyDown = keydownHandler({
    "ArrowLeft": arrow("horiz", -1),
    "ArrowRight": arrow("horiz", 1),
    "ArrowUp": arrow("vert", -1),
    "ArrowDown": arrow("vert", 1)
});
function arrow(axis, dir) {
    const dirStr = axis == "vert" ? (dir > 0 ? "down" : "up") : (dir > 0 ? "right" : "left");
    return function (state, dispatch, view) {
        let sel = state.selection;
        let $start = dir > 0 ? sel.$to : sel.$from, mustMove = sel.empty;
        if (sel instanceof TextSelection) {
            if (!view.endOfTextblock(dirStr) || $start.depth == 0)
                return false;
            mustMove = false;
            $start = state.doc.resolve(dir > 0 ? $start.after() : $start.before());
        }
        let $found = GapCursor.findGapCursorFrom($start, dir, mustMove);
        if (!$found)
            return false;
        if (dispatch)
            dispatch(state.tr.setSelection(new GapCursor($found)));
        return true;
    };
}
function handleClick(view, pos, event) {
    if (!view || !view.editable)
        return false;
    let $pos = view.state.doc.resolve(pos);
    if (!GapCursor.valid($pos))
        return false;
    let clickPos = view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (clickPos && clickPos.inside > -1 && NodeSelection.isSelectable(view.state.doc.nodeAt(clickPos.inside)))
        return false;
    view.dispatch(view.state.tr.setSelection(new GapCursor($pos)));
    return true;
}
// This is a hack that, when a composition starts while a gap cursor
// is active, quickly creates an inline context for the composition to
// happen in, to avoid it being aborted by the DOM selection being
// moved into a valid position.
function beforeinput(view, event) {
    if (event.inputType != "insertCompositionText" || !(view.state.selection instanceof GapCursor))
        return false;
    let { $from } = view.state.selection;
    let insert = $from.parent.contentMatchAt($from.index()).findWrapping(view.state.schema.nodes.text);
    if (!insert)
        return false;
    let frag = Fragment.empty;
    for (let i = insert.length - 1; i >= 0; i--)
        frag = Fragment.from(insert[i].createAndFill(null, frag));
    let tr = view.state.tr.replace($from.pos, $from.pos, new Slice(frag, 0, 0));
    tr.setSelection(TextSelection.near(tr.doc.resolve($from.pos + 1)));
    view.dispatch(tr);
    return false;
}
function drawGapCursor(state) {
    if (!(state.selection instanceof GapCursor))
        return null;
    let node = document.createElement("div");
    node.className = "ProseMirror-gapcursor";
    return DecorationSet.create(state.doc, [Decoration.widget(state.selection.head, node, { key: "gapcursor" })]);
}

const Gapcursor = Extension.create({
    name: 'gapCursor',
    addProseMirrorPlugins() {
        return [
            gapCursor(),
        ];
    },
    extendNodeSchema(extension) {
        var _a;
        const context = {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
        };
        return {
            allowGapCursor: (_a = callOrReturn(getExtensionField(extension, 'allowGapCursor', context))) !== null && _a !== void 0 ? _a : null,
        };
    },
});

const HardBreak = Node.create({
    name: 'hardBreak',
    addOptions() {
        return {
            keepMarks: true,
            HTMLAttributes: {},
        };
    },
    inline: true,
    group: 'inline',
    selectable: false,
    parseHTML() {
        return [
            { tag: 'br' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['br', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },
    renderText() {
        return '\n';
    },
    addCommands() {
        return {
            setHardBreak: () => ({ commands, chain, state, editor, }) => {
                return commands.first([
                    () => commands.exitCode(),
                    () => commands.command(() => {
                        const { selection, storedMarks } = state;
                        if (selection.$from.parent.type.spec.isolating) {
                            return false;
                        }
                        const { keepMarks } = this.options;
                        const { splittableMarks } = editor.extensionManager;
                        const marks = storedMarks
                            || (selection.$to.parentOffset && selection.$from.marks());
                        return chain()
                            .insertContent({ type: this.name })
                            .command(({ tr, dispatch }) => {
                            if (dispatch && marks && keepMarks) {
                                const filteredMarks = marks
                                    .filter(mark => splittableMarks.includes(mark.type.name));
                                tr.ensureMarks(filteredMarks);
                            }
                            return true;
                        })
                            .run();
                    }),
                ]);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => this.editor.commands.setHardBreak(),
            'Shift-Enter': () => this.editor.commands.setHardBreak(),
        };
    },
});

const Heading = Node.create({
    name: 'heading',
    addOptions() {
        return {
            levels: [1, 2, 3, 4, 5, 6],
            HTMLAttributes: {},
        };
    },
    content: 'inline*',
    group: 'block',
    defining: true,
    addAttributes() {
        return {
            level: {
                default: 1,
                rendered: false,
            },
        };
    },
    parseHTML() {
        return this.options.levels
            .map((level) => ({
            tag: `h${level}`,
            attrs: { level },
        }));
    },
    renderHTML({ node, HTMLAttributes }) {
        const hasLevel = this.options.levels.includes(node.attrs.level);
        const level = hasLevel
            ? node.attrs.level
            : this.options.levels[0];
        return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setHeading: attributes => ({ commands }) => {
                if (!this.options.levels.includes(attributes.level)) {
                    return false;
                }
                return commands.setNode(this.name, attributes);
            },
            toggleHeading: attributes => ({ commands }) => {
                if (!this.options.levels.includes(attributes.level)) {
                    return false;
                }
                return commands.toggleNode(this.name, 'paragraph', attributes);
            },
        };
    },
    addKeyboardShortcuts() {
        return this.options.levels.reduce((items, level) => ({
            ...items,
            ...{
                [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level }),
            },
        }), {});
    },
    addInputRules() {
        return this.options.levels.map(level => {
            return textblockTypeInputRule({
                find: new RegExp(`^(#{1,${level}})\\s$`),
                type: this.type,
                getAttributes: {
                    level,
                },
            });
        });
    },
});

var GOOD_LEAF_SIZE = 200;

// :: class<T> A rope sequence is a persistent sequence data structure
// that supports appending, prepending, and slicing without doing a
// full copy. It is represented as a mostly-balanced tree.
var RopeSequence = function RopeSequence () {};

RopeSequence.prototype.append = function append (other) {
  if (!other.length) { return this }
  other = RopeSequence.from(other);

  return (!this.length && other) ||
    (other.length < GOOD_LEAF_SIZE && this.leafAppend(other)) ||
    (this.length < GOOD_LEAF_SIZE && other.leafPrepend(this)) ||
    this.appendInner(other)
};

// :: (union<[T], RopeSequence<T>>) → RopeSequence<T>
// Prepend an array or other rope to this one, returning a new rope.
RopeSequence.prototype.prepend = function prepend (other) {
  if (!other.length) { return this }
  return RopeSequence.from(other).append(this)
};

RopeSequence.prototype.appendInner = function appendInner (other) {
  return new Append(this, other)
};

// :: (?number, ?number) → RopeSequence<T>
// Create a rope repesenting a sub-sequence of this rope.
RopeSequence.prototype.slice = function slice (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from >= to) { return RopeSequence.empty }
  return this.sliceInner(Math.max(0, from), Math.min(this.length, to))
};

// :: (number) → T
// Retrieve the element at the given position from this rope.
RopeSequence.prototype.get = function get (i) {
  if (i < 0 || i >= this.length) { return undefined }
  return this.getInner(i)
};

// :: ((element: T, index: number) → ?bool, ?number, ?number)
// Call the given function for each element between the given
// indices. This tends to be more efficient than looping over the
// indices and calling `get`, because it doesn't have to descend the
// tree for every element.
RopeSequence.prototype.forEach = function forEach (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from <= to)
    { this.forEachInner(f, from, to, 0); }
  else
    { this.forEachInvertedInner(f, from, to, 0); }
};

// :: ((element: T, index: number) → U, ?number, ?number) → [U]
// Map the given functions over the elements of the rope, producing
// a flat array.
RopeSequence.prototype.map = function map (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  var result = [];
  this.forEach(function (elt, i) { return result.push(f(elt, i)); }, from, to);
  return result
};

// :: (?union<[T], RopeSequence<T>>) → RopeSequence<T>
// Create a rope representing the given array, or return the rope
// itself if a rope was given.
RopeSequence.from = function from (values) {
  if (values instanceof RopeSequence) { return values }
  return values && values.length ? new Leaf(values) : RopeSequence.empty
};

var Leaf = /*@__PURE__*/(function (RopeSequence) {
  function Leaf(values) {
    RopeSequence.call(this);
    this.values = values;
  }

  if ( RopeSequence ) Leaf.__proto__ = RopeSequence;
  Leaf.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Leaf.prototype.constructor = Leaf;

  var prototypeAccessors = { length: { configurable: true },depth: { configurable: true } };

  Leaf.prototype.flatten = function flatten () {
    return this.values
  };

  Leaf.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    return new Leaf(this.values.slice(from, to))
  };

  Leaf.prototype.getInner = function getInner (i) {
    return this.values[i]
  };

  Leaf.prototype.forEachInner = function forEachInner (f, from, to, start) {
    for (var i = from; i < to; i++)
      { if (f(this.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    for (var i = from - 1; i >= to; i--)
      { if (f(this.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.leafAppend = function leafAppend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(this.values.concat(other.flatten())) }
  };

  Leaf.prototype.leafPrepend = function leafPrepend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(other.flatten().concat(this.values)) }
  };

  prototypeAccessors.length.get = function () { return this.values.length };

  prototypeAccessors.depth.get = function () { return 0 };

  Object.defineProperties( Leaf.prototype, prototypeAccessors );

  return Leaf;
}(RopeSequence));

// :: RopeSequence
// The empty rope sequence.
RopeSequence.empty = new Leaf([]);

var Append = /*@__PURE__*/(function (RopeSequence) {
  function Append(left, right) {
    RopeSequence.call(this);
    this.left = left;
    this.right = right;
    this.length = left.length + right.length;
    this.depth = Math.max(left.depth, right.depth) + 1;
  }

  if ( RopeSequence ) Append.__proto__ = RopeSequence;
  Append.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Append.prototype.constructor = Append;

  Append.prototype.flatten = function flatten () {
    return this.left.flatten().concat(this.right.flatten())
  };

  Append.prototype.getInner = function getInner (i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length)
  };

  Append.prototype.forEachInner = function forEachInner (f, from, to, start) {
    var leftLen = this.left.length;
    if (from < leftLen &&
        this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false)
      { return false }
    if (to > leftLen &&
        this.right.forEachInner(f, Math.max(from - leftLen, 0), Math.min(this.length, to) - leftLen, start + leftLen) === false)
      { return false }
  };

  Append.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    var leftLen = this.left.length;
    if (from > leftLen &&
        this.right.forEachInvertedInner(f, from - leftLen, Math.max(to, leftLen) - leftLen, start + leftLen) === false)
      { return false }
    if (to < leftLen &&
        this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) === false)
      { return false }
  };

  Append.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    var leftLen = this.left.length;
    if (to <= leftLen) { return this.left.slice(from, to) }
    if (from >= leftLen) { return this.right.slice(from - leftLen, to - leftLen) }
    return this.left.slice(from, leftLen).append(this.right.slice(0, to - leftLen))
  };

  Append.prototype.leafAppend = function leafAppend (other) {
    var inner = this.right.leafAppend(other);
    if (inner) { return new Append(this.left, inner) }
  };

  Append.prototype.leafPrepend = function leafPrepend (other) {
    var inner = this.left.leafPrepend(other);
    if (inner) { return new Append(inner, this.right) }
  };

  Append.prototype.appendInner = function appendInner (other) {
    if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1)
      { return new Append(this.left, new Append(this.right, other)) }
    return new Append(this, other)
  };

  return Append;
}(RopeSequence));

var ropeSequence = RopeSequence;

// ProseMirror's history isn't simply a way to roll back to a previous
// state, because ProseMirror supports applying changes without adding
// them to the history (for example during collaboration).
//
// To this end, each 'Branch' (one for the undo history and one for
// the redo history) keeps an array of 'Items', which can optionally
// hold a step (an actual undoable change), and always hold a position
// map (which is needed to move changes below them to apply to the
// current document).
//
// An item that has both a step and a selection bookmark is the start
// of an 'event' — a group of changes that will be undone or redone at
// once. (It stores only the bookmark, since that way we don't have to
// provide a document until the selection is actually applied, which
// is useful when compressing.)
// Used to schedule history compression
const max_empty_items = 500;
class Branch {
    constructor(items, eventCount) {
        this.items = items;
        this.eventCount = eventCount;
    }
    // Pop the latest event off the branch's history and apply it
    // to a document transform.
    popEvent(state, preserveItems) {
        if (this.eventCount == 0)
            return null;
        let end = this.items.length;
        for (;; end--) {
            let next = this.items.get(end - 1);
            if (next.selection) {
                --end;
                break;
            }
        }
        let remap, mapFrom;
        if (preserveItems) {
            remap = this.remapping(end, this.items.length);
            mapFrom = remap.maps.length;
        }
        let transform = state.tr;
        let selection, remaining;
        let addAfter = [], addBefore = [];
        this.items.forEach((item, i) => {
            if (!item.step) {
                if (!remap) {
                    remap = this.remapping(end, i + 1);
                    mapFrom = remap.maps.length;
                }
                mapFrom--;
                addBefore.push(item);
                return;
            }
            if (remap) {
                addBefore.push(new Item(item.map));
                let step = item.step.map(remap.slice(mapFrom)), map;
                if (step && transform.maybeStep(step).doc) {
                    map = transform.mapping.maps[transform.mapping.maps.length - 1];
                    addAfter.push(new Item(map, undefined, undefined, addAfter.length + addBefore.length));
                }
                mapFrom--;
                if (map)
                    remap.appendMap(map, mapFrom);
            }
            else {
                transform.maybeStep(item.step);
            }
            if (item.selection) {
                selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
                remaining = new Branch(this.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this.eventCount - 1);
                return false;
            }
        }, this.items.length, 0);
        return { remaining: remaining, transform, selection: selection };
    }
    // Create a new branch with the given transform added.
    addTransform(transform, selection, histOptions, preserveItems) {
        let newItems = [], eventCount = this.eventCount;
        let oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;
        for (let i = 0; i < transform.steps.length; i++) {
            let step = transform.steps[i].invert(transform.docs[i]);
            let item = new Item(transform.mapping.maps[i], step, selection), merged;
            if (merged = lastItem && lastItem.merge(item)) {
                item = merged;
                if (i)
                    newItems.pop();
                else
                    oldItems = oldItems.slice(0, oldItems.length - 1);
            }
            newItems.push(item);
            if (selection) {
                eventCount++;
                selection = undefined;
            }
            if (!preserveItems)
                lastItem = item;
        }
        let overflow = eventCount - histOptions.depth;
        if (overflow > DEPTH_OVERFLOW) {
            oldItems = cutOffEvents(oldItems, overflow);
            eventCount -= overflow;
        }
        return new Branch(oldItems.append(newItems), eventCount);
    }
    remapping(from, to) {
        let maps = new Mapping;
        this.items.forEach((item, i) => {
            let mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from
                ? maps.maps.length - item.mirrorOffset : undefined;
            maps.appendMap(item.map, mirrorPos);
        }, from, to);
        return maps;
    }
    addMaps(array) {
        if (this.eventCount == 0)
            return this;
        return new Branch(this.items.append(array.map(map => new Item(map))), this.eventCount);
    }
    // When the collab module receives remote changes, the history has
    // to know about those, so that it can adjust the steps that were
    // rebased on top of the remote changes, and include the position
    // maps for the remote changes in its array of items.
    rebased(rebasedTransform, rebasedCount) {
        if (!this.eventCount)
            return this;
        let rebasedItems = [], start = Math.max(0, this.items.length - rebasedCount);
        let mapping = rebasedTransform.mapping;
        let newUntil = rebasedTransform.steps.length;
        let eventCount = this.eventCount;
        this.items.forEach(item => { if (item.selection)
            eventCount--; }, start);
        let iRebased = rebasedCount;
        this.items.forEach(item => {
            let pos = mapping.getMirror(--iRebased);
            if (pos == null)
                return;
            newUntil = Math.min(newUntil, pos);
            let map = mapping.maps[pos];
            if (item.step) {
                let step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
                let selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
                if (selection)
                    eventCount++;
                rebasedItems.push(new Item(map, step, selection));
            }
            else {
                rebasedItems.push(new Item(map));
            }
        }, start);
        let newMaps = [];
        for (let i = rebasedCount; i < newUntil; i++)
            newMaps.push(new Item(mapping.maps[i]));
        let items = this.items.slice(0, start).append(newMaps).append(rebasedItems);
        let branch = new Branch(items, eventCount);
        if (branch.emptyItemCount() > max_empty_items)
            branch = branch.compress(this.items.length - rebasedItems.length);
        return branch;
    }
    emptyItemCount() {
        let count = 0;
        this.items.forEach(item => { if (!item.step)
            count++; });
        return count;
    }
    // Compressing a branch means rewriting it to push the air (map-only
    // items) out. During collaboration, these naturally accumulate
    // because each remote change adds one. The `upto` argument is used
    // to ensure that only the items below a given level are compressed,
    // because `rebased` relies on a clean, untouched set of items in
    // order to associate old items with rebased steps.
    compress(upto = this.items.length) {
        let remap = this.remapping(0, upto), mapFrom = remap.maps.length;
        let items = [], events = 0;
        this.items.forEach((item, i) => {
            if (i >= upto) {
                items.push(item);
                if (item.selection)
                    events++;
            }
            else if (item.step) {
                let step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap();
                mapFrom--;
                if (map)
                    remap.appendMap(map, mapFrom);
                if (step) {
                    let selection = item.selection && item.selection.map(remap.slice(mapFrom));
                    if (selection)
                        events++;
                    let newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1;
                    if (merged = items.length && items[last].merge(newItem))
                        items[last] = merged;
                    else
                        items.push(newItem);
                }
            }
            else if (item.map) {
                mapFrom--;
            }
        }, this.items.length, 0);
        return new Branch(ropeSequence.from(items.reverse()), events);
    }
}
Branch.empty = new Branch(ropeSequence.empty, 0);
function cutOffEvents(items, n) {
    let cutPoint;
    items.forEach((item, i) => {
        if (item.selection && (n-- == 0)) {
            cutPoint = i;
            return false;
        }
    });
    return items.slice(cutPoint);
}
class Item {
    constructor(
    // The (forward) step map for this item.
    map, 
    // The inverted step
    step, 
    // If this is non-null, this item is the start of a group, and
    // this selection is the starting selection for the group (the one
    // that was active before the first step was applied)
    selection, 
    // If this item is the inverse of a previous mapping on the stack,
    // this points at the inverse's offset
    mirrorOffset) {
        this.map = map;
        this.step = step;
        this.selection = selection;
        this.mirrorOffset = mirrorOffset;
    }
    merge(other) {
        if (this.step && other.step && !other.selection) {
            let step = other.step.merge(this.step);
            if (step)
                return new Item(step.getMap().invert(), step, this.selection);
        }
    }
}
// The value of the state field that tracks undo/redo history for that
// state. Will be stored in the plugin state when the history plugin
// is active.
class HistoryState {
    constructor(done, undone, prevRanges, prevTime) {
        this.done = done;
        this.undone = undone;
        this.prevRanges = prevRanges;
        this.prevTime = prevTime;
    }
}
const DEPTH_OVERFLOW = 20;
// Record a transformation in undo history.
function applyTransaction(history, state, tr, options) {
    let historyTr = tr.getMeta(historyKey), rebased;
    if (historyTr)
        return historyTr.historyState;
    if (tr.getMeta(closeHistoryKey))
        history = new HistoryState(history.done, history.undone, null, 0);
    let appended = tr.getMeta("appendedTransaction");
    if (tr.steps.length == 0) {
        return history;
    }
    else if (appended && appended.getMeta(historyKey)) {
        if (appended.getMeta(historyKey).redo)
            return new HistoryState(history.done.addTransform(tr, undefined, options, mustPreserveItems(state)), history.undone, rangesFor(tr.mapping.maps[tr.steps.length - 1]), history.prevTime);
        else
            return new HistoryState(history.done, history.undone.addTransform(tr, undefined, options, mustPreserveItems(state)), null, history.prevTime);
    }
    else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
        // Group transforms that occur in quick succession into one event.
        let newGroup = history.prevTime == 0 || !appended && (history.prevTime < (tr.time || 0) - options.newGroupDelay ||
            !isAdjacentTo(tr, history.prevRanges));
        let prevRanges = appended ? mapRanges(history.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps[tr.steps.length - 1]);
        return new HistoryState(history.done.addTransform(tr, newGroup ? state.selection.getBookmark() : undefined, options, mustPreserveItems(state)), Branch.empty, prevRanges, tr.time);
    }
    else if (rebased = tr.getMeta("rebased")) {
        // Used by the collab module to tell the history that some of its
        // content has been rebased.
        return new HistoryState(history.done.rebased(tr, rebased), history.undone.rebased(tr, rebased), mapRanges(history.prevRanges, tr.mapping), history.prevTime);
    }
    else {
        return new HistoryState(history.done.addMaps(tr.mapping.maps), history.undone.addMaps(tr.mapping.maps), mapRanges(history.prevRanges, tr.mapping), history.prevTime);
    }
}
function isAdjacentTo(transform, prevRanges) {
    if (!prevRanges)
        return false;
    if (!transform.docChanged)
        return true;
    let adjacent = false;
    transform.mapping.maps[0].forEach((start, end) => {
        for (let i = 0; i < prevRanges.length; i += 2)
            if (start <= prevRanges[i + 1] && end >= prevRanges[i])
                adjacent = true;
    });
    return adjacent;
}
function rangesFor(map) {
    let result = [];
    map.forEach((_from, _to, from, to) => result.push(from, to));
    return result;
}
function mapRanges(ranges, mapping) {
    if (!ranges)
        return null;
    let result = [];
    for (let i = 0; i < ranges.length; i += 2) {
        let from = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
        if (from <= to)
            result.push(from, to);
    }
    return result;
}
// Apply the latest event from one branch to the document and shift the event
// onto the other branch.
function histTransaction(history, state, dispatch, redo) {
    let preserveItems = mustPreserveItems(state);
    let histOptions = historyKey.get(state).spec.config;
    let pop = (redo ? history.undone : history.done).popEvent(state, preserveItems);
    if (!pop)
        return;
    let selection = pop.selection.resolve(pop.transform.doc);
    let added = (redo ? history.done : history.undone).addTransform(pop.transform, state.selection.getBookmark(), histOptions, preserveItems);
    let newHist = new HistoryState(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0);
    dispatch(pop.transform.setSelection(selection).setMeta(historyKey, { redo, historyState: newHist }).scrollIntoView());
}
let cachedPreserveItems = false, cachedPreserveItemsPlugins = null;
// Check whether any plugin in the given state has a
// `historyPreserveItems` property in its spec, in which case we must
// preserve steps exactly as they came in, so that they can be
// rebased.
function mustPreserveItems(state) {
    let plugins = state.plugins;
    if (cachedPreserveItemsPlugins != plugins) {
        cachedPreserveItems = false;
        cachedPreserveItemsPlugins = plugins;
        for (let i = 0; i < plugins.length; i++)
            if (plugins[i].spec.historyPreserveItems) {
                cachedPreserveItems = true;
                break;
            }
    }
    return cachedPreserveItems;
}
const historyKey = new PluginKey("history");
const closeHistoryKey = new PluginKey("closeHistory");
/**
Returns a plugin that enables the undo history for an editor. The
plugin will track undo and redo stacks, which can be used with the
[`undo`](https://prosemirror.net/docs/ref/#history.undo) and [`redo`](https://prosemirror.net/docs/ref/#history.redo) commands.

You can set an `"addToHistory"` [metadata
property](https://prosemirror.net/docs/ref/#state.Transaction.setMeta) of `false` on a transaction
to prevent it from being rolled back by undo.
*/
function history(config = {}) {
    config = { depth: config.depth || 100,
        newGroupDelay: config.newGroupDelay || 500 };
    return new Plugin({
        key: historyKey,
        state: {
            init() {
                return new HistoryState(Branch.empty, Branch.empty, null, 0);
            },
            apply(tr, hist, state) {
                return applyTransaction(hist, state, tr, config);
            }
        },
        config,
        props: {
            handleDOMEvents: {
                beforeinput(view, e) {
                    let inputType = e.inputType;
                    let command = inputType == "historyUndo" ? undo : inputType == "historyRedo" ? redo : null;
                    if (!command)
                        return false;
                    e.preventDefault();
                    return command(view.state, view.dispatch);
                }
            }
        }
    });
}
/**
A command function that undoes the last change, if any.
*/
const undo = (state, dispatch) => {
    let hist = historyKey.getState(state);
    if (!hist || hist.done.eventCount == 0)
        return false;
    if (dispatch)
        histTransaction(hist, state, dispatch, false);
    return true;
};
/**
A command function that redoes the last undone change, if any.
*/
const redo = (state, dispatch) => {
    let hist = historyKey.getState(state);
    if (!hist || hist.undone.eventCount == 0)
        return false;
    if (dispatch)
        histTransaction(hist, state, dispatch, true);
    return true;
};

const History = Extension.create({
    name: 'history',
    addOptions() {
        return {
            depth: 100,
            newGroupDelay: 500,
        };
    },
    addCommands() {
        return {
            undo: () => ({ state, dispatch }) => {
                return undo(state, dispatch);
            },
            redo: () => ({ state, dispatch }) => {
                return redo(state, dispatch);
            },
        };
    },
    addProseMirrorPlugins() {
        return [
            history(this.options),
        ];
    },
    addKeyboardShortcuts() {
        return {
            'Mod-z': () => this.editor.commands.undo(),
            'Mod-y': () => this.editor.commands.redo(),
            'Shift-Mod-z': () => this.editor.commands.redo(),
            // Russian keyboard layouts
            'Mod-я': () => this.editor.commands.undo(),
            'Shift-Mod-я': () => this.editor.commands.redo(),
        };
    },
});

const HorizontalRule = Node.create({
    name: 'horizontalRule',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    group: 'block',
    parseHTML() {
        return [{ tag: 'hr' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['hr', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },
    addCommands() {
        return {
            setHorizontalRule: () => ({ chain }) => {
                return (chain()
                    .insertContent({ type: this.name })
                    // set cursor after horizontal rule
                    .command(({ tr, dispatch }) => {
                    var _a;
                    if (dispatch) {
                        const { $to } = tr.selection;
                        const posAfter = $to.end();
                        if ($to.nodeAfter) {
                            tr.setSelection(TextSelection.create(tr.doc, $to.pos));
                        }
                        else {
                            // add node after horizontal rule if it’s the end of the document
                            const node = (_a = $to.parent.type.contentMatch.defaultType) === null || _a === void 0 ? void 0 : _a.create();
                            if (node) {
                                tr.insert(posAfter, node);
                                tr.setSelection(TextSelection.create(tr.doc, posAfter));
                            }
                        }
                        tr.scrollIntoView();
                    }
                    return true;
                })
                    .run());
            },
        };
    },
    addInputRules() {
        return [
            nodeInputRule({
                find: /^(?:---|—-|___\s|\*\*\*\s)$/,
                type: this.type,
            }),
        ];
    },
});

const ListItem$1 = Node.create({
    name: 'listItem',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    content: 'paragraph block*',
    defining: true,
    parseHTML() {
        return [
            {
                tag: 'li',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addKeyboardShortcuts() {
        return {
            Enter: () => this.editor.commands.splitListItem(this.name),
            Tab: () => this.editor.commands.sinkListItem(this.name),
            'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
        };
    },
});

const ListItem = Node.create({
    name: 'listItem',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    content: 'paragraph block*',
    defining: true,
    parseHTML() {
        return [
            {
                tag: 'li',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addKeyboardShortcuts() {
        return {
            Enter: () => this.editor.commands.splitListItem(this.name),
            Tab: () => this.editor.commands.sinkListItem(this.name),
            'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
        };
    },
});

const TextStyle = Mark.create({
    name: 'textStyle',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: element => {
                    const hasStyles = element.hasAttribute('style');
                    if (!hasStyles) {
                        return false;
                    }
                    return {};
                },
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            removeEmptyTextStyle: () => ({ state, commands }) => {
                const attributes = getMarkAttributes(state, this.type);
                const hasStyles = Object.entries(attributes).some(([, value]) => !!value);
                if (hasStyles) {
                    return true;
                }
                return commands.unsetMark(this.name);
            },
        };
    },
});

const inputRegex$1 = /^(\d+)\.\s$/;
const OrderedList = Node.create({
    name: 'orderedList',
    addOptions() {
        return {
            itemTypeName: 'listItem',
            HTMLAttributes: {},
            keepMarks: false,
            keepAttributes: false,
        };
    },
    group: 'block list',
    content() {
        return `${this.options.itemTypeName}+`;
    },
    addAttributes() {
        return {
            start: {
                default: 1,
                parseHTML: element => {
                    return element.hasAttribute('start')
                        ? parseInt(element.getAttribute('start') || '', 10)
                        : 1;
                },
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'ol',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        const { start, ...attributesWithoutStart } = HTMLAttributes;
        return start === 1
            ? ['ol', mergeAttributes(this.options.HTMLAttributes, attributesWithoutStart), 0]
            : ['ol', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            toggleOrderedList: () => ({ commands, chain }) => {
                if (this.options.keepAttributes) {
                    return chain().toggleList(this.name, this.options.itemTypeName, this.options.keepMarks).updateAttributes(ListItem.name, this.editor.getAttributes(TextStyle.name)).run();
                }
                return commands.toggleList(this.name, this.options.itemTypeName, this.options.keepMarks);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
        };
    },
    addInputRules() {
        let inputRule = wrappingInputRule({
            find: inputRegex$1,
            type: this.type,
        });
        if (this.options.keepMarks || this.options.keepAttributes) {
            inputRule = wrappingInputRule({
                find: inputRegex$1,
                type: this.type,
                keepMarks: this.options.keepMarks,
                keepAttributes: this.options.keepAttributes,
                getAttributes: () => { return this.editor.getAttributes(TextStyle.name); },
                editor: this.editor,
            });
        }
        return [
            inputRule,
        ];
    },
});

const Paragraph = Node.create({
    name: 'paragraph',
    priority: 1000,
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    group: 'block',
    content: 'inline*',
    parseHTML() {
        return [
            { tag: 'p' },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setParagraph: () => ({ commands }) => {
                return commands.setNode(this.name);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Alt-0': () => this.editor.commands.setParagraph(),
        };
    },
});

const Placeholder = Extension.create({
    name: 'placeholder',
    addOptions() {
        return {
            emptyEditorClass: 'is-editor-empty',
            emptyNodeClass: 'is-empty',
            placeholder: 'Write something …',
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
            includeChildren: false,
        };
    },
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('placeholder'),
                props: {
                    decorations: ({ doc, selection }) => {
                        const active = this.editor.isEditable || !this.options.showOnlyWhenEditable;
                        const { anchor } = selection;
                        const decorations = [];
                        if (!active) {
                            return null;
                        }
                        // only calculate isEmpty once due to its performance impacts (see issue #3360)
                        const emptyDocInstance = doc.type.createAndFill();
                        const isEditorEmpty = (emptyDocInstance === null || emptyDocInstance === void 0 ? void 0 : emptyDocInstance.sameMarkup(doc))
                            && emptyDocInstance.content.findDiffStart(doc.content) === null;
                        doc.descendants((node, pos) => {
                            const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
                            const isEmpty = !node.isLeaf && !node.childCount;
                            if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
                                const classes = [this.options.emptyNodeClass];
                                if (isEditorEmpty) {
                                    classes.push(this.options.emptyEditorClass);
                                }
                                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                                    class: classes.join(' '),
                                    'data-placeholder': typeof this.options.placeholder === 'function'
                                        ? this.options.placeholder({
                                            editor: this.editor,
                                            node,
                                            pos,
                                            hasAnchor,
                                        })
                                        : this.options.placeholder,
                                });
                                decorations.push(decoration);
                            }
                            return this.options.includeChildren;
                        });
                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});

const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/;
const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g;
const Strike = Mark.create({
    name: 'strike',
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    parseHTML() {
        return [
            {
                tag: 's',
            },
            {
                tag: 'del',
            },
            {
                tag: 'strike',
            },
            {
                style: 'text-decoration',
                consuming: false,
                getAttrs: style => (style.includes('line-through') ? {} : false),
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['s', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
    addCommands() {
        return {
            setStrike: () => ({ commands }) => {
                return commands.setMark(this.name);
            },
            toggleStrike: () => ({ commands }) => {
                return commands.toggleMark(this.name);
            },
            unsetStrike: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
        };
    },
    addInputRules() {
        return [
            markInputRule({
                find: inputRegex,
                type: this.type,
            }),
        ];
    },
    addPasteRules() {
        return [
            markPasteRule({
                find: pasteRegex,
                type: this.type,
            }),
        ];
    },
});

const Text$1 = Node.create({
    name: 'text',
    group: 'inline',
});

var pluginName$2 = 'figureAudio';
var FigureAudio = Node.create({
    name: pluginName$2,
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
                    return chain()
                        .insertContent([
                        {
                            type: _this.name,
                            attrs: attrs,
                            content: caption ? [{ type: 'text', text: caption }] : [],
                        },
                        {
                            type: 'paragraph',
                        },
                    ])
                        .focus()
                        .run();
                };
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            new Plugin({
                key: new PluginKey('removePastedFigureAudio'),
                props: {
                    handleKeyDown: function (view, event) {
                        var anchorParent = view.state.selection.$anchor.parent;
                        var isFigure = anchorParent.type.name === pluginName$2;
                        var isEmptyFigcaption = anchorParent.content.size <= 0;
                        // @ts-ignore
                        var editor = view.dom.editor;
                        // backSpace to remove if the figcaption is empty
                        if (event.key === 'BackSpace') {
                            if (isEmptyFigcaption && isFigure) {
                                editor.commands.deleteNode(pluginName$2);
                            }
                        }
                        // enter to insert a new paragraph
                        if (event.key === 'Enter') {
                            editor
                                .chain()
                                .selectTextblockEnd()
                                .insertContent({ type: 'paragraph' })
                                .run();
                        }
                    },
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
var pluginName$1 = 'figureEmbed';
var FigureEmbed = Node.create({
    name: pluginName$1,
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
                    return chain()
                        .insertContent([
                        {
                            type: _this.name,
                            attrs: attrs,
                            content: caption ? [{ type: 'text', text: caption }] : [],
                        },
                        {
                            type: 'paragraph',
                        },
                    ])
                        .focus()
                        .run();
                };
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            new Plugin({
                key: new PluginKey('removePastedFigureEmbed'),
                props: {
                    handleKeyDown: function (view, event) {
                        var anchorParent = view.state.selection.$anchor.parent;
                        var isFigure = anchorParent.type.name === pluginName$1;
                        var isEmptyFigcaption = anchorParent.content.size <= 0;
                        // @ts-ignore
                        var editor = view.dom.editor;
                        // backSpace to remove if the figcaption is empty
                        if (event.key === 'BackSpace') {
                            if (isEmptyFigcaption && isFigure) {
                                editor.commands.deleteNode(pluginName$1);
                            }
                        }
                        // enter to insert a new paragraph
                        if (event.key === 'Enter') {
                            editor
                                .chain()
                                .selectTextblockEnd()
                                .insertContent({ type: 'paragraph' })
                                .run();
                        }
                    },
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

var pluginName = 'figureImage';
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
                    return chain()
                        .insertContent([
                        {
                            type: _this.name,
                            attrs: attrs,
                            content: caption ? [{ type: 'text', text: caption }] : [],
                        },
                        {
                            type: 'paragraph',
                        },
                    ])
                        .focus()
                        .run();
                };
            },
        };
    },
    addProseMirrorPlugins: function () {
        return [
            new Plugin({
                key: new PluginKey('removePastedFigureImage'),
                props: {
                    handleKeyDown: function (view, event) {
                        var anchorParent = view.state.selection.$anchor.parent;
                        var isFigure = anchorParent.type.name === pluginName;
                        var isEmptyFigcaption = anchorParent.content.size <= 0;
                        // @ts-ignore
                        var editor = view.dom.editor;
                        // backSpace to remove if the figcaption is empty
                        if (event.key === 'BackSpace') {
                            if (isEmptyFigcaption && isFigure) {
                                editor.commands.deleteNode(pluginName);
                            }
                        }
                        // enter to insert a new paragraph
                        if (event.key === 'Enter') {
                            editor
                                .chain()
                                .selectTextblockEnd()
                                .insertContent({ type: 'paragraph' })
                                .run();
                        }
                    },
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

function findSuggestionMatch(config) {
    var _a;
    const { char, allowSpaces, allowedPrefixes, startOfLine, $position, } = config;
    const escapedChar = escapeForRegEx(char);
    const suffix = new RegExp(`\\s${escapedChar}$`);
    const prefix = startOfLine ? '^' : '';
    const regexp = allowSpaces
        ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
        : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm');
    const text = ((_a = $position.nodeBefore) === null || _a === void 0 ? void 0 : _a.isText) && $position.nodeBefore.text;
    if (!text) {
        return null;
    }
    const textFrom = $position.pos - text.length;
    const match = Array.from(text.matchAll(regexp)).pop();
    if (!match || match.input === undefined || match.index === undefined) {
        return null;
    }
    // JavaScript doesn't have lookbehinds. This hacks a check that first character
    // is a space or the start of the line
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);
    const matchPrefixIsAllowed = new RegExp(`^[${allowedPrefixes === null || allowedPrefixes === void 0 ? void 0 : allowedPrefixes.join('')}\0]?$`).test(matchPrefix);
    if (allowedPrefixes !== null && !matchPrefixIsAllowed) {
        return null;
    }
    // The absolute position of the match in the document
    const from = textFrom + match.index;
    let to = from + match[0].length;
    // Edge case handling; if spaces are allowed and we're directly in between
    // two triggers
    if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
        match[0] += ' ';
        to += 1;
    }
    // If the $position is located within the matched substring, return that range
    if (from < $position.pos && to >= $position.pos) {
        return {
            range: {
                from,
                to,
            },
            query: match[0].slice(char.length),
            text: match[0],
        };
    }
    return null;
}

const SuggestionPluginKey = new PluginKey('suggestion');
function Suggestion({ pluginKey = SuggestionPluginKey, editor, char = '@', allowSpaces = false, allowedPrefixes = [' '], startOfLine = false, decorationTag = 'span', decorationClass = 'suggestion', command = () => null, items = () => [], render = () => ({}), allow = () => true, }) {
    let props;
    const renderer = render === null || render === void 0 ? void 0 : render();
    const plugin = new Plugin({
        key: pluginKey,
        view() {
            return {
                update: async (view, prevState) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const prev = (_a = this.key) === null || _a === void 0 ? void 0 : _a.getState(prevState);
                    const next = (_b = this.key) === null || _b === void 0 ? void 0 : _b.getState(view.state);
                    // See how the state changed
                    const moved = prev.active && next.active && prev.range.from !== next.range.from;
                    const started = !prev.active && next.active;
                    const stopped = prev.active && !next.active;
                    const changed = !started && !stopped && prev.query !== next.query;
                    const handleStart = started || moved;
                    const handleChange = changed && !moved;
                    const handleExit = stopped || moved;
                    // Cancel when suggestion isn't active
                    if (!handleStart && !handleChange && !handleExit) {
                        return;
                    }
                    const state = handleExit && !handleStart ? prev : next;
                    const decorationNode = view.dom.querySelector(`[data-decoration-id="${state.decorationId}"]`);
                    props = {
                        editor,
                        range: state.range,
                        query: state.query,
                        text: state.text,
                        items: [],
                        command: commandProps => {
                            command({
                                editor,
                                range: state.range,
                                props: commandProps,
                            });
                        },
                        decorationNode,
                        // virtual node for popper.js or tippy.js
                        // this can be used for building popups without a DOM node
                        clientRect: decorationNode
                            ? () => {
                                var _a;
                                // because of `items` can be asynchrounous we’ll search for the current decoration node
                                const { decorationId } = (_a = this.key) === null || _a === void 0 ? void 0 : _a.getState(editor.state); // eslint-disable-line
                                const currentDecorationNode = view.dom.querySelector(`[data-decoration-id="${decorationId}"]`);
                                return (currentDecorationNode === null || currentDecorationNode === void 0 ? void 0 : currentDecorationNode.getBoundingClientRect()) || null;
                            }
                            : null,
                    };
                    if (handleStart) {
                        (_c = renderer === null || renderer === void 0 ? void 0 : renderer.onBeforeStart) === null || _c === void 0 ? void 0 : _c.call(renderer, props);
                    }
                    if (handleChange) {
                        (_d = renderer === null || renderer === void 0 ? void 0 : renderer.onBeforeUpdate) === null || _d === void 0 ? void 0 : _d.call(renderer, props);
                    }
                    if (handleChange || handleStart) {
                        props.items = await items({
                            editor,
                            query: state.query,
                        });
                    }
                    if (handleExit) {
                        (_e = renderer === null || renderer === void 0 ? void 0 : renderer.onExit) === null || _e === void 0 ? void 0 : _e.call(renderer, props);
                    }
                    if (handleChange) {
                        (_f = renderer === null || renderer === void 0 ? void 0 : renderer.onUpdate) === null || _f === void 0 ? void 0 : _f.call(renderer, props);
                    }
                    if (handleStart) {
                        (_g = renderer === null || renderer === void 0 ? void 0 : renderer.onStart) === null || _g === void 0 ? void 0 : _g.call(renderer, props);
                    }
                },
                destroy: () => {
                    var _a;
                    if (!props) {
                        return;
                    }
                    (_a = renderer === null || renderer === void 0 ? void 0 : renderer.onExit) === null || _a === void 0 ? void 0 : _a.call(renderer, props);
                },
            };
        },
        state: {
            // Initialize the plugin's internal state.
            init() {
                const state = {
                    active: false,
                    range: {
                        from: 0,
                        to: 0,
                    },
                    query: null,
                    text: null,
                    composing: false,
                };
                return state;
            },
            // Apply changes to the plugin state from a view transaction.
            apply(transaction, prev, oldState, state) {
                const { isEditable } = editor;
                const { composing } = editor.view;
                const { selection } = transaction;
                const { empty, from } = selection;
                const next = { ...prev };
                next.composing = composing;
                // We can only be suggesting if the view is editable, and:
                //   * there is no selection, or
                //   * a composition is active (see: https://github.com/ueberdosis/tiptap/issues/1449)
                if (isEditable && (empty || editor.view.composing)) {
                    // Reset active state if we just left the previous suggestion range
                    if ((from < prev.range.from || from > prev.range.to) && !composing && !prev.composing) {
                        next.active = false;
                    }
                    // Try to match against where our cursor currently is
                    const match = findSuggestionMatch({
                        char,
                        allowSpaces,
                        allowedPrefixes,
                        startOfLine,
                        $position: selection.$from,
                    });
                    const decorationId = `id_${Math.floor(Math.random() * 0xffffffff)}`;
                    // If we found a match, update the current state to show it
                    if (match && allow({ editor, state, range: match.range })) {
                        next.active = true;
                        next.decorationId = prev.decorationId ? prev.decorationId : decorationId;
                        next.range = match.range;
                        next.query = match.query;
                        next.text = match.text;
                    }
                    else {
                        next.active = false;
                    }
                }
                else {
                    next.active = false;
                }
                // Make sure to empty the range if suggestion is inactive
                if (!next.active) {
                    next.decorationId = null;
                    next.range = { from: 0, to: 0 };
                    next.query = null;
                    next.text = null;
                }
                return next;
            },
        },
        props: {
            // Call the keydown hook if suggestion is active.
            handleKeyDown(view, event) {
                var _a;
                const { active, range } = plugin.getState(view.state);
                if (!active) {
                    return false;
                }
                return ((_a = renderer === null || renderer === void 0 ? void 0 : renderer.onKeyDown) === null || _a === void 0 ? void 0 : _a.call(renderer, { view, event, range })) || false;
            },
            // Setup decorator on the currently active suggestion.
            decorations(state) {
                const { active, range, decorationId } = plugin.getState(state);
                if (!active) {
                    return null;
                }
                return DecorationSet.create(state.doc, [
                    Decoration.inline(range.from, range.to, {
                        nodeName: decorationTag,
                        class: decorationClass,
                        'data-decoration-id': decorationId,
                    }),
                ]);
            },
        },
    });
    return plugin;
}

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
        ListItem$1,
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
        ListItem$1,
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

exports.BubbleMenu = BubbleMenu;
exports.CommandManager = CommandManager;
exports.Editor = Editor;
exports.EditorContent = EditorContent;
exports.Extension = Extension;
exports.FloatingMenu = FloatingMenu;
exports.InputRule = InputRule;
exports.Mark = Mark;
exports.Node = Node;
exports.NodeView = NodeView;
exports.NodeViewContent = NodeViewContent;
exports.NodeViewWrapper = NodeViewWrapper;
exports.PasteRule = PasteRule;
exports.PureEditorContent = PureEditorContent;
exports.ReactNodeViewRenderer = ReactNodeViewRenderer;
exports.ReactRenderer = ReactRenderer;
exports.Tracker = Tracker;
exports.callOrReturn = callOrReturn;
exports.combineTransactionSteps = combineTransactionSteps;
exports.createChainableState = createChainableState;
exports.createDocument = createDocument;
exports.createNodeFromContent = createNodeFromContent;
exports.createStyleTag = createStyleTag;
exports.defaultBlockAt = defaultBlockAt;
exports.deleteProps = deleteProps;
exports.elementFromString = elementFromString;
exports.escapeForRegEx = escapeForRegEx;
exports.extensions = extensions;
exports.findChildren = findChildren;
exports.findChildrenInRange = findChildrenInRange;
exports.findDuplicates = findDuplicates;
exports.findParentNode = findParentNode;
exports.findParentNodeClosestToPos = findParentNodeClosestToPos;
exports.fromString = fromString;
exports.generateHTML = generateHTML;
exports.generateJSON = generateJSON;
exports.generateText = generateText;
exports.getAttributes = getAttributes;
exports.getAttributesFromExtensions = getAttributesFromExtensions;
exports.getChangedRanges = getChangedRanges;
exports.getDebugJSON = getDebugJSON;
exports.getExtensionField = getExtensionField;
exports.getHTMLFromFragment = getHTMLFromFragment;
exports.getMarkAttributes = getMarkAttributes;
exports.getMarkRange = getMarkRange;
exports.getMarkType = getMarkType;
exports.getMarksBetween = getMarksBetween;
exports.getNodeAttributes = getNodeAttributes;
exports.getNodeType = getNodeType;
exports.getRenderedAttributes = getRenderedAttributes;
exports.getSchema = getSchema;
exports.getSchemaByResolvedExtensions = getSchemaByResolvedExtensions;
exports.getSchemaTypeByName = getSchemaTypeByName;
exports.getSchemaTypeNameByName = getSchemaTypeNameByName;
exports.getSplittedAttributes = getSplittedAttributes;
exports.getText = getText;
exports.getTextBetween = getTextBetween;
exports.getTextContentFromNodes = getTextContentFromNodes;
exports.getTextSerializersFromSchema = getTextSerializersFromSchema;
exports.injectExtensionAttributesToParseRule = injectExtensionAttributesToParseRule;
exports.inputRulesPlugin = inputRulesPlugin;
exports.isActive = isActive;
exports.isEmptyObject = isEmptyObject;
exports.isExtensionRulesEnabled = isExtensionRulesEnabled;
exports.isFunction = isFunction;
exports.isList = isList;
exports.isMacOS = isMacOS;
exports.isMarkActive = isMarkActive;
exports.isNodeActive = isNodeActive;
exports.isNodeEmpty = isNodeEmpty;
exports.isNodeSelection = isNodeSelection;
exports.isNumber = isNumber;
exports.isPlainObject = isPlainObject;
exports.isRegExp = isRegExp;
exports.isString = isString;
exports.isTextSelection = isTextSelection;
exports.isiOS = isiOS;
exports.markInputRule = markInputRule;
exports.markPasteRule = markPasteRule;
exports.mergeAttributes = mergeAttributes;
exports.mergeDeep = mergeDeep;
exports.minMax = minMax;
exports.nodeInputRule = nodeInputRule;
exports.nodePasteRule = nodePasteRule;
exports.objectIncludes = objectIncludes;
exports.pasteRulesPlugin = pasteRulesPlugin;
exports.posToDOMRect = posToDOMRect;
exports.removeDuplicates = removeDuplicates;
exports.resolveFocusPosition = resolveFocusPosition;
exports.selectionToInsertionEnd = selectionToInsertionEnd;
exports.splitExtensions = splitExtensions;
exports.textInputRule = textInputRule;
exports.textPasteRule = textPasteRule;
exports.textblockTypeInputRule = textblockTypeInputRule;
exports.useArticleEdtor = useArticleEdtor;
exports.useCommentEditor = useCommentEditor;
exports.useEditor = useEditor;
exports.wrappingInputRule = wrappingInputRule;
