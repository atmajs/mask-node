

include
	.js('HandlerFactory.js', 'Config.js')
	.done(function(resp){
		
	var HandlerFactory = resp.HandlerFactory,
		Config = resp.Config;
		
	
	atma.Application = Class({
		
		Construct: function(proto){
			
			if (this instanceof atma.Application === false) {
				return new atma.Application(proto);
			}
			
			this.handlers = new HandlerFactory();
			this.config = Config(proto.configs, cfg_doneDelegate(this));
			
			return this;
		},
		
		
		onready: null,
		readystate: 0,
		ready: function(cb){
			
			if (this.readystate === 4) 
				cb(this);
			else
				this.onready = cb;
			
			return this;
		},
		
		responder: function(){
			
			return responder(this);
		}
		
	});
	
	
	function responder(app) {
		return function (req, res, next){
				
			app
				.handlers
				.get(req, function(handler){
					
					if (handler == null) {
						next();
						return;
					}
					
					handler
						.process(req, res)
						.done(function(content, statusCode, mimeType, headers){
							
							if (statusCode) {
								res.statusCode = statusCode;
							}
							if (typeof mimeType === 'string') {
								res.setHeader('Content-Type', mimeType);
							}
							if (headers) {
								for (var key in headers) {
									res.setHeader(key, headers[key]);
								}
							}
							
							res.end(content);
						});
				})
		};
	}
	
	function cfg_doneDelegate(app) {
		return function(error) {
			
			app
				.handlers
				.registerHandlers(app.config.handlers)
				.registerPages(app.config.pages)
				;
				
			app.readystate = 4;
			app.onready && app.onready(app);
		};
	}


});