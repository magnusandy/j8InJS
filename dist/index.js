"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors;
(function (Errors) {
    Errors["NoSuchElementException"] = "NoSuchElementException";
})(Errors || (Errors = {}));
var Optional = /** @class */ (function () {
    function Optional(value) {
        var _this = this;
        this.isPresent = function () { return (_this.value ? true : false); };
        this.get = function () {
            if (_this.value) {
                return _this.value;
            }
            else {
                throw Errors.NoSuchElementException;
            }
        };
        this.filter = function (predicate) {
            if (_this.isPresent()) {
                return predicate(_this.get()) ? _this : Optional.empty();
            }
            else {
                return Optional.empty();
            }
        };
        this.ifPresent = function (consumer) {
            if (_this.isPresent()) {
                consumer(_this.get());
            }
        };
        this.map = function (transformer) {
            if (_this.isPresent()) {
                return Optional.of(transformer(_this.get()));
            }
            else {
                return Optional.empty();
            }
        };
        this.flatMap = function (transformer) {
            var optionalOptional = _this.map(transformer);
            return optionalOptional.isPresent() ? optionalOptional.get() : Optional.empty();
        };
        this.orElse = function (other) { return (_this.isPresent() ? _this.get() : other); };
        this.orElseGet = function (supplier) { return _this.isPresent() ? _this.get() : supplier(); };
        this.orElseThrow = function (throwable) {
            if (_this.isPresent()) {
                return _this.get();
            }
            else {
                throw throwable;
            }
        };
        this.value = value;
    }
    Optional.of = function (value) { return new Optional(value); };
    Optional.empty = function () { return new Optional(); };
    return Optional;
}());
exports.default = Optional;
