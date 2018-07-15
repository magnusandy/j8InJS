import { Transformer, Supplier, BiConsumer, Consumer, Predicate } from "./functions";
import { Collector } from "./collectors";
export interface Stream<T> {
    allMatch(predicate: Predicate<T>): boolean;
    anyMatch(predicate: Predicate<T>): boolean;
    map<U>(transformer: Transformer<T, U>): Stream<U>;
    forEach(consumer: Consumer<T>): void;
    defaultCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R;
    collect<R, A>(collector: Collector<T, A, R>): R;
    builder(): StreamBuilder<T>;
}
export declare const stream: <T>(source: T[]) => Stream<T>;
export interface StreamBuilder<T> {
    accept(item: T): void;
    add(item: T): StreamBuilder<T>;
    addAll(itemList: T[]): StreamBuilder<T>;
    build(): Stream<T>;
}
