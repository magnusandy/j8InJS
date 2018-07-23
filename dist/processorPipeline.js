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
    ProcessorPipeline.prototype.isProcessorChainEmpty = function () {
        var currentNode = this.headProcessor;
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
    };
    /**
     * returns true if any of the operations in the pipeline are stateful operations
     * if the pipeline contains any stateful operations, it is necessary to pass in
     * ALL elements that you want processed at the start, in order to return the correct result
     */
    ProcessorPipeline.prototype.containsStateful = function () {
        var currentNode = this.headProcessor;
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
        oldTail.addNext(newNode);
        newNode.addPrevious(oldTail);
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
                this.elementQueue.forEach(function (e) { return _this.headProcessor.getProcessor().add(e); });
                this.elementQueue = [];
                return this.getNextResult();
            }
            else {
                var nextElement = optional_1.Optional.ofNullable(this.elementQueue.shift());
                nextElement.ifPresent(function (element) { return _this.headProcessor.getProcessor().add(element); });
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
    ProcessorNode.prototype.addNext = function (next) {
        this.nextNode = optional_1.Optional.of(next);
    };
    ProcessorNode.prototype.addPrevious = function (previousProcessor) {
        this.previousNode = optional_1.Optional.of(previousProcessor);
    };
    ProcessorNode.prototype.getNext = function () {
        return this.nextNode;
    };
    ProcessorNode.prototype.getProcessor = function () {
        return this.thisProcessor;
    };
    /**
     * Returns a value that has been processed by this processor,
     * if no items exist in the processor, it attempts to run more items
     * through from the previous node in the pipeline.
     *
     * if the current processor is a stateful processor, this function
     * will greedily pull all items from the previous node into itself
     * before processing and returning any values.
     */
    ProcessorNode.prototype.getProcessedValue = function () {
        if (!this.getProcessor().isStateless()) {
            //need to greedily pull all values from previous node
            if (this.previousNode.isPresent()) {
                var previousVal = this.previousNode.get().getProcessedValue();
                while (previousVal.isPresent()) {
                    this.getProcessor().add(previousVal.get());
                    previousVal = this.previousNode.get().getProcessedValue();
                }
            }
            //else we assume it has all its inputs
            return this.getProcessor().processAndGetNext();
        }
        else { // stateless
            if (this.thisProcessor.hasNext()) {
                var next = this.thisProcessor.processAndGetNext();
                if (next.isPresent()) {
                    return next;
                }
                else {
                    return this.getProcessedValue();
                }
            }
            else if (this.previousNode.isPresent()) { //try filling the processor with output of the previous node
                var processedValue = this.previousNode.get().getProcessedValue();
                if (processedValue.isPresent()) {
                    this.getProcessor().add(processedValue.get());
                    return this.getProcessedValue();
                }
            }
        }
        return optional_1.Optional.empty();
    };
    return ProcessorNode;
}());
