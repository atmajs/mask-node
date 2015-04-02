(function(){
	// import /ref-mask/src/builder/util.js
	
	
	HtmlDom.Component = class_createEx(
		HtmlDom.Node,
		{
			nodeType: Dom.COMPONENT,
		
			compoName: null,
			compo: null,
			node : null,
			instance: null,
			components: null,
			ID: null,
			modelID: null,
			
			constructor: function (node, model, ctx, container, ctr) {
				this.node = node;
				this.compoName = node.compoName || node.tagName;
				return;
			
				////var compoName = node.compoName || node.tagName,
				////	Handler   = node.controller || custom_Tags[compoName] || obj_create(node),
				////	cache     = compo_getMetaInfo(Handler).cache || false;
				////
				////if (cache /* unstrict */) {
				////	var compo = Cache.getCompo(model, ctx, compoName, Handler);
				////	if (compo != null) {
				////		this.compo = compo;
				////		
				////		if (compo.__cached) {
				////			compo.render = fn_doNothing;
				////		}
				////		builder_pushCompo(ctr, compo);
				////		return;
				////	}
				////}
				////
				////var compo = _initController(Handler, node, model, ctx, container, ctr),
				////	cache = compo_getMetaInfo(compo).cache;
				////if (cache /* unstrict */) {
				////	Cache.cacheCompo(model, ctx, compoName, compo, cache);
				////}
				////if (compo.compoName == null) {
				////	compo.compoName = compoName;
				////}
				////if (compo.model == null) {
				////	compo.model = model;
				////}
				////if (compo.nodes == null) {
				////	compo.nodes = node.nodes;
				////}
				////this.compoName = compo.compoName;
				////this.compo = compo;
				////this.node  = node;
				////
				////var attr = obj_extend(compo.attr, node.attr),
				////	mode = compo_getMetaVal(ctr, 'mode');
				////if (mode_SERVER_ALL === mode || mode_SERVER_CHILDREN === mode) {
				////	compo_setMetaVal(compo, 'mode', mode_SERVER_ALL);
				////}
				////if (attr['x-mode'] !== void 0) {
				////	mode = attr['x-mode'];
				////	compo_setMetaVal(compo, 'mode', mode);
				////}
				////if (attr['x-mode-model']  !== void 0) {
				////	compo_setMetaVal(compo, 'modeModel', attr['x-mode-model']);
				////}
				////if (compo_isServerMode(this.compo) === false) {
				////	this.ID = this.compo.ID = ++ ctx._id;
				////}
				////if (mode === mode_CLIENT) {
				////	compo.render = fn_doNothing;
				////}
				////
				////compo.attr = attr;
				////compo.parent = ctr;
				////
				////for (var key in attr) {
				////	if (is_Function(attr[key])) {
				////		attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
				////	}
				////}
				////
				////if (is_Function(compo.renderStart)) {
				////	compo.renderStart(model, ctx, container);
				////}
				////
				////builder_pushCompo(ctr, compo);
				////if (compo.async === true) {
				////	var resume = builder_resumeDelegate(
				////		compo
				////		, model
				////		, ctx
				////		, this
				////		, null
				////		, compo.onRenderEndServer
				////	);
				////	compo.await(resume);
				////	return;
				////}
				////
				////compo_wrapOnTagName(compo, node);
				////
				////if (is_Function(compo.render)) 
				////	compo.render(model, ctx, this, compo);
				////
				////this.initModelID(ctx, model);
			},
			
			setComponent: function (compo, model, ctx) {
				this.ID    = compo.ID;
				this.compo = compo;
				this.setModelId_(compo, model, ctx);
			},
			setModelId_: function(compo, model, ctx){
				if (compo_isServerMode(compo)) 
					return;
				
				if (compo.modelRef) {
					var id = ctx._models.tryAppend(compo);
					if (id !== -1){
						this.modelID = id;
					}
					return;
				}
				
				if (compo.model == null || compo.model === model) {
					return;
				}
				
				var id = ctx._models.tryAppend(compo);
				if (id !== -1) {
					this.modelID = id;
				}
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
				var compo = this.compo;
				if (compo.__cached != null) {
					return compo.__cached;
				}
				
				var meta = compo_getMetaInfo(compo);
				if (meta.mode === mode_CLIENT) {
					var json = {
							mask: mask_stringify(this.node, 0)
						},
						info = {
							type: 'r',
							single: true,
						},
						string = Meta.stringify(json, info);
					if (meta.cache /* unstrict */) {
						compo.__cached = string;
					}
					return string;
				}
				
				var	json = {
						ID: this.ID,
						modelID: this.modelID,						
						compoName: compo.compoName,
						attr: compo.attr,
						expression: compo.expression,
						nodes: _serializeNodes(meta, this),
						scope: _serializeScope(meta, compo)
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
					string += _stringifyChildren(this);
				}
				
				if (meta.mode !== mode_CLIENT) {
					string += Meta.close(json, info);
				}
				if (meta.cache) {
					compo.__cached = string;
				}
				return string;
			}
		});
	
	function _stringifyChildren(compoEl) {
		var el  = compoEl.firstChild,
			str = '';
		while (el != null) {
			str += el.toString();
			el = el.nextSibling;
		}
		return str;
	}
	
	function _initController(Mix, node, model, ctx, el, ctr) {
		if (is_Function(Mix)) {
			return new Mix(node, model, ctx, el, ctr);
		}
		if (is_Function(Mix.__Ctor)) {
			return new Mix.__Ctor(node, model, ctx, el, ctr);
		}
		return Mix;
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
	function _serializeScope(meta, compo) {
		if (meta.serializeScope == null) {
			return null;
		}
		
		var scope = compo.scope;
		if (scope == null) {
			return null;
		}
		
		var parent = compo.parent,
			model = compo.model;
		while(model == null && parent != null){
			model = parent.model;
			parent = parent.parent;
		}
		return compo.serializeScope(scope, model);
	}
}());