var atma = typeof atma === 'undefined'
	? window
	: atma
	;

var mask = atma.mask,
	Compo = mask.Compo,
	Dom = mask.Dom,
	Class = atma.Class;

var custom_Attributes = mask.getAttrHandler(),
	custom_Tags = mask.getHandlers(),
	custom_Utils = mask.getUtil();

var __models,
	__ID = 0;

// import ./utils.js
// import ./model.js
// import ./mock.js
// import ./traverse.js
// import ./setup.js

function bootstrap(container, Mix) {
	if (container == null)
		container = document.body;

	var compo, fragmentCompo;
	if (Mix == null) {
		fragmentCompo = compo = new mask.Compo();
	}
	else if (typeof Mix === 'function') {
		fragmentCompo = compo = new Mix();
	} else {
		compo = Mix;
		fragmentCompo = new mask.Compo();
		fragmentCompo.parent = compo
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
		el = metaNode.nextSibling,
		ctx = meta.ctx;
	if (ctx != null) {
		ctx = JSON.parse(ctx);
	} else {
		ctx = {};
	}

	setup(el, model, ctx, el.parentNode, fragmentCompo);

	if (fragmentCompo !== compo) {
		util_pushComponents_(compo, fragmentCompo);
	}

	Compo.signal.emitIn(fragmentCompo, 'domInsert');
	return fragmentCompo;
}
