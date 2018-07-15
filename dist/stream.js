"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compose = function (f, g) { return function (value) { return g(f(value)); }; };
exports.stream = function (source) {
    return ArrayStream.of(source);
};
var ArrayStream = /** @class */ (function () {
    function ArrayStream(source, actions) {
        this.source = source.slice();
        this.actions = actions;
    }
    ArrayStream.of = function (source) {
        return new ArrayStream(source, []);
    };
    ArrayStream.prototype.map = function (transformer) {
        this.actions.push(transformer);
        return new ArrayStream(this.source, this.actions);
    };
    ArrayStream.prototype.forEach = function (consumer) {
        this.applyActions();
        this.source.forEach(consumer);
    };
    ArrayStream.prototype.applyActions = function () {
        var ultimateAction = this.actions.reduce(compose);
        this.source = this.source.map(ultimateAction);
    };
    return ArrayStream;
}());
;
var ArrayStreamBuilder = /** @class */ (function () {
    function ArrayStreamBuilder() {
        this.array = [];
    }
    ArrayStreamBuilder.builder = function () {
        return new ArrayStreamBuilder();
    };
    ArrayStreamBuilder.prototype.accept = function (item) {
        this.acceptAll([item]);
    };
    ArrayStreamBuilder.prototype.acceptAll = function (items) {
        var _a;
        (_a = this.array).push.apply(_a, items);
    };
    ArrayStreamBuilder.prototype.add = function (item) {
        this.accept(item);
        return this;
    };
    ArrayStreamBuilder.prototype.addAll = function (items) {
        this.acceptAll(items);
        return this;
    };
    return ArrayStreamBuilder;
}());
