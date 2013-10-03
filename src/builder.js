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
	
	
	
	var logger_dimissCircular = (function() {
		var cache;

		function clone(mix) {
			if (mix == null) {
				return null;
			}


			var cloned;

			if (mix instanceof Array) {
				cloned = [];
				for (var i = 0, imax = mix.length; i < imax; i++) {
					cloned[i] = clone(mix[i]);
				}
				return cloned;
			}

			if (typeof mix === 'object') {

				if (~cache.indexOf(mix)) {
					return '[object Circular]';
				}
				cache.push(mix);

				cloned = {};
				for (var key in mix) {
					cloned[key] = clone(mix[key]);
				}
				return cloned;
			}

			return mix;
		}

		return function(mix) {
			if (typeof mix === 'object' && mix != null) {
				cache = [];
				mix = clone(mix);
				cache = null;
			}

			return mix;
		};
	}());


	function builder_html(node, model, cntx, container, controller, childs) {

		if (node == null) {
			return container;
		}

		var type = node.type,
			element,
			elements,
			j, jmax, key, value;

		if (type === 10 /*SET*/ || node instanceof Array) {
			for (j = 0, jmax = node.length; j < jmax; j++) {
				builder_html(node[j], model, cntx, container, controller);
			}
			return container;
		}

		if (type == null) {
			// in case if node was added manually, but type was not set
			if (node.tagName != null) {
				type = 1;
			} else if (node.content != null) {
				type = 2;
			}
		}

		if (type === 1 /* Dom.NODE */) {
			// import ../../mask/src/build/type.node.js
		}

		if (type === 2 /* Dom.TEXTNODE */) {
			// import ../../mask/src/build/type.textNode.js
			return container;
		}

		if (type === 4 /* Dom.COMPONENT */) {
			
			element = document.createComponent(node, model, cntx, container, controller);
			container.appendChild(element);
			container = element;
			
			var compo = element.compo;
			
			if (compo != null) {
				
				if (compo.model && controller.model !== compo.model) {
					model = compo.model;
					
					var modelID = cntx._model.tryAppend(compo);
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

			var isarray = nodes instanceof Array,
				length = isarray === true ? nodes.length : 1,
				i = 0, childNode;


			for (; i < length; i++) {

				childNode = isarray === true ? nodes[i] : nodes;

				if (type === 4 /* Dom.COMPONENT */ && childNode.type === 1 /* Dom.NODE */){
					
					if (controller.mode !== 'server:all') 
						childNode.attr['x-compo-id'] = element.ID;
				}

				builder_html(childNode, model, cntx, container, controller, elements);
			}

		}
		
		if (container.nodeType === Dom.COMPONENT) {
			
			if (controller.onRenderEndServer && controller.async !== true) {
				controller.onRenderEndServer(elements, model, cntx, container, controller);
			}
			
		}
		
		if (childs != null && elements && childs !== elements) {
			for (var i = 0, imax = elements.length; i < imax; i++){
				childs.push(elements[i]);
			}
		}


		return container;
	}


	return function(template, model, cntx, container, controller) {
		if (container == null) 
			container = new html_DocumentFragment();
		
		if (controller == null) {
			controller = new Component();
		}
			
		if (cntx == null) 
			cntx = {};
		
		
		cntx._model = new ModelBuilder(model, Cache.modelID);
		cntx._id = Cache.controllerID;
		
		var html;

		
		builder_html(template, model, cntx, container, controller);
		
		
		if (cntx.async === true) {
			
			cntx.done(function(){
				
				if (cntx.page && cntx.page.query.debug === 'tree') {
					// cntx.req - is only present, when called by a page instance
					// @TODO - expose render fn only for page-render purpose
					
					cntx.resolve(JSON.stringify(logger_dimissCircular(container)));
					return;
				}
				
				html = html_stringify(container, model, cntx, controller);
				
				cntx.resolve(html);
			});
			
			return null;
		}
		
		
		if (cntx.page && cntx.page.query.debug === 'tree') 
			return JSON.stringify(logger_dimissCircular(container));
		

		
		html = html_stringify(container, model, cntx, controller);
		
		return html;
	};

	
	
	
}());
