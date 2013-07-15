
function html_DocumentFragment() {}

html_DocumentFragment.prototype = obj_inherit(html_DocumentFragment, html_Node, {
	nodeType: Dom.FRAGMENT,
	
	

	toString: function(){
		var element = this.firstChild,
			string = '';

		while (element != null) {
			string += element.toString();
			element = element.nextNode;
		}

		return string;
	}
});

