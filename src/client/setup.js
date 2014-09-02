function setup(node, model, cntx, container, controller, childs) {
	var nextSibling = node.nextSibling;
	if (node.nodeType === Node.ELEMENT_NODE) {
		if (childs != null) 
			childs.push(node);
		
		if (node.tagName === 'SCRIPT' &&
			node.type === 'text/mask' &&
			node.getAttribute('data-run') === 'true') {
				mask.render(node.textContent
					, model
					, cntx
					, new mock_ContainerByAnchor(node)
					, controller
					, childs
				);
			}
		
		else if (node.firstChild) 
			setup(node.firstChild, model, cntx, node, controller);
		
		if (childs == null && nextSibling != null) 
			setup(nextSibling, model, cntx, container, controller);
		
		
		return node;
	}
	
	if (node.nodeType !== Node.COMMENT_NODE) {
		if (childs == null && nextSibling != null) 
			setup(nextSibling, model, cntx, container, controller);
		
		return node;
	}
	
	var metaContent = node.textContent;
	
	if (metaContent === '/m') 
		return null;
	
	if (metaContent === '~' && nextSibling != null) {
		setup(nextSibling, model, cntx, node.previousSibling, controller);
		return null;
	}
	
	if (metaContent === '/~' && nextSibling != null) {
		setup(nextSibling, model, cntx, node.parentNode, controller);
		return null;
	}
	
	var meta = Meta.parse(metaContent);
	
	if (meta.modelID) 
		model = model_get(__models, meta.modelID, model, controller);
	
	if ('a' === meta.type) {
		
		// import setup-attr.js
		
		if (childs != null) 
			return node;
	}
	
	if ('u' === meta.type) {
		
		// import setup-util.js
		
		if (childs != null) 
			return node;
	}
	
	if ('t' === meta.type) {
		
		if (__ID < meta.ID) 
			__ID = meta.ID;
		
		// import setup-tag.js
		
		if (childs != null) 
			return node;
	}
	
	
	if (node && node.nextSibling) {
		setup(node.nextSibling, model, cntx, container, controller);
	}

	return node;
}

