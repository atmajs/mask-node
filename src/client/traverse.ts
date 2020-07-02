var trav_getElements,
	trav_getElement,
	trav_getMeta
	;
	
(function(){

	trav_getElements = function(meta) {
		if (meta.isDocument) 
			return Array.prototype.slice.call(document.body.childNodes);
		
	
		var id = 'mask-htmltemplate-' + meta.ID,
			startNode = document.getElementById(id),
			endNode = document.getElementsByName(id)[0];
		
		if (startNode == null || endNode == null) {
			console.error('Invalid node range to initialize mask components');
			return null;
		}
	
		var array = [],
			node = startNode.nextSibling;
		while (node != null && node != endNode) {
			array.push(node);
	
			node = node.nextSibling;
		}
	
		return array;
	};
	trav_getElement = function(node){
		var next = node.nextSibling;
		while(next && next.nodeType !== Node.ELEMENT_NODE){
			next = next.nextSibling;
		}
		
		return next;
	};
	trav_getMeta = function(node){
		while(node && node.nodeType !== Node.COMMENT_NODE){
			node = node.nextSibling;
		}
		return node;
	};
	
}());
