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