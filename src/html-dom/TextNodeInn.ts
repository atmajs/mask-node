import { class_create } from '@utils/class';
import { DomB } from './DomB';

export const TextNodeInn = class_create({
    nodeType: DomB.TEXTNODE,
    nextSibling: null,
    textContent: '',
    constructor: function TextNode(text) {
        this.textContent = String(text == null ? '' : text);
    },
    toString: function () {
        return escape(this.textContent);
    }
});

function escape(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        ;
}