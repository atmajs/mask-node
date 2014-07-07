module.exports = {
	suites: {
		
		dom: {
			env: [
				'test/dom/utils.js'
			],
			$config: {
				$before: function(done){
					UTest.configurate({
						'http.eval': function(done){
							include
								.instance(process.cwd() + '/')
								.js('/lib/mask.node.js::Mask')
								.done(function(resp){
									Object.extend(mask, resp.Mask.mask);
									global.mask = mask;
									done();
								})
						},
					}, done)
				}
			},
			tests: 'test/dom/**.test'
		}
	}
}