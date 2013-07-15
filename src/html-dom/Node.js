function html_Node() {}

html_Node.prototype = {
	parentNode: null,
	firstChild: null,
	lastChild: null,
	
	nextNode: null,
	
	
	get length() {
		var count = 0,
			el = this.firstChild;
			
		while (el != null) {
			count++;
			el = el.nextNode;
		}
		return count;
	},
	
	get childNodes() {
		var array = [],
			el = this.firstChild;
			
		while (el != null) {
			array.push(el);
			
			el = el.nextNode;
		}
		
		return array;
	},
	
	appendChild: function(child){
		if (this.firstChild == null) {
			
			this.firstChild = this.lastChild = child;
		}
		else {
			
			this.lastChild.nextNode = child;
			this.lastChild = child;
		}
		
		child.parentNode = this;
	},
	
	insertBefore: function(child, anchor){
		var prev = this.firstChild;
		
		if (prev !== anchor) {
			while (prev != null && prev.nextNode !== anchor) {
				prev = prev.nextNode;
			}
		}
		
		if (prev == null) {
			this.appendChild(child);
			return;
		}
		
		if (prev === this.firstChild) {
			this.firstChild = child;
			
			child.nextNode = prev;
			return;
		}
		
		prev.nextNode = child;
		child.nextNode = anchor;
	}
};