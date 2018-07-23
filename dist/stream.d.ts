import { Transformer, Consumer, Predicate, BiPredicate } from "./functions";
import { Collector } from "./collectors";
export interface Stream<T> {
    collect<R, A>(collector: Collector<T, A, R>): R;
    distinctPredicate(equalsFunction: BiPredicate<T, T>): Stream<T>;
    filter(predicate: Predicate<T>): Stream<T>;
    flatMapList<U>(transformer: Transformer<T, U[]>): Stream<U>;
    forEach(consumer: Consumer<T>): void;
    map<U>(transformer: Transformer<T, U>): Stream<U>;
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
};
export interface StreamBuilder<T> {
    accept(item: T): void;
    add(item: T): StreamBuilder<T>;
    addAll(itemList: T[]): StreamBuilder<T>;
    build(): Stream<T>;
}
