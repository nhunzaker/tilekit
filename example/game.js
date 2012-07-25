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
    
    scene.on("add", function(unit) {
        InfuseDamageGraphics(unit);
    });

    scene.add(map.units);

    var battle = new TK.Battle(scene);

    var nate = new TK.Character("nate", scene, {
        image: "images/link.png",
        tile: {
            x: map.start_x, 
            y: map.start_y
        }
    });

    nate.set("strength", 10);
    nate.set("health", 40);

    scene.add(nate);

    var jim = new TK.Character("jim", scene, {
        image: "images/link.png",
        name: "Jim",
        tile: {
            x: map.start_x - 4, 
            y: map.start_y
        }
    });

    scene.add(jim);


    jim.set("potions", 10);
    
    jim.on("change:health", function(next) {
        if (next < 60) {
            jim.actions.potion();
        }
    });
    
    TK.on("damage", function(tile, attacker, callback) {
        battle.damage(tile, attacker, callback);
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
            nate.setFace(90);
            nate.move(90, { pan : true });
        }, "keydown");

    Mousetrap  
        .bind("down", function() {
            nate.setFace(270);
            nate.move(270, { pan : true });
        }, "keydown");

    Mousetrap            
        .bind("left", function() {
            nate.setFace(180);
            nate.move(180, { pan : true });
        }, "keydown");

    Mousetrap              
        .bind("right", function() {
            nate.setFace(0);
            nate.move(0, { pan : true});
        }, "keydown");

    Mousetrap
        .bind("space", function() {
            nate.actions.jump(true);
        });
    

    // Actions
    // -------------------------------------------------- //

    Mousetrap
        .bind("f", function() {
            nate.actions.attack();
        });

    Mousetrap
        .bind("d", function() {
            nate.actions.shoot();
        });

    Mousetrap
        .bind("s", function() {
            nate.actions.potion();
        });

    Mousetrap
        .bind("escape", function() {
            scene.grid.toggle();
        });


    // Overlays
    // -------------------------------------------------- //

    nate.set("arrows", 99);

    scene.grid.addLayer(function(ctx) {

        var canvas = scene.grid.canvas;
        var anchor = {
            x: (canvas.width / 2) - 130,
            y: canvas.height - 70
        };
        
        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 33, {
            fill     : "#222222"
        });

        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 36, {
            lineWidth: 1,
            stroke   : "#666666"
        });
        
        TK.Icon(ctx, "images/bow.png", anchor.x - 9, anchor.y, 20, 20);
        TK.Text(ctx, nate.get("arrows") || 0, anchor.x + 15, anchor.y + 15, {
            color: "#fff",
            font: "12pt monospace"
        });

    });

    nate.set("health-potions", 3);
    nate.set("energy-potions", 3);

    scene.grid.addLayer(function(ctx) {
        var canvas = scene.grid.canvas;
        
        var anchor = {
            x: (canvas.width / 2) + 110,
            y: canvas.height - 70
        };

        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 33, {
            fill     : "#222222"
        });

        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 36, {
            lineWidth: 1,
            stroke   : "#666666"
        });

        TK.Icon(ctx, "images/energy-potion.png", anchor.x - 7, anchor.y, 20, 20);
        TK.Text(ctx, nate.get("energy-potions") || 0, anchor.x + 15, anchor.y + 15, {
            color: "#fff",
            font: "12pt monospace"
        });

    });
    
    // Health Potion -------------------------------------------------- //

    scene.grid.addLayer(function(ctx) {

        var canvas = scene.grid.canvas,
            anchor = {
                x: (canvas.width / 2) + 190,
                y: canvas.height - 70
            };
        
        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 33, { 
            fill : "#222222" 
        });

        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 36, {
            lineWidth: 1,
            stroke   : "#666666"
        });
        
        TK.Icon(ctx, "images/health-potion.png", anchor.x - 7, anchor.y, 20, 20);
        TK.Text(ctx, nate.get("health-potions") || 0, anchor.x + 15, anchor.y + 15, {
            color: "#fff",
            font: "12pt monospace"
        });

    });

    scene.grid.addLayer(function(ctx) {

        var canvas = scene.grid.canvas;
        var anchor = {
            x: (canvas.width / 2) - 215,
            y: canvas.height - 70
        };
        
        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 33, {
            fill     : "#222222"
        });

        TK.Circle(ctx, anchor.x + 10, anchor.y + 10, 36, {
            lineWidth: 1,
            stroke   : "#666666"
        });

        TK.Icon(ctx, "images/sword.png", anchor.x, anchor.y, 20, 20);

    });

    
    scene.grid.addLayer(function(ctx) {

        var canvas = scene.grid.canvas;
        
        var anchor = {
            x: (canvas.width / 2),
            y: canvas.height - 100
        };
        
        // Base
        // -------------------------------------------------- //

        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 75, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.closePath();
        ctx.fill();


        // Energy Bar
        // -------------------------------------------------- //

        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 65, Geo.toRadians(-90), Geo.toRadians(90), false);
        ctx.fillStyle = "#0069C2";
        ctx.closePath();
        ctx.fill();

        
        // HealthBar
        // -------------------------------------------------- //

        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 65, Geo.toRadians(-90), Geo.toRadians(90), true);
        ctx.fillStyle = "#C10000";
        ctx.closePath();
        ctx.fill();


        // Chrome
        // -------------------------------------------------- //
        
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, 79, 0, Math.PI * 2);
        ctx.closePath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#666";
        ctx.stroke();

    });

    
    Tilekit.begin();
    
    
    window.onblur = function() {
        Tilekit.pause();
    };


}(window.TK));