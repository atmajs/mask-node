


include.exports = Class({
	
	Construct: function(){
		this.handlers = [];
		this.pages = new global.ruta.Collection();
	},
	
	registerPages: function(routes){
		var value, key;
		
		for (key in routes) {
			
			value = routes[key];
			value.path = key;
			
			this.pages.add(key, value);
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