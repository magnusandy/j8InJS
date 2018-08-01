/**
 * Functional Type:
 * defines a function that takes a single argument and returns a boolean
 */
export declare type Predicate<T> = (value: T) => boolean;
/**
 * Functional Type:
 * Defines a function takes two arguments of types T and U and returns a boolean, general usages
 * as a equality test (see BiPredicate.defaultEquality as an example)
 */
export declare type BiPredicate<T, U> = (t: T, u: U) => boolean;
/**
 * Functional Type:
 * Defines a function that consumes a given passed in value, but does not return anything
 */
export declare type Consumer<T> = (value: T) => void;
/**
 * Functional Type:
 * Defines a function that takes a single argument of type T, and returns a value of a different type U
 */
export declare type Transformer<T, U> = (value: T) => U;
/**
 * Functional Type:
 * Defines a function that takes no arguments but when called, returns a value of type T
 * See CheckedSupplier for an extension of this type
 */
export declare type Supplier<T> = () => T;
/**
 * Functional Type:
 * Defines a function that takes two arguments of types T and U, that consumes the given values
 * and returns nothing.
 */
export declare type BiConsumer<T, U> = (t: T, u: U) => void;
/**
 * Functional Type:
 * Defines a function that takes two arguments, both of type T, and returns a value
 * also of type T.
 */
export declare type BiFunction<T> = (t1: T, t2: T) => T;
/**
 * Function that: Compares its two arguments for order. Returns a negative integer, zero,
 * or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
export declare type Comparator<T> = (t1: T, t2: T) => number;
/**
 * defines a supplier function interface, with the added ability of checking if the supplier
 * still contains values or not.
 */
export declare const Consumer: {
    /**
     * returns a consumer that takes in an element and does nothing
     */
    sink<T>(): Consumer<T>;
    /**
     * returns a consumer logs the value given to the console
     */
    logger<T>(): Consumer<T>;
};
export declare const Transformer: {
    /**
     * returns Transformer that when passed an argument, will return the given argument
     */
    identity<T>(): Transformer<T, T>;
    /**
     * returns a Transformer logs the given value to the console and then returns the value
     */
    logger<T>(): Transformer<T, T>;
};
export declare const BiPredicate: {
    /**
     * returns a BiPredicate that takes two values of the same type, and returns true if
     * i1 === i2
     */
    defaultEquality<T>(): BiPredicate<T, T>;
};
export declare const Comparator: {
    /**
     * Returns a Comparator that compares the given values with the < and > operators, returns
     * -1 if i1 less that i2, +1 if i1 is greater, and 0 if they are equal.
     */
    default<T>(): Comparator<T>;
};
