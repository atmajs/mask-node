var Stream;

(function(){

	Stream = class_create({
		string: '',
		indent: 0,
		indentStr: '',
		minify: false,
		opts: null,
		ast : null,
		constructor: function(ast, opts) {
			this.opts = opts;
			this.ast  = ast;
			this.minify = opts.minify;
			this.indentStr = doindent(opts.indent, opts.indentChar);
		},
		toString: function(){
			return this.string;
		},
		process: function(mix){
			if (mix.type === Dom.FRAGMENT) {
				mix = mix.nodes;
			}
			if (is_ArrayLike(mix)) {
				var imax = mix.length,
					i = -1;
				while ( ++i < imax ){
					if (i !== 0) {
						this.newline();
					}
					this.processNode(mix[i]);
				}
				return;
			}
			this.processNode(mix);
		},
		processNode: function(node) {
			var stream = this;
			if (is_Function(node.stringify)) {
				var str = node.stringify(stream);
				if (str != null) {
					stream.write(str);
				}
				return;
			}
			if (is_String(node.content)) {
				stream.write(wrapString(node.content));
				return;
			}
			if (is_Function(node.content)){
				stream.write(wrapString(node.content()));
				return;
			}
			if (node.type === Dom.FRAGMENT) {
				this.process(node);
				return;
			}

			this.processHead(node);

			if (isEmpty(node)) {
				stream.print(';');
				return;
			}
			if (isSingle(node)) {
				stream.openBlock('>');
				stream.processNode(getSingle(node));
				stream.closeBlock(null);
				return;
			}

			stream.openBlock('{');
			stream.process(node.nodes);
			stream.closeBlock('}');
		},
		processHead: function(node) {
			var stream = this,
				str = '',
				id, cls, expr
				;

			var attr = node.attr;
			if (attr != null) {
				id  = getString(attr['id']);
				cls = getString(attr['class']);
				if (id != null && id.indexOf(' ') !== -1) {
					id = null;
				}
				if (id != null) {
					str += '#' + id;
				}
				if (cls != null) {
					str += format_Classes(cls);
				}

				for(var key in attr) {
					if (key === 'id' && id != null) {
						continue;
					}
					if (key === 'class' && cls != null) {
						continue;
					}
					var val = attr[key];
					if (val == null) {
						continue;
					}

					str += ' ' + key;
					if (val === key) {
						continue;
					}

					if (is_Function(val)) {
						val = val();
					}
					if (is_String(val)) {
						if (stream.minify === false || /[^\w_$\-\.]/.test(val)){
							val = wrapString(val);
						}
					}

					str += '=' + val;
				}
			}

			if (isTagNameOptional(node, id, cls) === false) {
				str = node.tagName + str;
			}

			var expr = node.expression;
			if (expr != null) {
				if (typeof expr === 'function') {
					expr = expr();
				}
				if (stream.minify === false) {
					str += ' ';
				}
				str += '(' + expr + ')';
			}

			if (this.minify === false) {
				str = doindent(this.indent, this.indentStr) + str;
			}
			stream.print(str);
		},

		newline: function(){
			if (this.minify === false) {
				this.string += '\n';
			}
		},
		openBlock: function(c){
			this.indent++;
			if (this.minify === false) {
				this.string += ' ' + c + '\n';
				return;
			}
			this.string += c;
		},
		closeBlock: function(c){
			this.indent--;
			if (c != null) {
				this.newline();
				this.write(c);
			}
		},
		write: function(str){
			if (str == null) {
				return;
			}
			if (this.minify === true) {
				this.string += str;
				return;
			}
			var prfx = doindent(this.indent, this.indentStr);
			this.string += str.replace(/^/gm, prfx);
		},
		print: function(str){
			this.string += str;
		}
	});

	function doindent(count, c) {
		var output = '';
		while (count--) {
			output += c;
		}
		return output;
	}
});
