
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
