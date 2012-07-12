// Helpers
//= require ./geo
// -------------------------------------------------- //

Array.prototype.isArray = true;

// Rounds to a given number
Number.prototype.roundTo = function roundTo (to) {

    if (this < to / 2) {
        return 0;
    }

    var amount = to * Math.round(this / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Floors to a given number
Number.prototype.floorTo = function (to) {

    if (this < to) {
        return 0;
    }

    var amount = to * Math.floor(this / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Ceils to a given number
Number.prototype.ceilTo = function roundTo (to) {

    if (this < to) {
        return to;
    }

    var amount = to * Math.ceil(this / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Given a number, iterate over the absolute value
Number.prototype.times = function(cb, scope) {

    if (this === 0) {
        return;
    }
    
    var i = ~~Math.abs(this),
        n = 0;
    
    do { 
        cb.apply(scope || this, [n]); 
        i--;
        n++;
    } while(i > 0);

};


// Request Animation Frame Polyfill
// -------------------------------------------------- //

if (typeof window !== 'undefined') {
    
    window.requestAnimationFrame = (function(){
        
        return window.requestAnimationFrame    || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };

    }());
}


// Bind Polyfill
// -------------------------------------------------- //

if (!Function.prototype.bind) {

    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            FNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof FNOP ? this : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };

}


// Math Helpers
// -------------------------------------------------- //

Math.percentChance = function(val, callback) {
    if (Math.random() < val / 100) {
        callback();
    }
};

Math.parseDelta = function(number, total) {

    if (/\%/.test(number)) {
        return total * (parseFloat(number, 10) / 100);
    }

    if (/\+|\-/.test(number)) {
        return total + parseFloat(number, 10);
    }
    
    return number;
};


// Formatting helpers
// -------------------------------------------------- //

var Format = window.Format = {};

Format.align = function(orientation, segment, total, offset) {

    if (/bottom|right/ig.test(orientation)) {
        return (total - offset) - segment;
    } else {
        return offset;
    }
    
};