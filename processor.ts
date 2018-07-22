import { Transformer, Predicate } from "./functions";
import { Optional } from "./optional";
import { Maybe } from "./maybe";

export interface Processor<Input, Output> {
    hasNext(): boolean;
    getNext(): Optional<Output>;
    add(input: Input): void;
    isStateless(): boolean;
}

export const Processor = {
    mapProcessor: <I, O>(transformer: Transformer<I, O>): Processor<I, O> => new MapProcessor<I, O>(transformer),
    filterProcessor: <I>(predicate: Predicate<I>): Processor<I, I> => new FilterProcessor<I>(predicate),
    listFlatMapProcessor: <I, O>(transformer: Transformer<I, O[]>): Processor<I, O> => new ListFlatMapProcessor(transformer),
}

abstract class AbstractProcessor<Input, Output> implements Processor<Input, Output> {
    protected inputs: Input[];

    constructor() {
        this.inputs = [];
    }

    public add(input: Input): void {
        this.inputs.push(input);
    }

    protected takeNextInput(): Input | undefined {
        return this.inputs.shift();
    }

    public hasNext(): boolean {
        return this.inputs ? this.inputs.length > 0 : false;
    }

    abstract getNext(): Optional<Output>;
    abstract isStateless(): boolean;
}

/**
 * For use in Map processing pipline
 */
class MapProcessor<Input, Output> extends AbstractProcessor<Input, Output> {

    private transformer: Transformer<Input, Output>;

    public constructor(transformer: Transformer<Input, Output>) {
        super();
        this.transformer = transformer;
    }

    //pull values off the start
    public getNext(): Optional<Output> {
        return Optional.ofNullable<Input>(this.takeNextInput())
            .map(this.transformer);
    }

    public isStateless(): boolean {
        return true;
    }
}

class FilterProcessor<Input> extends AbstractProcessor<Input, Input> {
    private predicate: Predicate<Input>;

    public constructor(predicate: Predicate<Input>) {
        super();
        this.predicate = predicate;
    }

    public getNext(): Optional<Input> {
        return Optional.ofNullable(this.takeNextInput())
            .filter(this.predicate);
    }

    public isStateless(): boolean {
        return true;
    }
}

class ListFlatMapProcessor<Input, Output> implements Processor<Input, Output> {
    private sourceInputs: Input[];
    private outputList: Output[];
    private transformer: Transformer<Input, Output[]>;

    constructor(transformer: Transformer<Input, Output[]>) {
        this.transformer = transformer;
        this.sourceInputs = [];
        this.outputList = [];
    }

    public add(input: Input): void {
        this.sourceInputs.push(input);
    }

    public hasNext(): boolean {
        if (this.outputList.length > 0) {
            return true;
        } else if (this.sourceInputs.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    //todo test recursive
    public getNext(): Optional<Output> {
        if (this.outputList.length > 0) {
            return Optional.ofNullable(this.outputList.shift());
        } else if (this.sourceInputs.length > 0) {
            const nextSource: Optional<Input> = Optional.ofNullable(this.sourceInputs.shift());
            if (nextSource.isPresent()) {
                this.outputList = this.transformer(nextSource.get());
                return this.getNext();
            }
        }
        return Optional.empty();
    }

    public isStateless(): boolean {
        return true;
    }
}