// A simple text module

var TextBox = function(options) {

    options = options || {};

    this.header     = options.header || "???";
    this.subheader  = options.subheader || false;
    this.body       = options.body || "";
    this.context    = options.context;
    this.lineheight = options.lineheight || 25;
};

TextBox.prototype.setFont = function(color, font) {
    var ctx = this.context;

    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.font = font;
};

TextBox.prototype.drawWindow = function() {

    var ctx = this.context;

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2),
                 document.width,
                 (document.height * 0.2));

    ctx.fillStyle = "#333";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2) - 2,
                 document.width, 2);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2) + 1,
                 document.width,
                 1);

};

TextBox.prototype.drawText = function(text, x, y) {

    this.context.fillText(text,
                          (document.width * 0.1) + (x || 0),
                          (document.height - (document.height * 0.2)) + (y || 0)
                         );
};

TextBox.prototype.drawEllipsis = function() {

    var ctx = this.context,
        width = document.width * 0.93,
        height = document.height - (document.height * 0.05);

    ctx.fillStyle = "#333";
    ctx.fillRect(width,
                 height,
                 5, 5);
    ctx.fillRect(width + 10,
                 height,
                 5, 5);
    ctx.fillRect(width + 20,
                 height,
                 5, 5);
};

TextBox.prototype.draw = function() {

    var ctx = this.context,
        self = this;

    this.drawWindow();


    // The Message header
    // -------------------------------------------------- //

    this.setFont("black", "bold 14pt monospace");
    this.drawText(this.header, 0, 15);

    if (this.subheader) {
        this.setFont("#666", "normal 10pt monospace");
        this.drawText(this.subheader, 0, 40);
    }

    // The Message Contents
    // -------------------------------------------------- //

    this.setFont("#333", "normal 14pt monospace");

    var pixelLength = 0,
        words = this.body.split(" "),
        line = 70, // 70 for the base pixel offset
        i = 0, word = "", measure = 0;

    while(words[i]) {
        word = words[i];
        measure = ctx.measureText(word + " ").width;

        if (pixelLength + measure > document.width * 0.85) {
            pixelLength = 0;
            line += this.lineheight;
        }

        if (line > (document.height * 0.2) - (document.height * 0.05)) {
            return;
        }

        self.drawText(word, pixelLength, line);

        pixelLength += ctx.measureText(word + " ").width;

        i++;
    }

    this.drawEllipsis();

    return;

};