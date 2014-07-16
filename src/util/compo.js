var compo_renderMode_SERVER = 1,
	compo_renderMode_CLIENT = 2,
	compo_renderMode_BOTH = 3,
	
	compo_getMetaInfo,	
	compo_getRenderMode,
	compo_isServerMode
	;
	
(function(){
	
	compo_isServerMode = function(compo){
		return compo_getRenderMode(compo) === compo_renderMode_SERVER;
	};
	
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
		
		var mode = (proto.$meta && proto.$meta.mode) || proto.mode;
		
		if (mode == null || mode === 'both') 
			return compo_renderMode_BOTH;
		
		if (typeof mode === 'number') 
			return mode;
		
		var isServer = mode.indexOf('server') !== -1,
			isClient = mode.indexOf('client') !== -1
			;
		
		if (isServer && isClient) 
			return compo_renderMode_BOTH;
		
		return isServer
			? compo_renderMode_SERVER
			: compo_renderMode_CLIENT
			;
	};
	
}());