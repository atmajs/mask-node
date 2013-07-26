function html_Component(node, model, cntx, container, controller) {
	
	var compo, attr, key;
	
	this.ID = ++ cntx._id;
	
	
	compo = is_Function(node.controller)
		? new node.controller(model)
		: (node.controller);
		
	
	if (compo == null) {
		compo = {
			model: node.model,
			container: node.container
		};
	}
	
	this.compo = compo;
	
	
	if (mode_SERVER_ALL === controller.mode) 
		compo.mode = mode_SERVER_ALL;
	
	if (mode_SERVER_CHILDREN === controller.mode) 
		compo.mode = mode_SERVER_ALL;
	
		

	attr = util_extend(compo.attr, node.attr);
		
	
	
	this.compoName = compo.compoName = node.compoName || node.tagName;
	compo.attr = attr;
	compo.parent = controller;
	
	
	
	if (cntx.debug && cntx.debug.breakOn === compo.compoName) {
		debugger;
	}

	
	if (compo.nodes == null) 
		compo.nodes = node.nodes;
	

	for (key in attr) {
		if (typeof attr[key] === 'function') {
			attr[key] = attr[key]('attr', model, cntx, container, controller, key);
		}
	}


	if (typeof compo.renderStart === 'function') {
		compo.renderStart(model, cntx, container);
	}
	
	if (controller) {
		(controller.components || (controller.components = []))
			.push(compo);
	}
	
	if (compo.async === true) {
		compo.await(build_resumeDelegate(compo, model, cntx, this));
		return;
	}

	
	if (compo.tagName != null && compo.tagName !== node.compoName) {
		compo.nodes = {
			tagName: compo.tagName,
			attr: compo.attr,
			nodes: compo.nodes,
			type: 1
		};
	}

	if (typeof compo.render === 'function') 
		compo.render(model, cntx, this, compo);
	
}



html_Component.prototype = obj_inherit(html_Component, html_Node, {
	nodeType: Dom.COMPONENT,
	
	compoName: null,
	instance: null,
	components: null,
	ID: null,
	toString: function() {
		
		var element = this.firstChild,
			compo = this.compo;
		
		var mode = compo.mode,
			compoName,
			attr,
			nodes;
		
		if (compo != null) {
			compoName = compo.compoName;
			attr = compo.attr;
			mode = compo.mode;
			
			nodes = compo.nodes;
		}
	
		
		var	json = {
				ID: this.ID,
				modelID: this.modelID,
				
				compoName: compoName,
				attr: attr,
				mask: mode === 'client'
						? mask.stringify(nodes, 0)
						: null
			},
			info = {
				single: this.firstChild == null,
				type: 't',
				mode: mode
			};
		
		var string = Meta.stringify(json, info);
		
		if (compo.toHtml != null) {
			
			string += compo.toHtml();
		} else {
			
			var element = this.firstChild;
			while (element != null) {
				string += element.toString();
				element = element.nextSibling;
			}
		}
		
		
		if (mode !== 'client') 
			string += Meta.close(json, info);
		
		return string;
	}
});


function build_resumeDelegate(controller, model, cntx, container, childs){
	var anchor = container.appendChild(document.createComment(''));
	
	return function(){
		return build_resumeController(controller, model, cntx, anchor, childs);
	};
}


function build_resumeController(controller, model, cntx, anchor, childs) {
	
	
	if (controller.tagName != null && controller.tagName !== controller.compoName) {
		controller.nodes = {
			tagName: controller.tagName,
			attr: controller.attr,
			nodes: controller.nodes,
			type: 1
		};
	}
	
	if (controller.model != null) {
		model = controller.model;
	}
	
	
	var nodes = controller.nodes,
		elements = [];
	if (nodes != null) {

		
		var isarray = nodes instanceof Array,
			length = isarray === true ? nodes.length : 1,
			i = 0,
			childNode = null,
			fragment = document.createDocumentFragment();

		for (; i < length; i++) {
			childNode = isarray === true ? nodes[i] : nodes;
			
			if (childNode.type === 1 /* Dom.NODE */) {
				
				if (controller.mode !== 'server:all') 
					childNode.attr['x-compo-id'] = controller.ID;
			}
			
			builder_html(childNode, model, cntx, fragment, controller, elements);
		}
		
		anchor.parentNode.insertBefore(fragment, anchor);
	}
	
		
	// use or override custom attr handlers
	// in Compo.handlers.attr object
	// but only on a component, not a tag controller
	if (controller.tagName == null) {
		var attrHandlers = controller.handlers && controller.handlers.attr,
			attrFn;
		for (key in controller.attr) {
			
			attrFn = null;
			
			if (attrHandlers && is_Function(attrHandlers[key])) {
				attrFn = attrHandlers[key];
			}
			
			if (attrFn == null && is_Function(custom_Attributes[key])) {
				attrFn = custom_Attributes[key];
			}
			
			if (attrFn != null) {
				attrFn(node, controller.attr[key], model, cntx, elements[0], controller);
			}
		}
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
