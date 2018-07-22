import { Processor } from "./processor";
import { Optional } from "./optional";

/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first, 
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
export class ProcessorPipeline<Source, Final> {

    private elementQueue: Source[];
    private headProcessor: ProcessorNode<Source, any>;
    private tailProcessor: ProcessorNode<any, Final>;

    private constructor(headNode: ProcessorNode<Source, any>, tailNode: ProcessorNode<any, Final>) {
        this.elementQueue = [];
        this.headProcessor = headNode;
        this.tailProcessor = tailNode;
    }

    private isProcessorChainEmpty(): boolean {
        let currentNode = this.headProcessor;
        if (currentNode.getProcessor().hasNext()) {
            return false;
        }
        while (currentNode.getNext().isPresent()) { //todo test
            currentNode = currentNode.getNext().get();
            if (currentNode.getProcessor().hasNext()) {
                return false;
            }
        }
        return true;
    }

    /**
     * returns true if any of the operations in the pipeline are stateful operations
     * if the pipeline contains any stateful operations, it is necessary to pass in 
     * ALL elements that you want processed at the start, in order to return the correct result
     */
    public containsStateful(): boolean {
        let currentNode = this.headProcessor;
        if (!currentNode.getProcessor().isStateless()) {
            return true;
        }
        while (currentNode.getNext().isPresent()) {
            currentNode = currentNode.getNext().get();
            if (!currentNode.getProcessor().isStateless()) {
                return true;
            }
        }
        return false;
    }

    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor 
     */
    public static create<S, F>(initalProcessor: Processor<S, F>): ProcessorPipeline<S, F> {
        const node = new ProcessorNode<S, F>(initalProcessor);
        return new ProcessorPipeline(node, node);
    }

    /**
     * adds a new processor to the end of the pipeline, returning a new pipeline
     * @param addedProcessor 
     */
    public addProcessor<NewFinal>(addedProcessor: Processor<Final, NewFinal>): ProcessorPipeline<Source, NewFinal> {
        const newNode = new ProcessorNode(addedProcessor);
        const oldTail = this.tailProcessor;
        oldTail.addNext(newNode);
        newNode.addPrevious(oldTail);

        return new ProcessorPipeline<Source, NewFinal>(this.headProcessor, newNode)
    }

    /**
     * adds an item to the processing queue, this item will not be processed immediately. 
     * @param item 
     */
    public addItem(item: Source) {
        this.elementQueue.push(item);
    }

    /**
     * returns true if there is still unprocessed items or items still remaining in the 
     * processing queue. hasNext = true does not garentee that getNextResult will be a 
     * non-empty value.
     */
    public hasNext(): boolean {
        return !this.isProcessorChainEmpty() || this.elementQueue.length > 0;
    }

    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty. 
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    public getNextResult(): Optional<Final> {
        if (!this.isProcessorChainEmpty()) { //still items in the chain
            const possibleValue: Optional<Final> = this.tailProcessor.getProcessedValue();
            if (possibleValue.isPresent()) {
                return possibleValue;
            } else {
                return this.getNextResult();
            }
        } else if (this.elementQueue.length > 0) {
            if (this.containsStateful()) {
                this.elementQueue.forEach(e => this.headProcessor.getProcessor().add(e))
                this.elementQueue = [];
                return this.getNextResult();
            } else {
                const nextElement = Optional.ofNullable(this.elementQueue.shift());
                nextElement.ifPresent(element => this.headProcessor.getProcessor().add(element));
                return this.getNextResult();
            }
        }
        return Optional.empty();
    }
}

/**
 * represents a node in the processing pipeline, may or may not have a node before and after.
 */
class ProcessorNode<Input, Output> {
    private previousNode: Optional<ProcessorNode<any, Input>>;
    private thisProcessor: Processor<Input, Output>;
    private nextNode: Optional<ProcessorNode<Output, any>>;

    constructor(processor: Processor<Input, Output>) {
        this.previousNode = Optional.empty();
        this.thisProcessor = processor;
        this.nextNode = Optional.empty();
    }

    addNext(next: ProcessorNode<Output, any>): void {
        this.nextNode = Optional.of(next);
    }

    addPrevious(previousProcessor: ProcessorNode<any, Input>): void {
        this.previousNode = Optional.of(previousProcessor);
    }

    getNext(): Optional<ProcessorNode<Output, any>> {
        return this.nextNode;
    }

    getProcessor(): Processor<Input, Output> {
        return this.thisProcessor;
    }

    /**
     * Returns a value that has been processed by this processor, 
     * if no items exist in the processor, it attempts to run more items
     * through from the previous node in the pipeline.
     * 
     * if the current processor is a stateful processor, this function 
     * will greedily pull all items from the previous node into itself 
     * before processing and returning any values. 
     */
    getProcessedValue(): Optional<Output> {
        if (!this.getProcessor().isStateless()) {
            //need to greedily pull all values from previous node
            if (this.previousNode.isPresent()) {
                let previousVal: Optional<Input> = this.previousNode.get().getProcessedValue();
                while (previousVal.isPresent()) {
                    this.getProcessor().add(previousVal.get());
                    previousVal = this.previousNode.get().getProcessedValue();
                }
            }
            //else we assume it has all its inputs
            return this.getProcessor().getNext();
        } else { // stateless
            if (this.thisProcessor.hasNext()) {
                const next: Optional<Output> = this.thisProcessor.getNext();
                if (next.isPresent()) {
                    return next;
                } else {
                    return this.getProcessedValue();
                }
            } else if (this.previousNode.isPresent()) { //try filling the processor with output of the previous node
                const processedValue: Optional<Input> = this.previousNode.get().getProcessedValue();
                if (processedValue.isPresent()) {
                    this.getProcessor().add(processedValue.get());
                    return this.getProcessedValue();
                }
            }
        }
        return Optional.empty();
    }
}