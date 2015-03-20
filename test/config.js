module.exports = {
	suites: {
		
		dom: {
			env: [
				'node_modules/maskjs/lib/mask.js',
				'test/dom/utils.es6'
			],
			$config: {
				$before: function(done){
					UTest.configurate({
						'http.eval': function(done){
							include
								.js('/lib/mask.node.js::Mask')
								.done(function(resp){
									global.mask = resp.Mask;
									done();
								})
						}
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
					include
						.js('/lib/mask.node.js::Mask')
						.done(function(resp){
							global.mask = resp.Mask;
							done();
						});
				}
			},
			tests: 'test/node/**.test'
		},
		examples: {
			exec: 'dom',
			tests: 'test/examples/**.test'
		}
	}
}