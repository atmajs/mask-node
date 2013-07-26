


function html_stringify(document, model, cntx, component) {

	component = html_prepairControllers(component);

	if (component.components == null || component.components.length === 0) {
		return document.toString();
	}

	

	var first = document.firstChild,
		documentElement = trav_getDoc(first),
		headerJson = {
			model: cntx._model.stringify()
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
				body.insertBefore(new html_Comment(meta), body.firstChild);
				body.appendChild(new html_Comment(metaClose));
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


function html_prepairControllers(controller, output) {
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

			compos.push(html_prepairControllers(x));
		}

		output.components = compos;
	}

	return output;

}
