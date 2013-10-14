function arr_isArray(array){
	return array != null
		&& typeof array.length === 'number'
		&& typeof array.splice === 'function';
}