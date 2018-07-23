import { expect } from "chai";
import { Errors } from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";
import { Stream } from '../stream';
import Collectors from "../collectors";
import { Optional } from "../optional";
import { Processor } from "../processor";
import { ProcessorNode } from "../processorPipeline";

describe('ProcessorPipeline tests', () => {
    describe('ProcessorNode tests', () => {
        it('should create new node with empty previous and next', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(i => i);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);

            expect(processorNode.getNextNode().isPresent()).is.equal(false);
            expect(processorNode.getPreviousNode().isPresent()).is.equal(false);             
        });

        it('addNext should add a processor to next', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(i => i);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const nextProcessor = new ProcessorNode(processor);
            processorNode.addNextNode(nextProcessor);
            expect(processorNode.getNextNode().isPresent()).is.equal(true);
            expect(processorNode.getNextNode().get()).is.equal(nextProcessor);             
        });

        it('addPrev should add a processor to next', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(i => i);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(processor);
            processorNode.addPreviousNode(prev);
            expect(processorNode.getPreviousNode().isPresent()).is.equal(true);
            expect(processorNode.getPreviousNode().get()).is.equal(prev);             
        });
    })
});