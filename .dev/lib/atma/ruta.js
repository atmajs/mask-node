(function(root, factory){
	"use strict";
	
	if (root == null) {
		root = typeof window !== 'undefined' && typeof document !== 'undefined' 
			? window 
			: global;
	}
	
	
	root.ruta = factory(root);
	
}(this, function(global){
	"use strict";
	
	
	// source ../src/utils/path.js
	function path_normalize(str) {
		
		var length = str.length,
			i = 0,
			j = length - 1;
			
		for(; i < length; i++) {
			if (str[i] === '/') 
				continue;
			
			break;
		}
		for (; j > i; j--) {
			if (str[j] === '/') 
				continue;
			
			break;
		}
		
		return str.substring(i, j + 1);
	}
	
	function path_split(path) {
		path = path_normalize(path);
		
		return path === ''
			? []
			: path.split('/');
	}
	// source ../src/utils/query.js
	function query_deserialize(query, delimiter) {
		delimiter == null && (delimiter = '/');
	
		var obj = {},
			parts = query.split(delimiter),
			i = 0,
			imax = parts.length,
			x;
	
		for (; i < imax; i++) {
			x = parts[i].split('=');
	
			obj[x[0]] = decodeURIComponent(x[1]);
	
		}
	
		return obj;
	}
	
	function query_serialize(params, delimiter) {
		delimiter == null && (delimiter = '/');
	
		var query = '',
			key;
	
		for (key in params) {
			query = (query ? delimiter : '') + key + '=' + encodeURIComponent(params[key]);
		}
	
		return query;
	}

	// source ../src/route/Collection.js
	var Routes = (function(){
		
		// source Route.js
		
		// source parse.js
		
		function route_parseDefinition(route, definition) {
			
			if (definition[0] === '!') {
				route.strict = true;
				definition = definition.substring(1);
			}
			
			
			var parts = definition.split('/'),
				i = 0,
				imax = parts.length,
				x,
				c0,
				index,
				c1;
		
			var matcher = '',
				alias = null,
				strictCount = 0;
		
			var gettingMatcher = true,
				isConditional,
				isAlias;
		
			var array = [];
			
			for (; i < imax; i++) {
				x = parts[i];
				
				if (x === '') 
					continue;
				
		
				c0 = x.charCodeAt(0);
				c1 = x.charCodeAt(1);
		
				isConditional = c0 === 63; /* ? */
				isAlias = (isConditional ? c1 : c0) === 58; /* : */
				index = 0;
				
				if (isConditional) 
					index++;
				
				if (isAlias) 
					index++;
				
		
				if (index !== 0) 
					x = x.substring(index);
				
		
				// if DEBUG
				!isConditional && !gettingMatcher && console.log('Strict route part found after conditional', definition);
				// endif
		
		
				if (isConditional) 
					gettingMatcher = false;
				
		
				if (gettingMatcher) {
					strictCount += 1;
					matcher += '/' + (isAlias ? regexp_var : x)
				}
		
				if (isAlias) {
					(alias || (alias = {}))[index] = x;
				}
				
				if (!isConditional && !isAlias) {
					array.push(x);
					continue;
				}
				
				if (isAlias) {
					array.push({
						alias: x,
						optional: isConditional
					});
				}
				
			}
		
			route.parts = array;
		}
		
		
		/* - path should be already matched by the route */
		
		function route_parsePath(route, path) {
			var queryIndex = path.indexOf('?'),
				query = queryIndex === -1 ? null : path.substring(queryIndex + 1),
				obj = query == null ? {} : query_deserialize(query, '&');
		
			if (queryIndex !== -1) {
				path = path.substring(0, queryIndex);
			}
		
			var parts = path_split(path),
				imax = parts.length,
				i = 0,
				part,
				x,
				//eqeqIndex,
				//var_,
				routeParts = route.parts,
				routeLength = routeParts.length;
		
			for (; i < imax; i++) {
				part = parts[i];
				x = i < routeLength ? routeParts[i] : null;
				
				if (x) {
					
					if (typeof x === 'string') 
						continue;
					
					if (x.alias) {
						obj[x.alias] = part;
						continue;
					}
					
				}
			}
		
			return obj;
		}
		// source match.js
		
			
			
		function route_match(path, routes){
			var parts = path_split(path);
			
			for (var i = 0, route, imax = routes.length; i < imax; i++){
				route = routes[i];
				
				if (route_isMatch(parts, route)) {
					route.current = route_parsePath(route, path);
					
					return route;
				}
			}
			
			return null;
		};
		
		function route_isMatch(parts, route) {
			
			if (typeof parts === 'string') 
				parts = path_split(parts);
			
			
				
			var routeParts = route.parts,
				routeLength = routeParts.length;
		
			
			
			for (var i = 0, x, imax = parts.length; i < imax; i++){
				
				x = routeParts[i];
				
				if (i >= routeLength) 
					return route.strict !== true;
				
				if (typeof x === 'string') {
					if (parts[i] === x) 
						continue;
					
					return false;
				}
				
				if (x.optional) 
					return true;
				
				if (x.alias) 
					continue;
				
				return false;
			}
			
			if (i < routeLength) 
				return routeParts[i].optional === true;
				
			
			return true;
		}
		
		var regexp_var = '([^\\\\]+)';
		
		function Route(definition, value) {
		
			this.value = value;
		
			route_parseDefinition(this, definition);
		}
		
		Route.prototype = {
			parts: null,
			value: null
		};
		
		
		function RouteCollection() {
			this.routes = [];
		}
		
		RouteCollection.prototype = {
			add: function(regpath, value){
				
				this.routes.push(new Route(regpath, value));
				
				return this;
			},
			
			get: function(path){
				
				return route_match(path, this.routes);
			}
		}
		
		
		return RouteCollection;
	}());

	// source ../src/ruta.js
	
	var routes = new Routes();
	
	
	var Ruta = {
		
		Collection: Routes,
		
		add: function(regpath, mix){
			
			return routes.add(regpath, mix);
		},
		
		get: function(path){
			
			return routes.get(path);
		}
	};
	
	
	return Ruta;
}));