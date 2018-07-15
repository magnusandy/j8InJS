"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var stream_1 = require("../stream");
var collectors_1 = require("../collectors");
describe('Stream tests', function () {
    it('collect(collector: Collector<T, R, R) should collect when given Collector.toList()', function () {
        var sourceArr = [1, 2, 3];
        var source = stream_1.stream(sourceArr);
        var collected = source.collect(collectors_1.default.toList());
        chai_1.expect(collected.length).to.equal(sourceArr.length);
        chai_1.expect(collected[0]).to.equal(sourceArr[0]);
        chai_1.expect(collected[1]).to.equal(sourceArr[1]);
        chai_1.expect(collected[2]).to.equal(sourceArr[2]);
    });
    it('defaultCollect should collect when given attributes to collect to a list', function () {
        var sourceArr = [1, 2, 3];
        var source = stream_1.stream(sourceArr);
        var combiner = function (l1, l2) {
            l2.forEach(function (i) { return l1.push(i); });
        };
        var collected = source.defaultCollect(function () { return []; }, function (list, item) { return list.push(item); }, combiner);
        chai_1.expect(collected.length).to.equal(sourceArr.length);
        chai_1.expect(collected[0]).to.equal(sourceArr[0]);
        chai_1.expect(collected[1]).to.equal(sourceArr[1]);
        chai_1.expect(collected[2]).to.equal(sourceArr[2]);
    });
    it('map should transform all values if a terminal operaion is called', function () {
        var newValue = 'a';
        var source = stream_1.stream([1, 2, 3]);
        var stringStream = source.map(function (n) { return newValue; });
        var result = stringStream.collect(collectors_1.default.toList());
        chai_1.expect(result.length).to.equal(3);
        chai_1.expect(result[0]).to.equal(newValue);
        chai_1.expect(result[1]).to.equal(newValue);
        chai_1.expect(result[2]).to.equal(newValue);
    });
    it('map should lazily apply operations when terminal is called', function () {
        var activated = false;
        var source = stream_1.stream([1, 2, 3]);
        var stringStream = source.map(function (n) { activated = true; return 'a'; });
        chai_1.expect(activated).to.equal(false);
        var result = stringStream.collect(collectors_1.default.toList());
        chai_1.expect(activated).to.equal(true);
    });
    it('forEach should apply a consumer to each element', function () {
        var count = 0;
        var source = stream_1.stream([1, 1, 1]);
        source.forEach(function (i) { return count = count + i; });
        chai_1.expect(count).to.equal(3);
    });
    it('allMatch should return true if stream is empty', function () {
        var source = stream_1.stream([]);
        var allMatched = source.allMatch(function (i) { return false; });
        chai_1.expect(allMatched).to.equal(true);
    });
    it('allMatch should return true all items in the stream return true predicate', function () {
        var source = stream_1.stream([1, 2, 3]);
        var allMatched = source.allMatch(function (i) { return i < 10; });
        chai_1.expect(allMatched).to.equal(true);
    });
    it('allMatch should return false not all items in the stream return true predicate', function () {
        var source = stream_1.stream([1, 2, 12]);
        var allMatched = source.allMatch(function (i) { return i < 10; });
        chai_1.expect(allMatched).to.equal(false);
    });
    it('allMatch should lazily apply predicates, applying only until false is found', function () {
        var count = 0;
        var source = stream_1.stream([1, 12, 2]);
        source.allMatch(function (i) { count++; return i < 10; });
        chai_1.expect(count).to.equal(2);
    });
    it('anyMatch should return false if stream is empty', function () {
        var source = stream_1.stream([]);
        var anyMatched = source.anyMatch(function (i) { return false; });
        chai_1.expect(anyMatched).to.equal(false);
    });
    it('anyMatch should return true any 1 item in the stream return true predicate', function () {
        var source = stream_1.stream([12, 13, 3]);
        var anyMatch = source.anyMatch(function (i) { return i < 10; });
        chai_1.expect(anyMatch).to.equal(true);
    });
    it('anyMatch should return false if no items return true predicate', function () {
        var source = stream_1.stream([1, 2, 3]);
        var anyMatched = source.anyMatch(function (i) { return i > 10; });
        chai_1.expect(anyMatched).to.equal(false);
    });
    it('anyMatch should lazily apply predicates, applying only until true is found', function () {
        var count = 0;
        var source = stream_1.stream([1, 12, 2]);
        source.anyMatch(function (i) { count++; return i > 10; });
        chai_1.expect(count).to.equal(2);
    });
});
