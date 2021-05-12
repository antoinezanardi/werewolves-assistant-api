const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");
const { getPlayerWithAttribute } = require("../../../src/helpers/functions/Game");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
const originalPlayers = [
    { name: "Dag", role: "werewolf" },
    { name: "Dig", role: "villager" },
    { name: "Deg", role: "villager" },
    { name: "Dog", role: "villager" },
];
let server, token, game, players;

describe("Z - Tiny game where all sheriff elections are random", () => {
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
    it("🎲 Creates game with JWT auth (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: originalPlayers })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 No votes declared, then election is random (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votes).to.not.exist;
                expect(game.history[0].play.targets).to.be.an("array").lengthOf(1);
                expect(game.history[0].play.targets[0].player).to.exist;
                const electedSheriffPlayer = getPlayerWithAttribute("sheriff", game);
                expect(electedSheriffPlayer._id).to.equal(game.history[0].play.targets[0].player._id);
                done();
            });
    });
    it("🎲 Cancels game (PATCH /games/:id)", done => {
        chai.request(server)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ status: "canceled" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equal("canceled");
                done();
            });
    });
    it("🎲 Creates game with JWT auth (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: originalPlayers })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 Votes are empty, then election is random (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votes).to.not.exist;
                expect(game.history[0].play.targets).to.be.an("array").lengthOf(1);
                expect(game.history[0].play.targets[0].player).to.exist;
                const electedSheriffPlayer = getPlayerWithAttribute("sheriff", game);
                expect(electedSheriffPlayer._id).to.equal(game.history[0].play.targets[0].player._id);
                done();
            });
    });
    it("🎲 Cancels game (PATCH /games/:id)", done => {
        chai.request(server)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ status: "canceled" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equal("canceled");
                done();
            });
    });
    it("🎲 Creates game with JWT auth (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: originalPlayers })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 Tie in votes between 2 players, then election is random between those two (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votes).to.be.an("array").lengthOf(2);
                expect(game.history[0].play.targets).to.be.an("array").lengthOf(1);
                expect(game.history[0].play.targets[0].player).to.exist;
                const electedSheriffPlayer = getPlayerWithAttribute("sheriff", game);
                expect(electedSheriffPlayer._id).to.equal(game.history[0].play.targets[0].player._id);
                expect(electedSheriffPlayer._id === players[0]._id || electedSheriffPlayer._id === players[1]._id).to.be.true;
                done();
            });
    });
});