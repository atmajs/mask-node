(function() {


	function Document() {}

	custom_Tags[':document'] = Document;

	Document.prototype = {
		isDocument: true,
		mode: 'server',
		render: function(model, ctx, fragment, ctr) {

			var attr = this.attr,
				nodes = this.nodes,
				doctype = attr.doctype || 'html';

			delete attr.doctype;
			
			fragment.appendChild(new HtmlDom.DOCTYPE('<!DOCTYPE ' + doctype + '>'));

			var html = {
				tagName: 'html',
				type: Dom.NODE,
				attr: attr,
				nodes: [],
			}, head, body, handleBody;

			for (var i = 0, x, length = nodes.length; i < length; i++) {
				x = nodes[i];

				if (x.tagName === 'head') {
					head = x;
					continue;
				}

				if (x.tagName === 'body') {
					body = x;
					continue;
				}

				handleBody = true;
			}

			if (body == null) {
				body = {
					nodeType: Dom.NODE,
					tagName: 'body',
					nodes: []
				};
			}

			head != null && html.nodes.push(head);
			body != null && html.nodes.push(body);

			if (handleBody) {
				var imax = nodes.length,
					i = 0, x;
				for(; i < imax; i++) {
					x = nodes[i];
					if ('head' === x.tagName) 
						continue;
					if ('body' === x.tagName) 
						continue;
					
					body.nodes.push(x);
				}
			}


			var owner = this.parent;
			owner.components = [];

			build(html, model, ctx, fragment, owner);

			return fragment;
		}
	};

}());
