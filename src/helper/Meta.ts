import { mode_SERVER, mode_SERVER_ALL } from '@mask-node/const';
import { HtmlDom } from '@mask-node/html-dom/exports';
import { MetaParser } from './MetaParser';
import { Serializer } from './MetaSerializer';

const seperator_CODE = 30;
const seperator_CHAR = String.fromCharCode(seperator_CODE);


export const Meta = {
    stringify: function (json, info) {
        switch (info.mode) {
            case mode_SERVER:
            case mode_SERVER_ALL:
                return '';
        }
        var type = info.type,
            isSingle = info.single,
            string = type;

        if (json.ID) {
            string += '#' + json.ID;
        }
        string += seperator_CHAR + ' ';
        string += Serializer.resolve(info).serialize(json);
        if (isSingle) {
            string += '/';
        }
        return new HtmlDom.Comment(string).toString();
    },
    close: function (json, info) {
        if (info.single === true) {
            return '';
        }
        switch (info.mode) {
            case mode_SERVER:
            case mode_SERVER_ALL:
                return '';
        }
        var string = '/' + info.type + (json.ID ? '#' + json.ID : '');
        return new HtmlDom.Comment(string).toString();
    },

    parse: function (str) {
        return MetaParser.parse(str);
    }
};


