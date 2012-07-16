// Tilekit Debug
// -------------------------------------------------- //

(function(Tilekit) {

    var PI = Math.PI,
        Geo = window.Geo;
    
    Tilekit.Tile.methods({

        debug: function() {

            var pos = this.sprite.position,
                grid = this.grid;
            
            // Helpers for debugging
            // -------------------------------------------------- //
            
            if (this.layers[1] > 0) {
                grid.debugCtx.fillStyle = "rgba(200, 100, 0, 0.4)";
                grid.debugCtx.fillRect(pos.x, pos.y, this.width, this.height );
            }

            if (this.layers[2] > 0) {
                grid.debugCtx.fillStyle = "rgba(250, 256, 0, 0.4)";
                grid.debugCtx.fillRect( pos.x, pos.y, this.width, this.height );
            }
        }

    });
    
    Tilekit.Grid.methods({

        layers: {
            
            __debug_layer: function(ctx) {
                var center = this.findCenter();
                ctx.drawImage(this.debug, center.x, center.y);
            },

            __debug_highlight_mouse: function(ctx) {

                var mouse = this.get("mouse"),
                    pos   = mouse? mouse.position : { x:0, y:0 },
                    size  = this.get("size");

                ctx.strokeStyle = "white";
                ctx.strokeRect(pos.x, pos.y, size, size);
            },

            // Game performance
            // -------------------------------------------------- //

            __debug_calc_fps: function() {
                
                var snapshot = this.get("__debug_snapshot") || Date.now(),
                    frames   = this.get("__debug_frames") || 0,
                    fps      = this.get("__debug_fps") || 30;
                
                var timestamp = Date.now() - snapshot;

                if (timestamp / 1000 <= 1) {
                    frames++;
                } else {
                    fps      = frames;
                    frames   = 0;
                    snapshot = Date.now();
                }

            },

            __debug_render_fps: function(ctx) {

                var fps = this.get("__debug_fps") || 30;

                ctx.font = "italic 12pt Helvetica";
                ctx.fillStyle = "#ae0";

                var offset = ctx.measureText("FPS: " + fps).width + 20;

                if (fps < 30) ctx.fillStyle = "#ee0";
                if (fps < 20) ctx.fillStyle = "#fa0";
                if (fps < 10) ctx.fillStyle = "#f00";

                ctx.fillText("FPS: " + fps,
                             document.width - offset,
                             document.height- 30);
            },

            __debug_draw_portals: function() {

                var ctx  = this.debugCtx,
                    size = this.get('size');

                if (this.start_location) {
                    ctx.strokeStyle = "rgb(255, 180, 10)";
                    ctx.fillStyle = "rgba(255, 180, 10, 0.5)";
                    ctx.clearRect(
                        this.start_location.x * size,
                        this.start_location.y * size,
                        size, size
                    );
                    ctx.fillRect(
                        this.start_location.x * size,
                        this.start_location.y * size,
                        size, size
                    );
                    ctx.strokeRect(
                        this.start_location.x * size,
                        this.start_location.y * size,
                        size, size
                    );

                }

                for (var p = 0; p < this.portals.length; p++) {
                    ctx.strokeStyle = "rgb(200, 20, 250)";
                    ctx.fillStyle = "rgba(200, 20, 250, 0.4)";
                    ctx.clearRect(
                        this.portals[p].x * size,
                        this.portals[p].y * size,
                        size, size
                    );
                    ctx.fillRect(
                        this.portals[p].x * size,
                        this.portals[p].y * size,
                        size, size
                    );
                    ctx.strokeRect(
                        this.portals[p].x * size,
                        this.portals[p].y * size,
                        size, size
                    );
                }
            }
            
        }

    });


    Tilekit.Unit.methods({

        layers: {
            
            __debug_renderClipping: function(ctx) {

                var size = this.grid.get('size'),
                    pos  = this.get("position");

                ctx.lineWidth = 1;
                ctx.fillStyle = "rgba(50, 255, 200, 0.3)";
                ctx.strokeStyle = "rgba(50, 255, 200, 0.3)";

                ctx.fillRect(pos.x, pos.y, size, size);
                ctx.strokeRect(pos.x, pos.y, size, size);
                
                var s = this.sprite;
                
                ctx.strokeStyle = "rgba(255,0,0,0.5)";
                ctx.strokeRect(s.position.x - s.padding, 
                               s.position.y - s.padding, 
                               s.width, s.height);

            },

            __debug_renderVision: function() {

                var ctx    = this.ctx,
                    size   = this.grid.get('size'),
                    pos    = this.get("position"),
                    posX   = pos.x + (size / 2),
                    posY   = pos.y + (size / 2),
                    vision = this.get("vision"),
                    face   = this.get("face"),
                    cone   = this.get("visionCone");

                if (!vision) {
                    return;
                }

                ctx.fillStyle = "rgba(0, 100, 200, 0.3)";
                ctx.strokeStyle = "rgba(0, 100, 200, 0.5)";
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(posX, posY);
                ctx.arc(posX, posY,
                        vision,
                        Geo.toRadians(-face - cone),
                        Geo.toRadians(-face + cone),
                        false);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            },

            __debug_renderHearing: function(ctx) {

                var size    = this.grid.get("size"),
                    pos     = this.get("position"),
                    hearing = this.get("hearing"),
                    posX    = pos.x + size / 2,
                    posY    = pos.y + (size / 2);

                if (!hearing) {
                    return;
                }

                ctx.fillStyle = "rgba(255, 150, 50, 0.4)";
                ctx.strokeStyle = "rgba(255, 150, 50, 0.8)";
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.arc(posX, posY, hearing, 0, PI * 2);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            }

        }
    });

}(window.Tilekit));