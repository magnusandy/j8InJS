import { Consumer, Function, BiPredicate, Comparator } from "../functions";
import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
use(spies);
const consoleSpy = spy.on(console, 'log');

describe('Function tests', () => {
    describe('Consumer', () => {
        it('sink does nothing, no side effects', () => {
            let value = 0;
            const sinkFunc = Consumer.sink();
            sinkFunc(value);
            expect(value).to.equal(0);
        });

        it('logger, logs the value to console', () => {
            let value = "THIS IS THE VALUE";
            const logFunc = Consumer.logger();
            logFunc(value);
            expect(consoleSpy).to.have.been.called.with(value);
        });
    });

    describe('Function', () => {
        it('identity function returns the value passed in', () => {
            const valueStruct = { i: 1, o: 'value' };
            const identity = Function.identity();
            const returned = identity(valueStruct);
            expect(returned).to.equal(valueStruct);
        });

        it('logger function returns the value passed in, and logs to console', () => {
            const valueStruct = { i: 1, o: 'LOG ME PLZ' };
            const logger = Function.logger();
            const returned = logger(valueStruct);
            expect(returned).to.equal(valueStruct);
            expect(consoleSpy).to.have.been.called.with(valueStruct);
        });
    });

    describe('Comparator', () => {
        it('default comparator returns -1 if first value less than second', () => {
            const value1 = 1;
            const value2 = 2;
            const result = Comparator.default()(value1, value2);
            expect(result).lessThan(0);
        });

        it('default comparator returns 1 if first value greater than than second', () => {
            const value1 = 2;
            const value2 = 1;
            const result = Comparator.default()(value1, value2);
            expect(result).greaterThan(0);
        });

        it('default comparator returns -1 if first value less than second', () => {
            const value1 = 1;
            const value2 = 1;
            const result = Comparator.default()(value1, value2);
            expect(result).to.equal(0);
        });
    });

    describe('BiPredicate', () => {
        it('defaultEquality returns a function that returns true if two items === each other', () => {
            const value1 = 1;
            const value2 = 1;
            const result = BiPredicate.defaultEquality()(value1, value2);
            expect(result).to.eq(true);
        });

        it('defaultEquality returns a function that returns false if two items do not ===', () => {
            const value1 = 2;
            const value2 = 1;
            const result = BiPredicate.defaultEquality()(value1, value2);
            expect(result).to.eq(false);
        });

        it('defaultEquality returns a function that returns false if two items !=== each other', () => {
            const value1 = { i: '1' };
            const value2 = { i: '1' };
            const result = BiPredicate.defaultEquality()(value1, value2);
            expect(result).to.eq(false);
        });

        it('defaultEquality returns a function that returns true if two items === each other', () => {
            const value1 = { i: '1' };
            const value2 = value1;
            const result = BiPredicate.defaultEquality()(value1, value2);
            expect(result).to.eq(true);
        });
    });

    describe('hashEquality', () => {
        it('it returns a function that returns true if two objects has the same keys and values', () => {
            const value1 = { i: '1' };
            const value2 = value1;
            const result = BiPredicate.hashEquality()(value1, value2);
            expect(result).to.eq(true);
        });

        it('it returns a function that returns true if two objects has the same keys and values', () => {
            const value1 = { i: '1' };
            const value2 = { i: '1' };
            const result = BiPredicate.hashEquality()(value1, value2);
            expect(result).to.eq(true);
        });  

        it('it returns a function that returns true where defaultEquality fails', () => {
            const value1 = { i: '1', 2: 1};
            const value2 = { i: '1', 2: 1};
            const hashResult = BiPredicate.hashEquality()(value1, value2);
            const defaultResult = BiPredicate.defaultEquality()(value1, value2);
            expect(defaultResult).to.eq(false);
            expect(hashResult).to.eq(true);
        });  

        it('it returns a function that returns true where defaultEquality fails', () => {
            const value1 = new Date('December 17, 1995 03:24:00');
            const value2 = new Date('December 17, 1995 03:24:00');
            const hashResult = BiPredicate.hashEquality()(value1, value2);
            const defaultResult = BiPredicate.defaultEquality()(value1, value2);
            expect(defaultResult).to.eq(false);
            expect(hashResult).to.eq(true);
        });  
    });

});