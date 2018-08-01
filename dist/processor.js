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
var optional_1 = require("./optional");
exports.Processor = {
    mapProcessor: function (transformer) { return new MapProcessor(transformer); },
    filterProcessor: function (predicate) { return new FilterProcessor(predicate); },
    listFlatMapProcessor: function (transformer) { return new ListFlatMapProcessor(transformer); },
    distinctProcessor: function (comparator) { return new DistinctProcessor(comparator); },
    limitProcessor: function (limit) { return new LimitProcessor(limit); },
    streamFlatMapProcessor: function (transformer) { return new StreamFlatMapProcessor(transformer); },
    peekProcessor: function (consumer) { return new PeekProcessor(consumer); },
    optionalFlatMapProcessor: function (transformer) { return new OptionalFlatMapProcessor(transformer); },
    skipProcessor: function (numberToSkip) { return new SkipProcessor(numberToSkip); },
};
/**
 * Abstract processor that implements the storage and retrieval of items from
 * the processing queue.
 */
var AbstractProcessor = /** @class */ (function () {
    function AbstractProcessor() {
        this.inputs = [];
    }
    AbstractProcessor.prototype.add = function (input) {
        this.inputs.push(input);
    };
    AbstractProcessor.prototype.takeNextInput = function () {
        return optional_1.Optional.ofNullable(this.inputs.shift());
    };
    AbstractProcessor.prototype.hasNext = function () {
        return this.inputs ? this.inputs.length > 0 : false;
    };
    return AbstractProcessor;
}());
/**
 * Abstract processor that is stateless and not short circuiting
 */
var PureStatelessProcessor = /** @class */ (function (_super) {
    __extends(PureStatelessProcessor, _super);
    function PureStatelessProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PureStatelessProcessor.prototype.isStateless = function () {
        return true;
    };
    PureStatelessProcessor.prototype.isShortCircuting = function () {
        return false;
    };
    return PureStatelessProcessor;
}(AbstractProcessor));
var LimitProcessor = /** @class */ (function (_super) {
    __extends(LimitProcessor, _super);
    function LimitProcessor(limit) {
        var _this = _super.call(this) || this;
        _this.limit = limit;
        _this.count = 0;
        return _this;
    }
    LimitProcessor.prototype.processAndGetNext = function () {
        if (this.count < this.limit) {
            this.count++;
            return this.takeNextInput();
        }
        else {
            return optional_1.Optional.empty();
        }
    };
    LimitProcessor.prototype.hasNext = function () {
        return (this.count < this.limit);
    };
    LimitProcessor.prototype.isStateless = function () {
        return true;
    };
    LimitProcessor.prototype.isShortCircuting = function () {
        return true;
    };
    return LimitProcessor;
}(AbstractProcessor));
/** //todo test
 * This is a stateful processor, that will return distinct elements provided all
 * the inputs are given at the start, and no elements are injected mid processing
 */
var DistinctProcessor = /** @class */ (function (_super) {
    __extends(DistinctProcessor, _super);
    function DistinctProcessor(comparator) {
        var _this = _super.call(this) || this;
        _this.comparator = comparator;
        _this.distinctList = optional_1.Optional.empty();
        return _this;
    }
    DistinctProcessor.prototype.isStateless = function () {
        return false;
    };
    DistinctProcessor.prototype.isShortCircuting = function () {
        return false;
    };
    DistinctProcessor.prototype.hasNext = function () {
        var distinctListExistsAndHasValues = this.distinctList.isPresent() ? this.distinctList.get().length > 0 : false;
        return this.inputs.length > 0 || distinctListExistsAndHasValues;
    };
    DistinctProcessor.prototype.processAndGetNext = function () {
        if (!this.distinctList.isPresent()) {
            this.processValues();
            return this.processAndGetNext();
        }
        else {
            return optional_1.Optional.ofNullable(this.distinctList.get().shift());
        }
    };
    DistinctProcessor.prototype.processValues = function () {
        var _this = this;
        var distinctList = [];
        this.inputs.forEach(function (item) {
            //compare the current Item with the given value
            var doesMatchItem = function (distinct) { return _this.comparator(item, distinct); };
            var matchingItems = distinctList.filter(doesMatchItem);
            if (matchingItems.length === 0) {
                distinctList.push(item);
            }
        });
        this.inputs = [];
        this.distinctList = optional_1.Optional.of(distinctList);
    };
    return DistinctProcessor;
}(AbstractProcessor));
/**
 * Implemention of a Processor for value mapping, lazily transforms values
 * when returned from the processor.
 */
