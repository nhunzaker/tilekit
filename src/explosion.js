(function(TK) {

    TK.Explosion = function(grid, location, radius) {

        var center = grid.findCenter(),
            size   = grid.get('size');

        var sprite = new TK.Sprite(TK.defaults.explosion_sprite, {
            frames: 14,
            duration: 700,
            width: size * 2,
            height: size * 2,
            padding: size / 2,
            position: {
                x: location.x + center.x,
                y: location.y + center.y
            }
        });

        sprite.on("ready", function() {

            grid.addLayer(function fn(ctx) {

                var center = grid.findCenter();

                sprite.setPosition(location.x + center.x, location.y + center.y);
                
                sprite.animate();
                sprite.draw(ctx);

            }, sprite, 700, sprite.duration);
            
        });

    };
    

}(window.Tilekit));