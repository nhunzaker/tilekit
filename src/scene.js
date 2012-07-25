// Scene.js
// -------------------------------------------------- //

(function(Tilekit) {

    var Geo = window.Geo,
        findDistance = Geo.findDistance;
    
    var Unit = Tilekit.Unit,
        TextBox = window.Textbox;
    
    var Scene = Tilekit.Scene = Tilekit.Entity.extend({
        
        initialize: function(options) {

            options = options || {};
            
            Tilekit.extend(this, {
                units: []
            }, options);

            if (this.units.length) {
                this.add(this.units);
            }
        }

    });

    // Add a player to the map
    Scene.prototype.add = function(options) {

        var slot = 0, c;
        
        // Handle multiple entries
        // -------------------------------------------------- //

        if (options.isArray) {

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

        if (options instanceof Tilekit.Unit) {
            c = this.units[options.get("name")] = options;
            this.emit("add", c);
            return c;
        }

        // Handle single entries
        // -------------------------------------------------- //
        
        options = Tilekit.extend({}, {
            image: Tilekit.defaults.character_sprite,
            tile: {
                x: options.x || 0,
                y: options.y || 0
            }
        }, options);
        
        c = this.units[options.name] = new Unit(options.name, this, options);
        
        this.emit("add", c);
        
        return c;

    };

    // Remove players from map
    Scene.prototype.remove = function(name) {

        if (name instanceof Tilekit.Unit) {
            name = name.get("name");
        }

        if (!this.units[name]) {
            return;
        }

        this.units[name].remove();

        delete this.units[name];
    };


    // Querying
    // -------------------------------------------------- //

    Scene.prototype.find = function(condition) {
        
        for (var u in this.units) {
            if (this.units.hasOwnProperty(u) && condition(this.units[u])) { 
                return this.units[u];
            }
        }

        return false;

    };

    // Find a character at a specific tile
    Scene.prototype.findAt = function(position, range) {

        var area = range || this.grid.get("size"),
            target,
            distance;

        for (var c in this.units) {
            
            if (!this.units.hasOwnProperty(c) ) {
                continue;
            }
            
            target = this.units[c].get("position");
            
            distance = findDistance(position, target);

            if (distance < area) {
                return this.units[c];
            }

        }

    };

    Scene.prototype.each = function(fn) {
        var i = 0;

        for (var c in this.units) {
            
            if (!this.units.hasOwnProperty(c) ) {
                continue;
            }
            
            fn.apply(this.units[c], [i]);
            i++;
        }

    };

}(window.Tilekit));