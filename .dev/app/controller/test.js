


include
.js({
	compo: 'user'
}).done(function(){
	
	console.log('user', mask.getHandler(':user'));
	
	include.exports = {
		request: function(req, response){
	
			process(function(html){
				response.write(html);
				response.end();
			});
	
		}
	};
	
	
	function process(done) {
	
		include.load({
			view: 'default::View'
		}).done(function(resp){
			
			var html = mask.render(resp.load.View);
	
			done(html);
		})
	
	}

	
});

