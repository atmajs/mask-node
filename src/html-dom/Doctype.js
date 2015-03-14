HtmlDom.DOCTYPE = class_create({
	nodeType: Dom.DOCTYPE,
	constructor: function(doctype){
		this.doctype = doctype;
	},
	toString: function(buffer){
		return this.doctype;
	}
});

