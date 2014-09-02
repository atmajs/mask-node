HtmlDom.TextNode = function(text) {
	this.textContent = String(text);
};

(function() {

	HtmlDom.TextNode.prototype = {
		constructor: HtmlDom.TextNode,
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
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'/': '&#x2F;'
		};
		function replaceEntity(chr) {
			return map[chr];
		}
		function str_htmlEncode(html) {
			return html.replace(/[&"'<>\/]/g, replaceEntity);
		}
		
		return str_htmlEncode;
	}());

}());