
console.log('registerHandler');
mask.registerHandler(':user', mask.Compo({
	template: '<span>Wow</span>',
	
	tagName: 'div',
	attr: {
		'class' : '-user'
	}
}));