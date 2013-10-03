function setup(node, model, cntx, container, controller, childs) {
	
	if (node.nodeType === Node.ELEMENT_NODE) {
		if (childs != null) 
			childs.push(node);
		
		if (node.firstChild) 
			setup(node.firstChild, model, cntx, node, controller);
		
		if (childs == null && node.nextSibling) 
			setup(node.nextSibling, model, cntx, container, controller);
		
		
		return node;
	}
	
	if (node.nodeType !== Node.COMMENT_NODE) {
		if (childs == null && node.nextSibling) 
			setup(node.nextSibling, model, cntx, container, controller);
		
		return node;
	}
	
	var metaContent = node.textContent;
	
	if (metaContent === '/m') {
		return;
	}
	
	if (metaContent === '~') {
		setup(node.nextSibling, model, cntx, node.previousSibling, controller);
		return;
	}
	
	if (metaContent === '/~') {
		setup(node.nextSibling, model, cntx, node.parentNode, controller);
		return;
	}
	
	var meta = Meta.parse(metaContent);
	
	if (meta.modelID) 
		model = __models[meta.modelID];
	
	if ('a' === meta.type) {
		
		// import setup-attr.js
	}
	
	if ('u' === meta.type) {
		
		// import setup-util.js
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

