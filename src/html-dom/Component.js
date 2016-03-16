(function(){
	// import /ref-mask/src/builder/util.js


	HtmlDom.Component = class_createEx(
		HtmlDom.Node,
		{
			nodeType: Dom.COMPONENT,

			compoName: null,
			compo: null,
			node : null,
			instance: null,
			components: null,
			ID: null,
			modelID: null,

			constructor: function (node, model, ctx, container, ctr) {
				this.node = node;
				this.compoName = node.compoName || node.tagName;
			},

			setComponent: function (compo, model, ctx) {
				this.ID    = compo.ID;
				this.compo = compo;
				this.setModelId_(compo, model, ctx);
			},
			setModelId_: function(compo, model, ctx){
				if (meta_getModelMode(compo).isServer())
					return;

				if (compo.modelRef) {
					var id = ctx._models.tryAppend(compo);
					if (id !== -1){
						this.modelID = id;
					}
					return;
				}

				if (compo.model == null || compo.model === model) {
					return;
				}

				var id = ctx._models.tryAppend(compo);
				if (id !== -1) {
					this.modelID = id;
				}
			},
			initModelID: function(ctx, parentsModel){
				var compo = this.compo;
				if (meta_getModelMode(compo).isServer())
					return;

				if (compo.modelRef) {
					var id = ctx._models.tryAppend(compo);
					if (id !== -1){
						this.modelID = id;
					}
					return;
				}

				if (compo.model == null || compo.model === parentsModel) {
					return;
				}

				var id = ctx._models.tryAppend(compo);
				if (id !== -1) {
					this.modelID = id;
				}
			},
			toString: function() {
				var compo = this.compo;
				if (compo.__cached != null) {
					return compo.__cached;
				}

				var meta = meta_get(compo);
				if (meta.mode === mode_CLIENT) {
					var json = {
							mask: mask_stringify(this.node, 0)
						},
						info = {
							type: 'r',
							single: true,
						},
						string = Meta.stringify(json, info);
					if (meta.cache /* unstrict */) {
						compo.__cached = string;
					}
					return string;
				}

				var	json = {
						ID: this.ID,
						modelID: this.modelID,
						compoName: compo.compoName,
						attr: compo.attr,
						expression: compo.expression,
						nodes: _serializeNodes(meta, this),
						scope: _serializeScope(meta, compo)
					},
					info = {
						single: this.firstChild == null,
						type: 't',
						mode: meta.mode
					};

				var string = Meta.stringify(json, info);

				if (compo.toHtml != null) {
					string += compo.toHtml();
				} else {
					string += _stringifyChildren(this);
				}

				if (meta.mode !== mode_CLIENT) {
					string += Meta.close(json, info);
				}
				if (meta.cache) {
					compo.__cached = string;
				}
				return string;
			},
			write: function(stream) {
				var compo = this.compo;
				var cache = compo.__cached;
				if (typeof cache === 'string') {
					stream.write(cache);
					return;
				}
				var streamCached = null;
				var meta = meta_get(compo);
				if (meta.cache /* unstrict */) {
					streamCached = new HtmlStreamPipe(stream);
					stream = streamCached;
				}

				if (meta.mode === mode_CLIENT) {
					var json = {
							mask: mask_stringify(this.node, stream.minify ? 0 : 4)
						},
						info = {
							type: 'r',
							single: true,
						};

					stream.write(Meta.stringify(json, info));
					if (streamCached != null) {
						compo.__cached = streamCached.toString();
					}
					return;
				}

				var	json = {
						ID: this.ID,
						modelID: this.modelID,
						compoName: compo.compoName,
						attr: compo.attr,
						expression: compo.expression,
						nodes: _serializeNodes(meta, this),
						scope: _serializeScope(meta, compo)
					},
					info = {
						single: this.firstChild == null && compo.toHtml == null,
						type: 't',
						mode: meta.mode
					};

				var compoOpen = Meta.stringify(json, info);
				if (compoOpen) {
					stream.openBlock(compoOpen);
				}

				if (compo.toHtml != null) {
					stream.write(compo.toHtml());
				} else {
					_stringifyChildrenStream(this, stream);
				}


				var compoClose = Meta.close(json, info);
				if (compoClose) {
					stream.closeBlock(compoClose);
				}
				
				if (streamCached != null) {
					compo.__cached = streamCached.toString();
				}
			}
		});

	function _stringifyChildren(compoEl) {
		var el  = compoEl.firstChild,
			str = '';
		while (el != null) {
			str += el.toString();
			el = el.nextSibling;
		}
		return str;
	}
	function _stringifyChildrenStream(compoEl, stream) {
		var el  = compoEl.firstChild;
		while (el != null) {
			stream.process(el);
			el = el.nextSibling;
			if (el != null) {
				stream.newline();
			}
		}
	}

	function _initController(Mix, node, model, ctx, el, ctr) {
		if (is_Function(Mix)) {
			return new Mix(node, model, ctx, el, ctr);
		}
		if (is_Function(Mix.__Ctor)) {
			return new Mix.__Ctor(node, model, ctx, el, ctr);
		}
		return Mix;
	}

	function _serializeNodes(meta, compoEl) {
		var x = meta.serializeNodes;
		if (x == null || x === false)
			return null;

		var fn = null;
		if (is_Function(x)) {
			fn = x;
		}
		if (fn == null && is_Function(compoEl.compo.serializeNodes)) {
			fn = compoEl.compo.serializeNodes;
		}
		if (fn == null) {
			fn = mask_stringify;
		}

		return fn.call(compoEl.compo, compoEl.node);
	}
	function _serializeScope(meta, compo) {
		if (meta.serializeScope == null) {
			return null;
		}

		var scope = compo.scope;
		if (scope == null) {
			return null;
		}

		var parent = compo.parent,
			model = compo.model;
		while(model == null && parent != null){
			model = parent.model;
			parent = parent.parent;
		}
		return compo.serializeScope(scope, model);
	}
}());