import { class_create } from '@utils/class';
import { DomB } from './DomB';
import { Meta } from '@mask-node/helper/Meta';

export const UtilNodeInn = class_create({
    meta: null,
    nodeType: DomB.UTILNODE,
    nextSibling: null,
    firstChild: null,
    constructor: function (type, name, value, attrName) {
        this.meta = {
            utilType: type,
            utilName: name,
            value: value,
            attrName: attrName,
            current: null
        };
    },
    appendChild: function (el) {
        this.firstChild = el;
    },
    toString: function () {
        var json = this.meta,
            info = {
                type: 'u',
                single: this.firstChild == null
            },
            string = Meta.stringify(json, info);

        if (this.firstChild == null)
            return string;


        return string
            + this.firstChild.toString()
            + Meta.close(json, info)
            ;
    }
});