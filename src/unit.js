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
    
    var Geo     = window.Geo,
        Sprite  = Tilekit.Sprite;

    var round   = Math.round,
        roundTo = Math.roundTo,
        abs     = Math.abs,
        PI      = Math.PI,

        findDistance = Geo.findDistance,
        findPoint    = Geo.findPoint,
        isWithinCone = Geo.isWithinCone,
        requestAnimationFrame = window.requestAnimationFrame;

    var Unit = Tilekit.Unit = Tilekit.Entity.extend({

        defaults: {
            animation: "stand",
            speed: 1,
            face: 270,
            hearing: 64,
            vision: 96,
            visionCone: 30,
            path: [],
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
            
            this.sprite = new Sprite(options.image, {
                width: size * 2,
                height: size * 2,
                target: this.ctx,
                padding: size / 2
            });

            grid.on('refresh', this.draw.bind(this), this);
            
            this.on('draw', function() {
                self.renderLayers(self.ctx);
            });

            this.on("change:animation", function(next, prev) {

                if (prev === next) {
                    self.sprite.iterations = 0;
                    return;
                }
                
                var animation = self.animations[next];

                if (animation) {
                    self.sprite.iterations = 0;
                    self.sprite.base_offset.x = animation.offset.x || 0;
                    self.sprite.base_offset.y = animation.offset.y || 0;
                    self.sprite.shift = animation.shift || self.sprite.width;
                    self.sprite.setFrames(animation.frames || 1);
                    self.sprite.setDuration(animation.duration || 1);
                }

            });

            // Attributes
            // -------------------------------------------------- //

            this.attributes = Tilekit.extend({}, this.defaults, {
                name: name,
                created_at: Date.now()
            }, this.attributes, options);

            this.layers = Tilekit.extend({}, this.layers);

            this.setFace(this.get("face"));
            

            // Animations
            // -------------------------------------------------- //

            this.animations = {

                stand: {
                    offset: {
                        x: 0,
                        y: 0
                    }
                },

                walk: {
                    frames: 2,
                    duration: 220,
                    offset: {
                        x: size * 2,
                        y: size * 2
                    },
                    shift: size * 2
                },

                attack: {
                    frames: 3,
                    duration: 200,
                    offset: {
                        x: 194,
                        y: size * 2
                    },
                    shift: size * 2,
                    iterations: 1
                },

                spell: {
                    frames: 3,
                    duration: 400,
                    offset: {
                        x: 450,
                        y: size * 2
                    },
                    shift: size * 2,
                    iterations: 1
                }

            };

        }

    });

    // Getters and Setters
    // -------------------------------------------------- //

    Unit.methods({
        getTileFront: function(offset) {
            return findPoint(this.tile, offset || 1, this.get("face"));
        },
        getTileBack: function(offset) {
            return findPoint(this.tile, offset || 1, -this.get("face"));
        },
        setFace: function(direction) {

            var face = direction.isUnit ? abs(direction.get("face") - 180) : direction,
                size = this.grid.get('size');

            // What direction are we dealing with?
            switch(direction) {
            case 90  : this.sprite.setOffset(undefined, size * 4); break;
            case 270 : this.sprite.setOffset(undefined, 0); break;
            case 0   : this.sprite.setOffset(undefined, size * 6); break;
            case 180 : this.sprite.setOffset(undefined, size * 2); break;
            }

            this.set("face", face);

            return this;
        }
    });


    // Utilities
    // -------------------------------------------------- //

    Unit.methods({
        toJSON: function() {
            return Tilekit.extend({}, this.attributes, this.tile());
        },
        remove: function() {
            this.grid.removeListener("refresh", this.draw);
        }
    });

    // Actions
    // -------------------------------------------------- //

    Unit.methods({
        attack: function() {
            this.halt();
            this.set("animation", "attack");
            this.emit("attack", this.getTileFront());
        },
        spell: function() {
            this.halt();
            this.set("animation", "spell");
            this.emit("spell", this.tile());
        }
    });

    // Rendering Methods
    // -------------------------------------------------- //

    Unit.methods({
        draw: function() {

            var pos  = this.get("position"),
                anim = this.animations[this.get("animation")];

            if (anim.iterations !== 0 && this.sprite.iterations >= anim.iterations) {
                this.set("animation", "stand");
            }

            this.sprite.animate();
            this.sprite.setPosition(pos.x, pos.y).draw();

            this.emit("draw");
        }
    });

    // Movement
    // -------------------------------------------------- //

    Unit.methods({

        halt: function(trigger) {

            var size = this.grid.get('size'),
                pos  = this.get('position'),
                tile = this.tile();

            this.set({
                moving: false,
                position: {
                    x: roundTo(pos.x, size),
                    y: roundTo(pos.y, size)
                },
                path: [],
                animation: "stand"
            });

            if (trigger) {
                this.grid.emit("tile:" + tile.x + "," + tile.y);
                this.grid.emit("tile:*," + tile.y);
                this.grid.emit("tile:" + tile.x + ",*");
            }

        },

        move: function move (direction, pan, callback) {
       
            this.set("moving", true);

            callback = callback || function(){};
            
            // At the very least, get the character facing in the intended direction
            this.setFace(direction);

            var grid  = this.grid,
                self  = this,
                
                size  = grid.get('size'),
                speed = this.get("speed"),
                pos   = this.get("position"),
            
                delta = findPoint({ x: 0, y: 0 }, 1, -direction),
                goal  = findPoint(pos, size, -direction);

            this.set("animation", "walk");
            
            // Hit detection
            if (this.detectHit(delta.x * size, delta.y * size) ) {
                return this.halt(true);
            }
            
            function animate() {
            
                var shift = round(grid.shift);

                pos.x += delta.x * shift * speed;
                pos.y += delta.y * shift * speed;

                // Do we pan the screen with this character?
                if (pan) {
                    grid.panTo(self.tile());
                }

                if ( pos.x === goal.x && pos.y === goal.y ) {
                    self.halt(true);
                    return callback.apply(self, [Date.now()]);
                }

                return requestAnimationFrame(animate);

            }

            animate();

            return this;

        },

        setPath: function fn(destination, options) {
     
            // We use this function to make sure we are always
            // moving in the correct direction
            var audit = fn.__audit = Date.now();
            
            options = options || {};

            var self = this,
                tile = this.tile(),
                path;

            if ( this.is("moving") ) {
                this.halt();
            }

            if (destination.isUnit) {
                destination = destination.tile;
            }

            tile = {
                x : round(tile.x),
                y : round(tile.y)
            };

            path = this.set(
                "path", this.grid.plotCourse(tile, destination, this.scene.units)
            );
            
            function traceSteps() {
                if ( path.length && audit === fn.__audit) {
                    self.move(path.shift(), options.pan, traceSteps);
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