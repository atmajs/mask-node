function ClassList(node) {
	
	if (node.attributes == null) {
		debugger;
	}
	
	this.attr = node.attributes;
	this.className = this.attr['class'] || '';
}

ClassList.prototype = {
	get length() {
		return this.className.split(/\s+/).length;
	},
	
	contains: function(_class){
		return sel_classIndex(this.className, _class) !== -1;
	},
	remove: function(_class){
		var index = sel_classIndex(this.className, _class);
		if (index === -1) 
			return;
		
		var str = this.className;
		
		this.className =
		this.attr['class'] =
			str.substring(0, index) + str.substring(index + _class.length);
		
	},
	add: function(_class){
		if (sel_classIndex(this.className, _class) !== -1)
			return;
		
		this.className =
		this.attr['class'] = this.className
			+ (this.className === '' ? '' : ' ')
			+ _class;
	}
};