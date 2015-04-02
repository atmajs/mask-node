var	compo_getMetaInfo,	
	compo_getRenderMode,
	compo_getModelRenderMode,
	compo_isServerMode,
	compo_setMode,
	compo_wrapOnTagName,
	compo_getMetaVal,
	compo_setMetaVal
	;
	
(function(){
	
	compo_isServerMode = function(compo){
		return compo_getRenderMode(compo) === mode_SERVER;
	};
	compo_setMode = function(ctr, mode){
		ctr.meta = ctr.meta == null
			? new CompoMeta
			: obj_create(ctr.meta)
			;
		ctr.meta.mode = mode;
	};
	compo_getMetaInfo = function(compo){
		if (compo == null) 
			return new CompoMeta;
		
		var proto = typeof compo === 'function'
				? compo.prototype
				: compo
				;
		return new CompoMeta(proto);
	};
	compo_getRenderMode = function(compo){
		if (compo == null) 
			return mode_BOTH;
		
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo
			;
		var mode = proto.meta && proto.meta.mode;
		if (mode == null || mode === mode_BOTH) 
			return mode_BOTH;
		
		if (typeof mode === 'number') {
			throw Error('Not implemented: Mode as number');
		}
		
		if (mode === mode_SERVER || mode === mode_SERVER_ALL) 
			return mode_SERVER;
		
		if (mode === mode_CLIENT) 
			return mode_CLIENT;
		
		log_error('Uknown render mode', mode);		
		return mode_BOTH;
	};
	compo_getModelRenderMode = function(compo){
		if (compo == null) 
			return mode_BOTH;
		
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo
			;
		var mode = proto.meta && proto.meta.modeModel;
		if (mode == null || mode === mode_BOTH) 
			return mode_BOTH;
		
		if (typeof mode === 'number') {
			throw Error('Not implemented: Mode as number');
		}
		
		if (mode === mode_SERVER || mode === mode_SERVER_ALL) 
			return mode_SERVER;
		
		log_error('Uknown render mode for a model', mode);		
		return mode_BOTH;
	};
	compo_wrapOnTagName = function(compo, node){
		if (compo.tagName == null
			|| compo.tagName === node.tagName
			|| compo.tagName === compo.compoName)
				return;
		
		compo.nodes = {
			tagName: compo.tagName,
			attr: compo.attr,
			nodes: compo.nodes,
			type: 1
		};
	};
	
	compo_getMetaVal = function(compo, prop){
		var x = getMetaVal(compo, prop) || MetaDefault[prop];
		if (x == null) {
			log_error('Uknown meta property', prop);
		}
		return x;
	};
	compo_setMetaVal = function(compo, prop, val) {
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
	
	function getMetaVal(compo, prop) {
		if (compo == null) 
			return;
		
		var proto = typeof compo === 'function'
			? compo.prototype
			: compo
			;
		
		if (proto.meta != null) {
			return proto.meta[prop];
		}
		if (proto.$meta != null) {
			log_warn('@obsolete: `$meta` property is renamed to `meta`');
			return proto.$meta[prop];
		}
		if (proto[prop] != null) {
			log_error('@deprecate next: Component has meta value direct in the prototypes. Use `meta` object property');
			return proto[prop];
		}
		return null;
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
		modeModel: mode_BOTH,
		attributes: null,
		cache: false
	};
}());