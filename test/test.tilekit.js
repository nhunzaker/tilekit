// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit", function() {

    var Tilekit = window.Tilekit;

    it("should iterate over collections", function() {
        
        var a = [1,2,3,4,5],
            b = [];

        Tilekit.each(a, function(item) {
            b.push(item);
        });

        b[3].should.equal(4);
        
    });

    it("should be able to extend objects", function() {
        
        var a = { foo: "bar" },
            b = { lawl: "baz" };

        Tilekit.extend({}, b, a).foo.should.equal("bar");
        Tilekit.extend({}, b, a).lawl.should.equal("baz");
    });

});