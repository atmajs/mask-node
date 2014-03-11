function mock_appendChild(container) {
	
	return function(element){
		
		return container.appendChild(element);
	};
}

function mock_Container(container, elements) {
	this.container = container;
	this.elements = elements;
}

mock_Container.prototype = {
	_after: function(){
		return this.elements[this.elements.length - 1] || this.container;
	},
	_before: function(){
		return this.elements[0] || this.container;
	},
	appendChild: function(child){
		var last = this._after();
		
		if (last.nextSibling) {
			last.parentNode.insertBefore(child, last.nextSibling);
			return;
		}
		
		last.parentNode.appendChild(child);
	}
}