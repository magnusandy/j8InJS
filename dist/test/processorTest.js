"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var processor_1 = require("../processor");
var chai_1 = require("chai");
describe('Processor tests', function () {
    describe('MapProcessor tests', function () {
        it('should be a stateless processor', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            chai_1.expect(processor.isStateless()).to.equal(true);
        });
        it('should not have next with no values', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should have next when a value as been added', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            processor.add(1);
            chai_1.expect(processor.hasNext()).to.equal(true);
        });
        it('should run values through transformer when retrieved', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            processor.add(1);
            var processedVal = processor.processAndGetNext();
            chai_1.expect(processedVal.isPresent()).to.equal(true);
            chai_1.expect(processedVal.get()).to.equal('1');
        });
        it('should should return empty when has no values', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            var processedVal = processor.processAndGetNext();
            chai_1.expect(processedVal.isPresent()).to.equal(false);
        });
        it('should not have next after getting all values', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            processor.add(1);
            processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should process in order of additions', function () {
            var transformer = function (n) { return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            processor.add(1);
            processor.add(2);
            var val1 = processor.processAndGetNext();
            var val2 = processor.processAndGetNext();
            chai_1.expect(val1.isPresent()).to.equal(true);
            chai_1.expect(val1.get()).to.equal('1');
            chai_1.expect(val2.isPresent()).to.equal(true);
            chai_1.expect(val2.get()).to.equal('2');
        });
        it('should process transformer lazily on value fetch', function () {
            var count = 0;
            var transformer = function (n) { count++; return "" + n; };
            var processor = processor_1.Processor.mapProcessor(transformer);
            processor.add(1);
            processor.add(2);
            chai_1.expect(count).to.equal(0);
            var val1 = processor.processAndGetNext();
            chai_1.expect(count).to.equal(1);
            var val2 = processor.processAndGetNext();
            chai_1.expect(count).to.equal(2);
        });
    });
    describe('FilterProcessor tests', function () {
        it('should be a stateless processor', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            chai_1.expect(processor.isStateless()).to.equal(true);
        });
        it('should not have next with no values', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should have next when a value as been added', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            processor.add(1);
            chai_1.expect(processor.hasNext()).to.equal(true);
        });
        it('should run values through predicate when retrieved', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            processor.add(1);
            chai_1.expect(processor.processAndGetNext().get()).to.equal(1);
            processor.add(11);
            chai_1.expect(processor.processAndGetNext().isPresent()).to.equal(false);
        });
        it('should should return empty when has no values', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            chai_1.expect(processor.processAndGetNext().isPresent()).to.equal(false);
        });
        it('should not have next after getting all values', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            processor.add(1);
            processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should process in order of additions', function () {
            var predicate = function (n) { return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            processor.add(1);
            processor.add(2);
            chai_1.expect(processor.processAndGetNext().get()).to.equal(1);
            chai_1.expect(processor.processAndGetNext().get()).to.equal(2);
        });
        it('should process predicate lazily on value fetch', function () {
            var count = 0;
            var predicate = function (n) { count++; return n < 10; };
            var processor = processor_1.Processor.filterProcessor(predicate);
            processor.add(1);
            processor.add(11);
            chai_1.expect(count).to.equal(0);
            processor.processAndGetNext();
            chai_1.expect(count).to.equal(1);
            processor.processAndGetNext();
            chai_1.expect(count).to.equal(2);
        });
    });
    describe('ListFlatmapProcessor tests', function () {
        it('should be a stateless processor', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            chai_1.expect(processor.isStateless()).to.equal(true);
        });
        it('should not have next with no values', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should have next when a value as been added', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            processor.add('cat');
            chai_1.expect(processor.hasNext()).to.equal(true);
        });
        it('should run values through transformer when retrieved', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            processor.add('cat');
            var val = processor.processAndGetNext();
            chai_1.expect(val.isPresent()).to.equal(true);
            chai_1.expect(val.get()).to.equal('c');
        });
        it('should hasNext be true if in the middle of a processing', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            processor.add('cat');
            chai_1.expect(processor.hasNext()).to.equal(true);
            processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(true);
            processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(true);
        });
        it('should should return empty when has no values', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            var val = processor.processAndGetNext();
            chai_1.expect(val.isPresent()).to.equal(false);
        });
        it('should not have next after getting all values', function () {
            it('should hasNext be true if in the middle of a processing', function () {
                var transformer = function (s) { return s.split(''); };
                var processor = processor_1.Processor.listFlatMapProcessor(transformer);
                processor.add('cat');
                processor.processAndGetNext();
                processor.processAndGetNext();
                processor.processAndGetNext();
                chai_1.expect(processor.hasNext()).to.equal(false);
            });
        });
        it('should process in order of additions', function () {
            var transformer = function (s) { return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            processor.add('ca');
            processor.add('do');
            chai_1.expect(processor.processAndGetNext().get()).to.equal('c');
            chai_1.expect(processor.processAndGetNext().get()).to.equal('a');
            chai_1.expect(processor.processAndGetNext().get()).to.equal('d');
            chai_1.expect(processor.processAndGetNext().get()).to.equal('o');
        });
        it('should process transformer lazily on value fetch', function () {
            var count = 0;
            var transformer = function (s) { count++; return s.split(''); };
            var processor = processor_1.Processor.listFlatMapProcessor(transformer);
            processor.add('ca');
            processor.add('do');
            chai_1.expect(count).to.equal(0);
            processor.processAndGetNext();
            chai_1.expect(count).to.equal(1);
        });
    });
    describe('DistinctProcessor tests', function () {
        it('should be a stateful processor', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            chai_1.expect(processor.isStateless()).to.equal(false);
        });
        it('should not have next with no values', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should have next when a value as been added', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            processor.add(1);
            chai_1.expect(processor.hasNext()).to.equal(true);
        });
        it('should have next when a value as been added and processing kicked off', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            processor.add(1);
            processor.add(2);
            processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(true);
        });
        it('should run values through transformer when retrieved', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            [1, 1].forEach(function (i) { return processor.add(i); });
            var val1 = processor.processAndGetNext();
            var val2 = processor.processAndGetNext();
            chai_1.expect(val1.get()).to.equal(1);
            chai_1.expect(val2.isPresent()).to.equal(false);
        });
        it('should should return empty when has no values', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            chai_1.expect(processor.processAndGetNext().isPresent()).to.equal(false);
        });
        it('should not have next after getting all values', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            [1, 1].forEach(function (i) { return processor.add(i); });
            chai_1.expect(processor.hasNext()).to.equal(true);
            var val1 = processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(false);
        });
        it('should return a distinct set of added items', function () {
            var comparator = function (n1, n2) { return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            [1, 2, 1, 2, 1, 3].forEach(function (i) { return processor.add(i); });
            var val1 = processor.processAndGetNext();
            var val2 = processor.processAndGetNext();
            var val3 = processor.processAndGetNext();
            chai_1.expect(processor.hasNext()).to.equal(false);
            chai_1.expect(val1.get()).to.equal(1);
            chai_1.expect(val2.get()).to.equal(2);
            chai_1.expect(val3.get()).to.equal(3);
        });
        it('should process transformer lazily on value fetch', function () {
            var count = 0;
            var comparator = function (n1, n2) { count++; return n1 === n2; };
            var processor = processor_1.Processor.distinctProcessor(comparator);
            [1, 2, 1, 2, 1, 3].forEach(function (i) { return processor.add(i); });
            chai_1.expect(count).to.equal(0);
            processor.processAndGetNext();
            chai_1.expect(count).to.be.greaterThan(0);
        });
    });
});
// describe('FilterProcessor tests', () => {
//     it('should be a stateless processor', () => {
//         const predicate: Predicate<number> = (n: number) => n < 10;
//         const processor: Processor<number, number> = Processor.filterProcessor(predicate);
//         expect(processor.isStateless()).to.equal(true);
//     });
//     it('should not have next with no values', () => {
//     })
//     it('should have next when a value as been added', () => {
//     });
//     it('should run values through transformer when retrieved', () => {
//     })
//     it('should should return empty when has no values', () => {
//     })
//     it('should not have next after getting all values', () => {
//     });
//     it('should process in order of additions', () => {
//     });
//     it('should process transformer lazily on value fetch', () => {
//     });
// });
