var mode_SERVER = 'server',
	mode_SERVER_ALL = 'server:all',
	mode_SERVER_CHILDREN = 'server:children',
	mode_CLIENT = 'client',
	mode_BOTH = 'both',

	meta_get,
	meta_getVal,
	meta_getRenderMode,
	meta_getModelMode,
	meta_setVal,
	meta_resolveRenderMode,
	meta_resolveModelMode
	;

(function(){

	var mods = `,${mode_SERVER},${mode_SERVER_CHILDREN},${mode_SERVER_ALL},${mode_CLIENT},${mode_BOTH}`;

	meta_getRenderMode = function(compo){
		var mode = meta_resolveRenderMode(compo);
		return new Mode(mode);
	};
	meta_getModelMode = function(compo){
		var mode = meta_getRenderMode(compo);
		if (mode.isServer()) {
			return mode;
		}
		mode = meta_resolveModelMode(compo);
		return new Mode(mode);
	};
	meta_get = function(compo){
		if (compo == null)
			return new CompoMeta;

		var proto = typeof compo === 'function'
				? compo.prototype
				: compo
				;
		return new CompoMeta(proto);
	};
	meta_resolveRenderMode = function(compo){
		var mode = getMetaVal(compo, 'mode', 'x-render-mode');
		if (mode == null) {
			mode = getMetaVal(compo.parent, 'mode', 'x-render-mode');
			if (mode == null) {
				mode = mode_BOTH;
				meta_setVal(mode, 'mode', mode);
			}
			if (mode === mode_SERVER_ALL || mode === mode_SERVER_CHILDREN) {
				meta_setVal(compo, 'mode', mode_SERVER_ALL);
			}
		}
		if (mods.indexOf(mode) === -1) {
			log_error('Unknown render mode: ' + mode);
			return mode_BOTH;
		}
		return mode;
	};
	meta_resolveModelMode = function(compo){
		var mode = getMetaVal(compo, 'modelMode', 'x-model-mode') || (log_warn('modeModel is deprecated'), getMetaVal(compo, 'modeModel'));
		if (mode == null) {
			mode = getMetaVal(compo.parent, 'mode', 'x-model-mode');
			if (mode == null) {
				mode = mode_BOTH;
				meta_setVal(mode, 'modelMode', mode);
			}
			if (mode === mode_SERVER_ALL || mode === mode_SERVER_CHILDREN) {
				meta_setVal(compo, 'modelMode', mode_SERVER_ALL);
			}
		}
		if (mods.indexOf(mode) === -1) {
			log_error('Unknown model mode: ' + mode);
			return mode_BOTH;
		}
		return mode;
	};
	meta_getVal = function(compo, prop){
		return getMetaVal(compo, prop);
	};
	meta_setVal = function(compo, prop, val) {
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo;

		proto.meta = proto.meta == null
			? new CompoMeta
			: obj_create(proto.meta)
			;
		proto.meta[prop] = val;
	};

	// Private

	function getMetaVal(compo, prop, attrProp) {
		if (compo == null)
			return null;

		var proto = typeof compo === 'function'
			? compo.prototype
			: compo
			;
		var meta = proto.meta;
		if (meta != null) {
			if (meta[prop]) {
				return meta[prop];
			}
		}
		if (attrProp) {
			var attr = proto.attr;
			if (attr && attr[attrProp]) {
				var val = attr[attrProp];
				meta_setVal(compo, prop, val);
				return val;
			}
		}
		var def = MetaDefault[prop];
		if (def === void 0) {
			log_error('Uknown meta property: ', prop);
		} else {
			meta_setVal(compo, prop, def);
		}
		return def;
	}

	function CompoMeta(ctr){
		if (ctr == null) {
			return;
		}
		var meta = ctr.meta || ctr.$meta;
		if (meta != null) {
			return meta;
		}
		if (ctr.mode /* obsolete */) {
			this.mode = ctr.mode;
		}
	}

	var MetaDefault = CompoMeta.prototype = {
		mode: mode_BOTH,
		modelMode: mode_BOTH,
		attributes: null,
		cache: false
	};

	var Mode = class_create({
		mode: null,
		constructor (mode) {
			this.mode = mode;
		},
		isServer () {
			return this.mode === mode_SERVER_ALL || this.mode === mode_SERVER;
		},
		isClient () {
			return this.mode === mode_CLIENT;
		}
	})
}());