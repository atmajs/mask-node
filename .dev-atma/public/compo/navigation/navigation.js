include
	.css('navigation.less')

	.server()
	.load(
		'navigation.mask::Template',
		'list.yml'
	)
	
	.done(function(resp) {
		
	var Template = resp.load && resp.load.Template,
		List = resp.load && resp.load.list;
	

	mask.registerHandler(':navigation', Compo({
		template: Template,
		mode: 'server:children',
		modeMenu: 'none',
		
		constructor: function() {

			this.removeForced = this.removeForced.bind(this);
			
		},

		events: {
			'click: .menu-show': function() {
				this.$.addClass('forced');



				var that = this;
				setTimeout(function() {
					that.$.on('mouseleave', that.removeForced);
				}, 300);

			},

			//'click: .viewTitle': function(event) {
			//	
			//	var $current = event.currentTarget;
			//	
			//	if ($current.hasAttribute('data-dynamic')) 
			//		return;
			//	
			//	event.preventDefault();
			//	event.stopPropagation();
			//	
			//	ruta.navigate($current.href);
			//},
		},

		removeForced: function() {
			this.$.removeClass('forced');
			this.$.off('mouseout mouseleave');
		},


		onRenderStart: function(model, cntx, container) {
			var page = cntx.page,
				data = page.data,
				menuHidden = page.menuHidden;
			
			var tab = data.tabs && data.tabs[page.query.tab];
			
			if (tab && tab.navigation === false) 
				menuHidden = true;
			
			
			this.model = {
				menuHidden: menuHidden,
				list: List
			};
			
		},
		onRenderEnd: function(elements, cntx, container) {
			
			app.compos.navigation = this;
		},


		focus: function() {
			this.$.removeClass('hidden');
		},

		blur: function() {
			this.$.addClass('hidden');
		}
	}));


});