var model_parse,
	model_get;

(function(){
	
	model_parse = function(str){
		return Class.parse(str);
	};
	
	model_get = function(models, id, currentModel, ctr){
		var model = models[id];
		return isRef(model) === false
			? model
			: getRef(
				models
				, id.substring(1) << 0
				, model.substring(5)
				, currentModel
				, ctr
			);
	};
	
	function isRef(ref){
		if (typeof ref !== 'string') 
			return false;
		if (ref.charCodeAt(0) !== 36 /* $ */) 
			return false;
		
		if (ref.substring(0, 5) !== '$ref:') 
			return false;
		
		return true;
	}
	/* @TODO resolve from controller? */
	function getRef(models, id, ref, model, ctr) {
		var x = _getProperty(model, ref);
		if (x != null) 
			return x;
		
		while(--id > -1){
			x = models['m' + id];
			
			if (x != null && typeof x === 'object') {
				x = mask.Utils.getProperty(x, ref);
				if (x != null) 
					return x;
			}
		}
		return null;
	}
	
	var _getProperty = mask.Utils.getProperty;
}());