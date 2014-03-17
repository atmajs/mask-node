var builder_build = (function() {

	var mode_SERVER = 'server',
		mode_SERVER_ALL = 'server:all',
		mode_SERVER_CHILDREN = 'server:children',
		mode_CLIENT = 'client',
		mode_model_NONE = 'none';

	// import model.js
	// import stringify.js
	// import html-dom/lib.js
	// import handler/document.js
	
	// import util/json.js
	
	// import ../../mask/src/build/type.node.js
	// import ../../mask/src/build/type.textNode.js
	

	function builder_html(node, model, ctx, container, controller, childs) {

		if (node == null) 
			return container;
		
		if (ctx._redirect != null || ctx._rewrite != null) 
			return container;

		var type = node.type,
			element,
			elements,
			j, jmax, key, value;

		if (type == null){
			// in case if node was added manually, but type was not set
			
			if (is_Array(node)) {
				type = 10
			}
			else if (node.tagName != null){
				type = 1;
			}
			else if (node.content != null){
				type = 2;
			}
		}
		
		if (type == 1 && custom_Tags[node.tagName] != null) {
			// check if the tag name was overriden
			type = 4;
		}
		
		// Dom.SET
		if (type === 10) {
			for (j = 0, jmax = node.length; j < jmax; j++) {
				builder_html(node[j], model, ctx, container, controller);
			}
			return container;
		}
		
		if (node.tagName === 'else')
			return container;
		
		// Dom.STATEMENT
		if (type === 15) {
			var Handler = custom_Statements[node.tagName];
			if (Handler == null) {
				
				if (custom_Tags[node.tagName] != null) {
					// Dom.COMPONENT
					type = 4;
				} else {
					console.error('<mask: statement is undefined', node.tagName);
					return container;
				}
				
			}
			
			if (type === 15) {
				
				Handler.render(node, model, ctx, container, controller, childs);
				return container;
			}
		}
		
		// Dom.NODE
		if (type === 1) {
			
			if (node.tagName[0] === ':') {
				
				type = 4;
				node.mode = mode_CLIENT;
				node.controller = mock_TagHandler.create(node.tagName, null, mode_CLIENT);
				
			} else {
			
				container = build_node(node, model, ctx, container, controller, childs);
				childs = null;
			}
		}

		// Dom.TEXTNODE
		if (type === 2) {
			
			build_textNode(node, model, ctx, container, controller);
			
			return container;
		}

		// Dom.COMPONENT
		if (type === 4) {
			
			element = document.createComponent(node, model, ctx, container, controller);
			container.appendChild(element);
			container = element;
			
			var compo = element.compo;
			
			if (compo != null) {
				
				if (compo.model && controller.model !== compo.model) {
					model = compo.model;
					
					var modelID = ctx._model.tryAppend(compo);
					if (modelID !== -1)
						element.modelID = modelID;
					
				}
				
				if (compo.async) 
					return element;
				
				
				if (compo.render) 
					return element;
				
				controller = compo;
				node = compo;
				elements = [];
			}
		}

		var nodes = node.nodes;
		if (nodes != null) {

			var isarray = is_Array(nodes),
				length = isarray === true ? nodes.length : 1,
				i = 0, childNode;


			for (; i < length; i++) {

				childNode = isarray === true
					? nodes[i]
					: nodes;

				if (type === 4 /* Dom.COMPONENT */ && childNode.type === 1 /* Dom.NODE */){
					
					if (controller.mode !== 'server:all') 
						childNode.attr['x-compo-id'] = element.ID;
				}

				builder_html(childNode, model, ctx, container, controller, elements);
			}

		}
		
		if (container.nodeType === Dom.COMPONENT) {
			
			if (controller.onRenderEndServer && controller.async !== true) {
				controller.onRenderEndServer(elements, model, ctx, container, controller);
			}
			
		}
		
		if (childs != null && elements && childs !== elements) {
			for (var i = 0, imax = elements.length; i < imax; i++){
				childs.push(elements[i]);
			}
		}


		return container;
	}


	return function(template, model, ctx, container, controller) {
		if (container == null) 
			container = new html_DocumentFragment();
		
		if (controller == null) 
			controller = new Dom.Component();
		
		if (ctx == null) 
			ctx = { _model: null, _ctx: null };
		
		if (ctx._model == null) 
			ctx._model = new ModelBuilder(model, Cache.modelID);
		
		if (ctx._id == null) 
			ctx._id = Cache.controllerID;
		
		var html;
		builder_html(template, model, ctx, container, controller);
		
		
		if (ctx.async === true) {
			
			ctx.done(function(){
				
				if (ctx.page && ctx.page.query.debug === 'tree') {
					// ctx.req - is only present, when called by a page instance
					// @TODO - expose render fn only for page-render purpose
					
					ctx.resolve(JSON.stringify(logger_dimissCircular(container)));
					return;
				}
				
				html = html_stringify(container, model, ctx, controller);
				
				ctx.resolve(html);
			});
			
			return null;
		}
		
		
		if (ctx.page && ctx.page.query.debug === 'tree') 
			return JSON.stringify(logger_dimissCircular(container));
		

		
		html = html_stringify(container, model, ctx, controller);
		
		return html;
	};

	
	
	
}());
