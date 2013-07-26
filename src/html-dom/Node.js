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
		
		if (child == null)
			return child;
		
		if (child.nodeType === Dom.FRAGMENT) {
			
			var fragment = child;
			
			if (fragment.firstChild == null) 
				return fragment;
			
			
			var el = fragment.firstChild;
			while (true) {
				el.parentNode = this;
				
				if (el.nextSibling == null) 
					break;
				
				el = el.nextSibling;
			}
			
			if (this.firstChild == null) {
				
				this.firstChild = fragment.firstChild;
				
			} else {
				
				fragment.lastChild.nextSibling = fragment.firstChild;
				
			}
			
			
			fragment.lastChild = fragment.lastChild;
			
			return fragment;
		}
		
		if (this.firstChild == null) {
			
			this.firstChild = this.lastChild = child;
		}
		else {
			
			this.lastChild.nextSibling = child;
			this.lastChild = child;
		}
		
		child.parentNode = this;
		
		return child;
	},
	
	insertBefore: function(child, anchor){
		var prev = this.firstChild;
		
		if (prev !== anchor) {
			while (prev != null && prev.nextSibling !== anchor) {
				prev = prev.nextSibling;
			}
		}
		
		if (prev == null)
			// set tail
			return this.appendChild(child);
		
		
		if (child.nodeType === Dom.FRAGMENT) {
			var fragment = child;
			
			// set parentNode
			var el = fragment.firstChild;
			while (el != null) {
				el.parentNode = this;
				el = el.nextSibling;
			}
			
			// set to head
			if (prev === this.firstChild) {
				this.firstChild = fragment.firstChild;
				
				fragment.lastChild.nextSibling = prev;
				return fragment;
			}
			
			// set middle
			prev.nextSibling = fragment.firstChild;
			fragment.lastChild.nextSibling = anchor;
			
			return fragment;
		}
		
		
		child.parentNode = this;
		
		if (prev === this.firstChild) {
			
			// set head
			this.firstChild = child;
			child.nextSibling = prev;
			
			return child;
		}
		
		// set middle
		prev.nextSibling = child;
		child.nextSibling = anchor;
		
		return child;
	}
};