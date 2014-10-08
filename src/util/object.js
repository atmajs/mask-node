var obj_inherit;
(function(){

	obj_inherit = function(target /* source, ..*/ ) {
		if (typeof target === 'function') 
			target = target.prototype;
		
		var imax = arguments.length,
			i = 1,
			source,
			x;
		for (; i < imax; i++) {
			x = arguments[i];
			source = typeof x === 'function'
				? x.prototype
				: x;
	
			for (var key in source) {
				
				var descriptor = Object.getOwnPropertyDescriptor(source, key);
				if (descriptor == null) {
					continue;
				}
				if (descriptor.hasOwnProperty('value')) {
					target[key] = descriptor.value;
					continue;
				}
				Object.defineProperty(target, key, descriptor);
			}
		}
		return target;
	}
	
}());
