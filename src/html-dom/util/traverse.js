
function trav_getDoc(el, _deep) {
	
	if (el == null)
		return null;
	
	if (el instanceof html_Component === false)
		return null;
	
	if (el.instance.compoName === ':document') 
		return el;

	if (_deep == null)
		_deep = 0;
	if (_deep === 4) 
		return null;
	
		

	var doc;
	doc = trav_getDoc(el.nextSibling, _deep);
	
	if (doc)
		return doc;
	
	return trav_getDoc(el.firstChild, ++_deep);
}


function trav_getChild(parent, tagName) {
	var el = parent.firstChild;
	
	while (el && el.tagName !== tagName) {
		el = el.nextSibling;
	}
	
	return el;
}