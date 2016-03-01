(function(){

	document = {
		createDocumentFragment: function(){
			return new HtmlDom.DocumentFragment();
		},
		createElement: function(name){
			var Ctor = _HtmlTags[name.toLowerCase()] || HtmlDom.Element;
			return new Ctor(name);
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

	var _HtmlTags = {
		/*
		 * Most common html tags
		 * http://jsperf.com/not-in-vs-null/3
		 */
		a: null,
		abbr: null,
		article: null,
		aside: null,
		audio: null,
		b: null,
		big: null,
		blockquote: null,
		br: null,
		button: null,
		canvas: null,
		datalist: null,
		details: null,
		div: null,
		em: null,
		fieldset: null,
		footer: null,
		form: null,
		h1: null,
		h2: null,
		h3: null,
		h4: null,
		h5: null,
		h6: null,
		header: null,
		i: null,
		img: null,
		input: null,
		label: null,
		legend: null,
		li: null,
		menu: null,
		nav: null,
		ol: null,
		option: null,
		p: null,
		pre: null,
		section: null,
		select: null,
		small: null,
		span: null,
		strong: null,
		script: HtmlDom.ScriptElement,
		svg: null,
		table: null,
		tbody: null,
		td: null,
		textarea: null,
		tfoot: null,
		th: null,
		thead: null,
		tr: null,
		tt: null,
		ul: null,
		video: null,
		'!doctype': HtmlDom.DOCTYPE
	};

}());
