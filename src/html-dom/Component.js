(function(){
	
	HtmlDom.Component = function (node, model, ctx, container, ctr) {
		var compo,
			attr,
			key,
			cacheInfo;
		
		var compoName = node.compoName || node.tagName,
			Handler = node.controller || custom_Tags[compoName];
		
		if (Handler != null) 
			cacheInfo = compo_getMetaInfo(Handler).cache;
		
		if (cacheInfo != null) {
			compo = Cache.getCompo(model, ctx, compoName, Handler);
			if (compo != null) {
				this.compo = compo;
				
				if (compo.__cached) {
					compo.render = fn_doNothing;
				}
				controller_pushCompo(ctr, compo);
				return;
			}
		}
		
		compo = controller_initialize(Handler, node, model, ctx, container, ctr);
		
		var cache = compo_getMetaInfo(compo).cache;
		if (cache /* unstrict */) {
			Cache.cacheCompo(model, ctx, compoName, compo, cache);
		}
		
		
		this.compo = compo;
		this.node = node;
		
		var mode = compo_getRenderMode(ctr);
		if (mode_SERVER_ALL === mode || mode_SERVER_CHILDREN === mode) 
			compo_setMode(compo, mode_SERVER_ALL);
		
		attr = obj_extend(compo.attr, node.attr);
		
		if (attr['x-mode'] !== void 0) {
			mode = attr['x-mode'];
			compo_setMode(compo, mode) ;
		}
		
		if (attr['x-mode-model']  !== void 0) {
			compo.modeModel = attr['x-mode-model'];
		}
		if (compo_isServerMode(this.compo) === false) {
			this.ID = this.compo.ID = ++ ctx._id;
		}
		if (mode === 'client') {
			compo.render = fn_doNothing;
		}
		
		
		this.compoName = compo.compoName = compoName;
		compo.attr = attr;
		compo.parent = ctr;
		
		if (compo.model == null) 
			compo.model = model;
		if (compo.nodes == null) 
			compo.nodes = node.nodes;
		
		
		for (key in attr) {
			if (is_Function(attr[key])) 
				attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
		}
	
		if (is_Function(compo.renderStart)) {
			compo.renderStart(model, ctx, container);
		}
		
		controller_pushCompo(ctr, compo);
		if (compo.async === true) {
			compo.await(build_resumeDelegate(compo, node, model, ctx, this));
			return;
		}

		compo_wrapOnTagName(compo, node);

		if (is_Function(compo.render)) 
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
				
			if (compo.__cached !== void 0) 
				return compo.__cached;
			
			var compoName = compo.compoName,
				meta = compo_getMetaInfo(compo),
				attr = compo.attr,
				nodes = compo.nodes,
				scope = compo.scope;
			
			if (scope != null && meta.serializeScope) {
				var parent = compo.parent,
					model = compo.model;
				while(model == null && parent != null){
					model = parent.model;
					parent = parent.parent;
				}
				scope = compo.serializeScope(scope, model);
			}
			
			var	json = {
					ID: this.ID,
					modelID: this.modelID,
					
					compoName: compoName,
					attr: attr,
					expression: compo.expression,
					mask: meta.mode === 'client'
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
					mode: meta.mode
				};
			
			var string = Meta.stringify(json, info);
			
			if (compo.toHtml != null) {
				string += compo.toHtml();
			} else {
				var el = this.firstChild;
				while (el != null) {
					string += el.toString();
					el = el.nextSibling;
				}
			}
			
			if (meta.mode !== 'client') 
				string += Meta.close(json, info);
			
			if (meta.cache) 
				compo.__cached = string;
			
			return string;
		}
	});
	
	function controller_pushCompo(ctr, compo) {
		if (ctr == null)
			return;
		if (ctr.components == null) 
			ctr.components = [];
		
		ctr.components.push(compo);
	}
	function controller_initialize(Handler, node, model, ctx, container, ctr) {
		if (Handler != null) {
		
			if (is_Function(Handler))
				return new Handler(node, model, ctx, container, ctr);
			
			if (is_Function(Handler.__Ctor)) 
				return new Handler.__Ctor(node, model, ctx, container, ctr);
			
			return Handler;
		}
		
		return {
			model: node.model,
			expression: node.expression,
			modelRef: node.modelRef,
			container: node.container,
			meta: compo_getMetaInfo(ctr),
			attr: null,
		};
	}
	
	function build_resumeDelegate(ctr, node, model, ctx, container, children){
		var anchor = container.appendChild(document.createComment(''));
		return function(){
			return build_resumeController(ctr, node, model, ctx, anchor, children);
		};
	}
	
	function build_resumeController(ctr, node, model, ctx, anchor, children) {
		compo_wrapOnTagName(ctr, node);
		
		if (ctr.model != null) {
			model = ctr.model;
		}
		
		
		var fragment = document.createDocumentFragment(),
			elements = [];
		
		build_childNodes(node, model, ctx, fragment, ctr, elements);
			
		if (fragment.firstChild != null) 
			anchor.parentNode.insertBefore(fragment, anchor);
		
		
		
		// use or override custom attr handlers
		// in Compo.handlers.attr object
		// but only on a component, not a tag ctr
		if (ctr.tagName == null) {
			var attrHandlers = ctr.handlers && ctr.handlers.attr,
				attrFn;
			for (var key in ctr.attr) {
				
				attrFn = null;
				
				if (attrHandlers && is_Function(attrHandlers[key])) {
					attrFn = attrHandlers[key];
				}
				
				if (attrFn == null && is_Function(custom_Attributes[key])) {
					attrFn = custom_Attributes[key];
				}
				
				if (attrFn != null) {
					attrFn(anchor, ctr.attr[key], model, ctx, elements[0], ctr);
				}
			}
		}
		
		if (is_Function(ctr.onRenderEndServer)) {
			ctr.onRenderEndServer(elements, model, ctx, anchor.parentNode);
		}
	
		arr_pushMany(children, elements);
	}

}());