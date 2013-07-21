


include.exports = {
	process: function(source, resource, callback) {
	
		var filename = resource.path_getFile(),
			dir = resource.path_getDir(),
	
			less = require('less'),
			parser = new less.Parser({
				filename: filename,
				paths: [dir]
			});
			
		
		
		parser.parse(source, function(error, tree) {
			var response;
			
			if (error) {
				console.error(filename, error);
				return;
			} else {
			
				try {
					response = tree.toCSS();
				} catch (error) {
					console.error(filename, error);
				}
			}
			
			
			callback(response);
		});
		
	}

}