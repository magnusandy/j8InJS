import { Transformer, Supplier, BiConsumer, Consumer, Predicate, BiPredicate, Comparator, BiFunction } from "./functions";
import { Collector } from "./collectors";
import { Optional } from "./optional";
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
     * Intermediate Operation
     * similar idea to flatMap or flatMapList, takes in a transformer function that
     * returns a optional, and returns a stream of actual values of the optional
     * results that include a value, functionally equivelant to
     * stream.map(transformer).filter(o => o.isPresent()).map(o => o.get())
     * @param transformer
     */
    flatMapOptional<U>(transformer: Transformer<T, Optional<U>>): Stream<U>;
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
    toArray(): T[];
}
export interface StreamIterator<T> {
    hasNext(): boolean;
    getNext(): Optional<T>;
    tryAdvance(consumer: Consumer<T>): boolean;
}
export declare const Stream: {
    /**
     * Creates a new stream from the given source array
     * @param source
     */
    of<T>(source: T[]): Stream<T>;
    /**
     * Creates a new stream from the given source values
     * @param source
     */
    ofValues<T>(...values: T[]): Stream<T>;
    /**
     * creates a stream of a single element with the given source value;
     * @param value
     */
    ofValue<T>(value: T): Stream<T>;
    /**
     * creates an empty Stream
     */
    empty<T>(): Stream<T>;
    /**
     * generates a infinite stream where elements are generated
     * by the given supplier.
     * @param supplier
     */
    generate<T>(supplier: Supplier<T>): Stream<T>;
    /**
     * creates an infinte stream of values by incrementally applying getNext to
     * the last item in the stream, so you have a stream like:
     * seed, getNext(seed), getNext(getNext(seed)), etc
     * @param seed initial value of the stream
     * @param getNext transforming function applied at each step
     */
    iterate<T>(seed: T, getNext: Transformer<T, T>): Stream<T>;
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
    range(startInclusive: number, endExclusive: number, step?: number | undefined): Stream<number>;
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
    rangeClosed(startInclusive: number, endInclusive: number, step?: number | undefined): Stream<number>;
};
