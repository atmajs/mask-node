var util_extendObj_,
	util_pushComponents_;

(function(){
	util_extendObj_ = function(a, b){
		if (a == null) 
			return b;
		if (b == null) 
			return a;
		
		for(var key in b){
			a[key] = b[key];
		}
		return a;
	};
	util_pushComponents_ = function(a, b){
		var aCompos = a.components || [],
			bCompos = b.components || [];
		if (bCompos.length === 0) 
			return;
		a.components = aCompos.concat(bCompos);
	};
	
}());