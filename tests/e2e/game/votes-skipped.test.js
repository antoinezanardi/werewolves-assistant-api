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
    { name: "Dag", role: "werewolf" },
    { name: "Dig", role: "angel" },
    { name: "Deg", role: "stuttering-judge" },
    { name: "Dog", role: "scapegoat" },
    { name: "DÁg", role: "raven" },
];
let server, token, game, players;

describe("Y - Tiny game where all votes are skipped", () => {
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
    it("👪 Nobody vote, then there is no death (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votes).to.not.exist;
                expect(game.history[0].play.votesResult).to.equal("no-death");
                expect(game.history[0].deadPlayers).to.not.exist;
                done();
            });
    });
    it("⚖️ Stuttering judge chooses sign (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "stuttering-judge", action: "choose-sign" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🪶 Raven marks the stuttering judge (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ name: "raven-marked", source: "raven", remainingPhases: 2 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[2]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the scapegoat (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("👪 Nobody vote, but because stuttering judge is raven marked, he dies (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", doesJudgeRequestAnotherVote: true })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votes).to.not.exist;
                expect(game.history[0].play.votesResult).to.equal("death");
                expect(game.history[0].deadPlayers).to.be.an("array").lengthOf(1);
                expect(game.history[0].deadPlayers[0]._id).to.equal(players[2]._id);
                done();
            });
    });
    it("👪 Nobody vote, then there is no death (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votes).to.not.exist;
                expect(game.history[0].play.votesResult).to.equal("no-death");
                expect(game.history[0].deadPlayers).to.not.exist;
                done();
            });
    });
});