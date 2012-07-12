// Scene.js
// 
//= require tilekit/text
//= require tilekit/grid
// -------------------------------------------------- //

(function(Tilekit) {
    
    var Character = Tilekit.Character,
        TextBox = window.Textbox;
    
    var Scene = Tilekit.Scene = window.klass(function(options) {

        options = options || {};
        
        $.extend(this, {
            units: []
        }, options);

        this.grid = options.grid;

        if (this.units.length) {
            this.add(this.units);
        }

    });

    // Add a player to the map
    Scene.prototype.add = function(options) {

        var slot = 0, c;

        // Handle multiple entries
        // -------------------------------------------------- //

        if ($.isArray(options)) {

            while (options[slot]) {

                c = options[slot];
                
                c.tile = c.tile || {
                    x: c.x || 0, 
                    y: c.y || 0
                };

                this.add(c);
                slot++;
            }

            return;
        }

        // Handle single entries
        // -------------------------------------------------- //
        
        options = $.extend({}, {
            image: "/assets/players/default.png",
            tile: {
                x: options.x || 0,
                y: options.y || 0
            }
        }, options);
        
        c = this.units[options.name] = new Character(options.name, this, options);

        return c;

    };

    // Remove players from map
    Scene.prototype.remove = function(name) {

        if (!this.units[name]) {
            return;
        }

        this.units[name].remove();

        delete this.units[name];
    };

    // Messaging
    // -------------------------------------------------- //

    Scene.prototype.message = function(header, message, callback) {
        
        var grid = this.grid;

        callback = callback || function(){};
        
        // Okay, now generate the new message
        this.grid.addLayer("message", function(ctx, date) {
            
            var text = new TextBox({
                header: header,
                subheader: new Array(header.length + 3).join("-"),
                body: message,
                context: grid.c
            });

            text.draw.apply(text);
        });

        $(window).one("keydown", function remove(e) {
            grid.removeLayer("message");
            callback(e);
            return false;
        });        

    };


    // Querying
    // -------------------------------------------------- //

    Scene.prototype.find = function(condition) {
        
        var result;

        for (var u in this.units) {
            if (condition(this.units[u])) {
                return result;
            }
        }

        return false;

    };

    // Find a character at a specific tile
    Scene.prototype.findAt = function(tile, callback) {

        var tile2;

        for (var c in this.units) {
            
            tile2 = this.units[c].tile;

            if (tile.x === tile2.x && tile.y === tile2.y) {
                
                if (callback) {
                    callback(this.units[c]);
                } else {
                    return this.units[c];
                }
            }

        }

    };


    // JSON Operations
    // -------------------------------------------------- //

    // GET
    Scene.prototype.fetch = function(url, callback) {
        
        $.get(url, function(data) {
            callback(data);
        });

        return {
            then: function(fn) {
                callback = fn;
            }
        };

    };

}(window.Tilekit));