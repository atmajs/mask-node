function html_TextNode(text) {
	this.textContent = text;
}

(function() {


	html_TextNode.prototype = {
		constructor: html_TextNode,
		nodeType: Dom.TEXTNODE,
		nextSibling: null,

		toString: function() {
			if (!this.textContent) 
				return '';
			
			return str_htmlEncode(this.textContent);
		}
	};


	var str_htmlEncode = (function() {
		var map = {
			'&': '&amp;',
			"'": '&#39;',
			'"': '&quot;',
			'<': '&lt;',
			'>': '&gt;'
		};

		function replaceEntity(chr) {
			return map[chr];
		}

		return function str_htmlEncode(html) {
			return html.replace(/[&"'\<\>]/g, replaceEntity);
		}
	}());



}());