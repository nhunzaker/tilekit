// Format Tests
// -------------------------------------------------- //

describe("Tilekit.Timer", function() {

    var Timer = Tilekit.Timer;

    it("can keep track of it's creation datetime", function() {
        var t = new Timer();
        expect(t.date instanceof Date).to.equal(true);
    });

    it("can get current time in milliseconds", function() {
        var t = new Timer();
        t.getMilliseconds().should.equal(t.date.getTime());
    });

    it("can get current time in seconds", function() {
        var t = new Timer();
        t.getSeconds().should.equal(Math.round(t.date.getTime() / 1000) );
    });

});