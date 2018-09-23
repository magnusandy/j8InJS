import { Map } from "../map";
import { Errors } from "../errors";
import { BiPredicate, BiConsumer } from "../functions";
import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
use(spies);

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

        it('throw error if key is null', () => {
            const key = null;
            const val = "val";
            const map: Map<any, string> = Map.empty();

            expect(() => map.put(key, val)).to.throw(Errors.NullPointerException);
        });

        it('throw error if key is undefined', () => {
            const key = undefined;
            const val = "val";
            const map: Map<any, string> = Map.empty();

            expect(() => map.put(key, val)).to.throw(Errors.NullPointerException);
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

        it('throw error if key is null', () => {
            const key = null;
            const val = "val";
            const map: Map<any, string> = Map.empty();

            expect(() => map.putIfAbsent(key, val)).to.throw(Errors.NullPointerException);
        });

        it('throw error if key is undefined', () => {
            const key = undefined;
            const val = "val";
            const map: Map<any, string> = Map.empty();

            expect(() => map.putIfAbsent(key, val)).to.throw(Errors.NullPointerException);
        });

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

    describe('containsKey', () => {
        it('it returns true when a key exists', () => {
            const key = "key";
            const map = Map.of(key, 'val');

            expect(map.containsKey(key)).to.be.true;
        });

        it('it returns true when a key exists', () => {
            const key = new Date();
            const map = Map.of(key, 'val');

            expect(map.containsKey(key)).to.be.true;
        });

        it('it returns false when a key doesnt exists', () => {
            const key = new Date(1);
            const keyOther = new Date(100000000);
            const map = Map.of(key, 'val');

            expect(map.containsKey(keyOther)).to.be.false;
        });

        it('it returns false when a key given is null', () => {
            const key = new Date(1);
            const keyOther: any = null;
            const map = Map.of(key, 'val');

            expect(map.containsKey(keyOther)).to.be.false;
        });
    });

    describe('containsValue', () => {
        it('it returns true if value exists', () => {
            const value = "100";
            const map = Map.of(1, value, 2, value);

            expect(map.containsValue(value)).to.be.true;
        });

        it('it returns false if value doesnt xists', () => {
            const value = "100";
            const map = Map.of(1, value, 2, value);

            expect(map.containsValue('notValue')).to.be.false;
        });

        it('it returns true if value exists based on equality function', () => {
            const value = new Date(1000);
            const value2 = new Date(1000);
            const map = Map.of(1, value, 2, value);

            expect(map.containsValue(value2)).to.be.false; //fail default equality
            expect(map.containsValue(value2, BiPredicate.hashEquality())).to.be.true;
        });

        it('it returns false if value doesnt exists based on equality function', () => {
            const value = new Date(1000);
            const value2 = new Date(200000);
            const map = Map.of(1, value, 2, value);

            expect(map.containsValue(value2, BiPredicate.hashEquality())).to.be.false;
        });
    });

    describe('keySet', () => {
        it('returns an array of all the keys in the map', () => {
            const keys = [1, 2, 3];
            const map = Map.of(keys[0], "1", keys[1], "2", keys[2], "3");
            const result = map.keySet();

            expect(result).to.have.members(keys);
        });

        it('returns an empty array if map is empty', () => {
            const map = Map.empty();
            const result = map.keySet();

            expect(result.length).to.be.eq(0);
        });
    });

    describe('values', () => {
        it('returns an array of all the values in the map', () => {
            const values = [1, 2, 3];
            const map = Map.of(1, values[0], 2, values[1], 3, values[2]);
            const result = map.values();

            expect(result).to.have.members(values);
        });

        it('returns an empty array if map is empty', () => {
            const map = Map.empty();
            const result = map.values();

            expect(result.length).to.be.eq(0);
        });
    });

    describe('keyStream', () => {
        it('returns an array of all the keys in the map', () => {
            const keys = [1, 2, 3];
            const map = Map.of(keys[0], "1", keys[1], "2", keys[2], "3");
            const result = map.keyStream().toArray();

            expect(result).to.have.members(keys);
        });

        it('returns an empty array if map is empty', () => {
            const map = Map.empty();
            const result = map.keyStream().toArray();

            expect(result.length).to.be.eq(0);
        });
    });

    describe('valueStream', () => {
        it('returns an array of all the values in the map', () => {
            const values = [1, 2, 3];
            const map = Map.of(1, values[0], 2, values[1], 3, values[2]);
            const result = map.valueStream().toArray();

            expect(result).to.have.members(values);
        });

        it('returns an empty array if map is empty', () => {
            const map = Map.empty();
            const result = map.valueStream().toArray();

            expect(result.length).to.be.eq(0);
        });
    });

    describe('entrySet', () => {
        it('returns an array of all the entrys in the map', () => {
            const values = [1, 2, 3];
            const keys = [4, 5, 6];
            const map = Map.of(keys[0], values[0], keys[1], values[1], keys[2], values[2]);
            const result = map.entrySet();

            expect(result.length).to.eq(3);
            expect(result[0].key).to.be.eq(keys[0])
            expect(result[0].value).to.be.eq(values[0])
            expect(result[1].key).to.be.eq(keys[1])
            expect(result[1].value).to.be.eq(values[1])
            expect(result[2].key).to.be.eq(keys[2])
            expect(result[2].value).to.be.eq(values[2])

        });

        it('returns an empty array if map is empty', () => {
            const map = Map.empty();
            const result = map.entrySet();

            expect(result.length).to.be.eq(0);
        });
    });

    describe('entryStream', () => {
        it('returns an stream of all the entrys in the map', () => {
            const values = [1, 2, 3];
            const keys = [4, 5, 6];
            const map = Map.of(keys[0], values[0], keys[1], values[1], keys[2], values[2]);
            const result = map.entryStream().toArray();

            expect(result.length).to.eq(3);
            expect(result[0].key).to.be.eq(keys[0])
            expect(result[0].value).to.be.eq(values[0])
            expect(result[1].key).to.be.eq(keys[1])
            expect(result[1].value).to.be.eq(values[1])
            expect(result[2].key).to.be.eq(keys[2])
            expect(result[2].value).to.be.eq(values[2])

        });

        it('returns an empty array if map is empty', () => {
            const map = Map.empty();
            const result = map.entryStream().toArray();

            expect(result.length).to.be.eq(0);
        });
    });

    describe('forEach', () => {
        it('calls function for each entry in the map', () => {
            const map = Map.of(1, 1, 2, 2, 3, 3);
            const consumer: BiConsumer<number, number> = (x, y) => x + y;
            const spyConsumer = spy(consumer);
            map.forEach(spyConsumer);

            expect(spyConsumer).to.be.called.with(1, 1);
            expect(spyConsumer).to.be.called.with(2, 2);
            expect(spyConsumer).to.be.called.with(3, 3);
        });
    });

    describe('isEmpty', () => {
        it('returns true when empty', () => {
            const map = Map.empty();
            expect(map.isEmpty()).to.be.true;
        });

        it('returns true when empty by removal', () => {
            const map = Map.of(1, 1);
            map.remove(1);
            expect(map.isEmpty()).to.be.true;
        });

        it('returns false when has values', () => {
            const map = Map.of(1, 1);
            expect(map.isEmpty()).to.be.false;
        });
    });

    describe('remove', () => {
        it('removes the given key from the map, if it existed', () => {
            const key = 1;
            const map = Map.of(key, 1);
            map.remove(key);

            expect(map.containsKey(key)).to.be.false;
        });

        it('returns previous value if one existed', () => {
            const key = 1;
            const val = '1';
            const map = Map.of(key, val);
            const result = map.remove(key);

            expect(result).to.be.eq(val);
        });

        it('returns null value if one no key existed', () => {
            const key = 1;
            const val = '1';
            const map = Map.of(key, val);
            const result = map.remove(2);

            expect(result).to.be.null;
        });
    });
});

