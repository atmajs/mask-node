HtmlDom.DocumentFragment = class_createEx(
	HtmlDom.Node,
	{
		nodeType: Dom.FRAGMENT,
		toString: function(){
			var element = this.firstChild,
				string = '';

			while (element != null) {
				string += element.toString();
				element = element.nextSibling;
			}
			return string;
		},
		write: function(stream){
			var element = this.firstChild;
			while (element != null) {
				if (is_Function(element.write)) {
					element.write(stream);
				} else {
					stream.write(element.toString());
				}
				element = element.nextSibling;
				if (element != null) {
					stream.newline();
				}
			}
			return stream;
		}
	}
);