var MapProcessor = /** @class */ (function (_super) {
    __extends(MapProcessor, _super);
    function MapProcessor(transformer) {
        var _this = _super.call(this) || this;
        _this.transformer = transformer;
        return _this;
    }
    //pull values off the start
    MapProcessor.prototype.processAndGetNext = function () {
        return this.takeNextInput().map(this.transformer);
    };
    return MapProcessor;
}(PureStatelessProcessor));
/** //todo test
 * Implemention of a Processor for consuming a value,intermediately but not not
 * altering the stream.
 */
var PeekProcessor = /** @class */ (function (_super) {
    __extends(PeekProcessor, _super);
    function PeekProcessor(consumer) {
        var _this = _super.call(this) || this;
        _this.consumer = consumer;
        return _this;
    }
    PeekProcessor.prototype.processAndGetNext = function () {
        var item = this.takeNextInput();
        item.ifPresent(this.consumer);
        return item;
    };
    return PeekProcessor;
}(PureStatelessProcessor));
/**
 * Stateless process, filters input items against a given predicated, only
 * returning those who match against the given predicate.
 */
var FilterProcessor = /** @class */ (function (_super) {
    __extends(FilterProcessor, _super);
    function FilterProcessor(predicate) {
        var _this = _super.call(this) || this;
        _this.predicate = predicate;
        return _this;
    }
    FilterProcessor.prototype.processAndGetNext = function () {
        return this.takeNextInput().filter(this.predicate);
    };
    return FilterProcessor;
}(PureStatelessProcessor));
/**
 * stateless processor, removes the given number of values before continuing to return values
 * given value must be positive, or nothing is skipped
 */
var SkipProcessor = /** @class */ (function (_super) {
    __extends(SkipProcessor, _super);
    function SkipProcessor(amountToSkip) {
        var _this = _super.call(this) || this;
        _this.amountToSkip = amountToSkip;
        return _this;
    }
    SkipProcessor.prototype.processAndGetNext = function () {
        if (this.amountToSkip > 0) {
            this.amountToSkip = this.amountToSkip - 1;
            this.takeNextInput(); //throw away
            return optional_1.Optional.empty();
        }
        else {
            return this.takeNextInput();
        }
    };
    return SkipProcessor;
}(PureStatelessProcessor));
/**
 * returns a one to many mapping of elements, transforms input elements into
 * a list of output elements, returning the values off the output lists, one list
 * at a time, lazily transforming inputs only when the previous list is exhausted.
 */
var ListFlatMapProcessor = /** @class */ (function (_super) {
    __extends(ListFlatMapProcessor, _super);
    function ListFlatMapProcessor(transformer) {
        var _this = _super.call(this) || this;
        _this.transformer = transformer;
        _this.outputList = [];
        return _this;
    }
    ListFlatMapProcessor.prototype.hasNext = function () {
        return (this.outputList.length > 0 || this.inputs.length > 0);
    };
    ListFlatMapProcessor.prototype.processAndGetNext = function () {
        if (this.outputList.length > 0) {
            return optional_1.Optional.ofNullable(this.outputList.shift());
        }
        else if (this.inputs.length > 0) {
            var nextSource = this.takeNextInput();
            if (nextSource.isPresent()) {
                this.outputList = this.transformer(nextSource.get());
                return this.processAndGetNext();
            }
        }
        return optional_1.Optional.empty();
    };
    return ListFlatMapProcessor;
}(PureStatelessProcessor));
var StreamFlatMapProcessor = /** @class */ (function (_super) {
    __extends(StreamFlatMapProcessor, _super);
    function StreamFlatMapProcessor(transformer) {
        var _this = _super.call(this) || this;
        _this.transformer = transformer;
        return _this;
    }
    StreamFlatMapProcessor.prototype.hasNext = function () {
        return ((this.outputSpliterator && this.outputSpliterator.hasNext()) || this.inputs.length > 0);
    };
    StreamFlatMapProcessor.prototype.processAndGetNext = function () {
        if (this.outputSpliterator && this.outputSpliterator.hasNext()) {
            return this.outputSpliterator.getNext();
        }
        else if (this.inputs.length > 0) {
            var nextSource = this.takeNextInput();
            if (nextSource.isPresent()) {
                this.outputSpliterator = this.transformer(nextSource.get()).streamIterator();
                return this.processAndGetNext();
            }
        }
        return optional_1.Optional.empty();
    };
    return StreamFlatMapProcessor;
}(PureStatelessProcessor));
//todo test
var OptionalFlatMapProcessor = /** @class */ (function (_super) {
    __extends(OptionalFlatMapProcessor, _super);
    function OptionalFlatMapProcessor(transformer) {
        var _this = _super.call(this) || this;
        _this.transformer = transformer;
        return _this;
    }
    OptionalFlatMapProcessor.prototype.processAndGetNext = function () {
        return this.takeNextInput().flatMap(this.transformer);
    };
    return OptionalFlatMapProcessor;
}(PureStatelessProcessor));
