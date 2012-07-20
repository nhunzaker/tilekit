// Battle Mechanics
// -------------------------------------------------- //

(function(TK) {

    // Combat
    // -------------------------------------------------- //
    
    var Battle = TK.Battle = window.klass({
        
        initialize: function(scene) {
            
            if (!scene) { 
                throw new Error("Tilekit::Battle#initialize requires a scene");
            }

            this.scene = scene;
        },
        
        damage: function(tile, amount) {
            
            var target, health;
            target = tile instanceof TK.Unit ? tile : this.scene.findAt(tile);
            
            if (target) {
                health = target.get("health");
                target.set("health", health - amount);
            }
            
        },

        heal: function(tile, amount) {

            var target, health;
            target = tile instanceof TK.Unit ? tile : this.scene.findAt(tile);
            
            if (target) {
                health = target.get("health");
                target.set("health", health + amount);
            }
        }

    });


}(window.Tilekit));