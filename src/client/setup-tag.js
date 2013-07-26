
var compoName = meta.compoName,
	ctor = compoName
		? custom_Tags[meta.compoName]
		: {};

if (controller != null) {

	if (meta.mask != null) {
		var _node = {
			type: Dom.COMPONENT,
			compoName: compoName,
			attr: meta.attr,
			nodes: meta.mask ? mask.parse(meta.mask) : null,
			controller: ctor
		};
		
		var fragment = mask.render(_node, model, cntx, null, controller);
		
		node.parentNode.insertBefore(fragment, node);
	} else {
	
		var compo = typeof ctor === 'function'
			? new ctor(model)
			: ctor;
		
		compo.compoName = compoName;
		compo.attr = meta.attr;
		compo.parent = controller;
		compo.ID = meta.ID;
		
		if (controller.components == null) 
			controller.components = [];
			
		controller
			.components
			.push(compo);
		
		if (meta.single !== false) {
			var elements = [],
				textContent;
			
			node = node.nextSibling;
			while(node != null){
				
				if (node.nodeType === Node.COMMENT_NODE) {
					textContent = node.textContent;
					
					if (textContent === '/t#' + meta.ID) {
						break;
					}
					
					if (textContent === '~') {
						container = node.previousSibling;
						node = node.nextSibling;
						continue;
					}
					
					if (textContent === '/~') {
						container = container.parentNode;
						node = node.nextSibling;
						continue;
					}
				}
				
				var endRef = setup(node, model, cntx, container, compo, elements);
				
				if (endRef == null) {
					debugger;
				}
				
				node = endRef.nextSibling;
			}
			
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
	console.error('Custom Tag Handler was not defined', compoName, meta.ID);
}
