document = {
	createDocumentFragment: function(){
		return new HtmlDom.DocumentFragment();
	},
	createElement: function(name){
		return new HtmlDom.Element(name);
	},
	createTextNode: function(text){
		return new HtmlDom.TextNode(text);
	},
	createComment: function(text){
		return new HtmlDom.Comment(text);
	},
	createComponent: function(compo, model, ctx, container, ctr){
		return new HtmlDom.Component(compo, model, ctx, container, ctr);
	}
};