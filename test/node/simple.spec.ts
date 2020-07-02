declare var MaskNode;

UTest({
    'same lib' () {
        eq_(mask, MaskNode);
    },
    'template' () {
        var template = `
            ul {
                li > '1'
                li > '2'
            }
            section name='Foo' > "foo"
        `;
        var html = mask.render(template);

        has_(html, '<li>1</li>');
        has_(html, '<li>2</li>');
        has_(html, '<section name="Foo">foo</section>');
    },
    'doctype' () {
        var template = '<!DOCTYPE html>';
        debugger;
        var html = mask.render(template);
        eq_(html, template + '<html><body></body></html>');
    },
    'document': {
        'with simple html nodes' () {
            var template = `
                <!DOCTYPE html><div>Foo</div>
            `
            var html = mask.render(template);
            eq_(html, '<!DOCTYPE html><html><body><div>Foo</div></body></html>');
        },
        'with simple mask nodes' () {
            var template = `
                <!DOCTYPE html> h4 > 'Baz'
            `
            var html = mask.render(template);
            eq_(html, '<!DOCTYPE html><html><body><h4>Baz</h4></body></html>');
        },
        'with head but no body' () {
            var template = `
                <!DOCTYPE html><head><meta name='baz' /></head><div>Foo</div>
            `
            var html = mask.render(template);
            eq_(html, '<!DOCTYPE html><html><head><meta name="baz"/></head><body><div>Foo</div></body></html>');
        }
    }
})
