(function(){
	var mask_render = Mask.render;

	obj_extend(Mask, {
		toHtml: function(dom, model, ctx, ctr){
			return HtmlDom.stringify(dom, model, ctx, ctr);
		},
		render: function(tmpl, model, ctx, el, ctr){
			var _ctr = ensureCtr(ctr),
				_ctx = ensureCtx(ctx),
				dom = mask_render(tmpl, model, _ctx, el, _ctr);

			return HtmlDom.stringify(dom, model, _ctx, _ctr);
		},
		renderAsync: function(tmpl, model, ctx, el, ctr){
			var _ctr = ensureCtr(ctr),
				_ctx = ensureCtx(ctx),
				dfr = new class_Dfr,
				dom = mask_render(tmpl, model, _ctx, el, _ctr);

			if (_ctx.async === true) {
				_ctx.done(resolve);
			} else {
				resolve();
			}

			function resolve() {
				var html = _ctx._rewrite == null && _ctx._redirect == null
					? HtmlDom.stringify(dom, model, _ctx, _ctr)
					: null;
				dfr.resolve(html);
			}
			return dfr;
		},
		renderPage: HtmlPage.render,
		renderPageAsync: HtmlPage.renderAsync,
		build: function (tmpl, model, ctx, el, ctr) {
			var _ctr = ensureCtr(ctr),
				_ctx = ensureCtx(ctx),
				dom = mask_render(tmpl, model, _ctx, el, _ctr);

			return {
				ctx: _ctx,
				model: model,
				component: _ctx,
				element: dom
			};
		},
		buildAsync: function(tmpl, model, ctx, el, ctr){
			var _ctr = ensureCtr(ctr),
				_ctx = ensureCtx(ctx),
				dfr = new class_Dfr,
				dom = mask_render(tmpl, model, _ctx, el, _ctr);

			if (_ctx.async === true) {
				_ctx.done(resolve);
			} else {
				resolve();
			}
			function resolve() {
				dfr.resolve({
					ctx: _ctx,
					model: model,
					component: _ctx,
					element: dom
				});
			}
			return dfr;
		},
	});

	function ensureCtr(ctr) {
		return ctr == null
			? new Dom.Component
			: ctr;
	}
	function ensureCtx(ctx) {
		return ctx == null || ctx.constructor !== builder_Ctx
			? new builder_Ctx(ctx)
			: ctx;
	}
}());