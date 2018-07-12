export type Predicate<T> = (value: T) => boolean;
export type Consumer<T> = (value: T) => void;
export type Transformer<T, U> = (value: T) => U;
export type Supplier<T> = () => T; 