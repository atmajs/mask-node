function setup_attr(meta, node, model, ctx, container, ctr) {
	var handler = custom_Attributes[meta.name];
	if (handler == null) {
		console.warn('Custom Attribute Handler was not defined', meta.name);
		return;
	}
	
	var el = trav_getElement(node);
	if (el == null){
		console.error('Browser has cut off nested tag for the comment', node);
		return;
	}
	
	handler(null, meta.value, model, ctx, el, ctr, container);
}