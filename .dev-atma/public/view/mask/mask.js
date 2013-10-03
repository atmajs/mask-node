include
	.load('mask.example::Examples')
	.done(function(resp) {

	mask.registerHandler(':view:mask', Class({
		Base: mask.getHandler(':view:default'),
		
		compos : {
			tabsexamples: 'compo: #tabs-examples',
			tabssyntax: 'compo: #tabs-syntax',
		},
		
		Override: {
			onRenderStart: function(){
				
				var examples = resp.load.Examples;
				
				this.model = {
					examples: examples,
					sideMenu: [{
						name: 'examples',
						list: ruqq.arr.select(examples, ['name', 'title'])
					}]
				}
				
				this.super();
			}
		}
	}));
	
});
