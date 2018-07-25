"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var processor_1 = require("../processor");
var processorPipeline_1 = require("../processorPipeline");
describe('ProcessorPipeline tests', function () {
    describe('ProcessorNode tests', function () {
        it('should create new node with empty previous and next', function () {
            var processor = processor_1.Processor.mapProcessor(function (i) { return i; });
            var processorNode = new processorPipeline_1.ProcessorNode(processor);
            chai_1.expect(processorNode.getNextNode().isPresent()).is.equal(false);
            chai_1.expect(processorNode.getPreviousNode().isPresent()).is.equal(false);
        });
        it('addNext should add a processor to next', function () {
            var processor = processor_1.Processor.mapProcessor(function (i) { return i; });
            var processorNode = new processorPipeline_1.ProcessorNode(processor);
            var nextProcessor = new processorPipeline_1.ProcessorNode(processor);
            processorNode.addNextNode(nextProcessor);
            chai_1.expect(processorNode.getNextNode().isPresent()).is.equal(true);
            chai_1.expect(processorNode.getNextNode().get()).is.equal(nextProcessor);
        });
        it('addPrev should add a processor to next', function () {
            var processor = processor_1.Processor.mapProcessor(function (i) { return i; });
            var processorNode = new processorPipeline_1.ProcessorNode(processor);
            var prev = new processorPipeline_1.ProcessorNode(processor);
            processorNode.addPreviousNode(prev);
            chai_1.expect(processorNode.getPreviousNode().isPresent()).is.equal(true);
            chai_1.expect(processorNode.getPreviousNode().get()).is.equal(prev);
        });
    });
});
