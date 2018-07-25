import { Transformer, Supplier, BiConsumer, Consumer, Predicate, BiPredicate, CheckableSupplier } from "./functions";
import { Collector } from "./collectors";
import { Optional } from "./optional";
import { ProcessorPipeline } from "./processorPipeline";
import { Processor } from "./processor";

/**
 * A stream is a sequence of elements with possibly unlimited length
 * and a sequence of 0 or more operations to be undertaken on the elements.
 * Streams conputations are lazy and only take place when necessary, rather than at the time
 * they are declared.
 * 
 * The operations being undertaken on the elements of a stream can be thought of like a pipeline
 * elements enter the start of the pipeline, and various processors, or nodes along the pipeline take
 * elements, act on them and possibly pass outputs on to the rest of the pipeline.
 * 
 * a Stream pipeline consists of two types of operations:
 * 
 * Intermediate Operations: intermediate operations are lazy, they are not envoked until a terminal operation
 * is created, they generally transform or remove elements in some way. 
 * intermediate operations come in 3 flavours, stateless, stateful, and short-circuiting
 * stateless operations do not depend on previous results, and can be completely lazily computed, 
 * processing one element at a time on an is needed basis. stateful operations on the other hand 
 * need access to all elements of a pipeline in order to carry out a calculation, and because of this
 * need to collect and process all elements of a stream before the rest of the pipeline can proceed.
 * short-circuiting operations act as a guard or door, they stop elements from passing them in the pipeline, 
 * and have the benifit of turning a infinite stream into a finite one.
 * 
 * Terminal Operations: terminal operations are the final operation on a pipeline, they complete
 * the circuit so to speak, when a terminal node is envoked all the processing of a stream takes place.
 * example. terminal operations can also be short circuiting, in that they can cut an infinite stream of elements down
 * to a finite stream. 
 * 
 * Caution: short circuiting operations are only effective on a stateless pipeline, or one where each
 * stateful operations are first proceeded by a short circuiting one, otherwise an infinte loop can still happen.
 * for example consider an infinite stream S. S.findFirst(); will correctly short circuit and return the first item of the
 * stream. S.distinct().findFirst(); on the other hand will infinitly loop as distinct() tries to greedily consume elements
 * before proceeding. this could be remedied by first limiting the streams output. S.limit(10).distinct().findFirst();
 */
export interface Stream<T> {

    /**
     * Terminal Operation - Short Circuting
     * returns true if all items in the stream match the given predicate, if any item returns false, return false;
     * if the stream is empty, return true, the predicate is never evaluated;
     * @param predicate 
     */
    allMatch(predicate: Predicate<T>): boolean;

    /**
     * Terminal Operation - Short Circuting
     * returns true if any 1 item in the stream match the given predicate, if any item returns true, return true, else false;
     * @param predicate 
     */
    anyMatch(predicate: Predicate<T>): boolean;

    /**
     * Terminal Operation 
     * returns the count of all the elements of the stream.
     */
    count(): number;

    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection using the given items,
     * use of the combiner is not garenteed
     * @param supplier: supplies a mutable collection of type R
     * @param accumulator adds an element T to a given collection of type R
     * @param combiner combines all the values in the second collection into the first
     */
    customCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R;

    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection using the given collector
     * @param collector a Collector used to apply the mutable reduction.
     */
    collect<R, A>(collector: Collector<T, A, R>): R; 

    /**
     * Intermediate Operation - Stateful
     * returns a distinct stream of values based on the === operator, 
     * for a custom distinction utilize distinctPredicate to pass in a custom 
     * equalityTest.
     */
    distinct(): Stream<T>; 

    /**
     * Intermediate Operation - Stateful
     * return a distinct stream of elements according to the given equality function
     * @param equalsFunction function that takes two parameters, returns true if they are equal, false otherwise
     */
    distinctPredicate(equalsFunction: BiPredicate<T, T>): Stream<T>; 

    /**
     * Intermediate Operation
     * returns a stream whose elements are those from the current stream that match the given predicate
     * function. Keep all elements who match the given predicate.
     * @param predicate
     */
    filter(predicate: Predicate<T>): Stream<T>;

    /**
     * Terminal Operation: Short Circuiting
     * Returns an optional describing the first element of the stream, if the stream is empty,
     * return an empty Optional.
     */
    findFirst(): Optional<T>;
    
