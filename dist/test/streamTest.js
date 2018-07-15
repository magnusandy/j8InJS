"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("../stream");
describe('Stream tests', function () {
    describe('Stream should work', function () {
        var arraySource = [1, 2, 3];
        var s = stream_1.stream(arraySource);
        var transformer = function (n) { console.log(n); return "numbe: " + n; };
        s.map(transformer);
        console.log('here');
        //s.forEach((v: any) => console.log(v))
    });
});
