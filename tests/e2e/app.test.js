const app = require("../../app");
const chai = require("chai");
const { describe, it } = require("mocha");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;

describe("Testing main route", () => {
    it("👋 Welcomes user with API name", done => {
        chai.request(app)
            .get("/")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.name).to.equals("Werewolves Assistant API");
                done();
            });
    });
});