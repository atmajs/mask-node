

atma.Page = Class({
	
	Extends: Class.Deferred,
	
	view: null,
	master: '/server/http/page/master/default.mask::Master',
	
	/**
	 *	- data (Object)
	 *		- view: ? page name
	 */
	Construct: function(data){
		
		if (data.view) {
			this.view = '/public/page/' + data.view + '.mask::View';
		}
		
	},
	
	process: function(req, res){
		
		if (this.onRenderStart) {
			this.onRenderStart(req, res);
		}
		
		this.cntx = {
			req: req,
			res: res,
			page: this
		};
		
		this.load(this.response);
		return this;
	},
	
	load: function(){
		
		include
			.instance()
			.load(this.master, this.view)
			.done(this.response);
	},
	
	Self: {
		response: function(resp){
			
			var master = resp.load.Master,
				view = resp.load.View;
				
			
			if (master) {
				mask.render(master);
			}
			
			
			var html = mask.render(view, this.model, this.cntx);
			
			if (this.cntx.async) {
				
				
				this
					.cntx
					.done(this.resolve.bind(this))
					.fail(this.fail.bind(this));
					
				return;
			}
	
			this.resolve(html);
		}
	}
});