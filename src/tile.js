// A Class For All Tiles
// -------------------------------------------------- //

(function(Tilekit) {

    var round = Math.round;

    Tilekit.Tile = window.klass({

        x: 0, y: 0,
        width: 32, height: 32,
        layers: [],

        initialize: function(options) {
            $.extend(this, options);
        },

        isTraversable: function() {

            if (this.__blockOnce) {
                this.__blockOnce = undefined;
                return false;
            }

            return this.layers[1] === undefined || this.layers[1] === 0;

        },

        isBlocking: function() {
            return this.layers[1] > 0;
        }

    });


    // Calculations
    // -------------------------------------------------- //

    Tilekit.Tile.methods({

        roundedTile: function() {
            return {
                x : round(this.tile.x),
                y : round(this.tile.y)
            };
        }

    });

}(window.Tilekit));