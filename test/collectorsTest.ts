import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
import Stream from "../stream";
import Collectors, { Collector } from "../collectors";
import { Map } from '../map';
import Optional from "../optional";
import { Comparator } from "..";
import { Transformer } from "../functions";
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
            expect(list).to.contain.members([3, 3, 3, 3, 3, 3])
        });
    });

    describe('maxBy', () => {
        it('it should return collector that returns largest element by comparator, default comparator', () => {
            const source = [6, 12, 5, 1, 3];
            const max: Optional<number> = Stream.of(source)
                .collect(Collectors.maxBy());

            expect(max.isPresent()).eq(true);
            expect(max.get()).to.be.eq(12);
        });

        it('it should return collector that returns largest element by comparator, custom comparator', () => {
            const reverseComparator = (x: any, y: any) => Comparator.default()(y, x);
            const source = [6, 12, 5, 1, 3];
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
            const source = [6, 12, 5, 1, 3];
            const min: Optional<number> = Stream.of(source)
                .collect(Collectors.minBy());

            expect(min.isPresent()).eq(true);
            expect(min.get()).to.be.eq(1);
        });

        it('it should return collector that returns largest element by comparator, custom comparator', () => {
            const reverseComparator = (x: any, y: any) => Comparator.default()(y, x);
            const source = [6, 12, 5, 1, 3];
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

    describe('partitioningBy', () => {
        it('it should return collector partitions by predicate without downstream', () => {
            const source = ["cat", "dogs", "ants", "dat", "car", "cut"];
            const map: Map<boolean, string[]> = Stream.of(source)
                .collect(Collectors.partitioningBy((i) => i.length === 4));

            expect(map.containsKey(true)).eq(true);
            expect(map.containsKey(false)).eq(true);
            expect(map.get(true)).to.include.members(["dogs", "ants"])
            expect(map.get(false)).to.include.members(["cat", "dat", "car", "cut"])
        });

        it('it should return empty lists for when nothing in partition', () => {
            const source = ["cat", "dat", "car", "cut"];
            const map: Map<boolean, string[]> = Stream.of(source)
                .collect(Collectors.partitioningBy((i) => i.length === 4));

            expect(map.containsKey(true)).eq(true);
            expect(map.containsKey(false)).eq(true);
            expect(map.getOptional(true).get().length).to.eq(0);
            expect(map.get(false)).to.include.members(["cat", "dat", "car", "cut"])
        });

        it('it should return collector partitions by predicate with downstream', () => {
            const source = ["cat", "dogs", "ants", "dat", "car", "cut"];
            const map = Stream.of(source)
                .collect(Collectors.partitioningBy(
                    (i) => i.length === 4,
                    Collectors.joining(""))
                );

            expect(map.containsKey(true)).eq(true);
            expect(map.containsKey(false)).eq(true);
            expect(map.get(true)).to.eq("dogsants")
            expect(map.get(false)).to.eq("catdatcarcut")
        });

        it('it should return collector partitions by predicate with downstream, if empty returns collector default', () => {
            const source = ["cat", "dat", "car", "cut"];
            const map = Stream.of(source)
                .map(i => i.length)
                .collect(Collectors.partitioningBy(
                    (i) => i === 4,
                    Collectors.averaging())
                );

            expect(map.containsKey(true)).eq(true);
            expect(map.containsKey(false)).eq(true);
            expect(map.get(true)).to.eq(0)
            expect(map.get(false)).to.eq(3)
        });
    });

    describe('reducing', () => {
        it('it should work if just given a reducing function', () => {
            const source = [1, 2, 3, 4];
            const result: Optional<number> = Stream.of(source)
                .collect(Collectors.reducing((i, i2) => i + i2));

            expect(result.isPresent()).eq(true);
            expect(result.get()).eq(10);
        });

        it('it should work if just given a reducing function, empty inputs', () => {
            const result: Optional<number> = Stream.empty<number>()
                .collect(Collectors.reducing((i, i2) => i + i2));

            expect(result.isPresent()).eq(false);
        });

        it('it should work if just given a reducing function and identity, empty inputs return identity', () => {
            const id = 5;
            const result: Optional<number> = Stream.empty<number>()
                .collect(Collectors.reducing((i, i2) => i + i2, id));

            expect(result.isPresent()).eq(true);
            expect(result.get()).eq(id);
        });

        it('it should work if just given a reducing function and identty includes identity', () => {
            const id = 1;
            const source = [1, 2, 3, 4];
            const result: Optional<number> = Stream.of(source)
                .collect(Collectors.reducing((i, i2) => i + i2, id));

            expect(result.isPresent()).eq(true);
            expect(result.get()).eq(10 + id);
        });

        it('it should work if just given a reducing function and identty includes identity', () => {
            const id = 1;
            const source = ['1', '2', '3', '4'];
            const result: Optional<number> = Stream.of(source)
                .collect(Collectors.reducing((i, i2) => i + i2, id, (s) => parseInt(s)));

            expect(result.isPresent()).eq(true);
            expect(result.get()).eq(10 + id);
        });
    });

    describe('summarizingNumber', () => {
        it('it should return collector applies to numbers if no mapper specified', () => {
            const source = ["10", "20", "30"];
            const average = Stream.of(source)
                .map(parseInt)
                .collect(Collectors.summarizingNumber());
            expect(average.getAverage()).eq(20);
            expect(average.getMax()).eq(30);
            expect(average.getMin()).eq(10);
            expect(average.getSum()).eq(60);
            expect(average.getCount()).eq(3);
        });

        it('it should return collector applies to non numbers if mapper specified', () => {
            const source = ["10", "20", "30"];
            const average = Stream.of(source)
                .collect(Collectors.summarizingNumber(parseInt));
            expect(average.getAverage()).eq(20);
            expect(average.getMax()).eq(30);
            expect(average.getMin()).eq(10);
            expect(average.getSum()).eq(60);
            expect(average.getCount()).eq(3);
        });

        it('it should return collector applies to numbers if mapper specified', () => {
            const source = [10, 20, 30];
            const average = Stream.of(source)
                .collect(Collectors.summarizingNumber(Transformer.identity()));
            expect(average.getAverage()).eq(20);
            expect(average.getMax()).eq(30);
            expect(average.getMin()).eq(10);
            expect(average.getSum()).eq(60);
            expect(average.getCount()).eq(3);
        });
    });

    describe('summingNumber', () => {
        it('it should return collector that sums numbers without a mapper', () => {
            const source = ["10", "20", "30"];
            const sum = Stream.of(source)
                .map(parseInt)
                .collect(Collectors.summingNumber());
            expect(sum).eq(60);
        });

        it('it should return collector that sums with a mapper ', () => {
            const source = ["10", "20", "30"];
            const sum = Stream.of(source)
                .collect(Collectors.summingNumber(parseInt));
            expect(sum).eq(60);
        });

        it('it should return collector applies to numbers with mapper and number stream', () => {
            const source = ["10", "20", "30"];
            const sum = Stream.of(source)
                .map(parseInt)
                .collect(Collectors.summingNumber((i) => i + 1));
            expect(sum).eq(63);
        });
    });
});