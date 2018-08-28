import { use, spy, expect } from "chai";
import * as spies from "chai-spies";
import Stream from "../stream";
import Collectors from "../collectors";
use(spies);

describe('Collectors', () => {
    describe('toArray', () => {
        it('should collect the values to an array', () => {
            const source = [1, 3, 4];
            const stream = Stream.of(source);
            const result = stream.collect(Collectors.toArray());

            expect(result).to.contain.ordered.members(source);
        });
    });

    describe('toList', () => {
        it('should collect the values to an array', () => {
            const source = [1, 3, 4];
            const stream = Stream.of(source);
            const result = stream.collect(Collectors.toList());

            expect(result).to.contain.ordered.members(source);
        });
    });

    describe('joining', () => {
        it('should concatinate values into a single string', () => {
            const source = ["a", "b", "c"];
            const stream = Stream.of(source);
            const result:string = stream.collect(Collectors.joining());

            expect(result).equal("abc");
        });

        it('should concatinate values into a single string, including a delimiter', () => {
            const source = ["a", "b", "c"];
            const stream = Stream.of(source);
            const result:string = stream.collect(Collectors.joining(","));

            expect(result).equal("a,b,c");
        });

        it('should concatinate values into a single string, including delimiter, prefix and suffix', () => {
            const source = ["a", "b", "c"];
            const stream = Stream.of(source);
            const result:string = stream.collect(Collectors.joining(",", "pre-", "-post"));

            expect(result).equal("pre-a,b,c-post");
        });

        it('should return empty string with no params and empty stream', () => {
            const stream:Stream<string> = Stream.empty();
            const result:string = stream.collect(Collectors.joining());

            expect(result).equal("");
        });

        it('should return empty string with delim params and empty stream', () => {
            const stream:Stream<string> = Stream.empty();
            const result:string = stream.collect(Collectors.joining());

            expect(result).equal("");
        });

        it('should return just pre and post when stream empty', () => {
            const stream:Stream<string> = Stream.empty();
            const result:string = stream.collect(Collectors.joining(",", "a", "b"));

            expect(result).equal("ab");
        });
    });
});