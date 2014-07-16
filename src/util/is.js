var is_Function,
	is_Object,
	is_Array
	;
(function(){
	
	is_Function = function(x) {
		return typeof x === 'function';
	};
	
	is_Object = function(x) {
		return x != null &&  typeof x === 'object';
	};
	
	is_Array = function(x) {
		return x != null
			&& typeof x.length === 'number'
			&& typeof x.slice === 'function';
	};
	
}());