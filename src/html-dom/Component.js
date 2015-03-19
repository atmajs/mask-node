(function(){
	// import /ref-mask/src/builder/util.js
	// import /ref-mask/src/builder/util.controller.js
	
	HtmlDom.Component = class_createEx(
		HtmlDom.Node,
		{
			nodeType: Dom.COMPONENT,
		
			compoName: null,
			instance: null,
			components: null,
			ID: null,
			modelID: null,
			
			constructor: function (node, model, ctx, container, ctr) {
				var compo,
					attr,
					key,
					cacheInfo;
				
				var compoName = node.compoName || node.tagName,
					Handler = node.controller || custom_Tags[compoName] || obj_create(node);
				
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
				
				var mode = compo_getMetaVal(ctr, 'mode');
				if (mode_SERVER_ALL === mode || mode_SERVER_CHILDREN === mode) 
					compo_setMetaVal(compo, 'mode', mode_SERVER_ALL);
				
				attr = obj_extend(compo.attr, node.attr);
				
				if (attr['x-mode'] !== void 0) {
					mode = attr['x-mode'];
					compo_setMetaVal(compo, 'mode', mode);
				}
				
				if (attr['x-mode-model']  !== void 0) {
					compo_setMetaVal(compo, 'mode', attr['x-mode-model']);
				}
				if (compo_isServerMode(this.compo) === false) {
					this.ID = this.compo.ID = ++ ctx._id;
				}
				if (mode === 'client') {
					compo.render = fn_doNothing;
				}
				
				compo.attr = attr;
				compo.parent = ctr;
				
				if (compo.compoName == null) 
					compo.compoName = compoName;
					
				if (compo.model == null) 
					compo.model = model;
					
				if (compo.nodes == null) 
					compo.nodes = node.nodes;
				
				this.compoName = compo.compoName;
				
				for (key in attr) {
					if (is_Function(attr[key])) 
						attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
				}
			
				if (is_Function(compo.renderStart)) {
					compo.renderStart(model, ctx, container);
				}
				
				controller_pushCompo(ctr, compo);
				if (compo.async === true) {
					var resume = build_resumeDelegate(
						compo
						, model
						, ctx
						, this
						, null
						, compo.onRenderEndServer
					);
					compo.await(resume);
					return;
				}
		
				compo_wrapOnTagName(compo, node);
		
				if (is_Function(compo.render)) 
					compo.render(model, ctx, this, compo);
				
				this.initModelID(ctx, model);
			},
			initModelID: function(ctx, parentsModel){
				var compo = this.compo;
				if (compo_isServerMode(compo)) 
					return;
				
				if (compo.modelRef) {
					var id = ctx._models.tryAppend(compo);
					if (id !== -1){
						this.modelID = id;
					}
					return;
				}
				
				if (compo.model == null || compo.model === parentsModel) {
					return;
				}
				
				var id = ctx._models.tryAppend(compo);
				if (id !== -1) {
					this.modelID = id;
				}
			},
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
				
				if (meta.mode === 'client') {
					var json = {
						mask: mask_stringify(this.node)
					};
					var info = {
						type: 'r',
						single: true,
					};
					var string = Meta.stringify(json, info);
					if (meta.cache) 
						compo.__cached = string;
					
					return string;
				}
				
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
							? mask_stringify(nodes, 0)
							: null,
						nodes: _serializeNodes(meta, this),
							
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
	
	function _serializeNodes(meta, compoEl) {
		var x = meta.serializeNodes;
		if (x == null || x === false)
			return null;
		
		var fn = null;
		if (is_Function(x)) {
			fn = x;
		}
		if (fn == null && is_Function(compoEl.compo.serializeNodes)) {
			fn = compoEl.compo.serializeNodes;
		}
		if (fn == null) {
			fn = mask_stringify;
		}
		
		return fn.call(compoEl.compo, compoEl.node);
	}
}());