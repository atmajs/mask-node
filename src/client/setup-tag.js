
var compoName = meta.compoName,
	ctor = compoName
		? custom_Tags[meta.compoName]
		: {};
		

if (ctor == null) {
	console.error('Component is not loaded for client reder - ', compoName);
	ctor = function() {};
}


if (meta.mask != null) {
	var _node = {
		type: Dom.COMPONENT,
		tagName: compoName,
		attr: meta.attr,
		nodes: meta.mask ? mask.parse(meta.mask) : null,
		controller: ctor
	};
	
	/* Dangerous:
	 *
	 * Hack with mocking `appendChild`
	 * We have to pass origin container into renderer,
	 * but we must not append template, but insert
	 * rendered template before Comment Placeholder
	 *
	 * Careful:
	 *
	 * If a root node of the new template is some async component,
	 * then containers `appendChild` would be our mocked function
	 *
	 * Info: Appending to detached fragment has also perf. boost,
	 * so it is not so bad idea.
	 */
	
	var fragment = document.createDocumentFragment(),
		container = node.parentNode,
		originalAppender = container.appendChild;
	
	container.appendChild = mock_appendChild(fragment);
	
	mask.render(_node, model, cntx, container, controller);
	
	container.insertBefore(fragment, node);
	container.appendChild = originalAppender;
} else {

	var compo = typeof ctor === 'function'
		? new ctor(model)
		: ctor;
	
	
	compo.compoName = compoName;
	compo.attr = meta.attr;
	compo.parent = controller;
	compo.ID = meta.ID;
	
	if (meta.modelID)
		compo.model = model;
	
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
