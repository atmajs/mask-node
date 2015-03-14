var CtxModules;
(function(){	
	CtxModules = class_create({
		constructor: function () {
			this._modules = {};
		},
		add: function(module){
			if (module == null) 
				return;
			
			this._modules[module.path] = module;
		},
		
		stringify: function(opts){
			var modules = this._modules,
				arr = [], key, x
				;
			for(key in modules) {
				x = modules[key];
				if (x.type === 'mask') {
					arr.push(createModuleNode(x));
				}
			}
			return mask_stringify(arr, opts);
		}
	});
	
	function createModuleNode(module) {
		var node = new mask.Dom.Node('module');
		var path = path_toRelative(module.path, path_resolveCurrent());
		if (path_isRelative(path)) {
			path = '/' + path;
		}
		node.attr = {
			path: path
		};
		node.nodes = module.nodes;
		return node;
	}
}());