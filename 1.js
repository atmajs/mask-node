/*!
 * MaskJS v0.71.79
 * Part of the Atma.js Project
 * http://atmajs.com/
 *
 * MIT license
 * http://opensource.org/licenses/MIT
 *
 * (c) 2012, 2020 Atma.js and other contributors
 */
(function (root, factory) {


    var mask = factory(global, module.exports);

    module.exports = mask;

}(this, function (global, exports, document) {
    'use strict';

    export var _Array_slice = Array.prototype.slice;
export var _Array_splice = Array.prototype.splice;
export var _Array_indexOf = Array.prototype.indexOf;
export var _Object_hasOwnProp = Object.hasOwnProperty;
export var _Object_getOwnProp = Object.getOwnPropertyDescriptor;
export var _Object_defineProperty = Object.defineProperty;
export var _global = typeof global !== 'undefined'
    ? global
    : window;
export var _document = typeof window !== 'undefined' && window.document != null
    ? window.document
    : null;

export function fn_proxy(fn, ctx) {
    return function () {
        var imax = arguments.length, args = new Array(imax), i = 0;
        for (; i < imax; i++)
            args[i] = arguments[i];
        return fn_apply(fn, ctx, args);
    };
}
;
export function fn_apply(fn, ctx, args) {
    var l = args.length;
    if (0 === l)
        return fn.call(ctx);
    if (1 === l)
        return fn.call(ctx, args[0]);
    if (2 === l)
        return fn.call(ctx, args[0], args[1]);
    if (3 === l)
        return fn.call(ctx, args[0], args[1], args[2]);
    if (4 === l)
        return fn.call(ctx, args[0], args[1], args[2], args[3]);
    return fn.apply(ctx, args);
}
;
export function fn_doNothing() {
    return false;
}
;
export function fn_createByPattern(definitions, ctx) {
    var imax = definitions.length;
    return function () {
        var l = arguments.length, i = -1, def;
        outer: while (++i < imax) {
            def = definitions[i];
            if (def.pattern.length !== l) {
                continue;
            }
            var j = -1;
            while (++j < l) {
                var fn = def.pattern[j];
                var val = arguments[j];
                if (fn(val) === false) {
                    continue outer;
                }
            }
            return def.handler.apply(ctx, arguments);
        }
        console.error('InvalidArgumentException for a function', definitions, arguments);
        return null;
    };
}
;

export function is_Function(x) {
    return typeof x === 'function';
}
export function is_Object(x) {
    return x != null && typeof x === 'object';
}
export function is_Array(arr) {
    return (arr != null &&
        typeof arr === 'object' &&
        typeof arr.length === 'number' &&
        typeof arr.slice === 'function');
}
export var is_ArrayLike = is_Array;
export function is_String(x) {
    return typeof x === 'string';
}
export function is_notEmptyString(x) {
    return typeof x === 'string' && x !== '';
}
export function is_rawObject(x) {
    return x != null && typeof x === 'object' && x.constructor === Object;
}
export function is_Date(x) {
    if (x == null || typeof x !== 'object') {
        return false;
    }
    if (x.getFullYear != null && isNaN(x) === false) {
        return true;
    }
    return false;
}
export function is_PromiseLike(x) {
    return x != null && typeof x === 'object' && typeof x.then === 'function';
}
export function is_Observable(x) {
    return x != null && typeof x === 'object' && typeof x.subscribe === 'function';
}
export var is_DOM = typeof window !== 'undefined' && window.navigator != null;
export var is_NODE = !is_DOM;

import { fn_apply, fn_proxy } from '../fn';
import { is_Function } from '../is';
import { _Array_slice } from '../refs';
;
export var class_Dfr = function () { };
class_Dfr.prototype = {
    _isAsync: true,
    _done: null,
    _fail: null,
    _always: null,
    _resolved: null,
    _rejected: null,
    defer: function () {
        this._rejected = null;
        this._resolved = null;
        return this;
    },
    isResolved: function () {
        return this._resolved != null;
    },
    isRejected: function () {
        return this._rejected != null;
    },
    isBusy: function () {
        return this._resolved == null && this._rejected == null;
    },
    resolve: function () {
        var done = this._done, always = this._always;
        this._resolved = arguments;
        dfr_clearListeners(this);
        arr_callOnce(done, this, arguments);
        arr_callOnce(always, this, [this]);
        return this;
    },
    reject: function () {
        var fail = this._fail, always = this._always;
        this._rejected = arguments;
        dfr_clearListeners(this);
        arr_callOnce(fail, this, arguments);
        arr_callOnce(always, this, [this]);
        return this;
    },
    then: function (filterSuccess, filterError) {
        return this.pipe(filterSuccess, filterError);
    },
    done: function (callback) {
        if (this._rejected != null)
            return this;
        return dfr_bind(this, this._resolved, this._done || (this._done = []), callback);
    },
    fail: function (callback) {
        if (this._resolved != null)
            return this;
        return dfr_bind(this, this._rejected, this._fail || (this._fail = []), callback);
    },
    always: function (callback) {
        return dfr_bind(this, this._rejected || this._resolved, this._always || (this._always = []), callback);
    },
    pipe: function (mix /* ..methods */) {
        var dfr;
        if (typeof mix === 'function') {
            dfr = new class_Dfr();
            var done_ = mix, fail_ = arguments.length > 1
                ? arguments[1]
                : null;
            this
                .done(delegate(dfr, 'resolve', done_))
                .fail(delegate(dfr, 'reject', fail_));
            return dfr;
        }
        dfr = mix;
        var imax = arguments.length, done = imax === 1, fail = imax === 1, i = 0, x;
        while (++i < imax) {
            x = arguments[i];
            switch (x) {
                case 'done':
                    done = true;
                    break;
                case 'fail':
                    fail = true;
                    break;
                default:
                    console.error('Unsupported pipe channel', arguments[i]);
                    break;
            }
        }
        done && this.done(delegate(dfr, 'resolve'));
        fail && this.fail(delegate(dfr, 'reject'));
        function pipe(dfr, method) {
            return function () {
                dfr[method].apply(dfr, arguments);
            };
        }
        function delegate(dfr, name, fn) {
            return function () {
                if (fn != null) {
                    var override = fn.apply(this, arguments);
                    if (override != null && override !== dfr) {
                        if (isDeferred(override)) {
                            override.then(delegate(dfr, 'resolve'), delegate(dfr, 'reject'));
                            return;
                        }
                        dfr[name](override);
                        return;
                    }
                }
                dfr[name].apply(dfr, arguments);
            };
        }
        return this;
    },
    pipeCallback: function () {
        var self = this;
        return function (error) {
            if (error != null) {
                self.reject(error);
                return;
            }
            var args = _Array_slice.call(arguments, 1);
            fn_apply(self.resolve, self, args);
        };
    },
    resolveDelegate: function () {
        return fn_proxy(this.resolve, this);
    },
    rejectDelegate: function () {
        return fn_proxy(this.reject, this);
    },
    catch: function (cb) {
        return this.fail(cb);
    },
    finally: function (cb) {
        return this.always(cb);
    }
};
var static_Dfr = {
    resolve: function (a, b, c) {
        var dfr = new class_Dfr();
        return dfr.resolve.apply(dfr, _Array_slice.call(arguments));
    },
    reject: function (error) {
        var dfr = new class_Dfr();
        return dfr.reject(error);
    },
    run: function (fn, ctx) {
        var dfr = new class_Dfr();
        if (ctx == null)
            ctx = dfr;
        fn.call(ctx, fn_proxy(dfr.resolve, ctx), fn_proxy(dfr.reject, dfr), dfr);
        return dfr;
    },
    all: function (promises) {
        var dfr = new class_Dfr, arr = new Array(promises.length), wait = promises.length, error = null;
        if (wait === 0) {
            return dfr.resolve(arr);
        }
        function tick(index) {
            if (error != null) {
                return;
            }
            var args = _Array_slice.call(arguments, 1);
            arr.splice.apply(arr, [index, 0].concat(args));
            if (--wait === 0) {
                dfr.resolve(arr);
            }
        }
        function onReject(err) {
            dfr.reject(error = err);
        }
        var imax = promises.length, i = -1;
        while (++i < imax) {
            var x = promises[i];
            if (x == null || x.then == null) {
                tick(i);
                continue;
            }
            x.then(tick.bind(null, i), onReject);
        }
        return dfr;
    }
};
class_Dfr.resolve = static_Dfr.resolve;
class_Dfr.reject = static_Dfr.reject;
class_Dfr.run = static_Dfr.run;
class_Dfr.all = static_Dfr.all;
// PRIVATE
function dfr_bind(dfr, arguments_, listeners, callback) {
    if (callback == null)
        return dfr;
    if (arguments_ != null)
        fn_apply(callback, dfr, arguments_);
    else
        listeners.push(callback);
    return dfr;
}
function dfr_clearListeners(dfr) {
    dfr._done = null;
    dfr._fail = null;
    dfr._always = null;
}
function arr_callOnce(arr, ctx, args) {
    if (arr == null)
        return;
    var imax = arr.length, i = -1, fn;
    while (++i < imax) {
        fn = arr[i];
        if (fn)
            fn_apply(fn, ctx, args);
    }
    arr.length = 0;
}
function isDeferred(x) {
    return x != null
        && typeof x === 'object'
        && is_Function(x.then);
}

import { _Object_defineProperty, _Object_getOwnProp } from './refs';
var getDescriptor = Object.getOwnPropertyDescriptor;
var defineDescriptor = Object.defineProperty;
var obj_copyProperty = getDescriptor == null
    ? function (target, source, key) { return target[key] = source[key]; }
    : function (target, source, key) {
        var descr = getDescriptor(source, key);
        if (descr == null) {
            target[key] = source[key];
            return;
        }
        if (descr.value !== void 0) {
            target[key] = descr.value;
            return;
        }
        defineDescriptor(target, key, descr);
    };
export { obj_copyProperty };
export function obj_getProperty(obj_, path) {
    if (obj_ == null) {
        return null;
    }
    if (path.indexOf('.') === -1) {
        return obj_[path];
    }
    var obj = obj_, chain = path.split('.'), imax = chain.length, i = -1;
    while (obj != null && ++i < imax) {
        var key = chain[i];
        if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
            key = key.slice(0, -1);
        }
        obj = obj[key];
    }
    return obj;
}
;
export function obj_setProperty(obj_, path, val) {
    if (path.indexOf('.') === -1) {
        obj_[path] = val;
        return;
    }
    var obj = obj_, chain = path.split('.'), imax = chain.length - 1, i = -1, key;
    while (++i < imax) {
        key = chain[i];
        if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
            key = key.slice(0, -1);
        }
        var x = obj[key];
        if (x == null) {
            x = obj[key] = {};
        }
        obj = x;
    }
    obj[chain[i]] = val;
}
;
export function obj_hasProperty(obj, path) {
    var x = obj_getProperty(obj, path);
    return x !== void 0;
}
;
export function obj_defineProperty(obj, path, dscr) {
    var x = obj, chain = path.split('.'), imax = chain.length - 1, i = -1, key;
    while (++i < imax) {
        key = chain[i];
        if (x[key] == null)
            x[key] = {};
        x = x[key];
    }
    key = chain[imax];
    if (_Object_defineProperty) {
        if (dscr.writable === void 0)
            dscr.writable = true;
        if (dscr.configurable === void 0)
            dscr.configurable = true;
        if (dscr.enumerable === void 0)
            dscr.enumerable = true;
        _Object_defineProperty(x, key, dscr);
        return;
    }
    x[key] = dscr.value === void 0
        ? dscr.value
        : (dscr.get && dscr.get());
}
;
export function obj_extend(a, b) {
    if (b == null)
        return a || {};
    if (a == null)
        return obj_create(b);
    for (var key in b) {
        a[key] = b[key];
    }
    return a;
}
;
export function obj_extendDefaults(a, b) {
    if (b == null)
        return a || {};
    if (a == null)
        return obj_create(b);
    for (var key in b) {
        if (a[key] == null) {
            a[key] = b[key];
            continue;
        }
        if (key === 'toString' && a[key] === Object.prototype.toString) {
            a[key] = b[key];
        }
    }
    return a;
}
var extendPropertiesFactory = function (overwriteProps) {
    if (_Object_getOwnProp == null)
        return overwriteProps ? obj_extend : obj_extendDefaults;
    return function (a, b) {
        if (b == null)
            return a || {};
        if (a == null)
            return obj_create(b);
        var key, descr, ownDescr;
        for (key in b) {
            descr = _Object_getOwnProp(b, key);
            if (descr == null)
                continue;
            if (overwriteProps !== true) {
                ownDescr = _Object_getOwnProp(a, key);
                if (ownDescr != null) {
                    continue;
                }
            }
            if (descr.hasOwnProperty('value')) {
                a[key] = descr.value;
                continue;
            }
            _Object_defineProperty(a, key, descr);
        }
        return a;
    };
};
export var obj_extendProperties = extendPropertiesFactory(true);
export var obj_extendPropertiesDefaults = extendPropertiesFactory(false);
export function obj_extendMany(a, arg1, arg2, arg3, arg4, arg5, arg6) {
    var imax = arguments.length, i = 1;
    for (; i < imax; i++) {
        a = obj_extend(a, arguments[i]);
    }
    return a;
}
;
export function obj_toFastProps(obj) {
    /*jshint -W027*/
    function F() { }
    F.prototype = obj;
    new F();
    return;
    eval(obj);
}
;
export var _Object_create = Object.create || function (x) {
    var Ctor = function () { };
    Ctor.prototype = x;
    return new Ctor;
};
export var obj_create = _Object_create;
export function obj_defaults(target, defaults) {
    for (var key in defaults) {
        if (target[key] == null)
            target[key] = defaults[key];
    }
    return target;
}
var obj_extendDescriptors;
var obj_extendDescriptorsDefaults;
(function () {
    if (getDescriptor == null) {
        obj_extendDescriptors = obj_extend;
        obj_extendDescriptorsDefaults = obj_defaults;
        return;
    }
    obj_extendDescriptors = function (target, source) {
        return _extendDescriptors(target, source, false);
    };
    obj_extendDescriptorsDefaults = function (target, source) {
        return _extendDescriptors(target, source, true);
    };
    function _extendDescriptors(target, source, defaultsOnly) {
        if (target == null)
            return {};
        if (source == null)
            return source;
        var descr, key;
        for (key in source) {
            if (defaultsOnly === true && target[key] != null)
                continue;
            descr = getDescriptor(source, key);
            if (descr == null) {
                obj_extendDescriptors(target, source["__proto__"]);
                continue;
            }
            if (descr.value !== void 0) {
                target[key] = descr.value;
                continue;
            }
            defineDescriptor(target, key, descr);
        }
        return target;
    }
})();
export { obj_extendDescriptors, obj_extendDescriptorsDefaults };

import { is_Object } from './is';
export function str_format(str_, a, b, c, d) {
    var str = str_, imax = arguments.length, i = 0, x;
    while (++i < imax) {
        x = arguments[i];
        if (is_Object(x) && x.toJSON) {
            x = x.toJSON();
        }
        str_ = str_.replace(rgxNum(i - 1), String(x));
    }
    return str_;
}
;
export function str_dedent(str) {
    var rgx = /^[\t ]*\S/gm, match = rgx.exec(str), count = -1;
    while (match != null) {
        var x = match[0].length;
        if (count === -1 || x < count)
            count = x;
        match = rgx.exec(str);
    }
    if (--count < 1)
        return str;
    var replacer = new RegExp('^[\\t ]{1,' + count + '}', 'gm');
    return str
        .replace(replacer, '')
        .replace(/^[\t ]*\r?\n/, '')
        .replace(/\r?\n[\t ]*$/, '');
}
;
var rgxNum;
(function () {
    rgxNum = function (num) {
        return cache_[num] || (cache_[num] = new RegExp('\\{' + num + '\\}', 'g'));
    };
    var cache_ = {};
}());

import { obj_extendDefaults, obj_extendPropertiesDefaults } from './obj';
import { _Array_slice } from './refs';
;
/**
 * create([...Base], Proto)
 * Base: Function | Object
 * Proto: Object {
 *    constructor: ?Function
 *    ...
 */
export var class_create = createClassFactory(obj_extendDefaults);
// with property accessor functions support
export var class_createEx = createClassFactory(obj_extendPropertiesDefaults);
function createClassFactory(extendDefaultsFn) {
    return function (a, b, c, d, e, f, g, h) {
        var args = _Array_slice.call(arguments), Proto = args.pop();
        if (Proto == null)
            Proto = {};
        var Ctor;
        if (Proto.hasOwnProperty('constructor')) {
            Ctor = Proto.constructor;
            if (Ctor.prototype === void 0) {
                var es6Method = Ctor;
                Ctor = function ClassCtor() {
                    var imax = arguments.length, i = -1, args = new Array(imax);
                    while (++i < imax)
                        args[i] = arguments[i];
                    return es6Method.apply(this, args);
                };
            }
        }
        else {
            Ctor = function ClassCtor() { };
        }
        var i = args.length, BaseCtor, x;
        while (--i > -1) {
            x = args[i];
            if (typeof x === 'function') {
                BaseCtor = wrapFn(x, BaseCtor);
                x = x.prototype;
            }
            extendDefaultsFn(Proto, x);
        }
        return createClass(wrapFn(BaseCtor, Ctor), Proto);
    };
}
function createClass(Ctor, Proto) {
    Proto.constructor = Ctor;
    Ctor.prototype = Proto;
    return Ctor;
}
function wrapFn(fnA, fnB) {
    if (fnA == null) {
        return fnB;
    }
    if (fnB == null) {
        return fnA;
    }
    return function () {
        var args = _Array_slice.call(arguments);
        var x = fnA.apply(this, args);
        if (x !== void 0)
            return x;
        return fnB.apply(this, args);
    };
}

import { obj_extend, obj_defineProperty } from './obj';
import { str_format } from './str';
export function error_createClass(name, Proto, stackSliceFrom) {
    var Ctor = _createCtor(Proto, stackSliceFrom);
    Ctor.prototype = new Error;
    Proto.constructor = Error;
    Proto.name = name;
    obj_extend(Ctor.prototype, Proto);
    return Ctor;
}
;
export function error_formatSource(source, index, filename) {
    var cursor = error_cursor(source, index), lines = cursor[0], lineNum = cursor[1], rowNum = cursor[2], str = '';
    if (filename != null) {
        str += str_format(' at {0}:{1}:{2}\n', filename, lineNum, rowNum);
    }
    return str + error_formatCursor(lines, lineNum, rowNum);
}
;
/**
 * @returns [ lines, lineNum, rowNum ]
 */
export function error_cursor(str, index) {
    var lines = str.substring(0, index).split('\n'), line = lines.length, row = index + 1 - lines.slice(0, line - 1).join('\n').length;
    if (line > 1) {
        // remove trailing newline
        row -= 1;
    }
    return [str.split('\n'), line, row];
}
;
export function error_formatCursor(lines, lineNum, rowNum) {
    var BEFORE = 3, AFTER = 2, i = lineNum - BEFORE, imax = i + BEFORE + AFTER, str = '';
    if (i < 0)
        i = 0;
    if (imax > lines.length)
        imax = lines.length;
    var lineNumberLength = String(imax).length, lineNumber;
    for (; i < imax; i++) {
        if (str)
            str += '\n';
        lineNumber = ensureLength(i + 1, lineNumberLength);
        str += lineNumber + '|' + lines[i];
        if (i + 1 === lineNum) {
            str += '\n' + repeat(' ', lineNumberLength + 1);
            str += lines[i].substring(0, rowNum - 1).replace(/[^\s]/g, ' ');
            str += '^';
        }
    }
    return str;
}
;
function ensureLength(num, count) {
    var str = String(num);
    while (str.length < count) {
        str += ' ';
    }
    return str;
}
function repeat(char_, count) {
    var str = '';
    while (--count > -1) {
        str += char_;
    }
    return str;
}
function _createCtor(Proto, stackFrom) {
    var Ctor = Proto.hasOwnProperty('constructor')
        ? Proto.constructor
        : null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        obj_defineProperty(this, 'stack', {
            value: _prepairStack(stackFrom || 3)
        });
        obj_defineProperty(this, 'message', {
            value: str_format.apply(this, arguments)
        });
        if (Ctor != null) {
            Ctor.apply(this, arguments);
        }
    };
}
function _prepairStack(sliceFrom) {
    var stack = new Error().stack;
    return stack == null ? null : stack
        .split('\n')
        .slice(sliceFrom)
        .join('\n');
}

import { fn_apply } from '../fn';
import { _Array_slice } from '../refs';
export var class_EventEmitter = function () {
    this._listeners = {};
};
class_EventEmitter.prototype = {
    on: function (event, fn) {
        if (fn != null) {
            (this._listeners[event] || (this._listeners[event] = [])).push(fn);
        }
        return this;
    },
    once: function (event, fn) {
        if (fn != null) {
            fn._once = true;
            (this._listeners[event] || (this._listeners[event] = [])).push(fn);
        }
        return this;
    },
    pipe: function (event) {
        var that = this, args;
        return function () {
            args = _Array_slice.call(arguments);
            args.unshift(event);
            fn_apply(that.trigger, that, args);
        };
    },
    emit: event_trigger,
    trigger: event_trigger,
    off: function (event, fn) {
        var listeners = this._listeners[event];
        if (listeners == null)
            return this;
        if (arguments.length === 1) {
            listeners.length = 0;
            return this;
        }
        var imax = listeners.length, i = -1;
        while (++i < imax) {
            if (listeners[i] === fn) {
                listeners.splice(i, 1);
                i--;
                imax--;
            }
        }
        return this;
    }
};
function event_trigger(event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var fns = this._listeners[event];
    if (fns == null) {
        return this;
    }
    for (var i = 0; i < fns.length; i++) {
        var fn = fns[i];
        fn_apply(fn, this, args);
        if (fn !== fns[i]) {
            // the callback has removed itself
            i--;
            continue;
        }
        if (fn._once === true) {
            fns.splice(i, 1);
            i--;
        }
    }
    return this;
}

import { obj_create } from './obj';
export function arr_remove(array, x) {
    var i = array.indexOf(x);
    if (i === -1)
        return false;
    array.splice(i, 1);
    return true;
}
;
export function arr_each(arr, fn, ctx) {
    arr.forEach(fn, ctx);
}
;
export function arr_indexOf(arr, x) {
    return arr.indexOf(x);
}
;
export function arr_contains(arr, x) {
    return arr.indexOf(x) !== -1;
}
;
export function arr_pushMany(arr, arrSource) {
    if (arrSource == null || arr == null || arr === arrSource)
        return;
    var il = arr.length, jl = arrSource.length, j = -1;
    while (++j < jl) {
        arr[il + j] = arrSource[j];
    }
}
;
export function arr_distinct(arr, compareFn) {
    var out = [];
    var hash = compareFn == null ? obj_create(null) : null;
    outer: for (var i = 0; i < arr.length; i++) {
        var x = arr[i];
        if (compareFn == null) {
            if (hash[x] === 1) {
                continue;
            }
            hash[x] = 1;
        }
        else {
            for (var j = i - 1; j > -1; j--) {
                var prev = arr[j];
                if (compareFn(x, prev)) {
                    continue outer;
                }
            }
        }
        out.push(x);
    }
    return out;
}

import { arr_remove } from '@utils/arr';
/**
 * Bind listeners to some system events:
 * - `error` Any parser or render error
 * - `compoCreated` Each time new component is created
 * - `config` Each time configuration is changed via `config` fn
 * @param {string} eveny
 * @param {function} cb
 * @memberOf mask
 * @method on
 */
export function listeners_on(event, fn) {
    (bin[event] || (bin[event] = [])).push(fn);
}
/**
 * Unbind listener
 * - `error` Any parser or render error
 * - `compoCreated` Each time new component is created
 * @param {string} eveny
 * @param {function} [cb]
 * @memberOf mask
 * @method on
 */
export function listeners_off(event, fn) {
    if (fn == null) {
        bin[event] = [];
        return;
    }
    arr_remove(bin[event], fn);
}
export function listeners_emit(event, v1, v2, v3, v4, v5) {
    var fns = bin[event];
    if (fns == null) {
        return false;
    }
    var imax = fns.length, i = -1;
    while (++i < imax) {
        fns[i](v1, v2, v3, v4, v5);
    }
    return i !== 0;
}
var bin = {
    compoCreated: null,
    error: null
};

import { fn_doNothing } from '@utils/fn';
import { error_createClass, error_formatSource } from '@utils/error';
import { listeners_emit } from './listeners';
import { is_String } from '@utils/is';
import { _Array_slice } from '@utils/refs';
var noConsole = typeof console === 'undefined';
var bind = Function.prototype.bind;
export var log = noConsole ? fn_doNothing : bind.call(console.warn, console);
export var log_warn = noConsole
    ? fn_doNothing
    : bind.call(console.warn, console, 'MaskJS [Warn] :');
export var log_error = noConsole
    ? fn_doNothing
    : bind.call(console.error, console, 'MaskJS [Error] :');
var STACK_SLICE = 4;
var MaskError = error_createClass('MaskError', {}, STACK_SLICE);
var MaskWarn = error_createClass('MaskWarn', {}, STACK_SLICE);
export function throw_(error) {
    log_error(error);
    listeners_emit('error', error);
}
export var error_ = delegate_notify(MaskError, 'error');
export var error_withSource = delegate_withSource(MaskError, 'error');
export var error_withNode = delegate_withNode(MaskError, 'error');
export var error_withCompo = delegate_withCompo(error_withNode);
export var warn_ = delegate_notify(MaskWarn, 'warn');
export var warn_withSource = delegate_withSource(MaskWarn, 'warn');
export var warn_withNode = delegate_withNode(MaskWarn, 'warn');
export var warn_withCompo = delegate_withCompo(warn_withNode);
export var parser_error = delegate_parserReporter(MaskError, 'error');
export var parser_warn = delegate_parserReporter(MaskWarn, 'warn');
export function reporter_createErrorNode(message) {
    return {
        type: 1,
        tagName: 'div',
        attr: {
            class: '-mask-compo-errored',
            style: 'background:red; color:white;'
        },
        nodes: [
            {
                type: 2,
                content: message
            }
        ]
    };
}
export function reporter_getNodeStack(node) {
    var stack = [node];
    var parent = node.parent;
    while (parent != null) {
        stack.unshift(parent);
        parent = parent.parent;
    }
    var str = '';
    var root = stack[0];
    if (root !== node && is_String(root.source) && node.sourceIndex > -1) {
        str += error_formatSource(root.source, node.sourceIndex, root.filename) + '\n';
    }
    str += '  at ' + stack.map(function (x) { return x.tagName || x.compoName; }).join(' > ');
    return str;
}
export function reporter_deprecated(id, message) {
    if (_notified[id] !== void 0) {
        return;
    }
    _notified[id] = 1;
    log_warn('[deprecated]', message);
}
var _notified = {};
function delegate_parserReporter(Ctor, type) {
    return function (str, source, index, token, state, file) {
        var error = new Ctor(str);
        var tokenMsg = formatToken(token);
        if (tokenMsg) {
            error.message += tokenMsg;
        }
        var stateMsg = formatState(state);
        if (stateMsg) {
            error.message += stateMsg;
        }
        var cursorMsg = error_formatSource(source, index, file);
        if (cursorMsg) {
            error.message += '\n' + cursorMsg;
        }
        report(error, 'error');
    };
}
function delegate_withSource(Ctor, type) {
    return function (mix, source, index, file) {
        var error = new Ctor(stringifyError);
        error.message = '\n' + error_formatSource(source, index, file);
        report(error, type);
    };
}
function delegate_notify(Ctor, type) {
    return function (arg1, arg2, arg3) {
        var str = _Array_slice.call(arguments).join(' ');
        report(new Ctor(str), type);
    };
}
function delegate_withNode(Ctor, type) {
    return function (mix, node) {
        var error = mix instanceof Error ? mix : new Ctor(stringifyError(mix));
        if (node != null) {
            error.message += '\n' + reporter_getNodeStack(node);
        }
        report(error, type);
    };
}
function delegate_withCompo(withNodeFn) {
    return function (mix, compo) {
        var node = compo.node, cursor = compo.parent;
        while (cursor != null && node == null) {
            node = cursor.node;
            cursor = cursor.parent;
        }
        withNodeFn(mix, node);
    };
}
function report(error, type) {
    if (listeners_emit(type, error)) {
        return;
    }
    var fn = type === 'error' ? log_error : log_warn;
    var stack = error.stack || '';
    fn(error.message + '\n' + stack);
}
function stringifyError(mix) {
    if (mix == null)
        return 'Uknown error';
    if (typeof mix !== 'object')
        return mix;
    if (mix.toString !== Object.prototype.toString)
        return String(mix);
    return JSON.stringify(mix);
}
function formatToken(token) {
    if (token == null)
        return '';
    if (typeof token === 'number')
        token = String.fromCharCode(token);
    return ' Invalid token: `' + token + '`';
}
function formatState(state) {
    var states = {
        '10': 'tag',
        '3': 'tag',
        '4': 'attribute key',
        '12': 'attribute value',
        '6': 'literal',
        var: 'VarStatement',
        expr: 'Expression'
    };
    if (state == null || states[state] == null)
        return '';
    return ' in `' + states[state] + '`';
}

export var dom_NODE = 1;
export var dom_TEXTNODE = 2;
export var dom_FRAGMENT = 3;
export var dom_COMPONENT = 4;
export var dom_CONTROLLER = 9;
export var dom_SET = 10;
export var dom_STATEMENT = 15;
export var dom_DECORATOR = 16;

import { class_create } from '@utils/class';
import { dom_TEXTNODE } from './NodeType';
/**
 * @name TextNode
 * @type {class}
 * @property {type} [type=2]
 * @property {(string|function)} content
 * @property {IMaskNode} parent
 * @memberOf mask.Dom
 */
export var TextNode = class_create({
    constructor: function (text, parent) {
        this.content = text;
        this.parent = parent;
    },
    type: dom_TEXTNODE,
    content: null,
    parent: null,
    sourceIndex: -1
});

export function _appendChild(el) {
    el.parent = this;
    var nodes = this.nodes;
    if (nodes == null) {
        this.nodes = [el];
        return;
    }
    var length = nodes.length;
    if (length !== 0) {
        var prev = nodes[length - 1];
        if (prev != null) {
            prev.nextSibling = el;
        }
    }
    nodes.push(el);
}

import { class_create } from '@utils/class';
import { dom_FRAGMENT } from './NodeType';
import { _appendChild } from './utils';
export var Fragment = class_create({
    type: dom_FRAGMENT,
    nodes: null,
    appendChild: _appendChild,
    source: '',
    filename: '',
    syntax: 'mask',
    parent: null
});
export var HtmlFragment = class_create(Fragment, {
    syntax: 'html'
});

import { class_create } from '@utils/class';
import { _appendChild } from './utils';
import { dom_NODE } from './NodeType';
/**
 * @name MaskNode
 * @type {class}
 * @property {type} [type=1]
 * @property {object} attr
 * @property {string} tagName
 * @property {Array.<IMaskNode>} nodes
 * @property {IMaskNode} parent
 * @property {string} [expression]
 * @property {function} appendChild
 * @memberOf mask.Dom
 */
export var Node = class_create({
    constructor: function Node(tagName, parent) {
        this.type = dom_NODE;
        this.tagName = tagName;
        this.parent = parent;
        this.attr = {};
    },
    __single: null,
    appendChild: _appendChild,
    attr: null,
    props: null,
    expression: null,
    nodes: null,
    parent: null,
    sourceIndex: -1,
    stringify: null,
    tagName: null,
    type: dom_NODE,
    decorators: null,
    nextSibling: null
});

import { class_create } from '@utils/class';
import { dom_DECORATOR } from './NodeType';
export var DecoratorNode = class_create({
    constructor: function DecoratorNode(expression, parent) {
        this.expression = expression;
        this.parent = parent;
    },
    __single: true,
    expression: null,
    parent: null,
    sourceIndex: -1,
    type: dom_DECORATOR,
    stringify: function (stream) {
        stream.newline();
        stream.write('[' + this.expression + ']');
    }
});

import { dom_COMPONENT } from './NodeType';
export function ComponentNode(compoName, parent, controller) {
    this.tagName = compoName;
    this.parent = parent;
    this.controller = controller;
    this.attr = {};
}
ComponentNode.prototype = {
    constructor: ComponentNode,
    type: dom_COMPONENT,
    parent: null,
    attr: null,
    controller: null,
    nodes: null,
    components: null,
    model: null,
    modelRef: null
};

import { dom_NODE, dom_TEXTNODE, dom_FRAGMENT, dom_COMPONENT, dom_CONTROLLER, dom_SET, dom_STATEMENT, dom_DECORATOR } from './NodeType';
import { TextNode } from './TextNode';
import { Fragment, HtmlFragment } from './Fragment';
import { Node } from './Node';
import { DecoratorNode } from './DecoratorNode';
import { ComponentNode } from './ComponentNode';
export var Dom = {
    NODE: dom_NODE,
    TEXTNODE: dom_TEXTNODE,
    FRAGMENT: dom_FRAGMENT,
    COMPONENT: dom_COMPONENT,
    CONTROLLER: dom_CONTROLLER,
    SET: dom_SET,
    STATEMENT: dom_STATEMENT,
    DECORATOR: dom_DECORATOR,
    Node: Node,
    TextNode: TextNode,
    Fragment: Fragment,
    HtmlFragment: HtmlFragment,
    Component: ComponentNode,
    DecoratorNode: DecoratorNode
};

import { obj_extend } from '@utils/obj';
var _HtmlTags = {
    /*
        * Most common html tags
        * http://jsperf.com/not-in-vs-null/3
        */
    a: null,
    abbr: null,
    article: null,
    aside: null,
    audio: null,
    b: null,
    big: null,
    blockquote: null,
    br: null,
    button: null,
    canvas: null,
    datalist: null,
    details: null,
    div: null,
    em: null,
    fieldset: null,
    footer: null,
    form: null,
    h1: null,
    h2: null,
    h3: null,
    h4: null,
    h5: null,
    h6: null,
    header: null,
    i: null,
    img: null,
    input: null,
    label: null,
    legend: null,
    li: null,
    menu: null,
    nav: null,
    ol: null,
    option: null,
    p: null,
    pre: null,
    section: null,
    select: null,
    small: null,
    span: null,
    strong: null,
    svg: null,
    table: null,
    tbody: null,
    td: null,
    textarea: null,
    tfoot: null,
    th: null,
    thead: null,
    tr: null,
    tt: null,
    ul: null,
    video: null,
};
var _HtmlAttr = {
    'class': null,
    'id': null,
    'style': null,
    'name': null,
    'type': null,
    'value': null,
    'required': null,
    'disabled': null,
};
export var custom_Utils = {};
export var custom_Optimizers = {};
export var custom_Statements = {};
export var custom_Attributes = obj_extend({}, _HtmlAttr);
export var custom_Tags = obj_extend({}, _HtmlTags);
export var custom_Tags_global = obj_extend({}, _HtmlTags);
export var custom_Parsers = obj_extend({}, _HtmlTags);
export var custom_Parsers_Transform = obj_extend({}, _HtmlTags);
// use on server to define reserved tags and its meta info
export var custom_Tags_defs = {};

import { obj_toFastProps } from '@utils/obj';
import { custom_Attributes, custom_Statements, custom_Tags, custom_Parsers, custom_Parsers_Transform } from './repositories';
export function custom_optimize() {
    var i = _arr.length;
    while (--i > -1) {
        readProps(_arr[i]);
    }
    i = _arr.length;
    while (--i > -1) {
        defineProps(_arr[i]);
        obj_toFastProps(_arr[i]);
    }
    obj_toFastProps(custom_Attributes);
}
;
var _arr = [
    custom_Statements,
    custom_Tags,
    custom_Parsers,
    custom_Parsers_Transform
];
var _props = {};
function readProps(obj) {
    for (var key in obj) {
        _props[key] = null;
    }
}
function defineProps(obj) {
    for (var key in _props) {
        if (obj[key] === void 0) {
            obj[key] = null;
        }
    }
}

import { is_Function } from '@utils/is';
import { custom_Attributes } from './repositories';
/**
 * Register an attribute handler. Any changes can be made to:
 * - maskNode's template
 * - current element value
 * - controller
 * - model
 * Note: Attribute wont be set to an element.
 * @param {string} name - Attribute name to handle
 * @param {string} [mode] - Render mode `client|server|both`
 * @param {AttributeHandler} handler
 * @returns {void}
 * @memberOf mask
 * @method registerAttrHandler
 */
export function customAttr_register(attrName, mix, Handler) {
    if (is_Function(mix)) {
        Handler = mix;
    }
    custom_Attributes[attrName] = Handler;
}
;
/**
 * Get attribute  handler
 * @param {string} name
 * @returns {AttributeHandler}
 * @memberOf mask
 * @method getAttrHandler
 */
export function customAttr_get(attrName) {
    return attrName != null
        ? custom_Attributes[attrName]
        : custom_Attributes;
}
;
/**
 * Is called when the builder matches the node by attribute name
 * @callback AttributeHandler
 * @param {MaskNode} node
 * @param {string} attrValue
 * @param {object} model
 * @param {object} ctx
 * @param {DomNode} element
 * @param {object} parentComponent
 */ 

export var ModuleMidd = {
    parseMaskContent: function (mix, path) {
        throw new Error('Not set');
    }
};

import { obj_create, obj_extendDefaults, obj_toFastProps } from '@utils/obj';
import { is_Object, is_Function, is_String } from '@utils/is';
import { fn_createByPattern } from '@utils/fn';
import { error_withNode, reporter_deprecated } from '@core/util/reporters';
import { custom_Tags, custom_Tags_global } from './repositories';
import { ModuleMidd } from '@core/arch/Module';
/**
 * Get Components constructor from the global repository or the scope
 * @param {string} name
 * @param {object} [component] - pass a component to look in its scope
 * @returns {IComponent}
 * @memberOf mask
 * @method getHandler
 */
export function customTag_get(name, ctr) {
    if (arguments.length === 0) {
        reporter_deprecated('getHandler.all', 'Use `mask.getHandlers` to get all components (also scoped)');
        return customTag_getAll();
    }
    var Ctor = custom_Tags[name];
    if (Ctor == null) {
        return null;
    }
    if (Ctor !== Resolver) {
        return Ctor;
    }
    var ctr_ = is_Function(ctr) ? ctr.prototype : ctr;
    while (ctr_ != null) {
        if (is_Function(ctr_.getHandler)) {
            Ctor = ctr_.getHandler(name);
            if (Ctor != null) {
                return Ctor;
            }
        }
        ctr_ = ctr_.parent;
    }
    return custom_Tags_global[name];
}
/**
 * Get all components constructors from the global repository and/or the scope
 * @param {object} [component] - pass a component to look also in its scope
 * @returns {object} All components in an object `{name: Ctor}`
 * @memberOf mask
 * @method getHandlers
 */
export function customTag_getAll(ctr) {
    if (ctr == null) {
        return custom_Tags;
    }
    var obj = {}, ctr_ = ctr, x;
    while (ctr_ != null) {
        x = null;
        if (is_Function(ctr_.getHandlers)) {
            x = ctr_.getHandlers();
        }
        else {
            x = ctr_.__handlers__;
        }
        if (x != null) {
            obj = obj_extendDefaults(obj, x);
        }
        ctr_ = ctr_.parent;
    }
    for (var key in custom_Tags) {
        x = custom_Tags[key];
        if (x == null || x === Resolver) {
            continue;
        }
        if (obj[key] == null) {
            obj[key] = x;
        }
    }
    return obj;
}
/**
 * Register a component
 * @param {string} name
 * @param {object|IComponent} component
 * @param {object} component - Component static definition
 * @param {IComponent} component - Components constructor
 * @returns {void}
 * @memberOf mask
 * @method registerHandler
 */
export function customTag_register(mix, Handler) {
    if (typeof mix !== 'string' && arguments.length === 3) {
        customTag_registerScoped.apply(this, arguments);
        return;
    }
    var Ctor = compo_ensureCtor(Handler), Repo = custom_Tags[mix] === Resolver ? custom_Tags_global : custom_Tags;
    Repo[mix] = Ctor;
    //> make fast properties
    obj_toFastProps(custom_Tags);
}
/**
 * Register components from a template
 * @param {string} template - Mask template
 * @param {object|IComponent} [component] - Register in the components scope
 * @param {string} [path] - Optionally define the path for the template
 * @returns {Promise} - Fullfills when all submodules are resolved and components are registerd
 * @memberOf mask
 * @method registerFromTemplate
 */
export function customTag_registerFromTemplate(mix, Ctr, path) {
    return ModuleMidd.parseMaskContent(mix, path).then(function (exports) {
        var store = exports.__handlers__;
        for (var key in store) {
            if (key in exports) {
                // is global
                customTag_register(key, store[key]);
                continue;
            }
            customTag_registerScoped(Ctr, key, store[key]);
        }
    });
}
/**
 * Register a component
 * @param {object|IComponent} scopedComponent - Use components scope
 * @param {string} name - Name of the component
 * @param {object|IComponent} component - Components definition
 * @returns {void}
 * @memberOf mask
 * @method registerScoped
 */
export function customTag_registerScoped(Ctx, name, Handler) {
    if (Ctx == null) {
        // Use global
        customTag_register(name, Handler);
        return;
    }
    customTag_registerResolver(name);
    var obj = is_Function(Ctx) ? Ctx.prototype : Ctx;
    var map = obj.__handlers__;
    if (map == null) {
        map = obj.__handlers__ = {};
    }
    map[name] = compo_ensureCtor(Handler);
    if (obj.getHandler == null) {
        obj.getHandler = customTag_Compo_getHandler;
    }
}
/** Variations:
 * - 1. (template)
 * - 2. (scopedCompoName, template)
 * - 3. (scopedCtr, template)
 * - 4. (name, Ctor)
 * - 5. (scopedCtr, name, Ctor)
 * - 6. (scopedCompoName, name, Ctor)
 */
function is_Compo(val) {
    return is_Object(val) || is_Function(val);
}
/**
 * Universal component definition, which covers all the cases: simple, scoped, template
 * - 1. (template)
 * - 2. (scopedCompoName, template)
 * - 3. (scopedCtr, template)
 * - 4. (name, Ctor)
 * - 5. (scopedCtr, name, Ctor)
 * - 6. (scopedCompoName, name, Ctor)
 * @returns {void|Promise}
 * @memberOf mask
 * @method define
 */
export var customTag_define = fn_createByPattern([
    {
        pattern: [is_String],
        handler: function (template) {
            return customTag_registerFromTemplate(template);
        }
    },
    {
        pattern: [is_String, is_String],
        handler: function (name, template) {
            var Scope = customTag_get(name);
            return customTag_registerFromTemplate(template, Scope);
        }
    },
    {
        pattern: [is_Compo, is_String],
        handler: function (Scope, template) {
            return customTag_registerFromTemplate(template, Scope);
        }
    },
    {
        pattern: [is_String, is_Compo],
        handler: function (name, Ctor) {
            return customTag_register(name, Ctor);
        }
    },
    {
        pattern: [is_Compo, is_String, is_Compo],
        handler: function (Scope, name, Ctor) {
            customTag_registerScoped(Scope, name, Ctor);
        }
    },
    {
        pattern: [is_String, is_String, is_Compo],
        handler: function (scopeName, name, Ctor) {
            var Scope = customTag_get(scopeName);
            return customTag_registerScoped(Scope, name, Ctor);
        }
    }
]);
export function customTag_registerResolver(name) {
    var Ctor = custom_Tags[name];
    if (Ctor === Resolver)
        return;
    if (Ctor != null)
        custom_Tags_global[name] = Ctor;
    custom_Tags[name] = Resolver;
    //> make fast properties
    obj_toFastProps(custom_Tags);
}
export function customTag_Compo_getHandler(name) {
    var map = this.__handlers__;
    return map == null ? null : map[name];
}
export var customTag_Base = {
    async: false,
    attr: null,
    await: null,
    compoName: null,
    components: null,
    expression: null,
    ID: null,
    meta: null,
    node: null,
    model: null,
    nodes: null,
    parent: null,
    render: null,
    renderEnd: null,
    renderStart: null,
    tagName: null,
    type: null
};
var Resolver = function (node, model, ctx, container, ctr) {
    var Mix = customTag_get(node.tagName, ctr);
    if (Mix != null) {
        if (is_Function(Mix) === false) {
            return obj_create(Mix);
        }
        return new Mix(node, model, ctx, container, ctr);
    }
    error_withNode('Component not found: ' + node.tagName, node);
    return null;
};
export var customTag_Resolver = Resolver;
function wrapStatic(proto) {
    function Ctor(node, parent) {
        this.ID = null;
        this.node = null;
        this.tagName = node.tagName;
        this.attr = obj_create(node.attr);
        this.expression = node.expression;
        this.nodes = node.nodes;
        this.nextSibling = node.nextSibling;
        this.parent = parent;
        this.components = null;
    }
    Ctor.prototype = proto;
    return Ctor;
}
function compo_ensureCtor(Handler) {
    if (is_Object(Handler)) {
        //> static
        Handler.__Ctor = wrapStatic(Handler);
    }
    return Handler;
}

import { obj_toFastProps } from '@utils/obj';
export var op_Minus = '-'; //1;
export var op_Plus = '+'; //2;
export var op_Divide = '/'; //3;
export var op_Multip = '*'; //4;
export var op_Modulo = '%'; //5;
export var op_LogicalOr = '||'; //6;
export var op_LogicalAnd = '&&'; //7;
export var op_LogicalNot = '!'; //8;
export var op_LogicalEqual = '=='; //9;
export var op_LogicalEqual_Strict = '==='; // 111
export var op_LogicalNotEqual = '!='; //11;
export var op_LogicalNotEqual_Strict = '!=='; // 112
export var op_LogicalGreater = '>'; //12;
export var op_LogicalGreaterEqual = '>='; //13;
export var op_LogicalLess = '<'; //14;
export var op_LogicalLessEqual = '<='; //15;
export var op_Member = '.'; // 16
export var op_AsyncAccessor = '->';
export var op_ObserveAccessor = '>>';
export var op_BitOr = '|';
export var op_BitXOr = '^';
export var op_BitAnd = '&';
export var punc_ParenthesisOpen = 20;
export var punc_ParenthesisClose = 21;
export var punc_BracketOpen = 22;
export var punc_BracketClose = 23;
export var punc_BraceOpen = 24;
export var punc_BraceClose = 25;
export var punc_Comma = 26;
export var punc_Dot = 27;
export var punc_Question = 28;
export var punc_Colon = 29;
export var punc_Semicolon = 30;
export var go_ref = 31;
export var go_acs = 32;
export var go_string = 33;
export var go_number = 34;
export var go_objectKey = 35;
export var type_Body = 1;
export var type_Statement = 2;
export var type_SymbolRef = 3;
export var type_FunctionRef = 4;
export var type_Accessor = 5;
export var type_AccessorExpr = 6;
export var type_Value = 7;
export var type_Number = 8;
export var type_String = 9;
export var type_Object = 10;
export var type_Array = 11;
export var type_UnaryPrefix = 12;
export var type_Ternary = 13;
export var state_body = 1;
export var state_arguments = 2;
export var PRECEDENCE = {};
PRECEDENCE[op_Member] = 1;
PRECEDENCE[op_Divide] = 2;
PRECEDENCE[op_Multip] = 2;
PRECEDENCE[op_Minus] = 3;
PRECEDENCE[op_Plus] = 3;
PRECEDENCE[op_LogicalGreater] = 4;
PRECEDENCE[op_LogicalGreaterEqual] = 4;
PRECEDENCE[op_LogicalLess] = 4;
PRECEDENCE[op_LogicalLessEqual] = 4;
PRECEDENCE[op_LogicalEqual] = 5;
PRECEDENCE[op_LogicalEqual_Strict] = 5;
PRECEDENCE[op_LogicalNotEqual] = 5;
PRECEDENCE[op_LogicalNotEqual_Strict] = 5;
PRECEDENCE[op_BitOr] = 5;
PRECEDENCE[op_BitXOr] = 5;
PRECEDENCE[op_BitAnd] = 5;
PRECEDENCE[op_LogicalAnd] = 7;
PRECEDENCE[op_LogicalOr] = 7;
obj_toFastProps(PRECEDENCE);

import { type_Ternary, type_Body, type_Statement, type_Value, type_Array, type_Object, type_FunctionRef, type_SymbolRef, type_Accessor, type_AccessorExpr, type_UnaryPrefix } from './scope-vars';
import { class_create } from '@utils/class';
import { is_String } from '@utils/is';
export var Ast_Body = class_create({
    body: null,
    join: null,
    constructor: function Ast_Body(parent, node) {
        this.parent = parent;
        this.type = type_Body;
        this.body = [];
        this.join = null;
        this.node = node;
        this.source = null;
        this.async = false;
        this.observe = false;
    },
    toString: function () {
        var arr = this.body, l = arr.length, str = '';
        for (var i = 0; i < l; i++) {
            if (i > 0) {
                str += ', ';
            }
            str += arr[i].toString();
        }
        return str;
    }
});
export var Ast_Statement = class_create({
    constructor: function Ast_Statement(parent) {
        this.parent = parent;
        this.async = false;
        this.observe = false;
        this.preResultIndex = -1;
    },
    type: type_Statement,
    join: null,
    body: null,
    async: null,
    observe: null,
    parent: null,
    toString: function () {
        return (this.body && this.body.toString()) || '';
    }
});
export var Ast_Value = class_create({
    constructor: function Ast_Value(value) {
        this.type = type_Value;
        this.body = value;
        this.join = null;
    },
    toString: function () {
        if (is_String(this.body)) {
            return "'" + this.body.replace(/'/g, "\\'") + "'";
        }
        return this.body;
    }
});
export var Ast_Array = class_create({
    constructor: function Ast_Array(parent) {
        this.type = type_Array;
        this.parent = parent;
        this.body = new Ast_Body(this);
    },
    toString: function () {
        return '[' + this.body.toString() + ']';
    }
});
export var Ast_Object = class_create({
    constructor: function Ast_Object(parent) {
        this.type = type_Object;
        this.parent = parent;
        this.props = {};
    },
    nextProp: function (prop) {
        var body = new Ast_Statement(this);
        this.props[prop] = body;
        return body;
    }
});
export var Ast_FunctionRef = class_create({
    constructor: function Ast_FunctionRef(parent, ref) {
        this.parent = parent;
        this.type = type_FunctionRef;
        this.body = ref;
        this.arguments = [];
        this.next = null;
    },
    newArg: function () {
        var body = new Ast_Body(this);
        this.arguments.push(body);
        return body;
    },
    closeArgs: function () {
        var last = this.arguments[this.arguments.length - 1];
        if (last.body.length === 0) {
            this.arguments.pop();
        }
    },
    toString: function () {
        var args = this.arguments
            .map(function (x) {
            return x.toString();
        })
            .join(', ');
        return this.body + '(' + args + ')';
    }
});
var Ast_AccessorBase = {
    optional: false,
    sourceIndex: null,
    next: null
};
export var Ast_SymbolRef = class_create(Ast_AccessorBase, {
    type: type_SymbolRef,
    constructor: function (parent, ref) {
        this.parent = parent;
        this.body = ref;
    },
    toString: function () {
        return this.next == null
            ? this.body
            : this.body + "." + this.next.toString();
    }
});
export var Ast_Accessor = class_create(Ast_AccessorBase, {
    type: type_Accessor,
    constructor: function (parent, ref) {
        this.parent = parent;
        this.body = ref;
    },
    toString: function () {
        return ('.' + this.body + (this.next == null ? '' : this.next.toString()));
    }
});
export var Ast_AccessorExpr = class_create({
    type: type_AccessorExpr,
    constructor: function (parent) {
        this.parent = parent;
        this.body = new Ast_Statement(this);
        this.body.body = new Ast_Body(this.body);
    },
    getBody: function () {
        return this.body.body;
    },
    toString: function () {
        return '[' + this.body.toString() + ']';
    }
});
export var Ast_UnaryPrefix = class_create({
    type: type_UnaryPrefix,
    body: null,
    constructor: function Ast_UnaryPrefix(parent, prefix) {
        this.parent = parent;
        this.prefix = prefix;
    }
});
export var Ast_TernaryStatement = class_create({
    constructor: function Ast_TernaryStatement(assertions) {
        this.body = assertions;
        this.case1 = new Ast_Body(this);
        this.case2 = new Ast_Body(this);
    },
    type: type_Ternary,
    case1: null,
    case2: null
});

import { type_Body, type_Statement, PRECEDENCE } from './scope-vars';
import { Ast_Body } from './ast';
export function ast_remove(parent, ref) {
    if (parent.type === type_Statement) {
        parent.body = null;
    }
}
export function ast_findPrev(node, nodeType) {
    var x = node;
    while (x != null) {
        if (x.type === nodeType) {
            return x;
        }
        x = x.parent;
    }
    return null;
}
export function ast_handlePrecedence(ast) {
    if (ast.type !== type_Body) {
        if (ast.body != null && typeof ast.body === 'object')
            ast_handlePrecedence(ast.body);
        return;
    }
    var body = ast.body, i = 0, length = body.length, x, prev, array;
    if (length === 0) {
        return;
    }
    for (; i < length; i++) {
        ast_handlePrecedence(body[i]);
    }
    for (i = 1; i < length; i++) {
        x = body[i];
        prev = body[i - 1];
        if (PRECEDENCE[prev.join] > PRECEDENCE[x.join])
            break;
    }
    if (i === length)
        return;
    array = [body[0]];
    for (i = 1; i < length; i++) {
        x = body[i];
        prev = body[i - 1];
        var prec_Prev = PRECEDENCE[prev.join];
        if (prec_Prev > PRECEDENCE[x.join] && i < length - 1) {
            var start = i, nextJoin, arr;
            // collect all with join smaller or equal to previous
            // 5 == 3 * 2 + 1 -> 5 == (3 * 2 + 1);
            while (++i < length) {
                nextJoin = body[i].join;
                if (nextJoin == null)
                    break;
                if (prec_Prev <= PRECEDENCE[nextJoin])
                    break;
            }
            arr = body.slice(start, i + 1);
            x = ast_join(arr);
            ast_handlePrecedence(x);
        }
        array.push(x);
    }
    ast.body = array;
}
// = private
function ast_join(bodyArr) {
    if (bodyArr.length === 0)
        return null;
    var body = new Ast_Body(bodyArr[0].parent);
    body.join = bodyArr[bodyArr.length - 1].join;
    body.body = bodyArr;
    return body;
}

export function coll_each(coll, fn, ctx) {
    if (ctx == null)
        ctx = coll;
    if (coll == null)
        return coll;
    var imax = coll.length, i = 0;
    for (; i < imax; i++) {
        fn.call(ctx, coll[i], i);
    }
    return ctx;
}
;
export function coll_indexOf(coll, x) {
    if (coll == null)
        return -1;
    var imax = coll.length, i = 0;
    for (; i < imax; i++) {
        if (coll[i] === x)
            return i;
    }
    return -1;
}
;
export function coll_remove(coll, x) {
    var i = coll_indexOf(coll, x);
    if (i === -1)
        return false;
    coll.splice(i, 1);
    return true;
}
;
export function coll_map(coll, fn, ctx) {
    var arr = new Array(coll.length);
    coll_each(coll, function (x, i) {
        arr[i] = fn.call(this, x, i);
    }, ctx);
    return arr;
}
;
export function coll_find(coll, fn, ctx) {
    var imax = coll.length, i = 0;
    for (; i < imax; i++) {
        if (fn.call(ctx || coll, coll[i], i))
            return true;
    }
    return false;
}
;

export var __rgxEscapedChar = {
    "'": /\\'/g,
    '"': /\\"/g,
    '{': /\\\{/g,
    '>': /\\>/g,
    ';': /\\>/g
};

import { parser_warn } from '@core/util/reporters';
export function cursor_groupEnd(str, i, imax, startCode, endCode) {
    var count = 0, start = i, c;
    for (; i < imax; i++) {
        c = str.charCodeAt(i);
        if (c === 34 || c === 39) {
            // "|'
            i = cursor_quoteEnd(str, i + 1, imax, c === 34 ? '"' : "'");
            continue;
        }
        if (c === startCode) {
            count++;
            continue;
        }
        if (c === endCode) {
            if (--count === -1)
                return i;
        }
    }
    parser_warn('Group was not closed', str, start);
    return imax;
}
;
export function cursor_refEnd(str, i, imax) {
    var c;
    while (i < imax) {
        c = str.charCodeAt(i);
        if (c === 36 || c === 95) {
            // $ _
            i++;
            continue;
        }
        if ((48 <= c && c <= 57) || // 0-9
            (65 <= c && c <= 90) || // A-Z
            (97 <= c && c <= 122)) { // a-z
            i++;
            continue;
        }
        break;
    }
    return i;
}
;
export function cursor_tokenEnd(str, i, imax) {
    var c;
    while (i < imax) {
        c = str.charCodeAt(i);
        if (c === 36 || c === 95 || c === 58) {
            // $ _ :
            i++;
            continue;
        }
        if ((48 <= c && c <= 57) || // 0-9
            (65 <= c && c <= 90) || // A-Z
            (97 <= c && c <= 122)) { // a-z
            i++;
            continue;
        }
        break;
    }
    return i;
}
;
export function cursor_quoteEnd(str, i, imax, char_) {
    var start = i;
    while ((i = str.indexOf(char_, i)) !== -1) {
        if (str.charCodeAt(i - 1) !== 92 /*\*/) {
            return i;
        }
        i++;
    }
    parser_warn('Quote was not closed', str, start - 1);
    return imax;
}
;
export function cursor_skipWhitespace(str, i_, imax) {
    for (var i = i_; i < imax; i++) {
        if (str.charCodeAt(i) > 32)
            return i;
    }
    return i;
}
;
export function cursor_skipWhitespaceBack(str, i) {
    for (; i > 0; i--) {
        if (str.charCodeAt(i) > 32)
            return i;
    }
    return i;
}
;
export function cursor_goToWhitespace(str, i, imax) {
    for (; i < imax; i++) {
        if (str.charCodeAt(i) < 33)
            return i;
    }
    return i;
}
;

import { log_error } from '@core/util/reporters';
export var interp_START = '~';
export var interp_OPEN = '[';
export var interp_CLOSE = ']';
// ~
export var interp_code_START = 126;
// [
export var interp_code_OPEN = 91;
// ]
export var interp_code_CLOSE = 93;
export var go_tag = 10;
export var go_up = 11;
export var go_attrVal = 12;
export var go_propVal = 13;
export var go_attrHeadVal = 14;
export var state_tag = 3;
export var state_attr = 4;
export var state_prop = 5;
export var state_literal = 6;
export function parser_setInterpolationQuotes(start, end) {
    if (!start || start.length !== 2) {
        log_error('Interpolation Start must contain 2 Characters');
        return;
    }
    if (!end || end.length !== 1) {
        log_error('Interpolation End must be of 1 Character');
        return;
    }
    interp_code_START = start.charCodeAt(0);
    interp_code_OPEN = start.charCodeAt(1);
    interp_code_CLOSE = end.charCodeAt(0);
    interp_START = start[0];
    interp_OPEN = start[1];
    interp_CLOSE = end;
}
;

export var parser_cfg_ContentTags = {
    script: 1,
    style: 1,
    template: 1,
    markdown: 1
};
export function parser_defineContentTag(name) {
    parser_cfg_ContentTags[name] = 1;
}
;

import { cursor_skipWhitespace, cursor_quoteEnd, cursor_goToWhitespace, cursor_groupEnd } from '@core/parser/cursor';
export function parser_parseAttr(str, start, end) {
    var attr = {}, i = start, key, val, c;
    while (i < end) {
        i = cursor_skipWhitespace(str, i, end);
        if (i === end)
            break;
        start = i;
        for (; i < end; i++) {
            c = str.charCodeAt(i);
            if (c === 61 || c < 33)
                break;
        }
        key = str.substring(start, i);
        i = cursor_skipWhitespace(str, i, end);
        if (i === end) {
            attr[key] = key;
            break;
        }
        if (str.charCodeAt(i) !== 61 /*=*/) {
            attr[key] = key;
            continue;
        }
        i = start = cursor_skipWhitespace(str, i + 1, end);
        c = str.charCodeAt(i);
        if (c === 34 || c === 39) {
            // "|'
            i = cursor_quoteEnd(str, i + 1, end, c === 39 ? "'" : '"');
            attr[key] = str.substring(start + 1, i);
            i++;
            continue;
        }
        i = cursor_goToWhitespace(str, i, end);
        attr[key] = str.substring(start, i);
    }
    return attr;
}
;
export function parser_parseAttrObject(str, i, imax, attr) {
    var state_KEY = 1, state_VAL = 2, state_END = 3, state = state_KEY, token, index, key, c;
    outer: while (i < imax) {
        i = cursor_skipWhitespace(str, i, imax);
        if (i === imax)
            break;
        index = i;
        c = str.charCodeAt(i);
        switch (c) {
            case 61 /* = */:
                i++;
                state = state_VAL;
                continue outer;
            case 123:
            case 59:
            case 62:
            case 47:
                // {;>/
                state = state_END;
                break;
            case 40:
                //()
                i = cursor_groupEnd(str, ++index, imax, 40, 41);
                if (key != null) {
                    attr[key] = key;
                }
                key = 'expression';
                token = str.substring(index, i);
                i++;
                state = state_VAL;
                break;
            case 39:
            case 34:
                //'"
                i = cursor_quoteEnd(str, ++index, imax, c === 39 ? "'" : '"');
                token = str.substring(index, i);
                i++;
                break;
            default:
                i++;
                for (; i < imax; i++) {
                    c = str.charCodeAt(i);
                    if (c < 33 || c === 61 || c === 123 || c === 59 || c === 62 || c === 47) {
                        // ={;>/
                        break;
                    }
                }
                token = str.substring(index, i);
                break;
        }
        if (state === state_VAL) {
            attr[key] = token;
            state = state_KEY;
            key = null;
            continue;
        }
        if (key != null) {
            attr[key] = key;
            key = null;
        }
        if (state === state_END) {
            break;
        }
        key = token;
    }
    return i;
}
;

import { reporter_deprecated } from './reporters';
import { _global } from '@utils/refs';
import { customUtil_$utils } from '@core/custom/exports';
export function obj_getPropertyEx(path, model, ctx, ctr) {
    if (path === '.') {
        return model;
    }
    var props = path.split('.');
    var imax = props.length;
    var key = props[0];
    if ('$c' === key || '$' === key) {
        reporter_deprecated('accessor.compo', 'Use `this` instead of `$c` or `$`');
        key = '$';
    }
    if ('$u' === key) {
        reporter_deprecated('accessor.util', 'Use `_` instead of `$u`');
        key = '_';
    }
    if ('this' === key) {
        return getFromCompo_(ctr, props, 1, imax);
    }
    if ('$a' === key) {
        return getProperty_(ctr && ctr.attr, props, 1, imax);
    }
    if ('_' === key) {
        return getProperty_(customUtil_$utils, props, 1, imax);
    }
    if ('$ctx' === key) {
        return getProperty_(ctx, props, 1, imax);
    }
    if ('$scope' === key) {
        return getFromScope_(ctr, props, 1, imax);
    }
    if ('global' === key) {
        return getProperty_(_global, props, 0, imax);
    }
    var x = getProperty_(model, props, 0, imax);
    if (x != null) {
        return x;
    }
    return getFromScope_(ctr, props, 0, imax);
}
;
export function obj_toDictionary(obj) {
    var array = [], i = 0, key;
    for (key in obj) {
        array[i++] = {
            key: key,
            value: obj[key]
        };
    }
    return array;
}
;
// = private
function getProperty_(obj, props, startIndex, imax) {
    var i = startIndex, val = obj;
    while (i < imax && val != null) {
        val = val[props[i]];
        i++;
    }
    return val;
}
function getFromScope_(ctr_, props, startIndex, imax) {
    var ctr = ctr_;
    while (ctr != null) {
        var scope = ctr.scope;
        if (scope != null) {
            var x = getProperty_(scope, props, startIndex, imax);
            if (x !== void 0) {
                return x;
            }
        }
        ctr = ctr.parent;
    }
    return null;
}
function getFromCompo_(ctr_, props, startIndex, imax) {
    var ctr = ctr_;
    while (ctr != null) {
        var x = getProperty_(ctr, props, startIndex, imax);
        if (x !== void 0) {
            return x;
        }
        ctr = ctr.parent;
    }
    return null;
}

import { log_error } from '@core/util/reporters';
import { custom_Utils } from '@core/custom/exports';
import { obj_getPropertyEx } from '@core/util/object';
import { interp_code_OPEN, interp_START, interp_code_CLOSE } from './const';
import { cursor_groupEnd } from './cursor';
export function parser_ensureTemplateFunction(template) {
    var mix = _split(template);
    if (mix == null) {
        return template;
    }
    if (typeof mix === 'string') {
        return mix;
    }
    var array = mix;
    return function (type, model, ctx, element, ctr, name, node) {
        if (type === void 0) {
            return template;
        }
        return _interpolate(array, type, model, ctx, element, ctr, name, node);
    };
}
;
function _split(template) {
    var index = -1, wasEscaped = false;
    /*
     * - single char indexOf is much faster then '~[' search
     * - function is divided in 2 parts: interpolation start lookup + interpolation parse
     * for better performance
     */
    while ((index = template.indexOf(interp_START, index)) !== -1) {
        var nextC = template.charCodeAt(index + 1);
        var escaped = _char_isEscaped(template, index);
        if (escaped === true) {
            wasEscaped = true;
        }
        if (escaped === false) {
            if (nextC === interp_code_OPEN)
                break;
            if (_char_isSimpleInterp(nextC)) {
                break;
            }
        }
        index++;
    }
    if (index === -1) {
        if (wasEscaped === true) {
            return _escape(template);
        }
        return null;
    }
    var length = template.length, array = [], lastIndex = 0, i = 0, end;
    var propAccessor = false;
    while (true) {
        array[i++] = lastIndex === index
            ? ''
            : _slice(template, lastIndex, index);
        var nextI = index + 1;
        var nextC = template.charCodeAt(nextI);
        if (nextC === interp_code_OPEN) {
            propAccessor = false;
            end = cursor_groupEnd(template, nextI + 1, length, interp_code_OPEN, interp_code_CLOSE);
            var str = template.substring(index + 2, end);
            array[i++] = new InterpolationModel(null, str);
            lastIndex = index = end + 1;
        }
        else if (_char_isSimpleInterp(nextC)) {
            propAccessor = true;
            end = _cursor_propertyAccessorEnd(template, nextI, length);
            var str = template.substring(index + 1, end);
            array[i++] = new InterpolationModel(str, null);
            lastIndex = index = end;
        }
        else {
            array[i] += template[nextI];
            lastIndex = nextI;
        }
        while ((index = template.indexOf(interp_START, index)) !== -1) {
            nextC = template.charCodeAt(index + 1);
            var escaped = _char_isEscaped(template, index);
            if (escaped === true) {
                wasEscaped = true;
            }
            if (escaped === false) {
                if (nextC === interp_code_OPEN)
                    break;
                if (_char_isSimpleInterp(nextC)) {
                    break;
                }
            }
            index++;
        }
        if (index === -1) {
            break;
        }
    }
    if (lastIndex < length) {
        array[i] = wasEscaped === true
            ? _slice(template, lastIndex, length)
            : template.substring(lastIndex);
    }
    return array;
}
function _char_isSimpleInterp(c) {
    //A-z$_
    return (c >= 65 && c <= 122) || c === 36 || c === 95;
}
function _char_isEscaped(str, i) {
    if (i === 0) {
        return false;
    }
    var c = str.charCodeAt(--i);
    if (c === 92) {
        if (_char_isEscaped(str, c))
            return false;
        return true;
    }
    return false;
}
function _slice(string, start, end) {
    var str = string.substring(start, end);
    var i = str.indexOf(interp_START);
    if (i === -1) {
        return str;
    }
    return _escape(str);
}
function _escape(str) {
    return str.replace(/\\~/g, '~');
}
function InterpolationModel(prop, expr) {
    this.prop = prop;
    this.expr = expr;
}
InterpolationModel.prototype.process = function (model, ctx, el, ctr, name, type, node) {
    if (this.prop != null) {
        return obj_getPropertyEx(this.prop, model, ctx, ctr);
    }
    var expr = this.expr, index = expr.indexOf(':'), util;
    if (index !== -1) {
        if (index === 0) {
            expr = expr.substring(index + 1);
        }
        else {
            var match = rgx_UTIL.exec(expr);
            if (match != null) {
                util = match[1];
                expr = expr.substring(index + 1);
            }
        }
    }
    if (util == null || util === '') {
        util = 'expression';
    }
    var fn = custom_Utils[util];
    if (fn == null) {
        log_error('Undefined custom util:', util);
        return null;
    }
    return fn(expr, model, ctx, el, ctr, name, type, node);
};
/**
 * If we rendere interpolation in a TextNode, then custom util can return not only string values,
 * but also any HTMLElement, then TextNode will be splitted and HTMLElements will be inserted within.
 * So in that case we return array where we hold strings and that HTMLElements.
 *
 * If we interpolate the string in a components attribute and we have only one expression,
 * then return raw value
 *
 * If custom utils returns only strings, then String will be returned by this function
 * @returns {(array|string)}
 */
function _interpolate(arr, type, model, ctx, el, ctr, name, node) {
    if ((type === 'compo-attr' || type === 'compo-prop') && arr.length === 2 && arr[0] === '') {
        return arr[1].process(model, ctx, el, ctr, name, type);
    }
    var imax = arr.length, i = -1, array = null, string = '', even = true;
    while (++i < imax) {
        if (even === true) {
            if (array == null) {
                string += arr[i];
            }
            else {
                array.push(arr[i]);
            }
        }
        else {
            var interp = arr[i], mix = interp.process(model, ctx, el, ctr, name, type, node);
            if (mix != null) {
                if (typeof mix === 'object' && array == null) {
                    array = [string];
                }
                if (array == null) {
                    string += mix;
                }
                else {
                    array.push(mix);
                }
            }
        }
        even = !even;
    }
    return array == null
        ? string
        : array;
}
function _cursor_propertyAccessorEnd(str, i, imax) {
    var c;
    while (i < imax) {
        c = str.charCodeAt(i);
        if (c === 36 || c === 95 || c === 46) {
            // $ _ .
            i++;
            continue;
        }
        if ((48 <= c && c <= 57) || // 0-9
            (65 <= c && c <= 90) || // A-Z
            (97 <= c && c <= 122)) { // a-z
            i++;
            continue;
        }
        break;
    }
    return i;
}
var rgx_UTIL = /^\s*(\w+):/;

import { go_tag, state_literal, state_attr } from '../const';
import { Dom } from '@core/dom/exports';
import { parser_warn } from '@core/util/reporters';
import { cursor_skipWhitespace, cursor_tokenEnd } from '../cursor';
import { parser_cfg_ContentTags } from '../config';
import { parser_parseAttrObject } from '../mask/partials/attributes';
import { parser_parse } from '../mask/parser';
import { parser_ensureTemplateFunction } from '../interpolation';
var state_closeTag = 21;
var CDATA = '[CDATA[', DOCTYPE = 'DOCTYPE';
/**
 * Parse **Html** template to the AST tree
 * @param {string} template - Html Template
 * @returns {MaskNode}
 * @memberOf mask
 * @method parseHtml
 */
export function parser_parseHtml(str) {
    var tripple = parser_parseHtmlPartial(str, 0, false);
    return tripple[0];
}
;
export function parser_parseHtmlPartial(str, index, exitEarly) {
    var current = new Dom.HtmlFragment(), fragment = current, state = go_tag, i = index, imax = str.length, token, c, // charCode
    start;
    outer: while (i <= imax) {
        if (state === state_literal && current === fragment && exitEarly === true) {
            return [fragment, i, 0];
        }
        if (state === state_attr) {
            i = parser_parseAttrObject(str, i, imax, current.attr);
            if (i === imax) {
                break;
            }
            handleNodeAttributes(current);
            switch (char_(str, i)) {
                case 47: // /
                    current = current.parent;
                    i = until_(str, i, imax, 62);
                    break;
                case 62: // >
                    if (SINGLE_TAGS[current.tagName.toLowerCase()] === 1) {
                        current = current.parent;
                    }
                    break;
            }
            i++;
            var tagName = current.tagName;
            if (tagName === 'mask' || parser_cfg_ContentTags[tagName] === 1) {
                var result = _extractContent(str, i, tagName);
                var txt = result[0];
                i = result[1];
                if (tagName === 'mask') {
                    current.parent.nodes.pop();
                    current = current.parent;
                    var mix = parser_parse(txt);
                    if (mix.type !== Dom.FRAGMENT) {
                        var maskFrag = new Dom.Fragment();
                        maskFrag.appendChild(mix);
                        mix = maskFrag;
                    }
                    current.appendChild(mix);
                }
                else {
                    current.appendChild(new Dom.TextNode(result[0]));
                    current = current.parent;
                }
            }
            state = state_literal;
            continue outer;
        }
        c = char_(str, i);
        if (c === 60) {
            //<
            c = char_(str, ++i);
            if (c === 33 /*!*/) {
                if (char_(str, i + 1) === 45 && char_(str, i + 2) === 45) {
                    //-- COMMENT
                    i = str.indexOf('-->', i + 3) + 3;
                    if (i === 2) {
                        i = imax;
                    }
                    state = state_literal;
                    continue outer;
                }
                if (str.substring(i + 1, i + 1 + CDATA.length).toUpperCase() === CDATA) {
                    // CDATA
                    start = i + 1 + CDATA.length;
                    i = str.indexOf(']]>', start);
                    if (i === -1)
                        i = imax;
                    current.appendChild(new Dom.TextNode(str.substring(start, i)));
                    i += 3;
                    state = state_literal;
                    continue outer;
                }
                if (str.substring(i + 1, i + 1 + DOCTYPE.length).toUpperCase() === DOCTYPE) {
                    // DOCTYPE
                    var doctype = new Dom.Node('!' + DOCTYPE, current);
                    doctype.attr.html = 'html';
                    current.appendChild(doctype);
                    i = until_(str, i, imax, 62) + 1;
                    state = state_literal;
                    continue outer;
                }
            }
            if (c === 36 || c === 95 || c === 58 || c === 43 || c === 47 || (65 <= c && c <= 90) || (97 <= c && c <= 122)) {
                // $_:+/ A-Z a-z
                if (c === 47 /*/*/) {
                    state = state_closeTag;
                    i++;
                    i = cursor_skipWhitespace(str, i, imax);
                }
                start = i;
                i = cursor_tokenEnd(str, i + 1, imax);
                token = str.substring(start, i);
                if (state === state_closeTag) {
                    current = tag_Close(current, token.toLowerCase());
                    state = state_literal;
                    i = until_(str, i, imax, 62 /*>*/);
                    i++;
                    continue outer;
                }
                // open tag
                current = tag_Open(token, current);
                state = state_attr;
                continue outer;
            }
            i--;
        }
        // LITERAL
        start = i;
        token = '';
        while (i <= imax) {
            c = char_(str, i);
            if (c === 60 /*<*/) {
                // MAYBE NODE
                c = char_(str, i + 1);
                if (c === 36 || c === 95 || c === 58 || c === 43 || c === 47 || c === 33) {
                    // $_:+/!
                    break;
                }
                if ((65 <= c && c <= 90) || // A-Z
                    (97 <= c && c <= 122)) { // a-z
                    break;
                }
            }
            if (c === 38 /*&*/) {
                // ENTITY
                var Char = null;
                var ent = null;
                ent = unicode_(str, i + 1, imax);
                if (ent != null) {
                    Char = unicode_toChar(ent);
                }
                else {
                    ent = entity_(str, i + 1, imax);
                    if (ent != null) {
                        Char = entity_toChar(ent);
                    }
                }
                if (Char != null) {
                    token += str.substring(start, i) + Char;
                    i = i + ent.length + 1 /*;*/;
                    start = i + 1;
                }
            }
            i++;
        }
        token += str.substring(start, i);
        if (token !== '') {
            token = parser_ensureTemplateFunction(token);
            current.appendChild(new Dom.TextNode(token, current));
        }
    }
    var nodes = fragment.nodes;
    var result = nodes != null && nodes.length === 1
        ? nodes[0]
        : fragment;
    return [result, imax, 0];
}
;
function char_(str, i) {
    return str.charCodeAt(i);
}
function until_(str, i, imax, c) {
    for (; i < imax; i++) {
        if (c === char_(str, i)) {
            return i;
        }
    }
    return i;
}
function unicode_(str, i, imax) {
    var lim = 7, c = char_(str, i);
    if (c !== 35 /*#*/) {
        return null;
    }
    var start = i + 1;
    while (++i < imax) {
        if (--lim === 0) {
            return null;
        }
        c = char_(str, i);
        if (48 <= c && c <= 57 /*0-9*/) {
            continue;
        }
        if (65 <= c && c <= 70 /*A-F*/) {
            continue;
        }
        if (c === 120 /*x*/) {
            continue;
        }
        if (c === 59 /*;*/) {
            return str.substring(start, i);
        }
        break;
    }
    return null;
}
function unicode_toChar(unicode) {
    var num = Number('0' + unicode);
    if (num !== num) {
        parser_warn('Invalid Unicode Char', unicode);
        return '';
    }
    return String.fromCharCode(num);
}
function entity_(str, i, imax) {
    var lim = 10, start = i;
    for (; i < imax; i++, lim--) {
        if (lim === 0) {
            return null;
        }
        var c = char_(str, i);
        if (c === 59 /*;*/) {
            break;
        }
        if ((48 <= c && c <= 57) || // 0-9
            (65 <= c && c <= 90) || // A-Z
            (97 <= c && c <= 122)) { // a-z
            i++;
            continue;
        }
        return null;
    }
    return str.substring(start, i);
}
var entity_toChar = (function (d) {
    //#if (NODE)
    var HtmlEntities;
    return function (ent) {
        if (HtmlEntities == null) {
            HtmlEntities = require('./html_entities.js');
        }
        return HtmlEntities[ent];
    };
    //#endif
}(typeof document === 'undefined' ? null : document));
var SINGLE_TAGS = {
    area: 1,
    base: 1,
    br: 1,
    col: 1,
    embed: 1,
    hr: 1,
    img: 1,
    input: 1,
    keygen: 1,
    link: 1,
    menuitem: 1,
    meta: 1,
    param: 1,
    source: 1,
    track: 1,
    wbr: 1,
    '!doctype': 1,
};
var IMPLIES_CLOSE;
(function () {
    var formTags = {
        input: 1,
        option: 1,
        optgroup: 1,
        select: 1,
        button: 1,
        datalist: 1,
        textarea: 1
    };
    IMPLIES_CLOSE = {
        tr: { tr: 1, th: 1, td: 1 },
        th: { th: 1 },
        td: { thead: 1, td: 1 },
        body: { head: 1, link: 1, script: 1 },
        li: { li: 1 },
        p: { p: 1 },
        h1: { p: 1 },
        h2: { p: 1 },
        h3: { p: 1 },
        h4: { p: 1 },
        h5: { p: 1 },
        h6: { p: 1 },
        select: formTags,
        input: formTags,
        output: formTags,
        button: formTags,
        datalist: formTags,
        textarea: formTags,
        option: { option: 1 },
        optgroup: { optgroup: 1 }
    };
}());
function tag_Close(current, name) {
    if (SINGLE_TAGS[name] === 1) {
        // donothing
        return current;
    }
    var x = current;
    while (x != null) {
        if (x.tagName != null && x.tagName.toLowerCase() === name) {
            break;
        }
        x = x.parent;
    }
    if (x == null) {
        parser_warn('Unmatched closing tag', name);
        return current;
    }
    return x.parent || x;
}
function tag_Open(name, current) {
    var node = current;
    var TAGS = IMPLIES_CLOSE[name];
    if (TAGS != null) {
        while (node != null && node.tagName != null && TAGS[node.tagName.toLowerCase()] === 1) {
            node = node.parent;
        }
    }
    var next = new Dom.Node(name, node);
    node.appendChild(next);
    return next;
}
function handleNodeAttributes(node) {
    var obj = node.attr, key, val;
    for (key in obj) {
        val = obj[key];
        if (val != null && val !== key) {
            obj[key] = parser_ensureTemplateFunction(val);
        }
    }
    if (obj.expression != null) {
        node.expression = obj.expression;
        node.type = Dom.STATEMENT;
    }
}
// function _appendMany(node, nodes) {
// 	arr_each(nodes, function(x){
// 		node.appendChild(x)
// 	});
// }
var _extractContent;
(function () {
    _extractContent = function (str, i, name) {
        var start = i, end = i;
        var match = rgxGet(name, i).exec(str);
        if (match == null) {
            end = i = str.length;
        }
        else {
            end = match.index;
            i = end + match[0].length;
        }
        return [str.substring(start, end), i];
    };
    var rgx = {};
    var rgxGet = function (name, i) {
        var r = rgx[name];
        if (r == null) {
            r = rgx[name] = new RegExp('<\\s*/' + name + '[^>]*>', 'gi');
        }
        r.lastIndex = i;
        return r;
    };
}());

import { __rgxEscapedChar } from '@core/scope-vars';
import { Dom } from '@core/dom/exports';
import { parser_warn, parser_error } from '@core/util/reporters';
import { custom_Parsers, custom_Parsers_Transform } from '@core/custom/exports';
import { cursor_skipWhitespaceBack, cursor_groupEnd, cursor_skipWhitespace, cursor_refEnd } from '../cursor';
import { parser_parseHtmlPartial } from '../html/parser';
import { go_tag, state_tag, state_attr, go_propVal, state_literal, go_up, go_attrVal, go_attrHeadVal, state_prop, interp_code_START, interp_code_OPEN, interp_code_CLOSE } from '../const';
import { parser_ensureTemplateFunction } from '../interpolation';
/**
 * Parse **Mask** template to the AST tree
 * @param {string} template - Mask Template
 * @returns {MaskNode}
 * @memberOf mask
 * @method parse
 */
export function parser_parse(template, filename) {
    var current = new Dom.Fragment(), fragment = current, state = go_tag, last = state_tag, index = 0, length = template.length, classNames, token, tokenIndex, key, value, next, c, // charCode
    start, nextC, sourceIndex;
    fragment.source = template;
    fragment.filename = filename;
    outer: while (true) {
        while (index < length && (c = template.charCodeAt(index)) < 33) {
            index++;
        }
        // COMMENTS
        if (c === 47) {
            // /
            nextC = template.charCodeAt(index + 1);
            if (nextC === 47) {
                // inline (/)
                index++;
                while (c !== 10 && c !== 13 && index < length) {
                    // goto newline
                    c = template.charCodeAt(++index);
                }
                continue;
            }
            if (nextC === 42) {
                // block (*)
                index = template.indexOf('*/', index + 2) + 2;
                if (index === 1) {
                    // if DEBUG
                    parser_warn('Block comment has no ending', template, index);
                    // endif
                    index = length;
                }
                continue;
            }
        }
        if (last === state_attr) {
            if (classNames != null) {
                current.attr['class'] = parser_ensureTemplateFunction(classNames);
                classNames = null;
            }
            if (key != null) {
                current.attr[key] = key;
                key = null;
                token = null;
            }
        }
        if (token != null) {
            if (state === state_attr) {
                if (key == null) {
                    key = token;
                }
                else {
                    value = token;
                }
                if (key != null && value != null) {
                    if (key !== 'class') {
                        current.attr[key] = value;
                    }
                    else {
                        classNames = classNames == null ? value : classNames + ' ' + value;
                    }
                    key = null;
                    value = null;
                }
            }
            else if (state === go_propVal) {
                if (key == null || token == null) {
                    parser_warn('Unexpected property value state', template, index, c, state);
                }
                if (current.props == null) {
                    current.props = {};
                }
                current.props[key] = token;
                state = state_attr;
                last = go_propVal;
                token = null;
                key = null;
                continue;
            }
            else if (last === state_tag) {
                //next = custom_Tags[token] != null
                //	? new Component(token, current, custom_Tags[token])
                //	: new Node(token, current);
                var parser = custom_Parsers[token];
                if (parser != null) {
                    // Parser should return: [ parsedNode, nextIndex, nextState ]
                    var tuple = parser(template, index, length, current);
                    var node = tuple[0], nextState = tuple[2];
                    index = tuple[1];
                    state = nextState === 0
                        ? go_tag
                        : nextState;
                    if (node != null) {
                        node.sourceIndex = tokenIndex;
                        var transform = custom_Parsers_Transform[token];
                        if (transform != null) {
                            var x = transform(current, node);
                            if (x != null) {
                                // make the current node single, to exit this and the transformed node on close
                                current.__single = true;
                                current = x;
                            }
                        }
                        current.appendChild(node);
                        if (nextState !== 0) {
                            current = node;
                        }
                        else {
                            if (current.__single === true) {
                                do {
                                    current = current.parent;
                                } while (current != null && current.__single != null);
                            }
                        }
                    }
                    token = null;
                    continue;
                }
                next = new Dom.Node(token, current);
                next.sourceIndex = tokenIndex;
                current.appendChild(next);
                current = next;
                state = state_attr;
            }
            else if (last === state_literal) {
                next = new Dom.TextNode(token, current);
                next.sourceIndex = sourceIndex;
                current.appendChild(next);
                if (current.__single === true) {
                    do {
                        current = current.parent;
                    } while (current != null && current.__single != null);
                }
                state = go_tag;
            }
            token = null;
        }
        if (index >= length) {
            if (state === state_attr) {
                if (classNames != null) {
                    current.attr['class'] = parser_ensureTemplateFunction(classNames);
                }
                if (key != null) {
                    current.attr[key] = key;
                }
            }
            c = null;
            break;
        }
        if (state === go_up) {
            current = current.parent;
            while (current != null && current.__single != null) {
                current = current.parent;
            }
            if (current == null) {
                current = fragment;
                parser_warn('Unexpected tag closing', template, cursor_skipWhitespaceBack(template, index - 1));
            }
            state = go_tag;
        }
        switch (c) {
            case 60 /*<*/:
                if (state !== go_tag) {
                    break;
                }
                var tuple = parser_parseHtmlPartial(template, index, true);
                var node = tuple[0];
                node.sourceIndex = index;
                index = tuple[1];
                state = go_tag;
                token = null;
                current.appendChild(node);
                if (current.__single === true) {
                    do {
                        current = current.parent;
                    } while (current != null && current.__single != null);
                }
                continue;
            case 123:
                // {
                last = state;
                state = go_tag;
                index++;
                continue;
            case 62:
                // >
                last = state;
                state = go_tag;
                index++;
                current.__single = true;
                continue;
            case 59:
                // ;
                if (current.nodes != null) {
                    // skip ; , when node is not a single tag (else goto 125)
                    index++;
                    continue;
                }
            /* falls through */
            case 125:
                // ;}
                if (c === 125 && (state === state_tag || state === state_attr)) {
                    // single tag was not closed with `;` but closing parent
                    index--;
                }
                index++;
                last = state;
                state = go_up;
                continue;
            case 39:
            case 34:
                // '"
                // Literal - could be as textnode or attribute value
                if (state === go_attrVal) {
                    state = state_attr;
                }
                else if (state !== go_propVal) {
                    last = state = state_literal;
                }
                index++;
                var isEscaped = false, isUnescapedBlock = false, _char = c === 39 ? "'" : '"';
                sourceIndex = start = index;
                while ((index = template.indexOf(_char, index)) > -1) {
                    if (template.charCodeAt(index - 1) !== 92 /*'\\'*/) {
                        break;
                    }
                    isEscaped = true;
                    index++;
                }
                if (index === -1) {
                    parser_warn('Literal has no ending', template, start - 1);
                    index = length;
                }
                if (index === start) {
                    nextC = template.charCodeAt(index + 1);
                    if (nextC === 124 || nextC === c) {
                        // | (obsolete) or triple quote
                        isUnescapedBlock = true;
                        start = index + 2;
                        index = template.indexOf((nextC === 124 ? '|' : _char) + _char + _char, start);
                        if (index === -1)
                            index = length;
                    }
                }
                tokenIndex = start;
                token = template.substring(start, index);
                if (isEscaped === true) {
                    token = token.replace(__rgxEscapedChar[_char], _char);
                }
                if (state !== state_attr || key !== 'class') {
                    token = parser_ensureTemplateFunction(token);
                }
                index += isUnescapedBlock ? 3 : 1;
                continue;
        }
        if (state === go_tag) {
            last = state_tag;
            state = state_tag;
            if (c === 46 /* . */ || c === 35 /* # */) {
                tokenIndex = index;
                token = 'div';
                continue;
            }
            if (c === 91 /*[*/) {
                start = index + 1;
                index = cursor_groupEnd(template, start, length, c, 93 /* ] */);
                if (index === 0) {
                    parser_warn('Attribute not closed', template, start - 1);
                    index = length;
                    continue;
                }
                var expr = template.substring(start, index);
                var deco = new Dom.DecoratorNode(expr, current);
                deco.sourceIndex = start;
                current.appendChild(deco);
                index = cursor_skipWhitespace(template, index + 1, length);
                if (index !== length) {
                    c = template.charCodeAt(index);
                    if (c === 46 || c === 35 || c === 91 || (c >= 65 && c <= 122) || c === 36 || c === 95) {
                        // .#[A-z$_
                        last = state = go_tag;
                        continue;
                    }
                    parser_error('Unexpected char after decorator. Tag is expected', template, index, c, state);
                    break outer;
                }
            }
        }
        else if (state === state_attr) {
            if (c === 46) {
                // .
                index++;
                key = 'class';
                state = go_attrHeadVal;
            }
            else if (c === 35) {
                // #
                index++;
                key = 'id';
                state = go_attrHeadVal;
            }
            else if (c === 61) {
                // =;
                index++;
                state = go_attrVal;
                if (last === state_tag && key == null) {
                    parser_warn('Unexpected tag assignment', template, index, c, state);
                }
                continue;
            }
            else if (c === 40) {
                // (
                start = 1 + index;
                index = 1 + cursor_groupEnd(template, start, length, c, 41 /* ) */);
                current.expression = template.substring(start, index - 1);
                current.type = Dom.STATEMENT;
                continue;
            }
            else if (c === 91 /*[*/) {
                ++index;
                key = token = null;
                state = state_prop;
                continue;
            }
            else {
                if (key != null) {
                    tokenIndex = index;
                    token = key;
                    continue;
                }
            }
        }
        if (state === go_attrVal || state === go_attrHeadVal) {
            last = state;
            state = state_attr;
        }
        /* TOKEN */
        if (state === state_prop) {
            tokenIndex = start = index;
            while (index < length) {
                index = cursor_refEnd(template, index, length);
                if (index === start) {
                    parser_error('Invalid char in property', template, index, c, state);
                    break outer;
                }
                c = template.charCodeAt(index);
                if (c === 46 /*.*/) {
                    start = ++index;
                    continue;
                }
                key = template.substring(tokenIndex, index);
                if (c <= 32) {
                    index = cursor_skipWhitespace(template, index, length);
                    c = template.charCodeAt(index);
                }
                if (c !== 93 /*]*/) {
                    parser_error('Property not closed', template, index, c, state);
                    break outer;
                }
                c = template.charCodeAt(++index);
                if (c <= 32) {
                    index = cursor_skipWhitespace(template, index, length);
                    c = template.charCodeAt(index);
                }
                if (c !== 61 /*=*/) {
                    parser_error('Property should have assign char', template, index, c, state);
                    break outer;
                }
                index++;
                state = go_propVal;
                continue outer;
            }
        }
        var isInterpolated = false;
        start = index;
        while (index < length) {
            c = template.charCodeAt(index);
            if (c === interp_code_START) {
                var nextC = template.charCodeAt(index + 1);
                if (nextC === interp_code_OPEN) {
                    isInterpolated = true;
                    index = 1 + cursor_groupEnd(template, index + 2, length, interp_code_OPEN, interp_code_CLOSE);
                    c = template.charCodeAt(index);
                }
                else if ((nextC >= 65 && nextC <= 122) || nextC === 36 || nextC === 95) {
                    //A-z$_
                    isInterpolated = true;
                }
            }
            if (c === 64 && template.charCodeAt(index + 1) === 91) {
                //@[
                index = cursor_groupEnd(template, index + 2, length, 91, 93) + 1;
                c = template.charCodeAt(index);
            }
            // if DEBUG
            if (c === 0x0027 || c === 0x0022 || c === 0x002F || c === 0x003C || c === 0x002C) {
                // '"/<,
                parser_error('Unexpected char', template, index, c, state);
                break outer;
            }
            // endif
            if (last !== go_attrVal && (c === 46 || c === 35)) {
                // .#
                // break on .# only if parsing attribute head values
                break;
            }
            if (c < 33 ||
                c === 61 ||
                c === 62 ||
                c === 59 ||
                c === 40 ||
                c === 123 ||
                c === 125) {
                // =>;({}
                break;
            }
            index++;
        }
        token = template.substring(start, index);
        tokenIndex = start;
        if (token === '') {
            parser_warn('String expected', template, index, c, state);
            break;
        }
        if (isInterpolated === true) {
            if (state === state_tag) {
                parser_warn('Invalid interpolation (in tag name)', template, index, token, state);
                break;
            }
            if (state === state_attr) {
                if (key === 'id' || last === go_attrVal) {
                    token = parser_ensureTemplateFunction(token);
                }
                else if (key !== 'class') {
                    // interpolate class later
                    parser_warn('Invalid interpolation (in attr name)', template, index, token, state);
                    break;
                }
            }
        }
    }
    if (c !== c) {
        parser_warn('IndexOverflow', template, index, c, state);
    }
    // if DEBUG
    var parent = current.parent;
    if (parent != null &&
        parent !== fragment &&
        parent.__single !== true &&
        current.nodes != null &&
        parent.tagName !== 'imports') {
        parser_warn('Tag was not closed: ' + current.tagName, template);
    }
    // endif
    var nodes = fragment.nodes;
    return nodes != null && nodes.length === 1
        ? nodes[0]
        : fragment;
}
;

import { cursor_skipWhitespace } from '@core/parser/cursor';
import { parser_error, parser_warn } from '@core/util/reporters';
import { __rgxEscapedChar } from '@core/scope-vars';
export function parser_parseLiteral(str, start, imax) {
    var i = cursor_skipWhitespace(str, start, imax);
    var c = str.charCodeAt(i);
    if (c !== 34 && c !== 39) {
        // "'
        parser_error("A quote is expected", str, i);
        return null;
    }
    var isEscaped = false, isUnescapedBlock = false, _char = c === 39 ? "'" : '"';
    start = ++i;
    while ((i = str.indexOf(_char, i)) > -1) {
        if (str.charCodeAt(i - 1) !== 92 /*'\\'*/) {
            break;
        }
        isEscaped = true;
        i++;
    }
    if (i === -1) {
        parser_warn('Literal has no ending', str, start - 1);
        i = imax;
    }
    if (i === start) {
        var nextC = str.charCodeAt(i + 1);
        if (nextC === c) {
            isUnescapedBlock = true;
            start = i + 2;
            i = str.indexOf(_char + _char + _char, start);
            if (i === -1)
                i = imax;
        }
    }
    var token = str.substring(start, i);
    if (isEscaped === true) {
        token = token.replace(__rgxEscapedChar[_char], _char);
    }
    i += isUnescapedBlock ? 3 : 1;
    return [token, i];
}
;

import { is_Array } from '@utils/is';
export function parser_cleanObject(mix) {
    if (is_Array(mix)) {
        for (var i = 0; i < mix.length; i++) {
            parser_cleanObject(mix[i]);
        }
        return mix;
    }
    delete mix.parent;
    delete mix.__single;
    if (mix.nodes != null) {
        parser_cleanObject(mix.nodes);
    }
    return mix;
}
;

import { parser_error } from '@core/util/reporters';
export function _consume(tokens, str, index, length, out, isOptional) {
    var index_ = index;
    var imax = tokens.length, i = 0, token, start;
    for (; i < imax; i++) {
        token = tokens[i];
        start = index;
        index = token.consume(str, index, length, out);
        if (index === start) {
            if (token.optional === true) {
                continue;
            }
            if (isOptional === true) {
                return index_;
            }
            // global require is also not optional: throw error
            var msg = 'Token of type `' + token.name + '`';
            if (token.token) {
                msg += ' Did you mean: `' + token.token + '`?';
            }
            parser_error(msg, str, index);
            return index_;
        }
    }
    return index;
}
;

import { cursor_skipWhitespace, cursor_tokenEnd, cursor_groupEnd, cursor_quoteEnd } from '../cursor';
import { _consume } from './consume';
import { class_create } from '@utils/class';
export var token_Whitespace = create('Whitespace', {
    constructor: function (optional) {
        this.optional = optional;
    },
    consume: cursor_skipWhitespace
});
// To match the string and continue, otherwise stops current consumer
// foo
export var token_Const = create('Const', {
    constructor: function (str) {
        this.token = str;
    },
    consume: function (str, i, imax) {
        var end = i + this.token.length;
        str = str.substring(i, end);
        return str === this.token ? end : i;
    }
});
// consume string (JS syntax) to the variable
// $foo
export var token_Var = create('Var', {
    constructor: function (name) {
        this.token = name;
        this.setter = generateSetter(name);
    },
    consume: function (str, i, imax, out) {
        var end = cursor_tokenEnd(str, i, imax);
        if (end === i)
            return i;
        this.setter(out, str.substring(i, end));
        return end;
    }
});
/* consume string to the variable
 * - by Regexp
 *     $$foo(\w+)
 * - rest of the string
 *     $$foo(*)
 * - inside a group of chars `()` `[]` `""` `''`, etc
 *     $$foo(*())
 */
export var token_ExtendedVar = create('ExtendedVar', {
    constructor: function (name, rgx) {
        this.token = rgx;
        this.setter = generateSetter(name);
        if (rgx.charCodeAt(0) === 42) {
            // *
            if (rgx === '*') {
                this.consume = this.consumeAll;
                return;
            }
            if (rgx.length === 3) {
                this.consume = this.consumeGroup;
                return;
            }
            throw Error('`*` consumer expected group chars to parse');
        }
        this.rgx = new RegExp(rgx, 'g');
    },
    consumeAll: function (str, i, imax, out) {
        this.setter(out, str.substring(i));
        return imax;
    },
    consumeGroup: function (str, i, imax, out) {
        var start = this.token.charCodeAt(1), end = this.token.charCodeAt(2);
        if (str.charCodeAt(i) !== start) {
            return token_Var
                .prototype
                .consume
                .call(this, str, i, imax, out);
        }
        var end = cursor_groupEnd(str, ++i, imax, start, end);
        if (end === i)
            return i;
        this.setter(out, str.substring(i, end));
        return end + 1;
    },
    consume: function (str, i, imax, out) {
        this.rgx.lastIndex = i;
        // @TODO: use sticky
        var match = this.rgx.exec(str);
        if (match == null || match.index !== i)
            return i;
        var x = match[0];
        this.setter(out, x);
        return i + x.length;
    }
});
// Consume string with custom Stop/Continue Function to the variable
export var token_CustomVar = create('CustomVar', {
    constructor: function (name, consumer) {
        this.fn = Consumers[consumer];
        this.token = name;
        this.setter = generateSetter(name);
    },
    consume: function (str, i, imax, out) {
        var start = i;
        for (; i < imax; i++) {
            if (this.fn(str.charCodeAt(i)) === false) {
                break;
            }
        }
        if (i === start) {
            return i;
        }
        this.setter(out, str.substring(start, i));
        return i;
    }
});
var Consumers = {
    accessor: function (c) {
        if (Consumers.token(c) === true)
            return true;
        if (c === 58 || c === 46) {
            // : .
            return true;
        }
        return false;
    },
    token: function (c) {
        if (c === 36 || c === 95) {
            // $ _
            return true;
        }
        if ((48 <= c && c <= 57) || // 0-9
            (65 <= c && c <= 90) || // A-Z
            (97 <= c && c <= 122)) { // a-z
            return true;
        }
        return false;
    }
};
// Consume string with custom Stop/Continue Function to the variable
export var token_CustomParser = create('CustomParser', {
    constructor: function (name, param) {
        return new Parsers[name](param);
    }
});
var Parsers = {
    flags: class_create({
        name: 'Flags',
        token: '',
        // Index Map { key: Array<Min,Max> }
        flags: null,
        optional: true,
        constructor: function (param, isOptional) {
            this.optional = isOptional;
            this.flags = {};
            var parts = param.replace(/\s+/g, '').split(';'), imax = parts.length, i = -1;
            while (++i < imax) {
                var flag = parts[i], index = flag.indexOf(':'), name = flag.substring(0, index), opts = flag.substring(index + 1);
                var token = '|' + opts + '|';
                var l = this.token.length;
                this.flags[name] = [l, l + token.length];
                this.token += token;
            }
        },
        consume: function (str, i_, imax, out) {
            var hasFlag = false;
            var i = i_;
            while (i < imax) {
                i = cursor_skipWhitespace(str, i, imax);
                var end = cursor_tokenEnd(str, i, imax);
                if (end === i) {
                    break;
                }
                var token = str.substring(i, end);
                var idx = this.token.indexOf('|' + token + '|') + 1;
                if (idx === 0) {
                    break;
                }
                for (var key in this.flags) {
                    var range = this.flags[key];
                    var min = range[0];
                    if (min > idx)
                        continue;
                    var max = range[1];
                    if (max < idx)
                        continue;
                    out[key] = token;
                    hasFlag = true;
                    break;
                }
                i = end;
            }
            return hasFlag ? i : i_;
        }
    })
};
export var token_String = create('String', {
    constructor: function (tokens) {
        this.tokens = tokens;
    },
    consume: function (str, i, imax, out) {
        var c = str.charCodeAt(i);
        if (c !== 34 && c !== 39)
            return i;
        var end = cursor_quoteEnd(str, i + 1, imax, c === 34 ? '"' : "'");
        if (this.tokens.length === 1) {
            var $var = this.tokens[0];
            out[$var.token] = str.substring(i + 1, end);
        }
        else {
            throw Error('Not implemented');
        }
        return ++end;
    }
});
export var token_Array = create('Array', {
    constructor: function (name, tokens, delim, optional) {
        this.token = name;
        this.delim = delim;
        this.tokens = tokens;
        this.optional = optional;
    },
    consume: function (str, i, imax, out) {
        var obj, end, arr;
        while (true) {
            obj = {};
            end = _consume(this.tokens, str, i, imax, obj, this.optional);
            if (i === end) {
                if (arr == null)
                    return i;
                throw Error('Next item expected');
            }
            if (arr == null)
                arr = [];
            arr.push(obj);
            i = end;
            end = this.delim.consume(str, i, imax);
            if (i === end)
                break;
            i = end;
        }
        out[this.token] = arr;
        return i;
    }
});
export var token_Punctuation = create('Punc', {
    constructor: function (str) {
        this.before = new token_Whitespace(true);
        this.delim = new token_Const(str);
        this.after = new token_Whitespace(true);
        this.token = str;
    },
    consume: function (str, i, imax) {
        var start = this.before.consume(str, i, imax);
        var end = this.delim.consume(str, start, imax);
        if (start === end) {
            return i;
        }
        return this.after.consume(str, end, imax);
    }
});
export var token_Group = create('Group', {
    constructor: function (tokens, optional) {
        this.optional = optional;
        this.tokens = tokens;
    },
    consume: function (str, i, imax, out) {
        var start = cursor_skipWhitespace(str, i, imax);
        var end = _consume(this.tokens, str, start, imax, out, this.optional);
        return start === end ? i : end;
    }
});
export var token_OrGroup = create('OrGroup', {
    constructor: function (groups) {
        this.groups = groups,
            this.length = groups.length;
    },
    consume: function (str, i, imax, out) {
        var start = i, j = 0;
        for (; j < this.length; j++) {
            i = this.groups[j].consume(str, i, imax, out);
            if (i !== start)
                return i;
        }
        return i;
    }
});
function generateSetter(name) {
    return new Function('obj', 'val', 'obj.' + name + '= val;');
}
function create(name, Proto) {
    var Ctor = Proto.constructor;
    Proto.name = name;
    Proto.optional = false;
    Proto.token = null;
    Ctor.prototype = Proto;
    return Ctor;
}

import { token_Whitespace, token_String, token_Var, token_Punctuation, token_Const, token_Group, token_OrGroup, token_Array, token_ExtendedVar, token_CustomVar, token_CustomParser } from './tokens';
import { cursor_quoteEnd, cursor_tokenEnd, cursor_groupEnd } from '../cursor';
export function _compile(str, i, imax) {
    if (i === void 0) {
        i = 0;
        imax = str.length;
    }
    var tokens = [], c, optional, conditional, ref, start;
    outer: for (; i < imax; i++) {
        start = i;
        c = str.charCodeAt(i);
        optional = conditional = false;
        if (63 === c /* ? */) {
            optional = true;
            start = ++i;
            c = str.charCodeAt(i);
        }
        if (124 === c /* | */) {
            conditional = true;
            start = ++i;
            c = str.charCodeAt(i);
        }
        switch (c) {
            case 32 /* */:
                tokens.push(new token_Whitespace(optional, i));
                continue;
            case 34:
            case 39 /*'"*/:
                i = cursor_quoteEnd(str, i + 1, imax, c === 34 ? '"' : "'");
                tokens.push(new token_String(_compile(str, start + 1, i)));
                continue;
            case 36 /*$*/:
                start = ++i;
                var isExtended = false;
                if (c === str.charCodeAt(i)) {
                    isExtended = true;
                    start = ++i;
                }
                i = cursor_tokenEnd(str, i, imax);
                var name = str.substring(start, i);
                if (optional === false && isExtended === false) {
                    tokens.push(new token_Var(name));
                    i--;
                    continue;
                }
                c = str.charCodeAt(i);
                if (c === 91 /*[*/) {
                    i = compileArray(name, tokens, str, i, imax, optional);
                    continue;
                }
                if (c === 40 /*(*/) {
                    i = compileExtendedVar(name, tokens, str, i, imax);
                    continue;
                }
                if (c === 60 /*<*/) {
                    i = compileCustomVar(name, tokens, str, i, imax);
                    continue;
                }
                if (c === 123 /*{*/) {
                    i = compileCustomParser(name, tokens, str, i, imax);
                    continue;
                }
                throw_('Unexpected extended type');
                continue;
            case 40 /*(*/:
                if (optional === true || conditional === true) {
                    i = compileGroup(optional, conditional, tokens, str, i, imax);
                    continue;
                }
            /* fall through */
            case 44 /*,*/:
            case 41 /*)*/:
            case 91 /*[*/:
            case 93 /*]*/:
            case 123 /*{*/:
            case 125 /*}*/:
                tokens.push(new token_Punctuation(String.fromCharCode(c)));
                continue;
        }
        while (i < imax) {
            c = str.charCodeAt(++i);
            if (c > 32 && c !== 34 && c !== 39 && c !== 36 && c !== 44 && c !== 63 && i !== imax) {
                continue;
            }
            tokens.push(new token_Const(str.substring(start, i)));
            --i;
            continue outer;
        }
    }
    var jmax = tokens.length, j = -1, orGroup = jmax > 1, x;
    while (orGroup === true && ++j < jmax) {
        x = tokens[j];
        if (x instanceof token_Group === false || x.optional !== true) {
            orGroup = false;
        }
    }
    if (0 && orGroup === true) {
        tokens = [new token_OrGroup(tokens)];
    }
    return tokens;
}
;
function compileArray(name, tokens, str, i, imax, optional) {
    var start = ++i;
    i = cursor_groupEnd(str, i, imax, 91, 93);
    var innerTokens = _compile(str, start, i);
    i++;
    if (str.charCodeAt(i) !== 40 /*(*/)
        throw_('Punctuation group expected');
    start = ++i;
    i = cursor_groupEnd(str, i, imax, 40, 41);
    var delimiter = str.substring(start, i);
    tokens.push(new token_Array(name, innerTokens, new token_Punctuation(delimiter), optional));
    return i;
}
function compileExtendedVar(name, tokens, str, i, imax) {
    var start = ++i;
    i = cursor_groupEnd(str, i, imax, 40, 41);
    tokens.push(new token_ExtendedVar(name, str.substring(start, i)));
    return i;
}
function compileCustomVar(name, tokens, str, i, imax) {
    var start = ++i;
    i = cursor_tokenEnd(str, i, imax);
    tokens.push(new token_CustomVar(name, str.substring(start, i)));
    return i;
}
function compileCustomParser(name, tokens, str, i, imax) {
    var start = ++i;
    i = cursor_groupEnd(str, i, imax, 123, 125);
    tokens.push(new token_CustomParser(name, str.substring(start, i)));
    return i;
}
function compileGroup(optional, conditional, tokens, str, i, imax) {
    var start = ++i;
    var Ctor = conditional ? token_OrGroup : token_Group;
    i = cursor_groupEnd(str, start, imax, 40, 41);
    tokens.push(new Ctor(_compile(str, start, i), optional));
    return i;
}
function throw_(msg) {
    throw Error('Lexer pattern: ' + msg);
}

import { _compile } from './compile';
import { _consume } from './consume';
export function parser_ObjectLexer(pattern, a, b, c, d, f) {
    if (arguments.length === 1 && typeof pattern === 'string') {
        return ObjectLexer_single(pattern);
    }
    return ObjectLexer_sequance(Array.prototype.slice.call(arguments));
}
;
function ObjectLexer_single(pattern) {
    var tokens = _compile(pattern);
    return function (str, i, imax, out, optional) {
        return _consume(tokens, str, i, imax, out, optional);
    };
}
var ObjectLexer_sequance;
(function () {
    ObjectLexer_sequance = function ObjectLexer_sequance(args) {
        var jmax = args.length, j = -1;
        while (++j < jmax) {
            args[j] = __createConsumer(args[j]);
        }
        return function (str, i_, imax, out, optional) {
            var j = -1, i = i_;
            while (++j < jmax) {
                var start = i, x = args[j];
                i = __consume(x, str, i, imax, out, optional || x.optional);
                if (i === start && x.optional !== true)
                    return start;
            }
            return i;
        };
    };
    function __consume(x, str, i, imax, out, optional) {
        switch (x.type) {
            case 'single':
                var start = i;
                return x.consumer(str, i, imax, out, optional);
            case 'any':
                return __consumeOptionals(x.consumer, str, i, imax, out, optional);
            default:
                throw Error('Unknown sequence consumer type: ' + x.type);
        }
    }
    function __consumeOptionals(arr, str, i, imax, out, optional) {
        var start = i, jmax = arr.length, j = -1;
        while (++j < jmax) {
            i = arr[j](str, i, imax, out, true);
            if (start !== i)
                return i;
        }
        if (optional !== true) {
            // notify
            arr[0](str, start, imax, out, optional);
        }
        return start;
    }
    function __createConsumer(mix) {
        if (typeof mix === 'string') {
            return {
                type: 'single',
                optional: mix[0] === '?',
                consumer: ObjectLexer_single(mix)
            };
        }
        // else Array<string>
        var i = mix.length;
        while (--i > -1)
            mix[i] = ObjectLexer_single(mix[i]);
        return {
            type: 'any',
            consumer: mix,
            optional: false,
        };
    }
}());

import { Dom } from '@core/dom/exports';
import { cursor_skipWhitespace, cursor_groupEnd } from '../cursor';
import { obj_create, obj_extendDefaults } from '@utils/obj';
import { class_create } from '@utils/class';
import { is_ArrayLike, is_Function, is_String } from '@utils/is';
import { parser_parse } from './parser';
var defaultOptions = {
    minify: true,
    indent: 4,
    indentChar: ' '
};
/**
 * Serialize Mask AST to the Mask string (@analog to `JSON.stringify`)
 * @param {MaskNode} node - MaskNode
 * @param {(object|number)} [opts] - Indent count option or an object with options
 * @param {number} [opts.indent=0] - Indent count, `0` for minimization
 * @param {bool} [opts.minify=true]
 * @param {bool} [opts.minimizeAttributes=true] - Remove quotes when possible
 * @returns {string}
 * @memberOf mask
 * @method stringify
 */
export function mask_stringify(input, opts) {
    if (input == null)
        return '';
    if (typeof input === 'string')
        input = parser_parse(input);
    if (opts == null) {
        opts = obj_create(defaultOptions);
    }
    else if (typeof opts === 'number') {
        var indent = opts;
        opts = obj_create(defaultOptions);
        opts.indent = indent;
        opts.minify = indent === 0;
    }
    else {
        opts = obj_extendDefaults(opts, defaultOptions);
        if (opts.indent > 0) {
            opts.minify = false;
        }
        if (opts.minify === true) {
            opts.indent = 0;
        }
    }
    return new Stream(input, opts).toString();
}
;
export function mask_stringifyAttr(attr) {
    var str = '';
    for (var key in attr) {
        if (str.length !== 0) {
            str += ' ';
        }
        str += key;
        var x = getString(attr[key]);
        if (x !== key) {
            str += "=" + wrapString(x);
        }
    }
    return str;
}
;
var Stream = class_create({
    string: '',
    indent: 0,
    indentStr: '',
    minify: false,
    opts: null,
    ast: null,
    constructor: function (ast, opts) {
        this.opts = opts;
        this.ast = ast;
        this.minify = opts.minify;
        this.indentStr = doindent(opts.indent, opts.indentChar);
    },
    toString: function () {
        this.process(this.ast, this);
        return this.string;
    },
    process: function (mix) {
        if (mix.type === Dom.FRAGMENT) {
            if (mix.syntax === 'html') {
                // indent current
                this.write('');
                new HtmlStreamWriter(this).process(mix.nodes);
                return;
            }
            mix = mix.nodes;
        }
        if (is_ArrayLike(mix)) {
            var imax = mix.length, i = -1;
            while (++i < imax) {
                if (i !== 0) {
                    this.newline();
                }
                this.processNode(mix[i]);
            }
            return;
        }
        this.processNode(mix);
    },
    processNode: function (node) {
        var stream = this;
        if (is_Function(node.stringify)) {
            var str = node.stringify(stream);
            if (str != null) {
                stream.write(str);
            }
            return;
        }
        if (is_String(node.content)) {
            stream.write(wrapString(node.content));
            return;
        }
        if (is_Function(node.content)) {
            stream.write(wrapString(node.content()));
            return;
        }
        if (node.type === Dom.FRAGMENT) {
            this.process(node);
            return;
        }
        this.processHead(node);
        if (isEmpty(node)) {
            stream.print(';');
            return;
        }
        if (isSingle(node)) {
            stream.openBlock('>');
            stream.processNode(getSingle(node));
            stream.closeBlock(null);
            return;
        }
        stream.openBlock('{');
        stream.process(node.nodes);
        stream.closeBlock('}');
    },
    processHead: function (node) {
        var stream = this, str = '', id, cls, expr;
        var attr = node.attr;
        if (attr != null) {
            id = getString(attr['id']);
            cls = getString(attr['class']);
            if (id != null && id.indexOf(' ') !== -1) {
                id = null;
            }
            if (id != null) {
                str += '#' + id;
            }
            if (cls != null) {
                str += format_Classes(cls);
            }
            for (var key in attr) {
                if (key === 'id' && id != null) {
                    continue;
                }
                if (key === 'class' && cls != null) {
                    continue;
                }
                var val = attr[key];
                if (val == null) {
                    continue;
                }
                str += ' ' + key;
                if (val === key) {
                    continue;
                }
                if (is_Function(val)) {
                    val = val();
                }
                if (is_String(val)) {
                    if (stream.minify === false || val === '' || /[^\w_$\-\.]/.test(val)) {
                        val = wrapString(val);
                    }
                }
                str += '=' + val;
            }
        }
        var props = node.props;
        if (props != null) {
            for (var key in props) {
                var val = props[key];
                if (val == null) {
                    continue;
                }
                str += ' [' + key;
                if (is_Function(val)) {
                    val = val();
                }
                if (is_String(val)) {
                    if (stream.minify === false || /[^\w_$\-\.]/.test(val)) {
                        val = wrapString(val);
                    }
                }
                str += '] = ' + val;
            }
        }
        if (isTagNameOptional(node, id, cls) === false) {
            str = node.tagName + str;
        }
        var expr = node.expression;
        if (expr != null) {
            if (typeof expr === 'function') {
                expr = expr();
            }
            if (stream.minify === false) {
                str += ' ';
            }
            str += '(' + expr + ')';
        }
        if (this.minify === false) {
            str = doindent(this.indent, this.indentStr) + str;
        }
        stream.print(str);
    },
    newline: function () {
        this.format('\n');
    },
    openBlock: function (c) {
        this.indent++;
        if (this.minify === false) {
            this.string += ' ' + c + '\n';
            return;
        }
        this.string += c;
    },
    closeBlock: function (c) {
        this.indent--;
        if (c != null) {
            this.newline();
            this.write(c);
        }
    },
    write: function (str) {
        if (this.minify === true) {
            this.string += str;
            return;
        }
        var prfx = doindent(this.indent, this.indentStr);
        this.string += str.replace(/^/gm, prfx);
    },
    print: function (str) {
        this.string += str;
    },
    format: function (str) {
        if (this.minify === false) {
            this.string += str;
        }
    },
    printArgs: function (args) {
        if (args == null || args.length === 0)
            return;
        var imax = args.length, i = -1;
        while (++i < imax) {
            if (i > 0) {
                this.print(',');
                this.format(' ');
            }
            var arg = args[i];
            this.print(arg.prop);
            if (arg.type != null) {
                this.print(':');
                this.format(' ');
                this.print(arg.type);
            }
        }
    }
});
var HtmlStreamWriter = class_create({
    stream: null,
    constructor: function (stream) {
        this.stream = stream;
    },
    process: function (mix) {
        if (mix.type === Dom.FRAGMENT) {
            if (mix.syntax !== 'html') {
                var count = 0, p = mix;
                while (p != null) {
                    if (p.type !== Dom.FRAGMENT) {
                        count++;
                    }
                    p = p.parent;
                }
                var stream = this.stream;
                stream.indent++;
                stream.print('<mask>\n');
                stream.indent += count;
                stream.process(mix);
                stream.print('\n');
                stream.indent--;
                stream.write('</mask>');
                stream.indent -= count;
                return;
            }
            mix = mix.nodes;
        }
        if (is_ArrayLike(mix)) {
            var imax = mix.length, i = -1;
            while (++i < imax) {
                this.processNode(mix[i]);
            }
            return;
        }
        this.processNode(mix);
    },
    processNode: function (node) {
        var stream = this.stream;
        if (is_Function(node.stringify)) {
            var str = node.stringify(stream);
            if (str != null) {
                stream.print('<mask>');
                stream.write(str);
                stream.print('</mask>');
            }
            return;
        }
        if (is_String(node.content)) {
            stream.print(node.content);
            return;
        }
        if (is_Function(node.content)) {
            stream.print(node.content());
            return;
        }
        if (node.type === Dom.FRAGMENT) {
            this.process(node);
            return;
        }
        stream.print('<' + node.tagName);
        this.processAttr(node);
        if (isEmpty(node)) {
            if (html_isVoid(node)) {
                stream.print('>');
                return;
            }
            if (html_isSemiVoid(node)) {
                stream.print('/>');
                return;
            }
            stream.print('></' + node.tagName + '>');
            return;
        }
        stream.print('>');
        this.process(node.nodes);
        stream.print('</' + node.tagName + '>');
    },
    processAttr: function (node) {
        var stream = this.stream, str = '';
        var attr = node.attr;
        if (attr != null) {
            for (var key in attr) {
                var val = attr[key];
                if (val == null) {
                    continue;
                }
                str += ' ' + key;
                if (val === key) {
                    continue;
                }
                if (is_Function(val)) {
                    val = val();
                }
                if (is_String(val)) {
                    if (stream.minify === false || /[^\w_$\-\.]/.test(val)) {
                        val = wrapString(val);
                    }
                }
                str += '=' + val;
            }
        }
        var expr = node.expression;
        if (expr != null) {
            if (typeof expr === 'function') {
                expr = expr();
            }
            str += ' expression=' + wrapString(expr);
        }
        if (str === '') {
            return;
        }
        stream.print(str);
    }
});
function doindent(count, c) {
    var output = '';
    while (count--) {
        output += c;
    }
    return output;
}
function isEmpty(node) {
    return node.nodes == null || (is_ArrayLike(node.nodes) && node.nodes.length === 0);
}
function isSingle(node) {
    var arr = node.nodes;
    if (arr == null) {
        return true;
    }
    var isArray = typeof arr.length === 'number';
    if (isArray && arr.length > 1) {
        return false;
    }
    var x = isArray ? arr[0] : arr;
    return x.stringify == null && x.type !== Dom.FRAGMENT;
}
function isTagNameOptional(node, id, cls) {
    if (id == null && cls == null) {
        return false;
    }
    var tagName = node.tagName;
    if (tagName === 'div') {
        return true;
    }
    return false;
}
function getSingle(node) {
    if (is_ArrayLike(node.nodes))
        return node.nodes[0];
    return node.nodes;
}
function wrapString(str) {
    if (str.indexOf("'") === -1)
        return "'" + str + "'";
    if (str.indexOf('"') === -1)
        return '"' + str + '"';
    return '"' + str.replace(/"/g, '\\"') + '"';
}
function getString(mix) {
    return mix == null ? null : (is_Function(mix) ? mix() : mix);
}
export function format_Classes(cls) {
    if (cls.indexOf('[') === -1) {
        return raw(cls);
    }
    var str = '', imax = cls.length, i = -1;
    while (++i < imax) {
        var start = (i = cursor_skipWhitespace(cls, i, imax));
        for (; i < imax; i++) {
            var c = cls.charCodeAt(i);
            if (c === 91) {
                i = cursor_groupEnd(cls, i + 1, imax, 91 /*[*/, 93 /*]*/);
            }
            if (cls.charCodeAt(i) < 33) {
                break;
            }
        }
        str += '.' + cls.substring(start, i);
    }
    return str;
}
;
function raw(str) {
    return '.' + str.trim().replace(/\s+/g, '.');
}
var html_isVoid, html_isSemiVoid;
(function () {
    var _void = /^(!doctype)$/i, _semiVoid = /^(area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
    html_isVoid = function (node) {
        return _void.test(node.tagName);
    };
    html_isSemiVoid = function (node) {
        return _semiVoid.test(node.tagName);
    };
}());

import { _Object_hasOwnProp } from '@utils/refs';
import { parser_parse } from './mask/parser';
export var Templates = {
    ensure: function (mix, ctx) {
        if (typeof mix !== 'string') {
            return mix;
        }
        if (_Object_hasOwnProp.call(_cache, mix)) {
            /* if Object doesnt contains property that check is faster
            then "!=null" http://jsperf.com/not-in-vs-null/2 */
            return _cache[mix];
        }
        return _cache[mix] = parser_parse(mix, ctx.filename);
    }
};
var _cache = {};

import { is_Object, is_String } from '@utils/is';
import { obj_extend, obj_getProperty, obj_hasProperty, obj_setProperty } from '@utils/obj';
import { listeners_emit } from '@core/util/listeners';
import { log_warn } from '@core/util/reporters';
/**
 * Configuration Options
 * @type {object}
 * @typedef Configuration
 */
export var __cfg = {
    /**
     * Relevant for NodeJS only. Disable/Enable compo caching.
     * @default true
     */
    allowCache: true,
    /**
     * Style and Script preprocessors
     * @type {object}
     * @memberOf Configuration
     */
    preprocessor: {
        /**
         * Transform style before using in `style` tag
         * @type {function}
         * @param {string} style
         * @returns {string}
         * @memberOf Configuration
         */
        style: null,
        /**
         * Transform script before using in `function,script,event,slot` tags
         * @type {function}
         * @param {string} source
         * @returns {string}
         * @memberOf Configuration
         */
        script: null
    },
    /**
     * Base path for modules
     * @default null
     * @memberOf Configuration
     */
    base: null,
    modules: 'default',
    /**
     * Define custom function for getting files content by path
     * @param {string} path
     * @returns {Promise}
     * @memberOf Configuration
     */
    getFile: null,
    /**
     * Define custom function for getting script
     * @param {string} path
     * @returns {Promise} Fulfill with exports
     * @memberOf Configuration
     */
    getScript: null,
    /**
     * Define custom function for getting styles
     * @param {string} path
     * @returns {Promise} Fulfill with exports
     * @memberOf Configuration
     */
    getStyle: null,
    /**
     * Define custom function for getting jsons
     * @param {string} path
     * @returns {Promise} Fulfill with exports
     * @memberOf Configuration
     */
    getData: null,
    getJson: null,
    /**
     * Define custom function to build/combine styles
     * @param {string} path
     * @param {object} options
     * @returns {Promise} Fulfill with {string} content
     * @memberOf Configuration
     */
    buildStyle: null,
    /**
     * Define custom function to build/combine scripts
     * @param {string} path
     * @param {object} options
     * @returns {Promise} Fulfill with {string} content
     * @memberOf Configuration
     */
    buildScript: null,
    /**
     * Define custom function to build/combine jsons
     * @param {string} path
     * @param {object} options
     * @returns {Promise} Fulfill with {string} content
     * @memberOf Configuration
     */
    buildData: null,
};
/**
 * Get or Set configuration settings
 * - 1 `(name)`
 * - 2 `(name, value)`
 * - 3 `(object)`
 * @see @{link MaskOptions} for all options
 * @memberOf mask
 * @method config
 */
export function mask_config(a, b, c) {
    var args = arguments, length = args.length;
    if (length === 0) {
        return __cfg;
    }
    if (length === 1) {
        var x = args[0];
        if (is_Object(x)) {
            obj_extend(__cfg, x);
            listeners_emit('config', x);
            return;
        }
        if (is_String(x)) {
            return obj_getProperty(__cfg, x);
        }
    }
    if (length === 2) {
        var prop = args[0];
        if (obj_hasProperty(__cfg, prop) === false) {
            log_warn('Unknown configuration property', prop);
        }
        var x = {};
        obj_setProperty(x, prop, args[1]);
        obj_setProperty(__cfg, prop, args[1]);
        listeners_emit('config', x);
        return;
    }
}

import { parser_ensureTemplateFunction } from '../../interpolation';
export var Style = {
    transform: function (body, attr, parent) {
        if (attr.self != null) {
            var style = parent.attr.style;
            parent.attr.style = parser_ensureTemplateFunction((style || '') + body);
            return null;
        }
        return body;
    }
};

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { __cfg } from '@core/api/config';
import { is_Function } from '@utils/is';
import { custom_Parsers } from '@core/custom/exports';
import { Dom } from '@core/dom/exports';
import { Style } from './content/style';
import { log_error } from '@core/util/reporters';
import { cursor_skipWhitespace, cursor_groupEnd } from '../cursor';
import { go_tag } from '../const';
import { parser_parseAttr } from '../mask/partials/attributes';
import { parser_ensureTemplateFunction } from '../interpolation';
import { parser_parseLiteral } from '../mask/partials/literal';
custom_Parsers['style'] = createParser('style', Style.transform);
custom_Parsers['script'] = createParser('script');
var ContentNode = /** @class */ (function (_super) {
    __extends(ContentNode, _super);
    function ContentNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.content = null;
        _this.id = null;
        return _this;
    }
    ContentNode.prototype.stringify = function (stream) {
        stream.processHead(this);
        var body = this.content;
        if (body == null) {
            stream.print(';');
            return;
        }
        if (is_Function(body)) {
            body = body();
        }
        stream.openBlock('{');
        stream.print(body);
        stream.closeBlock('}');
        return;
    };
    return ContentNode;
}(Dom.Node));
;
var COUNTER = 0;
var PRFX = '_cm_';
function createParser(name, transform) {
    return function (str, i, imax, parent) {
        var start = i, end, attr, hasBody, body, id, c;
        while (i < imax) {
            c = str.charCodeAt(i);
            if (c === 123 || c === 59 || c === 62) {
                //{;>
                break;
            }
            i++;
        }
        attr = parser_parseAttr(str, start, i);
        for (var key in attr) {
            attr[key] = parser_ensureTemplateFunction(attr[key]);
        }
        if (c === 62) {
            var nextI = cursor_skipWhitespace(str, i + 1, imax);
            var nextC = str.charCodeAt(nextI);
            if (nextC !== 34 && nextC !== 39) {
                // "'
                var node_1 = new Dom.Node(name, parent);
                node_1.attr = attr;
                // `>` handle single without literal as generic mask node
                return [node_1, i, go_tag];
            }
        }
        end = i;
        hasBody = c === 123 || c === 62;
        if (hasBody) {
            i++;
            if (c === 123) {
                end = cursor_groupEnd(str, i, imax, 123, 125); //{}
                body = str.substring(i, end);
            }
            if (c === 62) {
                var tuple = parser_parseLiteral(str, i, imax);
                if (tuple == null) {
                    return null;
                }
                end = tuple[1];
                body = tuple[0];
                // move cursor one back to be consistance with the group
                end -= 1;
            }
            if (transform != null) {
                body = transform(body, attr, parent);
                if (body == null) {
                    return [null, end + 1];
                }
            }
            body = preprocess(name, body);
            if (name !== 'script') {
                body = parser_ensureTemplateFunction(body);
            }
        }
        var node = new ContentNode(name, parent);
        node.content = body;
        node.attr = attr;
        node.id = PRFX + (++COUNTER);
        return [node, end + 1, 0];
    };
}
function preprocess(name, body) {
    var fn = __cfg.preprocessor[name];
    if (fn == null) {
        return body;
    }
    var result = fn(body);
    if (result == null) {
        log_error('Preprocessor must return a string');
        return body;
    }
    return result;
}

import { Dom } from '@core/dom/exports';
import { custom_Parsers } from '@core/custom/exports';
import { go_tag } from '../const';
import { class_create } from '@utils/class';
import { parser_ObjectLexer } from '../object/ObjectLexer';
(function () {
    createParser('define');
    createParser('let');
    function createParser(tagName) {
        custom_Parsers[tagName] = function (str, i, imax, parent) {
            var node = new DefineNode(tagName, parent);
            var end = lex_(str, i, imax, node);
            return [node, end, go_tag];
        };
    }
    var lex_ = parser_ObjectLexer('$name', '? ?(($$arguments[$$name<token>?(? :? $$type<accessor>)](,)))?(as $$as(*()))?(extends $$extends[$$compo<accessor>](,))', '{');
    var DefineNode = class_create(Dom.Node, {
        'as': null,
        'name': null,
        'extends': null,
        'arguments': null,
        stringify: function (stream) {
            var extends_ = this['extends'], args_ = this['arguments'], as_ = this['as'], str = '';
            if (args_ != null && args_.length !== 0) {
                str += ' (';
                str += toCommaSeperated(args_, get_arg);
                str += ')';
            }
            if (as_ != null && as_.length !== 0) {
                str += ' as (' + as_ + ')';
            }
            if (extends_ != null && extends_.length !== 0) {
                str += ' extends ';
                str += toCommaSeperated(extends_, get_compo);
            }
            var head = this.tagName + ' ' + this.name + str;
            stream.write(head);
            stream.openBlock('{');
            stream.process(this.nodes);
            stream.closeBlock('}');
        },
    });
    function toCommaSeperated(arr, getter) {
        var imax = arr.length, i = -1, str = '';
        while (++i < imax) {
            str += getter(arr[i]);
            if (i < imax - 1)
                str += ', ';
        }
        return str;
    }
    function get_compo(x) {
        return x.compo;
    }
    function get_arg(x) {
        var arg = x.name;
        if (x.type != null) {
            arg += ': ' + x.type;
        }
        return arg;
    }
}());

import { class_create } from '@utils/class';
import { Dom } from '@core/dom/exports';
import { custom_Parsers, custom_Parsers_Transform } from '@core/custom/exports';
import { parser_ObjectLexer } from '../object/ObjectLexer';
var IMPORT = 'import';
var IMPORTS = 'imports';
custom_Parsers[IMPORT] = function (str, i, imax, parent) {
    var obj = {
        exports: null,
        alias: null,
        path: null,
        namespace: null,
        async: null,
        link: null,
        mode: null,
        moduleType: null,
        contentType: null,
        attr: null
    };
    var end = lex_(str, i, imax, obj);
    return [new ImportNode(parent, obj), end, 0];
};
custom_Parsers_Transform[IMPORT] = function (current) {
    if (current.tagName === IMPORTS) {
        return null;
    }
    var imports = new ImportsNode('imports', current);
    current.appendChild(imports);
    return imports;
};
var default_LINK = 'static', default_MODE = 'both';
var lex_ = parser_ObjectLexer('?($$async(async|sync) )', [
    '"$path"',
    'from |("$path"$$namespace<accessor>)',
    '* as $alias from |("$path"$$namespace<accessor>)',
    '$$exports[$name?(as $alias)](,) from |("$path"$$namespace<accessor>)'
], '?(is $$flags{link:dynamic|static;contentType:mask|script|style|json|text;mode:client|server|both})', '?(as $moduleType)', '?(($$attr[$key? =? "$value"]( )))');
var ImportsNode = class_create(Dom.Node, {
    stringify: function (stream) {
        stream.process(this.nodes);
    }
});
var ImportNode = class_create({
    type: Dom.COMPONENT,
    tagName: IMPORT,
    contentType: null,
    moduleType: null,
    namespace: null,
    exports: null,
    alias: null,
    async: null,
    path: null,
    link: null,
    mode: null,
    constructor: function (parent, obj) {
        this.path = obj.path;
        this.alias = obj.alias;
        this.async = obj.async;
        this.exports = obj.exports;
        this.namespace = obj.namespace;
        this.moduleType = obj.moduleType;
        this.contentType = obj.contentType;
        this.attr = obj.attr == null ? null : this.toObject(obj.attr);
        this.link = obj.link || default_LINK;
        this.mode = obj.mode || default_MODE;
        this.parent = parent;
    },
    stringify: function () {
        var from = " from ", importStr = IMPORT, type = this.contentType, link = this.link, mode = this.mode;
        if (this.path != null) {
            from += "'" + this.path + "'";
        }
        if (this.namespace != null) {
            from += this.namespace;
        }
        if (type != null || link !== default_LINK || mode !== default_MODE) {
            from += ' is';
            if (type != null)
                from += ' ' + type;
            if (link !== default_LINK)
                from += ' ' + link;
            if (mode !== default_MODE)
                from += ' ' + mode;
        }
        if (this.moduleType != null) {
            from += ' as ' + this.moduleType;
        }
        if (this.async != null) {
            importStr += ' ' + this.async;
        }
        if (this.attr != null) {
            var initAttr = '(', attr = initAttr;
            for (var key in this.attr) {
                if (attr !== initAttr)
                    attr += ' ';
                attr += key + "='" + this.attr[key] + "'";
            }
            attr += ')';
            from += ' ' + attr;
        }
        from += ';';
        if (this.alias != null) {
            return importStr + " * as " + this.alias + from;
        }
        if (this.exports != null) {
            var arr = this.exports, str = '', imax = arr.length, i = -1, x;
            while (++i < imax) {
                x = arr[i];
                str += x.name;
                if (x.alias) {
                    str += ' as ' + x.alias;
                }
                if (i !== imax - 1) {
                    str += ', ';
                }
            }
            return importStr + ' ' + str + from;
        }
        return importStr + from;
    },
    toObject: function (arr) {
        var obj = {}, i = arr.length;
        while (--i > -1) {
            obj[arr[i].key] = arr[i].value;
        }
        return obj;
    }
});

import { class_create } from '@utils/class';
import { parser_error } from '@core/util/reporters';
import { custom_Parsers } from '@core/custom/exports';
import { Dom } from '@core/dom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { cursor_refEnd, cursor_groupEnd, cursor_quoteEnd } from '../cursor';
custom_Parsers['var'] = function (str, index, length, parent) {
    var node = new VarNode('var', parent), start, c;
    var go_varName = 1, go_assign = 2, go_value = 3, go_next = 4, state = go_varName, token, key;
    while (true) {
        if (index < length && (c = str.charCodeAt(index)) < 33) {
            index++;
            continue;
        }
        if (state === go_varName) {
            start = index;
            index = cursor_refEnd(str, index, length);
            key = str.substring(start, index);
            state = go_assign;
            continue;
        }
        if (state === go_assign) {
            if (c !== 61) {
                // =
                parser_error('Assignment expected', str, index, c, 'var');
                return [node, index];
            }
            state = go_value;
            index++;
            continue;
        }
        if (state === go_value) {
            start = index;
            index++;
            switch (c) {
                case 123:
                case 91:
                    // { [
                    index = cursor_groupEnd(str, index, length, c, c + 2);
                    break;
                case 39:
                case 34:
                    // ' "
                    index = cursor_quoteEnd(str, index, length, c === 39 ? "'" : '"');
                    break;
                default:
                    while (index < length) {
                        c = str.charCodeAt(index);
                        if (c === 91 || c === 40) {
                            // [ (
                            index = cursor_groupEnd(str, index + 1, length, c, c === 91 ? 93 : 41);
                            continue;
                        }
                        if (c === 44 || c === 59) {
                            //, ;
                            break;
                        }
                        index++;
                    }
                    index--;
                    break;
            }
            index++;
            node.attr[key] = str.substring(start, index);
            state = go_next;
            continue;
        }
        if (state === go_next) {
            if (c === 44) {
                // ,
                state = go_varName;
                index++;
                continue;
            }
            break;
        }
    }
    return [node, index, 0];
};
var VarNode = class_create(Dom.Node, {
    stringify: function () {
        var attr = this.attr;
        var str = 'var ';
        for (var key in attr) {
            if (str !== 'var ')
                str += ',';
            str += key + '=' + attr[key];
        }
        return str + ';';
    },
    getObject: function (model, ctx, ctr) {
        var obj = {}, attr = this.attr, key;
        for (key in attr) {
            obj[key] = expression_eval(attr[key], model, ctx, ctr);
        }
        return obj;
    }
});

export { parser_parse } from './mask/parser';
export { parser_parseHtml } from './html/parser';
export { parser_parseAttr, parser_parseAttrObject } from './mask/partials/attributes';
export { parser_parseLiteral } from './mask/partials/literal';
export { parser_setInterpolationQuotes } from './const';
export { parser_ensureTemplateFunction } from './interpolation';
export { parser_cleanObject } from './utils';
export { parser_ObjectLexer } from './object/ObjectLexer';
export { parser_defineContentTag } from './config';
export { mask_stringify, mask_stringifyAttr } from './mask/stringify';
export { Templates } from './Templates';
export { cursor_groupEnd } from './cursor';
import './parsers/content';
import './parsers/define';
import './parsers/import';
import './parsers/var';

import { is_ArrayLike } from '@utils/is';
export function arr_eachAny(mix, fn) {
    if (is_ArrayLike(mix) === false) {
        fn(mix);
        return;
    }
    var imax = mix.length, i = -1;
    while (++i < imax) {
        fn(mix[i], i);
    }
}
export function arr_unique(array) {
    hasDuplicate_ = false;
    array.sort(sort);
    if (hasDuplicate_ === false)
        return array;
    var duplicates = [], i = 0, j = 0, imax = array.length - 1;
    while (i < imax) {
        if (array[i++] === array[i]) {
            duplicates[j++] = i;
        }
    }
    while (j--) {
        array.splice(duplicates[j], 1);
    }
    return array;
}
var hasDuplicate_ = false;
function sort(a, b) {
    if (a === b) {
        hasDuplicate_ = true;
        return 0;
    }
    return 1;
}

import { Dom } from '@core/dom/exports';
import { log_error } from '@core/util/reporters';
export function selector_parse(selector, type, direction) {
    if (selector == null)
        log_error('selector is null for the type', type);
    var _type = typeof selector;
    if (_type === 'object' || _type === 'function')
        return selector;
    var key, prop, nextKey, filters, _key, _prop, _selector;
    var index = 0, length = selector.length, c, end, matcher, root, current, eq, slicer;
    if (direction === 'up') {
        nextKey = sel_key_UP;
    }
    else {
        nextKey = type === Dom.SET ? sel_key_MASK : sel_key_COMPOS;
    }
    while (index < length) {
        c = selector.charCodeAt(index);
        if (c < 33) {
            index++;
            continue;
        }
        if (c === 62 /* > */) {
            if (matcher == null) {
                root = matcher = {
                    selector: '__scope__',
                    nextKey: nextKey,
                    filters: null,
                    next: {
                        type: 'children',
                        matcher: null
                    }
                };
            }
            else {
                matcher.next = {
                    type: 'children',
                    matcher: null
                };
            }
            current = matcher;
            matcher = null;
            index++;
            continue;
        }
        end = selector_moveToBreak(selector, index + 1, length);
        if (c === 46 /*.*/) {
            _key = 'class';
            _prop = sel_key_ATTR;
            _selector = sel_hasClassDelegate(selector.substring(index + 1, end));
        }
        else if (c === 35 /*#*/) {
            _key = 'id';
            _prop = sel_key_ATTR;
            _selector = selector.substring(index + 1, end);
        }
        else if (c === 91 /*[*/) {
            eq = selector.indexOf('=', index);
            //if DEBUG
            eq === -1 &&
                console.error('Attribute Selector: should contain "="');
            // endif
            _prop = sel_key_ATTR;
            _key = selector.substring(index + 1, eq);
            //slice out quotes if any
            c = selector.charCodeAt(eq + 1);
            slicer = c === 34 || c === 39 ? 2 : 1;
            _selector = selector.substring(eq + slicer, end - slicer + 1);
            // increment, as cursor is on closed ']'
            end++;
        }
        else if (c === 58 /*:*/ && selector.charCodeAt(index + 1) === 58) {
            index += 2;
            var start = index, name, expr;
            do {
                c = selector.charCodeAt(index);
            } while (c >= 97 /*a*/ && c <= 122 /*z*/ && ++index < length);
            name = selector.substring(start, index);
            if (c === 40 /*(*/) {
                start = ++index;
                do {
                    c = selector.charCodeAt(index);
                } while (c !== 41 /*)*/ && ++index < length);
                expr = selector.substring(start, index);
                index++;
            }
            var pseudo = PseudoSelectors(name, expr);
            if (matcher == null) {
                matcher = {
                    selector: '*',
                    nextKey: nextKey
                };
            }
            if (root == null) {
                root = matcher;
            }
            if (matcher.filters == null) {
                matcher.filters = [];
            }
            matcher.filters.push(pseudo);
            continue;
        }
        else {
            if (matcher != null) {
                matcher.next = {
                    type: 'any',
                    matcher: null
                };
                current = matcher;
                matcher = null;
            }
            _prop = null;
            _key = type === Dom.SET ? 'tagName' : 'compoName';
            _selector = selector.substring(index, end);
        }
        index = end;
        if (matcher == null) {
            matcher = {
                key: _key,
                prop: _prop,
                selector: _selector,
                nextKey: nextKey,
                filters: null
            };
            if (root == null)
                root = matcher;
            if (current != null) {
                current.next.matcher = matcher;
            }
            continue;
        }
        if (matcher.filters == null)
            matcher.filters = [];
        matcher.filters.push({
            key: _key,
            selector: _selector,
            prop: _prop
        });
    }
    if (current && current.next)
        current.next.matcher = matcher;
    return root;
}
export function selector_match(node, selector, type) {
    if (typeof selector === 'string') {
        if (type == null) {
            type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
        }
        selector = selector_parse(selector, type);
    }
    if (typeof selector === 'function') {
        return selector(node);
    }
    var obj = selector.prop ? node[selector.prop] : node, matched = false;
    if (obj == null)
        return false;
    if (selector.selector === '*') {
        matched = true;
    }
    else if (typeof selector.selector === 'function') {
        matched = selector.selector(obj[selector.key]);
    }
    else if (selector.selector.test != null) {
        if (selector.selector.test(obj[selector.key])) {
            matched = true;
        }
    }
    else if (obj[selector.key] === selector.selector) {
        matched = true;
    }
    if (matched === true && selector.filters != null) {
        for (var i = 0, x, imax = selector.filters.length; i < imax; i++) {
            x = selector.filters[i];
            if (typeof x === 'function') {
                matched = x(node, type);
                if (matched === false)
                    return false;
                continue;
            }
            if (selector_match(node, x, type) === false) {
                return false;
            }
        }
    }
    return matched;
}
export function selector_getNextKey(set) {
    return set.type === Dom.SET ? sel_key_MASK : sel_key_COMPOS;
}
// ==== private
var sel_key_UP = 'parent', sel_key_MASK = 'nodes', sel_key_COMPOS = 'components', sel_key_ATTR = 'attr';
function sel_hasClassDelegate(matchClass) {
    return function (className) {
        return sel_hasClass(className, matchClass);
    };
}
// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
function sel_hasClass(className, matchClass, index) {
    if (typeof className !== 'string')
        return false;
    if (index == null)
        index = 0;
    index = className.indexOf(matchClass, index);
    if (index === -1)
        return false;
    if (index > 0 && className.charCodeAt(index - 1) > 32)
        return sel_hasClass(className, matchClass, index + 1);
    var class_Length = className.length, match_Length = matchClass.length;
    if (index < class_Length - match_Length &&
        className.charCodeAt(index + match_Length) > 32)
        return sel_hasClass(className, matchClass, index + 1);
    return true;
}
function selector_moveToBreak(selector, index, length) {
    var c, isInQuote = false, isEscaped = false;
    while (index < length) {
        c = selector.charCodeAt(index);
        if (c === 34 || c === 39) {
            // '"
            isInQuote = !isInQuote;
        }
        if (c === 92) {
            // [\]
            isEscaped = !isEscaped;
        }
        if (c === 46 ||
            c === 35 ||
            c === 91 ||
            c === 93 ||
            c === 62 ||
            c < 33) {
            // .#[]>
            if (isInQuote !== true && isEscaped !== true) {
                break;
            }
        }
        index++;
    }
    return index;
}
var PseudoSelectors;
(function () {
    PseudoSelectors = function (name, expr) {
        var fn = Fns[name];
        if (fn !== void 0)
            return fn;
        var worker = Workers[name];
        if (worker !== void 0)
            return worker(expr);
        throw new Error('Uknown pseudo selector:' + name);
    };
    var Fns = {
        text: function (node) {
            return node.type === Dom.TEXTNODE;
        },
        node: function (node) {
            return node.type === Dom.NODE;
        }
    };
    var Workers = {
        not: function (expr) {
            return function (node, type) {
                return !selector_match(node, expr, type);
            };
        }
    };
})();

import { arr_eachAny } from './array';
import { is_ArrayLike, is_Function } from '@utils/is';
import { obj_create } from '@utils/obj';
import { Dom } from '@core/dom/exports';
import { selector_match } from './selector';
export function jmask_filter(mix, matcher) {
    if (matcher == null)
        return mix;
    var result = [];
    arr_eachAny(mix, function (node, i) {
        if (selector_match(node, matcher))
            result.push(node);
    });
    return result;
}
;
/**
 * - mix (Node | Array[Node])
 */
export function jmask_find(mix, matcher, output, deep) {
    if (mix == null) {
        return output;
    }
    if (output == null) {
        output = [];
    }
    if (deep == null) {
        // is root and matchling like `> div` (childs only)
        if (matcher.selector === '__scope__') {
            deep = false;
            matcher = matcher.next.matcher;
        }
        else {
            deep = true;
        }
    }
    arr_eachAny(mix, function (node) {
        if (selector_match(node, matcher) === false) {
            if (matcher.next == null && deep !== false)
                jmask_find(node[matcher.nextKey], matcher, output, deep);
            return;
        }
        if (matcher.next == null) {
            output.push(node);
            if (deep === true)
                jmask_find(node[matcher.nextKey], matcher, output, deep);
            return;
        }
        var next = matcher.next;
        deep = next.type !== 'children';
        jmask_find(node[matcher.nextKey], next.matcher, output, deep);
    });
    return output;
}
;
export function jmask_clone(node, parent) {
    var clone = obj_create(node);
    var attr = node.attr;
    if (attr != null) {
        clone.attr = obj_create(attr);
    }
    var nodes = node.nodes;
    if (nodes != null) {
        if (is_ArrayLike(nodes) === false) {
            clone.nodes = [jmask_clone(nodes, clone)];
        }
        else {
            clone.nodes = [];
            var imax = nodes.length, i = 0;
            for (; i < imax; i++) {
                clone.nodes[i] = jmask_clone(nodes[i], clone);
            }
        }
    }
    return clone;
}
;
export function jmask_deepest(node) {
    var current = node, prev;
    while (current != null) {
        prev = current;
        current = current.nodes && current.nodes[0];
    }
    return prev;
}
;
export function jmask_getText(node, model, ctx, controller) {
    if (Dom.TEXTNODE === node.type) {
        if (is_Function(node.content)) {
            return node.content('node', model, ctx, null, controller);
        }
        return node.content;
    }
    var output = '';
    if (node.nodes != null) {
        for (var i = 0, x, imax = node.nodes.length; i < imax; i++) {
            x = node.nodes[i];
            output += jmask_getText(x, model, ctx, controller);
        }
    }
    return output;
}
;

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { obj_extend } from '@utils/obj';
import { class_Dfr } from '@utils/class/Dfr';
var builder_Ctx = /** @class */ (function (_super) {
    __extends(builder_Ctx, _super);
    function builder_Ctx(data) {
        var _this = _super.call(this) || this;
        // Is true, if some of the components in a ctx is async
        _this.async = false;
        // List of busy components
        _this.defers = null; /*Array*/
        // NodeJS
        // Track components ID
        _this._id = 0;
        // ModelsBuilder for HTML serialization
        _this._models = null;
        // ModulesBuilder fot HTML serialization
        _this._modules = null;
        _this._redirect = null;
        _this._rewrite = null;
        if (data != null) {
            obj_extend(_this, data);
        }
        return _this;
    }
    builder_Ctx.clone = function (ctx) {
        var data = {};
        for (var key in ctx) {
            if (builder_Ctx.prototype[key] === void 0) {
                data[key] = ctx[key];
            }
        }
        return new builder_Ctx(data);
    };
    return builder_Ctx;
}(class_Dfr));
export { builder_Ctx };
;

export var BuilderData = {
    id: 1,
    document: typeof document === 'undefined' ? null : document
};

import { obj_create, obj_setProperty, obj_extend } from '@utils/obj';
import { is_Function } from '@utils/is';
import { customTag_registerScoped } from '@core/custom/exports';
export function builder_findAndRegisterCompo(ctr, name) {
    for (var compo = ctr; compo != null; compo = compo.parent) {
        if (compo.handlers == null) {
            continue;
        }
        var Ctor = compo.handlers[name];
        if (Ctor == null) {
            continue;
        }
        customTag_registerScoped(compo, name, Ctor);
        return true;
    }
    return false;
}
export function builder_setCompoModel(compo, model, ctx, ctr) {
    var readModel = (compo.meta != null && compo.meta.readArguments) || null;
    var argsModel = readModel == null ? null : readModel(compo.expression, model, ctx, ctr);
    if (compo.model != null) {
        return obj_extend(compo.model, argsModel);
    }
    return (compo.model = argsModel || model);
}
export function builder_setCompoAttributes(compo, node, model, ctx, container) {
    var ownAttr = compo.attr;
    var attr = node.attr;
    if (attr == null) {
        attr = {};
    }
    else {
        attr = obj_create(attr);
        for (var key in attr) {
            var fn = attr[key];
            if (typeof fn === 'function') {
                attr[key] = fn('compo-attr', model, ctx, container, compo, key);
            }
        }
    }
    compo.attr = attr;
    if (compo.meta != null) {
        if (compo.meta.readAttributes != null) {
            compo.meta.readAttributes(compo, attr, model, container);
        }
        if (compo.meta.readProperties != null) {
            compo.meta.readProperties(compo, attr, model, container);
        }
    }
    for (var key in ownAttr) {
        var current = attr[key], val = null;
        if (current == null || key === 'class') {
            var x = ownAttr[key];
            val = is_Function(x)
                ? x('compo-attr', model, ctx, container, compo, key)
                : x;
        }
        if (key === 'class') {
            attr[key] = current == null ? val : current + ' ' + val;
            continue;
        }
        if (current != null) {
            continue;
        }
        attr[key] = val;
    }
    return attr;
}
export function builder_setCompoProps(compo, node, model, ctx, container) {
    var props = node.props;
    if (props == null) {
        return;
    }
    for (var key in props) {
        var val = props[key];
        var x = is_Function(val)
            ? val('compo-prop', model, ctx, container, compo, key)
            : val;
        obj_setProperty(compo, key, x);
    }
}

export var _store = {};

import { expression_eval } from '@project/expression/src/exports';
import { error_withNode } from '@core/util/reporters';
import { _store } from './store';
import { custom_Tags, custom_Statements } from '@core/custom/exports';
import { is_Function } from '@utils/is';
import { obj_create } from '@utils/obj';
export function _getDecorator(decoNode, model, ctx, ctr) {
    var expr = decoNode.expression, deco = expression_eval(expr, _store, null, ctr);
    if (deco == null) {
        error_withNode('Decorator not resolved', decoNode);
        return null;
    }
    if (expr.indexOf('(') === -1 && isFactory(deco)) {
        return initialize(deco);
    }
    return deco;
}
;
export function _getDecoType(node) {
    var tagName = node.tagName, type = node.type;
    if (tagName === 'function' || tagName === 'slot' || tagName === 'event' || tagName === 'pipe') {
        return 'METHOD';
    }
    if ((type === 1 || type === 15) && custom_Tags[tagName] != null) {
        type = 4;
    }
    if (type === 1 && custom_Statements[tagName] != null) {
        type = 15;
    }
    if (type === 1) {
        return 'NODE';
    }
    if (type === 4) {
        return 'COMPO';
    }
    return null;
}
;
function isFactory(deco) {
    return deco.isFactory === true;
}
function initialize(deco) {
    if (is_Function(deco)) {
        return new deco();
    }
    // is object
    var self = obj_create(deco);
    if (deco.hasOwnProperty('constructor')) {
        var x = deco.constructor.call(self);
        if (x != null)
            return x;
    }
    return self;
}

import { is_Function, is_Array, is_Object } from '@utils/is';
import { error_withNode } from '@core/util/reporters';
import { _Array_slice } from '@utils/refs';
import { _getDecorator } from './utils';
export function _wrapMany(wrapperFn, decorators, fn, target, key, model, ctx, ctr) {
    var _fn = fn, i = decorators.length;
    while (--i !== -1) {
        _fn = wrap(wrapperFn, decorators[i], _fn, target, key, model, ctx, ctr);
    }
    return _fn;
}
export function _wrapper_Fn(decoNode, deco, innerFn, target, key) {
    if (is_Function(deco)) {
        if (deco.length > 1) {
            var descriptor = { value: innerFn };
            var result = deco(target, key, descriptor);
            if (result == null) {
                if (target[key] !== innerFn) {
                    return target[key];
                }
                return descriptor.value;
            }
            if (result.value == null) {
                error_withNode('Decorator should return value descriptor', decoNode);
                return innerFn;
            }
            return result.value;
        }
        return deco(innerFn) || innerFn;
    }
    var beforeInvoke = deco.beforeInvoke, afterInvoke = deco.afterInvoke;
    if (beforeInvoke || afterInvoke) {
        return function () {
            var args = _Array_slice.call(arguments);
            if (beforeInvoke != null) {
                var overridenArgs = beforeInvoke.apply(this, args);
                if (is_Array(overridenArgs)) {
                    args = overridenArgs;
                }
            }
            var result = innerFn.apply(this, args);
            if (afterInvoke != null) {
                var overridenResult = afterInvoke.call(this, result);
                if (overridenResult !== void 0)
                    result = overridenResult;
            }
            return result;
        };
    }
    error_withNode('Invalid function decorator', decoNode);
}
export function _wrapper_NodeBuilder(decoNode, deco, builderFn) {
    var beforeRender, afterRender, decoCtx;
    if (is_Function(deco)) {
        afterRender = deco;
    }
    else if (is_Object(deco)) {
        beforeRender = deco.beforeRender;
        afterRender = deco.afterRender;
        decoCtx = deco;
    }
    if (beforeRender || afterRender) {
        return create(decoCtx, beforeRender, afterRender, builderFn);
    }
    error_withNode('Invalid node decorator', decoNode);
}
;
export function _wrapper_CompoBuilder(decoNode, deco, builderFn) {
    var beforeRender, afterRender, decoCtx;
    if (is_Function(deco)) {
        beforeRender = deco;
    }
    else if (is_Object(deco)) {
        beforeRender = deco.beforeRender;
        afterRender = deco.afterRender;
        decoCtx = deco;
    }
    if (beforeRender || afterRender) {
        return create(decoCtx, beforeRender, afterRender, builderFn);
    }
    error_withNode('Invalid node decorator', decoNode);
}
;
function wrap(wrapperFn, decoratorNode, innerFn, target, key, model, ctx, ctr) {
    var deco = _getDecorator(decoratorNode, model, ctx, ctr);
    if (deco == null) {
        return innerFn;
    }
    return wrapperFn(decoratorNode, deco, innerFn, target, key) || innerFn;
}
function create(decoCtx, beforeFn, afterFn, builderFn) {
    return function (node, model, ctx, el, ctr, els) {
        if (beforeFn != null) {
            var mix = beforeFn.call(decoCtx, node, model, ctx, el, ctr, els);
            if (mix != null) {
                if ('tagName' in mix) {
                    console.warn('@obsolete: Before FN in decorator should return compound object with node?, container?, controller?, model? properties');
                    node = mix;
                }
                else {
                    if (mix.model)
                        model = mix.model;
                    if (mix.node)
                        node = mix.node;
                    if (mix.container)
                        el = mix.container;
                    if (mix.controller)
                        ctr = mix.controller;
                }
            }
        }
        if (els == null) {
            els = [];
        }
        builderFn(node, model, ctx, el, ctr, els);
        if (afterFn != null) {
            afterFn.call(decoCtx, els[els.length - 1], model, ctr);
        }
    };
}

import { _global } from '@utils/refs';
export function sourceUrl_get(node) {
    //if DEBUG
    var tag = node.tagName;
    var fn = tag === 'let' || tag === 'define'
        ? forDefine
        : forNode;
    var url = fn(node), i = _sourceUrls[url];
    if (i !== void 0) {
        i = ++_sourceUrls[url];
    }
    if (i != null) {
        url += '_' + i;
    }
    _sourceUrls[url] = 1;
    return '\n//# sourceURL=' + ORIGIN + '/controllers/' + url;
    //endif
}
;
var ORIGIN = _global.location && _global.location.origin || 'dynamic://MaskJS';
//if DEBUG
function forDefine(node) {
    var x = node, url = x.tagName + '_' + x.name;
    if (x.tagName === 'let') {
        while ((x = x.parent) != null && x.tagName !== 'define')
            ;
        if (x != null) {
            url = x.tagName + '_' + x.name + '-' + url;
        }
    }
    return url;
}
function forNode(node) {
    var url = node.tagName + '_' + node.name, x = node, i = 0;
    while ((x = x.parent) != null && ++i < 10) {
        var tag = x.tagName;
        if ('let' === tag || 'define' === tag) {
            url = x.name + '.' + url;
            continue;
        }
        if (i === 0) {
            url = x.tagName + '_' + url;
        }
    }
    return url;
}
var _sourceUrls = {};
//endif

export function _args_toCode(args) {
    var str = '';
    if (args == null || args.length === 0) {
        return str;
    }
    var imax = args.length, i = -1;
    while (++i < imax) {
        if (i > 0)
            str += ',';
        str += args[i].prop;
    }
    return str;
}
;

export function scopeRefs_getImportVars(owner, out_) {
    var imports = getImports(owner);
    if (imports == null) {
        return;
    }
    var out = out_ || [[], []], imax = imports.length, i = -1, arr;
    while (++i < imax) {
        var import_ = imports[i];
        var type = import_.type;
        if (type !== 'script' && type !== 'data' && type !== 'text' && type !== 'mask') {
            continue;
        }
        import_.eachExport(register);
    }
    function register(varName) {
        var val = this.getExport(varName);
        out[0].push(varName);
        out[1].push(val);
    }
}
;
function getImports(owner) {
    if (owner.importItems)
        return owner.importItems;
    var x = owner;
    while (x != null && x.tagName !== 'imports') {
        x = x.parent;
    }
    return x == null ? null : x.importItems;
}

var ENV_CLASS = (function () {
    try {
        new Function('class c{}')();
        return true;
    }
    catch (_a) {
        return false;
    }
}());
var ENV_SPREAD = (function () {
    try {
        var x = new Function('x', 'return(function(...args){return args[0]}(x));return foo(x);')(1);
        return x === 1;
    }
    catch (_a) {
        return false;
    }
}());
var class_overrideArgs = (function () {
    if (ENV_CLASS === false) {
        return function (Ctor, innerFn) {
            var Wrapped = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                Ctor.apply(this, innerFn.apply(void 0, args));
            };
            Wrapped.prototype = Ctor.prototype;
            return Wrapped;
        };
    }
    if (ENV_SPREAD) {
        return new Function('Ctor', 'innerFn', "\n            return class extends Ctor {\n                constructor (...args) {\n                    super(...innerFn(...args));\n                }\n            }\n        ");
    }
    return new Function('Ctor', 'innerFn', "\n        return class extends Ctor {\n            constructor () {\n                var x = innerFn.apply(null, arguments);\n                super(x[0], x[1], x[2], x[3], x[4], x[5]);\n            }\n        };\n    ");
}());
export var env_class_overrideArgs = class_overrideArgs;
export var env_class_wrapCtors = function (Base, beforeFn, afterFn, middCtors) {
    if (middCtors != null) {
        for (var i = 0; i < middCtors.length; i++) {
            middCtors[i] = ensureCallableSingle(middCtors[i]);
        }
    }
    return polyfill_class_wrap_inner(Base, beforeFn, afterFn, middCtors);
};
var polyfill_class_wrap_inner = (function () {
    if (!ENV_CLASS) {
        return function (Base, beforeFn, afterFn, callCtors) {
            var callBase = ensureCallableSingle(Base);
            var Wrapped = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                callBase(this, args);
                if (beforeFn != null) {
                    beforeFn.apply(this, args);
                }
                if (callCtors != null) {
                    for (var i = callCtors.length - 1; i > -1; i--) {
                        callCtors[i](this, args);
                    }
                }
                if (afterFn != null) {
                    afterFn.apply(this, args);
                }
            };
            obj_extend(Wrapped.prototype, Base.prototype);
            return Wrapped;
        };
    }
    if (ENV_SPREAD) {
        return new Function('Base', 'beforeFn', 'afterFn', 'callCtors', "\n            return class extends Base {\n                constructor (...args) {\n                    super(...args);\n                    if (beforeFn != null) {\n                        beforeFn.apply(this, args);\n                    }\n                    if (callCtors != null) {\n                        for (var i = callCtors.length - 1; i > -1; i--) {\n                            callCtors[i](this, args);\n                        }\n                    }\n                    if (afterFn != null) {\n                        afterFn.apply(this, args);\n                    }\n                }\n            }\n        ");
    }
    return new Function('Base', 'beforeFn', 'afterFn', 'callCtors', "\n        return class extends Base {\n            constructor (a, b, c, d, e, f) {\n                super(a, b, c, d, e, f);\n                var args = Array.from(arguments);\n                if (beforeFn != null) {\n                    beforeFn.apply(this, args);\n                }\n                if (callCtors != null) {\n                    for (var i = callCtors.length - 1; i > -1; i--) {\n                        callCtors[i](this, args);\n                    }\n                }\n                if (afterFn != null) {\n                    afterFn.apply(this, args);\n                }\n            }\n        }\n    ");
}());
function ensureCallableSingle(fn) {
    var caller = directCaller;
    var safe = false;
    return function (self, args) {
        if (safe === true) {
            caller(fn, self, args);
            return;
        }
        try {
            caller(fn, self, args);
            safe = true;
        }
        catch (error) {
            caller = newCaller;
            safe = true;
            caller(fn, self, args);
        }
    };
}
;
function directCaller(fn, self, args) {
    return fn.apply(self, args);
}
function newCaller(fn, self, args) {
    var x = new (fn.bind.apply(fn, [null].concat(args)));
    obj_extend(self, x);
}

import { is_Function } from '@utils/is';
import { expression_evalStatements } from '@project/expression/src/exports';
import { env_class_overrideArgs } from '@core/util/env_class';
export var Di = {
    resolve: function (Type) {
        return _di.resolve(Type);
    },
    setResolver: function (di) {
        _di = di;
    },
    deco: {
        injectableClass: function (mix) {
            if (is_Function(mix)) {
                return createInjectableClassWrapper(mix);
            }
            return function (Ctor) {
                return createInjectableClassWrapper(Ctor, mix);
            };
        }
    }
};
var _di = {
    resolve: function (Type) {
        if (typeof Type === 'function')
            return new Type();
        return Type;
    }
};
function createInjectableClassWrapper(Ctor, types) {
    return env_class_overrideArgs(Ctor, function (node, model, ctx, el, parent) {
        var args = [];
        if (node.expression != null) {
            args = expression_evalStatements(node.expression, model, ctx, parent, node);
        }
        if (types != null) {
            if (args == null)
                args = new Array(types.length);
            for (var i = 0; i < types.length; i++) {
                if (types[i] === null || args[i] != null) {
                    continue;
                }
                args[i] = _di.resolve(types[i]);
            }
        }
        return args;
    });
}

import { _Array_slice } from '@utils/refs';
import { __cfg } from '@core/api/config';
import { sourceUrl_get } from './source-url';
import { _args_toCode } from './utils';
import { Dom } from '@core/dom/exports';
import { Decorator } from '../decorators/exports';
import { scopeRefs_getImportVars } from './scope-refs';
import { expression_eval } from '@project/expression/src/exports';
import { Di } from '../Di';
export function defMethods_getSource(defNode, defProto, model, owner) {
    var nodes = getFnNodes(defNode.nodes);
    if (nodes == null || nodes.length === 0) {
        return;
    }
    var body = createFnBody(defNode, nodes);
    var sourceUrl = sourceUrl_get(defNode);
    // [[name],[value]]
    var scopeVars = getScopeVars(defNode, defProto, model, owner);
    var code = createFnWrapperCode(defNode, body, scopeVars[0]);
    var preproc = __cfg.preprocessor.script;
    if (preproc) {
        code = preproc(code);
    }
    if (sourceUrl != null) {
        code += sourceUrl;
    }
    return [code, nodes, scopeVars[1]];
}
export function defMethods_compile(defNode, defProto, model, owner) {
    var source = defMethods_getSource(defNode, defProto, model, owner);
    if (source == null)
        return;
    var code = source[0], nodes = source[1], vals = source[2], fnWrapper = Function('return ' + code), factory = fnWrapper(), fns = factory.apply(null, vals), imax = nodes.length, i = -1;
    while (++i < imax) {
        var node = nodes[i];
        var fn = fns[i];
        if (node.name === 'constructor') {
            fn = wrapDi(fn, node);
        }
        node.fn = fn;
    }
}
function createFnBody(defineNode, nodes) {
    var code = 'return [\n', localVars = createFnLocalVars(defineNode), i = -1, imax = nodes.length;
    while (++i < imax) {
        var node = nodes[i], tag = node.tagName, name = node.getFnName(), body = node.body, argMetas = node.args;
        if (node.flagAsync) {
            code += 'async ';
        }
        code += 'function ' + name + ' (' + _args_toCode(argMetas) + ') {\n';
        code += localVars + body;
        code += '\n}' + (i === imax - 1 ? '' : ',') + '\n';
    }
    code += '];\n';
    return code;
}
function createFnWrapperCode(defineNode, body, args) {
    var name = defineNode.name.replace(/[:$]/g, '_') + 'Controller';
    var code = 'function ' + name + ' (' + args.join(',') + ') {\n';
    code += body;
    code += '\n}';
    return code;
}
function compile(fnCode, sourceUrl) {
    var body = fnCode;
    var preproc = __cfg.preprocessor.script;
    if (preproc) {
        body = preproc(body);
    }
    if (sourceUrl != null) {
        body += sourceUrl;
    }
    var fnWrapper = Function('return ' + body);
    var factory = fnWrapper();
    return factory;
}
function createFnLocalVars(defineNode) {
    var args = defineNode.arguments;
    if (args == null) {
        return '';
    }
    var imax = args.length, i = -1;
    if (imax === 0) {
        return '';
    }
    var str = 'var ', prop;
    while (++i < imax) {
        prop = args[i].name;
        str += prop + ' = this.model.' + prop;
        str += i === imax - 1 ? ';\n' : ',\n    ';
    }
    return str;
}
function getFnNodes(nodes) {
    if (nodes == null) {
        return null;
    }
    var imax = nodes.length, i = -1, arr, decoStart = -1;
    while (++i < imax) {
        var node = nodes[i];
        if (node.type === Dom.DECORATOR) {
            var start = i;
            i = Decorator.goToNode(nodes, i, imax);
            node = nodes[i];
            if (isFn(node.tagName) === false) {
                continue;
            }
            node.decorators = _Array_slice.call(nodes, start, i);
        }
        if (isFn(node.tagName) === false || node.fn != null) {
            continue;
        }
        if (arr == null)
            arr = [];
        arr.push(node);
    }
    return arr;
}
function getScopeVars(defNode, defProto, model, owner) {
    var out = [[], []];
    scopeRefs_getImportVars(owner, out);
    return out;
}
function isFn(name) {
    return (name === 'function' ||
        name === 'slot' ||
        name === 'event' ||
        name === 'pipe');
}
function wrapDi(fn, fnNode) {
    var args = fnNode.args;
    if (args == null) {
        return fn;
    }
    return createDiFn(args, fn);
}
var createDiFn;
(function () {
    createDiFn = function (argMetas, fn) {
        return function () {
            var args = mergeArgs(argMetas, _Array_slice.call(arguments));
            return fn.apply(this, args);
        };
    };
    function mergeArgs(argMetas, args) {
        var model = args[1];
        var controller = args[4];
        var tLength = argMetas.length, aLength = args.length, max = tLength > aLength ? tLength : aLength, arr = new Array(max), i = -1;
        while (++i < max) {
            // injections are resolved first.
            if (i < tLength && argMetas[i].type != null) {
                var Type = expression_eval(argMetas[i].type, model, null, controller);
                arr[i] = Di.resolve(Type);
                continue;
            }
            if (i < aLength && args[i] != null) {
                arr[i] = args[i];
                continue;
            }
        }
        return arr;
    }
})();

import { sourceUrl_get } from './source-url';
import { _args_toCode } from './utils';
import { scopeRefs_getImportVars } from './scope-refs';
import { __cfg } from '@core/api/config';
export function nodeMethod_getSource(node, model, owner) {
    var sourceUrl = sourceUrl_get(node), name = node.getFnName(), args = node.args, body = node.body, code = '';
    if (node.flagAsync) {
        code += 'async ';
    }
    code += 'function ' + name + ' (' + _args_toCode(args) + ') {\n';
    code += body;
    code += '\n}';
    var preproc = __cfg.preprocessor.script;
    if (preproc) {
        code = preproc(code);
    }
    if (sourceUrl != null) {
        code += sourceUrl;
    }
    return code;
}
;
export function nodeMethod_compile(node, model, owner) {
    var fn = node.fn;
    if (fn != null)
        return fn;
    var scopeVars = getScopeVars(node, node, owner), code = nodeMethod_getSource(node, model, owner), vars = scopeVars[0], vals = scopeVars[1], params = vars.concat(['return ' + code]), factory = Function.apply(null, params);
    return (node.fn = factory.apply(null, vals));
}
;
function getScopeVars(node, model, owner) {
    var out = [[], []];
    scopeRefs_getImportVars(owner, out);
    return out;
}

import { class_create } from '@utils/class';
import { Dom } from '@core/dom/exports';
import { custom_Parsers } from '@core/custom/exports';
import { cursor_groupEnd, parser_ObjectLexer } from '@core/parser/exports';
import { parser_error } from '@core/util/reporters';
import { nodeMethod_getSource, nodeMethod_compile } from './node-method';
function create(tagName) {
    return function (str, i, imax, parent) {
        var start = str.indexOf('{', i) + 1, head = parseHead(
        //tagName, str.substring(i, start - 1)
        tagName, str, i, start);
        if (head == null) {
            parser_error('Method head syntax error', str, i);
        }
        var end = cursor_groupEnd(str, start, imax, 123, 125), body = str.substring(start, end), node = head == null
            ? null
            : new MethodNode(tagName, head, body, parent);
        return [node, end + 1, 0];
    };
}
var parseHead;
(function () {
    var lex_ = parser_ObjectLexer('?($$flags{async:async;binding:private|public;self:self;static:static})$$methodName<accessor>? (?$$args[$$prop<token>?(? :? $$type<accessor>)](,))? ');
    parseHead = function (name, str, i, imax) {
        var head = new MethodHead();
        var end = lex_(str, i, imax, head, true);
        return end === i ? null : head;
    };
})();
function MethodHead() {
    this.methodName = null;
    this.args = null;
    this.async = null;
    this.binding = null;
}
var MethodNode = class_create(Dom.Component.prototype, {
    name: null,
    body: null,
    args: null,
    types: null,
    fn: null,
    flagAsync: false,
    flagPrivate: false,
    flagPublic: false,
    flagStatic: false,
    flagSelf: false,
    constructor: function (tagName, head, body, parent) {
        this.tagName = tagName;
        this.name = head.methodName;
        this.args = head.args;
        this.types = head.types;
        this.flagSelf = head.self === 'self';
        this.flagAsync = head.async === 'async';
        this.flagStatic = head.static === 'static';
        this.flagPublic = head.binding === 'public';
        this.flagPrivate = head.binding === 'private';
        this.body = body;
        this.parent = parent;
    },
    getFnSource: function () {
        return nodeMethod_getSource(this, null, this.parent);
    },
    compile: function (model, owner) {
        return nodeMethod_compile(this, model, owner);
    },
    getFnName: function () {
        var tag = this.tagName, name = this.name;
        return tag === 'event' || tag === 'pipe'
            ? name.replace(/[^\w_$]/g, '_')
            : name;
    },
    stringify: function (stream) {
        var str = this.tagName + ' ';
        if (this.flagSelf)
            str += 'self ';
        if (this.flagAsync)
            str += 'async ';
        if (this.flagPublic)
            str += 'public ';
        if (this.flagStatic)
            str += 'static ';
        if (this.flagPrivate)
            str += 'private ';
        stream.write(str + this.name);
        stream.format(' ');
        stream.print('(');
        stream.printArgs(this.args);
        stream.print(')');
        stream.openBlock('{');
        stream.print(this.body);
        stream.closeBlock('}');
    }
});
custom_Parsers['slot'] = create('slot');
custom_Parsers['pipe'] = create('pipe');
custom_Parsers['event'] = create('event');
custom_Parsers['function'] = create('function');

import { class_create } from '@utils/class';
import { custom_Tags } from '@core/custom/exports';
import { nodeMethod_compile } from './node-method';
import { log_error } from '@core/util/reporters';
import { Component } from '@compo/exports';
var Method = class_create({
    meta: {
        serializeNodes: true
    },
    constructor: function (node, model, ctx, el, parent) {
        this.fn = nodeMethod_compile(node, model, parent);
        this.name = node.name;
    }
});
custom_Tags['slot'] = class_create(Method, {
    renderEnd: function () {
        var ctr = this.parent, slots = ctr.slots;
        if (slots == null) {
            slots = ctr.slots = {};
        }
        slots[this.name] = this.fn;
    }
});
(function () {
    function parse(def) {
        var rgx = /^\s*([\w]+)[:\$]+([\w]+)\s*$/, parts = rgx.exec(def), name = parts && parts[1], signal = parts && parts[2];
        if (parts == null || name == null || signal == null) {
            log_error('PipeCompo. Invalid name.', def, 'Expect', rgx.toString());
            return null;
        }
        return [name, signal];
    }
    function attach(node, ctr) {
        var pipes = ctr.pipes;
        if (pipes == null) {
            pipes = ctr.pipes = {};
        }
        var signal = parse(node.name);
        if (signal == null) {
            return;
        }
        var name = signal[0], type = signal[1], pipe = ctr.pipes[name];
        if (pipe == null) {
            pipe = pipes[name] = {};
        }
        pipe[type] = node.fn;
    }
    custom_Tags['pipe'] = class_create(Method, {
        renderEnd: function () {
            attach(this, this.parent);
        }
    });
    custom_Tags.pipe.attach = attach;
}());
custom_Tags['event'] = class_create(Method, {
    renderEnd: function (els, model, ctx, el, ctr) {
        this.fn = this.fn.bind(this.parent);
        var name = this.name, params = null, i = name.indexOf(':');
        if (i !== -1) {
            params = name.substring(i + 1).trim();
            name = name.substring(0, i).trim();
        }
        Component.Dom.addEventListener(el, name, this.fn, params, ctr);
    }
});
custom_Tags['function'] = class_create(Method, {
    renderEnd: function () {
        this.parent[this.name] = this.fn;
    }
});

import { defMethods_getSource, defMethods_compile } from './define-methods';
import { nodeMethod_getSource, nodeMethod_compile } from './node-method';
import './parsers';
import './handlers';
export var Methods = {
    getSourceForDefine: defMethods_getSource,
    compileForDefine: defMethods_compile,
    getSourceForNode: nodeMethod_getSource,
    compileForNode: nodeMethod_compile,
};

import { _Array_slice } from '@utils/refs';
import { class_create } from '@utils/class';
import { is_Function, is_Object } from '@utils/is';
import { error_withNode } from '@core/util/reporters';
import { _wrapMany, _wrapper_NodeBuilder, _wrapper_CompoBuilder, _wrapper_Fn } from './wrappers';
import { _getDecoType } from './utils';
import { _store } from './store';
import { Methods } from '../methods/exports';
export var Decorator = {
    getDecoType: _getDecoType,
    define: function (key, mix) {
        if (is_Object(mix)) {
            mix = class_create(mix);
            mix.isFactory = true;
        }
        if (is_Function(mix) && mix.isFactory) {
            // Wrap the function, as it could be a class, and decorator expression cann`t contain 'new' keyword.
            _store[key] = function () {
                return new (mix.bind.apply(mix, [null].concat(_Array_slice.call(arguments))))();
            };
            _store[key].isFactory = true;
            return;
        }
        _store[key] = mix;
    },
    goToNode: function (nodes, start, imax) {
        var i = start;
        while (++i < imax && nodes[i].type === 16)
            ;
        if (i === imax) {
            error_withNode('No node to decorate', nodes[start]);
            return i;
        }
        return i;
    },
    wrapMethodNode: function (decorators, node, model, ctx, ctr) {
        if (node.fn)
            return node.fn;
        var fn = Methods.compileForNode(node, model, ctr);
        return (node.fn = this.wrapMethod(decorators, fn, node, 'fn', model, ctx, ctr));
    },
    wrapMethod: function (decorators, fn, target, key, model, ctx, ctr) {
        return _wrapMany(_wrapper_Fn, decorators, fn, target, key, model, ctx, ctr);
    },
    wrapNodeBuilder: function (decorators, builderFn, model, ctx, ctr) {
        return _wrapMany(_wrapper_NodeBuilder, decorators, builderFn, null, null, model, ctx, ctr);
    },
    wrapCompoBuilder: function (decorators, builderFn, model, ctx, ctr) {
        return _wrapMany(_wrapper_CompoBuilder, decorators, builderFn, null, null, model, ctx, ctr);
    }
};

import { Decorator } from '@core/feature/decorators/exports';
import { error_withNode } from '@core/util/reporters';
export function decorators_buildFactory(build) {
    return function decorators_build(decorators, node, model, ctx, el, ctr, els) {
        var type = Decorator.getDecoType(node);
        if (type == null) {
            error_withNode('Unsupported node to decorate', node);
            return build(node, model, ctx, el, ctr, els);
        }
        if (type === 'NODE') {
            var builder = Decorator.wrapNodeBuilder(decorators, build, model, ctx, ctr);
            return builder(node, model, ctx, el, ctr, els);
        }
        if (type === 'COMPO') {
            var builder = Decorator.wrapCompoBuilder(decorators, build, model, ctx, ctr);
            return builder(node, model, ctx, el, ctr, els);
        }
        if (type === 'METHOD') {
            Decorator.wrapMethodNode(decorators, node, model, ctx, ctr);
            return build(node, model, ctx, el, ctr, els);
        }
    };
}

import { Decorator } from '@core/feature/decorators/exports';
import { decorators_buildFactory } from './build_decorators';
export function build_manyFactory(build) {
    var decorators_build = decorators_buildFactory(build);
    return function build_many(nodes, model, ctx, el, ctr, els) {
        if (nodes == null)
            return;
        var imax = nodes.length;
        for (var i = 0; i < imax; i++) {
            var x = nodes[i];
            if (x.type === 16) {
                var start = i;
                i = Decorator.goToNode(nodes, i, imax);
                var decos = nodes.slice(start, i);
                decorators_build(decos, nodes[i], model, ctx, el, ctr, els);
                continue;
            }
            build(x, model, ctx, el, ctr, els);
        }
    };
}

import { is_Function, is_ArrayLike } from '@utils/is';
import { custom_Attributes } from '@core/custom/exports';
import { obj_setProperty } from '@utils/obj';
export function build_nodeFactory(config) {
    var el_create;
    (function (doc, factory) {
        el_create = function (name) {
            return factory(name, doc);
        };
    })(typeof document === 'undefined' ? null : document, config.create);
    return function build_node(node, model, ctx, container, ctr, children) {
        var el = el_create(node.tagName);
        if (el == null) {
            return;
        }
        if (children != null) {
            children.push(el);
            var id = ctr.ID;
            if (id != null) {
                el.setAttribute('x-compo-id', id);
            }
        }
        // ++ insert el into container before setting attributes, so that in any
        // custom util parentNode is available. This is for mask.node important
        // http://jsperf.com/setattribute-before-after-dom-insertion/2
        if (container != null) {
            container.appendChild(el);
        }
        var attr = node.attr;
        if (attr != null) {
            el_writeAttributes(el, node, attr, model, ctx, container, ctr);
        }
        var props = node.props;
        if (props != null) {
            el_writeProps(el, node, props, model, ctx, container, ctr);
        }
        return el;
    };
}
export var el_writeAttributes;
export var el_writeProps;
(function () {
    el_writeAttributes = function (el, node, attr, model, ctx, container, ctr) {
        for (var key in attr) {
            var mix = attr[key], val = is_Function(mix)
                ? getValByFn('attr', mix, key, model, ctx, el, ctr)
                : mix;
            if (val == null) {
                continue;
            }
            /** When not setting empty string as value to option tag, the inner text is used for value*/
            if (val === '' && key !== 'value') {
                continue;
            }
            var fn = custom_Attributes[key];
            if (fn != null) {
                fn(node, val, model, ctx, el, ctr, container);
            }
            else {
                el.setAttribute(key, val);
            }
        }
    };
    el_writeProps = function (el, node, props, model, ctx, container, ctr) {
        for (var key in props) {
            // if (key.indexOf('style.') === 0) {
            // 	key = prepairStyleProperty(el, key)
            // }
            var mix = props[key], val = is_Function(mix)
                ? getValByFn('prop', mix, key, model, ctx, el, ctr)
                : mix;
            if (val == null) {
                continue;
            }
            obj_setProperty(el, key, val);
        }
    };
    function getValByFn(type, fn, key, model, ctx, el, ctr) {
        var result = fn(type, model, ctx, el, ctr, key);
        if (result == null) {
            return null;
        }
        if (typeof result === 'string') {
            return result;
        }
        if (is_ArrayLike(result)) {
            if (result.length === 0) {
                return null;
            }
            return result.join('');
        }
        return result;
    }
})();

export var mode_SERVER = 'server';
export var mode_SERVER_ALL = 'server:all';
export var mode_SERVER_CHILDREN = 'server:children';
export var mode_CLIENT = 'client';
export var mode_BOTH = 'both';

var _a;
import { mode_SERVER, mode_SERVER_CHILDREN, mode_SERVER_ALL, mode_CLIENT, mode_BOTH } from '@mask-node/const';
import { log_error, log_warn } from '@core/util/reporters';
import { obj_create } from '@utils/obj';
import { class_create } from '@utils/class';
var mods = (_a = {},
    _a[mode_SERVER] = 1,
    _a[mode_SERVER_CHILDREN] = 1,
    _a[mode_SERVER_ALL] = 1,
    _a[mode_CLIENT] = 1,
    _a[mode_BOTH] = 1,
    _a);
export function meta_getRenderMode(compo) {
    var mode = meta_resolveRenderMode(compo);
    return new Mode(mode);
}
;
export function meta_getModelMode(compo) {
    var mode = meta_getRenderMode(compo);
    if (mode.isServer()) {
        return mode;
    }
    mode = meta_resolveModelMode(compo);
    return new Mode(mode);
}
;
export function meta_get(compo) {
    if (compo == null)
        return CompoMeta.create();
    var proto = typeof compo === 'function'
        ? compo.prototype
        : compo;
    return CompoMeta.create(proto);
}
;
export function meta_resolveRenderMode(compo) {
    var mode = getMetaVal(compo, 'mode', 'x-render-mode');
    if (mode == null) {
        mode = getMetaVal(compo.parent, 'mode', 'x-render-mode');
        if (mode == null) {
            mode = mode_BOTH;
            meta_setVal(mode, 'mode', mode);
        }
        if (mode === mode_SERVER_ALL || mode === mode_SERVER_CHILDREN) {
            meta_setVal(compo, 'mode', mode_SERVER_ALL);
        }
    }
    if (mode in mods === false) {
        log_error('Unknown render mode: ' + mode);
        return mode_BOTH;
    }
    return mode;
}
;
export function meta_resolveModelMode(compo) {
    var mode = getMetaVal(compo, 'modelMode', 'x-model-mode') || (log_warn('modeModel is deprecated'), getMetaVal(compo, 'modeModel'));
    if (mode == null) {
        mode = getMetaVal(compo.parent, 'mode', 'x-model-mode');
        if (mode == null) {
            mode = mode_BOTH;
            meta_setVal(mode, 'modelMode', mode);
        }
        if (mode === mode_SERVER_ALL || mode === mode_SERVER_CHILDREN) {
            meta_setVal(compo, 'modelMode', mode_SERVER_ALL);
        }
    }
    if (mode in mods === false) {
        log_error('Unknown model mode: ' + mode);
        return mode_BOTH;
    }
    return mode;
}
;
export function meta_getVal(compo, prop) {
    return getMetaVal(compo, prop);
}
;
export function meta_setVal(compo, prop, val) {
    var proto = typeof compo === 'function'
        ? compo.prototype
        : compo;
    proto.meta = proto.meta == null
        ? CompoMeta.create()
        : obj_create(proto.meta);
    proto.meta[prop] = val;
}
;
// Private
function getMetaVal(compo, prop, attrProp) {
    if (compo == null)
        return null;
    var proto = typeof compo === 'function'
        ? compo.prototype
        : compo;
    var meta = proto.meta;
    if (meta != null) {
        if (meta[prop]) {
            return meta[prop];
        }
    }
    if (attrProp) {
        var attr = proto.attr;
        if (attr && attr[attrProp]) {
            var val = attr[attrProp];
            meta_setVal(compo, prop, val);
            return val;
        }
    }
    var def = META_DEFAULT[prop];
    if (def === void 0) {
        log_error('Unknown meta property: ', prop);
    }
    else {
        meta_setVal(compo, prop, def);
    }
    return def;
}
var CompoMeta = /** @class */ (function () {
    function CompoMeta() {
    }
    CompoMeta.create = function (ctr) {
        var _a;
        var meta = (_a = ctr.meta) !== null && _a !== void 0 ? _a : ctr.$meta;
        if (meta) {
            return meta;
        }
        return Object.create(META_DEFAULT);
    };
    return CompoMeta;
}());
var META_DEFAULT = {
    mode: mode_BOTH,
    modelMode: mode_BOTH,
    attributes: null,
    cache: false
};
var Mode = class_create({
    mode: null,
    constructor: function (mode) {
        this.mode = mode;
    },
    isServer: function () {
        return this.mode === mode_SERVER_ALL || this.mode === mode_SERVER;
    },
    isClient: function () {
        return this.mode === mode_CLIENT;
    }
});

import { obj_getProperty } from '@utils/obj';
var CompoCacheCollection = /** @class */ (function () {
    function CompoCacheCollection(ctr, cache) {
        this.__null = null;
        this.__value = null;
        this.__cacheInfo = null;
        if (cache == null /* obsolete */)
            cache = ctr.cache;
        if (cache == null)
            return;
        this.__cacheInfo = new CompoCache(cache);
    }
    return CompoCacheCollection;
}());
export { CompoCacheCollection };
var CompoCache = /** @class */ (function () {
    function CompoCache(cache) {
        if (typeof cache === 'object') {
            if (cache.byProperty) {
                var prop = cache.byProperty, dot = prop.indexOf('.'), objName = prop.substring(0, dot), obj;
                prop = prop.substring(dot + 1);
                switch (objName) {
                    case 'model':
                    case 'ctx':
                        break;
                    default:
                        console.error('[CompoCache] - property accessor not valid - should be "[model/ctx].[accessor]"');
                        return null;
                }
                this.propObjName = objName;
                this.propAccessor = prop;
            }
        }
        this.expire = cache.expire;
    }
    CompoCache.prototype.getKey = function (model, ctx) {
        if (this.propAccessor == null)
            return '__value';
        var objName = this.propObjName, prop = this.propAccessor;
        var obj, key;
        if ('model' === objName)
            obj = model;
        if ('ctx' === objName)
            obj = ctx;
        key = obj_getProperty(obj, prop);
        if (typeof key === 'undefined')
            return '__value';
        if (key == null)
            return '__null';
        return key;
    };
    return CompoCache;
}());
;

import { __cfg } from '@core/api/config';
import { CompoCacheCollection } from './CompoCacheCollection';
var _lastCtrlID = 0, _lastModelID = 0, _cache = {};
// source ./utils.js
// end:source ./utils.js
// source ./CompoCacheCollection.js
// end:source ./CompoCacheCollection.js
export var Cache = {
    get controllerID() {
        return _lastCtrlID;
    },
    get modelID() {
        return _lastModelID;
    },
    cacheCompo: function (model, ctx, compoName, compo, cache) {
        if (__cfg.allowCache === false)
            return;
        var cached = _cache[compoName];
        if (cached == null) {
            cached = _cache[compoName] = new CompoCacheCollection(compo, cache);
        }
        var cacheInfo = cached.__cacheInfo;
        if (cacheInfo == null)
            return;
        cached[cacheInfo.getKey(model, ctx)] = compo;
        _lastCtrlID = ctx._id;
        _lastModelID = ctx._models._id;
    },
    getCompo: function (model, ctx, compoName, Ctor) {
        if (__cfg.allowCache === false)
            return null;
        var cached = _cache[compoName];
        if (cached == null)
            return null;
        var info = cached.__cacheInfo, compo = cached[info.getKey(model, ctx)];
        // check if cached data is already present, due to async. components
        return compo == null || compo.__cached == null
            ? null
            : compo;
    },
    getCache: function () {
        return _cache;
    }
};

import { Component } from '@compo/exports';
import { builder_build } from '@core/builder/exports';
import { is_Array } from '@utils/is';
import { _document } from '@utils/refs';
export function compo_addChild(ctr, compo) {
    compo_addChildren(ctr, compo);
}
;
export function compo_addChildren(ctr) {
    var compos = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        compos[_i - 1] = arguments[_i];
    }
    var arr = ctr.components;
    if (arr == null) {
        ctr.components = compos;
        return;
    }
    arr.push.apply(arr, compos);
}
;
export function compo_renderElements(nodes, model, ctx, el, ctr, children) {
    if (nodes == null) {
        return null;
    }
    var arr = [];
    builder_build(nodes, model, ctx, el, ctr, arr);
    if (is_Array(children)) {
        children.push.apply(children, arr);
    }
    return arr;
}
;
export function compo_emitInserted(ctr) {
    Component.signal.emitIn(ctr, 'domInsert');
}
;
export function compo_renderPlaceholder(staticCompo, compo, container) {
    var placeholder = staticCompo.placeholder;
    if (placeholder == null) {
        placeholder = _document.createComment('');
        container.appendChild(placeholder);
    }
    compo.placeholder = placeholder;
}
;

import { is_Function } from '@utils/is';
import { coll_indexOf } from '@utils/coll';
import { custom_Attributes } from '@core/custom/exports';
import { builder_build } from './dom/build';
import { BuilderData } from './BuilderData';
export function builder_resumeDelegate(ctr, model, ctx, container, children, finilizeFn) {
    var anchor = BuilderData.document.createComment('');
    container.appendChild(anchor);
    if (children != null) {
        children.push(anchor);
    }
    return function () {
        return _resume(ctr, model, ctx, anchor, children, finilizeFn);
    };
}
;
function _resume(ctr, model, ctx, anchorEl, children, finilize) {
    if (ctr.tagName != null && ctr.tagName !== ctr.compoName) {
        ctr.nodes = {
            tagName: ctr.tagName,
            attr: ctr.attr,
            nodes: ctr.nodes,
            type: 1
        };
    }
    if (ctr.model != null) {
        model = ctr.model;
    }
    var nodes = ctr.nodes, elements = [];
    if (nodes != null) {
        var fragment = document.createDocumentFragment();
        builder_build(nodes, model, ctx, fragment, ctr, elements);
        anchorEl.parentNode.insertBefore(fragment, anchorEl);
    }
    if (children != null && elements.length > 0) {
        var args = [0, 1].concat(elements);
        var i = coll_indexOf(children, anchorEl);
        if (i > -1) {
            args[0] = i;
            children.splice.apply(children, args);
        }
        var parent = ctr.parent;
        while (parent != null) {
            var arr = parent.$ || parent.elements;
            if (arr != null) {
                var i = coll_indexOf(arr, anchorEl);
                if (i === -1) {
                    break;
                }
                args[0] = i;
                arr.splice.apply(arr, args);
            }
            parent = parent.parent;
        }
    }
    // use or override custom attr handlers
    // in Compo.handlers.attr object
    // but only on a component, not a tag ctr
    if (ctr.tagName == null) {
        var attrHandlers = ctr.handlers && ctr.handlers.attr, attrFn, key;
        for (key in ctr.attr) {
            attrFn = null;
            if (attrHandlers && is_Function(attrHandlers[key])) {
                attrFn = attrHandlers[key];
            }
            if (attrFn == null && is_Function(custom_Attributes[key])) {
                attrFn = custom_Attributes[key];
            }
            if (attrFn != null) {
                attrFn(anchorEl, ctr.attr[key], model, ctx, elements[0], ctr);
            }
        }
    }
    if (is_Function(finilize)) {
        finilize.call(ctr, elements, model, ctx, anchorEl.parentNode);
    }
}

export function compo_wrapOnTagName(compo, node) {
    if (compo.tagName == null
        || compo.tagName === node.tagName
        || compo.tagName === compo.compoName)
        return;
    compo.nodes = {
        tagName: compo.tagName,
        attr: compo.attr,
        nodes: compo.nodes,
        type: 1
    };
}
;

import { custom_Tags } from '@core/custom/exports';
import { meta_get, meta_getRenderMode, meta_getModelMode } from '@mask-node/util/meta';
import { obj_create, obj_extend } from '@utils/obj';
import { Cache } from '../../cache/exports';
import { fn_doNothing } from '@utils/fn';
import { compo_addChild } from '@core/util/compo';
import { is_Function } from '@utils/is';
import { builder_setCompoAttributes } from '@core/builder/util';
import { builder_resumeDelegate } from '@core/builder/resume';
import { compo_wrapOnTagName } from '@mask-node/util/compo';
export function build_compoFactory(build, config) {
    return function build_compo(node, model, ctx, container, ctr, children) {
        var compoName = node.compoName || node.tagName, Handler = node.controller || custom_Tags[compoName] || obj_create(node), cache = meta_get(Handler).cache || false;
        if (cache /* unstrict */) {
            var compo = Cache.getCompo(model, ctx, compoName, Handler);
            if (compo != null) {
                if (compo.__cached) {
                    compo.render = fn_doNothing;
                }
                compo_addChild(ctr, compo);
                return compo;
            }
        }
        var compo = _initController(Handler, node, model, ctx, container, ctr), cache = meta_get(compo).cache;
        if (cache /* unstrict */) {
            Cache.cacheCompo(model, ctx, compoName, compo, cache);
        }
        if (compo.compoName == null) {
            compo.compoName = compoName;
        }
        if (compo.model == null) {
            compo.model = model;
        }
        if (compo.nodes == null) {
            compo.nodes = node.nodes;
        }
        if (compo.expression == null) {
            compo.expression = node.expression;
        }
        compo.attr = obj_extend(compo.attr, node.attr);
        compo.parent = ctr;
        var key, fn, attr = compo.attr;
        for (key in attr) {
            fn = attr[key];
            if (is_Function(fn)) {
                attr[key] = fn('attr', model, ctx, container, ctr, key);
            }
        }
        var renderMode = meta_getRenderMode(compo), modelMode = meta_getModelMode(compo);
        if (renderMode.isServer() === false) {
            compo.ID = ++ctx._id;
        }
        if (renderMode.isClient() === true) {
            compo.render = fn_doNothing;
            return compo;
        }
        builder_setCompoAttributes(compo, node, model, ctx, container);
        if (is_Function(compo.renderStart)) {
            compo.renderStart(model, ctx, container);
        }
        compo_addChild(ctr, compo);
        if (compo.async === true) {
            var resume = builder_resumeDelegate(compo, model, ctx, container, children, compo.onRenderEndServer);
            compo.await(resume);
            return compo;
        }
        compo_wrapOnTagName(compo, node);
        if (is_Function(compo.render)) {
            compo.render(model, ctx, container, compo);
        }
        return compo;
    };
    function _initController(Mix, node, model, ctx, el, ctr) {
        if (is_Function(Mix)) {
            return new Mix(node, model, ctx, el, ctr);
        }
        if (is_Function(Mix.__Ctor)) {
            return new Mix.__Ctor(node, model, ctx, el, ctr);
        }
        return Mix;
    }
}

import { BuilderData } from '../BuilderData';
export function build_textFactory(config) {
    var _a;
    var document = (_a = config === null || config === void 0 ? void 0 : config.document) !== null && _a !== void 0 ? _a : BuilderData.document;
    return function build_textNode(node, model, ctx, el, ctr) {
        var content = node.content;
        if (typeof content !== 'function') {
            append_textNode(el, content);
            return;
        }
        var result = content('node', model, ctx, el, ctr, null, node);
        if (typeof result === 'string') {
            append_textNode(el, result);
            return;
        }
        // result is array with some htmlelements
        var text = '';
        var jmax = result.length;
        for (var j = 0; j < jmax; j++) {
            var x = result[j];
            if (typeof x === 'object') {
                // In this casee result[j] should be any HTMLElement
                if (text !== '') {
                    append_textNode(el, text);
                    text = '';
                }
                if (x.nodeType == null) {
                    text += x.toString();
                    continue;
                }
                el.appendChild(x);
                continue;
            }
            text += x;
        }
        if (text !== '') {
            append_textNode(el, text);
        }
    };
    function append_textNode(el, text) {
        el.appendChild(document.createTextNode(text));
    }
    ;
}

import { arr_pushMany } from '@utils/arr';
import { is_ArrayLike, is_Function } from '@utils/is';
import { Dom } from '@core/dom/exports';
import { log_error } from '@core/util/reporters';
import { custom_Statements, custom_Tags, custom_Attributes } from '@core/custom/exports';
import { builder_Ctx } from '../ctx';
import { builder_findAndRegisterCompo } from '../util';
import { build_manyFactory } from './build_many';
import { build_nodeFactory } from './build_node';
import { build_compoFactory } from './build_component';
import { build_textFactory } from './build_textNode';
import { BuilderData } from '../BuilderData';
/**
 * @param {MaskNode} node
 * @param {*} model
 * @param {object} ctx
 * @param {IAppendChild} container
 * @param {object} controller
 * @param {Array} children - @out
 * @returns {IAppendChild} container
 * @memberOf mask
 * @method build
 */
export function builder_buildFactory(config) {
    if (config === null || config === void 0 ? void 0 : config.document) {
        BuilderData.document = config.document;
    }
    var build_node = build_nodeFactory(config);
    var build_many = build_manyFactory(build);
    var build_compo = build_compoFactory(build, config);
    var build_text = build_textFactory(config);
    var document = BuilderData.document;
    function build(node, model_, ctx, container_, ctr_, children_) {
        if (node == null)
            return container;
        var ctr = ctr_, model = model_, children = children_, container = container_, type = node.type, elements, key, value;
        if (ctr == null)
            ctr = new Dom.Component();
        if (ctx == null)
            ctx = new builder_Ctx;
        if (type == null) {
            // in case if node was added manually, but type was not set
            if (is_ArrayLike(node)) {
                // Dom.FRAGMENT
                type = 10;
            }
            else if (node.tagName != null) {
                type = 1;
            }
            else if (node.content != null) {
                type = 2;
            }
        }
        var tagName = node.tagName;
        if (tagName === 'else')
            return container;
        if (type === 1 && custom_Tags[tagName] != null) {
            // check if custom ctr exists
            type = 4;
        }
        if (type === 1 && custom_Statements[tagName] != null) {
            // check if custom statement exists
            type = 15;
        }
        if (container == null && type !== 1) {
            container = document.createDocumentFragment();
        }
        // Dom.TEXTNODE
        if (type === 2) {
            build_text(node, model, ctx, container, ctr);
            return container;
        }
        // Dom.SET
        if (type === 10) {
            build_many(node, model, ctx, container, ctr, children);
            return container;
        }
        // Dom.STATEMENT
        if (type === 15) {
            var Handler = custom_Statements[tagName];
            if (Handler == null) {
                if (custom_Tags[tagName] != null || builder_findAndRegisterCompo(ctr, tagName)) {
                    // Dom.COMPONENT
                    type = 4;
                }
                else {
                    log_error('<mask: statement is undefined>', tagName);
                    return container;
                }
            }
            if (type === 15) {
                Handler.render(node, model, ctx, container, ctr, children);
                return container;
            }
        }
        // Dom.NODE
        if (type === 1) {
            container = build_node(node, model, ctx, container, ctr, children);
            children = null;
        }
        // Dom.COMPONENT
        if (type === 4) {
            ctr = build_compo(node, model, ctx, container, ctr, children);
            if (ctr == null) {
                return container;
            }
            elements = [];
            node = ctr;
            if (ctr.model !== model && ctr.model != null) {
                model = ctr.model;
            }
        }
        var nodes = node.nodes;
        if (nodes != null) {
            if (children != null && elements == null) {
                elements = children;
            }
            if (is_ArrayLike(nodes)) {
                build_many(nodes, model, ctx, container, ctr, elements);
            }
            else {
                build(nodes, model, ctx, container, ctr, elements);
            }
        }
        if (type === 4) {
            // use or override custom attr handlers
            // in Compo.handlers.attr object
            // but only on a component, not a tag ctr
            if (node.tagName == null) {
                var attrHandlers = node.handlers && node.handlers.attr, attrFn, val, key;
                for (key in node.attr) {
                    val = node.attr[key];
                    if (val == null)
                        continue;
                    attrFn = null;
                    if (attrHandlers != null && is_Function(attrHandlers[key]))
                        attrFn = attrHandlers[key];
                    if (attrFn == null && custom_Attributes[key] != null)
                        attrFn = custom_Attributes[key];
                    if (attrFn != null)
                        attrFn(node, val, model, ctx, elements[0], ctr);
                }
            }
            if (is_Function(node.renderEnd))
                node.renderEnd(elements, model, ctx, container);
        }
        if (children != null && elements != null && children !== elements)
            arr_pushMany(children, elements);
        return container;
    }
    return build;
}
;

import { Dom } from '@core/dom/exports';
import { obj_extend } from '@utils/obj';
export var DomB = obj_extend(Dom, {
    DOCTYPE: 11,
    UTILNODE: 12
});

import { meta_getModelMode } from '@mask-node/util/meta';
import { is_Function } from '@utils/is';
import { class_create } from '@utils/class';
export var builder_CtxModels = class_create({
    constructor: function (model, startIndex) {
        this._models = null;
        this._id = startIndex || 0;
        this.append(model);
    },
    append: function (model) {
        return add(this, model);
    },
    tryAppend: function (ctr) {
        if (meta_getModelMode(ctr).isServer()) {
            return -1;
        }
        if (ctr.modelRef == null) {
            return add(this, ctr.model);
        }
        var parent = ctr.parent;
        while (parent != null) {
            if (meta_getModelMode(parent).isServer()) {
                return -1;
            }
            parent = parent.parent;
        }
        var ref = '$ref:' + ctr.modelRef;
        return add(this, ref);
    },
    stringify: function () {
        return stringify(this._models);
    }
});
// private
function add(modelBuilder, model) {
    if (model == null)
        return -1;
    if (modelBuilder._models == null) {
        modelBuilder._models = {};
    }
    var id = 'm' + (++modelBuilder._id);
    modelBuilder._models[id] = model;
    return id;
}
var stringify;
(function () {
    var fn = typeof Class !== 'undefined' && is_Function(Class.stringify)
        ? Class.stringify
        : JSON.stringify;
    stringify = function (models) {
        return models == null ? null : fn(models);
    };
}());

import { __cfg } from '@core/api/config';
export function path_getDir(path) {
    return path.substring(0, path.lastIndexOf('/') + 1);
}
export function path_getFile(path) {
    path = path
        .replace('file://', '')
        .replace(/\\/g, '/')
        .replace(/\?[^\n]+$/, '');
    if (/^\/\w+:\/[^\/]/i.test(path)) {
        // win32 drive
        return path.substring(1);
    }
    return path;
}
export function path_getExtension(path) {
    var query = path.indexOf('?');
    if (query !== -1) {
        path = path.substring(0, query);
    }
    var match = rgx_EXT.exec(path);
    return match == null ? '' : match[1];
}
export function path_fromPrfx(path, prefixes) {
    var i = path.indexOf('/');
    if (i === -1)
        i = path.length;
    var prfx = path.substring(1, i);
    var sfx = path.substring(i + 1);
    var route = prefixes[prfx];
    if (route == null) {
        return null;
    }
    if (route.indexOf('{') === 1)
        return path_combine(route, sfx);
    var routeArr = route.split('{'), sfxArr = sfx.split('/'), sfxArrL = sfxArr.length, imax = routeArr.length, i = 0;
    while (++i < imax) {
        var x = routeArr[i];
        var end = x.indexOf('}');
        var num = x.substring(0, end) | 0;
        var y = num < sfxArrL ? sfxArr[num] : sfxArr[sfxArrL - 1];
        if (i === imax - 1 && i < sfxArr.length) {
            y = path_combine(y, sfxArr.slice(i).join('/'));
        }
        routeArr[i] = (y || '') + x.substring(end + 1);
    }
    return path_combine.apply(null, routeArr);
}
export function path_appendQuery(path, key, val) {
    var conjunctor = path.indexOf('?') === -1 ? '?' : '&';
    return path + conjunctor + key + '=' + val;
}
export var path_resolveCurrent = (function () {
    var current_;
    //#if (NODE)
    return function () {
        if (current_ != null)
            return current_;
        return (current_ = path_win32Normalize(process.cwd()));
    };
    //#endif
})();
export var path_resolveRoot = (function () {
    var root_;
})();
export function path_normalize(path) {
    var path_ = path
        .replace(/\\/g, '/')
        // remove double slashes, but not near protocol
        .replace(/([^:\/])\/{2,}/g, '$1/')
        // './xx' to relative string
        .replace(/^\.\//, '')
        // join 'xx/./xx'
        .replace(/\/\.\//g, '/');
    return path_collapse(path_);
}
export function path_resolveUrl(path, base) {
    var url = path_normalize(path);
    if (path_isRelative(url)) {
        return path_normalize(path_combine(base || path_resolveCurrent(), url));
    }
    if (rgx_PROTOCOL.test(url))
        return url;
    if (url.charCodeAt(0) === 47 /*/*/) {
        if (__cfg.base) {
            return path_combine(__cfg.base, url);
        }
    }
    return url;
}
export function path_isRelative(path) {
    var c = path.charCodeAt(0);
    switch (c) {
        case 46: /* . */
            return true;
        case 47: /* / */
            return false;
    }
    return rgx_PROTOCOL.test(path) === false;
}
export function path_toRelative(path, anchor, base) {
    var path_ = path_resolveUrl(path_normalize(path), base), absolute_ = path_resolveUrl(path_normalize(anchor), base);
    if (path_getExtension(absolute_) !== '') {
        absolute_ = path_getDir(absolute_);
    }
    absolute_ = path_combine(absolute_, '/');
    if (path_.toUpperCase().indexOf(absolute_.toUpperCase()) === 0) {
        return path_.substring(absolute_.length);
    }
    return path;
}
export function path_combine(a, b, c, d, e) {
    var out = '', imax = arguments.length, i = -1, x;
    while (++i < imax) {
        x = arguments[i];
        if (!x)
            continue;
        x = path_normalize(x);
        if (out === '') {
            out = x;
            continue;
        }
        if (out[out.length - 1] !== '/') {
            out += '/';
        }
        if (x[0] === '/') {
            x = x.substring(1);
        }
        out += x;
    }
    return path_collapse(out);
}
//#if (NODE)
export var path_toLocalFile = (function () {
    var _cwd;
    function cwd() {
        return _cwd || (_cwd = path_normalize(process.cwd()));
    }
    return function (path) {
        path = path_normalize(path);
        if (path_isRelative(path)) {
            path = '/' + path;
        }
        if (path.charCodeAt(0) === 47 /*/*/) {
            return path_combine(cwd(), path);
        }
        if (path.indexOf('file://') === 0) {
            path = path.replace('file://', '');
        }
        if (/^\/\w+:\//.test(path)) {
            path = path.substring(1);
        }
        return path;
    };
})();
//#endif
var rgx_PROTOCOL = /^[\w\-]{2,}:\/\//i, rgx_SUB_DIR = /[^\/\.]+\/\.\.\//, rgx_FILENAME = /\/[^\/]+\.\w+(\?.*)?(#.*)?$/, rgx_EXT = /\.(\w+)$/, rgx_win32Drive = /(^\/?\w{1}:)(\/|$)/;
function path_win32Normalize(path) {
    path = path_normalize(path);
    if (path.substring(0, 5) === 'file:')
        return path;
    return 'file://' + path;
}
function path_collapse(url_) {
    var url = url_;
    while (rgx_SUB_DIR.test(url)) {
        url = url.replace(rgx_SUB_DIR, '');
    }
    return url;
}
function path_ensureTrailingSlash(path) {
    if (path.charCodeAt(path.length - 1) === 47 /* / */)
        return path;
    return path + '/';
}
function path_sliceFilename(path) {
    return path_ensureTrailingSlash(path.replace(rgx_FILENAME, ''));
}

import { class_create } from '@utils/class';
import { path_isRelative, path_toRelative, path_resolveCurrent } from '@core/util/path';
import { mask_stringify } from '@core/parser/exports';
export var builder_CtxModules = class_create({
    constructor: function () {
        this._modules = [];
    },
    add: function (module, owner) {
        if (module == null || module.error != null) {
            return;
        }
        this.push(module, owner);
        var imports = module.imports;
        if (imports == null) {
            return;
        }
        var imax = imports.length, i = -1;
        while (++i < imax) {
            this.add(imports[i].module, module);
        }
    },
    push: function (module, owner) {
        var arr = this._modules;
        var i = arr.indexOf(module);
        if (i !== -1) {
            if (owner != null) {
                var i_owner = arr.indexOf(owner);
                if (i > i_owner) {
                    // move close to parent
                    arr.splice(i, 1);
                    arr.splice(i_owner, 0, module);
                }
            }
            return;
        }
        arr.unshift(module);
    },
    stringify: function (opts) {
        var modules = this._modules, arr = [], imax = modules.length, i = -1, x;
        while (++i < imax) {
            x = modules[i];
            if (x.type === 'mask') {
                arr.push(createModuleNode(x));
            }
        }
        return mask_stringify(arr, opts);
    }
});
function createModuleNode(module) {
    var node = new mask.Dom.Node('module');
    var path = path_toRelative(module.path, path_resolveCurrent());
    if (path_isRelative(path)) {
        path = '/' + path;
    }
    node.attr = {
        path: path
    };
    node.nodes = module.source;
    return node;
}

var CommentNode = /** @class */ (function () {
    function CommentNode(textContent) {
        this.nextSibling = null;
        this.parentNode = null;
        this.textContent = '';
        var str = textContent;
        if (str == null) {
            return;
        }
        if (_isComment(str)) {
            str = _stripComment(str);
        }
        this.textContent = str.replace(/\-\->/g, '--&gt;');
    }
    CommentNode.prototype.toString = function () {
        if (this.textContent === '')
            return '';
        return '<!--' + this.textContent + '-->';
    };
    return CommentNode;
}());
export { CommentNode };
;
function _isComment(txt) {
    if (txt.charCodeAt(0) !== 60 /*<*/
        && txt.charCodeAt(1) !== 33 /*!*/
        && txt.charCodeAt(1) !== 45 /*-*/
        && txt.charCodeAt(2) !== 45 /*-*/)
        return false;
    var l = txt.length;
    if (txt.charCodeAt(--l) !== 62 /*>*/
        && txt.charCodeAt(--l) !== 45 /*-*/
        && txt.charCodeAt(--l) !== 45 /*-*/)
        return false;
    return true;
}
function _stripComment(txt) {
    return txt.slice(4, -3);
}

var sel_key_UP = 'parentNode', sel_key_CHILD = 'firstChild', sel_key_ATTR = 'attributes';
export function selector_parse(selector, direction) {
    if (typeof selector === 'object') {
        // or null
        return selector;
    }
    var key, prop, nextKey, filters, _key, _prop, _selector;
    var index = 0, length = selector.length, c, end, matcher, eq, slicer;
    if (direction === 'up') {
        nextKey = sel_key_UP;
    }
    else {
        nextKey = sel_key_CHILD;
    }
    while (index < length) {
        c = selector.charCodeAt(index);
        if (c < 33) {
            continue;
        }
        end = selector_moveToBreak(selector, index + 1, length);
        if (c === 46 /*.*/) {
            _key = 'class';
            _prop = sel_key_ATTR;
            _selector = sel_hasClassDelegate(selector.substring(index + 1, end));
        }
        else if (c === 35 /*#*/) {
            _key = 'id';
            _prop = sel_key_ATTR;
            _selector = selector.substring(index + 1, end);
        }
        else if (c === 91 /*[*/) {
            eq = selector.indexOf('=', index);
            //if DEBUG
            eq === -1 && console.error('Attribute Selector: should contain "="');
            // endif
            _prop = sel_key_ATTR;
            _key = selector.substring(index + 1, eq);
            //slice out quotes if any
            c = selector.charCodeAt(eq + 1);
            slicer = c === 34 || c === 39 ? 2 : 1;
            _selector = selector.substring(eq + slicer, end - slicer + 1);
            // increment, as cursor is on closed ']'
            end++;
        }
        else {
            _prop = null;
            _key = 'tagName';
            _selector = selector
                .substring(index, end)
                .toUpperCase();
        }
        index = end;
        if (matcher == null) {
            matcher = {
                key: _key,
                prop: _prop,
                selector: _selector,
                nextKey: nextKey,
                filters: null
            };
            continue;
        }
        if (matcher.filters == null) {
            matcher.filters = [];
        }
        matcher.filters.push({
            key: _key,
            selector: _selector,
            prop: _prop
        });
    }
    return matcher;
}
function sel_hasClassDelegate(matchClass) {
    return function (className) {
        return sel_classIndex(className, matchClass) !== -1;
    };
}
// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
export function sel_classIndex(className, matchClass, index) {
    if (className == null)
        return -1;
    if (index == null)
        index = 0;
    index = className.indexOf(matchClass, index);
    if (index === -1)
        return -1;
    if (index > 0 && className.charCodeAt(index - 1) > 32)
        return sel_classIndex(className, matchClass, index + 1);
    var class_Length = className.length, match_Length = matchClass.length;
    if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
        return sel_classIndex(className, matchClass, index + 1);
    return index;
}
function selector_moveToBreak(selector, index, length) {
    var c, isInQuote = false, isEscaped = false;
    while (index < length) {
        c = selector.charCodeAt(index);
        if (c === 34 || c === 39) {
            // '"
            isInQuote = !isInQuote;
        }
        if (c === 92) {
            // [\]
            isEscaped = !isEscaped;
        }
        if (c === 46 || c === 35 || c === 91 || c === 93 || c < 33) {
            // .#[]
            if (isInQuote !== true && isEscaped !== true) {
                break;
            }
        }
        index++;
    }
    return index;
}
export function selector_match(node, selector) {
    if (typeof selector === 'string') {
        selector = selector_parse(selector);
    }
    var obj = selector.prop ? node[selector.prop] : node, matched = false;
    if (obj == null) {
        return false;
    }
    if (typeof selector.selector === 'function') {
        matched = selector.selector(obj[selector.key]);
    }
    else if (selector.selector.test != null) {
        if (selector.selector.test(obj[selector.key])) {
            matched = true;
        }
    }
    else if (obj[selector.key] === selector.selector) {
        matched = true;
    }
    if (matched === true && selector.filters != null) {
        for (var i = 0, x, imax = selector.filters.length; i < imax; i++) {
            x = selector.filters[i];
            if (selector_match(node, x) === false) {
                return false;
            }
        }
    }
    return matched;
}

import { DomB } from './DomB';
import { selector_parse, selector_match } from './jq/util/selector';
import { class_create } from '@utils/class';
export var NodeBase = class_create({
    parentNode: null,
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    nodeType: null,
    get length() {
        var count = 0, el = this.firstChild;
        while (el != null) {
            count++;
            el = el.nextSibling;
        }
        return count;
    },
    get childNodes() {
        var array = [], el = this.firstChild;
        while (el != null) {
            array.push(el);
            el = el.nextSibling;
        }
        return array;
    },
    get ownerDocument() {
        return new OwnerDocument(this);
    },
    querySelector: function (selector) {
        var matcher = typeof selector === 'string'
            ? selector_parse(selector, null)
            : selector;
        var el = this.firstChild, matched;
        for (; el != null; el = el.nextSibling) {
            if (selector_match(el, matcher))
                return el;
        }
        if (el != null)
            return el;
        el = this.firstChild;
        for (; el != null; el = el.nextSibling) {
            if (typeof el.querySelector === 'function') {
                matched = el.querySelector(matcher);
                if (matched != null)
                    return matched;
            }
        }
        return null;
    },
    appendChild: function (child) {
        if (child == null)
            return child;
        if (child.nodeType === DomB.FRAGMENT) {
            var fragment = child;
            if (fragment.firstChild == null)
                return fragment;
            var el = fragment.firstChild;
            while (true) {
                el.parentNode = this;
                if (el.nextSibling == null)
                    break;
                el = el.nextSibling;
            }
            if (this.firstChild == null) {
                this.firstChild = fragment.firstChild;
            }
            else {
                fragment.lastChild.nextSibling = fragment.firstChild;
            }
            fragment.lastChild = fragment.lastChild;
            return fragment;
        }
        if (this.firstChild == null) {
            this.firstChild = this.lastChild = child;
        }
        else {
            this.lastChild.nextSibling = child;
            this.lastChild = child;
        }
        child.parentNode = this;
        return child;
    },
    insertBefore: function (child, anchor) {
        var prev = this.firstChild;
        if (prev !== anchor) {
            while (prev != null && prev.nextSibling !== anchor) {
                prev = prev.nextSibling;
            }
        }
        if (prev == null)
            // set tail
            return this.appendChild(child);
        if (child.nodeType === DomB.FRAGMENT) {
            var fragment = child;
            // set parentNode
            var el = fragment.firstChild;
            if (el == null)
                // empty
                return fragment;
            while (el != null) {
                el.parentNode = this;
                el = el.nextSibling;
            }
            // set to head
            if (prev === anchor && prev === this.firstChild) {
                this.firstChild = fragment.firstChild;
                fragment.lastChild.nextSibling = prev;
                return fragment;
            }
            // set middle
            prev.nextSibling = fragment.firstChild;
            fragment.lastChild.nextSibling = anchor;
            return fragment;
        }
        child.parentNode = this;
        if (prev === anchor && prev === this.firstChild) {
            // set head
            this.firstChild = child;
            child.nextSibling = prev;
            return child;
        }
        // set middle
        prev.nextSibling = child;
        child.nextSibling = anchor;
        return child;
    },
    removeChild: function (node) {
        if (node == null) {
            return;
        }
        var child = this.firstChild, prev = null;
        while (child != null && child !== node) {
            prev = child;
            child = child.nextSibling;
        }
        if (child == null) {
            return;
        }
        if (prev == null) {
            // is first child;
            this.firstChild = child.nextSibling;
        }
        else {
            prev.nextSibling = child.nextSibling;
        }
        if (this.lastChild === child) {
            this.lastChild = prev;
        }
        node.nextSibling = null;
        node.parentNode = null;
    }
});
var OwnerDocument = class_create({
    _el: null,
    _document: null,
    _body: null,
    constructor: function (el) {
        this._el = el;
    },
    get body() {
        if (this._body != null) {
            return this._body;
        }
        var cursor = this._el, el;
        while (cursor != null) {
            if (cursor.nodeType === DomB.NODE) {
                el = cursor;
            }
            if (cursor.tagName === 'BODY' || cursor.parentNode == null) {
                return (this._body = el);
            }
            cursor = cursor.parentNode;
        }
        return null;
    }
});

import { is_Array } from '@utils/is';
import { log_error } from '@core/util/reporters';
var seperator_CODE = 30;
var seperator_CHAR = String.fromCharCode(seperator_CODE);
export var Serializer;
(function (Serializer) {
    function resolve(info) {
        switch (info.type) {
            case 't':
                return ComponentSerializer;
            case 'a':
                return AttributeSerializer;
            default:
                return Serializer;
        }
    }
    Serializer.resolve = resolve;
    function serialize(json) {
        var string = '';
        for (var key in json) {
            if (key === 'ID') {
                continue;
            }
            var val = json[key];
            if (val == null) {
                continue;
            }
            string += key
                + ':'
                + JSON_stringify(json[key])
                + seperator_CHAR
                + ' ';
        }
        return string;
    }
    Serializer.serialize = serialize;
    function deserializeSingleProp(json, str, i) {
        var colon = str.indexOf(':'), key = str.substring(0, colon), value = str.substring(colon + 1);
        if (key === 'attr' || key === 'scope') {
            value = JSON.parse(value);
        }
        json[key] = value;
    }
    Serializer.deserializeSingleProp = deserializeSingleProp;
    function serializeProps_(props, json) {
        var arr = new Array(props.count), keys = props.keys;
        for (var key in json) {
            if (key === 'ID') {
                continue;
            }
            var keyInfo = keys[key];
            if (keyInfo === void 0) {
                log_error('Unsupported Meta key:', key);
                continue;
            }
            var val = json[key];
            arr[keyInfo.index] = stringifyValueByKeyInfo(val, keyInfo);
        }
        var imax = arr.length, i = -1, lastPos = 0;
        while (++i < imax) {
            var val = arr[i];
            if (val == null) {
                val = arr[i] = '';
            }
            if (val !== '') {
                lastPos = i;
            }
        }
        if (lastPos < arr.length - 1) {
            arr = arr.slice(0, lastPos + 1);
        }
        return arr.join(seperator_CHAR + ' ');
    }
    Serializer.serializeProps_ = serializeProps_;
    function deserializeSingleProp_(json, props, str, i) {
        var arr = props.keysArr;
        if (i >= arr.length) {
            log_error('Keys count missmatch');
            return;
        }
        var keyInfo = arr[i];
        var value = parseValueByKeyInfo(str, keyInfo);
        json[keyInfo.name] = value;
    }
    Serializer.deserializeSingleProp_ = deserializeSingleProp_;
    function prepairProps_(keys) {
        var props = {
            count: keys.length,
            keys: {},
            keysArr: keys,
        }, imax = keys.length, i = -1;
        while (++i < imax) {
            var keyInfo = keys[i];
            keyInfo.index = i;
            props.keys[keyInfo.name] = keyInfo;
        }
        ;
        return props;
    }
    Serializer.prepairProps_ = prepairProps_;
    function parseValueByKeyInfo(str, keyInfo) {
        if (str == null || str === '') {
            if (keyInfo.default) {
                return keyInfo.default();
            }
            return null;
        }
        switch (keyInfo.type) {
            case 'string':
            case 'mask':
                return str;
            case 'number':
                return +str;
            default:
                return JSON.parse(str);
        }
    }
    function stringifyValueByKeyInfo(val, keyInfo) {
        if (val == null) {
            return '';
        }
        var result = JSON_stringify(val);
        if (keyInfo.type === 'object' && result === '{}') {
            return '';
        }
        if (keyInfo.type === 'array' && result === '[]') {
            return '';
        }
        return result;
    }
})(Serializer || (Serializer = {}));
export var ComponentSerializer;
(function (ComponentSerializer) {
    var keys = [
        { name: 'compoName', type: 'string' },
        { name: 'attr', type: 'object', 'default': function () { return {}; } },
        { name: 'expression', type: 'string' },
        { name: 'nodes', type: 'mask' },
        { name: 'scope', type: 'object' },
        { name: 'modelID', type: 'string' }
    ];
    var props = Serializer.prepairProps_(keys);
    function serialize(json, info) {
        return Serializer.serializeProps_(props, json);
    }
    ComponentSerializer.serialize = serialize;
    function deserialize(str) {
        return Serializer.deserializeProps_(props, str);
    }
    ComponentSerializer.deserialize = deserialize;
    function deserializeSingleProp(json, str, i) {
        return Serializer.deserializeSingleProp_(json, props, str, i);
    }
    ComponentSerializer.deserializeSingleProp = deserializeSingleProp;
    function defaultProperties(json, index) {
        var arr = props.keysArr, imax = arr.length, i = index - 1;
        while (++i < imax) {
            var keyInfo = arr[i];
            if (keyInfo.default) {
                json[keyInfo.name] = keyInfo.default();
            }
        }
    }
    ComponentSerializer.defaultProperties = defaultProperties;
})(ComponentSerializer || (ComponentSerializer = {}));
export var AttributeSerializer;
(function (AttributeSerializer) {
    var keys = [
        { name: 'name', type: 'string' },
        { name: 'value', type: 'string' }
    ];
    var props = Serializer.prepairProps_(keys);
    function serialize(json, info) {
        return Serializer.serializeProps_(props, json);
    }
    AttributeSerializer.serialize = serialize;
    function deserialize(str) {
        return Serializer.deserializeProps_(props, str);
    }
    AttributeSerializer.deserialize = deserialize;
    function deserializeSingleProp(json, str, i) {
        return Serializer.deserializeSingleProp_(json, props, str, i);
    }
    AttributeSerializer.deserializeSingleProp = deserializeSingleProp;
})(AttributeSerializer || (AttributeSerializer = {}));
function JSON_stringify(mix) {
    if (mix == null)
        return 'null';
    if (typeof mix !== 'object') {
        // string | number
        return mix;
    }
    if (is_Array(mix) === false) {
        // JSON.stringify does not handle the prototype chain
        mix = _obj_flatten(mix);
    }
    return JSON.stringify(mix);
}
function _obj_flatten(obj) {
    var result = Object.create(obj);
    for (var key in result) {
        result[key] = result[key];
    }
    return result;
}

import { Serializer } from './MetaSerializer';
var seperator_CODE = 30;
var seperator_CHAR = String.fromCharCode(seperator_CODE);
export var MetaParser;
(function (MetaParser) {
    var _i, _imax, _str;
    function parse(string) {
        _i = 0;
        _str = string;
        _imax = string.length;
        var c = string.charCodeAt(_i), isEnd = false, isSingle = false;
        if (c === 47 /* / */) {
            isEnd = true;
            c = string.charCodeAt(++_i);
        }
        if (string.charCodeAt(_imax - 1) === 47 /* / */) {
            isSingle = true;
            _imax--;
        }
        var json = {
            ID: null,
            end: isEnd,
            single: isSingle,
            type: string[_i]
        };
        c = string.charCodeAt(++_i);
        if (c === 35 /*#*/) {
            ++_i;
            json.ID = parseInt(consumeNext(), 10);
        }
        var serializer = Serializer.resolve(json), propertyParserFn = serializer.deserializeSingleProp, propertyDefaultsFn = serializer.defaultProperties, index = 0;
        while (_i < _imax) {
            var part = consumeNext();
            propertyParserFn(json, part, index++);
        }
        if (propertyDefaultsFn != null) {
            propertyDefaultsFn(json, index);
        }
        return json;
    }
    MetaParser.parse = parse;
    ;
    var seperator = seperator_CHAR + ' ', seperatorLength = seperator.length;
    function consumeNext() {
        var start = _i, end = _str.indexOf(seperator, start);
        if (end === -1) {
            end = _imax;
        }
        _i = end + seperatorLength;
        return _str.substring(start, end);
    }
})(MetaParser || (MetaParser = {}));

import { mode_SERVER, mode_SERVER_ALL } from '@mask-node/const';
import { HtmlDom } from '@mask-node/html-dom/exports';
import { MetaParser } from './MetaParser';
import { Serializer } from './MetaSerializer';
var seperator_CODE = 30;
var seperator_CHAR = String.fromCharCode(seperator_CODE);
export var Meta = {
    stringify: function (json, info) {
        switch (info.mode) {
            case mode_SERVER:
            case mode_SERVER_ALL:
                return '';
        }
        var type = info.type, isSingle = info.single, string = type;
        if (json.ID) {
            string += '#' + json.ID;
        }
        string += seperator_CHAR + ' ';
        string += Serializer.resolve(info).serialize(json);
        if (isSingle) {
            string += '/';
        }
        return new HtmlDom.Comment(string).toString();
    },
    close: function (json, info) {
        if (info.single === true) {
            return '';
        }
        switch (info.mode) {
            case mode_SERVER:
            case mode_SERVER_ALL:
                return '';
        }
        var string = '/' + info.type + (json.ID ? '#' + json.ID : '');
        return new HtmlDom.Comment(string).toString();
    },
    parse: function (str) {
        return MetaParser.parse(str);
    }
};

import { class_create } from '@utils/class';
export var HtmlStream = class_create({
    string: '',
    indent: 0,
    indentStr: '',
    minify: false,
    opts: null,
    ast: null,
    constructor: function (opts) {
        this.opts = opts;
        this.minify = 'prettyHtml' in opts ? opts.prettyHtml !== true : true;
        this.indent = 0;
        this.indentStr = doindent(opts.indent || 4, opts.indentChar || ' ');
    },
    toString: function () {
        return this.string;
    },
    process: function (node) {
        if (node == null) {
            return this;
        }
        if (node.write) {
            node.write(this);
            return this;
        }
        this.write(node.toString());
        return this;
    },
    newline: function () {
        if (this.minify === false) {
            this.string += '\n';
        }
        return this;
    },
    openBlock: function (c) {
        if (c != null) {
            this.write(c);
            this.newline();
        }
        this.indent++;
        return this;
    },
    closeBlock: function (c) {
        this.indent--;
        if (c != null) {
            this.newline();
            this.write(c);
        }
        return this;
    },
    write: function (str) {
        if (str == null) {
            return this;
        }
        if (this.minify === true) {
            this.string += str;
            return this;
        }
        var prfx = doindent(this.indent, this.indentStr);
        this.string += str.replace(/^/gm, prfx);
        return this;
    },
    print: function (str) {
        this.string += str;
    }
});
export var HtmlStreamPipe = class_create({
    constructor: function (innerStream) {
        this.innerStream = innerStream;
        this.stream = new HtmlStream(innerStream);
    },
    toString: function () {
        return this.stream.toString();
    }
});
var Proto = HtmlStream.prototype;
for (var key in Proto) {
    if (key === 'toString') {
        continue;
    }
    var fn = Proto[key];
    if (typeof fn === 'function') {
        HtmlStreamPipe.prototype[key] = delegateToStreams(fn);
    }
}
function delegateToStreams(fn) {
    return function () {
        var streamA = this.innerStream, streamB = this.stream;
        fn.apply(streamA, arguments);
        fn.apply(streamB, arguments);
        return this;
    };
}
function doindent(count, c) {
    var output = '';
    while (count--) {
        output += c;
    }
    return output;
}

import { DomB } from './DomB';
import { NodeBase } from './NodeBase';
import { class_createEx } from '@utils/class';
import { meta_getModelMode, meta_get } from '@mask-node/util/meta';
import { mask_stringify } from '@core/parser/exports';
import { mode_CLIENT } from '@mask-node/const';
import { Meta } from '@mask-node/helper/Meta';
import { is_Function } from '@utils/is';
import { HtmlStreamPipe } from './util/HtmlStream';
export var ComponentNode = class_createEx(NodeBase, {
    nodeType: DomB.COMPONENT,
    compoName: null,
    compo: null,
    node: null,
    instance: null,
    components: null,
    ID: null,
    modelID: null,
    constructor: function (node, model, ctx, container, ctr) {
        this.node = node;
        this.compoName = node.compoName || node.tagName;
    },
    setComponent: function (compo, model, ctx) {
        this.ID = compo.ID;
        this.compo = compo;
        this.setModelId_(compo, model, ctx);
    },
    setModelId_: function (compo, model, ctx) {
        if (meta_getModelMode(compo).isServer())
            return;
        if (compo.modelRef) {
            var id = ctx._models.tryAppend(compo);
            if (id !== -1) {
                this.modelID = id;
            }
            return;
        }
        if (compo.model == null || compo.model === model) {
            return;
        }
        var id = ctx._models.tryAppend(compo);
        if (id !== -1) {
            this.modelID = id;
        }
    },
    initModelID: function (ctx, parentsModel) {
        var compo = this.compo;
        if (meta_getModelMode(compo).isServer())
            return;
        if (compo.modelRef) {
            var id = ctx._models.tryAppend(compo);
            if (id !== -1) {
                this.modelID = id;
            }
            return;
        }
        if (compo.model == null || compo.model === parentsModel) {
            return;
        }
        var id = ctx._models.tryAppend(compo);
        if (id !== -1) {
            this.modelID = id;
        }
    },
    toString: function () {
        var compo = this.compo;
        if (compo.__cached != null) {
            return compo.__cached;
        }
        var meta = meta_get(compo);
        if (meta.mode === mode_CLIENT) {
            var json_1 = {
                mask: mask_stringify(this.node, 0)
            };
            var info_1 = {
                type: 'r',
                single: true,
            };
            var string_1 = Meta.stringify(json_1, info_1);
            if (meta.cache /* unstrict */) {
                compo.__cached = string_1;
            }
            return string_1;
        }
        var json = {
            ID: this.ID,
            modelID: this.modelID,
            compoName: compo.compoName,
            attr: compo.attr,
            expression: compo.expression,
            nodes: _serializeNodes(meta, this),
            scope: _serializeScope(meta, compo)
        }, info = {
            single: this.firstChild == null,
            type: 't',
            mode: meta.mode
        };
        var string = Meta.stringify(json, info);
        if (compo.toHtml != null) {
            string += compo.toHtml();
        }
        else {
            string += _stringifyChildren(this);
        }
        if (meta.mode !== mode_CLIENT) {
            string += Meta.close(json, info);
        }
        if (meta.cache) {
            compo.__cached = string;
        }
        return string;
    },
    write: function (stream) {
        var compo = this.compo;
        var cache = compo.__cached;
        if (typeof cache === 'string') {
            stream.write(cache);
            return;
        }
        var streamCached = null;
        var meta = meta_get(compo);
        if (meta.cache /* unstrict */) {
            streamCached = new HtmlStreamPipe(stream);
            stream = streamCached;
        }
        if (meta.mode === mode_CLIENT) {
            var json_2 = {
                mask: mask_stringify(this.node, stream.minify ? 0 : 4)
            };
            var info_2 = {
                type: 'r',
                single: true,
            };
            stream.write(Meta.stringify(json_2, info_2));
            if (streamCached != null) {
                compo.__cached = streamCached.toString();
            }
            return;
        }
        var json = {
            ID: this.ID,
            modelID: this.modelID,
            compoName: compo.compoName,
            attr: compo.attr,
            expression: compo.expression,
            nodes: _serializeNodes(meta, this),
            scope: _serializeScope(meta, compo)
        }, info = {
            single: this.firstChild == null && compo.toHtml == null,
            type: 't',
            mode: meta.mode
        };
        var compoOpen = Meta.stringify(json, info);
        if (compoOpen) {
            stream.openBlock(compoOpen);
        }
        if (compo.toHtml != null) {
            stream.write(compo.toHtml());
        }
        else {
            _stringifyChildrenStream(this, stream);
        }
        var compoClose = Meta.close(json, info);
        if (compoClose) {
            stream.closeBlock(compoClose);
        }
        if (streamCached != null) {
            compo.__cached = streamCached.toString();
        }
    }
});
function _stringifyChildren(compoEl) {
    var el = compoEl.firstChild, str = '';
    while (el != null) {
        str += el.toString();
        el = el.nextSibling;
    }
    return str;
}
function _stringifyChildrenStream(compoEl, stream) {
    var el = compoEl.firstChild;
    while (el != null) {
        stream.process(el);
        el = el.nextSibling;
        if (el != null) {
            stream.newline();
        }
    }
}
function _initController(Mix, node, model, ctx, el, ctr) {
    if (is_Function(Mix)) {
        return new Mix(node, model, ctx, el, ctr);
    }
    if (is_Function(Mix.__Ctor)) {
        return new Mix.__Ctor(node, model, ctx, el, ctr);
    }
    return Mix;
}
function _serializeNodes(meta, compoEl) {
    var x = meta.serializeNodes;
    if (x == null || x === false)
        return null;
    var fn = null;
    if (is_Function(x)) {
        fn = x;
    }
    if (fn == null && is_Function(compoEl.compo.serializeNodes)) {
        fn = compoEl.compo.serializeNodes;
    }
    if (fn == null) {
        fn = mask_stringify;
    }
    return fn.call(compoEl.compo, compoEl.node);
}
function _serializeScope(meta, compo) {
    if (meta.serializeScope == null) {
        return null;
    }
    var scope = compo.scope;
    if (scope == null) {
        return null;
    }
    var parent = compo.parent, model = compo.model;
    while (model == null && parent != null) {
        model = parent.model;
        parent = parent.parent;
    }
    return compo.serializeScope(scope, model);
}

export var SingleTags = {
    'area': 1,
    'base': 1,
    'br': 1,
    'col': 1,
    'embed': 1,
    'hr': 1,
    'img': 1,
    'input': 1,
    'keygen': 1,
    'link': 1,
    'menuitem': 1,
    'meta': 1,
    'param': 1,
    'source': 1,
    'track': 1,
    'wbr': 1
};

import { sel_classIndex } from './util/selector';
var ClassList = /** @class */ (function () {
    function ClassList(node) {
        this.attr = node.attributes;
        this.className = this.attr['class'] || '';
    }
    Object.defineProperty(ClassList.prototype, "length", {
        get: function () {
            return this.className.split(/\s+/).length;
        },
        enumerable: true,
        configurable: true
    });
    ClassList.prototype.contains = function (_class) {
        return sel_classIndex(this.className, _class) !== -1;
    };
    ClassList.prototype.remove = function (_class) {
        var index = sel_classIndex(this.className, _class);
        if (index === -1)
            return;
        var str = this.className;
        this.className =
            this.attr['class'] =
                str.substring(0, index) + str.substring(index + _class.length);
    };
    ClassList.prototype.add = function (_class) {
        if (sel_classIndex(this.className, _class) !== -1)
            return;
        this.className =
            this.attr['class'] = this.className
                + (this.className === '' ? '' : ' ')
                + _class;
    };
    return ClassList;
}());
export { ClassList };
;

import { is_String } from '@utils/is';
export function html_serializeAttributes(node) {
    var attr = node.attributes, str = '', key, value;
    for (key in attr) {
        value = attr[key];
        if (is_String(value)) {
            value = value.replace(/"/g, '&quot;');
        }
        str += ' ' + key + '="' + value + '"';
    }
    return str;
}
;

import { class_createEx } from '@utils/class';
import { is_Function } from '@utils/is';
import { html_serializeAttributes } from './util/html';
import { ElementNodeInn } from './ElementNodeInn';
export var ScriptElementInn = class_createEx(ElementNodeInn, {
    textContent: '',
    toString: function () {
        var string = '<script', attrStr = html_serializeAttributes(this);
        if (attrStr !== '') {
            string += ' ' + attrStr;
        }
        string += '>';
        var content = is_Function(this.textContent)
            ? this.textContent()
            : this.textContent;
        if (content) {
            string += content;
        }
        string += '</script>';
        return string;
    },
    write: function (stream) {
        var open = '<script', close = '</script>';
        var attrStr = html_serializeAttributes(this);
        if (attrStr !== '') {
            open += ' ' + attrStr;
        }
        open += '>';
        var content = is_Function(this.textContent)
            ? this.textContent()
            : this.textContent;
        if (!content /*unstrict*/) {
            stream.write(open + close);
            return;
        }
        stream
            .openBlock(open)
            .write(content)
            .closeBlock(close);
    }
});

import { class_createEx } from '@utils/class';
import { DomB } from './DomB';
import { ElementNodeInn } from './ElementNodeInn';
export var DoctypeNodeInn = class_createEx(ElementNodeInn, {
    nodeType: DomB.DOCTYPE,
    toString: function (buffer) {
        return DEFAULT;
    },
    write: function (stream) {
        stream.write(DEFAULT);
    }
});
var DEFAULT = '<!DOCTYPE html>';

import { class_createEx } from '@utils/class';
import { NodeBase } from './NodeBase';
import { DomB } from './DomB';
import { is_Function } from '@utils/is';
export var DocumentFragmentInn = class_createEx(NodeBase, {
    nodeType: DomB.FRAGMENT,
    toString: function () {
        var element = this.firstChild, string = '';
        while (element != null) {
            string += element.toString();
            element = element.nextSibling;
        }
        return string;
    },
    write: function (stream) {
        var element = this.firstChild;
        while (element != null) {
            if (is_Function(element.write)) {
                element.write(stream);
            }
            else {
                stream.write(element.toString());
            }
            element = element.nextSibling;
            if (element != null) {
                stream.newline();
            }
        }
        return stream;
    }
});

import { class_create } from '@utils/class';
import { DomB } from './DomB';
export var TextNodeInn = class_create({
    nodeType: DomB.TEXTNODE,
    nextSibling: null,
    textContent: '',
    constructor: function TextNode(text) {
        this.textContent = String(text == null ? '' : text);
    },
    toString: function () {
        return escape(this.textContent);
    }
});
function escape(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

import { ScriptElementInn } from './ScriptElementInn';
import { DoctypeNodeInn } from './DoctypeNodeInn';
import { DocumentFragmentInn } from './DocumentFragmentInn';
import { ElementNodeInn } from './ElementNodeInn';
import { TextNodeInn } from './TextNodeInn';
import { CommentNode } from './CommentNode';
import { ComponentNode } from './ComponentNode';
export var documentInn = {
    createDocumentFragment: function () {
        return new DocumentFragmentInn();
    },
    createElement: function (name) {
        var _a;
        var Ctor = (_a = HtmlTags[name.toLowerCase()]) !== null && _a !== void 0 ? _a : ElementNodeInn;
        return new Ctor(name);
    },
    createTextNode: function (text) {
        return new TextNodeInn(text);
    },
    createComment: function (text) {
        return new CommentNode(text);
    },
    createComponent: function (compo, model, ctx, container, ctr) {
        return new ComponentNode(compo, model, ctx, container, ctr);
    }
};
var HtmlTags = {
    /*
     * Most common html tags
     * http://jsperf.com/not-in-vs-null/3
     */
    a: null,
    abbr: null,
    article: null,
    aside: null,
    audio: null,
    b: null,
    big: null,
    blockquote: null,
    br: null,
    button: null,
    canvas: null,
    datalist: null,
    details: null,
    div: null,
    em: null,
    fieldset: null,
    footer: null,
    form: null,
    h1: null,
    h2: null,
    h3: null,
    h4: null,
    h5: null,
    h6: null,
    header: null,
    i: null,
    img: null,
    input: null,
    label: null,
    legend: null,
    li: null,
    menu: null,
    nav: null,
    ol: null,
    option: null,
    p: null,
    pre: null,
    section: null,
    select: null,
    small: null,
    span: null,
    strong: null,
    script: ScriptElementInn,
    svg: null,
    table: null,
    tbody: null,
    td: null,
    textarea: null,
    tfoot: null,
    th: null,
    thead: null,
    tr: null,
    tt: null,
    ul: null,
    video: null,
    '!doctype': DoctypeNodeInn
};

import { class_createEx } from '@utils/class';
import { NodeBase } from './NodeBase';
import { DomB } from './DomB';
import { SingleTags } from './tags';
import { ClassList } from './jq/classList';
import { documentInn } from './documentInn';
export var ElementNodeInn = class_createEx(NodeBase, {
    nodeType: DomB.NODE,
    constructor: function (name) {
        this.tagName = name.toUpperCase();
        this.attributes = {};
    },
    setAttribute: function (key, value) {
        this.attributes[key] = value;
    },
    getAttribute: function (key) {
        return this.attributes[key];
    },
    get classList() {
        return new ClassList(this);
    },
    toString: function () {
        var tagName = this.tagName.toLowerCase(), value, element;
        var string = '<' + tagName, attrStr = html_serializeAttributes(this);
        if (attrStr !== '') {
            string += attrStr;
        }
        var isSingleTag = SingleTags[tagName] === 1, element = this.firstChild;
        if (element == null) {
            return string + (isSingleTag ? '/>' : '></' + tagName + '>');
        }
        string += isSingleTag ? '/>' : '>';
        if (isSingleTag) {
            string += '<!--~-->';
        }
        while (element != null) {
            string += element.toString();
            element = element.nextSibling;
        }
        if (isSingleTag)
            return string + '<!--/~-->';
        return string + '</' + tagName + '>';
    },
    write: function (stream) {
        var tagName = this.tagName.toLowerCase(), value, element, minify = stream.minify;
        if (minify === false && tagName === 'pre') {
            stream.minify = true;
        }
        var string = '<' + tagName, attrStr = html_serializeAttributes(this);
        if (attrStr !== '') {
            string += attrStr;
        }
        stream.write(string);
        var isSingleTag = SingleTags[tagName] === 1, element = this.firstChild;
        if (element == null) {
            stream.print(isSingleTag ? '/>' : '></' + tagName + '>');
            stream.minify = minify;
            return stream;
        }
        stream.print(isSingleTag ? '/>' : '>');
        if (isSingleTag) {
            stream.newline();
            stream.write('<!--~-->');
        }
        while (element != null) {
            stream.openBlock(null);
            stream.newline();
            stream.process(element);
            stream.closeBlock(null);
            element = element.nextSibling;
        }
        if (isSingleTag) {
            stream.newline();
            stream.write('<!--/~-->');
        }
        stream.newline();
        stream.write('</' + tagName + '>');
        stream.minify = minify;
        return stream;
    },
    // generic properties
    get value() {
        return this.attributes.value;
    },
    set value(value) {
        this.attributes.value = value;
    },
    get selected() {
        return this.attributes.selected;
    },
    set selected(value) {
        if (!value) {
            delete this.attributes.selected;
            return;
        }
        this.attributes.selected = 'selected';
    },
    get checked() {
        return this.attributes.checked;
    },
    set checked(value) {
        if (!value) {
            delete this.attributes.checked;
            return;
        }
        this.attributes.checked = 'checked';
    },
    get textContent() {
        var child = this.firstChild;
        var txt = '';
        while (child != null) {
            if (child.nodeType === DomB.TEXTNODE) {
                txt += child.textContent;
                continue;
            }
            txt += child.textContent || '';
            child = child.nextSibling;
        }
        return txt;
    },
    set textContent(str) {
        node_empty(this);
        this.appendChild(documentInn.createTextNode(str));
    }
});

import { class_create } from '@utils/class';
import { DomB } from './DomB';
import { Meta } from '@mask-node/helper/Meta';
export var UtilNodeInn = class_create({
    meta: null,
    nodeType: DomB.UTILNODE,
    nextSibling: null,
    firstChild: null,
    constructor: function (type, name, value, attrName) {
        this.meta = {
            utilType: type,
            utilName: name,
            value: value,
            attrName: attrName,
            current: null
        };
    },
    appendChild: function (el) {
        this.firstChild = el;
    },
    toString: function () {
        var json = this.meta, info = {
            type: 'u',
            single: this.firstChild == null
        }, string = Meta.stringify(json, info);
        if (this.firstChild == null)
            return string;
        return string
            + this.firstChild.toString()
            + Meta.close(json, info);
    }
});

export function ctx_stringify(ctx) {
    var has = false, obj = {}, x;
    for (var key in ctx) {
        if (key.charCodeAt(0) === 95 /*_*/) {
            continue;
        }
        x = ctx[key];
        var type = typeof x;
        if (x == null
            || type === 'object' /* skip complex objects */
            || type === 'function') {
            continue;
        }
        if (key === 'async') {
            continue;
        }
        has = true;
        obj[key] = x;
    }
    return has === false ? null : obj;
}
;

import { CommentNode } from '../CommentNode';
import { Meta } from '@mask-node/helper/Meta';
import { DomB } from '../DomB';
import { ctx_stringify } from '@mask-node/util/ctx';
import { log_error } from '@core/util/reporters';
import { HtmlStream } from './HtmlStream';
import { documentInn } from '../documentInn';
export function stringifyInn(document_, model, ctx, compo) {
    var document = prepairDocument(document_), hasDoctype = _hasDoctype(document), stream = new HtmlStream(ctx.config || {}), hasComponents = compo != null
        && compo.components != null
        && compo.components.length !== 0;
    var meta, modules;
    if (hasComponents) {
        meta = comment_meta(ctx),
            modules = comment_modules(ctx, stream.minify);
    }
    if (hasDoctype) {
        document = prepairDocument_withDoctype(document, modules, meta);
    }
    if (hasDoctype || hasComponents === false) {
        stream.process(document);
        return stream.toString();
    }
    var documentElement = trav_getDoc(document);
    if (documentElement != null) {
        document = prepairDocument_withDocumentComponent(document, documentElement, modules, meta);
        stream.process(document);
        return stream.toString();
    }
    if (meta == null && modules == null) {
        stream.process(document);
        return stream.toString();
    }
    stream
        .process(meta && meta.header)
        .newline()
        .process(modules)
        .newline()
        .process(document)
        .newline()
        .process(meta && meta.footer);
    return stream.toString();
}
;
function prepairDocument(document_) {
    var docEl = document_;
    if (_hasDoctype(docEl) === false) {
        return docEl;
    }
    var html = trav_getChild(docEl, 'HTML');
    if (html == null) {
        html = documentInn.createElement('html');
        var doctype = trav_getChild(docEl, '!DOCTYPE');
        docEl.removeChild(doctype);
        var fragmentEl = documentInn.createDocumentFragment();
        fragmentEl.appendChild(doctype);
        fragmentEl.appendChild(html);
        var el = docEl.firstChild;
        while (el != null) {
            var next = el.nextSibling;
            if (el !== doctype && el !== html) {
                docEl.removeChild(el);
                html.appendChild(el);
            }
            el = next;
        }
        docEl = fragmentEl;
    }
    var head = trav_getChild(html, 'HEAD');
    var body = trav_getChild(html, 'BODY');
    if (body == null) {
        body = documentInn.createElement('body');
        var el = html.firstChild;
        while (el != null) {
            var next = el.nextSibling;
            if (el !== head) {
                html.removeChild(el);
                body.appendChild(el);
            }
            el = next;
        }
        html.appendChild(body);
    }
    return docEl;
}
function prepairDocument_withDoctype(document, modules, meta) {
    if (modules == null && meta == null) {
        return document;
    }
    var html = trav_getChild(document, 'HTML');
    var body = trav_getChild(html, 'BODY');
    if (modules != null) {
        el_prepend(body, modules);
    }
    if (meta != null) {
        el_prepend(body, meta.header);
        el_append(body, meta.footer);
    }
    return document;
}
// @Obsolete (use doctype instead)
function prepairDocument_withDocumentComponent(document, documentElement, modules, meta) {
    var html = trav_getChild(documentElement, 'HTML');
    if (html != null) {
        var body = trav_getChild(html, 'BODY');
        if (body != null) {
            el_prepend(body, modules);
            if (meta != null) {
                el_prepend(body, meta.header);
                el_append(body, meta.footer);
            }
        }
        else {
            log_error('Body not found');
        }
    }
    return document;
}
function comment_meta(ctx) {
    var model_ = ctx._models.stringify(), ctx_ = ctx_stringify(ctx), id_ = ctx._id;
    if (model_ == null && ctx_ == null) {
        return null;
    }
    var headerJson = {
        model: model_ || "{}",
        ctx: ctx_,
        ID: id_
    }, headerInfo = {
        type: 'm'
    };
    return {
        header: new CommentNode(Meta.stringify(headerJson, headerInfo)),
        footer: new CommentNode(Meta.close(headerJson, headerInfo))
    };
}
function comment_modules(ctx, minify) {
    if (ctx._modules == null) {
        return null;
    }
    var str = ctx._modules.stringify({ indent: minify ? 0 : 4 });
    if (str == null || str === '') {
        return null;
    }
    var comment = Meta.stringify({
        mask: str
    }, {
        type: 'r',
        single: true
    });
    return new CommentNode(comment);
}
function el_append(el, x) {
    if (x == null)
        return;
    el.appendChild(x);
}
function el_prepend(el, x) {
    if (x == null)
        return;
    el.insertBefore(x, el.firstChild);
}
function _hasDoctype(fragmentEl) {
    if (fragmentEl.nodeType !== DomB.FRAGMENT) {
        return false;
    }
    var el = fragmentEl.firstChild;
    while (el != null) {
        if (el.nodeType === DomB.DOCTYPE) {
            return true;
        }
        el = el.nextSibling;
    }
    return false;
}

import { DomB } from './DomB';
import { CommentNode } from './CommentNode';
import { ComponentNode } from './ComponentNode';
import { ElementNodeInn } from './ElementNodeInn';
import { TextNodeInn } from './TextNodeInn';
import { DoctypeNodeInn } from './DoctypeNodeInn';
import { ScriptElementInn } from './ScriptElementInn';
import { UtilNodeInn } from './UtilNodeInn';
import { DocumentFragmentInn } from './DocumentFragmentInn';
import { documentInn } from './documentInn';
import { stringifyInn } from './util/stringify';
export var HtmlDom;
(function (HtmlDom) {
    HtmlDom.document = documentInn;
    HtmlDom.DocumentFragment = DocumentFragmentInn;
    HtmlDom.Comment = CommentNode;
    HtmlDom.Component = ComponentNode;
    HtmlDom.DOCTYPE = DoctypeNodeInn;
    HtmlDom.Element = ElementNodeInn;
    HtmlDom.TextNode = TextNodeInn;
    HtmlDom.ScriptElement = ScriptElementInn;
    HtmlDom.UtilNode = UtilNodeInn;
    HtmlDom.Dom = DomB;
    HtmlDom.stringify = stringifyInn;
})(HtmlDom || (HtmlDom = {}));

import { builder_buildFactory } from '@core/builder/delegate/builder_buildFactory';
import { DomB } from '@mask-node/html-dom/DomB';
import { builder_Ctx } from '@core/builder/exports';
import { builder_CtxModels } from '../ctx/CtxModels';
import { builder_CtxModules } from '../ctx/CtxModules';
import { Cache } from '../../cache/exports';
import { HtmlDom } from '@mask-node/html-dom/exports';
export function builder_buildDelegate(opts) {
    var buildOrig = builder_buildFactory(opts);
    return function build(template, model, ctx, container, ctr, children) {
        if (container == null) {
            container = HtmlDom.document.createDocumentFragment();
        }
        if (ctr == null) {
            ctr = new DomB.Component();
        }
        if (ctx == null) {
            ctx = new builder_Ctx;
        }
        if (ctx._models == null) {
            ctx._models = new builder_CtxModels(model, Cache.modelID);
        }
        if (ctx._modules == null) {
            ctx._modules = new builder_CtxModules();
        }
        if (ctx._id == null) {
            ctx._id = Cache.controllerID;
        }
        return buildOrig(template, model, ctx, container, ctr, children);
    };
}
;

import { builder_buildDelegate } from '../delegate/exports';
export var builder_build = builder_buildDelegate({
    create: function (name, doc) {
        return doc.createElement(name);
    }
});

import { builder_buildDelegate } from '../delegate/exports';
export var builder_buildSVG = builder_buildDelegate({
    create: function (name, doc) {
        return doc.createElementNS(SVG_NS, name);
    }
});
var SVG_NS = 'http://www.w3.org/2000/svg';

export { builder_Ctx } from './ctx';
export { BuilderData } from './BuilderData';
export { builder_build } from './dom/build';
export { builder_buildSVG } from './svg/build';
export { builder_resumeDelegate } from './resume';

import { builder_Ctx } from '@core/builder/exports';
import { _Object_hasOwnProp } from '@utils/refs';
import { parser_parse } from '@core/parser/exports';
import { builder_build } from '@core/builder/exports';
import { class_Dfr } from '@utils/class/Dfr';
import { Component } from '@compo/exports';
/**
 * Render the mask template to document fragment or single html node
 * @param {(string|MaskDom)} template - Mask string template or Mask Ast to render from.
 * @param {*} [model] - Model Object.
 * @param {Object} [ctx] - Context can store any additional information, that custom handler may need
 * @param {IAppendChild} [container]  - Container Html Node where template is rendered into
 * @param {Object} [controller] - Component that should own this template
 * @returns {(IAppendChild|Node|DocumentFragment)} container
 * @memberOf mask
 */
export function renderer_render(mix, model, ctx, container, controller) {
    if (ctx == null || ctx.constructor !== builder_Ctx) {
        ctx = new builder_Ctx(ctx);
    }
    var template = mix;
    if (typeof mix === 'string') {
        if (_Object_hasOwnProp.call(__templates, mix)) {
            /* if Object doesnt contains property that check is faster
                then "!=null" http://jsperf.com/not-in-vs-null/2 */
            template = __templates[mix];
        }
        else {
            template = __templates[mix] = parser_parse(mix, ctx.filename);
        }
    }
    return builder_build(template, model, ctx, container, controller);
}
/**
 * Same to `mask.render` but returns the promise, which is resolved when all async components
 * are resolved, or is in resolved state, when all components are synchronous.
 * For the parameters doc @see {@link mask.render}
 * @returns {Promise} Fullfills with (`IAppendChild|Node|DocumentFragment`, `Component`)
 * @memberOf mask
 */
export function renderer_renderAsync(template, model, ctx, container, ctr) {
    if (ctx == null || ctx.constructor !== builder_Ctx)
        ctx = new builder_Ctx(ctx);
    if (ctr == null)
        ctr = new Component();
    var dom = renderer_render(template, model, ctx, container, ctr), dfr = new class_Dfr();
    if (ctx.async === true) {
        ctx.done(function () {
            dfr.resolve(dom, ctr);
        });
    }
    else {
        dfr.resolve(dom, ctr);
    }
    return dfr;
}
;
export function renderer_clearCache(key) {
    if (arguments.length === 0) {
        __templates = {};
        return;
    }
    delete __templates[key];
}
;
var __templates = {};

import { parser_ensureTemplateFunction, parser_parse } from '@core/parser/exports';
import { renderer_render } from '@core/renderer/exports';
export var _mask_render = renderer_render;
export var _mask_parse = parser_parse;
export var _mask_ensureTmplFnOrig = parser_ensureTemplateFunction;
export function _mask_ensureTmplFn(value) {
    if (typeof value !== 'string') {
        return value;
    }
    return _mask_ensureTmplFnOrig(value);
}

import { Dom } from '@core/dom/exports';
import { is_ArrayLike } from '@utils/is';
import { parser_parse, mask_stringify } from '@core/parser/exports';
import { _Array_slice } from '@utils/refs';
import { jmask_getText } from '../util/utils';
import { jMask } from './jMask';
import { arr_each } from '@utils/arr';
import { _mask_render } from '../scope-vars';
import { Component } from '@compo/exports';
export var Proto = {
    type: Dom.SET,
    length: 0,
    components: null,
    add: function (mix) {
        var i, length;
        if (typeof mix === 'string') {
            mix = parser_parse(mix);
        }
        if (is_ArrayLike(mix)) {
            for (i = 0, length = mix.length; i < length; i++) {
                this.add(mix[i]);
            }
            return this;
        }
        if (typeof mix === 'function' && mix.prototype.type != null) {
            // assume this is a controller
            mix = {
                controller: mix,
                type: Dom.COMPONENT
            };
        }
        var type = mix.type;
        if (type === Dom.FRAGMENT) {
            var nodes = mix.nodes;
            for (i = 0, length = nodes.length; i < length;) {
                this[this.length++] = nodes[i++];
            }
            return this;
        }
        if (type === Dom.CONTROLLER) {
            if (mix.nodes != null && mix.nodes.length) {
                for (i = mix.nodes.length; i !== 0;) {
                    // set controller as parent, as parent is mask dom node
                    mix.nodes[--i].parent = mix;
                }
            }
            if (mix.$ != null) {
                this.type = Dom.CONTROLLER;
            }
        }
        this[this.length++] = mix;
        return this;
    },
    toArray: function () {
        return _Array_slice.call(this);
    },
    /**
     *	render([model, cntx, container]) -> HTMLNode
     * - model (Object)
     * - cntx (Object)
     * - container (Object)
     * - returns (HTMLNode)
     *
     **/
    render: function (model, ctx, el, ctr) {
        this.components = [];
        if (this.length === 1) {
            return _mask_render(this[0], model, ctx, el, ctr || this);
        }
        if (el == null) {
            el = document.createDocumentFragment();
        }
        for (var i = 0, length = this.length; i < length; i++) {
            _mask_render(this[i], model, ctx, el, ctr || this);
        }
        return el;
    },
    prevObject: null,
    end: function () {
        return this.prevObject || this;
    },
    pushStack: function (nodes) {
        var next;
        next = jMask(nodes);
        next.prevObject = this;
        return next;
    },
    controllers: function () {
        if (this.components == null) {
            console.warn('Set was not rendered');
        }
        return this.pushStack(this.components || []);
    },
    mask: function (template) {
        if (arguments.length !== 0) {
            return this.empty().append(template);
        }
        return mask_stringify(this);
    },
    text: function (mix, ctx, ctr) {
        if (typeof mix === 'string' && arguments.length === 1) {
            var node = [new Dom.TextNode(mix)];
            for (var i = 0, imax = this.length; i < imax; i++) {
                this[i].nodes = node;
            }
            return this;
        }
        var str = '';
        for (var i = 0, imax = this.length; i < imax; i++) {
            str += jmask_getText(this[i], mix, ctx, ctr);
        }
        return str;
    }
};
arr_each(['append', 'prepend'], function (method) {
    Proto[method] = function (mix) {
        var $mix = jMask(mix), i = 0, length = this.length, arr, node;
        for (; i < length; i++) {
            node = this[i];
            // we create each iteration a new array to prevent collisions in future manipulations
            arr = $mix.toArray();
            for (var j = 0, jmax = arr.length; j < jmax; j++) {
                arr[j].parent = node;
            }
            if (node.nodes == null) {
                node.nodes = arr;
                continue;
            }
            node.nodes = method === 'append' ? node.nodes.concat(arr) : arr.concat(node.nodes);
        }
        return this;
    };
});
arr_each(['appendTo'], function (method) {
    Proto[method] = function (mix, model, cntx, ctr) {
        if (ctr == null) {
            ctr = this;
        }
        if (mix.nodeType != null && typeof mix.appendChild === 'function') {
            mix.appendChild(this.render(model, cntx, null, ctr));
            Component.signal.emitIn(ctr, 'domInsert');
            return this;
        }
        jMask(mix).append(this);
        return this;
    };
});

import { coll_each } from '@utils/coll';
import { is_String } from '@utils/is';
import { obj_extend } from '@utils/obj';
import { _mask_ensureTmplFn } from '../scope-vars';
export var ManipAttr = {
    removeAttr: function (key) {
        return coll_each(this, function (node) {
            node.attr[key] = null;
        });
    },
    attr: function (mix, val) {
        if (arguments.length === 1 && is_String(mix)) {
            return this.length !== 0 ? this[0].attr[mix] : null;
        }
        function asString(node, key, val) {
            node.attr[key] = _mask_ensureTmplFn(val);
        }
        function asObject(node, obj) {
            for (var key in obj) {
                asString(node, key, obj[key]);
            }
        }
        var fn = is_String(mix) ? asString : asObject;
        return coll_each(this, function (node) {
            fn(node, mix, val);
        });
    },
    prop: function (key, val) {
        if (arguments.length === 1) {
            return this.length !== 0 ? this[0][key] : this[0].attr[key];
        }
        return coll_each(this, function (node) {
            node[key] = val;
        });
    },
    removeProp: function (key) {
        return coll_each(this, function (node) {
            node.attr[key] = null;
            node[key] = null;
        });
    },
    tag: function (name) {
        if (arguments.length === 0)
            return this[0] && this[0].tagName;
        return coll_each(this, function (node) {
            node.tagName = name;
        });
    },
    css: function (mix, val) {
        if (arguments.length <= 1 && typeof mix === 'string') {
            if (this.length == null)
                return null;
            var style = this[0].attr.style;
            if (style == null)
                return null;
            var obj = css_parseStyle(style);
            return mix == null ? obj : obj[mix];
        }
        if (mix == null)
            return this;
        var stringify = typeof mix === 'object'
            ? css_stringify
            : css_stringifyKeyVal;
        var extend = typeof mix === 'object'
            ? obj_extend
            : css_extendKeyVal;
        return coll_each(this, function (node) {
            var style = node.attr.style;
            if (style == null) {
                node.attr.style = stringify(mix, val);
                return;
            }
            var css = css_parseStyle(style);
            extend(css, mix, val);
            node.attr.style = css_stringify(css);
        });
    }
};
function css_extendKeyVal(css, key, val) {
    css[key] = val;
}
function css_parseStyle(style) {
    var obj = {};
    style.split(';').forEach(function (x) {
        if (x === '')
            return;
        var i = x.indexOf(':'), key = x.substring(0, i).trim(), val = x.substring(i + 1).trim();
        obj[key] = val;
    });
    return obj;
}
function css_stringify(css) {
    var str = '', key;
    for (key in css) {
        str += key + ':' + css[key] + ';';
    }
    return str;
}
function css_stringifyKeyVal(key, val) {
    return key + ':' + val + ';';
}

import { coll_each, coll_find } from '@utils/coll';
import { arr_each } from '@utils/arr';
export var ManipClass = {
    hasClass: function (klass) {
        return coll_find(this, function (node) {
            return has(node, klass);
        });
    }
};
var Mutator_ = {
    add: function (node, klass) {
        if (has(node, klass) === false)
            add(node, klass);
    },
    remove: function (node, klass) {
        if (has(node, klass) === true)
            remove(node, klass);
    },
    toggle: function (node, klass) {
        var fn = has(node, klass) === true ? remove : add;
        fn(node, klass);
    }
};
arr_each(['add', 'remove', 'toggle'], function (method) {
    var fn = Mutator_[method];
    ManipClass[method + 'Class'] = function (klass) {
        return coll_each(this, function (node) {
            fn(node, klass);
        });
    };
});
function current(node) {
    var className = node.attr['class'];
    return typeof className === 'string' ? className : '';
}
function has(node, klass) {
    return -1 !== (' ' + current(node) + ' ').indexOf(' ' + klass + ' ');
}
function add(node, klass) {
    node.attr['class'] = (current(node) + ' ' + klass).trim();
}
function remove(node, klass) {
    node.attr['class'] = (' ' + current(node) + ' ').replace(' ' + klass + ' ', '').trim();
}

import { coll_each, coll_indexOf, coll_map, coll_remove } from '@utils/coll';
import { arr_each } from '@utils/arr';
import { jmask_deepest, jmask_clone } from '../util/utils';
import { log_error, log_warn } from '@core/util/reporters';
import { jMask } from './jMask';
export var ManipDom = {
    clone: function () {
        return jMask(coll_map(this, jmask_clone));
    },
    wrap: function (wrapper) {
        var $wrap = jMask(wrapper);
        if ($wrap.length === 0) {
            log_warn('Not valid wrapper', wrapper);
            return this;
        }
        var result = coll_map(this, function (x) {
            var node = $wrap.clone()[0];
            jmask_deepest(node).nodes = [x];
            if (x.parent != null) {
                var i = coll_indexOf(x.parent.nodes, x);
                if (i !== -1)
                    x.parent.nodes.splice(i, 1, node);
            }
            return node;
        });
        return jMask(result);
    },
    wrapAll: function (wrapper) {
        var $wrap = jMask(wrapper);
        if ($wrap.length === 0) {
            log_error('Not valid wrapper', wrapper);
            return this;
        }
        this.parent().mask($wrap);
        jmask_deepest($wrap[0]).nodes = this.toArray();
        return this.pushStack($wrap);
    }
};
arr_each(['empty', 'remove'], function (method) {
    ManipDom[method] = function () {
        return coll_each(this, Methods_[method]);
    };
    var Methods_ = {
        remove: function (node) {
            if (node.parent != null)
                coll_remove(node.parent.nodes, node);
        },
        empty: function (node) {
            node.nodes = null;
        }
    };
});

import { arr_each } from '@utils/arr';
import { jmask_filter, jmask_find } from '../util/utils';
import { jMask } from './jMask';
import { selector_getNextKey, selector_parse, selector_match } from '../util/selector';
import { Dom } from '@core/dom/exports';
import { arr_unique } from '../util/array';
export var Traverse = {
    each: function (fn, ctx) {
        for (var i = 0; i < this.length; i++) {
            fn.call(ctx || this, this[i], i);
        }
        return this;
    },
    map: function (fn, ctx) {
        var arr = [];
        for (var i = 0; i < this.length; i++) {
            arr.push(fn.call(ctx || this, this[i], i));
        }
        return this.pushStack(arr);
    },
    eq: function (i) {
        return i === -1 ? this.slice(i) : this.slice(i, i + 1);
    },
    get: function (i) {
        return i < 0 ? this[this.length - i] : this[i];
    },
    slice: function () {
        return this.pushStack(Array.prototype.slice.apply(this, arguments));
    }
};
arr_each([
    'filter',
    'children',
    'closest',
    'parent',
    'find',
    'first',
    'last'
], function (method) {
    Traverse[method] = function (selector) {
        var result = [], matcher = selector == null
            ? null
            : selector_parse(selector, this.type, method === 'closest' ? 'up' : 'down'), i, x;
        switch (method) {
            case 'filter':
                return jMask(jmask_filter(this, matcher));
            case 'children':
                var nextKey = selector_getNextKey(this);
                for (i = 0; i < this.length; i++) {
                    x = this[i];
                    var arr = x[nextKey];
                    if (arr == null) {
                        continue;
                    }
                    result = result.concat(matcher == null ? arr : jmask_filter(arr, matcher));
                }
                break;
            case 'parent':
                for (i = 0; i < this.length; i++) {
                    x = this[i].parent;
                    if (!x || x.type === Dom.FRAGMENT || (matcher && selector_match(x, matcher))) {
                        continue;
                    }
                    result.push(x);
                }
                arr_unique(result);
                break;
            case 'closest':
            case 'find':
                if (matcher == null) {
                    break;
                }
                for (i = 0; i < this.length; i++) {
                    jmask_find(this[i][matcher.nextKey], matcher, result);
                }
                break;
            case 'first':
            case 'last':
                var index;
                for (i = 0; i < this.length; i++) {
                    index = method === 'first' ? i : this.length - i - 1;
                    x = this[index];
                    if (matcher == null || selector_match(x, matcher)) {
                        result[0] = x;
                        break;
                    }
                }
                break;
        }
        return this.pushStack(result);
    };
});

import { Dom } from '@core/dom/exports';
import { Proto } from './proto';
import { ManipAttr } from './manip_attr';
import { ManipClass } from './manip_class';
import { ManipDom } from './manip_dom';
import { Traverse } from './traverse';
import { obj_extendMany } from '@utils/obj';
export function jMask(mix) {
    if (this instanceof jMask === false)
        return new jMask(mix);
    if (mix == null)
        return this;
    if (mix.type === Dom.SET)
        return mix;
    return this.add(mix);
}
obj_extendMany(Proto, ManipAttr, ManipClass, ManipDom, Traverse, { constructor: jMask });
jMask.prototype = Proto;

import { obj_create } from '@utils/obj';
export function attr_extend(a, b) {
    if (a == null) {
        return b == null ? {} : obj_create(b);
    }
    if (b == null) {
        return a;
    }
    for (var key in b) {
        if ('class' === key && typeof a[key] === 'string') {
            a[key] += ' ' + b[key];
            continue;
        }
        a[key] = b[key];
    }
    return a;
}
;
export function attr_first(attr) {
    for (var key in attr)
        return key;
    return null;
}
;

import { custom_Statements } from '@core/custom/exports';
import { expression_evalStatements } from '@project/expression/src/exports';
import { customTag_register } from '@core/custom/exports';
custom_Statements['log'] = {
    render: function (node, model, ctx, container, controller) {
        var arr = expression_evalStatements(node.expression, model, ctx, controller);
        arr.unshift('Mask::Log');
        console.log.apply(console, arr);
    }
};
customTag_register('debugger', {
    render: function (model, ctx, container, compo) {
        debugger;
    }
});
customTag_register(':utest', /** @class */ (function () {
    function class_1() {
    }
    class_1.prototype.render = function (model, ctx, container) {
        if (container.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
            container = container.childNodes;
        this.$ = $(container);
    };
    return class_1;
}()));

import { is_Function, is_Object } from '@utils/is';
import { obj_extend } from '@utils/obj';
import { _Array_slice } from '@utils/refs';
import { log_error } from '@core/util/reporters';
import { Dom } from '@core/dom/exports';
import { custom_Tags, customTag_register, customTag_registerScoped, customTag_get } from '@core/custom/exports';
import { parser_parse } from '@core/parser/exports';
import { expression_eval } from '@project/expression/src/exports';
import { mask_merge } from './merge';
import { Decorator } from './decorators/exports';
import { Methods } from './methods/exports';
import { Component } from '@compo/exports';
export var Define = {
    create: function (node, model, ctr, Base) {
        return compo_fromNode(node, model, ctr, Base);
    },
    registerGlobal: function (node, model, ctr, Base) {
        var Ctor = Define.create(node, model, ctr, Base);
        customTag_register(node.name, Ctor);
    },
    registerScoped: function (node, model, ctr, Base) {
        var Ctor = Define.create(node, model, ctr, Base);
        customTag_registerScoped(ctr, node.name, Ctor);
    }
};
function compo_prototype(node, compoName, tagName, attr, nodes, owner, model, Base) {
    var arr = [];
    var selfFns = null;
    var Proto = obj_extend({
        tagName: tagName,
        compoName: compoName,
        template: arr,
        attr: attr,
        location: trav_location(owner),
        meta: {
            template: 'merge',
            arguments: node.arguments,
            statics: null
        },
        constructor: function DefineBase() {
            if (selfFns != null) {
                var i = selfFns.length;
                while (--i !== -1) {
                    var key = selfFns[i];
                    this[key] = this[key].bind(this);
                }
            }
        },
        renderStart: function (model_, ctx, el) {
            var model = model_;
            Component.prototype.renderStart.call(this, model, ctx, el);
            if (this.nodes === this.template && this.meta.template !== 'copy') {
                this.nodes = mask_merge(this.nodes, [], this, null, mergeStats);
                if (mergeStats.placeholders.$isEmpty) {
                    this.meta.template = 'copy';
                }
            }
        },
        getHandler: null
    }, Base);
    Methods.compileForDefine(node, Proto, model, owner);
    var imax = nodes == null ? 0 : nodes.length;
    for (var i = 0; i < imax; i++) {
        var decorators = null;
        var x = nodes[i];
        if (x == null) {
            continue;
        }
        if (x.type === Dom.DECORATOR) {
            var start = i;
            i = Decorator.goToNode(nodes, i, imax);
            decorators = _Array_slice.call(nodes, start, i);
            x = nodes[i];
        }
        var name = x.tagName;
        if ('function' === name) {
            if (name === 'constructor') {
                Proto.constructor = joinFns([Proto.constructor, x.fn]);
                continue;
            }
            var fn = x.fn;
            Proto[x.name] = fn;
            if (x.decorators != null) {
                var result = Decorator.wrapMethod(x.decorators, fn, Proto, x.name, model, null, owner);
                if (is_Function(result)) {
                    Proto[x.name] = result;
                }
            }
            if (x.flagSelf) {
                selfFns = selfFns || [];
                selfFns.push(x.name);
            }
            if (x.flagStatic) {
                if (Proto.meta.statics == null) {
                    Proto.meta.statics = {};
                }
                Proto.meta.statics[x.name] = fn;
            }
            continue;
        }
        if ('slot' === name || 'event' === name) {
            if ('event' === name && Proto.tagName != null) {
                // bind the event later via the component
                arr.push(x);
                continue;
            }
            var type = name + 's';
            var fns = Proto[type];
            if (fns == null) {
                fns = Proto[type] = {};
            }
            fns[x.name] = x.flagPrivate ? slot_privateWrap(x.fn) : x.fn;
            if (x.decorators != null) {
                var result = Decorator.wrapMethod(x.decorators, x.fn, fns, x.name, model, null, owner);
                if (is_Function(result)) {
                    fns[x.name] = result;
                }
            }
            continue;
        }
        if ('pipe' === name) {
            custom_Tags.pipe.attach(x, Proto);
            continue;
        }
        if ('define' === name || 'let' === name) {
            var register = name === 'define'
                ? Define.registerGlobal
                : Define.registerScoped;
            register(x, model, Proto);
            continue;
        }
        if ('var' === name) {
            var obj = x.getObject(model, null, owner), key, val;
            for (key in obj) {
                val = obj[key];
                if (key === 'meta' || key === 'model' || key === 'attr' || key === 'compos') {
                    Proto[key] = obj_extend(Proto[key], val);
                    continue;
                }
                if (key === 'scope') {
                    if (is_Object(val)) {
                        Proto.scope = obj_extend(Proto.scope, val);
                        continue;
                    }
                }
                var scope = Proto.scope;
                if (scope == null) {
                    Proto.scope = scope = {};
                }
                scope[key] = val;
                Proto[key] = val;
            }
            continue;
        }
        if (decorators != null) {
            arr.push.apply(arr, decorators);
        }
        arr.push(x);
    }
    return Proto;
}
function compo_extends(extends_, model, ctr) {
    var args = [];
    if (extends_ == null)
        return args;
    var imax = extends_.length, i = -1, x;
    while (++i < imax) {
        x = extends_[i];
        if (x.compo) {
            var compo = customTag_get(x.compo, ctr);
            if (compo != null) {
                args.unshift(compo);
                continue;
            }
            var obj = expression_eval(x.compo, model, null, ctr);
            if (obj != null) {
                args.unshift(obj);
                continue;
            }
            log_error('Nor component, nor scoped data is resolved:', x.compo);
            continue;
        }
    }
    return args;
}
function compo_fromNode(node, model, ctr, Base) {
    var extends_ = node['extends'], args_ = node['arguments'], as_ = node['as'], tagName, attr;
    if (as_ != null) {
        var x = parser_parse(as_);
        tagName = x.tagName;
        attr = obj_extend(node.attr, x.attr);
    }
    var name = node.name, Proto = compo_prototype(node, name, tagName, attr, node.nodes, ctr, model, Base), args = compo_extends(extends_, model, ctr);
    var Ctor = Component.createExt(Proto, args);
    if (Proto.meta.statics) {
        obj_extend(Ctor, Proto.meta.statics);
    }
    return Ctor;
}
function trav_location(ctr) {
    while (ctr != null) {
        if (ctr.location) {
            return ctr.location;
        }
        if (ctr.resource && ctr.resource.location) {
            return ctr.resource.location;
        }
        ctr = ctr.parent;
    }
    return null;
}
function slot_privateWrap(fn) {
    return function (mix) {
        if (mix != null && mix.stopPropagation != null) {
            mix.stopPropagation();
        }
        fn.apply(this, arguments);
        return false;
    };
}
function joinFns(fns) {
    return function () {
        var args = _Array_slice.call(arguments), imax = fns.length, i = -1;
        while (++i < imax) {
            fns[i].apply(this, args);
        }
    };
}
var mergeStats = { placeholders: { $isEmpty: true } };

import { custom_Tags } from '@core/custom/exports';
import { class_create } from '@utils/class';
import { Define } from '@core/feature/Define';
import { fn_doNothing } from '@utils/fn';
custom_Tags['define'] = class_create({
    meta: {
        serializeNodes: true
    },
    constructor: function (node, model, ctx, el, ctr) {
        Define.registerGlobal(node, model, ctr);
    },
    render: fn_doNothing
});
custom_Tags['let'] = class_create({
    meta: {
        serializeNodes: true
    },
    constructor: function (node, model, ctx, el, ctr) {
        Define.registerScoped(node, model, ctr);
    },
    render: fn_doNothing
});

import { jMask } from '@mask-j/jMask';
import { customTag_register } from '@core/custom/exports';
var Compo = {
    meta: {
        mode: 'server:all'
    },
    render: function (model, ctx, container) {
        this.html = jMask(this.nodes).text(model, ctx, this);
        if (container.insertAdjacentHTML) {
            container.insertAdjacentHTML('beforeend', this.html);
            return;
        }
        if (container.ownerDocument) {
            var div = document.createElement('div'), child;
            div.innerHTML = this.html;
            child = div.firstChild;
            while (child != null) {
                container.appendChild(child);
                child = child.nextSibling;
            }
        }
    },
    toHtml: function () {
        return this.html || '';
    },
    html: null
};
customTag_register(':html', Compo);

import { is_String } from '@utils/is';
import { error_withNode } from './reporters';
export function css_ensureScopedStyles(str, node, el) {
    var attr = node.attr;
    if (attr.scoped == null && attr[KEY] == null) {
        return str;
    }
    if (is_String(str) === false) {
        error_withNode('Scoped style can`t have interpolations', node);
        return str;
    }
    // Remove `scoped` attribute to exclude supported browsers.
    // Redefine custom attribute to use same template later
    attr.scoped = null;
    attr[KEY] = 1;
    var id = getScopeIdentity(node, el);
    var str_ = str;
    str_ = transformScopedStyles(str_, id);
    str_ = transformHostCss(str_, id);
    return str_;
}
;
var KEY = 'x-scoped';
var rgx_selector = /^([\s]*)([^\{\}]+)\{/gm;
var rgx_host = /^([\s]*):host\s*(\(([^)]+)\))?\s*\{/gm;
function transformScopedStyles(css, id) {
    return css.replace(rgx_selector, function (full, pref, selector) {
        if (selector.indexOf(':host') !== -1)
            return full;
        var arr = selector.split(','), imax = arr.length, i = 0;
        for (; i < imax; i++) {
            arr[i] = id + ' ' + arr[i];
        }
        selector = arr.join(',');
        return pref + selector + '{';
    });
}
function transformHostCss(css, id) {
    return css.replace(rgx_host, function (full, pref, ext, expr) {
        return pref
            + id
            + (expr || '')
            + '{';
    });
}
function getScopeIdentity(node, el) {
    var identity = 'scoped__css__' + node.id;
    if (el.id) {
        el.className += ' ' + identity;
        return '.' + identity;
    }
    el.setAttribute('id', identity);
    return '#' + identity;
}

import { class_create } from '@utils/class';
import { is_Function, is_DOM } from '@utils/is';
import { customTag_Base } from '@core/custom/exports';
import { Dom } from '@core/dom/exports';
import { custom_Tags } from '@core/custom/exports';
import { css_ensureScopedStyles } from '@core/util/css';
import { jMask } from '@mask-j/jMask';
var BaseContent = class_create(customTag_Base, {
    meta: {
        mode: 'server'
    },
    tagName: null,
    id: null,
    body: null,
    constructor: function (node, model, ctx, el, ctr) {
        var content = node.content;
        if (content == null && node.nodes) {
            var x = node.nodes[0];
            if (x.type === Dom.TEXTNODE) {
                content = x.content;
            }
            else {
                content = jMask(x.nodes).text(model, ctr);
            }
        }
        this.id = node.id;
        this.body = is_Function(content)
            ? content('node', model, ctx, el, ctr)
            : content;
        if (this.tagName === 'style') {
            this.body = css_ensureScopedStyles(this.body, node, el);
        }
    }
});
var GlobalContent = class_create(BaseContent, {
    render: function (model, ctx, el) {
        manager_get(ctx, el).append(this.tagName, this);
    }
});
var ElementContent = class_create(BaseContent, {
    render: function (model, ctx, el) {
        render(this.tagName, this.attr, this.body, null, el);
    }
});
custom_Tags['style'] = class_create(GlobalContent, { tagName: 'style' });
custom_Tags['script'] = class_create(ElementContent, { tagName: 'script' });
var manager_get;
(function () {
    manager_get = function (ctx, el) {
        if (ctx == null || is_DOM) {
            return manager || (manager = new Manager(document.body));
        }
        var KEY = '__contentManager';
        return ctx[KEY] || (ctx[KEY] = new Manager(el));
    };
    var manager;
    var Manager = class_create({
        constructor: function (el) {
            this.container = el.ownerDocument.body;
            this.ids = {};
        },
        append: function (tagName, node) {
            var id = node.id;
            var el = this.ids[id];
            if (el !== void 0) {
                return el;
            }
            el = render(tagName, node.attr, node.body, node.id, this.container);
            this.ids[id] = el;
        }
    });
}());
function render(tagName, attr, body, id, container) {
    var el = document.createElement(tagName);
    el.textContent = body;
    for (var key in attr) {
        var val = attr[key];
        if (val != null) {
            el.setAttribute(key, val);
        }
    }
    if (id) {
        el.setAttribute('id', id);
    }
    container.appendChild(el);
    return el;
}

import { custom_Tags, customTag_Base } from '@core/custom/exports';
import { class_create } from '@utils/class';
import { expression_eval } from '@project/expression/src/exports';
(function () {
    // TODO: refactor methods, use MaskNode Serialization instead Model Serialization
    custom_Tags['var'] = class_create(customTag_Base, {
        renderStart: function (model, ctx) {
            set(this, this.attr, true, model, ctx);
        },
        onRenderStartClient: function () {
            set(this, this.model, false);
        }
    });
    function set(self, source, doEval, model, ctx) {
        // set data also to model, so that it will be serialized in NodeJS
        self.model = {};
        var parent = self.parent;
        var scope = parent.scope;
        if (scope == null) {
            scope = parent.scope = {};
        }
        for (var key in source) {
            self.model[key] = scope[key] = doEval === false
                ? source[key]
                : expression_eval(source[key], model, ctx, parent);
        }
    }
}());

import { builder_buildSVG } from '@core/builder/exports';
import { customTag_register } from '@core/custom/exports';
var Compo = {
    meta: {
        mode: 'server:all'
    },
    render: function (model, ctx, container, ctr, children) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        for (var key in this.attr) {
            svg.setAttribute(key, this.attr[key]);
        }
        builder_buildSVG(this.nodes, model, ctx, svg, ctr, children);
        container.appendChild(svg);
    },
};
customTag_register('svg', Compo);

import { log_warn, log_error } from '@core/util/reporters';
import { customTag_register, customTag_get } from '@core/custom/exports';
import { custom_Statements } from '@core/custom/exports';
import { attr_first } from '@core/util/attr';
import { mask_merge } from '@core/feature/merge';
import { builder_build } from '@core/builder/exports';
import { jMask } from '@mask-j/jMask';
var cache_ = {};
export var Templates = {
    get: function (id) {
        return cache_[id];
    },
    resolve: function (node, id) {
        var nodes = cache_[id];
        if (nodes != null)
            return nodes;
        var selector = ':template[id=' + id + ']', parent = node.parent, tmpl = null;
        while (parent != null) {
            tmpl = jMask(parent.nodes)
                .filter(selector)
                .get(0);
            if (tmpl != null)
                return tmpl.nodes;
            parent = parent.parent;
        }
        log_warn('Template was not found', id);
        return null;
    },
    register: function (id, nodes) {
        if (id == null) {
            log_warn('`:template` must define the `id` attr');
            return;
        }
        cache_[id] = nodes;
    }
};
customTag_register(':template', {
    render: function () {
        Templates.register(this.attr.id, this.nodes);
    }
});
customTag_register(':import', {
    renderStart: function () {
        var id = this.attr.id;
        if (id == null) {
            log_error('`:import` shoud reference the template via id attr');
            return;
        }
        this.nodes = Templates.resolve(this, id);
    }
});
custom_Statements['include'] = {
    render: function (node, model, ctx, container, ctr, els) {
        var name = attr_first(node.attr);
        var Compo = customTag_get(name, ctr);
        var template;
        if (Compo != null) {
            template = Compo.prototype.template || Compo.prototype.nodes;
            if (template != null) {
                template = mask_merge(template, node.nodes);
            }
        }
        else {
            template = Templates.get(name);
        }
        if (template != null) {
            builder_build(template, model, ctx, container, ctr, els);
        }
    }
};
customTag_register('layout:master', {
    meta: {
        mode: 'server'
    },
    render: function () {
        var name = this.attr.id || attr_first(this.attr);
        Templates.register(name, this.nodes);
    }
});
customTag_register('layout:view', {
    meta: {
        mode: 'server'
    },
    render: function (model, ctx, container, ctr, els) {
        var nodes = Templates.get(this.attr.master);
        var template = mask_merge(nodes, this.nodes, null, { extending: true });
        builder_build(template, model, ctx, container, ctr, els);
    }
});

import './debug';
import './define';
import './html';
import './content';
import './var';
import './svg';
export { Templates } from './template';

import { parser_parse, parser_ensureTemplateFunction } from '@core/parser/exports';
import { is_ArrayLike, is_Array, is_Function } from '@utils/is';
import { Dom } from '@core/dom/exports';
import { log_warn, error_withNode, log_error } from '@core/util/reporters';
import { obj_extend, _Object_create, obj_getProperty } from '@utils/obj';
import { expression_eval } from '@project/expression/src/exports';
import { jMask } from '@mask-j/jMask';
import { attr_first } from '@core/util/attr';
import { customTag_get } from '@core/custom/exports';
import { cursor_groupEnd } from '@core/parser/exports';
import { Templates } from '@core/handlers/exports';
/**
 * Join two Mask templates or DOM trees
 * @param {(string|MaskNode)} a - first template
 * @param {(string|MaskNode)} b - second template
 * @param {(MaskNode|Component)} [owner]
 * @param {object} [opts]
 * @param {bool} [opts.extending=false] - Clean the merged tree from all unused placeholders
 * @param {obj} [stats] - Output holder, if merge info is requred
 * @returns {MaskNode} New joined Mask DOM tree
 * @memberOf mask
 * @method merge
 */
export function mask_merge(a, b, owner, opts, stats) {
    if (typeof a === 'string') {
        a = parser_parse(a);
    }
    if (typeof b === 'string') {
        b = parser_parse(b);
    }
    if (a == null || (is_ArrayLike(a) && a.length === 0)) {
        return b;
    }
    var placeholders = _resolvePlaceholders(b, b, new Placeholders(null, b, opts));
    var out = _merge(a, placeholders, owner);
    if (stats != null) {
        stats.placeholders = placeholders;
    }
    var extra = placeholders.$extra;
    if (extra != null && extra.length !== 0) {
        if (is_Array(out)) {
            return out.concat(extra);
        }
        return [out].concat(extra);
    }
    return out;
}
;
var tag_ELSE = '@else', tag_IF = '@if', tag_EACH = '@each', tag_PLACEHOLDER = '@placeholder', dom_NODE = Dom.NODE, dom_TEXTNODE = Dom.TEXTNODE, dom_FRAGMENT = Dom.FRAGMENT, dom_STATEMENT = Dom.STATEMENT, dom_COMPONENT = Dom.COMPONENT, dom_DECORATOR = Dom.DECORATOR;
function _merge(node, placeholders, tmplNode, clonedParent) {
    if (node == null)
        return null;
    var fn;
    if (is_Array(node)) {
        fn = _mergeArray;
    }
    else {
        switch (node.type) {
            case dom_TEXTNODE:
                fn = _cloneTextNode;
                break;
            case dom_DECORATOR:
                fn = _cloneDecorator;
                break;
            case dom_NODE:
            case dom_STATEMENT:
                fn = _mergeNode;
                break;
            case dom_FRAGMENT:
                fn = _mergeFragment;
                break;
            case dom_COMPONENT:
                fn = _mergeComponent;
                break;
        }
    }
    if (fn !== void 0) {
        return fn(node, placeholders, tmplNode, clonedParent);
    }
    log_warn('Unknown type', node.type);
    return null;
}
function _mergeArray(nodes, placeholders, tmplNode, clonedParent) {
    if (nodes == null) {
        return null;
    }
    var fragment = [], imax = nodes.length, i = -1, x, node;
    while (++i < imax) {
        node = nodes[i];
        if (node.tagName === tag_ELSE) {
            // check previous
            if (x != null)
                continue;
            if (node.expression && !eval_(node.expression, placeholders, tmplNode))
                continue;
            x = _merge(nodes[i].nodes, placeholders, tmplNode, clonedParent);
        }
        else {
            x = _merge(node, placeholders, tmplNode, clonedParent);
        }
        appendAny(fragment, x);
    }
    return fragment;
}
function _mergeFragment(frag, placeholders, tmplNode, clonedParent) {
    var fragment = new Dom.Fragment;
    fragment.parent = clonedParent;
    fragment.nodes = _mergeArray(frag.nodes, placeholders, tmplNode, fragment);
    return fragment;
}
function _mergeComponent(node, placeholders, tmplNode, clonedParent) {
    if (node.nodes == null)
        return node;
    var cloned = new Dom.Component;
    obj_extend(cloned, node);
    cloned.nodes = _merge(cloned.nodes, placeholders, tmplNode, clonedParent);
    return cloned;
}
function _mergeNode(node, placeholders, tmplNode, clonedParent) {
    var tagName = node.tagName;
    if (tagName.charCodeAt(0) !== 64) {
        // @
        return _cloneNode(node, placeholders, tmplNode, clonedParent);
    }
    placeholders.$isEmpty = false;
    var parentIsCompo = clonedParent && placeholders.$compos[clonedParent.tagName] != null;
    if (parentIsCompo) {
        var isSimpleNode = node.nodes == null || node.nodes.length === 0;
        if (isSimpleNode === false) {
            // Interpolate component slots
            return _cloneNode(node, placeholders, tmplNode, clonedParent);
        }
    }
    var id = node.attr.id;
    if (tagName === tag_PLACEHOLDER && id == null) {
        if (tmplNode != null) {
            var tagName_ = tmplNode.tagName;
            if (tagName_ != null && tmplNode.tagName.charCodeAt(0) === 64 /*@*/) {
                return tmplNode.nodes;
            }
        }
        id = '$root';
        placeholders.$extra = null;
    }
    if (tag_EACH === tagName) {
        var arr = placeholders.$getNode(node.expression), x;
        if (arr == null) {
            if (node.attr.optional == null) {
                error_withNode('No template node: @' + node.expression, node);
            }
            return null;
        }
        if (is_Array(arr) === false) {
            x = arr;
            return _merge(node.nodes, _resolvePlaceholders(x.nodes, x.nodes, new Placeholders(placeholders)), x, clonedParent);
        }
        var fragment = new Dom.Fragment, imax = arr.length, i = -1;
        while (++i < imax) {
            x = arr[i];
            appendAny(fragment, _merge(node.nodes, _resolvePlaceholders(x, x, new Placeholders(placeholders)), x, clonedParent));
        }
        return fragment;
    }
    if (tag_IF === tagName) {
        var val = eval_(node.expression, placeholders, tmplNode);
        return val
            ? _merge(node.nodes, placeholders, tmplNode, clonedParent)
            : null;
    }
    if (id == null)
        id = tagName.substring(1);
    var content = placeholders.$getNode(id, node.expression);
    if (content == null) {
        if (placeholders.opts.extending === true || parentIsCompo) {
            return node;
        }
        return null;
    }
    if (content.parent)
        _modifyParents(clonedParent, content.parent);
    var contentNodes = content.nodes, wrapperNode;
    if (node.attr.as !== void 0) {
        var tagName_ = node.attr.as;
        wrapperNode = {
            type: dom_NODE,
            tagName: tagName_,
            attr: _mergeAttr(node.attr, content.attr, placeholders, tmplNode),
            parent: clonedParent,
            nodes: contentNodes
        };
        wrapperNode.attr.as = null;
    }
    if (node.nodes == null) {
        return _merge((wrapperNode || contentNodes), placeholders, tmplNode, clonedParent);
    }
    var nodes = _merge(node.nodes, _resolvePlaceholders(contentNodes, contentNodes, new Placeholders(placeholders)), content, wrapperNode || clonedParent);
    if (wrapperNode != null) {
        wrapperNode.nodes = nodes;
        return wrapperNode;
    }
    return nodes;
}
function _mergeAttr(a, b, placeholders, tmplNode) {
    if (a == null || b == null)
        return a || b;
    var out = interpolate_obj_(a, placeholders, tmplNode);
    for (var key in b) {
        out[key] = interpolate_str_(b[key], placeholders, tmplNode);
    }
    return out;
}
function _cloneNode(node, placeholders, tmplNode, clonedParent) {
    var tagName = node.tagName || node.compoName;
    var deepClone = true;
    switch (tagName) {
        case ':template':
            var id = interpolate_str_(node.attr.id, placeholders, tmplNode);
            Templates.register(id, node.nodes);
            return null;
        case ':import':
            var id = interpolate_str_(node.attr.id, placeholders, tmplNode), nodes = Templates.resolve(node, id);
            return _merge(nodes, placeholders, tmplNode, clonedParent);
        case 'function':
        case 'define':
        case 'let':
        case 'var':
        case 'import':
        case 'script':
        case 'style':
        case 'slot':
        case 'event':
        case 'await':
            return node;
        case 'include':
            var tagName = node.attr.id;
            if (tagName == null) {
                tagName = attr_first(node.attr);
            }
            tagName = interpolate_str_(tagName, placeholders, tmplNode);
            var handler = customTag_get(tagName, tmplNode);
            if (handler != null) {
                var proto = handler.prototype;
                var tmpl = proto.template || proto.nodes;
                placeholders.$isEmpty = false;
                var next = _resolvePlaceholders(node.nodes, node.nodes, new Placeholders(placeholders, node.nodes));
                return _merge(tmpl, next, tmplNode, clonedParent);
            }
            break;
        default:
            var handler = customTag_get(tagName, tmplNode);
            if (handler != null) {
                placeholders.$compos[tagName] = handler;
                var proto = handler.prototype;
                if (proto && proto.meta != null && proto.meta.template !== 'merge') {
                    deepClone = false;
                }
            }
            break;
    }
    var outnode = _cloneNodeShallow(node, clonedParent, placeholders, tmplNode);
    if (deepClone === true && outnode.nodes) {
        outnode.nodes = _merge(node.nodes, placeholders, tmplNode, outnode);
    }
    return outnode;
}
function _cloneNodeShallow(node, clonedParent, placeholders, tmplNode) {
    return {
        type: node.type,
        tagName: node.tagName,
        attr: interpolate_obj_(node.attr, placeholders, tmplNode),
        props: node.props == null ? null : interpolate_obj_(node.props, placeholders, tmplNode),
        expression: interpolate_str_(node.expression, placeholders, tmplNode),
        controller: node.controller,
        // use original parent, to preserve the module scope for the node of each template
        parent: node.parent || clonedParent,
        nodes: node.nodes,
        sourceIndex: node.sourceIndex,
    };
}
function _cloneTextNode(node, placeholders, tmplNode, clonedParent) {
    return {
        type: node.type,
        content: interpolate_str_(node.content, placeholders, tmplNode),
        parent: node.parent || clonedParent,
        sourceIndex: node.sourceIndex
    };
}
function _cloneDecorator(node, placeholders, tmplNode, clonedParent) {
    var out = new Dom.DecoratorNode(node.expression, clonedParent || node.parent);
    out.sourceIndex = node.sourceIndex;
    return out;
}
function interpolate_obj_(obj, placeholders, node) {
    var clone = _Object_create(obj);
    for (var key in clone) {
        var x = clone[key];
        if (x == null) {
            continue;
        }
        if (key === '@[...attr]') {
            // When `node` is component, the original node is under `node` property
            var attr = (node.node || node).attr;
            for (var key_1 in attr) {
                var val = attr[key_1];
                if (key_1 === 'class') {
                    var current = clone[key_1];
                    if (current != null) {
                        var isFn = false;
                        if (is_Function(current)) {
                            isFn = true;
                            current = current();
                        }
                        if (is_Function(val)) {
                            isFn = true;
                            val = val();
                        }
                        current += ' ' + val;
                        clone[key_1] = isFn ? parser_ensureTemplateFunction(current) : current;
                        continue;
                    }
                }
                clone[key_1] = val;
            }
            clone[key] = null;
            continue;
        }
        clone[key] = interpolate_str_(x, placeholders, node);
    }
    return clone;
}
function interpolate_str_(mix, placeholders, node) {
    var index = -1, isFn = false, str = mix;
    if (typeof mix === 'function') {
        isFn = true;
        str = mix();
    }
    if (typeof str !== 'string' || (index = str.indexOf('@')) === -1)
        return mix;
    if (placeholders != null) {
        placeholders.$isEmpty = false;
    }
    var result = str.substring(0, index), length = str.length, isBlockEntry = str.charCodeAt(index + 1) === 91, // [
    last = -1, c;
    while (index < length) {
        // interpolation
        last = index;
        if (isBlockEntry === true) {
            index = cursor_groupEnd(str, index + 2, length, 91, 93);
            // []
            if (index === -1)
                index = length;
            last += 2;
        }
        else {
            while (index < length) {
                c = str.charCodeAt(++index);
                if (c === 36 || c === 95 || c === 46) {
                    // $ _ .
                    continue;
                }
                if ((48 <= c && c <= 57) || // 0-9
                    (65 <= c && c <= 90) || // A-Z
                    (97 <= c && c <= 122)) { // a-z
                    continue;
                }
                break;
            }
        }
        var expr = str.substring(last, index), fn = isBlockEntry ? eval_ : interpolate_, x = fn(expr, placeholders, node);
        if (x != null) {
            if (is_Function(x)) {
                isFn = true;
                x = x();
            }
            result += x;
        }
        else if (placeholders.opts.extending === true) {
            result += isBlockEntry ? ('@[' + expr + ']') : expr;
        }
        // tail
        last = isBlockEntry ? (index + 1) : index;
        index = str.indexOf('@', index);
        if (index === -1)
            index = length;
        result += str.substring(last, index);
    }
    return isFn
        ? parser_ensureTemplateFunction(result)
        : result;
}
function interpolate_(path, placeholders, node) {
    var index = path.indexOf('.');
    if (index === -1) {
        log_warn('Merge templates. Accessing node', path);
        return null;
    }
    var tagName = path.substring(0, index), id = tagName.substring(1), property = path.substring(index + 1), obj = null;
    if (node != null) {
        if (tagName === '@attr') {
            return interpolate_getAttr_(node, placeholders, property);
        }
        else if (tagName === '@counter') {
            return interpolate_getCounter_(property);
        }
        else if (tagName === node.tagName)
            obj = node;
    }
    if (obj == null)
        obj = placeholders.$getNode(id);
    if (obj == null) {
        //- log_error('Merge templates. Node not found', tagName);
        return null;
    }
    return obj_getProperty(obj, property);
}
function interpolate_getAttr_(node, placeholders, prop) {
    var x = node.attr && node.attr[prop];
    var el = placeholders;
    while (x == null && el != null) {
        x = el.attr && el.attr[prop];
        el = el.parent;
    }
    return x;
}
var interpolate_getCounter_;
(function () {
    var _counters = {};
    interpolate_getCounter_ = function (prop) {
        var i = _counters[prop] || 0;
        return (_counters[prop] = ++i);
    };
}());
function appendAny(node, mix) {
    if (mix == null)
        return;
    if (typeof mix.concat === 'function') {
        var imax = mix.length;
        for (var i = 0; i < imax; i++) {
            appendAny(node, mix[i]);
        }
        return;
    }
    if (mix.type === dom_FRAGMENT) {
        appendAny(node, mix.nodes);
        return;
    }
    if (typeof node.appendChild === 'function') {
        node.appendChild(mix);
        return;
    }
    var l = node.length;
    if (l > 0) {
        var prev = node[l - 1];
        prev.nextSibling = mix;
    }
    node.push(mix);
}
var RESERVED = ' else placeholder each attr if parent scope';
function _resolvePlaceholders(root, node, placeholders) {
    if (node == null)
        return placeholders;
    if (is_Array(node)) {
        var imax = node.length, i = -1;
        while (++i < imax) {
            _resolvePlaceholders(node === root ? node[i] : root, node[i], placeholders);
        }
        return placeholders;
    }
    var type = node.type;
    if (type === dom_TEXTNODE)
        return placeholders;
    if (type === dom_NODE) {
        var tagName = node.tagName;
        if (tagName != null && tagName.charCodeAt(0) === 64) {
            // @
            placeholders.$count++;
            var id = tagName.substring(1);
            // if DEBUG
            if (RESERVED.indexOf(' ' + id + ' ') !== -1)
                log_error('MaskMerge. Reserved Name', id);
            // endif
            var x = {
                tagName: node.tagName,
                parent: _getParentModifiers(root, node),
                nodes: node.nodes,
                attr: node.attr,
                expression: node.expression,
                type: node.type
            };
            if (placeholders[id] == null) {
                placeholders[id] = x;
            }
            else {
                var current = placeholders[id];
                if (is_Array(current)) {
                    current.push(x);
                }
                else {
                    placeholders[id] = [current, x];
                }
            }
            return placeholders;
        }
    }
    var count = placeholders.$count;
    var out = _resolvePlaceholders(root, node.nodes, placeholders);
    if (root === node && count === placeholders.$count) {
        placeholders.$extra.push(root);
    }
    return out;
}
function _getParentModifiers(root, node) {
    if (node === root)
        return null;
    var current, parents, parent = node.parent;
    while (true) {
        if (parent == null)
            break;
        if (parent === root && root.type !== dom_NODE)
            break;
        var p = {
            type: parent.type,
            tagName: parent.tagName,
            attr: parent.attr,
            controller: parent.controller,
            expression: parent.expression,
            nodes: null,
            parent: null
        };
        if (parents == null) {
            current = parents = p;
        }
        else {
            current.parent = p;
            current = p;
        }
        parent = parent.parent;
    }
    return parents;
}
function _modifyParents(clonedParent, parents) {
    var nodeParent = clonedParent, modParent = parents;
    while (nodeParent != null && modParent != null) {
        if (modParent.tagName)
            nodeParent.tagName = modParent.tagName;
        if (modParent.expression)
            nodeParent.expression = modParent.expression;
        for (var key in modParent.attr) {
            nodeParent.attr[key] = modParent.attr[key];
        }
        nodeParent = nodeParent.parent;
        modParent = modParent.parent;
    }
}
function eval_(expr, placeholders, tmplNode) {
    if (tmplNode != null) {
        placeholders.attr = tmplNode.attr;
    }
    return expression_eval(expr, placeholders, null, placeholders);
}
function Placeholders(parent, nodes, opts) {
    var $root = null;
    if (nodes != null) {
        $root = new Dom.Node(tag_PLACEHOLDER);
        $root.nodes = nodes;
    }
    this.scope = this;
    this.parent = parent;
    this.$root = $root || (parent && parent.$root);
    this.$extra = [];
    this.$compos = {};
    if (opts != null) {
        this.opts = opts;
    }
    else if (parent != null) {
        this.opts = parent.opts;
    }
}
Placeholders.prototype = {
    opts: {
        extending: false
    },
    parent: null,
    attr: null,
    scope: null,
    $root: null,
    $extra: null,
    $count: 0,
    $isEmpty: true,
    $compos: null,
    $getNode: function (id, filter) {
        var ctx = this, node;
        while (ctx != null) {
            node = ctx[id];
            if (node != null)
                break;
            ctx = ctx.parent;
        }
        if (filter != null && node != null) {
            node = {
                nodes: jMask(node.nodes).filter(filter)
            };
        }
        return node;
    }
};

import { is_ArrayLike } from '@utils/is';
// @param sender - event if sent from DOM Event or CONTROLLER instance
export function _fire(ctr, slot, sender, args_, direction) {
    if (ctr == null) {
        return false;
    }
    var found = false, args = args_, fn = ctr.slots != null && ctr.slots[slot];
    if (typeof fn === 'string') {
        fn = ctr[fn];
    }
    if (typeof fn === 'function') {
        found = true;
        var isDisabled = ctr.slots.__disabled != null && ctr.slots.__disabled[slot];
        if (isDisabled !== true) {
            var result = args == null
                ? fn.call(ctr, sender)
                : fn.apply(ctr, [sender].concat(args));
            if (result === false) {
                return true;
            }
            if (is_ArrayLike(result)) {
                args = result;
            }
        }
    }
    if (direction === -1 && ctr.parent != null) {
        return _fire(ctr.parent, slot, sender, args, direction) || found;
    }
    if (direction === 1 && ctr.components != null) {
        var compos = ctr.components, imax = compos.length, i = -1;
        while (++i < imax) {
            found = _fire(compos[i], slot, sender, args, direction) || found;
        }
    }
    return found;
} // _fire()
export function _hasSlot(ctr, slot, direction, isActive) {
    if (ctr == null) {
        return false;
    }
    var slots = ctr.slots;
    if (slots != null && slots[slot] != null) {
        if (typeof slots[slot] === 'string') {
            slots[slot] = ctr[slots[slot]];
        }
        if (typeof slots[slot] === 'function') {
            if (isActive === true) {
                if (slots.__disabled == null || slots.__disabled[slot] !== true) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
    }
    if (direction === -1 && ctr.parent != null) {
        return _hasSlot(ctr.parent, slot, direction);
    }
    if (direction === 1 && ctr.components != null) {
        for (var i = 0, length = ctr.components.length; i < length; i++) {
            if (_hasSlot(ctr.components[i], slot, direction)) {
                return true;
            }
        }
    }
    return false;
}
;

import { _global } from '@utils/refs';
import { parser_ensureTemplateFunction } from '@core/parser/exports';
export var domLib;
export var Class;
export function _mask_ensureTmplFn(value) {
    return typeof value !== 'string'
        ? value
        : parser_ensureTemplateFunction(value);
}
;
export function _resolve_External(key) {
    return _global[key] || _exports[key] || _atma[key];
}
;
var _atma = _global.atma || {}, _exports = exports || {};
function resolve(a, b, c) {
    for (var i = 0; i < arguments.length; i++) {
        var val = _resolve_External(arguments[i]);
        if (val != null) {
            return val;
        }
    }
    return null;
}
domLib = resolve('jQuery', 'Zepto', '$');
Class = resolve('Class');
export function setDomLib(lib) {
    domLib = lib;
}

import { _hasSlot } from './utils';
import { log_warn } from '@core/util/reporters';
import { domLib } from '../scope-vars';
export function _toggle_all(ctr, slot, isActive) {
    var parent = ctr, previous = ctr;
    while ((parent = parent.parent) != null) {
        __toggle_slotState(parent, slot, isActive);
        if (parent.$ == null || parent.$.length === 0) {
            // we track previous for changing elements :disable state
            continue;
        }
        previous = parent;
    }
    __toggle_slotStateWithChilds(ctr, slot, isActive);
    __toggle_elementsState(previous, slot, isActive);
}
;
export function _toggle_single(ctr, slot, isActive) {
    __toggle_slotState(ctr, slot, isActive);
    if (!isActive && (_hasSlot(ctr, slot, -1, true) || _hasSlot(ctr, slot, 1, true))) {
        // there are some active slots; do not disable elements;
        return;
    }
    __toggle_elementsState(ctr, slot, isActive);
}
;
function __toggle_slotState(ctr, slot, isActive) {
    var slots = ctr.slots;
    if (slots == null || slots.hasOwnProperty(slot) === false) {
        return;
    }
    var disabled = slots.__disabled;
    if (disabled == null) {
        disabled = slots.__disabled = {};
    }
    disabled[slot] = isActive === false;
}
function __toggle_slotStateWithChilds(ctr, slot, isActive) {
    __toggle_slotState(ctr, slot, isActive);
    var compos = ctr.components;
    if (compos != null) {
        var imax = compos.length, i = 0;
        for (; i < imax; i++) {
            __toggle_slotStateWithChilds(compos[i], slot, isActive);
        }
    }
}
function __toggle_elementsState(ctr, slot, isActive) {
    if (ctr.$ == null) {
        log_warn('Controller has no elements to toggle state');
        return;
    }
    domLib()
        .add(ctr.$.filter('[data-signals]'))
        .add(ctr.$.find('[data-signals]'))
        .each(function (index, node) {
        var signals = node.getAttribute('data-signals');
        if (signals != null && signals.indexOf(slot) !== -1) {
            node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
        }
    });
}

import { class_create } from '@utils/class';
import { expression_eval, expression_varRefs } from '@project/expression/src/exports';
import { compo_attach } from '@compo/util/compo';
export function _compound(ctr, slotExpression, cb) {
    var slots = ctr.slots;
    if (slots == null) {
        slots = ctr.slots = {};
    }
    var handler = new SlotExpression(slotExpression, cb);
    for (var i = 0; i < handler.slots.length; i++) {
        var name = handler.slots[i].name;
        compo_attach(ctr, 'slots.' + name, handler.signalDelegate(name));
    }
    return handler;
}
;
var SlotExpression = class_create({
    slots: null,
    flags: null,
    cb: null,
    expression: null,
    constructor: function (expression, cb) {
        var str = expression.replace(/\s+/g, '');
        var refs = expression_varRefs(str);
        this.cb = cb;
        this.slots = [];
        this.flags = {};
        this.expression = str;
        for (var i = 0; i < refs.length; i++) {
            var name = refs[i];
            this.flags[name] = 0;
            this.slots[i] = {
                name: name,
                action: str[str.indexOf(name) - 1],
                index: i
            };
        }
    },
    signalDelegate: function (name) {
        var self = this;
        return function () {
            self.call(name);
        };
    },
    call: function (name) {
        var slot = this.findSlot(name);
        if (slot.action !== '^') {
            this.flags[name] = 1;
            var state = expression_eval(this.expression, this.flags);
            if (state) {
                this.cb();
            }
            return;
        }
        var prev = slot;
        do {
            prev = this.slots[prev.index - 1];
        } while (prev != null && prev.action === '^');
        if (prev) {
            this.flags[prev.name] = 0;
        }
    },
    findSlot: function (name) {
        for (var i = 0; i < this.slots.length; i++) {
            var slot = this.slots[i];
            if (slot.name === name) {
                return slot;
            }
        }
        return null;
    }
});

import { is_String, is_Function } from '@utils/is';
import { log_error } from '@core/util/reporters';
import { Dom } from '@core/dom/exports';
export function selector_parse(selector, type, direction) {
    if (selector == null)
        log_error('<compo>selector is undefined', type);
    if (typeof selector === 'object')
        return selector;
    var key, prop, nextKey;
    if (key == null) {
        switch (selector[0]) {
            case '#':
                key = 'id';
                selector = selector.substring(1);
                prop = 'attr';
                break;
            case '.':
                key = 'class';
                selector = sel_hasClassDelegate(selector.substring(1));
                prop = 'attr';
                break;
            case '[':
                var matches = /(\w+)\s*=([^\]]+)/.exec(selector);
                if (matches == null) {
                    throw Error('Invalid attributes selector: ' + selector);
                }
                key = matches[1];
                selector = matches[2].trim();
                prop = 'attr';
                break;
            default:
                key = type === Dom.SET ? 'tagName' : 'compoName';
                break;
        }
    }
    if (direction === 'up') {
        nextKey = 'parent';
    }
    else {
        nextKey = type === Dom.SET ? 'nodes' : 'components';
    }
    return {
        key: key,
        prop: prop,
        selector: selector,
        nextKey: nextKey
    };
}
;
export function selector_match(node, selector, type) {
    if (node == null)
        return false;
    if (is_String(selector)) {
        if (type == null)
            type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
        selector = selector_parse(selector, type);
    }
    var obj = selector.prop ? node[selector.prop] : node;
    if (obj == null)
        return false;
    if (is_Function(selector.selector))
        return selector.selector(obj[selector.key]);
    // regexp
    if (typeof selector.selector !== 'string' && selector.selector.test != null)
        return selector.selector.test(obj[selector.key]);
    // string | int
    /* jshint eqeqeq: false */
    return obj[selector.key] == selector.selector;
    /* jshint eqeqeq: true */
}
// PRIVATE
function sel_hasClassDelegate(matchClass) {
    return function (className) {
        return sel_hasClass(className, matchClass);
    };
}
// [perf] http://jsperf.com/match-classname-indexof-vs-regexp/2
function sel_hasClass(className, matchClass, index) {
    if (typeof className !== 'string')
        return false;
    if (index == null)
        index = 0;
    index = className.indexOf(matchClass, index);
    if (index === -1)
        return false;
    if (index > 0 && className.charCodeAt(index - 1) > 32)
        return sel_hasClass(className, matchClass, index + 1);
    var class_Length = className.length, match_Length = matchClass.length;
    if (index < class_Length - match_Length && className.charCodeAt(index + match_Length) > 32)
        return sel_hasClass(className, matchClass, index + 1);
    return true;
}

import { is_Array } from '@utils/is';
import { selector_match } from './selector';
export function find_findSingle(node, matcher) {
    if (node == null) {
        return null;
    }
    if (is_Array(node)) {
        var arr = node, imax = arr.length, i = -1;
        while (++i < imax) {
            var x = find_findSingle(node[i], matcher);
            if (x != null)
                return x;
        }
        return null;
    }
    if (selector_match(node, matcher)) {
        return node;
    }
    node = node[matcher.nextKey];
    return node == null
        ? null
        : find_findSingle(node, matcher);
}
;
export function find_findChildren(node, matcher) {
    if (node == null)
        return null;
    var arr = node[matcher.nextKey];
    if (arr == null) {
        return null;
    }
    if (is_Array(arr)) {
        var imax = arr.length, i = -1, out = [];
        while (++i < imax) {
            if (selector_match(arr[i], matcher)) {
                out.push(arr[i]);
            }
        }
        return out;
    }
}
;
export function find_findChild(node, matcher) {
    if (node == null)
        return null;
    var arr = node[matcher.nextKey];
    if (arr == null) {
        return null;
    }
    if (is_Array(arr)) {
        var imax = arr.length, i = -1;
        while (++i < imax) {
            if (selector_match(arr[i], matcher))
                return arr[i];
        }
        return null;
    }
}
;
export function find_findAll(node, matcher, out) {
    if (out == null)
        out = [];
    if (is_Array(node)) {
        var imax = node.length, i = 0, x;
        for (; i < imax; i++) {
            find_findAll(node[i], matcher, out);
        }
        return out;
    }
    if (selector_match(node, matcher))
        out.push(node);
    node = node[matcher.nextKey];
    return node == null
        ? out
        : find_findAll(node, matcher, out);
}
;

import { log_warn } from '@core/util/reporters';
import { find_findSingle } from '@compo/util/traverse';
/**
 *	Get component that owns an element
 **/
export var Anchor = {
    create: function (compo) {
        var id = compo.ID;
        if (id == null) {
            log_warn('Component should have an ID');
            return;
        }
        CACHE[id] = compo;
    },
    resolveCompo: function (el, silent) {
        if (el == null)
            return null;
        var ownerId;
        do {
            var id = el.getAttribute('x-compo-id');
            if (id != null) {
                if (ownerId == null) {
                    ownerId = id;
                }
                var compo = CACHE[id];
                if (compo != null) {
                    compo = find_findSingle(compo, {
                        key: 'ID',
                        selector: ownerId,
                        nextKey: 'components'
                    });
                    if (compo != null)
                        return compo;
                }
            }
            el = el.parentNode;
        } while (el != null && el.nodeType === 1);
        // if DEBUG
        ownerId && silent !== true && log_warn('No controller for ID', ownerId);
        // endif
        return null;
    },
    removeCompo: function (compo) {
        var id = compo.ID;
        if (id != null)
            CACHE[id] = void 0;
    },
    getByID: function (id) {
        return CACHE[id];
    }
};
var CACHE = {};

export var CODES = {
    "backspace": 8,
    "tab": 9,
    "return": 13,
    "enter": 13,
    "shift": 16,
    "ctrl": 17,
    "control": 17,
    "alt": 18,
    "option": 18,
    "fn": 255,
    "pause": 19,
    "capslock": 20,
    "esc": 27,
    "escape": 27,
    "space": 32,
    "pageup": 33,
    "pagedown": 34,
    "end": 35,
    "home": 36,
    "start": 36,
    "left": 37,
    "up": 38,
    "right": 39,
    "down": 40,
    "insert": 45,
    "ins": 45,
    "del": 46,
    "numlock": 144,
    "scroll": 145,
    "f1": 112,
    "f2": 113,
    "f3": 114,
    "f4": 115,
    "f5": 116,
    "f6": 117,
    "f7": 118,
    "f8": 119,
    "f9": 120,
    "f10": 121,
    "f11": 122,
    "f12": 123,
    ";": 186,
    "=": 187,
    "*": 106,
    "+": 107,
    "plus": 107,
    "-": 109,
    "minus": 109,
    ".": 190,
    "/": 191,
    ",": 188,
    "`": 192,
    "[": 219,
    "\\": 220,
    "]": 221,
    "'": 222
};
export var SHIFT_NUMS = {
    "`": "~",
    "1": "!",
    "2": "@",
    "3": "#",
    "4": "$",
    "5": "%",
    "6": "^",
    "7": "&",
    "8": "*",
    "9": "(",
    "0": ")",
    "-": "_",
    "=": "+",
    ";": ": ",
    "'": "\"",
    ",": "<",
    ".": ">",
    "/": "?",
    "\\": "|"
};
export var MODS = {
    '16': 'shiftKey',
    '17': 'ctrlKey',
    '18': 'altKey',
};

import { class_create } from '@utils/class';
import { IComb } from './IComb';
export var Key_MATCH_OK = 1;
export var Key_MATCH_FAIL = 2;
export var Key_MATCH_WAIT = 3;
export var Key_MATCH_NEXT = 4;
export var KeySequance = class_create(IComb, {
    index: 0,
    tryCall: function (event, codes, lastCode) {
        var matched = this.check_(codes, lastCode);
        if (matched === Key_MATCH_OK) {
            this.index = 0;
            this.fn.call(this.ctx, event);
        }
        return matched;
    },
    fail_: function () {
        this.index = 0;
        return Key_MATCH_FAIL;
    },
    check_: function (codes, lastCode) {
        var current = this.set[this.index], keys = current.keys, last = current.last;
        var l = codes.length;
        if (l < keys.length)
            return Key_MATCH_WAIT;
        if (l > keys.length)
            return this.fail_();
        if (last !== lastCode) {
            return this.fail_();
        }
        while (--l > -1) {
            if (keys[l] !== codes[l])
                return this.fail_();
        }
        if (this.index < this.set.length - 1) {
            this.index++;
            return Key_MATCH_NEXT;
        }
        this.index = 0;
        return Key_MATCH_OK;
    }
});

import { class_create } from '@utils/class';
import { IComb } from './IComb';
import { MODS } from './const';
import { Key_MATCH_FAIL, Key_MATCH_OK } from './KeySequance';
export var Key = class_create(IComb, {
    constructor: function (set, key, mods) {
        this.key = key;
        this.mods = mods;
    },
    tryCall: function (event, codes, lastCode) {
        if (event.type !== this.type || lastCode !== this.key) {
            return Key_MATCH_FAIL;
        }
        for (var key in this.mods) {
            if (event[key] !== this.mods[key])
                return Key_MATCH_FAIL;
        }
        this.fn.call(this.ctx, event);
        return Key_MATCH_OK;
    }
});
Key.create = function (set) {
    if (set.length !== 1)
        return null;
    var keys = set[0].keys, i = keys.length, mods = {
        shiftKey: false,
        ctrlKey: false,
        altKey: false
    };
    var key, mod, hasMod;
    while (--i > -1) {
        if (MODS.hasOwnProperty(keys[i]) === false) {
            if (key != null)
                return null;
            key = keys[i];
            continue;
        }
        mods[MODS[keys[i]]] = true;
        hasMod = true;
    }
    return new Key(set, key, mods);
};

import { Key } from './Key';
import { KeySequance } from './KeySequance';
import { CODES } from './const';
export function IComb(set) {
    this.set = set;
}
;
IComb.parse = function (str) {
    var parts = str.split(','), combs = [], imax = parts.length, i = 0;
    for (; i < imax; i++) {
        combs[i] = parseSingle(parts[i]);
    }
    return combs;
};
IComb.create = function (def, type, fn, ctx) {
    var codes = IComb.parse(def);
    var comb = Key.create(codes);
    if (comb == null) {
        comb = new KeySequance(codes);
    }
    comb.init(type, fn, ctx);
    return comb;
};
IComb.prototype = {
    type: null,
    ctx: null,
    set: null,
    fn: null,
    init: function (type, fn, ctx) {
        this.type = type;
        this.ctx = ctx;
        this.fn = fn;
    },
    tryCall: null
};
function parseSingle(str) {
    var keys = str.split('+'), imax = keys.length, i = 0, out = [], x, code;
    for (; i < imax; i++) {
        x = keys[i].trim();
        code = CODES[x];
        if (code === void 0) {
            if (x.length !== 1) {
                throw Error('Unexpected sequence. Neither a predefined key, nor a char: ' + x);
            }
            code = x.toUpperCase().charCodeAt(0);
        }
        out[i] = code;
    }
    return {
        last: out[imax - 1],
        keys: out.sort()
    };
}

export function event_bind(el, type, mix) {
    el.addEventListener(type, mix, false);
}
;
export function event_unbind(el, type, mix) {
    el.removeEventListener(type, mix, false);
}
;
export function event_getCode(event) {
    var code = event.keyCode || event.which;
    if (code >= 96 && code <= 105) {
        // numpad digits
        return code - 48;
    }
    return code;
}
;

export function filter_skippedInput(event, code) {
    if (event.ctrlKey || event.altKey)
        return false;
    return filter_isKeyboardInput(event.target);
}
;
export function filter_skippedComponent(compo) {
    if (compo.$ == null || compo.$.length === 0) {
        return false;
    }
    return filter_skippedElement(compo.$.get(0));
}
;
export function filter_skippedElement(el) {
    if (document.contains(el) === false)
        return false;
    if (el.style.display === 'none')
        return false;
    var disabled = el.disabled;
    if (disabled === true)
        return false;
    return true;
}
;
export function filter_isKeyboardInput(el) {
    var tag = el.tagName;
    if ('TEXTAREA' === tag) {
        return true;
    }
    if ('INPUT' !== tag) {
        return false;
    }
    return TYPELESS_INPUT.indexOf(' ' + el.type + ' ') === -1;
}
;
var TYPELESS_INPUT = ' button submit checkbox file hidden image radio range reset ';

import { event_getCode } from './utils';
import { filter_skippedInput } from './filters';
import { Key_MATCH_OK, Key_MATCH_NEXT, Key_MATCH_WAIT } from './KeySequance';
export function CombHandler() {
    this.keys = [];
    this.combs = [];
}
;
CombHandler.prototype = {
    keys: null,
    combs: null,
    attach: function (comb) {
        this.combs.push(comb);
    },
    off: function (fn) {
        var imax = this.combs.length, i = 0;
        for (; i < imax; i++) {
            if (this.combs[i].fn === fn) {
                this.combs.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    handle: function (type, code, event) {
        if (this.combs.length === 0) {
            return;
        }
        if (this.filter_(event, code)) {
            if (type === 'keyup' && this.keys.length > 0) {
                this.remove_(code);
            }
            return;
        }
        if (type === 'keydown') {
            if (this.add_(code)) {
                this.emit_(type, event, code);
            }
            return;
        }
        if (type === 'keyup') {
            this.emit_(type, event, code);
            this.remove_(code);
        }
    },
    handleEvent: function (event) {
        var code = event_getCode(event), type = event.type;
        this.handle(type, code, event);
    },
    reset: function () {
        this.keys.length = 0;
    },
    add_: function (code) {
        var imax = this.keys.length, i = 0, x;
        for (; i < imax; i++) {
            x = this.keys[i];
            if (x === code)
                return false;
            if (x > code) {
                this.keys.splice(i, 0, code);
                return true;
            }
        }
        this.keys.push(code);
        return true;
    },
    remove_: function (code) {
        var i = this.keys.length;
        while (--i > -1) {
            if (this.keys[i] === code) {
                this.keys.splice(i, 1);
                return;
            }
        }
    },
    emit_: function (type, event, lastCode) {
        var next = false, combs = this.combs, imax = combs.length, i = 0, x, stat;
        for (; i < imax; i++) {
            x = combs[i];
            if (x.type !== type)
                continue;
            stat = x.tryCall(event, this.keys, lastCode);
            if (Key_MATCH_OK === stat || stat === Key_MATCH_NEXT) {
                event.preventDefault();
            }
            if (stat === Key_MATCH_WAIT || stat === Key_MATCH_NEXT) {
                next = true;
            }
        }
    },
    filter_: function (event, code) {
        return filter_skippedInput(event, code);
    }
};

import { IComb } from './IComb';
import { event_getCode, event_bind } from './utils';
import { CombHandler } from './CombHandler';
export var Hotkey = {
    on: function (combDef, fn, compo) {
        if (handler == null)
            init();
        var comb = IComb.create(combDef, 'keydown', fn, compo);
        handler.attach(comb);
    },
    off: function (fn) {
        handler.off(fn);
    },
    handleEvent: function (event) {
        handler.handle(event.type, event_getCode(event), event);
    },
    reset: function () {
        handler.reset();
    }
};
var handler;
function init() {
    handler = new CombHandler();
    event_bind(window, 'keydown', Hotkey);
    event_bind(window, 'keyup', Hotkey);
    event_bind(window, 'focus', Hotkey.reset);
}

import { IComb } from './IComb';
import { event_bind, event_getCode } from './utils';
import { CombHandler } from './CombHandler';
import { compo_attachDisposer } from '../util/compo';
import { filter_isKeyboardInput } from './filters';
import { log_error } from '@core/util/reporters';
import { Key } from './Key';
import { Key_MATCH_OK } from './KeySequance';
import { Hotkey } from './Hotkey';
export var KeyboardHandler = {
    supports: function (event, param) {
        if (param == null)
            return false;
        switch (event) {
            case 'press':
            case 'keypress':
            case 'keydown':
            case 'keyup':
            case 'hotkey':
            case 'shortcut':
                return true;
        }
        return false;
    },
    on: function (el, type, def, fn) {
        if (type === 'keypress' || type === 'press') {
            type = 'keydown';
        }
        var comb = IComb.create(def, type, fn);
        if (comb instanceof Key) {
            event_bind(el, type, function (event) {
                var code = event_getCode(event);
                var r = comb.tryCall(event, null, code);
                if (r === Key_MATCH_OK) {
                    event.preventDefault();
                }
            });
            return;
        }
        var handler = new CombHandler;
        event_bind(el, 'keydown', handler);
        event_bind(el, 'keyup', handler);
        handler.attach(comb);
    },
    hotkeys: function (compo, hotkeys) {
        var fns = [], fn, comb;
        for (comb in hotkeys) {
            fn = hotkeys[comb];
            Hotkey.on(comb, fn, compo);
        }
        compo_attachDisposer(compo, function () {
            var comb, fn;
            for (comb in hotkeys) {
                Hotkey.off(hotkeys[comb]);
            }
        });
    },
    attach: function (el, type, comb, fn, ctr) {
        if (filter_isKeyboardInput(el)) {
            this.on(el, type, comb, fn);
            return;
        }
        var x = ctr;
        while (x && x.slots == null) {
            x = x.parent;
        }
        if (x == null) {
            log_error('Slot-component not found:', comb);
            return;
        }
        var hotkeys = x.hotkeys;
        if (hotkeys == null) {
            hotkeys = x.hotkeys = {};
        }
        hotkeys[comb] = fn;
    }
};

import { _global } from '@utils/refs';
import { fn_doNothing } from '@utils/fn';
export var isTouchable = 'ontouchstart' in _global;
export function event_bind(el, type, handler, opts) {
    el.addEventListener(type, handler, resolveOpts(opts));
}
;
export function event_unbind(el, type, handler, opts) {
    el.removeEventListener(type, handler, resolveOpts(opts));
}
;
export function event_trigger(el, type) {
    var event = new CustomEvent(type, {
        cancelable: true,
        bubbles: true
    });
    el.dispatchEvent(event);
}
;
var supportsCaptureOption = false;
if (_global.document != null) {
    document.createElement('div').addEventListener('click', fn_doNothing, {
        get capture() {
            supportsCaptureOption = true;
            return false;
        }
    });
}
var opts_DEFAULT = supportsCaptureOption ? { passive: true, capture: false } : false;
var resolveOpts = function (opts) {
    if (opts == null) {
        return opts_DEFAULT;
    }
    if (typeof opts === 'boolean') {
        if (opts === false)
            return opts_DEFAULT;
        return supportsCaptureOption ? { passive: true, capture: true } : true;
    }
    if (supportsCaptureOption === false) {
        return Boolean(opts.capture);
    }
    return opts;
};

import { event_bind } from '../util/event';
export function Touch(el, type, fn, opts) {
    this.el = el;
    this.fn = fn;
    this.dismiss = 0;
    event_bind(el, type, this, opts);
    event_bind(el, MOUSE_MAP[type], this, opts);
}
;
var MOUSE_MAP = {
    'mousemove': 'touchmove',
    'mousedown': 'touchstart',
    'mouseup': 'touchend'
};
// var TOUCH_MAP = {
//     'touchmove': 'mousemove',
//     'touchstart': 'mousedown',
//     'touchup': 'mouseup'
// };
Touch.prototype = {
    handleEvent: function (event) {
        switch (event.type) {
            case 'touchstart':
            case 'touchmove':
            case 'touchend':
                this.dismiss++;
                // event = prepairTouchEvent(event);
                this.fn(event);
                break;
            case 'mousedown':
            case 'mousemove':
            case 'mouseup':
                if (--this.dismiss < 0) {
                    this.dismiss = 0;
                    this.fn(event);
                }
                break;
        }
    }
};
// function prepairTouchEvent(event){
//     var touch = null,
//         touches = event.changedTouches;
//     if (touches && touches.length) {
//         touch = touches[0];
//     }
//     if (touch == null && event.touches) {
//         touch = event.touches[0];
//     }
//     if (touch == null) {
//         return event;
//     }
//     return createMouseEvent(event, touch);
// }
// function createMouseEvent (event, touch) {
//     var obj = Object.create(MouseEvent.prototype);
//     for (var key in event) {
//         obj[key] = event[key];
//     }
//     for (var key in PROPS) {
//         obj[key] = touch[key];
//     }
//     return new MouseEvent(TOUCH_MAP[event.type], obj);
// }
// var PROPS = {
//     clientX: 1,
//     clientY: 1,
//     pageX: 1,
//     pageY: 1,
//     screenX: 1,
//     screenY: 1
// };

import { event_bind, event_trigger, event_unbind } from '../util/event';
export function FastClick(el, fn, opts) {
    this.state = 0;
    this.el = el;
    this.fn = fn;
    this.startX = 0;
    this.startY = 0;
    this.tStart = 0;
    this.tEnd = 0;
    this.dismiss = 0;
    event_bind(el, 'touchstart', this, opts);
    event_bind(el, 'touchend', this, opts);
    event_bind(el, 'click', this, opts);
}
;
var threshold_TIME = 300, threshold_DIST = 10, timestamp_LastTouch = null;
FastClick.prototype = {
    handleEvent: function (event) {
        var type = event.type;
        switch (type) {
            case 'touchmove':
            case 'touchstart':
            case 'touchend':
                timestamp_LastTouch = event.timeStamp;
                this[type](event);
                break;
            case 'touchcancel':
                this.reset();
                break;
            case 'click':
                this.click(event);
                break;
        }
    },
    touchstart: function (event) {
        event_bind(document.body, 'touchmove', this);
        var e = event.touches[0];
        this.state = 1;
        this.tStart = event.timeStamp;
        this.startX = e.clientX;
        this.startY = e.clientY;
    },
    touchend: function (event) {
        this.tEnd = event.timeStamp;
        if (this.state === 1) {
            this.dismiss++;
            if (this.tEnd - this.tStart <= threshold_TIME) {
                this.call(event);
                return;
            }
            event_trigger(this.el, 'taphold');
            return;
        }
        this.reset();
    },
    click: function (event) {
        if (timestamp_LastTouch != null) {
            var dt = timestamp_LastTouch - event.timeStamp;
            if (dt < 500) {
                return;
            }
        }
        if (--this.dismiss > -1) {
            return;
        }
        if (this.tEnd !== 0) {
            var dt = event.timeStamp - this.tEnd;
            if (dt < 400)
                return;
        }
        this.dismiss = 0;
        this.call(event);
    },
    touchmove: function (event) {
        var e = event.touches[0];
        var dx = e.clientX - this.startX;
        if (dx < 0)
            dx *= -1;
        if (dx > threshold_DIST) {
            this.reset();
            return;
        }
        var dy = e.clientY - this.startY;
        if (dy < 0)
            dy *= -1;
        if (dy > threshold_DIST) {
            this.reset();
            return;
        }
    },
    reset: function () {
        this.state = 0;
        event_unbind(document.body, 'touchmove', this);
    },
    call: function (event) {
        this.reset();
        this.fn(event);
    }
};

import { Touch } from './Touch';
import { FastClick } from './FastClick';
import { isTouchable } from '../util/event';
export var TouchHandler = {
    supports: function (type) {
        if (isTouchable === false) {
            return false;
        }
        switch (type) {
            case 'click':
            case 'mousedown':
            case 'mouseup':
            case 'mousemove':
                return true;
        }
        return false;
    },
    on: function (el, type, fn, opts) {
        if ('click' === type) {
            return new FastClick(el, fn, opts);
        }
        return new Touch(el, type, fn, opts);
    }
};

import { domLib } from '../scope-vars';
import { Anchor } from '../compo/anchor';
import { compo_dispose, compo_detachChild } from './compo';
import { _Array_indexOf, _Array_splice } from '@utils/refs';
import { KeyboardHandler } from '../keyboard/Handler';
import { TouchHandler } from '../touch/Handler';
import { event_bind } from './event';
export function dom_addEventListener(el, event, fn, param, ctr) {
    var opts = !param ? void 0 : {
        capture: param.indexOf('capture') !== -1,
        passive: param.indexOf('nopassive') === -1,
    };
    if (TouchHandler.supports(event)) {
        TouchHandler.on(el, event, fn, opts);
        return;
    }
    if (KeyboardHandler.supports(event, param)) {
        KeyboardHandler.attach(el, event, param, fn, ctr);
        return;
    }
    // allows custom events - in x-signal, for example
    if (domLib != null) {
        if (event !== 'touchmove' &&
            event !== 'touchstart' &&
            event !== 'touchend' &&
            event !== 'wheel' &&
            event !== 'scroll') {
            domLib(el).on(event, fn);
            return;
        }
    }
    event_bind(el, event, fn, opts);
}
export function node_tryDispose(node) {
    if (node.hasAttribute('x-compo-id')) {
        var id = node.getAttribute('x-compo-id'), compo = Anchor.getByID(id);
        if (compo != null) {
            if (compo.$ == null || compo.$.length === 1) {
                compo_dispose(compo);
                compo_detachChild(compo);
                return;
            }
            var i = _Array_indexOf.call(compo.$, node);
            if (i !== -1)
                _Array_splice.call(compo.$, i, 1);
        }
    }
    node_tryDisposeChildren(node);
}
export function node_tryDisposeChildren(node) {
    var child = node.firstChild;
    while (child != null) {
        if (child.nodeType === 1)
            node_tryDispose(child);
        child = child.nextSibling;
    }
}

import { customAttr_register } from '@core/custom/exports';
import { log_error, log_warn } from '@core/util/reporters';
import { dom_addEventListener } from '../util/dom';
import { _hasSlot, _fire } from './utils';
import { _Array_slice } from '@utils/refs';
import { expression_evalStatements } from '@project/expression/src/exports';
import { compo_attach } from '@compo/util/compo';
_create('signal');
_createEvent('change');
_createEvent('click');
_createEvent('tap', 'click');
_createEvent('keypress');
_createEvent('keydown');
_createEvent('keyup');
_createEvent('mousedown');
_createEvent('mouseup');
_createEvent('press', 'keydown');
_createEvent('shortcut', 'keydown');
function _createEvent(name, type) {
    _create(name, type || name);
}
function _create(name, asEvent) {
    customAttr_register('x-' + name, 'client', function (node, attrValue, model, ctx, el, ctr) {
        var isSlot = node === ctr;
        _attachListener(el, ctr, attrValue, asEvent, isSlot);
    });
}
function _attachListener(el, ctr, definition, asEvent, isSlot) {
    var hasMany = definition.indexOf(';') !== -1, signals = '', arr = hasMany ? definition.split(';') : null, i = hasMany ? arr.length : 1;
    while (--i !== -1) {
        var signal = _handleDefinition(el, ctr, arr == null ? definition : arr[i], asEvent, isSlot);
        if (signal != null) {
            signals += ',' + signal + ',';
        }
    }
    if (signals !== '') {
        var KEY = 'data-signals';
        var attr = el.getAttribute(KEY);
        if (attr != null) {
            signals = attr + signals;
        }
        el.setAttribute(KEY, signals);
    }
}
function _handleDefinition(el, ctr, definition, asEvent, isSlot) {
    var match = rgx_DEF.exec(definition);
    if (match == null) {
        log_error("Signal definition is not resolved " + definition + ". The pattern is: (source((sourceArg))?:)?signal((expression))?");
        return null;
    }
    var source = match[2], sourceArg = match[4], signal = match[5], signalExpr = match[7];
    if (asEvent != null) {
        sourceArg = source;
        source = asEvent;
    }
    var fn = _createListener(ctr, signal, signalExpr);
    if (!source) {
        log_error('Signal: Eventname is not set', definition);
        return null;
    }
    if (!fn) {
        log_warn('Slot not found:', signal);
        return null;
    }
    if (isSlot) {
        compo_attach(ctr, 'slots.' + source, fn);
        return;
    }
    dom_addEventListener(el, source, fn, sourceArg, ctr);
    return signal;
}
function _createListener(ctr, slot, expr) {
    if (_hasSlot(ctr, slot, -1) === false) {
        return null;
    }
    return function (event) {
        var args;
        if (arguments.length > 1) {
            args = _Array_slice.call(arguments, 1);
        }
        if (expr != null) {
            var p = ctr, model;
            while (p != null && model == null) {
                model = p.model;
                p = p.parent;
            }
            var arr = expression_evalStatements(expr, model, null, ctr);
            args = args == null ? arr : args.concat(arr);
        }
        _fire(ctr, slot, event, args, -1);
    };
}
// click: fooSignal(barArg)
// ctrl+enter: doSmth(arg, arg2)
var rgx_DEF = /^\s*(([\w\+\-_]+)(\s*\(\s*(\w+)\s*\))?\s*:)?\s*(\w+)(\s*\(([^)]+)\)\s*)?\s*$/;

import { log_warn, log_error } from '@core/util/reporters';
import { _toggle_all, _toggle_single } from './toggle';
import { _fire } from './utils';
import { _compound } from './compound';
import './attributes';
export var CompoSignals = {
    signal: {
        toggle: _toggle_all,
        // to parent
        emitOut: function (ctr, slot, sender, args) {
            var captured = _fire(ctr, slot, sender, args, -1);
            // if DEBUG
            !captured && log_warn('Signal', slot, 'was not captured');
            // endif
        },
        // to children
        emitIn: function (ctr, slot, sender, args) {
            _fire(ctr, slot, sender, args, 1);
        },
        enable: function (ctr, slot) {
            _toggle_all(ctr, slot, true);
        },
        disable: function (ctr, slot) {
            _toggle_all(ctr, slot, false);
        }
    },
    slot: {
        toggle: _toggle_single,
        enable: function (ctr, slot) {
            _toggle_single(ctr, slot, true);
        },
        disable: function (ctr, slot) {
            _toggle_single(ctr, slot, false);
        },
        invoke: function (ctr, slot, event, args) {
            var slots = ctr.slots;
            if (slots == null || typeof slots[slot] !== 'function') {
                log_error('Slot not found', slot, ctr);
                return null;
            }
            if (args == null) {
                return slots[slot].call(ctr, event);
            }
            return slots[slot].apply(ctr, [event].concat(args));
        },
        attach: _compound
    }
};

import { class_create } from '@utils/class';
import { obj_extend } from '@utils/obj';
import { _Array_slice } from '@utils/refs';
import { class_Dfr } from '@utils/class/Dfr';
import { CompoSignals } from '@compo/signal/exports';
export var CompoStaticsAsync = {
    pause: function (compo, ctx) {
        if (ctx != null) {
            if (ctx.defers == null) {
                // async components
                ctx.defers = [];
            }
            if (ctx.resolve == null) {
                obj_extend(ctx, class_Dfr.prototype);
            }
            ctx.async = true;
            ctx.defers.push(compo);
            ctx.defer();
        }
        obj_extend(compo, CompoProto);
        var slots = Slots.wrap(compo);
        return function () {
            // Restore only signals in case smth. will be emitted during resume
            Slots.unwrap(compo, slots, true, false);
            CompoStaticsAsync.resume(compo, ctx);
            Slots.unwrap(compo, slots, false, true);
        };
    },
    resume: function (compo, ctx) {
        compo.async = false;
        // fn can be null when calling resume synced after pause
        if (compo.resume) {
            compo.resume();
        }
        if (ctx == null) {
            return;
        }
        var busy = false, dfrs = ctx.defers, imax = dfrs.length, i = -1, x;
        while (++i < imax) {
            x = dfrs[i];
            if (x === compo) {
                dfrs[i] = null;
                continue;
            }
            busy = busy || x != null;
        }
        if (busy === false)
            ctx.resolve();
    },
    await: function (compo) {
        return new Awaiter().await(compo);
    }
};
/** private */
var CompoProto = {
    async: true,
    resume: null,
    await: function (resume, deep) {
        if (deep === true) {
            CompoStaticsAsync.await(this).then(resume);
            return;
        }
        if (this.async === false) {
            resume();
            return;
        }
        if (this.resume == null) {
            this.resume = resume;
            return;
        }
        var fn = this.resume;
        this.resume = function () {
            fn.call(this);
            resume.call(this);
        };
    }
};
var Awaiter = class_create(class_Dfr, {
    isReady: false,
    count: 0,
    constructor: function () {
        this.dequeue = this.dequeue.bind(this);
    },
    enqueue: function () {
        this.count++;
    },
    dequeue: function () {
        if (--this.count === 0 && this.isReady === true) {
            this.resolve();
        }
    },
    await: function (compo) {
        awaitDeep(compo, this);
        if (this.count === 0) {
            this.resolve();
            return this;
        }
        this.isReady = true;
        return this;
    }
});
function awaitDeep(compo, awaiter) {
    if (compo.async === true) {
        awaiter.enqueue();
        compo.await(awaiter.dequeue);
        return;
    }
    var arr = compo.components;
    if (arr == null)
        return;
    var imax = arr.length, i = -1;
    while (++i < imax) {
        awaitDeep(arr[i], awaiter);
    }
}
var Slots = {
    /* for now wrap only `domInsert` */
    wrap: function (compo) {
        var domInsertFn = compo.slots && compo.slots.domInsert;
        if (domInsertFn == null) {
            return null;
        }
        var slots = {
            /* [ Original Fn, Arguments if called] */
            domInsert: [domInsertFn, null]
        };
        compo.slots.domInsert = function () {
            slots.domInsert[1] = _Array_slice.call(arguments);
        };
        return slots;
    },
    unwrap: function (compo, slots, shouldRestore, shouldEmit) {
        if (slots == null) {
            return;
        }
        for (var key in slots) {
            var data = slots[key];
            if (shouldRestore) {
                compo.slots[key] = data[0];
            }
            if (shouldEmit && data[1] != null) {
                CompoSignals.signal.emitIn(compo, key, data[1]);
            }
        }
    }
};

import { coll_remove, coll_indexOf } from '@utils/coll';
import { is_String, is_Function } from '@utils/is';
import { obj_getProperty, obj_setProperty } from '@utils/obj';
import { _Array_slice } from '@utils/refs';
import { mask_merge } from '@core/feature/merge';
import { error_withCompo, reporter_createErrorNode } from '@core/util/reporters';
import { CompoStaticsAsync } from '../compo/async';
import { Anchor } from '../compo/anchor';
import { parser_parse } from '@core/parser/exports';
export function compo_dispose(compo) {
    if (compo.dispose != null) {
        compo.dispose();
    }
    Anchor.removeCompo(compo);
    var compos = compo.components;
    if (compos != null) {
        var i = compos.length;
        while (--i > -1) {
            compo_dispose(compos[i]);
        }
    }
    compo.parent = null;
    compo.model = null;
    compo.components = null;
}
export function compo_detachChild(childCompo) {
    var parent = childCompo.parent;
    if (parent == null) {
        return;
    }
    var compos = parent.components;
    if (compos == null) {
        return;
    }
    var removed = coll_remove(compos, childCompo);
    if (removed === false) {
        log_warn('<compo:remove> - i`m not in parents collection', childCompo);
    }
}
export function compo_ensureTemplate(compo) {
    if (compo.nodes == null) {
        compo.nodes = getTemplateProp_(compo);
        return;
    }
    var behaviour = compo.meta.template;
    if (behaviour == null || behaviour === 'replace') {
        return;
    }
    var template = getTemplateProp_(compo);
    if (template == null) {
        return;
    }
    if (behaviour === 'merge') {
        compo.nodes = mask_merge(template, compo.nodes, compo);
        return;
    }
    if (behaviour === 'join') {
        compo.nodes = [template, compo.nodes];
        return;
    }
    log_error('Invalid meta.nodes behaviour', behaviour);
}
export function compo_attachDisposer(compo, disposer) {
    if (compo.dispose == null) {
        compo.dispose = disposer;
        return;
    }
    var prev = compo.dispose;
    compo.dispose = function () {
        disposer.call(this);
        prev.call(this);
    };
}
export function compo_attach(compo, name, fn) {
    var current = obj_getProperty(compo, name);
    if (is_Function(current)) {
        var wrapper = function () {
            var args = _Array_slice.call(arguments);
            fn.apply(compo, args);
            current.apply(compo, args);
        };
        obj_setProperty(compo, name, wrapper);
        return;
    }
    if (current == null) {
        obj_setProperty(compo, name, fn);
        return;
    }
    throw Error('Cann`t attach ' + name + ' to not a Function');
}
export function compo_removeElements(compo) {
    if (compo.$) {
        compo.$.remove();
        return;
    }
    var els = compo.elements;
    if (els) {
        var i = -1, imax = els.length;
        while (++i < imax) {
            if (els[i].parentNode)
                els[i].parentNode.removeChild(els[i]);
        }
        return;
    }
    var compos = compo.components;
    if (compos) {
        var i = -1, imax = compos.length;
        while (++i < imax) {
            compo_removeElements(compos[i]);
        }
    }
}
export function compo_cleanElements(compo) {
    var els = compo.$ || compo.elements;
    if (els == null || els.length === 0) {
        return;
    }
    var x = els[0];
    var parent = compo.parent;
    for (var parent = compo.parent; parent != null; parent = parent.parent) {
        var arr = parent.$ || parent.elements;
        if (arr == null) {
            continue;
        }
        var i = coll_indexOf(arr, x);
        if (i === -1) {
            break;
        }
        arr.splice(i, 1);
        if (els.length > 1) {
            var cursor = 1;
            for (var j = i; j < arr.length; j++) {
                if (arr[j] === els[cursor]) {
                    arr.splice(j, 1);
                    j--;
                    cursor++;
                }
            }
        }
    }
}
export function compo_prepairAsync(dfr, compo, ctx) {
    var resume = CompoStaticsAsync.pause(compo, ctx);
    var x = dfr.then(resume, onError);
    function onError(error) {
        compo_errored(compo, error);
        error_withCompo(error, compo);
        resume();
    }
}
export function compo_errored(compo, error) {
    var msg = '[%] Failed.'.replace('%', compo.compoName || compo.tagName);
    if (error) {
        var desc = error.message || error.statusText || String(error);
        if (desc) {
            msg += ' ' + desc;
        }
    }
    compo.nodes = reporter_createErrorNode(msg);
    compo.renderEnd = compo.render = compo.renderStart = null;
}
function getTemplateProp_(compo) {
    var template = compo.template;
    if (template == null) {
        var attr = compo.attr;
        if (attr == null)
            return null;
        template = attr.template;
        if (template == null)
            return null;
        delete compo.attr.template;
    }
    if (typeof template === 'object')
        return template;
    if (is_String(template)) {
        if (template.charCodeAt(0) === 35 && /^#[\w\d_-]+$/.test(template)) {
            // #
            var node = document.getElementById(template.substring(1));
            if (node == null) {
                log_warn('Template not found by id:', template);
                return null;
            }
            template = node.innerHTML;
        }
        return parser_parse(template);
    }
    log_warn('Invalid template', typeof template);
    return null;
}

import { log_error, error_withCompo } from '@core/util/reporters';
import { compo_errored } from './compo';
import { is_Function } from '@utils/is';
import { obj_create } from '@utils/obj';
import { expression_evalStatements, expression_eval } from '@project/expression/src/exports';
import { Di } from '@core/feature/Di';
import { CompoProto } from '@compo/compo/CompoProto';
// == Meta Attribute and Property Handler
export var compo_meta_toAttributeKey = _getProperty;
export function compo_meta_prepairAttributesHandler(Proto, type) {
    var meta = getMetaProp_(Proto);
    var attr = meta.attributes;
    if (attr != null) {
        var hash = _createHash(Proto, attr, true);
        meta.readAttributes = _attr_setProperties_Delegate(hash);
    }
    var props = meta.properties;
    if (props != null) {
        var hash = _createHash(Proto, attr, false);
        meta.readProperties = _attr_setProperties_Delegate(hash);
    }
}
function _createHash(Proto, metaObj, isAttr) {
    var hash = {};
    for (var key in metaObj) {
        _attr_setProperty_Delegate(Proto, key, metaObj[key], isAttr, 
        /*out*/ hash);
    }
    return hash;
}
function _attr_setProperties_Delegate(hash) {
    return function (compo, attr, model, container) {
        for (var key in hash) {
            var fn = hash[key];
            var val = attr[key];
            var error = fn(compo, key, val, model, container, attr);
            if (error == null) {
                continue;
            }
            _errored(compo, error, key, val);
            return false;
        }
        return true;
    };
}
function _attr_setProperty_Delegate(Proto, metaKey, metaVal, isAttr, 
/*out*/ hash) {
    var optional = metaKey.charCodeAt(0) === 63, // ?
    default_ = null, attrName = optional ? metaKey.substring(1) : metaKey;
    var property = isAttr ? _getProperty(attrName, metaVal) : attrName;
    var fn = null;
    var type = typeof metaVal;
    if ('string' === type) {
        if (metaVal === 'string' ||
            metaVal === 'number' ||
            metaVal === 'boolean') {
            fn = _ensureFns[metaVal];
        }
        else {
            optional = true;
            default_ = metaVal;
            fn = _ensureFns_Delegate.any();
        }
    }
    else if ('boolean' === type || 'number' === type) {
        optional = true;
        fn = _ensureFns[type];
        default_ = metaVal;
    }
    else if ('function' === type) {
        fn = metaVal;
    }
    else if (metaVal == null) {
        fn = _ensureFns_Delegate.any();
    }
    else if (metaVal instanceof RegExp) {
        fn = _ensureFns_Delegate.regexp(metaVal);
    }
    else if (typeof metaVal === 'object') {
        fn = _ensureFns_Delegate.options(metaVal);
        default_ = metaVal['default'];
        if (default_ !== void 0) {
            optional = true;
        }
    }
    if (fn == null) {
        log_error('Function expected for the attr. handler', metaKey);
        return;
    }
    var factory_ = is_Function(default_) ? default_ : null;
    Proto[property] = null;
    Proto = null;
    hash[attrName] = function (compo, attrName, attrVal, model, container, attr) {
        if (attrVal == null) {
            if (optional === false) {
                return Error("Expected attribute " + attrName);
            }
            if (factory_ != null) {
                compo[property] = factory_.call(compo, model, container, attr);
                return null;
            }
            if (default_ != null) {
                compo[property] = default_;
            }
            return null;
        }
        var val = fn.call(compo, attrVal, model, container, attrName);
        if (val instanceof Error) {
            return val;
        }
        compo[property] = val;
        return null;
    };
}
function _toCamelCase_Replacer(full, char_) {
    return char_.toUpperCase();
}
function _getProperty(attrName, attrDef) {
    if (attrDef != null && typeof attrDef !== 'function' && attrDef.name != null) {
        return attrDef.name;
    }
    var prop = attrName;
    if (prop.charCodeAt(0) !== 120) {
        // x
        prop = 'x-' + prop;
    }
    return prop.replace(/-(\w)/g, _toCamelCase_Replacer);
}
function _errored(compo, error, key, val) {
    error.message = compo.compoName + " - attribute '" + key + "': " + error.message;
    compo_errored(compo, error);
    log_error(error.message, '. Current: ', val);
}
var _ensureFns = {
    string: function (x) {
        return typeof x === 'string' ? x : Error('String');
    },
    number: function (x) {
        var num = Number(x);
        return num === num ? num : Error('Number');
    },
    boolean: function (x, compo, model, attrName) {
        if (typeof x === 'boolean')
            return x;
        if (x === attrName)
            return true;
        if (x === 'true' || x === '1')
            return true;
        if (x === 'false' || x === '0')
            return false;
        return Error('Boolean');
    }
};
var _ensureFns_Delegate = {
    regexp: function (rgx) {
        return function (x) {
            return rgx.test(x) ? x : Error('RegExp');
        };
    },
    any: function () {
        return function (x) {
            return x;
        };
    },
    options: function (opts) {
        var type = opts.type, def = opts.default || _defaults[type], validate = opts.validate, transform = opts.transform;
        return function (x, model, container, attrName) {
            if (!x)
                return def;
            if (type != null) {
                var fn = _ensureFns[type];
                if (fn != null) {
                    x = fn.apply(this, arguments);
                    if (x instanceof Error) {
                        return x;
                    }
                }
            }
            if (validate != null) {
                var error = validate.call(this, x, model, container);
                if (error) {
                    return Error(error);
                }
            }
            if (transform != null) {
                x = transform.call(this, x, model, container);
            }
            return x;
        };
    }
};
var _defaults = {
    string: '',
    boolean: false,
    number: 0
};
// == Meta Attribute Handler
export function compo_meta_prepairArgumentsHandler(Proto) {
    var meta = getMetaProp_(Proto);
    var args = meta.arguments;
    if (args != null) {
        var i = args.length;
        while (--i > -1) {
            if (typeof args[i] === 'string') {
                args[i] = { name: args[i], type: null };
            }
        }
        meta.readArguments = _modelArgsBinding_Delegate(args);
    }
}
function _modelArgsBinding_Delegate(args) {
    return function (expr, model, ctx, ctr) {
        return _modelArgsBinding(args, expr, model, ctx, ctr);
    };
}
function _modelArgsBinding(args, expr, model, ctx, ctr) {
    var arr = null;
    if (expr == null) {
        var i = args.length;
        arr = new Array(i);
        while (--i > -1) {
            arr[i] = expression_eval(args[i].name, model, ctx, ctr);
        }
    }
    else {
        arr = expression_evalStatements(expr, model, ctx, ctr);
    }
    var out = {}, arrMax = arr.length, argsMax = args.length, i = -1;
    while (++i < arrMax && i < argsMax) {
        var val = arr[i];
        if (val == null) {
            var type = args[i].type;
            if (type != null) {
                var Type = type;
                if (typeof type === 'string') {
                    Type = expression_eval(type, model, ctx, ctr);
                    if (Type == null) {
                        error_withCompo(type + ' was not resolved', ctr);
                    }
                    else {
                        val = Di.resolve(Type);
                    }
                }
            }
        }
        out[args[i].name] = val;
    }
    return out;
}
function getMetaProp_(Proto) {
    var meta = Proto.meta;
    if (meta == null) {
        meta = Proto.meta = obj_create(CompoProto.meta);
    }
    return meta;
}

import { log_error } from '@core/util/reporters';
import { is_Function } from '@utils/is';
var Tween = /** @class */ (function () {
    function Tween(key, prop, start, end, transition) {
        var parts = /(\d+m?s)\s*([\w\-]+)?/.exec(transition);
        this.duration = _toMs(parts[1], transition);
        this.timing = _toTimingFn(parts[2]);
        this.start = +start;
        this.end = +end;
        this.diff = this.end - this.start;
        this.key = key;
        this.prop = prop;
        this.animating = true;
    }
    Tween.prototype.tick = function (timestamp, parent) {
        if (this.startedAt == null) {
            this.startedAt = timestamp;
        }
        var d = timestamp - this.startedAt;
        var x = this.timing(d, this.start, this.diff, this.duration);
        if (d >= this.duration) {
            this.animating = false;
            x = this.end;
        }
        parent.attr[this.key] = x;
        if (this.prop) {
            parent[this.prop] = x;
        }
    };
    return Tween;
}());
export { Tween };
/*2ms;3s*/
function _toMs(str, easing) {
    if (str == null) {
        log_error('Easing: Invalid duration in ' + easing);
        return 0;
    }
    var d = parseFloat(str);
    if (str.indexOf('ms') > -1) {
        return d;
    }
    if (str.indexOf('s') > -1) {
        return d * 1000;
    }
    throw Error('Unsupported duration:' + str);
}
function _toTimingFn(str) {
    if (str == null) {
        return Fns.linear;
    }
    var fn = Fns[str];
    if (is_Function(fn) === false) {
        log_error('Unsupported timing:' + str + '. Available:' + Object.keys(Fns).join(','));
        return Fns.linear;
    }
    return fn;
}
// Easing functions by Robert Penner
// Source: http://www.robertpenner.com/easing/
// License: http://www.robertpenner.com/easing_terms_of_use.html
var Fns = {
    // t: is the current time (or position) of the tween.
    // b: is the beginning value of the property.
    // c: is the change between the beginning and destination value of the property.
    // d: is the total time of the tween.
    // jshint eqeqeq: false, -W041: true
    linear: function (t, b, c, d) {
        return c * t / d + b;
    },
    linearEase: function (t, b, c, d) {
        return c * t / d + b;
    },
    easeInQuad: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (t, b, c, d) {
        if (t == 0)
            return b;
        if (t == d)
            return b + c;
        if ((t /= d / 2) < 1)
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (t, b, c, d) {
        if ((t /= d / 2) < 1)
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0)
            return b;
        if ((t /= d) == 1)
            return b + c;
        if (!p)
            p = d * 0.3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else
            s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0)
            return b;
        if ((t /= d) == 1)
            return b + c;
        if (!p)
            p = d * 0.3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else
            s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (t, b, c, d) {
        // jshint eqeqeq: false, -W041: true
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0)
            return b;
        if ((t /= d / 2) == 2)
            return b + c;
        if (!p)
            p = d * (0.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else
            s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1)
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    easeInBack: function (t, b, c, d, s) {
        // jshint eqeqeq: false, -W041: true
        if (s == undefined)
            s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (t, b, c, d, s) {
        // jshint eqeqeq: false, -W041: true
        if (s == undefined)
            s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (t, b, c, d, s) {
        // jshint eqeqeq: false, -W041: true
        if (s == undefined)
            s = 1.70158;
        if ((t /= d / 2) < 1)
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (t, b, c, d) {
        return c - Fns.easeOutBounce(d - t, 0, c, d) + b;
    },
    easeOutBounce: function (t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        }
        else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        }
        else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        }
        else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    easeInOutBounce: function (t, b, c, d) {
        if (t < d / 2)
            return Fns.easeInBounce(t * 2, 0, c, d) * 0.5 + b;
        return Fns.easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
};

import { class_create } from '@utils/class';
import { compo_attachDisposer } from '@compo/util/compo';
import { Tween } from './Tween';
import { ani_requestFrame, ani_clearFrame } from '@compo/util/ani';
export var TweenManager = class_create({
    animating: false,
    frame: null,
    constructor: function (compo) {
        this.parent = compo;
        this.tweens = {};
        this.tick = this.tick.bind(this);
        compo_attachDisposer(compo, this.dispose.bind(this));
    },
    start: function (key, prop, start, end, easing) {
        // Tween is not disposable, as no resources are held. So if a tween already exists, it will be just overwritten.
        this.tweens[key] = new Tween(key, prop, start, end, easing);
        this.process();
    },
    process: function () {
        if (this.animating) {
            return;
        }
        this.animation = true;
        this.frame = ani_requestFrame.call(null, this.tick);
    },
    dispose: function () {
        ani_clearFrame.call(null, this.frame);
    },
    tick: function (timestamp) {
        var busy = false;
        for (var key in this.tweens) {
            var tween = this.tweens[key];
            if (tween == null) {
                continue;
            }
            tween.tick(timestamp, this.parent);
            if (tween.animating === false) {
                this.tweens[key] = null;
                continue;
            }
            busy = true;
        }
        if (this.parent.onEnterFrame) {
            this.parent.onEnterFrame();
        }
        if (busy) {
            this.frame = ani_requestFrame.call(null, this.tick);
            return;
        }
        this.animating = false;
    }
});

import { is_Object } from '@utils/is';
import { _global } from '@utils/refs';
import { TweenManager } from '@compo/tween/TweenManager';
export var ani_requestFrame = _global.requestAnimationFrame;
export var ani_clearFrame = _global.cancelAnimationFrame;
export function ani_updateAttr(compo, key, prop, val, meta) {
    var transition = compo.attr[key + '-transition'];
    if (transition == null && is_Object(meta)) {
        transition = meta.transition;
    }
    if (transition == null) {
        compo.attr[key] = val;
        if (prop != null) {
            compo[prop] = val;
        }
        _refresh(compo);
        return;
    }
    var tweens = compo.__tweens;
    if (tweens == null) {
        tweens = compo.__tweens = new TweenManager(compo);
    }
    var start = compo[prop];
    var end = val;
    tweens.start(key, prop, start, end, transition);
}
;
function _refresh(compo) {
    if (compo.onEnterFrame == null) {
        return;
    }
    if (compo.__frame != null) {
        ani_clearFrame.call(null, compo.__frame);
    }
    compo.__frame = ani_requestFrame.call(null, compo.onEnterFrame);
}

import { is_Function } from '@utils/is';
import { _global } from '@utils/refs';
import { log_warn } from '@core/util/reporters';
export function dfr_isBusy(dfr) {
    if (dfr == null || typeof dfr.then !== 'function')
        return false;
    // Class.Deferred
    if (is_Function(dfr.isBusy))
        return dfr.isBusy();
    // jQuery Deferred
    if (is_Function(dfr.state))
        return dfr.state() === 'pending';
    if (dfr instanceof Promise) {
        return true;
    }
    log_warn('Class, jQuery or native promise expected');
    return false;
}
var Promise = _global.Promise;

import { KeyboardHandler } from '../keyboard/Handler';
/**
 *	Combine .filter + .find
 */
export function domLib_find($set, selector) {
    return $set.filter(selector).add($set.find(selector));
}
;
export function domLib_on($set, type, selector, fn) {
    if (selector == null) {
        return $set.on(type, fn);
    }
    if (KeyboardHandler.supports(type, selector)) {
        return $set.each(function (i, el) {
            KeyboardHandler.on(el, type, selector, fn);
        });
    }
    return $set
        .on(type, selector, fn)
        .filter(selector)
        .on(type, fn);
}
;

import { fn_proxy } from '@utils/fn';
import { domLib_on } from '../util/domLib';
export var Events_ = {
    on: function (component, events, $el) {
        if ($el == null) {
            $el = component.$;
        }
        var isarray = events instanceof Array, length = isarray ? events.length : 1;
        for (var i = 0, x; isarray ? i < length : i < 1; i++) {
            x = isarray ? events[i] : events;
            if (x instanceof Array) {
                // generic jQuery .on Arguments
                if (EventDecorator != null) {
                    x[0] = EventDecorator(x[0]);
                }
                $el.on.apply($el, x);
                continue;
            }
            for (var key in x) {
                var fn = typeof x[key] === 'string' ? component[x[key]] : x[key], semicolon = key.indexOf(':'), type, selector;
                if (semicolon !== -1) {
                    type = key.substring(0, semicolon);
                    selector = key.substring(semicolon + 1).trim();
                }
                else {
                    type = key;
                }
                if (EventDecorator != null) {
                    type = EventDecorator(type);
                }
                domLib_on($el, type, selector, fn_proxy(fn, component));
            }
        }
    },
    setEventDecorator: function (x) {
        EventDecorator = x;
    }
};
var EventDecorator = null;

import { log_warn } from '@core/util/reporters';
import { Dom } from '@core/dom/exports';
import { renderer_render } from '@core/renderer/exports';
import { domLib } from '../scope-vars';
import { Anchor } from '../compo/anchor';
import { node_tryDispose, node_tryDisposeChildren } from '../util/dom';
import { find_findSingle } from '../util/traverse';
import { selector_parse } from '../util/selector';
import { CompoSignals } from '../signal/exports';
export function domLib_initialize() {
    if (domLib == null || domLib.fn == null)
        return;
    domLib.fn.compo = function (selector) {
        if (this.length === 0)
            return null;
        var compo = Anchor.resolveCompo(this[0], true);
        return selector == null
            ? compo
            : find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
    };
    domLib.fn.model = function (selector) {
        var compo = this.compo(selector);
        if (compo == null)
            return null;
        var model = compo.model;
        while (model == null && compo.parent) {
            compo = compo.parent;
            model = compo.model;
        }
        return model;
    };
    // insert
    (function () {
        var jQ_Methods = [
            'append',
            'prepend',
            'before',
            'after'
        ];
        [
            'appendMask',
            'prependMask',
            'beforeMask',
            'afterMask'
        ].forEach(function (method, index) {
            domLib.fn[method] = function (template, model, ctr, ctx) {
                if (this.length === 0) {
                    return this;
                }
                if (this.length > 1) {
                }
                if (ctr == null) {
                    ctr = index < 2
                        ? this.compo()
                        : this.parent().compo();
                }
                var isUnsafe = false;
                if (ctr == null) {
                    ctr = {};
                    isUnsafe = true;
                }
                if (ctr.components == null) {
                    ctr.components = [];
                }
                var compos = ctr.components, i = compos.length, fragment = renderer_render(template, model, ctx, null, ctr);
                var self = this[jQ_Methods[index]](fragment), imax = compos.length;
                for (; i < imax; i++) {
                    CompoSignals.signal.emitIn(compos[i], 'domInsert');
                }
                if (isUnsafe && imax !== 0) {
                    // if DEBUG
                    log_warn('$.', method, '- parent controller was not found in Elements DOM.', 'This can lead to memory leaks.');
                    log_warn('Specify the controller directly, via $.', method, '(template[, model, controller, ctx])');
                    // endif
                }
                return self;
            };
        });
    }());
    // remove
    (function () {
        var jq_remove = domLib.fn.remove, jq_empty = domLib.fn.empty;
        domLib.fn.removeAndDispose = function () {
            this.each(each_tryDispose);
            return jq_remove.call(this);
        };
        domLib.fn.emptyAndDispose = function () {
            this.each(each_tryDisposeChildren);
            return jq_empty.call(this);
        };
        function each_tryDispose(i, el) {
            node_tryDispose(el);
        }
        function each_tryDisposeChildren(i, el) {
            node_tryDisposeChildren(el);
        }
    }());
}
// try to initialize the dom lib, or is then called from `setDOMLibrary`
domLib_initialize();

import { Dom } from '@core/dom/exports';
import { selector_parse } from '../util/selector';
import { find_findChild, find_findChildren, find_findSingle, find_findAll } from '../util/traverse';
export function compo_find(compo, selector) {
    return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
}
export function compo_findAll(compo, selector) {
    return find_findAll(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
}
export function compo_closest(compo, selector) {
    return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
}
export function compo_children(compo, selector) {
    return find_findChildren(compo, selector_parse(selector, Dom.CONTROLLER));
}
export function compo_child(compo, selector) {
    return find_findChild(compo, selector_parse(selector, Dom.CONTROLLER));
}

var hasTouch = (function () {
    if (typeof document === 'undefined' || document == null) {
        return false;
    }
    if ('createTouch' in document) {
        return true;
    }
    try {
        return !!document.createEvent('TouchEvent').initTouchEvent;
    }
    catch (error) {
        return false;
    }
}());
export var EventsDeco = {
    'touch': function (type) {
        if (hasTouch === false) {
            return type;
        }
        if ('click' === type) {
            return 'touchend';
        }
        if ('mousedown' === type) {
            return 'touchstart';
        }
        if ('mouseup' === type) {
            return 'touchend';
        }
        if ('mousemove' === type) {
            return 'touchmove';
        }
        return type;
    }
};

import { domLib_find } from '../util/domLib';
import { domLib, setDomLib } from '../scope-vars';
import { domLib_initialize } from '../jcompo/jCompo';
import { compo_find } from './find';
import { Events_ } from './events';
import { EventsDeco } from './EventsDeco';
export var CompoConfig = {
    selectors: {
        '$': function (compo, selector) {
            var r = domLib_find(compo.$, selector);
            return r;
        },
        'compo': function (compo, selector) {
            var r = compo_find(compo, selector);
            return r;
        }
    },
    /**
     *	@default, global $ is used
     *	IDOMLibrary = {
     *	{fn}(elements) - create dom-elements wrapper,
     *	on(event, selector, fn) - @see jQuery 'on'
     *	}
     */
    setDOMLibrary: function (lib) {
        if (domLib === lib)
            return;
        setDomLib(lib);
        domLib_initialize();
    },
    getDOMLibrary: function () {
        return domLib;
    },
    eventDecorator: function (mix) {
        if (typeof mix === 'function') {
            Events_.setEventDecorator(mix);
            return;
        }
        if (typeof mix === 'string') {
            console.error('EventDecorators are not used. Touch&Mouse support is already integrated');
            Events_.setEventDecorator(EventsDeco[mix]);
            return;
        }
        if (typeof mix === 'boolean' && mix === false) {
            Events_.setEventDecorator(null);
            return;
        }
    }
};

import { log_error, log_warn } from '@core/util/reporters';
import { Events_ } from './events';
import { CompoConfig } from './CompoConfig';
export var Children_ = {
    /**
    *	Component children. Example:
    *
    *	Class({
    *		Base: Compo,
    *		Construct: function(){
    *			this.compos = {
    *				panel: '$: .container',  // querying with DOMLib
    *				timePicker: 'compo: timePicker', // querying with Compo selector
    *				button: '#button' // querying with querySelector***
    *			}
    *		}
    *	});
    *
    */
    select: function (component, compos) {
        for (var name in compos) {
            var data = compos[name], events = null, selector = null;
            if (data instanceof Array) {
                console.error('obsolete');
                selector = data[0];
                events = data.splice(1);
            }
            if (typeof data === 'string') {
                selector = data;
            }
            if (data == null || selector == null) {
                log_error('Unknown component child', name, compos[name]);
                log_warn('Is this object shared within multiple compo classes? Define it in constructor!');
                return;
            }
            var index = selector.indexOf(':');
            var engine = CompoConfig.selectors[selector.substring(0, index)];
            if (engine == null) {
                var $els = component.$;
                var el = void 0;
                for (var i = 0; i < $els.length; i++) {
                    var x = $els[i];
                    el = x.querySelector(selector);
                    if (el != null) {
                        break;
                    }
                    if (x.matches(selector)) {
                        el = x;
                        break;
                    }
                }
                component.compos[name] = el;
            }
            else {
                selector = selector.substring(++index).trim();
                component.compos[name] = engine(component, selector);
            }
            var element = component.compos[name];
            if (events != null) {
                if (element.$ != null) {
                    element = element.$;
                }
                Events_.on(component, events, element);
            }
        }
    },
    /** Deprecated: refs are implemented by accessors */
    selectSelf: function (self, refs) {
        var compos = refs.compos;
        if (compos) {
            for (var prop in compos) {
                self[prop] = CompoConfig.selectors.compo(self, compos[prop]);
            }
        }
        var q = refs.queries;
        if (q) {
            for (var prop in q) {
                self[prop] = CompoConfig.selectors.$(self, q[prop]);
            }
        }
        var els = refs.elements;
        if (els) {
            for (var prop in els) {
                var selector = els[prop];
                var x = self.$.find(selector);
                if ((x === null || x === void 0 ? void 0 : x.length) > 0) {
                    self[prop] = x[0];
                    continue;
                }
                x = self.$.filter(selector);
                self[prop] = x === null || x === void 0 ? void 0 : x[0];
            }
        }
    },
    compos: function (self, selector) {
        return CompoConfig.selectors.compo(self, selector);
    },
    queries: function (self, selector) {
        return CompoConfig.selectors.$(self, selector);
    },
    elements: function (self, selector) {
        var x = self.$.find(selector);
        if ((x === null || x === void 0 ? void 0 : x.length) > 0) {
            return x[0];
        }
        x = self.$.filter(selector);
        return x === null || x === void 0 ? void 0 : x[0];
    }
};

import { is_Function, is_String, is_Array } from '@utils/is';
import { obj_extend } from '@utils/obj';
import { compo_meta_toAttributeKey } from '../util/compo_meta';
import { ani_updateAttr } from '../util/ani';
import { compo_ensureTemplate, compo_prepairAsync, compo_cleanElements, compo_removeElements, compo_detachChild, compo_dispose, compo_attach } from '../util/compo';
import { dfr_isBusy } from '../util/dfr';
import { log_error } from '@core/util/reporters';
import { _Array_slice } from '@utils/refs';
import { Anchor } from './anchor';
import { CompoSignals } from '../signal/exports';
import { KeyboardHandler } from '../keyboard/Handler';
import { selector_parse } from '../util/selector';
import { find_findSingle } from '../util/traverse';
import { Dom } from '@core/dom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { domLib } from '@compo/scope-vars';
import { Children_ } from './children';
import { Events_ } from './events';
import { compo_find, compo_findAll, compo_closest } from './find';
import { renderer_render } from '@core/renderer/exports';
import { parser_parse } from '@core/parser/exports';
export var CompoProto = {
    type: Dom.CONTROLLER,
    __constructed: false,
    __resource: null,
    __frame: null,
    __tweens: null,
    ID: null,
    $: null,
    tagName: null,
    compoName: null,
    parent: null,
    node: null,
    nodes: null,
    components: null,
    expression: null,
    attr: null,
    model: null,
    scope: null,
    slots: null,
    pipes: null,
    compos: null,
    events: null,
    hotkeys: null,
    async: false,
    await: null,
    resume: null,
    meta: null,
    getAttribute: function (key) {
        var _a;
        var def = (_a = this.meta.attributes) === null || _a === void 0 ? void 0 : _a[key];
        if (def == null) {
            return this.attr[key];
        }
        var prop = compo_meta_toAttributeKey(key, def);
        return this[prop];
    },
    setAttribute: function (key, val) {
        var _a, _b;
        var prop = null;
        var def = (_a = this.meta.attributes) === null || _a === void 0 ? void 0 : _a[key];
        if (def != null) {
            prop = compo_meta_toAttributeKey(key, def);
        }
        else {
            def = (_b = this.meta.properties) === null || _b === void 0 ? void 0 : _b[key];
            if (def != null) {
                prop = key;
            }
        }
        ani_updateAttr(this, key, prop, val, def);
        if (this.onAttributeSet) {
            this.onAttributeSet(key, val);
        }
    },
    onAttributeSet: null,
    onRenderStart: null,
    onRenderStartClient: null,
    onRenderEnd: null,
    onRenderEndServer: null,
    onEnterFrame: null,
    render: null,
    renderStart: function (model, ctx, container) {
        compo_ensureTemplate(this);
        if (is_Function(this.onRenderStart)) {
            var x = this.onRenderStart(model, ctx, container);
            if (x !== void 0 && dfr_isBusy(x))
                compo_prepairAsync(x, this, ctx);
        }
    },
    renderStartClient: function (model, ctx, container) {
        if (is_Function(this.onRenderStartClient)) {
            var x = this.onRenderStartClient(model, ctx, container);
            if (x !== void 0 && dfr_isBusy(x))
                compo_prepairAsync(x, this, ctx);
        }
    },
    renderEnd: function (elements, model, ctx, container) {
        var _a;
        Anchor.create(this);
        this.$ = domLib(elements);
        if (this.events != null) {
            Events_.on(this, this.events);
        }
        if (this.compos != null) {
            Children_.select(this, this.compos);
        }
        if (((_a = this.meta) === null || _a === void 0 ? void 0 : _a.refs) != null) {
            Children_.selectSelf(this, this.meta.refs);
        }
        if (this.hotkeys != null) {
            KeyboardHandler.hotkeys(this, this.hotkeys);
        }
        if (is_Function(this.onRenderEnd)) {
            this.onRenderEnd(elements, model, ctx, container);
        }
        if (is_Function(this.onEnterFrame)) {
            this.onEnterFrame = this.onEnterFrame.bind(this);
            this.onEnterFrame();
        }
    },
    appendTo: function (el) {
        this.$.appendTo(el);
        this.emitIn('domInsert');
        return this;
    },
    append: function (template, model, selector) {
        var parent;
        if (this.$ == null) {
            var ast = is_String(template) ? parser_parse(template) : template;
            var parent = this;
            if (selector) {
                parent = find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
                if (parent == null) {
                    log_error('Compo::append: Container not found');
                    return this;
                }
            }
            parent.nodes = [parent.nodes, ast];
            return this;
        }
        var frag = renderer_render(template, model, null, null, this);
        parent = selector
            ? this.$.find(selector)
            : this.$;
        parent.append(frag);
        // @todo do not emit to created compos before
        this.emitIn('domInsert');
        return this;
    },
    find: function (selector) {
        return compo_find(this, selector);
    },
    findAll: function (selector) {
        return compo_findAll(this, selector);
    },
    closest: function (selector) {
        return compo_closest(this, selector);
    },
    on: function () {
        var x = _Array_slice.call(arguments);
        if (arguments.length < 3) {
            log_error('Invalid Arguments Exception @use .on(type,selector,fn)');
            return this;
        }
        if (this.$ != null)
            Events_.on(this, [x]);
        if (this.events == null) {
            this.events = [x];
        }
        else if (is_Array(this.events)) {
            this.events.push(x);
        }
        else {
            this.events = [x, this.events];
        }
        return this;
    },
    remove: function () {
        compo_cleanElements(this);
        compo_removeElements(this);
        compo_detachChild(this);
        compo_dispose(this);
        this.$ = null;
        return this;
    },
    slotState: function (slotName, isActive) {
        CompoSignals.slot.toggle(this, slotName, isActive);
        return this;
    },
    signalState: function (signalName, isActive) {
        CompoSignals.signal.toggle(this, signalName, isActive);
        return this;
    },
    emitOut: function (signalName, a1, a2, a3, a4) {
        CompoSignals.signal.emitOut(this, signalName, this, [a1, a2, a3, a4]);
        return this;
    },
    emitIn: function (signalName, a1, a2, a3, a4) {
        CompoSignals.signal.emitIn(this, signalName, this, [a1, a2, a3, a4]);
        return this;
    },
    $scope: function (path) {
        return expression_eval('$scope?.' + path, null, null, this);
    },
    $eval: function (expr, model, ctx) {
        return expression_eval(expr, model || this.model, ctx, this);
    },
    attach: function (name, fn) {
        compo_attach(this, name, fn);
    },
    serializeState: function () {
        if (this.scope) {
            return { scope: this.scope };
        }
    },
    deserializeState: function (bundle) {
        if (bundle != null && bundle.scope != null) {
            this.scope = obj_extend(this.scope, bundle.scope);
        }
    }
};

import { _Array_slice } from '@utils/refs';
import { customAttr_register } from '@core/custom/exports';
import { log_error, log_warn } from '@core/util/reporters';
import { dom_addEventListener } from '../util/dom';
import { compo_attachDisposer } from '../util/compo';
var _collection = {};
customAttr_register('x-pipe-signal', 'client', function (node, attrValue, model, ctx, element, ctr) {
    var arr = attrValue.split(';'), imax = arr.length, i = -1, x;
    while (++i < imax) {
        x = arr[i].trim();
        if (x === '')
            continue;
        var i_colon = x.indexOf(':'), event = x.substring(0, i_colon), handler = x.substring(i_colon + 1).trim(), dot = handler.indexOf('.'), pipe, signal;
        if (dot === -1) {
            log_error('Pipe-slot is invalid: {0} Usage e.g. "click: pipeName.pipeSignal"', x);
            return;
        }
        pipe = handler.substring(0, dot);
        signal = handler.substring(++dot);
        // if DEBUG
        !event && log_error('Pipe-slot is invalid. Event type is not set', attrValue);
        // endif
        dom_addEventListener(element, event, _createListener(pipe, signal));
    }
});
function _createListener(pipe, signal) {
    return function (event) {
        new Pipe(pipe).emit(signal, event);
    };
}
function pipe_attach(pipeName, ctr) {
    if (ctr.pipes[pipeName] == null) {
        log_error('Controller has no pipes to be added to collection', pipeName, ctr);
        return;
    }
    if (_collection[pipeName] == null) {
        _collection[pipeName] = [];
    }
    _collection[pipeName].push(ctr);
}
function pipe_detach(pipeName, ctr) {
    var pipe = _collection[pipeName], i = pipe.length;
    while (--i > -1) {
        if (pipe[i] === ctr)
            pipe.splice(i, 1);
    }
}
function _removeController(ctr) {
    var pipes = ctr.pipes;
    for (var key in pipes) {
        pipe_detach(key, ctr);
    }
}
function _removeControllerDelegate(ctr) {
    return function () {
        _removeController(ctr);
        ctr = null;
    };
}
function _addController(ctr) {
    var pipes = ctr.pipes;
    // if DEBUG
    if (pipes == null) {
        log_error('Controller has no pipes', ctr);
        return;
    }
    // endif
    for (var key in pipes) {
        pipe_attach(key, ctr);
    }
    compo_attachDisposer(ctr, _removeControllerDelegate(ctr));
}
var Pipe = /** @class */ (function () {
    function Pipe(name) {
        this.name = name;
    }
    Pipe.prototype.emit = function (signal, a, b, c) {
        var controllers = _collection[this.name], name = this.name, args = _Array_slice.call(arguments, 1);
        if (controllers == null) {
            //if DEBUG
            log_warn('Pipe.emit: No signals were bound to:', name);
            //endif
            return;
        }
        var i = controllers.length, called = false;
        while (--i !== -1) {
            var ctr = controllers[i];
            var slots = ctr.pipes[name];
            if (slots == null)
                continue;
            var slot = slots[signal];
            if (slot != null) {
                slot.apply(ctr, args);
                called = true;
            }
        }
        // if DEBUG
        if (called === false)
            log_warn('Pipe `%s` has not slots for `%s`', name, signal);
        // endif
    };
    return Pipe;
}());
export { Pipe };
;
export function PipeCtor(name) {
    return new Pipe(name);
}
PipeCtor.addController = _addController;
PipeCtor.removeController = _removeController;
export var Pipes = {
    addController: _addController,
    removeController: _removeController,
    pipe: PipeCtor
};

import { obj_create } from '@utils/obj';
import { _mask_ensureTmplFn } from '../scope-vars';
import { compo_meta_prepairAttributesHandler, compo_meta_prepairArgumentsHandler } from './compo_meta';
import { Pipes } from '../compo/pipes';
// export function compo_create(arguments_: any[]) {
//     var argLength = arguments_.length,
//         Proto = arguments_[argLength - 1],
//         Ctor,
//         hasBase;
//     if (argLength > 1)
//         hasBase = compo_inherit(
//             Proto,
//             _Array_slice.call(arguments_, 0, argLength - 1)
//         );
//     if (Proto == null) Proto = {};
//     var include = _resolve_External('include');
//     if (include != null) Proto.__resource = include.url;
//     compo_prepairProperties(Proto);
//     Ctor = Proto.hasOwnProperty('constructor') ? Proto.constructor : null;
//     Ctor = compo_createConstructor(Ctor, Proto, hasBase);
//     obj_extendDefaults(Proto, CompoProto);
//     Ctor.prototype = Proto;
//     Proto = null;
//     return Ctor;
// }
export function compo_prepairProperties(Proto) {
    for (var key in Proto.attr) {
        Proto.attr[key] = _mask_ensureTmplFn(Proto.attr[key]);
    }
    var slots = Proto.slots;
    for (var key in slots) {
        if (typeof slots[key] === 'string') {
            slots[key] = Proto[slots[key]];
        }
    }
    compo_meta_prepairAttributesHandler(Proto);
    compo_meta_prepairArgumentsHandler(Proto);
}
// export function compo_createConstructor(Ctor, proto, hasBaseAlready) {
//     return function CompoBase(node, model, ctx, container, ctr) {
//         if (Ctor != null) {
//             var overriden = Ctor.call(this, node, model, ctx, container, ctr);
//             if (overriden != null) return overriden;
//         }
//         if (hasBaseAlready === true) {
//             return;
//         }
//         if (this.compos != null) {
//             this.compos = obj_create(this.compos);
//         }
//         if (this.pipes != null) {
//             Pipes.addController(this);
//         }
//         if (this.attr != null) {
//             this.attr = obj_create(this.attr);
//         }
//         if (this.scope != null) {
//             this.scope = obj_create(this.scope);
//         }
//     };
// }
export function compo_baseConstructor() {
    if (this.__constructed === true) {
        return;
    }
    this.__constructed = true;
    if (this.compos != null) {
        this.compos = obj_create(this.compos);
    }
    if (this.pipes != null) {
        Pipes.addController(this);
    }
    if (this.attr != null) {
        this.attr = obj_create(this.attr);
    }
    if (this.scope != null) {
        this.scope = obj_create(this.scope);
    }
}

import { is_Array } from '@utils/is';
import { _document } from '@utils/refs';
import { log_warn, log_error } from '@core/util/reporters';
import { domLib, setDomLib } from './scope-vars';
import { domLib_initialize } from './jcompo/jCompo';
/*
 * Extrem simple Dom Library. If (jQuery | Kimbo | Zepto) is not used.
 * Only methods, required for the Compo library are implemented.
 */
export var DomLite;
(function (document) {
    if (document == null)
        return;
    DomLite = function (mix) {
        if (this instanceof DomLite === false) {
            return new DomLite(mix);
        }
        if (typeof mix === 'string') {
            mix = document.querySelectorAll(mix);
        }
        return this.add(mix);
    };
    if (domLib == null)
        setDomLib(DomLite);
    var Proto = DomLite.fn = {
        constructor: DomLite,
        length: 0,
        add: function (mix) {
            if (mix == null)
                return this;
            if (is_Array(mix) === true)
                return each(mix, this.add, this);
            var type = mix.nodeType;
            if (type === 11 /* Node.DOCUMENT_FRAGMENT_NODE */)
                return each(mix.childNodes, this.add, this);
            if (type == null) {
                if (typeof mix.length === 'number')
                    return each(mix, this.add, this);
                log_warn('Uknown domlite object');
                return this;
            }
            this[this.length++] = mix;
            return this;
        },
        on: function () {
            return binder.call(this, on, delegate, arguments);
        },
        off: function () {
            return binder.call(this, off, undelegate, arguments);
        },
        find: function (sel) {
            return each(this, function (node) {
                this.add(_$$.call(node, sel));
            }, new DomLite);
        },
        filter: function (sel) {
            return each(this, function (node, index) {
                _is(node, sel) === true && this.add(node);
            }, new DomLite);
        },
        parent: function () {
            var x = this[0];
            return new DomLite(x && x.parentNode);
        },
        children: function (sel) {
            var set = each(this, function (node) {
                this.add(node.childNodes);
            }, new DomLite);
            return sel == null ? set : set.filter(sel);
        },
        closest: function (selector) {
            var x = this[0], dom = new DomLite;
            while (x != null && x.parentNode != null) {
                x = x.parentNode;
                if (_is(x, selector))
                    return dom.add(x);
            }
            return dom;
        },
        next: function (selector) {
            var x = this[0], dom = new DomLite;
            while (x != null && x.nextElementSibling != null) {
                x = x.nextElementSibling;
                if (selector == null) {
                    return dom.add(x);
                }
                if (_is(x, selector)) {
                    return dom.add(x);
                }
            }
            return dom;
        },
        remove: function () {
            return each(this, function (x) {
                x.parentNode.removeChild(x);
            });
        },
        text: function (mix) {
            if (arguments.length === 0) {
                return aggr('', this, function (txt, x) {
                    return txt + x.textContent;
                });
            }
            return each(this, function (x) {
                x.textContent = mix;
            });
        },
        html: function (mix) {
            if (arguments.length === 0) {
                return aggr('', this, function (txt, x) {
                    return txt + x.innerHTML;
                });
            }
            return each(this, function (x) {
                x.innerHTML = mix;
            });
        },
        val: function (mix) {
            if (arguments.length === 0) {
                return this.length === 0 ? null : this[0].value;
            }
            if (this.length !== 0) {
                this[0].value = mix;
            }
            return this;
        },
        focus: function () {
            return each(this, function (x) {
                x.focus && x.focus();
            });
        },
        get: function (i) {
            return this[i];
        },
        toArray: function () {
            return Array.from(this);
        }
    };
    (function () {
        each(['show', 'hide'], function (method) {
            Proto[method] = function () {
                return each(this, function (x) {
                    x.style.display = method === 'hide' ? 'none' : '';
                });
            };
        });
    }());
    (function () {
        var Manip = {
            append: function (node, el) {
                after_(node, node.lastChild, el);
            },
            prepend: function (node, el) {
                before_(node, node.firstChild, el);
            },
            after: function (node, el) {
                after_(node.parentNode, node, el);
            },
            before: function (node, el) {
                before_(node.parentNode, node, el);
            }
        };
        each(['append', 'prepend', 'before', 'after'], function (method) {
            var fn = Manip[method];
            Proto[method] = function (mix) {
                var isArray = is_Array(mix);
                return each(this, function (node) {
                    if (isArray) {
                        each(mix, function (el) {
                            fn(node, el);
                        });
                        return;
                    }
                    fn(node, mix);
                });
            };
        });
        function before_(parent, anchor, el) {
            if (parent == null || el == null)
                return;
            parent.insertBefore(el, anchor);
        }
        function after_(parent, anchor, el) {
            var next = anchor != null ? anchor.nextSibling : null;
            before_(parent, next, el);
        }
    }());
    function each(arr, fn, ctx) {
        if (arr == null)
            return ctx || arr;
        var imax = arr.length, i = -1;
        while (++i < imax) {
            fn.call(ctx || arr, arr[i], i);
        }
        return ctx || arr;
    }
    function aggr(seed, arr, fn, ctx) {
        each(arr, function (x, i) {
            seed = fn.call(ctx || arr, seed, arr[i], i);
        });
        return seed;
    }
    function indexOf(arr, fn, ctx) {
        if (arr == null)
            return -1;
        var imax = arr.length, i = -1;
        while (++i < imax) {
            if (fn.call(ctx || arr, arr[i], i) === true)
                return i;
        }
        return -1;
    }
    var docEl = document.documentElement;
    var _$$ = docEl.querySelectorAll;
    var _is = (function () {
        var matchesSelector = docEl.webkitMatchesSelector ||
            docEl.mozMatchesSelector ||
            docEl.msMatchesSelector ||
            docEl.oMatchesSelector ||
            docEl.matchesSelector;
        return function (el, selector) {
            return el == null || el.nodeType !== 1
                ? false
                : matchesSelector.call(el, selector);
        };
    }());
    /* Events */
    var binder, on, off, delegate, undelegate;
    (function () {
        binder = function (bind, bindSelector, args) {
            var length = args.length, fn;
            if (2 === length)
                fn = bind;
            if (3 === length)
                fn = bindSelector;
            if (fn != null) {
                return each(this, function (node) {
                    fn.apply(DomLite(node), args);
                });
            }
            log_error('`DomLite.on|off` - invalid arguments count');
            return this;
        };
        on = function (type, fn) {
            return run(this, _addEvent, type, fn);
        };
        off = function (type, fn) {
            return run(this, _remEvent, type, fn);
        };
        delegate = function (type, selector, fn) {
            function guard(event) {
                var el = event.target, current = event.currentTarget;
                if (current === el)
                    return;
                while (el != null && el !== current) {
                    if (_is(el, selector)) {
                        fn(event);
                        return;
                    }
                    el = el.parentNode;
                }
            }
            (fn._guards || (fn._guards = [])).push(guard);
            return on.call(this, type, guard);
        };
        undelegate = function (type, selector, fn) {
            return each(fn._quards, function (guard) {
                off.call(this, type, guard);
            }, this);
        };
        function run(set, handler, type, fn) {
            return each(set, function (node) {
                handler.call(node, type, fn, false);
            });
        }
        var _addEvent = docEl.addEventListener, _remEvent = docEl.removeEventListener;
    }());
    /* class handler */
    (function () {
        var isClassListSupported = docEl.classList != null;
        var hasClass = isClassListSupported === true
            ? function (node, klass) {
                return node.classList.contains(klass);
            }
            : function (node, klass) {
                return -1 !== (' ' + node.className + ' ').indexOf(' ' + klass + ' ');
            };
        Proto['hasClass'] = function (klass) {
            return -1 !== indexOf(this, function (node) {
                return hasClass(node, klass);
            });
        };
        var Shim;
        (function () {
            Shim = {
                add: function (node, klass) {
                    if (hasClass(node, klass) === false)
                        add(node, klass);
                },
                remove: function (node, klass) {
                    if (hasClass(node, klass) === true)
                        remove(node, klass);
                },
                toggle: function (node, klass) {
                    var fn = hasClass(node, klass) === true
                        ? remove
                        : add;
                    fn(node, klass);
                }
            };
            function add(node, klass) {
                node.className += ' ' + klass;
            }
            function remove(node, klass) {
                node.className = (' ' + node.className + ' ').replace(' ' + klass + ' ', ' ');
            }
        }());
        each(['add', 'remove', 'toggle'], function (method) {
            var mutatorFn = isClassListSupported === false
                ? Shim[method]
                : function (node, klass) {
                    var classList = node.classList;
                    classList[method].call(classList, klass);
                };
            Proto[method + 'Class'] = function (klass) {
                return each(this, function (node) {
                    mutatorFn(node, klass);
                });
            };
        });
    }());
    // Events
    (function () {
        var createEvent = function (type) {
            var event = document.createEvent('Event');
            event.initEvent(type, true, true);
            return event;
        };
        var create = function (type, data) {
            if (data == null)
                return createEvent(type);
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, true, true, data);
            return event;
        };
        var dispatch = function (node, event) {
            node.dispatchEvent(event);
        };
        Proto['trigger'] = function (type, data) {
            var event = create(type, data);
            return each(this, function (node) {
                dispatch(node, event);
            });
        };
    }());
    // Attributes
    (function () {
        Proto['attr'] = function (name, val) {
            if (val === void 0)
                return this[0] && this[0].getAttribute(name);
            return each(this, function (node) {
                node.setAttribute(name, val);
            });
        };
        Proto['removeAttr'] = function (name) {
            return each(this, function (node) {
                node.removeAttribute(name);
            });
        };
    }());
    if (Object.setPrototypeOf)
        Object.setPrototypeOf(Proto, Array.prototype);
    else if (Proto.__proto__)
        Proto.__proto__ = Array.prototype;
    DomLite.prototype = Proto;
    domLib_initialize();
}(_document));

import { obj_extendDefaults, obj_create } from '@utils/obj';
import { is_rawObject } from '@utils/is';
import { fn_apply } from '@utils/fn';
import { log_error } from '@core/util/reporters';
import { env_class_wrapCtors } from '@core/util/env_class';
import { mask_merge } from '@core/feature/merge';
import { customTag_get } from '@core/custom/exports';
import { _resolve_External, _mask_ensureTmplFn } from '../scope-vars';
import { CompoProto } from '../compo/CompoProto';
import { compo_baseConstructor } from './compo_create';
import { compo_meta_prepairAttributesHandler, compo_meta_prepairArgumentsHandler } from './compo_meta';
var protos = [];
var getProtoOf = Object.getPrototypeOf;
export function compo_createExt(Proto, Extends) {
    if (Extends == null || Extends.length === 0) {
        return compo_createSingle(Proto);
    }
    var classes = [];
    for (var i = 0; i < Extends.length; i++) {
        if (typeof Extends[i] === 'string') {
            var x = Extends[i] = customTag_get(Extends[i]);
            if (x != null && x.name === 'Resolver') {
                log_error('Inheritance error: private component');
                Extends[i] = {};
            }
        }
        if (typeof Extends[i] === 'function') {
            classes.push(Extends[i]);
        }
    }
    var ProtoCtor = Proto.hasOwnProperty('constructor') ? Proto.constructor : null;
    var Base = classes.length === 0 ? null : classes.pop();
    var beforeFn = compo_baseConstructor;
    var afterFn = ProtoCtor;
    if (Base == null) {
        Base = beforeFn;
        beforeFn = null;
    }
    var Ctor = env_class_wrapCtors(Base, beforeFn, afterFn, classes);
    var BaseProto = Base.prototype;
    protos.length = 0;
    for (var i = 0; i < Extends.length; i++) {
        var x = Extends[i];
        if (x === Base) {
            continue;
        }
        if (typeof x === 'function') {
            var proto = getProtoOf == null ? x.prototype : fillProtoHash(x.prototype, obj_create(null));
            protos.push(proto);
            continue;
        }
        protos.push(x);
    }
    var inheritMethods = obj_create(null);
    inheritBase_(Proto, BaseProto, inheritMethods);
    // merge prototype
    for (var i = protos.length - 1; i > -1; i--) {
        var source = protos[i];
        inheritMiddProto_(Proto, BaseProto, source, inheritMethods);
    }
    // inherit methods
    for (var key in inheritMethods) {
        var outerFn = null;
        var l = protos.length;
        for (var i = 0; i < l + 2; i++) {
            var x = i < l ? protos[i] : null;
            if (i === l)
                x = BaseProto;
            if (i === l + 1)
                x = Proto;
            var fn = x[key];
            if (fn == null) {
                continue;
            }
            if (outerFn == null) {
                outerFn = fn;
                continue;
            }
            outerFn = wrapInheritedFn(fn, outerFn);
        }
        Proto[key] = outerFn;
    }
    // merge templates
    var template = null;
    for (var i = protos.length - 1; i > -1; i--) {
        template = mergeNodes(protos[i], template);
    }
    template = mergeNodes(BaseProto, template);
    template = mergeNodes(Proto, template);
    if (template != null) {
        Proto.template = template;
        Proto.nodes = null;
        Ctor.prototype.nodes = null;
    }
    // do we need this?
    var include = _resolve_External('include');
    if (include != null) {
        Proto.__resource = include.url;
    }
    compo_prepairProperties(Proto);
    obj_extendDefaults(Proto, CompoProto);
    var meta = Proto.meta;
    if (meta == null) {
        meta = Proto.meta = {};
    }
    if (meta.template == null) {
        meta.template = 'merge';
    }
    for (var key in Proto) {
        if (key === 'constructor') {
            continue;
        }
        var val = Proto[key];
        if (val != null) {
            Ctor.prototype[key] = Proto[key];
        }
    }
    return Ctor;
}
function compo_createSingle(Proto) {
    var ProtoCtor = Proto.hasOwnProperty('constructor') ? Proto.constructor : null;
    var Ctor = function CompoBase() {
        compo_baseConstructor.apply(this, arguments);
        if (ProtoCtor) {
            ProtoCtor.apply(this, arguments);
        }
    };
    var include = _resolve_External('include');
    if (include != null)
        Proto.__resource = include.url;
    compo_prepairProperties(Proto);
    Ctor.prototype = Proto;
    Ctor.prototype.constructor = Ctor;
    obj_extendDefaults(Ctor.prototype, CompoProto);
    return Ctor;
}
function inheritMiddProto_(Proto, BaseProto, source, inheritMethods) {
    for (var key in source) {
        if (key === 'constructor' || key === 'template' || key === 'nodes') {
            continue;
        }
        var targetVal = Proto[key];
        if (targetVal === void 0) {
            targetVal = BaseProto[key];
        }
        var sourceVal = source[key];
        if (targetVal == null) {
            Proto[key] = sourceVal;
            continue;
        }
        if (typeof targetVal === 'function') {
            Proto.super = null;
        }
        var type = mergeProperty(Proto, key, targetVal, sourceVal, inheritMethods);
        if (type === 'function') {
            Proto.super = null;
        }
    }
}
function inheritBase_(Proto, BaseProto, inheritMethods) {
    for (var key in Proto) {
        if (key === 'constructor' || key === 'template' || key === 'nodes') {
            continue;
        }
        var baseProtoVal = BaseProto[key];
        if (baseProtoVal == null) {
            continue;
        }
        var protoVal = Proto[key];
        if (protoVal == null) {
            // Keep fields in base proto if not overriden
            continue;
        }
        var type = mergeProperty(Proto, key, protoVal, baseProtoVal, inheritMethods);
        if (type === 'function') {
            Proto.super = null;
        }
    }
}
function mergeProperty(target, key, targetVal, sourceVal, inheritMethods) {
    var type = typeof sourceVal;
    if (type === 'function') {
        switch (key) {
            case 'renderStart':
            case 'renderEnd':
            case 'emitIn':
            case 'emitOut':
            case 'components':
            case 'nodes':
            case 'template':
            case 'find':
            case 'closest':
            case 'on':
            case 'remove':
            case 'slotState':
            case 'signalState':
            case 'append':
            case 'appendTo':
                // is sealed
                return;
            case 'serializeState':
            case 'deserializeState':
                if (sourceVal !== CompoProto[key]) {
                    target[key] = sourceVal;
                }
                return;
        }
        if ('onRenderStart' === key || 'onRenderEnd' === key) {
            target[key] = wrapAutocallFn(targetVal, sourceVal);
            return;
        }
        inheritMethods[key] = 1;
        return type;
    }
    if (type !== 'object') {
        return null;
    }
    switch (key) {
        case 'slots':
        case 'pipes':
        case 'events':
        case 'attr':
            inheritInternals_(targetVal, sourceVal, key);
            return null;
    }
    defaults_(targetVal, sourceVal);
    return null;
}
function inheritInternals_(target, source, name) {
    if (target == null || source == null) {
        return;
    }
    for (var key in source) {
        var sourceVal = source[key];
        var targetVal = target[key];
        if (targetVal == null) {
            target[key] = sourceVal;
            continue;
        }
        if ('pipes' === name) {
            inheritInternals_(target[key], sourceVal, 'pipe');
            continue;
        }
        var type = typeof sourceVal;
        if (type === 'function') {
            var fnAutoCall = false;
            if ('slots' === name || 'events' === name || 'pipe' === name) {
                fnAutoCall = true;
            }
            var wrapperFn = fnAutoCall ? wrapAutocallFn : wrapInheritedFn;
            target[key] = wrapperFn(target[key], sourceVal);
            continue;
        }
        if (type !== 'object') {
            continue;
        }
        defaults_(target[key], sourceVal);
    }
}
function defaults_(target, source) {
    var targetV, sourceV;
    for (var key in source) {
        targetV = target[key];
        sourceV = source[key];
        if (targetV == null) {
            target[key] = sourceV;
            continue;
        }
        if (is_rawObject(targetV) && is_rawObject(sourceV)) {
            defaults_(targetV, sourceV);
            continue;
        }
    }
}
function fillProtoHash(proto, hash) {
    if (getProtoOf == null) {
        return proto;
    }
    var keys = Object.getOwnPropertyNames(proto);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (hash[key] != null) {
            continue;
        }
        hash[key] = proto[key];
    }
    var next = getProtoOf(proto);
    if (next == null || next === Object.prototype) {
        return hash;
    }
    return fillProtoHash(next, hash);
}
function wrapInheritedFn(outerFn, innerFn) {
    return function () {
        this.super = innerFn;
        var x = fn_apply(outerFn, this, arguments);
        this.super = null;
        return x;
    };
}
function wrapAutocallFn(outerFn, innerFn) {
    if (outerFn == null) {
        return innerFn;
    }
    return function () {
        var x = fn_apply(innerFn, this, arguments);
        var y = fn_apply(outerFn, this, arguments);
        return y === void 0 ? x : y;
    };
}
function mergeNodes(target, baseTemplate) {
    var targetNodes = target == null ? null : (target.template || target.nodes);
    return targetNodes == null || baseTemplate == null
        ? (targetNodes || baseTemplate)
        : (mask_merge(baseTemplate, targetNodes, target, { extending: true }));
}
export function compo_prepairProperties(Proto) {
    for (var key in Proto.attr) {
        Proto.attr[key] = _mask_ensureTmplFn(Proto.attr[key]);
    }
    var slots = Proto.slots;
    for (var key in slots) {
        if (typeof slots[key] === 'string') {
            slots[key] = Proto[slots[key]];
        }
    }
    compo_meta_prepairAttributesHandler(Proto);
    compo_meta_prepairArgumentsHandler(Proto);
}

import { customTag_get } from '@core/custom/exports';
import { Dom } from '@core/dom/exports';
import { renderer_render } from '@core/renderer/exports';
import { compo_dispose, compo_ensureTemplate, compo_attachDisposer, compo_attach } from '../util/compo';
import { dom_addEventListener } from '../util/dom';
import { CompoSignals } from '../signal/exports';
import { DomLite } from '../DomLite';
import { compo_createExt } from '../util/compo_ceateExt';
import { CompoStaticsAsync } from './async';
import { compo_find, compo_findAll, compo_closest, compo_children, compo_child } from './find';
import { Anchor } from './anchor';
import { CompoConfig } from './CompoConfig';
import { Pipes } from './pipes';
import { Component } from './Component';
export var CompoStatics = {
    create: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var Base = args.pop();
        return compo_createExt(Base, args);
    },
    createExt: function (Proto, args) {
        return compo_createExt(Proto, args);
    },
    createClass: function () {
        throw Error('@Obsolete: createClass');
    },
    initialize: function (mix, model, ctx, container, parent) {
        if (mix == null)
            throw Error('Undefined is not a component');
        if (container == null) {
            if (ctx && ctx.nodeType != null) {
                container = ctx;
                ctx = null;
            }
            else if (model && model.nodeType != null) {
                container = model;
                model = null;
            }
        }
        var node;
        function createNode(compo) {
            node = {
                controller: compo,
                type: Dom.COMPONENT
            };
        }
        if (typeof mix === 'string') {
            if (/^[^\s]+$/.test(mix)) {
                var compo = customTag_get(mix);
                if (compo == null)
                    throw Error('Component not found: ' + mix);
                createNode(compo);
            }
            else {
                createNode(compo_createExt({
                    template: mix
                }));
            }
        }
        else if (typeof mix === 'function') {
            createNode(mix);
        }
        if (parent == null && container != null) {
            parent = Anchor.resolveCompo(container);
        }
        if (parent == null) {
            parent = new Component();
        }
        var dom = renderer_render(node, model, ctx, null, parent), instance = parent.components[parent.components.length - 1];
        if (container != null) {
            container.appendChild(dom);
            CompoSignals.signal.emitIn(instance, 'domInsert');
        }
        return instance;
    },
    find: compo_find,
    findAll: compo_findAll,
    closest: compo_closest,
    children: compo_children,
    child: compo_child,
    dispose: compo_dispose,
    ensureTemplate: compo_ensureTemplate,
    attachDisposer: compo_attachDisposer,
    attach: compo_attach,
    gc: {
        using: function (compo, x) {
            if (x.dispose == null) {
                console.warn('Expects `disposable` instance');
                return x;
            }
            compo_attach(compo, 'dispose', function () {
                x && x.dispose();
                x = null;
            });
        },
        on: function (compo, emitter) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var fn = emitter.on || emitter.addListener || emitter.addEventListener || emitter.bind;
            var fin = emitter.off || emitter.removeListener || emitter.removeEventListener || emitter.unbind;
            if (fn == null || fin === null) {
                console.warn('Expects `emitter` instance with any of the methods: on, addListener, addEventListener, bind');
                return;
            }
            fn.apply(emitter, args);
            compo_attach(compo, 'dispose', function () {
                emitter && fin.apply(emitter, args);
                emitter = null;
            });
        },
        subscribe: function (compo, observable) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (observable.subscribe == null) {
                console.warn('Expects `IObservable` instance with subscribe/unsubscribe methods');
                return;
            }
            var result = observable.apply(observable, args);
            if (observable.unsubscribe == null && (result == null || result.dispose == null)) {
                throw Error('Invalid subscription: don`t know how to unsubscribe');
            }
            compo_attach(compo, 'dispose', function () {
                if (observable == null) {
                    return;
                }
                if (result && result.dispose) {
                    result.dispose();
                    result = null;
                    observable = null;
                    return;
                }
                if (observable.unsubscribe) {
                    observable.unsubscribe(args[0]);
                    observable = null;
                    result = null;
                }
            });
        }
    },
    element: {
        getCompo: function (el) {
            return Anchor.resolveCompo(el, true);
        },
        getModel: function (el) {
            var compo = Anchor.resolveCompo(el, true);
            if (compo == null)
                return null;
            var model = compo.model;
            while (model == null && compo.parent != null) {
                compo = compo.parent;
                model = compo.model;
            }
            return model;
        },
    },
    config: CompoConfig,
    pipe: Pipes.pipe,
    resource: function (compo) {
        var owner = compo;
        while (owner != null) {
            if (owner.resource) {
                return owner.resource;
            }
            owner = owner.parent;
        }
        return include.instance();
    },
    plugin: function (source) {
        // if DEBUG
        eval(source);
        // endif
    },
    Dom: {
        addEventListener: dom_addEventListener
    },
    signal: CompoSignals.signal,
    slot: CompoSignals.slot,
    DomLite: DomLite,
    pause: CompoStaticsAsync.pause,
    resume: CompoStaticsAsync.resume,
    await: CompoStaticsAsync.await,
};

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { obj_extend } from '@utils/obj';
import { Children_ } from '@compo/compo/children';
export function deco_slot(mix) {
    return function (target, propertyKey, descriptor) {
        var _a, _b;
        var slots = (_a = target.slots) !== null && _a !== void 0 ? _a : (target.slots = {});
        var name = typeof mix === 'string' ? mix : mix === null || mix === void 0 ? void 0 : mix.name;
        var isPrivate = typeof mix !== 'string' ? (_b = mix === null || mix === void 0 ? void 0 : mix.private) !== null && _b !== void 0 ? _b : false : false;
        var viaProperty = descriptor == null;
        var fn = viaProperty ? target[propertyKey] : descriptor.value;
        slots[name !== null && name !== void 0 ? name : propertyKey] = !isPrivate
            ? fn
            : function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                fn.call.apply(fn, __spreadArrays([this], args));
                return false;
            };
        return descriptor;
    };
}
;
export function deco_slotPrivate(name) {
    return deco_slot({ name: name, private: true });
}
;
/** Tip: use constants instead string literals for arguments */
export function deco_pipe(pipeName, signalName) {
    return function (target, propertyKey, descriptor) {
        var _a, _b;
        var pipes = (_a = target.pipes) !== null && _a !== void 0 ? _a : (target.pipes = {});
        var stream = (_b = pipes[pipeName]) !== null && _b !== void 0 ? _b : (pipes[pipeName] = {});
        var viaProperty = descriptor == null;
        var fn = viaProperty ? target[propertyKey] : descriptor.value;
        stream[name !== null && name !== void 0 ? name : propertyKey] = fn;
        return descriptor;
    };
}
;
/**
 * @param selector event or delegated event - "click: .some"
 */
export function deco_event(selector) {
    return function (target, propertyKey, descriptor) {
        var _a;
        var events = (_a = target.events) !== null && _a !== void 0 ? _a : (target.events = {});
        var viaProperty = descriptor == null;
        var fn = viaProperty ? target[propertyKey] : descriptor.value;
        events[selector] = fn;
        return descriptor;
    };
}
;
/**
 * @param selector event or delegated event - "click: .some"
 */
export function deco_hotkey(hotkey) {
    return function (target, propertyKey, descriptor) {
        var _a;
        var hotkeys = (_a = target.hotkeys) !== null && _a !== void 0 ? _a : (target.hotkeys = {});
        var viaProperty = descriptor == null;
        var fn = viaProperty ? target[propertyKey] : descriptor.value;
        hotkeys[hotkey] = fn;
        return descriptor;
    };
}
;
export function deco_attr(opts) {
    return function (target, propertyKey, descriptor) {
        var attr = ensureMeta(target, 'attributes');
        var name = opts === null || opts === void 0 ? void 0 : opts.name;
        if (name == null) {
            name = propertyKey[0] + propertyKey.substring(1).replace(/[A-Z]/g, function (c) { return "_" + c.toLowerCase(); });
        }
        attr[name] = obj_extend(opts, { name: propertyKey });
    };
}
;
export function deco_refCompo(selector) {
    return function (target, propertyKey, descriptor) {
        ensureRef(target, propertyKey, selector, 'compos');
    };
}
;
export function deco_refElement(selector) {
    return function (target, propertyKey, descriptor) {
        ensureRef(target, propertyKey, selector, 'elements');
    };
}
;
export function deco_refQuery(selector) {
    return function (target, propertyKey, descriptor) {
        ensureRef(target, propertyKey, selector, 'queries');
    };
}
;
function ensureMeta(proto, name) {
    var _a;
    var _b;
    var m = proto.meta;
    if (m == null)
        m = proto.meta = (_a = {}, _a[name] = {}, _a);
    return (_b = m[name]) !== null && _b !== void 0 ? _b : (m[name] = {});
}
function ensureRef(proto, key, selector, refName) {
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            var val = Children_[refName](this, selector);
            if (val != null) {
                Object.defineProperty(this, key, {
                    configurable: true,
                    enumerable: true,
                    value: val
                });
            }
            return val;
        },
        set: function (val) {
            if (val != null) {
                Object.defineProperty(this, key, {
                    value: val
                });
            }
        }
    });
    // let refs = ensureMeta(proto, 'refs');
    // let ref = refs[refName] ?? (refs[refName] = {});
    // ref[key] = selector;
}

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { class_create } from '@utils/class';
import { obj_create } from '@utils/obj';
import { compo_prepairProperties } from '../util/compo_create';
import { CompoProto } from './CompoProto';
import { CompoStatics } from './CompoStatics';
import { deco_slot, deco_slotPrivate, deco_attr, deco_refCompo, deco_refElement, deco_refQuery, deco_pipe, deco_event, deco_hotkey } from '@compo/deco/component_decorators';
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component() {
        var _this = _super.call(this) || this;
        if (_this.__constructed !== true) {
            _this.__constructed = true;
            compo_prepairProperties(_this);
        }
        if (_this.pipes != null) {
            CompoStatics.pipe.addController(_this);
        }
        if (_this.compos != null) {
            _this.compos = obj_create(_this.compos);
        }
        if (_this.attr != null) {
            _this.attr = obj_create(_this.attr);
        }
        if (_this.scope != null) {
            _this.scope = obj_create(_this.scope);
        }
        return _this;
    }
    Component.create = CompoStatics.create;
    Component.createExt = CompoStatics.createExt;
    Component.createClass = CompoStatics.createClass;
    Component.initialize = CompoStatics.initialize;
    Component.find = CompoStatics.find;
    Component.findAll = CompoStatics.findAll;
    Component.closest = CompoStatics.closest;
    Component.children = CompoStatics.children;
    Component.child = CompoStatics.child;
    Component.dispose = CompoStatics.dispose;
    Component.ensureTemplate = CompoStatics.ensureTemplate;
    Component.attachDisposer = CompoStatics.attachDisposer;
    Component.attach = CompoStatics.attach;
    Component.gc = CompoStatics.gc;
    Component.element = CompoStatics.element;
    Component.config = CompoStatics.config;
    Component.pipe = CompoStatics.pipe;
    Component.resource = CompoStatics.resource;
    Component.plugin = CompoStatics.plugin;
    Component.Dom = CompoStatics.Dom;
    Component.signal = CompoStatics.signal;
    Component.slot = CompoStatics.slot;
    Component.DomLite = CompoStatics.DomLite;
    Component.pause = CompoStatics.pause;
    Component.resume = CompoStatics.resume;
    Component.await = CompoStatics.await;
    Component.deco = {
        pipe: deco_pipe,
        slot: deco_slot,
        slotPrivate: deco_slotPrivate,
        attr: deco_attr,
        event: deco_event,
        hotkey: deco_hotkey,
        refCompo: deco_refCompo,
        refElement: deco_refElement,
        refQuery: deco_refQuery
    };
    return Component;
}(class_create(CompoProto)));
export { Component };

import { obj_extend } from '@utils/obj';
import { CompoProto } from './CompoProto';
import { CompoStatics } from './CompoStatics';
import { compo_createExt } from '../util/compo_ceateExt';
export var Compo = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (this instanceof Compo) {
        // used in Class({Base: Compo})
        return void 0;
    }
    var Base = args.pop();
    return compo_createExt(Base, args);
};
Compo.prototype = CompoProto;
obj_extend(Compo, CompoStatics);

export { CompoProto } from './compo/CompoProto';
export { Component } from './compo/Component';
export { Compo } from './compo/Compo';
export { domLib } from './scope-vars';

import { _evaluateAst } from './eval';
export var Ast_FunctionRefUtil = {
    evalArguments: function (node, model, ctx, ctr, preResults) {
        var args = node.arguments, out = [], i = -1, imax = args.length;
        while (++i < imax) {
            out[i] = _evaluateAst(args[i], model, ctx, ctr, preResults);
        }
        return out;
    }
};

export var SubjectKind;
(function (SubjectKind) {
    SubjectKind[SubjectKind["Value"] = 0] = "Value";
    SubjectKind[SubjectKind["Stream"] = 1] = "Stream";
    SubjectKind[SubjectKind["Promise"] = 2] = "Promise";
})(SubjectKind || (SubjectKind = {}));

var Subscription = /** @class */ (function () {
    function Subscription(stream, cb) {
        this.stream = stream;
        this.cb = cb;
    }
    Subscription.prototype.unsubscribe = function () {
        this.stream.unsubscribe(this.cb);
    };
    return Subscription;
}());
export { Subscription };

import { Subscription } from "./Subscription";
import { SubjectKind } from "./SubjectKind";
var SubjectStream = /** @class */ (function () {
    function SubjectStream() {
        this._value = void 0;
        this._error = void 0;
        this.cbs = [];
        this.kind = SubjectKind.Stream;
        this.canceled = false;
        this.next = this.next.bind(this);
        this.error = this.error.bind(this);
    }
    SubjectStream.prototype.next = function (x) {
        if (x === this._value) {
            return;
        }
        this._error = void 0;
        this._value = x;
        this.call(0, x);
    };
    SubjectStream.prototype.error = function (err) {
        this._error = err;
        this.call(1, err);
    };
    SubjectStream.prototype.current = function () {
        return this._value;
    };
    SubjectStream.prototype.isBusy = function () {
        return this._value === void 0;
    };
    SubjectStream.prototype.fromStream = function (stream) {
        this._pipe = stream;
        if (this.cbs.length !== 0) {
            stream.subscribe(this.next, this.error);
        }
    };
    SubjectStream.prototype.subscribe = function (cb, onError) {
        if (this._pipe != null && this.cbs.length === 0) {
            this._pipe.subscribe(this.next, this.error);
        }
        this.cbs.push([cb, onError, null]);
        if (this._value !== void 0) {
            cb(this._value);
        }
        return new Subscription(this, cb);
    };
    SubjectStream.prototype.unsubscribe = function (cb) {
        for (var i = 0; i < this.cbs.length; i++) {
            if (this.cbs[i][0] === cb) {
                this.cbs.splice(i, 1);
            }
        }
        if (this._pipe != null && this.cbs.length === 0) {
            this._pipe.unsubscribe(this.next);
            return;
        }
    };
    SubjectStream.prototype.call = function (index, x) {
        for (var i = 0; i < this.cbs.length; i++) {
            var row = this.cbs[i];
            var fn = row[index];
            var opts = row[2];
            if (opts && opts.once === true) {
                this.cbs.splice(i, 1);
            }
            fn(x);
        }
    };
    return SubjectStream;
}());
export { SubjectStream };

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { SubjectStream } from './SubjectStream';
var PromisedStream = /** @class */ (function (_super) {
    __extends(PromisedStream, _super);
    function PromisedStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PromisedStream.prototype.resolve = function (x) {
        this.next(x);
    };
    PromisedStream.prototype.reject = function (err) {
        this.error(err);
    };
    PromisedStream.prototype.then = function (onSuccess, onError) {
        if (this._error !== void 0) {
            onError && onError(this._error);
            return;
        }
        if (this._value !== void 0) {
            onSuccess && onSuccess(this._value);
            return;
        }
        this.cbs.push([onSuccess, onError, { once: true }]);
        if (this._pipe != null && this.cbs.length === 1) {
            if ('then' in this._pipe) {
                this._pipe.then(this.next, this.error);
                return;
            }
            if ('subscribe' in this._pipe) {
                this._pipe.subscribe(this.next, this.error);
                return;
            }
        }
    };
    return PromisedStream;
}(SubjectStream));
export { PromisedStream };

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { _evaluateAst } from '../eval';
import { PromisedStream } from './PromisedStream';
import { SubjectKind } from './SubjectKind';
var DeferredExp = /** @class */ (function (_super) {
    __extends(DeferredExp, _super);
    function DeferredExp(deferred, root, model, ctx, ctr) {
        var _this = _super.call(this) || this;
        _this.deferred = deferred;
        _this.root = root;
        _this.model = model;
        _this.ctx = ctx;
        _this.ctr = ctr;
        _this.tick = _this.tick.bind(_this);
        return _this;
    }
    DeferredExp.prototype.subscribe = function (cb, onError) {
        for (var i = 0; i < this.deferred.length; i++) {
            var dfr = this.deferred[i];
            if (dfr.kind === SubjectKind.Stream) {
                dfr.subscribe(this.tick);
            }
        }
        return _super.prototype.subscribe.call(this, cb, onError);
    };
    DeferredExp.prototype.unsubscribe = function (cb) {
        _super.prototype.unsubscribe.call(this, cb);
        for (var i = 0; i < this.deferred.length; i++) {
            var dfr = this.deferred[i];
            if (dfr.kind === SubjectKind.Stream) {
                dfr.unsubscribe(this.tick);
            }
        }
    };
    DeferredExp.prototype.tick = function () {
        var preResults = [];
        for (var i = 0; i < this.deferred.length; i++) {
            var dfr = this.deferred[i];
            if (dfr.isBusy()) {
                return;
            }
            preResults[i] = dfr.current();
        }
        var val = _evaluateAst(this.root, this.model, this.ctx, this.ctr, preResults);
        this.next(val);
    };
    DeferredExp.prototype.cancel = function () {
        this.deferred.map(function (x) { return x.cancel(); });
    };
    return DeferredExp;
}(PromisedStream));
export { DeferredExp };

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { is_PromiseLike, is_Observable } from '@utils/is';
import { PromisedStream } from './PromisedStream';
import { SubjectKind } from './SubjectKind';
export function AwaitableCtx(ctx) {
    if (is_PromiseLike(ctx)) {
        return new PromiseCtx(ctx);
    }
    if (is_Observable(ctx)) {
        return new ObservableCtx(ctx);
    }
    return new ValueCtx(ctx);
}
var IAwaitableCtx = /** @class */ (function (_super) {
    __extends(IAwaitableCtx, _super);
    function IAwaitableCtx(ctx) {
        var _this = _super.call(this) || this;
        _this.ctx = ctx;
        _this.kind = SubjectKind.Promise;
        _this.ctx = ctx;
        return _this;
    }
    return IAwaitableCtx;
}(PromisedStream));
;
var ValueCtx = /** @class */ (function (_super) {
    __extends(ValueCtx, _super);
    function ValueCtx(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.resolve(ctx);
        return _this;
    }
    ValueCtx.prototype.cancel = function () { };
    return ValueCtx;
}(IAwaitableCtx));
var PromiseCtx = /** @class */ (function (_super) {
    __extends(PromiseCtx, _super);
    function PromiseCtx(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.onSuccess = _this.onSuccess.bind(_this);
        _this.onFail = _this.onFail.bind(_this);
        ctx.then(_this.onSuccess, _this.onFail);
        return _this;
    }
    PromiseCtx.prototype.onSuccess = function (val) {
        if (this.canceled)
            return;
        this.resolve(val);
    };
    PromiseCtx.prototype.onFail = function (err) {
        if (this.canceled)
            return;
        this.reject(err);
    };
    PromiseCtx.prototype.cancel = function () {
        this.canceled = true;
    };
    return PromiseCtx;
}(IAwaitableCtx));
;
var ObservableCtx = /** @class */ (function (_super) {
    __extends(ObservableCtx, _super);
    function ObservableCtx(ctx) {
        var _this = _super.call(this, ctx) || this;
        _this.onValue = _this.onValue.bind(_this);
        ctx.subscribe(_this.onValue);
        return _this;
    }
    ObservableCtx.prototype.onValue = function (val) {
        if (this.canceled)
            return;
        this.cancel();
        this.resolve(val);
    };
    ObservableCtx.prototype.cancel = function () {
        this.canceled = true;
        this.ctx.unsubscribe(this.onValue);
    };
    return ObservableCtx;
}(IAwaitableCtx));
;

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { PromisedStream } from './PromisedStream';
import { SubjectKind } from './SubjectKind';
import { _evaluateAstDeferredInner } from '../eval_deferred';
import { AwaitableCtx } from './AwaitableCtx';
import { is_Array } from '@utils/is';
import { type_Statement, type_Body, type_FunctionRef, type_SymbolRef, type_UnaryPrefix, type_Ternary } from '../scope-vars';
export function getDeferrables(mix, out) {
    if (out === void 0) { out = []; }
    if (mix == null) {
        return out;
    }
    if (is_Array(mix)) {
        for (var i = 0; i < mix.length; i++) {
            getDeferrables(mix[i], out);
        }
        return out;
    }
    var expr = mix;
    var type = expr.type;
    if (type === type_Statement) {
        if (expr.observe === true) {
            expr.preResultIndex = out.length;
            out.push(new DeferStatement(expr));
            return out;
        }
        if (expr.async === true) {
            expr.preResultIndex = out.length;
            out.push(new DeferStatement(expr));
            return out;
        }
    }
    switch (type) {
        case type_Body:
            getDeferrables(expr.body, out);
            break;
        case type_FunctionRef:
            getDeferrables(expr.arguments, out);
            break;
        case type_SymbolRef:
            getDeferrables(expr.next, out);
            break;
        case type_Statement:
        case type_UnaryPrefix:
        case type_Ternary:
            getDeferrables(expr.body, out);
            break;
    }
    return out;
}
var DeferStatement = /** @class */ (function (_super) {
    __extends(DeferStatement, _super);
    function DeferStatement(statement) {
        var _this = _super.call(this) || this;
        _this.statement = statement;
        return _this;
    }
    /**
     * Get current value for the statement to calculate full expression result
     * Subscription is made later
     * */
    DeferStatement.prototype.process = function (model, ctx, ctr) {
        var _this = this;
        this.deferExp = _evaluateAstDeferredInner(this.statement, model, ctx, ctr);
        switch (this.deferExp.kind) {
            case SubjectKind.Value:
            case SubjectKind.Promise: {
                this.kind = SubjectKind.Promise;
                break;
            }
            case SubjectKind.Stream: {
                this.kind = SubjectKind.Stream;
                break;
            }
        }
        this.deferExp.then(function (context) {
            _this.ctx = AwaitableCtx(context);
            _this.ctx.then(function (result) {
                _this.resolve(result);
            }, function (error) {
                this.reject(error);
            });
        }, function (err) { return _this.reject(err); });
        return this;
    };
    DeferStatement.prototype.subscribe = function (cb, onError) {
        if (this.cbs.length === 0) {
            this.deferExp.subscribe(this.next);
        }
        return _super.prototype.subscribe.call(this, cb, onError);
    };
    DeferStatement.prototype.unsubscribe = function (cb) {
        _super.prototype.unsubscribe.call(this, cb);
        if (this.cbs.length === 0) {
            this.deferExp.unsubscribe(this.next);
        }
    };
    DeferStatement.prototype.cancel = function () {
        this.deferExp && this.deferExp.cancel();
        this.ctx && this.ctx.cancel();
    };
    return DeferStatement;
}(PromisedStream));
export { DeferStatement };

export var prop_OBS = '__observers';
export var prop_MUTATORS = '__mutators';
export var prop_TIMEOUT = '__dfrTimeout';
export var prop_DIRTY = '__dirty';
export var prop_REBINDERS = '__rebinders';
export var prop_PROXY = '__proxies';
export var obj_defineProp = Object.defineProperty;
export function obj_ensureFieldDeep(obj, chain) {
    var i = -1, imax = chain.length - 1;
    while (++i < imax) {
        var key = chain[i];
        if (obj[key] == null) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    return obj;
}
export function obj_ensureObserversProperty(obj, prop) {
    var obs = obj[prop_OBS];
    if (obs == null) {
        obs = {
            __dirty: null,
            __dfrTimeout: null,
            __mutators: null,
            __rebinders: {},
            __proxies: {}
        };
        obj_defineProp(obj, prop_OBS, {
            value: obs,
            enumerable: false
        });
    }
    if (prop == null) {
        return obs;
    }
    var arr = obs[prop];
    return arr == null ? (obs[prop] = []) : arr;
}
export function obj_getObserversProperty(obj, type) {
    var obs = obj[prop_OBS];
    return obs == null ? null : obs[type];
}
;
export function obj_ensureRebindersProperty(obj) {
    var hash = obj[prop_REBINDERS];
    if (hash == null) {
        hash = {};
        obj_defineProp(obj, prop_REBINDERS, {
            value: hash,
            enumerable: false
        });
    }
    return hash;
}
;
export function obj_chainToProp(chain, start) {
    var str = '', imax = chain.length, i = start - 1;
    while (++i < imax) {
        if (i !== start)
            str += '.';
        str += chain[i];
    }
    return str;
}

import { arr_remove } from '@utils/arr';
import { _Array_slice } from '@utils/refs';
import { prop_TIMEOUT, prop_MUTATORS, prop_OBS, prop_DIRTY, obj_ensureObserversProperty, obj_getObserversProperty } from './obj_props';
export function objMutator_addObserver(obj, mutators, cb) {
    var methods = mutators.methods, throttle = mutators.throttle, obs = obj_ensureObserversProperty(obj, prop_MUTATORS);
    if (obs.length === 0) {
        var imax = methods.length, i = -1, method, fn;
        while (++i < imax) {
            method = methods[i];
            fn = obj[method];
            if (fn == null)
                continue;
            obj[method] = objMutator_createWrapper_(obj, fn, method, throttle);
        }
    }
    obs[obs.length++] = cb;
}
;
export function objMutator_removeObserver(obj, mutators, cb) {
    var obs = obj_getObserversProperty(obj, prop_MUTATORS);
    if (obs == null) {
        return;
    }
    if (cb === void 0) {
        obs.length = 0;
        return;
    }
    arr_remove(obs, cb);
}
;
function objMutator_createWrapper_(obj, originalFn, method, throttle) {
    var fn = throttle === true ? callDelayed : call;
    return function () {
        return fn(obj, originalFn, method, _Array_slice.call(arguments));
    };
}
function call(obj, original, method, args) {
    var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS), result = original.apply(obj, args);
    tryNotify(obj, cbs, method, args, result);
    return result;
}
function callDelayed(obj, original, method, args) {
    var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS), result = original.apply(obj, args);
    var obs = obj[prop_OBS];
    if (obs[prop_TIMEOUT] != null)
        return result;
    obs[prop_TIMEOUT] = setTimeout(function () {
        obs[prop_TIMEOUT] = null;
        tryNotify(obj, cbs, method, args, result);
    });
    return result;
}
function tryNotify(obj, cbs, method, args, result) {
    if (cbs.length === 0)
        return;
    var obs = obj[prop_OBS];
    if (obs[prop_DIRTY] != null) {
        obs[prop_DIRTY][prop_MUTATORS] = 1;
        return;
    }
    var imax = cbs.length, i = -1, x;
    while (++i < imax) {
        x = cbs[i];
        if (typeof x === 'function') {
            x(obj, method, args, result);
        }
    }
}

import { is_Object, is_ArrayLike, is_Date } from '@utils/is';
//Resolve object, or if property do not exists - create
export function getSelfMutators(obj) {
    if (is_Object(obj) === false) {
        return null;
    }
    if (is_ArrayLike(obj)) {
        return MUTATORS_.Array;
    }
    if (is_Date(obj)) {
        return MUTATORS_.Date;
    }
    return null;
}
var MUTATORS_ = {
    Array: {
        throttle: false,
        methods: [
            // native mutators
            'push',
            'unshift',
            'splice',
            'pop',
            'shift',
            'reverse',
            'sort',
            // collection mutators
            'remove'
        ]
    },
    Date: {
        throttle: true,
        methods: [
            'setDate',
            'setFullYear',
            'setHours',
            'setMilliseconds',
            'setMinutes',
            'setMonth',
            'setSeconds',
            'setTime',
            'setUTCDate',
            'setUTCFullYear',
            'setUTCHours',
            'setUTCMilliseconds',
            'setUTCMinutes',
            'setUTCMonth',
            'setUTCSeconds'
        ]
    }
};

import { obj_defineProp, prop_OBS, obj_ensureRebindersProperty } from './obj_props';
import { obj_getProperty } from '@utils/obj';
import { obj_removeObserver, obj_addObserver } from './obj_observe';
/* return false, when path contains null values */
export function obj_defineCrumbs(obj, chain) {
    var rebinder = obj_crumbRebindDelegate(obj), path = '', key;
    var imax = chain.length - 1, i = 0, x = obj;
    for (; i < imax; i++) {
        key = chain[i];
        path += key + '.';
        obj_defineCrumb(path, x, key, rebinder);
        x = x[key];
        if (x == null || typeof x !== 'object') {
            return false;
        }
    }
    return true;
}
function obj_defineCrumb(path, obj, key, rebinder) {
    var cbs = obj[prop_OBS] && obj[prop_OBS][key];
    if (cbs != null) {
        return;
    }
    var value = obj[key], old;
    var hash = obj_ensureRebindersProperty(obj);
    var set = hash[key];
    if (set != null) {
        if (set[path] == null) {
            set[path] = rebinder;
        }
        return;
    }
    set = hash[key] = {};
    set[path] = rebinder;
    obj_defineProp(obj, key, {
        get: function () {
            return value;
        },
        set: function (x) {
            if (x === value)
                return;
            old = value;
            value = x;
            for (var _path in set) {
                set[_path](_path, old);
            }
        },
        configurable: true,
        enumerable: true
    });
}
function obj_crumbRebindDelegate(obj) {
    return function (path, oldValue) {
        obj_crumbRebind(obj, path, oldValue);
    };
}
function obj_crumbRebind(obj, path, oldValue) {
    var obs = obj[prop_OBS];
    if (obs == null)
        return;
    for (var prop in obs) {
        if (prop.indexOf(path) !== 0)
            continue;
        var cbs = obs[prop].slice(0), imax = cbs.length, i = 0;
        if (imax === 0)
            continue;
        var val = obj_getProperty(obj, prop), oldProp = prop.substring(path.length), oldVal = obj_getProperty(oldValue, oldProp);
        for (i = 0; i < imax; i++) {
            var cb = cbs[i];
            obj_removeObserver(obj, prop, cb);
            if (oldValue != null && typeof oldValue === 'object') {
                obj_removeObserver(oldValue, oldProp, cb);
            }
        }
        if (oldVal !== val) {
            for (i = 0; i < imax; i++) {
                cbs[i](val);
            }
        }
        for (i = 0; i < imax; i++) {
            obj_addObserver(obj, prop, cbs[i]);
        }
    }
}

import { obj_removeObserver, obj_addObserver } from './obj_observe';
import { obj_getProperty } from '@utils/obj';
import { prop_OBS, obj_chainToProp } from './obj_props';
export function obj_sub_notifyListeners(obj, path, oldVal) {
    var obs = obj[prop_OBS];
    if (obs == null)
        return;
    for (var prop in obs) {
        if (prop.indexOf(path + '.') !== 0)
            continue;
        var cbs = obs[prop].slice(0), imax = cbs.length, i = 0, oldProp, cb;
        if (imax === 0)
            continue;
        var val = obj_getProperty(obj, prop);
        for (i = 0; i < imax; i++) {
            cb = cbs[i];
            obj_removeObserver(obj, prop, cb);
            if (oldVal != null && typeof oldVal === 'object') {
                oldProp = prop.substring(path.length + 1);
                obj_removeObserver(oldVal, oldProp, cb);
            }
        }
        for (i = 0; i < imax; i++) {
            cbs[i](val);
        }
        for (i = 0; i < imax; i++) {
            obj_addObserver(obj, prop, cbs[i]);
        }
    }
}
export function obj_deep_notifyListeners(obj, chain, oldVal, currentVal, fns) {
    var i = 0, imax = chain.length, ctx = obj, arr = fns.slice(0);
    do {
        ctx = ctx[chain[i]];
        if (ctx == null) {
            return;
        }
        var obs = ctx[prop_OBS];
        if (obs == null) {
            continue;
        }
        var prop = obj_chainToProp(chain, i + 1);
        var cbs = obs[prop];
        if (cbs == null) {
            continue;
        }
        for (var j = 0; j < cbs.length; j++) {
            var cb = cbs[j];
            if (arr.indexOf(cb) !== -1) {
                continue;
            }
            cb(currentVal);
            arr.push(cb);
        }
    } while (++i < imax - 1);
}
;

import { log_error } from '@core/util/reporters';
import { obj_getProperty } from '@utils/obj';
import { arr_contains, arr_remove } from '@utils/arr';
import { prop_OBS, prop_PROXY, prop_DIRTY, prop_MUTATORS, obj_getObserversProperty, obj_ensureObserversProperty, obj_defineProp, obj_ensureFieldDeep, obj_chainToProp } from './obj_props';
import { objMutator_addObserver, objMutator_removeObserver } from './obj_mutators';
import { getSelfMutators } from './Mutators';
import { obj_defineCrumbs } from './obj_crumbs';
import { obj_sub_notifyListeners, obj_deep_notifyListeners } from './notify';
var AddObserver;
(function (AddObserver) {
    function add(obj, property, cb) {
        if (obj == null) {
            log_error("Not possible to add the observer for \"" + property + "\" as the model is undefined.");
            return;
        }
        // closest observer
        var parts = property.split('.'), i = -1;
        if (pushClosest(obj[parts[0]], parts, 1, cb)) {
            /* We have added a callback as close as possible to the observle property owner
             * But also add the cb to myself to listen different object path level setters
             */
            var cbs_1 = pushListener_(obj, property, cb);
            if (cbs_1.length === 1) {
                var arr = parts.splice(0, i);
                if (arr.length !== 0)
                    attachProxy_(obj, property, cbs_1, arr);
            }
            if (parts.length > 1) {
                obj_defineCrumbs(obj, parts);
            }
            return;
        }
        var cbs = pushListener_(obj, property, cb);
        if (cbs.length === 1)
            attachProxy_(obj, property, cbs, parts);
        var val = obj_getProperty(obj, property), mutators = getSelfMutators(val);
        if (mutators != null) {
            objMutator_addObserver(val, mutators, cb);
        }
    }
    AddObserver.add = add;
    ;
    function pushClosest(ctx, parts, i, cb) {
        if (ctx == null) {
            return false;
        }
        if (i < parts.length - 1 && pushClosest(ctx[parts[i]], parts, i + 1, cb)) {
            return true;
        }
        var obs = ctx[prop_OBS];
        if (obs == null) {
            return false;
        }
        var prop = obj_chainToProp(parts, i);
        var arr = obs[prop];
        if (arr == null) {
            // fix [obj.test](hosts)
            var proxy = obs[prop_PROXY];
            if (proxy != null && proxy[prop] === true) {
                pushListener_(ctx, prop, cb);
                var x = obj_getProperty(ctx, prop);
                var mutators = getSelfMutators(x);
                if (mutators) {
                    objMutator_addObserver(x, mutators, cb);
                }
                return true;
            }
            return false;
        }
        pushListener_(ctx, prop, cb);
        return true;
    }
})(AddObserver || (AddObserver = {}));
;
export var obj_addObserver = AddObserver.add;
export function obj_hasObserver(obj, property, callback) {
    // nested observer
    var parts = property.split('.'), imax = parts.length, i = -1, x = obj;
    while (++i < imax) {
        x = x[parts[i]];
        if (x == null)
            break;
        if (x[prop_OBS] != null) {
            if (obj_hasObserver(x, parts.slice(i + 1).join('.'), callback))
                return true;
            break;
        }
    }
    var obs = obj[prop_OBS];
    if (obs == null || obs[property] == null)
        return false;
    return arr_contains(obs[property], callback);
}
export function obj_removeObserver(obj, property, callback) {
    if (obj == null) {
        log_error("Not possible to remove the observer for \"" + property + "\" as current model is undefined.");
        return;
    }
    // nested observer
    var parts = property.split('.'), imax = parts.length, i = -1, x = obj;
    while (++i < imax) {
        x = x[parts[i]];
        if (x == null)
            break;
        if (x[prop_OBS] != null) {
            obj_removeObserver(x, parts.slice(i + 1).join('.'), callback);
            break;
        }
    }
    var obs = obj_getObserversProperty(obj, property);
    if (obs != null) {
        if (callback === void 0) {
            // callback not provided -> remove all observers
            obs.length = 0;
        }
        else {
            arr_remove(obs, callback);
        }
    }
    var val = obj_getProperty(obj, property);
    var mutators = getSelfMutators(val);
    if (mutators != null)
        objMutator_removeObserver(val, mutators, callback);
}
export function obj_lockObservers(obj) {
    var obs = obj[prop_OBS];
    if (obs != null)
        obs[prop_DIRTY] = {};
}
export function obj_unlockObservers(obj) {
    var obs = obj[prop_OBS], dirties = obs == null ? null : obs[prop_DIRTY];
    if (dirties == null)
        return;
    obs[prop_DIRTY] = null;
    var prop, cbs, val, imax, i;
    for (prop in dirties) {
        cbs = obj[prop_OBS][prop];
        imax = cbs == null ? 0 : cbs.length;
        if (imax === 0)
            continue;
        i = -1;
        val = prop === prop_MUTATORS ? obj : obj_getProperty(obj, prop);
        while (++i < imax) {
            cbs[i](val);
        }
    }
}
export function obj_addMutatorObserver(obj, cb) {
    var mutators = getSelfMutators(obj);
    if (mutators != null) {
        objMutator_addObserver(obj, mutators, cb);
    }
}
export function obj_removeMutatorObserver(obj, cb) {
    objMutator_removeObserver(obj, null, cb);
}
function attachProxy_(obj, property, cbs, chain) {
    var length = chain.length;
    if (length > 1) {
        if (obj_defineCrumbs(obj, chain) === false) {
            return;
        }
    }
    // TODO: ensure is not required, as defineCrumbs returns false when path contains null value */
    var parent = length > 1 ? obj_ensureFieldDeep(obj, chain) : obj;
    var key = chain[length - 1];
    var currentVal = parent[key];
    if ('length' === key) {
        var mutators = getSelfMutators(parent);
        if (mutators != null) {
            objMutator_addObserver(parent, mutators, function () {
                var imax = cbs.length, i = -1;
                while (++i < imax) {
                    cbs[i].apply(null, arguments);
                }
            });
            return currentVal;
        }
    }
    var obs = obj_ensureObserversProperty(parent);
    var hash = obs[prop_PROXY];
    if (hash[key] === true)
        return;
    hash[key] = true;
    obj_defineProp(parent, key, {
        get: function () {
            return currentVal;
        },
        set: function (x) {
            if (x === currentVal)
                return;
            var imax = cbs.length;
            var oldVal = currentVal;
            var oldMutators = getSelfMutators(oldVal);
            if (oldMutators != null) {
                for (var i = 0; i < imax; i++) {
                    objMutator_removeObserver(oldVal, oldMutators, cbs[i]);
                }
            }
            currentVal = x;
            var mutators = getSelfMutators(x);
            if (mutators != null) {
                for (var i = 0; i < imax; i++) {
                    objMutator_addObserver(x, mutators, cbs[i]);
                }
            }
            if (obj[prop_OBS][prop_DIRTY] != null) {
                obj[prop_OBS][prop_DIRTY][property] = 1;
                return;
            }
            for (var i = 0; i < imax; i++) {
                cbs[i](x);
            }
            obj_sub_notifyListeners(obj, property, oldVal);
            obj_deep_notifyListeners(obj, chain, oldVal, currentVal, cbs);
        },
        configurable: true,
        enumerable: true
    });
    return currentVal;
}
// Create Collection - Check If Exists - Add Listener
function pushListener_(obj, property, cb) {
    var obs = obj_ensureObserversProperty(obj, property);
    if (arr_contains(obs, cb) === false) {
        obs.push(cb);
    }
    return obs;
}

export function obj_callMethod(obj, path, args) {
    var end = path.lastIndexOf('.');
    if (end === -1) {
        return call(obj, path, args);
    }
    var host = obj, i = -1;
    while (host != null && i !== end) {
        var start = i;
        i = path.indexOf('.', i);
        var key = path.substring(start + 1, i);
        host = host[key];
    }
    return call(host, path.substring(end + 1), args);
}
;
function call(obj, key, args) {
    var fn = obj == null ? null : obj[key];
    if (typeof fn !== 'function') {
        console.error('Not a function', key);
        return null;
    }
    return fn.apply(obj, args);
}

import { _Array_slice } from '@utils/refs';
import { obj_callMethod } from './utils/obj';
import { log_warn, error_withCompo } from '@core/util/reporters';
import { expression_eval, expression_varRefs } from '@project/expression/src/exports';
import { obj_addMutatorObserver, obj_addObserver, obj_removeMutatorObserver, obj_removeObserver } from './obj_observe';
export function expression_bind(expr, model, ctx, ctr, cb) {
    if (expr === '.') {
        if (model != null) {
            obj_addMutatorObserver(model, cb);
        }
        return;
    }
    toggleExpressionsBindings(obj_addObserver, expr, model, ctr, cb);
}
;
export function expression_unbind(expr, model, ctr, cb) {
    if (expr === '.') {
        if (model != null) {
            obj_removeMutatorObserver(model, cb);
        }
        return;
    }
    toggleExpressionsBindings(obj_removeObserver, expr, model, ctr, cb);
}
;
function toggleExpressionsBindings(fn, expr, model, ctr, cb) {
    var mix = expression_varRefs(expr, model, null, ctr);
    if (mix == null)
        return null;
    if (typeof mix === 'string') {
        _toggleObserver(fn, model, ctr, mix, cb);
        return;
    }
    var arr = mix, imax = arr.length, i = -1;
    while (++i < imax) {
        var accs = arr[i];
        if (typeof accs === 'string') {
            if (accs.charCodeAt(0) === 95 /*_*/ && accs.charCodeAt(0) === 46 /*.*/) {
                continue;
            }
        }
        else if (typeof accs === 'object') {
            if (accs.ref === '_') {
                continue;
            }
        }
        _toggleObserver(fn, model, ctr, accs, cb);
    }
}
export function expression_callFn(accessor, model, ctx, ctr, args) {
    var tuple = expression_getHost(accessor, model, ctx, ctr);
    if (tuple != null) {
        var obj = tuple[0], path = tuple[1];
        return obj_callMethod(obj, path, args);
    }
    return null;
}
;
/**
 * expression_bind only fires callback, if some of refs were changed,
 * but doesnt supply new expression value
 **/
export function expression_createBinder(expr, model, ctx, ctr, fn) {
    return expression_createListener(function () {
        var value = expression_eval(expr, model, ctx, ctr);
        var args = _Array_slice.call(arguments);
        args[0] = value == null ? '' : value;
        fn.apply(this, args);
    });
}
;
export function expression_createListener(callback) {
    var locks = 0;
    return function () {
        if (++locks > 1) {
            locks = 0;
            log_warn('<listener:expression> concurrent binder');
            return;
        }
        callback.apply(this, _Array_slice.call(arguments));
        locks--;
    };
}
;
export var expression_getHost;
(function () {
    // [ObjectHost, Property]
    var tuple = [null, null];
    expression_getHost = function (accessor, model, ctx, ctr) {
        var result = get(accessor, model, ctx, ctr);
        if (result == null || result[0] == null) {
            error_withCompo('Observable host is undefined or is not allowed: ' + accessor.toString(), ctr);
            return null;
        }
        return result;
    };
    function get(accessor, model, ctx, ctr) {
        if (accessor == null)
            return;
        if (typeof accessor === 'object') {
            var obj = expression_eval(accessor.accessor, model, null, ctr);
            if (obj == null || typeof obj !== 'object') {
                return null;
            }
            tuple[0] = obj;
            tuple[1] = accessor.ref;
            return tuple;
        }
        var property = accessor, parts = property.split('.'), imax = parts.length;
        if (imax > 1) {
            var first = parts[0];
            if (first === 'this' || first === '$c' || first === '$') {
                // Controller Observer
                var owner = _getObservable_Controller(ctr, parts[1]);
                var cutIdx = first.length + 1;
                tuple[0] = owner;
                tuple[1] = property.substring(cutIdx);
                return tuple;
            }
            if (first === '$scope') {
                // Controller Observer
                var scope = _getObservable_Scope(ctr, parts[1]);
                var cutIdx = 6 + 1;
                tuple[0] = scope;
                tuple[1] = property.substring(cutIdx);
                return tuple;
            }
        }
        var obj = null;
        if (_isDefined(model, parts[0])) {
            obj = model;
        }
        if (obj == null) {
            obj = _getObservable_Scope(ctr, parts[0]);
        }
        if (obj == null) {
            obj = model;
        }
        tuple[0] = obj;
        tuple[1] = property;
        return tuple;
    }
}());
function _toggleObserver(mutatorFn, model, ctr, accessor, callback) {
    var tuple = expression_getHost(accessor, model, null, ctr);
    if (tuple == null)
        return;
    var obj = tuple[0], property = tuple[1];
    if (obj == null)
        return;
    mutatorFn(obj, property, callback);
}
function _getObservable_Controller(ctr_, key) {
    var ctr = ctr_;
    while (ctr != null) {
        if (_isDefined(ctr, key))
            return ctr;
        ctr = ctr.parent;
    }
    return ctr;
}
function _getObservable_Scope(ctr_, property) {
    var ctr = ctr_, scope;
    while (ctr != null) {
        scope = ctr.scope;
        if (_isDefined(scope, property)) {
            return scope;
        }
        ctr = ctr.parent;
    }
    return null;
}
function _isDefined(obj_, key_) {
    var key = key_;
    if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
        key = key.slice(0, -1);
    }
    return obj_ != null && key in obj_;
}

export { obj_addObserver, obj_hasObserver, obj_removeObserver, obj_addMutatorObserver, obj_removeMutatorObserver, obj_lockObservers, obj_unlockObservers } from './obj_observe';
export { expression_bind, expression_unbind, expression_callFn, expression_createBinder, expression_createListener, expression_getHost } from './expression';

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { _evaluateAst } from '../eval';
import { expression_bind, expression_unbind } from '@project/observer/src/exports';
import { PromisedStream } from './PromisedStream';
import { SubjectKind } from './SubjectKind';
var ObjectStream = /** @class */ (function (_super) {
    __extends(ObjectStream, _super);
    function ObjectStream(value, astNode, model, ctx, ctr) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.astNode = astNode;
        _this.model = model;
        _this.ctx = ctx;
        _this.ctr = ctr;
        _this.kind = SubjectKind.Stream;
        _this.tick = _this.tick.bind(_this);
        _this.next(value);
        return _this;
    }
    ObjectStream.prototype.subscribe = function (cb, onError) {
        if (this.cbs.length === 0) {
            expression_bind(this.astNode, this.model, this.ctx, this.ctr, this.tick);
        }
        return _super.prototype.subscribe.call(this, cb, onError);
    };
    ObjectStream.prototype.unsubscribe = function (cb) {
        _super.prototype.unsubscribe.call(this, cb);
        if (this.cbs.length === 0) {
            expression_unbind(this.astNode, this.model, this.ctr, this.tick);
        }
    };
    ObjectStream.prototype.tick = function () {
        var val = _evaluateAst(this.astNode, this.model, null, this.ctr);
        this.next(val);
    };
    return ObjectStream;
}(PromisedStream));
export { ObjectStream };

import { is_Observable } from '@utils/is';
import { _evaluateAst } from './eval';
import { util_throw } from './util';
import { SubjectKind } from './class/SubjectKind';
import { DeferredExp } from './class/DeferredExp';
import { getDeferrables } from './class/DeferStatement';
import { ObjectStream } from './class/ObjectStream';
// Avaitables and Observables
export function _evaluateAstDeferred(root, model, ctx, ctr) {
    var x = _evaluateAstDeferredInner(root, model, ctx, ctr);
    if (x.kind === SubjectKind.Stream) {
        return x;
    }
    return x;
}
export function _evaluateAstDeferredInner(root, model, ctx, ctr) {
    var deferred = getDeferrables(root.body);
    var deferExp = new DeferredExp(deferred, root, model, ctx, ctr);
    if (deferred.length === 0) {
        var result = _evaluateAst(root, model, ctx, ctr);
        if (result == null) {
            util_throw(root, null, 'Awaitable is undefined');
        }
        if (root.observe === true) {
            if (is_Observable(result) === false) {
                result = new ObjectStream(result, root, model, ctx, ctr);
            }
            deferExp.kind = SubjectKind.Stream;
            deferExp.fromStream(result);
            return deferExp;
        }
        deferExp.kind = SubjectKind.Promise;
        deferExp.next(result);
        return deferExp;
    }
    var count = deferred.length, error = null, i = count;
    while (--i > -1) {
        var dfr = deferred[i];
        dfr
            .process(model, ctx, ctr)
            .then(done, fail);
    }
    function done() {
        if (--count === 0 && error == null) {
            var preResults = [];
            for (var i_1 = 0; i_1 < deferred.length; i_1++) {
                var dfr = deferred[i_1];
                preResults[i_1] = dfr.current();
            }
            var result = _evaluateAst(root, model, ctx, ctr, preResults);
            deferExp.resolve(result);
        }
    }
    function fail(err) {
        error = err;
        if (error === err) {
            deferExp.reject(error);
        }
    }
    return deferExp;
}
;

import { _parse } from './parser';
import { type_Body, op_LogicalOr, op_LogicalAnd, op_Minus, op_Plus, op_Divide, op_Multip, op_Modulo, op_BitOr, op_BitXOr, op_BitAnd, op_LogicalNotEqual, op_LogicalNotEqual_Strict, op_LogicalEqual, op_LogicalEqual_Strict, op_LogicalGreater, op_LogicalGreaterEqual, op_LogicalLess, op_LogicalLessEqual, type_Statement, type_Value, type_Array, type_Object, type_SymbolRef, type_FunctionRef, type_AccessorExpr, type_Accessor, type_UnaryPrefix, op_LogicalNot, type_Ternary } from './scope-vars';
import { util_resolveAcc, util_resolveRefValue, util_getNodeStack, util_resolveRef } from './util';
import { is_Function } from '@utils/is';
import { error_ } from '@core/util/reporters';
import { Ast_FunctionRefUtil } from './astNode_utils';
import { _evaluateAstDeferred } from './eval_deferred';
var cache = {};
export function _evaluate(mix, model, ctx, ctr, node) {
    var ast;
    if (null == mix)
        return null;
    if ('.' === mix)
        return model;
    if (typeof mix === 'string') {
        var node_ = node;
        if (node_ == null && ctr != null) {
            var x = ctr;
            while (node_ == null && x != null) {
                node_ = x.node;
                x = x.parent;
            }
        }
        ast = cache.hasOwnProperty(mix) === true
            ? (cache[mix])
            : (cache[mix] = _parse(mix, false, node_));
    }
    else {
        ast = mix;
    }
    if (ast == null) {
        return null;
    }
    if (ast.observe === true || ast.async === true) {
        return _evaluateAstDeferred(ast, model, ctx, ctr);
    }
    return _evaluateAst(ast, model, ctx, ctr, null);
}
export function _evaluateAst(ast, model, ctx, ctr, preResults) {
    if (ast == null)
        return null;
    var type = ast.type, result, x, length;
    if (type_Body === type) {
        var value, prev;
        outer: for (var i = 0, length = ast.body.length; i < length; i++) {
            x = ast.body[i];
            if (prev != null && prev.join === op_LogicalOr && result) {
                return result;
            }
            value = _evaluateAst(x, model, ctx, ctr, preResults);
            if (prev == null || prev.join == null) {
                prev = x;
                result = value;
                continue;
            }
            if (prev.join === op_LogicalAnd) {
                if (!result) {
                    for (; i < length; i++) {
                        if (ast.body[i].join === op_LogicalOr) {
                            break;
                        }
                    }
                }
                else {
                    result = value;
                }
            }
            if (prev.join === op_LogicalOr) {
                if (value) {
                    return value;
                }
                result = value;
                prev = x;
                continue;
            }
            switch (prev.join) {
                case op_Minus:
                    result -= value;
                    break;
                case op_Plus:
                    result += value;
                    break;
                case op_Divide:
                    result /= value;
                    break;
                case op_Multip:
                    result *= value;
                    break;
                case op_Modulo:
                    result %= value;
                    break;
                case op_BitOr:
                    result |= value;
                    break;
                case op_BitXOr:
                    result ^= value;
                    break;
                case op_BitAnd:
                    result &= value;
                    break;
                case op_LogicalNotEqual:
                    /* jshint eqeqeq: false */
                    result = result != value;
                    /* jshint eqeqeq: true */
                    break;
                case op_LogicalNotEqual_Strict:
                    result = result !== value;
                    break;
                case op_LogicalEqual:
                    /* jshint eqeqeq: false */
                    result = result == value;
                    /* jshint eqeqeq: true */
                    break;
                case op_LogicalEqual_Strict:
                    result = result === value;
                    break;
                case op_LogicalGreater:
                    result = result > value;
                    break;
                case op_LogicalGreaterEqual:
                    result = result >= value;
                    break;
                case op_LogicalLess:
                    result = result < value;
                    break;
                case op_LogicalLessEqual:
                    result = result <= value;
                    break;
            }
            prev = x;
        }
        return result;
    }
    if (type_Statement === type) {
        if ((ast.async === true || ast.observe === true) && ast.preResultIndex > -1 && preResults != null) {
            result = preResults[ast.preResultIndex];
        }
        else {
            result = _evaluateAst(ast.body, model, ctx, ctr, preResults);
        }
        if (ast.next == null)
            return result;
        return util_resolveAcc(result, ast.next, model, ctx, ctr, preResults);
    }
    if (type_Value === type) {
        return ast.body;
    }
    if (type_Array === type) {
        var body = ast.body.body, imax = body.length, i = -1;
        result = new Array(imax);
        while (++i < imax) {
            result[i] = _evaluateAst(body[i], model, ctx, ctr, preResults);
        }
        return result;
    }
    if (type_Object === type) {
        result = {};
        var props = ast.props;
        for (var key in props) {
            result[key] = _evaluateAst(props[key], model, ctx, ctr, preResults);
        }
        return result;
    }
    if (type_SymbolRef === type || type_FunctionRef === type) {
        result = util_resolveRefValue(ast, model, ctx, ctr, preResults);
        if (type === type_FunctionRef) {
            if (is_Function(result)) {
                var args = Ast_FunctionRefUtil.evalArguments(ast, model, ctx, ctr, preResults);
                result = result.apply(null, args);
            }
            else {
                error_(ast.body + " is not a function", util_getNodeStack(ast));
            }
        }
        if (ast.next != null) {
            return util_resolveAcc(result, ast.next, model, ctx, ctr, preResults);
        }
        return result;
    }
    if (type_AccessorExpr === type ||
        type_Accessor === type) {
        return util_resolveRef(ast, model, ctx, ctr);
    }
    if (type_UnaryPrefix === type) {
        result = _evaluateAst(ast.body, model, ctx, ctr, preResults);
        switch (ast.prefix) {
            case op_Minus:
                result = -result;
                break;
            case op_LogicalNot:
                result = !result;
                break;
        }
    }
    if (type_Ternary === type) {
        result = _evaluateAst(ast.body, model, ctx, ctr, preResults);
        result = _evaluateAst(result ? ast.case1 : ast.case2, model, ctx, ctr, preResults);
    }
    return result;
}

import { _global } from '@utils/refs';
import { parser_error, reporter_getNodeStack, reporter_deprecated, warn_ } from '@core/util/reporters';
import { error_formatSource } from '@utils/error';
import { is_Function } from '@utils/is';
import { customUtil_$utils } from '@core/custom/exports';
import { CompoProto } from '@compo/exports';
import { type_FunctionRef, type_AccessorExpr, type_Accessor } from './scope-vars';
import { _evaluateAst } from './eval';
import { Ast_FunctionRefUtil } from './astNode_utils';
export function util_throw(template, index, msg, token, astNode) {
    return parser_error(msg + util_getNodeStack(astNode), template.toString(), index, token, 'expr');
}
export function util_getNodeStack(astNode) {
    var domNode = null, x = astNode;
    while (domNode == null && x != null) {
        domNode = x.node;
        x = x.parent;
    }
    if (domNode == null) {
        var str, i;
        x = astNode;
        while (x != null) {
            if (i == null) {
                i = x.sourceIndex;
            }
            if (str == null) {
                str = x.source;
            }
            x = x.parent;
        }
        if (str != null) {
            return '\n' + error_formatSource(str, i || 0);
        }
        return '';
    }
    return reporter_getNodeStack(domNode);
}
export function util_resolveRef(astRef, model, ctx, ctr) {
    var controller = ctr, current = astRef, key = astRef.body, object, value, args, i, imax;
    if ('$c' === key || '$' === key) {
        reporter_deprecated('accessor.compo', 'Use `this` instead of `$c` or `$`.' + util_getNodeStack(astRef));
        key = 'this';
    }
    if ('$u' === key) {
        reporter_deprecated('accessor.util', 'Use `_` instead of `$u`' + util_getNodeStack(astRef));
        key = '_';
    }
    if ('$a' === key) {
        reporter_deprecated('accessor.attr', 'Use `this.attr` instead of `$a`' + util_getNodeStack(astRef));
    }
    if ('this' === key) {
        value = controller;
        var next = current.next, nextBody = next != null && next.body;
        if (nextBody != null && value[nextBody] == null) {
            if (next.type === type_FunctionRef &&
                is_Function(CompoProto[nextBody])) {
                // use fn from prototype if possible, like `closest`
                object = controller;
                value = CompoProto[nextBody];
                current = next;
            }
            else {
                // find the closest controller, which has the property
                while (true) {
                    value = value.parent;
                    if (value == null)
                        break;
                    if (value[nextBody] == null)
                        continue;
                    object = value;
                    value = value[nextBody];
                    current = next;
                    break;
                }
            }
            if (value == null) {
                // prepair for warn message
                key = '$.' + nextBody;
                current = next;
            }
        }
    }
    else if ('$a' === key) {
        value = controller && controller.attr;
    }
    else if ('_' === key) {
        value = customUtil_$utils;
    }
    else if ('$ctx' === key) {
        value = ctx;
    }
    else if ('$scope' === key) {
        var next = current.next, nextBody = next != null && next.body;
        if (nextBody != null) {
            while (controller != null) {
                object = controller.scope;
                if (object != null) {
                    value = object[nextBody];
                }
                if (value != null) {
                    break;
                }
                controller = controller.parent;
            }
            current = next;
        }
    }
    else if ('global' === key && (model == null || model.global === void 0)) {
        value = _global;
    }
    else {
        // scope resolver
        if (model != null) {
            object = model;
            value = model[key];
        }
        if (value == null) {
            while (controller != null) {
                object = controller.scope;
                if (object != null)
                    value = object[key];
                if (value != null)
                    break;
                controller = controller.parent;
            }
        }
    }
    do {
        if (value == null) {
            verifyPropertyUndefinedError(current, key);
            return null;
        }
        if (current.type === type_FunctionRef) {
            args = [];
            i = -1;
            imax = current.arguments.length;
            while (++i < imax) {
                args[i] = _evaluateAst(current.arguments[i], model, ctx, controller);
            }
            value = value.apply(object, args);
        }
        if (value == null || current.next == null) {
            break;
        }
        current = current.next;
        key =
            current.type === type_AccessorExpr
                ? _evaluateAst(current.body, model, ctx, controller)
                : current.body;
        object = value;
        value = value[key];
    } while (true);
    return value;
}
export function util_resolveRefValue(astRef, model, ctx, ctr, preResults) {
    var controller = ctr, current = astRef, key = astRef.body;
    if ('$c' === key || '$' === key) {
        reporter_deprecated('accessor.compo', 'Use `this` instead of `$c` or `$`.' + util_getNodeStack(astRef));
        key = 'this';
    }
    if ('$u' === key) {
        reporter_deprecated('accessor.util', 'Use `_` instead of `$u`' + util_getNodeStack(astRef));
        key = '_';
    }
    if ('$a' === key) {
        reporter_deprecated('accessor.attr', 'Use `this.attr` instead of `$a`' + util_getNodeStack(astRef));
        return controller && controller.attr;
    }
    if ('global' === key && (model == null || model.global === void 0)) {
        return _global;
    }
    if ('_' === key) {
        return customUtil_$utils;
    }
    if ('$ctx' === key) {
        return ctx;
    }
    if ('this' === key) {
        var this_ = ctr;
        var nextKey = current.next == null ? null : current.next.body;
        if (nextKey == null) {
            return this_;
        }
        var x = this_;
        while (x != null) {
            if (_isDefined(x, nextKey)) {
                return x;
            }
            x = x.parent;
        }
        /** Backwards comp. */
        if (_isDefined(CompoProto, nextKey)) {
            this_[nextKey] = CompoProto[nextKey];
        }
        return this_;
    }
    if ('$scope' === key) {
        var nextKey = current.next == null ? null : current.next.body;
        if (nextKey == null) {
            return scope;
        }
        var scope = null, x = ctr;
        while (x != null) {
            if (x.scope != null) {
                if (scope == null) {
                    scope = x.scope;
                }
                if (_isDefined(x.scope, nextKey)) {
                    return x.scope;
                }
            }
            x = x.parent;
        }
        return scope;
    }
    // Model resolver
    if (_isDefined(model, key)) {
        return model[key];
    }
    // Scope resolver
    var scope = null, x = ctr;
    while (x != null) {
        if (x.scope != null) {
            if (scope == null) {
                scope = x.scope;
            }
            if (_isDefined(x.scope, key)) {
                return x.scope[key];
            }
        }
        x = x.parent;
    }
    return null;
}
export function util_resolveAcc(object, astAcc, model, ctx, ctr, preResults) {
    var value = object, current = astAcc;
    do {
        if (value == null) {
            verifyPropertyUndefinedError(current.parent, key);
            return null;
        }
        var type = current.type;
        if (type === type_Accessor) {
            value = value[current.body];
            continue;
        }
        if (type === type_AccessorExpr) {
            var key = _evaluateAst(current.body, model, ctx, ctr, preResults);
            value = value[key];
            continue;
        }
        if (type_FunctionRef === type) {
            var fn = value[current.body];
            if (typeof fn !== 'function') {
                warn_(current.body + ' is not a function', util_getNodeStack(astAcc));
                return null;
            }
            var args = Ast_FunctionRefUtil.evalArguments(current, model, ctr, ctr, preResults);
            value = fn.apply(value, args);
            continue;
        }
        util_throw('Syntax error: Invalid accessor type', type, current);
        return null;
    } while (value != null && (current = current.next) != null);
    return value;
}
function verifyPropertyUndefinedError(astNode, key) {
    if (astNode == null ||
        (astNode.next != null && astNode.optional !== true)) {
        // notify that value is not in model, ctx, controller;
        warn_("Cannot read property '" + astNode.next.body + "' of undefined", key, util_getNodeStack(astNode.next));
    }
}
function _isDefined(obj, key) {
    return obj != null && typeof obj === 'object' && key in obj;
}

import { Ast_Body, Ast_Statement, Ast_Object, Ast_TernaryStatement, Ast_AccessorExpr, Ast_Array, Ast_UnaryPrefix, Ast_Value, Ast_FunctionRef, Ast_SymbolRef, Ast_Accessor } from './ast';
import { state_body, punc_Semicolon, type_Body, go_ref, punc_ParenthesisOpen, punc_ParenthesisClose, state_arguments, type_FunctionRef, punc_BraceOpen, go_objectKey, punc_BraceClose, type_Object, punc_Comma, punc_Question, type_SymbolRef, type_AccessorExpr, type_Accessor, go_acs, punc_Colon, punc_Dot, go_number, op_AsyncAccessor, op_ObserveAccessor, type_Statement, punc_BracketOpen, punc_BracketClose, type_Array, op_Minus, op_LogicalNot, op_Plus, op_Multip, op_Divide, op_Modulo, op_BitOr, op_BitXOr, op_BitAnd, op_LogicalAnd, op_LogicalOr, op_LogicalEqual, op_LogicalEqual_Strict, op_LogicalNotEqual, op_LogicalNotEqual_Strict, op_LogicalGreater, op_LogicalGreaterEqual, op_LogicalLess, op_LogicalLessEqual, go_string, type_UnaryPrefix } from './scope-vars';
import { ast_findPrev, ast_remove, ast_handlePrecedence } from './ast_utils';
import { util_throw } from './util';
import { __rgxEscapedChar } from '@core/scope-vars';
var index = 0, length = 0, template, ast;
/*
 * earlyExit - only first statement/expression is consumed
 */
export function _parse(expr, earlyExit, node) {
    if (earlyExit == null) {
        earlyExit = false;
    }
    template = expr;
    index = 0;
    length = expr.length;
    ast = new Ast_Body(null, node);
    ast.source = expr;
    var current = ast, state = state_body, c, t, next, directive;
    outer: while (true) {
        if (index < length && (c = template.charCodeAt(index)) < 33) {
            index++;
            continue;
        }
        if (index >= length)
            break;
        directive = parser_getDirective(c);
        if (directive == null && index < length) {
            break;
        }
        if (directive === punc_Semicolon) {
            if (earlyExit === true)
                return [ast, index];
            break;
        }
        if (earlyExit === true) {
            var p = current.parent;
            if (p != null && p.type === type_Body && p.parent == null) {
                // is in root body
                if (directive === go_ref)
                    return [ast, index];
            }
        }
        if (directive === punc_Semicolon) {
            break;
        }
        switch (directive) {
            case punc_ParenthesisOpen:
                current = ast_append(current, new Ast_Statement(current));
                current = ast_append(current, new Ast_Body(current));
                index++;
                continue;
            case punc_ParenthesisClose:
                var closest = type_Body;
                if (state === state_arguments) {
                    state = state_body;
                    closest = type_FunctionRef;
                }
                do {
                    current = current.parent;
                } while (current != null && current.type !== closest);
                if (current.type === type_FunctionRef) {
                    current.closeArgs();
                }
                if (closest === type_Body) {
                    current = current.parent;
                }
                if (current == null) {
                    util_throw(template, index, 'OutOfAst Exception', c);
                    break outer;
                }
                index++;
                continue;
            case punc_BraceOpen:
                current = ast_append(current, new Ast_Object(current));
                directive = go_objectKey;
                index++;
                break;
            case punc_BraceClose:
                while (current != null && current.type !== type_Object) {
                    current = current.parent;
                }
                index++;
                continue;
            case punc_Comma:
                if (state !== state_arguments) {
                    state = state_body;
                    do {
                        current = current.parent;
                    } while (current != null &&
                        current.type !== type_Body &&
                        current.type !== type_Object);
                    index++;
                    if (current == null) {
                        util_throw(template, index, 'Unexpected comma', c);
                        break outer;
                    }
                    if (current.type === type_Object) {
                        directive = go_objectKey;
                        break;
                    }
                    continue;
                }
                do {
                    current = current.parent;
                } while (current != null && current.type !== type_FunctionRef);
                if (current == null) {
                    util_throw(template, index, 'OutOfAst Exception', c);
                    break outer;
                }
                current = current.newArg();
                index++;
                continue;
            case punc_Question:
                index++;
                c = parser_skipWhitespace();
                t = current.type;
                if ((t === type_SymbolRef || t === type_AccessorExpr || t === type_Accessor) && c === 46) {
                    // .
                    index++;
                    parser_skipWhitespace();
                    directive = go_acs;
                    current.optional = true;
                    break;
                }
                ast = new Ast_TernaryStatement(ast);
                current = ast.case1;
                continue;
            case punc_Colon:
                current = ast.case2;
                index++;
                continue;
            case punc_Dot:
                c = template.charCodeAt(index + 1);
                if (c >= 48 && c <= 57) {
                    directive = go_number;
                }
                else {
                    index++;
                    c = c > 32 ? c : parser_skipWhitespace();
                    directive = current.type === type_Body
                        ? go_ref
                        : go_acs;
                }
                break;
            case op_AsyncAccessor:
            case op_ObserveAccessor:
                t = current.type;
                if (t !== type_SymbolRef && t !== type_Accessor && t !== type_FunctionRef) {
                    return util_throw(template, index, 'Unexpected accessor:' + directive);
                }
                var ref = ast_findPrev(current, type_SymbolRef);
                if (ref == null) {
                    ref = ast_findPrev(current, type_FunctionRef);
                }
                if (ref == null) {
                    return util_throw(template, index, 'Ref not found');
                }
                var parent = ref.parent;
                if (parent.type !== type_Statement) {
                    return util_throw(template, index, 'Ref is not in a statement');
                }
                ast_remove(parent, ref);
                var statement = new Ast_Statement(parent);
                var inner = new Ast_Statement(statement);
                if (directive === op_AsyncAccessor) {
                    inner.async = true;
                }
                else {
                    inner.observe = true;
                }
                ref.parent = inner;
                ast_append(inner, ref);
                ast_append(statement, inner);
                ast_append(parent, statement);
                index++;
                if (directive === op_AsyncAccessor) {
                    ast.async = true;
                }
                else {
                    ast.observe = true;
                }
                c = parser_skipWhitespace();
                directive = go_acs;
                current = statement.parent;
                break;
            case punc_BracketOpen:
                t = current.type;
                if (t === type_SymbolRef || t === type_AccessorExpr || t === type_Accessor) {
                    current = ast_append(current, new Ast_AccessorExpr(current));
                    current.sourceIndex = index;
                    current = current.getBody();
                    index++;
                    continue;
                }
                current = ast_append(current, new Ast_Array(current));
                current = current.body;
                index++;
                continue;
            case punc_BracketClose:
                do {
                    current = current.parent;
                } while (current != null &&
                    current.type !== type_AccessorExpr &&
                    current.type !== type_Array);
                index++;
                continue;
        }
        if (current.type === type_Body) {
            current = ast_append(current, new Ast_Statement(current));
        }
        if ((op_Minus === directive || op_LogicalNot === directive) && current.body == null) {
            current = ast_append(current, new Ast_UnaryPrefix(current, directive));
            index++;
            continue;
        }
        switch (directive) {
            case op_Minus:
            case op_Plus:
            case op_Multip:
            case op_Divide:
            case op_Modulo:
            case op_BitOr:
            case op_BitXOr:
            case op_BitAnd:
            case op_LogicalAnd:
            case op_LogicalOr:
            case op_LogicalEqual:
            case op_LogicalEqual_Strict:
            case op_LogicalNotEqual:
            case op_LogicalNotEqual_Strict:
            case op_LogicalGreater:
            case op_LogicalGreaterEqual:
            case op_LogicalLess:
            case op_LogicalLessEqual:
                while (current && current.type !== type_Statement) {
                    current = current.parent;
                }
                if (current.body == null) {
                    return util_throw(template, index, 'Unexpected operator', c);
                }
                current.join = directive;
                do {
                    current = current.parent;
                } while (current != null && current.type !== type_Body);
                if (current == null) {
                    return util_throw(template, index, 'Unexpected operator', c);
                }
                index++;
                continue;
            case go_string:
            case go_number:
                if (current.body != null && current.join == null) {
                    return util_throw(template, index, 'Directive expected', c);
                }
                if (go_string === directive) {
                    index++;
                    ast_append(current, new Ast_Value(parser_getString(c)));
                    index++;
                }
                if (go_number === directive) {
                    ast_append(current, new Ast_Value(parser_getNumber()));
                }
                continue;
            case go_ref:
            case go_acs:
                var start = index, ref = parser_getRef();
                if (directive === go_ref) {
                    if (ref === 'null')
                        ref = null;
                    if (ref === 'false')
                        ref = false;
                    if (ref === 'true')
                        ref = true;
                    if (current.type === type_Body || current.type === type_Statement) {
                        if (ref === 'await') {
                            ast.async = true;
                            current.async = true;
                            continue;
                        }
                        if (ref === 'observe') {
                            ast.observe = true;
                            current.observe = true;
                            continue;
                        }
                    }
                    if (typeof ref !== 'string') {
                        ast_append(current, new Ast_Value(ref));
                        continue;
                    }
                }
                while (index < length) {
                    c = template.charCodeAt(index);
                    if (c < 33) {
                        index++;
                        continue;
                    }
                    break;
                }
                if (c === 40) {
                    // (
                    // function ref
                    state = state_arguments;
                    index++;
                    var fn = new Ast_FunctionRef(current, ref);
                    if (directive === go_acs && current.type === type_Statement) {
                        current.next = fn;
                    }
                    else {
                        ast_append(current, fn);
                    }
                    current = fn.newArg();
                    continue;
                }
                var Ctor = directive === go_ref
                    ? Ast_SymbolRef
                    : Ast_Accessor;
                current = ast_append(current, new Ctor(current, ref));
                current.sourceIndex = start;
                break;
            case go_objectKey:
                if (parser_skipWhitespace() === 125)
                    continue;
                var key = parser_getRef();
                if (parser_skipWhitespace() !== 58) {
                    //:
                    return util_throw(template, index, 'Object parser. Semicolon expeted', c);
                }
                index++;
                current = current.nextProp(key);
                directive = go_ref;
                continue;
        }
    }
    if (current.body == null &&
        current.type === type_Statement) {
        return util_throw(template, index, 'Unexpected end of expression', c);
    }
    ast_handlePrecedence(ast);
    return ast;
}
function parser_skipWhitespace() {
    var c;
    while (index < length) {
        c = template.charCodeAt(index);
        if (c > 32)
            return c;
        index++;
    }
    return null;
}
;
function parser_getString(c) {
    var isEscaped = false, _char = c === 39 ? "'" : '"', start = index, nindex, string;
    while ((nindex = template.indexOf(_char, index)) > -1) {
        index = nindex;
        if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/) {
            break;
        }
        isEscaped = true;
        index++;
    }
    string = template.substring(start, index);
    if (isEscaped === true) {
        string = string.replace(__rgxEscapedChar[_char], _char);
    }
    return string;
}
;
function parser_getNumber() {
    var start = index, code, isDouble;
    while (true) {
        code = template.charCodeAt(index);
        if (code === 46) {
            // .
            if (isDouble === true) {
                util_throw(template, index, 'Invalid number', code);
                return null;
            }
            isDouble = true;
        }
        if ((code >= 48 && code <= 57 || code === 46) && index < length) {
            index++;
            continue;
        }
        break;
    }
    return +template.substring(start, index);
}
;
export function parser_getRef() {
    var start = index, c = template.charCodeAt(index), ref;
    if (c === 34 || c === 39) {
        // ' | "
        index++;
        ref = parser_getString(c);
        index++;
        return ref;
    }
    while (true) {
        if (index === length)
            break;
        c = template.charCodeAt(index);
        if (c === 36 || c === 95) {
            // $ _
            index++;
            continue;
        }
        if ((48 <= c && c <= 57) || // 0-9
            (65 <= c && c <= 90) || // A-Z
            (97 <= c && c <= 122)) { // a-z
            index++;
            continue;
        }
        // - [removed] (exit on not allowed chars) 5ba755ca
        break;
    }
    return template.substring(start, index);
}
;
export function parser_getDirective(code) {
    if (code == null && index === length)
        return null;
    switch (code) {
        case 40 /*(*/:
            return punc_ParenthesisOpen;
        case 41 /*)*/:
            return punc_ParenthesisClose;
        case 123 /*{*/:
            return punc_BraceOpen;
        case 125 /*}*/:
            return punc_BraceClose;
        case 91 /*[*/:
            return punc_BracketOpen;
        case 93 /*]*/:
            return punc_BracketClose;
        case 44 /*,*/:
            return punc_Comma;
        case 46 /*.*/:
            return punc_Dot;
        case 59 /*;*/:
            return punc_Semicolon;
        case 43 /*+*/:
            return op_Plus;
        case 45 /*-*/:
            if (template.charCodeAt(index + 1) === 62 /*>*/) {
                index++;
                return op_AsyncAccessor;
            }
            return op_Minus;
        case 42 /* * */:
            return op_Multip;
        case 47 /*/*/:
            return op_Divide;
        case 37 /*%*/:
            return op_Modulo;
        case 61 /*=*/:
            if (template.charCodeAt(++index) !== code) {
                util_throw(template, index, 'Assignment violation: View can only access model/controllers', '=');
                return null;
            }
            if (template.charCodeAt(index + 1) === code) {
                index++;
                return op_LogicalEqual_Strict;
            }
            return op_LogicalEqual;
        case 33 /*!*/:
            if (template.charCodeAt(index + 1) === 61) {
                // =
                index++;
                if (template.charCodeAt(index + 1) === 61) {
                    // =
                    index++;
                    return op_LogicalNotEqual_Strict;
                }
                return op_LogicalNotEqual;
            }
            return op_LogicalNot;
        case 62 /*>*/:
            var next = template.charCodeAt(index + 1);
            if (next === 61 /*=*/) {
                index++;
                return op_LogicalGreaterEqual;
            }
            if (next === 62 /*>*/) {
                index++;
                return op_ObserveAccessor;
            }
            return op_LogicalGreater;
        case 60 /*<*/:
            if (template.charCodeAt(index + 1) === 61) {
                index++;
                return op_LogicalLessEqual;
            }
            return op_LogicalLess;
        case 38 /*&*/:
            if (template.charCodeAt(++index) !== code) {
                return op_BitAnd;
            }
            return op_LogicalAnd;
        case 124 /*|*/:
            if (template.charCodeAt(++index) !== code) {
                return op_BitOr;
            }
            return op_LogicalOr;
        case 94 /*^*/:
            return op_BitXOr;
        case 63 /*?*/:
            return punc_Question;
        case 58 /*:*/:
            return punc_Colon;
    }
    if ((code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        (code === 95) ||
        (code === 36)) {
        // A-Z a-z _ $
        return go_ref;
    }
    if (code >= 48 && code <= 57) {
        // 0-9 .
        return go_number;
    }
    if (code === 34 || code === 39) {
        // " '
        return go_string;
    }
    util_throw(template, index, 'Unexpected or unsupported directive', code);
    return null;
}
;
export function ast_append(current, next) {
    switch (current.type) {
        case type_Body:
            current.body.push(next);
            return next;
        case type_Statement:
            if (next.type === type_Accessor || next.type === type_AccessorExpr) {
                return (current.next = next);
            }
        /* fall through */
        case type_UnaryPrefix:
            return (current.body = next);
        case type_SymbolRef:
        case type_FunctionRef:
        case type_Accessor:
        case type_AccessorExpr:
            return (current.next = next);
    }
    return util_throw(template, index, 'Invalid expression');
}
;

import { _parse } from './parser';
import { Ast_Body } from './ast';
import { _evaluateAst } from './eval';
export function _evaluateStatements(expr, model, ctx, ctr, node) {
    var body = _parse(expr, false, node).body, args = [], imax = body.length, i = -1;
    var group = new Ast_Body;
    while (++i < imax) {
        group.body.push(body[i]);
        if (body[i].join != null)
            continue;
        args.push(_evaluateAst(group, model, ctx, ctr));
        group.body.length = 0;
    }
    return args;
}

import { log_error, log_warn } from '@core/util/reporters';
import { type_Body, type_SymbolRef, type_Accessor, type_AccessorExpr, type_FunctionRef, type_Statement, type_UnaryPrefix, type_Ternary } from './scope-vars';
import { _parse } from './parser';
import { _evaluateAst } from './eval';
/**
 * extract symbol references
 * ~[:user.name + 'px'] -> 'user.name'
 * ~[:someFn(varName) + user.name] -> ['varName', 'user.name']
 *
 * ~[:someFn().user.name] -> {accessor: (Accessor AST function call) , ref: 'user.name'}
 */
export function refs_extractVars(mix, model, ctx, ctr) {
    var ast = typeof mix === 'string' ? _parse(mix) : mix;
    return _extractVars(ast, model, ctx, ctr);
}
function _extractVars(expr, model, ctx, ctr) {
    if (expr == null)
        return null;
    var exprType = expr.type, refs, x;
    if (type_Body === exprType) {
        var body = expr.body, imax = body.length, i = -1;
        while (++i < imax) {
            x = _extractVars(body[i], model, ctx, ctr);
            refs = _append(refs, x);
        }
    }
    if (type_SymbolRef === exprType ||
        type_Accessor === exprType ||
        type_AccessorExpr === exprType) {
        var path = expr.body, next = expr.next, nextType;
        while (next != null) {
            nextType = next.type;
            if (type_FunctionRef === nextType) {
                return _extractVars(next, model, ctx, ctr);
            }
            if (type_SymbolRef !== nextType &&
                type_Accessor !== nextType &&
                type_AccessorExpr !== nextType) {
                log_error('Ast Exception: next should be a symbol/function ref');
                return null;
            }
            var prop = nextType === type_AccessorExpr
                ? _evaluateAst(next.body, model, ctx, ctr)
                : next.body;
            if (typeof prop !== 'string') {
                log_warn('Can`t extract accessor name', path);
                return null;
            }
            path += '.' + prop;
            next = next.next;
        }
        return path;
    }
    switch (exprType) {
        case type_Statement:
        case type_UnaryPrefix:
        case type_Ternary:
            x = _extractVars(expr.body, model, ctx, ctr);
            refs = _append(refs, x);
            break;
    }
    // get also from case1 and case2
    if (type_Ternary === exprType) {
        x = _extractVars(expr.case1, model, ctx, ctr);
        refs = _append(refs, x);
        x = _extractVars(expr.case2, model, ctx, ctr);
        refs = _append(refs, x);
    }
    if (type_FunctionRef === exprType) {
        var args = expr.arguments, imax = args.length, i = -1;
        while (++i < imax) {
            x = _extractVars(args[i], model, ctx, ctr);
            refs = _append(refs, x);
        }
        x = null;
        var parent = expr;
        outer: while ((parent = parent.parent)) {
            switch (parent.type) {
                case type_SymbolRef:
                case type_Accessor:
                case type_AccessorExpr:
                    x = parent.body + (x == null ? '' : '.' + x);
                    break;
                case type_Body:
                case type_Statement:
                    break outer;
                default:
                    x = null;
                    break outer;
            }
        }
        if (x != null) {
            refs = _append(refs, x);
        }
        if (expr.next) {
            x = _extractVars(expr.next, model, ctx, ctr);
            refs = _append(refs, { accessor: _getAccessor(expr), ref: x });
        }
    }
    return refs;
}
function _append(current, x) {
    if (current == null) {
        return x;
    }
    if (x == null) {
        return current;
    }
    if (!(typeof current === 'object' && current.length != null)) {
        current = [current];
    }
    if (!(typeof x === 'object' && x.length != null)) {
        if (current.indexOf(x) === -1) {
            current.push(x);
        }
        return current;
    }
    for (var i = 0, imax = x.length; i < imax; i++) {
        if (current.indexOf(x[i]) === -1) {
            current.push(x[i]);
        }
    }
    return current;
}
function _getAccessor(current) {
    var parent = current;
    outer: while (parent.parent) {
        switch (parent.parent.type) {
            case type_Body:
            case type_Statement:
                break outer;
        }
        parent = parent.parent;
    }
    return _copy(parent, current.next);
}
function _copy(ast, stop) {
    if (ast === stop || ast == null) {
        return null;
    }
    if (typeof ast !== 'object') {
        return ast;
    }
    if (ast.length != null && typeof ast.splice === 'function') {
        var arr = [];
        for (var i = 0, imax = ast.length; i < imax; i++) {
            arr[i] = _copy(ast[i], stop);
        }
        return arr;
    }
    var clone = {};
    for (var key in ast) {
        if (ast[key] == null || key === 'parent') {
            continue;
        }
        clone[key] = _copy(ast[key], stop);
    }
    return clone;
}

import { customUtil_register } from '@core/custom/exports';
import { _parse } from './parser';
import { _evaluate } from './eval';
import { _evaluateStatements } from './eval_statements';
import { refs_extractVars } from './vars_helper';
/**
 * ExpressionUtil
 *
 * Helper to work with expressions
 **/
export var exp_type_Sync = 1;
export var exp_type_Async = 2;
export var exp_type_Observe = 3;
export function expression_getType(expr) {
    var ast = _parse(expr);
    if (ast != null) {
        if (ast.observe) {
            return exp_type_Observe;
        }
        if (ast.async) {
            return exp_type_Async;
        }
    }
    return exp_type_Sync;
}
export var expression_eval = _evaluate;
export var expression_evalStatements = _evaluateStatements;
export var expression_varRefs = refs_extractVars;
export var expression_parse = _parse;
export var ExpressionUtil = {
    'parse': _parse,
    /**
     * Expression.eval(expression [, model, cntx, controller]) -> result
     * - expression (String): Expression, only accessors are supoorted
     *
     * All symbol and function references will be looked for in
     *
     * 1. model, or via special accessors:
     * 		- `$c` controller
     * 		- `$ctx`
     * 		- `$a' controllers attributes
     * 2. scope:
     * 		controller.scope
     * 		controller.parent.scope
     * 		...
     *
     * Sample:
     * '(user.age + 20) / 2'
     * 'fn(user.age + "!") + x'
     **/
    'eval': _evaluate,
    'varRefs': refs_extractVars,
    // Return all values of a comma delimiter expressions
    // like argumets: ' foo, bar, "4,50" ' => [ %fooValue, %barValue, "4,50" ]
    'evalStatements': _evaluateStatements
};
customUtil_register('expression', function (value, model, ctx, element, ctr, name, type, node) {
    var owner = type === 'compo-attr' || type === 'compo-prop' ? ctr.parent : ctr;
    return expression_eval(value, model, ctx, owner, node);
});

import { is_Function } from '@utils/is';
import { fn_proxy } from '@utils/fn';
import { custom_Utils } from './repositories';
import { expression_evalStatements } from '@project/expression/src/exports';
/**
 * Utils Repository
 * @param {string} name
 * @param {(IUtilHandler|UtilHandler)} handler
 * @memberOf mask
 * @name _
 * @category Mask Util
 */
export var customUtil_$utils = {};
/**
 * Register Util Handler. Template Example: `'~[myUtil: value]'`
 * @param {string} name
 * @param {(mask._.IUtilHandler|mask._.FUtilHandler)} handler
 * @memberOf mask
 * @method getUtil
 * @category Mask Util
 */
export function customUtil_register(name, mix) {
    if (is_Function(mix)) {
        custom_Utils[name] = mix;
        return;
    }
    custom_Utils[name] = createUtil(mix);
    if (mix['arguments'] === 'parsed')
        customUtil_$utils[name] = mix.process;
}
;
/**
 * Get the Util Handler
 * @param {string} name
 * @memberOf mask
 * @method registerUtil
 * @category Mask Util
 */
export function customUtil_get(name) {
    return name != null ? custom_Utils[name] : custom_Utils;
}
;
function createUtil(obj) {
    if (obj['arguments'] === 'parsed') {
        return processParsedDelegate(obj.process);
    }
    var fn = fn_proxy(obj.process || processRawFn, obj);
    // <static> save reference to the initial util object.
    // Mask.Bootstrap needs the original util
    // @workaround
    fn.util = obj;
    return fn;
}
function processRawFn(expr, model, ctx, el, ctr, attrName, type, node) {
    if ('node' === type) {
        this.nodeRenderStart(expr, model, ctx, el, ctr, type, node);
        return this.node(expr, model, ctx, el, ctr, type, node);
    }
    // `attr`, `compo-attr`
    this.attrRenderStart(expr, model, ctx, el, ctr, attrName, type, node);
    return this.attr(expr, model, ctx, el, ctr, attrName, type, node);
}
function processParsedDelegate(fn) {
    return function (expr, model, ctx, el, ctr, type, node) {
        var args = expression_evalStatements(expr, model, ctx, ctr, node);
        return fn.apply(null, args);
    };
}
/**
 * Is called when the builder matches the interpolation.
 * Define `process` function OR group of `node*`,`attr*` functions.
 * The seperation `*RenderStart/*` is needed for Nodejs rendering - the first part is called on nodejs side,
 * the other one is called on the client.
 * @typedef IUtilHandler
 * @type {object}
 * @property {bool} [arguments=false] - should parse interpolation string to arguments, otherwise raw string is passed
 * @property {UtilHandler} [process]
 * @property {function} [nodeRenderStart] - `expr, model, ctx, element, controller, attrName`
 * @property {function} [node] - `expr, model, ctx, element, controller`
 * @property {function} [attr] - `expr, model, ctx, element, controller, attrName`
 * @property {function} [attrRenderStart] - `expr, model, ctx, element, controller, attrName`
 * @abstract
 * @category Mask Util
 */
var IUtilHandler = {
    'arguments': null,
    'process': null,
    'nodeRenderStart': null,
    'node': null,
    'attrRenderStart': null,
    'attr': null,
};
/**
 * Is called when the builder matches the interpolation
 * @param {string} value - string after the utility name
 * @param {object} model
 * @param {("attr"|"node")} type - Current location: text node or attribute
 * @param {HTMLNode} element
 * @param {string} name - If the interpolation is in attribute, then this will contain attributes name
 * @typedef UtilHandler
 * @type {function}
 * @abstract
 * @category Mask Util
 */
function UtilHandler() { }

import { is_Function } from '@utils/is';
import { custom_Statements } from './repositories';
/**
 * Register a statement handler
 * @param {string} name - Tag name to handle
 * @param StatementHandler} handler
 * @memberOf mask
 * @method registerStatement
 */
export function customStatement_register(name, handler) {
    //@TODO should it be not allowed to override system statements, if, switch?
    custom_Statements[name] = is_Function(handler)
        ? { render: handler }
        : handler;
}
;
/**
 * Get statement handler
 * @param {string} name
 * @returns {StatementHandler}
 * @memberOf mask
 * @method getStatement
 */
export function customStatement_get(name) {
    return name != null
        ? custom_Statements[name]
        : custom_Statements;
}
;
/**
 * Is called when the builder matches the node by tagName
 * @callback StatementHandler
 * @param {MaskNode} node
 * @param {object} model
 * @param {object} ctx
 * @param {DomNode} container
 * @param {object} parentComponent
 * @param {Array} children - `out` Fill the array with rendered elements
 */ 

export { custom_optimize } from './optimize';
export { custom_Utils, custom_Statements, custom_Attributes, custom_Tags, custom_Tags_global, custom_Tags_defs, custom_Parsers, custom_Parsers_Transform, custom_Optimizers } from './repositories';
export { customAttr_register, customAttr_get } from './attribute';
export { customTag_get, customTag_getAll, customTag_register, customTag_registerScoped, customTag_registerFromTemplate, customTag_registerResolver, customTag_Resolver, customTag_Compo_getHandler, customTag_define, customTag_Base } from './tag';
export { customUtil_get, customUtil_$utils, customUtil_register } from './util';
export { customStatement_register, customStatement_get } from './statement';

import { _Array_slice, _global } from '@utils/refs';
import { is_Function, is_Object } from '@utils/is';
import { builder_build, builder_Ctx, BuilderData } from '@core/builder/exports';
import { parser_parse } from '@core/parser/exports';
import { log_warn } from '@core/util/reporters';
import { Compo, Component } from '@compo/exports';
/**
 * Find all `<script type="text/mask" data-run='true'>` blocks in the page
 * and render each block into the parents container.
 *
 * The function is automatically renders the blocks
 * `<script type="text/mask" data-run='auto'>` on `DOMContentLoaded` event
 * @returns {object} Root component
 * @memberOf mask
 * @method run
*/
export function mask_run() {
    if (_state === 0) {
        _state = _state_All;
    }
    var args = _Array_slice.call(arguments), model, ctx, el, Ctor;
    var imax = args.length, i = -1, mix;
    while (++i < imax) {
        mix = args[i];
        if (mix instanceof Node) {
            el = mix;
            continue;
        }
        if (is_Function(mix)) {
            Ctor = mix;
            continue;
        }
        if (is_Object(mix)) {
            if (model == null) {
                model = mix;
                continue;
            }
            ctx = mix;
        }
    }
    if (el == null)
        el = document.body;
    if (Ctor == null)
        Ctor = Compo;
    if (model == null) {
        model = {};
    }
    var ctr = new Ctor(null, model, ctx, el);
    return _run(model, ctx, el, ctr);
}
;
function _run(model, ctx, container, ctr) {
    ctr.ID = ++BuilderData.id;
    var scripts = _Array_slice.call(document.getElementsByTagName('script')), script = null, found = false, ready = false, wait = 0, imax = scripts.length, i = -1;
    while (++i < imax) {
        script = scripts[i];
        var scriptType = script.getAttribute('type');
        if (scriptType !== 'text/mask' && scriptType !== 'text/x-mask')
            continue;
        var dataRun = script.getAttribute('data-run');
        if (dataRun == null) {
            continue;
        }
        if (dataRun === 'auto') {
            if (isCurrent(_state_Auto) === false) {
                continue;
            }
        }
        if (dataRun === 'true') {
            if (isCurrent(_state_Manual) === false) {
                continue;
            }
        }
        found = true;
        var ctx_ = new builder_Ctx(ctx);
        var fragment = builder_build(parser_parse(script.textContent), model, ctx_, null, ctr);
        if (ctx_.async === true) {
            wait++;
            ctx_.done(resumer);
        }
        script.parentNode.insertBefore(fragment, script);
    }
    if (found === false) {
        if (_state === _state_Auto) {
            return null;
        }
        log_warn("No blocks found: <script type='text/mask' data-run='true'>...</script>");
    }
    ready = true;
    if (wait === 0) {
        flush();
    }
    function resumer() {
        if (--wait === 0 && ready)
            flush();
    }
    function flush() {
        if (is_Function(ctr.renderEnd)) {
            ctr.renderEnd(container, model);
        }
        Component.signal.emitIn(ctr, 'domInsert');
    }
    return ctr;
}
if (document != null && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function (event) {
        if (_state !== 0)
            return;
        var _app;
        _state = _state_Auto;
        _app = mask_run();
        _state = _state_Manual;
        if (_app == null)
            return;
        if (_global.app == null) {
            _global.app = _app;
            return;
        }
        var source = _app.components;
        if (source == null || source.length === 0) {
            return;
        }
        var target = _global.app.components;
        if (target == null || target.length === 0) {
            _global.app.components = source;
            return;
        }
        target.push.apply(target, source);
    });
}
var _state_Auto = 2, _state_Manual = 4, _state_All = _state_Auto | _state_Manual, _state = 0;
function isCurrent(state) {
    return (_state & state) === state;
}

import { Dom } from '@core/dom/exports';
import { _Array_splice } from '@utils/refs';
import { class_create } from '@utils/class';
import { is_Array } from '@utils/is';
import { coll_map } from '@utils/coll';
import { parser_parse } from '@core/parser/exports';
/**
 * TreeWalker
 * @memberOf mask
 * @name TreeWalker
 */
export var mask_TreeWalker = {
    /**
     * Visit each mask node
     * @param {MaskNode} root
     * @param {TreeWalker~SyncVisitior} visitor
     * @memberOf mask.TreeWalker
     */
    walk: function (root, fn) {
        if (typeof root === 'object' && root.type === Dom.CONTROLLER) {
            new SyncWalkerCompos(root, fn);
            return root;
        }
        root = prepairRoot(root);
        new SyncWalker(root, fn);
        return root;
    },
    /**
     * Asynchronous visit each mask node
     * @param {MaskNode} root
     * @param {TreeWalker~AsyncVisitior} visitor
     * @param {function} done
     * @memberOf mask.TreeWalker
     */
    walkAsync: function (root, fn, done) {
        root = prepairRoot(root);
        new AsyncWalker(root, fn, done);
    },
    map: function (root, fn) {
        return new SyncMapper().map(root, fn);
    },
    superpose: function (rootA, rootB, fn) {
        return new SyncSuperposer().join(rootA, rootB, fn);
    }
};
var SyncWalker, SyncWalkerCompos;
(function () {
    SyncWalker = function (root, fn) {
        walk(root, fn);
    };
    SyncWalkerCompos = function (root, fn) {
        walkCompos(root, fn, root);
    };
    function walk(node, fn, parent, index) {
        if (node == null)
            return null;
        var deep = true, break_ = false, mod;
        if (isFragment(node) !== true) {
            mod = fn(node);
        }
        if (mod !== void 0) {
            mod = new Modifier(mod);
            mod.process(new Step(node, parent, index));
            deep = mod.deep;
            break_ = mod['break'];
        }
        var nodes = safe_getNodes(node);
        if (nodes == null || deep === false || break_ === true) {
            return mod;
        }
        var imax = nodes.length, i = 0, x;
        for (; i < imax; i++) {
            x = nodes[i];
            mod = walk(x, fn, node, i);
            if (mod != null && mod['break'] === true) {
                return mod;
            }
        }
    }
    function walkCompos(compo, fn, parent, index) {
        if (compo == null)
            return;
        var mod = fn(compo, index);
        if (mod !== void 0) {
            if (mod.deep === false || mod['break'] === true) {
                return mod;
            }
        }
        var compos = compo.components;
        if (compos == null) {
            return null;
        }
        var imax = compos.length, i = 0, x;
        for (; i < imax; i++) {
            x = compos[i];
            mod = walkCompos(x, fn, compo, i);
            if (mod != null && mod['break'] === true) {
                return mod;
            }
        }
    }
}());
var AsyncWalker;
(function () {
    AsyncWalker = function (root, fn, done) {
        this.stack = [];
        this.done = done;
        this.root = root;
        this.fn = fn;
        this.process = this.process.bind(this);
        this.visit(this.push(root));
    };
    AsyncWalker.prototype = {
        current: function () {
            return this.stack[this.stack.length - 1];
        },
        push: function (node, parent, index) {
            var step = new Step(node, parent, index);
            this.stack.push(step);
            return step;
        },
        pop: function () {
            return this.stack.pop();
        },
        getNext: function (goDeep) {
            var current = this.current(), node = current.node, nodes = safe_getNodes(node);
            if (node == null) {
                throw Error('Node is null');
            }
            if (nodes != null && goDeep !== false && nodes.length !== 0) {
                if (nodes[0] == null) {
                    throw Error('Node is null');
                }
                return this.push(nodes[0], node, 0);
            }
            var parent, index;
            while (this.stack.length !== 0) {
                current = this.pop();
                parent = current.parent;
                index = current.index;
                if (parent == null) {
                    this.pop();
                    continue;
                }
                if (++index < parent.nodes.length) {
                    return this.push(parent.nodes[index], parent, index);
                }
            }
            return null;
        },
        process: function (mod) {
            var deep = true, break_ = false;
            if (mod !== void 0) {
                mod = new Modifier(mod);
                mod.process(this.current());
                deep = mod.deep;
                break_ = mod['break'];
            }
            var next = break_ === true ? null : this.getNext(deep);
            if (next == null) {
                this.done(this.root);
                return;
            }
            this.visit(next);
        },
        visit: function (step) {
            var node = step.node;
            if (isFragment(node) === false) {
                this.fn(node, this.process);
                return;
            }
            this.process();
        },
        fn: null,
        done: null,
        stack: null
    };
}());
var Modifier;
(function () {
    /**
     * @name IModifier
     * @memberOf TreeWalker
     */
    Modifier = function (mod, step) {
        for (var key in mod) {
            this[key] = mod[key];
        }
    };
    Modifier.prototype = {
        /**
         * On `true` stops the walker
         */
        'break': false,
        /**
         * On `false` doesn't visit the subnodes
         */
        deep: true,
        /**
         * On `true` removes current node
         */
        remove: false,
        /**
         * On not `null`, replaces the current node with value
         */
        replace: null,
        process: function (step) {
            if (this.replace != null) {
                this.deep = false;
                step.parent.nodes[step.index] = this.replace;
                return;
            }
            if (this.remove === true) {
                this.deep = false;
                var arr = step.parent.nodes, i = step.index;
                _Array_splice.call(arr, i, 1);
                return;
            }
        }
    };
}());
var SyncMapper;
(function () {
    SyncMapper = class_create({
        map: function (node, fn) {
            var mapper = getMapper(node);
            return mapper(node, fn);
        }
    });
    function getMapper(node) {
        /* not strict */
        if (node.compoName) {
            return mapCompo;
        }
        return mapNode;
    }
    function mapNode(node, fn, parent, index) {
        if (node == null)
            return null;
        var nextNode = isFragment(node)
            ? new Dom.Fragment
            : fn(node);
        if (nextNode == null) {
            return null;
        }
        var nodes = safe_getNodes(node);
        if (nodes == null) {
            return nextNode;
        }
        nextNode.nodes = coll_map(nodes, function (x) {
            return mapNode(x, fn, node);
        });
        return nextNode;
    }
    function mapCompo(compo, fn, parent) {
        if (compo == null)
            return null;
        var next = fn(compo);
        if (next == null || compo.components == null) {
            return next;
        }
        next.components = coll_map(compo.components, function (x) {
            return mapCompo(x, fn, compo);
        });
        return next;
    }
}());
var SyncSuperposer;
(function () {
    SyncSuperposer = class_create({
        join: function (rootA, rootB, fn) {
            var superposer = getSuperposer(rootA);
            return superposer(rootA, rootB, fn);
        }
    });
    function getSuperposer(node) {
        /* not strict */
        if (node.compoName) {
            return superposeCompos;
        }
        return superposeNodes;
    }
    function superposeNodes(nodeA, nodeB, fn) {
        var typeA = safe_getType(nodeA), typeB = safe_getType(nodeB);
        if (typeA !== typeB) {
            return;
        }
        if (typeA !== Dom.FRAGMENT) {
            fn(nodeA, nodeB);
        }
        var arrA = safe_getNodes(nodeA), arrB = safe_getNodes(nodeB);
        if (arrA == null || arrB == null) {
            return;
        }
        var aL = arrA.length, bL = arrB.length, i = -1;
        while (++i < aL && i < bL) {
            var a = arrA[i], b = arrB[i];
            if (a.tagName != null && a.tagName !== b.tagName) {
                continue;
            }
            superposeNodes(a, b, fn);
        }
        return nodeA;
    }
    function superposeCompos(compoA, compoB, fn) {
        fn(compoA, compoB);
        var arrA = compoA.components, arrB = compoB.components;
        if (arrA == null || arrB == null) {
            return;
        }
        var aL = arrA.length, bL = arrB.length, i = -1;
        while (++i < aL && i < bL) {
            var a = arrA[i], b = arrB[i];
            if (a.compoName != null && a.compoName !== b.compoName) {
                continue;
            }
            superposeCompos(a, b, fn);
        }
    }
}());
var Step = function (node, parent, index) {
    this.node = node;
    this.index = index;
    this.parent = parent;
};
/* UTILS */
function isFragment(node) {
    return Dom.FRAGMENT === safe_getType(node);
}
function safe_getNodes(node) {
    var nodes = node.nodes;
    if (nodes == null)
        return null;
    return is_Array(nodes)
        ? (nodes)
        : (node.nodes = [nodes]);
}
function safe_getType(node) {
    var type = node.type;
    if (type != null)
        return type;
    if (is_Array(node))
        return Dom.FRAGMENT;
    if (node.tagName != null)
        return Dom.NODE;
    if (node.content != null)
        return Dom.TEXTNODE;
    return Dom.NODE;
}
function prepairRoot(root) {
    if (typeof root === 'string') {
        root = parser_parse(root);
    }
    if (isFragment(root) === false) {
        var fragment = new Dom.Fragment;
        fragment.appendChild(root);
        root = fragment;
    }
    return root;
}
/**
 * Is called on each node
 * @callback TreeWalker~SyncVisitor
 * @param {MaskNode} node
 * @returns {Modifier|void}
 */
/**
 * Is called on each node
 * @callback TreeWalker~AsyncVisitor
 * @param {MaskNode} node
 * @param {function} done - Optional pass @see{@link TreeWalker.IModifier} to the callback
 * @returns {void}
 */

import { mask_TreeWalker } from './TreeWalker';
import { custom_Optimizers } from '@core/custom/exports';
/**
 * Run all registerd optimizers recursively on the nodes
 * @param {MaskNode} node
 * @param {function} onComplete
 * @param {mask.optimize~onComplete} done
 */
export function mask_optimize(dom, done) {
    mask_TreeWalker.walkAsync(dom, function (node, next) {
        var fn = getOptimizer(node);
        if (fn != null) {
            fn(node, next);
            return;
        }
        next();
    }, done);
}
;
/**
 * Register custom optimizer for a node name
 * @param {string} tagName - Node name
 * @param {function} visitor - Used for @see {@link mask.TreeWalker.walkSync}
 */
export function mask_registerOptimizer(tagName, fn) {
    custom_Optimizers[tagName] = fn;
}
;
function getOptimizer(node) {
    return custom_Optimizers[node.tagName];
}
/**
 * Returns optimized mask tree
 * @callback mask.optimize~onComplete
 * @param {MaskNode} node
 */

export var _opts = {
    base: null,
    nsBase: '/',
    version: null,
    es6Modules: false,
    moduleResolution: 'classic',
    ext: {
        'mask': 'mask',
        'script': 'js',
        'style': 'js'
    },
    prefixes: {}
};

import { path_toLocalFile } from '@core/util/path';
export function xhr_get(path, cb) {
    //@TODO Implement remote http getter
    var filename = path_toLocalFile(path);
    fs.readFile(filename, 'utf8', function (error, str) {
        if (error != null) {
            cb({
                message: error.toString(),
                status: error.code
            });
            return;
        }
        cb(null, str);
    });
}
var fs = require('fs');

export function style_get(path, cb) {
    // skip all CSS embeddings
    cb();
}
;

import { path_toLocalFile } from '@core/util/path';
export function script_get(path, cb) {
    var filename = path_toLocalFile(path);
    try {
        var x = require(filename);
        cb(null, x);
    }
    catch (error) {
        cb(error);
    }
}
;

export { xhr_get } from './xhr_node';
export { style_get } from './style_node';
export { script_get } from './script_node';

import { xhr_get } from './xhr_base';
export function json_get(path, cb) {
    xhr_get(path, function (error, str) {
        if (error) {
            cb(error);
            return;
        }
        var json;
        try {
            json = JSON.parse(str);
        }
        catch (error) {
            cb('JSON error: ' + String(error));
            return;
        }
        cb(null, json);
    });
}
;

import { xhr_get, script_get, style_get } from './transports/xhr_base';
import { json_get } from './transports/json';
import { path_resolveUrl } from '../path';
import { class_Dfr } from '@utils/class/Dfr';
import { Module } from '@core/feature/modules/exports';
export function file_get(path, ctr) {
    return get(xhr_get, path, ctr);
}
export function file_getScript(path, ctr) {
    return get(script_get, path, ctr);
}
export function file_getStyle(path, ctr) {
    return get(style_get, path, ctr);
}
export function file_getJson(path, ctr) {
    return get(json_get, path, ctr);
}
function get(fn, path, ctr) {
    var url = path_resolveUrl(path, Module.resolveLocation(ctr));
    if (url in Cache) {
        return Cache[url];
    }
    var dfr = Cache[url] = new class_Dfr();
    fn(url, dfr.pipeCallback());
    return dfr;
}
var Cache = Object.create(null);

import { file_get, file_getScript, file_getStyle, file_getJson } from '@core/util/resource/file';
import { listeners_on } from '@core/util/listeners';
import { is_Function } from '@utils/is';
import { class_Dfr } from '@utils/class/Dfr';
import { log_warn } from '@core/util/reporters';
import { _opts } from './Opts';
import { path_appendQuery } from '@core/util/path';
import { mask_config, __cfg } from '@core/api/config';
export var _file_get = createTransport(function () {
    return __cfg.getFile || file_get;
});
export var _file_getScript = createTransport(function () {
    return __cfg.getScript || file_getScript;
});
export var _file_getStyle = createTransport(function () {
    return __cfg.getStyle || file_getStyle;
});
export var _file_getJson = createTransport(function () {
    return __cfg.getJson || __cfg.getData || file_getJson;
});
listeners_on('config', function (config) {
    var modules = config.modules;
    if (modules == null) {
        return;
    }
    var fn = Loaders[modules];
    if (is_Function(fn) === false) {
        log_warn('Module system is not supported: ' + modules);
        return;
    }
    fn();
});
function createTransport(loaderFactoryFn) {
    return function (path_) {
        var fn = loaderFactoryFn(), path = path_, v = _opts.version;
        if (v != null) {
            path = path_appendQuery(path, 'v', v);
        }
        return fn(path);
    };
}
var Loaders = {
    'default': function () {
        __cfg.getScript = __cfg.getFile = __cfg.getStyle = null;
    },
    'include': function () {
        __cfg.getScript = getter('js');
        __cfg.getStyle = getter('css');
        __cfg.getFile = getter('load');
        var lib = include;
        function getter(name) {
            return function (path) {
                return class_Dfr.run(function (resolve, reject) {
                    lib.instance('/')[name](path + '::Module').done(function (resp) {
                        if ('css' === name) {
                            return resolve();
                        }
                        if ('js' === name) {
                            return resolve(resp.Module);
                        }
                        resolve(resp[name].Module);
                    });
                });
            };
        }
    }
};
if (typeof include !== 'undefined' && is_Function(include && include.js)) {
    mask_config('modules', 'include');
}

import { path_getDir, path_normalize, path_resolveCurrent, path_isRelative, path_combine, path_fromPrfx, path_getExtension } from '@core/util/path';
import { is_Object } from '@utils/is';
import { obj_getProperty, obj_extend, obj_setProperty } from '@utils/obj';
import { _opts } from './Opts';
import { warn_withNode } from '@core/util/reporters';
import { _file_get } from './loaders';
export function u_resolveLocation(ctx, ctr, module) {
    if (module != null) {
        return module.location;
    }
    while (ctr != null) {
        if (ctr.location != null) {
            return ctr.location;
        }
        if (ctr.resource != null && ctr.resource.location) {
            return ctr.resource.location;
        }
        ctr = ctr.parent;
    }
    var path = null;
    if (ctx != null) {
        if (ctx.filename != null) {
            path = path_getDir(path_normalize(ctx.filename));
        }
        if (ctx.dirname != null) {
            path = path_normalize(ctx.dirname + '/');
        }
    }
    if (path == null) {
        return path_resolveCurrent();
    }
    if (path_isRelative(path) === false) {
        return path;
    }
    return path_combine(u_resolveBase(), path);
}
;
export function u_setOption(options, key, val) {
    if (key === 'base' || key === 'nsBase') {
        var path = path_normalize(val);
        if (path[path.length - 1] !== '/') {
            path += '/';
        }
        // Do not resolve root, as it will be resolved by base later
        // @NextIteration: remove also path_resolveRoot, use instead resolveCurrent
        // if (path[0] === '/') {
        // 	path = path_combine(path_resolveRoot(), path);
        // }
        options[key] = path;
        return this;
    }
    var current = obj_getProperty(options, key);
    if (is_Object(current) && is_Object(val)) {
        obj_extend(current, val);
        return this;
    }
    obj_setProperty(options, key, val);
}
;
export function u_resolveBase() {
    if (_opts.base == null) {
        _opts.base = path_resolveCurrent();
    }
    else if (path_isRelative(_opts.base) === true) {
        _opts.base = path_combine(path_resolveCurrent(), _opts.base);
    }
    return _opts.base;
}
;
export function u_resolvePath(path, ctx, ctr, module) {
    if (false === hasExt(path)) {
        path += '.mask';
    }
    return toAbsolute(path, ctx, ctr, module);
}
;
export function u_resolvePathFromImport(node, ctx, ctr, module, makeAbs) {
    var path = node.path;
    if (path == null && node.namespace != null) {
        path = fromNs(node);
    }
    if (path[0] === '@') {
        path = path_fromPrfx(path, _opts.prefixes);
        if (path == null) {
            path = node.path;
            warn_withNode('Prefix not defined: ' + path, node);
        }
    }
    if (path[path.length - 1] === '/' && node.exports != null) {
        path += node.exports[0].name;
    }
    if (false === hasExt(path)) {
        var c = path.charCodeAt(0);
        if (c === 47 || c === 46) {
            // / .
            var type = node.contentType;
            if (type == null || type === 'mask') {
                path += '.mask';
            }
        }
        else if (u_isNpmPath(path)) {
            return path;
        }
    }
    return makeAbs === false
        ? path
        : toAbsolute(path, ctx, ctr, module);
}
;
export function u_handler_getDelegate(compoName, compo, next) {
    return function (name) {
        if (name === compoName)
            return compo;
        if (next != null)
            return next(name);
        return null;
    };
}
;
export function u_isNpmPath(path) {
    return _opts.moduleResolution === 'node' && /^([\w\-]+)(\/[\w\-_]+)*$/.test(path);
}
;
function toAbsolute(path_, ctx, ctr, module) {
    var path = path_;
    if (path_isRelative(path)) {
        path = path_combine(u_resolveLocation(ctx, ctr, module), path);
    }
    else if (path.charCodeAt(0) === 47 /*/*/) {
        path = path_combine(u_resolveBase(), path);
    }
    return path_normalize(path);
}
function hasExt(path) {
    return path_getExtension(path) !== '';
}
function fromNs(node) {
    var type = node.contentType || 'script';
    var path = node.namespace.replace(/\./g, '/');
    if (path[0] === '/') {
        path = '.' + path;
    }
    else {
        var base = _opts.nsBase;
        if (base != null) {
            path = path_combine(base, path);
        }
    }
    var exports = node.exports;
    if (exports == null) {
        path += '/' + node.alias;
    }
    else if (exports.length === 1) {
        var exp = exports[0];
        var name = exp.name;
        path += '/' + name;
        if (type === 'script' && _opts.es6Modules !== true) {
            node.alias = exp.alias || name;
            node.exports = null;
        }
    }
    var default_ = _opts.ext[type] || type;
    path += '.' + default_;
    return path;
}
export function u_resolveNpmPath(contentType, path, parentLocation, cb) {
    var name = /^([\w\-]+)/.exec(path)[0];
    var resource = path.substring(name.length + 1);
    if (resource && hasExt(resource) === false) {
        resource += '.' + _ext[contentType];
    }
    var root = '';
    var domainMatch = /(\w{2,5}:\/{2,3}[^/]+)/.exec(parentLocation);
    if (domainMatch) {
        root = domainMatch[0];
        parentLocation = parentLocation.substring(root.length);
    }
    var current = parentLocation, lookups = [], nodeModules;
    function check() {
        nodeModules = path_combine(root, current, '/node_modules/', name, '/');
        lookups.unshift(path_combine(nodeModules, 'package.json'));
        _file_get(lookups[0]).then(function (text) {
            onComplete(null, text);
        }, onComplete);
    }
    function onComplete(error, text) {
        var json;
        if (text) {
            try {
                json = JSON.parse(text);
            }
            catch (error) { }
        }
        if (error != null || json == null) {
            var next = current.replace(/[^\/]+\/?$/, '');
            if (next === current) {
                cb('Module was not resolved: ' + lookups.join(','));
                return;
            }
            current = next;
            check();
            return;
        }
        if (resource) {
            cb(null, nodeModules + resource);
            return;
        }
        var filename;
        if (contentType === 'mask' && json.mainMask) {
            filename = json.mainMask;
        }
        else if (contentType === 'js' && json.main) {
            filename = json.main;
        }
        else {
            filename = 'index.' + _ext[contentType];
        }
        cb(null, path_combine(nodeModules, filename));
    }
    check();
}
;
var _ext = {
    'js': 'js',
    'mask': 'mask',
    'css': 'css'
};

import { path_getExtension } from '@core/util/path';
export var _typeMappings = {
    script: 'script',
    style: 'style',
    data: 'data',
    mask: 'mask',
    html: 'html',
    js: 'script',
    ts: 'script',
    es6: 'script',
    coffee: 'script',
    css: 'style',
    scss: 'style',
    sass: 'style',
    less: 'style',
    json: 'data',
    yml: 'data',
    txt: 'text',
    text: 'text',
    load: 'text'
};
export function type_isMask(endpoint) {
    var type = endpoint.contentType, ext = type || path_getExtension(endpoint.path);
    return ext === '' || ext === 'mask' || ext === 'html';
}
export function type_get(endpoint) {
    var type = endpoint.contentType;
    if (type == null && endpoint.moduleType != null) {
        var x = _typeMappings[endpoint.moduleType];
        if (x != null) {
            return x;
        }
    }
    var ext = type || path_getExtension(endpoint.path);
    if (ext === '' || ext === 'mask') {
        return 'mask';
    }
    return _typeMappings[ext];
}
export function type_getModuleType(endpoint) {
    return endpoint.moduleType || type_get(endpoint);
}

import { obj_extend } from '@utils/obj';
import { type_getModuleType } from './types';
var _cache = {};
export function cache_get(endpoint) {
    return ensure(endpoint)[endpoint.path];
}
;
export function cache_set(endpoint, module) {
    return (ensure(endpoint)[endpoint.path] = module);
}
;
export function cache_clear(path) {
    if (path == null) {
        _cache = {};
        return;
    }
    for (var x in _cache) {
        delete _cache[x][path];
    }
}
;
export function cache_toMap() {
    var out = {};
    for (var x in _cache) {
        obj_extend(out, _cache[x]);
    }
    return out;
}
;
function ensure(endpoint) {
    var type = type_getModuleType(endpoint);
    var hash = _cache[type];
    if (hash == null) {
        hash = _cache[type] = {};
    }
    return hash;
}

import { obj_extendDefaults } from '@utils/obj';
import { class_Dfr } from '@utils/class/Dfr';
import { parser_parse } from '@core/parser/exports';
import { path_getDir, path_getExtension, path_isRelative, path_combine, path_normalize } from '@core/util/path';
import { mask_TreeWalker } from '@core/feature/TreeWalker';
import { _file_get } from '../loaders';
import { type_get } from '../types';
export function tools_getDependencies(template, path, opts_) {
    var opts = obj_extendDefaults(opts_, defaultOptions);
    var dfr = new class_Dfr;
    var ast = typeof template === 'string'
        ? parser_parse(template)
        : template;
    return get(ast, path, opts, dfr);
}
;
var defaultOptions = {
    deep: true,
    flattern: false
};
function get(ast, path, opts, dfr) {
    walk(ast, path, opts, function (error, dep) {
        if (error)
            return dfr.reject(error);
        if (opts.flattern === true && opts.deep === true) {
            dep = flattern(dep);
        }
        dfr.resolve(dep);
    });
    return dfr;
}
function walk(ast, path, opts, done) {
    var location = path_getDir(path);
    var dependency = {
        mask: [],
        data: [],
        style: [],
        script: [],
    };
    mask_TreeWalker.walkAsync(ast, visit, complete);
    function visit(node, next) {
        if (node.tagName !== 'import') {
            return next();
        }
        var path = resolvePath(node, location);
        var type = type_get(node);
        if (opts.deep === false) {
            dependency[type].push(path);
            return next();
        }
        if ('mask' === type) {
            getMask(path, opts, function (error, dep) {
                if (error) {
                    return done(error);
                }
                dependency.mask.push(dep);
                next();
            });
            return;
        }
        dependency[type].push(path);
        next();
    }
    function complete() {
        done(null, dependency);
    }
}
function getMask(path, opts, done) {
    var dep = {
        path: path,
        dependencies: null
    };
    _file_get(path)
        .done(function (template) {
        walk(parser_parse(template), path, opts, function (error, deps) {
            if (error) {
                done(error);
                return;
            }
            dep.dependencies = deps;
            done(null, dep);
        });
    })
        .fail(done);
}
function resolvePath(node, location) {
    var path = node.path, type = node.contentType;
    if ((type == null || type === 'mask') && path_getExtension(path) === '') {
        path += '.mask';
    }
    if (path_isRelative(path)) {
        path = path_combine(location, path);
    }
    return path_normalize(path);
}
var flattern;
(function () {
    flattern = function (deps) {
        return {
            mask: resolve(deps, 'mask'),
            data: resolve(deps, 'data'),
            style: resolve(deps, 'style'),
            script: resolve(deps, 'script'),
        };
    };
    function resolve(deps, type) {
        return distinct(get(deps, type, []));
    }
    function get(deps, type, stack) {
        if (deps == null) {
            return stack;
        }
        var arr = deps[type], imax = arr.length, i = -1, x;
        while (++i < imax) {
            x = arr[i];
            if (typeof x === 'string') {
                stack.unshift(x);
                continue;
            }
            // assume is an object { path, dependencies[] }
            stack.unshift(x.path);
            get(x.dependencies, type, stack);
        }
        if ('mask' !== type) {
            deps.mask.forEach(function (x) {
                get(x.dependencies, type, stack);
            });
        }
        return stack;
    }
    function distinct(stack) {
        for (var i = 0; i < stack.length; i++) {
            for (var j = i + 1; j < stack.length; j++) {
                if (stack[i] === stack[j]) {
                    stack.splice(j, 1);
                    j--;
                }
            }
        }
        return stack;
    }
}());

import { obj_extendDefaults } from '@utils/obj';
import { class_Dfr } from '@utils/class/Dfr';
import { tools_getDependencies } from './dependencies';
import { _file_get } from '../loaders';
import { mask_TreeWalker } from '@core/feature/TreeWalker';
import { mask_stringify } from '@core/parser/exports';
import { jMask } from '@mask-j/jMask';
import { __cfg } from '@core/api/config';
export function tools_build(template, path, opts_) {
    var opts = obj_extendDefaults(opts_, optionsDefault);
    return class_Dfr.run(function (resolve, reject) {
        tools_getDependencies(template, path, { flattern: true })
            .fail(reject)
            .done(function (deps) {
            build(deps, opts, complete, reject);
        });
        function complete(out) {
            out.mask += '\n' + template;
            resolve(out);
        }
    });
}
;
var optionsDefault = {
    minify: false
};
function build(deps, opts, resolve, reject) {
    var types = ['mask', 'script', 'style', 'data'];
    var out = {
        mask: '',
        data: '',
        style: '',
        script: '',
    };
    function next() {
        if (types.length === 0) {
            if (out.data) {
                out.script = out.data + '\n' + out.script;
            }
            return resolve(out);
        }
        var type = types.shift();
        build_type(deps, type, opts, function (error, str) {
            if (error)
                return reject(error);
            out[type] = str;
            next();
        });
    }
    next();
}
function build_type(deps, type, opts, done) {
    var arr = deps[type], imax = arr.length, i = -1, stack = [];
    function next() {
        if (++i === imax) {
            done(null, stack.join('\n'));
            return;
        }
        Single[type](arr[i], opts)
            .fail(done)
            .done(function (str) {
            stack.push('/* source ' + arr[i] + ' */');
            stack.push(str);
            next();
        });
    }
    next();
}
var Single = {
    mask: function (path, opts, done) {
        return class_Dfr.run(function (resolve, reject) {
            _file_get(path)
                .fail(reject)
                .done(function (str) {
                // remove all remote styles
                var ast = mask_TreeWalker.walk(str, function (node) {
                    if (node.tagName === 'link' && node.attr.href) {
                        return { remove: true };
                    }
                });
                ast = jMask('module')
                    .attr('path', path)
                    .append(ast);
                var str = mask_stringify(ast[0], {
                    indent: opts.minify ? 0 : 4
                });
                resolve(str);
            });
        });
    },
    script: function (path, opts) {
        return (__cfg.buildScript || build_script)(path, opts);
    },
    style: function (path, opts) {
        return (__cfg.buildStyle || build_style)(path, opts);
    },
    data: function (path, opts) {
        return (__cfg.buildData || build_data)(path, opts);
    }
};
function build_script(path, opts, done) {
    return class_Dfr.run(function (resolve, reject) {
        _file_get(path)
            .fail(reject)
            .done(function (str) {
            var script = 'var module = { exports: null }\n';
            script += str + ';\n';
            script += 'mask.Module.registerModule(module.exports, new mask.Module.Endpoint("' + path + '", "script"))';
            resolve(script);
        });
    });
}
function build_style(path, opts) {
    return _file_get(path);
}
function build_data(path, opts, done) {
    return class_Dfr.run(function (resolve, reject) {
        _file_get(path)
            .fail(reject)
            .done(function (mix) {
            var json;
            try {
                json = typeof mix === 'string'
                    ? JSON.parse(mix)
                    : mix;
            }
            catch (error) {
                reject(error);
                return;
            }
            var str = JSON.stringify(json, null, opts.minify ? 4 : void 0);
            var script = 'module = { exports: ' + str + ' }\n'
                + 'mask.Module.registerModule(module.exports, new mask.Module.Endpoint("' + path + '", "json"))';
            resolve(script);
        });
    });
}

import { fn_doNothing } from '@utils/fn';
import { obj_getProperty } from '@utils/obj';
import { class_create } from '@utils/class';
import { class_Dfr } from '@utils/class/Dfr';
import { path_getDir } from '@core/util/path';
import { u_isNpmPath, u_resolveNpmPath } from '../utils';
export var IModule = class_create(class_Dfr, {
    type: null,
    path: null,
    location: null,
    exports: null,
    state: 0,
    constructor: function (path, parent) {
        this.path = path;
        this.parent = parent;
        this.exports = {};
        this.location = path_getDir(path);
        this.complete_ = this.complete_.bind(this);
    },
    loadModule: function () {
        if (this.state !== 0) {
            return this;
        }
        this.state = 1;
        var self = this;
        if (u_isNpmPath(this.path)) {
            u_resolveNpmPath(this.type, this.path, this.parent.location, function (err, path) {
                if (err != null) {
                    self.onLoadError_(err);
                    return;
                }
                self.location = path_getDir(path);
                self.path = path;
                self.doLoad();
            });
            return this;
        }
        self.doLoad();
        return this;
    },
    doLoad: function () {
        var _this = this;
        this
            .load_(this.path)
            .then(function (mix) { return _this.onLoadSuccess_(mix); }, function (err) { return _this.onLoadError_(err); });
    },
    complete_: function (error, exports) {
        this.exports = exports;
        this.error = error;
        this.state = 4;
        if (error) {
            this.reject(error);
            return;
        }
        this.resolve(this);
    },
    onLoadSuccess_: function (mix) {
        if (this.preprocess_ == null) {
            this.complete_(null, mix);
            return;
        }
        this.preprocess_(mix, this.complete_);
    },
    onLoadError_: function (error) {
        if (this.preprocessError_ == null) {
            this.complete_(error);
            return;
        }
        this.preprocessError_(error, this.complete_);
    },
    load_: null,
    preprocess_: null,
    preprocessError_: null,
    register: fn_doNothing,
    getExport: function (property) {
        var obj = this.exports;
        return property !== '*'
            ? obj_getProperty(obj, property)
            : obj;
    }
});

export var m_Types = {};

var Endpoint = /** @class */ (function () {
    function Endpoint(path, contentType, moduleType) {
        this.path = path;
        this.contentType = contentType;
        this.moduleType = moduleType;
    }
    return Endpoint;
}());
export { Endpoint };

import { u_resolvePathFromImport, u_resolvePath } from '../utils';
import { Endpoint } from '../class/Endpoint';
import { cache_get, cache_set } from '../cache';
import { class_create } from '@utils/class';
import { m_Types } from './ModuleTypes';
import { type_getModuleType, type_isMask, _typeMappings } from '../types';
function create(endpoint, parent) {
    return new (Factory(endpoint))(endpoint.path, parent);
}
;
function Factory(endpoint) {
    var type = type_getModuleType(endpoint);
    var Ctor = m_Types[type];
    if (Ctor == null) {
        throw Error('Import is not supported for type ' + type + ' and the path ' + endpoint.path);
    }
    return Ctor;
}
export function m_createModule(node, ctx, ctr, parent) {
    var path = u_resolvePathFromImport(node, ctx, ctr, parent), endpoint = new Endpoint(path, node.contentType, node.moduleType), module = cache_get(endpoint);
    if (module == null) {
        module = cache_set(endpoint, create(endpoint, parent));
    }
    return module;
}
export function m_registerModule(mix, endpoint, ctx, ctr, parent) {
    endpoint.path = u_resolvePath(endpoint.path, ctx, ctr, parent);
    var module = m_createModule(endpoint, ctx, ctr, parent);
    if (type_isMask(endpoint)) {
        module.onLoadSuccess_(mix);
        return module;
    }
    // assume others and is loaded
    module.state = 4;
    module.exports = mix;
    module.resolve(module);
    return module;
}
export function m_registerModuleType(baseModuleType, newType, mix) {
    _typeMappings[newType] = baseModuleType;
    m_Types[newType] = class_create(m_Types[baseModuleType], mix);
}

export var i_Types = {};

import { class_create } from '@utils/class';
import { class_Dfr } from '@utils/class/Dfr';
import { obj_setProperty } from '@utils/obj';
import { customTag_registerResolver } from '@core/custom/exports';
import { warn_withNode, error_withCompo } from '@core/util/reporters';
import { m_createModule } from '../Module/utils';
import { _opts } from '../Opts';
export var IImport = class_create({
    type: null,
    constructor: function (endpoint, node, module) {
        this.node = node;
        this.path = endpoint.path;
        this.alias = node.alias;
        this.exports = node.exports;
        this.async = node.async;
        this.contentType = node.contentType;
        this.moduleType = node.moduleType;
        this.module = m_createModule(endpoint, null, null, module);
        this.parent = module;
        this.imports = null;
    },
    eachExport: function (fn) {
        var alias = this.alias;
        if (alias != null) {
            fn.call(this, alias, '*', alias);
            return;
        }
        var exports = this.exports;
        if (exports != null) {
            var imax = exports.length, i = -1;
            while (++i < imax) {
                var x = exports[i];
                fn.call(this, x.alias == null ? x.name : x.alias, x.name, x.alias);
            }
        }
    },
    hasExport: function (name) {
        if (this.alias === name) {
            return true;
        }
        var exports = this.exports;
        if (exports != null) {
            var imax = exports.length, i = -1;
            while (++i < imax) {
                var x = exports[i];
                var expName = x.alias == null ? x.name : x.alias;
                if (expName === name) {
                    return true;
                }
            }
        }
        return false;
    },
    getExport: function (name) {
        return this.imports[name];
    },
    getExportedName: function (alias) {
        if (this.alias === alias) {
            return '*';
        }
        var exports = this.exports;
        if (exports != null) {
            var imax = exports.length, i = -1, x;
            while (++i < imax) {
                x = exports[i];
                if ((x.alias || x.name) === alias) {
                    return x.name;
                }
            }
        }
        return null;
    },
    loadImport: function (cb) {
        var self = this;
        this
            .module
            .loadModule()
            .fail(cb)
            .done(function (module) {
            cb(null, self);
        });
    },
    registerScope: function (ctr) {
        this.imports = {};
        this.eachExport(function (exportName, name, alias) {
            this.registerExport_(ctr, exportName, name, alias);
        });
    },
    registerExport_: function (ctr, exportName, name, alias) {
        var module = this.module;
        var prop = alias || name;
        var obj = null;
        if (this.async === 'async' && module.isBusy()) {
            var dfr = new class_Dfr;
            var that = this;
            module.then(function () {
                var val = module.getExport(name);
                if (val == null) {
                    that.logError_('Exported property is undefined: ' + name);
                }
                dfr.resolve(val);
            }, function (error) {
                dfr.reject(error);
            });
            obj = dfr;
        }
        else {
            obj = module.getExport(name);
        }
        if (obj == null) {
            this.logError_('Exported property is undefined: ' + name);
            return;
        }
        if (name === '*' && _opts.es6Modules && obj.default != null) {
            var defaultOnly = true;
            for (var key in obj) {
                if (key === 'default' || key[0] === '_')
                    continue;
                defaultOnly = false;
                break;
            }
            if (defaultOnly) {
                warn_withNode('Default ONLY export is deprecated: `import * as foo from X`. Use `import foo from X`', this.node);
                obj = obj.default;
            }
        }
        if (ctr.scope == null) {
            ctr.scope = {};
        }
        if (exportName === '*') {
            throw new Error('Obsolete: unexpected exportName');
        }
        this.imports[exportName] = obj;
        obj_setProperty(ctr.scope, prop, obj);
        customTag_registerResolver(prop);
    },
    logError_: function (msg) {
        var str = '\n(Module) ' + (this.parent || { path: 'root' }).path;
        str += '\n  (Import) ' + this.path;
        str += '\n    ' + msg;
        error_withCompo(str, this);
    }
});

import { IImport } from './Import';
import { i_Types } from './ImportTypes';
import { class_create } from '@utils/class';
export var ImportScript = i_Types['script'] = class_create(IImport, {
    type: 'script',
    contentType: 'script'
});

import { i_Types } from './ImportTypes';
import { class_create } from '@utils/class';
import { ImportScript } from './ImportScript';
export var ImportData = i_Types['data'] = class_create(ImportScript, {
    type: 'data',
    contentType: 'json'
});

import { IImport } from './Import';
import { i_Types } from './ImportTypes';
import { class_create } from '@utils/class';
export var ImportMask = i_Types['mask'] = class_create(IImport, {
    type: 'mask',
    contentType: 'mask',
    getHandler: function (name) {
        var module = this.module;
        if (module == null) {
            return;
        }
        if (module.error != null) {
            if (this.hasExport(name)) {
                this.logError_('Resource for the import `' + name + '` not loaded');
                return this.empty;
            }
            return null;
        }
        var x = this.getExportedName(name);
        if (x == null) {
            return null;
        }
        return module.exports[x] || module.queryHandler(x);
    },
    empty: function EmptyCompo() { }
});

import { i_Types } from './ImportTypes';
import { class_create } from '@utils/class';
import { ImportMask } from './ImportMask';
export var ImportHtml = i_Types['html'] = class_create(ImportMask, {
    type: 'mask',
    contentType: 'html'
});

import { IImport } from './Import';
import { i_Types } from './ImportTypes';
import { class_create } from '@utils/class';
import { fn_doNothing } from '@utils/fn';
export var ImportStyle = i_Types['style'] = class_create(IImport, {
    type: 'style',
    contentType: 'css',
    registerScope: fn_doNothing
});

import { i_Types } from './ImportTypes';
import { class_create } from '@utils/class';
import { ImportScript } from './ImportScript';
export var ImportText = i_Types['text'] = class_create(ImportScript, {
    type: 'text',
    contentType: 'txt'
});

import { u_resolvePathFromImport } from '../utils';
import { Endpoint } from '../class/Endpoint';
import { i_Types } from './ImportTypes';
import { type_get } from '../types';
export function i_createImport(node, ctx, ctr, module) {
    var path = u_resolvePathFromImport(node, ctx, ctr, module), endpoint = new Endpoint(path, node.contentType, node.moduleType);
    return create(endpoint, node, module);
}
;
function create(endpoint, node, parent) {
    return new (Factory(endpoint))(endpoint, node, parent);
}
;
function Factory(endpoint) {
    var type = type_get(endpoint);
    var Ctor = i_Types[type];
    if (Ctor == null) {
        throw Error('Module is not supported for type ' + type + ' and the path ' + endpoint.path);
    }
    return Ctor;
}

import './ImportData';
import './ImportMask';
import './ImportHtml';
import './ImportScript';
import './ImportStyle';
import './ImportText';
export { i_createImport } from './utils';

import { Dom } from '@core/dom/exports';
// Also flattern all `imports` tags
export function mask_nodesToArray(mix) {
    var type = mix.type;
    if (type === Dom.NODE && mix.tagName === 'imports') {
        return mix.nodes;
    }
    if (type !== Dom.FRAGMENT && type != null) {
        return [mix];
    }
    var arr = mix;
    if (type === Dom.FRAGMENT) {
        arr = mix.nodes;
        if (arr == null) {
            return [];
        }
    }
    var imax = arr.length, i = -1, x;
    while (++i < imax) {
        x = arr[i];
        if (x.tagName === 'imports') {
            arr.splice.apply(arr, [i, 1].concat(x.nodes));
            i--;
        }
    }
    return arr;
}

import { class_create } from '@utils/class';
import { obj_extend } from '@utils/obj';
import { reporter_createErrorNode, error_withNode } from '@core/util/reporters';
import { customTag_Compo_getHandler, customTag_register, customTag_registerResolver, customTag_Base } from '@core/custom/exports';
import { parser_parse } from '@core/parser/exports';
import { Define } from '@core/feature/Define';
import { IModule } from './Module';
import { m_Types } from './ModuleTypes';
import { _file_get } from '../loaders';
import { u_resolvePath } from '../utils';
import { m_registerModule } from './utils';
import { i_createImport } from '../Import/exports';
import { Endpoint } from '../class/Endpoint';
import { mask_nodesToArray } from '../utils/mask-module';
export var ModuleMask = (m_Types['mask'] = class_create(IModule, {
    type: 'mask',
    scope: null,
    source: null,
    modules: null,
    exports: null,
    importItems: null,
    load_: _file_get,
    loadModule: function () {
        if (this.state === 0) {
            return IModule.prototype.loadModule.call(this);
        }
        if (this.state === 2) {
            this.state = 3;
            var self = this;
            self.preprocess_(this.source, function () {
                self.state = 4;
                self.resolve(self);
            });
        }
        return this;
    },
    preprocessError_: function (error, next) {
        var msg = 'Load error: ' + this.path;
        if (error && error.status) {
            msg += '; Status: ' + error.status;
        }
        this.source = reporter_createErrorNode(msg);
        next.call(this, error);
    },
    preprocess_: function (mix, next) {
        var ast = typeof mix === 'string' ? parser_parse(mix, this.path) : mix;
        this.source = ast;
        this.importItems = [];
        this.exports = {
            __nodes__: [],
            __handlers__: {}
        };
        var arr = mask_nodesToArray(ast), importNodes = [], imax = arr.length, i = -1, x;
        while (++i < imax) {
            x = arr[i];
            switch (x.tagName) {
                case 'import':
                    importNodes.push(x);
                    this.importItems.push(i_createImport(x, null, null, this));
                    break;
                case 'module':
                    var path = u_resolvePath(x.attr.path, null, null, this), type = x.attr.contentType, endpoint = new Endpoint(path, type);
                    m_registerModule(x.nodes, endpoint);
                    break;
                case 'define':
                case 'let':
                    continue;
                default:
                    this.exports.__nodes__.push(x);
                    break;
            }
        }
        _loadImports(this, importNodes, function () {
            next.call(this, null, _createExports(arr, null, this));
        });
    },
    getHandler: function (name) {
        return _module_getHandler.call(this, this, name);
    },
    queryHandler: function (selector) {
        if (this.error) {
            return _createHandlerForNodes(this.source, this);
        }
        var nodes = this.exports.__nodes__;
        if (selector !== '*') {
            nodes = _nodesFilter(nodes, selector);
        }
        return nodes != null && nodes.length !== 0
            ? _createHandlerForNodes(nodes, this)
            : null;
    },
    getExport: function (misc) {
        return this.getHandler(misc) || this.queryHandler(misc);
    }
}));
function _nodesFilter(nodes, tagName) {
    var arr = [], imax = nodes.length, i = -1, x;
    while (++i < imax) {
        x = nodes[i];
        if (x.tagName === tagName) {
            arr.push(x);
        }
    }
    return arr;
}
function _createExports(nodes, model, module) {
    var exports = module.exports, items = module.importItems, getHandler = _module_getHandlerDelegate(module);
    var i = -1, imax = items.length;
    while (++i < imax) {
        var x = items[i];
        if (x.registerScope) {
            x.registerScope(module);
        }
    }
    var i = -1, imax = nodes.length;
    while (++i < imax) {
        var node = nodes[i];
        var name = node.tagName;
        if (name === 'define' || name === 'let') {
            var Base = {
                getHandler: _fn_wrap(customTag_Compo_getHandler, getHandler),
                getModule: _module_getModuleDelegate(module),
                location: module.location
            };
            var Ctor = Define.create(node, model, module, Base);
            var Proto = Ctor.prototype;
            if (Proto.scope != null || module.scope != null) {
                Proto.scope = obj_extend(Proto.scope, module.scope);
            }
            var compoName = node.name;
            if (name === 'define') {
                exports[compoName] = Ctor;
                customTag_register(compoName, Ctor);
            }
            if (name === 'let') {
                customTag_registerResolver(compoName);
            }
            exports.__handlers__[compoName] = Ctor;
        }
    }
    exports['*'] = class_create(customTag_Base, {
        getHandler: getHandler,
        location: module.location,
        nodes: exports.__nodes__,
        scope: module.scope
    });
    return exports;
}
function _createHandlerForNodes(nodes, module) {
    return class_create({
        scope: module.scope,
        location: module.location,
        nodes: nodes,
        getHandler: _module_getHandlerDelegate(module)
    });
}
function _loadImports(module, importNodes, done) {
    var items = module.importItems, count = items.length, imax = count, i = -1;
    if (count === 0) {
        return done.call(module);
    }
    process();
    //= private
    function awaiter() {
        if (--count > 0) {
            return;
        }
        done.call(module);
    }
    function process() {
        if (i > -1) {
            // resume from sync
            awaiter();
        }
        while (++i < imax) {
            var node = importNodes[i];
            var resumer = awaiter;
            if ('async' === node.async) {
                resumer = null;
            }
            if ('sync' === node.async) {
                resumer = process;
            }
            _loadImport(module, items[i], node, resumer);
            if ('async' === node.async) {
                awaiter();
            }
            if ('sync' === node.async) {
                return;
            }
        }
    }
}
function _loadImport(module, import_, node, done) {
    import_.loadImport(function (error) {
        if (error) {
            error_withNode(error, node);
        }
        done && done();
    });
}
function _module_getModuleDelegate(module) {
    return function (name) {
        return module;
    };
}
function _module_getHandlerDelegate(module) {
    return function (name) {
        return _module_getHandler.call(this, module, name);
    };
}
function _module_getHandler(module, name) {
    if (module.error != null) {
        return;
    }
    // check public exports
    var exports = module.exports;
    var Ctor = exports[name];
    if (Ctor != null) {
        return Ctor;
    }
    // check private components store
    var handlers = exports.__handlers__;
    if (handlers != null && (Ctor = handlers[name]) != null) {
        return Ctor;
    }
    var arr = module.importItems, i = arr.length, x, type;
    while (--i > -1) {
        x = arr[i];
        type = x.type;
        if (type === 'mask') {
            if ((Ctor = x.getHandler(name)) != null) {
                return Ctor;
            }
        }
        else {
            if ((Ctor = x.imports && x.imports[name]) != null) {
                return Ctor;
            }
        }
    }
    return null;
}
function _fn_wrap(baseFn, fn) {
    if (baseFn == null) {
        return fn;
    }
    return function () {
        var x = baseFn.apply(this, arguments);
        if (x != null) {
            return x;
        }
        return fn.apply(this, arguments);
    };
}

import { IModule } from './Module';
import { m_Types } from './ModuleTypes';
import { class_create } from '@utils/class';
import { _file_getScript } from '../loaders';
import { log_error } from '@core/util/reporters';
import { _opts } from '../Opts';
export var ModuleScript = m_Types['script'] = class_create(IModule, {
    type: 'script',
    load_: _file_getScript,
    preprocessError_: function (error, next) {
        log_error('Resource ' + this.path + ' thrown an Exception: ' + error);
        next(error);
    },
    getExport: function (property) {
        var fn = IModule.prototype.getExport;
        var obj = fn.call(this, property);
        if (obj == null && _opts.es6Modules) {
            return fn.call(this, 'default');
        }
        return obj;
    }
});

import { m_Types } from './ModuleTypes';
import { class_create } from '@utils/class';
import { ModuleScript } from './ModuleScript';
import { _file_getJson } from '../loaders';
export var ModuleData = m_Types['data'] = class_create(ModuleScript, {
    type: 'data',
    load_: _file_getJson
});

import { class_create } from '@utils/class';
import { parser_parseHtml } from '@core/parser/exports';
import { m_Types } from './ModuleTypes';
import { ModuleMask } from './ModuleMask';
export var ModuleHtml = m_Types['html'] = class_create(ModuleMask, {
    type: 'mask',
    preprocess_: function (mix, next) {
        var ast = typeof mix === 'string'
            ? parser_parseHtml(mix)
            : mix;
        return ModuleMask
            .prototype
            .preprocess_
            .call(this, ast, next);
    }
});

import { IModule } from './Module';
import { m_Types } from './ModuleTypes';
import { class_create } from '@utils/class';
import { _file_getStyle } from '../loaders';
export var ModuleStyle = m_Types['style'] = class_create(IModule, {
    type: 'style',
    load_: _file_getStyle
});

import { m_Types } from './ModuleTypes';
import { ModuleScript } from './ModuleScript';
import { class_create } from '@utils/class';
import { _file_get } from '../loaders';
export var ModuleText = m_Types['text'] = class_create(ModuleScript, {
    type: 'text',
    load_: _file_get,
    getExport: function (property) {
        return this.exports;
    }
});

import { ModuleMidd } from '@core/arch/Module';
import { class_Dfr } from '@utils/class/Dfr';
import { ModuleMask } from './ModuleMask';
ModuleMidd.parseMaskContent = function (mix, path) {
    return class_Dfr.run(function (resolve, reject) {
        new ModuleMask(path || '').preprocess_(mix, function (error, exports) {
            if (error) {
                reject(error);
                return;
            }
            resolve(exports);
        });
    });
};

import './ModuleData';
import './ModuleMask';
import './ModuleHtml';
import './ModuleScript';
import './ModuleStyle';
import './ModuleText';
import './register';
export { m_createModule, m_registerModule, m_registerModuleType } from './utils';

import { _opts } from './Opts';
import { obj_getProperty } from '@utils/obj';
import { is_String, is_Object } from '@utils/is';
import { u_setOption } from './utils';
export function m_cfg(mix, val) {
    if (arguments.length === 1) {
        if (is_String(mix)) {
            return obj_getProperty(_opts, mix);
        }
        if (is_Object(mix)) {
            for (var key in mix) {
                u_setOption(_opts, key, mix[key]);
            }
        }
        return this;
    }
    u_setOption(_opts, mix, val);
    return this;
}
;

import { custom_Tags } from '@core/custom/exports';
import { expression_eval, expression_evalStatements } from '@project/expression/src/exports';
import { class_create } from '@utils/class';
import { fn_doNothing } from '@utils/fn';
import { path_resolveUrl } from '@core/util/path';
import { u_resolveLocation } from './utils';
import { error_withCompo } from '@core/util/reporters';
import { parser_ensureTemplateFunction, mask_stringify } from '@core/parser/exports';
import { is_Function } from '@utils/is';
import { obj_extend } from '@utils/obj';
import { Component } from '@compo/exports';
import { i_createImport } from './Import/exports';
import { m_createModule, m_registerModule } from './Module/exports';
import { Endpoint } from './class/Endpoint';
import { m_cfg } from './config';
import { type_isMask } from './types';
(function () {
    var IMPORT = 'import', IMPORTS = 'imports';
    custom_Tags['module'] = class_create({
        constructor: function (node, model, ctx, container, ctr) {
            var path = path_resolveUrl(node.attr.path, u_resolveLocation(ctx, ctr)), type = node.attr.type, endpoint = new Endpoint(path, type);
            m_registerModule(node.nodes, endpoint, ctx, ctr);
        },
        render: fn_doNothing
    });
    custom_Tags['import:base'] = function (node, model, ctx, el, ctr) {
        var x = expression_eval(node.expression, model, ctx, ctr);
        m_cfg('base', x);
    };
    custom_Tags['import:cfg'] = function (node, model, ctx, el, ctr) {
        var args = expression_evalStatements(node.expression, model, ctx, ctr);
        m_cfg.apply(null, args);
    };
    custom_Tags[IMPORT] = class_create({
        meta: {
            serializeNodes: true
        },
        constructor: function (node, model, ctx, el, ctr) {
            if (node.alias == null && node.exports == null && type_isMask(node)) {
                // embedding
                this.module = m_createModule(node, ctx, ctr);
            }
        },
        renderStart: function (model, ctx) {
            if (this.module == null) {
                return;
            }
            var resume = Component.pause(this, ctx);
            var self = this;
            this
                .module
                .loadModule()
                .done(function () {
                self.nodes = self.module.exports['__nodes__'];
                self.scope = self.module.scope;
                self.location = self.module.location;
                self.getHandler = self.module.getHandler.bind(self.module);
            })
                .fail(function (error) {
                error_withCompo(error, this);
                self.nodes = self.module.source;
            })
                .always(resume);
        }
    });
    custom_Tags[IMPORTS] = class_create({
        importItems: null,
        load_: function (ctx, cb) {
            var arr = this.importItems, self = this, imax = arr.length, await_ = imax, next = cb, i = -1;
            function done(error, import_) {
                if (error == null) {
                    if (import_.registerScope) {
                        import_.registerScope(self);
                    }
                    if (ctx._modules != null) {
                        ctx._modules.add(import_.module);
                    }
                }
                if (--await_ === 0 && next != null) {
                    next();
                }
            }
            function process(error, import_) {
                if (arguments.length !== 0) {
                    done(error, import_);
                }
                while (++i < imax) {
                    var x = arr[i];
                    if (x.async === 'async' && (--await_) === 0) {
                        next();
                        next = null;
                    }
                    var onReady = x.async === 'sync'
                        ? process
                        : done;
                    x.loadImport(onReady);
                    if (x.async === 'sync')
                        break;
                }
            }
            process();
        },
        start_: function (model, ctx) {
            var resume = Component.pause(this, ctx), nodes = this.nodes, imax = nodes.length, i = -1, x;
            var arr = this.importItems = [];
            while (++i < imax) {
                x = nodes[i];
                if (x.tagName === IMPORT) {
                    if (x.path != null && x.path.indexOf('~') !== -1) {
                        var fn = parser_ensureTemplateFunction(x.path);
                        if (is_Function(fn)) {
                            x.path = fn('attr', model, ctx, null, this);
                        }
                    }
                    arr.push(i_createImport(x, ctx, this));
                }
            }
            this.load_(ctx, resume);
        },
        //#if (NODE)
        meta: {
            serializeNodes: true
        },
        serializeNodes: function () {
            var arr = [], i, x;
            if (this.importItems == null || this.importItems.length === 0) {
                i = this.nodes.length;
                while (--i > -1) {
                    x = this.nodes[i];
                    if (x.tagName === IMPORT) {
                        arr.unshift(x);
                    }
                }
            }
            else {
                i = this.importItems.length;
                while (--i > -1) {
                    x = this.importItems[i];
                    if (x.module && x.module.stringifyImport) {
                        var result = x.module.stringifyImport(x.node);
                        if (result != null) {
                            arr.unshift(result);
                        }
                        continue;
                    }
                    arr.unshift(x.node);
                }
            }
            return mask_stringify(arr);
        },
        //#endif
        renderStart: function (model, ctx) {
            this.start_(model, ctx);
        },
        renderStartClient: function (model, ctx) {
            this.start_(model, ctx);
        },
        getHandler: function (name) {
            var arr = this.importItems, imax = arr.length, i = -1, import_, x;
            while (++i < imax) {
                import_ = arr[i];
                switch (import_.type) {
                    case 'mask':
                        x = import_.getHandler(name);
                        break;
                    case 'script':
                        x = import_.getExport(name);
                        break;
                }
                if (x != null) {
                    return x;
                }
            }
            return null;
        },
        getHandlers: function () {
            var handlers = {};
            var arr = this.importItems, imax = arr.length, i = -1, import_, x;
            while (++i < imax) {
                import_ = arr[i];
                if (import_ !== 'mask') {
                    continue;
                }
                x = import_.getHandlers();
                obj_extend(handlers, x);
            }
            return handlers;
        },
    });
}());

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { custom_Tags } from '@core/custom/exports';
import { is_Function } from '@utils/is';
import { class_Dfr } from '@utils/class/Dfr';
import { coll_each } from '@utils/coll';
import { log_error, reporter_createErrorNode } from '@core/util/reporters';
import { builder_resumeDelegate } from '@core/builder/exports';
import { Dom } from '@core/dom/exports';
import { builder_build } from '@core/builder/exports';
import { expression_evalStatements } from '@project/expression/src/exports';
import { builder_Ctx } from '@core/builder/exports';
import { jMask } from '@mask-j/jMask';
import { Component } from '@compo/exports';
import { renderer_renderAsync } from '@core/renderer/exports';
var AwaitCtr = /** @class */ (function () {
    function AwaitCtr() {
        this.nodes = null;
        this.attr = null;
        this.expression = null;
        this.scope = null;
        this.parent = null;
        this.model = null;
        this.components = null;
        this.progressNodes = null;
        this.progressNodesExpr = null;
        this.completeNodes = null;
        this.completeNodesExpr = null;
        this.errorNodes = null;
        this.errorNodesExpr = null;
        this.keys = null;
        this.strategy = null;
        this.importItems = null;
    }
    AwaitCtr.prototype.domInsert = function () {
        this.strategy.emit('domInsert');
    };
    AwaitCtr.prototype.splitNodes_ = function () {
        var map = {
            '@progress': 'progressNodes',
            '@fail': 'errorNodes',
            '@done': 'completeNodes',
        };
        coll_each(this.nodes, function (node) {
            var name = node.tagName, nodes = node.nodes;
            var prop = map[name];
            if (prop == null) {
                prop = 'completeNodes';
                nodes = [node];
            }
            if (node.expression) {
                this[prop + 'Expr'] = node.expression;
            }
            var current = this[prop];
            if (current == null) {
                this[prop] = nodes;
                return;
            }
            this[prop] = Array
                .prototype
                .concat
                .call(current, nodes);
        }, this);
        this.nodes = null;
    };
    AwaitCtr.prototype.prepairKeys_ = function () {
        for (var key in this.attr) {
            var val = this.attr[key];
            if (key !== val) {
                continue;
            }
            if (this.keys == null) {
                this.keys = [];
            }
            this.keys.push(key);
        }
    };
    AwaitCtr.prototype.prepairImports_ = function () {
        var imports = Component.closest(this, 'imports');
        if (imports != null) {
            return this.importItems = imports.importItems;
        }
    };
    AwaitCtr.prototype.initStrategy_ = function () {
        var expr = this.expression;
        if (expr && this.keys == null) {
            if (expr.indexOf('(') !== -1 || expr.indexOf('.') !== -1) {
                this.strategy = new ExpressionStrategy(this);
                return;
            }
            this.strategy = new RefOrImportStrategy(this);
            return;
        }
        if (this.keys != null) {
            if (this.keys.length === 1) {
                this.strategy = new ComponentStrategy(this, this.keys[0], this.expression);
                return;
            }
            if (this.keys.length > 1 && expr == null) {
                this.strategy = new RefOrImportStrategy(this);
                return;
            }
        }
        var msg = 'Unsupported await strategy. `(';
        msg += this.expression || '';
        msg += ') ';
        msg += this.keys && this.keys.join(' ') || '';
        throw new Error(msg);
    };
    AwaitCtr.prototype.getModuleFor = function (name) {
        var parent = this.parent;
        var module;
        while (parent != null && module == null) {
            module = parent.getModule && parent.getModule() || (parent.importItems && parent) || null;
            parent = parent.parent;
        }
        if (module == null || module.importItems == null) {
            log_error('Module not found for import ' + name);
            return null;
        }
        var import_ = module.importItems.find(function (x) {
            return x.hasExport(name);
        });
        return import_ && import_.module || null;
    };
    AwaitCtr.prototype.await_ = function (model, ctx, container) {
        this.progress_(ctx, container);
        this.strategy.process(model, ctx, container);
        var resume = builder_resumeDelegate(this, model, ctx, container);
        var self = this;
        this
            .strategy
            .done(function () {
            self.complete_();
        })
            .fail(function (error) {
            self.error_(error);
        })
            .always(resume);
    };
    AwaitCtr.prototype.renderStart = function (model, ctx, container) {
        this.splitNodes_();
        this.prepairKeys_();
        this.prepairImports_();
        this.initStrategy_();
        this.await_(model, ctx, container);
    };
    AwaitCtr.prototype.error_ = function (error) {
        this.nodes = this.errorNodes || reporter_createErrorNode(error.message);
        this.model = error;
        if (this.errorNodesExpr) {
            this.initScope(this.errorNodesExpr, [error]);
        }
    };
    AwaitCtr.prototype.progress_ = function (ctx, container) {
        var nodes = this.progressNodes;
        if (nodes == null) {
            return;
        }
        var hasLiteral = nodes.some(function (x) {
            return x.type === Dom.TEXTNODE;
        });
        if (hasLiteral) {
            nodes = jMask('div').append(nodes);
        }
        var node = {
            type: Dom.COMPONENT,
            nodes: nodes,
            controller: new Component,
            attr: {},
        };
        builder_build(node, null, ctx, container, this);
    };
    AwaitCtr.prototype.complete_ = function () {
        var progress = this.progressNodes && this.components && this.components[0];
        if (progress) {
            progress.remove();
        }
        if (this.completeNodesExpr != null) {
            this.initScope(this.completeNodesExpr, this.strategy.getExports());
        }
        this.nodes = this.strategy.getNodes();
    };
    AwaitCtr.prototype.initScope = function (expr, exports) {
        this.scope = {};
        var names = _getNames(expr), i = names.length;
        while (--i > -1) {
            this.scope[names[i]] = exports[i];
        }
    };
    __decorate([
        Component.deco.slot()
    ], AwaitCtr.prototype, "domInsert", null);
    return AwaitCtr;
}());
;
custom_Tags['await'] = AwaitCtr;
var AStrategy = /** @class */ (function (_super) {
    __extends(AStrategy, _super);
    function AStrategy(awaiter) {
        var _this = _super.call(this) || this;
        _this.awaiter = awaiter;
        _this.error = null;
        return _this;
    }
    AStrategy.prototype.getNodes_ = function () {
        return this.awaiter.completeNodes;
    };
    AStrategy.prototype.getNodes = function () {
        return this.getNodes_();
    };
    AStrategy.prototype.process = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        throw Error('Not implemented');
    };
    AStrategy.prototype.emit = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    return AStrategy;
}(class_Dfr));
;
var ExpressionStrategy = /** @class */ (function (_super) {
    __extends(ExpressionStrategy, _super);
    function ExpressionStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpressionStrategy.prototype.process = function () {
        this.awaitable = new AwaitableExpr(this.awaiter.parent, this.awaiter.expression);
        this.awaitable.pipe(this);
    };
    ExpressionStrategy.prototype.getExports = function () {
        return this.awaitable.exports;
    };
    return ExpressionStrategy;
}(AStrategy));
;
var RefOrImportStrategy = /** @class */ (function (_super) {
    __extends(RefOrImportStrategy, _super);
    function RefOrImportStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RefOrImportStrategy.prototype.process = function () {
        var self = this;
        var refs = this.awaiter.expression
            ? _getNames(this.awaiter.expression)
            : this.awaiter.keys;
        var arr = refs.map(function (ref) {
            var module = self.awaiter.getModuleFor(ref);
            if (module != null) {
                return new AwaitableModule(module);
            }
            return new AwaitableExpr(self.awaiter.parent, ref);
        });
        var i = arr.length;
        arr.forEach(function (awaiter) {
            awaiter
                .done(function () {
                if (self.error == null && --i === 0)
                    self.resolve();
            })
                .fail(function (error) {
                self.error = error;
                self.reject(error);
            });
        });
        this.awaitables = arr;
    };
    RefOrImportStrategy.prototype.getExports = function () {
        return this.awaitables.reduce(function (aggr, x) {
            return aggr.concat(x.getExports());
        }, []);
    };
    return RefOrImportStrategy;
}(AStrategy));
;
var ComponentStrategy = /** @class */ (function (_super) {
    __extends(ComponentStrategy, _super);
    function ComponentStrategy(awaiter, name, expr) {
        var _this = _super.call(this, awaiter) || this;
        _this.isDomInsert = false;
        _this.name = name;
        _this.expr = expr;
        return _this;
    }
    ComponentStrategy.prototype.process = function (model, ctx, container) {
        var module = this.awaiter.getModuleFor(this.name);
        if (module == null) {
            this.render(model, ctx, container);
            return;
        }
        var self = this;
        module
            .done(function () {
            self.render(model, ctx, container);
        })
            .fail(this.rejectDelegate());
    };
    ComponentStrategy.prototype.render = function (model, ctx, container) {
        var _this = this;
        var attr = Object.create(this.awaiter.attr);
        attr[this.name] = null;
        this.awaitable = new AwaitableRender(this.name, attr, this.expr, this.getNodes_(), model, ctx, container, this.awaiter);
        this.awaitable.pipe(this).then(function () {
            if (_this.isDomInsert) {
                Component.signal.emitIn(_this.awaiter, 'domInsert');
            }
        });
    };
    ComponentStrategy.prototype.getNodes = function () {
        return null;
    };
    ComponentStrategy.prototype.emit = function (name) {
        if (name === 'domInsert') {
            this.isDomInsert = true;
        }
    };
    return ComponentStrategy;
}(AStrategy));
;
var AwaitableModule = /** @class */ (function (_super) {
    __extends(AwaitableModule, _super);
    function AwaitableModule(module) {
        var _this = _super.call(this) || this;
        _this.module = module;
        _this.module.pipe(_this);
        return _this;
    }
    AwaitableModule.prototype.getExports = function () {
        return [this.module.exports];
    };
    return AwaitableModule;
}(class_Dfr));
;
var AwaitableExpr = /** @class */ (function (_super) {
    __extends(AwaitableExpr, _super);
    function AwaitableExpr(compo, expression) {
        var _this = _super.call(this) || this;
        _this.error = null;
        _this.exports = [];
        _this.onResolve = _this.onResolve.bind(_this);
        _this.onReject = _this.onReject.bind(_this);
        var arr = expression_evalStatements(expression, compo.model, null, compo);
        var imax = arr.length, i = -1;
        _this.await_ = imax;
        while (++i < imax) {
            var x = arr[i];
            if (x == null || is_Function(x.then) === false) {
                _this.await_--;
                _this.exports.push(x);
                continue;
            }
            x.then(_this.onResolve, _this.onReject);
        }
        if (_this.await_ === 0) {
            _this.resolve(_this.exports);
        }
        return _this;
    }
    AwaitableExpr.prototype.onResolve = function () {
        if (this.error) {
            return;
        }
        this.exports.push.apply(this.exports, arguments);
        if (--this.await_ === 0) {
            this.resolve(this.exports);
        }
    };
    AwaitableExpr.prototype.onReject = function (error) {
        this.error = error || Error('Rejected');
        this.reject(this.error);
    };
    AwaitableExpr.prototype.getExports = function () {
        return this.exports;
    };
    return AwaitableExpr;
}(class_Dfr));
;
var AwaitableRender = /** @class */ (function (_super) {
    __extends(AwaitableRender, _super);
    function AwaitableRender(name, attr, expression, nodes, model, ctx, container, ctr) {
        var _this = _super.call(this) || this;
        _this.onComplete = _this.onComplete.bind(_this);
        _this.anchor = document.createComment('');
        container.appendChild(_this.anchor);
        var node = {
            type: Dom.NODE,
            tagName: name,
            nodes: nodes,
            expression: expression,
            attr: attr,
        };
        renderer_renderAsync(node, model, builder_Ctx.clone(ctx), null, ctr)
            .then(_this.onComplete, _this.rejectDelegate());
        return _this;
    }
    AwaitableRender.prototype.onComplete = function (fragment) {
        this.anchor.parentNode.insertBefore(fragment, this.anchor);
        this.resolve();
    };
    return AwaitableRender;
}(class_Dfr));
;
function _getNames(str) {
    var names = str.split(','), imax = names.length, i = -1, arr = new Array(imax);
    while (++i < imax) {
        arr[i] = names[i].trim();
    }
    return arr;
}

import { u_resolvePathFromImport, u_resolveLocation } from './utils';
import { cache_get, cache_clear } from './cache';
import { _file_get, _file_getScript, _file_getStyle, _file_getJson } from './loaders';
import { tools_getDependencies } from './tools/dependencies';
import { tools_build } from './tools/build';
import { ModuleMask } from './Module/ModuleMask';
import { m_createModule, m_registerModule, m_registerModuleType } from './Module/exports';
import { Endpoint } from './class/Endpoint';
import { IModule } from './Module/Module';
import { i_createImport } from './Import/exports';
import { m_cfg } from './config';
import './Module/exports';
import './Import/exports';
import './components';
import './await';
import { type_isMask, type_get, type_getModuleType } from './types';
export var Module = {
    ModuleMask: ModuleMask,
    Endpoint: Endpoint,
    createModule: m_createModule,
    registerModule: m_registerModule,
    registerModuleType: m_registerModuleType,
    createImport: i_createImport,
    isMask: type_isMask,
    getType: type_get,
    getModuleType: type_getModuleType,
    cfg: m_cfg,
    resolveLocation: u_resolveLocation,
    resolvePath: u_resolvePathFromImport,
    getDependencies: tools_getDependencies,
    build: tools_build,
    clearCache: cache_clear,
    getCache: cache_get,
    reload: function (path) { },
    types: IModule.types,
    File: {
        get: _file_get,
        getScript: _file_getScript,
        getStyle: _file_getStyle,
        getJson: _file_getJson
    }
};

import { is_ArrayLike } from '@utils/is';
import { _document } from '@utils/refs';
export function els_toggleVisibility(mix, state) {
    if (mix == null) {
        return;
    }
    if (is_ArrayLike(mix)) {
        _toggleArr(mix, state);
        return;
    }
    _toggle(mix, state);
}
;
function _toggle(el, state) {
    el.style.display = state ? '' : 'none';
}
function _toggleArr(els, state) {
    var imax = els.length, i = -1;
    while (++i < imax)
        _toggle(els[i], state);
}
export function el_renderPlaceholder(container) {
    var anchor = _document.createComment('');
    container.appendChild(anchor);
    return anchor;
}

import { arr_each } from '@utils/arr';
function setVisibility(state, el) {
    if (el != null) {
        el.style.display = state ? '' : 'none';
    }
}
export function dom_remove(el) {
    var parent = el.parentNode;
    if (parent == null) {
        return el;
    }
    return parent.removeChild(el);
}
;
export function dom_removeAll(arr) {
    arr_each(arr, dom_remove);
}
;
export var dom_show = setVisibility.bind(null, true);
export var dom_hide = setVisibility.bind(null, false);
export function dom_showAll(arr) {
    arr_each(arr, dom_show);
}
export function dom_hideAll(arr) {
    arr_each(arr, dom_hide);
}
export function dom_insertAfter(el, anchor) {
    return anchor.parentNode.insertBefore(el, anchor.nextSibling);
}
;
export function dom_insertBefore(el, anchor) {
    return anchor.parentNode.insertBefore(el, anchor);
}
;

var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { expression_eval, expression_getType, exp_type_Sync, exp_type_Observe, exp_type_Async } from '@project/expression/src/exports';
import { custom_Statements } from '@core/custom/exports';
import { builder_build } from '@core/builder/exports';
import { is_PromiseLike, is_Observable } from '@utils/is';
import { Compo } from '@compo/exports';
import { compo_addChild, compo_renderElements, compo_emitInserted, compo_addChildren } from '@core/util/compo';
import { els_toggleVisibility, el_renderPlaceholder } from './utils';
import { _document } from '@utils/refs';
import { dom_insertBefore } from '@core/util/dom';
function getNodesSync(node, model, ctx, ctr) {
    do {
        if (expression_eval(node.expression, model, ctx, ctr, node)) {
            return node.nodes;
        }
        node = node.nextSibling;
        if (node == null || node.tagName !== 'else') {
            return null;
        }
        var expr = node.expression;
        if (expr == null || expr === '') {
            return node.nodes;
        }
    } while (true);
}
var ObservableNodes = /** @class */ (function () {
    function ObservableNodes(node, model, ctx, ctr, cb) {
        this.node = node;
        this.model = model;
        this.ctx = ctx;
        this.ctr = ctr;
        this.cb = cb;
        this.frame = 0;
        this.index = 0;
        this.cursor = null;
        this.switch = [];
        this.subscriptions = [];
        this.disposed = false;
        this.next = this.next.bind(this);
        this.tick = this.tick.bind(this);
        this.onValue = this.onValue.bind(this);
        this.cursor = node;
    }
    ObservableNodes.prototype.start = function () {
        this.frame++;
        this.index = 0;
        this.cursor = this.node;
        this.process();
    };
    ObservableNodes.prototype.eval = function () {
        return expression_eval(this.cursor.expression, this.model, this.ctx, this.ctr, this.node);
    };
    ObservableNodes.prototype.onValue = function (err, val) {
        if (err) {
            this.cb(err);
            return;
        }
        this.next(null, val);
    };
    ObservableNodes.prototype.next = function (err, result) {
        var meta = this.switch[this.index];
        meta.result = result;
        if (err) {
            this.cb(err);
            return;
        }
        if (result) {
            this.cb(null, meta.node, this.index);
            return;
        }
        this.index++;
        this.cursor = this.cursor.nextSibling;
        if (this.cursor == null || this.cursor.tagName !== 'else') {
            this.cb(null, null, -1);
            return;
        }
        var expr = this.cursor.expression;
        if (expr == null || expr === '') {
            this.cb(null, this.cursor, this.index);
            return;
        }
        this.process();
    };
    ObservableNodes.prototype.tick = function (err, i, result) {
        if (this.disposed) {
            return;
        }
        var s = this.switch[i];
        s.result = result;
        s.busy = false;
        this.start();
    };
    ObservableNodes.prototype.process = function () {
        var _this = this;
        var i = this.index;
        var meta = this.switch[i];
        if (meta != null) {
            switch (meta.type) {
                case exp_type_Sync: {
                    this.onValue(null, this.eval());
                    return;
                }
                case exp_type_Async:
                case exp_type_Observe:
                    if (meta.busy === false) {
                        this.onValue(null, meta.result);
                        return;
                    }
            }
        }
        var value = this.eval();
        meta = this.switch[i] = {
            busy: true,
            type: exp_type_Sync,
            node: this.cursor,
            value: null,
            error: null,
            result: null
        };
        if (is_Observable(value) && value.kind !== 2 /* SubjectKind.Promise */) {
            meta.type = exp_type_Observe;
            this.subscriptions.push(value.subscribe(function (x) { return _this.tick(null, i, x); }, this.tick));
            return;
        }
        if (is_PromiseLike(value)) {
            meta.type = exp_type_Async;
            value.then(function (x) { return _this.onValue(null, x); }, this.onValue);
            return;
        }
        meta.type = exp_type_Sync;
        this.onValue(null, value);
    };
    ObservableNodes.prototype.dispose = function () {
        this.disposed = true;
        this.subscriptions.forEach(function (x) { return x.unsubscribe(); });
    };
    return ObservableNodes;
}());
custom_Statements['if'] = {
    getNodes: getNodesSync,
    render: function (node, model, ctx, container, ctr, children) {
        var type = expression_getType(node.expression);
        if (type === exp_type_Sync) {
            var nodes = getNodesSync(node, model, ctx, ctr);
            if (nodes != null) {
                builder_build(nodes, model, ctx, container, ctr, children);
            }
            return;
        }
        var compo = new ObservableIf(node, model, ctx, container, ctr, children);
        compo_addChild(ctr, compo);
        compo.render();
    }
};
var ObservableIf = /** @class */ (function () {
    function ObservableIf(node, model, ctx, el, ctr, children) {
        this.node = node;
        this.model = model;
        this.ctx = ctx;
        this.el = el;
        this.ctr = ctr;
        this.children = children;
        this.compoName = '+if';
        this.binder = null;
        this.placeholder = null;
        this.index = -1;
        this.Switch = [];
    }
    ObservableIf.prototype.render = function () {
        var _this = this;
        this.resumeFn = Compo.pause(this, this.ctx);
        this.placeholder = el_renderPlaceholder(this.el);
        this.obs = new ObservableNodes(this.node, this.model, this.ctx, this.ctr, function (err, node, index) { return _this.show(err, node, index); });
        this.obs.start();
    };
    ObservableIf.prototype.show = function (err, node, index) {
        this.refresh(err, node, index);
        if (this.resumeFn != null) {
            this.resumeFn();
            this.resumeFn = null;
        }
    };
    ObservableIf.prototype.refresh = function (err, node, index) {
        var currentIndex = this.index, switch_ = this.Switch;
        if (currentIndex === index) {
            return;
        }
        if (currentIndex > -1) {
            els_toggleVisibility(switch_[currentIndex].elements, false);
        }
        if (index === -1) {
            this.index = -1;
            return;
        }
        this.index = index;
        var current = switch_[index];
        if (current == null) {
            switch_[index] = current = {
                elements: null,
                node: node
            };
        }
        if (current.elements != null) {
            els_toggleVisibility(current.elements, true);
            return;
        }
        var nodes = current.node.nodes, frag = _document.createDocumentFragment(), owner = { components: [], parent: this.ctr }, els = compo_renderElements(nodes, this.model, this.ctx, frag, owner);
        dom_insertBefore(frag, this.placeholder);
        current.elements = els;
        compo_emitInserted(owner);
        compo_addChildren.apply(void 0, __spreadArrays([this.ctr], owner.components));
    };
    ObservableIf.prototype.dispose = function () {
        this.obs && this.obs.dispose();
    };
    return ObservableIf;
}());
;

import { custom_Statements, custom_Tags } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { builder_build } from '@core/builder/exports';
import { is_Array } from '@utils/is';
import { log_error, log_warn } from '@core/util/reporters';
import { Dom } from '@core/dom/exports';
var FOR_OF_ITEM = 'for..of::item', FOR_IN_ITEM = 'for..in::item';
custom_Statements['for'] = {
    render: function (node, model, ctx, container, ctr, children) {
        parse_For(node.expression);
        var value = expression_eval(__ForDirective[3], model, ctx, ctr);
        if (value == null)
            return;
        build(value, __ForDirective, node.nodes, model, ctx, container, ctr, children);
    },
    build: build,
    parseFor: parse_For,
    createForNode: createForItemNode,
    getNodes: getNodes,
    getHandler: function (compoName, model) {
        if (compoName !== FOR_OF_ITEM && compoName !== FOR_IN_ITEM) {
            return null;
        }
        return createForItemHandler(compoName, model);
    }
};
(function () {
    custom_Tags[FOR_OF_ITEM] = createBootstrapCompo(FOR_OF_ITEM);
    custom_Tags[FOR_IN_ITEM] = createBootstrapCompo(FOR_IN_ITEM);
    function createBootstrapCompo(name) {
        function For_Item() { }
        For_Item.prototype = {
            meta: {
                serializeScope: true
            },
            serializeScope: for_proto_serializeScope,
            type: Dom.COMPONENT,
            compoName: name,
            renderEnd: handler_proto_renderEnd,
            dispose: handler_proto_dispose
        };
        return For_Item;
    }
}());
function build(value, For, nodes, model, ctx, container, ctr, childs) {
    builder_build(getNodes(nodes, value, For[0], For[1], For[2], For[3]), model, ctx, container, ctr, childs);
}
function getNodes(nodes, value, prop1, prop2, type, expr) {
    if ('of' === type) {
        if (is_Array(value) === false) {
            log_error('<ForStatement> Value is not enumerable', value);
            return null;
        }
        return loop_Array(nodes, value, prop1, prop2, expr);
    }
    if ('in' === type) {
        if (typeof value !== 'object') {
            log_warn('<ForStatement> Value is not an object', value);
            return null;
        }
        if (is_Array(value))
            log_warn('<ForStatement> Consider to use `for..of` for Arrays');
        return loop_Object(nodes, value, prop1, prop2, expr);
    }
}
function loop_Array(template, arr, prop1, prop2, expr) {
    var i = -1, imax = arr.length, nodes = new Array(imax), scope;
    while (++i < imax) {
        scope = {};
        scope[prop1] = arr[i];
        if (prop2)
            scope[prop2] = i;
        nodes[i] = createForItemNode(FOR_OF_ITEM, template, scope, i, prop1, expr);
    }
    return nodes;
}
function loop_Object(template, obj, prop1, prop2, expr) {
    var nodes = [], i = 0, scope, key, value;
    for (key in obj) {
        value = obj[key];
        scope = {};
        scope[prop1] = key;
        if (prop2)
            scope[prop2] = value;
        nodes[i++] = createForItemNode(FOR_IN_ITEM, template, scope, key, prop2, expr);
    }
    return nodes;
}
function createForItemNode(name, nodes, scope, key, propVal, expr) {
    return {
        type: Dom.COMPONENT,
        tagName: name,
        nodes: nodes,
        controller: createForItemHandler(name, scope, key, propVal, expr)
    };
}
function createForItemHandler(name, scope, key, propVal, expr) {
    return {
        meta: {
            serializeScope: true,
        },
        compoName: name,
        scope: scope,
        elements: null,
        propVal: propVal,
        key: key,
        expression: expr,
        renderEnd: handler_proto_renderEnd,
        dispose: handler_proto_dispose,
        serializeScope: for_proto_serializeScope
    };
}
function handler_proto_renderEnd(elements) {
    this.elements = elements;
}
function handler_proto_dispose() {
    if (this.elements)
        this.elements.length = 0;
}
function for_proto_serializeScope(scope, model) {
    var ctr = this, expr = ctr.expression, key = ctr.key, propVal = ctr.propVal;
    var val = scope[propVal];
    if (val != null && typeof val === 'object')
        scope[propVal] = '$ref:(' + expr + ')."' + key + '"';
    return scope;
}
var __ForDirective = ['prop1', 'prop2', 'in|of', 'expression'], i_PROP_1 = 0, i_PROP_2 = 1, i_TYPE = 2, i_EXPR = 3, state_prop = 1, state_multiprop = 2, state_loopType = 3;
var template, index, length;
function parse_For(expr) {
    // /([\w_$]+)((\s*,\s*([\w_$]+)\s*\))|(\s*\))|(\s+))(of|in)\s+([\w_$\.]+)/
    template = expr;
    length = expr.length;
    index = 0;
    var prop1, prop2, loopType, hasBrackets, c;
    c = parser_skipWhitespace();
    if (c === 40) {
        // (
        hasBrackets = true;
        index++;
        parser_skipWhitespace();
    }
    prop1 = parser_getVarDeclaration();
    c = parser_skipWhitespace();
    if (c === 44) {
        //,
        if (hasBrackets !== true) {
            return throw_('Parenthese must be used in multiple var declarion');
        }
        index++;
        parser_skipWhitespace();
        prop2 = parser_getVarDeclaration();
    }
    if (hasBrackets) {
        c = parser_skipWhitespace();
        if (c !== 41)
            return throw_('Closing parenthese expected');
        index++;
    }
    c = parser_skipWhitespace();
    var loopType;
    if (c === 105 && template.charCodeAt(++index) === 110) {
        // i n
        loopType = 'in';
    }
    if (c === 111 && template.charCodeAt(++index) === 102) {
        // o f
        loopType = 'of';
    }
    if (loopType == null) {
        return throw_('Invalid FOR statement. (in|of) expected');
    }
    __ForDirective[0] = prop1;
    __ForDirective[1] = prop2;
    __ForDirective[2] = loopType;
    __ForDirective[3] = template.substring(++index);
    return __ForDirective;
}
function parser_skipWhitespace() {
    var c;
    for (; index < length; index++) {
        c = template.charCodeAt(index);
        if (c < 33)
            continue;
        return c;
    }
    return -1;
}
function parser_getVarDeclaration() {
    var start = index, var_, c;
    for (; index < length; index++) {
        c = template.charCodeAt(index);
        if (c > 48 && c < 57) {
            // 0-9
            if (start === index)
                return throw_('Variable name begins with a digit');
            continue;
        }
        if ((c === 36) || // $
            (c === 95) || // _
            (c >= 97 && c <= 122) || // a-z
            (c >= 65 && c <= 90) // A-Z
        ) {
            continue;
        }
        break;
    }
    if (start === index)
        return throw_('Variable declaration expected');
    return template.substring(start, index);
}
function throw_(message) {
    throw new Error('<ForStatement parser> '
        + message
        + ' `'
        + template.substring(index, 20)
        + '`');
}

import { custom_Statements } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { builder_build } from '@core/builder/exports';
import { Dom } from '@core/dom/exports';
custom_Statements['each'] = {
    render: function (node, model, ctx, container, ctr, children) {
        var array = expression_eval(node.expression, model, ctx, ctr);
        if (array == null)
            return;
        builder_build(getNodes(node, array), array, ctx, container, ctr, children);
    }
};
function getNodes(node, array) {
    var imax = array.length, nodes = new Array(imax), template = node.nodes, expression = node.expression, exprPrefix = expression === '.'
        ? '."'
        : '(' + node.expression + ')."', i = 0;
    for (; i < imax; i++) {
        nodes[i] = createEachNode(template, array[i], exprPrefix, i);
    }
    return nodes;
}
function createEachNode(nodes, model, exprPrefix, i) {
    return {
        type: Dom.COMPONENT,
        tagName: 'each::item',
        nodes: nodes,
        controller: createEachItemHandler(model, i, exprPrefix)
    };
}
function createEachItemHandler(model, i, exprPrefix) {
    return {
        compoName: 'each::item',
        model: model,
        scope: {
            index: i
        },
        modelRef: exprPrefix + i + '"',
        attr: null,
        meta: null
    };
}

import { custom_Statements } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { builder_build } from '@core/builder/exports';
import { warn_withNode } from '@core/util/reporters';
custom_Statements['with'] = {
    render: function (node, model, ctx, el, ctr, elements) {
        var obj = expression_eval(node.expression, model, ctx, ctr);
        if (obj == null) {
            warn_withNode('Value is undefined', node);
        }
        builder_build(node.nodes, obj, ctx, el, ctr, elements);
    }
};

import { custom_Statements } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { builder_build } from '@core/builder/exports';
import { log_warn } from '@core/util/reporters';
custom_Statements['switch'] = {
    render: function (node, model, ctx, el, ctr, elements) {
        var value = expression_eval(node.expression, model, ctx, ctr), nodes = getNodes(value, node.nodes, model, ctx, ctr);
        if (nodes == null)
            return;
        builder_build(nodes, model, ctx, el, ctr, elements);
    },
    getNodes: getNodes
};
function getNodes(value, nodes, model, ctx, ctr) {
    if (nodes == null)
        return null;
    var imax = nodes.length, i = -1, child, expr, case_, default_;
    while (++i < imax) {
        child = nodes[i];
        if (child.tagName === 'default') {
            default_ = child;
            continue;
        }
        if (child.tagName !== 'case') {
            log_warn('<mask:switch> Case expected', child.tagName);
            continue;
        }
        expr = child.expression;
        if (!expr) {
            log_warn('<mask:switch:case> Expression expected');
            continue;
        }
        /* jshint eqeqeq: false */
        if (expression_eval(expr, model, ctx, ctr) == value) {
            /* jshint eqeqeq: true */
            case_ = child;
            break;
        }
    }
    if (case_ == null)
        case_ = default_;
    return case_ != null
        ? case_.nodes
        : null;
}

import { custom_Statements } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { builder_build } from '@core/builder/exports';
import { arr_pushMany } from '@utils/arr';
custom_Statements['visible'] = {
    toggle: toggle,
    render: function (node, model, ctx, container, ctr, children) {
        var els = [];
        builder_build(node.nodes, model, ctx, container, ctr, els);
        arr_pushMany(children, els);
        var visible = expression_eval(node.expression, model, ctx, ctr);
        toggle(els, visible);
    }
};
function toggle(els, visible) {
    for (var i = 0; i < els.length; i++) {
        els[i].style.display = visible ? '' : 'none';
    }
}

import { custom_Statements } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { builder_build } from '@core/builder/exports';
import { log_error } from '@core/util/reporters';
import { Dom } from '@core/dom/exports';
import { arr_pushMany } from '@utils/arr';
custom_Statements['repeat'] = {
    render: function (node, model, ctx, container, ctr, children) {
        var run = expression_eval, str = node.expression, repeat = str.split('..'), start = +run(repeat[0] || '', model, ctx, ctr), end = +run(repeat[1] || '', model, ctx, ctr);
        if (start !== start || end !== end) {
            log_error('Repeat attribute(from..to) invalid', str);
            return;
        }
        var nodes = node.nodes;
        var arr = [];
        var i = start - 1;
        while (++i < end) {
            arr.push(compo_init('repeat::item', nodes, model, i, container, ctr));
        }
        var els = [];
        builder_build(arr, model, ctx, container, ctr, els);
        arr_pushMany(children, els);
    }
};
function compo_init(name, nodes, model, index, container, parent) {
    return {
        type: Dom.COMPONENT,
        compoName: name,
        attr: {},
        nodes: nodes,
        model: model,
        container: container,
        parent: parent,
        index: index,
        scope: {
            index: index
        }
    };
}

import './if';
import './for';
import './each';
import './with';
import './switch';
import './visible';
import './repeat';

import { customAttr_register } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { Component } from '@compo/exports';
import { expression_createBinder, expression_bind, expression_unbind } from '@project/observer/src/exports';
customAttr_register('xx-visible', function (node, attrValue, model, ctx, el, ctr) {
    var binder = expression_createBinder(attrValue, model, ctx, ctr, function (value) {
        el.style.display = value ? '' : 'none';
    });
    expression_bind(attrValue, model, ctx, ctr, binder);
    Component.attach(ctr, 'dispose', function () {
        expression_unbind(attrValue, model, ctr, binder);
    });
    if (expression_eval(attrValue, model, ctx, ctr, node)) {
        el.style.display = 'none';
    }
});

import { expression_eval } from '@project/expression/src/exports';
export function expression_eval_safe(expr, model, ctx, ctr, node) {
    var x = expression_eval(expr, model, ctx, ctr, node);
    return x == null ? '' : x;
}
;

import { customAttr_register } from '@core/custom/exports';
import { expression_eval_safe } from '../utils/expression';
import { obj_setProperty } from '@utils/obj';
import { expression_varRefs } from '@project/expression/src/exports';
import { Component } from '@compo/exports';
/**
 *	Toggle value with ternary operator on an event.
 *
 *	button x-toggle='click: foo === "bar" ? "zet" : "bar" > 'Toggle'
 */
customAttr_register('x-toggle', 'client', function (node, attrValue, model, ctx, el, ctr) {
    var event = attrValue.substring(0, attrValue.indexOf(':')), expression = attrValue.substring(event.length + 1), ref = expression_varRefs(expression);
    if (typeof ref !== 'string') {
        // assume is an array
        ref = ref[0];
    }
    Component.Dom.addEventListener(el, event, function () {
        var val = expression_eval_safe(expression, model, ctx, ctr, node);
        obj_setProperty(model, ref, val);
    });
});

import { customAttr_register } from '@core/custom/exports';
import { domLib, Component } from '@compo/exports';
/**
 *	Toggle Class Name
 *
 *	button x-toggle='click: selected'
 */
customAttr_register('x-class-toggle', 'client', function (node, attrVal, model, ctx, element) {
    var event = attrVal.substring(0, attrVal.indexOf(':')), klass = attrVal.substring(event.length + 1).trim();
    Component.Dom.addEventListener(element, event, function () {
        domLib(element).toggleClass(klass);
    });
});

import './xxVisible';
import './xToggle';
import './xClassToggle';

import { customTag_register } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { obj_addObserver } from '@project/observer/src/exports';
/**
 * visible handler. Used to bind directly to display:X/none
 *
 * attr =
 *    check - expression to evaluate
 *    bind - listen for a property change
 */
function VisibleHandler() { }
customTag_register(':visible', VisibleHandler);
VisibleHandler.prototype = {
    constructor: VisibleHandler,
    refresh: function (model, container) {
        container.style.display = expression_eval(this.attr.check, model) ? '' : 'none';
    },
    renderStart: function (model, cntx, container) {
        this.refresh(model, container);
        if (this.attr.bind) {
            obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
        }
    }
};

import { is_String, is_Object, is_Function } from '@utils/is';
import { log_error } from '@core/util/reporters';
import { domLib } from '@compo/exports';
import { expression_eval_safe } from './utils/expression';
var class_INVALID = '-validate__invalid';
export var ValidatorProvider = {
    getFnFromModel: fn_fromModelWrapp,
    getFnByName: fn_byName,
    validate: validate,
    validateUi: function (fns, val, ctr, el, oncancel) {
        var error = validate(fns, val, ctr);
        if (error != null) {
            ui_notifyInvalid(el, error, oncancel);
            return error;
        }
        ui_clearInvalid(el);
        return null;
    }
};
function validate(fns, val, ctr) {
    if (fns == null) {
        return null;
    }
    var imax = fns.length, i = -1, error, fn;
    while (++i < imax) {
        fn = fns[i];
        if (fn == null) {
            continue;
        }
        error = fn(val, ctr);
        if (error != null) {
            if (is_String(error)) {
                return {
                    message: error,
                    actual: val
                };
            }
            if (error.actual == null) {
                error.actual = val;
            }
            return error;
        }
    }
}
function fn_fromModel(model, prop) {
    if (is_Object(model) === false) {
        return null;
    }
    var Validate = model.Validate;
    if (Validate != null) {
        var fn = null;
        if (is_Function(fn = Validate)) {
            return fn;
        }
        if (is_Function(fn = Validate[prop])) {
            return fn;
        }
    }
    var i = prop.indexOf('.');
    if (i !== -1) {
        return fn_fromModel(model[prop.substring(0, i)], prop.substring(i + 1));
    }
    return null;
}
function fn_fromModelWrapp(model, prop) {
    var fn = fn_fromModel(model, prop);
    if (fn == null) {
        return null;
    }
    return function () {
        var mix = fn.apply(model, arguments), message, error;
        if (mix == null) {
            return null;
        }
        if (is_String(mix)) {
            return {
                message: mix,
                property: prop,
                ctx: model
            };
        }
        mix.property = prop;
        mix.ctx = model;
        return mix;
    };
}
function fn_byName(name, param, message) {
    var Delegate = Validators[name];
    if (Delegate == null) {
        log_error('Invalid validator', name, 'Supports:', Object.keys(Validators));
        return null;
    }
    var fn = Delegate(param);
    return function (val, ctr) {
        var mix = fn(val, ctr);
        if (mix == null || mix === true) {
            return null;
        }
        if (mix === false) {
            return message || ('Check failed: `' + name + '`');
        }
        if (is_String(mix) && mix.length !== 0) {
            return mix;
        }
        return null;
    };
}
function ui_notifyInvalid(el, error, oncancel) {
    var message = error.message || error;
    var next = domLib(el).next('.' + class_INVALID);
    if (next.length === 0) {
        next = domLib('<div>')
            .addClass(class_INVALID)
            .html('<span></span><button>&otimes;</button>')
            .insertAfter(el);
    }
    return next
        .children('button')
        .off()
        .on('click', function () {
        next.hide();
        oncancel && oncancel();
    })
        .end()
        .children('span').text(message)
        .end()
        .show();
}
function ui_clearInvalid(el) {
    return domLib(el).next('.' + class_INVALID).hide();
}
export var Validators = {
    match: function (match) {
        return function (str) {
            return new RegExp(match).test(str);
        };
    },
    unmatch: function (unmatch) {
        return function (str) {
            return !(new RegExp(unmatch).test(str));
        };
    },
    minLength: function (min) {
        return function (str) {
            return str.length >= parseInt(min, 10);
        };
    },
    maxLength: function (max) {
        return function (str) {
            return str.length <= parseInt(max, 10);
        };
    },
    check: function (condition, node) {
        return function (str) {
            return expression_eval_safe('x' + condition, node.model, { x: str }, node);
        };
    }
};
export function registerValidator(type, fn) {
    Validators[type] = fn;
}

import { class_create } from '@utils/class';
import { ValidatorProvider, Validators } from '@binding/ValidatorProvider';
import { obj_getProperty } from '@utils/obj';
import { customTag_register } from '@core/custom/exports';
import { Component } from '@compo/exports';
import { log_error } from '@core/util/reporters';
var class_INVALID = '-validate-invalid';
export var ValidationCompo = class_create({
    attr: null,
    element: null,
    validators: null,
    constructor: function () {
        this.validators = [];
    },
    renderStart: function (model, ctx, container) {
        this.element = container;
        var prop = this.attr.value;
        if (prop) {
            var fn = ValidatorProvider.getFnFromModel(model, prop);
            if (fn != null) {
                this.validators.push(fn);
            }
        }
    },
    /**
     * @param input - {control specific} - value to validate
     * @param element - {HTMLElement} - (optional, @default this.element) -
     *				Invalid message is schown(inserted into DOM) after this element
     * @param oncancel - {Function} - Callback function for canceling
     *				invalid notification
     */
    validate: function (val, el, oncancel) {
        var element = el == null ? this.element : el, value = val;
        if (arguments.length === 0) {
            value = obj_getProperty(this.model, this.attr.value);
        }
        if (this.validators.length === 0) {
            this.initValidators();
        }
        var fns = this.validators, type = this.attr.silent ? 'validate' : 'validateUi';
        return ValidatorProvider[type](fns, value, this, element, oncancel);
    },
    initValidators: function () {
        var attr = this.attr, message = this.attr.message, isDefault = message == null;
        if (isDefault) {
            message = 'Invalid value of `' + this.attr.value + '`';
        }
        for (var key in attr) {
            switch (key) {
                case 'message':
                case 'value':
                case 'getter':
                case 'silent':
                    continue;
            }
            if (key in Validators === false) {
                log_error('Unknown Validator:', key, this);
                continue;
            }
            var str = isDefault ? (message + ' Validation: `' + key + '`') : message;
            var fn = ValidatorProvider.getFnByName(key, attr[key], str);
            if (fn != null) {
                this.validators.push(fn);
            }
        }
    }
});
customTag_register(':validate', ValidationCompo);
customTag_register(':validate:message', Component.create({
    template: 'div.' + class_INVALID + ' { span > "~[bind:message]" button > "~[cancel]" }',
    onRenderStart: function (model) {
        if (typeof model === 'string') {
            model = {
                message: model
            };
        }
        if (!model.cancel) {
            model.cancel = 'cancel';
        }
        this.model = model;
    },
    compos: {
        button: '$: button',
    },
    show: function (message, oncancel) {
        var that = this;
        this.model.message = message;
        this.compos.button.off().on(function () {
            that.hide();
            oncancel && oncancel();
        });
        this.$.show();
    },
    hide: function () {
        this.$.hide();
    }
}));

import { customTag_register } from '@core/custom/exports';
function ValidateGroup() { }
customTag_register(':validate:group', ValidateGroup);
ValidateGroup.prototype = {
    constructor: ValidateGroup,
    validate: function () {
        var validations = getValidations(this);
        for (var i = 0, x, length = validations.length; i < length; i++) {
            x = validations[i];
            if (!x.validate()) {
                return false;
            }
        }
        return true;
    }
};
function getValidations(component, out) {
    if (out === void 0) { out = []; }
    if (component.components == null) {
        return out;
    }
    var compos = component.components;
    for (var i = 0, x, length = compos.length; i < length; i++) {
        x = compos[i];
        if (x.compoName === 'validate') {
            out.push(x);
            continue;
        }
        getValidations(x, out);
    }
    return out;
}

export function date_ensure(val) {
    if (val == null || val === '')
        return null;
    var date = val;
    var type = typeof val;
    if (type === 'string') {
        date = new Date(val);
        if (rgx_es5Date.test(date) && val.indexOf('Z') === -1) {
            // adjust to local time (http://es5.github.io/x15.9.html#x15.9.1.15)
            val.setMinutes(val.getTimezoneOffset());
        }
    }
    if (type === 'number') {
        date = new Date(val);
    }
    return isNaN(date) === false && typeof date.getFullYear === 'function'
        ? date
        : null;
}
;
var rgx_es5Date = /^\d{4}\-\d{2}/;

import { expression_eval } from '@project/expression/src/exports';
import { expression_callFn } from '@project/observer/src/exports';
import { obj_setProperty, obj_getProperty } from '@utils/obj';
import { date_ensure } from './utils/date';
import { log_warn, log_error } from '@core/util/reporters';
import { coll_map, coll_each } from '@utils/coll';
import { is_ArrayLike } from '@utils/is';
;
var objectWay = {
    get: function (provider, expression) {
        var getter = provider.objGetter;
        if (getter == null) {
            return expression_eval(expression, provider.model, provider.ctx, provider.ctr);
        }
        var ctr = provider.ctr.parent, model = provider.model;
        return expression_callFn(getter, provider.model, provider.ctx, ctr, [expression, model, ctr]);
    },
    set: function (obj, property, value, provider) {
        var setter = provider.objSetter;
        if (setter == null) {
            obj_setProperty(obj, property, value);
            return;
        }
        var ctr = provider.ctr.parent, model = provider.model;
        return expression_callFn(setter, provider.model, provider.ctx, ctr, [value, property, model, ctr]);
    }
};
var domWay = {
    get: function (provider) {
        var getter = provider.domGetter;
        if (getter == null) {
            return obj_getProperty(provider, provider.property);
        }
        var ctr = provider.ctr.parent;
        if (isValidFn_(ctr, getter, 'Getter') === false) {
            return null;
        }
        return ctr[getter](provider.element);
    },
    set: function (provider, value) {
        var setter = provider.domSetter;
        if (setter == null) {
            obj_setProperty(provider, provider.property, value);
            return;
        }
        var ctr = provider.ctr.parent;
        if (isValidFn_(ctr, setter, 'Setter') === false) {
            return;
        }
        ctr[setter](value, provider.element);
    }
};
var DateTimeDelegate = {
    domSet: function (format) {
        return function (prov, val) {
            var date = date_ensure(val);
            prov.element.value = date == null ? '' : format(date);
        };
    },
    objSet: function (extend) {
        return function (obj, prop, val) {
            var date = date_ensure(val);
            if (date == null)
                return;
            var target = obj_getProperty(obj, prop);
            if (target == null) {
                obj_setProperty(obj, prop, date);
                return;
            }
            if (target.getFullYear == null || isNaN(target)) {
                target = date_ensure(target) || date;
                extend(target, date);
                obj_setProperty(obj, prop, target);
                return;
            }
            extend(target, date);
        };
    }
};
export var DomObjectTransport = {
    // generic
    objectWay: objectWay,
    domWay: domWay,
    domModelWay: {
        get: function (provider) {
            return obj_getProperty(provider.owner, provider.property);
        },
        set: function (provider, val) {
            obj_setProperty(provider.owner, provider.property, val);
        }
    },
    SELECT: {
        get: function (provider) {
            var el = provider.element, i = el.selectedIndex;
            if (i === -1)
                return '';
            var opt = el.options[i], val = opt.getAttribute('value');
            return val == null
                ? opt.getAttribute('name') /* obsolete */
                : val;
        },
        set: function (provider, val) {
            var el = provider.element, options = el.options, imax = options.length, opt, x, i;
            for (i = 0; i < imax; i++) {
                opt = options[i];
                x = opt.getAttribute('value');
                if (x == null)
                    x = opt.getAttribute('name');
                /* jshint eqeqeq: false */
                if (x == val) {
                    /* jshint eqeqeq: true */
                    el.selectedIndex = i;
                    return;
                }
            }
            log_warn('Value is not an option', val);
        }
    },
    SELECT_MULT: {
        get: function (provider) {
            return coll_map(provider.element.selectedOptions, function (x) {
                return x.value;
            });
        },
        set: function (provider, mix) {
            coll_each(provider.element.options, function (el) {
                el.selected = false;
            });
            if (mix == null) {
                return;
            }
            var arr = is_ArrayLike(mix) ? mix : [mix];
            coll_each(arr, function (val) {
                var els = provider.element.options, imax = els.length, i = -1;
                while (++i < imax) {
                    /* jshint eqeqeq: false */
                    if (els[i].value == val) {
                        /* jshint eqeqeq: true */
                        els[i].selected = true;
                    }
                }
                log_warn('Value is not an option', val);
            });
        }
    },
    DATE: {
        domWay: {
            get: domWay.get,
            set: function (prov, val) {
                var date = date_ensure(val);
                prov.element.value = date == null ? '' : formatDate(date);
            }
        },
        objectWay: {
            get: objectWay.get,
            set: DateTimeDelegate.objSet(function (a, b) {
                var offset = a.getTimezoneOffset();
                a.setFullYear(b.getFullYear());
                a.setMonth(b.getMonth());
                a.setDate(b.getDate());
                var diff = offset - a.getTimezoneOffset();
                if (diff !== 0) {
                    var h = (diff / 60) | 0;
                    a.setHours(a.getHours() + h);
                }
            })
        }
    },
    TIME: {
        domWay: {
            get: domWay.get,
            set: DateTimeDelegate.domSet(formatTime)
        },
        objectWay: {
            get: objectWay.get,
            set: DateTimeDelegate.objSet(function (a, b) {
                a.setHours(b.getHours());
                a.setMinutes(b.getMinutes());
                a.setSeconds(b.getSeconds());
            })
        }
    },
    MONTH: {
        domWay: {
            get: domWay.get,
            set: DateTimeDelegate.domSet(formatMonth)
        },
        objectWay: {
            get: objectWay.get,
            set: DateTimeDelegate.objSet(function (a, b) {
                a.setFullYear(b.getFullYear());
                a.setMonth(b.getMonth());
            })
        }
    },
    RADIO: {
        domWay: {
            get: function (provider) {
                var el = provider.element;
                return el.checked ? el.value : null;
            },
            set: function (provider, value) {
                var el = provider.element;
                el.checked = el.value === value;
            }
        },
    }
};
function isValidFn_(obj, prop, name) {
    if (obj == null || typeof obj[prop] !== 'function') {
        log_error('BindingProvider. Controllers accessor.', name, 'should be a function. Property:', prop);
        return false;
    }
    return true;
}
function getAccessorObject_(provider, accessor) {
    var ctr = provider.ctr.parent;
    if (ctr[accessor] != null)
        return ctr;
    var model = provider.model;
    if (model[accessor] != null)
        return model;
    log_error('BindingProvider. Accessor `', accessor, '`should be a function');
    return null;
}
function formatDate(date) {
    var YYYY = date.getFullYear(), MM = date.getMonth() + 1, DD = date.getDate();
    return YYYY
        + '-'
        + (MM < 10 ? '0' : '')
        + (MM)
        + '-'
        + (DD < 10 ? '0' : '')
        + (DD);
}
function formatTime(date) {
    var H = date.getHours(), M = date.getMinutes();
    return H
        + ':'
        + (M < 10 ? '0' : '')
        + (M);
}
function formatMonth(date) {
    var YYYY = date.getFullYear(), MM = date.getMonth() + 1;
    return YYYY
        + '-'
        + (MM < 10 ? '0' : '')
        + (MM);
}

import { log_error } from '@core/util/reporters';
export function signal_parse(str, isPiped, defaultType) {
    var signals = str.split(';'), set = [], i = 0, imax = signals.length, x, signalName, type, signal;
    for (; i < imax; i++) {
        x = signals[i].split(':');
        if (x.length !== 1 && x.length !== 2) {
            log_error('Too much ":" in a signal def.', signals[i]);
            continue;
        }
        type = x.length === 2 ? x[0] : defaultType;
        signalName = x[x.length === 2 ? 1 : 0];
        signal = signal_create(signalName.trim(), type, isPiped);
        if (signal != null) {
            set.push(signal);
        }
    }
    return set;
}
;
export function signal_create(signal, type, isPiped) {
    if (isPiped !== true) {
        return {
            signal: signal,
            type: type
        };
    }
    var index = signal.indexOf('.');
    if (index === -1) {
        log_error('No pipe name in a signal', signal);
        return null;
    }
    return {
        signal: signal.substring(index + 1),
        pipe: signal.substring(0, index),
        type: type
    };
}
;

import { DomObjectTransport } from './DomObjectTransport';
import { signal_parse } from './utils/signal';
import { log_error, log_warn } from '@core/util/reporters';
import { expression_unbind, expression_callFn, expression_createBinder, expression_bind, expression_getHost } from '@project/observer/src/exports';
import { is_Array } from '@utils/is';
import { obj_extend } from '@utils/obj';
import { ValidatorProvider } from './ValidatorProvider';
import { expression_varRefs } from '@project/expression/src/exports';
import { Component } from '@compo/exports';
export var CustomProviders = {};
var A_dom_slot = 'dom-slot';
var A_property = 'property';
var A_change_event = 'change-event';
var BindingProvider = /** @class */ (function () {
    function BindingProvider(model, element, ctr, bindingType) {
        this.model = model;
        this.element = element;
        this.ctr = ctr;
        this.validations = null;
        this.ctx = null;
        this.dismiss = 0;
        this.log = false;
        this.locked = false;
        this.domWay = DomObjectTransport.domWay;
        this.objectWay = DomObjectTransport.objectWay;
        if (bindingType == null) {
            bindingType = 'dual';
            var name = ctr.compoName;
            if (name === ':bind' || name === 'bind') {
                bindingType = 'single';
            }
        }
        var attr = ctr.attr;
        this.bindingType = bindingType;
        this.value = attr.value;
        this.property = attr[A_property];
        this.domSetter = attr['dom-setter'] || attr.setter;
        this.domGetter = attr['dom-getter'] || attr.getter;
        this.objSetter = attr['obj-setter'];
        this.objGetter = attr['obj-getter'];
        this.mapToObj = attr['map-to-obj'];
        this.mapToDom = attr['map-to-dom'];
        this.owner = ctr.parent;
        this.changeEvent = attr[A_change_event] || 'change';
        /* Convert to an instance, e.g. Number, on domchange event */
        this.typeOf = attr['typeof'] || null;
        var isCompoBinder = ctr.node.parent.tagName === this.owner.compoName;
        switch (true) {
            case (A_dom_slot in attr):
                this.domListenerType = 'signal';
                break;
            case (A_change_event in attr):
                this.domListenerType = 'event';
                break;
            case (isCompoBinder && (A_property in attr)):
                this.domListenerType = 'observe';
                break;
        }
        if (isCompoBinder) {
            if (this.domListenerType === 'observe') {
                this.domWay = DomObjectTransport.domModelWay;
            }
            else {
                var isInput = element.nodeType === 1 && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA');
                if (isInput === false) {
                    if (this.domSetter == null)
                        this.domSetter = 'setValue';
                    if (this.domGetter == null)
                        this.domGetter = 'getValue';
                    if (attr[A_dom_slot] == null)
                        attr[A_dom_slot] = 'input';
                }
            }
        }
        if (this.domListenerType == null) {
            this.domListenerType = 'event';
        }
        if (this.property == null && this.domGetter == null) {
            switch (element.tagName) {
                case 'INPUT':
                    // Do not use .type accessor, as some browsers do not support e.g. date
                    var type = element.getAttribute('type');
                    if ('checkbox' === type) {
                        this.property = 'element.checked';
                        break;
                    }
                    if ('radio' === type) {
                        this.domWay = DomObjectTransport.RADIO.domWay;
                        break;
                    }
                    if ('date' === type ||
                        'time' === type ||
                        'month' === type) {
                        var x = DomObjectTransport[type.toUpperCase()];
                        this.domWay = x.domWay;
                        this.objectWay = x.objectWay;
                    }
                    else if ('number' === type) {
                        this['typeOf'] = 'Number';
                    }
                    this.changeEvent = attr[A_change_event] || 'change,input';
                    this.property = 'element.value';
                    break;
                case 'TEXTAREA':
                    this.property = 'element.value';
                    break;
                case 'SELECT':
                    this.domWay = element.multiple
                        ? DomObjectTransport.SELECT_MULT
                        : DomObjectTransport.SELECT;
                    break;
                default:
                    this.property = 'element.innerHTML';
                    break;
            }
        }
        if (attr['log']) {
            this.log = true;
            if (attr.log !== 'log') {
                this.logExpression = attr.log;
            }
        }
        // Send signal on OBJECT or DOM change
        if (attr['x-signal']) {
            var signals = signal_parse(attr['x-signal'], null, 'dom'), i = signals.length;
            while (--i > -1) {
                var signal = signals[i], signalType = signal && signal.type;
                if (signalType !== 'dom' && signalType !== 'object') {
                    log_error('Signal typs is not supported', signal);
                    continue;
                }
                this['signal_' + signalType + 'Changed'] = signal.signal;
            }
        }
        // Send PIPED signal on OBJECT or DOM change
        if (attr['x-pipe-signal']) {
            var signals = signal_parse(attr['x-pipe-signal'], true, 'dom'), i = signals.length;
            while (--i > -1) {
                var signal = signals[i], signalType = signal && signal.type;
                if (signalType !== 'dom' && signalType !== 'object') {
                    log_error('Pipe type is not supported', signal);
                    continue;
                }
                this['pipe_' + signalType + 'Changed'] = signal;
            }
        }
        var domSlot = attr[A_dom_slot];
        if (domSlot != null) {
            this.slots = {};
            // @hack - place dualb. provider on the way of a signal
            //
            var parent = ctr.parent, newparent = parent.parent;
            parent.parent = this;
            this.parent = newparent;
            this.slots[domSlot] = function (sender, value) {
                this.domChanged(sender, value);
            };
        }
        /*
         *  @obsolete: attr name : 'x-pipe-slot'
         */
        var pipeSlot = attr['object-pipe-slot'] || attr['x-pipe-slot'];
        if (pipeSlot) {
            var str = pipeSlot, index = str.indexOf('.'), pipeName = str.substring(0, index), signal = str.substring(index + 1);
            this.pipes = {};
            this.pipes[pipeName] = {};
            this.pipes[pipeName][signal] = function () {
                this.objectChanged();
            };
            Component.pipe.addController(this);
        }
        var expression = attr.expression || ctr.expression;
        if (expression) {
            this.expression = expression;
            if (this.value == null && bindingType !== 'single') {
                var refs = expression_varRefs(this.expression);
                if (typeof refs === 'string') {
                    this.value = refs;
                }
                else {
                    log_warn('Please set value attribute in DualBind Control.');
                }
            }
            return;
        }
        this.expression = this.value;
    }
    BindingProvider.prototype.dispose = function () {
        if (this.binder != null) {
            expression_unbind(this.expression, this.model, this.ctr, this.binder);
        }
        if (this.domObserveBinder != null) {
            expression_unbind(this.property, this.ctr, this.ctr, this.domObserveBinder);
        }
    };
    BindingProvider.prototype.objectChanged = function (val) {
        if (this.dismiss-- > 0) {
            return;
        }
        var isConcurrent = this.locked === true;
        if (isConcurrent) {
            log_warn('Concurrent change detected', this);
            // Set the value to dom anyway, but skip emitting
        }
        this.locked = true;
        if (val == null || this.objGetter != null) {
            val = this.objectWay.get(this, this.expression);
        }
        if (this.mapToDom != null) {
            val = expression_callFn(this.mapToDom, this.model, null, this.ctr, [
                val
            ]);
        }
        this.domWay.set(this, val);
        if (this.log) {
            console.log('[BindingProvider] objectChanged -', val);
        }
        if (isConcurrent === false) {
            var signal = this.signal_objectChanged;
            if (signal != null) {
                Component.signal.emitOut(this.ctr, signal, this.ctr, [val]);
            }
            var pipe = this.pipe_objectChanged;
            if (pipe != null) {
                Component.pipe(pipe.pipe).emit(pipe.signal);
            }
        }
        this.locked = false;
    };
    BindingProvider.prototype.domChanged = function (event, val) {
        if (this.locked === true) {
            log_warn('Concurance change detected', this);
            return;
        }
        this.locked = true;
        if (val == null) {
            val = this.domWay.get(this);
        }
        var typeof_ = this['typeOf'];
        if (typeof_ != null) {
            var Converter = window[typeof_];
            val = Converter(val);
        }
        if (this.mapToObj != null) {
            val = expression_callFn(this.mapToObj, this.model, null, this.ctr, [val]);
        }
        var error = this.validate(val);
        if (error == null) {
            this.dismiss = 1;
            var tuple = expression_getHost(this.value, this.model, null, this.ctr.parent);
            if (tuple != null) {
                var obj = tuple[0], prop = tuple[1];
                this.objectWay.set(obj, prop, val, this);
            }
            this.dismiss = 0;
            if (this.log) {
                console.log('[BindingProvider] domChanged -', val);
            }
            if (this.signal_domChanged != null) {
                Component.signal.emitOut(this.ctr, this.signal_domChanged, this.ctr, [val]);
            }
            if (this.pipe_domChanged != null) {
                var pipe = this.pipe_domChanged;
                Component.pipe(pipe.pipe).emit(pipe.signal);
            }
        }
        this.locked = false;
    };
    BindingProvider.prototype.addValidation = function (mix) {
        if (this.validations == null) {
            this.validations = [];
        }
        if (is_Array(mix)) {
            this.validations = this.validations.concat(mix);
            return;
        }
        this.validations.push(mix);
    };
    BindingProvider.prototype.validate = function (val) {
        var fns = this.validations, ctr = this.ctr, el = this.element;
        if (fns == null || fns.length === 0) {
            return null;
        }
        var val_ = arguments.length !== 0 ? val : this.domWay.get(this);
        return ValidatorProvider.validateUi(fns, val_, ctr, el, this.objectChanged.bind(this));
    };
    BindingProvider.create = function (model, el, ctr, bindingType) {
        /* Initialize custom provider */
        var type = ctr.attr.bindingProvider, CustomProvider = type == null ? null : CustomProviders[type], provider;
        if (typeof CustomProvider === 'function') {
            return new CustomProvider(model, el, ctr, bindingType);
        }
        provider = new BindingProvider(model, el, ctr, bindingType);
        if (CustomProvider != null) {
            obj_extend(provider, CustomProvider);
        }
        return provider;
    };
    BindingProvider.bind = function (provider) {
        return apply_bind(provider);
    };
    return BindingProvider;
}());
export { BindingProvider };
function apply_bind(provider) {
    var expr = provider.expression, model = provider.model, onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);
    provider.binder = expression_createBinder(expr, model, provider.ctx, provider.ctr, onObjChanged);
    expression_bind(expr, model, provider.ctx, provider.ctr, provider.binder);
    if (provider.bindingType === 'dual') {
        var onDomChange = provider.domChanged.bind(provider);
        switch (provider.domListenerType) {
            case 'event': {
                var el = provider.element, event = provider.changeEvent, attachListener = Component.Dom.addEventListener;
                if (event.indexOf(',') !== -1) {
                    var arr = event.split(',');
                    for (var i = 0; i < arr.length; i++) {
                        attachListener(el, arr[i].trim(), onDomChange);
                    }
                }
                attachListener(el, event, onDomChange);
                break;
            }
            case 'observe': {
                provider.domObserveBinder = onDomChange;
                expression_bind(provider.property, provider.owner, provider.ctx, null, onDomChange);
                break;
            }
        }
        if (provider.objectWay.get(provider, provider.expression) == null) {
            // object has no value, so check the dom            
            setTimeout(function () {
                if (provider.domWay.get(provider))
                    // and apply when exists
                    provider.domChanged();
            });
            return provider;
        }
    }
    // trigger update
    provider.objectChanged();
    return provider;
}

import { customTag_register } from '@core/custom/exports';
import { BindingProvider } from '@binding/BindingProvider';
(function () {
    function Bind() { }
    customTag_register(':bind', Bind);
    customTag_register('bind', Bind);
    Bind.prototype = {
        constructor: Bind,
        renderStart: function (model, ctx, container) {
            this.provider = BindingProvider.create(model, container, this, 'single');
            this.provider.objectChanged();
        }
    };
}());

import { customTag_register } from '@core/custom/exports';
import { BindingProvider } from '@binding/BindingProvider';
/**
 *	Mask Custom Handler
 *
 *	2 Way Data Model binding
 *
 *
 *	attr =
 *		value: {string} - property path in object
 *		?property : {default} 'element.value' - value to get/set from/to HTMLElement
 *		?changeEvent: {default} 'change' - listen to this event for HTMLELement changes
 *
 *		?setter: {string} - setter function of a parent controller
 *		?getter: {string} - getter function of a parent controller
 *
 *
 */
function DualbindHandler() { }
customTag_register(':dualbind', DualbindHandler);
customTag_register('dualbind', DualbindHandler);
DualbindHandler.prototype = {
    constructor: DualbindHandler,
    renderStart: function (model, ctx, container) {
        this.provider = BindingProvider.create(model, container, this);
        this.provider.objectChanged();
    },
    dispose: function () {
        var provider = this.provider, dispose = provider && provider.dispose;
        if (typeof dispose === 'function') {
            dispose.call(provider);
        }
    },
    validate: function () {
        return this.provider && this.provider.validate();
    },
    handlers: {
        attr: {
            'x-signal': function () { }
        }
    }
};

import './visible';
import './validate';
import './validate_group';
//#if (NODE)
import './bind_node';
import './dualbind_node';
//#endif

import { _document } from '@utils/refs';
import { custom_Statements } from '@core/custom/exports';
import { fn_proxy } from '@utils/fn';
import { expression_createBinder, expression_bind } from '@project/observer/src/exports';
import { is_Array } from '@utils/is';
export function _getNodes(name, node, model, ctx, controller) {
    return custom_Statements[name].getNodes(node, model, ctx, controller);
}
export function _renderPlaceholder(staticCompo, compo, container) {
    var placeholder = staticCompo.placeholder;
    if (placeholder == null) {
        placeholder = _document.createComment('');
        container.appendChild(placeholder);
    }
    compo.placeholder = placeholder;
}
export function _compo_initAndBind(compo, node, model, ctx, container, controller) {
    compo.parent = controller;
    compo.model = model;
    compo.ctx = ctx;
    compo.refresh = fn_proxy(compo.refresh, compo);
    compo.binder = expression_createBinder(compo.expr || compo.expression, model, ctx, controller, compo.refresh);
    expression_bind(compo.expr || compo.expression, model, ctx, controller, compo.binder);
}
export var els_toggleVisibility;
(function () {
    els_toggleVisibility = function (mix, state) {
        if (mix == null)
            return;
        if (is_Array(mix)) {
            _arr(mix, state);
            return;
        }
        _single(mix, state);
    };
    function _single(el, state) {
        el.style.display = state ? '' : 'none';
    }
    function _arr(els, state) {
        var imax = els.length, i = -1;
        while (++i < imax)
            _single(els[i], state);
    }
})();

import { arr_each } from '@utils/arr';
export function dom_removeElement(el) {
    var parent = el.parentNode;
    if (parent == null) {
        return el;
    }
    return parent.removeChild(el);
}
;
export function dom_removeAll(arr) {
    arr_each(arr, dom_removeElement);
}
;
export function dom_hideEl(el) {
    if (el != null) {
        el.style.display = 'none';
    }
}
;
export function dom_hideAll(arr) {
    arr_each(arr, dom_hideEl);
}
;
export function dom_showEl(el) {
    if (el != null) {
        el.style.display = '';
    }
}
;
export function dom_showAll(arr) {
    arr_each(arr, dom_showEl);
}
;
export function dom_insertAfter(el, anchor) {
    return anchor.parentNode.insertBefore(el, anchor.nextSibling);
}
;
export function dom_insertBefore(el, anchor) {
    return anchor.parentNode.insertBefore(el, anchor);
}
;

import { _document } from '@utils/refs';
import { dom_insertAfter, dom_insertBefore, dom_removeAll } from './dom';
import { log_error } from '@core/util/reporters';
import { compo_renderElements } from '@core/util/compo';
import { arr_remove } from '@utils/arr';
import { Component } from '@compo/exports';
import { renderer_render } from '@core/renderer/exports';
import { builder_Ctx } from '@core/builder/exports';
export function compo_fragmentInsert(compo, index, fragment, placeholder) {
    if (compo.components == null) {
        return dom_insertAfter(fragment, placeholder || compo.placeholder);
    }
    var compos = compo.components, anchor = null, insertBefore = true, imax = compos.length, i = index - 1;
    if (anchor == null) {
        while (++i < imax) {
            var arr = compos[i].elements;
            if (arr != null && arr.length !== 0) {
                anchor = arr[0];
                break;
            }
        }
    }
    if (anchor == null) {
        insertBefore = false;
        i = index < imax
            ? index
            : imax;
        while (--i > -1) {
            var arr = compos[i].elements;
            if (arr != null && arr.length !== 0) {
                anchor = arr[arr.length - 1];
                break;
            }
        }
    }
    if (anchor == null) {
        anchor = placeholder || compo.placeholder;
    }
    if (insertBefore) {
        return dom_insertBefore(fragment, anchor);
    }
    return dom_insertAfter(fragment, anchor);
}
;
export function compo_render(parentCtr, template, model, ctx, container) {
    return renderer_render(template, model, ctx, container, parentCtr);
}
;
export function compo_renderChildren(compo, anchor, model) {
    var fragment = _document.createDocumentFragment();
    var ctx = new builder_Ctx(compo.ctx);
    compo.elements = compo_renderElements(compo.nodes, model || compo.model, ctx, fragment, compo);
    dom_insertBefore(fragment, anchor);
    compo_inserted(compo, ctx);
}
;
// export function compo_renderElements (nodes, model, ctx, el, ctr, children?){
//     if (nodes == null){
//         return null;
//     }
//     var arr = [];
//     builder_build(nodes, model, ctx, el, ctr, arr);
//     if (is_Array(children)) {
//         children.push.apply(children, arr);
//     }
//     return arr;
// };
export function compo_dispose(compo, parent) {
    if (compo == null)
        return false;
    if (compo.elements != null) {
        dom_removeAll(compo.elements);
        compo.elements = null;
    }
    Component.dispose(compo);
    var compos = (parent && parent.components) || (compo.parent && compo.parent.components);
    if (compos == null) {
        log_error('Parent Components Collection is undefined');
        return false;
    }
    return arr_remove(compos, compo);
}
;
export function compo_disposeChildren(compo) {
    var els = compo.elements;
    if (els != null) {
        dom_removeAll(els);
        compo.elements = null;
    }
    var compos = compo.components;
    if (compos != null) {
        var imax = compos.length, i = -1;
        while (++i < imax) {
            Component.dispose(compos[i]);
        }
        compos.length = 0;
    }
}
;
export function compo_inserted(compo, ctx) {
    if (ctx == null || typeof ctx !== 'object' || ctx.async !== true) {
        Component.signal.emitIn(compo, 'domInsert');
    }
    else {
        ctx.done(function () {
            Component.signal.emitIn(compo, 'domInsert');
        });
    }
}
;
export function compo_hasChild(compo, compoName) {
    var arr = compo.components;
    if (arr == null || arr.length === 0) {
        return false;
    }
    var imax = arr.length, i = -1;
    while (++i < imax) {
        if (arr[i].compoName === compoName) {
            return true;
        }
    }
    return false;
}
;
export function compo_getScopeFor(ctr, path) {
    var key = path;
    var i = path.indexOf('.');
    if (i !== -1) {
        key = path.substring(0, i);
        if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
            key = key.slice(0, -1);
        }
    }
    while (ctr != null) {
        if (ctr.scope != null && ctr.scope.hasOwnProperty(key)) {
            return ctr.scope;
        }
        ctr = ctr.parent;
    }
    return null;
}
;

import { _document } from '@utils/refs';
import { expression_unbind, expression_bind, expression_createListener } from '@project/observer/src/exports';
import { customTag_register } from '@core/custom/exports';
import { compo_inserted } from '../utils/compo';
import { _renderPlaceholder, _getNodes, els_toggleVisibility } from './utils';
import { mask_stringify } from '@core/parser/exports';
import { dom_insertBefore } from '../utils/dom';
import { fn_proxy } from '@utils/fn';
import { expression_eval_safe } from '../utils/expression';
import { compo_renderElements } from '@core/util/compo';
customTag_register('+if', {
    placeholder: null,
    meta: {
        serializeNodes: true
    },
    render: function (model, ctx, container, ctr, children) {
        var node = this, nodes = _getNodes('if', node, model, ctx, ctr), index = 0, next = node;
        while (next.nodes !== nodes) {
            index++;
            next = node.nextSibling;
            if (next == null || next.tagName !== 'else') {
                index = null;
                break;
            }
        }
        this.attr['switch-index'] = index;
        return compo_renderElements(nodes, model, ctx, container, ctr, children);
    },
    renderEnd: function (els, model, ctx, container, ctr) {
        var compo = new IFStatement(), index = this.attr['switch-index'];
        _renderPlaceholder(this, compo, container);
        return initialize(compo, this, index, els, model, ctx, container, ctr);
    },
    serializeNodes: function (current) {
        var nodes = [current];
        while (true) {
            current = current.nextSibling;
            if (current == null || current.tagName !== 'else') {
                break;
            }
            nodes.push(current);
        }
        return mask_stringify(nodes);
    }
});
function IFStatement() { }
IFStatement.prototype = {
    compoName: '+if',
    ctx: null,
    model: null,
    controller: null,
    index: null,
    Switch: null,
    binder: null,
    refresh: function () {
        var currentIndex = this.index, model = this.model, ctx = this.ctx, ctr = this.controller, switch_ = this.Switch, imax = switch_.length, i = -1;
        while (++i < imax) {
            var node = switch_[i].node;
            var expr = node.expression;
            if (expr == null)
                break;
            if (expression_eval_safe(expr, model, ctx, ctr, node))
                break;
        }
        if (currentIndex === i)
            return;
        if (currentIndex != null)
            els_toggleVisibility(switch_[currentIndex].elements, false);
        if (i === imax) {
            this.index = null;
            return;
        }
        this.index = i;
        var current = switch_[i];
        if (current.elements != null) {
            els_toggleVisibility(current.elements, true);
            return;
        }
        var nodes = current.node.nodes, frag = _document.createDocumentFragment(), owner = { components: [], parent: ctr }, els = compo_renderElements(nodes, model, ctx, frag, owner);
        dom_insertBefore(frag, this.placeholder);
        current.elements = els;
        compo_inserted(owner);
        if (ctr.components == null) {
            ctr.components = [];
        }
        ctr.components.push.apply(ctr.components, owner.components);
    },
    dispose: function () {
        var switch_ = this.Switch, imax = switch_.length, i = -1, x, expr;
        while (++i < imax) {
            x = switch_[i];
            expr = x.node.expression;
            if (expr) {
                expression_unbind(expr, this.model, this.controller, this.binder);
            }
            x.node = null;
            x.elements = null;
        }
        this.controller = null;
        this.model = null;
        this.ctx = null;
    }
};
function initialize(compo, node, index, elements, model, ctx, container, ctr) {
    compo.model = model;
    compo.ctx = ctx;
    compo.controller = ctr;
    compo.refresh = fn_proxy(compo.refresh, compo);
    compo.binder = expression_createListener(compo.refresh);
    compo.index = index;
    compo.Switch = [{
            node: node,
            elements: null
        }];
    expression_bind(node.expression, model, ctx, ctr, compo.binder);
    while (true) {
        node = node.nextSibling;
        if (node == null || node.tagName !== 'else')
            break;
        compo.Switch.push({
            node: node,
            elements: null
        });
        if (node.expression)
            expression_bind(node.expression, model, ctx, ctr, compo.binder);
    }
    if (index != null) {
        compo.Switch[index].elements = elements;
    }
    return compo;
}

import { _document } from '@utils/refs';
import { Component } from '@compo/exports';
import { dom_insertBefore } from '../../utils/dom';
import { compo_fragmentInsert, compo_dispose } from '../../utils/compo';
export function arr_createRefs(array) {
    var imax = array.length, i = -1;
    while (++i < imax) {
        //create references from values to distinguish the models
        var x = array[i];
        switch (typeof x) {
            case 'string':
            case 'number':
            case 'boolean':
                array[i] = Object(x);
                break;
        }
    }
}
;
export function list_sort(self, array) {
    var compos = self.node.components, i = 0, imax = compos.length, j = 0, jmax = null, element = null, compo = null, fragment = _document.createDocumentFragment(), sorted = [];
    for (; i < imax; i++) {
        compo = compos[i];
        if (compo.elements == null || compo.elements.length === 0)
            continue;
        for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
            element = compo.elements[j];
            element.parentNode.removeChild(element);
        }
    }
    outer: for (j = 0, jmax = array.length; j < jmax; j++) {
        for (i = 0; i < imax; i++) {
            if (array[j] === self._getModel(compos[i])) {
                sorted[j] = compos[i];
                continue outer;
            }
        }
        console.warn('No Model Found for', array[j]);
    }
    for (i = 0, imax = sorted.length; i < imax; i++) {
        compo = sorted[i];
        if (compo.elements == null || compo.elements.length === 0) {
            continue;
        }
        for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
            element = compo.elements[j];
            fragment.appendChild(element);
        }
    }
    self.components = self.node.components = sorted;
    dom_insertBefore(fragment, self.placeholder);
}
;
export function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
    var node = self.node, compos = node.components;
    if (compos == null)
        compos = node.components = [];
    var prop1 = self.prop1, prop2 = self.prop2, type = self.type, ctx = self.ctx, ctr = self.node;
    if (deleteIndex != null && deleteCount != null) {
        var i = deleteIndex, length = deleteIndex + deleteCount;
        if (length > compos.length)
            length = compos.length;
        for (; i < length; i++) {
            if (compo_dispose(compos[i], node)) {
                i--;
                length--;
            }
        }
    }
    if (insertIndex != null && rangeModel && rangeModel.length) {
        var i = compos.length, imax, fragment = self._build(node, rangeModel, ctx, ctr), new_ = compos.splice(i);
        compo_fragmentInsert(node, insertIndex, fragment, self.placeholder);
        compos.splice.apply(compos, [insertIndex, 0].concat(new_));
        i = 0;
        imax = new_.length;
        for (; i < imax; i++) {
            Component.signal.emitIn(new_[i], 'domInsert');
        }
    }
}
;
export function list_remove(self, removed) {
    var compos = self.components, i = compos.length;
    while (--i > -1) {
        var x = compos[i];
        if (removed.indexOf(x.model) === -1) {
            continue;
        }
        compo_dispose(x, self.node);
    }
}
;

import { compo_dispose, compo_inserted } from '../../utils/compo';
import { dom_insertBefore } from '../../utils/dom';
import { arr_each } from '@utils/arr';
import { arr_createRefs, list_update, list_sort, list_remove } from './utils';
import { expression_unbind } from '@project/observer/src/exports';
export var LoopStatementProto = {
    ctx: null,
    model: null,
    parent: null,
    binder: null,
    refresh: function (value, method, args, result) {
        var i = 0, x, imax;
        var node = this.node, model = this.model, ctx = this.ctx, ctr = this.node;
        if (method == null) {
            // this was new array/object setter and not an immutable function call
            var compos = node.components;
            if (compos != null) {
                var imax = compos.length, i = -1;
                while (++i < imax) {
                    if (compo_dispose(compos[i], node)) {
                        i--;
                        imax--;
                    }
                }
                compos.length = 0;
            }
            var frag = this._build(node, value, ctx, ctr);
            dom_insertBefore(frag, this.placeholder);
            arr_each(node.components, compo_inserted);
            return;
        }
        var array = value;
        arr_createRefs(value);
        switch (method) {
            case 'push':
                list_update(this, null, null, array.length - 1, array.slice(array.length - 1));
                break;
            case 'pop':
                list_update(this, array.length, 1);
                break;
            case 'unshift':
                list_update(this, null, null, 0, array.slice(0, 1));
                break;
            case 'shift':
                list_update(this, 0, 1);
                break;
            case 'splice':
                var sliceStart = args[0], sliceRemove = args.length === 1 ? this.components.length : args[1], sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
                list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
                break;
            case 'sort':
            case 'reverse':
                list_sort(this, array);
                break;
            case 'remove':
                if (result != null && result.length)
                    list_remove(this, result);
                break;
        }
    },
    dispose: function () {
        expression_unbind(this.expr || this.expression, this.model, this.parent, this.binder);
    }
};

import { is_Array } from '@utils/is';
import { fn_proxy } from '@utils/fn';
import { custom_Statements, customTag_register } from '@core/custom/exports';
import { builder_build } from '@core/builder/exports';
import { expression_eval } from '@project/expression/src/exports';
import { mask_stringify } from '@core/parser/exports';
import { expression_createBinder, expression_bind } from '@project/observer/src/exports';
import { arr_createRefs } from './utils';
import { _renderPlaceholder, _compo_initAndBind } from '../utils';
import { LoopStatementProto } from './proto';
import '@core/statements/exports';
var For = custom_Statements['for'], attr_PROP_1 = 'for-prop-1', attr_PROP_2 = 'for-prop-2', attr_TYPE = 'for-type', attr_EXPR = 'for-expr';
customTag_register('+for', {
    meta: {
        serializeNodes: true
    },
    serializeNodes: function (node) {
        return mask_stringify(node);
    },
    render: function (model, ctx, container, ctr, children) {
        var directive = For.parseFor(this.expression), attr = this.attr;
        attr[attr_PROP_1] = directive[0];
        attr[attr_PROP_2] = directive[1];
        attr[attr_TYPE] = directive[2];
        attr[attr_EXPR] = directive[3];
        var value = expression_eval(directive[3], model, ctx, ctr);
        if (value == null)
            return;
        if (is_Array(value))
            arr_createRefs(value);
        For.build(value, directive, this.nodes, model, ctx, container, this, children);
    },
    renderEnd: function (els, model, ctx, container, ctr) {
        var compo = new ForStatement(this, this.attr);
        _renderPlaceholder(this, compo, container);
        _compo_initAndBind(compo, this, model, ctx, container, ctr);
        return compo;
    },
    getHandler: function (name, model) {
        return For.getHandler(name, model);
    }
});
function initialize(compo, node, els, model, ctx, container, ctr) {
    compo.parent = ctr;
    compo.model = model;
    compo.refresh = fn_proxy(compo.refresh, compo);
    compo.binder = expression_createBinder(compo.expr, model, ctx, ctr, compo.refresh);
    expression_bind(compo.expr, model, ctx, ctr, compo.binder);
}
function ForStatement(node, attr) {
    this.prop1 = attr[attr_PROP_1];
    this.prop2 = attr[attr_PROP_2];
    this.type = attr[attr_TYPE];
    this.expr = attr[attr_EXPR];
    if (node.components == null)
        node.components = [];
    this.node = node;
    this.components = node.components;
}
ForStatement.prototype = {
    compoName: '+for',
    model: null,
    parent: null,
    refresh: LoopStatementProto.refresh,
    dispose: LoopStatementProto.dispose,
    _getModel: function (compo) {
        return compo.scope[this.prop1];
    },
    _build: function (node, model, ctx, component) {
        var nodes = For.getNodes(node.nodes, model, this.prop1, this.prop2, this.type);
        return builder_build(nodes, this.model, ctx, null, component);
    }
};

import { _document } from '@utils/refs';
import { customTag_register } from '@core/custom/exports';
import { expression_eval } from '@project/expression/src/exports';
import { arr_createRefs } from './utils';
import { _renderPlaceholder, _compo_initAndBind } from '../utils';
import { class_create } from '@utils/class';
import { builder_build } from '@core/builder/exports';
import { Dom } from '@core/dom/exports';
import { LoopStatementProto } from './proto';
import { mask_stringify } from '@core/parser/exports';
var EachBinded = {
    meta: {
        serializeNodes: true
    },
    serializeNodes: function (node) {
        return mask_stringify(node);
    },
    //modelRef: null,
    render: function (model, ctx, container, ctr, children) {
        //this.modelRef = this.expression;
        var array = expression_eval(this.expression, model, ctx, ctr);
        if (array == null)
            return;
        arr_createRefs(array);
        build(this.nodes, array, ctx, container, this, children);
    },
    renderEnd: function (els, model, ctx, container, ctr) {
        var compo = new EachStatement(this, this.attr);
        _renderPlaceholder(this, compo, container);
        _compo_initAndBind(compo, this, model, ctx, container, ctr);
        return compo;
    }
};
var EachItem = class_create({
    compoName: 'each::item',
    scope: null,
    model: null,
    modelRef: null,
    parent: null,
    //#if (NODE)
    renderStart: function () {
        var expr = this.parent.expression;
        this.modelRef = ''
            + (expr === '.' ? '' : ('(' + expr + ')'))
            + '."'
            + this.scope.index
            + '"';
    },
    //#endif
    renderEnd: function (els) {
        this.elements = els;
    },
    dispose: function () {
        if (this.elements != null) {
            this.elements.length = 0;
            this.elements = null;
        }
    }
});
var EachStatement = class_create(LoopStatementProto, {
    compoName: '+each',
    constructor: function EachStatement(node, attr) {
        this.expression = node.expression;
        this.nodes = node.nodes;
        if (node.components == null)
            node.components = [];
        this.node = node;
        this.components = node.components;
    },
    _getModel: function (compo) {
        return compo.model;
    },
    _build: function (node, model, ctx, component) {
        var fragment = _document.createDocumentFragment();
        build(node.nodes, model, ctx, fragment, component);
        return fragment;
    }
});
// METHODS
function build(nodes, array, ctx, container, ctr, elements) {
    var imax = array.length, nodes_ = new Array(imax), i = 0, node;
    for (; i < imax; i++) {
        node = createEachNode(nodes, i);
        builder_build(node, array[i], ctx, container, ctr, elements);
    }
}
function createEachNode(nodes, index) {
    var item = new EachItem;
    item.scope = { index: index };
    return {
        type: Dom.COMPONENT,
        tagName: 'each::item',
        nodes: nodes,
        controller: function () {
            return item;
        }
    };
}
// EXPORTS
customTag_register('each::item', EachItem);
customTag_register('+each', EachBinded);

import { customStatement_get, customTag_register } from '@core/custom/exports';
import { expression_unbind, expression_createBinder, expression_bind } from '@project/observer/src/exports';
import { _renderPlaceholder, els_toggleVisibility } from './utils';
import { _Array_slice } from '@utils/refs';
import { dom_insertBefore } from '@binding/utils/dom';
import { fn_proxy } from '@utils/fn';
import { expression_eval_safe } from '@binding/utils/expression';
import { mask_stringify } from '@core/parser/exports';
import { renderer_render } from '@core/renderer/exports';
import { compo_renderElements } from '@core/util/compo';
(function () {
    var $Switch = customStatement_get('switch'), attr_SWITCH = 'switch-index';
    var _nodes, _index;
    customTag_register('+switch', {
        meta: {
            serializeNodes: true
        },
        serializeNodes: function (current) {
            return mask_stringify(current);
        },
        render: function (model, ctx, container, ctr, children) {
            var value = expression_eval_safe(this.expression, model, ctx, ctr);
            resolveNodes(value, this.nodes, model, ctx, ctr);
            var nodes = _nodes, index = _index;
            if (nodes == null) {
                return null;
            }
            this.attr[attr_SWITCH] = index;
            return compo_renderElements(nodes, model, ctx, container, ctr, children);
        },
        renderEnd: function (els, model, ctx, container, ctr) {
            var compo = new SwitchStatement(), index = this.attr[attr_SWITCH];
            _renderPlaceholder(this, compo, container);
            return initialize(compo, this, index, els, model, ctx, container, ctr);
        }
    });
    function SwitchStatement() { }
    SwitchStatement.prototype = {
        compoName: '+switch',
        ctx: null,
        model: null,
        controller: null,
        index: null,
        nodes: null,
        Switch: null,
        binder: null,
        refresh: function (value) {
            var compo = this, Switch = compo.Switch, model = compo.model, ctx = compo.ctx, ctr = compo.controller;
            resolveNodes(value, compo.nodes, model, ctx, ctr);
            var nodes = _nodes, index = _index;
            if (index === compo.index) {
                return;
            }
            if (compo.index != null) {
                els_toggleVisibility(Switch[compo.index], false);
            }
            compo.index = index;
            if (index == null) {
                return;
            }
            var elements = Switch[index];
            if (elements != null) {
                els_toggleVisibility(elements, true);
                return;
            }
            var result = renderer_render(nodes, model, ctx, null, ctr);
            Switch[index] = result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
                ? _Array_slice.call(result.childNodes)
                : result;
            dom_insertBefore(result, compo.placeholder);
        },
        dispose: function () {
            expression_unbind(this.expr, this.model, this.controller, this.binder);
            this.controller = null;
            this.model = null;
            this.ctx = null;
            var switch_ = this.Switch, key, els, i, imax;
            for (key in switch_) {
                els = switch_[key];
                if (els == null)
                    continue;
                imax = els.length;
                i = -1;
                while (++i < imax) {
                    if (els[i].parentNode != null)
                        els[i].parentNode.removeChild(els[i]);
                }
            }
        }
    };
    function resolveNodes(val, nodes, model, ctx, ctr) {
        _nodes = $Switch.getNodes(val, nodes, model, ctx, ctr);
        _index = null;
        if (_nodes == null)
            return;
        var imax = nodes.length, i = -1;
        while (++i < imax) {
            if (nodes[i].nodes === _nodes)
                break;
        }
        _index = i === imax ? null : i;
    }
    function initialize(compo, node, index, elements, model, ctx, container, ctr) {
        compo.ctx = ctx;
        compo.expr = node.expression;
        compo.model = model;
        compo.controller = ctr;
        compo.index = index;
        compo.nodes = node.nodes;
        compo.refresh = fn_proxy(compo.refresh, compo);
        compo.binder = expression_createBinder(compo.expr, model, ctx, ctr, compo.refresh);
        compo.Switch = new Array(node.nodes.length);
        if (index != null) {
            compo.Switch[index] = elements;
        }
        expression_bind(node.expression, model, ctx, ctr, compo.binder);
        return compo;
    }
}());

import { customTag_register } from '@core/custom/exports';
import { expression_createBinder, expression_bind, expression_unbind } from '@project/observer/src/exports';
import { fn_proxy } from '@utils/fn';
import { compo_disposeChildren, compo_renderChildren } from '@binding/utils/compo';
import { _renderPlaceholder } from './utils';
import { expression_eval } from '@project/expression/src/exports';
import { compo_renderElements } from '@core/util/compo';
(function () {
    customTag_register('+with', {
        meta: {
            serializeNodes: true
        },
        rootModel: null,
        render: function (model, ctx, container, ctr) {
            var expr = this.expression, nodes = this.nodes, val = expression_eval(expr, model, ctx, ctr);
            this.rootModel = model;
            return compo_renderElements(nodes, val, ctx, container, ctr);
        },
        onRenderStartClient: function (model, ctx) {
            this.rootModel = model;
            this.model = expression_eval(this.expression, model, ctx, this);
        },
        renderEnd: function (els, model_, ctx, container, ctr) {
            var model = this.rootModel || model_, compo = new WithStatement(this);
            compo.elements = els;
            compo.model = model;
            compo.parent = ctr;
            compo.refresh = fn_proxy(compo.refresh, compo);
            compo.binder = expression_createBinder(compo.expr, model, ctx, ctr, compo.refresh);
            expression_bind(compo.expr, model, ctx, ctr, compo.binder);
            _renderPlaceholder(this, compo, container);
            return compo;
        }
    });
    function WithStatement(node) {
        this.expr = node.expression;
        this.nodes = node.nodes;
    }
    WithStatement.prototype = {
        compoName: '+with',
        elements: null,
        binder: null,
        model: null,
        parent: null,
        refresh: function (model) {
            compo_disposeChildren(this);
            compo_renderChildren(this, this.placeholder, model);
        },
        dispose: function () {
            expression_unbind(this.expr, this.model, this.parent, this.binder);
            this.parent = null;
            this.model = null;
            this.ctx = null;
        }
    };
}());

import { customStatement_get, customTag_register } from '@core/custom/exports';
import { builder_build } from '@core/builder/exports';
import { expression_createBinder, expression_bind, expression_unbind } from '@project/observer/src/exports';
import { fn_proxy } from '@utils/fn';
import { expression_eval_safe } from '@binding/utils/expression';
(function () {
    var $Visible = customStatement_get('visible');
    customTag_register('+visible', {
        meta: {
            serializeNodes: true
        },
        render: function (model, ctx, container, ctr, childs) {
            return build(this.nodes, model, ctx, container, ctr);
        },
        renderEnd: function (els, model, ctx, container, ctr) {
            var compo = new VisibleStatement(this);
            compo.elements = els;
            compo.model = model;
            compo.parent = ctr;
            compo.refresh = fn_proxy(compo.refresh, compo);
            compo.binder = expression_createBinder(compo.expr, model, ctx, ctr, compo.refresh);
            expression_bind(compo.expr, model, ctx, ctr, compo.binder);
            compo.refresh();
            return compo;
        }
    });
    function VisibleStatement(node) {
        this.expr = node.expression;
        this.nodes = node.nodes;
    }
    VisibleStatement.prototype = {
        compoName: '+visible',
        elements: null,
        binder: null,
        model: null,
        parent: null,
        refresh: function () {
            var isVisible = expression_eval_safe(this.expr, this.model, this.ctx, this);
            $Visible.toggle(this.elements, isVisible);
        },
        dispose: function () {
            expression_unbind(this.expr, this.model, this.parent, this.binder);
            this.parent = null;
            this.model = null;
            this.ctx = null;
        }
    };
    function build(nodes, model, ctx, container, ctr) {
        var els = [];
        builder_build(nodes, model, ctx, container, ctr, els);
        return els;
    }
}());

import { class_create } from '@utils/class';
export var IBinder = class_create({
    constructor: function (exp, model, ctr) {
        this.exp = exp;
        this.ctr = ctr;
        this.model = model;
        this.cb = null;
    },
    on: null,
    bind: function (cb) {
        this.cb = cb;
        // we have here no access to the ctx, so pass null
        this.on(this.exp, this.model, null, this.ctr, cb);
    },
    dispose: function () {
        this.off(this.exp, this.model, this.ctr, this.cb);
        this.exp = this.model = this.ctr = this.cb = null;
    }
});

import { class_create } from '@utils/class';
import { log_error } from '@core/util/reporters';
import { IBinder } from './IBinder';
import { expression_evalStatements } from '@project/expression/src/exports';
/*
 *	"expression, ...args"
 *	expression: to get the IEventEmitter
 */
export var EventEmitterBinder = class_create(IBinder, {
    on: function (exp, model, ctx, ctr, cb) {
        call('on', exp, model, ctr, cb);
    },
    off: function (exp, model, ctr, cb) {
        call('off', exp, model, ctr, cb);
    },
});
function call(method, expr, model, ctr, cb) {
    var arr = expression_evalStatements(expr, model, null, ctr);
    var observable = arr.shift();
    if (observable == null || observable[method] == null) {
        log_error('Method is undefined on observable: ' + method);
        return;
    }
    arr.push(cb);
    observable[method].apply(observable, arr);
}

import { IBinder } from './IBinder';
import { expression_bind, expression_unbind } from '@project/observer/src/exports';
import { class_create } from '@utils/class';
export var ExpressionBinder = class_create(IBinder, {
    on: expression_bind,
    off: expression_unbind
});

import { IBinder } from './IBinder';
import { error_withCompo } from '@core/util/reporters';
import { class_create } from '@utils/class';
import { expression_evalStatements } from '@project/expression/src/exports';
/*
 *	"expression, ...args"
 *	expression: to get the RxObservable {subscribe:IDisposable}
 */
export var RxBinder = class_create(IBinder, {
    stream: null,
    on: function call(expr, model, ctr, cb) {
        var arr = expression_evalStatements(expr, model, null, ctr);
        var stream = arr.shift();
        if (stream == null || stream.subscribe == null) {
            error_withCompo('Subscribe method is undefined on RxObservable', ctr);
            return;
        }
        arr.push(cb);
        this.stream = stream.subscribe.apply(stream, arr);
    },
    off: function () {
        if (this.stream == null) {
            return;
        }
        this.stream.dispose();
    },
});

import { EventEmitterBinder } from './EventEmitterBinder';
import { ExpressionBinder } from './ExpressionBinder';
import { RxBinder } from './RxBinder';
export var Binders = {
    EventEmitterBinder: EventEmitterBinder,
    ExpressionBinder: ExpressionBinder,
    RxBinder: RxBinder
};

import { class_create } from '@utils/class';
import { customTag_register } from '@core/custom/exports';
import { fn_proxy } from '@utils/fn';
import { Binders } from '@binding/binders/exports';
import { _renderPlaceholder } from './utils';
import { compo_disposeChildren, compo_renderChildren, compo_dispose } from '@binding/utils/compo';
import { Component } from '@compo/exports';
customTag_register('listen', class_create({
    disposed: false,
    placeholder: null,
    compoName: 'listen',
    show: null,
    hide: null,
    binder: null,
    meta: {
        serializeNodes: true,
        attributes: {
            animatable: false,
            on: false,
            rx: false,
        }
    },
    renderEnd: function (els, model, ctx, container, ctr) {
        _renderPlaceholder(this, this, container);
        var fn = Boolean(this.attr.animatable)
            ? this.refreshAni
            : this.refreshSync;
        this.refresh = fn_proxy(fn, this);
        this.elements = els;
        var Ctor = this.getBinder();
        this.binder = new Ctor(this.expression, model, this);
        this.binder.bind(this.refresh);
    },
    getBinder: function () {
        if (this.attr.on) {
            return Binders.EventEmitterBinder;
        }
        if (this.attr.rx) {
            return Binders.RxBinder;
        }
        return Binders.ExpressionBinder;
    },
    dispose: function () {
        this.binder.dispose();
        this.disposed = true;
        this.elements = null;
    },
    refresh: function () {
        throw new Error('Should be defined by refreshSync/refreshAni');
    },
    refreshSync: function () {
        compo_disposeChildren(this);
        this.create();
    },
    create: function () {
        compo_renderChildren(this, this.placeholder);
    },
    refreshAni: function () {
        var _this = this;
        var x = {
            components: this.components,
            elements: this.elements
        };
        this.components = this.elements = null;
        var show = this.getAni('show');
        var hide = this.getAni('hide');
        if (this.attr.animatable === 'parallel') {
            show.start(this.create());
            hide.start(x.elements, function () {
                compo_dispose(x);
            });
            return;
        }
        hide.start(x.elements, function () {
            if (_this.disposed === true) {
                return;
            }
            compo_dispose(x);
            show.start(_this.create());
        });
    },
    getAni: function (name) {
        var x = this[name];
        if (x != null) {
            return x;
        }
        var ani = Component.child(this, 'Animation#' + name);
        if (ani != null) {
            return (this[name] = ani.start.bind(ani));
        }
    },
}));

import './utils';
import './if';
import './loop/for';
import './loop/each';
import './switch';
import './with';
import './visible';
import './listen';

import { _document } from '@utils/refs';
import { is_Function } from '@utils/is';
import { obj_setProperty } from '@utils/obj';
import { log_warn } from '@core/util/reporters';
import { expression_createBinder, expression_bind, expression_unbind } from '@project/observer/src/exports';
import { customUtil_register } from '@core/custom/exports';
import { Component } from '@compo/exports';
import { expression_eval_safe } from '@binding/utils/expression';
/**
 *	Mask Custom Utility - for use in textContent and attribute values
 */
function attr_strReplace(attrValue, currentValue, newValue) {
    if (!attrValue)
        return newValue;
    if (currentValue == null || currentValue === '')
        return attrValue + ' ' + newValue;
    return attrValue.replace(currentValue, newValue);
}
function refresherDelegate_NODE(el) {
    return function (value) {
        el.textContent = value;
    };
}
/** Attributes */
function refresherDelegate_ATTR(el, attrName, currentValue) {
    var current_ = currentValue;
    return function (value) {
        var currentAttr = el.getAttribute(attrName), attr = attr_strReplace(currentAttr, current_, value);
        if (attr == null || attr === '') {
            el.removeAttribute(attrName);
        }
        else {
            el.setAttribute(attrName, attr);
        }
        current_ = value;
    };
}
function refresherDelegate_ATTR_COMPO(ctr, attrName, currentValue) {
    var current_ = currentValue;
    return function (val) {
        if (current_ === val) {
            return;
        }
        current_ = val;
        var fn = ctr.setAttribute;
        if (is_Function(fn)) {
            fn.call(ctr, attrName, val);
            return;
        }
        ctr.attr[attrName] = val;
    };
}
function refresherDelegate_ATTR_PROP(element, attrName, currentValue) {
    return function (value) {
        switch (typeof element[attrName]) {
            case 'boolean':
                currentValue = element[attrName] = !!value;
                return;
            case 'number':
                currentValue = element[attrName] = Number(value);
                return;
            case 'string':
                currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
                return;
            default:
                log_warn('Unsupported elements property type', attrName);
                return;
        }
    };
}
/** Properties */
function refresherDelegate_PROP_NODE(el, property, currentValue) {
    return function (value) {
        obj_setProperty(el, property, value);
    };
}
function refresherDelegate_PROP_COMPO(ctr, property, currentValue) {
    var current_ = currentValue;
    return function (val) {
        if (current_ === val) {
            return;
        }
        current_ = val;
        obj_setProperty(ctr, property, val);
    };
}
function create_refresher(type, expr, element, currentValue, attrName, ctr) {
    if ('node' === type) {
        return refresherDelegate_NODE(element);
    }
    if ('attr' === type) {
        switch (attrName) {
            case 'value':
            case 'disabled':
            case 'checked':
            case 'selected':
            case 'selectedIndex':
                if (attrName in element) {
                    return refresherDelegate_ATTR_PROP(element, attrName, currentValue);
                }
        }
        return refresherDelegate_ATTR(element, attrName, currentValue);
    }
    if ('prop' === type) {
        return refresherDelegate_PROP_NODE(element, attrName, currentValue);
    }
    if ('compo-attr' === type) {
        return refresherDelegate_ATTR_COMPO(ctr, attrName, currentValue);
    }
    if ('compo-prop' === type) {
        return refresherDelegate_PROP_COMPO(ctr, attrName, currentValue);
    }
    throw Error('Unexpected binder type: ' + type);
}
function bind(current, expr, model, ctx, element, ctr, attrName, type) {
    var owner = type === 'compo-attr' || type === 'compo-prop' ? ctr.parent : ctr;
    var refresher = create_refresher(type, expr, element, current, attrName, ctr), binder = expression_createBinder(expr, model, ctx, owner, refresher);
    expression_bind(expr, model, ctx, owner, binder);
    Component.attach(ctr, 'dispose', function () {
        expression_unbind(expr, model, owner, binder);
    });
}
customUtil_register('bind', {
    mode: 'partial',
    current: null,
    element: null,
    nodeRenderStart: function (expr, model, ctx, el, ctr, attrName, type, node) {
        var owner = type === 'compo-attr' || type === 'compo-prop' ? ctr.parent : ctr;
        var current = expression_eval_safe(expr, model, ctx, owner, node);
        // though we apply value's to `this` context, but it is only for immediat use
        // in .node() function, as `this` context is a static object that share all bind
        // utils
        this.element = _document.createTextNode(current);
        return (this.current = current);
    },
    node: function (expr, model, ctx, container, ctr) {
        var el = this.element, val = this.current;
        bind(val, expr, model, ctx, el, ctr, null, 'node');
        this.element = null;
        this.current = null;
        return el;
    },
    attrRenderStart: function (expr, model, ctx, el, ctr, attrName, type, node) {
        var owner = type === 'compo-attr' || type === 'compo-prop' ? ctr.parent : ctr;
        return (this.current = expression_eval_safe(expr, model, ctx, owner, node));
    },
    attr: function (expr, model, ctx, element, controller, attrName, type) {
        bind(this.current, expr, model, ctx, element, controller, attrName, type);
        return this.current;
    }
});

import './bind';

import './attributes/exports';
import './handlers/exports';
import './statements/exports';
import './utilities/exports';
import { CustomProviders } from './BindingProvider';
export { Validators, registerValidator } from './ValidatorProvider';
export { obj_addObserver, obj_removeObserver } from '@project/observer/src/exports';
export var BindingProviders = CustomProviders;
export function registerBinding(name, Prov) {
    CustomProviders[name] = Prov;
}

import { _Array_slice, _global } from '@utils/refs';
import { class_Dfr } from '@utils/class/Dfr';
import { obj_getProperty, obj_setProperty, obj_extend } from '@utils/obj';
import { str_dedent } from '@utils/str';
import { is_Function, is_String, is_ArrayLike, is_Object, is_Date, is_NODE, is_DOM } from '@utils/is';
import { class_create } from '@utils/class';
import { error_createClass } from '@utils/error';
import { class_EventEmitter } from '@utils/class/EventEmitter';
import { listeners_on, listeners_off } from './util/listeners';
import { log_error, reporter_getNodeStack, log, error_withNode, log_warn, warn_withNode } from './util/reporters';
import { Dom } from './dom/exports';
import { customTag_register, customTag_registerFromTemplate, customTag_define, customTag_get, customTag_getAll, customStatement_register, customStatement_get, customAttr_register, customAttr_get, customUtil_register, customUtil_get, customUtil_$utils, custom_optimize } from './custom/exports';
import { parser_ensureTemplateFunction, parser_parse, parser_parseHtml, mask_stringify, parser_ObjectLexer, parser_defineContentTag, parser_setInterpolationQuotes } from './parser/exports';
import { ExpressionUtil } from '@project/expression/src/exports';
import { mask_config } from './api/config';
import { Templates } from './handlers/template';
import { builder_build, builder_buildSVG, BuilderData } from './builder/exports';
import { mask_run } from './feature/run';
import { mask_merge } from './feature/merge';
import { mask_optimize, mask_registerOptimizer } from './feature/optimize';
import { mask_TreeWalker } from './feature/TreeWalker';
import { Module } from './feature/modules/exports';
import { Di } from './feature/Di';
import { Decorator } from './feature/decorators/exports';
import './statements/exports';
import './handlers/exports';
import { obj_addObserver, obj_removeObserver, Validators, registerValidator, BindingProviders, registerBinding } from '@binding/exports';
import { Component, Compo, domLib } from '@compo/exports';
import { jMask } from '@mask-j/jMask';
import { renderer_clearCache, renderer_renderAsync, renderer_render } from './renderer/exports';
/**
 * @namespace mask
 */
export var Mask = {
    /**
     * Render the mask template to document fragment or single html node
     * @param {(string|MaskDom)} template - Mask string template or Mask Ast to render from.
     * @param {*} [model] - Model Object.
     * @param {Object} [ctx] - Context can store any additional information, that custom handler may need
     * @param {IAppendChild} [container]  - Container Html Node where template is rendered into
     * @param {Object} [controller] - Component that should own this template
     * @returns {(IAppendChild|Node|DocumentFragment)} container
     * @memberOf mask
     */
    render: renderer_render,
    /**
     * Same to `mask.render` but returns the promise, which is resolved when all async components
     * are resolved, or is in resolved state, when all components are synchronous.
     * For the parameters doc @see {@link mask.render}
     * @returns {Promise} Fullfills with (`IAppendChild|Node|DocumentFragment`, `Component`)
     * @memberOf mask
     */
    renderAsync: renderer_renderAsync,
    parse: parser_parse,
    parseHtml: parser_parseHtml,
    stringify: mask_stringify,
    build: builder_build,
    buildSVG: builder_buildSVG,
    run: mask_run,
    merge: mask_merge,
    optimize: mask_optimize,
    registerOptimizer: mask_registerOptimizer,
    TreeWalker: mask_TreeWalker,
    Module: Module,
    File: Module.File,
    Di: Di,
    registerHandler: customTag_register,
    registerFromTemplate: customTag_registerFromTemplate,
    define: customTag_define,
    getHandler: customTag_get,
    getHandlers: customTag_getAll,
    registerStatement: customStatement_register,
    getStatement: customStatement_get,
    registerAttrHandler: customAttr_register,
    getAttrHandler: customAttr_get,
    registerUtil: customUtil_register,
    getUtil: customUtil_get,
    $utils: customUtil_$utils,
    _: customUtil_$utils,
    defineDecorator: Decorator.define,
    Dom: Dom,
    /**
     * Is present only in DEBUG (not minified) version
     * Evaluates script in masks library scope
     * @param {string} script
     */
    plugin: function (source) {
    },
    clearCache: renderer_clearCache,
    Utils: {
        Expression: ExpressionUtil,
        ensureTmplFn: parser_ensureTemplateFunction
    },
    obj: {
        get: obj_getProperty,
        set: obj_setProperty,
        extend: obj_extend,
        addObserver: obj_addObserver,
        removeObserver: obj_removeObserver
    },
    str: {
        dedent: str_dedent
    },
    is: {
        Function: is_Function,
        String: is_String,
        ArrayLike: is_ArrayLike,
        Array: is_ArrayLike,
        Object: is_Object,
        Date: is_Date,
        NODE: is_NODE,
        DOM: is_DOM
    },
    class: {
        create: class_create,
        createError: error_createClass,
        Deferred: class_Dfr,
        EventEmitter: class_EventEmitter
    },
    parser: {
        ObjectLexer: parser_ObjectLexer,
        getStackTrace: reporter_getNodeStack,
        defineContentTag: parser_defineContentTag
    },
    log: {
        info: log,
        error: log_error,
        errorWithNode: error_withNode,
        warn: log_warn,
        warnWithNode: warn_withNode
    },
    on: listeners_on,
    off: listeners_off,
    // Stub for the reload.js, which will be used by includejs.autoreload
    delegateReload: function () { },
    /**
     * Define interpolation quotes for the parser
     * Starting from 0.6.9 mask uses ~[] for string interpolation.
     * Old '#{}' was changed to '~[]', while template is already overloaded with #, { and } usage.
     * @param {string} start - Must contain 2 Characters
     * @param {string} end - Must contain 1 Character
     **/
    setInterpolationQuotes: parser_setInterpolationQuotes,
    setCompoIndex: function (index) {
        BuilderData.id = index;
    },
    cfg: mask_config,
    config: mask_config,
    // For the consistence with the NodeJS
    toHtml: function (dom) {
        return Mask.$(dom).outerHtml();
    },
    factory: function (compoName) {
        var params_ = _Array_slice.call(arguments, 1), factory = params_.pop(), mode = 'both';
        if (params_.length !== 0) {
            var x = params_[0];
            if (x === 'client' || x === 'server') {
                mode = x;
            }
        }
        if ((mode === 'client' && is_NODE) || (mode === 'server' && is_DOM)) {
            customTag_register(compoName, {
                meta: { mode: mode }
            });
            return;
        }
        factory(_global, Component.config.getDOMLibrary(), function (compo) {
            customTag_register(compoName, compo);
        });
    },
    injectable: Di.deco.injectableClass,
    deco: {
        slot: Component.deco.slot,
        slotPrivate: Component.deco.slotPrivate,
        pipe: Component.deco.pipe,
        event: Component.deco.event,
        hotkey: Component.deco.hotkey,
        attr: Component.deco.attr,
        refCompo: Component.deco.refCompo,
        refElement: Component.deco.refElement,
        refQuery: Component.deco.refQuery,
        inject: Di.deco.injectableClass,
    },
    templates: Templates,
    /* from binding */
    Validators: Validators,
    registerValidator: registerValidator,
    BindingProviders: BindingProviders,
    registerBinding: registerBinding,
    Compo: Compo,
    Component: Component,
    jmask: jMask,
    version: '0.71.79',
    $: domLib,
    j: jMask
};
//> make fast properties
custom_optimize();

import { renderer_render } from '@core/renderer/exports';
import { DomB } from '@mask-node/html-dom/DomB';
import { class_Dfr } from '@utils/class/Dfr';
import { HtmlDom } from '@mask-node/html-dom/exports';
import { builder_Ctx } from '@core/builder/exports';
export function rendererB_toHtml(dom, model, ctx, ctr) {
    return ctx == null || (ctx._rewrite == null && ctx._redirect == null)
        ? HtmlDom.stringify(dom, model, ctx, ctr)
        : '';
}
;
export function rendererB_build(tmpl, model, ctx, el, ctr) {
    var _ctr = ensureCtr(ctr), _ctx = ensureCtx(ctx), dom = renderer_render(tmpl, model, _ctx, el, _ctr);
    return {
        ctx: _ctx,
        model: model,
        component: _ctx,
        element: dom
    };
}
;
export function rendererB_buildAsync(tmpl, model, ctx, el, ctr) {
    var _ctr = ensureCtr(ctr), _ctx = ensureCtx(ctx), dfr = new class_Dfr, dom = renderer_render(tmpl, model, _ctx, el, _ctr);
    if (_ctx.async === true) {
        _ctx.done(resolve);
    }
    else {
        resolve();
    }
    function resolve() {
        dfr.resolve({
            ctx: _ctx,
            model: model,
            component: _ctx,
            element: dom
        });
    }
    return dfr;
}
;
export function rendererB_render(tmpl, model, ctx, el, ctr) {
    var _ctr = ensureCtr(ctr), _ctx = ensureCtx(ctx), dom = renderer_render(tmpl, model, _ctx, el, _ctr);
    return rendererB_toHtml(dom, model, _ctx, _ctr);
}
;
export function rendererB_renderAsync(tmpl, model, ctx, el, ctr) {
    return this
        .renderHtmlDomAsync(tmpl, model, ctx, el, ctr)
        .then(rendererB_toHtml);
}
;
export function rendererB_renderHtmlDomAsync(tmpl, model, ctx, el, ctr) {
    var _ctr = ensureCtr(ctr), _ctx = ensureCtx(ctx), dfr = new class_Dfr, dom = renderer_render(tmpl, model, _ctx, el, _ctr);
    if (_ctx.async === true) {
        _ctx.done(resolve);
    }
    else {
        resolve();
    }
    function resolve() {
        dfr.resolve(dom, model, _ctx, _ctr);
    }
    return dfr;
}
;
function ensureCtr(ctr) {
    return ctr == null
        ? new DomB.Component
        : ctr;
}
function ensureCtx(ctx) {
    return ctx == null || ctx.constructor !== builder_Ctx
        ? new builder_Ctx(ctx)
        : ctx;
}

import { class_Dfr } from '@utils/class/Dfr';
import { custom_Tags } from '@core/custom/exports';
import { class_create } from '@utils/class';
import { mask_TreeWalker } from '@core/feature/TreeWalker';
import { Module } from '@core/feature/modules/exports';
import { __cfg } from '@core/api/config';
export function _scripts_handleSync(ast, model, ctx) {
    var scripts = _getExternalServerScripts(ast, model, ctx);
    scripts.forEach(function (x) {
        return x.preloadSync();
    });
    return ast;
}
;
export function _scripts_handleAsync(ast, model, ctx) {
    var scripts = _getExternalServerScripts(ast, model, ctx);
    var dfrs = scripts.map(function (x) {
        return x.preloadAsync();
    });
    var error = null;
    var wait = dfrs.length;
    var dfr = new class_Dfr;
    if (wait === 0) {
        return dfr.resolve(ast);
    }
    dfrs.forEach(function (x) {
        x.then(ok, fail);
    });
    function ok() {
        if (--wait === 0 && error == null) {
            dfr.resolve(ast);
        }
    }
    function fail(err) {
        if (error == null) {
            dfr.reject(error = err);
        }
    }
    return dfr;
}
;
var ScriptTag = custom_Tags['script'];
custom_Tags['script'] = class_create(ScriptTag, {
    render: function (model, ctx, el) {
        if (ScriptNode.isBrowser(this)) {
            // this.attr.export = null;
            // this.attr.isomorph = null;
            ScriptTag.prototype.render.call(this, model, ctx, el);
        }
        if (ScriptNode.isServer(this)) {
            var node = ScriptNode.get(this);
            node.eval(ctx, el);
        }
    }
});
function _getExternalServerScripts(ast, model, ctx) {
    var arr = [];
    mask_TreeWalker.walk(ast, function (node) {
        if (node.tagName !== 'script') {
            return;
        }
        if (ScriptNode.isServer(node) === false || ScriptNode.isExternal(node) === false) {
            return;
        }
        arr.push(ScriptNode.get(node, model, ctx));
        delete node.attr.export;
        delete node.attr.isomorph;
        if (ScriptNode.isServerOnly(node)) {
            return { remove: true };
        }
    });
    return arr;
}
var ScriptNode = /** @class */ (function () {
    function ScriptNode(path, exportName) {
        this.path = path;
        this.exportName = exportName;
        this.state = 0;
        this.fn = null;
    }
    ScriptNode.prototype.eval = function (ctx, el) {
        var origExports = {};
        var module = {
            exports: (origExports = {})
        };
        this.fn.call(el, global, el.ownerDocument, module, module.exports);
        if (this.exportName) {
            global[this.exportName] = module.exports;
        }
    };
    ScriptNode.prototype.preloadAsync = function () {
        var self = this;
        return __cfg.getFile(this.path).then(function (content) {
            self.fn = new Function('window', 'document', 'module', 'exports', content);
        });
    };
    ScriptNode.prototype.preloadSync = function () {
        var self = this;
        return __cfg.getFile(this.path).then(function (content) {
            self.fn = new Function('window', 'document', 'module', 'exports', content);
        });
    };
    ScriptNode.isServer = function (node) {
        return Boolean(node.attr.isomorph || node.attr.server);
    };
    ;
    ScriptNode.isServerOnly = function (node) {
        return Boolean(node.attr.server);
    };
    ;
    ScriptNode.isBrowser = function (node) {
        return Boolean(node.attr.isomorph || !node.attr.server);
    };
    ;
    ScriptNode.isExternal = function (node) {
        return Boolean(node.attr.src);
    };
    ;
    ScriptNode.get = function (node, model, ctx) {
        var src = node.attr.src;
        var endpoint = { path: src };
        var path = Module.resolvePath(endpoint, model, ctx, null, true);
        var export_ = node.attr.export;
        return _scripts[path] || (_scripts[path] = new ScriptNode(path, export_));
    };
    ;
    return ScriptNode;
}());
;
var _scripts = {};

import { mask_TreeWalker } from '@core/feature/TreeWalker';
import { parser_parse } from '@core/parser/exports';
import { DomB } from '@mask-node/html-dom/DomB';
import { jMask } from '@mask-j/jMask';
export function _transformMaskAutoTemplates(ast) {
    return mask_TreeWalker.walk(ast, function (node) {
        if (node.tagName !== 'script') {
            return;
        }
        if (node.attr.type !== 'text/mask') {
            return;
        }
        if (node.attr['data-run'] !== 'auto') {
            return;
        }
        var fragment = new DomB.Fragment;
        fragment.parent = node.parent;
        var x = node.nodes[0];
        var template = x.content;
        fragment.nodes = parser_parse(template);
        return { replace: fragment };
    });
}
export function _transformAddingMaskBootstrap(ast, path) {
    var wasAdded = false;
    mask_TreeWalker.walk(ast, function (node) {
        if (node.tagName === 'body') {
            wasAdded = true;
            append(node, path);
            return { deep: false };
        }
        if (node.tagName !== 'html') {
            return { deep: false };
        }
    });
    if (!wasAdded) {
        append(ast, path);
    }
    function append(node, path) {
        var script = new DomB.Node;
        script.tagName = 'script';
        script.attr = {
            type: 'text/javascript',
            src: path || '/node_modules/maskjs/lib/mask.bootstrap.js'
        };
        jMask(node).append(script);
        jMask(node).append('<script>mask.Compo.bootstrap()</script>');
    }
}

import { _scripts_handleSync, _scripts_handleAsync } from './scripts';
import { _transformMaskAutoTemplates, _transformAddingMaskBootstrap } from './transform';
import { rendererB_render, rendererB_renderHtmlDomAsync, rendererB_toHtml } from '@mask-node/renderer/exports';
export var HtmlPage = {
    render: function (tmpl, model, ctx) {
        var ast;
        ast = _scripts_handleSync(tmpl, model, ctx);
        ast = _transformMaskAutoTemplates(ast);
        return rendererB_render(ast, model, ctx);
    },
    renderAsync: function (tmpl, model, ctx) {
        return _scripts_handleAsync(tmpl, model, ctx)
            .then(function (ast) {
            var ast2 = _transformMaskAutoTemplates(ast);
            if (ctx && ctx.config && ctx.config.shouldAppendBootstrap) {
                _transformAddingMaskBootstrap(ast2, ctx.config.maskBootstrapPath);
            }
            return rendererB_renderHtmlDomAsync(ast2, model, ctx)
                .then(function (dom, model, ctx, compo) {
                return rendererB_toHtml(dom, model, ctx, compo);
            });
        });
    },
};

import { __cfg } from '@core/api/config';
import { class_Dfr } from '@utils/class/Dfr';
import { path_resolveCurrent, path_isRelative, path_combine, path_toLocalFile } from '@core/util/path';
__cfg.getFile = function (path) {
    var dfr = new class_Dfr;
    var fs = require('fs');
    var filename = path_toLocalFile(resolvePath(path));
    fs.readFile(filename, 'utf8', function (error, str) {
        if (error != null) {
            dfr.reject({
                message: error.toString(),
                status: error.code
            });
            return;
        }
        dfr.resolve(str);
    });
    return dfr;
};
__cfg.getScript = function (path) {
    var dfr = new class_Dfr;
    var filename = path_toLocalFile(resolvePath(path));
    try {
        var x = require(filename);
        dfr.resolve(x);
    }
    catch (error) {
        dfr.reject(error);
    }
    return dfr;
};
var base_ = path_toLocalFile(path_resolveCurrent());
function resolvePath(path) {
    if (path_isRelative(path)) {
        return path_combine(base_, path);
    }
    return path;
}

import { mode_CLIENT } from '@mask-node/const';
var EmptyHandler = /** @class */ (function () {
    function EmptyHandler(attrName, attrValue) {
        this.meta = {
            mode: mode_CLIENT
        };
    }
    EmptyHandler.prototype.render = function () { };
    return EmptyHandler;
}());
;
export var mock_TagHandler = {
    create: function (tagName, Compo, mode) {
        if (mode === mode_CLIENT) {
            return EmptyHandler;
        }
        var Proto = Compo.prototype;
        if (Proto.mode === mode_CLIENT) {
            /* obsolete, use meta object*/
            return EmptyHandler;
        }
        var meta = Compo.prototype.meta;
        if (meta == null) {
            meta = Compo.prototype.meta = {};
        }
        if (meta.mode === mode_CLIENT) {
            return EmptyHandler;
        }
        meta.mode = mode;
        return Compo;
    },
};

import { Meta } from '@mask-node/helper/Meta';
var Attr = /** @class */ (function () {
    function Attr(attrName, attrValue, ID) {
        this.meta = {
            ID: ID,
            name: attrName,
            value: attrValue
        };
    }
    Attr.prototype.toString = function () {
        var json = this.meta, info = {
            type: 'a',
            single: true
        };
        return Meta.stringify(json, info);
    };
    return Attr;
}());
;
export var mock_AttrHandler = {
    create: function (attrName, fn, mode) {
        return function (node, value, model, cntx, tag, controller, container) {
            if (mode !== 'server') {
                container.insertBefore(new Attr(attrName, value, ++cntx._id), tag);
            }
            if (mode !== 'client') {
                return fn(node, value, model, cntx, tag, controller);
            }
            return '';
        };
    }
};

import { HtmlDom } from '@mask-node/html-dom/exports';
import { is_Function } from '@utils/is';
import { log_error } from '@core/util/reporters';
export var mock_UtilHandler = {
    create: utilFunction
};
function utilFunction(name, mix, mode) {
    if (mode === 'server')
        return mix;
    // partial | client
    return function (val, model, ctx, el, ctr, attrName, type) {
        var node = new HtmlDom.UtilNode(type, name, val, attrName /*, ++ctx._id */);
        if (type === 'attr') {
            el
                .parentNode
                .insertBefore(node, el);
        }
        if (mode === 'partial') {
            var fn = util_FNS[type], current;
            if (is_Function(mix[fn]) === false) {
                log_error('Utils partial function is not defined', fn);
                return '';
            }
            current = mix[fn](val, model, ctx, el, ctr);
            if (type === 'node') {
                node.appendChild(mix.element);
                return node;
            }
            //> attr
            return node.meta.current = current;
        }
        /* client-only */
        if (type === 'node')
            return node;
        //> attr
        return '';
    };
}
var util_FNS = {
    node: 'nodeRenderStart',
    attr: 'attrRenderStart'
};

import { mock_TagHandler } from './tag-handler';
import { Mask } from '@core/mask';
import { custom_Attributes, custom_Tags_defs, custom_Tags } from '@core/custom/exports';
import { mock_AttrHandler } from './attr-handler';
import { is_Object } from '@utils/is';
import { mock_UtilHandler } from './util-handler';
import { obj_extend } from '@utils/obj';
import { meta_getVal } from '@mask-node/util/meta';
import { mode_CLIENT } from '@mask-node/const';
var orig_registerUtil = Mask.registerUtil;
Mask.registerAttrHandler = function (attrName, mix, fn) {
    if (fn == null) {
        custom_Attributes[attrName] = mix;
        return;
    }
    // obsolete - change args in all callers
    if (typeof fn === 'string') {
        var swap = mix;
        mix = fn;
        fn = swap;
    }
    custom_Attributes[attrName] = mock_AttrHandler.create(attrName, fn, mix);
};
Mask.registerUtil = function (name, mix, mode) {
    if (mode == null && is_Object(mix))
        mode = mix.mode;
    orig_registerUtil(name, mode == null
        ? mix
        : mock_UtilHandler.create(name, mix, mode));
};
// backward support
var _Mask = Mask;
_Mask.registerUtility = Mask.registerUtil;
Mask.registerHandler = function (tagName, compo) {
    if (compo != null && typeof compo === 'object') {
        //> static
        compo.__Ctor = wrapStatic(compo);
    }
    if (custom_Tags_defs.hasOwnProperty(tagName))
        obj_extend(compo.prototype, custom_Tags_defs[tagName]);
    var proto = typeof compo === 'function'
        ? compo.prototype
        : compo;
    if (proto.meta == null)
        proto.meta = proto.$meta || {};
    /* obsolete meta copy */
    if (proto.cache)
        proto.meta.cache = proto.cache;
    if (proto.mode)
        proto.meta.mode = proto.mode;
    if (meta_getVal(compo, 'mode') === mode_CLIENT) {
        custom_Tags[tagName] = mock_TagHandler.create(tagName, compo, 'client');
        return;
    }
    custom_Tags[tagName] = compo;
};
_Mask.compoDefinitions = function (compos, utils, attributes) {
    var tags = custom_Tags, defs = custom_Tags_defs;
    for (var tagName in compos) {
        defs[tagName] = compos[tagName];
        if (tags[tagName] !== void 0) {
            obj_extend(tags[tagName].prototype, compos[tagName]);
            continue;
        }
        tags[tagName] = mock_TagHandler.create(tagName, null, 'client');
    }
    var doNothing = function () { };
    for (var key in utils) {
        if (utils[key].mode === 'client') {
            Mask.registerUtil(key, doNothing, 'client');
        }
    }
    for (var key in attributes) {
        if (attributes[key].mode === 'client') {
            Mask.registerAttrHandler(key, doNothing, 'client');
        }
    }
};
function wrapStatic(proto, parent) {
    function Ctor(node) {
        this.tagName = node.tagName;
        this.compoName = node.tagName;
        this.attr = node.attr;
        this.expression = node.expression;
        this.nodes = node.nodes;
        this.nextSibling = node.nextSibling;
        this.parent = parent;
        this.components = null;
    }
    Ctor.prototype = proto;
    return Ctor;
}

import { is_Array } from '@utils/is';
import { custom_Tags } from '@core/custom/exports';
export function node_getType(node) {
    var type = node.type;
    if (type == null) {
        // in case if node was added manually, but type was not set
        if (is_Array(node)) {
            type = 10;
        }
        else if (node.tagName != null) {
            type = 1;
        }
        else if (node.content != null) {
            type = 2;
        }
    }
    if (type === 1 && custom_Tags[node.tagName] != null) {
        // check if the tag name was overriden
        type = 4;
    }
    return type;
}
;

import { BuilderData } from '@core/builder/exports';
import { build_nodeFactory } from '@core/builder/delegate/build_node';
import { build_manyFactory } from '@core/builder/delegate/build_many';
import { build_compoFactory } from './build_component';
import { build_textFactory } from '@core/builder/delegate/build_textNode';
import { node_getType } from '@mask-node/util/node';
import { custom_Statements, custom_Tags } from '@core/custom/exports';
import { log_error } from '@core/util/reporters';
import { mode_CLIENT } from '@mask-node/const';
import { mock_TagHandler } from '@mask-node/mock/tag-handler';
import { DomB } from '@mask-node/html-dom/DomB';
import { arr_pushMany } from '@utils/arr';
import { is_ArrayLike } from '@utils/is';
export function builder_buildFactory(config) {
    if (config === null || config === void 0 ? void 0 : config.document) {
        BuilderData.document = config.document;
    }
    var build_node = build_nodeFactory(config);
    var build_many = build_manyFactory(build);
    var build_compo = build_compoFactory(build, config);
    var build_text = build_textFactory(config);
    var document = BuilderData.document;
    function build(node, model, ctx, container, ctr, children) {
        if (node == null) {
            return container;
        }
        if (ctx._redirect != null || ctx._rewrite != null) {
            return container;
        }
        var type = node_getType(node), element, elements, j, jmax, key, value;
        // Dom.SET
        if (type === 10) {
            var imax = node.length;
            for (var i = 0; i < imax; i++) {
                build(node[i], model, ctx, container, ctr, children);
            }
            return container;
        }
        var tagName = node.tagName;
        if (tagName === 'else')
            return container;
        // Dom.STATEMENT
        if (type === 15) {
            var Handler = custom_Statements[tagName];
            if (Handler == null) {
                if (custom_Tags[tagName] != null) {
                    // Dom.COMPONENT
                    type = 4;
                }
                else {
                    log_error('<mask: statement is undefined', tagName);
                    return container;
                }
            }
            if (type === 15) {
                Handler.render(node, model, ctx, container, ctr, children);
                return container;
            }
        }
        // Dom.NODE
        if (type === 1) {
            if (tagName.charCodeAt(0) === 58) {
                // :
                type = 4;
                node.mode = mode_CLIENT;
                node.controller = mock_TagHandler.create(tagName, null, mode_CLIENT);
            }
            else {
                container = build_node(node, model, ctx, container, ctr, children);
                children = null;
            }
        }
        // Dom.TEXTNODE
        if (type === 2) {
            build_text(node, model, ctx, container, ctr);
            return container;
        }
        // Dom.COMPONENT
        if (type === 4) {
            element = document.createComponent(node, model, ctx, container, ctr);
            container.appendChild(element);
            //- container = element;
            var compo = build_compo(node, model, ctx, container, ctr, element);
            if (compo != null) {
                element.setComponent(compo, model, ctx);
                if (compo.async) {
                    return container;
                }
                if (compo.render) {
                    return container;
                }
                if (compo.model && compo.model !== model) {
                    model = compo.model;
                }
                ctr = compo;
                node = compo;
                // collect childElements for the component
                elements = [];
            }
            container = element;
        }
        buildChildNodes(node, model, ctx, container, ctr, elements);
        if (container.nodeType === DomB.COMPONENT) {
            var fn = ctr.onRenderEndServer;
            if (fn != null && ctr.async !== true) {
                fn.call(ctr, elements, model, ctx, container, ctr);
            }
        }
        arr_pushMany(children, elements);
        return container;
    }
    ;
    function buildChildNodes(node, model, ctx, container, ctr, els) {
        var nodes = node.nodes;
        if (nodes == null)
            return;
        if (is_ArrayLike(nodes) === false) {
            build(nodes, model, ctx, container, ctr, els);
            return;
        }
        build_many(nodes, model, ctx, container, ctr, els);
    }
    ;
    return build;
}
;

import { builder_buildFactory } from './builder_buildFactory';
export function builder_buildDelegate(opts) {
    return builder_buildFactory(opts);
}
;

import { builder_buildDelegate } from '@core/builder/delegate/exports';
import { HtmlDom } from '@mask-node/html-dom/exports';
export var builder_build = builder_buildDelegate({
    document: HtmlDom.document,
    create: function (name, doc) {
        return doc.createElement(name);
    }
});

import { custom_Tags } from '@core/custom/exports';
import { class_create } from '@utils/class';
import { mode_SERVER } from '@mask-node/const';
import { HtmlDom } from '@mask-node/html-dom/exports';
import { DomB } from '@mask-node/html-dom/DomB';
import { builder_build } from '@mask-node/builder/dom/build';
custom_Tags[':document'] = class_create({
    isDocument: true,
    meta: {
        mode: mode_SERVER
    },
    render: function (model, ctx, fragment, ctr) {
        var attr = this.attr, nodes = this.nodes, doctype = 'html', head, body, handleBody;
        if (attr.doctype) {
            doctype = attr.doctype;
            attr.doctype = null;
        }
        fragment.appendChild(new HtmlDom.DOCTYPE('<!DOCTYPE ' + doctype + '>'));
        var html = {
            tagName: 'html',
            type: DomB.NODE,
            attr: attr,
            nodes: [],
        };
        if (nodes != null) {
            var imax = nodes.length, i = -1, x;
            while (++i < imax) {
                x = nodes[i];
                if (x.tagName === 'head') {
                    head = x;
                    continue;
                }
                if (x.tagName === 'body') {
                    body = x;
                    continue;
                }
                handleBody = true;
            }
        }
        if (body == null) {
            body = {
                nodeType: DomB.NODE,
                tagName: 'body',
                nodes: []
            };
        }
        head != null && html.nodes.push(head);
        body != null && html.nodes.push(body);
        if (handleBody) {
            var imax = nodes.length, i = 0, x;
            for (; i < imax; i++) {
                x = nodes[i];
                if ('head' === x.tagName)
                    continue;
                if ('body' === x.tagName)
                    continue;
                body.nodes.push(x);
            }
        }
        var owner = this.parent;
        owner.components = [];
        builder_build(html, model, ctx, fragment, owner);
        return fragment;
    }
});

import { Mask } from '@core/mask';
import { obj_extend } from '@utils/obj';
import { rendererB_toHtml, rendererB_render, rendererB_renderAsync, rendererB_renderHtmlDomAsync, rendererB_build, rendererB_buildAsync } from './renderer/exports';
import { HtmlPage } from './html-page/exports';
import './util/loaders';
import './mock/mock';
import './handlers/document';
obj_extend(Mask, {
    toHtml: rendererB_toHtml,
    render: rendererB_render,
    renderAsync: rendererB_renderAsync,
    renderHtmlDomAsync: rendererB_renderHtmlDomAsync,
    renderPage: HtmlPage.render,
    renderPageAsync: HtmlPage.renderAsync,
    build: rendererB_build,
    buildAsync: rendererB_buildAsync,
});


    return (exports.mask = Mask);
}));