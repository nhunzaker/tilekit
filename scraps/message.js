
// Messaging
// -------------------------------------------------- //

Scene.prototype.message = function(header, message, callback) {
    
    var grid = this.grid,
        uuid = Date.now();

    callback = callback || function(){};
    
    // Okay, now generate the new message
    this.grid.addLayer("message-" + uuid, function(ctx, date) {
        
        var text = new TextBox({
            header: header,
            subheader: new Array(header.length + 3).join("-"),
            body: message,
            context: grid.c
        });

        text.draw.apply(text);
    });

    $(window).one("keydown", function remove(e) {
        grid.removeLayer("message-" + uuid);
        callback(e);
        return false;
    });        

};
