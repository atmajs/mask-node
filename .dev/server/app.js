
include

	.load('master/default.mask')
	
	.js({
		compo: 'user'
	})
	
	.js('pages.js')
	
	.done(function(resp){
		
		var Pages = resp.pages;
		
		include.exports = {
			process: function(res, req){
				
			}
		}
	})