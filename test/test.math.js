describe("Math Object Enhancements", function() {

    it("should round to the nearest given number", function() {
        Math.roundTo(48, 10).should.equal(50);
    });

    it("should round down to a given number", function() {
        Math.floorTo(58, 32).should.equal(32);
        Math.floorTo(8, 32).should.equal(0);
    });

    it("should round down to a given number", function() {
        Math.ceilTo(58, 32).should.equal(64);
        Math.ceilTo(8, 32).should.equal(32);
    });
    
});