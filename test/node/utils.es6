/* { template, ?model, ?models, ?eq:String, ?has:Array, ?hasNot:Array } */
function RunTest(test){
	var tmpl = test.template;
	if (Array.isArray(test.model)) {
		test.model.forEach(test => run(tmpl, test));
	}
	else {
		run(tmpl, test);
	}
	
	function run(tmpl, test) {
		var html = mask.render(tmpl, test.model);
		check(html, test);	
	}
	function check(html, test){
		test.eq
			&& eq_(test.eq, html);
			
		test.has
			&& test.has.forEach(expect => has_(html, expect));
		test.hasNot
			&& test.hasNot.forEach(avoid => hasNot_(html, avoid));
	}	
}

include.exports = {};