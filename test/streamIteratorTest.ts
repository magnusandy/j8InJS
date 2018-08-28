import Stream from "../stream";
import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
use(spies);

describe('Stream as StreamIterator', () => {
    describe('hasNext', () => {
        it('it should return true if an element exists in the iterator', () => {
            const stream = Stream.ofValue(1);
            const streamIterator = stream.streamIterator();

            expect(streamIterator.hasNext()).to.be.true;
        });

        it('it should return false if an element doesnt exists in the iterator', () => {
            const stream = Stream.empty();
            const streamIterator = stream.streamIterator();

            expect(streamIterator.hasNext()).to.be.false;
        });

        it('it should return false if an element doesnt exists in the iterator, after using up', () => {
            const stream = Stream.ofValues(1);
            const streamIterator = stream.streamIterator();

            expect(streamIterator.hasNext()).to.be.true;
            streamIterator.getNext();
            expect(streamIterator.hasNext()).to.be.false;
        });
    });

    describe('getNext', () => {
        it('it should return a value laden optional if value exists', () => {
            const value = 1;
            const stream = Stream.ofValue(value);
            const streamIterator = stream.streamIterator();
            const result = streamIterator.getNext();

            expect(result.isPresent()).to.be.true;
            expect(result.get()).to.be.eq(value);
        });

        it('it should return a value empty optional if value exists', () => {
            const stream = Stream.empty();
            const streamIterator = stream.streamIterator();
            const result = streamIterator.getNext();

            expect(result.isPresent()).to.be.false;
        });

        it('it should return a value empty optional if hasNext is false', () => {
            const stream = Stream.empty();
            const streamIterator = stream.streamIterator();

            expect(streamIterator.hasNext()).to.be.false;
            const result = streamIterator.getNext();
            expect(streamIterator)
            expect(result.isPresent()).to.be.false;
        });

        it('it should return a value laden optional if hasNext is true', () => {
            const value = 1;
            const stream = Stream.ofValue(value);
            const streamIterator = stream.streamIterator();

            expect(streamIterator.hasNext()).to.be.true;
            const result = streamIterator.getNext();
            expect(result.isPresent()).to.be.true;
            expect(result.get()).to.be.eq(value);
        });
    });

    describe('tryAdvance', () => {
        it('it should return true and consume value if value exists', () => {
            const value = 1;
            const stream = Stream.ofValue(value);
            const streamIterator = stream.streamIterator();
            const consumerSpy = spy((value: number) => value + value);
            const result = streamIterator.tryAdvance(consumerSpy);

            expect(result).to.be.true;
            expect(consumerSpy).to.have.been.called.with(value);
        });

        it('it should return true and consume value if value exists', () => {
            const stream: Stream<number> = Stream.empty();
            const streamIterator = stream.streamIterator();
            const consumerSpy = spy((value: number) => value + value);
            const result = streamIterator.tryAdvance(consumerSpy);

            expect(result).to.be.false;
            expect(consumerSpy).to.not.have.been.called;
        });
    });
});