// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Sprite", function() {

    var Tilekit = window.Tilekit,
        sprite = null;

    beforeEach(function() {
        sprite = new Tilekit.Sprite("images/player.png", {
            width: 32, 
            height: 32
        });
    });

    it("should be instantiatable", function() {
        (sprite instanceof Tilekit.Sprite).should.equal(true);
    });
    
    it("should be able to set its spritesheet", function() {
        sprite.setSpritesheet("images/player.png");
    });

    it("should be able to set its position", function() {
        sprite.setPosition(100, 200);
        expect(sprite.position.x).to.eql(100);
        expect(sprite.position.y).to.eql(200);
    });

    it("should be able to set its offset", function() {
        sprite.setOffset(100, 200);
        expect(sprite.offset.x).to.eql(100);
        expect(sprite.offset.y).to.eql(200);
    });

    it("should be able to animate", function() {
        sprite.animate();
    });

    it("should be able to draw itself", function() {
        var ctx = document.createElement("canvas").getContext('2d');
        sprite.draw(ctx);
    });
    
});