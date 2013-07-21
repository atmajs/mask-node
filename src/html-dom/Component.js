function html_Component(node, model, cntx, container, controller) {
	
	this.ID = ++ cntx._id;
	
	var typeof_Instance = typeof node.controller === 'function',
		handler = typeof_Instance
			? new node.controller(model)
			: node.controller;

	
	if (controller.mode === 'server:all') {
		this.mode = 'server:all';
		
		if (handler) 
			handler.mode = 'server:all';;
		
		
	}
		
	
	if (handler == null) 
		return;
	

	var attr = util_extend(handler.attr, node.attr),
		key;
	
	obj_extend(handler, {
		compoName : node.compoName || node.tagName,
		attr : attr,
		model : model,
		parent : controller
	});
	
	if (!handler.nodes) {
		handler.nodes = node.nodes;
	}

	

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
		
		var mode = this.mode,
			compoName,
			attr,
			nodes;
		
		if (instance != null) {
			compoName = instance.compoName;
			attr = instance.attr;
			mode = instance.mode;
			
			nodes = instance.nodes;
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
		
		var string = Meta.stringify(json, info),
			element = this.firstChild;
			
		while (element != null) {
			string += element.toString();
			element = element.nextSibling;
		}
		
		
		if (mode !== 'client') 
			string += Meta.close(json, info);
		
		return string;
	}
});

