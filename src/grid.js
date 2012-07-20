// The Grid
//
// EVENTS:
// "ready" - Initial ready state after tilemap is been processed
// "draw" - Emits on redraw
// "portal" = Emits whenever a tile with a portal is triggered
// -------------------------------------------------- //

(function(window, TK) {

    "use strict";

    var Sprite  = TK.Sprite,
        Tile    = TK.Tile,
        Entity  = TK.Entity;

    var Geo     = window.Geo,
        aStar   = window.aStar,
        floor   = Math.floor,
        floorTo = Math.floorTo,
        ceil    = Math.ceil,
        round   = Math.round,
        roundTo = Math.roundTo,
        min     = Math.min,
        max     = Math.max;

    var Grid = TK.Grid = Entity.extend({
        
        attributes:{
            encoding: 24,
            resize: true,
            paused: false,
            scroll: {
                x: 0,
                y: 0
            },
            size: 32,
            tileset: []
        },

        scale: 1,

        initialize: function(canvas, tilemap, options) {

            var self = this;

            options = options || {};

            // Attributes
            // -------------------------------------------------- //

            this.attributes = TK.extend({}, this.attributes, {
                tileset    : tilemap && tilemap.tileset || []
            }, options, {
                created_at : Date.now()
            });
            
            // Let's super bulletproof our target canvas
            // -------------------------------------------------- //
            
            if (typeof canvas === 'string'){
                
                var sel = document.querySelector(canvas);
                
                if (!sel) {
                    throw new Error("Please provide either a canvas or query selector for this Grid to target");
                }
                
                if (sel instanceof window.HTMLCanvasElement) {
                    this.canvas = sel;
                } else {
                    this.canvas = document.createElement("canvas");
                    sel.appendChild(this.canvas);
                } 

            } else if (canvas instanceof window.HTMLCanvasElement) {
                this.canvas = canvas;
            } else {
                this.canvas = document.createElement("canvas");
            }
            
            this.ctx = this.canvas.getContext('2d');
            
            // Event Handling
            // -------------------------------------------------- //
            
            this.on('ready', function() {
                
                var resize = this.get("resize"),
                    start  = this.get("start_location"),
                    self = this;
                
                window.addEventListener("resize", function() {
                    self.fillspace();
                });

                self.fillspace();

                if (start) {
                    self.panTo(options.start_location);
                }

                window.onblur = function() {
                    self.pause();
                };

                self.begin();

            });

            function mouseEmit(e) {
                
                var size   = self.get("size"),
                    center = self.findCenter();
                
                e.tile = self.getTileAt(e.offsetX, e.offsetY);
                e.position = {
                    x: (e.offsetX * size) + center.x,
                    y: (e.offsetY * size) + center.y
                };

                self.set("mouse", e);
                self.emit(e.type, e);
                
            }
            
            // Events
            // -------------------------------------------------- //
            
            if (this.canvas.parentNode) { 
             
                this.canvas.parentNode.oncontextmenu = function() {
                    return false;
                };

            }

            this.canvas.addEventListener("click", mouseEmit);
            this.canvas.addEventListener("mousemove", mouseEmit);
            this.canvas.addEventListener("mousedown", mouseEmit);
            this.canvas.addEventListener("mouseup", mouseEmit);
            this.canvas.addEventListener("mousewheel", mouseEmit);


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

            if (tilemap) {
                this.generateTilemap(tilemap.data);
            }

        }

    });

    Grid.prototype.zoom = function(scale) {
        this.scale = max(0.5, min(4, this.scale * scale) );
    };


    // Utilities
    // -------------------------------------------------- //

    Grid.methods({

        toJSON: function() {
            return TK.extend(this.attributes,{
                name    : this.name,
                data    : this.encode(),
                start_x : this.start_location.x,
                start_y : this.start_location.y
            });
        },

        encode: function encode(array) {

            array = array || this.tilemap;

            var self = this,
                output = "",
                encoding = this.get("encoding"),
                a,
                i = 0,
                len = array.length;

            while (i < len) {

                a = array[i];

                if (a.isArray) {

                    if (a[0].isArray && i !== 0) {
                        output += "." + self.encode(a);
                    } else {
                        output += "\n" + self.encode(a);
                    }

                } else {
                    output += a < encoding ? "0" + a.toString(encoding) : a.toString(encoding);
                }

                i++;
            }

            return output;

        },

        isBlocking: function(tile) {
            
            var y = round(tile.y),
                x = round(tile.x);
            
            return this.tilemap[y][x].isBlocking();

        }

    });

    // Game loop methods
    // -------------------------------------------------- //

    Grid.methods({

        begin: function gameLoop() {
            
            if (this.attributes.paused) {
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
            
            if (this.get("paused")) {
                return;
            }
            
            this.set("paused", true);

            var ctx = this.ctx,
                canvas = this.canvas;
            
            TK.Rectangle(ctx, 0, 0, document.width, document.height, { fill: "rgba(0,0,0,0.6)" });

            TK.Text(ctx, "PAUSED", canvas.width / 2, canvas.height / 2 + 1, { align: "center", color: "#000" });
            TK.Text(ctx, "PAUSED", canvas.width / 2, canvas.height / 2,     { align: 'center', color: "#fff" });

        },

        play: function () {
            this.set("paused", false);
            this.begin();
        },

        toggle: function() {
            if ( this.get("paused") ){
                this.play();
            } else {
                this.pause();
            }
        }

    });


    // Calculations
    // -------------------------------------------------- //

    Grid.methods({

        generateTilemap: function(data) {

            var self = this,
                size = this.get("size"),
                tileset = this.get("tileset"),
                type,
                x, y ,z, 
                layer, segment, 
                height, row, depth;

            this.tileSprite = new Sprite(tileset, {
                width: size,
                height: size, 
                target: this.stagingCtx
            });

            // Finally, we need some calculations to help the tileengine paint the map
            var sampleTileSet = new window.Image();
            sampleTileSet.src = tileset;

            // For interpretation, we need to know how deep the tileset runs
            // before moving to the next line
            sampleTileSet.onload = function() {

                self.tilesetDepth = sampleTileSet.width / size;
                self.tilemap = [];
                
                var map	= data.trim().split("."),
                    offset = self.findCenter(),
                    encoding = self.get("encoding");
                
                // For every layer...

                for (z = 0; map[z]; z++) {

                    for (y = 0, layer = map[z].trim().split("\n"); layer[y]; y++ ) {

                        self.tilemap[y] = self.tilemap[y] || [];

                        for (x = 0, row = [], segment = layer[y].trim(); segment[x]; x += 2) {

                            // Add the value
                            type = parseInt(segment.slice(x, x + 2), encoding);
                            offset = self.calculateTileOffset(type);
                            
                            var tile = self.tilemap[y][x / 2] = self.tilemap[y][x / 2] || new Tile({
                                grid: self,
                                x: x / 2,
                                y: y,
                                width: size,
                                height: size,
                                layers: [0,0,0],

                                sprite: new Sprite(tileset, {
                                    width: size,
                                    height: size, 
                                    target: self.baseCtx,
                                    position: {
                                        x: size * x / 2,
                                        y: size * y
                                    },
                                    offset: offset
                                })
                            });
                            
                            tile.layers[z] = type;

                        }

                    }

                }
                
                // Render output
                // -------------------------------------------------- //

                for (y = 0, height = self.tilemap.length; y < height; y++) {
                    for (x = 0, row = self.tilemap[y], depth = row.length; x < depth; x++) {
                        self.tilemap[y][x].draw();
                    }
                }

                self.emit("ready");

            };

        }

    });

    // Calculations
    // -------------------------------------------------- //

    // Returns the tileX, tileY of the center of the map
    Grid.methods({

        findCenter: function() {

            var size   = this.get("size") / 2,
                scroll = this.get('scroll'),
                canvas = this.canvas;
            
            return {
                x : (canvas.width / this.scale / 2) - size - (scroll.x * 2),
                y : (canvas.height / this.scale / 2) - size - (scroll.y * 2) 
            };

        },

        getTileAt: function(x, y) {

            var size   = this.get('size'),
                center = this.findCenter();

            x = this.canvas.width - (this.canvas.width - x) - center.x;
            y = this.canvas.height - (this.canvas.height - y) - center.y;

            return {
                x: floorTo(x, size) / size,
                y: floorTo(y, size) / size
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
        }

    });
    
    
    // Rendering
    // -------------------------------------------------- //

    Grid.methods({

        fillspace: function() {

            var size = this.get('size');

            this.canvas.width  = roundTo(window.innerWidth, size);
            this.canvas.height = roundTo(window.innerHeight, size);

            return this;
        },

        // Replace a specific tile
        replaceTile: function(x, y, layer, slot) {

            var size = this.get("size"),
                tile;

            // Handle missing rows
            if (!this.tilemap[y]) {
                this.tilemap[y] = [];
            }

            if (!this.tilemap[y][x]) {
                this.tilemap[y][x] = new Tile(x, y, size, size);
            }

            tile = this.tilemap[y][x];

            tile.layers[layer] = slot;

            this.drawTile(tile);
            
            return this;
        },

        // Wipes the board clean
        // Mostly, this is used to take care of transparency rendering

        clear: function() {
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
            this.stagingCtx.clearRect(0,0, this.staging.width, this.staging.height);
        },

        panTo: function(coords) {

            var size = this.get('size') / 2;

            this.set("scroll", {
                x: round(coords.x * size),
                y: round(coords.y * size)
            });

            return this;
        },

        drawTile: function drawTile(tile, layerOffset) {

            var size    = this.get('size'),
                center  = this.findCenter(),
                current = layerOffset || 0,
                sprite  = this.tileSprite,
                layers  = tile.layers,
                offset, value;

            sprite.setPosition(tile.x * size, tile.y * size);

            this.baseCtx.clearRect(tile.x * size, tile.y * size, size, size);

            for (var c = 0, len = layers.length; c < len; c++) {
                offset = this.calculateTileOffset(layers[c]);
                sprite.setOffset(offset.x, offset.y);
                sprite.draw(this.baseCtx);
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

            this.emit("refresh");

            // Draw Output
            // -------------------------------------------------- //

            ctx.scale(this.scale, this.scale);

            ctx.drawImage(this.staging, center.x, center.y);
            ctx.drawImage(this.overlay, center.x, center.y);

            // Draw Layers
            this.renderLayers(ctx);

            ctx.scale(1 / this.scale, 1 / this.scale);

            return true;

        }

    });

    // Pathfinding
    // -------------------------------------------------- //

    Grid.methods({

        plotCourse: function(start, end, additional) {

            var original = {},
                tilemap  = this.tilemap;

            for ( var a in (additional || {}) ) {
                if (additional.hasOwnProperty(a)) {

                    var t = additional[a].tile(),
                        focus = {
                            x: round(t.x),
                            y: round(t.y)
                        };
                    
                    original[a] = tilemap[focus.y][focus.x].layers[1];
                    tilemap[focus.y][focus.x].layers[1] = 1;

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

                    var s = additional[b].tile(),
                        undo = {
                            x: round(s.x),
                            y: round(s.y)
                        };
                    
                    tilemap[undo.y][undo.x].layers[1] = original[b];

                }

            }

            return points;

        }

    });

}(window, window.Tilekit));