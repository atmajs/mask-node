Meta = (function(){
	
	var seperator_CODE = 30,
		seperator_CHAR = String.fromCharCode(seperator_CODE);
	
	function val_stringify(mix) {
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
	
	var parser_Index,
		parser_Length,
		parser_String;
		
	var tag_OPEN = '<!--',
		tag_CLOSE = '-->';
			
		
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
		if (parser_Index > parser_Length - 5) 
			return false;
		
		
		if (parser_String[parser_Index++] !== seperator_CHAR || parser_String[parser_Index++] !== ' '){
			parser_Index = -1;
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
	function _obj_flatten(obj) {
		var result = Object.create(obj);
		for(var key in result) {
			result[key] = result[key];
		}
		return result;
	}
	
	
	return {
		stringify: function(json, info){
			
			switch (info.mode) {
				case 'server':
				case 'server:all':
					return '';
			}
			
			
			var	type = info.type,
				isSingle = info.single,
			
				string = tag_OPEN + type;
				
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
				
			string += tag_CLOSE;
			
			return string;
		},
		
		close: function(json, info){
			switch (info.mode) {
				case 'server':
				case 'server:all':
					return '';
			}
			
			
			return tag_OPEN
				+'/'
				+ info.type
				+ (json.ID ? '#' + json.ID : '')
				+ tag_CLOSE;
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
			
			while (parse_property(json));
			
			if (parser_Index === -1) 
				return {};
			
			if (string[parser_Length - 1] === '/') 
				json.single = true;
			if (json.scope !== void 0) 
				json.scope = JSON.parse(json.scope);
			
			return json;
		}
	};
}());