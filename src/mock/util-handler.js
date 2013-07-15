var mock_UtilHandler = (function() {
	
	var __counter = 0;

	function Util(type, utilName, value, attrName) {
		this.meta = {
			ID: ++__counter,
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
				
				element = element.nextNode;
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
						.insertBefore(new Util(type, utilName, value, attrName), element);
				}

				if (mode !== 'client') {
					return fn(value, model, cntx, element, controller, attrName, type);
				}


				return '';
			};
		}
	};

}());