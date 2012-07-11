/*
 * Tilekit
 *
 * Nate Hunzaker <nate.hunzaker@gmail.com>
 * http://natehunzaker.com
 *
 */


// The Tilekit Namespace
// -------------------------------------------------- //

window.Tilekit = {
    debug: false
};

$.extend(window.Tilekit.prototype, new window.EventEmitter2());

window.TK = window.Tilekit;
// Helpers
//= require ./geo
// -------------------------------------------------- //

Array.prototype.isArray = true;

Function.prototype.pulse = function(interval, args, scope) {
    var self = this;
    this.__interval = setInterval(function() {
        self.apply(scope || self, args);
    }, interval || 1000);
};

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

// Simple "trim" Polyfill
String.prototype.trim = String.prototype.trim || function() {
    return this.replace(/^\s+|\s+$/g,"");
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

(function() {
    var Format = window.Format = {};

    Format.align = function(orientation, segment, total, offset) {

        if (/bottom|right/ig.test(orientation)) {
            return (total - offset) - segment;
        } else {
            return offset;
        }
        
    };

    if (typeof module !== 'undefined') {
        global.Format = Format;
    } else {
        window.Format = Format;
    }

}());
// Geometry Helpers
//-------------------------------------------------- //

(function() {

    var Geo = {};

    Geo.toRadians = function(degrees) {
        return degrees * (Math.PI/180);
    };

    Geo.findAngle = function(point1, point2) {

        if (point1.isArray) {
            point1 = { x: point1[0], y: point1[1] };
        }

        if (point2.isArray) {
            point2 = { x: point2[0], y: point2[1] };
        }

        var angle = Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI);

        return angle < 0 ? angle + 360: angle;
    };

    Geo.findPoint = function(point, distance, angle, round) {

        round = round || 100;

        var rads = Geo.toRadians(angle);

        return {
            x: point.x + distance * ~~(Math.cos(rads) * round) / round,
            y: point.y + distance * ~~(Math.sin(rads) * round) / round
        };

    };

    Geo.findDistance = function(point1, point2) {

        var distX    = Math.pow(point2.x - point1.x, 2),
            distY    = Math.pow(point2.y - point1.y, 2),
            distance = Math.sqrt(distX + distY);

        return distance;

    };

    Geo.isWithinCone = function(center, point, radius, angle, cone) {

        var trajectory = Geo.findAngle(point, center),
            distance   = Geo.findDistance(center, point);

        if (distance >= radius) {
            return false;
        }

        // 1. The angle from the center through point should be between the cone
        if (angle - cone >= trajectory || trajectory >= angle + cone) {
            return false;
        }

        // 2. The distance from centerX,centerY to X,Y should be less then the Radius
        return true;

    };

    if (typeof module !== 'undefined') {
        global.Geo = Geo;
    } else {
        window.Geo = Geo;
    }

}());
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

// A simple text module

var TextBox = function(options) {

    options = options || {};

    this.header     = options.header || "???";
    this.subheader  = options.subheader || false;
    this.body       = options.body || "";
    this.context    = options.context;
    this.lineheight = options.lineheight || 25;
};

TextBox.prototype.setFont = function(color, font) {
    var ctx = this.context;

    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.font = font;
};

TextBox.prototype.drawWindow = function() {

    var ctx = this.context;

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2),
                 document.width,
                 (document.height * 0.2));

    ctx.fillStyle = "#333";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2) - 2,
                 document.width, 2);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2) + 1,
                 document.width,
                 1);

};

TextBox.prototype.drawText = function(text, x, y) {

    this.context.fillText(text,
                          (document.width * 0.1) + (x || 0),
                          (document.height - (document.height * 0.2)) + (y || 0)
                         );
};

TextBox.prototype.drawEllipsis = function() {

    var ctx = this.context,
        width = document.width * 0.93,
        height = document.height - (document.height * 0.05);

    ctx.fillStyle = "#333";
    ctx.fillRect(width,
                 height,
                 5, 5);
    ctx.fillRect(width + 10,
                 height,
                 5, 5);
    ctx.fillRect(width + 20,
                 height,
                 5, 5);
};

TextBox.prototype.draw = function() {

    var ctx = this.context,
        self = this;

    this.drawWindow();


    // The Message header
    // -------------------------------------------------- //

    this.setFont("black", "bold 14pt monospace");
    this.drawText(this.header, 0, 15);

    if (this.subheader) {
        this.setFont("#666", "normal 10pt monospace");
        this.drawText(this.subheader, 0, 40);
    }

    // The Message Contents
    // -------------------------------------------------- //

    this.setFont("#333", "normal 14pt monospace");

    var pixelLength = 0,
        words = this.body.split(" "),
        line = 70, // 70 for the base pixel offset
        i = 0, word = "", measure = 0;

    while(words[i]) {
        word = words[i];
        measure = ctx.measureText(word + " ").width;

        if (pixelLength + measure > document.width * 0.85) {
            pixelLength = 0;
            line += this.lineheight;
        }

        if (line > (document.height * 0.2) - (document.height * 0.05)) {
            return;
        }

        self.drawText(word, pixelLength, line);

        pixelLength += ctx.measureText(word + " ").width;

        i++;
    }

    this.drawEllipsis();

    return;

};
/**
 * A simple timer
 */

