// String Tests
// -------------------------------------------------- //

describe("String Object Enhancements", function() {
    
    it("should be able to remove the whitespace around a string", function() {
        ("   foo   ").trim().should.equal("foo");
        ("   foo").trim().should.equal("foo");
        ("foo   ").trim().should.equal("foo");
    });

});