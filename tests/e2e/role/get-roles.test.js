const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
let token;

// eslint-disable-next-line max-lines-per-function
describe("A - Get roles", () => {
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
    it("🔐 Can't get roles without authentication (GET /games)", done => {
        chai.request(app)
            .get(`/games`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("🎲 Gets roles with JWT auth (GET /games)", done => {
        chai.request(app)
            .get("/roles")
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(Array.isArray(res.body)).to.equals(true);
                expect(res.body[0].name).to.exist;
                expect(res.body[0].group).to.exist;
                expect(res.body[0].maxInGame).to.exist;
                done();
            });
    });
    it("🎲 Gets roles with Basic auth (GET /games)", done => {
        chai.request(app)
            .get("/roles")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
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