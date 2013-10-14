
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

	createComment: function(text){
		return new html_Comment(text);
	},
	
	createComponent: function(compo, model, ctx, container, controller){
		return new html_Component(compo, model, ctx, container, controller);
	}
};
