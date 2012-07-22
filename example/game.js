// Initialize
// -------------------------------------------------- //

(function(TK) {
    
    var map = window.map;

    //TK.debug = true;

    TK.defaults.character_sprite = "images/character.png";
    TK.defaults.emote_sprite     = "images/emote.png";
    TK.defaults.explosion_sprite = "images/explosion.png";

    var scene = window.scene = new TK.Scene({

        grid: new TK.Grid('#target ', map, { 
            start_location: { 
                x: map.start_x, 
                y: map.start_y 
            },
            portals : map.portals
        })
    });
    
    TK.each(map.units, function(unit) {
        unit.image = "images/moblin.png";
    });
    
    scene.add(map.units);

    var battle = new TK.Battle(scene);

    var nate = scene.add({
        image: "images/link.png",
        name: "Nate",
        tile: {
            x: map.start_x, 
            y: map.start_y
        }
    });

    var jim = scene.add({
        name: "Jim",
        tile: {
            x: map.start_x - 4, 
            y: map.start_y
        }
    });
    
    jim.on("see:nate", function() {
        jim.set("emote", "see");
    });

    jim.on("change:health", function(next) {
        if (next < 40) {
            jim.castSpell("heal", jim);
        }
    });


    // Spells
    // -------------------------------------------------- //

    function heal(target) {
        battle.heal(target || this, this);
    };

    nate.addSpell("heal", heal);
    jim.addSpell("heal", heal);

    nate.set({
        "strength" : 10,
        "intelligence": 10
    });

    jim.set({
        "strength" : 10,
        "intelligence": 40
    });
    
    TK.on("death", function(character) {
        TK.Explosion(scene.grid, character.get("position") );
    });

    scene.grid.on("mousedown", function(e) {
        TK.Explosion(scene.grid, e.position);
    });

    // Events
    // -------------------------------------------------- //

    scene.grid.on("mousedown", function(e) {
       nate.setPath(e.tile, { pan: true });
    });

    scene.grid.on("mousewheel", function(e) {
        scene.grid.zoom(e.wheelDeltaY > 0 ? 0.95 : 1.05);
    });

    Mousetrap
        .bind("up", function() {
            nate.move(90, { pan : true });
        }, "keydown");

    Mousetrap  
        .bind("down", function() {
            nate.move(270, { pan : true });
        }, "keydown");

    Mousetrap            
        .bind("left", function() {
            nate.move(180, { pan : true });
        }, "keydown");
    
    Mousetrap
        .bind("right", function() {
            nate.move(0, { pan : true });
        }, "keydown");

    Mousetrap
        .bind("space", function() {
            nate.attack();
        });

    Mousetrap
        .bind("shift+space", function() {
            nate.castSpell("heal", nate);
        });

    Mousetrap
        .bind("shift+p", function() {
            nate.shoot();
        });

    Mousetrap
        .bind("escape", function() {
            scene.grid.toggle();
        });
    
    TK.on("damage", function(tile, attacker) {
        battle.damage(tile, attacker);
    });
    
}(window.TK));