// Number Tests
// -------------------------------------------------- //

describe("Number Object Enhancements", function() {
    
    it("should round down to a given number", function() {
        (58).roundTo(32).should.equal(64);
        (8).roundTo(32).should.equal(0);
    });
    
    it("should round down to the nearest given number", function() {
        (46.5).floorTo(32).should.equal(32);
        (9).floorTo(5).should.equal(5);
    });

    it("should round up to the nearest given number", function() {
        (48).ceilTo(10).should.equal(50);
        (3).ceilTo(10).should.equal(10);
    });

    it("should be able to iterate over a number, given a function", function() {
        var count = 0;
        (5).times(function() { count++; });
        count.should.equal(5);
    });

});