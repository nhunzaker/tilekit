// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Grid", function() {

    var Tilekit = window.Tilekit,
        grid;
    
    // Calculations
    // -------------------------------------------------- //

    it("should be able to successfully generate a tilemap", function() {
        
        grid = new Tilekit.Grid(document.createElement("canvas"), {
            tileset : "images/tileset.png",
            data    : "000100\n010000\n010000"
        });

    });

    it("should have tiles", function() {
        (grid.tilemap[0][0] instanceof Tilekit.Tile).should.equal(true);
    });

    it("can encode an array", function() {
        grid.encode([1,2,3,4]).should.equal("01020304");
    });

    it("can find its center");
    it("can convert pixel values into tile positions");
    it("can calculate the value of a tile given an ex and y value");
    it("can calculate the spritesheet offset of a given slot");
    it("can calculate the pixel offset of a tile");

    // Manage Refreshing
    // -------------------------------------------------- //
    
    it("can start a gameloop");
    it("can pause its gameloop");
    it("can resume its gameloop");

    // Rendering
    // -------------------------------------------------- //

    it("can draw");
    it("can save its current state");


    // Pathfinding
    // -------------------------------------------------- //

    it("can plot a course using A*", function() {
        var course = grid.plotCourse({ x: 2, y: 2 }, { x: 1, y: 1 });
        course.should.deep.equal([90, 180]);
    });

    it("has portals");
    it("emits a portal event");
    
});