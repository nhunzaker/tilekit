// A Class For All Tiles
// -------------------------------------------------- //

(function(Tilekit) {

    var round = Math.round;
    
    var Tile = Tilekit.Entity.extend({

        defaults: {
            x: 0, 
            y: 0,
            width: 32, 
            height: 32
        },
            
        layers: [],

        initialize: function(options) {
            Tilekit.extend(this, this.defaults, options);
        },

        isTraversable: function() {
            return this.layers[1] === undefined || this.layers[1] === 0;
        },

        isBlocking: function() {
            return this.layers[1] > 0;
        },

        roundedTile: function() {
            return {
                x : round(this.x),
                y : round(this.y)
            };
        },

        draw: function(c) {

            var grid = this.grid,
                sprite = this.sprite,
                layers = this.layers,
                pos = this.sprite.position;

            for (var i = 0, len = layers.length; i < len; i++) {

                var type = layers[i],
                    offset = grid.calculateTileOffset(type);

                sprite.setOffset(offset.x, offset.y);
                sprite.draw(c);

                if (i > 1 && type > 0) {
                    sprite.draw(grid.overlayCtx);
                } else {
                    sprite.draw();
                }
            }

            if (Tilekit.debug) {
                this.debug();
            }
            
        }
        
    });

    Tilekit.Tile = Tile;

}(window.Tilekit));