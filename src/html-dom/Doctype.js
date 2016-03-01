(function(){

	HtmlDom.DOCTYPE = class_createEx(HtmlDom.Element, {
		nodeType: Dom.DOCTYPE,
		toString: function(buffer){
			return DEFAULT;
		}
	});

	var DEFAULT = '<!DOCTYPE html>';
}());