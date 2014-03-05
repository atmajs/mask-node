
mask.registerHandler(':foo', mask.Compo({
	tagName: 'div',   
	template: 'input value="~[text]"; button x-signal="mousedown:changeToQux" > "Change to baz"',
	onRenderStart: function(){
		
		this.model = {
			text: 'foo'
		};
	},
	
	compos: {
		'test_jQuery': '$: button',
		'test_querySelector': 'button'
	},
	
	events: {
		'click: button': function(){
			
			this.$.find('input').val('baz');
		}
	},
	
	slots: {
		changeToQux: function(event){
			
			this.$.find('input').val('qux');
		}
	}
}));

