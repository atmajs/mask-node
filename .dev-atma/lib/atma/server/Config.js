
include.exports = function(configs, callback) {
	
	var cfg = {
		env: {
			client: {
				routes: null,
				scripts: null,
				styles: null
			},
			server: {
				routes: null,
				scripts: null
			},
			both: {
				routes: null,
				scripts: null
			}
		}
	};
	
	
	return cfg_load(cfg, configs, callback);
	
}



/**
 *	- configs - Array - ['name']
 */
function cfg_load(cfg, configs, callback) {
	if (Array.isArray(configs) === false){
		callback('[Application.Config] should be an array of file names');
		return cfg;
	}
	
	configs = configs.map(function(config){
		return '/server/config/'
			+ config
			+ '.yml::'
			+ config.replace(/\//g, '.');
	});
	
	
	include
		.instance()
		.load(configs)
		.done(cfg_parseDelegate(cfg, callback));
	
	return cfg;
}


function cfg_parseDelegate(cfg, callback) {
	
	function obj_extend(obj, value, namespace) {
		if (namespace == null || namespace.indexOf('.') === -1) {
			
			for (var key in value) {
				obj[key] = value[key];
			}
			
			return;
		}
		
		var parts = namespace.split('.'),
			length = parts.length - 1,
			i = 0;
		
		for (; i < length; i++) {
			obj = (obj[parts[i]] || (obj[parts[i]] = {}));
		}
		
		obj_extend(obj, value);
		
	}
	
	return function(resp){
		var data = resp.load,
			key,
			value;
		
		for (key in data) {
			value = data[key];
			
			if (value == null)
				continue;
			
			
			obj_extend(cfg, value, key);
			
		}
		
		
		if (cfg['compos-info']) {
			mask.compoDefinitions(cfg['compos-info']);
		}
		
		
		if (cfg.env.both.routes) 
			include
				.routes(cfg.env.both.routes);
		
		if (cfg.env.both.include)
			include
				.cfg(cfg.env.both.include.cfg);
				
		if (cfg.env.server.include)
			include
				.cfg(cfg.env.server.include.cfg);
				
		
		if (cfg.env.server.routes)
			include
				.routes(cfg.env.server.routes);
		
	
			
		////if (cfg.include.scripts)
		////	include
		////		.instance()
		////		.js(cfg.include.scripts)
		////		.done(cfg_completeDelegate(callback));
		////
		////return;
	
		
		callback();
	};
	
}

function cfg_completeDelegate(callback) {
	
	return function(){
		callback();
	};
}