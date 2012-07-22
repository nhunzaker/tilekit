(function(TK) {

    TK.Smoke = function(grid, location) {

        var center = grid.findCenter(),
            size   = grid.get('size');

        var sprite = new TK.Sprite("images/smoke.png", {
            frames: 9,
            duration: 500,
            width: size * 2,
            height: size * 2,
            padding: size / 2,
            position: {
                x: location.x + center.x,
                y: location.y + center.y
            }
        });

        sprite.on("ready", function() {

            grid.addLayer("smoke-" + Date.now(), function(ctx) {

                var center = grid.findCenter();

                sprite.setPosition(location.x + center.x, location.y + center.y);

                sprite.animate();
                sprite.draw(ctx);

            }, sprite, sprite.duration);
            
        });

    };
    

}(window.Tilekit));