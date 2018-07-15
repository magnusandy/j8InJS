import { Transformer, Consumer } from "./functions";
export interface Stream<T> {
    map<U>(transformer: Transformer<T, U>): Stream<U>;
    forEach(consumer: Consumer<T>): void;
}
export declare const stream: <T>(source: T[]) => Stream<T>;
export interface StreamBuilder<T> {
    accept(item: T): void;
    add(item: T): StreamBuilder<T>;
    addAll(itemList: T[]): StreamBuilder<T>;
}
