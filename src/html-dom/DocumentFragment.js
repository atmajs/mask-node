HtmlDom.DocumentFragment = function() {};

obj_inherit(HtmlDom.DocumentFragment, HtmlDom.Node, {
	nodeType: Dom.FRAGMENT,
	
	toString: function(){
		var element = this.firstChild,
			string = '';
			
		while (element != null) {
			string += element.toString();
			element = element.nextSibling;
		}
		return string;
	}
});