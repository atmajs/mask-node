var ModelBuilder = (function(){
	
	function ModelBuilder(model) {
		this._models = [];
		this._length = 0;
		
		this.append(model);
	}
	
	ModelBuilder.prototype = {
		append: function(model){
			if (model === null) 
				return -1;
			
			
			
			//for (var i = 0, x, imax = this._models.length; i < imax; i++){
			//	x = this._models[i];
			//	
			//	if (x === model) {
			//		return i;
			//	}
			//}
			
			this._models[this._length++] = model;
			
			return this._length - 1;
		},
		
		stringify: function(){
			return JSON.stringify(this._models);
		}
	}
	
	
	
	return ModelBuilder;
	
}());