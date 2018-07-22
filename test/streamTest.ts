import { expect } from "chai";
import { Errors } from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";
import { Stream } from '../stream';
import Collectors from "../collectors";
import { Optional } from "../optional";

describe('Stream tests', () => {
    describe('forEach tests', () => {
        // it('it should consume all values', () => {
        //     const stream: Stream<string> = Stream.of(['a,b,c', 'e,f,g']).flatMapList(i => i.split(',')).map(s => `1: ${s}`);
        //     const consumer: Consumer<string> = (s: string) => console.log(s);
        //     stream.forEach(consumer);
        // });

        // it('it should consume all values', () => {
        //     const stream: Stream<string> = Stream.of(['a,b,c', 'e,f,g']).flatMapList(i => i.split(','));
        //     const consumer: Consumer<string> = (s: string) => console.log(s);
        //     console.log(stream.collect(Collectors.toList()));
        // });

        it('it should filterValues', () => {
            const stream: Stream<string> = Stream.of([4,4,5,1,2,3,4,4,5,1])
            .distinctPredicate((i1, i2) => i1 === i2)
            .map(e => `1`)
            .distinctPredicate((s1, s2) => s1 === s2);
            
            console.log(stream.collect(Collectors.toList()));
        });
    })
});