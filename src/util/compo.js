var compo_renderMode_SERVER = 1,
	compo_renderMode_CLIENT = 2,
	compo_renderMode_BOTH = 3,
	
	
	compo_getRenderMode
	;
	
(function(){
	
	compo_getRenderMode = function(compo){
		if (compo == null) 
			return compo_renderMode_BOTH;
		
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo
			;
		
		var meta = proto.$meta && proto.$meta.mode || proto.mode;
		
		if (meta == null || meta === 'both') 
			return compo_renderMode_BOTH;
		
		var isServer = meta.indexOf('server') !== -1,
			isClient = meta.indexOf('client') !== -1
			;
		
		if (isServer && isClient) 
			return compo_renderMode_BOTH;
		
		return isServer
			? compo_renderMode_SERVER
			: compo_renderMode_CLIENT
			;
	};
	
}());