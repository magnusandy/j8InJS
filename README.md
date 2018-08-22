# java8script
[![Build Status](https://travis-ci.org/magnusandy/java8script.svg?branch=master)](https://travis-ci.org/magnusandy/java8script)

[![Coverage Status](https://coveralls.io/repos/github/magnusandy/java8script/badge.svg?branch=master)](https://coveralls.io/github/magnusandy/java8script?branch=master)

Implementation of a Java 8 style Stream library in Javascript/Typescript.
the implementation tries to follow as closely to the Stream interface in Java 8 as possible. 

Also includes an Optional class that works the same as the Java8 optional

https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html.

[Stream](https://github.com/magnusandy/java8script#stream)
* [Examples](https://github.com/magnusandy/java8script#examples)
* [Methods](https://github.com/magnusandy/java8script#methods)

[Optional](https://github.com/magnusandy/java8script#optional)
* [Methods](https://github.com/magnusandy/java8script#methods-1)


## Stream
A stream is a sequence of elements with possibly unlimited length
and a sequence of 0 or more operations to be undertaken on the elements.
Streams computations are lazy and only take place when necessary, rather than at the time
they are declared.

The operations being undertaken on the elements of a stream can be thought of like a pipeline
elements enter the start of the pipeline, and various processors, or nodes along the pipeline take
elements, act on them and possibly pass outputs on to the rest of the pipeline.

a Stream pipeline consists of two types of operations:

Intermediate Operations: intermediate operations are lazy, they are not envoked until a terminal operation
is created, they generally transform or remove elements in some way. 
intermediate operations come in 3 flavours, stateless, stateful, and short-circuiting
stateless operations do not depend on previous results, and can be completely lazily computed, 
processing one element at a time on an is-needed basis. stateful operations on the other hand 
need access to previous elements of a pipeline in order to carry out a calculation, and because of this
need to collect and process some or all elements of a stream before the rest of the pipeline can proceed.
short-circuiting operations act as a guard or door, they stop elements from passing them in the pipeline, 
and have the benifit of turning a infinite stream into a finite one.

Terminal Operations: terminal operations are the final operation on a pipeline, they complete
the circuit so to speak, when a terminal node is envoked all the processing of a stream takes place.
example. terminal operations can also be short circuiting, in that they can cut an infinite stream of elements down
to a finite stream. 

Caution: short circuiting operations are only effective on a stateless pipeline, or one where each
stateful operations are first proceeded by a short circuiting one, otherwise an infinte loop can still happen.
for example consider an infinite stream S. `S.findFirst()` will correctly short circuit and return the first item of the
stream. `S.sorted().findFirst()`. on the other hand will infinitly loop as `sorted()` tries to greedily consume elements
before proceeding. this could be remedied by first limiting the streams output. `S.limit(10).sorted().findFirst()`

### Examples
Assume you have a large list of `Employee` objects containing such data as name, salary, gender, jobTitle, yearsOfExperience, listOfPromotions.

**Find list of all female developers**
```typescript
Stream.of(fullEmployeeList)
      .filter(e => e.jobTitle === "DEVELOPER") // keeps only employees where jobtitle === "DEVELOPER"
      .filter(e => e.gender === "FEMALE")
      .toArray(); //terminal action, its not until this call that the stream is processed.
```

**return the top 5 salaries in descending order**
```typescript
  Stream.of(fullEmployeeList)
        .map(emp => emp.salary) //now we have a stream of salaries
        .sorted((salary1, salary2) => Comparator.default()(salary2, salary1)) //now we have a descending stream of salaries
        .limit(5)
        .toArray();
```
*Note: because this stream contains a stateful operation `sorted` it will need to process every value*

**find the total years of experience of all the people named "Matt" in the list**
```typescript
Stream.of(fullEmployeeList)
      .filter(e => e.name === "Matt")
      .map(e => e.yearsOfExperience)
      .reduce((y1, y2) => y1 + y2);
```

**find first promotion for a manager whose current salary is over 65,000**
```typescript
Stream.of(fullEmployeeList)
      .filter(e => e.jobTitle === "MANAGER")
      .filter(e => e.salary > 65000)
      .map(e => e.listOfPromotions)
      .flatMap(Stream.of) //alternatively there is .flatMapList(list => list)
      .findFirst();
```
*Note: because this is a fully stateless stream (no stateful intermediate operations) this stream will be lazily processed,
only processing a minimum number of elements to produce a result. Meaning that not every employee will go through the filters/mapping functions. For example if the first employee in the list was a manager with over 65k salary, they would be the only element to be processed.*

**Create a list of the first 100 even numbers**
```typescript
Stream.iterate(2, (n) => n+2)
      .limit(100)
      .toArray();
```
*Note: it is important when using functions like iterate that you properly terminate the stream with a short circuiting operation, as otherwise and infinite loop will occur.*

### Methods


Creates a new stream from the given source array

```typescript 
of<T>(source: T[]): Stream<T>;
```

Creates a new stream from the given source values

```typescript  
ofValues<T>(...values: T[]): Stream<T>;
```

creates a stream of a single element with the given source value;

```typescript  
ofValue<T>(value: T): Stream<T>;
```


creates an empty Stream

```typescript  
empty<T>(): Stream<T>;
```

generates a infinite stream where elements are generated
by the given supplier.

```typescript  
generate<T>(supplier: Supplier<T>): Stream<T>;
```


creates an infinte stream of values by incrementally applying getNext to
the last item in the stream, so you have a stream like:
seed, getNext(seed), getNext(getNext(seed)), etc

```typescript 
iterate<T>(seed: T, getNext: Transformer<T, T>): Stream<T>;
```

creates a new stream consisting of all the values of s1, followed by all the values of s2
 
```typescript 
concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T>;
```


returns a stream of numbers starting at startInclusive, and going to up 
to but not including endExculsive in increments of 1, if a step is passed in, the 
increments of 1 will be changed to increments of size step, negative steps will be treated
as positive.

IF the start is greater than the end, the default step will be -1 and any positive step
values will be treated as negative i.e. 5 => -5, -5 => -5

an empty stream will be returned if start and end are the same


```typescript 
range(startInclusive: number, endExclusive: number, step?: number): Stream<number>;
```

returns a stream of numbers starting at startInclusive, and going to up 
to and including endInclusive in increments of 1, if a step is passed in, the 
increments of 1 will be changed to increments of size step

IF the start is greater than the end, the default step will be -1 and any positive step
values will be treated as negative i.e. 5 => -5, -5 => -5

an empty stream will be returned if start and end are the same

```typescript 
rangeClosed(startInclusive: number, endInclusive: number, step?: number): Stream<number>;
```

**Terminal Operation - Short Circuting:**
returns true if all items in the stream match the given predicate, if any item returns false, return false
if the stream is empty, return true, the predicate is never evaluated.

```typescript
allMatch(predicate: Predicate<T>): boolean;
```



**Terminal Operation - Short Circuting:**
returns true if any 1 item in the stream match the given predicate, if any item returns true, return true, else false.
 
```typescript
anyMatch(predicate: Predicate<T>): boolean;
```



**Terminal Operation:**
returns the count of all the elements of the stream.
 
```typescript
count(): number;
```



**Terminal Operation:**
applies a mutable reduction operation to the elements in the collection using the given items,
use of the combiner is not garenteed
 
```typescript
customCollect<R>(supplier: Supplier<R>, accumulator: BiConsumer<R, T>, combiner: BiConsumer<R, R>): R;
```



**Terminal Operation:**
applies a mutable reduction operation to the elements in the collection using the given collector
 
```typescript
collect<R, A>(collector: Collector<T, A, R>): R;
```



**Intermediate Operation - Stateful:**
return a distinct stream of elements according to the given equality function, if an equality function 
is not supplied, the BiPredicate.defaultEquality() function is used. This function is stateful because
it needs to keep track of previous elements, but does not need access to the full stream before proceeding
 
```typescript
distinct(equalsFunction?: BiPredicate<T, T>): Stream<T>;
```



**Intermediate Operation:**
returns a stream whose elements are those from the current stream that match the given predicate
function. Keep all elements who match the given predicate.
 
```typescript
filter(predicate: Predicate<T>): Stream<T>;
```



**Terminal Operation:** Short Circuiting:
Returns an optional describing the first element of the stream, if the stream is empty,
return an empty Optional.
 
```typescript
findFirst(): Optional<T>;
```



**Terminal Operation:** Short Circuiting:
Returns an optional describing the an element of the stream, if the stream is empty,
return an empty Optional.
 
```typescript
findAny(): Optional<T>;
```



**Intermediate Operation:**
A one to many mapping transformer, returns a stream whos elements consist of the 
elements of all the output streams of the transformer function.
 
```typescript
flatMap<U>(transformer: Transformer<T, Stream<U>>): Stream<U>;
```



**Intermediate Operation:**
A one to many mapping transformer, returns a stream whos elements consist of the 
elements of all the output lists of the transformer function. same idea as flatMap but
with standard arrays
 
```typescript
flatMapList<U>(transformer: Transformer<T, U[]>): Stream<U>;
``` 

**Intermediate Operation:**
similar idea to flatMap or flatMapList, takes in a transformer function that
returns a optional, and returns a stream of actual values of the optional 
results that include a value, functionally equivelant to 
stream.map(transformer).filter(o => o.isPresent()).map(o => o.get())
 
```typescript
flatMapOptional<U>(transformer: Transformer<T, Optional<U>>): Stream<U>;
```




**Terminal Operation:**
applies a given consumer to each entity in the stream. elements are processed in sequental order
 
```typescript
forEachOrdered(consumer: Consumer<T>): void;
```



**Terminal Operation:**
applies a given consumer to each entity in the stream. ordering is not garenteed
 
```typescript
forEach(consumer: Consumer<T>): void;
```



**Intermediate Operation - Short Circuiting:**
returns a stream that consists of less than or equal to maxSize elements
will create finite stream out of infinite stream. 
 
```typescript
limit(maxSize: number): Stream<T>;
```



**Intermediate Operation:**
Returns a stream consisting of the results of applying the given function to the elements of this stream.
 
```typescript
map<U>(transformer: Transformer<T, U>): Stream<U>;
```



**Terminal Operation:**
returns the largest element in the stream if the stream is not empty otherwise return Optional.empty()
If a comparator is supplied to the function, it is used to find the largest value in the stream, if no 
comparator is supplied, a default comparator using the > and < operators is used.
 
```typescript
max(comparator?: Comparator<T>): Optional<T>;
```



**Terminal Operation:**
returns the smallest element in the stream if the stream is not empty otherwise return Optional.empty()
If a comparator is supplied to the function, it is used to find the smallest value in the stream, if no 
comparator is supplied, a default comparator using the > and < operators is used.
 
```typescript
min(comparator?: Comparator<T>): Optional<T>;
```



**Terminal Operation - Short Circuting:**
returns true if no items in the stream match the given predicate, if any item predicate returns true, return false
if the stream is empty, return true, the predicate is never evaluated
 
```typescript
noneMatch(predicate: Predicate<T>): boolean;
```



**Intermediate Operation:**
applies the given consumer to each item in the pipeline as an intermediate operation
This function is mainly ment for debugging operations of a pipeline. Care should be taken
that the values of the stream are not altered within the consumer, it should be a stateless
and non altering function otherwise problems can be caused down the pipeline
 
```typescript
peek(consumer: Consumer<T>): Stream<T>;
```



**Terminal Operation:**
applies a reduction on the elements of the stream using the given accumulator function.
returns an Optional describing the result if the stream have values. Optionally, an initial
value can be specified, if the stream is empty, an optional describing the initial value will
be returned. 
 
```typescript
reduce(accumulator: BiFunction<T>, initialValue?: T): Optional<T>;
```



returns a StreamIterator of the current stream, allowing easier
step by step data retrieval from the stream
 
```typescript
streamIterator(): StreamIterator<T>;
```



**Intermediate Operation:** 
Returns a stream consisting of all the value after discarding the first n
values. If a negative number is passed in, no values are skipped. 
 
```typescript
skip(n: number): Stream<T>;
```



Intermediate Operation - Stateful:
If comparator is passed in, it is used to sort the values in the stream, otherwise
the default Comparator.default() comparator is used. and values are sorted in ascending order 
 
```typescript
sorted(comparator?: Comparator<T>): Stream<T>;
```



**Terminal Operation:** 
returns the Stream as an array of elements.
 
```typescript
toArray(): T[];
```

## Optional

A container object which may or may not contain a non-null value. If a value is present, `isPresent()` will return true and `get()` will return the value.
Additional methods that depend on the presence or absence of a contained value are provided, such as `orElse()` (return a default value if value not present) and `ifPresent()` (execute a block of code if the value is present).

### Methods
Returns an Optional with the specified present non-null value. Throws 'NullPointerException' if the value does not exist
Use ofNullable when the value might not be present;
 
```typescript
static of<U>(value: U): Optional<U>;
```

Returns an Optional describing the specified value, if non-null, otherwise returns an empty Optional.
 
```typescript
static ofNullable = <U>(value?: U): Optional<U> => new Optional(value);
```

returns an empty Optional instance.
 
```typescript
static empty<U>(): Optional<U>;
```

Return true if there is a value present, otherwise false.

```typescript
isPresent(): boolean;
```


If a value is present in this Optional, returns the value, otherwise throws "NoSuchElementException".
 
```typescript
get(): T;
```


If a value is present, and the value matches the given predicate, return an Optional describing the value, otherwise return an empty Optional.
 
```typescript
filter(predicate: Predicate<T>): Optional<T>;
```


If a value is present, invoke the specified consumer with the value, otherwise do nothing.
 
```typescript
ifPresent(consumer: Consumer<T>): void;
```


If a value is present, apply the provided transformer function to it, and if the result is non-null, return an Optional describing the result. Otherwise return an empty Optional.
 
```typescript
map<V>(transformer: Transformer<T, V>): Optional<V>;
```


If a value is present, apply the provided Optional-bearing mapping function to it, return that result, otherwise return an empty Optional.
 
```typescript
flatMap<V>(transformer: Transformer<T, Optional<V>>): Optional<V>;
```


Return the value if present, otherwise return other.
 
```typescript
orElse(other: T): T;
```


Return the value if present, otherwise invoke other and return the result of that invocation.
if result of supplier is null, throw "NullPointerException"
 
```typescript
orElseGet(supplier: Supplier<T>): T;
```


Return the contained value, if present, otherwise throw an error to be created by the provided supplier.
 
```typescript
orElseThrow(exceptionSupplier: Supplier<Error>): T;
```