var Timer = function() {
    this.date = new Date();
};

Timer.prototype.update = function() {
    var d = new Date();
    this.date = d;
};

Timer.prototype.getMilliseconds = function() {
    return this.date.getTime();
};

Timer.prototype.getSeconds = function() {
    return Math.round(this.date.getTime() / 1000);
};
// A generic sprite class
// -------------------------------------------------- //

(function(Tilekit) {

    var Sprite = Tilekit.Sprite = function(src, width, height, offsetX, offsetY, frames, duration, target) {

        this.spritesheet = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.width = width;
        this.height = height;
        this.frames = 1;
        this.currentFrame = 0;
        this.duration = 1;
        this.posX = 0;
        this.posY = 0;
        this.shown = true;
        this.zoomLevel = 1;
        this.shadow = null;

        this.setSpritesheet(src);
        this.setOffset(offsetX, offsetY);
        this.setFrames(frames);
        this.setDuration(duration);

        this.target = target;

        this.timer = new window.Timer();
        this.created_at = Date.now();

        var d = new Date();

        if (this.duration > 0 && this.frames > 0) {
            this.ftime = d.getTime() + (this.duration / this.frames);
        } else {
            this.ftime = 0;
        }

    };

    Sprite.prototype.setSpritesheet = function(src) {
        if (src instanceof Image) {
            this.spritesheet = src;
        } else {
            this.spritesheet = new Image();
            this.spritesheet.src = src;
        }

        return this;
    };

    Sprite.prototype.setPosition = function(x, y) {
        this.posX = x;
        this.posY = y;

        return this;
    };

    Sprite.prototype.setOffset = function(x, y) {
        this.offsetX = x;
        this.offsetY = y;

        return this;
    };

    Sprite.prototype.setFrames = function(fcount) {
        this.currentFrame = 0;
        this.frames = fcount;

        return this;
    };

    Sprite.prototype.setDuration = function(duration) {
        this.duration = duration;

        return this;
    };

    Sprite.prototype.nextFrame = function() {

        if (this.duration > 0) {

            var d = new Date();

            if (this.duration > 0 && this.frames > 0) {
                this.ftime = d.getTime() + (this.duration / this.frames);
            } else {
                this.ftime = 0;
            }

            this.offsetX = this.width * this.currentFrame;

            if (this.currentFrame === (this.frames - 1)) {
                this.currentFrame = 0;
            } else {
                this.currentFrame++;
            }

        }

        return this;
    };

    Sprite.prototype.animate = function(t) {

        // Default to the sprites native timer
        t = t || this.timer;

        t.update();

        if (t.getMilliseconds() > this.ftime) {
            this.nextFrame ();
        }

        return this;
    };


    Sprite.prototype.draw = function(c, drawShadow, degrees) {

        c = c || this.target;

        if (this.shown) {

            if (drawShadow !== undefined && drawShadow) {

                if (this.shadow === null) { // Shadow not created yet

                    var sCnv = document.createElement("canvas");
                    var sCtx = sCnv.getContext("2d");

                    sCnv.width = this.width;
                    sCnv.height = this.height;

                    sCtx.drawImage(this.spritesheet,
                                   this.offsetX,
                                   this.offsetY,
                                   this.width,
                                   this.height,
                                   0,
                                   0,
                                   this.width * this.zoomLevel,
                                   this.height * this.zoomLevel);

                    var idata = sCtx.getImageData(0, 0, sCnv.width, sCnv.height);

                    for (var i = 0, len = idata.data.length; i < len; i += 4) {
                        idata.data[i] = 0; // R
                        idata.data[i + 1] = 0; // G
                        idata.data[i + 2] = 0; // B
                    }

                    sCtx.clearRect(0, 0, sCnv.width, sCnv.height);
                    sCtx.putImageData(idata, 0, 0);

                    this.shadow = sCtx;
                }

                c.save();
                c.globalAlpha = 0.1;

                var sw = this.width * this.zoomLevel;
                var sh = this.height * this.zoomLevel;

                c.drawImage(this.shadow.canvas, this.posX, this.posY - sh, sw, sh * 2);
                c.restore();
            }

            c.drawImage(this.spritesheet,
                        this.offsetX,
                        this.offsetY,
                        this.width,
                        this.height,
                        this.posX,
                        this.posY,
                        this.width * this.zoomLevel,
                        this.height * this.zoomLevel);
        }

        return this;
    };

}(window.Tilekit));
// Entity
//
//= require libs/klass
//
// -------------------------------------------------- //

