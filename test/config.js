module.exports = {
	suites: {
		
		dom: {
			env: [
				'ref-mask/lib/mask.js',
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
				'test/node/utils.js::Utils'
			],
			$config: {
				$before: function(done){
					process.on("unhandledRejection", function(reason, p){
					    console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
					    throw reason; // optional, in case you want to treat these as errors
					}); 

					process.on("unhandledException", function(reason, p){
					    console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
					    throw reason; // optional, in case you want to treat these as errors
					}); 
	
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