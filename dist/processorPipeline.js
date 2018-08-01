"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var processor_1 = require("./processor");
var optional_1 = require("./optional");
var functions_1 = require("./functions");
/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first,
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
var ProcessorPipeline = /** @class */ (function () {
    function ProcessorPipeline(initialFeed, headNode, tailNode) {
        this.initialFeed = initialFeed;
        this.headProcessor = headNode;
        this.tailProcessor = tailNode;
        this.headProcessor.addPreviousNode(this.initialFeed);
    }
    /**
     * return false if any of the processors in the pipeline
     * still have a value inside it.
     */
    ProcessorPipeline.prototype.isProcessorChainEmpty = function () {
        return !this.tailProcessor.hasNext();
    };
    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor
     */
    ProcessorPipeline.create = function (source) {
        var initialNode = new InitialFeedProcessorNode(source);
        var node = new ProcessorNode(processor_1.Processor.mapProcessor(functions_1.Transformer.identity()));
        return new ProcessorPipeline(initialNode, node, node);
    };
    /**
     * adds a new processor to the end of the pipeline, returning a new pipeline
     * @param addedProcessor
     */
    ProcessorPipeline.prototype.addProcessor = function (addedProcessor) {
        var newNode = new ProcessorNode(addedProcessor);
        var oldTail = this.tailProcessor;
        oldTail.addNextNode(newNode);
        newNode.addPreviousNode(oldTail);
        return new ProcessorPipeline(this.initialFeed, this.headProcessor, newNode);
    };
    /**
     * returns true if there is still unprocessed items or items still remaining in the
     * processing queue. hasNext = true does not garentee that getNextResult will be a
     * non-empty value.
     */
    ProcessorPipeline.prototype.hasNext = function () {
        return !this.isProcessorChainEmpty();
    };
    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty.
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    ProcessorPipeline.prototype.getNextResult = function () {
        if (this.hasNext()) {
            var possibleValue = this.tailProcessor.getProcessedValue();
            if (possibleValue.isPresent()) {
                return possibleValue;
            }
            else {
                return this.getNextResult();
            }
        }
        return optional_1.Optional.empty();
    };
    return ProcessorPipeline;
}());
exports.ProcessorPipeline = ProcessorPipeline;
/**
 * represents a node in the processing pipeline, may or may not have a node before and after.
 */
var ProcessorNode = /** @class */ (function () {
    function ProcessorNode(processor) {
        this.previousNode = optional_1.Optional.empty();
        this.thisProcessor = processor;
        this.nextNode = optional_1.Optional.empty();
    }
    ProcessorNode.prototype.getNextProcessedOutput = function () {
        return this.thisProcessor.processAndGetNext();
    };
    ProcessorNode.prototype.addNextNode = function (next) {
        this.nextNode = optional_1.Optional.of(next);
    };
    ProcessorNode.prototype.addPreviousNode = function (previousProcessor) {
        this.previousNode = optional_1.Optional.of(previousProcessor);
    };
    ProcessorNode.prototype.getNextNode = function () {
        return this.nextNode;
    };
    ProcessorNode.prototype.getPreviousNode = function () {
        return this.previousNode;
    };
    ProcessorNode.prototype.addInput = function (input) {
        this.thisProcessor.add(input);
    };
    ProcessorNode.prototype.isStateless = function () {
        return this.thisProcessor.isStateless();
    };
    ProcessorNode.prototype.hasNext = function () {
        if (this.thisProcessor.isShortCircuting()) {
            var hasPreviousAndItHasValues = this.getPreviousNode().isPresent() ? this.getPreviousNode().get().hasNext() : false;
            return this.thisProcessor.hasNext() && hasPreviousAndItHasValues;
        }
        else {
            var hasPreviousAndItHasValues = this.getPreviousNode().isPresent() ? this.getPreviousNode().get().hasNext() : false;
            return this.thisProcessor.hasNext() || hasPreviousAndItHasValues;
        }
    };
    // getProcessor(): Processor<Input, Output> {
    //     return this.thisProcessor;
    // }
    /**
     * pulls all the values out of the previous processor, if one exists
     * and add them into the current processor;
     */
    ProcessorNode.prototype.statefulPullAndGet = function () {
        if (this.previousNode.isPresent()) {
            var previousNode = this.previousNode.get();
            while (previousNode.hasNext()) {
                var previousVal = previousNode.getProcessedValue();
                if (previousVal.isPresent()) {
                    this.addInput(previousVal.get());
                }
            }
        }
        return this.getNextProcessedOutput();
        ;
    };
    /**
     * goes to the current processor, pulling values out of it first, if there is nothing left in the
     * current processor, attempt to add new items to the current processor from the previous upstream processor.
     */
    ProcessorNode.prototype.statelessGet = function () {
        if (this.thisProcessor.hasNext() && !this.thisProcessor.isShortCircuting()) { //todo explain more, we need to treat short circuiting nodes differently
            return this.thisProcessor.processAndGetNext();
        }
        else if (this.previousNode.isPresent()) {
            var processedValue = this.previousNode.get().getProcessedValue();
            if (processedValue.isPresent()) {
                this.addInput(processedValue.get());
                return this.thisProcessor.processAndGetNext();
            }
        }
        return optional_1.Optional.empty();
    };
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
    ProcessorNode.prototype.getProcessedValue = function () {
        return this.isStateless()
            ? this.statelessGet()
            : this.statefulPullAndGet();
    };
    return ProcessorNode;
}());
exports.ProcessorNode = ProcessorNode;
/**
 * a special processor node that acts as a supplier for the rest of the pipeline
 */
var InitialFeedProcessorNode = /** @class */ (function (_super) {
    __extends(InitialFeedProcessorNode, _super);
    function InitialFeedProcessorNode(supplier) {
        var _this = _super.call(this, processor_1.Processor.mapProcessor(functions_1.Transformer.identity())) || this;
        _this.source = supplier;
        return _this;
    }
    InitialFeedProcessorNode.prototype.hasNext = function () {
        return this.source.hasNext();
    };
    InitialFeedProcessorNode.prototype.getProcessedValue = function () {
        return optional_1.Optional.ofNullable(this.source.get());
    };
    return InitialFeedProcessorNode;
}(ProcessorNode));
