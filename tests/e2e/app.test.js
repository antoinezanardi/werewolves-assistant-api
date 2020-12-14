const chai = require("chai");
const app = require("../../app");
const { describe, it, before } = require("mocha");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;

describe("Testing main route", () => {
    before(done => app.on("ready", done));
    it("👋 Welcomes user with API name", done => {
        chai.request(app)
            .get("/")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.name).to.equals("🐺 Werewolves Assistant API");
                done();
            });
    });
});