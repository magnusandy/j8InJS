import { expect } from "chai";
import { Errors } from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";
import { Stream } from '../stream';
import Collectors from "../collectors";
import { Optional } from "../optional";

describe('Stream tests', () => {
    it('collect(collector: Collector<T, R, R) should collect when given Collector.toList()', () => {
        const sourceArr = [1, 2, 3];
        const source = Stream.of(sourceArr);
        const collected = source.collect(Collectors.toList());

        expect(collected.length).to.equal(sourceArr.length);
        expect(collected[0]).to.equal(sourceArr[0]);
        expect(collected[1]).to.equal(sourceArr[1]);
        expect(collected[2]).to.equal(sourceArr[2]);
    });

    it('defaultCollect should collect when given attributes to collect to a list', () => {
        const sourceArr = [1, 2, 3];
        const source = Stream.of(sourceArr);
        const combiner = (l1: number[], l2: number[]) => {
            l2.forEach(i => l1.push(i))
        }
        const collected = source.defaultCollect((): number[] => [], (list, item) => list.push(item), combiner);

        expect(collected.length).to.equal(sourceArr.length);
        expect(collected[0]).to.equal(sourceArr[0]);
        expect(collected[1]).to.equal(sourceArr[1]);
        expect(collected[2]).to.equal(sourceArr[2]);
    });

    it('map should transform all values if a terminal operaion is called', () => {
        const newValue: string = 'a';
        const source: Stream<number> = Stream.of([1, 2, 3]);
        const stringStream: Stream<string> = source.map(n => newValue)
        const result: string[] = stringStream.collect(Collectors.toList());
        expect(result.length).to.equal(3);
        expect(result[0]).to.equal(newValue);
        expect(result[1]).to.equal(newValue);
        expect(result[2]).to.equal(newValue);
    });

    it('map should lazily apply operations when terminal is called', () => {
        let activated = false;
        const source: Stream<number> = Stream.of([1, 2, 3]);
        const stringStream: Stream<string> = source.map(n => { activated = true; return 'a' })

        expect(activated).to.equal(false);
        const result: string[] = stringStream.collect(Collectors.toList());
        expect(activated).to.equal(true);
    })

    it('forEach should apply a consumer to each element', () => {
        let count = 0;
        const source: Stream<number> = Stream.of([1, 1, 1]);
        source.forEach(i => count = count + i);

        expect(count).to.equal(3);
    });

    it('allMatch should return true if stream is empty', () => {
        const source: Stream<number> = Stream.of<number>([]);
        const allMatched: boolean = source.allMatch((i) => false);
        expect(allMatched).to.equal(true);
    });

    it('allMatch should return true all items in the stream return true predicate', () => {
        const source: Stream<number> = Stream.of([1, 2, 3]);
        const allMatched: boolean = source.allMatch((i) => i < 10);
        expect(allMatched).to.equal(true);
    });

    it('allMatch should return false not all items in the stream return true predicate', () => {
        const source: Stream<number> = Stream.of([1, 2, 12]);
        const allMatched: boolean = source.allMatch((i) => i < 10);
        expect(allMatched).to.equal(false);
    });

    it('allMatch should lazily apply predicates, applying only until false is found', () => {
        let count = 0;
        const source: Stream<number> = Stream.of([1, 12, 2]);
        source.allMatch((i) => { count++; return i < 10; });
        expect(count).to.equal(2);
    });

    it('anyMatch should return false if stream is empty', () => {
        const source: Stream<number> = Stream.of<number>([]);
        const anyMatched: boolean = source.anyMatch((i) => false);
        expect(anyMatched).to.equal(false);
    });

    it('anyMatch should return true any 1 item in the stream return true predicate', () => {
        const source: Stream<number> = Stream.of([12, 13, 3]);
        const anyMatch: boolean = source.anyMatch((i) => i < 10);
        expect(anyMatch).to.equal(true);
    });

    it('anyMatch should return false if no items return true predicate', () => {
        const source: Stream<number> = Stream.of([1, 2, 3]);
        const anyMatched: boolean = source.anyMatch((i) => i > 10);
        expect(anyMatched).to.equal(false);
    });

    it('anyMatch should lazily apply predicates, applying only until true is found', () => {
        let count = 0;
        const source: Stream<number> = Stream.of([1, 12, 2]);
        source.anyMatch((i) => { count++; return i > 10; });
        expect(count).to.equal(2);
    });

    it('count should return number of elements in stream', () => {
        const source: Stream<number> = Stream.of([1, 12, 2]);
        const count = source.count();
        expect(count).to.equal(3);
    });

    it('count should return number of elements in stream after a map', () => {
        const source: Stream<string> = Stream.of([1, 12, 2]).map(i => i.toString());
        const count = source.count();
        expect(count).to.equal(3);
    });

    it('findFirst should return the first value in the stream if values exist', () => {
        const source: Stream<string> = Stream.of([1, 12, 2]).map(i => i.toString());
        const first: Optional<string> = source.findFirst();
        expect(first.isPresent()).to.equal(true);
        expect(first.get()).to.equal('1');
    });

    it('findFirst should Optional empty if no values', () => {
        const source: Stream<string> = Stream.of<number>([]).map(i => i.toString());
        const first: Optional<string> = source.findFirst();
        expect(first.isPresent()).to.equal(false);
    });

    it('findAny should a value in the stream if any exist', () => {
        const sourceMapped: string[] = ['1', '12', '2'];
        const source: Stream<string> = Stream.of([1, 12, 2]).map(i => i.toString());
        const first: Optional<string> = source.findAny();
        expect(first.isPresent()).to.equal(true);
        const index = sourceMapped.indexOf(first.get());
        expect(index).to.not.equal(undefined);
    });

    it('findFirst should Optional empty if no values', () => {
        const source: Stream<string> = Stream.of<number>([]).map(i => i.toString());
        const first: Optional<string> = source.findAny();
        expect(first.isPresent()).to.equal(false);
    });

});