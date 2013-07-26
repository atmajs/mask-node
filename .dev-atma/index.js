
require('./lib/atma/lib.js');

include
	.cfg('autoreload', true)
	.done(initialize);


function initialize() {
		
	global.app = atma
		.Application({
			configs: [
				'compos-info',
				'env/both',
				'env/server',
				'env/client',
				'handlers',
				'pages'
				]
		})
		.ready(function(app) {
			
			
		
			var connect = require('connect'),
				port = 5777;
		
		
			connect()
				.use(connect.favicon())
				.use(connect.logger('dev'))
				.use(connect.query())
				.use(app.responder())
				.use(connect.static(__dirname))
				.listen(port);
			
		});	

}
