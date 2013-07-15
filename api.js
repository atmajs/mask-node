div
	x-signal='click: clicked'
	style='height:~[height]px; width: ~[bind:width]px'
		> '~[L:username]: ~[bind: name]'


<!--a x-signal='click: clicked' /-->
<!--u :bind ({value: 'width', type: 'attr', attrName: 'style'}) /-->
<div style='height:10px; width:10px;'>

	Username:
	<!--u :bind ({value: 'name', type: 'node'}) /-->
		Alex
	<!--/:bind-->
</div>


// (2) L:username set for client only

div > 'Hello ~[L:username] - bob'
<div>
	'Hello '
	<!--u L ({value:'username'}) /-->
	' - bob'
</div>



input type=text >
	:dualbind value='name';

<!--c :dualbind ({attr: {name: "value"}, model: '24'}) /-->
<input type="text" value="Alex"/>


div > % use='user' > '~[username]'

<div>

<!--c-ID % ModeID({attr: {use: 'user'}}) -->
	'Alex'
<!--/c-ID %-->

</div>










### Utils

mask.registerUtil('L', {
	mode: 'server',
	process: function(X){
		return X;
	}
});


mask.registerUtil = function(key, util){
	if (typeof util === 'function') {
		util = {
			process: util
		};
	}
	
	CustomUtil[key] = util;
};
