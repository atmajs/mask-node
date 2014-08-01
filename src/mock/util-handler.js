var mock_UtilHandler;
(function() {
	mock_UtilHandler = {
		create: utilFunction
	};
	
	function utilFunction(name, mix, mode){
		if (mode === 'server') 
			return mix;
		
		// partial | client
		return function(val, model, ctx, el, ctr, attrName, type) {
			var node = new HtmlDom.UtilNode(type, name, val, attrName /*, ++ctx._id */);
			if (type === 'attr') {
				el
					.parentNode
					.insertBefore(node, el);
			}
			
			if (mode === 'partial') {
				var fn = util_FNS[type],
					current;
				if (is_Function(mix[fn]) === false){
					log_error('Utils partial function is not defined', fn);
					return '';
				}
				
				current = mix[fn](val, model, ctx, el, ctr);
				if (type === 'node') {
					node.appendChild(mix.element);
					return node;
				}
				
				//> attr
				return node.meta.current = current;
			}
			
			/* client-only */
			if (type === 'node') 
				return node;
			
			//> attr
			return '';
		};
	}
	
	var util_FNS = {
		node: 'nodeRenderStart',
		attr: 'attrRenderStart'
	};

}());