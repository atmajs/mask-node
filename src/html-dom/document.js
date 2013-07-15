
var document = {
	createDocumentFragment: function(){
		return new html_DocumentFragment();
	},
	createElement: function(name){
		return new html_Element(name);
	},
	createTextNode: function(text){
		return new html_TextNode(text);
	},

	createComponent: function(compo, model, cntx, container, controller){
		return new html_Component(compo, model, cntx, container, controller);
	}
};