(function(TK) {

    "use strict";

    TK.Entity = window.klass({

        attributes: {},
        layers: {},

        initialize: function(options) {
            this.attributes = $.extend(true, this.attributes, options);
        },

        // Getters and Setters
        // -------------------------------------------------- //

        get: function(key) {
            return this.attributes[key];
        },

        set: function(key, value) {

            var previous = this.attributes[key];

            this.attributes[key] = value;
            this.emit(["change", "change:" + value], value, previous);

            return this.attributes[key];
        },

        // Layers
        // -------------------------------------------------- //

        addLayer: function(namespace, layer, scope) {

            if (!namespace) {
                throw new Error("Entity#addLayer - Layer requires a namespace");
            }

            if (typeof namespace === 'object') {

                for (var n in namespace) {

                    if (namespace.hasOwnProperty(n)) {
                        this.addLayer(n, namespace[n], scope);
                    }

                }

                return this;

            }

            this.layers[namespace] = layer.bind(scope || this);

            return layer;
        },

        removeLayer: function(name) {
            if (this.layers[name]) {
                delete this.layers[name];
            }
        },

        renderLayers: function(ctx) {

            var layers = this.layers;

            for (var layer in layers) {

                if (layers.hasOwnProperty(layer) && typeof layers[layer] === 'function') {
                    layers[layer].apply(this, [ctx || this.ctx, Date()]);
                }

            }

        }

    });

    $.extend(TK.Entity.prototype, window.EventEmitter2.prototype);

}(window.Tilekit));
// A Class For All Tiles
// -------------------------------------------------- //

(function(Tilekit) {

    var round = Math.round;

    Tilekit.Tile = window.klass({

        x: 0, y: 0,
        width: 32, height: 32,
        layers: [],

        initialize: function(options) {
            $.extend(this, options);
        },

        isTraversable: function() {

            if (this.__blockOnce) {
                this.__blockOnce = undefined;
                return false;
            }

            return this.layers[1] === undefined || this.layers[1] === 0;

        },

        isBlocking: function() {
            return this.layers[1] > 0;
        }

    });


    // Calculations
    // -------------------------------------------------- //

    Tilekit.Tile.methods({

        roundedTile: function() {
            return {
                x : round(this.tile.x),
                y : round(this.tile.y)
            };
        }

    });

}(window.Tilekit));
// The Grid
//
// EVENTS:
// "ready" - Initial ready state after tilemap is been processed
// "draw" - Emits on redraw
// "portal" = Emits whenever a tile with a portal is triggered
// -------------------------------------------------- //

