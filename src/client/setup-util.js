if (meta.end !== true) {
		
	var handler = custom_Utils[meta.utilName],
		util,
		el;
	if (handler == null) {
		console.error('Custom Utility Handler was not defined', meta.name);
		return;
	}
	
	util = handler.util;
	el =  meta.utilType === 'attr'
		? trav_getElement(node)
		: node.nextSibling
		;
	
	if (util === void 0 || util.mode !== 'partial') {
		handler(
			meta.value
			, model
			, cntx
			, el
			, controller
			, meta.attrName
			, meta.utilType
		);
	}
	else {
		
		util.element = el;
		util.current = meta.utilType === 'attr'
			? meta.current
			: el.textContent
			;
		util[meta.utilType](
			meta.value
			, model
			, cntx
			, el
			, controller
			, meta.attrName
		);
		
		if (meta.utilType === 'node') {
			node = el.nextSibling;
		}
	}
}