var _scripts_handleSync,
	_scripts_handleAsync;


(function () {

	_scripts_handleSync = function (ast, model, ctx) {

		var scripts = _getExternalServerScripts(ast, model, ctx); 
		scripts.forEach(function (x) {
			return x.preloadSync();
		});
		return ast;
	};

	_scripts_handleAsync = function (ast, model, ctx) {

		var scripts = _getExternalServerScripts(ast, model, ctx); 
		var dfrs = scripts.map(function (x) { 
			return x.preloadAsync()
		});
		var error = null;
		var wait = dfrs.length;
		var dfr = new class_Dfr;
		if (wait === 0) {			
			return dfr.resolve(ast);
		}

		dfrs.forEach(function(x) {
			x.then(ok, fail);
		});

		function ok () {
			if (--wait === 0 && error == null) {
				dfr.resolve(ast);
			}
		}
		function fail (err) {
			if (error == null) {
				dfr.reject(error = err);
			}
		}
		return dfr;
	};

	var ScriptTag = custom_Tags['script'];
	custom_Tags['script'] = class_create(ScriptTag, {
		render: function(model, ctx, el) {
			if (ScriptNode.isBrowser(this)) {
				// this.attr.export = null;
				// this.attr.isomorph = null;

				ScriptTag.prototype.render.call(this, model, ctx, el);
			}
			if (ScriptNode.isServer(this)) {
				var node = ScriptNode.get(this);
				node.eval(ctx, el);
			}
		}
	});


	function _getExternalServerScripts (ast, model, ctx) {
		var arr = [];
		mask_TreeWalker.walk(ast, function(node){
			if (node.tagName !== 'script') {
				return;
			}
			if (ScriptNode.isServer(node) === false || ScriptNode.isExternal(node) === false) {
				return;
			}
			arr.push(ScriptNode.get(node, model, ctx));

			delete node.attr.export;
			delete node.attr.isomorph;
		
			if (ScriptNode.isServerOnly(node)) { 
				return { remove: true };
			}
		});
		return arr;
	}


	var ScriptNode = class_create({
		constructor: function(path, exportName){
			this.path = path;
			this.exportName = exportName;
			this.state = 0;
			this.fn = null;
		},
		eval: function (ctx, el) {
			var origExports = {};
			var module = {
				exports: (origExports = {})
			};
			this.fn.call(el, global, el.ownerDocument, module, module.exports);
			if (this.exportName) {
				global[this.exportName] = module.exports;
			}
		},
		preloadAsync: function(){
			var self = this;
			return __cfg.getFile(this.path).then(function(content) {
				self.fn = new Function('window', 'document', 'module', 'exports', content);				
			});
		},
		preloadSync: function(){
			var self = this;
			return __cfg.getFile(this.path).then(function(content) {
				self.fn = new Function('window', 'document', 'module', 'exports', content);				
			});
		}
	});	
	ScriptNode.isServer = function(node) {
		return Boolean(node.attr.isomorph || node.attr.server);
	};
	ScriptNode.isServerOnly = function(node) {
		return Boolean(node.attr.server);
	};
	ScriptNode.isBrowser = function(node) {
		return Boolean(node.attr.isomorph || !node.attr.server);
	};
	ScriptNode.isExternal = function(node) {
		return Boolean(node.attr.src);
	};
	ScriptNode.get = function(node, model, ctx) {
		var src = node.attr.src;

		var endpoint = { path: src };
		var path = Module.resolvePath(endpoint, model, ctx, null, true);
		var export_ = node.attr.export;
		return _scripts[path] || (_scripts[path] = new ScriptNode(path, export_));
	};
	var _scripts = {};
}());