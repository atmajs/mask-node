mock_TagHandler = (function() {
	
	function EmptyHandler(attrName, attrValue) {}
	
	EmptyHandler.prototype = {
		render: function(){},
		meta: {
			mode: mode_CLIENT
		}
	};
	
	return {
		create: function(tagName, Compo, mode){
			if (mode === mode_CLIENT) {
				return EmptyHandler;
			}
			var Proto = Compo.prototype;
			if (Proto.mode === mode_CLIENT) {
				/* obsolete, use meta object*/
				return EmptyHandler;
			}

			var meta = Compo.prototype.meta;
			if (meta == null) {
				meta = Compo.prototype.meta = {};
			}
			if (meta.mode === mode_CLIENT) {
				return EmptyHandler;
			}
			
			meta.mode = mode;
			return Compo;
		},
		
		
	};
		
}());