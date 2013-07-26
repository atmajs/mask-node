(function() {

	var Helper = {
		doSwitch: function($current, $next, callback) {
			$current.removeClass('active');
			$next.addClass('active');


			var prfx = ruqq.info.cssprefix;
			ruqq.animate($next, {
				property: 'opacity',
				valueFrom: '0',
				valueTo: '1',
				duration: 500,
				timing: 'cubic-bezier(.58,1.54,.59,.75)',
				callback: callback
			});
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
			
			
		},
		
		renderStart: function(model, cntx) {
			
			if (cntx.page) {
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
		renderEnd: function(){
			window.viewManager = this;
		},
		load: function(info) {

			var activity = Compo.find(window.app, ':pageActivity').show(),
				name = info.view.replace('View', '');

			window.Page.resolve(name, function(controller, template){

				controller.prototype.attr = Object.extend(controller.prototype.attr, {
					template: template,
					id: name
				});

				mask.registerHandler(name + 'View', controller);

				this.append(name + 'View', {});
				activity.hide();


				var compo = Compo.find(this,  name + 'View');
				if (compo == null) {
					console.error('Cannt be loaded', name);
					return;
				}
				

				this.performShow(compo, info);
			}.bind(this));

		},
		show: function(info) {

			var $menu = $(document.getElementsByTagName('menu'));

			$menu.find('.selected').removeClass('selected');
			$menu.find('[data-view="'+info.view+'"]').addClass('selected');



			var compo = this.find(info.view + 'View');
			if (compo == null) {
				this.$.children('.active').removeClass('active');
				this.load(info);
				return;
			}

			this.performShow(compo, info);
		},
		performShow: function(compo, info, callback) {

			compo.section(info);

			if (compo == currentCompo) {
				return;
			}
			
			if (currentCompo)
				currentCompo.deactivate && currentCompo.deactivate();
				

			currentCompo = compo;

			if (this.$) {
				callback && callback();
				Helper.doSwitch(this.$.children('.active'), compo.$);
			}

			compo.activate && compo.activate();

			info = Page.getInfo(info.view);

			if (info && info.title){
				document.title = info.title;
			}

		}
	});

	mask.registerHandler(':viewManager', ViewManager);

}());
