import { use, spy } from "chai";
import * as spies from "chai-spies";
import * as lodash from 'lodash';
import * as Lazy from 'lazy.js';
import { Consumer, Function } from "../functions";
import Stream from "../stream";
import * as Benchmark from 'benchmark';
use(spies);
const numberOfOps = 10;
const itemSource: () => number[] = () => Stream.iterate(1, i => i + 1).limit(numberOfOps).toArray();
const timerResult = (start: number, end: number) => {
    console.log(start);
    console.log(end);
    const diff = end - start;
    const perSecond = 1000 / diff;
    return perSecond * numberOfOps;
}


describe('Benchmark', () => {
        it('map', () => {
            let suite: Benchmark.Suite = new Benchmark.Suite;
            const items = itemSource();
            suite.add('lodash', () => lodash.each(lodash.map(items, Function.identity()), Consumer.sink()))
            .add('java8script', () => Stream.of(items).map(Function.identity()).forEach(Consumer.sink()))
            .add('lazy', () => Lazy(items).map(Function.identity()).each(Consumer.sink()))
            .on('cycle', function (event: any) {
                console.log(event.target.name + " " + event.target.hz);
            })
            .run();
        });

        it('map->filter->first', () => {
            let suite: Benchmark.Suite = new Benchmark.Suite;
            const items = itemSource();
            suite.add('lodash', () => lodash.first(lodash.filter(lodash.map(items, Function.identity()), i => i < 5)))
            .add('java8script', () => Stream.of(items).map(Function.identity()).filter(i => i < 5).findFirst())
            .add('lazy', () => Lazy(items).map(Function.identity()).filter(i => i < 5).first())
            .on('cycle', function (event: any) {
                console.log(event.target.name + " " + event.target.hz);
            })
            .run();
        });
});