
require('./include.node.js');

global.atma = {
	server: {}
};

include = include
	.cfg({
		loader: {
			yml: 'loader/yml.js',
			less: 'loader/less.js'
		}
	})
	.js([
		
		'/.reference/libjs/class/lib/class.js',
		
		'./ruta.js',
		
		
		'./server/Application.js',
		'./server/IHttpHandler.js',
		'./server/page/Page.js',
		
		'../../../lib/mask.node.js::Mask',
		
	])
	.done(function(resp){
		
		
		
		global.mask = resp.Mask;

		global.Compo = resp.Mask.Compo;
		global.jmask = resp.Mask.jmask;

	
		include
			.js('./layout.js');
		
	});

