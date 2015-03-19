MaskJS for the Node.JS
----
[![Build Status](https://travis-ci.org/atmajs/mask-node.png?branch=master)](https://travis-ci.org/atmajs/mask-node)

[MaskJS](https://github.com/atmajs/MaskJS)


#### Features overview

- NodeJS HTML Renderer: mask templates, components, custom attributes, etc.
- renders **meta information** for the custom tags, attributes and utils, so that all components are proper initialized on the client
- serialize and deserialize models
- components **render mode** - `server` / `client` or `both` (_default_).
- Caching: components could be cached after first render.

#### Benefits
- hide sensitive application parts in server-side-only components
- front-end application startup performance - client gets plain html.
- SEO: Bots can crawl the application 

Short overview, how it works:

_Some template_
```sass
h4 > '~[username]'
:profile {
	input type=text value='~[age]';
	button x-signal='click: sendAge' > 'Send'
}
```

_Server-side rendering_
```javascript
var html = mask.render(template, { username: 'John', age: 27 });
```

_Client output_
```html
<!--m model: {username: 'John', age: 27}-->
	<h4>John</h4>
	<!--c#1 compoName::profile -->
		<input type='text' value='27' x-compo-id='1' />;
		<!--a attrName:x-signal attrValue:click: sendAge-->
		<button x-compo-id='1'>Send</button>
	<!--/c#1-->
<!--/m-->
```

Some additional work should be accomplished to initialize `:profile` component:
- include sources:
	- include the component's javascript source (_from example `:profile`_)
	- include `mask.js` and `mask.bootstrap.js`
- run ```mask.Compo.bootstrap()```
- That's all, now the component is fully functional, as if it was rendered on the client.

### Examples

- [define](examples/define/index.mask)
- [import](examples/import/index.mask)

> And only 2 commands to view them im browser:

```bash
$ npm install
$ npm examples

# navigate to: http://localhost:5771/index
```

### Build
```bash
git submodule update --recursive
npm install
npm build
```

### Run all tests
```
npm install
npm test
```
----

 :copyright: ` MIT; 2014-2015; The Atma.js Project `
