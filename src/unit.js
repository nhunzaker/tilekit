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

(function(TK) {

    "use strict";

    var Geo     = window.Geo,
        Sprite  = TK.Sprite;

    var round   = Math.round,
        roundTo = Math.roundTo,
        abs     = Math.abs,
        PI      = Math.PI,
        min     = Math.min,
        max     = Math.max,

        findDistance = Geo.findDistance,
        findPoint    = Geo.findPoint,
        isWithinCone = Geo.isWithinCone,
        requestAnimationFrame = window.requestAnimationFrame;

    var Unit = TK.Unit = TK.Entity.extend();

    Unit.methods({
        
        actions : {},
        layers  : {},
        senses  : {},
        
        animations: {

            stand: {
                slot: 0
            },

            move: {
                frames: 3,
                duration: 220,
                slot: 0
            },

            death: {
                frames: 5,
                duration: 500,
                slot: 65
            }

        },

        defaults : {

            animation: "stand",

            face: 270,
            path: [],
            position: { x: 0, y: 0 },

            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            
            weight: 100,

            // Senses
            // ------------------------- //

            hearing: 64,
            vision: 96,
            visionCone: 30,

            // Speed
            // ------------------------- //

            attack_speed: 1,
            movement_speed: 2,

            // Attributes
            // ------------------------- //

            strength: 1,
            dexterity: 1,
            intelligence: 1,
            vitality: 1

        },

        isUnit : true,

        tile : function() {

            var size = this.grid.get("size"),
                pos  = this.get("position");

            return {
                x: pos.x / size,
                y: pos.y / size
            };

        },

        initialize: function(name, scene, options) {

            var grid = this.grid = scene.grid,
                size = grid.get('size'),
                self = this;

            this.scene  = scene;
            this.canvas = document.createElement("canvas");
            this.ctx    = this.canvas.getContext('2d');

            this.canvas.width = 2000;
            this.canvas.height = 2000;

            options = options || {};

            if (options.tile) {

                this.set("position", {
                    x: options.tile.x * size,
                    y: options.tile.y * size
                });

            }

            this.sprite = new Sprite(options.image, {
                width: size * 3,
                height: size * 3,
                target: this.ctx,
                padding: size
            });

            if (grid) {
                this.__boundDraw = this.draw.bind(this);
                grid.on('refresh', this.__boundDraw, this);
            }
            
            this.on("draw", function() { 
                this.renderLayers(this.ctx); 
            });
            
            this.on("change:animation", function(next, prev) {

                if (prev === next) {
                    this.sprite.iterations = 0;
                    return;
                }
                
                var animation = this.animations[next];
                
                if (!animation) {
                    console.warn("Animation \"%s\" for unit \"%s\" does not exist", next, this.get("name"));
                    this.attributes.animation = "stand";
                    return;
                }
                
                if (animation) {
                    this.sprite.keyframe = animation.keyframe || 1;
                    this.sprite.iterations = 0;
                    this.sprite.base_offset.x = 0;
                    this.sprite.base_offset.y = animation.slot * size;
                    this.sprite.setFrames(animation.frames || 1);
                    this.sprite.setDuration(animation.duration || 1);
                }
            });


            // Attributes
            // -------------------------------------------------- //

            this.attributes = TK.extend({}, this.defaults, {
                name: name,
                created_at: Date.now()
            }, this.attributes, options);

            this.layers = TK.extend({}, this.layers);


            // Add actions
            // -------------------------------------------------- //

            this.actions = TK.extend({}, this.actions);

            for (var action in this.actions) {
                this.addAction(action, this.actions[action]);
            }

        }

    });

    // Getters and Setters
    // -------------------------------------------------- //

    Unit.methods({
        getTileFront: function(offset) {
            return findPoint(this.tile(), offset || 1, -this.get("face"));
        },
        getPositionFront: function(offset) {
            var size = this.grid.get("size");
            return findPoint(this.get("position"), size * (offset || 1), -this.get("face"));
        },
        getTileBack: function(offset) {
            return findPoint(this.tile(), offset || 1, this.get("face"));
        },
        getPositionBack: function(offset) {
            var size = this.grid.get("size");
            return findPoint(this.get("position"), size * (offset || 1), this.get("face"));
        },
        setFace: function(direction) {
            
            var face = direction.isUnit ? abs(direction.get("face") - 180) : direction,
                size = this.grid.get('size');

            // What direction are we dealing with?
            switch(direction) {
            case 90  : this.sprite.setOffset(undefined, size * 6); break;
            case 270 : this.sprite.setOffset(undefined, 0); break;
            case 0   : this.sprite.setOffset(undefined, size * 9); break;
            case 180 : this.sprite.setOffset(undefined, size * 3); break;
            }

            this.set("face", face);

            return this;
        }
    });


    // Utilities
    // -------------------------------------------------- //

    Unit.methods({
        toJSON: function() {
            return TK.extend({}, this.attributes, this.tile());
        },
        remove: function() {
            this.grid.removeListener("refresh", this.__boundDraw);
        }
    });


    // Actions
    // -------------------------------------------------- //

    Unit.methods({
        addAction : function(name, options) {

            var self = this,
                animation  = options.animation  || "stand",
                behavior   = options.behavior   || function() {},
                keyframe   = options.keyframe   || false,
                onKeyframe = options.onKeyframe || function() {},
                halt       = options.halt === undefined ? true : options.halt,
                before     = options.before || function() {};

            // Check for presence of animation
            self.animations[animation] = self.animations[animation] || {
                duration   : options.duration || 0,
                frames     : options.frames || 1,
                iterations : options.iterations || 0,
                keyframe   : options.keyframe,
                slot       : options.slot || 0
            };
            
            self.actions = self.actions || {};

            self.actions[name] = function fn() {

                var args = arguments;

                if (self.acting || before.call(self) === false) {
                    return false;
                }

                self.acting = true;
                
                if (halt === true) {
                    self.halt();
                }
                
                self.set("animation", animation);

                behavior.apply(self, args);
                
                if (keyframe) {
                    self.sprite.once("keyframe", function() {
                        onKeyframe.apply(self, args);
                    });
                }
                
                self.sprite.once("iteration", function() {
                    self.acting = false;
                });
                
                return self;
            };

        },

        death : function() {

            var self = this,
                pos  = this.get("position"),
                size = this.grid.get("size");
            
            this.layers = [];

            this.set("animation", "death");
            
            this.sprite.on('iteration', function() {
                TK.emit("death", self);
                self.emit("death");
                self.scene.remove(self);
            });

        }
    });


    // Rendering Methods
    // -------------------------------------------------- //

    Unit.methods({
        clear: function() {
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        },
        draw: function() {
            
            var pos  = this.get("position"),
                anim = this.animations[this.get("animation")];
            
            this.clear();

            if (anim.iterations !== 0 && this.sprite.iterations >= anim.iterations) {
                this.set("animation", "stand");
            }

            this.sprite.animate();
            this.sprite.setPosition(pos.x, pos.y).draw();

            this.emit("draw");

            this.grid.stagingCtx.drawImage(this.canvas, 0,0);
            
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
                /*
                 position: {
                 x: (pos.x, size),
                 y: roundTo(pos.y, size)
                 },
                 */
                path: []
            });

            if (!this.acting) {
                this.set("animation", "stand");
            }

            if (trigger) {
                this.grid.emit("tile:" + tile.x + "," + tile.y);
                this.grid.emit("tile:*," + tile.y);
                this.grid.emit("tile:" + tile.x + ",*");
            }

        },
        move: function move (direction, options, callback) {

            if (this.get("moving")) {
                return false;
            }

            if (typeof direction === 'object') {
                options = arguments[0];
                callback = arguments[1];
                direction = this.get("face");
            }

            if (callback && typeof callback !== 'function') {
                console.error("Unit#move callback argument must be a function. Was actually: ", callback);
                callback = function() { return false; };
            }
            
            callback = callback || function(){};
            
            var grid   = this.grid,
                self   = this,
                
                size   = grid.get('size'),
                speed  = options.speed || this.get("movement_speed"),
                amount = options.amount || 1,
                pos    = this.get("position"),
                
                delta  = findPoint({ x: 0, y: 0 }, 1, -direction),

                limitX = delta.x > 0 ? Math.min : Math.max,
                limitY = delta.y > 0 ? Math.min : Math.max,

                goal   = findPoint(pos, size * amount, -direction);

            this.set("moving", true);

            if (!this.acting) {
                this.set("animation", "move");
            }
            
            // Hit detection
            if (this.detectHit(delta.x * size * amount, delta.y * size * amount) ) {
                return this.halt(true);
            }

            function animate() {
                
                var shift = round(TK.shift) || 1;

                pos.x = limitX(goal.x, pos.x + delta.x * shift * speed);
                pos.y = limitY(goal.y, pos.y + delta.y * shift * speed);
                
                // Do we pan the screen with this character?
                if (options.pan) {
                    grid.panTo(self.tile());
                }

                if ( pos.x === goal.x && pos.y === goal.y ) {
                    self.halt();
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
                    var angle = path.shift();
                    self.setFace(angle);
                    self.move(angle, options, traceSteps);
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
                    
                    // Senses
                    // -------------------------------------------------- //

                    for (var s in other.senses) { if (other.senses.hasOwnProperty(s)) {

                        if ( other.senses[s].apply(other, [start, end, prox]) ) {

                            other.emit(s, this);
                            other.emit(s + ":" + name, this);
                        }

                    }}

                    
                    // Collision
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

    // Spell casting
    // -------------------------------------------------- //

    Unit.methods({
        addSpell: function(name, cost, fn) {
            var spells = this.get("spells");
            spells[name] = fn;
        },
        removeSpell: function(name) {
            delete this.get("spells")[name];
        }
    });

}(window.TK));