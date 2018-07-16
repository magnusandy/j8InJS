export type Predicate<T> = (value: T) => boolean;
export type BiPredicate<T, U> = (t: T, u: U) => boolean;
export type Consumer<T> = (value: T) => void;
export type Transformer<T, U> = (value: T) => U;
export type Supplier<T> = () => T;
export type BiConsumer<T, U> = (t: T, u: U) => void;
export type BiFunction<T> = (t1: T, t2: T) => T;