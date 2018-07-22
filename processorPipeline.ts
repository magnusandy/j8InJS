import { Processor } from "./processor";
import { Optional } from "./optional";

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

    public static create<S, F>(initalProcessor: Processor<S, F>): ProcessorPipeline<S, F> {
        const node = new ProcessorNode<S, F>(initalProcessor);
        return new ProcessorPipeline(node, node);
    }

    public addProcessor<NewFinal>(addedProcessor: Processor<Final, NewFinal>): ProcessorPipeline<Source, NewFinal> {
        const newNode = new ProcessorNode(addedProcessor);
        const oldTail = this.tailProcessor;
        oldTail.addNext(newNode);
        newNode.addPrevious(oldTail);

        return new ProcessorPipeline<Source, NewFinal>(this.headProcessor, newNode)
    }

    public addItem(item: Source) {
        this.elementQueue.push(item);
    }

    public hasNext(): boolean {
        return !this.isProcessorChainEmpty() || this.elementQueue.length > 0;
    }

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

    getProcessedValue(): Optional<Output> {
        if (this.getProcessor().isStateless() === false) {
            //need to greedily pull all values from previous nodes
            if (this.previousNode.isPresent()) {
                let previousVal: Optional<Input> = this.previousNode.get().getProcessedValue();
                while (previousVal.isPresent()) {
                    this.getProcessor().add(previousVal.get());
                    previousVal = this.previousNode.get().getProcessedValue();
                }
            }
            //else we assume it has all its inputs
            //todo case where the first item in a pipeline is stateful
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