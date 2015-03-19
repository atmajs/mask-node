/**
 *	Build
 *
 *	$ git submodule update --recursive
 *	$ npm install
 *	$ npm build
 **/

/**
 *	mask
 *
 *	```/lib/mask.js```
 *	Mask with DOM Based Builder
 **/


/**
 *	mask.node
 *
 *	```/lib/mask.node.js```
 *	Mask with HTML Builder
 **/

/**
 *	plugin.reload
 *
 *	```/lib/plugin.reload.js```
 *	Reload plugin to use in includejs environment.
 *	Each component will be reinitialized on file-change
 **/

/**
 *	formatter
 *
 *	```/lib/formatter.js```
 *	[[Formatter]] for Mask to
 *
 * + convert HTML to Mask
 * + stringify [[MaskDOM]]
 * + beautify Mask Markup
 **/



module.exports = {
	
	'import': {
		files: 'builds/**',
		output: 'lib/'
	},
	'jshint': {
		files: ['lib/mask.node.js'],
		jshint: JSHint()
	},
	'uglify': {
		files: 'lib/mask.node.js'
	},


	'import.libs': {
		action: 'copy',
		files: {
			'../mask/lib/mask.js': 'node_modules/maskjs/lib/mask.js',
			'../include/lib/include.js': 'node_modules/includejs/lib/include.js'
		}
	},

	'watch': {
		files: 'src/**',
		config: '#[import]'
	},

	'defaults': ['import', 'jshint']
};



function JSHint() {
	
	var options = {
			"bitwise": false,
			"camelcase": false,
			"curly": false,
			"eqeqeq": true,
			"es3": false,
			"forin": false,
			"freeze": false,
			"immed": true,
			"indent": 2,
			"latedef": "nofunc",
			"newcap": false,
			"noarg": true,
			"noempty": true,
			"nonbsp": true,
			"nonew": false,
			"plusplus": false,
			"quotmark": false,
			"undef": true,
			"unused": false,
			"strict": false,
			"trailing": false,
			"maxparams": false,
			"maxdepth": false,
			"maxstatements": false,
			"maxcomplexity": false,
			"maxlen": false,
			"asi": true,
			"boss": true,
			"debug": true,
			"eqnull": true,
			"esnext": true,
			"evil": true,
			"expr": true,
			"funcscope": false,
			"gcl": false,
			"globalstrict": true,
			"iterator": false,
			"lastsemic": true,
			"laxbreak": true,
			"laxcomma": true,
			"loopfunc": false,
			"maxerr": false,
			"moz": false,
			"multistr": true,
			"notypeof": false,
			"proto": true,
			"scripturl": false,
			"smarttabs": true,
			"shadow": true,
			"sub": true,
			"supernew": true,
			"validthis": true,
			"noyield": false,
			"browser": true,
			"couch": false,
			"devel": false,
			"dojo": false,
			"jquery": true,
			"mootools": false,
			"node": true,
			"nonstandard": false,
			"phantom": false,
			"prototypejs": false,
			"rhino": false,
			"worker": false,
			"wsh": false,
			"yui": false,
			"nomen": false,
			"onevar": false,
			"passfail": false,
			"white": false,
			"predef": [
				/* utils */
				"is_Object",
				"is_rawObject",
				"is_String",
				"is_Function",
				"is_Array",
				"fn_doNothing",
				"fn_proxy",
				"fn_apply",
				"obj_create",
				"obj_extend",
				
				"_Array_slice",
				"_Array_splice",
				"_Array_indexOf",
				
				"global",
				"define",
				"atma",
				"io",
				"net",
				"mask",
				"include",
				"ruta",
				"ruqq",
				"Class",
				"logger",
				"app",
				"UTest",
				"assert",
				"eq_",
				"notEq_",
				"deepEq_",
				"notDeepEq_",
				"has_",
				"hasNot_"
			]
		}
	return {
		options: options,
		globals: options.predef
	};
}

