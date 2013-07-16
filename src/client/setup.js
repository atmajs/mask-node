function setup(node, model, cntx, container, controller, childs) {
	
	if (node.nodeType === Node.ELEMENT_NODE) {
		if (childs != null) 
			childs.push(node);
		
		if (node.firstChild) 
			setup(node.firstChild, model, cntx, node, controller);
		
		if (childs == null && node.nextSibling) 
			setup(node.nextSibling, model, cntx, container, controller);
		
		
		return;
	}
	
	if (node.nodeType !== Node.COMMENT_NODE) 
		return;
	
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
		model = models[meta.modelID];
	
	if ('a' === meta.type) {
		// import setup-attr.js
		
		return;
	}
	
	if ('u' === meta.type) {
		
		// import setup-util.js
		
		return;
	}
	
	if ('t' === meta.type) {
		
		// import setup-tag.js
		
		if (node && node.nextSibling) {
			setup(node.nextSibling, model, cntx, container, controller);
		}
	}
	
}

