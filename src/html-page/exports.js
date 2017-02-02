var HtmlPage;
(function(){

	// import ./scripts.js
	// import ./transform.js

	HtmlPage = {
		render: function(tmpl, model, ctx){
			var ast;
			
			ast = _scripts_handleSync(tmpl, model, ctx);
			ast = _transformMaskAutoTemplates(ast);

			return mask.render(ast, model, ctx);
		},
		renderAsync: function (tmpl, model, ctx) {

			return _scripts_handleAsync(tmpl, model, ctx)
				.then(ast => {
					var ast2 = _transformMaskAutoTemplates(ast);

					return mask.renderAsync(ast2, model, ctx);
				});			 
		},
	}
}());