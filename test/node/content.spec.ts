declare var MaskNode;

UTest({
    'same lib' () {
        eq_(mask, MaskNode);
    },
    'style' () {
        var template = `
            div {
                style {
                    foo > .name {
                        color: #fff;
                    }
                }
            }
        `;
        var html = mask.render(template);

        console.log(html);
    }
})