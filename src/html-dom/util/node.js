var node_insertBefore,
	node_empty;

(function(){
	node_insertBefore = function(node, anchor) {
		return anchor.parentNode.insertBefore(node, anchor);
	};
	node_empty = function(node){
		while (node.firstChild != null) {
			node.removeChild(node.firstChild);
		}
	};
}());
