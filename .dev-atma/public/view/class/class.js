
include
	.load('class.example::Examples')
	.done(function(resp) {
		
	
		mask.registerHandler(':view:class', Class({
			Base: mask.getHandler(':view:default'),
			
			compos : {
				tabsexamples: 'compo: #tabs-examples'
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
					};
					
					this.super(arguments);
				}
			}
		}));
		
	});
