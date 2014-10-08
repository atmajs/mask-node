var model_parse,
	model_deserializeKeys,
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
	
	model_deserializeKeys = function(obj, models, model, ctr){
		if (obj == null) 
			return null;
		var key, val, expr;
		for(key in obj){
			val = obj[key]
			if (isRef(val) === false) 
				continue;
			
			expr = val.substring(5);
			obj[key] = _eval(expr, model, null, ctr);
			if (obj[key] == null) {
				log_warn('Cannot deserialize the reference', expr, model);
			}
		}
		return obj;
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
		var x = _eval(ref, model);
		if (x != null) 
			return x;
		
		while(--id > -1){
			x = models['m' + id];
			
			if (x != null && typeof x === 'object') {
				x = _eval(ref, x);
				if (x != null) 
					return x;
			}
		}
		console.error('Model Reference is undefined', ref);
		return null;
	}
	
	var _eval = mask.Utils.Expression.eval;
}());