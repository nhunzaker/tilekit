// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Unit", function() {

    var Tilekit = window.Tilekit;

    it("inherits from Tilekit.Entity", function() {
        var Ent = Tilekit.Entity.extend({ foo: "bar" });
        new Ent().should.have.property("foo");
    });
    
});