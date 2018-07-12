"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors;
(function (Errors) {
    Errors["NoSuchElementException"] = "NoSuchElementException";
    Errors["NullPointerException"] = "NullPointerException";
})(Errors || (Errors = {}));
/**
 * A container object which may or may not contain a non-null value. If a value is present, isPresent() will return true and get() will return the value.
 */
var Optional = /** @class */ (function () {
    function Optional(value) {
        var _this = this;
        /**
         * Return true if there is a value present, otherwise false.
         */
        this.isPresent = function () { return (_this.value ? true : false); };
        /**
         * If a value is present in this Optional, returns the value, otherwise throws "NoSuchElementException".
         */
        this.get = function () {
            if (_this.value) {
                return _this.value;
            }
            else {
                throw Errors.NoSuchElementException;
            }
        };
        /**
         * If a value is present, and the value matches the given predicate, return an Optional describing the value, otherwise return an empty Optional.
         */
        this.filter = function (predicate) {
            if (_this.isPresent()) {
                return predicate(_this.get()) ? _this : Optional.empty();
            }
            else {
                return Optional.empty();
            }
        };
        /**
         * If a value is present, invoke the specified consumer with the value, otherwise do nothing.
         */
        this.ifPresent = function (consumer) {
            if (_this.isPresent()) {
                consumer(_this.get());
            }
        };
        /**
         * If a value is present, apply the provided transformer function to it, and if the result is non-null, return an Optional describing the result. Otherwise return an empty Optional.
         */
        this.map = function (transformer) {
            if (_this.isPresent()) {
                return Optional.of(transformer(_this.get()));
            }
            else {
                return Optional.empty();
            }
        };
        /**
         * If a value is present, apply the provided Optional-bearing mapping function to it, return that result, otherwise return an empty Optional.
         */
        this.flatMap = function (transformer) {
            var optionalOptional = _this.map(transformer);
            return optionalOptional.isPresent() ? optionalOptional.get() : Optional.empty();
        };
        /**
         * Return the value if present, otherwise return other.
         */
        this.orElse = function (other) { return (_this.isPresent() ? _this.get() : other); };
        /**
         * Return the value if present, otherwise invoke other and return the result of that invocation.
         */
        this.orElseGet = function (supplier) { return _this.isPresent() ? _this.get() : supplier(); };
        /**
         * Return the contained value, if present, otherwise throw an error to be created by the provided supplier.
         */
        this.orElseThrow = function (exceptionSupplier) {
            if (_this.isPresent()) {
                return _this.get();
            }
            else {
                throw exceptionSupplier();
            }
        };
        this.value = value;
    }
    /**
     * Returns an Optional with the specified present non-null value. Throws 'NullPointerException' if the value does not exist
     * Use ofNullable when the value might not be present;
     */
    Optional.of = function (value) {
        if (value) {
            return new Optional(value);
        }
        else {
            throw Errors.NullPointerException;
        }
    };
    /**
     * Returns an Optional describing the specified value, if non-null, otherwise returns an empty Optional.
     */
    Optional.ofNullable = function (value) { return new Optional(value); };
    /**
     * returns an empty Optional instance.
     */
    Optional.empty = function () { return new Optional(); };
    return Optional;
}());
exports.Optional = Optional;
