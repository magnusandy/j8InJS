import { Transformer, Supplier, BiConsumer, BiFunction } from "./functions";

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
    public combiner = (): BiConsumer<A, A> => this.comb;
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
export default class Collectors {

    public static toArray<T>(): Collector<T, T[], T[]> {
        const supplier: Supplier<T[]> = () => [];
        const accumulator: BiConsumer<T[], T> = (list, item) => list.push(item);
        const combiner: BiFunction<T[]> = (list1, list2) => list1.concat(list2);
        const finisher: Transformer<T[], T[]> = (list) => list;
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    public static toList<T>(): Collector<T, T[], T[]> {
        return Collectors.toArray();
    }
}