var handler = custom_Attributes[meta.name],
	element = trav_getElement(node);
	
if (handler == null) {
	console.warn('Custom Attribute Handler was not defined', meta.name);
	return;
}

if (element == null){
	console.error('Browser has cut off nested tag for the comment', node);
	return;
}

handler(null, meta.value, model, cntx, element, controller, container);