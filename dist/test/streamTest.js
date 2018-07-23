"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("../stream");
var collectors_1 = require("../collectors");
describe('Stream tests', function () {
    describe('forEach tests', function () {
        it('it should consume all values', function () {
            var stream = stream_1.Stream.of(['a,b,c', 'e,f,g']).flatMapList(function (i) { return i.split(','); }).map(function (s) { return "1: " + s; });
            var consumer = function (s) { return console.log(s); };
            stream.forEach(consumer);
        });
        it('it should consume all values', function () {
            var stream = stream_1.Stream.of(['a,b,c', 'e,f,g']).flatMapList(function (i) { return i.split(','); });
            var consumer = function (s) { return console.log(s); };
            console.log(stream.collect(collectors_1.default.toList()));
        });
        it('it should filterValues', function () {
            var stream = stream_1.Stream.of([4, 4, 5, 1, 2, 3, 4, 4, 5, 1])
                .distinctPredicate(function (i1, i2) { return i1 === i2; })
                .map(function (e) { return "1"; })
                .distinctPredicate(function (s1, s2) { return s1 === s2; });
            console.log(stream.collect(collectors_1.default.toList()));
        });
    });
});
