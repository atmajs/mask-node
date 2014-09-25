(function(){
	
	Mask.render = function (template, model, ctx, container, controller) {
	
		// if DEBUG
		if (container != null && typeof container.appendChild !== 'function'){
			console.error('.render(template[, model, ctx, container, controller]', 'Container should implement .appendChild method');
			console.warn('Args:', arguments);
		}
		// endif
	
		if (typeof template === 'string') {
			if (_Object_hasOwnProp.call(cache, template)){
				/* if Object doesnt contains property that check is faster
				then "!=null" http://jsperf.com/not-in-vs-null/2 */
				template = cache[template];
			}else{
				template = cache[template] = parser_parse(template);
			}
		}
		
		if (controller == null) 
			controller = new Dom.Component();
		
		if (ctx == null) 
			ctx = { _model: null, _ctx: null };
		
		var dom = builder_build(template, model, ctx, container, controller);
		if (ctx.async === true) {
				
			ctx.done(function(){
				ctx.resolve(toHtml(
					dom, model, ctx, controller
				));
			});
			return null;
		}
		return toHtml(dom, model, ctx, controller);
	};
	
	function toHtml(dom, model, ctx, controller){
		
		return HtmlDom.stringify(dom, model, ctx, controller);
	}
}());