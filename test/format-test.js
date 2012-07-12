// Format Tests
// -------------------------------------------------- //

global.window = {};

require("chai").should();
require("../src/helpers");

describe("Format", function() {
    
    it("should determine the proper coordinate given an alignment", function() {
        Format.align("right", 200, 1000, 0).should.equal(800);
        Format.align("bottom", 900, 1000, 0).should.equal(100);
        Format.align("top", 100, 1000, 50).should.equal(50);
    });

});