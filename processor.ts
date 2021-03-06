import { Function, Predicate, BiPredicate, Consumer, Comparator } from "./functions";
import Optional from "./optional";
import Stream, { StreamIterator } from "./stream";

/**
 * A Processor describes a operation to be applied to a given input to transform it
 * into a given output, the number of outputs can be 0-many for any given input.
 * 
 * The processor class is intended to be a lazy processing node, computations
 * should only be undertaken when an output is actually called for (i.e. when getNext is called)
 * for stateless operations, this means that every input should only be processed when its consumed
 * for stateful operations, all inputs will be processed on the first call to getNext()
 * 
 * stateful operations should be given ALL the inputs for a desired computation, where as 
 * stateless operations should support being given individual inputs at a time. and being
 * processed one a a time;
 * 
 */
export interface Processor<Input, Output> {
    /**
     * returns true is there is still elements waiting to be processed and/or
     * fetched from the given processor. if false is returned, the processor is
     * currently exhausted.
     */
    hasNext(): boolean;

    /**
     * returns a processed value if this function returns
     * Optional.empty() this is NOT an indication that the processor
     * is exhausted, hasNext will accurately return if there is more
     * values;
     */
    processAndGetNext(): Optional<Output>;

    /**
     * Adds an item to the processing queue, this function should NOT
     * process the value when its added.
     * @param input item to add to the processing queue
     */
    add(input: Input): void;

    /**
     * returns true if the given processor is a stateless operation
     */
    isStateless(): boolean;

    /**
     * returns true if the given processor is a short circuting operation
     */
    isShortCircuting(): boolean;
}

export const Processor = {
    mapProcessor: <I, O>(Function: Function<I, O>): Processor<I, O> => new MapProcessor<I, O>(Function),
    filterProcessor: <I>(predicate: Predicate<I>): Processor<I, I> => new FilterProcessor<I>(predicate),
    listFlatMapProcessor: <I, O>(Function: Function<I, O[]>): Processor<I, O> => new ListFlatMapProcessor(Function),
    distinctProcessor: <I>(comparator: BiPredicate<I, I>): Processor<I, I> => new DistinctProcessor<I>(comparator),
    limitProcessor: <I>(limit: number): Processor<I, I> => new LimitProcessor<I>(limit),//todo test
    streamFlatMapProcessor: <I, O>(Function: Function<I, Stream<O>>): Processor<I, O> => new StreamFlatMapProcessor(Function),
    peekProcessor: <I>(consumer: Consumer<I>): Processor<I, I> => new PeekProcessor(consumer),
    optionalFlatMapProcessor: <I, O>(Function: Function<I, Optional<O>>): Processor<I, O> => new OptionalFlatMapProcessor(Function),
    skipProcessor: <I>(numberToSkip: number): Processor<I, I> => new SkipProcessor(numberToSkip),
    sortProcessor: <I>(comparator: Comparator<I>): Processor<I, I> => new SortProcessor(comparator),
}

/**
 * Abstract processor that implements the storage and retrieval of items from 
 * the processing queue.
 */
abstract class AbstractProcessor<Input, Output> implements Processor<Input, Output> {
    protected inputs: Input[];

    constructor() {
        this.inputs = [];
    }

    public add(input: Input): void {
        this.inputs.push(input);
    }

    protected takeNextInput(): Optional<Input> {
        return Optional.ofNullable(this.inputs.shift());
    }

    public hasNext(): boolean {
        return this.inputs.length > 0;
    }

    abstract processAndGetNext(): Optional<Output>;
    abstract isStateless(): boolean;
    abstract isShortCircuting(): boolean;
}

/**
 * Abstract processor that is stateless and not short circuiting
 */
abstract class PureStatelessProcessor<Input, Output> extends AbstractProcessor<Input, Output> {

    public isStateless(): boolean {
        return true;
    }

    public isShortCircuting(): boolean {
        return false;
    }

