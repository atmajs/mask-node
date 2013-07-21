
include.exports = function(configs, callback) {
		
	return cfg_load({}, configs, callback);
	
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
		return '/server/config/' + config + '.yml';
	});
	
	
	include
		.instance()
		.load(configs)
		.done(cfg_parseDelegate(cfg, callback));
	
	return cfg;
}


function cfg_parseDelegate(cfg, callback) {
	
	return function(resp){
		var data = resp.load,
			key,
			value;
		
		for (key in data) {
			value = data[key];
			
			if (value == null)
				continue;
			
			for (key in value) 
				cfg[key] = value[key];
			
		}
		
		if (cfg['compos-info']) {
			mask.compoDefinitions(cfg['compos-info']);
		}
		
		if (cfg.include) {
			
			if (cfg.include.routes)
				include.routes(cfg.include.routes);
			
			if (cfg.include.scripts)
				include
					.instance()
					.js(cfg.include.scripts)
					.done(cfg_completeDelegate(callback));
			
			return;
		}
		
		callback();
	};
	
}

function cfg_completeDelegate(callback) {
	
	return function(){
		callback();
	};
}