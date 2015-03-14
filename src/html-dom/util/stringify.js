(function(){

	HtmlDom.stringify = function(document, model, ctx, compo) {
	
		if (compo == null || compo.components == null || compo.components.length === 0) {
			return document.toString();
		}
		
		var meta    = comment_meta(ctx),
			modules = comment_modules(ctx),
			documentElement = trav_getDoc(document);
		if (documentElement == null) {
			return meta.header
				+ modules
				+ document
				+ meta.footer
				;
		}
		
		var html = trav_getChild(documentElement, 'HTML');
		if (html != null) {
			var body = trav_getChild(html, 'BODY');
			if (body != null){
				el_prepend(body, modules);
				el_prepend(body, meta.header);
				el_append(body, meta.footer);
			}else{
				log_error('Body not found');
			}
		}
		return document.toString();
	};

	function comment_meta(ctx) {
		var headerJson = {
				model: ctx._models.stringify(),
				ctx: ctx_stringify(ctx),
				ID: ctx._id
			},
			headerInfo = {
				type: 'm'
			};
		
		return {
			header: new HtmlDom.Comment(Meta.stringify(headerJson, headerInfo)),
			footer: new HtmlDom.Comment(Meta.close(headerJson, headerInfo))
		};
	}
	function comment_modules(ctx) {
		if (ctx._modules == null) {
			return null;
		}
		var str = ctx._modules.stringify();
		if (str == null || str === '') {
			return null;
		}
		
		var comment = Meta.stringify({
			mask: str
		}, {
			type  : 'r',
			single: true
		});
		return new HtmlDom.Comment(comment);
	}
	
	function el_append(el, x) {
		if (x == null) return;
		el.appendChild(x);
	}
	function el_prepend(el, x) {
		if (x == null) return;
		el.insertBefore(x, el.firstChild)
	}
}());