    /**
     * Terminal Operation: Short Circuiting
     * Returns an optional describing the an element of the stream, if the stream is empty,
     * return an empty Optional.
     */
    findAny(): Optional<T>;

    /**
     * Intermediate Operation
     * A one to many mapping transformer, returns a stream whos elements consist of the 
     * elements of all the output streams of the transformer function.
     * @param transformer 
     */
    flatMap<U>(transformer: Transformer<T, Stream<U>>): Stream<U>; 

    /**
     * Intermediate Operation
     * A one to many mapping transformer, returns a stream whos elements consist of the 
     * elements of all the output lists of the transformer function. same idea as flatMap but
     * with standard arrays
     * @param transformer 
     */
    flatMapList<U>(transformer: Transformer<T, U[]>): Stream<U>;

    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream. elements are processed in sequental order;
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    forEachOrdered(consumer: Consumer<T>): void;

    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream. ordering is not garenteed;
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    forEach(consumer: Consumer<T>): void;

    /**
     * Intermediate Operation - Short Circuiting
     * returns a stream that consists of less than or equal to maxSize elements
     * will create finite stream out of infinite stream. 
     * @param maxSize 
     */
    limit(maxSize: number): Stream<T>; 

    /**
     * Intermediate Operation.
     * Returns a stream consisting of the results of applying the given function to the elements of this stream.
     * @param transformer: function that transforms a value in the stream to a new value;
     */
    map<U>(transformer: Transformer<T, U>): Stream<U>; //intermediate
    //max(comparator: Comparator<T>): T; //todo optional param, default to >
    //min(comparator: Comparator<T>): T; // todo optional param, default to <
    //noneMatch(predicate: Predicate<T>): boolean;
    //peek(consumer: Consumer<T>): Stream<T>; //intermediate
    //reduce(identity: T, accumulator: BiFunction<T>): T;
    //skip(numberToSkip: number): Stream<T>; //intermediate
    spliterator(): StreamIterator<T>;
    //sortedNatural(): Stream<T>; //intermediate stateful
    //sorted(comparator: Comparator<T>): Stream<T>; //intermediate stateful
    //toArray(): T[];
}

//Static methods of the stream interface
export const Stream = {
    /**
     * Creates a new stream from the given source array
     * @param source 
     */
    of<T>(source: T[]): Stream<T> {
        return PipelineStream.of(source);
    },

    /**
     * Creates a new stream from the given source values
     * @param source 
     */
    ofValues<T>(...values: T[]): Stream<T> {
        return PipelineStream.of(values);
    },

    /**
     * creates a stream of a single element with the given source value;
     * @param value 
     */
    ofValue<T>(value: T): Stream<T> {
        return PipelineStream.of([value]);
    },


    /**
     * creates an empty Stream
     */
    empty<T>(): Stream<T> {
        return PipelineStream.of<T>([]);
    },

    //todo
    //builder(): StreamBuilder<T>;
    //concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T> {},
    /**
     * generates a infinite stream where elements are generated
     * by the given supplier.
     * @param supplier 
     */
    generate<T>(supplier: Supplier<T>): Stream<T> {
        return PipelineStream.ofSupplier(supplier);
    },
    //iterate<T>(seed: T, getNext: Transformer<T, T>): Stream<T> {},

}

export interface StreamIterator<T> {
    hasNext(): boolean;
    getNext(): Optional<T>;
}

class PipelineStream<S, T> implements Stream<T>, StreamIterator<T> {
    pipeline: ProcessorPipeline<S, T>;
    private processingStarted = false;

    private constructor(pipeline: ProcessorPipeline<S, T>) {
        this.pipeline = pipeline;
    }

    private newPipeline<U>(processor: Processor<any, U>): ProcessorPipeline<S, U> {
        return this.pipeline.addProcessor(processor);
    }

    //spliterator methods
    public hasNext(): boolean {
        return this.pipeline.hasNext();
    }

    public getNext(): Optional<T> {
        return this.getNextProcessedItem();
    }

    public spliterator(): StreamIterator<T> {
        return this;
    }

    public static of<S>(source: S[]): Stream<S> {
        const copy = source.slice();
        const checkedSource: CheckableSupplier<S> = {
            get: () => copy.shift(),
            isEmpty: () => copy.length === 0,
        }
        return new PipelineStream<S, S>(ProcessorPipeline.create(checkedSource));
    }

