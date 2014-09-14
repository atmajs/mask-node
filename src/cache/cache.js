var Cache = (function(){
	
	var _lastCtrlID = 0,
		_lastModelID = 0;
	
	
	var _cache = {};
	
	// import utils.js
	// import CompoCacheCollection.js
	
	return {
		get controllerID (){
			return _lastCtrlID;
		},
		
		get modelID () {
			return _lastModelID;
		},
		
		cacheCompo: function(model, ctx, compoName, compo, cache){
			
			if (__cfg.allowCache === false) 
				return;
			
			
			var cached = _cache[compoName];
			if (cached == null) {
				cached = _cache[compoName] = new CompoCacheCollection(compo, cache);
			}
			
			var cacheInfo = cached.__cacheInfo;
			
			if (cacheInfo == null) 
				return;
			
			
			cached[cacheInfo.getKey(model, ctx)] = compo;
			
			_lastCtrlID = ctx._id;
			_lastModelID = ctx._model._id;
		},
		
		
		getCompo: function(model, ctx, compoName, Ctor){
			if (__cfg.allowCache === false) 
				return null;
			
			var cached = _cache[compoName];
			if (cached == null)
				return null;
			
			var info = cached.__cacheInfo,
				compo = cached[info.getKey(model, ctx)];
			
			// check if cached data is already present, due to async. components
			return compo == null || compo.__cached == null
				? null
				: compo;
		},
		
		getCache: function(){
			return _cache;
		}
	};
}());