(function(window, TK) {

    "use strict";

    var Sprite = TK.Sprite,
        Tile   = TK.Tile,
        Entity = TK.Entity;

    var Geo   = window.Geo,
        aStar = window.aStar,
        floor = Math.floor,
        ceil  = Math.ceil,
        round = Math.round;

    var Grid = TK.Grid = Entity.extend({

        attributes:{
            paused: false,
            scroll: {
                x: 0,
                y: 0
            },
            size: 32
        },

        initialize: function(canvas, tilemap, options) {

            var self = this;

            options = options || {};

            // Attributes
            // -------------------------------------------------- //

            this.attributes = $.extend(true, this.attributes, options, {
                created_at: Date.now()
            });

            this.canvas = document.getElementById(canvas);
            this.ctx = this.canvas.getContext('2d');

            this.tileset = tilemap.tileset;
            this.encoding = options.encoding || 24;

            // Additional Onion Skin Graphics
            // -------------------------------------------------- //

            if (TK.debug) {
                this.addLayer("debug", function(ctx) {
                    var center = this.findCenter();
                    ctx.drawImage(this.debug, center.x, center.y);
                });
            }


            // Event Handling
            // -------------------------------------------------- //

            this.on('ready', function() {

                if (options.autoResize !== false) {
                    $(window).resize(function() {
                        self.fillspace();
                    }).trigger("resize");
                }

                if (self.start_location) {
                    self.panTo(options.start_location);
                }

                self.begin();

            });

            $(this.canvas).on("click mousemove mousedown mouseup",function(e) {

                var size = self.get("size"),
                    center = self.findCenter();

                e.tile = self.getTileAt(e.offsetX, e.offsetY);
                e.position = {
                    x: (e.tile.x * size) + center.x,
                    y: (e.tile.y * size) + center.y
                };

                self.emit(e.type, e);

            });


            // Portals
            // -------------------------------------------------- //

            this.start_location = options.start_location;
            this.portals = options.portals || [];

            var emitPortal = function() {
                self.emit("portal", data);
            };

            for (var p = 0, len = this.portals.length; p < len; p++) {
                var data = this.portals[p];
                this.on("tile:" + [data.x , data.y].join(","), emitPortal);
            }


            // Prerendering is super efficient, let's capitalize on it
            // -------------------------------------------------- //

            var base = this.base = document.createElement("canvas");
            this.baseCtx = base.getContext('2d');

            var staging = this.staging = document.createElement("canvas");
            this.stagingCtx = staging.getContext('2d');

            var debug = this.debug = document.createElement("canvas");
            this.debugCtx = debug.getContext('2d');

            var overlay = this.overlay = document.createElement("canvas");
            this.overlayCtx = overlay.getContext('2d');

            base.height = debug.height = staging.height = overlay.height = options.canvasHeight || 2000;
            base.width  = debug.width  = staging.width  = overlay.width  = options.canvasWidth || 2000;


            // Render the initial map state
            // -------------------------------------------------- //

            this.generateTilemap(tilemap.data);
        }

    });

    Grid.prototype.zoom = function(scale) {
        this.scale = scale / 100;
        this.c.scale(this.scale, this.scale);
    };


    // Utilities
    // -------------------------------------------------- //

    Grid.methods({

        toJSON: function() {
            return {
                name    : this.name,
                tileset : this.tileset,
                data    : this.encode(),
                start_x : this.start_location.x,
                start_y : this.start_location.y
            };
        },

        encode: function encode(array) {

            var self = this,
                output = "",
                a;

            array = array || this.tilemap;

            for (var i = 0, len = array.length; i < len; i++) {

                a = array[i];

                if (a.isArray) {

                    if (a[0].isArray && i !== 0) {
                        output += "." + self.encode(a);
                    } else {
                        output += "\n" + self.encode(a);
                    }

                } else {
                    output += a < self.encoding ? "0" + a.toString(self.encoding) : a.toString(self.encoding);
                }

            }

            return output.trim();

        },

        isBlocking: function(tile) {
            return this.tilemap[tile.y][tile.x].isBlocking();
        }

    });

    // Manage Refreshing
    // -------------------------------------------------- //

    Grid.methods({

        begin: function gameLoop() {

            if (this.paused) {
                return false;
            }

            window.requestAnimationFrame(this.begin.bind(this));

            gameLoop.then = gameLoop.then || this.created_at;
            gameLoop.now = Date.now();

            this.set("fps", 1000 / (gameLoop.now - gameLoop.then));
            this.shift = 60 / (1000 / (gameLoop.now - gameLoop.then));

            gameLoop.then = gameLoop.now;

            return this.draw();

        },

        pause: function () {
            this.paused = true;
        },

        play: function () {
            this.paused = false;
            this.begin();
        },

        save: function() {
            this.baseCtx.save();
            this.debugCtx.save();
            this.overlayCtx.save();
        }

    });


    // Calculations
    // -------------------------------------------------- //

    Grid.methods({

        generateTilemap: function(data) {

            var self = this,
                size = this.get("size"),
                type;

            this.tileSprite = new Sprite(this.tileset, size, size, 0, 0, this.stagingCtx);

            // Finally, we need some calculations to help the tileengine paint the map
            var sampleTileSet = new window.Image();
            sampleTileSet.src = this.tileset;

            // For interpretation, we need to know how deep the tileset runs
            // before moving to the next line
            sampleTileSet.onload = function() {

                self.tilesetDepth = sampleTileSet.width / size;
                self.tilemap = [];

                var map	= data.trim().split("."),
                    offset = self.findCenter();

                // For every layer...

                for (var z = 0; map[z]; z++) {

                    for (var y = 0, layer = map[z].trim().split("\n"); layer[y]; y++ ) {

                        self.tilemap[y] = self.tilemap[y] || [];

                        for (var x = 0, row = [], segment = layer[y].trim(); segment[x]; x += 2) {

                            // Add the value
                            type = parseInt(segment.slice(x, x + 2), self.encoding);

                            var tile = self.tilemap[y][x / 2] = self.tilemap[y][x / 2] || new Tile({
                                x: x / 2,
                                y: y,
                                width: size,
                                height: size,
                                layers: [0,0,0]
                            });

                            self.tilemap[y][x / 2].layers[z] = type;

                            // Draw it on the map
                            offset = self.calculateTileOffset(type);

                            var posX = size * x / 2,
                                posY = size * y;

                            self.tileSprite.setOffset(offset.x, offset.y);
                            self.tileSprite.setPosition(posX, posY);
                            self.tileSprite.draw(self.baseCtx);

                            // If we're dealing with an overlay, let's add it to that
                            // layer
                            if (z > 1 && type > 0) {
                                self.tileSprite.draw(self.overlayCtx);
                            }

                            // Helper for showing blocking layer
                            // -------------------------------------------------- //

                            if (TK.debug && z === 1 && type > 0) {
                                self.debugCtx.fillStyle = "rgba(200, 100, 0, 0.4)";
                                self.debugCtx.fillRect(posX, posY, size, size);
                            }


                            // Helper for showing overlay layer
                            // -------------------------------------------------- //

                            if (TK.debug && z > 1 && type > 0) {
                                self.debugCtx.fillStyle = "rgba(250, 256, 0, 0.4)";
                                self.debugCtx.fillRect(posX, posY, size, size);
                            }

                        }

                    }

                }

                self.save();
                self.drawPortals();
                self.emit("ready");

            };

        }

    });

    // Calculations
    // -------------------------------------------------- //

    // Returns the tileX, tileY of the center of the map
    Grid.methods({

        findCenter: function() {

            var size   = this.get("size"),
                scroll = this.get('scroll');

            return {
                x : (this.canvas.width / 2) - (size / 2) - (scroll.x * 2),
                y : (this.canvas.height / 2) - (size / 2) - (scroll.y * 2)
            };

        },

        // Find a tile given x and y coordinates
        // returns an object with the tile row/col values
        translateCoordinates: function(x,y) {

            var size = this.get("size");

            // Get the appropriate tile
            var col = Math.ceil(x / size),
                row = Math.ceil(y / size);

            return {
                col : col,
                row : row
            };
        },

        getTileAt: function(x, y) {

            var size = this.get('size'),
                scroll = this.get('scroll');

            x = this.canvas.width - (this.canvas.width - x);
            y = this.canvas.height - (this.canvas.height - y);

            x -= (this.canvas.width / 2) - (size / 2) - scroll.x * 2;
            y -= (this.canvas.height / 2) - (size / 2) - scroll.y * 2;

            return {
                x: x.floorTo(size) / size,
                y: y.floorTo(size) / size
            };
        },

        // Finds the offset (x, y) of a tile given it's slot value
        calculateTileOffset: function(slot) {

            // The slot of the tile
            var size = this.get('size'),
                depth = this.tilesetDepth,
                offset = {
                    x: 0,
                    y: floor(slot / depth) * size
                };

            // Is the slot not within the first row?
            offset.x = (slot > depth - 1 ) ? (slot % depth) : slot;
            offset.x *= size;

            return offset;
        },

        calculatePixelOffset: function(tile) {

            var center = this.findCenter(),
                size   = this.get('size');

            return {
                x : (tile.x * size) + center.x,
                y : (tile.y * size) + center.y
            };

        }

    });


    // Rendering
    // -------------------------------------------------- //

    Grid.methods({

        fillspace: function() {

            var size = this.get('size');

            // We round to the width/height to make rendering more efficient
            // and significantly clearer
            this.canvas.width = document.width.roundTo(size);
            this.canvas.height = document.height.roundTo(size);

            return this;
        },

        // Replace a specific tile
        replaceTile: function(x, y, layer, slot) {

            var size = this.get("size");

            // Handle missing rows
            if (!this.tilemap[y]) {
                this.tilemap[y] = [];
                this.tilemap[y][x] = new Tile(x, y, size, size);
            }

            this.tilemap[y][x][layer] = slot;

            this.drawTile({ x: x, y: y});

        },

        // Wipes the board clean
        // Mostly, this is used to take care of transparency rendering
        clear: function() {
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
            this.stagingCtx.clearRect(0,0, this.staging.width, this.staging.height);
        },

        panTo: function(coords) {

            if (!coords) {

                if (TK.debug) {
                    console.error("Coordinates must be specified for panning.");
                }

                return this;

            }

            var size = this.get('size') / 2;

            this.set("scroll", {
                x: (coords.x * size),
                y: (coords.y * size)
            });

            return this;
        },

        drawTile: function drawTile(tile, layerOffset) {

            tile = tile.roundedTile();

            var te      = this,
                size    = this.get('size'),
                center  = te.findCenter(),
                current = layerOffset || 0,
                sprite  = te.tileSprite,
                layers  = this.tile.layers,
                offset, value;

            sprite.setPosition(tile.x * size, tile.y * size);

            this.baseCtx.clearRect(tile.x * size, tile.y * size, size, size);

            do {

                if (!layers[current][tile.y]) {
                    layers[current][tile.y] = [];
                }

                value = layers[current];
                offset = this.calculateTileOffset(value);
                sprite.setOffset(offset.x, offset.y);
                sprite.draw(this.baseCtx);

                current++;

            } while(layers[current]);

        },

        drawPortals: function drawPortals() {

            var ctx  = this.debugCtx,
                size = this.get('size');

            if (this.start_location) {
                ctx.strokeStyle = "rgb(255, 180, 10)";
                ctx.fillStyle = "rgba(255, 180, 10, 0.5)";
                ctx.fillRect(
                    this.start_location.x * size,
                    this.start_location.y * size,
                    size, size
                );
                ctx.strokeRect(
                    this.start_location.x * size,
                    this.start_location.y * size,
                    size, size
                );

            }

            for (var p = 0; p < this.portals.length; p++) {
                ctx.strokeStyle = "rgb(200, 20, 250)";
                ctx.fillStyle = "rgba(200, 20, 250, 0.4)";
                ctx.fillRect(
                    this.portals[p].x * size,
                    this.portals[p].y * size,
                    size, size
                );
                ctx.strokeRect(
                    this.portals[p].x * size,
                    this.portals[p].y * size,
                    size, size
                );
            }

        },

        draw: function() {

            var ctx	= this.ctx,
                center = this.findCenter(),
                layers = this.layers;

            // Clear the current state
            this.clear();

            // Draw the prerendered state
            this.stagingCtx.drawImage(this.base, 0, 0);
            this.stagingCtx.save();

            this.emit("refresh");

            // Draw Output
            // -------------------------------------------------- //
            ctx.drawImage(this.staging, center.x, center.y);
            ctx.drawImage(this.overlay, center.x, center.y);

            // Draw Layers
            this.renderLayers(ctx);

            return true;

        }

    });

    // Pathfinding
    // -------------------------------------------------- //

    Grid.methods({

        plotCourse: function(start, end, additional) {

            var original = {},
                tilemap  = this.tilemap;

            for (var a in additional) {
                if (additional.hasOwnProperty(a)) {
                    var t = additional[a].tile();
                    original[a] = tilemap[t.y][t.x].layers[1];
                    tilemap[t.y][t.x].layers[1] = 1;
                }
            }

            var results = aStar(tilemap, [start.x, start.y], [end.x, end.y]),
                points  = [];

            for (var w = 0, len = results.length, angle; w + 1 < len; w++) {

                angle = Geo.findAngle(results[w], results[w+1]);

                // TODO: Fix this disgusting patchwork
                if (angle === 90) {
                    angle = 270;
                } else if (angle === 270) {
                    angle = 90;
                }

                points.push(angle);

            }

            for (var b in additional) {
                 if (additional.hasOwnProperty(b)) {
                     var s = additional[b].tile();
                     tilemap[s.y][s.x].layers[1] = original[b];
                 }
            }

            return points;

        }

    });

}(window, window.Tilekit));
// Unit.js
//
// EVENTS:
//
// "blocked" - when movement is prohibited by terrain
// "collision" - when movement is prohibited by characters
// "vision" - when another object comes into vision
// "refresh" - when the sprite is redrawn
// "change" - when an attribute is changed
//
// -------------------------------------------------- //

