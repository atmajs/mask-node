var handler = custom_Utils[meta.utilName];
var element = trav_getElement(node);

if (handler == null) {
	console.log('Custom Utility Handler was not defined', meta.name);
	return;
}

if (typeof handler === 'function') {
	
	handler(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
	
}else if (handler.process) {
	//@TODO refactor )
	
	if (handler.mode === 'partial') {
		var fnStart = meta.utilType + 'RenderStart';
			fn = meta.utilType;
		
		handler[fnStart](meta.value, model, cntx, element, controller);
		handler.element = element;
		handler[fn](meta.value, model, cntx, element, controller, meta.attrName);
	} else{
		
		handler.process(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
	}
}
