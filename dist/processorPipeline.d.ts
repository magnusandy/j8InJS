import { Processor } from "./processor";
import { Optional } from "./optional";
/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first,
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
export declare class ProcessorPipeline<Source, Final> {
    private elementQueue;
    private headProcessor;
    private tailProcessor;
    private constructor();
    private isProcessorChainEmpty;
    /**
     * returns true if any of the operations in the pipeline are stateful operations
     * if the pipeline contains any stateful operations, it is necessary to pass in
     * ALL elements that you want processed at the start, in order to return the correct result
     */
    containsStateful(): boolean;
    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor
     */
    static create<S, F>(initalProcessor: Processor<S, F>): ProcessorPipeline<S, F>;
    /**
     * adds a new processor to the end of the pipeline, returning a new pipeline
     * @param addedProcessor
     */
    addProcessor<NewFinal>(addedProcessor: Processor<Final, NewFinal>): ProcessorPipeline<Source, NewFinal>;
    /**
     * adds an item to the processing queue, this item will not be processed immediately.
     * @param item
     */
    addItem(item: Source): void;
    /**
     * returns true if there is still unprocessed items or items still remaining in the
     * processing queue. hasNext = true does not garentee that getNextResult will be a
     * non-empty value.
     */
    hasNext(): boolean;
    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty.
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    getNextResult(): Optional<Final>;
}
