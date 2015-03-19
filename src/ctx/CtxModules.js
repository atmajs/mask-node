var CtxModules;
(function(){	
	CtxModules = class_create({
		constructor: function () {
			this._modules = [];
		},
		add: function(module, owner){
			if (module == null) 
				return;
			
			var arr = this._modules;
			var i = arr.indexOf(module);
			if (i !== -1) {
				
				if (owner != null) {
					var i_owner = arr.indexOf(owner);
					if (i > i_owner) {
						// move close to parent
						arr.splice(i, 1);
						arr.splice(i_owner, 0, module);
					}
				}
				return;
			}
			arr.unshift(module);
		},
		
		stringify: function(opts){
			var modules = this._modules,
				arr = [],
				imax = modules.length,
				i = -1, x
				;
			while( ++i < imax) {
				x = modules[i];
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