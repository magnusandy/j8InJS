import { Transformer, Supplier, BiConsumer, Consumer, BiFunction, Predicate } from "./functions";
import { Collector } from "./collectors";

export interface Stream<T> {
    allMatch(predicate: Predicate<T>): boolean;
    anyMatch(predicate: Predicate<T>): boolean;
    count(): number;
    map<U>(transformer: Transformer<T, U>): Stream<U>;
    forEach(consumer: Consumer<T>): void;
    defaultCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R;
    collect<R, A>(collector: Collector<T, A, R>): R;
    builder(): StreamBuilder<T>;
}

const compose = <T, U, Z>(f: Transformer<T, U>, g: Transformer<U, Z>): Transformer<T, Z> => (value: T) => g(f(value));

export const stream = <T>(source: T[]): Stream<T> => {
    return ArrayStream.of(source);
}

class ArrayStream<T> implements Stream<T> {
    source: any[];
    actions: Transformer<any, any>[];

    private constructor(source: T[], actions: Transformer<any, any>[]) {
        this.source = source.slice()
        this.actions = actions;
    }

    //todo flag if actions are applied "exhaust" the stream;
    private fullyApplyActions() {
        if (this.actions.length > 0) {
            const ultimateAction: Transformer<any, T> = this.ultimateAction();
            this.source = this.source.map(ultimateAction);
        }
    }

    private applyAction = (item: any): T => {
        return this.actions.length > 0 ? this.ultimateAction()(item) : item;
    }

    private ultimateAction: () => Transformer<any, T> = () => this.actions.reduce(compose);

    private isEmpty() {
        return this.source.length === 0;
    }

    public static of<T>(source: T[]): Stream<T> {
        return new ArrayStream<T>(source, []);
    }

    /**
     * Terminal Operation - Short Circuting
     * returns true if all items in the stream match the given predicate, if any item returns false, return false;
     * if the stream is empty, return true, the predicate is never evaluated;
     * @param predicate 
     */
    public allMatch(predicate: Predicate<T>): boolean {
        for (let i in this.source) {
            const sourceItem = this.source[i];
            const applied = this.applyAction(sourceItem);
            if (!predicate(applied)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Terminal Operation - Short Circuting
     * returns true if any 1 item in the stream match the given predicate, if any item returns true, return true, else false;
     * @param predicate 
     */
    public anyMatch(predicate: Predicate<T>): boolean {
        for (let i in this.source) {
            const sourceItem = this.source[i];
            const applied = this.applyAction(sourceItem);
            if (predicate(applied)) {
                return true;
            }
        }
        return false;
    }

    //todo test more with filter
    public count(): number {
        this.fullyApplyActions();
        return this.source.length;
    }

    /**
     * Intermediate Operation.
     * Returns a stream consisting of the results of applying the given function to the elements of this stream.
     * @param transformer: function that transforms a value in the stream to a new value;
     */
    public map<U>(transformer: Transformer<T, U>): Stream<U> {
        this.actions.push(transformer);
        return new ArrayStream<U>(this.source, this.actions);
    }

    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream.
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    public forEach(consumer: Consumer<T>): void {
        this.fullyApplyActions();
        this.source.forEach(consumer);
    }

    //todo maybe make parallel
    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection
     * @param supplier: supplies a new mutable container 
     * @param accumulator: function that adds an item to the given mutable container
     * @param combiner: function combines two mutable containers, adding all the elements of the second one into the first
     */
    public defaultCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R {
        this.fullyApplyActions();
        let container: R = supplier();
        this.source.forEach(item => accumulator(container, item))
        return container;
    }

    //todo parallelize
    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection using the given collector
     * @param collector : a collector used to apply the mutable reduction.
     */
    public collect<R, A>(collector: Collector<T, A, R>): R {
        this.fullyApplyActions();
        let container = collector.supplier()();
        this.source.forEach(item => {
            collector.accumulator()(container, item)
        })
        return collector.finisher()(container);
    }

    /**
     * retuns an empty stream builder
     */
    public builder(): StreamBuilder<T> {
        return ArrayStreamBuilder.builder<T>();
    }
}

export interface StreamBuilder<T> {
    accept(item: T): void;
    add(item: T): StreamBuilder<T>;
    addAll(itemList: T[]): StreamBuilder<T>;
    build(): Stream<T>;
};

class ArrayStreamBuilder<T> implements StreamBuilder<T> {
    array: T[];

    private constructor() {
        this.array = [];
    }

    public static builder<T>(): StreamBuilder<T> {
        return new ArrayStreamBuilder<T>();
    }

    accept(item: T): void {
        this.acceptAll([item]);
    }

    acceptAll(items: T[]): void {
        this.array.push(...items);
    }

    add(item: T): StreamBuilder<T> {
        this.accept(item);
        return this;
    }

    addAll(items: T[]): StreamBuilder<T> {
        this.acceptAll(items);
        return this;
    }

    build(): Stream<T> {
        return ArrayStream.of(this.array);
    }
}