    abstract processAndGetNext(): Optional<Output>;
}

class LimitProcessor<Input> extends AbstractProcessor<Input, Input> {
    private readonly limit: number;
    private count: number;

    public constructor(limit: number) {
        super();
        this.limit = limit;
        this.count = 0;
    }

    public processAndGetNext(): Optional<Input> {
        if (this.count < this.limit) {
            this.count++;
            return this.takeNextInput();
        } else {
            return Optional.empty();
        }
    }

    public hasNext(): boolean {
        return (this.count < this.limit);
    }

    public isStateless(): boolean {
        return true;
    }

    public isShortCircuting(): boolean {
        return true;
    }
}

/**
 * This is a stateful processor, that will return distinct elements provided all 
 * the inputs are given at the start, and no elements are injected mid processing
 */
class DistinctProcessor<Input> extends AbstractProcessor<Input, Input> {

    private comparator: BiPredicate<Input, Input>;
    private distinctList: Input[];

    constructor(comparator: BiPredicate<Input, Input>) {
        super();
        this.comparator = comparator;
        this.distinctList = []
    }

    //distinct if stateful in the sense that it needs to keep track
    //of previous elements, but it does NOT need to greedily accumulate values
    public isStateless(): boolean {
        return true;
    }

    public isShortCircuting(): boolean {
        return false;
    }

    public hasNext(): boolean {
        return this.inputs.length > 0;
    }

    public processAndGetNext(): Optional<Input> {
        return this.takeNextInput().filter(i => this.addIfUnique(i));
    }

    /**
     * checks to see if the item is unique, adds it to the list if it is, 
     * returns true if the value is distinct, otherwise false
     * @param item 
     */
    public addIfUnique(item: Input): boolean {
        const doesMatchItem = (distinct: Input): boolean => this.comparator(item, distinct);
        const matchingItems = this.distinctList.filter(doesMatchItem);
        if (matchingItems.length === 0) {
            this.distinctList.push(item)
            return true;
        } else {
            return false;
        }
    }
}

class SortProcessor<Input> extends AbstractProcessor<Input, Input> {

    private comparator: Comparator<Input>;
    private sortedList: Optional<Input[]>;

    constructor(comparator: Comparator<Input>) {
        super();
        this.comparator = comparator;
        this.sortedList = Optional.empty();
    }

    private processValues(): void {
        const list = this.inputs.slice();
        list.sort(this.comparator);
        this.inputs = [];
        this.sortedList = Optional.of(list);
    }

    public hasNext(): boolean {
        const sortedListExistsAndHasValues = this.sortedList.isPresent() ? this.sortedList.get().length > 0 : false;
        return this.inputs.length > 0 || sortedListExistsAndHasValues;
    }

    public processAndGetNext(): Optional<Input> {
        if (!this.sortedList.isPresent()) {
            this.processValues();
            return this.processAndGetNext();
        } else {
            return Optional.ofNullable(this.sortedList.get().shift());
        }
    }

    public isStateless(): boolean {
        return false;
    }

    public isShortCircuting(): boolean {
        return false;
    }
}
/**
 * Implemention of a Processor for value mapping, lazily transforms values
 * when returned from the processor. 
 */
class MapProcessor<Input, Output> extends PureStatelessProcessor<Input, Output> {

    private Function: Function<Input, Output>;

    public constructor(Function: Function<Input, Output>) {
        super();
        this.Function = Function;
    }

    //pull values off the start
    public processAndGetNext(): Optional<Output> {
        return this.takeNextInput().map(this.Function);
    }
}

/**
 * Implemention of a Processor for consuming a value,intermediately but not not 
 * altering the stream.
 */
class PeekProcessor<Input> extends PureStatelessProcessor<Input, Input> {

    private consumer: Consumer<Input>;

    public constructor(consumer: Consumer<Input>) {
        super();
        this.consumer = consumer;
    }

