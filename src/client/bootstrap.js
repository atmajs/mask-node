
function bootstrap(container) {
	
	// import ../util/function.js
	// import ../util/array.js
	// import ../mock/Meta.js
	// import traverse.js
	// import setup.js
	
	if (container == null) {
		container = document.body;
	}
	
	var metaNode = trav_getMeta(container.firstChild),
		metaContent = metaNode && metaNode.textContent,
		meta = metaContent && Meta.parse(metaContent);
		
		
	if (meta == null || meta.type !== 'm') {
		console.error('Meta Inforamtion not defined', container);
		return;
	}
	
	var models = JSON.parse(meta.model),
		model = models[0];

	
	var custom_Attributes = mask.getAttrHandler(),
		custom_Tags = mask.getHandler(),
		custom_Utils = mask.getUtility(),
		Dom = mask.Dom;

	var stop_NODE = null;
	
	
	
	var compo = {
			components: []
		};
		
	var el = metaNode.nextSibling;
	
	
	window.model = model;
	
	setup(el, model, {}, el.parentNode, compo);

	

	if (typeof Compo !== 'undefined') {
		Compo.signal.emitIn(compo, 'DOMInsert');
	}

}