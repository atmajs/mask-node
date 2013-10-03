


include.exports = Class({
	
	Construct: function(){
		this.handlers = [];
		this.pages = new global.ruta.Collection();
	},
	
	registerPages: function(routes){
		var page, key;
		
		for (key in routes) {
			
			page = routes[key];
			page.path = key;
			page.id = key.substring(key.indexOf('/') + 1);
			
			if (page.view == null) 
				page.view = page.id;
			
			if (page.controller == null) 
				page.controller = 'default';
			
			
			this.pages.add(key, page);
		}
		
		return this;
	},
	
	registerHandlers: function(routes){
		
		for (var key in routes) {
			this.handlers.push({
				matcher: rgx_fromString(key),
				handler: routes[key]
			});
		}
		
		return this;
	},
	
	get: function(req, callback){
		
		var handler = get_handler(this, req.url);
		
		if (handler) {
			
			if (typeof handler === 'string') {
				include
					.instance()
					.js(handler + '::Handler')
					.done(function(resp){
						
						callback(new resp.Handler());
					});
				return;
			}
			
			callback(handler);
			return;
		}
		
		var url = req.url;
		if (url.indexOf('?') !== -1) {
			url = url.substring(0, url.indexOf('?'));;
		}
		
		var route = this.pages.get(url);
		
		if (route == null) {
			callback(null);
			return;
		}
		
		var path = route.value;
		
		
		callback(new atma.Page(path));
	}
});


function get_handler(factory, path) {
	
	var handlers = factory.handlers;
	
	for (var i = 0, x, imax = handlers.length; i < imax; i++){
		x = handlers[i];
		
		if (x.matcher.test(path)) {
			return x.handler;
		}
	}
	
	return null;
}

function rgx_fromString(str, flags) {
	return new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), flags);
}