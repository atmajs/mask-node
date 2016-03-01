var trav_getDoc,
	trav_getChild;
(function(){

	// @Obsolete, remove `:document` component for for doctype.
	trav_getDoc = function(el, _deep) {
		if (el != null && el.nodeType === Dom.FRAGMENT)
			el = el.firstChild;

		if (el == null)
			return null;

		if (el instanceof HtmlDom.Component === false)
			return null;

		if (el.compoName === ':document')
			return el;

		if (_deep == null)
			_deep = 0;
		if (_deep === 4)
			return null;

		var doc;
		doc = trav_getDoc(el.nextSibling, _deep);

		if (doc) {
			return doc;
		}
		return trav_getDoc(el.firstChild, ++_deep);
	};


	trav_getChild = function(parent, tagName) {
		var el = parent.firstChild;
		while (el && el.tagName !== tagName) {
			el = el.nextSibling;
		}
		return el;
	};

}());
