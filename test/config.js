module.exports = {
	suites: {
		
		dom: {
			env: [
				'.import/mask.js',
				'test/dom/utils.js'
			],
			$config: {
				$before: function(done){
					UTest.configurate({
						'http.include': [ '/test/dom/node.libraries.js' ]
					}, done)
				}
			},
			tests: 'test/dom/**.test'
		},
		node: {
			env: [
				'test/node/utils.es6::Utils'
			],
			$config: {
				$before: function(done){
					var base = io.env.currentDir.toString();
					include
						.instance(base)
						.setBase(base)
						.js('/lib/mask.node.js::Mask')
						.done(function(resp){
							var mask = resp.Mask.mask;
							Object.extend(global.mask.getHandler(), mask.getHandler());
							Object.extend(global.mask, mask);
							done();
						});
				}
			},
			tests: 'test/node/**.test'
		}
	}
}