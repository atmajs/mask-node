var HtmlPage;
(function(){

	// import ./scripts.js
	// import ./transform.js

	HtmlPage = {
		render: function(tmpl, model, ctx){
			var ast;
			
			ast = _scripts_handleSync(tmpl, model, ctx);
			ast = _transformMaskAutoTemplates(ast);

			return Mask.render(ast, model, ctx);
		},
		renderAsync: function (tmpl, model, ctx) {

			return _scripts_handleAsync(tmpl, model, ctx)
				.then(ast => {
					var ast2 = _transformMaskAutoTemplates(ast);

					if (ctx && ctx.config && ctx.config.shouldAppendBootstrap) {
						_transformAddingMaskBootstrap(ast2, ctx.config.maskBootstrapPath);
					}
					return Mask
						.renderHtmlDomAsync(ast2, model, ctx)
						.then(function (dom, model, ctx, compo) {


							return Mask.toHtml(dom, model, ctx, compo); 
						})
				});			 
		},
	}
}());