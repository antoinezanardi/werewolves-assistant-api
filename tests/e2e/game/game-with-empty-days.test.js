const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
let players = [
    { name: "Dig", role: "werewolf" },
    { name: "D∞g", role: "scapegoat" },
    { name: "Dag", role: "villager" },
    { name: "Dug", role: "villager" },
    { name: "Dyg", role: "villager" },
    { name: "Dπg", role: "villager" },
];
let token, game;

describe("M - Game with empty days because vote is impossible", () => {
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
    it("🎲 Creates game with JWT auth (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 All elect the werewolf as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff", votes: [{ from: players[1]._id, for: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ name: "sheriff", source: "all" });
                expect(game.history).to.be.an("array").to.have.lengthOf(1);
                expect(game.history[0].play.votes).to.exist;
                expect(game.history[0].play.votes[0].from._id).to.equals(game.players[1]._id);
                expect(game.history[0].play.votes[0].for._id).to.equals(game.players[0]._id);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[0]._id);
                expect(game.history[0].play.source.name).to.equal("all");
                expect(game.history[0].play.source.players).to.be.an("array").to.have.lengthOf(players.length);
                expect(game.history[0].deadPlayers).to.not.exist;
                done();
            });
    });
    it("🐺 Werewolf eats one villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("👪 Tie in votes between scapegoat and a villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[1]._id, for: players[3]._id },
                    { from: players[3]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].isAlive).to.be.false;
                expect(game.players[3].isAlive).to.be.true;
                done();
            });
    });
    it("🐐 Scapegoat bans voting all alive players except one (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "scapegoat", action: "ban-voting", targets: [
                    { player: players[0]._id },
                    { player: players[3]._id },
                    { player: players[4]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.exist;
                const cantVoteAttribute = { name: "cant-vote", source: "scapegoat", remainingPhases: 2, activeAt: { turn: 2 } };
                expect(game.players[0].attributes).to.exist;
                expect(game.players[0].attributes).to.deep.includes(cantVoteAttribute);
                expect(game.players[3].attributes).to.exist;
                expect(game.players[3].attributes).to.deep.includes(cantVoteAttribute);
                expect(game.players[4].attributes).to.exist;
                expect(game.players[4].attributes).to.deep.includes(cantVoteAttribute);
                expect(game.players[5].attributes).to.not.exist;
                done();
            });
    });
    it("🐺 Werewolf eats the only villager who can vote (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[5]._id);
                done();
            });
    });
    it("🌙 Night falls without day rising because no one can vote", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(3);
        expect(game.waiting[0]).to.deep.equals({ for: "werewolves", to: "eat" });
        done();
    });
});