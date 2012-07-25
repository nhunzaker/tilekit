(function(TK) {
    
    TK.glyphs = {

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

    };

    
    TK.Glyph = function(unit) {

        var center = unit.grid.findCenter(),
            size   = unit.grid.get('size');

        var sprite = new TK.Sprite(TK.defaults.glyph_sprite, {
            width: size,
            height: size
        });

        sprite.on("ready", function() {

            unit.addLayer("emote", function() {

                var emote = this.emote_sprite,
                    pos   = this.get("position"),
                    size  = this.grid.get('size'),
                    which = TK.glyphs[this.get("emote")] || false;
                
                if (!which) {
                    return false;
                }
                
                emote.setPosition(pos.x, pos.y - (size + (Math.cos( Date.now() / 500) * 2) ) );
                emote.setOffset( which[0], which[1] );
                emote.draw(this.ctx);

            }, unit);

        });

    };

}(window.Tilekit));