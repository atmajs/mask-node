var atma = typeof atma === 'undefined'
	? window
	: atma
	;
	
var mask = atma.mask,
	Compo = mask.Compo
	Dom = mask.Dom;

var custom_Attributes = mask.getAttrHandler(),
	custom_Tags = mask.getHandler(),
	custom_Utils = mask.getUtil();

var __models,
	__ID = 0;


// import ../util/function.js
// import ../util/array.js
// import ../mock/Meta.js

// import utils.js
// import model.js
// import mock.js
// import traverse.js
// import setup.js

function bootstrap(container, Mix) {
	if (container == null) 
		container = document.body;
	
	var compo, fragment;
	if (Mix == null) {
		fragment = compo = new mask.Compo();
	}
	else if (typeof Mix === 'function') {
		fragment = compo = new Mix();
	} else {
		compo = Mix;
		fragment = new mask.Compo();
		fragment.parent = compo
	}
	
	var metaNode = trav_getMeta(container.firstChild),
		metaContent = metaNode && metaNode.textContent,
		meta = metaContent && Meta.parse(metaContent);
		
		
	if (meta == null || meta.type !== 'm') {
		console.error('Mask.Bootstrap: meta information not found', container);
		return;
	}
	
	if (meta.ID != null) 
		mask.setCompoIndex(__ID = meta.ID);
	
	__models = model_parse(meta.model);
	
	var model = compo.model = __models.m1,
		el = metaNode.nextSibling;
	
	
	setup(el, model, {}, el.parentNode, fragment);
	
	Compo.signal.emitIn(fragment, 'domInsert');
	util_extendComponents_(compo, fragment);
	return fragment;
}

function wrapDom(el, model, ctx, Mix) {
	var compo = Mix || {};
	if (typeof Mix === 'function') 
		compo = new Mix();
	
	setup(el.firstChild, model, ctx, el, compo);
	
	if (compo.renderEnd) 
		compo.renderEnd(el.children, model, ctx, el);
	
	Compo.signal.emitIn(compo, 'domInsert');
}