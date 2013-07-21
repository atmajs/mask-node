
// import Meta.js
// import attr-handler.js
// import tag-handler.js
// import util-handler.js



Mask.registerAttrHandler = function(attrName, fn, mode){
	
	if (mode == null) {
		custom_Attributes[attrName] = fn;
		return;
	}
	
	custom_Attributes[attrName] = mock_AttrHandler.create(attrName, fn, mode);
};

Mask.registerUtility = function(name, fn, mode){
	
	if (mode == null) {
		custom_Utils[name] = fn;
		return;
	}
	
	custom_Utils[name] = mock_UtilHandler.create(name, fn, mode);
};

Mask.registerHandler = function(tagName, compo){
	
	if (custom_Tags_defs.hasOwnProperty(tagName)) {
		obj_extend(compo.prototype, custom_Tags_defs[tagName]);
	}
	
	if (compo.prototype.mode === 'client') {
		custom_Tags[tagName] = mock_TagHandler.create(tagName, compo, 'client');
	}
	
	custom_Tags[tagName] = compo;
};

Mask.compoDefinitions = function(compos){
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
	
};