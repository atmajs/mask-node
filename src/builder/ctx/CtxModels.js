(function(){
	builder_CtxModels = class_create({
		constructor: function (model, startIndex) {
			this._models = null;
			this._id = startIndex || 0;
			this.append(model);
		},
		append: function(model){
			return add(this, model);
		},
		tryAppend: function(ctr){

			if (mode_SERVER_ALL === ctr.mode)
				return -1;

			if (mode_model_NONE === ctr.modeModel)
				return -1;

			var model = ctr.modelRef != null
				? '$ref:' + ctr.modelRef
				: ctr.model
				;
			return add(this, model);
		},

		stringify: function(){
			return stringify(this._models);
		}
	});

	// private

	function add(modelBuilder, model) {
		if (model == null)
			return -1;
		if (modelBuilder._models == null) {
			modelBuilder._models = {};
		}

		var id = 'm' + (++modelBuilder._id);
		modelBuilder._models[id] = model;
		return id;
	}
	var stringify;
	(function(){
		var fn = typeof Class !== 'undefined' && is_Function(Class.stringify)
			? Class.stringify
			: JSON.stringify
			;
		stringify = function (models) {
			return models == null ? '{}' : fn(models);
		};
	}())
}());