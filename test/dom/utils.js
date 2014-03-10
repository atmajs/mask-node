
var $render = function(template, model, controller){
	
	var dfr = new Class.Deferred;
	
	var bootstrap = function(){
		include.allDone(function(){
			app = new(Compo({ compos: {} }));
			mask.Compo.bootstrap(document.body, app);
		});
	};
	
	bootstrap = bootstrap
		.toString()
		.replace(/^[^{]+{/, '')
		.replace(/}\s*$/, '')
		;
	
	
	template = jmask()
		.add(jmask("script src='/utest/lib/mask.bootstrap.js';"))
		
		.add(
			jmask('#container').append(template)
		)
		.add(jmask("script > :html > '''" + bootstrap + "'''"))
		.mask()
		;
	
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