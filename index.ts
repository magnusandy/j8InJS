enum Errors {
    NoSuchElementException = 'NoSuchElementException',
}

type Predicate<T> = (value: T) => boolean;
type Consumer<T> = (value: T) => void;
type Transformer<T, U> = (value: T) => U;
type Supplier<T> = () => T; 

export default class Optional<T> {
	private value?: T;

	constructor(value?: T) {
		this.value = value;
	}

	public isPresent = (): boolean => (this.value ? true : false);

	public get = (): T => {
		if (this.value) {
			return this.value;
		} else {
			throw Errors.NoSuchElementException;
		}
	};

	public filter = (predicate: Predicate<T>): Optional<T> => {
		if (this.isPresent()) {
			return predicate(this.get()) ? this: Optional.empty();
		} else {
			return Optional.empty();
		}
	};

	public ifPresent = (consumer: Consumer<T>): void => {
		if (this.isPresent()) {
			consumer(this.get());
		}
	};

	public map = <V>(transformer: Transformer<T, V>): Optional<V> => {
		if (this.isPresent()) {
			return Optional.of(transformer(this.get()));
		} else {
			return Optional.empty();
		}
    };
    
    public flatMap = <V>(transformer: Transformer<T, Optional<V>>): Optional<V> => {
        const optionalOptional: Optional<Optional<V>> = this.map(transformer);
        return optionalOptional.isPresent() ? optionalOptional.get() : Optional.empty();
    }

    public orElse = (other: T): T => (this.isPresent() ? this.get() : other);
    
    public orElseGet = (supplier: Supplier<T>): T => this.isPresent() ? this.get() : supplier();

    public orElseThrow = (throwable: any): T => {
        if (this.isPresent()) {
            return this.get();
        } else {
            throw throwable;
        }
    } 

	public static of = <U>(value: U): Optional<U> => new Optional(value);

	public static empty = <U>(): Optional<U> => new Optional();
}