import {Consumer, Transformer } from "../functions";
import {use, spy, expect} from "chai";
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

    describe('Transformer', () => {
        it('identity function returns the value passed in', () => {
            const valueStruct = {i: 1, o: 'value'};
            const identity = Transformer.identity();
            const returned = identity(valueStruct);
            expect(returned).to.equal(valueStruct);
        });

        it('logger function returns the value passed in, and logs to console', () => {
            const valueStruct = {i: 1, o: 'LOG ME PLZ'};
            const logger = Transformer.logger();
            const returned = logger(valueStruct);
            expect(returned).to.equal(valueStruct);
            expect(consoleSpy).to.have.been.called.with(valueStruct);
        });
    });
});