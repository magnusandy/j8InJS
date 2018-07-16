import { Transformer, Supplier, BiConsumer, Consumer, Predicate } from "./functions";
import { Collector } from "./collectors";
import { Optional } from "./optional";
export interface Stream<T> {
    allMatch(predicate: Predicate<T>): boolean;
    anyMatch(predicate: Predicate<T>): boolean;
    count(): number;
    findFirst(): Optional<T>;
    findAny(): Optional<T>;
    map<U>(transformer: Transformer<T, U>): Stream<U>;
    forEach(consumer: Consumer<T>): void;
    defaultCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R;
    collect<R, A>(collector: Collector<T, A, R>): R;
    builder(): StreamBuilder<T>;
}
export declare const Stream: {
    /**
     * Creates a new stream from the given source array
     * @param source
     */
    of<T>(source: T[]): Stream<T>;
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
