var compo_renderMode_SERVER = 1,
	compo_renderMode_CLIENT = 2,
	compo_renderMode_BOTH = 3,
	
	compo_getMetaInfo,	
	compo_getRenderMode
	;
	
(function(){
	
	compo_getMetaInfo = function(compo){
		if (compo == null) 
			return {};
		
		var $meta,
			proto = typeof compo === 'function'
				? compo.prototype
				: compo
				;
			
		$meta = proto.$meta || {};
		$meta.mode = compo_getRenderMode(compo);
		
		return $meta;
	};
	
	compo_getRenderMode = function(compo){
		if (compo == null) 
			return compo_renderMode_BOTH;
		
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo
			;
		
		var meta = (proto.$meta && proto.$meta.mode) || proto.mode;
		
		if (typeof meta === 'number') 
			return meta;
		
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