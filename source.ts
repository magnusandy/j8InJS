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

    public hasNext(): boolean {
        return true;
    }
}

/**
 * An infinite source that continually applies a function to a previous result, starting with the seed object
 * 
 * seed, transformer(seed), transformer(transformer(seed)), etc
 */
class IterateSource<S> extends InfiniteSource<S> {
    private seed: S;
    private currentValue: Optional<S>;
    private transformer: Transformer<S, S>;

    constructor(seed: S, transformer: Transformer<S, S>) {
        super();
        this.seed = seed;
        this.currentValue = Optional.empty();
        this.transformer = transformer;
    }

    public get(): S {
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
    private supplier: Supplier<S>;

    constructor(supplier: Supplier<S>) {
        super();
        this.supplier = supplier;
    }

    public get(): S {
        return this.supplier();
    }
}

/**
 * a source coming from an array, it is not infinite
 */
class ArraySource<S> implements Source<S> {
    private array: S[];

    constructor(arraySource: S[]) {
        this.array = arraySource.slice();
    }

    public get(): S | undefined {
        return this.array.shift();
    }

    public hasNext(): boolean {
        return this.array.length !== 0;
    }
}

/**
 * source used for concatination of streams
 */
class ConcatSource<S> implements Source<Optional<S>> {
    private stream1Iterator: StreamIterator<S>;
    private stream2Iterator: StreamIterator<S>;

    constructor(stream1: Stream<S>, stream2: Stream<S>) {
        this.stream1Iterator = stream1.streamIterator();
        this.stream2Iterator = stream2.streamIterator();
    }

    public get(): Optional<S> {
        const { stream1Iterator, stream2Iterator } = this;
        if (stream1Iterator.hasNext()) {
            return stream1Iterator.getNext();
        } else {
            return stream2Iterator.getNext();
        }
    }

    public hasNext(): boolean {
        return this.stream1Iterator.hasNext() || this.stream2Iterator.hasNext()
    }
}

/**
 * creates a source of number  based on the given start and end bounds and the step size
 * a limited source counting until the values get to the end bound.
 */
class RangeSource implements Source<number> {
    private startInclusive: number;
    private endExclusive: number;
    private step: number;
    private nextValue: number;
    private comparator: BiPredicate<number, number>;

    constructor(startInclusive: number, endExclusive: number, step?: number) {
        const isAscending = startInclusive <= endExclusive; 

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

    public get(): number {
        const next = this.nextValue;
        this.nextValue = next + this.step;
        return next;
    }

    public  hasNext(): boolean {
        return this.comparator(this.nextValue, this.endExclusive);
    }
}
