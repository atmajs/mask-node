
var compoName = meta.compoName,
	Handler = compoName
		? custom_Tags[meta.compoName]
		: {}
		;
	
var maskNode;
if (meta.nodes) {
	maskNode = mask.parse(meta.nodes);
	if (maskNode.type === mask.Dom.FRAGMENT)
		maskNode = maskNode.nodes[0];
}

if (Handler == null) {
	if (controller.getHandler)
		Handler = controller.getHandler(compoName);
	
	if (Handler == null) {
		console.error('Component is not loaded for client reder - ', compoName);
		Handler = function() {};
	}
}


if (meta.mask != null) {
	var _node = {
		type: Dom.COMPONENT,
		tagName: compoName,
		attr: meta.attr,
		nodes: meta.mask ? mask.parse(meta.mask) : null,
		controller: Handler,
		expression: meta.expression,
		scope: meta.scope
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
		container = node.parentNode;
	
	container.appendChild = mock_appendChildDelegate(fragment);
	
	mask.render(_node, model, cntx, container, controller);
	
	container.insertBefore(fragment, node);
	container.appendChild = Node.prototype.appendChild;
} else {
	var compo, isStatic;
	if (typeof Handler === 'function') 
		compo = new Handler(model);
	
	if (compo == null && Handler.__Ctor) {
		compo = new Handler.__Ctor(maskNode, controller);
		isStatic = true;
	}
	
	if (compo == null) 
		compo = Handler;
	
	compo.compoName = compoName;
	compo.attr = meta.attr;
	compo.parent = controller;
	compo.ID = meta.ID;
	compo.expression = meta.expression;
	compo.scope = meta.scope;
	compo.model = model;
	
	
	if (controller.components == null) 
		controller.components = [];
		
	
	if (isStatic !== true) {
		controller
			.components
			.push(compo);
	}
		
	if (compo.onRenderStartClient) {
		compo.onRenderStartClient(model, cntx, container, controller);
		
		model = compo.model;
	}
	
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
			
			if (endRef == null) 
				throw new Error('Unexpected end of the reference');
			
			node = endRef.nextSibling;
		}
		
	}
	
	
	
	if (fn_isFunction(compo.renderEnd)) {
		
		var _container = container;
		if (isStatic) {
			_container = new mock_Container(container, elements);
		}
		
		compo = compo.renderEnd(
			elements,
			model,
			cntx,
			_container,
			controller
		);
		
		if (isStatic && compo != null) 
			controller.components.push(compo);
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
