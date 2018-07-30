import { Transformer, Supplier, BiConsumer, Consumer, Predicate, BiPredicate, CheckableSupplier, Comparator, BiFunction } from "./functions";
import Collectors, { Collector } from "./collectors";
import { Optional } from "./optional";
import { ProcessorPipeline } from "./processorPipeline";
import { Processor } from "./processor";

/**
 * A stream is a sequence of elements with possibly unlimited length
 * and a sequence of 0 or more operations to be undertaken on the elements.
 * Streams computations are lazy and only take place when necessary, rather than at the time
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
 * processing one element at a time on an is-needed basis. stateful operations on the other hand 
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
     * return a distinct stream of elements according to the given equality function, if an equality function 
     * is not supplied, the === operator is used to compare elements.
     * @param equalsFunction function that takes two parameters, returns true if they are equal, false otherwise
     */
    distinct(equalsFunction?: BiPredicate<T, T>): Stream<T>;

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
    map<U>(transformer: Transformer<T, U>): Stream<U>;

    /**
     * Terminal Operation
     * returns the largest element in the stream if the stream is not empty otherwise return Optional.empty();
     * If a comparator is supplied to the function, it is used to find the largest value in the stream, if no 
     * comparator is supplied, a default comparator using the > and < operators is used.
     * @param comparator function to compare elements in the stream, 
     */
    max(comparator?: Comparator<T>): Optional<T>;

    /**
     * Terminal Operation
     * returns the smallest element in the stream if the stream is not empty otherwise return Optional.empty();
     * If a comparator is supplied to the function, it is used to find the smallest value in the stream, if no 
     * comparator is supplied, a default comparator using the > and < operators is used.
     * @param comparator function to compare elements in the stream, 
     */
    min(comparator?: Comparator<T>): Optional<T>;

    /**
     * Terminal Operation - Short Circuting
     * returns true if no items in the stream match the given predicate, if any item predicate returns true, return false;
     * if the stream is empty, return true, the predicate is never evaluated;
     * @param predicate 
     */
    noneMatch(predicate: Predicate<T>): boolean;

    /**
     * Intermediate Operation
     * applies the given consumer to each item in the pipeline as an intermediate operation
     * This function is mainly ment for debugging operations of a pipeline. Care should be taken
     * that the values of the stream are not altered within the consumer, it should be a stateless
     * and non altering function otherwise problems can be caused down the pipeline
     * @param consumer 
     */
    peek(consumer: Consumer<T>): Stream<T>;

    /**
     * Terminal Operation
     * applies a reduction on the elements of the stream using the given accumulator function.
     * returns an Optional describing the result if the stream have values. Optionally, an initial
     * value can be specified, if the stream is empty, an optional describing the initial value will
     * be returned. 
     */
    reduce(accumulator: BiFunction<T>, initialValue?: T): Optional<T>;

    /**
     * returns a StreamIterator of the current stream, allowing easier
     * step by step data retrieval from the stream
     */
    streamIterator(): StreamIterator<T>;

    //skip(numberToSkip: number): Stream<T>; //intermediate
    //sorted(comparator?: Comparator<T>): Stream<T>; //intermediate stateful
    toArray(): T[];
}

export interface StreamIterator<T> {
    hasNext(): boolean;
    getNext(): Optional<T>;
    tryAdvance(consumer: Consumer<T>): boolean;
}

class IterateSource<S> implements CheckableSupplier<S> {
    seed: S;
    currentValue: Optional<S>;
    transformer: Transformer<S, S>;

    constructor(seed: S, transformer: Transformer<S, S>) {
        this.seed = seed;
        this.currentValue = Optional.empty();
        this.transformer = transformer;
    }

    get(): S {
        let nextValue;
        if (this.currentValue.isPresent()) {
            nextValue = this.transformer(this.currentValue.get());
        } else {
            nextValue = this.seed;
        }
        this.currentValue = Optional.of(nextValue);
        return nextValue;
    }

    isEmpty(): boolean {
        return false;
    }

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

    /**
     * generates a infinite stream where elements are generated
     * by the given supplier.
     * @param supplier 
     */
    generate<T>(supplier: Supplier<T>): Stream<T> {
        return PipelineStream.ofSupplier(supplier);
    },

    /**
     * creates an infinte stream of values by incrementally applying getNext to
     * the last item in the stream, so you have a stream like:  
     * seed, getNext(seed), getNext(getNext(seed)), etc
     * @param seed initial value of the stream
     * @param getNext transforming function applied at each step
     */
    iterate<T>(seed: T, getNext: Transformer<T, T>): Stream<T> {
        return PipelineStream.ofCheckedSupplier(new IterateSource(seed, getNext))
    },

