const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { stringify } = require("qs");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
const players = [
    { name: "Dag" },
    { name: "Dig" },
    { name: "Deg" },
    { name: "Dog" },
];
let token;

describe("E - Game repartition with multiple teams", () => {
    before(done => resetDatabase(done));
    after(done => resetDatabase(done));
    it("👤 Creates new user (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🔑 Logs in successfully (POST /users/login)", done => {
        chai.request(app)
            .post(`/users/login`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                token = res.body.token;
                done();
            });
    });
    it("👪 Gets game repartition for 4 players with basic auth (GET /games/repartition)", done => {
        chai.request(app)
            .get(`/games/repartition?${stringify({ players })}`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("👪 Gets game repartition for 4 players with JWT auth (GET /games/repartition)", done => {
        chai.request(app)
            .get(`/games/repartition?${stringify({ players })}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🔐 Can't get game repartition without auth (GET /games/repartition)", done => {
        chai.request(app)
            .get(`/games/repartition?${stringify({ players })}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
});