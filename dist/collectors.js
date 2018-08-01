"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Collector = /** @class */ (function () {
    function Collector(supp, accu, comb, fini) {
        var _this = this;
        this.supplier = function () { return _this.supp; };
        this.accumulator = function () { return _this.accu; };
        this.combiner = function () { return _this.comb; };
        this.finisher = function () { return _this.fini; };
        this.supp = supp;
        this.accu = accu;
        this.comb = comb;
        this.fini = fini;
    }
    Collector.of = function (supplier, accumulator, combiner, finisher) {
        return new Collector(supplier, accumulator, combiner, finisher);
    };
    return Collector;
}());
exports.Collector = Collector;
;
var Collectors = /** @class */ (function () {
    function Collectors() {
    }
    Collectors.toList = function () {
        var supplier = function () { return []; };
        var accumulator = function (list, item) { return list.push(item); };
        var combiner = function (list1, list2) { return list1.concat(list2); };
        var finisher = function (list) { return list; };
        return Collector.of(supplier, accumulator, combiner, finisher);
    };
    Collectors.toArray = function () {
        return Collectors.toList();
    };
    return Collectors;
}());
exports.default = Collectors;
