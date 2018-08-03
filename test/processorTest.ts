import { Predicate, Transformer, BiPredicate } from "../functions";
import { Optional } from "../optional";
import { Processor } from "../processor";
import { expect } from "chai";


describe('Processor tests', () => {

    describe('MapProcessor tests', () => {
        it('should be a stateless processor', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);

            expect(processor.isStateless()).to.equal(true);
        })

        it('should not have next with no values', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);

            expect(processor.hasNext()).to.equal(false);
        })

        it('should have next when a value as been added', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);
            processor.add(1);

            expect(processor.hasNext()).to.equal(true);
        });

        it('should run values through transformer when retrieved', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);
            processor.add(1);
            const processedVal: Optional<string> = processor.processAndGetNext();
            expect(processedVal.isPresent()).to.equal(true);
            expect(processedVal.get()).to.equal('1');
        })

        it('should should return empty when has no values', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);
            const processedVal: Optional<string> = processor.processAndGetNext();
            expect(processedVal.isPresent()).to.equal(false);
        })

        it('should not have next after getting all values', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);
            processor.add(1);
            processor.processAndGetNext();
            expect(processor.hasNext()).to.equal(false);
        });

        it('should process in order of additions', () => {
            const transformer: Transformer<number, string> = (n: number) => `${n}`;
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);
            processor.add(1);
            processor.add(2);
            const val1: Optional<string> = processor.processAndGetNext();
            const val2: Optional<string> = processor.processAndGetNext();
            expect(val1.isPresent()).to.equal(true);
            expect(val1.get()).to.equal('1');
            expect(val2.isPresent()).to.equal(true);
            expect(val2.get()).to.equal('2');
        });

        it('should process transformer lazily on value fetch', () => {
            let count = 0;

            const transformer: Transformer<number, string> = (n: number) => { count++; return `${n}` };
            const processor: Processor<number, string> = Processor.mapProcessor(transformer);
            processor.add(1);
            processor.add(2);
            expect(count).to.equal(0);
            const val1: Optional<string> = processor.processAndGetNext();
            expect(count).to.equal(1);
            const val2: Optional<string> = processor.processAndGetNext();
            expect(count).to.equal(2);
        });
    });

    describe('FilterProcessor tests', () => {
        it('should be a stateless processor', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);

            expect(processor.isStateless()).to.equal(true);
        });

        it('should not have next with no values', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);

            expect(processor.hasNext()).to.equal(false);
        })

        it('should have next when a value as been added', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);
            processor.add(1);
            expect(processor.hasNext()).to.equal(true);
        });

        it('should run values through predicate when retrieved', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);
            processor.add(1);
            expect(processor.processAndGetNext().get()).to.equal(1);
            processor.add(11);
            expect(processor.processAndGetNext().isPresent()).to.equal(false);
        });


        it('should should return empty when has no values', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);

            expect(processor.processAndGetNext().isPresent()).to.equal(false);
        })

        it('should not have next after getting all values', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);
            processor.add(1);
            processor.processAndGetNext();
            expect(processor.hasNext()).to.equal(false);
        });

        it('should process in order of additions', () => {
            const predicate: Predicate<number> = (n: number) => n < 10;
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);
            processor.add(1);
            processor.add(2);
            expect(processor.processAndGetNext().get()).to.equal(1);
            expect(processor.processAndGetNext().get()).to.equal(2);
        });

        it('should process predicate lazily on value fetch', () => {
            let count = 0;
            const predicate: Predicate<number> = (n: number) => {count++; return n < 10};
            const processor: Processor<number, number> = Processor.filterProcessor(predicate);
            processor.add(1);
            processor.add(11);
            expect(count).to.equal(0);
            processor.processAndGetNext();
            expect(count).to.equal(1);
            processor.processAndGetNext();
            expect(count).to.equal(2);
        });
    });

    describe('ListFlatmapProcessor tests', () => {
        it('should be a stateless processor', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);

            expect(processor.isStateless()).to.equal(true);
        });

        it('should not have next with no values', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);

            expect(processor.hasNext()).to.equal(false);
        })

        it('should have next when a value as been added', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
            processor.add('cat');
            expect(processor.hasNext()).to.equal(true);
        });

        it('should run values through transformer when retrieved', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
            processor.add('cat');
            const val: Optional<string> = processor.processAndGetNext();
            expect(val.isPresent()).to.equal(true);
            expect(val.get()).to.equal('c');
        });

        it('should hasNext be true if in the middle of a processing', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
            processor.add('cat');
            expect(processor.hasNext()).to.equal(true);
            processor.processAndGetNext();
            expect(processor.hasNext()).to.equal(true);
            processor.processAndGetNext();
            expect(processor.hasNext()).to.equal(true);
        })

        it('should should return empty when has no values', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
            const val: Optional<string> = processor.processAndGetNext();
            expect(val.isPresent()).to.equal(false);
        })

        it('should not have next after getting all values', () => {
            it('should hasNext be true if in the middle of a processing', () => {
                const transformer: Transformer<string, string[]> = (s: string) => s.split('');
                const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
                processor.add('cat');
                processor.processAndGetNext();
                processor.processAndGetNext();
                processor.processAndGetNext();
                expect(processor.hasNext()).to.equal(false);
            })
        });

        it('should process in order of additions', () => {
            const transformer: Transformer<string, string[]> = (s: string) => s.split('');
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
            processor.add('ca');
            processor.add('do');
            expect(processor.processAndGetNext().get()).to.equal('c');
            expect(processor.processAndGetNext().get()).to.equal('a');
            expect(processor.processAndGetNext().get()).to.equal('d');
            expect(processor.processAndGetNext().get()).to.equal('o');
        });

        it('should process transformer lazily on value fetch', () => {
            let count = 0;
            const transformer: Transformer<string, string[]> = (s: string) => {count++; return s.split('');}
            const processor: Processor<string, string> = Processor.listFlatMapProcessor(transformer);
            processor.add('ca');
            processor.add('do');
            expect(count).to.equal(0);
            processor.processAndGetNext();
            expect(count).to.equal(1);
        });
    });

    describe('DistinctProcessor tests', () => {
        it('should be a stateful processor', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);

            expect(processor.isStateless()).to.equal(false);
        });

        it('should not have next with no values', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);

            expect(processor.hasNext()).to.equal(false);
        })

        it('should have next when a value as been added', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            processor.add(1);
            expect(processor.hasNext()).to.equal(true);
        });

        it('should have next when a value as been added and processing kicked off', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            processor.add(1);
            processor.add(2);
            processor.processAndGetNext();
            expect(processor.hasNext()).to.equal(true);
        });

        it('should run values through transformer when retrieved', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            [1,1].forEach(i => processor.add(i));

            const val1: Optional<number> = processor.processAndGetNext();
            const val2: Optional<number> = processor.processAndGetNext();

            expect(val1.get()).to.equal(1);
            expect(val2.isPresent()).to.equal(false);
        })

        it('should should return empty when has no values', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            expect(processor.processAndGetNext().isPresent()).to.equal(false);
        })

        it('should not have next after getting all values', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            [1,1].forEach(i => processor.add(i));

            expect(processor.hasNext()).to.equal(true);
            const val1: Optional<number> = processor.processAndGetNext();
            expect(processor.hasNext()).to.equal(false);
        });

        it('should return a distinct set of added items', () => {
            const comparator: BiPredicate<number, number> = (n1, n2) => n1 === n2;
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            [1,2,1,2,1,3].forEach(i => processor.add(i));

            const val1: Optional<number> = processor.processAndGetNext();
            const val2: Optional<number> = processor.processAndGetNext();
            const val3: Optional<number> = processor.processAndGetNext();

            expect(processor.hasNext()).to.equal(false);
            expect(val1.get()).to.equal(1);
            expect(val2.get()).to.equal(2);
            expect(val3.get()).to.equal(3);
        });

        it('should process transformer lazily on value fetch', () => {
            let count = 0;
            const comparator: BiPredicate<number, number> = (n1, n2) => {count++; return n1 === n2};
            const processor: Processor<number, number> = Processor.distinctProcessor(comparator);
            [1,2,1,2,1,3].forEach(i => processor.add(i));
            expect(count).to.equal(0);
            processor.processAndGetNext();
            expect(count).to.be.greaterThan(0);
        });
    });    
});



// describe('FilterProcessor tests', () => {
//     it('should be a stateless processor', () => {
//         const predicate: Predicate<number> = (n: number) => n < 10;
//         const processor: Processor<number, number> = Processor.filterProcessor(predicate);

//         expect(processor.isStateless()).to.equal(true);
//     });

//     it('should not have next with no values', () => {

//     })

//     it('should have next when a value as been added', () => {

//     });

//     it('should run values through transformer when retrieved', () => {

//     })

//     it('should should return empty when has no values', () => {

//     })

//     it('should not have next after getting all values', () => {

//     });

//     it('should process in order of additions', () => {

//     });

//     it('should process transformer lazily on value fetch', () => {

//     });
// });