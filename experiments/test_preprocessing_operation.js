var sha256 = require("sha256");

/* exported getCanonicalizedURL*/
/* exported getLookupExpressions*/

/** Part I isRegExp from lodash lib */

/** `Object#toString` result references. */
var regexpTag = '[object RegExp]';

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsRegExp = nodeUtil && nodeUtil.isRegExp;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * The base implementation of `_.isRegExp` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
 */
function baseIsRegExp(value) {
  return isObject(value) && objectToString.call(value) == regexpTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
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
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is classified as a `RegExp` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
 * @example
 *
 * _.isRegExp(/abc/);
 * // => true
 *
 * _.isRegExp('/abc/');
 * // => false
 */
var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

/** Part II stringcursor */

function isPatternMatch(str, pattern) {
    return isRegExp(pattern) ? pattern.test(str) : pattern === str;
}
  
function patternMatchIndexOf(str, pattern, start) {
    var offset = start;
    while (!isPatternMatch(str.charAt(offset), pattern) &&
            offset < str.length) {
        offset++;
    }
    return offset;
}
  
class StringCursor {
    constructor(str) {
      this._str = str;
      this._offset = 0;
    }
  
    remaining() {
      return this._str.length - this._offset;
    }
  
    clear() {
      this._offset = 0;
    }
  
    peek(length) {
      return this._str.slice(this._offset, this._offset + length);
    }
  
    skip(length) {
      this._offset = Math.min(this._offset + length, this._str.length);
    }
  
    chomp(length) {
      var slice = this._str.slice(this._offset, this._offset + length);
      this._offset = Math.min(this._offset + length, this._str.length);
      return slice;
    }
  
    chompWhile(pattern) {
      var lastFoundOffset = this._offset;
      while (isPatternMatch(this._str.charAt(lastFoundOffset), pattern) &&
             lastFoundOffset < this._str.length) {
        lastFoundOffset++;
      }
  
      var slice = this._str.slice(this._offset, lastFoundOffset);
      this._offset = lastFoundOffset;
      return slice;
    }
  
    chompUntil(pattern) {
      var foundOffset = patternMatchIndexOf(this._str, pattern, this._offset);
      var slice = this._str.slice(this._offset, foundOffset);
      this._offset = foundOffset + 1;
      return slice;
    }
  
    chompUntilBefore(pattern) {
      var foundOffset = patternMatchIndexOf(this._str, pattern, this._offset);
      var slice = this._str.slice(this._offset, foundOffset);
      this._offset = foundOffset;
      return slice;
    }
  
    chompUntilIfExists(pattern) {
      var foundOffset = patternMatchIndexOf(this._str, pattern, this._offset);
      if (foundOffset === this._str.length) {
        return null;
      }
  
      var slice = this._str.slice(this._offset, foundOffset);
      this._offset = foundOffset + 1;
      return slice;
    }
  
    chompRemaining() {
      var slice = this._str.slice(this._offset);
      this._offset = this._str.length;
      return slice;
    }
  
    divideRemaining(length) {
      var slices = [];
      while (this.remaining()) {
        slices.push(this.chomp(length));
      }
      return slices;
    }
}
  
/** Part III Canonicalize URLs */

var PERCENT_ESCAPE = /%([A-Fa-f0-9]{2})/g;
var ESCAPED_CHARCODES = [35, 37];

function hasPercentEscape(url) {
  return PERCENT_ESCAPE.test(url);
}

function getDecodedURI(uri) {
  return uri.replace(PERCENT_ESCAPE, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  });
}

function getEncodedCharCode(charCode) {
  var hex = charCode.toString(16);
  return hex.length < 2 ? '%0' + hex : '%' + hex;
}

function getEncodedURI(uri) {
  var encodedURI = '';
  for (var i = 0; i < uri.length; i++) {
    var code = uri.charCodeAt(i);
    if (code <= 32 || code >= 127 || ESCAPED_CHARCODES.indexOf(code) !== -1) {
      encodedURI += getEncodedCharCode(code);
    } else {
      encodedURI += uri.charAt(i);
    }
  }
  return encodedURI;
}

function getEntirelyDecodedURI(uri) {
  while(hasPercentEscape(uri)) {
    uri = getDecodedURI(uri);
  }
  return uri;
}

function getCanonicalizedHostname(hostname) {
  return getEncodedURI(
    getEntirelyDecodedURI(hostname.toLowerCase())
      .replace(/^\.+/, '')
      .replace(/\.+$/, '')
      .replace(/\.+/, '.')
  );
}

function getCanonicalizedPathname(pathname) {
  return getEncodedURI(
    getEntirelyDecodedURI('/' + pathname)
      .replace('/./', '/')
      .replace(/[^\/]+\/\.\./, '')
      .replace(/\/+/, '/')
  );
}

