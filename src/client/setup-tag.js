if (custom_Tags[meta.compoName] != null) {

	if (meta.mask) {
		var _node = {
			type: Dom.COMPONENT,
			compoName: meta.compoName,
			attr: meta.attr,
			nodes: mask.parse(meta.mask)
		};
		
		var fragment = mask.render(_node, model, cntx, null, controller);
		
		node.parentNode.insertBefore(fragment, node);
	} else {
	
		var compo = new custom_Tags[meta.compoName](model);
		
		compo.compoName = meta.compoName;
		compo.attr = meta.attr;
		compo.parent = controller;
		compo.ID = meta.ID;
		
		if (controller.components == null) 
			controller.components = [];
			
		controller.components.push(compo);
		
		var elements = [];
		
		node = node.nextSibling;
		
		while(node && !(node.nodeType === Node.COMMENT_NODE && node.textContent === '/t#' + meta.ID)){
			setup(node, model, cntx, container, compo, elements);
			node = node.nextSibling;
		}
		
		
		
		if (fn_isFunction(compo.renderEnd)) {
			compo.renderEnd(elements, model, cntx, container);
		}
		
		if (childs != null && childs !== elements){
			var il = childs.length,
				jl = elements.length;
		
			j = -1;
			while(++j < jl){
				childs[il + j] = elements[j];
			}
		}
	}
	
	
	
}else{
	console.error('Custom Tag Handler was not defined', meta.compoName);
}
