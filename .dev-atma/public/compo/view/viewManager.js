(function() {

	var Helper = {
		doSwitch: function($current, $next, callback) {
			$current.removeClass('active');
			$next.addClass('active');

			
			mask.animate($next.get(0), 'opacity | 0 > 1 | 2s cubic-bezier(.58,1.54,.59,.75)')
			
		}
	},
	currentCompo;

	
	function load_View(data, callback) {
		var view = data.view || 'index',
			viewId = view,
			controllerId = 'default',
			controller,
			styles;
		
		
		if (data.controller) {
			controller = '/public/view/'
				+ view
				+ '/'
				+ data.controller
				+ '.js';
			
			controllerId = data.controller
		}
		
		
		view = '/public/view/'
			+ view
			+ '/'
			+ view
			+ '.mask::View';
		
		
		
		include
			.instance()
			
			.load(view)
			.js(controller)
			.done(function(resp){
			
				callback(viewId, controllerId, resp.load.View);
			});
	}

	var ViewManager = Compo({
		
		tagName: 'div',
		attr: {
			id: 'views'
		},
		
		constructor: function(){
			if (typeof window === 'undefined') 
				return;
			
			this.show = this.show.bind(this);
		},
		
		renderStart: function(model, cntx) {
			this.model = app.config.pages;
			
			if (cntx.page) {
				// render
				var that = this;
				
				Compo.pause(this, cntx);
				
				load_View(cntx.page.data, function(viewId, controller, template){
					
					that.nodes = jmask(':view:' + controller)
							.attr('id', viewId)
							.mask(template);
					
					
					
					Compo.resume(that, cntx);
				});
			}
		},
		onRenderEnd: function(){
			var that = this,
				pages = new ruta.Collection;
			
			for (var path in this.model) {
				pages.add(path, this.model[path]);
			}
			
			app.compos.viewManager = that;
			
			ruta.add('/?:page/?:tab/?:section', function(route){
				var path = route.current.path,
					page = pages.get(path);
				
				page = page && page.value;
				
				if (page == null) 
					return;
				
				that.show(route.current.params, page);
				
			});
		},
		
		onRenderEndServer: function(els, model, cntx){
			return;
			
			var ctrl = cntx.page.data.controller,
				compo = this.find(':view:' + ctrl),
				current = ruta.parse('/:page/:tab/:section', cntx.req.url);
				
			compo.tab(current);
		},
		
		load: function(current, page) {

			var activity = window.app.find(':pageActivity').show();

			load_View(page, function(viewId, controller, template){

				var compoName = ':view:' + controller;

				this.append(compoName +'#' + viewId , {});
				
				activity.hide();


				var compo = this.find(compoName);
				
				if (compo == null) {
					console.error('Cannt be loaded', compoName);
					return;
				}
				

				this.performShow(compo, current, page);
			}.bind(this));

		},
		show: function(current, page) {
			
			var $menu = $(document.getElementsByTagName('menu'));

			$menu
				.find('.selected')
				.removeClass('selected');
			$menu
				.find('[data-view="' + page.id + '"]')
				.addClass('selected');



			var compo = this.find(':view:' + page.controller);
			
			if (compo == null) {
				this
					.$
					.children('.active')
					.removeClass('active');
					
				this.load(current, page);
				return;
			}

			this.performShow(compo, current, page);
		},
		performShow: function(compo, current, page) {
			
			
			compo.tab(current);

			if (compo === currentCompo) 
				return;
			
			
			if (currentCompo)
				currentCompo.deactivate && currentCompo.deactivate();
				

			currentCompo = compo;

			if (this.$) 
				Helper.doSwitch(this.$.children('.active'), compo.$);
			

			if (compo.activate)
				compo.activate();

			
			if (page.title)
				document.title = page.title;
			
		}
	});

	mask.registerHandler(':viewManager', ViewManager);

}());
