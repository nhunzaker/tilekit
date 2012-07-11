// Primitives.js
// A collection of shape helpers for canvas

// The Rectangle
// -------------------------------------------------- //

var Rectangle = function(canvas, options) {

    var self = this,
        te = options.tileEngine;

    $.extend(this, {
        x      : 0,
        y      : 0,
        stroke : null,
        fill   : null,
        width  : 100,
        height : 100
    }, options);
    
    this.canvas = canvas;
    this.c = this.canvas.getContext('2d');

    if (te) {

        te.on("refresh", function() {
            window.requestAnimationFrame(function() {
                self.draw();
            });
        });

    }

    // Render the rectangle
    this.draw = function() {

        var posX = this.x,
            posY = this.y;
        
        if (this.tile) {
            
            var te     = this.tileEngine,
                canvas = this.canvas,
                tile   = te.tile,
                size   = te.get("size"),
                scroll = te.get("scroll"),
                deltaX = (canvas.width / 2) - (size / 2),
                deltaY = (canvas.height / 2) - (size / 2);
            
            posX = this.tile.x * size;
            posY = this.tile.y * size;
            
            posX += (deltaX) - (scroll.x * 2);
            posY += (deltaY) - (scroll.y * 2);
        }

        // If we have a fill color, create a solid color rectangle
        if (this.fill) {
            this.c.fillStyle = this.fill;
            this.c.fillRect(posX, posY, this.width, this.height);
        }
        
        // If a stroke color has been specified, create a stroke
        // rectangle on top of the fill rectangle
        if (this.stroke) {
            this.c.strokeStyle = this.stroke;
            this.c.strokeRect(posX, posY, this.width, this.height);
        }

    };
    
    return this;
};
