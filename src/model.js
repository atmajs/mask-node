var ModelBuilder = (function(){
	
	function ModelBuilder(model, startIndex) {
		this._models = {};
		this._id = startIndex || 0;
		
		this.append(model);
	}
	
	ModelBuilder.prototype = {
		append: function(model){
			if (model == null) 
				return -1;
			
			var id = 'm' + (++this._id);
			
			this._models[id] = model;
			
			return id;
		},
		
		tryAppend: function(controller){
			
			if (mode_SERVER_ALL === controller.mode)
				return -1;
			
			if (mode_model_NONE === controller.modeModel)
				return -1;
			
			
			var model;
			
			if (controller.modelRef !== void 0) 
				model = { __ref: controller.modelRef };
			
				
			if (model == null) {
				model = controller.model;
			}
			
			var id = 'm' + (++this._id);
			
			this._models[id] = model;
			
			return id;
		},
		
		stringify: function(){
			return Class.stringify(this._models);
		}
	}
	
	
	
	return ModelBuilder;
	
}());