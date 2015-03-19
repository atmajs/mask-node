var setup_compo,
	setup_renderClient;
(function(){
	
	setup_compo = function(meta, node, model, ctx, container, ctr, children){
			
		var compoName = meta.compoName,
			Handler = getHandler_(compoName, ctr);
			
		var maskNode;
		if (meta.nodes) {
			maskNode = mask.parse(meta.nodes);
			if (maskNode.type === mask.Dom.FRAGMENT) {
				maskNode = maskNode.nodes[0];
			}
			if (meta.compoName !== maskNode.tagName && maskNode.tagName === 'imports') {
				maskNode = maskNode.nodes[0];
			}
		}
		if (maskNode == null) {
			maskNode = new mask.Dom.Component(meta.compoName);
		}
		
		if (meta.mask != null) {
			setupClientMask(meta, Handler, node, model, ctx, ctr);
			return node;
		}
		if (meta.template != null) {
			setupClientTemplate(meta.template, node, model, ctx, ctr);
			return node;
		}
		
		var compo;
		if (is_Function(Handler)) 
			compo = new Handler(maskNode, model, ctx, container, ctr);
		
		if (compo == null && Handler.__Ctor) {
			compo = new Handler.__Ctor(maskNode, model, ctx, container, ctr);
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
		
		var renderStart = compo.renderStartClient || compo.onRenderStartClient /* deprecated */;
		if (is_Function(renderStart)) {
			renderStart.call(compo, model, ctx, container, ctr);
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
	
	setup_renderClient = function (template, el, model, ctx, ctr, children) {
		var fragment = document.createDocumentFragment(),
			container = el.parentNode;
		
		container.appendChild = mock_appendChildDelegate(fragment);
		
		mask.render(template, model, ctx, container, ctr, children);
		
		container.insertBefore(fragment, el);
		container.appendChild = Node.prototype.appendChild;
	};

	function setupClientMask(meta, Handler, el, model, ctx, ctr) {
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
	
	function setupClientTemplate(template, el, model, ctx, ctr) {
		var fragment = document.createDocumentFragment(),
			container = el.parentNode;
		
		container.appendChild = mock_appendChildDelegate(fragment);
		
		mask.render(template, model, ctx, container, ctr);
		
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
	
	function getHandler_(compoName, ctr) {
		var Handler = custom_Tags[compoName];
		if (Handler != null) 
			return Handler;
		
		while(ctr != null) {
			if (ctr.getHandler) {
				Handler = ctr.getHandler(compoName);
				if (Handler != null) {
					return Handler;
				}
			}
			ctr = ctr.parent;
		}
		
		console.error('Client bootstrap. Component is not loaded', compoName);
		return function() {};
	}
	
}());
