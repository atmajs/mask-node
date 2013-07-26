

	
function Style() {}

mask.registerHandler(':styles', Style);


var T = "% each='.' > link type='text/css' rel='stylesheet' href='~[.]';";

Style.prototype = {
	mode: 'server:all',
	nodes: mask.parse(T),
	renderStart: function(model, cntx){
		
		this.model = cntx.page.getStyles(app.config.env);
		
	}
};
	
function page_handlePath(styles, pageData) {
	for (var i = 0, x, imax = styles.length; i < imax; i++){
		x = styles[i];
		
		if (x[0] === '/') 
			continue;
		
		if (x.indexOf('.') === -1) 
			x += '.less';
		
		
		styles[i] = '/public/view/'
			+ pageData.view
			+ '/'
			+ x
			;
	}
}