
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

Mask.registerHandler = function(tagName, compo, mode){
	if (mode == null) {
		custom_Tags[tagName] = compo;
		return;
	}
	
	custom_Tags[tagName] = mock_TagHandler.create(tagName, compo, mode);
};