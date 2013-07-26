
include
	.js('Resources.js')
	.done(function(resp){
	
	atma.Page = Class({
		
		Extends: [Class.Deferred, resp.Resources],
		
		view: '/server/http/page/index/index.mask::View',
		master: '/server/http/page/master/default.mask::Master',
		
		/**
		 *	- data (Object)
		 *		- view: ? page name
		 */
		Construct: function(data){
			
			if (data.page) {
				this.view = '/server/http/page/' + data.page + '.mask::View';
			}
			
			this.data = data;
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
					
				var query = this.cntx.req.query;
				
				if ('master' === query.debug) {
					this.resolve(master);
					return;
				}
				if ('view' === query.debug) {
					this.resolve(view);
					return;
				}
				if (query.breakOn) {
					this.cntx.debug = { breakOn : query.breakOn };
				}
				
				
				if (master) {
					mask.render(mask.parse(master));
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
	
});