// Root Tilekit Namespace
// -------------------------------------------------- //

describe("Tilekit.Entity", function() {

    var Tilekit = window.Tilekit;

    it("is extendable into new objects", function() {
        var Ent = Tilekit.Entity.extend({ foo: "bar" });
        new Ent().should.have.property("foo");
    });

    it("has extendable attributes upon instantiation", function() {
        var e = new Tilekit.Entity({ "foo": "bar" });
        e.attributes.should.have.property("foo", "bar");
    });

    it("can get attributes using a getter", function() {
        var e = new Tilekit.Entity({ "foo": "bar" });
        e.get("foo").should.equal("bar");
    });

    it("can set attributes using a set", function() {
        var e = new Tilekit.Entity();
        e.set("foo", "bar");
        e.get("foo").should.equal("bar");
    });

    it("has layers", function() {
        var e = new Tilekit.Entity();
        e.should.have.property("layers");
    });

    it("can add layers", function() {
        var e = new Tilekit.Entity();
        e.addLayer("foo", function() {});
        e.layers.should.have.property("foo");
    });

    it("can remove layers", function() {
        var e = new Tilekit.Entity();
        e.addLayer("foo", function() {});
        e.removeLayer("foo");
        e.layers.should.not.have.property("foo");
    });

    it("can render layers", function() {

        var e = new Tilekit.Entity(),
            truthy = false;

        e.addLayer("foo", function() {
            truthy = true;
        });

        e.renderLayers();

        expect(truthy).to.be.ok;

    });
    
    it("layers have a timestamp with their creation time", function() {
        var e = new Tilekit.Entity();
        e.addLayer("foo", function() {});
        expect(e.layers["foo"].created_at).to.exist;
    });

    it("layers can have an expiration time", function() {
        var e = new Tilekit.Entity();
        e.addLayer("foo", function() {}, e, 2000);
        expect(e.layers["foo"].expires_at).to.equal(2000);
    });

    it("layers", function() {

        var e = new Tilekit.Entity();

        e.addLayer("foo", function() {}, e, -1);
        e.renderLayers();

        expect(e.layers.foo).to.not.exist;

    });
    
    it("has events", function() {

        var e = new Tilekit.Entity(),
            truthy = false;

        e.on("foo", function() {
            truthy = true;
        });

        e.emit("foo");
        
        expect(truthy).to.be.ok;

    });
    
});