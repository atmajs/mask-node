var logger_dimissCircular = (function() {
	var cache;

	function clone(mix) {
		if (mix == null) {
			return null;
		}


		var cloned;

		if (mix instanceof Array) {
			cloned = [];
			for (var i = 0, imax = mix.length; i < imax; i++) {
				cloned[i] = clone(mix[i]);
			}
			return cloned;
		}

		if (typeof mix === 'object') {

			if (~cache.indexOf(mix)) {
				return '[object Circular]';
			}
			cache.push(mix);

			cloned = {};
			for (var key in mix) {
				cloned[key] = clone(mix[key]);
			}
			return cloned;
		}

		return mix;
	}

	return function(mix) {
		if (typeof mix === 'object' && mix != null) {
			cache = [];
			mix = clone(mix);
			cache = null;
		}

		return mix;
	};
}());