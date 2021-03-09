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
    { name: "Dug", role: "witch" },
    { name: "Dig", role: "villager" },
    { name: "Deg", role: "werewolf" },
    { name: "Dog", role: "werewolf" },
];
let server, token, game;

describe("G - Game where player is killed twice during the night", () => {
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
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 All elect the villager as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[2]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ name: "sheriff", source: "all" });
                expect(game.history[0].play.votes).to.exist;
                expect(game.history[0].play.votes[0].from._id).to.equals(game.players[0]._id);
                expect(game.history[0].play.votes[0].for._id).to.equals(game.players[1]._id);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[1]._id);
                done();
            });
    });
    it("🐺 Werewolves eat the villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ name: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[1]._id);
                done();
            });
    });
    it("🪄 Witch uses death potion on villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[1]._id, hasDrankDeathPotion: true }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[1]._id);
                expect(game.history[0].play.targets[0].hasDrankDeathPotion).to.be.true;
                done();
            });
    });
    it("☀️ Sun is rising and villager is dead", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[1].isAlive).to.be.false;
        done();
    });
    it("🎲 Game is waiting for 'sheriff' to 'delegate'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "delegate" });
        done();
    });
    it("🎖 Sheriff delegates to the hunter (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.not.deep.include({ name: "sheriff", source: "all" });
                expect(game.players[0].attributes).to.deep.include({ name: "sheriff", source: "sheriff" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[0]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'all' to 'vote'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "all", to: "vote" });
        done();
    });
});