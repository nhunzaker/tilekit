// Helpers
// 
// Common functions and absolutely essential polyfills
// -------------------------------------------------- //

Array.prototype.isArray = true;

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

// Rounds to a given number
Math.roundTo = function roundTo (num, to) {

    if (num < to / 2) {
        return 0;
    }

    var amount = to * Math.round(num / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Floors to a given number
Math.floorTo = function (num, to) {

    if (num < to) {
        return 0;
    }

    var amount = to * Math.floor(num / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Ceils to a given number
Math.ceilTo = function roundTo (num, to) {

    if (num < to) {
        return to;
    }

    var amount = to * Math.ceil(num / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
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