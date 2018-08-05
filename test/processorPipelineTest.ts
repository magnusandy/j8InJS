
import {use, spy, expect} from "chai";
import * as spies from "chai-spies";
import { Transformer, Comparator } from "../functions";
import { Processor } from "../processor";
import { ProcessorNode } from "../processorPipeline";
use(spies);

describe('ProcessorPipeline tests', () => {
    describe('ProcessorNode tests', () => {
        it('should create new node with empty previous and next', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);

            expect(processorNode.getNextNode().isPresent()).is.equal(false);
            expect(processorNode.getPreviousNode().isPresent()).is.equal(false);
        });

        it('addNext should add a processor to next', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const nextProcessor = new ProcessorNode(processor);
            processorNode.addNextNode(nextProcessor);
            expect(processorNode.getNextNode().isPresent()).is.equal(true);
            expect(processorNode.getNextNode().get()).is.equal(nextProcessor);
        });

        it('addPrev should add a processor to next', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(processor);
            processorNode.addPreviousNode(prev);
            expect(processorNode.getPreviousNode().isPresent()).is.equal(true);
            expect(processorNode.getPreviousNode().get()).is.equal(prev);
        });

        it('has next false when short circuiting, processor does not have next, but there is previous inputs', () => {
            const processor: Processor<string, string> = Processor.limitProcessor(0);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            prev.addInput('1');
            processorNode.addPreviousNode(prev);

            expect(processorNode.hasNext()).is.equal(false);
        });

        it('has next false when short circuiting, processor does not have next, and no inputs from prev', () => {
            const processor: Processor<string, string> = Processor.limitProcessor(0);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            processorNode.addPreviousNode(prev);

            expect(processorNode.hasNext()).is.equal(false);
        });

        it('has next true when short circuiting, processor has have next, and has inputs from prev', () => {
            const processor: Processor<string, string> = Processor.limitProcessor(1);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            prev.addInput("1");
            processorNode.addPreviousNode(prev);

            expect(processorNode.hasNext()).is.equal(true);
        });

        it('has next false when short circuiting, processor has have next but previous node is empty', () => {
            const processor: Processor<string, string> = Processor.limitProcessor(1);
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            processorNode.addPreviousNode(prev);

            expect(processorNode.hasNext()).is.equal(false);
        });

        it('statefulPullAndGet fills processor from previous if previous exists', () => {
            const processor: Processor<string, string> = Processor.sortProcessor(Comparator.default());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            prev.addInput("a");
            prev.addInput("b");
            processorNode.addPreviousNode(prev);

            expect(processorNode.statefulPullAndGet().get()).is.equal("a");
            expect(processorNode.statefulPullAndGet().get()).is.equal("b");
        });

        it('statefulPullAndGet gets from processors values if no previous', () => {
            const processor: Processor<string, string> = Processor.sortProcessor(Comparator.default());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            processorNode.addInput("a");

            expect(processorNode.statefulPullAndGet().get()).is.equal("a");
        });

        it('statelessGet pulls first from current Processor if it has values', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            processorNode.addInput("a");
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            prev.addInput("b");
            processorNode.addPreviousNode(prev);

            expect(processorNode.statelessGet().get()).is.equal("a");
        });

        it('statelessGet pulls from previous processor if current processor is empty', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            prev.addInput("b");
            processorNode.addPreviousNode(prev);

            expect(processorNode.statelessGet().get()).is.equal("b");
        });

        it('statelessGet returns Optional.empty if previous and current processors are empty', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const prev = new ProcessorNode(Processor.mapProcessor(Transformer.identity<string>()));
            processorNode.addPreviousNode(prev);

            expect(processorNode.statelessGet().isPresent()).is.equal(false);
        });

        it('getProcessedValue calls statelessGet when node is stateless', () => {
            const processor: Processor<string, string> = Processor.mapProcessor(Transformer.identity());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const statelessGetSpy = spy.on(processorNode, 'statelessGet');
            processorNode.getProcessedValue();

            expect(statelessGetSpy).to.have.been.called();
        });

        it('getProcessedValue calls statefulPullAndGet when node is stateful', () => {
            const processor: Processor<string, string> = Processor.sortProcessor(Comparator.default());
            const processorNode: ProcessorNode<string, string> = new ProcessorNode(processor);
            const statelessGetSpy = spy.on(processorNode, 'statefulPullAndGet');
            processorNode.getProcessedValue();

            expect(statelessGetSpy).to.have.been.called();
        });
    })
});