(function(Tilekit) {

    "use strict";

    var round = Math.round,
        abs   = Math.abs,
        PI    = Math.PI,
        Geo   = window.Geo,
        findDistance = Geo.findDistance,
        isWithinCone = Geo.isWithinCone,
        requestAnimationFrame = window.requestAnimationFrame,
        Sprite = Tilekit.Sprite;

    var Unit = Tilekit.Unit = Tilekit.Entity.extend({

        attributes: {
            speed: 1,
            face: 270,
            hearing: 64,
            vision: 96,
            visionCone: 30,
            position: {
                x: 0,
                y: 0
            }
        },

        layers: {},

        isUnit: true,

        tile: function() {

            var size = this.grid.get("size"),
                pos  = this.get("position");

            return {
                x: pos.x / size,
                y: pos.y / size
            };

        },

        initialize: function(name, scene, options) {

            var grid = scene.grid,
                size = grid.get('size'),
                self = this;

            this.scene = scene;
            this.grid  = scene.grid;
            this.ctx   = scene.grid.stagingCtx;

            this.set("position", {
                x: options.tile.x * size,
                y: options.tile.y * size
            });

            this.sprite = new Sprite(options.image, size, size, 0, 0, 3, 200, this.ctx);

            grid.on('refresh', this.draw.bind(this), this);

            this.on('draw', function() {
                self.renderLayers(self.ctx);
            });

            // Attributes
            // -------------------------------------------------- //

            this.attributes = $.extend(true, {
                name: name,
                created_at: Date.now()
            }, this.attributes, options);

            this.layers = $.extend({}, this.layers);

            // Debug Rendering Methods
            // -------------------------------------------------- //

            if (Tilekit.debug) {

                this.addLayer({

                    renderClipping: function() {

                        var size = this.grid.get('size'),
                            pos  = this.get("position");

                        this.ctx.lineWidth = 1;
                        this.ctx.fillStyle = "rgba(50, 255, 200, 0.3)";
                        this.ctx.strokeStyle = "rgba(50, 255, 200, 0.3)";

                        this.ctx.fillRect(pos.x, pos.y, size, size);
                        this.ctx.strokeRect(pos.x, pos.y, size, size);

                    },

                    renderVision: function() {

                        var ctx    = this.ctx,
                            size   = this.grid.get('size'),
                            pos    = this.get("position"),
                            posX   = pos.x + (size / 2),
                            posY   = pos.y + (size / 2),
                            vision = this.get("vision"),
                            face   = this.get("face"),
                            cone   = this.get("visionCone");

                        if (!vision) {
                            return;
                        }

                        ctx.fillStyle = "rgba(0, 100, 200, 0.3)";
                        ctx.strokeStyle = "rgba(0, 100, 200, 0.5)";
                        ctx.lineWidth = 1;

                        ctx.beginPath();
                        ctx.moveTo(posX, posY);
                        ctx.arc(posX, posY,
                                vision,
                                Geo.toRadians(-face - cone),
                                Geo.toRadians(-face + cone),
                                false);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                    },

                    renderHearing: function(ctx) {

                        var size    = this.grid.get("size"),
                            pos     = this.get("position"),
                            hearing = this.get("hearing"),
                            posX    = pos.x,
                            posY    = pos.y + (size / 2);

                        if (!hearing) {
                            return;
                        }

                        ctx.fillStyle = "rgba(255, 150, 50, 0.4)";
                        ctx.strokeStyle = "rgba(255, 150, 50, 0.8)";
                        ctx.lineWidth = 1;

                        ctx.beginPath();
                        ctx.arc(posX, posY, hearing, 0, PI * 2);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                    }

                });
            }

        }

    });

    // Getters and Setters
    // -------------------------------------------------- //

    Unit.methods({

        getTileFront: function(offset) {
            return Geo.findPoint(this.tile, offset || 1, this.get("face"));
        },

        getTileBack: function(offset) {
            return Geo.findPoint(this.tile, offset || 1, -this.get("face"));
        },

        setFace: function(direction) {

            if (typeof direction !== 'number') {
                if (Tilekit.debug) {
                    console.error("Unit#setFace requires a numerical direction.");
                }
                return false;
            }

            var face = direction.isUnit ? abs(direction.get("face") - 180) : direction;

            // What direction are we dealing with?
            switch(direction) {
            case 90  : this.sprite.setOffset(0,100); break;
            case 270 : this.sprite.setOffset(0,0);   break;
            case 0   : this.sprite.setOffset(0,150); break;
            case 180 : this.sprite.setOffset(0,50);  break;
            }

            this.set("face", face);

            return this;
        }

    });


    // Utilities
    // -------------------------------------------------- //

    Unit.methods({

        toJSON: function() {
            return $.extend({}, this.attributes, this.tile());
        },

        remove: function() {
            this.grid.removeListener("refresh", this.draw);
        }

    });

    // Rendering Methods
    // -------------------------------------------------- //

    Unit.methods({

        draw: function() {
            var pos = this.get("position");

            this.sprite.setPosition(pos.x, pos.y).draw();
            this.emit("draw");
        }

    });

    // Movement
    // -------------------------------------------------- //

    Unit.methods({

        halt: function(trigger) {

            var size = this.grid.get('size'),
                pos  = this.get('position');

            this.moving = false;

            this.set("position", {
                x: pos.x.roundTo(size),
                y: pos.y.roundTo(size)
            });

            var tile = this.tile();
            this.sprite.currentFrame = 0;

            if (trigger) {
                this.grid.emit("tile:" + tile.x + "," + tile.y);
                this.grid.emit("tile:*," + tile.y);
                this.grid.emit("tile:" + tile.x + ",*");
            }

        },

        move: function(direction, pan, callback) {

            // Prevent any other move actions until the old one finishes
            if (this.moving) {
                return false;
            }

            this.moving = true;

            callback = callback || function(){};

            // At the very least, get the character facing in the intended direction
            this.setFace(direction);

            var grid      = this.grid,
                shift     = round(this.grid.shift),
                size      = grid.get('size'),
                speed     = this.get("speed"),
                pos       = this.get("position"),
                self      = this;

            // What direction are we dealing with?
            var delta = Geo.findPoint({ x: 0, y: 0 }, 1, -direction),
                goal  = Geo.findPoint(pos, size, -direction);

            // Hit detection
            if (this.detectHit(delta.x * size, delta.y * size) ) {
                return this.halt(true);
            }

            function animate() {

                var pos   = self.get("position");

                self.set("position", {
                    x: pos.x + delta.x * shift * speed,
                    y: pos.y + delta.y * shift * speed
                });

                // Do we pan the screen with this character?
                if (pan) {
                    grid.panTo(self.tile());
                }

                if (pos.x === goal.x && pos.y === goal.y) {
                    self.halt(true);
                    return callback.apply(self, [Date.now()]);
                }

                self.sprite.animate();
                return requestAnimationFrame(animate);
            }

            animate();

            return this;

        },

        setPath: function (destination, options) {

            options = options || {};

            var self = this,
                waypoints = [],
                grid = this.grid,
                tile = this.tile();

            if (destination.isUnit) {
                destination = destination.tile;
            }

            // If it's a tile, then let's do some calculations

            tile = {
                x : round(tile.x),
                y : round(tile.y)
            };

            waypoints = grid.plotCourse(tile, destination, this.scene.units);

            var path = this.set("path", waypoints);

            function traceSteps() {

                var move = path.shift();

                if (move !== undefined) {
                    self.move(move, options.pan, traceSteps);
                }

            }

            traceSteps();

        },

        detectHit: function(offsetX, offsetY) {

            var others  = this.scene.units,
                grid    = this.grid,
                size    = grid.get('size'),
                pos     = this.get("position"),
                tile    = this.tile(),
                name    = this.get("name").toLowerCase(),
                blocked = false;

            // Tiles in Focus
            // -------------------------------------------------- //

            var start = {
                x: pos.x + (offsetX || 0),
                y: pos.y + (offsetY || 0)
            };

            var active = {
                x: start.x / size,
                y: start.y / size
            };

            // Check for hits on the blocking layer (1 is the blocking layer)
            // -------------------------------------------------- //

            if ( grid.isBlocking(active) ) {
                this.emit("blocked", active);
                blocked = true;
            }

            // Check for other player movement
            // -------------------------------------------------- //

            for (var c in others) {

                if ( others.hasOwnProperty(c) && others[c] !== this ) {

                    var other   = others[c],
                        end     = other.get("position"),
                        prox    = findDistance(start, end) - size / 2,
                        vision  = other.get("vision") || 0,
                        cone    = other.get("visionCone") || 0,
                        hearing = other.get("hearing") || 0,
                        angle   = other.get("face");

                    // Detect characters in proximity to self
                    // -------------------------------------------------- //

                    if (isWithinCone(end, start, vision, angle, cone)) {
                        other.emit(["see", "see:" + name], this);
                    }

                    if (hearing > prox) {
                        other.emit(["hear", "hear" + name], this);
                    }

                    // Detect characters in blocking distance
                    // -------------------------------------------------- //

                    if (size > prox + size) {

                        var who = other.get("name").toLowerCase();

                        this.emit(["collision", "collision:" + who], other);
                        other.emit(["collision", "collision:" + name], this);

                        blocked = true;
                    }
                }

            }

            return blocked;
        }
    });

}(window.Tilekit));
// Character.js
//
// EVENTS:
//
// "blocked" - when movement is prohibited by terrain
// "collision" - when movement is prohibited by other units
// "see" - when another object comes into visual range
// "hear" - when another object comes into hearing range
// "refresh" - when the sprite is redrawn
// "change" - when an attribute is changed
//
// -------------------------------------------------- //

