(function() {
	HtmlDom.UtilNode = class_create({
		nodeType: Dom.UTILNODE,
		nextSibling: null,
		firstChild: null,
		constructor: function(type, name, value, attrName) {
			this.meta = {
				utilType: type,
				utilName: name,
				value: value,
				attrName: attrName,
				current: null
			};
		},
		appendChild: function(el){
			this.firstChild = el;
		},
		toString: function() {
			var json = this.meta,
				info = {
					type: 'u',
					single: this.firstChild == null
				},
				string = Meta.stringify(json, info);
			
			if (this.firstChild == null) 
				return string;
			
			
			return string
				+ this.firstChild.toString()
				+ Meta.close(json, info)
				;
		}
	});
}());