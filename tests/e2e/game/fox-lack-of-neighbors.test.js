const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
const originalPlayers = [
    { name: "Dag", role: "fox" },
    { name: "Dig", role: "werewolf" },
    { name: "Deg", role: "villager" },
    { name: "Dog", role: "villager" },
];
let server, token, game, players;

describe("W - Tiny game of 4 players in which fox has less and less neighbors to sniff", () => {
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
            .send({ players: originalPlayers, options: { roles: { sheriff: { isEnabled: false } } } })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🦊 Fox sniffs himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "fox", action: "sniff", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets).to.be.lengthOf(3);
                expect(game.history[0].play.targets[0].player._id).to.equals(players[1]._id);
                expect(game.history[0].play.targets[1].player._id).to.equals(players[0]._id);
                expect(game.history[0].play.targets[2].player._id).to.equals(players[3]._id);
                expect(game.players[0].attributes).to.not.exist;
                done();
            });
    });
    it("🐺 Werewolf eats the first villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 All vote for the second villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[3].isAlive).to.be.false;
                expect(game.players[3].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🦊 Fox sniffs the werewolf, only two targets are present because there is only two players (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "fox", action: "sniff", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets).to.be.lengthOf(2);
                expect(game.history[0].play.targets[0].player._id).to.equals(players[0]._id);
                expect(game.history[0].play.targets[1].player._id).to.equals(players[1]._id);
                expect(game.players[0].attributes).to.not.exist;
                done();
            });
    });
});