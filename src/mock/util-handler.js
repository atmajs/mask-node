var mock_UtilHandler = (function() {
	
	

	function Util(type, utilName, value, attrName, ID) {
		this.meta = {
			ID: ID,
			utilType: type,
			utilName: utilName,
			
			value: value,
			attrName: attrName
		};
	}

	Util.prototype = {
		toString: function() {
			var json = this.meta,
				info = {
					type: 'u',
					single: this.firstChild == null
				},
				string = Meta.stringify(json, info);
			
			var element = this.firstChild;
			while (element != null) {
				string += element.toString();
				
				element = element.nextSibling;
			}
			
			if (this.firstChild != null) {
				string += Meta.close(this);
			}
			
			return string;
		}
	};
	
	var util_FNS = {
		node: 'nodeRenderStart',
		attr: 'attrRenderStart'
	};

	return {
		create: function(utilName, mix, mode) {

			return function(value, model, ctx, element, controller, attrName, type) {

				if (mode !== 'server') {
					
					element
						.parentNode
						.insertBefore(new Util(type, utilName, value, attrName, ++ctx._id), element);
					
					if (mode === 'partial') {
						var fn = util_FNS[type];
						
						if (is_Function(mix[fn]))
							return mix[fn](value, model, ctx, element, controller);
					}
					
					
				}

				if (mode !== 'client') {
					return mix(value, model, ctx, element, controller, attrName, type);
				}


				return '';
			};
		}
	};

}());