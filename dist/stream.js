"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var functions_1 = require("./functions");
var collectors_1 = require("./collectors");
var optional_1 = require("./optional");
var processorPipeline_1 = require("./processorPipeline");
var processor_1 = require("./processor");
var IterateSource = /** @class */ (function () {
    function IterateSource(seed, transformer) {
        this.seed = seed;
        this.currentValue = optional_1.Optional.empty();
        this.transformer = transformer;
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
    IterateSource.prototype.isEmpty = function () {
        return false;
    };
    return IterateSource;
}());
//Static methods of the stream interface
exports.Stream = {
    /**
     * Creates a new stream from the given source array
     * @param source
     */
    of: function (source) {
        return PipelineStream.of(source);
    },
    /**
     * Creates a new stream from the given source values
     * @param source
     */
    ofValues: function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return PipelineStream.of(values);
    },
    /**
     * creates a stream of a single element with the given source value;
     * @param value
     */
    ofValue: function (value) {
        return PipelineStream.of([value]);
    },
    /**
     * creates an empty Stream
     */
    empty: function () {
        return PipelineStream.of([]);
    },
    /**
     * generates a infinite stream where elements are generated
     * by the given supplier.
     * @param supplier
     */
    generate: function (supplier) {
        return PipelineStream.ofSupplier(supplier);
    },
    /**
     * creates an infinte stream of values by incrementally applying getNext to
     * the last item in the stream, so you have a stream like:
     * seed, getNext(seed), getNext(getNext(seed)), etc
     * @param seed initial value of the stream
     * @param getNext transforming function applied at each step
     */
    iterate: function (seed, getNext) {
        return PipelineStream.ofCheckedSupplier(new IterateSource(seed, getNext));
    },
    //builder(): StreamBuilder<T>;
    //concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T> {},
    /**
     * returns a stream of numbers starting at startInclusive, and going to up
     * to but not including endExculsive in increments of 1, if a step is passed in, the
     * increments of 1 will be changed to increments of size step, negative steps will be treated
     * as positive.
     *
     * IF the start is greater than the end, the default step will be -1 and any positive step
     * values will be treated as negative i.e. 5 => -5, -5 => -5
     *
     * an empty stream will be returned if start and end are the same
     *
     * @param startInclusive starting value of the range, included in the range
     * @param endExclusive end of the range, not included
     * @param step an optional param to define the step size, defaults to 1 if nothing is supplied
     */
    range: function (startInclusive, endExclusive, step) {
        var stepToUse;
        var comparator;
        if (startInclusive === endExclusive) {
            return exports.Stream.empty();
        }
        else if (startInclusive < endExclusive) {
            comparator = function (next, end) { return next < end; };
            stepToUse = step ? Math.abs(step) : 1;
        }
        else {
            comparator = function (next, end) { return next > end; };
            stepToUse = step ? (0 - Math.abs(step)) : -1;
        }
        var list = [startInclusive];
        var nextItem = startInclusive + stepToUse;
        while (comparator(nextItem, endExclusive)) {
            list.push(nextItem);
            nextItem = nextItem + stepToUse;
        }
        return exports.Stream.of(list);
    },
    /**
     * returns a stream of numbers starting at startInclusive, and going to up
     * to and including endExculsive in increments of 1, if a step is passed in, the
     * increments of 1 will be changed to increments of size step
     *
     * IF the start is greater than the end, the default step will be -1 and any positive step
     * values will be treated as negative i.e. 5 => -5, -5 => -5
     *
     * an empty stream will be returned if start and end are the same
     *
     * @param startInclusive starting value of the range, included in the range
     * @param endInclusive end of the range
     * @param step an optional param to define the step size, defaults to 1 if nothing is supplied
     */
    rangeClosed: function (startInclusive, endInclusive, step) {
        return startInclusive < endInclusive
            ? exports.Stream.range(startInclusive, endInclusive + 1, step)
            : exports.Stream.range(startInclusive, endInclusive - 1, step);
    }
};
var PipelineStream = /** @class */ (function () {
    function PipelineStream(pipeline) {
        this.processingStarted = false;
        this.pipeline = pipeline;
    }
    PipelineStream.prototype.newPipeline = function (processor) {
        return this.pipeline.addProcessor(processor);
    };
    //spliterator methods
    PipelineStream.prototype.hasNext = function () {
        return this.pipeline.hasNext();
    };
    PipelineStream.prototype.getNext = function () {
        return this.getNextProcessedItem();
    };
    PipelineStream.prototype.tryAdvance = function (consumer) {
        var next = this.getNext();
        if (next.isPresent()) {
            consumer(next.get());
            return true;
        }
        else {
            return false;
        }
    };
    PipelineStream.prototype.streamIterator = function () {
        return this;
    };
    PipelineStream.of = function (source) {
        var copy = source.slice();
        var checkedSource = {
            get: function () { return copy.shift(); },
            isEmpty: function () { return copy.length === 0; },
        };
        return PipelineStream.ofCheckedSupplier(checkedSource);
    };
    PipelineStream.ofSupplier = function (supplier) {
        var checkedSource = {
            get: function () { return supplier(); },
            isEmpty: function () { return false; },
        };
        return PipelineStream.ofCheckedSupplier(checkedSource);
    };
    PipelineStream.ofCheckedSupplier = function (checkedSupplier) {
        return new PipelineStream(processorPipeline_1.ProcessorPipeline.create(checkedSupplier));
    };
    PipelineStream.empty = function () {
        return PipelineStream.of([]);
    };
    PipelineStream.prototype.getNextProcessedItem = function () {
        this.processingStarted = true;
        return this.pipeline.getNextResult();
    };
    //todo test case should NOT pull another item is short circuit happens
    PipelineStream.prototype.allMatch = function (predicate) {
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (predicate(nextItem.get()) === false) {
                return false;
            }
            nextItem = this.getNextProcessedItem();
        }
        return true;
    };
    PipelineStream.prototype.noneMatch = function (predicate) {
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (predicate(nextItem.get()) === true) {
                return false;
            }
            nextItem = this.getNextProcessedItem();
        }
        return true;
    };
    PipelineStream.prototype.anyMatch = function (predicate) {
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (predicate(nextItem.get()) === true) {
                return true;
            }
            nextItem = this.getNextProcessedItem();
        }
        return false;
    };
    PipelineStream.prototype.count = function () {
        var count = 0;
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            count++;
            nextItem = this.getNextProcessedItem();
        }
        return count;
    };
    PipelineStream.prototype.findFirst = function () {
        return this.getNextProcessedItem();
    };
    PipelineStream.prototype.findAny = function () {
        return this.getNextProcessedItem();
    };
    PipelineStream.prototype.customCollect = function (supplier, accumulator, combiner) {
        var container = supplier();
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            accumulator(container, nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
        return container;
    };
    PipelineStream.prototype.collect = function (collector) {
        var container = collector.supplier()();
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            collector.accumulator()(container, nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
        return collector.finisher()(container);
    };
    PipelineStream.prototype.map = function (transformer) {
        var newPipeline = this.newPipeline(processor_1.Processor.mapProcessor(transformer));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.peek = function (consumer) {
        var newPipeline = this.newPipeline(processor_1.Processor.peekProcessor(consumer));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.flatMap = function (transformer) {
        var newPipeline = this.newPipeline(processor_1.Processor.streamFlatMapProcessor(transformer));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.flatMapList = function (transformer) {
        var newPipeline = this.newPipeline(processor_1.Processor.listFlatMapProcessor(transformer));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.filter = function (predicate) {
        var newPipeline = this.newPipeline(processor_1.Processor.filterProcessor(predicate));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.distinct = function (equalsFunction) {
        var equalsFunctionToUse = equalsFunction ? equalsFunction : functions_1.BiPredicate.defaultEquality;
        var newPipeline = this.newPipeline(processor_1.Processor.distinctProcessor(equalsFunctionToUse));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.limit = function (maxSize) {
        var newPipeline = this.newPipeline(processor_1.Processor.limitProcessor(maxSize));
        return new PipelineStream(newPipeline);
    };
    PipelineStream.prototype.forEachOrdered = function (consumer) {
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            consumer(nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
    };
    PipelineStream.prototype.forEach = function (consumer) {
        this.forEachOrdered(consumer);
    };
    PipelineStream.prototype.max = function (comparator) {
        var comparatorToUse = comparator ? comparator : functions_1.Comparator.default;
        var maxValue = this.getNextProcessedItem();
        var nextValue = maxValue;
        while (nextValue.isPresent()) {
            var result = comparatorToUse(nextValue.get(), maxValue.get());
            if (result > 0) {
                maxValue = nextValue;
            }
            nextValue = this.getNextProcessedItem();
        }
        return maxValue;
    };
    PipelineStream.prototype.min = function (comparator) {
        var comparatorToUse = comparator ? comparator : functions_1.Comparator.default;
        var minValue = this.getNextProcessedItem();
        var nextValue = minValue;
        while (nextValue.isPresent()) {
            var result = comparatorToUse(nextValue.get(), minValue.get());
            if (result < 0) {
                minValue = nextValue;
            }
            nextValue = this.getNextProcessedItem();
        }
        return minValue;
    };
    PipelineStream.prototype.reduce = function (accumulator, initialValue) {
        var currentValue = optional_1.Optional.ofNullable(initialValue);
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (currentValue.isPresent()) {
                currentValue = optional_1.Optional.of(accumulator(currentValue.get(), nextItem.get()));
            }
            else {
                currentValue = nextItem;
            }
            nextItem = this.getNextProcessedItem();
        }
        return currentValue;
    };
    PipelineStream.prototype.toArray = function () {
        return this.collect(collectors_1.default.toList());
    };
    return PipelineStream;
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
        return PipelineStream.of(this.array);
    };
    return ArrayStreamBuilder;
}());
