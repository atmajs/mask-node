
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
		
		'./class.js',
		
		'./ruta.js',
		
		
		'./server/Application.js',
		'./server/IHttpHandler.js',
		'./server/Page.js',
		
		'../../../lib/mask.node.js::Mask',
		
	])
	.done(function(resp){
		
		
		
		global.mask = resp.Mask;
	
		include
			.js('./layout.js');
		
	});

