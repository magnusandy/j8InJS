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