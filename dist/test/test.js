"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var optional_1 = require("../optional");
var chai_1 = require("chai");
describe('Optional tests', function () {
    it('of should return a non-empty optional', function () {
        var testString = 'someString';
        var o = optional_1.Optional.of(testString);
        chai_1.expect(o.isPresent()).to.equal(true);
        chai_1.expect(o.get()).to.equal(testString);
    });
});
