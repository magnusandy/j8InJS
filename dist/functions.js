"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiPredicate = {
    /**
     * function that takes two values of the same type, and returns true if
     * i1 === i2
     */
    defaultEquality: function () {
        return function (i1, i2) { return i1 === i2; };
    },
};
exports.Comparator = {
    /**
     * Returns a function that compares the given values with the < and > operators, returns
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
