import { Optional } from "../optional";
import { expect } from "chai";
import { Errors } from "../errors";
import { Predicate, Consumer, Transformer } from "../functions";

describe('Optional tests', () => {
    describe('Optional.of()', () => {
        it('should return a non-empty optional', () => {
            const testString = 'someString';
            const o: Optional<string> = Optional.of(testString);
            expect(o.isPresent()).to.equal(true);
            expect(o.get()).to.equal(testString);
        });

        it('should throw "NullPointerException" if passed null', () => {
            expect(() => Optional.of(null)).to.throw(Errors.NullPointerException);
        });

        it('should throw "NullPointerException" if passed undefined', () => {
            expect(() => Optional.of(undefined)).to.throw(Errors.NullPointerException);
        });

        it('should not throw "NullPointerException" if passed 0', () => {
            expect(() => Optional.of(0)).to.not.throw(Errors.NullPointerException);
        });

        it('should not throw "NullPointerException" if passed false', () => {
            expect(() => Optional.of(false)).to.not.throw(Errors.NullPointerException);
        });

        it('should not throw "NullPointerException" if passed ""', () => {
            expect(() => Optional.of("")).to.not.throw(Errors.NullPointerException);
        });
    })

    describe('Optional.ofNullable()', () => {
        it('should return a non-empty optional if passed an actual value', () => {
            const testString = 'someString';
            const o: Optional<string> = Optional.ofNullable(testString);
            expect(o.isPresent()).to.equal(true);
            expect(o.get()).to.equal(testString);
        });

        it('should NOT throw "NullPointerException" if passed null', () => {
            expect(() => Optional.ofNullable(null)).to.not.throw(Errors.NullPointerException);

        });

        it('should not throw "NullPointerException" if passed undefined', () => {
            expect(() => Optional.ofNullable(undefined)).to.not.throw(Errors.NullPointerException);
        });

        it('should return Optional.empty() if passed undefined', () => {
            const somethingEmpty: any = undefined;
            const o: Optional<string> = Optional.ofNullable(somethingEmpty);
            expect(o.isPresent()).to.eq(false);
        })

        it('should return Optional.empty() if passed null', () => {
            const somethingEmpty: any = null;
            const o: Optional<string> = Optional.ofNullable(somethingEmpty);
            expect(o.isPresent()).to.eq(false);
        })
    });

    describe('Optional.empty()', () => {
        it('should return optional with no value', () => {
            const o: Optional<string> = Optional.empty();
            expect(o.isPresent()).to.equal(false);
            expect(o.get).to.throw(Errors.NoSuchElementException);
        });
    });

    describe('isPresent()', () => {
        it('should return false if there is no value', () => {
            const o: Optional<string> = Optional.empty();
            expect(o.isPresent()).to.equal(false);
        });

        it('should return true if there is a value', () => {
            const o: Optional<{ x: string }> = Optional.of({ x: 'object' });
            expect(o.isPresent()).to.equal(true);
        });
    })

    describe('get()', () => {
        it('should return the value if not empty', () => {
            const someValue: string = 'something';
            const o: Optional<string> = Optional.of(someValue);
            expect(o.get()).to.equal(someValue);
        });

        it('should thow "NoSuchElementException" if empty', () => {
            const o = Optional.empty();
            expect(o.get).to.throw(Errors.NoSuchElementException);
        });
    })

    describe('filter(predicate: Predicate<T>)', () => {
        it('should keep value if predicate returns true', () => {
            const truePredicate: Predicate<number> = (x: number) => true;
            let o: Optional<number> = Optional.of(1);
            o = o.filter(truePredicate);
            expect(o.isPresent()).to.equal(true);
        });

        it('should not keep value if predicate returns false', () => {
            const falsePredicate: Predicate<number> = (x: number) => false;
            let o: Optional<number> = Optional.of(1);
            o = o.filter(falsePredicate);
            expect(o.isPresent()).to.equal(false);
        });

        it('should actually apply the predicate to the value', () => {
            const predicate: Predicate<number> = (x: number) => x > 10;
            let o: Optional<number> = Optional.of(11);
            o = o.filter(predicate);
            expect(o.isPresent()).to.equal(true);
        });

        it('should lazily apply predicate', () => {
            let consumerActivated = false;
            const predicate: Predicate<number> = (x: number) => { consumerActivated = true; return false };
            const o: Optional<number> = Optional.empty();
            o.filter(predicate)
            expect(consumerActivated).to.equal(false);
        });
    });

    describe('ifPresent(consumer: Consumer<T>)', () => {
        it('should apply the consumer if a value is present', () => {
            let consumerActivated = false;
            const consumer: Consumer<number> = (x: number) => consumerActivated = true;
            const o: Optional<number> = Optional.of(1);
            o.ifPresent(consumer)
            expect(consumerActivated).to.equal(true);
        });

        it('should do nothing, not run consumer if optional empty', () => {
            let consumerActivated = false;
            const consumer: Consumer<number> = (x: number) => consumerActivated = true;
            const o: Optional<number> = Optional.empty();
            o.ifPresent(consumer)
            expect(consumerActivated).to.equal(false);
        });
    });

    describe('map(transformer: Transformer<T, V>)', () => {
        it('should return Optional with new value, if value is present', () => {
            const stringVal = 'string';
            const transformer: Transformer<number, string> = (n: number) => stringVal;
            const o: Optional<number> = Optional.of(1);
            const s: Optional<string> = o.map(transformer);
            expect(s.isPresent()).to.equal(true);
            expect(s.get()).to.equal(stringVal);
        });

        it('should return empty, if value is not present', () => {
            const stringVal = 'string';
            const transformer: Transformer<number, string> = (n: number) => stringVal;
            const o: Optional<number> = Optional.empty();
            const s: Optional<string> = o.map(transformer);
            expect(s.isPresent()).to.equal(false);
        });

        it('should return empty if transformer returns null', () => {
            const transformer: Transformer<number, any> = (n: number) => null;
            const o: Optional<number> = Optional.of(1);
            const s: Optional<string> = o.map(transformer);
            expect(s.isPresent()).to.equal(false);
        });

        it('should return empty if transformer returns undefined', () => {
            const transformer: Transformer<number, any> = (n: number) => undefined;
            const o: Optional<number> = Optional.of(1);
            const s: Optional<string> = o.map(transformer);
            expect(s.isPresent()).to.equal(false);
        });

        it('should lazily apply transformer', () => {
            let activated = false;
            const stringVal = 'string';
            const transformer: Transformer<number, string> = (n: number) => { activated = true; return stringVal; };
            const o: Optional<number> = Optional.empty();
            const s: Optional<string> = o.map(transformer);
            expect(activated).to.equal(false);
        });
    });

    describe('flatMap(transformer: Transformer<T, Optional<V>>)', () => {

        it('should return transformed result if value is present', () => {
            const retVal = Optional.of(2);
            const transformer: Transformer<number, Optional<number>> = (n: number) => retVal;
            const o: Optional<number> = Optional.of(1);
            const s: Optional<number> = o.flatMap(transformer);
            expect(s).to.equal(retVal);
        });

        it('should return empty if transformer returns undefined', () => {
            const transformer: Transformer<number, any> = (n: number) => undefined;
            const o: Optional<number> = Optional.of(1);
            const s: Optional<string> = o.flatMap(transformer);
            expect(s.isPresent()).to.equal(false);
        });

        it('should return empty if transformer returns null', () => {
            const transformer: Transformer<number, any> = (n: number) => null;
            const o: Optional<number> = Optional.of(1);
            const s: Optional<string> = o.flatMap(transformer);
            expect(s.isPresent()).to.equal(false);
        });

        it('should return transformed result if value is present', () => {
            let applied = false;
            const retVal = Optional.of(2);
            const transformer: Transformer<number, Optional<number>> = (n: number) => { applied = true; return retVal; }
            const o: Optional<number> = Optional.empty();
            const s: Optional<number> = o.flatMap(transformer);
            expect(applied).to.equal(false);
        });
    });

    describe('orElse(other: T)', () => {
        it('should return value if present', () => {
            const value = 'value';
            const other = 'other';
            const result: string = Optional.of(value).orElse(other);
            expect(result).to.equal(value);
            expect(result).to.not.equal(other);
        });

        it('should return other if not present', () => {
            const other = 'other';
            const result: string = Optional.empty<string>().orElse(other);
            expect(result).to.equal(other);
        });
    });

    describe('orElseGet(other: Supplier<T>)', () => {
        it('should return value if present', () => {
            const value = 'value';
            const other = 'other';
            const otherSupplier = () => other;
            const result: string = Optional.of(value).orElseGet(otherSupplier);
            expect(result).to.equal(value);
            expect(result).to.not.equal(other);
        });

        it('should envoke and return other if present', () => {
            const other = 'other';
            const otherSupplier = () => other;
            const result: string = Optional.empty<string>().orElseGet(otherSupplier);
            expect(result).to.equal(other);
        });

        it('should lazily envoke supplier only when value not present', () => {
            let activated = false;
            const other = 'other';
            const otherSupplier = () => { activated = true; return other; };
            expect(activated).to.equal(false);
            const result: string = Optional.of('value').orElseGet(otherSupplier);
            expect(activated).to.equal(false);
        });
    });

    describe('orElseThrow(throwableSupplier: Supplier<any>)', () => {
        it('should return value if present', () => {
            const value = 'value';
            const error = 'Error';
            const throwSupplier = () => error;
            const resulter = () => Optional.of(value).orElseThrow(throwSupplier);
            expect(resulter).to.not.throw(error);
            expect(resulter()).to.equal(value);
        });

        it('should throw value given by the supplier', () => {
            const error = 'Error';
            const throwSupplier = () => error;
            const resulter = () => Optional.empty().orElseThrow(throwSupplier);
            expect(resulter).to.throw(error);
        });

        it('should lazily envoke supplier, only when value not present', () => {
            let activated = false;
            const value = 'value';
            const throwSupplier = () => { activated = true; return 'Error'; }
            Optional.of(value).orElseThrow(throwSupplier);
            expect(activated).to.equal(false);
        });
    });

});