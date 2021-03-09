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
const aLotOfPlayers = [
    { name: "1" },
    { name: "2" },
    { name: "3" },
    { name: "4" },
    { name: "5" },
    { name: "6" },
    { name: "7" },
    { name: "8" },
    { name: "9" },
    { name: "10" },
    { name: "11" },
    { name: "12" },
    { name: "13" },
    { name: "14" },
    { name: "15" },
    { name: "16" },
    { name: "17" },
    { name: "18" },
    { name: "19" },
    { name: "20" },
    { name: "21" },
    { name: "22" },
    { name: "23" },
    { name: "24" },
    { name: "25" },
    { name: "26" },
    { name: "27" },
    { name: "28" },
    { name: "29" },
    { name: "30" },
    { name: "31" },
    { name: "32" },
    { name: "33" },
    { name: "34" },
    { name: "35" },
    { name: "36" },
    { name: "37" },
    { name: "38" },
    { name: "39" },
    { name: "40" },
];
let server, token;

describe("E - Game repartition with multiple teams", () => {
    before(done => resetDatabase(done));
    before(done => {
        server = app.listen(3000, done);
    });
    after(done => resetDatabase(done));
    it("👤 Creates new user (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🔑 Logs in successfully (POST /users/login)", done => {
        chai.request(server)
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
        chai.request(server)
            .get(`/games/repartition?${stringify({ players })}`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("👪 Gets game repartition for 4 players with JWT auth (GET /games/repartition)", done => {
        chai.request(server)
            .get(`/games/repartition?${stringify({ players })}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("👪 Gets game repartition for 40 players with JWT auth (GET /games/repartition)", done => {
        chai.request(server)
            .get(`/games/repartition?${stringify({ players: aLotOfPlayers })}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🔐 Can't get game repartition without auth (GET /games/repartition)", done => {
        chai.request(server)
            .get(`/games/repartition?${stringify({ players })}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("🤼 Can't get game repartition with less than 4 players (GET /games/repartition)", done => {
        chai.request(server)
            .get(`/games/repartition?${stringify({ players: [{ name: "1" }] })}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
    it("🤼 Can't get game repartition with more than 40 players (GET /games/repartition)", done => {
        chai.request(server)
            .get(`/games/repartition?${stringify({ players: [...players, ...aLotOfPlayers] })}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
});