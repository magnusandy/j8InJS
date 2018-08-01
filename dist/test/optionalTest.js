"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var optional_1 = require("../optional");
var chai_1 = require("chai");
var errors_1 = require("../errors");
describe('Optional tests', function () {
    describe('Optional.of()', function () {
        it('should return a non-empty optional', function () {
            var testString = 'someString';
            var o = optional_1.Optional.of(testString);
            chai_1.expect(o.isPresent()).to.equal(true);
            chai_1.expect(o.get()).to.equal(testString);
        });
        it('should throw "NullPointerException" if passed null', function () {
            chai_1.expect(function () { return optional_1.Optional.of(null); }).to.throw(errors_1.Errors.NullPointerException);
        });
        it('should throw "NullPointerException" if passed undefined', function () {
            chai_1.expect(function () { return optional_1.Optional.of(undefined); }).to.throw(errors_1.Errors.NullPointerException);
        });
        it('should not throw "NullPointerException" if passed 0', function () {
            chai_1.expect(function () { return optional_1.Optional.of(0); }).to.not.throw(errors_1.Errors.NullPointerException);
        });
        it('should not throw "NullPointerException" if passed false', function () {
            chai_1.expect(function () { return optional_1.Optional.of(false); }).to.not.throw(errors_1.Errors.NullPointerException);
        });
        it('should not throw "NullPointerException" if passed ""', function () {
            chai_1.expect(function () { return optional_1.Optional.of(""); }).to.not.throw(errors_1.Errors.NullPointerException);
        });
    });
    describe('Optional.ofNullable()', function () {
        it('should return a non-empty optional if passed an actual value', function () {
            var testString = 'someString';
            var o = optional_1.Optional.ofNullable(testString);
            chai_1.expect(o.isPresent()).to.equal(true);
            chai_1.expect(o.get()).to.equal(testString);
        });
        it('should NOT throw "NullPointerException" if passed null', function () {
            chai_1.expect(function () { return optional_1.Optional.ofNullable(null); }).to.not.throw(errors_1.Errors.NullPointerException);
        });
        it('should not throw "NullPointerException" if passed undefined', function () {
            chai_1.expect(function () { return optional_1.Optional.ofNullable(undefined); }).to.not.throw(errors_1.Errors.NullPointerException);
        });
        it('should return Optional.empty() if passed undefined', function () {
            var somethingEmpty = undefined;
            var o = optional_1.Optional.ofNullable(somethingEmpty);
            chai_1.expect(o.isPresent()).to.eq(false);
        });
        it('should return Optional.empty() if passed null', function () {
            var somethingEmpty = null;
            var o = optional_1.Optional.ofNullable(somethingEmpty);
            chai_1.expect(o.isPresent()).to.eq(false);
        });
    });
    describe('Optional.empty()', function () {
        it('should return optional with no value', function () {
            var o = optional_1.Optional.empty();
            chai_1.expect(o.isPresent()).to.equal(false);
            chai_1.expect(o.get).to.throw(errors_1.Errors.NoSuchElementException);
        });
    });
    describe('isPresent()', function () {
        it('should return false if there is no value', function () {
            var o = optional_1.Optional.empty();
            chai_1.expect(o.isPresent()).to.equal(false);
        });
        it('should return true if there is a value', function () {
            var o = optional_1.Optional.of({ x: 'object' });
            chai_1.expect(o.isPresent()).to.equal(true);
        });
    });
    describe('get()', function () {
        it('should return the value if not empty', function () {
            var someValue = 'something';
            var o = optional_1.Optional.of(someValue);
            chai_1.expect(o.get()).to.equal(someValue);
        });
        it('should thow "NoSuchElementException" if empty', function () {
            var o = optional_1.Optional.empty();
            chai_1.expect(o.get).to.throw(errors_1.Errors.NoSuchElementException);
        });
    });
    describe('filter(predicate: Predicate<T>)', function () {
        it('should keep value if predicate returns true', function () {
            var truePredicate = function (x) { return true; };
            var o = optional_1.Optional.of(1);
            o = o.filter(truePredicate);
            chai_1.expect(o.isPresent()).to.equal(true);
        });
        it('should not keep value if predicate returns false', function () {
            var falsePredicate = function (x) { return false; };
            var o = optional_1.Optional.of(1);
            o = o.filter(falsePredicate);
            chai_1.expect(o.isPresent()).to.equal(false);
        });
        it('should actually apply the predicate to the value', function () {
            var predicate = function (x) { return x > 10; };
            var o = optional_1.Optional.of(11);
            o = o.filter(predicate);
            chai_1.expect(o.isPresent()).to.equal(true);
        });
        it('should lazily apply predicate', function () {
            var consumerActivated = false;
            var predicate = function (x) { consumerActivated = true; return false; };
            var o = optional_1.Optional.empty();
            o.filter(predicate);
            chai_1.expect(consumerActivated).to.equal(false);
        });
    });
    describe('ifPresent(consumer: Consumer<T>)', function () {
        it('should apply the consumer if a value is present', function () {
            var consumerActivated = false;
            var consumer = function (x) { return consumerActivated = true; };
            var o = optional_1.Optional.of(1);
            o.ifPresent(consumer);
            chai_1.expect(consumerActivated).to.equal(true);
        });
        it('should do nothing, not run consumer if optional empty', function () {
            var consumerActivated = false;
            var consumer = function (x) { return consumerActivated = true; };
            var o = optional_1.Optional.empty();
            o.ifPresent(consumer);
            chai_1.expect(consumerActivated).to.equal(false);
        });
    });
    describe('map(transformer: Transformer<T, V>)', function () {
        it('should return Optional with new value, if value is present', function () {
            var stringVal = 'string';
            var transformer = function (n) { return stringVal; };
            var o = optional_1.Optional.of(1);
            var s = o.map(transformer);
            chai_1.expect(s.isPresent()).to.equal(true);
            chai_1.expect(s.get()).to.equal(stringVal);
        });
        it('should return empty, if value is not present', function () {
            var stringVal = 'string';
            var transformer = function (n) { return stringVal; };
            var o = optional_1.Optional.empty();
            var s = o.map(transformer);
            chai_1.expect(s.isPresent()).to.equal(false);
        });
        it('should return empty if transformer returns null', function () {
            var transformer = function (n) { return null; };
            var o = optional_1.Optional.of(1);
            var s = o.map(transformer);
            chai_1.expect(s.isPresent()).to.equal(false);
        });
        it('should return empty if transformer returns undefined', function () {
            var transformer = function (n) { return undefined; };
            var o = optional_1.Optional.of(1);
            var s = o.map(transformer);
            chai_1.expect(s.isPresent()).to.equal(false);
        });
        it('should lazily apply transformer', function () {
            var activated = false;
            var stringVal = 'string';
            var transformer = function (n) { activated = true; return stringVal; };
            var o = optional_1.Optional.empty();
            var s = o.map(transformer);
            chai_1.expect(activated).to.equal(false);
        });
    });
    describe('flatMap(transformer: Transformer<T, Optional<V>>)', function () {
        it('should return transformed result if value is present', function () {
            var retVal = optional_1.Optional.of(2);
            var transformer = function (n) { return retVal; };
            var o = optional_1.Optional.of(1);
            var s = o.flatMap(transformer);
            chai_1.expect(s).to.equal(retVal);
        });
        it('should return empty if transformer returns undefined', function () {
            var transformer = function (n) { return undefined; };
            var o = optional_1.Optional.of(1);
            var s = o.flatMap(transformer);
            chai_1.expect(s.isPresent()).to.equal(false);
        });
        it('should return empty if transformer returns null', function () {
            var transformer = function (n) { return null; };
            var o = optional_1.Optional.of(1);
            var s = o.flatMap(transformer);
            chai_1.expect(s.isPresent()).to.equal(false);
        });
        it('should return transformed result if value is present', function () {
            var applied = false;
            var retVal = optional_1.Optional.of(2);
            var transformer = function (n) { applied = true; return retVal; };
            var o = optional_1.Optional.empty();
            var s = o.flatMap(transformer);
            chai_1.expect(applied).to.equal(false);
        });
    });
    describe('orElse(other: T)', function () {
        it('should return value if present', function () {
            var value = 'value';
            var other = 'other';
            var result = optional_1.Optional.of(value).orElse(other);
            chai_1.expect(result).to.equal(value);
            chai_1.expect(result).to.not.equal(other);
        });
        it('should return other if not present', function () {
            var other = 'other';
            var result = optional_1.Optional.empty().orElse(other);
            chai_1.expect(result).to.equal(other);
        });
    });
    describe('orElseGet(other: Supplier<T>)', function () {
        it('should return value if present', function () {
            var value = 'value';
            var other = 'other';
            var otherSupplier = function () { return other; };
            var result = optional_1.Optional.of(value).orElseGet(otherSupplier);
            chai_1.expect(result).to.equal(value);
            chai_1.expect(result).to.not.equal(other);
        });
        it('should envoke and return other if present', function () {
            var other = 'other';
            var otherSupplier = function () { return other; };
            var result = optional_1.Optional.empty().orElseGet(otherSupplier);
            chai_1.expect(result).to.equal(other);
        });
        it('should lazily envoke supplier only when value not present', function () {
            var activated = false;
            var other = 'other';
            var otherSupplier = function () { activated = true; return other; };
            chai_1.expect(activated).to.equal(false);
            var result = optional_1.Optional.of('value').orElseGet(otherSupplier);
            chai_1.expect(activated).to.equal(false);
        });
    });
    describe('orElseThrow(throwableSupplier: Supplier<any>)', function () {
        it('should return value if present', function () {
            var value = 'value';
            var error = 'Error';
            var throwSupplier = function () { return Error(error); };
            var resulter = function () { return optional_1.Optional.of(value).orElseThrow(throwSupplier); };
            chai_1.expect(resulter).to.not.throw(error);
            chai_1.expect(resulter()).to.equal(value);
        });
        it('should throw value given by the supplier', function () {
            var error = 'Error';
            var throwSupplier = function () { return Error(error); };
            var resulter = function () { return optional_1.Optional.empty().orElseThrow(throwSupplier); };
            chai_1.expect(resulter).to.throw(error);
        });
        it('should lazily envoke supplier, only when value not present', function () {
            var activated = false;
            var value = 'value';
            var throwSupplier = function () { activated = true; return Error('Error'); };
            optional_1.Optional.of(value).orElseThrow(throwSupplier);
            chai_1.expect(activated).to.equal(false);
        });
    });
});
