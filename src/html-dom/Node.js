(function() {

	HtmlDom.Node = class_create({
		parentNode: null,
		firstChild: null,
		lastChild: null,
		nextSibling: null,

		nodeType: null,

		get length() {
			var count = 0,
				el = this.firstChild;

			while (el != null) {
				count++;
				el = el.nextSibling;
			}
			return count;
		},

		get childNodes() {
			var array = [],
				el = this.firstChild;
			while (el != null) {
				array.push(el);
				el = el.nextSibling;
			}
			return array;
		},

		get ownerDocument () {
			return new OwnerDocument(this);
		},

		querySelector: function(selector) {
			var matcher = typeof selector === 'string'
				? selector_parse(selector)
				: selector
				;
			var el = this.firstChild,
				matched;

			for(; el != null; el = el.nextSibling) {
				if (selector_match(el, matcher))
					return el;
			}

			if (el != null)
				return el;

			el = this.firstChild;
			for (;el != null; el = el.nextSibling) {

				if (typeof el.querySelector === 'function') {
					matched = el.querySelector(matcher);

					if (matched != null)
						return matched;
				}
			}
			return null;
		},

		appendChild: function(child) {

			if (child == null)
				return child;

			if (child.nodeType === Dom.FRAGMENT) {

				var fragment = child;
				if (fragment.firstChild == null)
					return fragment;

				var el = fragment.firstChild;
				while (true) {
					el.parentNode = this;

					if (el.nextSibling == null)
						break;

					el = el.nextSibling;
				}

				if (this.firstChild == null) {
					this.firstChild = fragment.firstChild;
				} else {
					fragment.lastChild.nextSibling = fragment.firstChild;
				}

				fragment.lastChild = fragment.lastChild;
				return fragment;
			}

			if (this.firstChild == null) {
				this.firstChild = this.lastChild = child;
			} else {
				this.lastChild.nextSibling = child;
				this.lastChild = child;
			}
			child.parentNode = this;
			return child;
		},

		insertBefore: function(child, anchor) {
			var prev = this.firstChild;
			if (prev !== anchor) {
				while (prev != null && prev.nextSibling !== anchor) {
					prev = prev.nextSibling;
				}
			}
			if (prev == null)
				// set tail
				return this.appendChild(child);

			if (child.nodeType === Dom.FRAGMENT) {
				var fragment = child;

				// set parentNode
				var el = fragment.firstChild;
				if (el == null)
					// empty
					return fragment;

				while (el != null) {
					el.parentNode = this;
					el = el.nextSibling;
				}

				// set to head
				if (prev === anchor && prev === this.firstChild) {
					this.firstChild = fragment.firstChild;

					fragment.lastChild.nextSibling = prev;
					return fragment;
				}

				// set middle
				prev.nextSibling = fragment.firstChild;
				fragment.lastChild.nextSibling = anchor;
				return fragment;
			}

			child.parentNode = this;

			if (prev === anchor && prev === this.firstChild) {

				// set head
				this.firstChild = child;
				child.nextSibling = prev;

				return child;
			}

			// set middle
			prev.nextSibling = child;
			child.nextSibling = anchor;

			return child;
		},

		removeChild: function (node) {
			if (node == null) {
				return;
			}
			var child = this.firstChild,
				prev = null;
			while (child != null && child !== node) {
				prev = child;
				child = child.nextSibling;
			}
			if (child == null) {
				return;
			}

			if (prev == null) {
				// is first child;
				this.firstChild = child.nextSibling;
			} else {
				prev.nextSibling = child.nextSibling;
			}
			if (this.lastChild === child) {
				this.lastChild = prev;
			}

			node.nextSibling = null;
			node.parentNode = null;
		}
	});


	var OwnerDocument = class_create({
		_el: null,
		_document: null,
		_body: null,
		constructor: function (el) {
			this._el = el;
		},
		get body () {
			if (this._body != null) {
				return this._body;
			}
			var cursor = this._el,
				el;
			while(cursor != null) {
				if (cursor.nodeType === Dom.NODE) {
					el = cursor;
				}
				if (cursor.tagName === 'BODY' || cursor.parentNode == null) {
					return (this._body = el);
				}
				cursor = cursor.parentNode;
			}
			return null;
		}
	});

}());