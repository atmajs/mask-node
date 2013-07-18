
function html_TextNode(text){
	this.textContent = text;
}

html_TextNode.prototype = {
	constructor: html_TextNode,
	nodeType: Dom.TEXTNODE,
	nextSibling: null,

	toString: function(){
		return this.textContent || '';
	}
};
