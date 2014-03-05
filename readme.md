MaskJS for the Node.JS
----
[![Build Status](https://travis-ci.org/atmajs/mask-node.png?branch=master)](https://travis-ci.org/atmajs/mask-node)

[MaskJS](https://github.com/atmajs/MaskJS)



- render Mask Template, Components and other things on the server
- create all needed **meta information** for custom tags, attributes and utils, so that all components are proper initialized on the client. It will also embed all models. It is also possible to define render mode
- **render modes** for components, attribute handlers and utils for all custom stuff - `server` / `client` or both (`server client`).
- Front-end application performance - it receives rendered or semi-rendered html.
- SEO Bots can crawl the application 

Short overview, how the it works:

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
```markup
<!--m model: {username: 'John', age: 27}-->
	<h4>John</h4>
	<!--c#1 compoName::profile -->
		<input type='text' value='27' x-compo-id='1' />;
		<!--a attrName:x-signal attrValue:clicksendAge-->
		<button x-compo-id='1'>Send</button>
	<!--/c#1-->
<!--/m-->
```

Some additional work should be accomplished to initialize `:profile` component:
- include the component's source
- run ```mask.Compo.bootstrap()```
- That's all, now the component is fully functional, as if it was rendered on the client.


