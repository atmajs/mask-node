include.js({
	ruqq: ['dom/jquery', 'arr', 'routes'],
	lib: ['mask'],
    compo: 'prism'
})

.ready(function(){

    var domMask = mask;
    var section = document.body.querySelector('section');

    

    include
        .js('/.reference/lib/mask.node.js')
        .done(function(){

            mask.registerHandler(':todoApp', Compo({}), 'client');

            mask.registerHandler(':test', Compo({
                slots: {
                    name: function(){
                        alert('Clicked');
                    }
                }
            }));

            //mask.registerUtility('bind', function(){});

            mask.registerUtility('bind', domMask.getUtility('bind'), '');



            var template = $('#layout').html();

            var model = {
                user: {
                    name: 'Alex'
                }
            };

            section.innerHTML = '';

            var html = mask.render(template, model);

            include
                .js('.reference/libjs/mask/lib/mask.js', '/.reference/lib/mask.bootstrap.js')
                .done(function(){

                    mask.registerHandler(':test', Compo({
                        slots: {
                            name: function(){
                                alert('Clicked');
                            }
                        }
                    }));
                    mask.registerHandler(':todoApp', Compo({}));
                    mask.registerHandler(':user', Compo({
                        tagName: 'span'
                    }))

                    var div = document.createElement('div');
                    div.innerHTML = html;


                    document.body.innerHTML = html;

                    mask.Compo.bootstrap();


                    //var setup = div.querySelector('script').textContent;

                    //eval(setup);


                    html = style_html(html);
                    domMask
                        .jmask('pre')
                        .text(html)
                        .appendTo(document.body);
                })


        })
    
    





});
