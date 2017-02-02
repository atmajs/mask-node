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