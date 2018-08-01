import { Predicate, Consumer, Transformer, Supplier } from "./functions";
import { Errors } from './errors';

const isNull = (x: any): boolean => (x === null || x === undefined)
/**
 * A container object which may or may not contain a non-null value. If a value is present, isPresent() will return true and get() will return the value.
 */
export class Optional<T> {
	private value?: T;

	private constructor(value?: T) {
		this.value = value;
	}

	/**
	 * Return true if there is a value present, otherwise false.
	 */
	public isPresent = (): boolean => (isNull(this.value) ? false : true);

	/**
	 * If a value is present in this Optional, returns the value, otherwise throws "NoSuchElementException".
	 */
	public get = (): T => {
		if (this.value === null || this.value === undefined) {
			throw Error(Errors.NoSuchElementException);
		} else {
			return this.value;
		}
	};

	/**
	 * If a value is present, and the value matches the given predicate, return an Optional describing the value, otherwise return an empty Optional.
	 */
	public filter = (predicate: Predicate<T>): Optional<T> => {
		if (this.isPresent()) {
			return predicate(this.get()) ? this : Optional.empty();
		} else {
			return Optional.empty();
		}
	};

	/**
	 * If a value is present, invoke the specified consumer with the value, otherwise do nothing.
	 */
	public ifPresent = (consumer: Consumer<T>): void => {
		if (this.isPresent()) {
			consumer(this.get());
		}
	};

	/**
	 * If a value is present, apply the provided transformer function to it, and if the result is non-null, return an Optional describing the result. Otherwise return an empty Optional.
	 */
	public map = <V>(transformer: Transformer<T, V>): Optional<V> => {
		if (this.isPresent()) {
			return Optional.ofNullable(transformer(this.get()));
		} else {
			return Optional.empty();
		}
	};

	/**
	 * If a value is present, apply the provided Optional-bearing mapping function to it, return that result, otherwise return an empty Optional.
	 */
	public flatMap = <V>(transformer: Transformer<T, Optional<V>>): Optional<V> => {
		const optionalOptional: Optional<Optional<V>> = this.map(transformer);
		return optionalOptional.isPresent() ? optionalOptional.get() : Optional.empty();
	}

	/**
	 * Return the value if present, otherwise return other.
	 */
	public orElse = (other: T): T => (this.isPresent() ? this.get() : other);

	/**
	 * Return the value if present, otherwise invoke other and return the result of that invocation.
	 * if result of supplier is null, throw "NullPointerException"
	 */
	public orElseGet = (supplier: Supplier<T>): T => {
		if (this.isPresent()) {
			return this.get();
		} else {
			return supplier();
		}
	}

	/**
	 * Return the contained value, if present, otherwise throw an error to be created by the provided supplier.
	 */
	public orElseThrow = (exceptionSupplier: Supplier<Error>): T => {
		if (this.isPresent()) {
			return this.get();
		} else {
			throw exceptionSupplier();
		}
	}

	/**
	 * Returns an Optional with the specified present non-null value. Throws 'NullPointerException' if the value does not exist
	 * Use ofNullable when the value might not be present;
	 */
	public static of = <U>(value: U): Optional<U> => {
		if (!isNull(value)) {
			return new Optional(value);
		} else {
			throw Error(Errors.NullPointerException);
		}
	}

	/**
	 * Returns an Optional describing the specified value, if non-null, otherwise returns an empty Optional.
	 */
	public static ofNullable = <U>(value?: U): Optional<U> => new Optional(value);

	/**
	 * returns an empty Optional instance.
	 */
	public static empty = <U>(): Optional<U> => new Optional();
}