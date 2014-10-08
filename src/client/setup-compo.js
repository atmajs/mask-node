var setup_compo;
(function(){
	
	setup_compo = function(meta, node, model, ctx, container, ctr, children){
			
		var compoName = meta.compoName,
			Handler = getHandler_(compoName, ctr);
			
		var maskNode;
		if (meta.nodes) {
			maskNode = mask.parse(meta.nodes);
			if (maskNode.type === mask.Dom.FRAGMENT)
				maskNode = maskNode.nodes[0];
		}
		
		if (meta.mask != null) {
			setupClientTemplate(meta, Handler, node, model, ctx, ctr);
			return node;
		}
		
		var compo;
		if (is_Function(Handler)) 
			compo = new Handler(model);
		
		if (compo == null && Handler.__Ctor) {
			compo = new Handler.__Ctor(maskNode, ctr);
		}
		
		if (compo == null) 
			compo = Handler;
		
		var scope = meta.scope;
		if (scope != null) {
			scope = model_deserializeKeys(meta.scope, __models, model, ctr);
			if (compo.scope != null) 
				scope = util_extendObj_(compo.scope, scope);
			
			compo.scope = scope;
		}
		
		compo.compoName = compoName;
		compo.attr = meta.attr;
		compo.parent = ctr;
		compo.ID = meta.ID;
		compo.expression = meta.expression;
		compo.model = model;
		
		if (compo.nodes == null && maskNode != null)
			compo.nodes = maskNode.nodes;
		
		if (ctr.components == null) 
			ctr.components = [];
		
		ctr.components.push(compo);
		
		var handleAttr = compo.meta && compo.meta.handleAttributes;
		if (handleAttr != null && handleAttr(compo, model) === false) {
			return node;
		}
		
		if (is_Function(compo.onRenderStartClient)) {
			compo.onRenderStartClient(model, ctx, container, ctr);
			model = compo.model || model;
		}
		
		var elements;
		if (meta.single !== false) {
			elements = [];
			node = setupChildNodes(
				meta
				, node.nextSibling
				, model
				, ctx
				, container
				, compo
				, elements
			);
		}
		
		if (is_Function(compo.renderEnd)) {
			////if (isStatic) {
			////	container = new mock_Container(container, elements);
			////}
			compo = compo.renderEnd(
				elements,
				model,
				ctx,
				container,
				ctr
			);
			if (compo != null) 
				ctr.components.push(compo);
		}
		
		arr_pushMany(children, elements);
		return node;
	};

	function setupClientTemplate(meta, Handler, el, model, ctx, ctr) {
		var node = {
			type: Dom.COMPONENT,
			tagName: meta.compoName,
			attr: meta.attr,
			nodes: meta.mask === ''
				? null
				: mask.parse(meta.mask),
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
			container = el.parentNode;
		
		container.appendChild = mock_appendChildDelegate(fragment);
		
		mask.render(node, model, ctx, container, ctr);
		
		container.insertBefore(fragment, el);
		container.appendChild = Node.prototype.appendChild;
	}
	
	function setupChildNodes(meta, nextSibling, model, ctx, container, ctr, elements) {
		var textContent;
		while(nextSibling != null){
			
			if (nextSibling.nodeType === Node.COMMENT_NODE) {
				textContent = nextSibling.textContent;
				
				if (textContent === '/t#' + meta.ID) 
					break;
				
				if (textContent === '~') {
					container   = nextSibling.previousSibling;
					nextSibling = nextSibling.nextSibling;
					continue;
				}
				
				if (textContent === '/~') {
					container   = container.parentNode;
					nextSibling = nextSibling.nextSibling;
					continue;
				}
			}
			
			var endRef = setup(
				nextSibling
				, model
				, ctx
				, container
				, ctr
				, elements
			);
			
			if (endRef == null) 
				throw new Error('Unexpected end of the reference');
			
			nextSibling = endRef.nextSibling;
		}
		
		return nextSibling;
	}
	
	function getHandler_(compoName, parentCtr) {
		var Handler = custom_Tags[compoName];
		if (Handler != null) 
			return Handler;
		
		if (parentCtr.getHandler) {
			Handler = parentCtr.getHandler(compoName);
			if (Handler != null) 
				return Handler;
		}
		
		console.error('Client bootstrap. Component is not loaded', compoName);
		return function() {};
	}
	
}());
