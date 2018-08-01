import { Processor } from "./processor";
import { Optional } from "./optional";
import { Transformer } from "./functions";
import { Source } from "./source";

/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first, 
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
export class ProcessorPipeline<S, F> {

    private initialFeed: InitialFeedProcessorNode<S>;
    private headProcessor: ProcessorNode<S, any>;
    private tailProcessor: ProcessorNode<any, F>;

    private constructor(initialFeed: InitialFeedProcessorNode<S>, headNode: ProcessorNode<S, any>, tailNode: ProcessorNode<any, F>) {
        this.initialFeed = initialFeed;
        this.headProcessor = headNode;
        this.tailProcessor = tailNode;
        this.headProcessor.addPreviousNode(this.initialFeed);
    }

    /**
     * returns true if there is still unprocessed items or items still remaining in the 
     * processing queue. hasNext = true does not garentee that getNextResult will be a 
     * non-empty value.
     */
    public hasNext(): boolean {
        return this.tailProcessor.hasNext();
    }

    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor 
     */
    public static create<S>(source: Source<S>): ProcessorPipeline<S, S> {
        const initialNode = new InitialFeedProcessorNode<S>(source);
        const node = new ProcessorNode<S, S>(Processor.mapProcessor(Transformer.identity()));
        return new ProcessorPipeline(initialNode, node, node);
    }

    /**
     * adds a new processor to the end of the pipeline, returning a new pipeline
     * @param addedProcessor 
     */
    public addProcessor<NF>(addedProcessor: Processor<F, NF>): ProcessorPipeline<S, NF> {
        const newNode = new ProcessorNode(addedProcessor);
        const oldTail = this.tailProcessor;
        oldTail.addNextNode(newNode);
        newNode.addPreviousNode(oldTail);

        return new ProcessorPipeline<S, NF>(this.initialFeed, this.headProcessor, newNode)
    }

    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty. 
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    public getNextResult(): Optional<F> {
        if (this.hasNext()) { 
            const possibleValue: Optional<F> = this.tailProcessor.getProcessedValue();
            if (possibleValue.isPresent()) {
                return possibleValue;
            } else {
                return this.getNextResult();
            }
        } 
        return Optional.empty();
    }
}

/**
 * represents a node in the processing pipeline, may or may not have a node before and after.
 */
export class ProcessorNode<I, O> {
    private previousNode: Optional<ProcessorNode<any, I>>;
    private thisProcessor: Processor<I, O>;
    private nextNode: Optional<ProcessorNode<O, any>>;

    constructor(processor: Processor<I, O>) {
        this.previousNode = Optional.empty();
        this.thisProcessor = processor;
        this.nextNode = Optional.empty();
    }

    private getNextProcessedOutput(): Optional<O> {
        return this.thisProcessor.processAndGetNext();
    }

    addNextNode(next: ProcessorNode<O, any>): void {
        this.nextNode = Optional.of(next);
    }

    addPreviousNode(previousProcessor: ProcessorNode<any, I>): void {
        this.previousNode = Optional.of(previousProcessor);
    }

    getPreviousNode(): Optional<ProcessorNode<any, I>> {
        return this.previousNode;
    }

    getNextNode(): Optional<ProcessorNode<O, any>> {
        return this.nextNode;
    }

    addInput(input: I): void {
        this.thisProcessor.add(input);
    }

    isStateless(): boolean {
        return this.thisProcessor.isStateless();
    }

    hasNext(): boolean {
        if(this.thisProcessor.isShortCircuting()) {
            const hasPreviousAndItHasValues = this.getPreviousNode().isPresent() ? this.getPreviousNode().get().hasNext() : false;
            return this.thisProcessor.hasNext() && hasPreviousAndItHasValues;
        } else {
            const hasPreviousAndItHasValues = this.getPreviousNode().isPresent() ? this.getPreviousNode().get().hasNext() : false;
            return this.thisProcessor.hasNext() || hasPreviousAndItHasValues;
        }
    }

    /**
     * pulls all the values out of the previous processor, if one exists
     * and add them into the current processor;
     */
    statefulPullAndGet(): Optional<O> {
        if (this.previousNode.isPresent()) {
            const previousNode = this.previousNode.get();
            while (previousNode.hasNext()) {
                let previousVal: Optional<I> = previousNode.getProcessedValue();
                if(previousVal.isPresent()) {
                    this.addInput(previousVal.get());
                }
            }
        }
        return this.getNextProcessedOutput();;
    }

    /**
     * goes to the current processor, pulling values out of it first, if there is nothing left in the 
     * current processor, attempt to add new items to the current processor from the previous upstream processor.
     */
    statelessGet(): Optional<O> {
        if (this.thisProcessor.hasNext() && !this.thisProcessor.isShortCircuting()) {
            return this.thisProcessor.processAndGetNext();
        } else if (this.previousNode.isPresent()) {
            const processedValue: Optional<I> = this.previousNode.get().getProcessedValue();
            if (processedValue.isPresent()) {
                this.addInput(processedValue.get());
                return this.thisProcessor.processAndGetNext();
            }
        }
        return Optional.empty();
    }

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
    getProcessedValue(): Optional<O> {
        return this.isStateless()
            ? this.statelessGet()
            : this.statefulPullAndGet();
    }
}

/**
 * a special processor node that acts as a supplier for the rest of the pipeline
 * pulling from a Source
 */
class InitialFeedProcessorNode<I> extends ProcessorNode<I, I> {
    
    private source: Source<I>;

    constructor(supplier: Source<I>) {
        super(Processor.mapProcessor(Transformer.identity()));
        this.source = supplier;
    }   

    public hasNext(): boolean {
        return this.source.hasNext();
    }

    public getProcessedValue(): Optional<I> {
        return Optional.ofNullable(this.source.get());
    }
}