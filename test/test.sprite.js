// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Sprite", function() {

    var Tilekit = window.Tilekit;

    it("should be instantiatable", function() {
        var sprite = new Tilekit.Sprite("images/player.png", 32, 32, 0, 0, 0, 0);
        (sprite instanceof Tilekit.Sprite).should.equal(true);
    });
    
    it("should be able to set its spritesheet", function() {
        var sprite = new Tilekit.Sprite("images/player.png", 32, 32, 0, 0, 0, 0);
        sprite.setSpritesheet("images/player.png");
    });

    it("should be able to set its position", function() {
        var sprite = new Tilekit.Sprite("images/player.png", 32, 32, 0, 0, 0, 0);
        sprite.setPosition(100, 200);

        expect(sprite.posX).to.eql(100);
        expect(sprite.posY).to.eql(200);
    });

    it("should be able to set its offset", function() {
        var sprite = new Tilekit.Sprite("images/player.png", 32, 32, 0, 0, 0, 0);
        sprite.setOffset(100, 200);

        expect(sprite.offsetX).to.eql(100);
        expect(sprite.offsetY).to.eql(200);
    });

    it("should be able to animate", function() {
        var sprite = new Tilekit.Sprite("images/player.png", 32, 32, 0, 0, 0, 0);
        sprite.animate();
    });

    it("should be able to draw itself", function() {

        var sprite = new Tilekit.Sprite("images/player.png", 32, 32, 0, 0, 0, 0),
            ctx    = document.createElement("canvas").getContext('2d');

        sprite.draw(ctx);

    });
    
});