(function(Tilekit) {

    var Character = Tilekit.Character = Tilekit.Unit.extend({

        attributes: {
            comment: "",
            emote: "",
            speed: 2,
            face: 270,
            hearing: 64,
            vision: 96,
            visionCone: 30
        },

        showName: false,

        initialize: function(name, scene, options) {
            this.supr(name, scene, options);
            var size = scene.grid.get("size");
            this.emote_sprite = new Tilekit.Sprite("/assets/emotes.png", size, size, 0, 0);
        },

        layers: {

            emote: function() {

                var emote = this.emote_sprite,
                    pos   = this.get("position"),
                    size  = this.grid.get('size'),
                    which = {

                        // Emotions
                        "surprised" : [0, 0],
                        "sad"       : [32, 0],
                        "love"      : [64, 0],
                        "power"     : [96, 0],
                        "happy"     : [128, 0],
                        "disguise"  : [160, 0],

                        // Events
                        "poison"    : [0, 32],
                        "quest"     : [32, 32],
                        "idea"      : [64, 32],

                        // Sense
                        "see"       : [0, 64],
                        "hear"      : [32, 64]

                    }[this.get("emote")] || false;

                if (!which) {
                    return false;
                }

                emote.setPosition(pos.x, pos.y - (size + (Math.cos( Date.now() / 500) * 2) ) );
                emote.setOffset( which[0], which[1] );
                emote.draw(this.ctx);

            },

            renderName: function() {

                if (!this.showName) {
                    return;
                }

                var c = this.ctx,
                    name = this.get("name");

                c.font = "15px monospace";
                c.fillStyle = "#000";

                var textWidth = this.ctx.measureText(name).width;

                c.fillText(name,
                           (this.tile.x * 32) - (textWidth / 10),
                           (this.tile.y * 31)
                          );
            }

        }

    });

}(window.Tilekit));
// Scene.js
// 
//= require tilekit/text
//= require tilekit/grid
// -------------------------------------------------- //

