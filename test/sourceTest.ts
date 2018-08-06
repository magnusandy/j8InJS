import { expect, use, spy } from "chai";
import * as spies from "chai-spies";
import { Transformer, Supplier } from "../functions";
import { Source } from "../source";
import Stream from "../stream";
import Optional from "../optional";
use(spies);

describe('Source tests', () => {
    describe('Iterate Source', () => {
        it('should return seed first', () => {
            const seed = 0;
            const transformer: Transformer<number, number> = (n: number) => n + 1;
            const source: Source<number> = Source.iterateSource(seed, transformer);

            const result = source.get();
            expect(result).to.equal(seed);
        });

        it('should return seed first', () => {
            const seed = 0;
            const transformer: Transformer<number, number> = (n: number) => n + 1;
            const source: Source<number> = Source.iterateSource(seed, transformer);

            const result = source.get();
            expect(result).to.equal(seed);
        });

        it('should transform seed each call', () => {
            const seed = 0;
            const transformer: Transformer<number, number> = (n: number) => n + 1;
            const source: Source<number> = Source.iterateSource(seed, transformer);


            expect(source.get()).to.equal(seed);
            expect(source.get()).to.equal(transformer(seed));
            expect(source.get()).to.equal(transformer(transformer(seed)));
        });

        it('should hasNext should be true', () => {
            const transformer: Transformer<number, number> = (n: number) => n + 1;
            const source: Source<number> = Source.iterateSource(0, transformer);

            expect(source.hasNext()).to.equal(true);
        });
    });

    describe('Supplier Source', () => {
        it('should return value from supplier', () => {
            const value = 0;
            const supplier: Supplier<number> = () => value;
            const source: Source<number> = Source.supplierSource(supplier);

            const result = source.get();
            expect(result).to.equal(value);
        });

        it('should call supplier', () => {
            const value = 0;
            const supplier: Supplier<number> = () => value;
            const supplierSpy = spy(supplier);
            const source: Source<number> = Source.supplierSource(supplierSpy);

            source.get();
            expect(supplierSpy).to.have.been.called();
        });

        it('should hasNext should be true', () => {
            const supplier: Supplier<number> = () => 0;
            const source: Source<number> = Source.supplierSource(supplier);

            expect(source.hasNext()).to.equal(true);
        });
    });

    describe('Array Source', () => {
        it('should return values from array', () => {
            const sourceArray = [1, 2, 3];
            const source: Source<number> = Source.arraySource(sourceArray);

            expect(source.get()).to.equal(sourceArray[0]);
            expect(source.get()).to.equal(sourceArray[1]);
            expect(source.get()).to.equal(sourceArray[2]);

        });

        it('should hasNext when still values in array', () => {
            const sourceArray = [1, 2, 3];
            const source: Source<number> = Source.arraySource(sourceArray);

            expect(source.get()).to.equal(sourceArray[0]);
            expect(source.get()).to.equal(sourceArray[1]);
            expect(source.hasNext()).to.equal(true);
        });

        it('should hasNext when still values in array', () => {
            const sourceArray = [1, 2];
            const source: Source<number> = Source.arraySource(sourceArray);

            expect(source.get()).to.equal(sourceArray[0]);
            expect(source.get()).to.equal(sourceArray[1]);
            expect(source.hasNext()).to.equal(false);
        });
    });

    describe('Concat Source', () => {

        it('should hasNext true, first stream has values, second does not', () => {
            const stream1: Stream<number> = Stream.ofValues(1, 2, 3);
            const stream2: Stream<number> = Stream.ofValues();
            const source: Source<Optional<number>> = Source.concatSource(stream1, stream2);

            expect(source.hasNext()).to.equal(true);
        });

        it('should hasNext first stream empty, second not empty', () => {
            const stream2: Stream<number> = Stream.ofValues(1, 2, 3);
            const stream1: Stream<number> = Stream.ofValues();
            const source: Source<Optional<number>> = Source.concatSource(stream1, stream2);

            expect(source.hasNext()).to.equal(true);
        });

        it('should hasNext true when both have values', () => {
            const stream1: Stream<number> = Stream.ofValues(1, 2, 3);
            const stream2: Stream<number> = Stream.ofValues(4, 5, 6);
            const source: Source<Optional<number>> = Source.concatSource(stream1, stream2);

            expect(source.hasNext()).to.equal(true);
        });

        it('should hasNext fa;se when both have no values', () => {
            const stream1: Stream<number> = Stream.ofValues();
            const stream2: Stream<number> = Stream.ofValues();
            const source: Source<Optional<number>> = Source.concatSource(stream1, stream2);

            expect(source.hasNext()).to.equal(false);
        });

        it('should get values first from stream1', () => {
            const stream1: Stream<number> = Stream.ofValues(1);
            const stream2: Stream<number> = Stream.ofValues(2);
            const source: Source<Optional<number>> = Source.concatSource(stream1, stream2);

            const result: Optional<number> = <any>source.get();
            expect(result.get()).to.equal(1);
        });

        it('should get values from stream2 after stream1 empty', () => {
            const stream1: Stream<number> = Stream.ofValues(1);
            const stream2: Stream<number> = Stream.ofValues(2);
            const source: Source<Optional<number>> = Source.concatSource(stream1, stream2);

            source.get();
            const result: Optional<number> = <any>source.get();
            expect(result.get()).to.equal(2);
        });
    });

    describe('Range Source', () => {
        it('return the start value first', () => {
            const source: Source<number> = Source.rangeSource(0, 4);

            expect(source.get()).to.equal(0);
        });

        it('if start and end are same, empty source', () => {
            const source: Source<number> = Source.rangeSource(0, 0);

            expect(source.hasNext()).to.equal(false);
        });

        it('default step to 1 when none supplied, ancending', () => {
            const source: Source<number> = Source.rangeSource(1, 3);

            const first: any = source.get();
            const second: any = source.get();
            const step = second - first;

            expect(Math.abs(step)).to.equal(1);
        });

        it('default step to 1 when none supplied, descending', () => {
            const source: Source<number> = Source.rangeSource(-1, -3);

            const first: any = source.get();
            const second: any = source.get();
            const step = second - first;

            expect(Math.abs(step)).to.equal(1);
        });

        it('uses supplied step as absolute value', () => {
            const source: Source<number> = Source.rangeSource(1, 10, 2);

            const first: any = source.get();
            const second: any = source.get();
            const step = second - first;

            expect(Math.abs(step)).to.equal(2);
        });

        it('uses supplied step as absolute value', () => {
            const source: Source<number> = Source.rangeSource(1, 10, -2);

            const first: any = source.get();
            const second: any = source.get();
            const step = second - first;

            expect(Math.abs(step)).to.equal(2);
        });

        it('uses supplied step as absolute value, decending range', () => {
            const source: Source<number> = Source.rangeSource(-1, -10, 2);

            const first: any = source.get();
            const second: any = source.get();
            const step = second - first;

            expect(Math.abs(step)).to.equal(2);
        });

        it('uses supplied step as absolute value, descending range', () => {
            const source: Source<number> = Source.rangeSource(-1, -10, -2);

            const first: any = source.get();
            const second: any = source.get();
            const step = second - first;

            expect(Math.abs(step)).to.equal(2);
        });

        it('should exclude end value', () => {
            const source: Source<number> = Source.rangeSource(0, 1);

            const first: any = source.get();
            const second: any = source.get();

            expect(first).to.equal(0);
            expect(second).to.equal(undefined);
        });

        it('should not hasNext when end values is next', () => {
            const source: Source<number> = Source.rangeSource(0, 1);

            source.get();
            expect(source.hasNext()).to.equal(false);
        });
    });
});