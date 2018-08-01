import { Transformer, Supplier, BiConsumer, Consumer, BiFunction } from "./functions";

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

    public static of<T, A, R>(supplier: Supplier<A>, accumulator: BiConsumer<A, T>, combiner: BiFunction<A>, finisher: Transformer<A, R>): Collector<T, A, R> {
        return new Collector(supplier, accumulator, combiner, finisher);
    }
};

export default class Collectors {
    
    public static toList<T>(): Collector<T, T[], T[]> {
        const supplier: Supplier<T[]> = () => [];
        const accumulator: BiConsumer<T[], T> = (list, item) => list.push(item);
        const combiner: BiFunction<T[]> = (list1, list2) => list1.concat(list2);
        const finisher: Transformer<T[], T[]> = (list) => list;
        return Collector.of(supplier, accumulator, combiner, finisher);
    }

    public static toArray<T>(): Collector<T, T[], T[]> {
        return Collectors.toList();
    }
}