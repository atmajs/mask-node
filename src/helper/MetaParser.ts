import { Serializer } from './MetaSerializer';

const seperator_CODE = 30;
const seperator_CHAR = String.fromCharCode(seperator_CODE);


export namespace MetaParser {
    var _i, _imax, _str;
    export function parse (string) {
        _i = 0;
        _str = string;
        _imax = string.length;

        var c = string.charCodeAt(_i),
            isEnd = false,
            isSingle = false;

        if (c === 47 /* / */) {
            isEnd = true;
            c = string.charCodeAt(++_i);
        }
        if (string.charCodeAt(_imax - 1) === 47 /* / */) {
            isSingle = true;
            _imax--;
        }
        var json = {
            ID: null,
            end: isEnd,
            single: isSingle,
            type: string[_i]
        }
        c = string.charCodeAt(++_i);
        if (c === 35 /*#*/) {
            ++_i;
            json.ID = parseInt(consumeNext(), 10);
        }
        var serializer = Serializer.resolve(json),
            propertyParserFn = serializer.deserializeSingleProp,
            propertyDefaultsFn = serializer.defaultProperties,
            index = 0;
        while (_i < _imax) {
            var part = consumeNext();
            propertyParserFn(json, part, index++);
        }
        if (propertyDefaultsFn != null) {
            propertyDefaultsFn(json, index);
        }
        return json;
    };


    var seperator = seperator_CHAR + ' ',
        seperatorLength = seperator.length;
    function consumeNext() {
        var start = _i,
            end = _str.indexOf(seperator, start);
        if (end === -1) {
            end = _imax;
        }
        _i = end + seperatorLength;
        return _str.substring(start, end);
    }
}