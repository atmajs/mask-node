
// import client/bootstrap.js

function html_stringify(document, model, cntx, component) {

	component = html_prepairControllers(component);

	if (component.components == null || component.components.length === 0) {
		return document.toString();
	}

	

	var first = document.firstChild,
		isDocument = first instanceof html_Component && first.instance.isDocument,
		headerJson = {
			model: cntx._model.stringify()
		},
		headerInfo = {
			type: 'm'
		},
		string = '';

	
	var meta = Meta.stringify(headerJson, headerInfo),
		metaClose = Meta.close(headerJson, headerInfo);
	
	
	if (isDocument) {

		var html = first.firstChild.nextNode;

		if (html) {
			var body = html.firstChild;
			while(body && body.tagName !== 'body'){
				body = body.nextNode;
			}
		
			if (body){
				body.insertBefore(new html_TextNode(meta), body.firstChild);
				body.appendChild(new html_TextNode(metaClose));
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
