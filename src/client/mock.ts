var mock_appendChildDelegate,
	mock_Container,
	mock_ContainerByAnchor;
	
(function(){

	mock_appendChildDelegate = function(container) {
		return function(element){
			return container.appendChild(element);
		};
	};
	mock_Container = function(container, elements) {
		this.container = container;
		this.elements = elements;
	};
	mock_ContainerByAnchor = function(el) {
		this.last = el;
	};
	
	
	// protos
	
	mock_ContainerByAnchor.prototype.appendChild = function(child){
		var next = this.last.nextSibling,
			parent = this.last.parentNode;
			
		if (next) 
			parent.insertBefore(child, next);
		else
			parent.appendChild(child);
			
		this.last = child;
	};
	
	
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
	};

	
	
}());
