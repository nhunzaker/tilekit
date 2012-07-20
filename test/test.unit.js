// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Unit", function() {

    var Tilekit = window.Tilekit;

    var grid, scene, unit;

    beforeEach(function() {
        grid  = new Tilekit.Grid();
        scene = new Tilekit.Scene({ grid: grid });
        unit  = new Tilekit.Unit("test", scene, {
            image: "images/player.png"
        });
    });

    it("has a name", function() {
        unit.get("name").should.equal("test");
    });
    
    it("has static default values", function() {
        expect(Tilekit.Unit.defaults).to.exist;
    });

    it("can get the tile in front of it", function() {
        unit.setFace(270);
        unit.getTileFront().should.deep.equal({ 
            x: 0,
            y: 1
        });
    });

    it("can get the tile in behind it", function() {
        unit.setFace(270);
        unit.getTileBack().should.deep.equal({ 
            x: 0,
            y: -1
        });
    });

});