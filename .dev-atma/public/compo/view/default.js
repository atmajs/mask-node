
include

.load('default.mask')
.done(function(resp) {

	mask.render(resp.load['default']);
	
	
	function when(dfrs, callback) {
		var count = dfrs.length;
		
		for (var i = 0, x, imax = dfrs.length; i < imax; i++){
			x = dfrs[i];
			
			x.done(function(){
				if (--count === 0) {
					callback();
				}
			});
		}
	}

	mask.registerHandler(':view:default', Compo({
		cache: {
			byProperty: 'ctx.req.url'
		},
		
		compos: {
			radio_sideMenu: 'compo: .side-menu',
			radio_radioButtons: 'compo: .radioButtons',
			tabs_tabs: 'compo: .tabs'
		},
		
		modeModel: 'none',
		
		onRenderEnd: function(elements, model, cntx){
			this.viewName = this.attr.id;
			
			var $tabs = jmask(this).find(':tabs'),
				compos = this.compos;
			
			$tabs.each(function(x){
				if (x.attr.id == null)
					return;
				
				compos['tabs' + x.attr.id] = x;
			});
		},
		
		events: {
			'changed: .radioButtons': function(e, target) {
				
				var path = '/'
					+ this.viewName
					+ '/'
					+ target.getAttribute('name');
				
				window
					.ruta
					.navigate(path);
			},
			'changed: .group': function(event, target){
				
				var section = target.getAttribute('name');
				
				var path = '/'
					+ this.viewName
					+ '/'
					+ this.compos.radio_radioButtons.getActiveName()
					+ '/'
					+ section;
				
				window
					.ruta
					.navigate(path);
			}
		},
		
		
		getCurrentTabName: function(){
			return this
				.compos
				.tabs_tabs
				.getActiveName();
		},
		
		showTab: function(name){
			if (this.compos.radio_radioButtons) {
				this
					.compos
					.radio_radioButtons
					.setActive(name);
			}
			
			if (this.compos.radio_sideMenu) {
				this
					.compos
					.radio_sideMenu
					.setActive(name);
			}
			
			if (this.compos.tabs_tabs) {
				this
					.compos
					.tabs_tabs
					.setActive(name);
			}
			

		},
		
		showSection: function(name){
			
			var $sideMenu = this.$.find('.side-menu');
		
			if ($sideMenu.length === 0)
				return;
		
			if (!$sideMenu.compo().getActiveName()) 
				return;
			
			
			
			var $group = $sideMenu.find('.group.-show');
				
			
				
			if ($group.length === 0) 
				return;
			
			
			if (this.cntx && this.cntx.promise && this.cntx.promise.length) {
				var that = this,
					dfrs = this.cntx.promise.splice(0);
				when(dfrs, function(){
					that.showSection(name);
				})
				
				return true;
			}
			
			
			var groupName = $group.attr('name'),
				group = $group.compo();
			
			if (!name) {
				name = group.getList()[0];
			}
			
			
			
			group.setActive(name);
			
			var tabs = this
				.compos['tabs' + groupName];
				
			tabs.setActive(name);
			
			return true;
		},
		
		tab: function(info) {
			if (!info.tab) {
				info.tab = this.defaultTab || 'info';
			}
			
			this.showTab(info.tab);
			
			
			var hasSections = this.showSection(info.section);
			
			app
				.compos
				.navigation[hasSections ? 'blur' : 'focus']();

			this.update(info);

		},
		update: function(info) {
			var scroller = Compo.find(this, 'scroller');
			scroller && scroller.scroller && scroller.scroller.refresh();

			if (info.section) {
				var element = this.$.find('a[name="' + info.section + '"]').get(0);

				if (element && scroller && scroller.scroller) {
					scroller.scroller.scrollToElement(element, 100);
				}
			}
		},
		activate: function() {
			////var scroller = this.find('scroller');
			////scroller && scroller.scroller && scroller.scroller.refresh();
		}
	}));

	
});
