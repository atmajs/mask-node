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