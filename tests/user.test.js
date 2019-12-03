const app = require("../app");
const chai = require("chai");
const { describe, it } = require("mocha");
const chaiHttp = require("chai-http");
const Config = require("../config");

chai.use(chaiHttp);
const { expect } = chai;

describe("Testing user routes", () => {
    it("Gets all users", done => {
        chai.request(app)
            .get("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});