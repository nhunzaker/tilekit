// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Grid", function() {

    var Tilekit = window.Tilekit;
    
    var grid = new Tilekit.Grid(document.createElement("canvas"), {
        tileset : "images/tileset.png",
        data    : "000100\n010000\n010000"
    });

    it("should have tiles", function() {
        (grid.tilemap[0][0] instanceof window.Tilekit.Tile).should.equal(true);
    });
    
    it("#encode", function() {
        grid.encode([1,2,3,4]).should.equal("01020304");
    });
    
    describe("calculations", function() {
        
        it("#findCenter", function() {

            var center = grid.findCenter(),
                size   = grid.get("size") / 2;

            center.x.should.equal( (grid.canvas.width / 2) - 16);
            center.y.should.equal( (grid.canvas.height / 2) - 16);
        });

        it("#getTileAt", function() {
            var tile =grid.getTileAt(0,0);

            tile.x.should.equal(0);
            tile.y.should.equal(0);
        });

        it("#calculateTileOffset", function() {
            var offset = grid.calculateTileOffset(1);
            offset.x.should.equal(32);
            offset.y.should.equal(0);
        });

        it("#calculatePixelOffset");

    });
    
    describe("gameloop methods", function() {

        it("#begin", function() {
            grid.begin();
            grid.should.have.property("shift");
        });
        
        it("#pause", function() {
            grid.pause();
            grid.get("paused").should.equal(true);
        });

        it("#play", function() {
            grid.play();
            grid.get("paused").should.equal(false);
        });

    });

    // Rendering
    // -------------------------------------------------- //
    
    describe("rendering methods", function() {
        
        it("#save", function() {
            grid.save();
        });

        it("#fillspace", function() {

            var size = grid.get("size"),
                cvs = grid.canvas;

            grid.fillspace();

            cvs.width.should.equal(document.width.roundTo(size));
            cvs.height.should.equal(document.height.roundTo(size));

        });

        it("#replaceTile", function() {
            grid.replaceTile(0,0,0,1).tilemap[0][0].layers[0].should.equal(1);
        });

        it("#clear", function() {
            grid.clear();
        });

        it("#panTo");
        it("#drawPortals");

        it("#draw", function() {
            grid.draw();
        });

    });


    // Pathfinding
    // -------------------------------------------------- //

    describe("pathfinding", function() {

        it("#plotCourse (A*)", function() {

            var grid = new Tilekit.Grid(document.createElement("canvas"), {
                tileset : "images/tileset.png",
                data    : "000100\n010000\n010000"
            });
            
            grid.on("ready", function() {
                var course = grid.plotCourse({ x: 2, y: 2 }, { x: 1, y: 1 });
                course.should.deep.equal([90, 180]);
            });

        });

    });

    describe("portals", function() {
        it("has portals");
        it("emits a portal event");
        
    });
});