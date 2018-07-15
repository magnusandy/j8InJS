import { Transformer, Supplier, BiConsumer, Consumer } from "./functions";

export interface Stream<T> {
    map<U>(transformer: Transformer<T, U>): Stream<U>;
    forEach(consumer: Consumer<T>): void;
    //builder(): StreamBuilder<T>;
}

const compose = <T, U, Z>(f: Transformer<T, U>, g: Transformer<U, Z>) : Transformer<T, Z>  => (value: T) => g(f(value));

export const stream = <T>(source: T[]): Stream<T>  => {
    return ArrayStream.of(source);
}
class ArrayStream<T> implements Stream<T> {
    source: any[];
    actions: Transformer<any, any>[]

    private constructor(source: T[], actions: Transformer<any, any>[]) {
        this.source = source.slice()
        this.actions = actions;
    }

    public static of<T>(source: T[]): Stream<T> {
        return new ArrayStream<T>(source, []);
    }

    public map<U>(transformer: Transformer<T, U>): Stream<U> {
        this.actions.push(transformer);
        return new ArrayStream<U>(this.source, this.actions);
    }

    public forEach(consumer: Consumer<T>): void {
        this.applyActions();
        this.source.forEach(consumer);
    }

    private applyActions() {
        const ultimateAction: Transformer<any, any> = this.actions.reduce(compose);
        this.source = this.source.map(ultimateAction);
    }
}

export interface StreamBuilder<T> {
    accept(item: T): void;
    add(item:T): StreamBuilder<T>;
    addAll(itemList: T[]): StreamBuilder<T>;
    //build(): Stream<T>; //todo
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

    add(item:T): StreamBuilder<T> {
        this.accept(item);
        return this;
    }

    addAll(items: T[]): StreamBuilder<T> {
        this.acceptAll(items);
        return this;
    }
}