import { mode_CLIENT } from '@mask-node/const';


class EmptyHandler {
    meta = {
        mode: mode_CLIENT
    };
    constructor(attrName, attrValue) { }
    render() { }
};

export const mock_TagHandler = {
    create: function (tagName, Compo, mode) {
        if (mode === mode_CLIENT) {
            return EmptyHandler;
        }
        var Proto = Compo.prototype;
        if (Proto.mode === mode_CLIENT) {
            /* obsolete, use meta object*/
            return EmptyHandler;
        }

        var meta = Compo.prototype.meta;
        if (meta == null) {
            meta = Compo.prototype.meta = {};
        }
        if (meta.mode === mode_CLIENT) {
            return EmptyHandler;
        }

        meta.mode = mode;
        return Compo;
    },


};
