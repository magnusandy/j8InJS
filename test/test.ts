import { Optional } from "../optional";
import { expect } from "chai";

describe('Optional tests', () =>{
    it('of should return a non-empty optional', () => {
        const testString = 'someString';
        const o: Optional<string> = Optional.of(testString);
        expect(o.isPresent()).to.equal(true);
        expect(o.get()).to.equal(testString);
    });
});