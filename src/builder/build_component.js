var build_component;
(function(){
	build_component = function(node, model, ctx, container, ctr){
		var compoName = node.compoName || node.tagName,
			Handler   = node.controller || custom_Tags[compoName] || obj_create(node),
			cache     = compo_getMetaInfo(Handler).cache || false;
		
		if (cache /* unstrict */) {
			var compo = Cache.getCompo(model, ctx, compoName, Handler);
			if (compo != null) {
				if (compo.__cached) {
					compo.render = fn_doNothing;
				}
				builder_pushCompo(ctr, compo);
				return compo;
			}
		}
		
		var compo = _initController(Handler, node, model, ctx, container, ctr),
			cache = compo_getMetaInfo(compo).cache;
		if (cache /* unstrict */) {
			Cache.cacheCompo(model, ctx, compoName, compo, cache);
		}
		if (compo.compoName == null) {
			compo.compoName = compoName;
		}
		if (compo.model == null) {
			compo.model = model;
		}
		if (compo.nodes == null) {
			compo.nodes = node.nodes;
		}
		
		var attr = obj_extend(compo.attr, node.attr),
			mode = compo_getMetaVal(ctr, 'mode');
		if (mode_SERVER_ALL === mode || mode_SERVER_CHILDREN === mode) {
			compo_setMetaVal(compo, 'mode', mode_SERVER_ALL);
		}
		if (attr['x-mode'] !== void 0) {
			mode = attr['x-mode'];
			compo_setMetaVal(compo, 'mode', mode);
		}
		if (attr['x-mode-model']  !== void 0) {
			compo_setMetaVal(compo, 'modeModel', attr['x-mode-model']);
		}
		if (compo_isServerMode(compo) === false) {
			compo.ID = ++ ctx._id;
		}
		if (mode === mode_CLIENT) {
			compo.render = fn_doNothing;
		}
		
		compo.attr = attr;
		compo.parent = ctr;
		
		for (var key in attr) {
			if (is_Function(attr[key])) {
				attr[key] = attr[key]('attr', model, ctx, container, ctr, key);
			}
		}
	
		if (is_Function(compo.renderStart)) {
			compo.renderStart(model, ctx, container);
		}
		
		builder_pushCompo(ctr, compo);
		if (compo.async === true) {
			var resume = builder_resumeDelegate(
				compo
				, model
				, ctx
				, container
				, null
				, compo.onRenderEndServer
			);
			compo.await(resume);
			return compo;
		}

		compo_wrapOnTagName(compo, node);

		if (is_Function(compo.render)) {
			compo.render(model, ctx, container, compo);
		}
		return compo;
	};
	
	function _initController(Mix, node, model, ctx, el, ctr) {
		if (is_Function(Mix)) {
			return new Mix(node, model, ctx, el, ctr);
		}
		if (is_Function(Mix.__Ctor)) {
			return new Mix.__Ctor(node, model, ctx, el, ctr);
		}
		return Mix;
	}
}());