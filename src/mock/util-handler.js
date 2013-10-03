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
	

	return {
		create: function(utilName, fn, mode) {

			return function(value, model, cntx, element, controller, attrName, type) {

				if (mode !== 'server') {
					element
						.parentNode
						.insertBefore(new Util(type, utilName, value, attrName, ++cntx._id), element);
				}

				if (mode !== 'client') {
					return fn(value, model, cntx, element, controller, attrName, type);
				}


				return '';
			};
		}
	};

}());