import { Transformer, Supplier, BiPredicate } from "./functions";
import { Optional } from "./optional";
import { StreamIterator, Stream } from "./stream";

/**
 * Defines the basic outline of a stream source, it needs to be iterable
 * and checkable as to if it has a next item. 
 */
export interface Source<T> {
    /**
     * Returns a value if exists in the supplier, otherwise undefined. isEmpty() can be
     * used to reliably check if a value exists.
     */
    get(): T | undefined,

    /**
     * returns true if no more values will be returned by this supplier through get();
     */
    hasNext(): boolean;
}

//todo test all
export const Source = {
    iterateSource: <S>(seed: S, transformer: Transformer<S, S>): Source<S> => new IterateSource(seed, transformer),
    supplierSource: <S>(supplier: Supplier<S>): Source<S> => new SupplierSource(supplier),
    arraySource: <S>(array: S[]): Source<S> => new ArraySource(array),
    concatSource: <S>(stream1: Stream<S>, stream2: Stream<S>): Source<Optional<S>> => new ConcatSource(stream1, stream2),
    rangeSource: (startInclusive: number, endExclusive: number, step?: number): Source<number> => new RangeSource(startInclusive, endExclusive, step),
}

/**
 * Infinite source, always has a next value
 */
abstract class InfiniteSource<S> implements Source<S> {
    abstract get(): S;

    hasNext(): boolean {
        return true;
    }
}

/**
 * An infinite source that continually applies a function to a previous result, starting with the seed object
 * 
 * seed, transformer(seed), transformer(transformer(seed)), etc
 */
class IterateSource<S> extends InfiniteSource<S> {
    seed: S;
    currentValue: Optional<S>;
    transformer: Transformer<S, S>;

    constructor(seed: S, transformer: Transformer<S, S>) {
        super();
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
}

/**
 * basic infinite Source coming from a Supplier function
 */
class SupplierSource<S> extends InfiniteSource<S> {
    supplier: Supplier<S>;

    constructor(supplier: Supplier<S>) {
        super();
        this.supplier = supplier;
    }

    get(): S {
        return this.supplier();
    }
}

/**
 * a source coming from an array, it is not infinite
 */
class ArraySource<S> implements Source<S> {
    array: S[];

    constructor(arraySource: S[]) {
        this.array = arraySource.slice();
    }

    get(): S | undefined {
        return this.array.shift();
    }

    hasNext(): boolean {
        return this.array.length !== 0;
    }
}

/**
 * source used for concatination of streams
 */
class ConcatSource<S> implements Source<Optional<S>> {
    stream1Iterator: StreamIterator<S>;
    stream2Iterator: StreamIterator<S>;

    constructor(stream1: Stream<S>, stream2: Stream<S>) {
        this.stream1Iterator = stream1.streamIterator();
        this.stream2Iterator = stream2.streamIterator();
    }

    get(): Optional<S> {
        const { stream1Iterator, stream2Iterator } = this;
        if (stream1Iterator.hasNext()) {
            return stream1Iterator.getNext();
        } else {
            return stream2Iterator.getNext();
        }
    }

    hasNext(): boolean {
        return this.stream1Iterator.hasNext() || this.stream2Iterator.hasNext()
    }
}


/*
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
*/

class RangeSource implements Source<number> {
    startInclusive: number;
    endExclusive: number;
    step: number;
    nextValue: number;
    comparator: BiPredicate<number, number>;

    constructor(startInclusive: number, endExclusive: number, step?: number) {
        const isAscending = startInclusive <= endExclusive; //todo does = work

        this.comparator = isAscending
            ? (n1, n2) => n1 < n2
            : (n1, n2) => n1 > n2;

        this.step = isAscending
            ? step ? Math.abs(step) : 1
            : step ? (0 - Math.abs(step)) : -1;

        this.startInclusive = startInclusive;
        this.endExclusive = endExclusive;
        this.nextValue = startInclusive;
    }

    get(): number {
        const next = this.nextValue;
        this.nextValue = next + this.step;
        return next;
    }
    hasNext(): boolean {
        return this.comparator(this.nextValue, this.endExclusive);
    }
}
