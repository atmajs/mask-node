(function(){

	HtmlDom.stringify = function(document_, model, ctx, compo) {
		var document = prepairDocument(document_);

		if (compo == null || compo.components == null || compo.components.length === 0) {
			return document.toString();
		}

		var meta    = comment_meta(ctx),
			modules = comment_modules(ctx);


		if (_is_Document(document)) {
			return stringifyDocument(document, modules, meta);
		}

		var documentElement = trav_getDoc(document)
		if (documentElement != null) {
			return stringifyDocumentCompo(document, documentElement, modules, meta);
		}
		return (meta.header || '')
				+ (modules  || '')
				+ (document || '')
				+ (meta.footer || '')
				;
	};

	// @Obsolete (use doctype instead)
	function stringifyDocumentCompo (document, documentElement, modules, meta) {
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
	}

	function prepairDocument(document_) {
		var docEl = document_;
		if (_is_Document(docEl) === false) {
			return docEl;
		}
		var html = trav_getChild(docEl, 'HTML');
		if (html == null) {
			html = document.createElement('html');

			var doctype = trav_getChild(docEl, '!DOCTYPE');
			docEl.removeChild(doctype);

			var fragmentEl = document.createDocumentFragment();
			fragmentEl.appendChild(doctype);
			fragmentEl.appendChild(html);

			var el = docEl.firstChild;
			while(el != null) {
				var next = el.nextSibling;
				if (el !== doctype && el !== html) {
					docEl.removeChild(el);
					html.appendChild(el);
				}
				el = next;
			}

			docEl = fragmentEl;
		}

		var head = trav_getChild(html, 'HEAD');
		var body = trav_getChild(html, 'BODY');
		if (body == null) {
			body = document.createElement('body');
			var el = html.firstChild;
			while (el != null) {
				var next = el.nextSibling;
				if (el !== head) {
					html.removeChild(el);
					body.appendChild(el);
				}
				el = next;
			}
			html.appendChild(body);
		}
		return docEl;
	}

	function stringifyDocument(document, modules, meta) {
		var body = trav_getChild(html, 'BODY');
		el_prepend(body, modules);
		el_prepend(body, meta.header);
		el_append(body, meta.footer);
		return document.toString();
	}

	function comment_meta(ctx) {
		var model_ = ctx._models.stringify(),
			ctx_ = ctx_stringify(ctx),
			id_ = ctx._id;

		if (model_ == null && ctx_ == null) {
			return {
				header: null,
				footer: null
			};
		}

		var headerJson = {
				model: model_,
				ctx: ctx_,
				ID: id_
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
	function _is_Document(fragmentEl) {
		if (fragmentEl.nodeType !== Dom.FRAGMENT) {
			return false;
		}
		var el = fragmentEl.firstChild;
		while(el != null) {
			if (el.nodeType === Dom.DOCTYPE) {
				return true;
			}
			el = el.nextSibling;
		}
		return false;
	}
}());
