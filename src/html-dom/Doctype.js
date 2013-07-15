
function html_DOCTYPE(doctype){
	this.doctype = doctype;
}
html_DOCTYPE.prototype = {
	constructor: html_DOCTYPE,
	nodeType: Dom.DOCTYPE,

	toString: function(){
		return this.doctype;
	}

};

