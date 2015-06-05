(function(){
	
	HtmlDom.ScriptElement = class_createEx(
		HtmlDom.Element,
		{
			textContent: '',
			toString () {
				
				var string = '<script',
					attrStr = html_serializeAttributes(this);
				if (attrStr !== '') {
					string += ' ' + attrStr;
				}
				string += '>';
				
				var content = is_Function(this.textContent)
					? this.textContent()
					: this.textContent;
				if (content) {
					string += content;
				}
				
				
				string += '</script>';
				
				return string;
			}
		}
	);
	
}());