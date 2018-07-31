import { Processor } from "./processor";
import { Optional } from "./optional";
import { Supplier, CheckableSupplier, Transformer } from "./functions";

/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first, 
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
export class ProcessorPipeline<Source, Final> {

    private initialFeed: InitialFeedProcessorNode<Source>;
    private headProcessor: ProcessorNode<Source, any>;
    private tailProcessor: ProcessorNode<any, Final>;

    private constructor(initialFeed: InitialFeedProcessorNode<Source>, headNode: ProcessorNode<Source, any>, tailNode: ProcessorNode<any, Final>) {
        this.initialFeed = initialFeed;
        this.headProcessor = headNode;
        this.tailProcessor = tailNode;
        this.headProcessor.addPreviousNode(this.initialFeed);
    }

    /**
     * return false if any of the processors in the pipeline
     * still have a value inside it.
     */
    protected isProcessorChainEmpty(): boolean {
        return !this.tailProcessor.hasNext();
    }

    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor 
     */
    public static create<S>(source: CheckableSupplier<S>): ProcessorPipeline<S, S> {
        const initialNode = new InitialFeedProcessorNode<S>(source);
        const node = new ProcessorNode<S, S>(Processor.mapProcessor(Transformer.identity()));
        return new ProcessorPipeline(initialNode, node, node);
    }

    /**
     * adds a new processor to the end of the pipeline, returning a new pipeline
     * @param addedProcessor 
     */
    public addProcessor<NewFinal>(addedProcessor: Processor<Final, NewFinal>): ProcessorPipeline<Source, NewFinal> {
        const newNode = new ProcessorNode(addedProcessor);
        const oldTail = this.tailProcessor;
        oldTail.addNextNode(newNode);
        newNode.addPreviousNode(oldTail);

        return new ProcessorPipeline<Source, NewFinal>(this.initialFeed, this.headProcessor, newNode)
    }

    /**
     * returns true if there is still unprocessed items or items still remaining in the 
     * processing queue. hasNext = true does not garentee that getNextResult will be a 
     * non-empty value.
     */
    public hasNext(): boolean {
        return !this.isProcessorChainEmpty();
    }

    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty. 
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    public getNextResult(): Optional<Final> {
        if (this.hasNext()) { 
            const possibleValue: Optional<Final> = this.tailProcessor.getProcessedValue();
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
export class ProcessorNode<Input, Output> {
    private previousNode: Optional<ProcessorNode<any, Input>>;
    private thisProcessor: Processor<Input, Output>;
    private nextNode: Optional<ProcessorNode<Output, any>>;

    constructor(processor: Processor<Input, Output>) {
        this.previousNode = Optional.empty();
        this.thisProcessor = processor;
        this.nextNode = Optional.empty();
    }

    private getNextProcessedOutput(): Optional<Output> {
        return this.thisProcessor.processAndGetNext();
    }

    addNextNode(next: ProcessorNode<Output, any>): void {
        this.nextNode = Optional.of(next);
    }

    addPreviousNode(previousProcessor: ProcessorNode<any, Input>): void {
        this.previousNode = Optional.of(previousProcessor);
    }

    getNextNode(): Optional<ProcessorNode<Output, any>> {
        return this.nextNode;
    }

    getPreviousNode(): Optional<ProcessorNode<any, Input>> {
        return this.previousNode;
    }

    addInput(input: Input): void {
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

    // getProcessor(): Processor<Input, Output> {
    //     return this.thisProcessor;
    // }

    /**
     * pulls all the values out of the previous processor, if one exists
     * and add them into the current processor;
     */
    statefulPullAndGet(): Optional<Output> {
        if (this.previousNode.isPresent()) {
            const previousNode = this.previousNode.get();
            while (previousNode.hasNext()) {
                let previousVal: Optional<Input> = previousNode.getProcessedValue();
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
    statelessGet(): Optional<Output> {
        if (this.thisProcessor.hasNext() && !this.thisProcessor.isShortCircuting()) { //todo explain more, we need to treat short circuiting nodes differently
            return this.thisProcessor.processAndGetNext();
        } else if (this.previousNode.isPresent()) {
            const processedValue: Optional<Input> = this.previousNode.get().getProcessedValue();
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
    getProcessedValue(): Optional<Output> {
        return this.isStateless()
            ? this.statelessGet()
            : this.statefulPullAndGet();
    }
}

/**
 * a special processor node that acts as a supplier for the rest of the pipeline
 */
class InitialFeedProcessorNode<Input> extends ProcessorNode<Input, Input> {
    
    private checkableSupplier: CheckableSupplier<Input>;

    constructor(supplier: CheckableSupplier<Input>) {
        super(Processor.mapProcessor(Transformer.identity()));
        this.checkableSupplier = supplier;
    }   

    public hasNext(): boolean {
        return !this.checkableSupplier.isEmpty();
    }

    public getProcessedValue(): Optional<Input> {
        return Optional.ofNullable(this.checkableSupplier.get());
    }
}