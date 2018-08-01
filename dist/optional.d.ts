import { Predicate, Consumer, Transformer, Supplier } from "./functions";
/**
 * A container object which may or may not contain a non-null value. If a value is present, isPresent() will return true and get() will return the value.
 */
export declare class Optional<T> {
    private value?;
    private constructor();
    /**
     * Return true if there is a value present, otherwise false.
     */
    isPresent: () => boolean;
    /**
     * If a value is present in this Optional, returns the value, otherwise throws "NoSuchElementException".
     */
    get: () => T;
    /**
     * If a value is present, and the value matches the given predicate, return an Optional describing the value, otherwise return an empty Optional.
     */
    filter: (predicate: Predicate<T>) => Optional<T>;
    /**
     * If a value is present, invoke the specified consumer with the value, otherwise do nothing.
     */
    ifPresent: (consumer: Consumer<T>) => void;
    /**
     * If a value is present, apply the provided transformer function to it, and if the result is non-null, return an Optional describing the result. Otherwise return an empty Optional.
     */
    map: <V>(transformer: Transformer<T, V>) => Optional<V>;
    /**
     * If a value is present, apply the provided Optional-bearing mapping function to it, return that result, otherwise return an empty Optional.
     */
    flatMap: <V>(transformer: Transformer<T, Optional<V>>) => Optional<V>;
    /**
     * Return the value if present, otherwise return other.
     */
    orElse: (other: T) => T;
    /**
     * Return the value if present, otherwise invoke other and return the result of that invocation.
     * if result of supplier is null, throw "NullPointerException"
     */
    orElseGet: (supplier: Supplier<T>) => T;
    /**
     * Return the contained value, if present, otherwise throw an error to be created by the provided supplier.
     */
    orElseThrow: (exceptionSupplier: Supplier<Error>) => T;
    /**
     * Returns an Optional with the specified present non-null value. Throws 'NullPointerException' if the value does not exist
     * Use ofNullable when the value might not be present;
     */
    static of: <U>(value: U) => Optional<U>;
    /**
     * Returns an Optional describing the specified value, if non-null, otherwise returns an empty Optional.
     */
    static ofNullable: <U>(value?: U | undefined) => Optional<U>;
    /**
     * returns an empty Optional instance.
     */
    static empty: <U>() => Optional<U>;
}
