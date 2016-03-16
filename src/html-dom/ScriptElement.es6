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
			},
			write (stream) {
				stream.write('<script');
				var attrStr = html_serializeAttributes(this);
				if (attrStr !== '') {
					stream.print(' ' + attrStr);
				}
				stream.print('>');

				var content = is_Function(this.textContent)
					? this.textContent()
					: this.textContent;
				if (content) {
					stream.openBlock();
					stream.write(content);
					stream.closeBlock();
				}

				stream.write('</script>');
			}
		}
	);

}());