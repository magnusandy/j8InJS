"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * defines a supplier function interface, with the added ability of checking if the supplier
 * still contains values or not.
 */
exports.Consumer = {
    /**
     * returns a consumer that takes in an element and does nothing
     */
    sink: function () {
        return function (i) { };
    },
    /**
     * returns a consumer logs the value given to the console
     */
    logger: function () {
        return function (i) { return console.log(i); };
    }
};
exports.Transformer = {
    /**
     * returns Transformer that when passed an argument, will return the given argument
     */
    identity: function () {
        return function (i) { return i; };
    },
    /**
     * returns a Transformer logs the given value to the console and then returns the value
     */
    logger: function () {
        return function (i) {
            console.log(i);
            return i;
        };
    }
};
exports.BiPredicate = {
    /**
     * returns a BiPredicate that takes two values of the same type, and returns true if
     * i1 === i2
     */
    defaultEquality: function () {
        return function (i1, i2) { return i1 === i2; };
    },
};
exports.Comparator = {
    /**
     * Returns a Comparator that compares the given values with the < and > operators, returns
     * -1 if i1 less that i2, +1 if i1 is greater, and 0 if they are equal.
     */
    default: function () {
        return function (i1, i2) {
            if (i1 < i2) {
                return -1;
            }
            else if (i1 > i2) {
                return 1;
            }
            else {
                return 0;
            }
        };
    },
};
