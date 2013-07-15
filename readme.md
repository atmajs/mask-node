Mask HTML Builder
----

Build HTML from a mask template. It will also create all needed meta information for custom tags, attributes and utils,
so that all components are proper initialized on the client. It will also embed all models. It is also possible to define render mode
for all custom stuff - "server" / "client" (empty means "both"). Now also SEO Bots can crawl the application,
and users with disabled javascript will see the content.

To get the idea:

```css
h4 > '~[username]'
:profile {
	input type=text value='~[age]';
	button x-signal='click: sendAge' > 'Send'
}
```

Render this template on server-side:
```javascript
var html = mask.render(template, { username: 'John', age: 27 });
```

Output:

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

Now to initialize all components and its signals / methods etc. use ```mask.Compo.bootstrap()``` on the frontend.


