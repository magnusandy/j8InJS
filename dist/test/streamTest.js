"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var functions_1 = require("../functions");
var stream_1 = require("../stream");
var collectors_1 = require("../collectors");
var optional_1 = require("../optional");
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
            var stream = stream_1.Stream.empty();
            var result = stream.collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(0);
        });
    });
    describe('Stream.concat', function () {
        it('it concatenate two streams with values', function () {
            var s1 = stream_1.Stream.ofValues(1, 2, 3);
            var s2 = stream_1.Stream.ofValues(4, 5, 6);
            var concat = stream_1.Stream.concat(s1, s2);
            var result = concat.toArray();
            chai_1.expect(result.length).to.equal(6);
            chai_1.expect(result[0]).to.equal(1);
            chai_1.expect(result[5]).to.equal(6);
        });
        it('it concatenate first stream empty', function () {
            var s1 = stream_1.Stream.empty();
            var s2 = stream_1.Stream.ofValues(4, 5, 6);
            var concat = stream_1.Stream.concat(s1, s2);
            var result = concat.toArray();
            chai_1.expect(result.length).to.equal(3);
            chai_1.expect(result[0]).to.equal(4);
            chai_1.expect(result[2]).to.equal(6);
        });
        it('it concatenate second stream empty', function () {
            var s1 = stream_1.Stream.ofValues(1, 2, 3);
            var s2 = stream_1.Stream.empty();
            var concat = stream_1.Stream.concat(s1, s2);
            var result = concat.toArray();
            chai_1.expect(result.length).to.equal(3);
            chai_1.expect(result[0]).to.equal(1);
            chai_1.expect(result[2]).to.equal(3);
        });
        it('it concatenate two complex streams', function () {
            var s1 = stream_1.Stream.ofValues('1', '2', '3').map(function (i) { return parseInt(i); }).distinct();
            var s2 = stream_1.Stream.ofValues(4, 5, 6, 10, 20, 50).distinct().filter(function (i) { return i < 10; });
            var concat = stream_1.Stream.concat(s1, s2);
            var result = concat.toArray();
            chai_1.expect(result.length).to.equal(6);
            chai_1.expect(result[0]).to.equal(1);
            chai_1.expect(result[5]).to.equal(6);
        });
        it('it concatenate two complex streams with infinite', function () {
            var s1 = stream_1.Stream.generate(function () { return 1; }).limit(3);
            var s2 = stream_1.Stream.ofValues(4, 5, 6, 10, 20, 50).distinct().filter(function (i) { return i < 10; });
            var concat = stream_1.Stream.concat(s1, s2);
            var result = concat.toArray();
            chai_1.expect(result.length).to.equal(6);
            chai_1.expect(result[0]).to.equal(1);
            chai_1.expect(result[5]).to.equal(6);
        });
        it('it should handle empty stream', function () {
            var stream = stream_1.Stream.empty();
            var result = stream.collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(0);
        });
    });
    describe('forEach', function () {
        it('it should run consumer on all elements', function () {
            var sum = 0;
            var source = [1, 1, 1, 1, 1];
            var stream = stream_1.Stream.of(source);
            stream.forEachOrdered(function (i) { return sum = sum + i; });
            chai_1.expect(sum).to.equal(5);
        });
        it('it should not run consumer if stream is empty', function () {
            var consumerRan = false;
            var stream = stream_1.Stream.empty();
            stream.forEachOrdered(function (i) { return consumerRan = true; });
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
        it('it should work if preceeded by short circuiting op', function () {
            var source = ['abc', '123'];
            var expected = ['a', 'b'];
            var stream = stream_1.Stream.of(source);
            var result = stream.flatMapList(function (word) { return word.split(''); })
                .limit(2)
                .distinct()
                .collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(2);
            expected.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it should work if followed by short circuiting op', function () {
            var source = ['abc', '123'];
            var expected = ['a', 'b'];
            var stream = stream_1.Stream.of(source);
            var result = stream.flatMapList(function (word) { return word.split(''); })
                .distinct()
                .limit(2)
                .collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(2);
            expected.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it greedily consume elements even if terminal is short circuiting', function () {
            //todo 
        });
    });
    describe('filter tests', function () {
        it('it keeps matching values in the stream', function () {
            var source = [1, 2, 3, 11, 12, 13];
            var expectedValues = [1, 2, 3];
            var stream = stream_1.Stream.of(source);
            var result = stream.filter(function (i) { return i < 10; })
                .collect(collectors_1.default.toList());
            chai_1.expect(result.length).to.equal(3);
            expectedValues.forEach(function (item) { return chai_1.expect(result).to.contain(item); });
        });
        it('it should lazily filter only when terminal is called', function () {
            var count = 0;
            var source = [1, 2, 3, 11, 12, 13];
            var stream = stream_1.Stream.of(source);
            stream = stream.filter(function (i) { count++; return i < 10; });
            chai_1.expect(count).to.equal(0);
            stream.collect(collectors_1.default.toList());
            chai_1.expect(count).to.equal(6);
        });
        it('it should lazily filter only as necessary for short circuiting terminal', function () {
            //todo
        });
    });
    describe('forEach tests', function () {
        it('it should consume all values', function () {
        });
    });
    describe('forEach tests', function () {
        it('it should consume all values', function () {
            var stream = stream_1.Stream.ofValues(optional_1.Optional.of(1), optional_1.Optional.of(2));
            var result = stream.peek(functions_1.Consumer.logger()).flatMapOptional(functions_1.Transformer.identity()).collect(collectors_1.default.toList());
            console.log(result);
        });
        it('it should consume all values', function () {
            var stream = stream_1.Stream.of(['a,b,c', 'e,f,g']).flatMap(function (i) { return stream_1.Stream.of(i.split(',')); });
            var consumer = function (s) { return console.log(s); };
            console.log(stream.collect(collectors_1.default.toList()));
        });
        it('it should filterValues', function () {
            var stream = stream_1.Stream.of([4, 4, 5, 1, 2, 3, 4, 4, 5, 1])
                .distinct(function (i1, i2) { return i1 === i2; })
                .map(function (e) { return "1"; })
                .distinct(function (s1, s2) { return s1 === s2; });
            console.log(stream.collect(collectors_1.default.toList()));
        });
    });
});
