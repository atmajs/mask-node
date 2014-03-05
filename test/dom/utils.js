
var $render = function(template, model, controller){
	
	var dfr = new Class.Deferred;
	
	template = '#container {' + template + '}';
	
	UTest
		.server
		.render(template, model, controller)
		.done(function(doc, win) {
			
			dfr.resolve($(doc).find('#container'), doc, win);
		})
		.fail(function(error){
			
			dfr.reject(error);
		})
	
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