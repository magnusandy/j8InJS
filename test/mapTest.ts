import Optional from "../optional";
import { expect } from "chai";
import Errors from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";
import { Map } from "../map";

const testObj = (v1: string, v2: number) => { 
    return { a: v1, b: { x: v2 } };
}

describe('Map tests', () => {
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
});

