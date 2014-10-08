var build_childNodes;

(function(){
	build_childNodes = function (node, model, ctx, container, ctr, els) {
		var nodes = node.nodes;
		if (nodes == null) 
			return;
		
		if (is_Array(nodes) === false) {
			build(nodes, model, ctx, container, ctr, els);
			return;
		}
		
		var imax = nodes.length,
			i;
		for(i = 0; i< imax; i++){
			build(nodes[i], model, ctx, container, ctr, els);
		}
	};
	
}());