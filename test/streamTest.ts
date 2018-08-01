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

    describe('Stream.concat', () => {
        it('it concatenate two streams with values', () => {
            const s1: Stream<number> = Stream.ofValues(1, 2, 3);
            const s2: Stream<number> = Stream.ofValues(4, 5, 6);
            const concat: Stream<number> = Stream.concat(s1, s2);

            const result = concat.toArray();

            expect(result.length).to.equal(6);
            expect(result[0]).to.equal(1);
            expect(result[5]).to.equal(6);
        });

        it('it concatenate first stream empty', () => {
            const s1: Stream<number> = Stream.empty();
            const s2: Stream<number> = Stream.ofValues(4, 5, 6);
            const concat: Stream<number> = Stream.concat(s1, s2);

            const result = concat.toArray();

            expect(result.length).to.equal(3);
            expect(result[0]).to.equal(4);
            expect(result[2]).to.equal(6);
        });

        it('it concatenate second stream empty', () => {
            const s1: Stream<number> = Stream.ofValues(1, 2, 3);
            const s2: Stream<number> = Stream.empty();
            const concat: Stream<number> = Stream.concat(s1, s2);

            const result = concat.toArray();

            expect(result.length).to.equal(3);
            expect(result[0]).to.equal(1);
            expect(result[2]).to.equal(3);
        });

        it('it concatenate two complex streams', () => {
            const s1: Stream<number> = Stream.ofValues('1', '2', '3').map((i: string) => parseInt(i)).distinct();
            const s2: Stream<number> = Stream.ofValues(4, 5, 6, 10, 20, 50).distinct().filter(i => i < 10);
            const concat: Stream<number> = Stream.concat(s1, s2);

            const result = concat.toArray();

            expect(result.length).to.equal(6);
            expect(result[0]).to.equal(1);
            expect(result[5]).to.equal(6);
        });

        it('it concatenate two complex streams with infinite', () => {
            const s1: Stream<number> = Stream.generate(() => 1).limit(3);
            const s2: Stream<number> = Stream.ofValues(4, 5, 6, 10, 20, 50).distinct().filter(i => i < 10);
            const concat: Stream<number> = Stream.concat(s1, s2);

            const result = concat.toArray();

            expect(result.length).to.equal(6);
            expect(result[0]).to.equal(1);
            expect(result[5]).to.equal(6);
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
            const source = [1, 2, 3, 11, 12, 13];
            const expectedValues = [1, 2, 3];
            const stream = Stream.of(source);
            const result = stream.filter(i => i < 10)
                .collect(Collectors.toList());

            expect(result.length).to.equal(3);
            expectedValues.forEach(item => expect(result).to.contain(item));
        });

        it('it should lazily filter only when terminal is called', () => {
            let count = 0;
            const source = [1, 2, 3, 11, 12, 13];
            let stream = Stream.of(source);
            stream = stream.filter(i => { count++; return i < 10 });
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
            const stream: Stream<number> = Stream.range(0, 0).skip(1);
            const result = stream.peek(Consumer.logger()).collect(Collectors.toList())
            console.log(result)
        });

        it('it should consume all values', () => {
            const stream: Stream<string> = Stream.of(['a,b,c', 'e,f,g']).flatMap(i => Stream.of(i.split(',')));
            const consumer: Consumer<string> = (s: string) => console.log(s);
            console.log(stream.collect(Collectors.toList()));
        });

        it('it should filterValues', () => {
            const stream: Stream<number> = Stream.of([4, 4, 5, 1, 2, 3, 4, 4, 5, 1])
                .sorted();

            console.log(stream.collect(Collectors.toList()));
        });
    });

});