function getCanonicalizedURL(url) {
  url = url.trim();
  url = url.replace(/[\t\r\n]/g, '');
  
  var cursor = new StringCursor(url);
  var protocol = cursor.chompUntilIfExists(':') || 'http';
  cursor.chompWhile('/');
  var host = cursor.chompUntil('/').split(':');
  var hostname = host[0];
  var port = host[1] || null;

  var localCursor = new StringCursor(cursor.chompRemaining());
  var pathCursor = new StringCursor(localCursor.chompUntil('#'));
  var pathname = pathCursor.chompUntil('#');
  var search = pathCursor.chompRemaining();

  var f = {
    protocol: protocol,
    hostname: getCanonicalizedHostname(hostname),
    port: port,
    pathname: getCanonicalizedPathname(pathname),
    search: search
  };

  return (
    `${f.protocol}://${f.hostname}${f.port ? ':'+f.port:''}`+
    `${f.pathname}${search ? '?'+search:''}`
  );
}

/** Part IV prefix suffix -ify URL */

var HOSTNAME_IP_PATTERN = /\d+\.\d+\.\d+\.\d+/;
var HOSTNAME_SEPARATOR = '.';
var MAX_HOSTNAME_SEGMENTS = 5;

var PATH_SEPARATOR = '/';
var MAX_PATH_SEGMENTS = 4;

function getHostnameExpressions(hostname) {
  if (HOSTNAME_IP_PATTERN.test(hostname)) {
    return [hostname];
  }

  var baseExpression = hostname
    .split(HOSTNAME_SEPARATOR)
    .reverse()
    .slice(0, MAX_HOSTNAME_SEGMENTS)
    .reverse();

  var numExpressions = Math.min(MAX_HOSTNAME_SEGMENTS, baseExpression.length) - 1;
  var expressions = [];

  for (var i = 0; i < numExpressions; i++) {
    expressions.push(baseExpression.slice(i).join('.'));
  }

  return expressions;
}

function getPathExpressions(pathname, search) {
  var baseExpression = pathname
    .split(PATH_SEPARATOR)
    .slice(0, MAX_PATH_SEGMENTS);
  var numExpressions = Math.min(MAX_PATH_SEGMENTS, baseExpression.length) - 1;
  var expressions = [
    pathname + search,
    pathname
  ];

  for (var i = 0; i < numExpressions; i++) {
    expressions.push(baseExpression.slice(0, i).join('/'));
  }

  return expressions;
}

function getLookupExpressions(canonicalized) {
  var cursor = new StringCursor(canonicalized);

  // Drop the scheme.
  cursor.chompUntil(':');
  cursor.skip(2);

  var hostname = cursor.chompUntil('/');
  var pathname = cursor.chompUntil('?');
  var search = cursor.chompRemaining();

  var hostnames = getHostnameExpressions(hostname);
  var paths = getPathExpressions(pathname, search && '?' + search);

  subdomains = hostnames.map((hostname) => hostname + '/');
  return subdomains.concat(hostnames.reduce(function(exprs, hostname) {
    return exprs.concat(paths.map((path) => hostname + '/' + path));
  }, [])).filter( onlyUnique );
}

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

var digest = (() => {

    let strxor = (str, mask) => {

        let strbuf = new Uint8Array(new TextEncoder('utf-8').encode(str));
        let maskbuf = new Uint8Array(new TextEncoder('utf-8').encode(mask));

        for (let i = 0; i < strbuf.length; i++) {

            strbuf[i] = strbuf[i] ^ maskbuf[i % maskbuf.length];

        }

        return new TextDecoder('utf-8').decode(strbuf);
    };


    let sha256 = (msg) => {

        let msgBuffer = new TextEncoder('utf-8').encode(msg);
        return subtle.digest("SHA-256", msgBuffer).then(function (hash) {
            return hash;
        });

    };

    //This may need optimize ***
    let buf2hex = (buf) => {
        let dataView = new Uint8Array(buf);
        return Array.from(dataView).map(b => ('00' + b.toString(16)).slice(-2)).join('');
    };

    let str2uint = (msg) => {

        return sha256(msg).then(hashBuf => {

            let firArrUint = new Uint32Array(hashBuf);
            return firArrUint[0];

        })

    }

    return {
        sha256: sha256,
        buf2hex: buf2hex,
        str2uint: str2uint,
        strxor: strxor
    }

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = digest;
}
if (typeof define === "function") {
    define([], function () {
        return digest;
    });
}

var url = "http://www.matrix67.com/blog/archives/4534";
console.time("URLpreprocess");
let arrUrls = getLookupExpressions(getCanonicalizedURL(url));
console.timeEnd("URLpreprocess");
console.log(arrUrls);

console.time("hash");
let prefix = sha256(arrUrls[0]);
console.timeEnd("hash");
