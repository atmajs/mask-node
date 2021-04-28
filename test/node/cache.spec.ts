UTest({
    'cache (meta object)'() {

        mask.registerHandler(':test', mask.Compo({
            meta: {
                cache: true,
                mode: 'server',
            },
            template: "h4 > 'Hello'",
            onRenderStart: assert.avoid(
                '`:test` should be rendered once'
                , 1
                , function () { }
            )
        }));
        var html = mask.render(':test');
        eq_(html, mask.render(':test'));
        eq_(html, mask.render(':test'));

        has_(html, '<h4>Hello</h4>');
    },

    '!cache by property (root object)'() {
        let renderCount = 0;

        mask.registerHandler(':foo', mask.Compo({
            cache: {
                byProperty: 'ctx.page'
            },
            mode: 'server',
            template: "h4 > 'Hello'",
            onRenderStart: () => ++renderCount
        }));

        debugger;
        mask.render(':foo', null, { page: 'baz' });
        eq_(renderCount, 1);

        mask.render(':foo', null, { page: 'baz' });
        eq_(renderCount, 1);
        return;

        mask.render(':foo', null, { page: 'qux' });
        eq_(renderCount, 2);

        mask.render(':foo', null, { page: 'qux' });
        eq_(renderCount, 2);

        mask.render(':foo');
        eq_(renderCount, 3);

        has_(mask.render(':foo'), '<h4>Hello</h4>');
    }
})
