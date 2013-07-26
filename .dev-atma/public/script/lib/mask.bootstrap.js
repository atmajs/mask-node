(function(){
	
	// source ../src/client/bootstrap.js
	
	function bootstrap(container) {
		
		// source ../util/function.js
		
		function fn_isFunction(fn) {
			return fn instanceof Function;
		}
		// source ../util/array.js
		function arr_isArray(array){
			return array
				&& typeof array.length === 'number'
				&& typeof array.splice === 'function';
		}
		// source ../mock/Meta.js
		var Meta = (function(){
			
			var seperator_CODE = 30,
				seperator_CHAR = String.fromCharCode(seperator_CODE);
			
			function val_stringify(mix) {
				if (typeof mix !== 'string') 
					return val_stringify(JSON.stringify(mix));
				
				return mix;
			}
			
			var parser_Index,
				parser_Length,
				parser_String;
				
			function parse_ID(json){
				
				if (parser_String[parser_Index] !== '#') {
					return;
				}
				parser_Index++;
				
				var end = parser_String.indexOf(seperator_CHAR);
				
				if (end === -1) {
					end = parser_String.length;
				}
				
				json.ID = parseInt(parser_String.substring(parser_Index, end), 10);
				parser_Index = end;
			}
			
			function parse_property(json) {
				if (parser_Index > parser_Length - 5) 
					return false;
				
				
				if (parser_String[parser_Index++] !== seperator_CHAR || parser_String[parser_Index++] !== ' '){
					parser_Index = -1;
					return false;
				}
				
				var index = parser_Index,
					str = parser_String;
				
				var colon = str.indexOf(':', index),
					key = str.substring(index, colon);
					
				var end = str.indexOf(seperator_CHAR + ' ', colon),
					value = str.substring(colon + 1, end);
					
				
				if (key === 'attr') {
					value = JSON.parse(value);
				}
				
				json[key] = value;
				
				parser_Index = end;
				return true;
			}
			
			
			return {
				stringify: function(json, info){
					
					switch (info.mode) {
						case 'server':
						case 'server:all':
							return '';
					}
					
					
					var	type = info.type,
						isSingle = info.single,
					
						string = '<!--' + type;
						
						if (json.ID) 
							string += '#' + json.ID;
						
						string += seperator_CHAR + ' ';
					
					for (var key in json) {
						if (key === 'ID') 
							continue;
						
						if (json[key] == null) 
							continue;
						
						
						string += key
							+ ':'
							+ val_stringify(json[key])
							+ seperator_CHAR
							+ ' ';
					}
					
					if (isSingle)
						string += '/';
						
					string += '-->';
					
					return string;
				},
				
				close: function(json, info){
					switch (info.mode) {
						case 'server':
						case 'server:all':
							return '';
					}
					
					
					return '<!--/'
						+ info.type
						+ (json.ID ? '#' + json.ID : '')
						+ '-->';
				},
				
				parse: function (string){
					parser_Index = 0;
					parser_String = string;
					parser_Length = string.length;
					
					
					var json = {},
						c = string[parser_Index];
						
					if (c === '/') {
						json.end = true;
						parser_Index++;
					}
					
					json.type = string[parser_Index++];
					
					
					parse_ID(json);
					
					while (parse_property(json));
					
					if (parser_Index === -1) 
						return {};
					
					
					if (string[parser_Length - 1] === '/') 
						json.single = true;
					
					return json;
				}
			};
		}());
		// source traverse.js
		function trav_getElements(meta) {
			if (meta.isDocument) 
				return Array.prototype.slice.call(document.body.childNodes);
			
		
			var id = 'mask-htmltemplate-' + meta.ID,
				startNode = document.getElementById(id),
				endNode = document.getElementsByName(id)[0];
		
			
		
			if (startNode == null || endNode == null) {
				console.error('Invalid node range to initialize mask components');
				return null;
			}
		
			var array = [],
				node = startNode.nextSibling;
			while (node != null && node != endNode) {
				array.push(node);
		
				node = node.nextSibling;
			}
		
			return array;
		}
		
		function trav_getElement(node){
			var next = node.nextSibling;
			while(next && next.nodeType !== Node.ELEMENT_NODE){
				next = next.nextSibling;
			}
			
			return next;
		}
		
		function trav_getMeta(node){
			while(node && node.nodeType !== Node.COMMENT_NODE){
				node = node.nextSibling;
			}
			return node;
		}
		// source setup.js
		function setup(node, model, cntx, container, controller, childs) {
			
			if (node.nodeType === Node.ELEMENT_NODE) {
				if (childs != null) 
					childs.push(node);
				
				if (node.firstChild) 
					setup(node.firstChild, model, cntx, node, controller);
				
				if (childs == null && node.nextSibling) 
					setup(node.nextSibling, model, cntx, container, controller);
				
				
				return;
			}
			
			if (node.nodeType !== Node.COMMENT_NODE) {
				if (childs == null && node.nextSibling) 
					setup(node.nextSibling, model, cntx, container, controller);
				
				return;
			}
			
			var metaContent = node.textContent;
			
			if (metaContent === '/m') {
				return;
			}
			
			if (metaContent === '~') {
				setup(node.nextSibling, model, cntx, node.previousSibling, controller);
				return;
			}
			
			if (metaContent === '/~') {
				setup(node.nextSibling, model, cntx, node.parentNode, controller);
				return;
			}
			
			var meta = Meta.parse(metaContent);
			
			if (meta.modelID) 
				model = models[meta.modelID];
			
			if ('a' === meta.type) {
				// source setup-attr.js
				var handler = custom_Attributes[meta.name];
				var element = trav_getElement(node);
					
				if (handler == null) {
					console.log('Custom Attribute Handler was not defined', meta.name);
					return;
				}
				
				handler(null, meta.value, model, cntx, element, controller, container);
				
				return;
			}
			
			if ('u' === meta.type) {
				
				// source setup-util.js
				var handler = custom_Utils[meta.utilName];
				var element = trav_getElement(node);
				
				if (handler == null) {
					console.log('Custom Utility Handler was not defined', meta.name);
					return;
				}
				//debugger;
				
				handler(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
				
				return;
			}
			
			if ('t' === meta.type) {
				
				// source setup-tag.js
				if (custom_Tags[meta.compoName] != null) {
				
					if (meta.mask != null) {
						var _node = {
							type: Dom.COMPONENT,
							compoName: meta.compoName,
							attr: meta.attr,
							nodes: meta.mask ? mask.parse(meta.mask) : null,
							controller: custom_Tags[meta.compoName]
						};
						
						var fragment = mask.render(_node, model, cntx, null, controller);
						
						node.parentNode.insertBefore(fragment, node);
					} else {
					
						var compo = new custom_Tags[meta.compoName](model);
						
						compo.compoName = meta.compoName;
						compo.attr = meta.attr;
						compo.parent = controller;
						compo.ID = meta.ID;
						
						if (controller.components == null) 
							controller.components = [];
							
						controller.components.push(compo);
						
						if (meta.single !== false) {
							var elements = [],
								textContent;
							
							node = node.nextSibling;
							while(node != null){
								
								if (node.nodeType === Node.COMMENT_NODE) {
									textContent = node.textContent;
									
									if (textContent === '/t#' + meta.ID) {
										break;
									}
									
									if (textContent === '~') {
										container = node.previousSibling;
										node = node.nextSibling;
										continue;
									}
									
									if (textContent === '/~') {
										container = container.parentNode;
										node = node.nextSibling;
										continue;
									}
								}
								
								setup(node, model, cntx, container, compo, elements);
								node = node.nextSibling;
							}
						}
						
						
						
						if (fn_isFunction(compo.renderEnd)) {
							compo.renderEnd(elements, model, cntx, container);
						}
						
						if (childs != null && childs !== elements){
							var il = childs.length,
								jl = elements.length;
						
							j = -1;
							while(++j < jl){
								childs[il + j] = elements[j];
							}
						}
					}
					
					
					
				}else{
					console.error('Custom Tag Handler was not defined', meta.compoName);
				}
				
				
				
			}
			
			if (node && node.nextSibling) {
				setup(node.nextSibling, model, cntx, container, controller);
			}
		
		}
		
		
		
		if (container == null) {
			container = document.body;
		}
		
		var metaNode = trav_getMeta(container.firstChild),
			metaContent = metaNode && metaNode.textContent,
			meta = metaContent && Meta.parse(metaContent);
			
			
		if (meta == null || meta.type !== 'm') {
			console.error('Meta Inforamtion not defined', container);
			return;
		}
		
		var models = JSON.parse(meta.model),
			model = models[0];
	
		
		var custom_Attributes = mask.getAttrHandler(),
			custom_Tags = mask.getHandler(),
			custom_Utils = mask.getUtility(),
			Dom = mask.Dom;
	
		var stop_NODE = null;
		
		
		
		var compo = {
				components: []
			};
			
		var el = metaNode.nextSibling;
		
		
		setup(el, model, {}, el.parentNode, compo);
	
		
	
		if (typeof Compo !== 'undefined') {
			Compo.signal.emitIn(compo, 'DOMInsert');
		}
	
	}
	
	mask.Compo.bootstrap = bootstrap;
	
}());