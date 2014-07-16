
HtmlDom.Element = function(name) {
	this.tagName = name.toUpperCase();
	this.attributes = {};
};

(function(){
	
	
	// import jq/classList.js
	
	obj_inherit(HtmlDom.Element, HtmlDom.Node, {
		
		nodeType: Dom.NODE,
		
		setAttribute: function(key, value){
			this.attributes[key] = value;
		},
		
		getAttribute: function(key){
			return this.attributes[key];
		},
		
		get classList() {
			return new ClassList(this);
		},
	
		toString: function(){
			var tagName = this.tagName.toLowerCase(),
				attr = this.attributes,
				value, element;
	
			var string = '<' + tagName;
	
			for (var key in attr) {
				value = attr[key];
	
				string += ' '
					+ key
					+ '="'
					+ (typeof value === 'string'
							? value.replace(/"/g, '&quot;')
							: value)
					+ '"';
			}
			
			
			
			var isSingleTag = SingleTags[tagName] === 1,
				element = this.firstChild;
				
			if (element == null) {
				return string + (isSingleTag
					? '/>'
					: '></' + tagName + '>');
			}
	
			string += isSingleTag
				? '/>'
				: '>';
				
			
			if (isSingleTag) {
				string += '<!--~-->'
			}
			
			while (element != null) {
				string += element.toString();
				element = element.nextSibling;
			}
			
			if (isSingleTag) 
				return string + '<!--/~-->';
			
			return string
				+ '</'
				+ tagName
				+ '>';
			
		},
		
		
		
		// generic properties
		get value(){
			return this.attributes.value;
		},
		set value(value){
			this.attributes.value = value;
		},
		
		get selected(){
			return this.attributes.selected
		},
		set selected(value){
			if (!value) {
				delete this.attributes.selected;
				return;
			}
			
			this.attributes.selected = 'selected';
		},
		
		get checked(){
			return this.attributes.checked;
		},
		set checked(value){
			if (!value) {
				delete this.attributes.cheched;
				return;
			}
			
			this.attributes.cheched = 'cheched';
		}
		
	});

}());