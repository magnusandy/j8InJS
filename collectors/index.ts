import { Function, Supplier, BiConsumer, BiFunction, Comparator, Predicate } from "../functions";
import { MutableString, MutableNumber, Holder, NumberSummaryStatistics } from './mutableCollections';
import { Map } from '../map'
import Optional from "../optional";
import Stream from "../stream";
import Errors from "../errors";

/**
 * A mutable reduction operation that accumulates input elements into a mutable result container, 
 * optionally transforming the accumulated result into a final representation after all input elements have been processed.
 * 
 * Examples of mutable reduction operations include: accumulating elements into an array; concatenating strings;
 * computing summary information about elements such as sum, min, max, or average;
 * computing "pivot table" summaries such as "maximum valued transaction by seller", etc.
 * 
 * Collectors provides implementations of many common mutable reductions.
 * 
 * A Collector is specified by four functions that work together to accumulate entries into a mutable result container,
 * and optionally perform a final transform on the result. They are:
 * creation of a new result container (supplier())
 * incorporating a new data element into a result container (accumulator())
 * combining two result containers into one (combiner())
 * performing an optional final transform on the container (finisher())
 */
export class Collector<T, A, R> {
    private supp: Supplier<A>;
    private accu: BiConsumer<A, T>;
    private comb: BiFunction<A>;
    private fini: Function<A, R>;

    private constructor(supp: Supplier<A>, accu: BiConsumer<A, T>, comb: BiFunction<A>, fini: Function<A, R>) {
        this.supp = supp;
        this.accu = accu;
        this.comb = comb;
        this.fini = fini;
    }

    public supplier = (): Supplier<A> => this.supp;
    public accumulator = (): BiConsumer<A, T> => this.accu;
    public combiner = (): BiFunction<A> => this.comb;
    public finisher = (): Function<A, R> => this.fini;

    /**
    * A Collector is specified by four functions that work together to accumulate entries into a mutable result container,
    * and optionally perform a final transform on the result. They are:
    * @param supplier function that returns of a new result container
    * @param accumulator function for incorporating a new data element into a result container
    * @param combiner function for combining two result containers into one
    * @param finisher function for performing an optional final transform on the container
    */
    public static of<T, A, R>(supplier: Supplier<A>, accumulator: BiConsumer<A, T>, combiner: BiFunction<A>, finisher: Function<A, R>): Collector<T, A, R> {
        return new Collector(supplier, accumulator, combiner, finisher);
    }
};

/**
 * defines many useful collectors for easily reducing/collecting data together
 */
class Collectors {

