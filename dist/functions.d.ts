export declare type Predicate<T> = (value: T) => boolean;
export declare type Consumer<T> = (value: T) => void;
export declare type Transformer<T, U> = (value: T) => U;
export declare type Supplier<T> = () => T;
