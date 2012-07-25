// The Tilekit Namespace
// -------------------------------------------------- //

;(function() {
    
    var breaker       = {},
        slice         = Array.prototype.slice,
        nativeForEach = Array.prototype.forEach,
        TK, Tilekit;
    
    Tilekit = TK = {

        colorWheel: ["red", "crimson", "crimson", "orange", "orange", 
                     "gold", "yellow", "lime", "lime", "lime", "lime", "lime"],
        
        debug: false,
        
        defaults: {
            font             : "bold 18pt Helvetica",
            character_sprite : "character.png",
            glyph_sprite     : "emote.png",

            explosion_sprite : "explosion.png"
        },
        

        // -------------------------------------------------- //
        // Gameloop
        // -------------------------------------------------- //
        fps   : 30,
        shift : 1,
        begin : function gameLoop() {
            
            if (Tilekit.paused) {
                return;
            }

            window.requestAnimationFrame(Tilekit.begin);

            gameLoop.then = gameLoop.then || Date.now();
            gameLoop.now = Date.now();

            Tilekit.fps = 1000 / (gameLoop.now - gameLoop.then);
            Tilekit.shift = 60 / (1000 / (gameLoop.now - gameLoop.then));

            gameLoop.then = gameLoop.now;
                                  
            Tilekit.emit("refresh");

        },
        pause: function () {
            
            if (TK.paused) {
                return;
            }
            
            TK.paused = true;

            /*
            var ctx = this.ctx,
                canvas = this.canvas;
            
            TK.Rectangle(ctx, 0, 0, window.innerWidth, window.innerWidth,   { fill: "rgba(0,0,0,0.6)" });

            TK.Text(ctx, "PAUSED", canvas.width / 2, canvas.height / 2 + 1, { align: "center", color: "#000" });
            TK.Text(ctx, "PAUSED", canvas.width / 2, canvas.height / 2,     { align: 'center', color: "#fff" });
             */
        },

        play: function () {
            TK.paused = false;
            TK.begin();
        },

        toggle: function() {
           if (TK.paused) {
               TK.play();
           } else {
               TK.pause();
           }
        },

        // -------------------------------------------------- //
        // -------------------------------------------------- //
        
        each:  function(obj, iterator, context) {

            if (obj == null) {
                return;
            }

            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {

                for (var i = 0, l = obj.length; i < l; i++) {
                    if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                        return;
                    }
                }
                
            } else {

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) {
                            return;
                        }
                    }
                }

            }

        },

        extend: function(obj) {
            Tilekit.each(slice.call(arguments, 1), function(source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            });
            return obj;
        },

       generateGUID: function guidGenerator() {
            var S4 = function() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }

       
    };
    
    Tilekit.extend(Tilekit, new window.EventEmitter2());

    window.TK = window.Tilekit = Tilekit;

}());