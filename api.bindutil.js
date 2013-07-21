mask.registerUtility('bind', function(expr, model, cntx, element, controller, attrName, type){

	var current = expression_eval(expr, model, cntx, controller);

	if ('node' === type) {
		element = document.createTextNode(current);
	}

	var refresher =  create_refresher(type, expr, element, current, attrName),
		binder = expression_createBinder(expr, model, cntx, controller, refresher);

	expression_bind(expr, model, cntx, controller, binder);


	compo_attachDisposer(controller, function(){
		expression_unbind(expr, model, controller, binder);
	});

	return type === 'node' ? element : current;
});


mask.registerUtil('bind',{
	current: null,
	element: null,
	nodeRenderStart: function(expr, model, cntx, element, controller){
		
		this.current = expression_eval(expr, model, cntx, controller);
		this.element = doc_createTextNode(current);
	},
	node: function(expr, model, cntx, element, controller){
		this.bind(expr, model, cntx, this.element, controller, null, 'node');
		
		return element;
	},
	
	bind: function(expr, model, cntx, element, controller, attrName, type){
		var	current = this.current,
			refresher =  create_refresher(type, expr, textNode, current, attrName),
			binder = expression_createBinder(expr, model, cntx, controller, refresher);
	
		expression_bind(expr, model, cntx, controller, binder);
	
	
		compo_attachDisposer(controller, function(){
			expression_unbind(expr, model, controller, binder);
		});
	},
	
	attrRenderStart: function(expr, model, cntx, controller){
		this.current = expression_eval(expr, model, cntx, controller);
	},
	attr: function(expr, model, cntx, element, controller, attrName){
		this.bind(expr, model, cntx, element, controller, attrName, 'attr');
		
		return current;
	}
})