
// source ../../mask/src/umd-head.js
(function (root, factory) {
    'use strict';
    
    var _global, _exports, _document;

    
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' || window.document == null ? global : window;
	}
    
    _document = _global.document;
	_exports = root || _global;
    

    function construct(plugins){

        if (plugins == null) {
            plugins = {};
        }
        var lib = factory(_global, plugins, _document),
            key;

        for (key in plugins) {
            lib[key] = plugins[key];
        }

        return lib;
    };

    
    if (typeof module !== 'undefined') {
        module.exports = construct();
        return;
    }
    if (typeof define === 'function' && define.amd) {
        define(construct);
        return;
    }
    
    var plugins = {},
        lib = construct(plugins);

    _exports.mask = lib;

    for (var key in plugins) {
        _exports[key] = plugins[key];
    }

    

}(this, function (global, exports, document) {
    'use strict';




	// source ../../mask/src/scope-vars.js
	var regexpWhitespace = /\s/g,
		regexpEscapedChar = {
			"'": /\\'/g,
			'"': /\\"/g,
			'{': /\\\{/g,
			'>': /\\>/g,
			';': /\\>/g
		},
		hasOwnProp = {}.hasOwnProperty,
		listeners = null;
	
	// source ../../mask/src/util/util.js
	function util_extend(target, source) {
	
		if (target == null) {
			target = {};
		}
		for (var key in source) {
			// if !SAFE
			if (hasOwnProp.call(source, key) === false) {
				continue;
			}
			// endif
			target[key] = source[key];
		}
		return target;
	}
	
	function util_getProperty(o, chain) {
		if (chain === '.') {
			return o;
		}
	
		var value = o,
			props = chain.split('.'),
			i = -1,
			length = props.length;
	
		while (value != null && ++i < length) {
			value = value[props[i]];
		}
	
		return value;
	}
	
	/**
	 * - arr (Array) - array that was prepaired by parser -
	 *  every even index holds interpolate value that was in #{some value}
	 * - model: current model
	 * - type (String const) (node | attr): tell custom utils what part we are
	 *  interpolating
	 * - cntx (Object): current render context object
	 * - element (HTMLElement):
	 * type node - this is a container
	 * type attr - this is element itself
	 * - name
	 *  type attr - attribute name
	 *  type node - undefined
	 *
	 * -returns Array | String
	 *
	 * If we rendere interpolation in a TextNode, then custom util can return not only string values,
	 * but also any HTMLElement, then TextNode will be splitted and HTMLElements will be inserted within.
	 * So in that case we return array where we hold strings and that HTMLElements.
	 *
	 * If custom utils returns only strings, then String will be returned by this function
	 *
	 */
	
	function util_interpolate(arr, type, model, cntx, element, controller, name) {
		var length = arr.length,
			i = 0,
			array = null,
			string = '',
			even = true,
			utility, value, index, key;
	
		for (; i < length; i++) {
			if (even === true) {
				if (array == null){
					string += arr[i];
				} else{
					array.push(arr[i]);
				}
			} else {
				key = arr[i];
				value = null;
				index = key.indexOf(':');
	
				if (index === -1) {
					value = util_getProperty(model, key);
				} else {
					utility = index > 0 ? key.substring(0, index).replace(regexpWhitespace, '') : '';
					if (utility === '') {
						utility = 'expression';
					}
	
					key = key.substring(index + 1);
					if (typeof custom_Utils[utility] === 'function'){
						value = custom_Utils[utility](key, model, cntx, element, controller, name, type);
					}
				}
	
				if (value != null){
	
					if (typeof value === 'object' && array == null){
						array = [string];
					}
	
					if (array == null){
						string += value;
					} else {
						array.push(value);
					}
	
				}
			}
	
			even = !even;
		}
	
		return array == null ? string : array;
	}
	
	// source ../../mask/src/util/string.js
	function Template(template) {
		this.template = template;
		this.index = 0;
		this.length = template.length;
	}
	
	Template.prototype = {
		skipWhitespace: function () {
	
			var template = this.template,
				index = this.index,
				length = this.length;
	
			for (; index < length; index++) {
				if (template.charCodeAt(index) > 32 /*' '*/) {
					break;
				}
			}
	
			this.index = index;
	
			return this;
		},
	
		skipToAttributeBreak: function () {
	
			var template = this.template,
				index = this.index,
				length = this.length,
				c;
			do {
				c = template.charCodeAt(++index);
				// if c == # && next() == { - continue */
				if (c === 35 && template.charCodeAt(index + 1) === 123) {
					// goto end of template declaration
					this.index = index;
					this.sliceToChar('}');
					this.index++;
					return;
				}
			}
			while (c !== 46 && c !== 35 && c !== 62 && c !== 123 && c !== 32 && c !== 59 && index < length);
			//while(!== ".#>{ ;");
	
			this.index = index;
		},
		sliceToChar: function (c) {
			var template = this.template,
				index = this.index,
				start = index,
				isEscaped = false,
				value, nindex;
	
			while ((nindex = template.indexOf(c, index)) > -1) {
				index = nindex;
				if (template.charCodeAt(index - 1) !== 92 /*'\\'*/) {
					break;
				}
				isEscaped = true;
				index++;
			}
	
			value = template.substring(start, index);
	
			this.index = index;
	
			return isEscaped ? value.replace(regexpEscapedChar[c], c) : value;
		}
	
	};
	
	// source ../../mask/src/util/condition.js
	/**
	 *	ConditionUtil
	 *
	 *	Helper to work with conditional expressions
	 **/
	
	var ConditionUtil = (function() {
	
		function parseDirective(T, currentChar) {
			var c = currentChar,
				start = T.index,
				token;
	
			if (c == null) {
				T.skipWhitespace();
				start = T.index;
				currentChar = c = T.template.charCodeAt(T.index);
			}
	
			if (c === 34 /*"*/ || c === 39 /*'*/ ) {
	
				T.index++;
				token = T.sliceToChar(c === 39 ? "'" : '"');
				T.index++;
	
				return token;
			}
	
	
			do {
				c = T.template.charCodeAt(++T.index);
			} while (T.index < T.length && //
			c !== 32 /* */ && //
			c !== 33 /*!*/ && //
			c !== 60 /*<*/ && //
			c !== 61 /*=*/ && //
			c !== 62 /*>*/ && //
			c !== 40 /*(*/ && //
			c !== 41 /*)*/ && //
			c !== 38 /*&*/ && //
			c !== 124 /*|*/ );
	
			token = T.template.substring(start, T.index);
	
			c = currentChar;
	
			if (c === 45 || (c > 47 && c < 58)) { /* [-] || [number] */
				return token - 0;
			}
	
			if (c === 116 /*t*/ && token === 'true') {
				return true;
			}
	
			if (c === 102 /*f*/ && token === 'false') {
				return false;
			}
	
			return {
				value: token
			};
		}
	
	
	
		function parseAssertion(T, output) {
			// use shadow class
			var current = {
				assertions: null,
				join: null,
				left: null,
				right: null
			},
				c;
	
			if (output == null) {
				output = [];
			}
	
			if (typeof T === 'string') {
				T = new Template(T);
			}
			outer: while(1) {
				T.skipWhitespace();
	
				if (T.index >= T.length) {
					break;
				}
	
				c = T.template.charCodeAt(T.index);
	
				switch (c) {
				case 61:
					// <
				case 60:
					// >
				case 62:
					// !
				case 33:
					var start = T.index;
					do {
						c = T.template.charCodeAt(++T.index);
					} while (T.index < T.length && (c === 60 || c === 61 || c === 62));
	
					current.sign = T.template.substring(start, T.index);
					continue;
					// &
				case 38:
					// |
				case 124:
					if (T.template.charCodeAt(++T.index) !== c) {
						console.error('Unary operation not valid');
					}
	
					current.join = c === 38 ? '&&' : '||';
	
					output.push(current);
					current = {
						assertions: null,
						join: null,
						left: null,
						right: null
					};
	
					++T.index;
					continue;
					// (
				case 40:
					T.index++;
					parseAssertion(T, (current.assertions = []));
					break;
					// )
				case 41:
					T.index++;
					break outer;
				default:
					current[current.left == null ? 'left' : 'right'] = parseDirective(T, c);
					continue;
				}
			}
	
			if (current.left || current.assertions) {
				output.push(current);
			}
			return output;
		}
	
	
		var _cache = [];
	
		function parseLinearCondition(line) {
	
			if (_cache[line] != null) {
				return _cache[line];
			}
	
			var length = line.length,
				ternary = {
					assertions: null,
					case1: null,
					case2: null
				},
				questionMark = line.indexOf('?'),
				T = new Template(line);
	
	
			if (questionMark !== -1) {
				T.length = questionMark;
			}
	
			ternary.assertions = parseAssertion(T);
	
			if (questionMark !== -1){
				T.length = length;
				T.index = questionMark + 1;
	
				ternary.case1 = parseDirective(T);
				T.skipWhitespace();
	
				if (T.template.charCodeAt(T.index) === 58 /*:*/ ) {
					T.index++; // skip ':'
					ternary.case2 = parseDirective(T);
				}
			}
	
			return (_cache[line] = ternary);
		}
	
		function isCondition(assertions, model) {
			if (typeof assertions === 'string') {
				assertions = parseLinearCondition(assertions).assertions;
			}
	
			if (assertions.assertions != null) {
				// backwards compatible, as argument was a full condition statement
				assertions = assertions.assertions;
			}
	
			var current = false,
				a, value1, value2, i, length;
	
			for (i = 0, length = assertions.length; i < length; i++) {
				a = assertions[i];
	
				if (a.assertions) {
					current = isCondition(a.assertions, model);
				} else {
					value1 = typeof a.left === 'object' ? util_getProperty(model, a.left.value) : a.left;
	
					if (a.right == null) {
						current = value1;
						if (a.sign === '!') {
							current = !current;
						}
	
					} else {
						value2 = typeof a.right === 'object' ? util_getProperty(model, a.right.value) : a.right;
						switch (a.sign) {
						case '<':
							current = value1 < value2;
							break;
						case '<=':
							current = value1 <= value2;
							break;
						case '>':
							current = value1 > value2;
							break;
						case '>=':
							current = value1 >= value2;
							break;
						case '!=':
							current = value1 !== value2;
							break;
						case '==':
							current = value1 === value2;
							break;
						}
					}
				}
	
				if (current) {
					if (a.join === '&&') {
						continue;
					}
	
					break; // we are in OR and current is truthy
				}
	
				if (a.join === '||') {
					continue;
				}
	
				if (a.join === '&&'){
					// find OR in stack (false && false && false || true -> true)
					for(++i; i<length; i++){
						if (assertions[i].join === '||'){
							break;
						}
					}
				}
			}
			return current;
		}
	
		return {
			/**
			 *	condition(ternary[, model]) -> result
			 *	- ternary (String)
			 *	- model (Object): Data Model
			 *
			 *	Ternary Operator is evaluated via ast parsing.
			 *	All this expressions are valid:
			 *		('name=="me"',{name: 'me'}) -> true
			 *		('name=="me"?"yes"',{name: 'me'}) -> "yes"
			 *		('name=="me"? surname',{name: 'me', surname: 'you'}) -> 'you'
			 *		('name=="me" ? surname : "none"',{}) -> 'none'
			 *
			 **/
			condition: function(line, model) {
				var con = parseLinearCondition(line),
					result = isCondition(con.assertions, model);
	
				if (con.case1 != null){
					result =  result ? con.case1 : con.case2;
				}
	
				if (result == null) {
					return '';
				}
				if (typeof result === 'object' && result.value) {
					return util_getProperty(model, result.value);
				}
	
				return result;
			},
			/**
			 *	isCondition(condition, model) -> Boolean
			 * - condition (String)
			 * - model (Object)
			 *
			 *	Evaluate condition via ast parsing using specified model data
			 **/
			isCondition: isCondition,
	
			/**
			 *	parse(condition) -> Object
			 * - condition (String)
			 *
			 *	Parse condition to an AstTree.
			 **/
			parse: parseLinearCondition,
	
			/* deprecated - moved to parent */
			out: {
				isCondition: isCondition,
				parse: parseLinearCondition
			}
		};
	}());
	
	
	// source ../src/util/object.js
	function obj_inherit(target /* source, ..*/ ) {
		if (typeof target === 'function') {
			target = target.prototype;
		}
		var i = 1,
			imax = arguments.length,
			source,
			key,
			descriptor;
		for (; i < imax; i++) {
	
			source = typeof arguments[i] === 'function'
				? arguments[i].prototype
				: arguments[i];
	
			for (key in source) {
				descriptor = Object.getOwnPropertyDescriptor(source, key);
				
				if (descriptor.hasOwnProperty('value')) {
					target[key] = descriptor.value;
					continue;
				}
				
				Object.defineProperty(target, key, descriptor);
			}
		}
		return target;
	}
	// source ../src/util/function.js
	
	function fn_isFunction(fn) {
		return fn instanceof Function;
	}
	
	
	// source ../../mask/src/expression/exports.js
	/**
	 * ExpressionUtil
	 *
	 * Helper to work with expressions
	 **/
	
	var ExpressionUtil = (function(){
	
		// source 1.scope-vars.js
		
		var index = 0,
			length = 0,
			cache = {},
			template, ast;
		
		var op_Minus = '-', //1,
			op_Plus = '+', //2,
			op_Divide = '/', //3,
			op_Multip = '*', //4,
			op_Modulo = '%', //5,
			
			op_LogicalOr = '||', //6,
			op_LogicalAnd = '&&', //7,
			op_LogicalNot = '!', //8,
			op_LogicalEqual = '==', //9,
			op_LogicalNotEqual = '!=', //11,
			op_LogicalGreater = '>', //12,
			op_LogicalGreaterEqual = '>=', //13,
			op_LogicalLess = '<', //14,
			op_LogicalLessEqual = '<=', //15,
			op_Member = '.', // 16
		
			punc_ParantheseOpen = 20,
			punc_ParantheseClose = 21,
			punc_Comma = 22,
			punc_Dot = 23,
			punc_Question = 24,
			punc_Colon = 25,
		
			go_ref = 30,
			go_string = 31,
			go_number = 32;
		
		var type_Body = 1,
			type_Statement = 2,
			type_SymbolRef = 3,
			type_FunctionRef = 4,
			type_Accessor = 5,
			type_Value = 6,
		
		
			type_Number = 7,
			type_String = 8,
			type_UnaryPrefix = 9,
			type_Ternary = 10;
		
		var state_body = 1,
			state_arguments = 2;
		
		
		var precedence = {};
		
		precedence[op_Member] = 1;
		
		precedence[op_Divide] = 2;
		precedence[op_Multip] = 2;
		
		precedence[op_Minus] = 3;
		precedence[op_Plus] = 3;
		
		precedence[op_LogicalGreater] = 4;
		precedence[op_LogicalGreaterEqual] = 4;
		precedence[op_LogicalLess] = 4;
		precedence[op_LogicalLessEqual] = 4;
		
		precedence[op_LogicalEqual] = 5;
		precedence[op_LogicalNotEqual] = 5;
		
		
		precedence[op_LogicalAnd] = 6;
		precedence[op_LogicalOr] = 6;
		
		// source 2.ast.js
		function Ast_Body(parent) {
			this.parent = parent;
			this.type = type_Body;
			this.body = [];
			this.join = null;
		}
		
		function Ast_Statement(parent) {
			this.parent = parent;
		}
		Ast_Statement.prototype = {
			constructor: Ast_Statement,
			type: type_Statement,
			join: null,
			body: null
		};
		
		
		function Ast_Value(value) {
			this.type = type_Value;
			this.body = value;
			this.join = null;
		}
		
		function Ast_FunctionRef(parent, ref) {
			this.parent = parent;
			this.type = type_FunctionRef;
			this.body = ref;
			this.arguments = [];
			this.next = null;
		}
		Ast_FunctionRef.prototype = {
			constructor: Ast_FunctionRef,
			newArgument: function() {
				var body = new Ast_Body(this);
				this.arguments.push(body);
		
				return body;
			}
		};
		
		function Ast_SymbolRef(parent, ref) {
			this.parent = parent;
			this.type = type_SymbolRef;
			this.body = ref;
			this.next = null;
		}
		
		function Ast_Accessor(parent, astRef){
			this.parent = parent;
			this.body = astRef;
			this.next = null;
		}
		
		
		function Ast_UnaryPrefix(parent, prefix) {
			this.parent = parent;
			this.prefix = prefix;
		}
		Ast_UnaryPrefix.prototype = {
			constructor: Ast_UnaryPrefix,
			type: type_UnaryPrefix,
			body: null
		};
		
		
		
		function Ast_TernaryStatement(assertions){
			this.body = assertions;
			this.case1 = new Ast_Body(this);
			this.case2 = new Ast_Body(this);
		}
		Ast_TernaryStatement.prototype = {
			constructor: Ast_TernaryStatement,
			type: type_Ternary,
			case1: null,
			case2: null
		};
		
		
		function ast_append(current, next) {
			if (null == current) {
				console.error('Undefined', current, next);
			}
			var type = current.type;
		
			if (type_Body === type){
				current.body.push(next);
				return next;
			}
		
			if (type_Statement === type || type_UnaryPrefix === type){
				return current.body = next;
			}
		
			if (type_SymbolRef === type || type_FunctionRef === type){
				return current.next = next;
			}
		
			console.error('Unsupported - append:', current, next);
			return next;
		}
		
		function ast_join(){
			if (arguments.length === 0){
				return null;
			}
			var body = new Ast_Body(arguments[0].parent);
		
			body.join = arguments[arguments.length - 1].join;
			body.body = Array.prototype.slice.call(arguments);
		
			return body;
		}
		
		function ast_handlePrecedence(ast){
			if (ast.type !== type_Body){
				if (ast.body != null && typeof ast.body === 'object'){
					ast_handlePrecedence(ast.body);
				}
				return;
			}
		
			var body = ast.body,
				i = 0,
				length = body.length,
				x, prev, array;
		
			for(; i < length; i++){
				ast_handlePrecedence(body[i]);
			}
		
		
			for(i = 1; i < length; i++){
				x = body[i];
				prev = body[i-1];
		
				if (precedence[prev.join] > precedence[x.join]){
					break;
				}
			}
		
			if (i === length){
				return;
			}
		
			array = [body[0]];
			for(i = 1; i < length; i++){
				x = body[i];
				prev = body[i-1];
		
				if (precedence[prev.join] > precedence[x.join] && i < length - 1){
					x = ast_join(body[i], body[++i]);
				}
		
				array.push(x);
			}
		
			ast.body = array;
		
		}
		
		// source 3.util.js
		function _throw(message, token) {
			console.error('Expression parser:', message, token, template.substring(index));
		}
		
		
		function util_resolveRef(astRef, model, cntx, controller) {
			var current = astRef,
				key = astRef.body,
				object, value;
		
			if (value == null && model != null) {
				object = model;
				value = model[key];
			}
		
			if (value == null && cntx != null) {
				object = cntx;
				value = cntx[key];
			}
		
			if (value == null && controller != null) {
				do {
					object = controller;
					value = controller[key];
				} while (value == null && (controller = controller.parent) != null);
			}
		
			if (value != null) {
				do {
					if (current.type === type_FunctionRef) {
						var args = [];
						for (var i = 0, x, length = current.arguments.length; i < length; i++) {
							x = current.arguments[i];
							args[i] = expression_evaluate(x, model, cntx, controller);
						}
						value = value.apply(object, args);
					}
		
					if (value == null || current.next == null) {
						break;
					}
		
					current = current.next;
					key = current.body;
					object = value;
					value = value[key];
		
					if (value == null) {
						break;
					}
		
				} while (true);
			}
		
			if (value == null){
				if (current == null || current.next != null){
					_throw('Mask - Accessor error - ', key);
				}
			}
		
			return value;
		
		
		}
		
		function util_getValue(object, props, length) {
			var i = -1,
				value = object;
			while (value != null && ++i < length) {
				value = value[props[i]];
			}
			return value;
		}
		
		// source 4.parser.helper.js
		function parser_skipWhitespace() {
			var c;
			while (index < length) {
				c = template.charCodeAt(index);
				if (c > 32) {
					return c;
				}
				index++;
			}
			return null;
		}
		
		
		function parser_getString(c) {
			var isEscaped = false,
				_char = c === 39 ? "'" : '"',
				start = index,
				nindex, string;
		
			while ((nindex = template.indexOf(_char, index)) > -1) {
				index = nindex;
				if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/ ) {
					break;
				}
				isEscaped = true;
				index++;
			}
		
			string = template.substring(start, index);
			if (isEscaped === true) {
				string = string.replace(regexpEscapedChar[_char], _char);
			}
			return string;
		}
		
		function parser_getNumber() {
			var start = index,
				code, isDouble;
			while (true) {
		
				code = template.charCodeAt(index);
				if (code === 46) {
					// .
					if (isDouble === true) {
						_throw('Unexpected punc');
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
		
		function parser_getRef() {
			var start = index,
				c = template.charCodeAt(index),
				ref;
		
			if (c === 34 || c === 39) {
				index++;
				ref = parser_getString(c);
				index++;
				return ref;
			}
		
			while (true) {
		
				c = template.charCodeAt(index);
				if (
					c > 47 && // ()+-*,/
		
				c !== 58 && // :
				c !== 60 && // <
				c !== 61 && // =
				c !== 62 && // >
				c !== 63 && // ?
		
				c !== 124 && // |
		
				index < length) {
		
					index++;
					continue;
				}
		
				break;
			}
		
			return template.substring(start, index);
		}
		
		function parser_getDirective(code) {
			if (code == null && index === length) {
				return null;
			}
		
			switch (code) {
				case 40:
					// )
					return punc_ParantheseOpen;
				case 41:
					// )
					return punc_ParantheseClose;
				case 44:
					// ,
					return punc_Comma;
				case 46:
					// .
					return punc_Dot;
				case 43:
					// +
					return op_Plus;
				case 45:
					// -
					return op_Minus;
				case 42:
					// *
					return op_Multip;
				case 47:
					// /
					return op_Divide;
				case 37:
					// %
					return op_Modulo;
		
				case 61:
					// =
					if (template.charCodeAt(++index) !== code) {
						_throw('Not supported (Apply directive) - view can only access model/controllers');
						return null;
					}
					return op_LogicalEqual;
		
				case 33:
					// !
					if (template.charCodeAt(index + 1) === 61) {
						// =
						index++;
						return op_LogicalNotEqual;
					}
					return op_LogicalNot;
		
				case 62:
					// >
					if (template.charCodeAt(index + 1) === 61) {
						index++;
						return op_LogicalGreaterEqual;
					}
					return op_LogicalGreater;
		
				case 60:
					// <
					if (template.charCodeAt(index + 1) === 61) {
						index++;
						return op_LogicalLessEqual;
					}
					return op_LogicalLess;
		
				case 38:
					// &
					if (template.charCodeAt(++index) !== code) {
						_throw('Single Binary Operator AND');
						return null;
					}
					return op_LogicalAnd;
		
				case 124:
					// |
					if (template.charCodeAt(++index) !== code) {
						_throw('Single Binary Operator OR');
						return null;
					}
					return op_LogicalOr;
				
				case 63:
					// ?
					return punc_Question;
		
				case 58:
					// :
					return punc_Colon;
		
			}
		
			if (code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95 || code === 36) {
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
		
			_throw('Unexpected / Unsupported directive');
			return null;
		}
		// source 5.parser.js
		function expression_parse(expr) {
		
			template = expr;
			index = 0;
			length = expr.length;
		
			ast = new Ast_Body();
		
			var current = ast,
				state = state_body,
				c, next, directive;
		
			outer: while (true) {
		
				if (index < length && (c = template.charCodeAt(index)) < 33) {
					index++;
					continue;
				}
		
				if (index >= length) {
					break;
				}
		
				directive = parser_getDirective(c);
		
				if (directive == null && index < length) {
					break;
				}
		
				switch (directive) {
					case punc_ParantheseOpen:
						current = ast_append(current, new Ast_Statement(current));
						current = ast_append(current, new Ast_Body(current));
		
						index++;
						continue;
		
		
					case punc_ParantheseClose:
						var closest = type_Body;
						if (state === state_arguments) {
							state = state_body;
							closest = type_FunctionRef;
						}
		
						do {
							current = current.parent;
						} while (current != null && current.type !== closest);
		
						if (closest === type_Body) {
							current = current.parent;
						}
		
						if (current == null) {
							_throw('OutOfAst Exception - body closed');
							break outer;
						}
		
						index++;
						continue;
		
		
					case punc_Comma:
						if (state !== state_arguments) {
							_throw('Unexpected punctuation, comma');
							break outer;
						}
						do {
							current = current.parent;
						} while (current != null && current.type !== type_FunctionRef);
		
						if (current == null) {
							_throw('OutOfAst Exception - next argument');
							break outer;
						}
		
						current = current.newArgument();
		
						index++;
						continue;
		
					case punc_Question:
						ast = new Ast_TernaryStatement(ast);
						current = ast.case1;
		
						index++;
						continue;
		
		
					case punc_Colon:
						current = ast.case2;
		
						index++;
						continue;
		
		
					case punc_Dot:
						c = template.charCodeAt(index + 1);
						if (c >= 48 && c <= 57) {
							directive = go_number;
						} else {
							directive = go_ref;
							index++;
						}
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
		
					case op_LogicalAnd:
					case op_LogicalOr:
					case op_LogicalEqual:
					case op_LogicalNotEqual:
		
					case op_LogicalGreater:
					case op_LogicalGreaterEqual:
					case op_LogicalLess:
					case op_LogicalLessEqual:
		
						while (current && current.type !== type_Statement) {
							current = current.parent;
						}
		
						if (current.body == null) {
							_throw('Unexpected operator', current);
							break outer;
						}
		
						current.join = directive;
		
						do {
							current = current.parent;
						} while (current != null && current.type !== type_Body);
		
						if (current == null) {
							console.error('Unexpected parent', current);
						}
		
		
						index++;
						continue;
					case go_string:
					case go_number:
						if (current.body != null && current.join == null) {
							_throw('Directive Expected');
							break;
						}
						if (go_string === directive) {
							index++;
							ast_append(current, new Ast_Value(parser_getString(c)));
							index++;
		
						}
		
						if (go_number === directive) {
							ast_append(current, new Ast_Value(parser_getNumber(c)));
						}
		
						continue;
		
					case go_ref:
						var ref = parser_getRef();
		
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
		
							var fn = ast_append(current, new Ast_FunctionRef(current, ref));
		
							current = fn.newArgument();
							continue;
						}
		
						if (c === 110 && ref === 'null') {
							ref = null;
						}
		
						if (c === 102 && ref === 'false') {
							ref = false;
						}
		
						if (c === 116 && ref === 'true') {
							ref = true;
						}
		
						current = ast_append(current, typeof ref === 'string' ? new Ast_SymbolRef(current, ref) : new Ast_Value(ref));
						
						break;
				}
			}
		
			if (current.body == null && current.type === type_Statement) {
				_throw('Unexpected end of expression');
			}
		
			ast_handlePrecedence(ast);
		
			return ast;
		}
		// source 6.eval.js
		function expression_evaluate(mix, model, cntx, controller) {
		
			var result, ast;
		
			if (mix == null){
				return null;
			}
		
			if (typeof mix === 'string'){
				if (cache.hasOwnProperty(mix) === true){
					ast = cache[mix];
				}else{
					ast = (cache[mix] = expression_parse(mix));
				}
			}else{
				ast = mix;
			}
		
			var type = ast.type,
				i, x, length;
		
			if (type_Body === type) {
				var value, prev;
		
				outer: for (i = 0, length = ast.body.length; i < length; i++) {
					x = ast.body[i];
		
					value = expression_evaluate(x, model, cntx, controller);
		
					if (prev == null) {
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
						}else{
							result = value;
						}
					}
		
					if (prev.join === op_LogicalOr) {
						if (result){
							break outer;
						}
						if (value) {
							result = value;
							break outer;
						}
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
					case op_LogicalNotEqual:
						result = result != value;
						break;
					case op_LogicalEqual:
						result = result == value;
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
			}
		
			if (type_Statement === type) {
				return expression_evaluate(ast.body, model, cntx, controller);
			}
		
			if (type_Value === type) {
				return ast.body;
			}
		
			if (type_SymbolRef === type || type_FunctionRef === type) {
				return util_resolveRef(ast, model, cntx, controller);
			}
			
			if (type_UnaryPrefix === type) {
				result = expression_evaluate(ast.body, model, cntx, controller);
				switch (ast.prefix) {
				case op_Minus:
					result = -result;
					break;
				case op_LogicalNot:
					result = !result;
					break;
				}
			}
		
			if (type_Ternary === type){
				result = expression_evaluate(ast.body, model, cntx, controller);
				result = expression_evaluate(result ? ast.case1 : ast.case2, model, cntx, controller);
		
			}
		
			return result;
		}
		
		// source 7.vars.helper.js
		var refs_extractVars = (function() {
		
			/**
			 * extract symbol references
			 * ~[:user.name + 'px'] -> 'user.name'
			 * ~[:someFn(varName) + user.name] -> ['varName', 'user.name']
			 *
			 * ~[:someFn().user.name] -> {accessor: (Accessor AST function call) , ref: 'user.name'}
			 */
		
		
			return function(expr){
				if (typeof expr === 'string') {
					expr = expression_parse(expr);
				}
				
				return _extractVars(expr);
				
				
			};
			
			
			
			function _extractVars(expr) {
		
				if (expr == null) {
					return null;
				}
		
				var refs, x;
		
				if (type_Body === expr.type) {
		
					for (var i = 0, length = expr.body.length; i < length; i++) {
						x = _extractVars(expr.body[i]);
						refs = _append(refs, x);
					}
				}
		
				if (type_SymbolRef === expr.type) {
					var path = expr.body,
						next = expr.next;
		
					while (next != null) {
						if (type_FunctionRef === next.type) {
							return _extractVars(next);
						}
						if (type_SymbolRef !== next.type) {
							console.error('Ast Exception: next should be a symbol/function ref');
							return null;
						}
		
						path += '.' + next.body;
		
						next = next.next;
					}
		
					return path;
				}
		
		
				switch (expr.type) {
					case type_Statement:
					case type_UnaryPrefix:
					case type_Ternary:
						x = _extractVars(expr.body);
						refs = _append(refs, x);
						break;
				}
				
				// get also from case1 and case2
				if (type_Ternary === expr.type) {
					x = _extractVars(ast.case1);
					refs = _append(refs, x);
		
					x = _extractVars(ast.case2);
					refs = _append(refs, x);
				}
		
		
				if (type_FunctionRef === expr.type) {
					for(var i = 0, length = expr.arguments.length; i < length; i++){
						x = _extractVars(expr.arguments[i]);
						refs = _append(refs, x);
					}
					
					x = null;
					var parent = expr;
					outer: while ((parent = parent.parent)) {
						switch (parent.type) {
							case type_SymbolRef:
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
						x = _extractVars(expr.next);
						refs = _append(refs, {accessor: _getAccessor(expr), ref: x});
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
					
					for (var i = 0, imax = ast.length; i < imax; i++){
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
		
		}());
		
	
	
		return {
			parse: expression_parse,
			
			/**
			 * Expression.eval(expression [, model, cntx, controller]) -> result
			 * - expression (String): Expression, only accessors are supoorted
			 *
			 * All symbol and function references will be looked for in 
			 *
			 * 1. model
			 * 2. cntx
			 * 3. controller
			 * 4. controller.parent
			 * 5. and so on
			 *
			 * Sample:
			 * '(user.age + 20) / 2'
			 * 'fn(user.age + "!") + x'
			 **/
			eval: expression_evaluate,
			varRefs: refs_extractVars
		};
	
	}());
	
	// source ../../mask/src/custom.js
	var custom_Utils = {
		condition: ConditionUtil.condition,
		expression: function(value, model, cntx, element, controller){
			return ExpressionUtil.eval(value, model, cntx, controller);
		},
	},
		custom_Attributes = {
			'class': null,
			id: null,
			style: null,
			name: null,
			type: null
		},
		custom_Tags = {
			// Most common html tags
			// http://jsperf.com/not-in-vs-null/3
			div: null,
			span: null,
			input: null,
			button: null,
			textarea: null,
			select: null,
			option: null,
			h1: null,
			h2: null,
			h3: null,
			h4: null,
			h5: null,
			h6: null,
			a: null,
			p: null,
			img: null,
			table: null,
			td: null,
			tr: null,
			pre: null,
			ul: null,
			li: null,
			ol: null,
			i: null,
			b: null,
			strong: null,
			form: null
		};
	
	// source ../../mask/src/dom/dom.js
	
	var Dom = {
		NODE: 1,
		TEXTNODE: 2,
		FRAGMENT: 3,
		COMPONENT: 4,
		CONTROLLER: 9,
		SET: 10,
	
		Node: Node,
		TextNode: TextNode,
		Fragment: Fragment,
		Component: Component
	};
	
	function Node(tagName, parent) {
		this.type = Dom.NODE;
	
		this.tagName = tagName;
		this.parent = parent;
		this.attr = {};
	}
	
	Node.prototype = {
		constructor: Node,
		type: Dom.NODE,
		tagName: null,
		parent: null,
		attr: null,
		nodes: null,
		__single: null
	};
	
	function TextNode(text, parent) {
		this.content = text;
		this.parent = parent;
		this.type = Dom.TEXTNODE;
	}
	
	TextNode.prototype = {
		type: Dom.TEXTNODE,
		content: null,
		parent: null
	};
	
	function Fragment(){
		this.nodes = [];
	}
	
	Fragment.prototype = {
		constructor: Fragment,
		type: Dom.FRAGMENT,
		nodes: null
	};
	
	function Component(compoName, parent, controller){
		this.tagName = compoName;
		this.parent = parent;
		this.controller = controller;
		this.attr = {};
	}
	
	Component.prototype = {
		constructor: Component,
		type: Dom.COMPONENT,
		parent: null,
		attr: null,
		controller: null,
		nodes: null,
		components: null
	};
	
	// source ../../mask/src/parse/parser.js
	var Parser = (function(Node, TextNode, Fragment, Component) {
	
		var interp_START = '~',
			interp_CLOSE = ']',
	
			// ~
			interp_code_START = 126,
			// [
			interp_code_OPEN = 91,
			// ]
			interp_code_CLOSE = 93,
	
			_serialize;
	
	
		function ensureTemplateFunction(template) {
			var index = -1;
	
			/*
			 * - single char indexOf is much faster then '~[' search
			 * - function is divided in 2 parts: interpolation start lookup/ interpolation parse
			 * for better performance
			 */
			while ((index = template.indexOf(interp_START, index)) !== -1) {
				if (template.charCodeAt(index + 1) === interp_code_OPEN) {
					break;
				}
				index++;
			}
	
			if (index === -1) {
				return template;
			}
	
	
			var array = [],
				lastIndex = 0,
				i = 0,
				end;
	
	
			while (true) {
				end = template.indexOf(interp_CLOSE, index + 2);
				if (end === -1) {
					break;
				}
	
				array[i++] = lastIndex === index ? '' : template.substring(lastIndex, index);
				array[i++] = template.substring(index + 2, end);
	
	
				lastIndex = index = end + 1;
	
				while ((index = template.indexOf(interp_START, index)) !== -1) {
					if (template.charCodeAt(index + 1) === interp_code_OPEN) {
						break;
					}
					index++;
				}
	
				if (index === -1) {
					break;
				}
	
			}
	
			if (lastIndex < template.length) {
				array[i] = template.substring(lastIndex);
			}
	
			template = null;
			return function(type, model, cntx, element, controller, name) {
				if (type == null) {
					// http://jsperf.com/arguments-length-vs-null-check
					// this should be used to stringify parsed MaskDOM
					var string = '';
					for (var i = 0, x, length = array.length; i < length; i++) {
						x = array[i];
						if (i % 2 === 1) {
							string += '~[' + x + ']';
						} else {
							string += x;
						}
					}
					return string;
				}
	
				return util_interpolate(array, type, model, cntx, element, controller, name);
			};
	
		}
	
	
		function _throw(template, index, state, token) {
			var parsing = {
					2: 'tag',
					3: 'tag',
					5: 'attribute key',
					6: 'attribute value',
					8: 'literal'
				}[state],
	
				lines = template.substring(0, index).split('\n'),
				line = lines.length,
				row = lines[line - 1].length,
	
				message = ['Mask - Unexpected:', token, 'at(', line, ':', row, ') [ in', parsing, ']'];
	
			console.error(message.join(' '), {
				stopped: template.substring(index),
				template: template
			});
		}
	
	
	
		return {
	
			/** @out : nodes */
			parse: function(template) {
	
				//_serialize = T.serialize;
	
				var current = new Fragment(),
					fragment = current,
					state = 2,
					last = 3,
					index = 0,
					length = template.length,
					classNames,
					token,
					key,
					value,
					next,
					c, // charCode
					start,
					nextC;
	
				var go_tag = 2,
					state_tag = 3,
					state_attr = 5,
					go_attrVal = 6,
					go_attrHeadVal = 7,
					state_literal = 8,
					go_up = 9;
	
	
				outer: while (true) {
	
					if (index < length && (c = template.charCodeAt(index)) < 33) {
						index++;
						continue;
					}
	
					// inline comments
					if (c === 47 && template.charCodeAt(index + 1) === 47) {
						// /
						index++;
						while (c !== 10 && c !== 13 && index < length) {
							// goto newline
							c = template.charCodeAt(++index);
						}
						continue;
					}
	
					if (last === state_attr) {
						if (classNames != null) {
							current.attr['class'] = ensureTemplateFunction(classNames);
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
							} else {
								value = token;
							}
	
							if (key != null && value != null) {
								if (key !== 'class') {
									current.attr[key] = value;
								} else {
									classNames = classNames == null ? value : classNames + ' ' + value;
								}
	
								key = null;
								value = null;
							}
	
						} else if (last === state_tag) {
	
							next = custom_Tags[token] != null
								? new Component(token, current, custom_Tags[token])
								: new Node(token, current);
	
							if (current.nodes == null) {
								current.nodes = [next];
							} else {
								current.nodes.push(next);
							}
	
							current = next;
	
	
							state = state_attr;
	
						} else if (last === state_literal) {
	
							next = new TextNode(token, current);
	
							if (current.nodes == null) {
								current.nodes = [next];
							} else {
								current.nodes.push(next);
							}
	
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
								current.attr['class'] = ensureTemplateFunction(classNames);
							}
							if (key != null) {
								current.attr[key] = key;
							}
						}
	
						break;
					}
	
					if (state === go_up) {
						current = current.parent;
						while (current != null && current.__single != null) {
							current = current.parent;
						}
						state = go_tag;
					}
	
					switch (c) {
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
	
						// skip ; , when node is not a single tag (else goto 125)
						if (current.nodes != null) {
							index++;
							continue;
						}
	
						/* falls through */
					case 125:
						// ;}
	
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
						} else {
							last = state = state_literal;
						}
	
						index++;
	
	
	
						var isEscaped = false,
							isUnescapedBlock = false,
							nindex, _char = c === 39 ? "'" : '"';
	
						start = index;
	
						while ((nindex = template.indexOf(_char, index)) > -1) {
							index = nindex;
							if (template.charCodeAt(nindex - 1) !== 92 /*'\\'*/ ) {
								break;
							}
							isEscaped = true;
							index++;
						}
	
						if (start === index) {
							nextC = template.charCodeAt(index + 1);
							if (nextC === 124 || nextC === c) {
								// | (obsolete) or triple quote
								isUnescapedBlock = true;
								start = index + 2;
								index = nindex = template.indexOf((nextC === 124 ? '|' : _char) + _char + _char, start);
	
								if (index === -1) {
									index = length;
								}
	
							}
						}
	
						token = template.substring(start, index);
						if (isEscaped === true) {
							token = token.replace(regexpEscapedChar[_char], _char);
						}
	
						token = ensureTemplateFunction(token);
	
	
						index += isUnescapedBlock ? 3 : 1;
						continue;
					}
	
	
					if (state === go_tag) {
						last = state_tag;
						state = state_tag;
	
						if (c === 46 /* . */ || c === 35 /* # */ ) {
							token = 'div';
							continue;
						}
					}
	
					else if (state === state_attr) {
						if (c === 46) {
							// .
							index++;
							key = 'class';
							state = go_attrHeadVal;
						} else if (c === 35) {
							// #
							index++;
							key = 'id';
							state = go_attrHeadVal;
						} else if (c === 61) {
							// =;
							index++;
							state = go_attrVal;
							continue;
						} else {
	
							if (key != null) {
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
	
					var isInterpolated = null;
	
					start = index;
					while (index < length) {
	
						c = template.charCodeAt(index);
	
						if (c === interp_code_START && template.charCodeAt(index + 1) === interp_code_OPEN) {
							isInterpolated = true;
							++index;
							do {
								// goto end of template declaration
								c = template.charCodeAt(++index);
							}
							while (c !== interp_code_CLOSE && index < length);
						}
	
						// if DEBUG
						if (c === 0x0027 || c === 0x0022 || c === 0x002F || c === 0x003C || c === 0x002C) {
							// '"/<,
							_throw(template, index, state, String.fromCharCode(c));
							break;
						}
						// endif
	
	
						if (last !== go_attrVal && (c === 46 || c === 35)) {
							// .#
							// break on .# only if parsing attribute head values
							break;
						}
	
						if (c === 61 || c === 62 || c === 123 || c < 33 || c === 59) {
							// =>{ ;
							break;
						}
	
	
						index++;
					}
	
					token = template.substring(start, index);
	
					// if DEBUG
					if (!token) {
						_throw(template, index, state, '*EMPTY*');
						break;
					}
					if (isInterpolated === true && state === state_tag) {
						_throw(template, index, state, 'Tag Names cannt be interpolated (in dev)');
						break;
					}
					// endif
	
	
					if (isInterpolated === true && (state === state_attr && key === 'class') === false) {
						token = ensureTemplateFunction(token);
					}
	
				}
	
				////if (isNaN(c)) {
				////	_throw(template, index, state, 'Parse IndexOverflow');
				////
				////}
	
				// if DEBUG
				if (current.parent != null && current.parent !== fragment && current.parent.__single !== true && current.nodes != null) {
					console.warn('Mask - ', current.parent.tagName, JSON.stringify(current.parent.attr), 'was not proper closed.');
				}
				// endif
	
	
				return fragment.nodes.length === 1 ? fragment.nodes[0] : fragment;
			},
			cleanObject: function(obj) {
				if (obj instanceof Array) {
					for (var i = 0; i < obj.length; i++) {
						this.cleanObject(obj[i]);
					}
					return obj;
				}
				delete obj.parent;
				delete obj.__single;
	
				if (obj.nodes != null) {
					this.cleanObject(obj.nodes);
				}
	
				return obj;
			},
			setInterpolationQuotes: function(start, end) {
				if (!start || start.length !== 2) {
					console.error('Interpolation Start must contain 2 Characters');
					return;
				}
				if (!end || end.length !== 1) {
					console.error('Interpolation End must be of 1 Character');
					return;
				}
	
				interp_code_START = start.charCodeAt(0);
				interp_code_OPEN = start.charCodeAt(1);
				interp_code_CLOSE = end.charCodeAt(0);
				interp_CLOSE = end;
				interp_START = start.charAt(0);
			},
			
			ensureTemplateFunction: ensureTemplateFunction
		};
	}(Node, TextNode, Fragment, Component));
	
	
	/** NODEJS BUILDER **/
	// source ../src/builder.js
	var builder_build = (function() {
	
		// source model.js
		var ModelBuilder = (function(){
			
			function ModelBuilder(model) {
				this._models = [];
				this._length = 0;
				
				this.append(model);
			}
			
			ModelBuilder.prototype = {
				append: function(model){
					
					for (var i = 0, x, imax = this._models.length; i < imax; i++){
						x = this._models[i];
						
						if (x === model) {
							return i;
						}
					}
					
					this._models[this._length++] = model;
					
					return this._length - 1;
				},
				
				stringify: function(){
					return JSON.stringify(this._models);
				}
			}
			
			
			
			return ModelBuilder;
			
		}());
		// source stringify.js
		
		// source client/bootstrap.js
		
		function bootstrap(container) {
			
			// source ../util/function.js
			
			function fn_isFunction(fn) {
				return fn instanceof Function;
			}
			// source ../util/array.js
			function arr_isArray(array){
				return array
					&& typeof array.length === 'number'
					&& typeof array.splice === 'function';
			}
			// source ../mock/Meta.js
			var Meta = (function(){
				
				var seperator_CODE = 30,
					seperator_CHAR = String.fromCharCode(seperator_CODE);
				
				function val_stringify(mix) {
					if (typeof mix !== 'string') 
						return val_stringify(JSON.stringify(mix));
					
					return mix;
				}
				
				var parser_Index,
					parser_Length,
					parser_String;
					
				function parse_ID(json){
					
					if (parser_String[parser_Index] !== '#') {
						return;
					}
					parser_Index++;
					
					var end = parser_String.indexOf(seperator_CHAR);
					
					if (end === -1) {
						end = parser_String.length;
					}
					
					json.ID = parseInt(parser_String.substring(parser_Index, end), 10);
					parser_Index = end;
				}
				
				function parse_property(json) {
					if (parser_Index > parser_Length - 5) {
						return false;
					}
					
					if (parser_String[parser_Index++] !== seperator_CHAR || parser_String[parser_Index++] !== ' ') {
						console.warn('[meta parser] "SB " Expected');
						
						return false;
					}
					
					
					
					var index = parser_Index,
						str = parser_String;
					
					var colon = str.indexOf(':', index),
						key = str.substring(index, colon);
						
					var end = str.indexOf(seperator_CHAR + ' ', colon),
						value = str.substring(colon + 1, end);
						
					
					if (key === 'attr') {
						value = JSON.parse(value);
					}
					
					json[key] = value;
					
					parser_Index = end;
					return true;
				}
				
				
				return {
					stringify: function(json, info){
						
						if (info.mode === 'server') 
							return '';
						
						
						var	type = info.type,
							isSingle = info.single,
						
							string = '<!--' + type;
							
							if (json.ID) 
								string += '#' + json.ID;
							
							string += seperator_CHAR + ' ';
						
						for (var key in json) {
							if (key === 'ID') 
								continue;
							
							if (json[key] == null) 
								continue;
							
							
							string += key
								+ ':'
								+ val_stringify(json[key])
								+ seperator_CHAR
								+ ' ';
						}
						
						if (isSingle)
							string += '/';
							
						string += '-->';
						
						return string;
					},
					
					close: function(json, info){
						if (info.mode === 'server') 
							return '';
						
						
						return '<!--/'
							+ info.type
							+ (json.ID ? '#' + json.ID : '')
							+ '-->';
					},
					
					parse: function (string){
						parser_Index = 0;
						parser_String = string;
						parser_Length = string.length;
						
						
						var json = {},
							c = string[parser_Index];
							
						if (c === '/') {
							json.end = true;
							parser_Index++;
						}
						
						json.type = string[parser_Index++];
						
						
						parse_ID(json);
						
						while (parse_property(json)) {
							
							if (parser_Index > parser_Length - 2 && string[parser_Index] === '/') {
								json.single = true;
							}
						}
						
						return json;
					}
				};
			}());
			// source traverse.js
			function trav_getElements(meta) {
				if (meta.isDocument) 
					return Array.prototype.slice.call(document.body.childNodes);
				
			
				var id = 'mask-htmltemplate-' + meta.ID,
					startNode = document.getElementById(id),
					endNode = document.getElementsByName(id)[0];
			
				
			
				if (startNode == null || endNode == null) {
					console.error('Invalid node range to initialize mask components');
					return null;
				}
			
				var array = [],
					node = startNode.nextSibling;
				while (node != null && node != endNode) {
					array.push(node);
			
					node = node.nextSibling;
				}
			
				return array;
			}
			
			function trav_getElement(node){
				var next = node.nextSibling;
				while(next && next.nodeType !== Node.ELEMENT_NODE){
					next = next.nextSibling;
				}
				
				return next;
			}
			
			function trav_getMeta(node){
				while(node && node.nodeType !== Node.COMMENT_NODE){
					node = node.nextSibling;
				}
				return node;
			}
			// source setup.js
			function setup(node, model, cntx, container, controller, childs) {
				
				if (node.nodeType === Node.ELEMENT_NODE) {
					if (childs != null) 
						childs.push(node);
					
					if (node.firstChild) 
						setup(node.firstChild, model, cntx, node, controller);
					
					if (node.nextSibling && childs == null) 
						setup(node.nextSibling, model, cntx, container, controller);
					
					
					return;
				}
				
				if (node.nodeType !== Node.COMMENT_NODE) 
					return;
				
				var metaContent = node.textContent;
				
				if (metaContent === '/m') {
					return;
				}
				
				var meta = Meta.parse(metaContent);
				
				if (meta.modelID) 
					model = models[meta.modelID];
				
				if ('a' === meta.type) {
					// source setup-attr.js
					var handler = custom_Attributes[meta.name];
					var element = trav_getElement(node);
						
					if (handler == null) {
						console.log('Custom Attribute Handler was not defined', meta.name);
						return;
					}
					
					handler(null, meta.value, model, cntx, element, controller, container);
					
					return;
				}
				
				if ('u' === meta.type) {
					
					// source setup-util.js
					var handler = custom_Utils[meta.utilName];
					var element = trav_getElement(node);
					
					if (handler == null) {
						console.log('Custom Utility Handler was not defined', meta.name);
						return;
					}
					//debugger;
					
					handler(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
					
					return;
				}
				
				if ('t' === meta.type) {
					
					// source setup-tag.js
					if (custom_Tags[meta.compoName] != null) {
					
						if (meta.mask) {
							var _node = {
								type: Dom.COMPONENT,
								compoName: meta.compoName,
								attr: meta.attr,
								nodes: mask.parse(meta.mask)
							};
							
							var fragment = mask.render(_node, model, cntx, null, controller);
							
							node.parentNode.insertBefore(fragment, node);
						} else {
						
							var compo = new custom_Tags[meta.compoName](model);
							
							compo.compoName = meta.compoName;
							compo.attr = meta.attr;
							compo.parent = controller;
							compo.ID = meta.ID;
							
							if (controller.components == null) 
								controller.components = [];
								
							controller.components.push(compo);
							
							var elements = [];
							
							node = node.nextSibling;
							
							while(node && !(node.nodeType === Node.COMMENT_NODE && node.textContent === '/t#' + meta.ID)){
								setup(node, model, cntx, container, compo, elements);
								node = node.nextSibling;
							}
							
							
							
							if (fn_isFunction(compo.renderEnd)) {
								compo.renderEnd(elements, model, cntx, container);
							}
							
							if (childs != null && childs !== elements){
								var il = childs.length,
									jl = elements.length;
							
								j = -1;
								while(++j < jl){
									childs[il + j] = elements[j];
								}
							}
						}
						
						
						
					}else{
						console.error('Custom Tag Handler was not defined', meta.compoName);
					}
					
					
					if (node && node.nextSibling) {
						setup(node.nextSibling, model, cntx, container, controller);
					}
				}
				
			}
			
			
			
			if (container == null) {
				container = document.body;
			}
			
			var metaNode = trav_getMeta(container.firstChild),
				metaContent = metaNode && metaNode.textContent,
				meta = metaContent && Meta.parse(metaContent);
				
				
			if (meta == null || meta.type !== 'm') {
				console.error('Meta Inforamtion not defined', container);
				return;
			}
			
			var models = JSON.parse(meta.model),
				model = models[0];
		
			
			var custom_Attributes = mask.getAttrHandler(),
				custom_Tags = mask.getHandler(),
				custom_Utils = mask.getUtility(),
				Dom = mask.Dom;
		
			var stop_NODE = null;
			
			
			
			var compo = {
					components: []
				};
				
			var el = metaNode.nextSibling;
			
			
			//stop_NODE = els[els.length - 1].nextSibling;
			
			
			
			setup(el, model, {}, el.parentNode, compo);
		
			
		
			if (typeof Compo !== 'undefined') {
				Compo.signal.emitIn(compo, 'DOMInsert');
			}
		
		}
		
		function html_stringify(document, model, cntx, component) {
		
			component = html_prepairControllers(component);
		
			if (component.components == null || component.components.length === 0) {
				return document.toString();
			}
		
			
		
			var first = document.firstChild,
				isDocument = first instanceof html_Component && first.instance.isDocument,
				headerJson = {
					model: cntx._model.stringify()
				},
				headerInfo = {
					type: 'm'
				},
				string = '';
		
			
			var meta = Meta.stringify(headerJson, headerInfo),
				metaClose = Meta.close(headerJson, headerInfo);
			
			
			if (isDocument) {
		
				var html = first.firstChild.nextNode;
		
				if (html) {
					var body = html.firstChild;
					while(body && body.tagName !== 'body'){
						body = body.nextNode;
					}
				
					if (body){
						body.insertBefore(new html_TextNode(meta), body.firstChild);
						body.appendChild(new html_TextNode(metaClose));
					}else{
						console.warn('Body not found');
					}
				}
		
				return document.toString();
			}
			
			return meta
				+ document.toString()
				+ metaClose;
				
		}
		
		
		function html_prepairControllers(controller, output) {
			if (output == null) {
				output = {};
			}
		
			output.compoName = controller.compoName;
			output.ID = controller.ID;
		
			if (controller.components) {
				var compos = [],
					array = controller.components;
				for (var i = 0, x, length = array.length; i < length; i++) {
					x = array[i];
		
					compos.push(html_prepairControllers(x));
				}
		
				output.components = compos;
			}
		
			return output;
		
		}
		
		// source html-dom/lib.js
		
		
		util_extend(Dom, {
			DOCTYPE: 11
		});
		
		
		var html_SingleTags = {
		
		};
		
		// source utils.js
		
		function node_insertBefore(node, anchor) {
			return anchor.parentNode.insertBefore(node, anchor);
		}
		// source Node.js
		function html_Node() {}
		
		html_Node.prototype = {
			parentNode: null,
			firstChild: null,
			lastChild: null,
			
			nextNode: null,
			
			
			get length() {
				var count = 0,
					el = this.firstChild;
					
				while (el != null) {
					count++;
					el = el.nextNode;
				}
				return count;
			},
			
			get childNodes() {
				var array = [],
					el = this.firstChild;
					
				while (el != null) {
					array.push(el);
					
					el = el.nextNode;
				}
				
				return array;
			},
			
			appendChild: function(child){
				if (this.firstChild == null) {
					
					this.firstChild = this.lastChild = child;
				}
				else {
					
					this.lastChild.nextNode = child;
					this.lastChild = child;
				}
				
				child.parentNode = this;
			},
			
			insertBefore: function(child, anchor){
				var prev = this.firstChild;
				
				if (prev !== anchor) {
					while (prev != null && prev.nextNode !== anchor) {
						prev = prev.nextNode;
					}
				}
				
				if (prev == null) {
					this.appendChild(child);
					return;
				}
				
				if (prev === this.firstChild) {
					this.firstChild = child;
					
					child.nextNode = prev;
					return;
				}
				
				prev.nextNode = child;
				child.nextNode = anchor;
			}
		};
		// source Doctype.js
		
		function html_DOCTYPE(doctype){
			this.doctype = doctype;
		}
		html_DOCTYPE.prototype = {
			constructor: html_DOCTYPE,
			nodeType: Dom.DOCTYPE,
		
			toString: function(){
				return this.doctype;
			}
		
		};
		
		
		// source DocumentFragment.js
		
		function html_DocumentFragment() {}
		
		html_DocumentFragment.prototype = obj_inherit(html_DocumentFragment, html_Node, {
			nodeType: Dom.FRAGMENT,
			
			
		
			toString: function(){
				var element = this.firstChild,
					string = '';
		
				while (element != null) {
					string += element.toString();
					element = element.nextNode;
				}
		
				return string;
			}
		});
		
		
		// source Element.js
		
		function html_Element(name) {
			this.tagName = name;
			this.attributes = {};
		}
		
		window.El = html_Element;
		
		html_Element.prototype = obj_inherit(html_Element, html_Node, {
			
			nodeType: Dom.NODE,
			
			setAttribute: function(key, value){
				this.attributes[key] = value;
			},
			
			getAttribute: function(key){
				return this.attributes[key];
			},
		
			toString: function(){
				var tagName = this.tagName,
					attr = this.attributes,
					value, element;
		
				var string = '<' + tagName;
		
				for (var key in attr) {
					value = attr[key];
		
					string += ' '
						+ key
						+ '="'
						+ (typeof value === 'string'
								? value.replace(/"/g, '\\"')
								: value)
						+ '"';
				}
		
				if (html_SingleTags[tagName] === 1) {
					string += '/>';
		
					return string;
				}
		
				string += '>';
		
				element = this.firstChild;
				while (element != null) {
					string += element.toString();
					element = element.nextNode;
				}
		
				return string + '</' + tagName + '>';
			}
		});
		
		// source TextNode.js
		
		function html_TextNode(text){
			this.textContent = text;
		}
		
		html_TextNode.prototype = {
			constructor: html_TextNode,
			nodeType: Dom.TEXTNODE,
			nextNode: null,
		
			toString: function(){
				return this.textContent || '';
			}
		};
		
		// source Component.js
		function html_Component(node, model, cntx, container, controller) {
			var typeof_Instance = typeof node.controller === 'function',
				handler = typeof_Instance ? new node.controller(model) : node.controller;
		
			if (handler == null) {
				return;
			}
		
			
		
			var key, attr;
		
			handler.compoName = node.compoName || node.tagName;
			
			handler.attr = attr = util_extend(handler.attr, node.attr);
			handler.model = model;
			handler.nodes = node.nodes;
			handler.parent = controller;
		
		
			for (key in attr) {
				if (typeof attr[key] === 'function') {
					attr[key] = attr[key]('attr', model, cntx, container, controller, key);
				}
			}
		
		
			if (typeof handler.renderStart === 'function') {
				handler.renderStart(model, cntx, container);
			}
		
			// temporal workaround for backwards compo where we used this.tagName = 'div' in .render fn
			if (handler.tagName != null && handler.tagName !== node.compoName) {
				handler.nodes = {
					tagName: handler.tagName,
					attr: handler.attr,
					nodes: handler.nodes,
					type: 1
				};
			}
		
		
		
			if (controller) {
				(controller.components || (controller.components = []))
					.push(node);
			}
		
		
		
			if (typeof handler.render === 'function') {
				handler.render(model, cntx, this, this);
			}
		
			if (typeof_Instance) {
				this.instance = handler;
				this.ID = ++_controllerID;
			}
		}
		
		
		
		html_Component.prototype = obj_inherit(html_Component, html_Node, {
			nodeType: Dom.COMPONENT,
			
			instance: null,
			components: null,
			ID: null,
			toString: function() {
				
				var element = this.firstChild,
					instance = this.instance;
				
				if (instance == null){
					debugger;
				}
				
				
				var	instance = this.instance,
					mode = instance.mode,
					json = {
						ID: this.ID,
						modelID: this.modelID,
						
						compoName: instance.compoName,
						attr: instance.attr,
						mask: mode === 'client'
								? mask.stringify(instance.nodes, 0)
								: null
					},
					info = {
						single: this.firstChild == null,
						type: 't',
						mode: mode
					};
				
				
				var string = Meta.stringify(json, info),
					element = this.firstChild;
					
				while (element != null) {
					string += element.toString();
					element = element.nextNode;
				}
				
				
				if (mode !== 'client') 
					string += Meta.close(json, info);
				
				return string;
			}
		});
		
		
		
		
		// source document.js
		
		var document = {
			createDocumentFragment: function(){
				return new html_DocumentFragment();
			},
			createElement: function(name){
				return new html_Element(name);
			},
			createTextNode: function(text){
				return new html_TextNode(text);
			},
		
			createComponent: function(compo, model, cntx, container, controller){
				return new html_Component(compo, model, cntx, container, controller);
			}
		};
		
		
		// source handler/document.js
		(function() {
		
		
			function Document() {}
		
			custom_Tags[':document'] = Document;
		
			Document.prototype = {
				isDocument: true,
				mode: 'server',
				render: function(model, cntx, fragment, controller) {
		
					var attr = this.attr,
						nodes = this.nodes,
						doctype = attr.doctype || 'html';
		
					delete attr.doctype;
					
		
					fragment.appendChild(new html_DOCTYPE('<!DOCTYPE ' + doctype + '>'));
		
					var html = {
						tagName: 'html',
						type: Dom.NODE,
						attr: attr,
						nodes: [],
					}, head, body, handleBody;
		
					for (var i = 0, x, length = nodes.length; i < length; i++) {
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
		
					if (body == null) {
						body = {
							nodeType: Dom.NODE,
							tagName: 'body',
							nodes: []
						};
					}
		
					head != null && html.nodes.push(head);
					body != null && html.nodes.push(body);
		
					if (handleBody) {
						for (var i = 0, x, length = nodes.length; i < length; i++) {
							x = nodes[i];
							if (x.tagName === 'head') {
								continue;
							}
							if (x.tagName === 'body') {
								continue;
							}
		
							body.nodes.push(x);
						}
					}
		
		
					var owner = this.parent;
					owner.components = [];
		
					builder_html(html, model, cntx, fragment, owner);
		
					return fragment;
				}
			};
		
		}());
		
		
	
	
		var _controllerID = 0;
	
		function builder_html(node, model, cntx, container, controller) {
	
			if (node == null) {
				return container;
			}
	
			var type = node.type,
				element,
				elements,
				childs,
				j, jmax, key, value;
	
			if (type === 10 /*SET*/ || node instanceof Array) {
				for (j = 0, jmax = node.length; j < jmax; j++) {
					builder_html(node[j], model, cntx, container, controller);
				}
				return container;
			}
	
			if (type == null) {
				// in case if node was added manually, but type was not set
				if (node.tagName != null) {
					type = 1;
				} else if (node.content != null) {
					type = 2;
				}
			}
	
			if (type === 1 /* Dom.NODE */) {
				// source ../../mask/src/build/type.node.js
				
				var tagName = node.tagName,
					attr = node.attr,
					tag;
				
				// if DEBUG
				try {
				// endif
					tag = document.createElement(tagName);
				// if DEBUG
				} catch(error) {
					console.error(tagName, 'element cannot be created. If this should be a custom handler tag, then controller is not defined');
					return;
				}
				// endif
				
				
				if (childs != null){
					childs.push(tag);
					childs = null;
					attr['x-compo-id'] = controller.ID;
				}
				
				// ++ insert tag into container before setting attributes, so that in any
				// custom util parentNode is available. This is for mask.node important
				// http://jsperf.com/setattribute-before-after-dom-insertion/2
				if (container != null) {
					container.appendChild(tag);
				}
				
				
				for (key in attr) {
				
					/* if !SAFE
					if (hasOwnProp.call(attr, key) === false) {
						continue;
					}
					*/
				
					if (typeof attr[key] === 'function') {
						value = attr[key]('attr', model, cntx, tag, controller, key);
						if (value instanceof Array) {
							value = value.join('');
						}
				
					} else {
						value = attr[key];
					}
				
					// null or empty string will not be handled
					if (value) {
						if (typeof custom_Attributes[key] === 'function') {
							custom_Attributes[key](node, value, model, cntx, tag, controller, container);
						} else {
							tag.setAttribute(key, value);
						}
					}
				
				}
				
				
				container = tag;
				
			}
	
			if (type === 2 /* Dom.TEXTNODE */) {
				// source ../../mask/src/build/type.textNode.js
				var x, content, result, text;
				
				content = node.content;
				
				if (typeof content === 'function') {
				
					result = content('node', model, cntx, container, controller);
				
					if (typeof result === 'string') {
						container.appendChild(document.createTextNode(result));
				
					} else {
				
						text = '';
						// result is array with some htmlelements
						for (j = 0, jmax = result.length; j < jmax; j++) {
							x = result[j];
				
							if (typeof x === 'object') {
								// In this casee result[j] should be any HTMLElement
								if (text !== '') {
									container.appendChild(document.createTextNode(text));
									text = '';
								}
								if (x.nodeType == null) {
									text += x.toString();
									continue;
								}
								container.appendChild(x);
								continue;
							}
				
							text += x;
						}
						if (text !== '') {
							container.appendChild(document.createTextNode(text));
						}
					}
				
				} else {
					container.appendChild(document.createTextNode(content));
				}
				
				return container;
			}
	
			if (type === 4 /* Dom.COMPONENT */) {
				element = document.createComponent(node, model, cntx, container, controller);
				container.appendChild(element);
				container = element;
				
				var instance = element.instance;
				
				if (instance.model) {
					model = instance.model;
					
					element.modelID = cntx._model.append(model);
				}
				
				if (instance.render) {
					return element;
				}
				
				
			}
	
			var nodes = node.nodes;
			if (nodes != null) {
	
				var isarray = nodes instanceof Array,
					length = isarray === true ? nodes.length : 1,
					i = 0, childNode;
	
	
				for (; i < length; i++) {
	
					childNode = isarray === true ? nodes[i] : nodes;
	
					if (type === 4 /* Dom.COMPONENT */ && childNode.type === 1 /* Dom.NODE */){
						
						childNode.attr['x-compo-id'] = element.ID;
					}
	
					builder_html(childNode, model, cntx, container, controller);
				}
	
			}
	
	
			return container;
		}
	
	
		return function(template, model, cntx) {
			var doc = new html_DocumentFragment(),
				component = new Component();
				
			if (cntx == null) {
				cntx = {};
			}
			
			cntx._model = new ModelBuilder(model);
	
	
			builder_html(template, model, cntx, doc, component);
	
			return html_stringify(doc, model, cntx, component);
		};
	
	}());
	


	// source ../../mask/src/mask.js
	
	/**
	 *  mask
	 *
	 **/
	
	var cache = {},
		Mask = {
	
			/**
			 *	mask.render(template[, model, cntx, container = DocumentFragment, controller]) -> container
			 * - template (String | MaskDOM): Mask String or Mask DOM Json template to render from.
			 * - model (Object): template values
			 * - cntx (Object): can store any additional information, that custom handler may need,
			 * this object stays untouched and is passed to all custom handlers
			 * - container (IAppendChild): container where template is rendered into
			 * - controller (Object): instance of an controller that own this template
			 *
			 *	Create new Document Fragment from template or append rendered template to container
			 **/
			render: function (template, model, cntx, container, controller) {
	
				// if DEBUG
				if (container != null && typeof container.appendChild !== 'function'){
					console.error('.render(template[, model, cntx, container, controller]', 'Container should implement .appendChild method');
					console.warn('Args:', arguments);
				}
				// endif
	
				if (typeof template === 'string') {
					if (hasOwnProp.call(cache, template)){
						/* if Object doesnt contains property that check is faster
						then "!=null" http://jsperf.com/not-in-vs-null/2 */
						template = cache[template];
					}else{
						template = cache[template] = Parser.parse(template);
					}
				}
				
				if (cntx == null) {
					cntx = {};
				}
				
				return builder_build(template, model, cntx, container, controller);
			},
	
			/* deprecated, renamed to parse */
			compile: Parser.parse,
	
			/**
			 *	mask.parse(template) -> MaskDOM
			 * - template (String): string to be parsed into MaskDOM
			 *
			 * Create MaskDOM from Mask markup
			 **/
			parse: Parser.parse,
	
			build: builder_build,
			/**
			 * mask.registerHandler(tagName, tagHandler) -> void
			 * - tagName (String): Any tag name. Good practice for custom handlers it when its name begins with ':'
			 * - tagHandler (Function|Object):
			 *
			 *	When Mask.Builder matches the tag binded to this tagHandler, it -
			 *	creates instances of the class(in case of Function) or uses specified object.
			 *	Shallow copies -
			 *		.nodes(MaskDOM) - Template Object of this node
			 *		.attr(Object) - Attributes of this node
			 *	And calls
			 *		.renderStart(model, cntx, container)
			 *		.renderEnd(elements, model, cntx, container)
			 *
			 *	Custom Handler now can handle rendering of underlined nodes.
			 *	The most simple example to continue rendering is:
			 *	mask.render(this.nodes, model, container, cntx);
			 **/
			registerHandler: function (tagName, TagHandler) {
				custom_Tags[tagName] = TagHandler;
			},
			/**
			 *	mask.getHandler(tagName) -> Function | Object
			 * - tagName (String):
			 *
			 *	Get Registered Handler
			 **/
			getHandler: function (tagName) {
				return tagName != null
					? custom_Tags[tagName]
					: custom_Tags;
			},
	
	
			/**
			 * mask.registerAttrHandler(attrName, Handler) -> void
			 * - attrName (String): any attribute string name
			 * - Handler (Function)
			 *
			 * Handler Interface, <i>(similar to Utility Interface)</i>
			 * ``` customAttribute(maskNode, attributeValue, model, cntx, element, controller) ```
			 *
			 * You can change do any changes to maskNode's template, current element value,
			 * controller, model.
			 *
			 * Note: Attribute wont be set to an element.
			 **/
			registerAttrHandler: function(attrName, Handler){
				custom_Attributes[attrName] = Handler;
			},
			
			getAttrHandler: function(attrName){
				return attrName != null
					? custom_Attributes[attrName]
					: custom_Attributes;
			},
			/**
			 *	mask.registerUtility(utilName, fn) -> void
			 * - utilName (String): name of the utility
			 * - fn (Function): util handler
			 *
			 *	Register Utility Function. Template Example: '~[myUtil: value]'
			 *		utility interface:
			 *	```
			 *	function(value, model, type, cntx, element, name);
			 *	```
			 *
			 *	- value (String): string from interpolation part after util definition
			 *	- model (Object): current Model
			 *	- type (String): 'attr' or 'node' - tells if interpolation is in TEXTNODE value or Attribute
			 *	- cntx (Object): Context Object
			 *	- element (HTMLNode): current html node
			 *	- name (String): If interpolation is in node attribute, then this will contain attribute name
			 *
			 **/
			registerUtility: function (utilityName, fn) {
				custom_Utils[utilityName] = fn;
			},
			
			getUtility: function(util){
				return util != null
					? custom_Utils[util]
					: custom_Utils;
			},
			////// time for remove
			//////serialize: function (template) {
			//////	return Parser.cleanObject(this.compile(template, true));
			//////},
			//////deserialize: function (serialized) {
			//////	var i, key, attr;
			//////	if (serialized instanceof Array) {
			//////		for (i = 0; i < serialized.length; i++) {
			//////			this.deserialize(serialized[i]);
			//////		}
			//////		return serialized;
			//////	}
			//////	if (serialized.content != null) {
			//////		if (serialized.content.template != null) {
			//////			serialized.content = Parser.toFunction(serialized.content.template);
			//////		}
			//////		return serialized;
			//////	}
			//////	if (serialized.attr != null) {
			//////		attr = serialized.attr;
			//////		for (key in attr) {
			//////			if (hasOwnProp.call(attr, key) === true){
			//////				if (attr[key].template == null) {
			//////					continue;
			//////				}
			//////				attr[key] = Parser.toFunction(attr[key].template);
			//////			}
			//////		}
			//////	}
			//////	if (serialized.nodes != null) {
			//////		this.deserialize(serialized.nodes);
			//////	}
			//////	return serialized;
			//////},
			/**
			 * mask.clearCache([key]) -> void
			 * - key (String): template to remove from cache
			 *
			 *	Mask Caches all templates, so this function removes
			 *	one or all templates from cache
			 **/
			clearCache: function(key){
				if (typeof key === 'string'){
					delete cache[key];
				}else{
					cache = {};
				}
			},
			//- removed as needed interface can be implemented without this
			//- ICustomTag: ICustomTag,
	
			/** deprecated
			 *	mask.ValueUtils -> Object
			 *
			 *	see Utils.Condition Object instead
			 **/
			ValueUtils: {
				condition: ConditionUtil.condition,
				out: ConditionUtil
			},
	
			Utils: {
				Condition: ConditionUtil,
				
				/**
				 * mask.Util.Expression -> ExpressionUtil
				 *
				 * [[ExpressionUtil]]
				 **/
				Expression: ExpressionUtil,
	
				/**
				 *	mask.Util.getProperty(model, path) -> value
				 *	- model (Object | value)
				 *	- path (String): Property or dot chainable path to retrieve the value
				 *		if path is '.' returns model itself
				 *
				 *	```javascript
				 *	mask.render('span > ~[.]', 'Some string') // -> <span>Some string</span>
				 *	```
				 **/
				getProperty: util_getProperty,
				
				ensureTmplFn: Parser.ensureTemplateFunction
			},
			Dom: Dom,
			plugin: function(source){
				eval(source);
			},
			on: function(event, fn){
				if (listeners == null){
					listeners = {};
				}
	
				(listeners[event] || (listeners[event] = [])).push(fn);
			},
	
			/*
			 *	Stub for reload.js, which will be used by includejs.autoreload
			 */
			delegateReload: function(){},
	
			/**
			 *	mask.setInterpolationQuotes(start,end) -> void
			 * -start (String): Must contain 2 Characters
			 * -end (String): Must contain 1 Character
			 *
			 * Starting from 0.6.9 mask uses ~[] for string interpolation.
			 * Old '#{}' was changed to '~[]', while template is already overloaded with #, { and } usage.
			 *
			 **/
			setInterpolationQuotes: Parser.setInterpolationQuotes
		};
	
	
	/**	deprecated
	 *	mask.renderDom(template[, model, container, cntx]) -> container
	 *
	 * Use [[mask.render]] instead
	 * (to keep backwards compatiable)
	 **/
	Mask.renderDom = Mask.render;
	
	
	// source ../src/mock/mock.js
	
	// source Meta.js
	var Meta = (function(){
		
		var seperator_CODE = 30,
			seperator_CHAR = String.fromCharCode(seperator_CODE);
		
		function val_stringify(mix) {
			if (typeof mix !== 'string') 
				return val_stringify(JSON.stringify(mix));
			
			return mix;
		}
		
		var parser_Index,
			parser_Length,
			parser_String;
			
		function parse_ID(json){
			
			if (parser_String[parser_Index] !== '#') {
				return;
			}
			parser_Index++;
			
			var end = parser_String.indexOf(seperator_CHAR);
			
			if (end === -1) {
				end = parser_String.length;
			}
			
			json.ID = parseInt(parser_String.substring(parser_Index, end), 10);
			parser_Index = end;
		}
		
		function parse_property(json) {
			if (parser_Index > parser_Length - 5) {
				return false;
			}
			
			if (parser_String[parser_Index++] !== seperator_CHAR || parser_String[parser_Index++] !== ' ') {
				console.warn('[meta parser] "SB " Expected');
				
				return false;
			}
			
			
			
			var index = parser_Index,
				str = parser_String;
			
			var colon = str.indexOf(':', index),
				key = str.substring(index, colon);
				
			var end = str.indexOf(seperator_CHAR + ' ', colon),
				value = str.substring(colon + 1, end);
				
			
			if (key === 'attr') {
				value = JSON.parse(value);
			}
			
			json[key] = value;
			
			parser_Index = end;
			return true;
		}
		
		
		return {
			stringify: function(json, info){
				
				if (info.mode === 'server') 
					return '';
				
				
				var	type = info.type,
					isSingle = info.single,
				
					string = '<!--' + type;
					
					if (json.ID) 
						string += '#' + json.ID;
					
					string += seperator_CHAR + ' ';
				
				for (var key in json) {
					if (key === 'ID') 
						continue;
					
					if (json[key] == null) 
						continue;
					
					
					string += key
						+ ':'
						+ val_stringify(json[key])
						+ seperator_CHAR
						+ ' ';
				}
				
				if (isSingle)
					string += '/';
					
				string += '-->';
				
				return string;
			},
			
			close: function(json, info){
				if (info.mode === 'server') 
					return '';
				
				
				return '<!--/'
					+ info.type
					+ (json.ID ? '#' + json.ID : '')
					+ '-->';
			},
			
			parse: function (string){
				parser_Index = 0;
				parser_String = string;
				parser_Length = string.length;
				
				
				var json = {},
					c = string[parser_Index];
					
				if (c === '/') {
					json.end = true;
					parser_Index++;
				}
				
				json.type = string[parser_Index++];
				
				
				parse_ID(json);
				
				while (parse_property(json)) {
					
					if (parser_Index > parser_Length - 2 && string[parser_Index] === '/') {
						json.single = true;
					}
				}
				
				return json;
			}
		};
	}());
	// source attr-handler.js
	var mock_AttrHandler = (function() {
		
		var __counter = 0;
		
		function Attr(attrName, attrValue) {
			this.meta = {
				ID : ++__counter,
				name : attrName,
				value : attrValue
			};
		}
		
		Attr.prototype = {
			toString: function(){
				var json = this.meta,
					info = {
						type: 'a',
						single: true
					};
					
				return Meta.stringify(json, info);
			}
		};
		
		return {
			create: function(attrName, fn, mode) {
				
				return function(node, value, model, cntx, tag, controller, container){
					
					if (mode !== 'server') {
						container.insertBefore(new Attr(attrName, value), tag);
					}
					
					if (mode !== 'client') {
						return fn(node, value, model, cntx, tag, controller);
					}
					
					
					return '';
				};
			}
		};
	
	}());
	// source tag-handler.js
	var mock_TagHandler = (function() {
		
		function EmptyHandler(attrName, attrValue) {}
		
		EmptyHandler.prototype = {
			render: function(){},
			mode: 'client'
		};
		
		return {
			create: function(tagName, Compo, mode){
				
				if (mode === 'client' || Compo.prototype.mode === 'client') {
					return EmptyHandler;
				}
				
				Compo.prototype.mode = mode;
				return Compo;
				
			},
			
			
		};
			
	}());
	// source util-handler.js
	var mock_UtilHandler = (function() {
		
		var __counter = 0;
	
		function Util(type, utilName, value, attrName) {
			this.meta = {
				ID: ++__counter,
				utilType: type,
				utilName: utilName,
				
				value: value,
				attrName: attrName
			};
		}
	
		Util.prototype = {
			toString: function() {
				var json = this.meta,
					info = {
						type: 'u',
						single: this.firstChild == null
					},
					string = Meta.stringify(json, info);
				
				var element = this.firstChild;
				while (element != null) {
					string += element.toString();
					
					element = element.nextNode;
				}
				
				if (this.firstChild != null) {
					string += Meta.close(this);
				}
				
				return string;
			}
		};
		
	
		return {
			create: function(utilName, fn, mode) {
	
				return function(value, model, cntx, element, controller, attrName, type) {
	
					if (mode !== 'server') {
						element
							.parentNode
							.insertBefore(new Util(type, utilName, value, attrName), element);
					}
	
					if (mode !== 'client') {
						return fn(value, model, cntx, element, controller, attrName, type);
					}
	
	
					return '';
				};
			}
		};
	
	}());
	
	
	
	Mask.registerAttrHandler = function(attrName, fn, mode){
		
		if (mode == null) {
			custom_Attributes[attrName] = fn;
			return;
		}
		
		custom_Attributes[attrName] = mock_AttrHandler.create(attrName, fn, mode);
	};
	
	Mask.registerUtility = function(name, fn, mode){
		
		if (mode == null) {
			custom_Utils[name] = fn;
			return;
		}
		
		custom_Utils[name] = mock_UtilHandler.create(name, fn, mode);
	};
	
	Mask.registerHandler = function(tagName, compo, mode){
		if (mode == null) {
			custom_Tags[tagName] = compo;
			return;
		}
		
		custom_Tags[tagName] = mock_TagHandler.create(tagName, compo, mode);
	};
	
	// source ../../mask/src/formatter/stringify.lib.js
	(function(mask){
	
	
		// source stringify.js
		
		var stringify = (function() {
		
		
			var _minimizeAttributes,
				_indent,
				Dom = mask.Dom;
		
			function doindent(count) {
				var output = '';
				while (count--) {
					output += ' ';
				}
				return output;
			}
		
		
		
			function run(node, indent, output) {
		
				var outer, i;
		
				if (indent == null) {
					indent = 0;
				}
		
				if (output == null) {
					outer = true;
					output = [];
				}
		
				var index = output.length;
		
				if (node.type === Dom.FRAGMENT){
					node = node.nodes;
				}
		
				if (node instanceof Array) {
					for (i = 0; i < node.length; i++) {
						processNode(node[i], indent, output);
					}
				} else {
					processNode(node, indent, output);
				}
		
		
				var spaces = doindent(indent);
				for (i = index; i < output.length; i++) {
					output[i] = spaces + output[i];
				}
		
				if (outer) {
					return output.join(_indent === 0 ? '' : '\n');
				}
		
			}
		
			function processNode(node, currentIndent, output) {
				if (typeof node.content === 'string') {
					output.push(wrapString(node.content));
					return;
				}
		
				if (typeof node.content === 'function'){
					output.push(wrapString(node.content()));
					return;
				}
		
				if (isEmpty(node)) {
					output.push(processNodeHead(node) + ';');
					return;
				}
		
				if (isSingle(node)) {
					output.push(processNodeHead(node) + ' > ');
					run(getSingle(node), _indent, output);
					return;
				}
		
				output.push(processNodeHead(node) + '{');
				run(node.nodes, _indent, output);
				output.push('}');
				return;
			}
		
			function processNodeHead(node) {
				var tagName = node.tagName,
					_id = node.attr.id || '',
					_class = node.attr['class'] || '';
		
		
				if (typeof _id === 'function'){
					_id = _id();
				}
				if (typeof _class === 'function'){
					_class = _class();
				}
		
				if (_id) {
					if (_id.indexOf(' ') !== -1) {
						_id = '';
					} else {
						_id = '#' + _id;
					}
				}
		
				if (_class) {
					_class = '.' + _class.split(' ').join('.');
				}
		
				var attr = '';
		
				for (var key in node.attr) {
					if (key === 'id' || key === 'class') {
						// the properties was not deleted as this template can be used later
						continue;
					}
					var value = node.attr[key];
		
					if (typeof value === 'function'){
						value = value();
					}
		
					if (_minimizeAttributes === false || /\s/.test(value)){
						value = wrapString(value);
					}
		
					attr += ' ' + key + '=' + value;
				}
		
				if (tagName === 'div' && (_id || _class)) {
					tagName = '';
				}
		
				return tagName + _id + _class + attr;
			}
		
		
			function isEmpty(node) {
				return node.nodes == null || (node.nodes instanceof Array && node.nodes.length === 0);
			}
		
			function isSingle(node) {
				return node.nodes && (node.nodes instanceof Array === false || node.nodes.length === 1);
			}
		
			function getSingle(node) {
				if (node.nodes instanceof Array) {
					return node.nodes[0];
				}
				return node.nodes;
			}
		
			function wrapString(str) {
				if (str.indexOf('"') === -1) {
					return '"' + str.trim() + '"';
				}
		
				if (str.indexOf("'") === -1) {
					return "'" + str.trim() + "'";
				}
		
				return '"' + str.replace(/"/g, '\\"').trim() + '"';
			}
		
			/**
			 *	- settings (Number | Object) - Indention Number (0 - for minification)
			 **/
			return function(input, settings) {
				if (typeof input === 'string') {
					input = mask.parse(input);
				}
		
		
				if (typeof settings === 'number'){
					_indent = settings;
					_minimizeAttributes = _indent === 0;
				}else{
					_indent = settings && settings.indent || 4;
					_minimizeAttributes = _indent === 0 || settings && settings.minimizeAttributes;
				}
		
		
				return run(input);
			};
		}());
		
	
		mask.stringify = stringify;
	
	}(Mask));
	

	
	/* Handlers */

	// source ../../mask/src/handlers/sys.js
	(function(mask) {
	
		function Sys() {
			this.attr = {
				'debugger': null,
				'use': null,
				'repeat': null,
				'if': null,
				'else': null,
				'each': null,
				'log': null,
				'visible': null
			};
		}
	
		mask.registerHandler('%', Sys);
	
		Sys.prototype = {
			constructor: Sys,
			renderStart: function(model, cntx, container) {
				var attr = this.attr;
	
				if (attr['use'] != null) {
					this.model = util_getProperty(model, attr['use']);
					return;
				}
	
				if (attr['debugger'] != null) {
					debugger;
					return;
				}
				
				if (attr['visible'] != null) {
					var state = ExpressionUtil.eval(attr.visible, model, cntx, this.parent);
					if (!state) {
						this.nodes = null;
					}
					return;
				}
	
				if (attr['log'] != null) {
					var key = attr.log,
						value = util_getProperty(model, key);
	
					console.log('Key: %s, Value: %s', key, value);
					return;
				}
	
				if (attr['repeat'] != null) {
					repeat(this, model, cntx, container);
				}
	
				this.model = model;
	
				if (attr['if'] != null) {
					var check = attr['if'];
	
					this.state = ConditionUtil.isCondition(check, model);
	
					if (!this.state) {
						this.nodes = null;
					}
					return;
				}
	
				if (attr['else'] != null) {
					var compos = this.parent.components,
						prev = compos && compos[compos.length - 1];
	
					if (prev != null && prev.compoName === '%' && prev.attr['if'] != null) {
	
						if (prev.state) {
							this.nodes = null;
						}
						return;
					}
					console.error('Previous Node should be "% if=\'condition\'"', prev, this.parent);
					return;
				}
	
				// foreach is deprecated
				if (attr['each'] != null || attr['foreach'] != null) {
					each(this, model, cntx, container);
				}
			},
			render: null
		};
	
	
		function each(compo, model, cntx, container){
			if (compo.nodes == null && typeof Compo !== 'undefined'){
				Compo.ensureTemplate(compo);
			}
	
			var prop = compo.attr.foreach || compo.attr.each,
				array = util_getProperty(model, prop),
				nodes = compo.nodes,
				item = null,
				indexAttr = compo.attr.index || 'index';
	
			compo.nodes = [];
			compo.template = nodes;
			compo.container = container;
			
			if (array == null) {
				var parent = compo;
				while (parent != null && array == null) {
					array = util_getProperty(parent, prop);
					parent = parent.parent;
				}
			}
	
			if (array == null || typeof array !== 'object' || array.length == null){
				// if DEBUG
				console.warn('List Model not exists', prop);
				// endif
				return;
			}
	
			for (var i = 0, x, length = array.length; i < length; i++) {
				x = compo_init(nodes, array[i], container, compo);
				x[indexAttr] = i;
				compo.nodes[i] = x;
			}
	
			for(var method in ListProto){
				compo[method] = ListProto[method];
			}
		}
	
		function repeat(compo, model, cntx, container) {
			var repeat = compo.attr.repeat.split('..'),
				index = +repeat[0],
				length = +repeat[1],
				template = compo.nodes,
				x;
	
			// if DEBUG
			(isNaN(index) || isNaN(length)) && console.error('Repeat attribute(from..to) invalid', compo.attr.repeat);
			// endif
	
			compo.nodes = [];
	
			for (var i = 0; index < length; index++) {
				x = compo_init(template, model, container, compo);
				x._repeatIndex = index;
	
				compo.nodes[i++] = x;
			}
		}
	
		function compo_init(nodes, model, container, parent) {
			var item = new Component();
			item.nodes = nodes;
			item.model = model;
			item.container = container;
			item.parent = parent;
	
			return item;
		}
	
	
		var ListProto = {
			append: function(model){
				var item;
				item = new Component();
				item.nodes = this.template;
				item.model = model;
	
				mask.render(item, model, null, this.container, this);
			}
		};
	
	}(Mask));
	
	// source ../../mask/src/handlers/utils.js
	(function(mask) {
	
		/**
		 *	:template
		 *
		 *	Child nodes wont be rendered. You can resolve it as custom component and get its nodes for some use
		 *
		 **/
	
		var TemplateCollection = {};
	
		mask.templates = TemplateCollection;
	
		mask.registerHandler(':template', TemplateHandler);
	
		function TemplateHandler() {}
		TemplateHandler.prototype.render = function() {
			if (this.attr.id == null) {
				console.warn('Template Should be defined with ID attribute for future lookup');
				return;
			}
	
			TemplateCollection[this.attr.id] = this.nodes;
		};
	
	
		mask.registerHandler(':import', ImportHandler);
	
		function ImportHandler() {}
		ImportHandler.prototype = {
			constructor: ImportHandler,
			attr: null,
			template: null,
	
			renderStart: function() {
				if (this.attr.id) {
	
					this.nodes = this.template;
	
					if (this.nodes == null) {
						this.nodes = TemplateCollection[this.attr.id];
					}
	
					// @TODO = optimize, not use jmask
					if (this.nodes == null) {
						var parent = this,
							template,
							selector = ':template[id='+this.attr.id+']';
	
						while (template == null && (parent = parent.parent) != null) {
							if (parent.nodes != null) {
								template = jmask(parent.nodes).filter(selector).get(0);
							}
						}
	
						if (template != null) {
							this.nodes = template.nodes;
						}
	
	
					}
	
					// @TODO = load template from remote
					if (this.nodes == null) {
						console.warn('Template could be not imported', this.attr.id);
					}
				}
			}
		};
	
	
		/**
		 *	:html
		 *
		 *	Shoud contain literal, that will be added as innerHTML to parents node
		 *
		 **/
		mask.registerHandler(':html', HTMLHandler);
	
		function HTMLHandler() {}
		HTMLHandler.prototype.render = function(model, cntx, container) {
	
			var html = jmask(this.nodes).text(model, cntx, this);
	
			if (!html) {
				console.warn('No HTML for node', this);
				return;
			}
	
			container.insertAdjacentHTML('beforeend', html);
	
		};
	
	}(Mask));
	

	// source ../../mask/src/libs/compo.js
	
	var Compo = exports.Compo = (function(mask){
		'use strict';
		// source ../src/scope-vars.js
		var domLib = global.jQuery || global.Zepto || global.$,
			Dom = mask.Dom,
			__array_slice = Array.prototype.slice,
			
			_mask_ensureTmplFnOrig = mask.Utils.ensureTmplFn;
		
		function _mask_ensureTmplFn(value) {
			if (typeof value !== 'string') {
				return value;
			}
			return _mask_ensureTmplFnOrig(value);
		}
		
		if (document != null && domLib == null){
			console.warn('jQuery / Zepto etc. was not loaded before compo.js, please use Compo.config.setDOMLibrary to define dom engine');
		}
		
	
		// source ../src/util/object.js
		function obj_extend(target, source){
			if (target == null){
				target = {};
			}
			if (source == null){
				return target;
			}
		
			for(var key in source){
				target[key] = source[key];
			}
		
			return target;
		}
		
		function obj_copy(object) {
			var copy = {};
		
			for (var key in object) {
				copy[key] = object[key];
			}
		
			return copy;
		}
		
		// source ../src/util/function.js
		function fn_proxy(fn, context) {
			
			return function(){
				return fn.apply(context, arguments);
			};
			
		}
		// source ../src/util/selector.js
		function selector_parse(selector, type, direction) {
			if (selector == null){
				console.warn('selector is null for type', type);
			}
		
			if (typeof selector === 'object'){
				return selector;
			}
		
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
					selector = new RegExp('\\b' + selector.substring(1) + '\\b');
					prop = 'attr';
					break;
				default:
					key = type === Dom.SET ? 'tagName' : 'compoName';
					break;
				}
			}
		
			if (direction === 'up') {
				nextKey = 'parent';
			} else {
				nextKey = type === Dom.SET ? 'nodes' : 'components';
			}
		
			return {
				key: key,
				prop: prop,
				selector: selector,
				nextKey: nextKey
			};
		}
		
		function selector_match(node, selector, type) {
			if (typeof selector === 'string') {
				if (type == null) {
					type = Dom[node.compoName ? 'CONTROLLER' : 'SET'];
				}
				selector = selector_parse(selector, type);
			}
		
			var obj = selector.prop ? node[selector.prop] : node;
			if (obj == null) {
				return false;
			}
		
			if (selector.selector.test != null) {
				if (selector.selector.test(obj[selector.key])) {
					return true;
				}
			} else {
				// == - to match int and string
				if (obj[selector.key] == selector.selector) {
					return true;
				}
			}
		
			return false;
		}
		
		// source ../src/util/traverse.js
		function find_findSingle(node, matcher) {
			if (node instanceof Array) {
				for (var i = 0, x, length = node.length; i < length; i++) {
					x = node[i];
					var r = find_findSingle(x, matcher);
					if (r != null) {
						return r;
					}
				}
				return null;
			}
		
			if (selector_match(node, matcher) === true) {
				return node;
			}
			return (node = node[matcher.nextKey]) && find_findSingle(node, matcher);
		}
		
		// source ../src/util/dom.js
		function dom_addEventListener(element, event, listener) {
			
			// allows custom events - in x-signal, for example
			if (domLib != null) {
				domLib(element).on(event, listener);
				return;
			}
			
			if (element.addEventListener != null) {
				element.addEventListener(event, listener, false);
				return;
			}
			if (element.attachEvent) {
				element.attachEvent("on" + event, listener);
			}
		}
		
		// source ../src/util/domLib.js
		/**
		 *	Combine .filter + .find
		 */
		
		function domLib_find($set, selector) {
			return $set.filter(selector).add($set.find(selector));
		}
		
		function domLib_on($set, type, selector, fn) {
		
			if (selector == null) {
				return $set.on(type, fn);
			}
		
			$set.on(type, selector, fn);
			$set.filter(selector).on(type, fn);
			return $set;
		}
		
	
		// source ../src/compo/children.js
		var Children_ = {
		
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
			select: function(component, compos) {
				for (var name in compos) {
					var data = compos[name],
						events = null,
						selector = null;
		
					if (data instanceof Array) {
						selector = data[0];
						events = data.splice(1);
					}
					if (typeof data === 'string') {
						selector = data;
					}
					if (data == null || selector == null) {
						console.error('Unknown component child', name, compos[name]);
						console.warn('Is this object shared within multiple compo classes? Define it in constructor!');
						return;
					}
		
					var index = selector.indexOf(':'),
						engine = selector.substring(0, index);
		
					engine = Compo.config.selectors[engine];
		
					if (engine == null) {
						component.compos[name] = component.$[0].querySelector(selector);
					} else {
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
			}
		};
		
		// source ../src/compo/events.js
		var Events_ = {
			on: function(component, events, $element) {
				if ($element == null) {
					$element = component.$;
				}
		
				var isarray = events instanceof Array,
					length = isarray ? events.length : 1;
		
				for (var i = 0, x; isarray ? i < length : i < 1; i++) {
					x = isarray ? events[i] : events;
		
					if (x instanceof Array) {
						// generic jQuery .on Arguments
		
						if (EventDecorator != null) {
							x[0] = EventDecorator(x[0]);
						}
		
						$element.on.apply($element, x);
						continue;
					}
		
		
					for (var key in x) {
						var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
							semicolon = key.indexOf(':'),
							type,
							selector;
		
						if (semicolon !== -1) {
							type = key.substring(0, semicolon);
							selector = key.substring(semicolon + 1).trim();
						} else {
							type = key;
						}
		
						if (EventDecorator != null) {
							type = EventDecorator(type);
						}
		
						domLib_on($element, type, selector, fn_proxy(fn, component));
					}
				}
			}
		},
			EventDecorator = null;
		
		// source ../src/compo/events.deco.js
		var EventDecos = (function() {
		
			var hasTouch = (function() {
				if (document == null) {
					return false;
				}
				if ('createTouch' in document) {
					return true;
				}
				try {
					return !!document.createEvent('TouchEvent').initTouchEvent;
				} catch (error) {
					return false;
				}
			}());
		
			return {
		
				'touch': function(type) {
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
		
		}());
		
		// source ../src/compo/pipes.js
		var Pipes = (function() {
		
		
			mask.registerAttrHandler('x-pipe-signal', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';');
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i].trim();
					if (x === '') {
						continue;
					}
		
					var event = x.substring(0, x.indexOf(':')),
						handler = x.substring(x.indexOf(':') + 1).trim(),
						dot = handler.indexOf('.'),
						pipe, signal;
		
					if (dot === -1) {
						console.error('define pipeName "click: pipeName.pipeSignal"');
						return;
					}
		
					pipe = handler.substring(0, dot);
					signal = handler.substring(++dot);
		
					var Handler = _handler(pipe, signal);
		
		
					// if DEBUG
					!event && console.error('Signal: event type is not set', attrValue);
					// endif
		
		
					if (EventDecorator != null) {
						event = EventDecorator(event);
					}
		
					dom_addEventListener(element, event, Handler);
		
				}
			});
		
			function _handler(pipe, signal) {
				return function(){
					new Pipe(pipe).emit(signal);
				};
			}
		
			var Collection = {};
		
		
			function pipe_attach(pipeName, controller) {
				if (controller.pipes[pipeName] == null) {
					console.error('Controller has no pipes to be added to collection', pipeName, controller);
					return;
				}
		
				if (Collection[pipeName] == null) {
					Collection[pipeName] = [];
				}
				Collection[pipeName].push(controller);
			}
		
			function pipe_detach(pipeName, controller) {
				var pipe = Collection[pipeName],
					i = pipe.length;
		
				while (--i) {
					if (pipe[i] === controller) {
						pipe.splice(i, 1);
						i++;
					}
				}
		
			}
		
			function controller_remove() {
				var	controller = this,
					pipes = controller.pipes;
				for (var key in pipes) {
					pipe_detach(key, controller);
				}
			}
		
			function controller_add(controller) {
				var pipes = controller.pipes;
		
				// if DEBUG
				if (pipes == null) {
					console.error('Controller has no pipes', controller);
					return;
				}
				// endif
		
				for (var key in pipes) {
					pipe_attach(key, controller);
				}
		
				Compo.attachDisposer(controller, controller_remove.bind(controller));
			}
		
			function Pipe(pipeName) {
				if (this instanceof Pipe === false) {
					return new Pipe(pipeName);
				}
				this.pipeName = pipeName;
		
				return this;
			}
			Pipe.prototype = {
				constructor: Pipe,
				emit: function(signal, args){
					var controllers = Collection[this.pipeName],
						pipeName = this.pipeName;
					if (controllers == null) {
						console.warn('Pipe.emit: No signals were bound to a Pipe', pipeName);
						return;
					}
		
					var i = controllers.length,
						controller, slots, slot, called;
		
					while (--i !== -1) {
						controller = controllers[i];
						slots = controller.pipes[pipeName];
		
						if (slots == null) {
							continue;
						}
		
						slot = slots[signal];
						if (typeof slot === 'function') {
							slot.apply(controller, args);
							called = true;
						}
					}
		
					// if DEBUG
					called !== true && console.warn('No piped slot found for a signal', signal, pipeName);
					// endif
				}
			};
		
			Pipe.addController = controller_add;
			Pipe.removeController = controller_remove;
		
			return {
				addController: controller_add,
				removeController: controller_remove,
		
				emit: function(pipeName, signal, args) {
					Pipe(pipeName).emit(signal, args);
				},
				pipe: Pipe
			};
		
		}());
		
	
		// source ../src/compo/anchor.js
		
		/**
		 *	Get component that owns an element
		 **/
		
		var Anchor = (function(){
		
			var _cache = {};
		
			return {
				create: function(compo){
					if (compo.ID == null){
						console.warn('Component should have an ID');
						return;
					}
		
					_cache[compo.ID] = compo;
				},
				resolveCompo: function(element){
					if (element == null){
						return null;
					}
		
					var findID, currentID, compo;
					do {
		
						currentID = element.getAttribute('x-compo-id');
		
		
						if (currentID) {
		
							if (findID == null) {
								findID = currentID;
							}
		
							compo = _cache[currentID];
		
							if (compo != null) {
								compo = Compo.find(compo, {
									key: 'ID',
									selector: findID,
									nextKey: 'components'
								});
		
								if (compo != null) {
									return compo;
								}
							}
		
						}
		
						element = element.parentNode;
		
					}while(element && element.nodeType === 1);
		
		
					// if DEBUG
					findID && console.warn('No controller for ID', findID);
					// endif
					return null;
				},
				removeCompo: function(compo){
					if (compo.ID == null){
						return;
					}
					delete _cache[compo.ID];
				}
			};
		
		}());
		
		// source ../src/compo/Compo.js
		var Compo = (function() {
		
			function Compo(controller) {
				if (this instanceof Compo){
					// used in Class({Base: Compo})
					return null;
				}
		
				var klass;
		
				if (controller == null){
					controller = {};
				}
		
				if (controller.attr != null) {
					
					for (var key in controller.attr) {
						controller.attr[key] = _mask_ensureTmplFn(controller.attr[key]);
					}
					
				}
				
				var slots = controller.slots;
				if (slots != null) {
					for (var key in slots) {
						if (typeof slots[key] === 'string'){
							//if DEBUG
							typeof controller[slots[key]] !== 'function' && console.error('Not a Function @Slot.',slots[key]);
							// endif
							slots[key] = controller[slots[key]];
						}
					}
				}
				
				if (controller.hasOwnProperty('constructor')){
					klass = controller.constructor;
				}
		
		
				klass = compo_createConstructor(klass, controller);
		
				if (klass == null){
					klass = function CompoBase(){};
				}
		
				for(var key in Proto){
					if (controller[key] == null){
						controller[key] = Proto[key];
					}
					controller['base_' + key] = Proto[key];
				}
		
				klass.prototype = controller;
		
				controller = null;
		
				return klass;
			}
		
			// source Compo.util.js
			function compo_dispose(compo) {
				if (compo.dispose != null) {
					compo.dispose();
				}
			
				Anchor.removeCompo(compo);
			
				var i = 0,
					compos = compo.components,
					length = compos && compos.length;
			
				if (length) {
					for (; i < length; i++) {
						compo_dispose(compos[i]);
					}
				}
			}
			
			function compo_ensureTemplate(compo) {
				if (compo.nodes != null) {
					return;
				}
				
				if (compo.attr.template != null) {
					compo.template = compo.attr.template;
					
					delete compo.attr.template;
				}
				
				var template = compo.template;
				
				if (typeof template == null) {
					return;
				}
				
			
				if (typeof template === 'string') {
					if (template[0] === '#') {
						var node = document.getElementById(template.substring(1));
						if (node == null) {
							console.error('Template holder not found by id:', template);
							return;
						}
						template = node.innerHTML;
					}
					template = mask.parse(template);
				}
			
				if (typeof template === 'object') {
					compo.nodes = template;
				}
			}
			
			function compo_containerArray() {
				var arr = [];
				arr.appendChild = function(child) {
					this.push(child);
				};
				return arr;
			}
			
			function compo_attachDisposer(controller, disposer) {
			
				if (typeof controller.dispose === 'function') {
					var previous = controller.dispose;
					controller.dispose = function(){
						disposer.call(this);
						previous.call(this);
					};
			
					return;
				}
			
				controller.dispose = disposer;
			}
			
			
			function compo_createConstructor(ctor, proto) {
				var compos = proto.compos,
					pipes = proto.pipes,
					attr = proto.attr;
					
				if (compos == null && pipes == null && proto.attr == null) {
					return ctor;
				}
			
				/* extend compos / attr to keep
				 * original prototyped values untouched
				 */
				return function CompoBase(){
			
					if (compos != null) {
						// use this.compos instead of compos from upper scope
						// : in case compos from proto was extended after
						this.compos = obj_copy(this.compos);
					}
			
					if (pipes != null) {
						Pipes.addController(this);
					}
					
					if (attr != null) {
						this.attr = obj_copy(this.attr);
					}
			
					if (typeof ctor === 'function') {
						ctor.call(this);
					}
				};
			}
			
			// source Compo.static.js
			obj_extend(Compo, {
				create: function(controller){
					var klass;
			
					if (controller == null){
						controller = {};
					}
			
					if (controller.hasOwnProperty('constructor')){
						klass = controller.constructor;
					}
			
					if (klass == null){
						klass = function CompoBase(){};
					}
			
					for(var key in Proto){
						if (controller[key] == null){
							controller[key] = Proto[key];
						}
						controller['base_' + key] = Proto[key];
					}
			
			
					klass.prototype = controller;
			
			
					return klass;
				},
			
				/* obsolete */
				render: function(compo, model, cntx, container) {
			
					compo_ensureTemplate(compo);
			
					var elements = [];
			
					mask.render(compo.tagName == null ? compo.nodes : compo, model, cntx, container, compo, elements);
			
					compo.$ = domLib(elements);
			
					if (compo.events != null) {
						Events_.on(compo, compo.events);
					}
					if (compo.compos != null) {
						Children_.select(compo, compo.compos);
					}
			
					return compo;
				},
			
				initialize: function(compo, model, cntx, container, parent) {
					
					var compoName;
			
					if (container == null){
						if (cntx && cntx.nodeType != null){
							container = cntx;
							cntx = null;
						}else if (model && model.nodeType != null){
							container = model;
							model = null;
						}
					}
			
					if (typeof compo === 'string'){
						compoName = compo;
						
						compo = mask.getHandler(compoName);
						if (!compo){
							console.error('Compo not found:', compo);
						}
					}
			
					var node = {
						controller: compo,
						type: Dom.COMPONENT,
						tagName: compoName
					};
			
					if (parent == null && container != null){
						parent = Anchor.resolveCompo(container);
					}
			
					if (parent == null){
						parent = new Dom.Component();
					}
			
					var dom = mask.render(node, model, cntx, null, parent),
						instance = parent.components[parent.components.length - 1];
			
					if (container != null){
						container.appendChild(dom);
			
						Compo.signal.emitIn(instance, 'domInsert');
					}
			
					return instance;
				},
			
				dispose: function(compo) {
					if (typeof compo.dispose === 'function') {
						compo.dispose();
					}
			
			
					var i = 0,
						compos = compo.components,
						length = compos && compos.length;
			
					if (length) {
						for (; i < length; i++) {
							Compo.dispose(compos[i]);
						}
					}
				},
			
				find: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(compo, selector){
					return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
			
				ensureTemplate: compo_ensureTemplate,
				attachDisposer: compo_attachDisposer,
			
				config: {
					selectors: {
						'$': function(compo, selector) {
							var r = domLib_find(compo.$, selector)
							// if DEBUG
							r.length === 0 && console.error('Compo Selector - element not found -', selector, compo);
							// endif
							return r;
						},
						'compo': function(compo, selector) {
							var r = Compo.find(compo, selector);
							if (r == null) {
								console.error('Compo Selector - component not found -', selector, compo);
							}
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
					setDOMLibrary: function(lib) {
						domLib = lib;
					},
			
			
					eventDecorator: function(mix){
						if (typeof mix === 'function') {
							EventDecorator = mix;
							return;
						}
						if (typeof mix === 'string') {
							EventDecorator = EventDecos[mix];
							return;
						}
						if (typeof mix === 'boolean' && mix === false) {
							EventDecorator = null;
							return;
						}
					}
			
				},
			
				//pipes: Pipes,
				pipe: Pipes.pipe
			});
			
			
		
			var Proto = {
				type: Dom.CONTROLLER,
				
				tagName: null,
				compoName: null,
				nodes: null,
				attr: null,
				
				slots: null,
				pipes: null,
				
				compos: null,
				events: null,
				
				onRenderStart: null,
				onRenderEnd: null,
				render: null,
				renderStart: function(model, cntx, container){
		
					if (arguments.length === 1 && model != null && model instanceof Array === false && model[0] != null){
						model = arguments[0][0];
						cntx = arguments[0][1];
						container = arguments[0][2];
					}
		
		
					if (typeof this.onRenderStart === 'function'){
						this.onRenderStart(model, cntx, container);
					}
		
					if (this.model == null){
						this.model = model;
					}
		
					if (this.nodes == null){
						compo_ensureTemplate(this);
					}
		
				},
				renderEnd: function(elements, model, cntx, container){
					if (arguments.length === 1 && elements instanceof Array === false){
						elements = arguments[0][0];
						model = arguments[0][1];
						cntx = arguments[0][2];
						container = arguments[0][3];
					}
		
					Anchor.create(this, elements);
		
					this.$ = domLib(elements);
		
					if (this.events != null) {
						Events_.on(this, this.events);
					}
		
					if (this.compos != null) {
						Children_.select(this, this.compos);
					}
		
					if (typeof this.onRenderEnd === 'function'){
						this.onRenderEnd(elements, model, cntx, container);
					}
				},
				appendTo: function(x) {
					
					var element = typeof x === 'string' ? document.querySelector(x) : x;
					
		
					if (element == null) {
						console.warn('Compo.appendTo: parent is undefined. Args:', arguments);
						return this;
					}
		
					for (var i = 0; i < this.$.length; i++) {
						element.appendChild(this.$[i]);
					}
		
					this.emitIn('domInsert');
					return this;
				},
				append: function(template, model, selector) {
					var parent;
		
					if (this.$ == null) {
						var dom = typeof template === 'string' ? mask.compile(template) : template;
		
						parent = selector ? find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down')) : this;
						if (parent.nodes == null) {
							this.nodes = dom;
							return this;
						}
		
						parent.nodes = [this.nodes, dom];
		
						return this;
					}
					var array = mask.render(template, model, null, compo_containerArray(), this);
		
					parent = selector ? this.$.find(selector) : this.$;
					for (var i = 0; i < array.length; i++) {
						parent.append(array[i]);
					}
		
					this.emitIn('domInsert');
					//- Shots.emit(this, 'DOMInsert');
					return this;
				},
				find: function(selector){
					return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'down'));
				},
				closest: function(selector){
					return find_findSingle(this, selector_parse(selector, Dom.CONTROLLER, 'up'));
				},
				on: function() {
					var x = Array.prototype.slice.call(arguments);
					if (arguments.length < 3) {
						console.error('Invalid Arguments Exception @use .on(type,selector,fn)');
						return this;
					}
		
					if (this.$ != null) {
						Events_.on(this, [x]);
					}
		
		
					if (this.events == null) {
						this.events = [x];
					} else if (this.events instanceof Array) {
						this.events.push(x);
					} else {
						this.events = [x, this.events];
					}
					return this;
				},
				remove: function() {
					if (this.$ != null){
						this.$.remove();
						
						var parents = this.parent && this.parent.elements;
						if (parents != null) {
							for (var i = 0, x, imax = parents.length; i < imax; i++){
								x = parents[i];
								
								for (var j = 0, jmax = this.$.length; j < jmax; j++){
									if (x === this.$[j]){
										parents.splice(i, 1);
										
										i--;
										imax--;
									}
									
								}
								
							}
						}
			
						this.$ = null;
					}
		
					compo_dispose(this);
		
					var components = this.parent && this.parent.components;
					if (components != null) {
						var i = components.indexOf(this);
		
						if (i === -1){
							console.warn('Compo::remove - parent doesnt contains me', this);
							return this;
						}
		
						components.splice(i, 1);
					}
					
					return this;
				},
		
				slotState: function(slotName, isActive){
					Compo.slot.toggle(this, slotName, isActive);
				},
		
				signalState: function(signalName, isActive){
					Compo.signal.toggle(this, signalName, isActive);
				},
		
				emitOut: function(signalName /* args */){
					Compo.signal.emitOut(this, signalName, this, arguments.length > 1 ? __array_slice.call(arguments, 1) : null);
				},
		
				emitIn: function(signalName /* args */){
					Compo.signal.emitIn(this, signalName, this, arguments.length > 1 ? __array_slice.call(arguments, 1) : null);
				}
			};
		
			Compo.prototype = Proto;
		
		
			return Compo;
		}());
		
		// source ../src/compo/signals.js
		(function() {
		
			/**
			 *	Mask Custom Attribute
			 *	Bind Closest Controller Handler Function to dom event(s)
			 */
		
			mask.registerAttrHandler('x-signal', function(node, attrValue, model, cntx, element, controller) {
		
				var arr = attrValue.split(';'),
					signals = '';
				for (var i = 0, x, length = arr.length; i < length; i++) {
					x = arr[i].trim();
					if (x === '') {
						continue;
					}
		
					var event = x.substring(0, x.indexOf(':')),
						handler = x.substring(x.indexOf(':') + 1).trim(),
						Handler = _createListener(controller, handler);
		
		
					// if DEBUG
					!event && console.error('Signal: event type is not set', attrValue);
					// endif
		
					if (Handler) {
		
						if (EventDecorator != null) {
							event = EventDecorator(event);
						}
		
						signals += ',' + handler + ',';
						dom_addEventListener(element, event, Handler);
					}
		
					// if DEBUG
					!Handler && console.warn('No slot found for signal', handler, controller);
					// endif
				}
		
				if (signals !== '') {
					element.setAttribute('data-signals', signals);
				}
		
			}, 'client');
		
			// @param sender - event if sent from DOM Event or CONTROLLER instance
			function _fire(controller, slot, sender, args, direction) {
				
				if (controller == null) {
					return false;
				}
				
				var found = false,
					fn = controller.slots != null && controller.slots[slot];
					
				if (typeof fn === 'string') {
					fn = controller[fn];
				}
		
				if (typeof fn === 'function') {
					found = true;
					
					var isDisabled = controller.slots.__disabled != null && controller.slots.__disabled[slot];
		
					if (isDisabled !== true) {
		
						var result = args == null
								? fn.call(controller, sender)
								: fn.apply(controller, [sender].concat(args));
		
						if (result === false) {
							return true;
						}
						
						if (result != null && typeof result === 'object' && result.length != null) {
							args = result;
						}
					}
				}
		
				if (direction === -1 && controller.parent != null) {
					return _fire(controller.parent, slot, sender, args, direction) || found;
				}
		
				if (direction === 1 && controller.components != null) {
					var compos = controller.components,
						imax = compos.length,
						i = 0,
						r;
					for (; i < imax; i++) {
						r = _fire(compos[i], slot, sender, args, direction);
						
						!found && (found = r);
					}
				}
				
				return found;
			}
		
			function _hasSlot(controller, slot, direction, isActive) {
				if (controller == null) {
					return false;
				}
		
				var slots = controller.slots;
		
				if (slots != null && slots[slot] != null) {
					if (typeof slots[slot] === 'string') {
						slots[slot] = controller[slots[slot]];
					}
		
					if (typeof slots[slot] === 'function') {
						if (isActive === true) {
							if (slots.__disabled == null || slots.__disabled[slot] !== true) {
								return true;
							}
						} else {
							return true;
						}
					}
				}
		
				if (direction === -1 && controller.parent != null) {
					return _hasSlot(controller.parent, slot, direction);
				}
		
				if (direction === 1 && controller.components != null) {
					for (var i = 0, length = controller.components.length; i < length; i++) {
						if (_hasSlot(controller.components[i], slot, direction)) {
							return true;
						}
		
					}
				}
				return false;
			}
		
			function _createListener(controller, slot) {
		
				if (_hasSlot(controller, slot, -1) === false) {
					return null;
				}
		
				return function(event) {
					var args = arguments.length > 1 ? __array_slice.call(arguments, 1) : null;
					
					_fire(controller, slot, event, args, -1);
				};
			}
		
			function __toggle_slotState(controller, slot, isActive) {
				var slots = controller.slots;
				if (slots == null || slots.hasOwnProperty(slot) === false) {
					return;
				}
		
				if (slots.__disabled == null) {
					slots.__disabled = {};
				}
		
				slots.__disabled[slot] = isActive === false;
			}
		
			function __toggle_slotStateWithChilds(controller, slot, isActive) {
				__toggle_slotState(controller, slot, isActive);
		
				if (controller.components != null) {
					for (var i = 0, length = controller.components.length; i < length; i++) {
						__toggle_slotStateWithChilds(controller.components[i], slot, isActive);
					}
				}
			}
		
			function __toggle_elementsState(controller, slot, isActive) {
				if (controller.$ == null) {
					console.warn('Controller has no elements to toggle state');
					return;
				}
		
				domLib() //
				.add(controller.$.filter('[data-signals]')) //
				.add(controller.$.find('[data-signals]')) //
				.each(function(index, node) {
					var signals = node.getAttribute('data-signals');
		
					if (signals != null && signals.indexOf(slot) !== -1) {
						node[isActive === true ? 'removeAttribute' : 'setAttribute']('disabled', 'disabled');
					}
				});
			}
		
			function _toggle_all(controller, slot, isActive) {
		
				var parent = controller,
					previous = controller;
				while ((parent = parent.parent) != null) {
					__toggle_slotState(parent, slot, isActive);
		
					if (parent.$ == null || parent.$.length === 0) {
						// we track previous for changing elements :disable state
						continue;
					}
		
					previous = parent;
				}
		
				__toggle_slotStateWithChilds(controller, slot, isActive);
				__toggle_elementsState(previous, slot, isActive);
		
			}
		
			function _toggle_single(controller, slot, isActive) {
				__toggle_slotState(controller, slot, isActive);
		
				if (!isActive && (_hasSlot(controller, slot, -1, true) || _hasSlot(controller, slot, 1, true))) {
					// there are some active slots; do not disable elements;
					return;
				}
				__toggle_elementsState(controller, slot, isActive);
			}
		
		
		
			obj_extend(Compo, {
				signal: {
					toggle: _toggle_all,
		
					// to parent
					emitOut: function(controller, slot, sender, args) {
						var captured = _fire(controller, slot, sender, args, -1);
						
						// if DEBUG
						!captured && console.warn('Signal %c%s','font-weight:bold;', slot, 'was not captured');
						// endif
						
					},
					// to children
					emitIn: function(controller, slot, sender, args) {
						_fire(controller, slot, sender, args, 1);
					},
		
					enable: function(controller, slot) {
						_toggle_all(controller, slot, true);
					},
					disable: function(controller, slot) {
						_toggle_all(controller, slot, false);
					}
				},
				slot: {
					toggle: _toggle_single,
					enable: function(controller, slot) {
						_toggle_single(controller, slot, true);
					},
					disable: function(controller, slot) {
						_toggle_single(controller, slot, false);
					},
					invoke: function(controller, slot, event, args) {
						var slots = controller.slots;
						if (slots == null || typeof slots[slot] !== 'function') {
							console.error('Slot not found', slot, controller);
							return null;
						}
		
						if (args == null) {
							return slots[slot].call(controller, event);
						}
		
						return slots[slot].apply(controller, [event].concat(args));
					},
		
				}
		
			});
		
		}());
		
	
		// source ../src/jcompo/jCompo.js
		(function(){
		
			if (domLib == null || domLib.fn == null){
				return;
			}
		
		
			domLib.fn.compo = function(selector){
				if (this.length === 0){
					return null;
				}
				var compo = Anchor.resolveCompo(this[0]);
		
				if (selector == null){
					return compo;
				}
		
				return find_findSingle(compo, selector_parse(selector, Dom.CONTROLLER, 'up'));
			};
		
			domLib.fn.model = function(selector){
				var compo = this.compo(selector);
				if (compo == null){
					return null;
				}
				var model = compo.model;
				while(model == null && compo.parent){
					compo = compo.parent;
					model = compo.model;
				}
				return model;
			};
		
		}());
		
	
		// source ../src/handler/slot.js
		
		function SlotHandler() {}
		
		mask.registerHandler(':slot', SlotHandler);
		
		SlotHandler.prototype = {
			constructor: SlotHandler,
			renderEnd: function(element, model, cntx, container){
				this.slots = {};
		
				this.expression = this.attr.on;
		
				this.slots[this.attr.signal] = this.handle;
			},
			handle: function(){
				var expr = this.expression;
		
				mask.Utils.Expression.eval(expr, this.model, global, this);
			}
		};
		
	
	
		return Compo;
	
	}(Mask));
	


	return Mask;

}));
