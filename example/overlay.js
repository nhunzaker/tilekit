function InfuseDamageGraphics(target) {

    var TK = window.Tilekit;
    
    var min = Math.min,
        max = Math.max,
        round = Math.round;
    
    target.on("change:health", function(next, prev) {

        // Death
        if (next <= 0) {
            return target.death();
        }

        var pos   = target.get("position"),
            size  = target.grid.get("size"),
            ratio = min(1, max(0.01, next / target.get("maxHealth")) ),
            delta = next - prev,
            sprite = target.sprite,
            color  = next < prev ? "red" : "aquamarine";
        
        // Floating Delta Indicator
        // -------------------------------------------------- //

        target.addLayer(function(ctx, date, birth) {
            
            var now = (date.getTime() - birth) / 1000;
            
            Tilekit.Text(ctx, delta, pos.x + (size / 2), pos.y - size * now, { 
                alpha: min(0.8, 0.1 / now),
                align: "center",
                color: color,
                font: 8 + (now * 10) + "pt Helvetica"
            });

        }, target, 1000);
        

        // The Damage Filter
        // -------------------------------------------------- //

        target.addLayer("unit-health-flash", function(ctx, date, birth) {
            
            var now = (date.getTime() - birth) / 1000;
            
            Tilekit.Rectangle(ctx, sprite.position.x, sprite.position.y, sprite.width, sprite.height, { 
                fill: color,
                alpha: min(0.6, 0.1 / now),
                composite: "source-atop"
            });
            
        }, target, 1000);
        
        
        // The HealthBar
        // -------------------------------------------------- //

        target.addLayer("unit-healthbar", function(ctx, date, birth) {
            
            var pos = target.get("position"),
                now = (date.getTime() - birth) / 1000;
            
            Tilekit.Rectangle(ctx, pos.x, pos.y - size / 4, size, size / 8, { 
                fill: "black",
                alpha: 0.7
            });

            Tilekit.Rectangle(ctx, pos.x, pos.y - size / 4, size * ratio, size / 8, { 
                fill: TK.colorWheel[min(TK.colorWheel.length - 1, round(ratio * TK.colorWheel.length - 1))],
                stroke: "rgba(0,0,0,0.25)",
                alpha: 0.7
            });
            
        }, target, 1500);

    });

};