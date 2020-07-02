import { Meta } from '@mask-node/helper/Meta';

class Attr {
    meta;

    constructor(attrName, attrValue, ID) {
        this.meta = {
            ID: ID,
            name: attrName,
            value: attrValue
        };
    }

    toString() {
        var json = this.meta,
            info = {
                type: 'a',
                single: true
            };

        return Meta.stringify(json, info);
    }
};

export const mock_AttrHandler = {
    create: function (attrName, fn, mode) {

        return function (node, value, model, cntx, tag, controller, container) {

            if (mode !== 'server') {
                container.insertBefore(new Attr(attrName, value, ++cntx._id), tag);
            }

            if (mode !== 'client') {
                return fn(node, value, model, cntx, tag, controller);
            }


            return '';
        };
    }
};
