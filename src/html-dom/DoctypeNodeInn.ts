import { class_createEx } from '@utils/class';
import { DomB } from './DomB';
import { ElementNodeInn } from './ElementNodeInn';

export const DoctypeNodeInn = class_createEx(ElementNodeInn, {
    nodeType: DomB.DOCTYPE,
    toString: function (buffer) {
        return DEFAULT;
    },
    write: function (stream) {
        stream.write(DEFAULT);
    }
});

var DEFAULT = '<!DOCTYPE html>';
