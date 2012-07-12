// Geometry Tests
// -------------------------------------------------- //

describe("Geometry", function() {
    
    var Geo = window.Geo;
    
    it("should convert degrees to radians", function() {
        Geo.toRadians(90).should.equal(Math.PI / 2);
        Geo.toRadians(270).should.equal( (3 * Math.PI) / 2);
    });

    it("should find the angle given two points", function() {

        // Bottom to Top
        Geo.findAngle({ x: 0, y: 0 }, {x: 0, y:1}).should.equal(90);
        Geo.findAngle([0, 0], [0, 1]).should.equal(90);
        
        // Top to Bottom
        Geo.findAngle({ x: 0, y: 1 }, {x: 0, y:0}).should.equal(270);
        Geo.findAngle([0, 1], [0, 0]).should.equal(270);
        
        // Right to Left
        Geo.findAngle({ x: 10, y: 0 }, {x: 9, y:0}).should.equal(180);
        Geo.findAngle([10, 0], [9, 0]).should.equal(180);
        
        // Left to right
        Geo.findAngle({ x: -5, y: 0 }, {x: 9, y:0}).should.equal(0);
        Geo.findAngle([-5, 0], [9, 0]).should.equal(0);

    });

    it("should calculate the distance between two points", function() {

        var one = { x: 0, y: 0 },
            two = { x: 1, y: 2 };

        Geo.findDistance(one, two)
            .should.equal( 
                Math.sqrt(Math.pow(two.x - one.x, 2) + Math.pow(two.y - one.y, 2))
            );
    });

    it("should determine if a point is within a cone", function() {
        
        var center = { x: 0,  y: 0 },
            point  = { x: -1, y: 0 },
            radius = 2,
            angle = 0,
            cone = 30,
            magnitude = false;
        
        Geo.isWithinCone(center, point, radius, angle, cone, false)
            .should.equal(true);

    });
    
    
    it("should determine a point given another point, distance, and angle", function() {
        
        var point = Geo.findPoint({x: 0, y: 0}, 32, 270);
        
        point.x.should.equal(0);
        point.y.should.equal(-32);
        
        point = Geo.findPoint({x: 0, y: 0}, 32, 90);
        
        point.x.should.equal(0);
        point.y.should.equal(32);
        
        point = Geo.findPoint({x: 0, y: 0}, 32, 0);
        
        point.x.should.equal(32);
        point.y.should.equal(0);
        
        point = Geo.findPoint({x: 0, y: 0}, 32, 180);
        
        point.x.should.equal(-32);
        point.y.should.equal(0);

        
    });

});