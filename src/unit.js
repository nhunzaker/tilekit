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