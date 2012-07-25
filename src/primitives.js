// Primitives
// -------------------------------------------------- //

(function(Tilekit) {

    Tilekit.Text = function(ctx, text, x, y, options) {
        
        ctx.globalAlpha = options.alpha || 1;
        ctx.globalCompositeOperation = options.composite;

        ctx.font = options.font || Tilekit.defaults.font;
        ctx.fillStyle = options.color || "#fff";

        if (options && options.align === "center") {
            x -= ctx.measureText(text).width / 2;
        }
        
        ctx.fillText(text, x, y);

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

    Tilekit.Rectangle = function(ctx, x, y, width, height, options) {
        
        ctx.globalAlpha = options.alpha || 1;
        ctx.globalCompositeOperation = options.composite;
        
        if (options.fill) {
            ctx.fillStyle = options.fill;
            ctx.fillRect(x, y, width, height);
        }
        
        if (options.stroke) {
            ctx.lineWidth = options.lineWidth || 1;
            ctx.strokestyle = options.stroke;
            ctx.strokeRect(x + 1, y + 1, width - 1, height - 1);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

    Tilekit.Icon = function iconCache(ctx, path, x, y, width, height, options) {

        options = options || {};

        iconCache.__cache = iconCache.__cache || {};
        
        var image = iconCache.__cache[path];
        
        ctx.globalAlpha = options.alpha || 1;
        ctx.globalCompositeOperation = options.composite;
        
        if (image instanceof HTMLImageElement === false) {
            image = iconCache.__cache[path] = new Image();
            image.src = path;
        }
        
        ctx.drawImage(image, x, y, width, height);
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

    Tilekit.Circle = function(ctx, x, y, radius, options) {
        
        ctx.globalAlpha = options.alpha || 1;
        ctx.globalCompositeOperation = options.composite;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();

        if (options.fill) {
            ctx.fillStyle = options.fill;
            ctx.fill();
        }
        
        if (options.stroke) {
            ctx.lineWidth = options.lineWidth || 1;
            ctx.strokestyle = options.stroke;
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

}(window.Tilekit));