    public static ofSupplier<S>(supplier: Supplier<S>): Stream<S> {
        const checkedSource: CheckableSupplier<S> = {
            get: () => supplier(),
            isEmpty: () => false,
        }
        return new PipelineStream<S, S>(ProcessorPipeline.create(checkedSource));
    }

    public static empty<S>(): Stream<S> {
        return PipelineStream.of<S>([]);
    }

    private getNextProcessedItem(): Optional<any> {
        this.processingStarted = true;
        return this.pipeline.getNextResult();
    }

    public allMatch(predicate: Predicate<T>): boolean {
        let allMatched = true;
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent() && allMatched) {
            allMatched = predicate(nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
        return allMatched;
    }

    public anyMatch(predicate: Predicate<T>): boolean {
        let anyMatched = false;
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent() && !anyMatched) {
            anyMatched = predicate(nextItem.get());
            nextItem = this.getNextProcessedItem();
        }
        return anyMatched;
    }

    public count(): number {
        let count = 0;
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            count++;
            nextItem = this.getNextProcessedItem();
        }
        return count;
    }

    public findFirst(): Optional<T> {
        return this.getNextProcessedItem();
    }

    public findAny(): Optional<T> {
        return this.getNextProcessedItem();
    }

    public customCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R {
        let container: R = supplier();
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            accumulator(container, nextItem.get());
            nextItem = this.getNextProcessedItem();
        }

        return container;
    }

    public collect<R, A>(collector: Collector<T, A, R>): R {
        let container = collector.supplier()();
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            collector.accumulator()(container, nextItem.get())
            nextItem = this.getNextProcessedItem();
        }

        return collector.finisher()(container);
    }

    public map<U>(transformer: Transformer<T, U>): Stream<U> {
        const newPipeline = this.newPipeline(Processor.mapProcessor(transformer));
        return new PipelineStream<S, U>(newPipeline);
    }

    public flatMap<U>(transformer: Transformer<T, Stream<U>>): Stream<U> {
        const newPipeline = this.newPipeline(Processor.streamFlatMapProcessor(transformer));
        return new PipelineStream<S, U>(newPipeline);
    }

    public flatMapList<U>(transformer: Transformer<T, U[]>): Stream<U> {
        const newPipeline = this.newPipeline(Processor.listFlatMapProcessor(transformer));
        return new PipelineStream<S, U>(newPipeline);
    }

    public filter(predicate: Predicate<T>): Stream<T> {
        const newPipeline = this.newPipeline(Processor.filterProcessor(predicate));
        return new PipelineStream<S, T>(newPipeline);
    }

    public distinct(): Stream<T> {
        return this.distinctPredicate((i1, i2) => i1 === i2);
    }

    public distinctPredicate(equalsFunction: BiPredicate<T, T>): Stream<T> {
        const newPipeline = this.newPipeline(Processor.distinctProcessor(equalsFunction));
        return new PipelineStream<S, T>(newPipeline);
    }

    public limit(maxSize: number): Stream<T> {
        const newPipeline = this.newPipeline(Processor.limitProcessor(maxSize));
        return new PipelineStream<S, T>(newPipeline);
    }

    public forEachOrdered(consumer: Consumer<T>): void {
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            consumer(nextItem.get())
            nextItem = this.getNextProcessedItem();
        }
    }

    public forEach(consumer: Consumer<T>): void {
        this.forEachOrdered(consumer);
    }

}

export interface StreamBuilder<T> {
    accept(item: T): void;
    add(item: T): StreamBuilder<T>;
    addAll(itemList: T[]): StreamBuilder<T>;
    build(): Stream<T>;
};

class ArrayStreamBuilder<T> implements StreamBuilder<T> {
    array: T[];

    private constructor() {
        this.array = [];
    }

    public static builder<T>(): StreamBuilder<T> {
        return new ArrayStreamBuilder<T>();
    }

    accept(item: T): void {
        this.acceptAll([item]);
    }

    acceptAll(items: T[]): void {
        this.array.push(...items);
    }

    add(item: T): StreamBuilder<T> {
        this.accept(item);
        return this;
    }

    addAll(items: T[]): StreamBuilder<T> {
        this.acceptAll(items);
        return this;
    }

    build(): Stream<T> {
        return PipelineStream.of(this.array);
    }
}

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