export declare type Predicate<T> = (value: T) => boolean;
export declare type Consumer<T> = (value: T) => void;
export declare type Transformer<T, U> = (value: T) => U;
export declare type Supplier<T> = () => T;
export declare type BiConsumer<T, U> = (t: T, u: U) => void;
export declare type BiFunction<T> = (t1: T, t2: T) => T;
