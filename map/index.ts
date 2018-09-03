import * as hash from 'js-hash-code';

export interface Map<K, V> {
    get(key: K): V | null;
    put(key: K, value: V): V | null;
    keySet(): K[];
    values(): V[];
}

export const Map = {
    empty<K, V>(): Map<K, V> {
        return new HashMap();
    }
}
export interface Entry<K, V> {
    getValue(): V;
    getKey(): K;
}

export const Entry = {
    of<K, V>(key: K, value: V): Entry<K, V> {
        return new MapEntry(key, value);
    }
}

class HashMap<K, V> implements Map<K, V> {
    private map: { [idx: string]: Entry<K, V> };

    public constructor() {
        this.map = {};
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

    public get(key: K): V | null {
        const keyHash = hash(key);
        const foundVal = this.map[keyHash];
        return foundVal ? foundVal.getValue() : null;
    }

    public values(): V[] {
        return Object.keys(this.map)
            .map(key => this.map[key])
            .map(e => e.getValue());
    }

    public keySet(): K[] {
        return Object.keys(this.map)
            .map(key => this.map[key])
            .map(e => e.getKey());
    }


}

class MapEntry<K, V> implements Entry<K, V> {
    private key: K;
    private value: V;

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