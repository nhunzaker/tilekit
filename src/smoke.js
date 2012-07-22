(function(Tilekit) {
    
    var toRadians = Geo.toRadians;

    Tilekit = Tilekit || {};
    
    function gameLoop() {
        window.mozRequestAnimationFrame(gameLoop);
        update();
    };
    
    function smoke(ctx, x, y) {
        
        var purple = "#973B90",
            light_purple = "rgb(194, 113, 185)",
            black  = "#000",

            backdrop = [
                { 
                    x: 140, y: 135, radius: 60, fill: "#111"
                },
                { 
                    x: 110, y: 80, radius: 45, fill: "#111"
                },
                { 
                    x: 160, y: 60, radius: 40, fill: "#111"
                },
                { 
                    x: 200, y: 60, radius: 25, fill: "#111"
                },
                { 
                    x: 200, y: 150, radius: 40, fill: "#111"
                }
            ],
            
            foreground = [ 

                // Far Right -------------------------------------------------- //
                { 
                    x: 210, y: 110, radius: 43, stroke: purple, from: 10, to: -220
                },
                { 
                    x: 218, y: 110, radius: 43, fill: "#111"
                },

                // Middle ----------------------------------------------------- //
                { 
                    x: 160, y: 100, radius: 40, stroke: purple, from: 57, to: -20
                },

                // Curl ------------------------------------------------------ //
                { 
                    x: 178, y: 91, radius: 20, stroke: purple, from: -20, to: 200
                },
                { 
                    x: 169, y: 88, radius: 22, fill: "#000", from: 20, to: 213
                }
            ];

        var renderScannerFill = function(point, radius) {
            ctx.save();

            ctx.fillStyle = point.fill || "black";
            
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.arc(0, 0, radius,toRadians(point.from || 360), toRadians(point.to || 0));
            
            ctx.fill();
            
            ctx.restore();
        };

        var renderScannerRing = function(point, radius) {
            ctx.save();

            ctx.strokeStyle = point.stroke;
            ctx.lineWidth = 15;
            
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.arc(0, 0, radius, toRadians(point.from || 360), toRadians(point.to || 0));
            ctx.stroke();

            ctx.restore();
        };

        var i;
        for (i = 0; i < backdrop.length; i++) {
            backdrop[i].fill && renderScannerFill(backdrop[i], backdrop[i].radius);
            backdrop[i].stroke && renderScannerRing(backdrop[i], backdrop[i].radius);
        }

        for (i = 0; i < foreground.length; i++) {
            foreground[i].fill && renderScannerFill(foreground[i], foreground[i].radius);
            foreground[i].stroke && renderScannerRing(foreground[i], foreground[i].radius);
        }

    };

    var ctx = document.querySelector("canvas").getContext('2d');

    function update() {
        ctx.clearRect(0, 0, 1000, 1000);

        ctx.moveTo(45, 45);
        ctx.beginPath();
        ctx.quadraticCurveTo(0, 0, 90, 45);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 4;
        ctx.stroke();
        //smoke(ctx, 150, 150);
    }
    
    gameLoop();
    
}(window.Tilekit));