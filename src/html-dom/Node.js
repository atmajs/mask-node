function html_Node() {}

html_Node.prototype = {
	parentNode: null,
	firstChild: null,
	lastChild: null,
	
	nextSibling: null,
	
	
	get length() {
		var count = 0,
			el = this.firstChild;
			
		while (el != null) {
			count++;
			el = el.nextSibling;
		}
		return count;
	},
	
	get childNodes() {
		var array = [],
			el = this.firstChild;
			
		while (el != null) {
			array.push(el);
			
			el = el.nextSibling;
		}
		
		return array;
	},
	
	appendChild: function(child){
		if (this.firstChild == null) {
			
			this.firstChild = this.lastChild = child;
		}
		else {
			
			this.lastChild.nextSibling = child;
			this.lastChild = child;
		}
		
		child.parentNode = this;
	},
	
	insertBefore: function(child, anchor){
		var prev = this.firstChild;
		
		if (prev !== anchor) {
			while (prev != null && prev.nextSibling !== anchor) {
				prev = prev.nextSibling;
			}
		}
		
		if (prev == null) {
			this.appendChild(child);
			return;
		}
		
		if (prev === this.firstChild) {
			this.firstChild = child;
			
			child.nextSibling = prev;
			return;
		}
		
		prev.nextSibling = child;
		child.nextSibling = anchor;
	}
};