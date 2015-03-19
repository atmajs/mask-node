var Meta,
	mock_TagHandler;

(function(){

	// import Meta.js
	// import attr-handler.js
	// import tag-handler.js
	// import util-handler.js
	
	var orig_registerUtil = Mask.registerUtil;
	
	Mask.registerAttrHandler = function(attrName, mix, fn){
		
		if (fn == null) {
			custom_Attributes[attrName] = mix;
			return;
		}
		
		// obsolete - change args in all callers
		if (typeof fn === 'string') {
			var swap = mix;
			mix = fn;
			fn = swap;
		}
		
		custom_Attributes[attrName] = mock_AttrHandler.create(attrName, fn, mix);
	};
	
	
	
	Mask.registerUtil = function(name, mix, mode){
		
		if (mode == null && is_Object(mix)) 
			mode = mix.mode;
		
		orig_registerUtil(name, mode == null
			? mix
			: mock_UtilHandler.create(name, mix, mode)
		);
	}
	
	// backward support
	Mask.registerUtility  = Mask.registerUtil;
	
	Mask.registerHandler = function(tagName, compo){
		
		if (compo != null && typeof compo === 'object') {
			//> static
			compo.__Ctor = wrapStatic(compo);
		}	
		
		if (custom_Tags_defs.hasOwnProperty(tagName)) 
			obj_extend(compo.prototype, custom_Tags_defs[tagName]);
		
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo;
		if (proto.meta == null) 
			proto.meta = proto.$meta || {};
		
		/* obsolete meta copy */
		if (proto.cache) 
			proto.meta.cache = proto.cache;
		if (proto.mode) 
			proto.meta.mode = proto.mode;
		
		
		if (compo_getMetaVal(compo, 'mode') === mode_CLIENT) {
			custom_Tags[tagName] = mock_TagHandler.create(tagName, compo, 'client');
			return;
		}
		
		custom_Tags[tagName] = compo;
	};
	
	Mask.compoDefinitions = function(compos, utils, attributes){
		var tags = custom_Tags,
			defs = custom_Tags_defs;
			
		for (var tagName in compos) {
			defs[tagName] = compos[tagName];
			
			if (tags[tagName] !== void 0) {
				obj_extend(tags[tagName].prototype, compos[tagName]);
				continue;
			}
			
			tags[tagName] = mock_TagHandler.create(tagName, null, 'client');
		}
		
		var doNothing = function(){};
		for (var key in utils){
			if (utils[key].mode === 'client'){
				Mask.registerUtil(key, doNothing, 'client');
			}
		}
		
		for (var key in attributes){
			if (attributes[key].mode === 'client') {
				Mask.registerAttrHandler(key, doNothing, 'client');
			}
		}
	};	
	
	
	function wrapStatic(proto, parent) {
		function Ctor(node) {
			this.tagName = node.tagName;
			this.compoName = node.tagName;
			
			this.attr = node.attr;
			this.expression = node.expression;
			this.nodes = node.nodes;
			this.nextSibling = node.nextSibling;
			this.parent = parent;
			this.components = null;
		}
		
		Ctor.prototype = proto;
		
		return Ctor;
	}
}());
