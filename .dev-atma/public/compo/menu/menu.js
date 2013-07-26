console.log('loading MENU', include.location);

include 
	.load('menu.mask::Template') 
	.css('menu.less')  
	.done(function(resp){
	
		console.log('register MENU');
		
		mask.registerHandler(':menu', Compo({
			template: resp.load.Template,
			mode: 'server:children',
			modeModel: 'none',
			
			constructor: function(){
				
				this.removeForced = this.removeForced.bind(this);
			},
			
			events: {
				'click: .menu-show': function(){
					this.$.addClass('forced');
					
					
					
					var that = this;
					setTimeout(function(){
						that.$.on('mouseleave', that.removeForced);
					}, 300);
					
				},
				
				'click: .viewTitle': function(e) {
					
					var view = $(e.currentTarget).data('view');
					alert(view);
					
					if (view){
						window.routes.navigate(view);
						return;
					}
					var navigate = $(e.currentTarget).data('navigate');
					if (navigate){
						window.location.href = navigate;
					}
				},
			},
			
			removeForced: function(){
				this.$.removeClass('forced');
				this.$.off('mouseout mouseleave');
			},
			

	        onRenderStart: function(model, cntx, container){
	            this.model = {
					//menuHidden: pageInfo.menuHidden,
					menuModel: [{
						title: 'About',
						items: [{
							view: 'about',
							title: 'About'
						}]
					}, {
						title: 'Library',
						items: [{
							view: 'class',
							title: 'ClassJS'
						}, {
							view: 'mask',
							title: 'MaskJS',
							items: [{
								view: 'sys',
								title: 'Sys'
							},{
								view: 'mask-j',
								title: 'jMask'
							},{
								view: 'mask-compo',
								title: 'Compo'
							},{
								view: 'mask-binding',
								title: 'Binding'
							},{
								title: '',
								'class': 'hr'
							},{
								title: 'Live Test',
								navigate: '/mask-try/'
							},{
								title: 'Html To Mask',
								navigate: '/html2mask/'
							}]
						}, {
							view: 'mask-animation',
							title: 'Mask.Animation',
						}, {
							view: 'include',
							title: 'IncludeJS'
						}, {
							view: 'includeBuilder',
							title: 'IncludeJS.Builder'
						},{
							view: 'utest',
							title: 'UTest'
						}, {
							view: 'ruqq',
							title: 'RuqqJS'
						}]
					}, {
						title: 'Component',
						items: [ {
							view: 'compos/markdown',
							title: ':markdown;'
						},{
							view: 'compos/scroller',
							title: 'scroller;'
						}, {
							view: 'compos/prism',
							title: 'prism;'
						}, {
							view: 'compos/datePicker',
							title: 'datePicker;'
						}, {
							view: 'compos/timePicker',
							title: 'timePicker;'
						}],
						hint: '... more in near future'
					}, {
						title: 'Pre/Post Processing',
						'class': 'badge',
						items: [{
							view: 'compos/layout',
							title: 'layout;'
						}]
					}]
				};
	        },
	        onRenderEnd: function(elements, cntx, container){
	            
	            //window.compos.menu = this;
	        },
			
			
			focus: function(){
				this.$.removeClass('hidden');
			},
			
			blur: function(){
				this.$.addClass('hidden');
			}
		}));


	});
