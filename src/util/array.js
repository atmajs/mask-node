function arr_isArray(array){
	return array
		&& typeof array.length === 'number'
		&& typeof array.splice === 'function';
}