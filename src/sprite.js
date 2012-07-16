// A generic sprite class
// -------------------------------------------------- //

(function(Tilekit) {

    var Sprite = function(src, options) {
        
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

            duration: 1,
            spritesheet: null,
            shadow: null,
            shown: true,
            zoomLevel: 1,
            target: null,
            timer: new Tilekit.Timer()
            
        }, options);            
        
        this.shift = this.width;

        this.setSpritesheet(src);
        this.created_at = this.timer.getMilliseconds();

        var d = new Date();

        if (this.duration > 0 && this.frames > 0) {
            this.ftime = d.getTime() + (this.duration / this.frames);
        } else {
            this.ftime = 0;
        }

    };

    Sprite.prototype.setSpritesheet = function(src) {
        
        // Don't duplicate work, adding needless http requests for
        // the same image

        if (this.spritesheet instanceof Image && this.spritesheet.src === src) {
            return this;
        }
        
        if (src instanceof Image) {
            this.spritesheet = src;
        } else {
            this.spritesheet = new Image();
            this.spritesheet.src = src;
        }

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

            this.offset.x = this.base_offset.x + (this.shift * this.currentFrame);

            if (this.currentFrame === (this.frames - 1)) {
                this.currentFrame = 0;
                this.iterations++;
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
    
    Sprite.prototype.drawShadow = function(c, degrees) {

            if (this.shadow === null) { // Shadow not created yet

                var sCnv = document.createElement("canvas");
                var sCtx = sCnv.getContext("2d");

                sCnv.width = this.width;
                sCnv.height = this.height;

                sCtx.drawImage(this.spritesheet,
                               this.offset.x,
                               this.offset.y,
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

            c.drawImage(this.shadow.canvas, this.pos.x, this.pos.y - sh, sw, sh * 2);
            c.restore();

    };
    
    Sprite.prototype.draw = function(c, drawShadow, degrees) {

        c = c || this.target;

        if (!this.shown) {
            return false; 
        }
        
        if (drawShadow) {
            this.drawShadow(c, drawShadow, degrees);
        }       

        c.drawImage(this.spritesheet,
                    this.offset.x,
                    this.offset.y,
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