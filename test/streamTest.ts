import Stream from '../stream';
import Collectors from "../collectors";
import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
import Optional from '../optional';
import {Supplier, Transformer } from '../functions';
use(spies);

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
    });

    describe('allMatch', () => {
        it('it should return true if all items match', () => {
            const source = [1, 2, 3];
            const stream = Stream.of(source);
            const result = stream.allMatch(i => i < 5);
            expect(result).to.equal(true);
        });

        it('it should return false if not all items match', () => {
            const source = [1, 2, 3, 9];
            const stream = Stream.of(source);
            const result = stream.allMatch(i => i < 5);
            expect(result).to.equal(false);
        });

        it('it should short circuit and only go until false is reached', () => {
            const source = [1, 2, 1, 1];
            const stream = Stream.of(source);
            const spyMatcher = spy((i: number) => i === 1)
            const result = stream.allMatch(spyMatcher);
            expect(spyMatcher).to.be.called.exactly(2);
        });
    });

    describe('anyMatch', () => {
        it('it should return true if any items match', () => {
            const source = [1, 2, 3];
            const stream = Stream.of(source);
            const result = stream.anyMatch(i => i === 2);
            expect(result).to.equal(true);
        });

        it('it should return false if no items match', () => {
            const source = [1, 2, 3, 9];
            const stream = Stream.of(source);
            const result = stream.anyMatch(i => i === 0);
            expect(result).to.equal(false);
        });

        it('it should short circuit and only go until match is reached', () => {
            const source = [1, 2, 1, 1];
            const stream = Stream.of(source);
            const spyMatcher = spy((i: number) => i === 2)
            const result = stream.anyMatch(spyMatcher);
            expect(spyMatcher).to.be.called.exactly(2);
        });
    });

    describe('count', () => {
        it('it should return number of values in the stream', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);
            const result = stream.count();
            expect(result).equal(source.length);
        });

        it('it should return number of values in the stream 0 if empty', () => {
            const stream = Stream.empty();
            const result = stream.count();
            expect(result).equal(0);
        });

        it('it should return number of values in the stream 0 if empty', () => {
            const stream = Stream.ofValues(1, 1, 1);
            const result = stream.filter(i => i === 2).count();
            expect(result).equal(0);
        });
    });

    describe('customCollect', () => {
        it('it should apply a mutable reduction, works for basic list builder', () => {
            const supplier: Supplier<number[]> = () => [];
            const accumulator = (s: number[], n: number) => s.push(n);
            const combiner = (s1: number[], s2:number[]) => s1.concat(s2);
            const result = Stream.ofValues(1,2,3).customCollect(supplier, accumulator, combiner);
            expect(result.length).to.eq(3);
            expect(result).to.contain(1);
            expect(result).to.contain(2);
            expect(result).to.contain(3);
        });
    });

    describe('findFirst', () => {
        it('it return the first element in the stream', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);
            const result = stream.findFirst();
            expect(result.isPresent()).to.equal(true);
            expect(result.get()).to.equal(1);
        });

        it('it return optional empty if stream is empty', () => {
            const stream = Stream.empty()
            const result = stream.findFirst();
            expect(result.isPresent()).to.equal(false);
        });

        it('it should be short circuiting', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);

            const spyTransformer = spy(Transformer.identity());
            stream.map(spyTransformer).findFirst();

            expect(spyTransformer).to.be.called.exactly(1);
        });
    });
    describe('findFirst', () => {
        it('it return the first element in the stream', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);
            const result = stream.findFirst();
            expect(result.isPresent()).to.equal(true);
            expect(result.get()).to.equal(1);
        });

        it('it return optional empty if stream is empty', () => {
            const stream = Stream.empty()
            const result = stream.findFirst();
            expect(result.isPresent()).to.equal(false);
        });

        it('it should be short circuiting', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);

            const spyTransformer = spy(Transformer.identity());
            stream.map(spyTransformer).findFirst();

            expect(spyTransformer).to.be.called.exactly(1);
        });
    });

    describe('findAny', () => {
        it('it return an item in the stream', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);
            const result = stream.findAny();
            expect(result.isPresent()).to.equal(true);
            expect(source).to.contain(result.get());
        });

        it('it return optional empty if stream is empty', () => {
            const stream = Stream.empty()
            const result = stream.findAny();
            expect(result.isPresent()).to.equal(false);
        });

        it('it should be short circuiting', () => {
            const source = [1, 2, 3, 11, 12, 13];
            const stream = Stream.of(source);

            const spyTransformer = spy(Transformer.identity());
            stream.map(spyTransformer).findAny();

            expect(spyTransformer).to.be.called.exactly(1);
        });
    });

    describe('flatMap', () => {
        it('it should, flatten a stream of streams', () => {
            const stream1 = Stream.ofValues(1,2,3);
            const stream2 = Stream.ofValues(1,2,3);
            const stream = Stream.ofValues(stream1, stream2);
            
            const listResult = stream.flatMap(i => i).collect(Collectors.toList());
            
            expect(listResult.length).to.equal(6);
            expect(listResult[0]).to.equal(1);
            expect(listResult[5]).to.equal(3); 
        });

        it('it should lazily pull from input streams', () => {
            
            const s1Spy = spy(Transformer.identity());
            const s2Spy = spy(Transformer.identity());        

            const stream1 = Stream.ofValues(1,2,3).map(s1Spy);
            const stream2 = Stream.ofValues(1,2,3).map(s2Spy);
            const stream = Stream.ofValues(stream1, stream2);
            
            stream.flatMap(i => i).filter(i => i === 2).findFirst();
            
            expect(s1Spy).to.be.called.exactly(2);
            expect(s2Spy).to.be.called.exactly(0);
        });
    });

    describe('flatMapList', () => {
        it('it should, flatten a stream of lists', () => {
            const l1 = [1,2,3];
            const l2 = [1,2,3];
            const stream = Stream.ofValues(l1, l2);
            
            const listResult = stream.flatMapList(i => i).collect(Collectors.toList());
            
            expect(listResult.length).to.equal(6);
            expect(listResult[0]).to.equal(1);
            expect(listResult[5]).to.equal(3); 
        });
    });

    describe('flatMapOptional', () => {
        it('it should return stream of values when optional has a value', () => {
            const stream: Stream<Optional<number>> = Stream.ofValues(Optional.of(1), Optional.of(2), Optional.empty(), Optional.of(3));
            const listResult = stream.flatMapOptional(i => i).collect(Collectors.toList());
            
            expect(listResult.length).to.equal(3);
            expect(listResult[0]).to.equal(1);
            expect(listResult[1]).to.equal(2); 
            expect(listResult[2]).to.equal(3); 
        });
    });
});