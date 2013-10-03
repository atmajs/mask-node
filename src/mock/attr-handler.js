var mock_AttrHandler = (function() {
	
	function Attr(attrName, attrValue, ID) {
		this.meta = {
			ID : ID,
			name : attrName,
			value : attrValue
		};
	}
	
	Attr.prototype = {
		toString: function(){
			var json = this.meta,
				info = {
					type: 'a',
					single: true
				};
				
			return Meta.stringify(json, info);
		}
	};
	
	return {
		create: function(attrName, fn, mode) {
			
			return function(node, value, model, cntx, tag, controller, container){
				
				if (mode !== 'server') {
					container.insertBefore(new Attr(attrName, value, ++cntx._id), tag);
				}
				
				if (mode !== 'client') {
					return fn(node, value, model, cntx, tag, controller);
				}
				
				
				return '';
			};
		}
	};

}());