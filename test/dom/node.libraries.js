var resume = include.pause();
var cache = include.getResources();
cache.js = {};
cache.load = {};
include
	.instance()
	.js(
		'/lib/mask.node.js::Mask'
	)
	.done(function(resp){
		var mask = resp.Mask.mask;
		Object.extend(global.mask.getHandler(), mask.getHandler());
		Object.extend(global.mask, mask);
		
		resume();
	})