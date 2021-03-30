const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;
let server;

describe("A - Get roles", () => {
    before(done => resetDatabase(done));
    before(done => {
        server = app.listen(3000, done);
    });
    after(done => resetDatabase(done));
    it("🎲 Gets roles (GET /roles)", done => {
        chai.request(server)
            .get("/roles")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(Array.isArray(res.body)).to.be.true;
                expect(res.body[0].name).to.exist;
                expect(res.body[0].side).to.exist;
                expect(res.body[0].maxInGame).to.exist;
                expect(res.body[0].type).to.exist;
                done();
            });
    });
});