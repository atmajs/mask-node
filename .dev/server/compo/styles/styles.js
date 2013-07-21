

	
function Style() {}

mask.registerHandler(':styles', Style);


var T = "% each='.' > link type='text/css' rel='stylesheet' href='~[.]';";

Style.prototype = {
	mode: 'server:all',
	nodes: mask.parse(T),
	renderStart: function(model, cntx){
		
		var _default = app.config.client.styles,
			_page = cntx.page.styles;
		
		this.model = _page == null
						? _default
						: _default.concat(_page);
		
	}
};
	
