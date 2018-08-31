import { Transformer, Supplier, BiConsumer, BiFunction } from "../functions";
import { MutableString, MutableNumber } from './mutableCollections';

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
    private fini: Transformer<A, R>;

    private constructor(supp: Supplier<A>, accu: BiConsumer<A, T>, comb: BiFunction<A>, fini: Transformer<A, R>) {
        this.supp = supp;
        this.accu = accu;
        this.comb = comb;
        this.fini = fini;
    }

    public supplier = (): Supplier<A> => this.supp;
    public accumulator = (): BiConsumer<A, T> => this.accu;
    public combiner = (): BiFunction<A> => this.comb;
    public finisher = (): Transformer<A, R> => this.fini;

    /**
    * A Collector is specified by four functions that work together to accumulate entries into a mutable result container,
    * and optionally perform a final transform on the result. They are:
    * @param supplier function that returns of a new result container
    * @param accumulator function for incorporating a new data element into a result container
    * @param combiner function for combining two result containers into one
    * @param finisher function for performing an optional final transform on the container
    */
    public static of<T, A, R>(supplier: Supplier<A>, accumulator: BiConsumer<A, T>, combiner: BiFunction<A>, finisher: Transformer<A, R>): Collector<T, A, R> {
        return new Collector(supplier, accumulator, combiner, finisher);
    }
};

/**
 * defines many useful collectors for easily reducing/collecting data together
 */
class Collectors {

    public static toArray<T>(): Collector<T, T[], T[]> {
        const supplier: Supplier<T[]> = () => [];
        const accumulator: BiConsumer<T[], T> = (list, item) => list.push(item);
        const combiner: BiFunction<T[]> = (list1, list2) => list1.concat(list2);
        const finisher: Transformer<T[], T[]> = Transformer.identity();
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    public static toList<T>(): Collector<T, T[], T[]> {
        return Collectors.toArray();
    }

    /**
     * Returns a collector that combines strings into a single long string, a delimiter string can be specified
     * to seperate individual items, the prefix and suffix are added to the resulting final string, each item.
     * @param delimiter: optional. Seperator for items being joined
     * @param prefix: optional. string added to the beginning of the joined result
     * @param suffix: optional. string added to the end of the joined result 
     */
    public static joining(delimiter?: string, prefix?: string, suffix?: string): Collector<string, MutableString, string> {
        const ifElseBlank = (val?: string): string => val ? val : "";
        const delimiterToUse = ifElseBlank(delimiter);

        const supplier: Supplier<MutableString> = () => MutableString.empty();
        const accumulator: BiConsumer<MutableString, string> = (mutable, str) => mutable.append(str + delimiterToUse);
        const combiner: BiFunction<MutableString> = (mutable1, mutable2) => mutable1.concat(mutable2);
        const finisher: Transformer<MutableString, string> = (mutable) => {
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
     * @param mapper Transformer function to transform input elements into a number
     */
    public static averagingNumber<I>(mapper: Transformer<I, number>): Collector<I, MutableNumber, number> {
        const supplier: Supplier<MutableNumber> = MutableNumber.empty;
        const accumulator: BiConsumer<MutableNumber, I> = (mutable, item) => mutable.add(mapper(item));
        const combiner: BiFunction<MutableNumber> = (mNum1, mNum2) => mNum1.addTogether(mNum2);
        const finisher: Transformer<MutableNumber, number> = (mutable: MutableNumber) =>
            mutable.getInputCount() > 0
                ? mutable.getTotal() / mutable.getInputCount()
                : 0;
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    /**
     * returns a Collector that produces the arithmetic mean of input numbers
     */
    public static averaging(): Collector<number, MutableNumber, number> {
        return Collectors.averagingNumber(Transformer.identity());
    }

    public static collectingAndThen<Input, Mutable, Intermediate, Output>(downStream: Collector<Input, Mutable, Intermediate>, finisher: Transformer<Intermediate, Output>): Collector<Input, Mutable, Output> {
        const newFinisher = (input: Mutable) => finisher(downStream.finisher()(input))
        return Collector.of(downStream.supplier(),  downStream.accumulator(), downStream.combiner(), newFinisher)
    }

    //v2 
    //countingBy(keyMapper: Transfromer<T, string>) counts values based on the keys returned by the mapper when feeding elements through
    //countingBy(equalityFn?) groups elements and counts them based on equality function
};

export default Collectors;