var setup;
(function(){
	
	// import ./setup-el.js
	// import ./setup-attr.js
	// import ./setup-util.js
	// import ./setup-compo.js
	
	setup = function(node, model, ctx, container, ctr, children) {
		if (node == null) 
			return null;
		
		if (node.nodeType !== Node.COMMENT_NODE) {
			setup_el(node, model, ctx, container, ctr, children);
			return node;
		}
		
		var nextSibling = node.nextSibling;
		var metaContent = node.textContent;
		
		if (metaContent === '/m') 
			return null;
		
		if (metaContent === '~') {
			setup(nextSibling, model, ctx, node.previousSibling, ctr);
			return null;
		}
		
		if (metaContent === '/~') {
			setup(nextSibling, model, ctx, node.parentNode, ctr);
			return null;
		}
		
		var meta = Meta.parse(metaContent);
		if (meta.modelID) 
			model = model_get(__models, meta.modelID, model, ctr);
		
		if ('a' === meta.type) {
			setup_attr(meta, node, model, ctx, container, ctr)
			if (children != null) 
				return node;
		}
		
		if ('u' === meta.type) {
			node = setup_util(meta, node, model, ctx, container, ctr)
			if (children != null) 
				return node;
		}
		
		if ('t' === meta.type) {
			if (__ID < meta.ID) 
				__ID = meta.ID;
			
			node = setup_compo(meta, node, model, ctx, container, ctr, children);
			if (children != null) 
				return node;
		}
		
		if (node && node.nextSibling) 
			setup(node.nextSibling, model, ctx, container, ctr);
		
		return node;
	};
	
}());
