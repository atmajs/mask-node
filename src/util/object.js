function obj_inherit(target /* source, ..*/ ) {
	if (typeof target === 'function') {
		target = target.prototype;
	}
	var i = 1,
		imax = arguments.length,
		source,
		key,
		descriptor;
	for (; i < imax; i++) {

		source = typeof arguments[i] === 'function'
			? arguments[i].prototype
			: arguments[i];

		for (key in source) {
			descriptor = Object.getOwnPropertyDescriptor(source, key);
			
			if (descriptor.hasOwnProperty('value')) {
				target[key] = descriptor.value;
				continue;
			}
			
			Object.defineProperty(target, key, descriptor);
		}
	}
	return target;
}

function obj_extend(target, source) {
	if (target == null)
		target = {};
	if (source == null)
		return target;
	
	for (var key in source) {
		target[key] = source[key];
	}
	
	return target;
}