    /**
     * A collector that combines input into an array.
     */
    public static toArray<T>(): Collector<T, T[], T[]> {
        const supplier: Supplier<T[]> = () => [];
        const accumulator: BiConsumer<T[], T> = (list, item) => list.push(item);
        const combiner: BiFunction<T[]> = (list1, list2) => list1.concat(list2);
        const finisher: Function<T[], T[]> = Function.identity();
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * alias of toArray()
     */
    public static toList<T>(): Collector<T, T[], T[]> {
        return Collectors.toArray();
    }

    /**
     * Returns a Collector that concatenates the input elements into a String, in encounter order.
     */
    public static joining(): Collector<string, MutableString, string>;
    /**
     * Returns a Collector that concatenates the input elements, separated by the specified delimiter, in encounter order.
     * @param delimiter - the delimiter to be used between each element
     */
    public static joining(delimiter: string): Collector<string, MutableString, string>;
    /**
     * Returns a Collector that concatenates the input elements, separated by the specified delimiter, with the specified prefix and suffix, in encounter order.
     * @param delimiter - the delimiter to be used between each element
     * @param prefix - the sequence of characters to be used at the beginning of the joined result
     * @param suffix - the sequence of characters to be used at the end of the joined result
     */
    public static joining(delimiter: string, prefix: string, suffix: string): Collector<string, MutableString, string>;
    public static joining(delimiter?: string, prefix?: string, suffix?: string): Collector<string, MutableString, string> {
        const ifElseBlank = (val?: string): string => val ? val : "";
        const delimiterToUse = ifElseBlank(delimiter);

        const supplier: Supplier<MutableString> = () => MutableString.empty();
        const accumulator: BiConsumer<MutableString, string> = (mutable, str) => mutable.append(str + delimiterToUse);
        const combiner: BiFunction<MutableString> = (mutable1, mutable2) => mutable1.concat(mutable2);
        const finisher: Function<MutableString, string> = (mutable) => {
            const valueWithExtraDelimiter = mutable.getValue();
            const valueWithOutExtraDelimiter = delimiterToUse.length === 0
                ? valueWithExtraDelimiter
                : valueWithExtraDelimiter.slice(0, -delimiterToUse.length);

            return ifElseBlank(prefix) + valueWithOutExtraDelimiter + ifElseBlank(suffix);
        }
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * Returns a Collector that produces the arithmetic mean of a number-valued function applied to the input elements.
     * @param mapper function to transform input elements into a number
     */
    public static averagingNumber<I>(mapper: Function<I, number>): Collector<I, MutableNumber, number> {
        const supplier: Supplier<MutableNumber> = MutableNumber.empty;
        const accumulator: BiConsumer<MutableNumber, I> = (mutable, item) => mutable.add(mapper(item));
        const combiner: BiFunction<MutableNumber> = (mNum1, mNum2) => mNum1.addTogether(mNum2);
        const finisher: Function<MutableNumber, number> = (mutable: MutableNumber) =>
            mutable.getInputCount() > 0
                ? mutable.getTotal() / mutable.getInputCount()
                : 0;
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * returns a Collector that produces the arithmetic mean of input numbers
     */
    public static averaging(): Collector<number, MutableNumber, number> {
        return Collectors.averagingNumber(Function.identity());
    }

    /**
     * Adapts a Collector to perform an additional finishing transformation.
     * @param downstream - a collector
     * @param finisher - a function to be applied to the final result of the downstream collector
     */
    public static collectingAndThen<I, M, A, O>(downStream: Collector<I, M, A>, finisher: Function<A, O>): Collector<I, M, O> {
        const newFinisher = (input: M) => finisher(downStream.finisher()(input))
        return Collector.of(downStream.supplier(), downStream.accumulator(), downStream.combiner(), newFinisher)
    }

    /**
     * Returns a Collector accepting elements of type I that counts the number of input elements. If no elements are present, the result is 0.
     */
    public static counting<I>(): Collector<I, MutableNumber, number> {
        const supplier: Supplier<MutableNumber> = MutableNumber.empty;
        const accumulator: BiConsumer<MutableNumber, I> = (mutable, item) => mutable.add(1);
        const combiner: BiFunction<MutableNumber> = (mNum1, mNum2) => mNum1.addTogether(mNum2);
        const finisher: Function<MutableNumber, number> = (mutable: MutableNumber) => mutable.getInputCount();

        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * Returns a Collector implementing a "group by" operation on input elements of type T,
     * grouping elements according to a classification function, and returning the results in a Map.
     * The classification function maps elements to some key type K. The collector produces a 
     * Map<K, T[]> whose keys are the values resulting from applying the classification function to the input elements,
     * and whose corresponding values are arrays containing the input elements which map to the associated key under the classification function.
     * @param classifier - the classifier function mapping input elements to keys
     */
    public static groupingBy<T, K>(classifier: Function<T, K>): Collector<T, Map<K, T[]>, Map<K, T[]>>;
    /**
     * Returns a Collector implementing a cascaded "group by" operation on input elements of type T,
     * grouping elements according to a classification function, and then performing a reduction operation 
     * on the values associated with a given key using the specified downstream Collector.
     * The classification function maps elements to some key type K. The downstream collector operates
     * on elements of type T and produces a result of type D. The resulting collector produces a Map<K, D>.
     * @param classifier - a classifier function mapping input elements to keys
     * @param downstream - a Collector implementing the downstream reduction
     */
    public static groupingBy<T, K, A, D>(classifier: Function<T, K>, downstream: Collector<T, A, D>): Collector<T, Map<K, T[]>, Map<K, D>>;
    public static groupingBy<T, K, A, D>(classifier: Function<T, K>, downstream?: Collector<T, A, D>): Collector<T, Map<K, T[]>, Map<K, T[]>> | Collector<T, Map<K, T[]>, Map<K, D>> {
        const supplier: Supplier<Map<K, T[]>> = () => Map.empty<K, T[]>();
        const accumulator: BiConsumer<Map<K, T[]>, T> = (map, item) => map.merge(
            classifier(item),
            [item],
            (l1, l2) => l1.concat(l2),
        );
        const combiner: BiFunction<Map<K, T[]>> = (map1, map2) => {
            map1.putAll(map2);
            return map1;
        }
        if (downstream) {
            const finisher: Function<Map<K, T[]>, Map<K, D>> = (initial) => {
                const newMap: Map<K, D> = Map.empty();
                initial.forEach((key, valList) =>
                    newMap.put(key, Stream.of(valList).collect(downstream))
                );
                return newMap;
            }
            return Collector.of<T, Map<K, T[]>, Map<K, D>>(supplier, accumulator, combiner, finisher);
        } else {
            return Collector.of<T, Map<K, T[]>, Map<K, T[]>>(supplier, accumulator, combiner, Function.identity());
        }
    }

    /**
     * Adapts a Collector accepting elements of type U to one accepting elements of type T by applying a mapping function to each input element before accumulation.
     * @param mapper - a function to be applied to the input elements
     * @param downstream - a collector which will accept mapped values
     */
    public static mapping<I, II, A, R>(mapper: Function<I, II>, downstream: Collector<II, A, R>): Collector<I, A, R> {
        return Collector.of(
            downstream.supplier(),
            (mutable: A, item: I) => downstream.accumulator()(mutable, mapper(item)),
            downstream.combiner(),
            downstream.finisher()
        );
    }

    /**
     * Returns a Collector that will return the max value as determined by the default comparator
     * See, Comparator.default(); the max value is returned in an optional, or empty if no value
     * was found.
     */
    public static maxBy<I>(): Collector<I, Holder<I>, Optional<I>>
    /**
     * Returns a Collector that will return the max value as determined by the given comparator
     * the max value is returned in an optional, or empty if no value was found.
     * @param comparator - a Comparator for comparing elements
     */
    public static maxBy<I>(comparator: Comparator<I>): Collector<I, Holder<I>, Optional<I>>;
    public static maxBy<I>(comparator?: Comparator<I>): Collector<I, Holder<I>, Optional<I>> {
        const comparatorToUse = comparator ? comparator : Comparator.default();
        const supplier: Supplier<Holder<I>> = () => new Holder();
        const accumulator: BiConsumer<Holder<I>, I> = (mutable, item) => {
            const currentMax = mutable.get();
            if (currentMax.isPresent()) {
                const newMax: I = currentMax
                    .map(current => returnLargest(current, item, comparatorToUse))
                    .get();
                mutable.set(newMax);
            } else {
                mutable.set(item);
            }
        }
        const combiner: BiFunction<Holder<I>> = (h1: Holder<I>, h2: Holder<I>) => {
            const first = h1.get();
            const second = h2.get();
            if (first.isPresent() && second.isPresent()) {
                return new Holder(returnLargest(first.get(), second.get(), comparatorToUse));
            } else if (first.isPresent()) {
                return h1;
            } else {
                return h2;
            }
        }
        const finisher: Function<Holder<I>, Optional<I>> = (mutable: Holder<I>) => mutable.get();

        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * Returns a Collector that will return the min value as determined by the default comparator
     * See, Comparator.default(); the min value is returned in an optional, or empty if no value
     * was found.
     */
    public static minBy<I>(): Collector<I, Holder<I>, Optional<I>>;
    /**
     * Returns a Collector that will return the min value as determined by the given comparator
     * the min value is returned in an optional, or empty if no value was found.
     * @param comparator - a Comparator for comparing elements
     */
    public static minBy<I>(comparator: Comparator<I>): Collector<I, Holder<I>, Optional<I>>;
    public static minBy<I>(comparator?: Comparator<I>): Collector<I, Holder<I>, Optional<I>> {
        const comparatorToUse = comparator ? comparator : Comparator.default();
        const supplier: Supplier<Holder<I>> = () => new Holder();
        const accumulator: BiConsumer<Holder<I>, I> = (mutable, item) => {
            const currentMin = mutable.get();
            if (currentMin.isPresent()) {
                const newMin: I = currentMin
                    .map(current => returnSmallest(current, item, comparatorToUse))
                    .get();
                mutable.set(newMin);
            } else {
                mutable.set(item);
            }
        }
        const combiner: BiFunction<Holder<I>> = (h1: Holder<I>, h2: Holder<I>) => {
            const first = h1.get();
            const second = h2.get();
            if (first.isPresent() && second.isPresent()) {
                return new Holder(returnSmallest(first.get(), second.get(), comparatorToUse));
            } else if (first.isPresent()) {
                return h1;
            } else {
                return h2;
            }
        }
        const finisher: Function<Holder<I>, Optional<I>> = (mutable: Holder<I>) => mutable.get();

        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * Returns a Collector which partitions the input elements according to a Predicate, and organizes them into a Map<Boolean, T[]>.
     * @param predicate - a predicate used for classifying input elements
     */
    public static partitioningBy<T, A, D>(predicate: Predicate<T>): Collector<T, Map<boolean, T[]>, Map<boolean, T[]>>;
    /**
     * Returns a Collector which partitions the input elements according to a Predicate, reduces the values in each partition according to another Collector, and organizes them into a Map<Boolean, D>
     * whose values are the result of the downstream reduction.
     * @param predicate - a predicate used for classifying input elements
     * @param downstream - a Collector implementing the downstream reduction
     */
    public static partitioningBy<T, A, D>(predicate: Predicate<T>, downStream: Collector<T, A, D>): Collector<T, Map<boolean, T[]>, Map<boolean, D>>;
    public static partitioningBy<T, A, D>(predicate: Predicate<T>, downStream?: Collector<T, A, D>): Collector<T, Map<boolean, T[]>, Map<boolean, D> | Map<boolean, T[]>> {
        const supplier: Supplier<Map<boolean, T[]>> = () => Map.of<boolean, T[]>(true, [], false, []);
        const accumulator: BiConsumer<Map<boolean, T[]>, T> = (map, item) => map.merge(
            predicate(item),
            [item],
            (l1, l2) => l1.concat(l2),
        );
        const combiner: BiFunction<Map<boolean, T[]>> = (map1, map2) => {
            map1.putAll(map2);
            return map1;
        }

        if (downStream) {
            const Function: Function<Map<boolean, T[]>, Map<boolean, D>> = (map) => {
                const maps = Map.of(
                    true,
                    Stream.of(map.getOptional(true).orElse([]))
                        .collect(downStream),
                    false,
                    Stream.of(map.getOptional(false).orElse([]))
                        .collect(downStream)
                );
                return maps;
            }
            return Collector.of<T, Map<boolean, T[]>, Map<boolean, D>>(supplier, accumulator, combiner, Function);
        } else {
            return Collector.of<T, Map<boolean, T[]>, Map<boolean, T[]>>(supplier, accumulator, combiner, Function.identity());
        }
    }

    /**
    * Returns a Collector which performs a reduction of its input elements under a specified BinaryOperator. The result is described as an Optional<T>.
    * @param reducer - a BinaryOperator<T> used to reduce the input elements
    */
    public static reducing<I>(reducer: BiFunction<I>): Collector<I, I[], Optional<I>>;
    /**
     * Returns a Collector which performs a reduction of its input elements under a specified BinaryOperator using the provided identity.
     * @param reducer - a BinaryOperator<T> used to reduce the input elements
     * @param identity - the identity value for the reduction (also, the value that is returned when there are no input elements)
     */
    public static reducing<I>(reducer: BiFunction<I>, identity: I): Collector<I, I[], Optional<I>>;
    /**
     * Returns a Collector which performs a reduction of its input elements under a specified BinaryOperator using the provided identity.
     * @param identity - the identity value for the reduction (also, the value that is returned when there are no input elements)
     * @param mapper - a mapping function to apply to each input value
     * @param reducer - a BinaryOperator<U> used to reduce the mapped values
     */
    public static reducing<I, U>(reducer: BiFunction<U>, identity: U, mapper: Function<I, U>): Collector<I, I[], Optional<U>>;
    public static reducing<I, U>(reducer: BiFunction<I | U>, identity?: I | U, mapper?: Function<I, I | U>): Collector<I, I[], Optional<I | U>> {
        const supplier: Supplier<I[]> = () => [];
        const accumulator: BiConsumer<I[], I> = (list, item) => list.push(item);
        const combiner: BiFunction<I[]> = (list1, list2) => list1.concat(list2);

        if (mapper) {
            const finisher: Function<I[], Optional<U | I>> = (iList) => Stream.of(iList)
                .map(mapper)
                .reduce(reducer, identity);
            return Collector.of(supplier, accumulator, combiner, finisher);
        } else {
            const finisher: Function<I[], Optional<U | I>> = (iList) => Stream.of<I | U>(iList)
                .reduce(reducer, identity);
            return Collector.of(supplier, accumulator, combiner, finisher);
        }
    }

    /**
     * Returns a Collector that retuns summary statistics for the resulting values
     */
    public static summarizingNumber(): Collector<number, NumberSummaryStatistics, NumberSummaryStatistics>;
    /**
     * Returns a Collector which applies an number- mapping function to each input element, and returns summary statistics for the resulting values.
     * @param numberMapper - mapping function that returns a number value
     */
    public static summarizingNumber<T>(numberMapper: Function<T, number>): Collector<T, NumberSummaryStatistics, NumberSummaryStatistics>;
    public static summarizingNumber<T>(numberMapper?: Function<T, number>): Collector<T | number, NumberSummaryStatistics, NumberSummaryStatistics> {
        const isT: (item: T | number) => item is T = (item: T | number): item is T => numberMapper ? true : false;
        const mapper: Function<number | T, number> = (item: T | number): number => {
            if (isT(item)) {
                const i: T = item;
                if (numberMapper) {
                    return numberMapper(i);
                }
            } else {
                return item;
            }
            throw new Error("got an unexpected type");
        };

        const supplier: Supplier<NumberSummaryStatistics> = NumberSummaryStatistics.create;
        const accumulator: BiConsumer<NumberSummaryStatistics, T | number> = (mutable, item) =>
            mutable.accept(mapper(item));
        const combiner: BiFunction<NumberSummaryStatistics> = (mNum1, mNum2) => {
            mNum1.combine(mNum2);
            return mNum1;
        }
        return Collector.of(supplier, accumulator, combiner, Function.identity());
    }
    /**
     * Returns a Collector that produces the sum of numbers. If no elements are present, the result is 0.
     */
    public static summingNumber(): Collector<number, MutableNumber, number>;
    /**
     * Returns a Collector that produces the sum of a number-valued function applied to the input elements. If no elements are present, the result is 0.
     * @param numberMapper - a function to transform input elements to a number
     */
    public static summingNumber<T>(numberMapper: Function<T, number>): Collector<T, MutableNumber, number>;
    public static summingNumber<T>(numberMapper?: Function<T, number>): Collector<T | number, MutableNumber, number> {
        const isT: (item: T | number) => item is T = (item: T | number): item is T => numberMapper ? true : false;
        const mapper: Function<number | T, number> = (item: T | number): number => {
            if (isT(item)) {
                const i: T = item;
                if (numberMapper) {
                    return numberMapper(i);
                }
            } else {
                return item;
            }
            throw new Error("got an unexpected type");
        };

        const supplier: Supplier<MutableNumber> = MutableNumber.empty;
        const accumulator: BiConsumer<MutableNumber, number | T> = (mutable, num) => mutable.add(mapper(num));
        const combiner: BiFunction<MutableNumber> = (m1, m2) => m1.addTogether(m2);
        const finisher: Function<MutableNumber, number> = (mut) => mut.getTotal();

        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * Returns a Collector that accumulates elements into a Map whose keys and values are the result of
     * applying the provided mapping functions to the input elements.
     * If the mapped keys contains duplicates (according to Object.equals(Object)),
     * an IllegalStateException is thrown when the collection operation is performed. 
     * If the mapped keys may have duplicates, use toMap(Function, Function, BiFunction) instead
     * @param keyMapper - a mapping function to produce keys
     * @param valueMapper - a mapping function to produce values
     */
    public static toMap<I, K, V>(keyMapper: Function<I, K>, valueMapper: Function<I, V>): Collector<I, Map<K, V>, Map<K, V>>;
    /**
     * Returns a Collector that accumulates elements into a Map whose keys and values are the result of applying 
     * the provided mapping functions to the input elements. If the mapped keys contains duplicates,
     * the value mapping function is applied to each equal element, and the results are merged using the provided merging function.
     * @param keyMapper - a mapping function to produce keys
     * @param valueMapper - a mapping function to produce values
     * @param merger - a merge function, used to resolve collisions between values associated with the same key, as supplied to Map.merge(Object, Object, BiFunction)
     */
    public static toMap<I, K, V>(keyMapper: Function<I, K>, valueMapper: Function<I, V>, merger: BiFunction<V>): Collector<I, Map<K, V>, Map<K, V>>;
    public static toMap<I, K, V>(keyMapper: Function<I, K>, valueMapper: Function<I, V>, merger?: BiFunction<V>): Collector<I, Map<K, V>, Map<K, V>> {
        const supplier: Supplier<Map<K, V>> = Map.empty;
        const accumulator: BiConsumer<Map<K, V>, I> = (map, input) => {
            const key = keyMapper(input);
            const value = valueMapper(input);
            if (map.containsKey(key)) {
                if (merger) {
                    map.merge(key, value, merger);
                } else {
                    throw new Error(Errors.IllegalStateException);
                }
            } else {
                map.put(key, value);
            }
        }
        const combiner: BiFunction<Map<K, V>> = (m1, m2) => {
            m1.putAll(m2);
            return m1;
        }

        return Collector.of(supplier, accumulator, combiner, Function.identity());
    }



    //v2 
    //countingBy(keyMapper: Transfromer<T, string>) counts values based on the keys returned by the mapper when feeding elements through
    //countingBy(equalityFn?) groups elements and counts them based on equality function
};

//return the largest of two values based on the comparator, first if they are equal
function returnLargest<I>(first: I, second: I, comparator: Comparator<I>): I {
    return comparator(first, second) < 0
        ? second
        : first;
}

//return the smallest of two values based on the comparator, first if they are equal
function returnSmallest<I>(first: I, second: I, comparator: Comparator<I>): I {
    return comparator(first, second) <= 0
        ? first
        : second;
}

export default Collectors;