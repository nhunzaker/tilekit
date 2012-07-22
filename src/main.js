// The Tilekit Namespace
// -------------------------------------------------- //

;(function() {

    var breaker       = {},
        slice         = Array.prototype.slice,
        nativeForEach = Array.prototype.forEach;
    
    var Tilekit = {

        debug: false,
        
        defaults: {
            font             : "bold 18pt Helvetica",
            character_sprite : "character.png",
            emote_sprite     : "emote.png",

            explosion_sprite : "explosion.png"
        },

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