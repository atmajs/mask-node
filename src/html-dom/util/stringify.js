(function(){

	HtmlDom.stringify = function(document, model, ctx, compo) {
	
		compo = _prepairControllers(compo);
		if (compo.components == null || compo.components.length === 0) 
			return document.toString();
		
		var documentElement = trav_getDoc(document),
			headerJson = {
				model: ctx._model.stringify(),
				ID: ctx._id
			},
			headerInfo = {
				type: 'm'
			},
			string = '';
	
		
		var meta = Meta.stringify(headerJson, headerInfo),
			metaClose = Meta.close(headerJson, headerInfo);
		
		if (documentElement) {
	
			var html = trav_getChild(documentElement, 'HTML');
			
			if (html) {
				var body = trav_getChild(html, 'BODY');
				
			
				if (body){
					body.insertBefore(new HtmlDom.Comment(meta), body.firstChild);
					body.appendChild(new HtmlDom.Comment(metaClose));
				}else{
					console.warn('Body not found');
				}
			}
	
			return document.toString();
		}
		
		return meta
			+ document.toString()
			+ metaClose;
			
	}
	
	
	function _prepairControllers(controller, output) {
		if (output == null) {
			output = {};
		}
	
		output.compoName = controller.compoName;
		output.ID = controller.ID;
	
		if (controller.components) {
			var compos = [],
				array = controller.components;
			for (var i = 0, x, length = array.length; i < length; i++) {
				x = array[i];
	
				compos.push(_prepairControllers(x));
			}
	
			output.components = compos;
		}
	
		return output;
	
	}
	
	
}());

