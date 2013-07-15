
(function(){
	
	
	var routes = { 
		'/test': 'test'
	};
	var Routes = Class({
		Construct: function(){

		},
		register: function(){

		},
		resolve: function(route){
			return routes[route];
		}
	})

	include.exports = new Routes();

}());