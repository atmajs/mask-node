function html_Component(node, model, cntx, container, controller) {
	var typeof_Instance = typeof node.controller === 'function',
		handler = typeof_Instance ? new node.controller(model) : node.controller;

	if (handler == null) {
		return;
	}

	

	var key, attr;

	handler.compoName = node.compoName || node.tagName;
	
	handler.attr = attr = util_extend(handler.attr, node.attr);
	handler.model = model;
	handler.nodes = node.nodes;
	handler.parent = controller;


	for (key in attr) {
		if (typeof attr[key] === 'function') {
			attr[key] = attr[key]('attr', model, cntx, container, controller, key);
		}
	}


	if (typeof handler.renderStart === 'function') {
		handler.renderStart(model, cntx, container);
	}

	// temporal workaround for backwards compo where we used this.tagName = 'div' in .render fn
	if (handler.tagName != null && handler.tagName !== node.compoName) {
		handler.nodes = {
			tagName: handler.tagName,
			attr: handler.attr,
			nodes: handler.nodes,
			type: 1
		};
	}



	if (controller) {
		(controller.components || (controller.components = []))
			.push(node);
	}



	if (typeof handler.render === 'function') {
		handler.render(model, cntx, this, this);
	}

	if (typeof_Instance) {
		this.instance = handler;
		this.ID = ++_controllerID;
	}
}



html_Component.prototype = obj_inherit(html_Component, html_Node, {
	nodeType: Dom.COMPONENT,
	
	instance: null,
	components: null,
	ID: null,
	toString: function() {
		
		var element = this.firstChild,
			instance = this.instance;
		
		if (instance == null){
			debugger;
		}
		
		
		var	instance = this.instance,
			mode = instance.mode,
			json = {
				ID: this.ID,
				modelID: this.modelID,
				
				compoName: instance.compoName,
				attr: instance.attr,
				mask: mode === 'client'
						? mask.stringify(instance.nodes, 0)
						: null
			},
			info = {
				single: this.firstChild == null,
				type: 't',
				mode: mode
			};
		
		
		var string = Meta.stringify(json, info),
			element = this.firstChild;
			
		while (element != null) {
			string += element.toString();
			element = element.nextNode;
		}
		
		
		if (mode !== 'client') 
			string += Meta.close(json, info);
		
		return string;
	}
});

