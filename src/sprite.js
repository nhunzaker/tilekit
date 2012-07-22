// A generic sprite class
// -------------------------------------------------- //

(function(Tilekit) {

    var Sprite = Tilekit.Entity.extend({

        initialize: function(src, options) {
            
            Tilekit.extend(this, {

                width: 0,
                height: 0,

                offset: {
                    x : 0,
                    y: 0
                },

                base_offset: {
                    x: 0,
                    y: 0
                },
                
                padding: 0,

                position: {
                    x: 0,
                    y: 0
                },
                base_position: {
                    x: 0,
                    y: 0
                },
                
                frames: 1, 
                currentFrame: 0,
                iterations: 0,
                keyframe: 1,

                duration: 1,
                spritesheet: null,
                shadow: null,
                shown: true,
                zoomLevel: 1,
                target: null,
                timer: new Tilekit.Timer()
                
            }, options);            
            
            this.setSpritesheet(src);
            this.created_at = this.timer.getMilliseconds();

            var d = new Date();

            if (this.duration > 0 && this.frames > 0) {
                this.ftime = d.getTime() + (this.duration / this.frames);
            } else {
                this.ftime = 0;
            }
        }

    });
    
    Sprite.prototype.setSpritesheet = function(src) {
        
        var self = this;
        
        // Don't duplicate work, adding needless http requests for
        // the same image

        if (this.spritesheet instanceof Image && this.spritesheet.src === src) {
            self.emit("ready");
            return this;
        }

        this.ready = false;

        if (src instanceof Image) {
            this.spritesheet = src;
        } else {
            this.spritesheet = new Image();
            this.spritesheet.src = src;
        }

        this.spritesheet.onload = function() {
            self.emit("ready");
        };

        return this;
    };

    Sprite.prototype.setPosition = function(x, y) {
        this.position.x = x;
        this.position.y = y;
        return this;
    };

    Sprite.prototype.setOffset = function(x, y) {

        if (typeof x !== 'undefined') {
            this.offset.x = x;
        }

        if (typeof y !== 'undefined') {
            this.offset.y = y;
        }

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

            this.offset.x = this.width * this.currentFrame;

            if (this.currentFrame === (this.frames - 1)) {
                this.currentFrame = 0;
                this.iterations++;
                this.emit("iteration");
            } else {
                this.currentFrame++;
            }

            if (this.currentFrame === this.keyframe) {
                this.emit("keyframe");
            }

        }

        return this;
    };

    Sprite.prototype.animate = function(t) {

        // Default to the sprites native timer
        t = t || this.timer;

        t.update();

        if (t.getMilliseconds() > this.ftime) {
            this.nextFrame();
        }

        return this;
    };
    
    Sprite.prototype.draw = function(ctx) {
        
        ctx = ctx || this.target;

        if (!this.shown) {
            return false; 
        }

        ctx.drawImage(this.spritesheet,
                      this.offset.x + this.base_offset.x,
                      this.offset.y + this.base_offset.y,
                      this.width,
                      this.height,
                      this.position.x - this.padding,
                      this.position.y - this.padding,
                      this.width * this.zoomLevel,
                      this.height * this.zoomLevel);

        return this;
    };

    Tilekit.Sprite = Sprite;

}(window.Tilekit));