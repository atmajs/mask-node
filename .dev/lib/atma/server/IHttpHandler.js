atma.server.IHttpHandler = Class({
	Extends: Class.Deferred,
	
	process: function(){
		
		this.reject('Not Implemented', 500);
	}
})