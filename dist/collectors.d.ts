import { Transformer, Supplier, BiConsumer, BiFunction } from "./functions";
export declare class Collector<T, A, R> {
    private supp;
    private accu;
    private comb;
    private fini;
    private constructor();
    supplier: () => Supplier<A>;
    accumulator: () => BiConsumer<A, T>;
    combiner: () => BiConsumer<A, A>;
    finisher: () => Transformer<A, R>;
    static of<T, A, R>(supplier: Supplier<A>, accumulator: BiConsumer<A, T>, combiner: BiFunction<A>, finisher: Transformer<A, R>): Collector<T, A, R>;
}
export default class Collectors {
    static toList<T>(): Collector<T, T[], T[]>;
    static toArray<T>(): Collector<T, T[], T[]>;
}
