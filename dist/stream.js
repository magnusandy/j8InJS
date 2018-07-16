"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var optional_1 = require("./optional");
//Static methods of the stream interface
exports.Stream = {
    /**
     * Creates a new stream from the given source array
     * @param source
     */
    of: function (source) {
        return ArrayStream.of(source);
    },
    /**
     * creates an empty Stream
     */
    empty: function () {
        return ArrayStream.of([]);
    }
};
var compose = function (f, g) { return function (value) { return g(f(value)); }; };
var ArrayStream = /** @class */ (function () {
    function ArrayStream(source, actions) {
        var _this = this;
        this.applyAction = function (item) {
            return _this.actions.length > 0 ? _this.ultimateAction()(item) : item;
        };
        this.ultimateAction = function () { return _this.actions.reduce(compose); };
        this.source = source.slice();
        this.actions = actions;
    }
    //todo flag if actions are applied "exhaust" the stream;
    ArrayStream.prototype.fullyApplyActions = function () {
        if (this.actions.length > 0) {
            var ultimateAction = this.ultimateAction();
            this.source = this.source.map(ultimateAction);
        }
    };
    ArrayStream.prototype.isEmpty = function () {
        return this.source.length === 0;
    };
    ArrayStream.of = function (source) {
        return new ArrayStream(source, []);
    };
    ArrayStream.empty = function () {
        return ArrayStream.of([]);
    };
    /**
     * Terminal Operation - Short Circuting
     * returns true if all items in the stream match the given predicate, if any item returns false, return false;
     * if the stream is empty, return true, the predicate is never evaluated;
     * @param predicate
     */
    ArrayStream.prototype.allMatch = function (predicate) {
        for (var i in this.source) {
            var sourceItem = this.source[i];
            var applied = this.applyAction(sourceItem);
            if (!predicate(applied)) {
                return false;
            }
        }
        return true;
    };
    /**
     * Terminal Operation - Short Circuting
     * returns true if any 1 item in the stream match the given predicate, if any item returns true, return true, else false;
     * @param predicate
     */
    ArrayStream.prototype.anyMatch = function (predicate) {
        for (var i in this.source) {
            var sourceItem = this.source[i];
            var applied = this.applyAction(sourceItem);
            if (predicate(applied)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Terminal Operation
     * returns the count of all the elements of the stream.
     */
    //todo test more with filter
    ArrayStream.prototype.count = function () {
        this.fullyApplyActions();
        return this.source.length;
    };
    /**
     * Stateful intermediate operation
     * Returns a stream of distinct objects according to the === operator
     */
    /*//todo
    public distinct(): Stream<T> {
        return this.distinctPredicate((t1: T, t2:T) => t1 === t2)
    }
    */
    /**
     * Stateful intermediate operation
     * Returns a stream of distinct objects according to the given predicate, the predicate takes
     * two objects and should return true if they are equivelant, false if they are different
     */
    /*
    public distinctPredicate(isEqualFunction: BiPredicate<T, T>): Stream<T> {
    }
    */
    /**
     * Terminal Operation: Short Circuiting
     * Returns an optional describing the first element of the stream, of the stream is empty,
     * return an empty Optional.
     */
    ArrayStream.prototype.findFirst = function () {
        if (this.isEmpty()) {
            return optional_1.Optional.empty();
        }
        else {
            var item = this.source.shift();
            return optional_1.Optional.of(this.applyAction(item));
        }
    };
    /**
     * Terminal Operation: Short Circuiting
     * Returns an optional describing some element in the stream, explicitly non-deterministic to
     * allow for potential performance increases if stream is empty, return an empty Optional.
     */
    ArrayStream.prototype.findAny = function () {
        return this.findFirst(); //todo better way?
    };
    /**
     * Intermediate Operation.
     * Returns a stream consisting of the results of applying the given function to the elements of this stream.
     * @param transformer: function that transforms a value in the stream to a new value;
     */
    ArrayStream.prototype.map = function (transformer) {
        this.actions.push(transformer);
        return new ArrayStream(this.source, this.actions);
    };
    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream.
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    ArrayStream.prototype.forEach = function (consumer) {
        this.fullyApplyActions();
        this.source.forEach(consumer);
    };
    //todo maybe make parallel
    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection
     * @param supplier: supplies a new mutable container
     * @param accumulator: function that adds an item to the given mutable container
     * @param combiner: function combines two mutable containers, adding all the elements of the second one into the first
     */
    ArrayStream.prototype.defaultCollect = function (supplier, accumulator, combiner) {
        this.fullyApplyActions();
        var container = supplier();
        this.source.forEach(function (item) { return accumulator(container, item); });
        return container;
    };
    //todo parallelize
    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection using the given collector
     * @param collector : a collector used to apply the mutable reduction.
     */
    ArrayStream.prototype.collect = function (collector) {
        this.fullyApplyActions();
        var container = collector.supplier()();
        this.source.forEach(function (item) {
            collector.accumulator()(container, item);
        });
        return collector.finisher()(container);
    };
    /**
     * retuns an empty stream builder
     */
    ArrayStream.prototype.builder = function () {
        return ArrayStreamBuilder.builder();
    };
    return ArrayStream;
}());
;
var ArrayStreamBuilder = /** @class */ (function () {
    function ArrayStreamBuilder() {
        this.array = [];
    }
    ArrayStreamBuilder.builder = function () {
        return new ArrayStreamBuilder();
    };
    ArrayStreamBuilder.prototype.accept = function (item) {
        this.acceptAll([item]);
    };
    ArrayStreamBuilder.prototype.acceptAll = function (items) {
        var _a;
        (_a = this.array).push.apply(_a, items);
    };
    ArrayStreamBuilder.prototype.add = function (item) {
        this.accept(item);
        return this;
    };
    ArrayStreamBuilder.prototype.addAll = function (items) {
        this.acceptAll(items);
        return this;
    };
    ArrayStreamBuilder.prototype.build = function () {
        return ArrayStream.of(this.array);
    };
    return ArrayStreamBuilder;
}());
