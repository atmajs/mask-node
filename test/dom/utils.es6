
function $render(template, params = { }){

	var { model, controller, scripts = [] } = params;
	var dfr = new Class.Deferred;

	scripts.unshift(
		'ref-mask/lib/mask.js',
		'node_modules/includejs/lib/include.js',
		'/lib/mask.bootstrap.js'
	);
	template = 'section {' + template + '}';
	UTest
		.server
		.render(template, {
			model: model,
			controller: controller,
			scripts: scripts
		})
		.done(function(doc, win) {
			//-console.log(doc.body.innerHTML);
			dfr.resolve($(doc.body).children('section').get(0), doc, win);
		})
		.fail(function(error){
			dfr.reject(error);
		});

	return dfr;
};

function $forEach(arr, fn){
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