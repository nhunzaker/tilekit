// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Scene", function() {

    var Tilekit = window.Tilekit;
    var grid, scene, unit;

    beforeEach(function() {
        grid  = new Tilekit.Grid();
        scene = new Tilekit.Scene({ grid: grid });
        unit  = new Tilekit.Unit("test", scene, {
            image: "images/player.png"
        });
    });

    it("can add units", function() {
        scene.add(unit);
        expect(scene.units[unit.get("name")]).to.exist;
    });

    it("can remove units", function() {
        scene.add(unit);
        scene.remove(unit);
        expect(scene.units[unit.get("name")]).to.not.exist;
    });
    
    it("can find units given a tile location", function() {
        scene.add(unit);
        scene.find(function(unit) {
            var unitTile = unit.tile();
            return unitTile.x === 0 && unitTile.y === 0;
        }).should.not.equal(false);
    });

    it("can find units given a condition", function() {
        scene.add(unit);
        scene.find(function(unit) {
            return unit.get("name") === "test";
        }).should.not.equal(false);
    });

});