import { Transformer, Supplier, BiConsumer, Consumer, BiFunction, Predicate, BiPredicate, Comparator } from "./functions";
import { Collector } from "./collectors";
import { Optional } from "./optional";



export interface Stream<T> {
    allMatch(predicate: Predicate<T>): boolean;
    anyMatch(predicate: Predicate<T>): boolean;
    builder(): StreamBuilder<T>;
    count(): number;
    customCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R;
    collect<R, A>(collector: Collector<T, A, R>): R;
    //distinct(): Stream<T>; //stateful intermediate
    //distinctPredicate(equalsFunction: BiPredicate<T,T>): Stream<T>; //stateful Intermediate
    //filter(predicate: Predicate<T>): Stream<T>; //intermediate
    findFirst(): Optional<T>;
    findAny(): Optional<T>;
    //flatMap<U>(transformer: Transformer<T, Stream<U>>): Stream<U>; //intermediate
    //flatMapList<U>(transformer: Transformer<T, U[]>): Stream<U>; //intermediate
    forEach(consumer: Consumer<T>): void;
    forEachOrdered(consumer: Consumer<T>): void;
    //limit(maxSize: number): Stream<T>; //intermediate
    map<U>(transformer: Transformer<T, U>): Stream<U>; //intermediate
    //max(comparator: Comparator<T>): T; //todo optional param, default to >
    //min(comparator: Comparator<T>): T; // todo optional param, default to <
    //noneMatch(predicate: Predicate<T>): boolean;
    //peek(consumer: Consumer<T>): Stream<T>; //intermediate
    //reduce(identity: T, accumulator: BiFunction<T>): T;
    //skip(numberToSkip: number): Stream<T>; //intermediate
    //sortedNatural(): Stream<T>; //intermediate stateful
    //sorted(comparator: Comparator<T>): Stream<T>; //intermediate stateful
    //toArray(): T[];
}

//Static methods of the stream interface
export const Stream = {
    /**
     * Creates a new stream from the given source array
     * @param source 
     */
    of<T>(source: T[]): Stream<T> {
        return ArrayStream.of(source);
    },

    /**
     * Creates a new stream from the given source values
     * @param source 
     */
    ofValues<T>(...values: T[]): Stream<T> {
        return ArrayStream.of(values);
    },

    /**
     * creates a stream of a single element with the given source value;
     * @param value 
     */
    ofValue<T>(value: T): Stream<T> {
        return ArrayStream.of([value]);
    },


    /**
     * creates an empty Stream
     */
    empty<T>(): Stream<T> {
        return ArrayStream.of<T>([]);
    },

    //todo
    //concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T> {},
    //generate<T>(supplier: Supplier<T>): Stream<T> {},
    //iterate<T>(seed: T, getNext: Transformer<T, T>): Stream<T> {},

}

const compose = <T, U, Z>(f: Transformer<T, U>, g: Transformer<U, Z>): Transformer<T, Z> => (value: T) => g(f(value));

enum ActionType {
    Map,
    FlatMap,
    Filter,
    Peek,
    
    Sorted,
    Distinct,
    Limit,
    Skip,
}

class Action {
    isStateful: boolean;
    actionType: ActionType;
    map?: Transformer<any, any>;
    filter?: Predicate<any>;

    private constructor(
        isStateful: boolean,
        actionType: ActionType,
        map?: Transformer<any, any>,
        filter?: Predicate<any>
    ) {
        this.isStateful = isStateful;
        this.actionType = actionType;
        this.map = map;
        this.filter = filter;
    }
}

class Item<T> {
    private removed: boolean;
    private value: T;
    private constructor(value: T, removed: boolean) {
        this.removed = removed;
        this.value = value;
    }
    public get(): T {
        return this.value;
    }

    public isRemoved(): boolean {
        return this.removed;
    }

    public remove(): void {
        this.removed = true;
    }

    public static of<T>(value: T) {
        return new Item<T>(value, false);
    }
}

class ArrayStream<T> implements Stream<T> {
    source: Item<any>[];
    actions: Transformer<any, any>[];

    private constructor(source: T[], actions: Transformer<any, any>[]) {
        this.source = source.slice().map(Item.of);
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

    private getNextValue(): T {

    }

    private isEmpty() {
        return this.source.length === 0;
    }

    public static of<T>(source: T[]): Stream<T> {
        return new ArrayStream<T>(source, []);
    }

    public static empty<T>(): Stream<T> {
        return ArrayStream.of<T>([]);
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

    /**
     * Terminal Operation 
     * returns the count of all the elements of the stream.
     */
    //todo test more with filter
    public count(): number {
        this.fullyApplyActions();
        return this.source.length;
    }


    /**
     * Stateful intermediate operation
     * Returns a stream of distinct objects according to the === operator
     */
    /*//todo
    public distinct(): Stream<T> {
        return this.distinctPredicate((t1: T, t2:T) => t1 === t2)
    }
    */

    /**
     * Stateful intermediate operation
     * Returns a stream of distinct objects according to the given predicate, the predicate takes 
     * two objects and should return true if they are equivelant, false if they are different
     */
    /*
    public distinctPredicate(isEqualFunction: BiPredicate<T, T>): Stream<T> {
    }
    */

    /**
     * Terminal Operation: Short Circuiting
     * Returns an optional describing the first element of the stream, of the stream is empty,
     * return an empty Optional.
     */
    public findFirst(): Optional<T> {
        if (this.isEmpty()) {
            return Optional.empty();
        } else {
            const item = this.source.shift();
            return Optional.of(this.applyAction(item));
        }
    }

    /**
     * Terminal Operation: Short Circuiting
     * Returns an optional describing some element in the stream, explicitly non-deterministic to
     * allow for potential performance increases if stream is empty, return an empty Optional.
     */
    public findAny(): Optional<T> {
        return this.findFirst();//todo better way?
    }

    /**
     * Intermediate Operation.
     * Returns a stream consisting of the results of applying the given function to the elements of this stream.
     * @param transformer: function that transforms a value in the stream to a new value;
     */
    public map<U>(transformer: Transformer<T, U>): Stream<U> {
        this.actions.push(transformer);
        return new ArrayStream<U>(this.source.map(i => i.get()), this.actions);
    }

    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream. objects are dealt with in order
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    public forEachOrdered(consumer: Consumer<T>): void {
        this.fullyApplyActions();
        this.source.forEach(consumer);
    }

    /**
     * Terminal Operation
     * applies a given consumer to each entity in the stream. ordering is not garenteed;
     * @param consumer: applies the consuming function to all elements in the stream;
     */
    public forEach(consumer: Consumer<T>): void {
        this.forEachOrdered(consumer); //todo more efficent?
    }

    //todo maybe make parallel
    /**
     * Terminal Operation
     * applies a mutable reduction operation to the elements in the collection
     * @param supplier: supplies a new mutable container 
     * @param accumulator: function that adds an item to the given mutable container
     * @param combiner: function combines two mutable containers, adding all the elements of the second one into the first
     */
    public customCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R {
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