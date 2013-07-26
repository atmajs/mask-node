

include
	.load('template.html')
	.done(function(resp){
		
		
		function Script() {}
		
		
		mask.registerHandler(':scripts', Script);
		
		Script.prototype = {
			mode: 'server:all',
			
			scripts: null,
			renderStart: function(model, cntx){
				var env = app.config.env,
					include = {
						src: '',
						cfg: {}
					};
				
				incl_extend(include, env.both.include);
				incl_extend(include, env.client.include);
				
				if (!include.src)
					console.error('[FATAL ERROR] Include PATH is not specified, use in client.yml/json include: { src: "PATH" }')
				
				this.include = include;
				
				this.scripts = cntx
					.page
					.getScripts(env)
					.map(function(x, index){
						return "'" + x + "'";
					})
					.join(',\n');
				
			},
			toHtml: function(){
				return resp
					.load
					.template
					.replace('%CFG%', JSON.stringify(this.include.cfg))
					.replace('%INCLUDE%', this.include.src)
					.replace('%SCRIPTS%', this.scripts);
			}
		};
		
		
		function incl_extend(include, source) {
			if (source == null) 
				return include;
			
			if (typeof source === 'string') {
				include.src = source;
				return include;
			}
			
			if (source.src) 
				include.src = source.src;
			
			if (source.cfg) {
				include.cfg = obj_extend(include.cfg, source.cfg, 'loader');
				
				if (source.cfg.loader) 
					include.cfg.loader = obj_extend(include.cfg.loader, source.cfg.loader);
				
			}
			
			
			return include;
		}
		
		function obj_extend(target, source, dismissKey) {
			
			if (source == null)
				return target;
			
			if (target == null) 
				target = {};
			
			for (key in source) {
				if (key === dismissKey) 
					continue;
				
				target[key] = source[key];
			}
			
			return target;
		}
		
	});
	