    public processAndGetNext(): Optional<Input> {
        const item = this.takeNextInput();
        item.ifPresent(this.consumer);
        return item;
    }
}

/**
 * Stateless process, filters input items against a given predicated, only
 * returning those who match against the given predicate.
 */
class FilterProcessor<Input> extends PureStatelessProcessor<Input, Input> {
    private predicate: Predicate<Input>;

    public constructor(predicate: Predicate<Input>) {
        super();
        this.predicate = predicate;
    }

    public processAndGetNext(): Optional<Input> {
        return this.takeNextInput().filter(this.predicate);
    }
}

/**
 * stateless processor, removes the given number of values before continuing to return values
 * given value must be positive, or nothing is skipped
 */
class SkipProcessor<Input> extends PureStatelessProcessor<Input, Input> {
    amountToSkip: number;

    constructor(amountToSkip: number) {
        super();
        this.amountToSkip = amountToSkip;
    }

    processAndGetNext(): Optional<Input> {
        if (this.amountToSkip > 0) {
            this.amountToSkip = this.amountToSkip - 1;
            this.takeNextInput(); //throw away
            return Optional.empty();
        } else {
            return this.takeNextInput();
        }
    }
}

/**
 * returns a one to many mapping of elements, transforms input elements into
 * a list of output elements, returning the values off the output lists, one list
 * at a time, lazily transforming inputs only when the previous list is exhausted.
 */
class ListFlatMapProcessor<Input, Output> extends PureStatelessProcessor<Input, Output> {
    private outputList: Output[];
    private Function: Function<Input, Output[]>;

    constructor(Function: Function<Input, Output[]>) {
        super();
        this.Function = Function;
        this.outputList = [];
    }

    public hasNext(): boolean {
        return (this.outputList.length > 0 || this.inputs.length > 0);
    }

    public processAndGetNext(): Optional<Output> {
        if (this.outputList.length > 0) {
            return Optional.ofNullable(this.outputList.shift());
        } else if (this.inputs.length > 0) {
            const nextSource: Optional<Input> = this.takeNextInput();
            if (nextSource.isPresent()) {
                this.outputList = [...this.Function(nextSource.get())];
                return this.processAndGetNext();
            }
        }
        return Optional.empty();
    }
}

/**
 * one to many mapping transformation, transforms elements through the stream bearing 
 * transformation operation, and lazily returns elements off the resulting streams
 * one a time.
 */
class StreamFlatMapProcessor<Input, Output> extends PureStatelessProcessor<Input, Output> {
    private outputSpliterator?: StreamIterator<Output>;
    private Function: Function<Input, Stream<Output>>;

    constructor(Function: Function<Input, Stream<Output>>) {
        super();
        this.Function = Function;
    }

    public hasNext(): boolean {
        return ((this.outputSpliterator && this.outputSpliterator.hasNext()) || this.inputs.length > 0);
    }

    public processAndGetNext(): Optional<Output> {
        if (this.outputSpliterator && this.outputSpliterator.hasNext()) {
            return this.outputSpliterator.getNext();
        } else if (this.inputs.length > 0) {
            const nextSource: Optional<Input> = this.takeNextInput();
            if (nextSource.isPresent()) {
                this.outputSpliterator = this.Function(nextSource.get()).streamIterator();
                return this.processAndGetNext();
            }
        }
        return Optional.empty();
    }
}

/**
 * Processor that takes in source values, and transforms them through an optional bearing
 * Function, and returns the values in a flattened optional state
 */
class OptionalFlatMapProcessor<Input, Output> extends PureStatelessProcessor<Input, Output> {
    private Function: Function<Input, Optional<Output>>;

    constructor(Function: Function<Input, Optional<Output>>) {
        super();
        this.Function = Function;
    }

    public processAndGetNext(): Optional<Output> {
        return this.takeNextInput().flatMap(this.Function);
    }
}