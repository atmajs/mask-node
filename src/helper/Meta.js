var Meta;
(function(){
	Meta = {
		stringify: function(json, info){
			switch (info.mode) {
				case mode_SERVER:
				case mode_SERVER_ALL:
					return '';
			}
			var	type = info.type,
				isSingle = info.single,
				string = type;

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
		close: function(json, info){
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

		parse: function(str) {
			return parser_parse(str);
		}
	};

	var seperator_CODE = 30,
		seperator_CHAR = String.fromCharCode(seperator_CODE);

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

	var parser_parse;
	(function(){
		var _i, _imax, _str;
		parser_parse = function(string){
			_i = 0;
			_str = string;
			_imax = string.length;

			var json = {},
				c = string.charCodeAt(_i),
				isEnd = false,
				isSingle = false,
				type;

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
			}
			c = string.charCodeAt(++_i);
			if (c === 35 /*#*/) {
				++_i;
				json.ID = parseInt(consumeNext(), 10);
			}
			var serializer = Serializer.resolve(json),
				propertyParserFn = serializer.deserializeSingleProp,
				propertyDefaultsFn = serializer.defaultProperties,
				index = 0;
			while (_i < _imax) {
				var part = consumeNext();
				propertyParserFn(json, part, index++);
			}
			if (propertyDefaultsFn != null) {
				propertyDefaultsFn(json, index);
			}
			return json;
		};


		var seperator = seperator_CHAR + ' ',
			seperatorLength = seperator.length;
		function consumeNext() {
			var start = _i,
				end = _str.indexOf(seperator, start);
			if (end === -1) {
				end = _imax;
			}
			_i = end + seperatorLength;
			return _str.substring(start, end);
		}

	}());

	function _obj_flatten(obj) {
		var result = Object.create(obj);
		for(var key in result) {
			result[key] = result[key];
		}
		return result;
	}


	var Serializer;
	(function() {
		Serializer = {
			resolve: function(info){
				switch (info.type) {
					case 't':
						return ComponentSerializer;
					case 'a':
						return AttributeSerializer;
					default:
						return Serializer;
				}
			},
			serialize: function(json){
				var string = '';
				for(var key in json) {
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
			},
			deserializeSingleProp: function(json, str, i){
				var colon = str.indexOf(':'),
					key = str.substring(0, colon),
					value = str.substring(colon + 1);

				if (key === 'attr' || key === 'scope') {
					value = JSON.parse(value);
				}
				json[key] = value;
			},

			serializeProps_: function(props, json) {
				var arr = new Array(props.count),
					keys = props.keys;
				for(var key in json) {
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
				var imax = arr.length,
					i = -1, lastPos = 0;
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
			},
			deserializeSingleProp_: function(json, props, str, i) {
				var arr = props.keysArr;
				if (i >= arr.length) {
					log_error('Keys count missmatch');
					return;
				}
				var keyInfo = arr[i];
				var value = parseValueByKeyInfo(str, keyInfo);
				json[keyInfo.name] = value;
			},

			prepairProps_: function(keys){
				var props = {
					count: keys.length,
					keys: {},
					keysArr: keys,
				},
				imax = keys.length,
				i = -1;
				while (++i < imax) {
					var keyInfo = keys[i];
					keyInfo.index = i;
					props.keys[keyInfo.name] = keyInfo;
				};
				return props;
			}
		};

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

	}());

	var ComponentSerializer;
	(function () {
		var keys = [
			{name: 'compoName', type: 'string' },
			{name: 'attr', type: 'object', 'default': function(){ return {}; } },
			{name: 'expression', type: 'string' },
			{name: 'nodes', type: 'mask' },
			{name: 'scope', type: 'object' },
			{name: 'modelID', type: 'string' }
		];
		var props = Serializer.prepairProps_(keys);
		ComponentSerializer = {
			serialize: function(json, info) {
				return Serializer.serializeProps_(props, json);
			},
			deserialize: function(str){
				return Serializer.deserializeProps_(props, str);
			},
			deserializeSingleProp: function(json, str, i){
				return Serializer.deserializeSingleProp_(json, props, str, i);
			},
			defaultProperties: function(json, index) {
				var arr = props.keysArr,
					imax = arr.length,
					i = index - 1;
				while (++i < imax) {
					var keyInfo = arr[i];
					if (keyInfo.default) {
						json[keyInfo.name] = keyInfo.default();
					}
				}
			}
		}
	}());

	var AttributeSerializer;
	(function () {
		var keys = [
			{name: 'name', type: 'string' },
			{name: 'value', type: 'string' }
		];
		var props = Serializer.prepairProps_(keys);
		AttributeSerializer = {
			serialize: function(json, info) {
				return Serializer.serializeProps_(props, json);
			},
			deserialize: function(str){
				return Serializer.deserializeProps_(props, str);
			},
			deserializeSingleProp: function(json, str, i){
				return Serializer.deserializeSingleProp_(json, props, str, i);
			}
		};
	}());


}());