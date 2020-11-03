const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

describe("A - Get roles", () => {
    before(done => resetDatabase(done));
    after(done => resetDatabase(done));
    it("🎲 Gets roles (GET /roles)", done => {
        chai.request(app)
            .get("/roles")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(Array.isArray(res.body)).to.equals(true);
                expect(res.body[0].name).to.exist;
                expect(res.body[0].group).to.exist;
                expect(res.body[0].maxInGame).to.exist;
                done();
            });
    });
});