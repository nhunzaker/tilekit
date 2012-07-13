// Helpers
// 
// Common functions and absolutely essential polyfills
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

// Request Animation Frame Polyfill (absolutely essential)
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



// Math Helpers
// -------------------------------------------------- //

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