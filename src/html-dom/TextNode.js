(function() {

	HtmlDom.TextNode = class_create({
		nodeType: Dom.TEXTNODE,
		nextSibling: null,
		
		constructor: function TextNode(text){
			this.textContent = String(text == null ? '' : text);
		},
		toString: function() {
			return escape(this.textContent);
		}
	});

	function escape(html) {
		return html
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			;
	}
}());