import Optional from "../optional";

/**
 * A state object for collecting statistics such as count, min, max, sum, and average.
 */
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

    /**
     * creates a new, empty NumberSummaryStatisitcs.
     */
    public static create(): NumberSummaryStatistics {
        return new NumberSummaryStatistics();
    }

    /**
     * Records a new value into the summary information
     * @param n - number to record
     */
    public accept(n: number): void {
        this.sum =  this.sum + n;
        this.count++;
        this.average = this.sum/this.count;
        this.max = n > this.max ? n : this.max;
        this.min = n < this.min ? n : this.min;
    }

    /**
     * Combines the state of another NumberSummaryStatistics into this one
     * @param other - other NumberSummaryStatistic to combine with
     */
    public combine(other: NumberSummaryStatistics): void {
        this.sum = this.sum + other.getSum();
        this.count = this.count + other.count;
        this.average = this.sum / this.count;
        this.min = this.min < other.getMin() ? this.min : other.getMin();
        this.max = this.max > other.getMax() ? this.max : other.getMax();         
    }

    /**
     * Returns the arithmetic mean of values recorded, or zero if no values have been recorded.
     */
    public getAverage(): number {
        return this.average;
    }

    /**
     * Returns the minimum value recorded, or Number.MAX_VALUE if no values have been recorded.
     */
    public getMin(): number {
        return this.min;
    }

    /**
     * Returns the maximum value recorded, or -Number.MAX_VALUE if no values have been recorded.
     */
    public getMax(): number {
        return this.max;
    }

    /**
     * Returns the count of values recorded.
     */
    public getCount(): number {
        return this.count;
    }

    /**
     * Returns the sum of values recorded, or zero if no values have been recorded.
     */
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