
include.exports = {
	process: function(source, res) {
		
		var YAML = require('yamljs')

		source = source
			.replace(/\t/g, '  ');
			

		try {
			return YAML.parse(source);
		} catch (error) {
			console.error(error, source);
			return null;
		}
	}
};