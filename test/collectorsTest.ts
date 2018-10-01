import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
import Stream from "../stream";
import Collectors, { Collector } from "../collectors";
import { Map } from '../map';
import Optional from "../optional";
import { Comparator } from "..";
use(spies);

describe('Collectors', () => {
    describe('toArray', () => {
        it('should collect the values to an array', () => {
            const source = [1, 3, 4];
            const stream = Stream.of(source);
            const result = stream.collect(Collectors.toArray());

            expect(result).to.contain.ordered.members(source);
        });
    });

    describe('toList', () => {
        it('should collect the values to an array', () => {
            const source = [1, 3, 4];
            const stream = Stream.of(source);
            const result = stream.collect(Collectors.toList());

            expect(result).to.contain.ordered.members(source);
        });
    });

    describe('joining', () => {
        it('should concatinate values into a single string', () => {
            const source = ["a", "b", "c"];
            const stream = Stream.of(source);
            const result: string = stream.collect(Collectors.joining());

            expect(result).equal("abc");
        });

        it('should concatinate values into a single string, including a delimiter', () => {
            const source = ["a", "b", "c"];
            const stream = Stream.of(source);
            const result: string = stream.collect(Collectors.joining(","));

            expect(result).equal("a,b,c");
        });

        it('should concatinate values into a single string, including delimiter, prefix and suffix', () => {
            const source = ["a", "b", "c"];
            const stream = Stream.of(source);
            const result: string = stream.collect(Collectors.joining(",", "pre-", "-post"));

            expect(result).equal("pre-a,b,c-post");
        });

        it('should return empty string with no params and empty stream', () => {
            const stream: Stream<string> = Stream.empty();
            const result: string = stream.collect(Collectors.joining());

            expect(result).equal("");
        });

        it('should return empty string with delim params and empty stream', () => {
            const stream: Stream<string> = Stream.empty();
            const result: string = stream.collect(Collectors.joining());

            expect(result).equal("");
        });

        it('should return just pre and post when stream empty', () => {
            const stream: Stream<string> = Stream.empty();
            const result: string = stream.collect(Collectors.joining(",", "a", "b"));

            expect(result).equal("ab");
        });
    });

    describe('averagingNumber', () => {
        it('it should return the average of a given set of numbers', () => {
            const source = ["10", "20", "30"];
            const average = Stream.of(source).collect(Collectors.averagingNumber(parseInt));
            expect(average).eq(20);
        });

        it('it should return the average of a given set of numbers', () => {
            const source = ["10", "11"];
            const average = Stream.of(source).collect(Collectors.averagingNumber(parseInt));
            expect(average).eq(10.5);
        });

        it('it should return the average 0 if no inputs', () => {
            const source: string[] = [];
            const average = Stream.of(source).collect(Collectors.averagingNumber(parseInt));
            expect(average).eq(0);
        });
    });

    describe('averaging', () => {
        it('it should return the average of a given set of numbers', () => {
            const source = ["10", "20", "30"];
            const average = Stream.of(source)
                .map(parseInt)
                .collect(Collectors.averaging());
            expect(average).eq(20);
        });
    });

    describe('collectingAndThen', () => {
        it('it should return collector that applies new finisher as well', () => {
            const source = ["10", "20", "30"];
            const average = Stream.of(source)
                .map(parseInt)
                .collect(Collectors.collectingAndThen(Collectors.averaging(), (i) => `${i}`));
            expect(average).eq("20");
        });
    });

    describe('counting', () => {
        it('it should return collector counts elements, given there is elements', () => {
            const source = ["10", "20", "30"];
            const count = Stream.of(source)
                .collect(Collectors.counting());
            expect(count).eq(source.length);
        });

        it('it should return collector counts elements, given there is no elements', () => {
            const count = Stream.empty()
                .collect(Collectors.counting());
            expect(count).eq(0);
        });
    });

    describe('groupingBy', () => {
        it('it should return collector that groups elements by classifier', () => {
            const source = ["cat", "dog", "ant", "dat", "car", "cut"];
            const mapByFirstLetter: Map<string, string[]> = Stream.of(source)
                .collect(Collectors.groupingBy(word => word.charAt(0)));

            expect(mapByFirstLetter.keySet().length).eq(3);
            expect(mapByFirstLetter.getOptional('c').get()).to.contain.members(['cat', 'car', 'cut']);
            expect(mapByFirstLetter.getOptional('d').get()).to.contain.members(['dog']);
            expect(mapByFirstLetter.getOptional('a').get()).to.contain.members(['ant']);     
        });
    });

    describe('mapping', () => {
        it('it should return collector that maps elements and then does the next collector', () => {
            const source = ["cat", "dog", "ant", "dat", "car", "cut"];
            const list: number[] = Stream.of(source)
                .collect(Collectors.mapping(
                    s => s.length,
                    Collectors.toList()
                ));

            expect(list.length).eq(6);
            expect(list).to.contain.members([3,3,3,3,3,3])     
        });
    });

    describe('maxBy', () => {
        it('it should return collector that returns largest element by comparator, default comparator', () => {
            const source = [6,12,5,1,3];
            const max: Optional<number> = Stream.of(source)
                .collect(Collectors.maxBy());

            expect(max.isPresent()).eq(true);
            expect(max.get()).to.be.eq(12);
        });

        it('it should return collector that returns largest element by comparator, custom comparator', () => {
            const reverseComparator = (x:any, y:any) => Comparator.default()(y,x);
            const source = [6,12,5,1,3];
            const max: Optional<number> = Stream.of(source)
                .collect(Collectors.maxBy(reverseComparator));

            expect(max.isPresent()).eq(true);
            expect(max.get()).to.be.eq(1);
        });

        it('it should return collector result is empty optional if no elements', () => {
            const max: Optional<number> = Stream.empty<number>()
                .collect(Collectors.maxBy());

            expect(max.isPresent()).eq(false);
        });
    });

    describe('minBy', () => {
        it('it should return collector that returns smallest element by comparator, default comparator', () => {
            const source = [6,12,5,1,3];
            const min: Optional<number> = Stream.of(source)
                .collect(Collectors.minBy());

            expect(min.isPresent()).eq(true);
            expect(min.get()).to.be.eq(1);
        });

        it('it should return collector that returns largest element by comparator, custom comparator', () => {
            const reverseComparator = (x:any, y:any) => Comparator.default()(y,x);
            const source = [6,12,5,1,3];
            const min: Optional<number> = Stream.of(source)
                .collect(Collectors.minBy(reverseComparator));

            expect(min.isPresent()).eq(true);
            expect(min.get()).to.be.eq(12);
        });

        it('it should return collector result is empty optional if no elements', () => {
            const min: Optional<number> = Stream.empty<number>()
                .collect(Collectors.minBy());

            expect(min.isPresent()).eq(false);
        });
    });
});