function is_Function(x) {
	return typeof x === 'function';
}

function is_Object(x) {
	return x != null &&  typeof x === 'object';
}

function is_Array(x) {
	return x != null
		&& typeof x.length === 'number'
		&& typeof x.slice === 'function';
}