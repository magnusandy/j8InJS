import * as hash from 'js-hash-code';
import Stream from '../stream';
import { BiPredicate, BiConsumer, BiFunction, BiTransformer } from '../functions';
import Optional from '../optional';

export interface Map<K, V> {
    clear(): void;
    get(key: K): V | null;
    getOrDefault(key: K, defaultVal: V): V;
    getOptional(key: K): Optional<V>;
    put(key: K, value: V): V | null;
    putIfAbsent(key: K, value: V): V | null;
    putAll(map: Map<K, V>): void;
    containsKey(key: K): boolean;
    containsValue(value: V, equalityTest?: BiPredicate<V, V>): boolean;
    keySet(): K[];
    values(): V[];
    entrySet(): Entry<K, V>[];
    keyStream(): Stream<K>;
    valueStream(): Stream<V>;
    entryStream(): Stream<Entry<K, V>>;
    forEach(consumer: BiConsumer<K, V>): void;
    isEmpty(): boolean;
    remove(key: K): V | null;
    merge(key: K, value: V, remappingFunction: BiFunction<V>): V | null;
}

export const Map = {
    empty<K, V>(): Map<K, V> {
        return new HashMap();
    }
}
export interface Entry<K, V> {
    readonly key: K;
    readonly value: V;
    getValue(): V;
    getKey(): K;
}

export const Entry = {
    of<K, V>(key: K, value: V): Entry<K, V> {
        return new MapEntry(key, value);
    }
}

class HashMap<K, V> implements Map<K, V> {
    private map: {
        [idx: string]: Entry<K, V>
    };

    public constructor() {
        this.map = {};
    }

    public clear(): void {
        this.map = {};
    }

    public isEmpty(): boolean {
        return this.keySet().length === 0;
    }

    public put(key: K, value: V): V | null {
        const keyHash = hash(key);
        const entry = Entry.of(key, value);
        const previous = this.map[keyHash];
        this.map[keyHash] = entry;
        if (previous) {
            return previous.getValue();
        } else {
            return null;
        }
    }

    public putIfAbsent(key: K, value: V): V | null {
        const keyHash = hash(key);
        const entry = Entry.of(key, value);
        const previous = this.map[keyHash];
        if (previous) {
            return previous.getValue();
        } else {
            this.map[keyHash] = entry;
            return null;
        }
    }

    public putAll(map: Map<K, V>): void {
        return map.forEach((key, value) => this.put(key, value))
    }

    public get(key: K): V | null {
        const keyHash = hash(key);
        const foundVal = this.map[keyHash];
        return foundVal ? foundVal.getValue() : null;
    }

    public getOptional(key: K): Optional<V> {
        const value = this.get(key);
        return value 
            ? Optional.of(value) 
            : Optional.empty();
    }

    public getOrDefault(key: K, defaultVal: V): V {
        return this.getOptional(key)
                   .orElse(defaultVal); 
    }

    public values(): V[] {
        return this.entrySet()
            .map(e => e.getValue());
    }

    public keySet(): K[] {
        return this.entrySet()
            .map(e => e.getKey());
    }

    public entrySet(): Entry<K, V>[] {
        return Object.keys(this.map)
            .map(key => this.map[key]);
    }

    public keyStream(): Stream<K> {
        return Stream.of(this.keySet());
    }

    public valueStream(): Stream<V> {
        return Stream.of(this.values());
    }

    public entryStream(): Stream<Entry<K, V>> {
        return Stream.of(this.entrySet());
    }

    public containsKey(key: K): boolean {
        return this.map.hasOwnProperty(hash(key));
    }

    public containsValue(value: V, equalityTest?: BiPredicate<V, V>): boolean {
        const equalityTestToUse = equalityTest ? equalityTest : BiPredicate.defaultEquality();
        return this.valueStream()
                   .anyMatch(v => equalityTestToUse(v, value));
    }

    public forEach(consumer: BiConsumer<K, V>): void {
        this.entrySet()
            .forEach(({key, value}) => consumer(key, value));
    }

    public remove(key: K): V | null {
        const keyHash = hash(key);
        const previous = this.map[keyHash];
        delete this.map[keyHash];
        return previous.getValue();
    } 

    merge(key: K, value: V, remappingFunction: BiFunction<V>): V | null {
        const oldValue: Optional<V> = this.getOptional(hash(key)); 
        const newValue: V = oldValue.isPresent()
            ? remappingFunction(oldValue.get(), value)
            : value;
        if (newValue === null) {
            this.remove(key);
        } else {
            this.put(key, newValue);
        }
        return newValue;
    }
}

class MapEntry<K, V> implements Entry<K, V> {
    public readonly key: K;
    public readonly value: V;

    public constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }

    public getValue(): V {
        return this.value;
    }
    public getKey(): K {
        return this.key;
    }
}