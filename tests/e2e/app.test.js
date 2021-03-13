const chai = require("chai");
const app = require("../../app");
const { describe, it, before } = require("mocha");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;
let server;

describe("E2E - Testing main route", () => {
    before(done => {
        server = app.listen(3000, done);
    });
    it("👋 Welcomes user with API name", done => {
        chai.request(server)
            .get("/")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.name).to.equal("🐺 Werewolves Assistant API");
                done();
            });
    });
});