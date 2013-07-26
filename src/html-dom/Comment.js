function html_Comment(textContent) {
	this.textContent = textContent || '';
	
	if (this.textContent) {
		this.textContent = this.textContent
			.replace('<!--', '')
			.replace('-->', '');
	}
	
}

html_Comment.prototype = {
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