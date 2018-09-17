import { expect } from "chai";
import { Map } from "../map";

const testObj = (v1: string, v2: number) => {
    return { a: v1, b: { x: v2 } };
}

describe('Map tests', () => {
    describe('of', () => {
        it('it creates a map with specified key value pairs', () => {
            const map: Map<string, number> = Map.of('one', 1, 'two', 2, 'three', 3, 'four', 4, 'five', 5);

            expect(map.keySet().length).eq(5);
            expect(map.get('one')).to.be.eq(1);
            expect(map.get('two')).to.be.eq(2);
            expect(map.get('three')).to.be.eq(3);
            expect(map.get('four')).to.be.eq(4);
            expect(map.get('five')).to.be.eq(5);
        });

        it('it can create empty', () => {
            const map: Map<string, number> = Map.of();

            expect(map.isEmpty()).to.be.true;
        });

        it('it doesnt add malformed pair', () => {
            const map: Map<string, number> = Map.of('one', 1, 'two');
            expect(map.keySet().length).eq(1);
            expect(map.getOptional('two').isPresent()).to.be.false;
        });
    });

    describe('empty', () => {
        it('it creates empty map', () => {
            const map: Map<string, number> = Map.empty();
            expect(map.isEmpty()).to.be.true;
        });
    });

    describe('clear', () => {
        it('it removes all keys and values from the map', () => {
            const map: Map<string, number> = Map.of('one', 1, 'two', 2, 'three', 3, 'four', 4, 'five', 5);

            expect(map.isEmpty()).to.be.false;
            map.clear();
            expect(map.isEmpty()).to.be.true;
        });
    });

    describe('get', () => {
        it('it returns the value in the map for the key', () => {
            const key = 'one';
            const value = 100;
            const map: Map<string, number> = Map.of(key, value);

            expect(map.get(key)).to.eq(value);
        });

        it('it returns the null for unmatched key', () => {
            const key = 'one';
            const value = 100;
            const map: Map<string, number> = Map.of(key, value);

            expect(map.get('notkey')).to.eq(null);
        });
    });

    describe('getOptional', () => {
        it('it returns optional describing the value for a given key', () => {
            const key = 'one';
            const value = 100;
            const map: Map<string, number> = Map.of(key, value);

            expect(map.getOptional(key).isPresent()).to.be.true;
            expect(map.getOptional(key).get()).to.be.eq(value); 
        });

        it('it returns optional describing the value for a given key', () => {
            const key = 'one';
            const value = 100;
            const map: Map<string, number> = Map.of(key, value);

            expect(map.getOptional('notkey').isPresent()).to.be.false;
        });
    });

    describe('getOrDefault', () => {
        it('it returns value if one exists', () => {
            const key = 'one';
            const value = 100;
            const def = 200;
            const map: Map<string, number> = Map.of(key, value);

            expect(map.getOrDefault(key, def)).to.be.eq(value);
        });
        
        it('it returns default if value was not there', () => {
            const key = 'one';
            const value = 100;
            const def = 200;
            const map: Map<string, number> = Map.of(key, value);

            expect(map.getOrDefault('notkey', def)).to.be.eq(def);
        });
    });

    describe('put', () => {
        it('add entry to map with basic types', () => {
            const key = "key";
            const val = "val";
            const map: Map<string, string> = Map.empty();
            map.put(key, val);
            const getResult = map.get(key);

            expect(getResult).to.be.equal(val);
        });

        it('add replace entry with basic types', () => {
            const key = "key";
            const val = "val";
            const val2 = "val2";
            const map: Map<string, string> = Map.empty();
            map.put(key, val);
            const result = map.put(key, val2);
            const getResult = map.get(key);

            expect(result).to.equal(val);
            expect(getResult).to.be.equal(val2);
        });

        it('add value with complex type key', () => {
            const key = testObj("test1", 5);
            const val = testObj("val1", 6);
            const map: Map<any, any> = Map.empty();
            map.put(key, val);
            const getResult = map.get(key);

            expect(getResult).to.be.equal(val);
        });

        it('add object with same fields and values should create same hash', () => {
            const key = testObj("test1", 5);
            const key2 = testObj("test1", 5);
            const val = testObj("val1", 6);
            const val2 = testObj("val2", 7);
            const map: Map<any, any> = Map.empty();
            map.put(key, val);
            map.put(key2, val2);
            const getResult = map.get(key);
            expect(getResult).to.be.equal(val2);
        });
    });

    describe('putIfAbsent', () => {
        it('it adds a new mapping if the specified key is not already in use', () => {
            const key = "key";
            const val = "val";
            const key2 = "key2";
            const val2 = "val2";
            const map: Map<string, string> = Map.of(key, val);
            map.putIfAbsent(key2, val2);

            expect(map.keySet().length).to.be.eq(2);
            expect(map.get(key2)).to.be.equal(val2);
            expect(map.get(key)).to.be.equal(val);
        });

        it('it returns null if no current mapping', () => {
            const key = "key";
            const val = "val";
            const key2 = "key2";
            const val2 = "val2";
            const map: Map<string, string> = Map.of(key, val);
            const retVal = map.putIfAbsent(key2, val2);

            expect(retVal).to.be.equal(null);
        });

        it('it does nothing if key already present', () => {
            const key = "key";
            const val = "val";
            const val2 = "val2";
            const map: Map<string, string> = Map.of(key, val);
            map.putIfAbsent(key, val2);

            expect(map.keySet().length).to.be.eq(1);
            expect(map.get(key)).to.be.equal(val);
        });

        it('it returns the current mapping value if key was already present', () => {
            const key = "key";
            const val = "val";
            const val2 = "val2";
            const map: Map<string, string> = Map.of(key, val);
            const retVal = map.putIfAbsent(key, val2);

            expect(retVal).to.be.equal(val);
        });
    });

    describe('putAll', () => {
        it('adds all the items from the given map to the map', () => {
            const map: Map<string, number> = Map.of('one', 1, 'two', 2);
            const map2: Map<string, number> = Map.of('three', 3, 'four', 4);

            map.putAll(map2);

            expect(map.valueStream().count()).to.eq(4);
            expect(map.get('three')).to.eq(3);
            expect(map.get('four')).to.eq(4);
        });
    });

    describe('containsKey', () => {
        it('returns true if the map contains the given key', () => {
            const key = 420;
            const map = Map.of(key, 'val');

            expect(map.containsKey(key)).to.be.true;
        });

        it('returns false if the map not contains the given key', () => {
            const key = 420;
            const map = Map.of(key, 'val');

            expect(map.containsKey(69)).to.be.false;
        });

        it('returns true if the map contains the given key, complex object', () => {
            const key = new Date(1);
            const secondKey = new Date(1);
            const map = Map.of(key, 'val');

            expect(map.containsKey(secondKey)).to.be.true;
        });
    });

    describe('merge', () => {
        it('it adds a new value when key doesnt exist', () => {
            const key = "one";
            const value = 1;
            const map: Map<string, number> = Map.empty();
            map.merge(key, value, (n1, n2) => n1 + n2);

            const result = map.getOptional(key);

            expect(result.isPresent()).to.be.true;
            expect(result.get()).to.be.eq(value);
        });

        it('it adds a new value when key doesnt exist', () => {
            const key = "one";
            const value = 1;
            const map: Map<string, number> = Map.empty();
            map.put(key, value);
            map.merge(key, 1, (n1, n2) => n1 + n2);

            const result = map.getOptional(key);

            expect(result.isPresent()).to.be.true;
            expect(result.get()).to.be.eq(value + value);
        });

        it('it removes entry when remapper returns null', () => {
            const key = "one";
            const value = 1;
            const map: Map<string, number> = Map.empty();
            map.put(key, value);
            map.merge(key, 1, (n1, n2): any => null);

            const result = map.getOptional(key);

            expect(result.isPresent()).to.be.false;
            expect(map.containsKey(key)).to.be.false;
        });
    });
});

