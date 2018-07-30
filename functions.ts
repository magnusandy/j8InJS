
/**
 * Functional Type: 
 * defines a function that takes a single argument and returns a boolean
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Functional Type: 
 * Defines a function takes two arguments of types T and U and returns a boolean, general usages
 * as a equality test (see BiPredicate.defaultEquality as an example)
 */
export type BiPredicate<T, U> = (t: T, u: U) => boolean;

/**
 * Functional Type: 
 * Defines a function that consumes a given passed in value, but does not return anything
 */
export type Consumer<T> = (value: T) => void;

/**
 * Functional Type: 
 * Defines a function that takes a single argument of type T, and returns a value of a different type U
 */
export type Transformer<T, U> = (value: T) => U;

/**
 * Functional Type: 
 * Defines a function that takes no arguments but when called, returns a value of type T
 * See CheckedSupplier for an extension of this type
 */
export type Supplier<T> = () => T;

/**
 * Functional Type: 
 * Defines a function that takes two arguments of types T and U, that consumes the given values 
 * and returns nothing.
 */
export type BiConsumer<T, U> = (t: T, u: U) => void;

/**
 * Functional Type: 
 * Defines a function that takes two arguments, both of type T, and returns a value
 * also of type T.
 */
export type BiFunction<T> = (t1: T, t2: T) => T;

/**
 * Function that: Compares its two arguments for order. Returns a negative integer, zero,
 * or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
export type Comparator<T> = (t1: T, t2: T) => number;

/**
 * defines a supplier function interface, with the added ability of checking if the supplier 
 * still contains values or not.
 */
export interface CheckableSupplier<T> {
    /**
     * Returns a value if exists in the supplier, otherwise undefined. isEmpty() can be
     * used to reliably check if a value exists.
     */
    get(): T | undefined,

    /**
     * returns true if no more values will be returned by this supplier through get();
     */
    isEmpty(): boolean;
}

export const BiPredicate = {

    /**
     * function that takes two values of the same type, and returns true if 
     * i1 === i2
     */
    defaultEquality: <T>(i1: T, i2: T): boolean => i1 === i2,
}

export const Comparator = {

    /**
     * compares the given values with the < and > operators, returns
     * -1 if i1 less that i2, +1 if i1 is greater, and 0 if they are equal.
     */
    default: <T>(i1: T, i2: T): number => {
        if (i1 < i2) {
            return -1;
        } else if (i1 > i2) {
            return 1;
        } else {
            return 0;
        }
    }
}