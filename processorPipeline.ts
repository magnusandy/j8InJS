import { Processor } from "./processor";
import { Optional } from "./optional";

export class ProcessorPipeline<Source, Final> {
    headProcessor: ProcessorNode<Source, any>;
    tailProcessor: ProcessorNode<any, Final>;

    private constructor(headNode: ProcessorNode<Source, any>, tailNode: ProcessorNode<any, Final>) {
        this.headProcessor = headNode;
        this.tailProcessor = tailNode;
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

        return new ProcessorPipeline<Source, NewFinal>(this.headProcessor, newNode);
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
}