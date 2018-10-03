import Optional from "../optional";

export class NumberSummaryStatistics {

    private average: number; 
    private count: number;
    private max: number;
    private min: number;
    private sum: number;

    constructor() {
        this.average = 0;
        this.max = -Number.MAX_VALUE;
        this.min = Number.MAX_VALUE;
        this.count = 0;
        this.sum = 0;
    }

    public static create() {
        return new NumberSummaryStatistics();
    }

    public accept(n: number): void {
        this.sum =  this.sum + n;
        this.count++;
        this.average = this.sum/this.count;
        this.max = n > this.max ? n : this.max;
        this.min = n < this.min ? n : this.min;
    }

    public combine(other: NumberSummaryStatistics): void {
        this.sum = this.sum + other.getSum();
        this.count = this.count + other.count;
        this.average = this.sum / this.count;
        this.min = this.min < other.getMin() ? this.min : other.getMin();
        this.max = this.max > other.getMax() ? this.max : other.getMax();         
    }

    public getAverage(): number {
        return this.average;
    }

    public getMin(): number {
        return this.min;
    }

    public getMax(): number {
        return this.max;
    }

    public getCount(): number {
        return this.count;
    }

    public getSum(): number {
        return this.sum;
    }
}

export class MutableString {
    private value: string;

    private constructor(value: string) {
        this.value = value;
    }

    public static empty(): MutableString {
        return new MutableString("");
    }

    public static of(value: string): MutableString {
        return new MutableString(value);
    }

    public append(postfix: string): void {
        this.value = this.value + postfix;
    }

    public prepend(prefix: string): void {
        this.value = prefix + this.value;
    }

    public concat(other: MutableString): MutableString {
        this.append(other.getValue());
        return this;
    }

    public getValue(): string {
        return this.value;
    }
}

export class MutableNumber {
    private inputs: number[];
    private total: number;

    private constructor(inputs: number[], total: number) {
        this.inputs = inputs;
        this.total = total;
    }

    public static empty(): MutableNumber {
        return new MutableNumber([], 0);
    }

    public add(value: number): void {
        this.total = this.total + value;
        this.inputs.push(value);
    }

    public addTogether(other: MutableNumber): MutableNumber {
        const newInputs = this.inputs.concat(other.getInputs());
        const newTotal = this.total + this.getTotal();
        return new MutableNumber(newInputs, newTotal);
    }

    public getInputs(): number[] {
        return this.inputs.slice();
    }

    public getTotal(): number {
        return this.total;
    }

    public getInputCount(): number {
        return this.inputs.length;
    }
}

export class Holder<T> {
    public item?: T;

    constructor(item?: T) {
        this.item = item;
    }
    public get(): Optional<T> {
        return Optional.ofNullable(this.item);
    }

    public set(item: T): void {
        this.item = item;
    }
}