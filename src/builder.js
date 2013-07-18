var builder_build = (function() {

	// import model.js
	// import stringify.js
	// import html-dom/lib.js
	// import handler/document.js
	


	var _controllerID = 0;

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
			
			var instance = element.instance;
			
			if (instance != null) {
				if (instance.model) {
					model = instance.model;
					
					element.modelID = cntx._model.append(model);
				}
				
				if (instance.render) {
					return element;
				}
				
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
					
					childNode.attr['x-compo-id'] = element.ID;
				}

				builder_html(childNode, model, cntx, container, controller);
			}

		}


		return container;
	}


	return function(template, model, cntx) {
		var doc = new html_DocumentFragment(),
			component = new Component();
			
		if (cntx == null) {
			cntx = {};
		}
		
		cntx._model = new ModelBuilder(model);


		builder_html(template, model, cntx, doc, component);
		
		if (cntx.async === true) {
			
			cntx.done(function(){
				var html = html_stringify(doc, model, cntx, component);
				
				cntx.resolve(html);
			});
			
			return null;
		}

		return html_stringify(doc, model, cntx, component);
	};

}());
