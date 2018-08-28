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