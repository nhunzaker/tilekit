// Primitives
// -------------------------------------------------- //

Tilekit.Text = function(ctx, text, x, y, options) {
    ctx.font = options.font || Tilekit.defaults.font;
    ctx.fillStyle = options.color || "#fff";

    if (options && options.align === "center") {
        x -= ctx.measureText(text).width / 2;
    }
    
    ctx.fillText(text, x, y);
};

Tilekit.Rectangle = function(ctx, x, y, width, height, options) {
    ctx.fillStyle = options.fill;
    
    if (options.fill) {
        ctx.fillRect(0, 0, width, height);
    }
};