(function(){

	HtmlDom.DOCTYPE = class_createEx(HtmlDom.Element, {
		nodeType: Dom.DOCTYPE,
		toString: function(buffer){
			return DEFAULT;
		},
		write: function (stream) {
			stream.write(DEFAULT);
		}
	});

	var DEFAULT = '<!DOCTYPE html>';
}());