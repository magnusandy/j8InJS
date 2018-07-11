declare type Predicate<T> = (value: T) => boolean;
declare type Consumer<T> = (value: T) => void;
declare type Transformer<T, U> = (value: T) => U;
declare type Supplier<T> = () => T;
export default class Optional<T> {
    private value?;
    constructor(value?: T);
    isPresent: () => boolean;
    get: () => T;
    filter: (predicate: Predicate<T>) => Optional<T>;
    ifPresent: (consumer: Consumer<T>) => void;
    map: <V>(transformer: Transformer<T, V>) => Optional<V>;
    flatMap: <V>(transformer: Transformer<T, Optional<V>>) => Optional<V>;
    orElse: (other: T) => T;
    orElseGet: (supplier: Supplier<T>) => T;
    orElseThrow: (throwable: any) => T;
    static of: <U>(value: U) => Optional<U>;
    static empty: <U>() => Optional<U>;
}
export {};
