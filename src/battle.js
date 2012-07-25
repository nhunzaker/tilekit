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
        
        damage: function(origin, actor, callback) {
            
            var target, health;

            target = origin instanceof TK.Unit ? origin : this.scene.findAt(origin);
            
            if (target && target !== actor) {
                health = target.get("health");
                target.set("health", health - actor.get("strength"));
                
                if (callback) {
                    callback();
                }

            }
            
        },

        heal: function(origin, actor) {

            var target, health;
            target = origin instanceof TK.Unit ? origin : this.scene.findAt(origin);

            if (target) {
                health = target.get("health");
                target.set("health", health + actor.get("intelligence"));
            }
            
        }

    });


}(window.Tilekit));