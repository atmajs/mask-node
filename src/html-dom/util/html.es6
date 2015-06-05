var html_serializeAttributes;
(function(){
	
	html_serializeAttributes = function (node) {
		var attr = node.attributes,
			str  = '',
			key, value
		for(key in attr) {
			value = attr[key];
			if (is_String(value)) {
				value = value.replace(/"/g, '&quot;');
			}
			str += ' ' + key + '="' + value + '"';
		}
		return str;
	};
	
}());