
function html_Element(name) {
	this.tagName = name;
	this.attributes = {};
}

window.El = html_Element;

html_Element.prototype = obj_inherit(html_Element, html_Node, {
	
	nodeType: Dom.NODE,
	
	setAttribute: function(key, value){
		this.attributes[key] = value;
	},
	
	getAttribute: function(key){
		return this.attributes[key];
	},

	toString: function(){
		var tagName = this.tagName,
			attr = this.attributes,
			value, element;

		var string = '<' + tagName;

		for (var key in attr) {
			value = attr[key];

			string += ' '
				+ key
				+ '="'
				+ (typeof value === 'string'
						? value.replace(/"/g, '\\"')
						: value)
				+ '"';
		}

		if (html_SingleTags[tagName] === 1) {
			string += '/>';

			return string;
		}

		string += '>';

		element = this.firstChild;
		while (element != null) {
			string += element.toString();
			element = element.nextNode;
		}

		return string + '</' + tagName + '>';
	}
});
