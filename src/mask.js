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
				_ctx.done(function(){
					dfr.resolve(HtmlDom.stringify(dom, model, _ctx, _ctr))
				});
			} else {
				dfr.resolve(HtmlDom.stringify(dom, model, _ctx, _ctr));
			}
			return dfr;
		}
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