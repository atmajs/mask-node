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


	function builder_html(node, model, cntx, container, controller) {

		if (node == null) {
			return container;
		}

		var type = node.type,
			element,
			elements,
			childs,
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
			
			var instance = element.compo;
			
			if (instance != null) {
				
				if (instance.model) {
					model = instance.model;
					
					if (mode_SERVER_ALL !== instance.mode
						&& mode_model_NONE !== instance.modeModel) {
						
						element.modelID = cntx._model.append(model);
					}
				}
				
				if (instance.render) 
					return element;
				
				controller = instance;
				node = instance;	
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

				builder_html(childNode, model, cntx, container, controller);
			}

		}
		
		if (container.nodeType === Dom.COMPONENT) {
			
			if (container.onRenderEndServer) {
				container.onRenderEndServer();
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
		
		
		cntx._model = new ModelBuilder(model);
		cntx._id = 0;
		
		var html;

		//var profiler = require('profiler');
		
		//profiler.resume();
		
		console.time('-build-')
		builder_html(template, model, cntx, container, controller);
		console.log(console.timeEnd('-build-'));
		
		//profiler.pause();
		
		if (cntx.req && cntx.req.query.debug === 'tree') {
			cntx.async = false;
			return JSON.stringify(logger_dimissCircular(container));
		}
		
		
		
		if (cntx.async === true) {
			
			console.time('-build-async-wait-');
			cntx.done(function(){
				console.log(console.timeEnd('-build-async-wait-'));
				
				console.time('-stringify-')
				html = html_stringify(container, model, cntx, controller);
				
				console.log(console.timeEnd('-stringify-'));
				
				
				cntx.resolve(html);
			});
			
			return null;
		}

		console.time('-stringify-')
		html = html_stringify(container, model, cntx, controller);
		
		console.log(console.timeEnd('-stringify-'));
		
		
		return html;
	};

	
	
	
}());
