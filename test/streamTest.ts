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
            const stream: Stream<number> = Stream.empty();
            const result: number[] = stream.collect(Collectors.toList())

            expect(result.length).to.equal(0);
        });

    });

    describe('forEach', () => {
        it('it should run consumer on all elements', () => {
            let sum = 0;
            const source = [1, 1, 1, 1, 1];
            const stream: Stream<number> = Stream.of(source);
            stream.forEachOrdered(i => sum = sum + i);

            expect(sum).to.equal(5);
        });

        it('it should not run consumer if stream is empty', () => {
            let consumerRan = false;
            const stream: Stream<number> = Stream.empty();
            stream.forEachOrdered(i => consumerRan = true);

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

        it('it should work if preceeded by short circuiting op', () => {
            const source = ['abc', '123'];
            const expected = ['a', 'b'];
            const stream = Stream.of(source);
            const result = stream.flatMapList(word => word.split(''))
                .limit(2)
                .distinct()
                .collect(Collectors.toList());

            expect(result.length).to.equal(2)
            expected.forEach(item => expect(result).to.contain(item));
        });

        it('it should work if followed by short circuiting op', () => {
            const source = ['abc', '123'];
            const expected = ['a', 'b'];
            const stream = Stream.of(source);
            const result = stream.flatMapList(word => word.split(''))
                .distinct()
                .limit(2)
                .collect(Collectors.toList());

            expect(result.length).to.equal(2)
            expected.forEach(item => expect(result).to.contain(item));
        });

        it('it greedily consume elements even if terminal is short circuiting', () => {
            //todo 
        });
    
    });

    describe('filter tests', () => {
        it('it keeps matching values in the stream', () => {
            const source = [1,2,3,11,12,13];
            const expectedValues = [1,2,3];
            const stream = Stream.of(source);
            const result = stream.filter(i => i < 10)
            .collect(Collectors.toList());

            expect(result.length).to.equal(3);
            expectedValues.forEach(item => expect(result).to.contain(item));
        });

        it('it should lazily filter only when terminal is called', () => {
            let count = 0;
            const source = [1,2,3,11,12,13];
            let stream = Stream.of(source);
            stream = stream.filter(i =>{count++; return i < 10});
            expect(count).to.equal(0);
            stream.collect(Collectors.toList());
            expect(count).to.equal(6);
        });

        it('it should lazily filter only as necessary for short circuiting terminal', () => {
            //todo
        });
    });

    describe('forEach tests', () => {
        it('it should consume all values', () => {

        });
    });

    describe('forEach tests', () => {
        it('it should consume all values', () => {
            const stream: Stream<number> = Stream.ofValues();
            const result = stream.reduce((x, y) => x+y, 1);
            console.log(result)
        });

        it('it should consume all values', () => {
            const stream: Stream<string> = Stream.of(['a,b,c', 'e,f,g']).flatMap(i => Stream.of(i.split(',')));
            const consumer: Consumer<string> = (s: string) => console.log(s);
            console.log(stream.collect(Collectors.toList()));
        });

        it('it should filterValues', () => {
            const stream: Stream<string> = Stream.of([4, 4, 5, 1, 2, 3, 4, 4, 5, 1])
                .distinct((i1, i2) => i1 === i2)
                .map(e => `1`)
                .distinct((s1, s2) => s1 === s2);

            console.log(stream.collect(Collectors.toList()));
        });
    });

});