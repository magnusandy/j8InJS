import { Processor } from "./processor";
import { Optional } from "./optional";
import { Source } from "./source";
/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first,
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
export declare class ProcessorPipeline<S, F> {
    private initialFeed;
    private headProcessor;
    private tailProcessor;
    private constructor();
    /**
     * returns true if there is still unprocessed items or items still remaining in the
     * processing queue. hasNext = true does not garentee that getNextResult will be a
     * non-empty value.
     */
    hasNext(): boolean;
    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor
     */
    static create<S>(source: Source<S>): ProcessorPipeline<S, S>;
    /**
     * adds a new processor to the end of the pipeline, returning a new pipeline
     * @param addedProcessor
     */
    addProcessor<NF>(addedProcessor: Processor<F, NF>): ProcessorPipeline<S, NF>;
    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty.
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    getNextResult(): Optional<F>;
}
/**
 * represents a node in the processing pipeline, may or may not have a node before and after.
 */
export declare class ProcessorNode<I, O> {
    private previousNode;
    private thisProcessor;
    private nextNode;
    constructor(processor: Processor<I, O>);
    private getNextProcessedOutput;
    addNextNode(next: ProcessorNode<O, any>): void;
    addPreviousNode(previousProcessor: ProcessorNode<any, I>): void;
    getPreviousNode(): Optional<ProcessorNode<any, I>>;
    getNextNode(): Optional<ProcessorNode<O, any>>;
    addInput(input: I): void;
    isStateless(): boolean;
    hasNext(): boolean;
    /**
     * pulls all the values out of the previous processor, if one exists
     * and add them into the current processor;
     */
    statefulPullAndGet(): Optional<O>;
    /**
     * goes to the current processor, pulling values out of it first, if there is nothing left in the
     * current processor, attempt to add new items to the current processor from the previous upstream processor.
     */
    statelessGet(): Optional<O>;
    /**
     * Returns a value that has been processed by this processor,
     * if no items exist in the processor, it attempts to run more items
     * through from the previous node in the pipeline.
     *
     * if the current processor is a stateful processor, this function
     * will greedily pull all items from the previous node into itself
     * before processing and returning any values.
     *
     *
     */
    getProcessedValue(): Optional<O>;
}
