describe("Math Object Enhancements", function() {
    
    it("should calculate fuzzy deltas for a number", function() {
        Math.parseDelta("10%", 100).should.equal(10);
        Math.parseDelta("100%", 100).should.equal(100);
        Math.parseDelta("+10", 100).should.equal(110);
        Math.parseDelta("-10", 100).should.equal(90);
    });

});