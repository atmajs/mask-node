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
		
		if (custom_Tags_defs.hasOwnProperty(tagName)) {
			obj_extend(compo.prototype, custom_Tags_defs[tagName]);
		}
		
		if (compo_getRenderMode(compo) === compo_renderMode_CLIENT) {
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
		
		for (var key in utils){
			if (utils[key].mode === 'client'){
				Mask.registerUtil(key, function(){}, 'client');
			}
		}
		
		for (var key in attributes){
			if (attributes[key].mode === 'client') {
				Mask.registerAttrHandler(key, function(){}, 'client');
			}
		}
	};	
	
}());
