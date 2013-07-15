global.Class = require('./libjs/class.js').Class;



require('./libjs/include.node.js');


var resource = include;

resource
.cfg({
	autoreload: true,
})
.routes({
	view: '/app/view/{0}.mask',
	controller: '/app/controller/{0}.js',
	compo: '/app/compo/{0}.js'
});



resource
.js('app/routes.js::Routes', '../lib/mask.node.js::Mask')
.done(function(resp) {


	var sys = require("sys"),
		http = require("http"),
		connect = require('connect'),
		app = connect(),
		port = 5777;

	global.mask = resp.Mask;




	app //
	.use(connect.favicon()) //
	.use(connect.logger('dev')) //
	.use(function(request, response, next) {

		var controller = resp.Routes.resolve(request.url);

		if (controller) {

			resource.js({
				controller: controller + '::Controller'
			}).done(function(resp) {

				response.writeHeader(200, {
					"Content-Type": "text/html"
				});

				resp.Controller.request(request, response);
			});

			return;
		}

		next();

	})
	.use(connect.static(__dirname));



	http.createServer(app).listen(port);

});
