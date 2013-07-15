var mock_TagHandler = (function() {
	
	function EmptyHandler(attrName, attrValue) {}
	
	EmptyHandler.prototype = {
		render: function(){},
		mode: 'client'
	};
	
	return {
		create: function(tagName, Compo, mode){
			
			if (mode === 'client' || Compo.prototype.mode === 'client') {
				return EmptyHandler;
			}
			
			Compo.prototype.mode = mode;
			return Compo;
			
		},
		
		
	};
		
}());