mask.registerHandler(':clientCompo', mask.Compo({
	meta: {
		mode: 'client'
	},
	template: "#foo > '~[.]'",
	onRenderStart () {
		this.model = 'FooTitle';
	}
}));