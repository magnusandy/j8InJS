"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var optional_1 = require("./optional");
/**
 * The processor pipeline is a linked list of processor nodes, the pipeline needs to be given items to process first,
 * and then once elements are passed in, they will be run through the pipeline as lazily as possible,
 * only adding new elements to the pipeline once the pipeline is exhausted. If a pipeline contains a stateful operation on the other
 * hand, it is necessary to pass ALL source elements into the pipeline at the start.
 */
var ProcessorPipeline = /** @class */ (function () {
    function ProcessorPipeline(headNode, tailNode) {
        this.elementQueue = [];
        this.headProcessor = headNode;
        this.tailProcessor = tailNode;
    }
    /**
     * return false if any of the processors in the pipeline
     * still have a value inside it.
     */
    ProcessorPipeline.prototype.isProcessorChainEmpty = function () {
        var currentNode = this.headProcessor;
        if (currentNode.hasNext()) {
            return false;
        }
        while (currentNode.getNextNode().isPresent()) {
            currentNode = currentNode.getNextNode().get();
            if (currentNode.hasNext()) {
                return false;
            }
        }
        return true;
    };
    /**
     * returns true if any of the operations in the pipeline are stateful operations
     * if the pipeline contains any stateful operations, it is necessary to pass in
     * ALL elements that you want processed at the start, in order to return the correct result
     */
    ProcessorPipeline.prototype.containsStateful = function () {
        var currentNode = this.headProcessor;
        if (!currentNode.isStateless()) {
            return true;
        }
        while (currentNode.getNextNode().isPresent()) {
            currentNode = currentNode.getNextNode().get();
            if (!currentNode.isStateless()) {
                return true;
            }
        }
        return false;
    };
    /**
     * creates a new Pipeline with the given processor as the first operation
     * @param initalProcessor
     */
    ProcessorPipeline.create = function (initalProcessor) {
        var node = new ProcessorNode(initalProcessor);
        return new ProcessorPipeline(node, node);
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
        return new ProcessorPipeline(this.headProcessor, newNode);
    };
    /**
     * adds an item to the processing queue, this item will not be processed immediately.
     * @param item
     */
    ProcessorPipeline.prototype.addItem = function (item) {
        this.elementQueue.push(item);
    };
    /**
     * returns true if there is still unprocessed items or items still remaining in the
     * processing queue. hasNext = true does not garentee that getNextResult will be a
     * non-empty value.
     */
    ProcessorPipeline.prototype.hasNext = function () {
        return !this.isProcessorChainEmpty() || this.elementQueue.length > 0;
    };
    /**
     * Returns the next real value to come out of the back of the pipeline (wrapped in an optional)
     * if there is no more elements in the in the queue or pipeline, this will return optional empty.
     * prioritizes items in the processor pipeline before items waiting in the queue.
     */
    ProcessorPipeline.prototype.getNextResult = function () {
        var _this = this;
        if (!this.isProcessorChainEmpty()) { //still items in the chain
            var possibleValue = this.tailProcessor.getProcessedValue();
            if (possibleValue.isPresent()) {
                return possibleValue;
            }
            else {
                return this.getNextResult();
            }
        }
        else if (this.elementQueue.length > 0) {
            if (this.containsStateful()) {
                this.elementQueue.forEach(function (e) { return _this.headProcessor.addInput(e); });
                this.elementQueue = [];
                return this.getNextResult();
            }
            else {
                var nextElement = optional_1.Optional.ofNullable(this.elementQueue.shift());
                nextElement.ifPresent(function (element) { return _this.headProcessor.addInput(element); });
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
        return this.thisProcessor.hasNext();
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
            var previousVal = this.previousNode.get().getProcessedValue();
            while (previousVal.isPresent()) {
                this.addInput(previousVal.get());
                previousVal = this.previousNode.get().getProcessedValue();
            }
        }
        return this.getNextProcessedOutput();
    };
    /**
     * goes to the current processor, pulling values out of it first, if there is nothing left in the
     * current processor, attempt to add new items to the current processor from the previous upstream processor.
     */
    ProcessorNode.prototype.statelessGet = function () {
        if (this.thisProcessor.hasNext()) {
            return this.thisProcessor.processAndGetNext();
        }
        else if (this.previousNode.isPresent()) { //try filling the processor with output of the previous node
            var processedValue = this.previousNode.get().getProcessedValue();
            if (processedValue.isPresent()) {
                this.addInput(processedValue.get());
                return this.statelessGet();
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
