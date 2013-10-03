
function CompoCacheCollection(controller) {
	this.__cacheInfo = new CompoCache(controller.cache);
}

CompoCacheCollection.prototype = {
	__null: null,
	__value: null
};


function CompoCache(cache) {
	
	if (cache.byProperty) {
		var prop = cache.byProperty,
			dot = prop.indexOf('.'),
			objName = prop.substring(0, dot),
			obj;
		
		prop = prop.substring(dot + 1);
		
		switch (objName) {
			case 'model':
			case 'ctx':
				break;
			default:
				console.error('[CompoCache] - property accessor not valid - should be "[model/ctx].[accessor]"');
				return null;	
		}
		
		this.propObjName = objName;
		this.propAccessor = prop;
	}
	
	this.expire = cache.expire;
	return this;
}

CompoCache.prototype = {
	prop: void 0,
	propObjName: null,
	propAccessor: null,
	expire: null,
	
	getKey: function(model, ctx) {
		
		if (this.propAccessor == null) 
			return '__value';
		
		var objName = this.propObjName,
			prop = this.propAccessor;
		
		var obj, key;
		
		if ('model' === objName) 
			obj = model;
		
		if ('ctx' === objName) 
			obj = ctx;
		
		
		key = obj_getProperty(obj, prop);
		
		
		if (typeof key === 'undefined') 
			return '__value';
		
		if (key == null) 
			return '__null';
		
		return key;
	}
};