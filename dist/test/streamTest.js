"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var stream_1 = require("../stream");
var collectors_1 = require("../collectors");
describe('Stream tests', function () {
    describe('collect to list tests', function () {
        it('it should put all elements in the stream into the collector', function () {
            var source = [1, 2, 3, 4, 5];
            var stream = stream_1.Stream.of(source);
            var result = stream.collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(5);
            source.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it should handle empty stream', function () {
            var stream = stream_1.Stream.of([]);
            var result = stream.collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(0);
        });
    });
    describe('forEach', function () {
        it('it should run consumer on all elements', function () {
            var sum = 0;
            var source = [1, 1, 1, 1, 1];
            var stream = stream_1.Stream.of(source);
            stream.forEach(function (i) { return sum = sum + i; });
            chai_1.expect(sum).to.equal(5);
        });
        it('it should not run consumer if stream is empty', function () {
            var consumerRan = false;
            var stream = stream_1.Stream.of([]);
            stream.forEach(function (i) { return consumerRan = true; });
            chai_1.expect(consumerRan).to.equal(false);
        });
    });
    describe('distinct', function () {
        it('it return a stream of distinct values', function () {
            var source = [4, 1, 2, 3, 2, 1, 1, 1, 1, 1];
            var expectedValues = [1, 2, 3, 4];
            var stream = stream_1.Stream.of(source);
            var result = stream.distinct().collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(4);
            expectedValues.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it should work as the first intermediate operation', function () {
            var source = [4, 1, 2, 3, 2, 1, 1, 1, 1, 1];
            var expectedValues = ['1', '2', '3', '4'];
            var stream = stream_1.Stream.of(source);
            var result = stream.distinct().map(function (n) { return "" + n; }).collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(4);
            expectedValues.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it should work preceeded by stateless op', function () {
            it('it should work as the first intermediate operation', function () {
                var source = [4, 1, 2, 3, 2, 1, 1, 1, 1, 1];
                var expectedValues = ['1', '2', '3', '4'];
                var stream = stream_1.Stream.of(source);
                var result = stream
                    .map(function (n) { return "" + n; })
                    .distinct()
                    .collect(collectors_1.default.toList());
                chai_1.expect(result.length).to.equal(4);
                expectedValues.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
            });
        });
        it('it should work if multiple calls in one stream', function () {
            var source = ['cat', 'bat', 'cat'];
            var expectedValues = ['c', 'a', 't', 'b'];
            var stream = stream_1.Stream.of(source);
            var result = stream
                .distinct()
                .flatMapList(function (word) { return word.split(''); })
                .distinct()
                .collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(4);
            expectedValues.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it should work in complicated pipeline', function () {
            var source = ['cat', 'bat', 'cat'];
            var expectedValues = ['a'];
            var stream = stream_1.Stream.of(source);
            var result = stream
                .distinct()
                .flatMapList(function (word) { return word.split(''); })
                .distinct()
                .filter(function (i) { return i === 'a'; })
                .collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(1);
            expectedValues.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
    });
    describe('forEach tests', function () {
        it('it should consume all values', function () {
            var stream = stream_1.Stream.generate(function () { return '1'; }).limit(5);
            var result = stream.collect(collectors_1.default.toList());
            console.log(result);
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
