import { expect } from "chai";
import { Errors } from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";
import {stream, Stream} from '../stream';

describe('Stream tests', () => {
    describe('Stream should work', () => {
        const arraySource: number[] = [1,2,3];
        const s: Stream<number> = stream(arraySource);
        const transformer: Transformer<number, string> = (n:number) => {console.log(n); return `numbe: ${n}`};
        s.map(transformer);
        console.log('here');
        //s.forEach((v: any) => console.log(v))
    });

});