(function(Tilekit) {
    
    var Character = Tilekit.Character,
        TextBox = window.Textbox;
    
    var Scene = Tilekit.Scene = window.klass(function(options) {

        options = options || {};
        
        $.extend(this, {
            grid: false,
            units: []
        }, options);

        this.add(options);

    });

    // Add a player to the map
    Scene.prototype.add = function(options) {

        var slot = 0, c;

        // Handle multiple entries
        // -------------------------------------------------- //

        if ($.isArray(options)) {

            while (options[slot]) {

                c = options[slot];
                
                c.tile = c.tile || {
                    x: c.x || 0, 
                    y: c.y || 0
                };

                this.add(c);
                slot++;
            }

            return;
        }

        // Handle single entries
        // -------------------------------------------------- //
        
        options = $.extend({}, {
            image: "/assets/players/default.png",
            tile: {
                x: options.x || 0,
                y: options.y || 0
            }
        }, options);
        
        c = this.units[options.name] = new Character(options.name, this, options);

        return c;

    };

    // Remove players from map
    Scene.prototype.remove = function(name) {

        if (!this.units[name]) {
            return;
        }

        this.units[name].remove();

        delete this.units[name];
    };

    // Messaging
    // -------------------------------------------------- //

    Scene.prototype.message = function(header, message, callback) {
        
        var grid = this.grid;

        callback = callback || function(){};
        
        // Okay, now generate the new message
        this.grid.addLayer("message", function(ctx, date) {
            
            var text = new TextBox({
                header: header,
                subheader: new Array(header.length + 3).join("-"),
                body: message,
                context: grid.c
            });

            text.draw.apply(text);
        });

        $(window).one("keydown", function remove(e) {
            grid.removeLayer("message");
            callback(e);
            return false;
        });        

    };


    // Querying
    // -------------------------------------------------- //

    Scene.prototype.find = function(condition) {
        
        var result;

        for (var u in this.units) {
            if (condition(this.units[u])) {
                return result;
            }
        }

        return false;

    };

    // Find a character at a specific tile
    Scene.prototype.findAt = function(tile, callback) {

        var tile2;

        for (var c in this.units) {
            
            tile2 = this.units[c].tile;

            if (tile.x === tile2.x && tile.y === tile2.y) {
                
                if (callback) {
                    callback(this.units[c]);
                } else {
                    return this.units[c];
                }
            }

        }

    };


    // JSON Operations
    // -------------------------------------------------- //

    // GET
    Scene.prototype.fetch = function(url, callback) {
        
        $.get(url, function(data) {
            callback(data);
        });

        return {
            then: function(fn) {
                callback = fn;
            }
        };

    };

}(window.Tilekit));