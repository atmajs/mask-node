function _transformMaskAutoTemplates (ast) {
	return mask_TreeWalker.walk(ast, function(node) {
		if (node.tagName !== 'script') {
			return;
		}
		if (node.attr.type !== 'text/mask') {
			return;
		}
		if (node.attr['data-run'] !== 'auto') {
			return;
		}
		var fragment = new Dom.Fragment;
		fragment.parent = node.parent;

		var x = node.nodes[0];
		var template = x.content;
		fragment.nodes = parser_parse(template);
		return { replace: fragment };
	});
}


function _transformAddingMaskBootstrap (ast, path) {
	var wasAdded = false;
	mask_TreeWalker.walk(ast, function(node) {
		if (node.tagName === 'body') {
			wasAdded = true;
			append(node, path);
			return { deep: false };
		}
		if (node.tagName !== 'html') {
			return { deep: false };
		}	
	});
	if (!wasAdded) {
		append(ast, path);
	}

	function append (node, path) {
		var script = new Dom.Node;
		script.tagName = 'script';
		script.attr = {
			type: 'text/javascript',
			src: path || '/node_modules/maskjs/lib/mask.bootstrap.js'
		};
		jmask(node).append(script);
		jmask(node).append('<script>mask.Compo.bootstrap()</script>');
	}

}