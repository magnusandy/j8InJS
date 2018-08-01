"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var optional_1 = require("./optional");
//todo test all
exports.Source = {
    iterateSource: function (seed, transformer) { return new IterateSource(seed, transformer); },
    supplierSource: function (supplier) { return new SupplierSource(supplier); },
    arraySource: function (array) { return new ArraySource(array); },
    concatSource: function (stream1, stream2) { return new ConcatSource(stream1, stream2); },
    rangeSource: function (startInclusive, endExclusive, step) { return new RangeSource(startInclusive, endExclusive, step); },
};
/**
 * Infinite source, always has a next value
 */
var InfiniteSource = /** @class */ (function () {
    function InfiniteSource() {
    }
    InfiniteSource.prototype.hasNext = function () {
        return true;
    };
    return InfiniteSource;
}());
/**
 * An infinite source that continually applies a function to a previous result, starting with the seed object
 *
 * seed, transformer(seed), transformer(transformer(seed)), etc
 */
var IterateSource = /** @class */ (function (_super) {
    __extends(IterateSource, _super);
    function IterateSource(seed, transformer) {
        var _this = _super.call(this) || this;
        _this.seed = seed;
        _this.currentValue = optional_1.Optional.empty();
        _this.transformer = transformer;
        return _this;
    }
    IterateSource.prototype.get = function () {
        var nextValue;
        if (this.currentValue.isPresent()) {
            nextValue = this.transformer(this.currentValue.get());
        }
        else {
            nextValue = this.seed;
        }
        this.currentValue = optional_1.Optional.of(nextValue);
        return nextValue;
    };
    return IterateSource;
}(InfiniteSource));
/**
 * basic infinite Source coming from a Supplier function
 */
var SupplierSource = /** @class */ (function (_super) {
    __extends(SupplierSource, _super);
    function SupplierSource(supplier) {
        var _this = _super.call(this) || this;
        _this.supplier = supplier;
        return _this;
    }
    SupplierSource.prototype.get = function () {
        return this.supplier();
    };
    return SupplierSource;
}(InfiniteSource));
/**
 * a source coming from an array, it is not infinite
 */
var ArraySource = /** @class */ (function () {
    function ArraySource(arraySource) {
        this.array = arraySource.slice();
    }
    ArraySource.prototype.get = function () {
        return this.array.shift();
    };
    ArraySource.prototype.hasNext = function () {
        return this.array.length !== 0;
    };
    return ArraySource;
}());
/**
 * source used for concatination of streams
 */
var ConcatSource = /** @class */ (function () {
    function ConcatSource(stream1, stream2) {
        this.stream1Iterator = stream1.streamIterator();
        this.stream2Iterator = stream2.streamIterator();
    }
    ConcatSource.prototype.get = function () {
        var _a = this, stream1Iterator = _a.stream1Iterator, stream2Iterator = _a.stream2Iterator;
        if (stream1Iterator.hasNext()) {
            return stream1Iterator.getNext();
        }
        else {
            return stream2Iterator.getNext();
        }
    };
    ConcatSource.prototype.hasNext = function () {
        return this.stream1Iterator.hasNext() || this.stream2Iterator.hasNext();
    };
    return ConcatSource;
}());
/**
 * creates a source of number  based on the given start and end bounds and the step size
 * a limited source counting until the values get to the end bound.
 */
var RangeSource = /** @class */ (function () {
    function RangeSource(startInclusive, endExclusive, step) {
        var isAscending = startInclusive <= endExclusive;
        this.comparator = isAscending
            ? function (n1, n2) { return n1 < n2; }
            : function (n1, n2) { return n1 > n2; };
        this.step = isAscending
            ? step ? Math.abs(step) : 1
            : step ? (0 - Math.abs(step)) : -1;
        this.startInclusive = startInclusive;
        this.endExclusive = endExclusive;
        this.nextValue = startInclusive;
    }
    RangeSource.prototype.get = function () {
        var next = this.nextValue;
        this.nextValue = next + this.step;
        return next;
    };
    RangeSource.prototype.hasNext = function () {
        return this.comparator(this.nextValue, this.endExclusive);
    };
    return RangeSource;
}());
