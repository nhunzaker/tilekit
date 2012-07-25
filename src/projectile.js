// Projectile
// -------------------------------------------------- //

(function(TK) {
    
    var findPoint = window.Geo.findPoint;
    
    var Projectile = TK.Projectile = function(options) {
        
        var settings = TK.extend({
            damage: 0,
            source: null,
            distance: 300,
            speed: 10,
            angle: 0,
            scene: null

        }, options);
        
        var scene  = settings.scene,
            source = settings.source,
            grid   = scene.grid,
            size   = grid.get('size'),
            offset = size / 2,
            travel = 0,
            from   = TK.extend({}, source.get("position")),
            name   = TK.generateGUID(),
            angle  = settings.angle;

        var arrow = new Image();
        arrow.src = "images/arrow-" + angle + ".png";
        
        grid.addLayer(name, function layer(ctx) {

            travel += settings.speed;

            var center = grid.findCenter(),
                target = findPoint(from, travel, -angle);

            TK.emit("damage", target, settings.source, function() {
                grid.removeLayer(name);
            });
            
            ctx.drawImage(arrow, 
                          (target.x + center.x + offset), 
                          ( (size / 2) + target.y + center.y)
                         );

            if (travel > settings.distance) {
                grid.removeLayer(name);
            }

        });

    };
    
}(window.Tilekit));