(function(){
	
	HtmlDom.Component = function (node, model, ctx, container, controller) {
		
		var compo,
			attr,
			key,
			cacheInfo;
		
		var compoName = node.compoName || node.tagName,
			Handler = custom_Tags[compoName] || node.controller;
		
		if (Handler != null) 
			cacheInfo = is_Function(Handler)
				? Handler.prototype.cache
				: Handler.cache;
		
		if (cacheInfo != null) 
			compo = Cache.getCompo(model, ctx, compoName, Handler);
		
		if (compo != null) {
			this.compo = compo;
			
			if (compo.__cached) {
				compo.render = fn_empty;
			}
			controller_addCompo(controller, compo);
			return;
		}
		
		if (Handler != null) {
		
			if (is_Function(Handler))
				compo = new Handler(model);
			
			if (compo == null && is_Function(Handler.__Ctor)) 
				compo = new Handler.__Ctor(node, controller);
			
			if (compo == null)
				compo = Handler;
		}
		
		if (compo == null) {
			compo = {
				model: node.model,
				expression: node.expression,
				modelRef: node.modelRef,
				container: node.container,
				mode: controller.mode,
				modeModel: controller.modeModel
			};
		}
		
		if (compo.cache) 
			Cache.cacheCompo(model, ctx, compoName, compo);
		
		
		this.compo = compo;
		this.node = node;
		
		if (mode_SERVER_ALL === controller.mode) 
			compo.mode = mode_SERVER_ALL;
		
		if (mode_SERVER_CHILDREN === controller.mode) 
			compo.mode = mode_SERVER_ALL;
	
		attr = obj_extend(compo.attr, node.attr);
		
		if (attr['x-mode'] !== void 0) 
			compo.mode = attr['x-mode'] ;
		
		if (attr['x-mode-model']  !== void 0) 
			compo.modeModel = attr['x-mode-model'];
		
		if (compo_isServerMode(this.compo) === false) {
			this.ID = this.compo.ID = ++ ctx._id;
		}
		
		
		this.compoName = compo.compoName = compoName;
		compo.attr = attr;
		compo.parent = controller;
		
		
		
		if (ctx.debug && ctx.debug.breakOn === compo.compoName) {
			debugger;
		}
	
		
		if (compo.nodes == null) 
			compo.nodes = node.nodes;
		
	
		for (key in attr) {
			if (typeof attr[key] === 'function') {
				attr[key] = attr[key]('attr', model, ctx, container, controller, key);
			}
		}
	
	
		if (typeof compo.renderStart === 'function') {
			compo.renderStart(model, ctx, container);
		}
		
		controller_addCompo(controller, compo);
		
		
		if (compo.async === true) {
			compo.await(build_resumeDelegate(compo, model, ctx, this));
			return;
		}
	
		
		if (compo.tagName != null && compo.tagName !== node.tagName) {
			compo.nodes = {
				tagName: compo.tagName,
				attr: compo.attr,
				nodes: compo.nodes,
				type: 1
			};
		}
	
		if (typeof compo.render === 'function') 
			compo.render(model, ctx, this, compo);
		
	};
	
	obj_inherit(HtmlDom.Component, HtmlDom.Node, {
		nodeType: Dom.COMPONENT,
		
		compoName: null,
		instance: null,
		components: null,
		ID: null,
		toString: function() {
			
			var element = this.firstChild,
				compo = this.compo;
				
			if (compo.__cached !== void 0) {
				return compo.__cached;
			}
			
			var meta = compo_getMetaInfo(compo),
				mode = meta.mode,
				compoName,
				attr,
				nodes,
				scope;
			
			if (compo != null) {
				compoName = compo.compoName;
				attr = compo.attr;
				mode = compo.mode;
				
				nodes = compo.nodes;
				scope = compo.scope;
			}
		
			
			var	json = {
					ID: this.ID,
					modelID: this.modelID,
					
					compoName: compoName,
					attr: attr,
					expression: compo.expression,
					mask: mode === 'client'
						? mask.stringify(nodes, 0)
						: null,
					nodes: meta.serializeNodes !== true
						? null
						: (compo.serializeNodes || mask.stringify)(this.node),
						
					scope: scope
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
			
			
			if (compo.cache) {
				compo.__cached = string;
			}
			
			return string;
		}
	});
	
	function controller_addCompo(ctr, compo) {
		if (ctr == null)
			return;
		if (ctr.components == null) 
			ctr.components = [];
		
		ctr.components.push(compo);
	}
	
	function build_resumeDelegate(controller, model, ctx, container, childs){
		var anchor = container.appendChild(document.createComment(''));
		
		return function(){
			return build_resumeController(controller, model, ctx, anchor, childs);
		};
	}
	
	
	function build_resumeController(controller, model, ctx, anchor, childs) {
		
		
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
	
			
			var isarray = is_Array(nodes),
				length = isarray === true ? nodes.length : 1,
				i = 0,
				childNode = null,
				fragment = document.createDocumentFragment();
	
			for (; i < length; i++) {
				childNode = isarray === true ? nodes[i] : nodes;
				
				if (childNode.type === 1 /* Dom.NODE */) {
					
					if (compo_isServerMode(controller) === false) 
						childNode.attr['x-compo-id'] = controller.ID;
				}
				
				builder_build(childNode, model, ctx, fragment, controller, elements);
			}
			
			anchor.parentNode.insertBefore(fragment, anchor);
		}
		
			
		// use or override custom attr handlers
		// in Compo.handlers.attr object
		// but only on a component, not a tag controller
		if (controller.tagName == null) {
			var attrHandlers = controller.handlers && controller.handlers.attr,
				attrFn;
			for (var key in controller.attr) {
				
				attrFn = null;
				
				if (attrHandlers && is_Function(attrHandlers[key])) {
					attrFn = attrHandlers[key];
				}
				
				if (attrFn == null && is_Function(custom_Attributes[key])) {
					attrFn = custom_Attributes[key];
				}
				
				if (attrFn != null) {
					attrFn(anchor, controller.attr[key], model, ctx, elements[0], controller);
				}
			}
		}
		
		if (controller.onRenderEndServer) {
			controller.onRenderEndServer(elements, model, ctx, anchor.parentNode);
		}
	
		if (childs != null && childs !== elements){
			var il = childs.length,
				jl = elements.length,
				j  = -1;
	
			while(++j < jl){
				childs[il + j] = elements[j];
			}
		}
	}

}());