import { Transformer, Predicate, BiPredicate, Consumer, Comparator } from "./functions";
import { Optional } from "./optional";
import { Stream } from "./stream";
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
export declare const Processor: {
    mapProcessor: <I, O>(transformer: Transformer<I, O>) => Processor<I, O>;
    filterProcessor: <I>(predicate: Predicate<I>) => Processor<I, I>;
    listFlatMapProcessor: <I, O>(transformer: Transformer<I, O[]>) => Processor<I, O>;
    distinctProcessor: <I>(comparator: BiPredicate<I, I>) => Processor<I, I>;
    limitProcessor: <I>(limit: number) => Processor<I, I>;
    streamFlatMapProcessor: <I, O>(transformer: Transformer<I, Stream<O>>) => Processor<I, O>;
    peekProcessor: <I>(consumer: Consumer<I>) => Processor<I, I>;
    optionalFlatMapProcessor: <I, O>(transformer: Transformer<I, Optional<O>>) => Processor<I, O>;
    skipProcessor: <I>(numberToSkip: number) => Processor<I, I>;
    sortProcessor: <I>(comparator: Comparator<I>) => Processor<I, I>;
};
