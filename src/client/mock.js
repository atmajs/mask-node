function mock_appendChild(container) {
	
	return function(element){
		
		return container.appendChild(element);
	};
}