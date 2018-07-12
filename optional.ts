enum Errors {
	NoSuchElementException = 'NoSuchElementException',
	NullPointerException = 'NullPointerException',
}

type Predicate<T> = (value: T) => boolean;
type Consumer<T> = (value: T) => void;
type Transformer<T, U> = (value: T) => U;
type Supplier<T> = () => T; 

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
	public isPresent = (): boolean => (this.value ? true : false);

	/**
	 * If a value is present in this Optional, returns the value, otherwise throws "NoSuchElementException".
	 */
	public get = (): T => {
		if (this.value) {
			return this.value;
		} else {
			throw Errors.NoSuchElementException;
		}
	};

	/**
	 * If a value is present, and the value matches the given predicate, return an Optional describing the value, otherwise return an empty Optional.
	 */
	public filter = (predicate: Predicate<T>): Optional<T> => {
		if (this.isPresent()) {
			return predicate(this.get()) ? this: Optional.empty();
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
			return Optional.of(transformer(this.get()));
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
	 */
    public orElseGet = (supplier: Supplier<T>): T => this.isPresent() ? this.get() : supplier();

	/**
	 * Return the contained value, if present, otherwise throw an error to be created by the provided supplier.
	 */
    public orElseThrow = (exceptionSupplier: Supplier<any>): T => {
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
		if(value) {
			return new Optional(value);
		} else {
			throw Errors.NullPointerException;
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