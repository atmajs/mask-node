

	
function Script() {}

mask.registerHandler(':scripts', Script);

var T = "% each='.' > script src='~[.]';"

Script.prototype = {
	mode: 'server:all',
	nodes: mask.parse(T),
	
	renderStart: function(model, cntx){
		
		var _default = app.config.client.scripts,
			_page = cntx.page.scripts;
		
		this.model = _page == null
						? _default
						: _default.concat(_page);
	}
};
	
