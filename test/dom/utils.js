
var $render = function(template, params){
	params = params || {};
	
	var dfr = new Class.Deferred,
		model = params.model,
		controller = params.controller,
		include = params.include || []
		;
	
	include.unshift('/lib/mask.bootstrap.js');
	
	template = jmask('#container')
		.append(template)
		.mask()
		;
	
	UTest
		.server
		.render(template, {
			model: model,
			controller: controller,
			include: include
		})
		.done(function(doc, win) {
			dfr.resolve($(doc).find('#container'), doc, win);
		})
		.fail(function(error){
			dfr.reject(error);
		});
	
	return dfr;
};

var $forEach = function(arr, fn){
	var i = -1,
		imax = arr.length;
		
	function process() {
		
		var next = ++i < imax - 1
			? process
			: null
			;
		fn(arr[i], next, i);
	}
	process();
};