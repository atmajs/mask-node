HtmlDom.Comment =  function (textContent) {
	this.textContent = textContent || '';
	
	if (this.textContent) {
		this.textContent = this.textContent
			.replace('<!--', '')
			.replace('-->', '');
	}
};

HtmlDom.Comment.prototype = {
	nextSibling: null,
	parentNode: null,
	toString: function(){
		if (this.textContent === '') 
			return '';
		
		return '<!--'
			+ this
				.textContent
				.replace(/>/g, '&gt;')
			+ '-->';
	}
};