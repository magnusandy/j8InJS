import { expect } from "chai";
import { Errors } from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";
import { Stream } from '../stream';
import Collectors, { Collector } from "../collectors";
import { Optional } from "../optional";

describe('Stream tests', () => {

    describe('collect to list tests', () => {
        it('it should put all elements in the stream into the collector', () => {
            const source = [1, 2, 3, 4, 5];
            const stream: Stream<number> = Stream.of(source);
            const result: number[] = stream.collect(Collectors.toList())

            expect(result.length).to.equal(5);
            source.forEach(item => expect(result).to.contain(item))
        });

        it('it should handle empty stream', () => {
            const stream: Stream<number> = Stream.of([]);
            const result: number[] = stream.collect(Collectors.toList())

            expect(result.length).to.equal(0);
        });

    });

    describe('forEach', () => {
        it('it should run consumer on all elements', () => {
            let sum = 0;
            const source = [1, 1, 1, 1, 1];
            const stream: Stream<number> = Stream.of(source);
            stream.forEach(i => sum = sum + i);

            expect(sum).to.equal(5);
        });

        it('it should not run consumer if stream is empty', () => {
            let consumerRan = false;
            const stream: Stream<number> = Stream.of([]);
            stream.forEach(i => consumerRan = true);

            expect(consumerRan).to.equal(false);
        });
    });

    describe('distinct', () => {

        it('it return a stream of distinct values', () => {
            const source = [4, 1, 2, 3, 2, 1, 1, 1, 1, 1];
            const expectedValues = [1, 2, 3, 4];
            const stream = Stream.of(source);
            const result = stream.distinct().collect(Collectors.toList());

            expect(result.length).to.equal(4);
            expectedValues.forEach(item => expect(result).to.contain(item));
        });

        it('it should work as the first intermediate operation', () => {
            const source = [4, 1, 2, 3, 2, 1, 1, 1, 1, 1];
            const expectedValues = ['1', '2', '3', '4'];
            const stream = Stream.of(source);
            const result = stream.distinct().map(n => `${n}`).collect(Collectors.toList());

            expect(result.length).to.equal(4);
            expectedValues.forEach(item => expect(result).to.contain(item));
        });

        it('it should work preceeded by stateless op', () => {
            it('it should work as the first intermediate operation', () => {
                const source = [4, 1, 2, 3, 2, 1, 1, 1, 1, 1];
                const expectedValues = ['1', '2', '3', '4'];
                const stream = Stream.of(source);
                const result = stream
                    .map(n => `${n}`)
                    .distinct()
                    .collect(Collectors.toList());

                expect(result.length).to.equal(4);
                expectedValues.forEach(item => expect(result).to.contain(item));
            });
        });

        it('it should work if multiple calls in one stream', () => {
            const source = ['cat', 'bat', 'cat'];
            const expectedValues = ['c', 'a', 't', 'b'];
            const stream = Stream.of(source);
            const result = stream
                .distinct()
                .flatMapList(word => word.split(''))
                .distinct()
                .collect(Collectors.toList());

            expect(result.length).to.equal(4);
            expectedValues.forEach(item => expect(result).to.contain(item));
        });

        it('it should work in complicated pipeline', () => {
            const source = ['cat', 'bat', 'cat'];
            const expectedValues = ['a'];
            const stream = Stream.of(source);
            const result = stream
                .distinct()
                .flatMapList(word => word.split(''))
                .distinct()
                .filter(i => i === 'a')
                .collect(Collectors.toList());

            expect(result.length).to.equal(1);
            expectedValues.forEach(item => expect(result).to.contain(item));
        });
    });

    describe('forEach tests', () => {
        it('it should consume all values', () => {
            const stream: Stream<string> = Stream.generate(() => '1').limit(5);
            const result = stream.collect(Collectors.toList());
            console.log(result)
        });

        it('it should consume all values', () => {
            const stream: Stream<string> = Stream.of(['a,b,c', 'e,f,g']).flatMapList(i => i.split(','));
            const consumer: Consumer<string> = (s: string) => console.log(s);
            console.log(stream.collect(Collectors.toList()));
        });

        it('it should filterValues', () => {
            const stream: Stream<string> = Stream.of([4, 4, 5, 1, 2, 3, 4, 4, 5, 1])
                .distinctPredicate((i1, i2) => i1 === i2)
                .map(e => `1`)
                .distinctPredicate((s1, s2) => s1 === s2);

            console.log(stream.collect(Collectors.toList()));
        });
    });

});