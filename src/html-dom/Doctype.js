
HtmlDom.DOCTYPE = function(doctype){
	this.doctype = doctype;
}
HtmlDom.DOCTYPE.prototype = {
	constructor: HtmlDom.DOCTYPE,
	nodeType: Dom.DOCTYPE,

	toString: function(buffer){
		return this.doctype;
	}
};

