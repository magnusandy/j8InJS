"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processorPipeline_1 = require("./processorPipeline");
var processor_1 = require("./processor");
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
     * Creates a new stream from the given source values
     * @param source
     */
    ofValues: function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        return ArrayStream.of(values);
    },
    /**
     * creates a stream of a single element with the given source value;
     * @param value
     */
    ofValue: function (value) {
        return ArrayStream.of([value]);
    },
    /**
     * creates an empty Stream
     */
    empty: function () {
        return ArrayStream.of([]);
    },
    //todo
    //concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T> {},
    generate: function (supplier) {
        return ArrayStream.ofSupplier(supplier);
    },
};
var ArrayStream = /** @class */ (function () {
    function ArrayStream(pipeline) {
        this.processingStarted = false;
        this.pipeline = pipeline;
    }
    ArrayStream.prototype.newPipeline = function (processor) {
        return this.pipeline.addProcessor(processor);
    };
    ArrayStream.of = function (source) {
        var copy = source.slice();
        var checkedSource = {
            get: function () { return copy.shift(); },
            isEmpty: function () { return copy.length === 0; },
        };
        return new ArrayStream(processorPipeline_1.ProcessorPipeline.create(checkedSource));
    };
    ArrayStream.ofSupplier = function (supplier) {
        var checkedSource = {
            get: function () { return supplier(); },
            isEmpty: function () { return false; },
        };
        return new ArrayStream(processorPipeline_1.ProcessorPipeline.create(checkedSource));
    };
    ArrayStream.empty = function () {
        return ArrayStream.of([]);
    };
    ArrayStream.prototype.getNextProcessedItem = function () {
        this.processingStarted = true;
        return this.pipeline.getNextResult();
    };
    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection using the given collector
     * @param collector : a collector used to apply the mutable reduction.
     */
    ArrayStream.prototype.collect = function (collector) {
        var container = collector.supplier()();
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            collector.accumulator()(container, nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
        return collector.finisher()(container);
    };
    /**
     * Intermediate Operation.
     * Returns a stream consisting of the results of applying the given function to the elements of this stream.
     * @param transformer: function that transforms a value in the stream to a new value;
     */
    ArrayStream.prototype.map = function (transformer) {
        var newPipeline = this.newPipeline(processor_1.Processor.mapProcessor(transformer));
        return new ArrayStream(newPipeline);
    };
    ArrayStream.prototype.flatMapList = function (transformer) {
        var newPipeline = this.newPipeline(processor_1.Processor.listFlatMapProcessor(transformer));
        return new ArrayStream(newPipeline);
    };
    ArrayStream.prototype.filter = function (predicate) {
        var newPipeline = this.newPipeline(processor_1.Processor.filterProcessor(predicate));
        return new ArrayStream(newPipeline);
    };
    /**
     * returns a distinct stream of values based on the === operator,
     * for a custom distinction utilize distinctPredicate to pass in a custom
     * equalityTest.
     */
    ArrayStream.prototype.distinct = function () {
        return this.distinctPredicate(function (i1, i2) { return i1 === i2; });
    };
    ArrayStream.prototype.distinctPredicate = function (equalsFunction) {
        var newPipeline = this.newPipeline(processor_1.Processor.distinctProcessor(equalsFunction));
        return new ArrayStream(newPipeline);
    };
    ArrayStream.prototype.limit = function (maxSize) {
        var newPipeline = this.newPipeline(processor_1.Processor.limitProcessor(maxSize));
        return new ArrayStream(newPipeline);
    };
    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream. ordering is not garenteed;
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    ArrayStream.prototype.forEach = function (consumer) {
        var nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            consumer(nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
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
// /**
//      * Terminal Operation - Short Circuting
//      * returns true if all items in the stream match the given predicate, if any item returns false, return false;
//      * if the stream is empty, return true, the predicate is never evaluated;
//      * @param predicate 
//      */
//     public allMatch(predicate: Predicate<T>): boolean {
//         for (let i in this.source) {
//             const sourceItem = this.source[i];
//             const applied = this.applyAction(sourceItem);
//             if (!predicate(applied)) {
//                 return false;
//             }
//         }
//         return true;
//     }
//     /**
//      * Terminal Operation - Short Circuting
//      * returns true if any 1 item in the stream match the given predicate, if any item returns true, return true, else false;
//      * @param predicate 
//      */
//     public anyMatch(predicate: Predicate<T>): boolean {
//         for (let i in this.source) {
//             const sourceItem = this.source[i];
//             const applied = this.applyAction(sourceItem);
//             if (predicate(applied)) {
//                 return true;
//             }
//         }
//         return false;
//     }
//     /**
//      * Terminal Operation 
//      * returns the count of all the elements of the stream.
//      */
//     //todo test more with filter
//     public count(): number {
//         this.fullyApplyActions();
//         return this.source.length;
//     }
//     /**
//      * Stateful intermediate operation
//      * Returns a stream of distinct objects according to the === operator
//      */
//     /*//todo
//     public distinct(): Stream<T> {
//         return this.distinctPredicate((t1: T, t2:T) => t1 === t2)
//     }
//     */
//     /**
//      * Stateful intermediate operation
//      * Returns a stream of distinct objects according to the given predicate, the predicate takes 
//      * two objects and should return true if they are equivelant, false if they are different
//      */
//     /*
//     public distinctPredicate(isEqualFunction: BiPredicate<T, T>): Stream<T> {
//     }
//     */
//     /**
//      * Terminal Operation: Short Circuiting
//      * Returns an optional describing the first element of the stream, of the stream is empty,
//      * return an empty Optional.
//      */
//     public findFirst(): Optional<T> {
//         if (this.isEmpty()) {
//             return Optional.empty();
//         } else {
//             const item = this.source.shift();
//             return Optional.of(this.applyAction(item));
//         }
//     }
//     /**
//      * Terminal Operation: Short Circuiting
//      * Returns an optional describing some element in the stream, explicitly non-deterministic to
//      * allow for potential performance increases if stream is empty, return an empty Optional.
//      */
//     public findAny(): Optional<T> {
//         return this.findFirst();//todo better way?
//     }
//     filter(predicate: Predicate<T>): Stream<T> {
//         this.actions.push(new FilterProcessor<T>(predicate));
//         return new ArrayStream<T>(this.source, this.actions);
//     }
//     /**
//      * Terminal Operation
//      * applies a given consumer to each entity in the stream. objects are dealt with in order
//      * @param consumer: applies the consuming function to all elements in the stream;
//      */
//     public forEachOrdered(consumer: Consumer<T>): void {
//         this.fullyApplyActions();
//         this.source.forEach(consumer);
//     }
//     //todo maybe make parallel
//     /**
//      * Terminal Operation
//      * applies a mutable reduction operation to the elements in the collection
//      * @param supplier: supplies a new mutable container 
//      * @param accumulator: function that adds an item to the given mutable container
//      * @param combiner: function combines two mutable containers, adding all the elements of the second one into the first
//      */
//     public customCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R {
//         this.fullyApplyActions();
//         let container: R = supplier();
//         this.source.forEach(item => accumulator(container, item))
//         return container;
//     }
//     //todo parallelize
//     /**
//      * Terminal Operation
//      * applies a mutable reduction operation to the elements in the collection using the given collector
//      * @param collector : a collector used to apply the mutable reduction.
//      */
//     public collect<R, A>(collector: Collector<T, A, R>): R {
//         this.fullyApplyActions();
//         let container = collector.supplier()();
//         this.source.forEach(item => {
//             collector.accumulator()(container, item)
//         })
//         return collector.finisher()(container);
//     }
//     /**
//      * retuns an empty stream builder
//      */
//     public builder(): StreamBuilder<T> {
//         return ArrayStreamBuilder.builder<T>();
//     }
