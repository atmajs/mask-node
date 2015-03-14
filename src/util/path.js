var path_toLocalFile;
(function(){
	
	path_toLocalFile = function(path){
		path = path_normalize(path);
		if (path_isRelative(path)) {
			path = '/' + path;
		}
		if (path.charCodeAt(0) === 47 /*/*/) {
			return path_combine(cwd(), path);
		}
		if (path.indexOf('file://') === 0) {
			path = path.replace('file://', '');
		}
		if (/^\/\w+:\//.test(path)) {
			path = path.substring(1);
		}
		return path;
	};
	
	function cwd() {
		return path_normalize(process.cwd());
	}
}());