    //builder(): StreamBuilder<T>; //todo maybe
    //concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T> {}, //todo 

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
    range(startInclusive: number, endExclusive: number, step?: number): Stream<number> {
        let stepToUse: number;
        let comparator: BiPredicate<number, number>;

        if (startInclusive === endExclusive) {
            return Stream.empty();
        } else if (startInclusive < endExclusive) {
            comparator = (next: number, end: number) => next < end;
            stepToUse = step ? Math.abs(step) : 1;
        } else {
            comparator = (next: number, end: number) => next > end;
            stepToUse = step ? (0 - Math.abs(step)) : -1;
        }

        let list = [startInclusive];
        let nextItem = startInclusive + stepToUse;
        while (comparator(nextItem, endExclusive)) {
            list.push(nextItem);
            nextItem = nextItem + stepToUse;
        }
        return Stream.of(list);
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
    rangeClosed(startInclusive: number, endInclusive: number, step?: number): Stream<number> {
        return startInclusive < endInclusive
            ? Stream.range(startInclusive, endInclusive + 1, step)
            : Stream.range(startInclusive, endInclusive - 1, step);
    }

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

    public tryAdvance(consumer: Consumer<T>): boolean {
        const next: Optional<T> = this.getNext();
        if (next.isPresent()) {
            consumer(next.get());
            return true;
        } else {
            return false
        }
    }

    public streamIterator(): StreamIterator<T> {
        return this;
    }

    public static of<S>(source: S[]): Stream<S> {
        const copy = source.slice();
        const checkedSource: CheckableSupplier<S> = {
            get: () => copy.shift(),
            isEmpty: () => copy.length === 0,
        }
        return PipelineStream.ofCheckedSupplier(checkedSource);
    }

    public static ofSupplier<S>(supplier: Supplier<S>): Stream<S> {
        const checkedSource: CheckableSupplier<S> = {
            get: () => supplier(),
            isEmpty: () => false,
        }
        return PipelineStream.ofCheckedSupplier(checkedSource);
    }

    public static ofCheckedSupplier<S>(checkedSupplier: CheckableSupplier<S>): Stream<S> {
        return new PipelineStream<S, S>(ProcessorPipeline.create(checkedSupplier));
    }

    public static empty<S>(): Stream<S> {
        return PipelineStream.of<S>([]);
    }

    private getNextProcessedItem(): Optional<any> {
        this.processingStarted = true;
        return this.pipeline.getNextResult();
    }

    //todo test case should NOT pull another item is short circuit happens
    public allMatch(predicate: Predicate<T>): boolean {
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (predicate(nextItem.get()) === false) {
                return false;
            }
            nextItem = this.getNextProcessedItem();
        }
        return true;
    }

    public noneMatch(predicate: Predicate<T>): boolean {
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (predicate(nextItem.get()) === true) {
                return false;
            }
            nextItem = this.getNextProcessedItem();
        }
        return true;
    }

    public anyMatch(predicate: Predicate<T>): boolean {
        let nextItem: Optional<T> = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (predicate(nextItem.get()) === true) {
                return true;
            }
            nextItem = this.getNextProcessedItem();
        }
        return false;
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

    public peek<U>(consumer: Consumer<T>): Stream<T> {
        const newPipeline = this.newPipeline(Processor.peekProcessor(consumer));
        return new PipelineStream<S, T>(newPipeline);
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

    public distinct(equalsFunction?: BiPredicate<T, T>): Stream<T> {
        const equalsFunctionToUse: BiPredicate<T, T> = equalsFunction ? equalsFunction : BiPredicate.defaultEquality
        const newPipeline = this.newPipeline(Processor.distinctProcessor(equalsFunctionToUse));
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

    public max(comparator?: Comparator<T>): Optional<T> {
        const comparatorToUse: Comparator<T> = comparator ? comparator : Comparator.default;

        let maxValue = this.getNextProcessedItem();
        let nextValue = maxValue;
        while (nextValue.isPresent()) {
            const result: number = comparatorToUse(nextValue.get(), maxValue.get());
            if (result > 0) {
                maxValue = nextValue;
            }
            nextValue = this.getNextProcessedItem();
        }

        return maxValue;
    }

    public min(comparator?: Comparator<T>): Optional<T> {
        const comparatorToUse: Comparator<T> = comparator ? comparator : Comparator.default;

        let minValue = this.getNextProcessedItem();
        let nextValue = minValue;
        while (nextValue.isPresent()) {
            const result: number = comparatorToUse(nextValue.get(), minValue.get());
            if (result < 0) {
                minValue = nextValue;
            }
            nextValue = this.getNextProcessedItem();
        }
        return minValue;
    }
    public reduce(accumulator: BiFunction<T>, initialValue?: T): Optional<T> {
        let currentValue: Optional<T> = Optional.ofNullable(initialValue);
        let nextItem = this.getNextProcessedItem();
        while (nextItem.isPresent()) {
            if (currentValue.isPresent()) {
                currentValue = Optional.of(accumulator(currentValue.get(), nextItem.get()));
            } else {
                currentValue = nextItem;
            }
            nextItem = this.getNextProcessedItem();
        }
        return currentValue;
    }

    public toArray(): T[] {
        return this.collect(Collectors.toList());
    }

}
