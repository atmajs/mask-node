(function() {
	// import jq/classList.js

	HtmlDom.Element = class_createEx(
		HtmlDom.Node,
		{
			nodeType: Dom.NODE,
			constructor: function(name) {
				this.tagName = name.toUpperCase();
				this.attributes = {};
			},
			setAttribute: function(key, value) {
				this.attributes[key] = value;
			},
			getAttribute: function(key) {
				return this.attributes[key];
			},
			get classList () {
				return new ClassList(this);
			},
			toString: function() {
				var tagName = this.tagName.toLowerCase(),
					value, element;

				var string = '<' + tagName,
					attrStr = html_serializeAttributes(this);
				if (attrStr !== '') {
					string += attrStr;
				}

				var isSingleTag = SingleTags[tagName] === 1,
					element = this.firstChild;

				if (element == null) {
					return string + (isSingleTag ? '/>' : '></' + tagName + '>');
				}

				string += isSingleTag ? '/>' : '>';

				if (isSingleTag) {
					string += '<!--~-->'
				}

				while (element != null) {
					string += element.toString();
					element = element.nextSibling;
				}

				if (isSingleTag)
					return string + '<!--/~-->';

				return string + '</' + tagName + '>';
			},

			// generic properties
			get value () {
				return this.attributes.value;
			},
			set value (value) {
				this.attributes.value = value;
			},
			get selected () {
				return this.attributes.selected
			},
			set selected (value) {
				if (!value) {
					delete this.attributes.selected;
					return;
				}
				this.attributes.selected = 'selected';
			},
			get checked () {
				return this.attributes.checked;
			},
			set checked (value) {
				if (!value) {
					delete this.attributes.checked;
					return;
				}
				this.attributes.checked = 'checked';
			},

			get textContent () {
				var child = this.firstChild;
				var txt = '';
				while (child != null) {
					if (child.nodeType === Node.TEXTNODE) {
						txt += child.textContent;
						continue;
					}

					txt += child.textContent || '';
					child = child.nextSibling;
				}
				return txt;
			},

			set textContent (str) {
				node_empty(this);
				this.appendChild(document.createTextNode(str));
			}
		}
	);
}());