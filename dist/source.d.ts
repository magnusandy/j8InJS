import { Transformer, Supplier } from "./functions";
import { Optional } from "./optional";
import { Stream } from "./stream";
/**
 * Defines the basic outline of a stream source, it needs to be iterable
 * and checkable as to if it has a next item.
 */
export interface Source<T> {
    /**
     * Returns a value if exists in the supplier, otherwise undefined. isEmpty() can be
     * used to reliably check if a value exists.
     */
    get(): T | undefined;
    /**
     * returns true if no more values will be returned by this supplier through get();
     */
    hasNext(): boolean;
}
export declare const Source: {
    iterateSource: <S>(seed: S, transformer: Transformer<S, S>) => Source<S>;
    supplierSource: <S>(supplier: Supplier<S>) => Source<S>;
    arraySource: <S>(array: S[]) => Source<S>;
    concatSource: <S>(stream1: Stream<S>, stream2: Stream<S>) => Source<Optional<S>>;
    rangeSource: (startInclusive: number, endExclusive: number, step?: number | undefined) => Source<number>;
};
