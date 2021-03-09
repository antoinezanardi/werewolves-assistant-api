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
    { name: "Dag", role: "angel" },
    { name: "Dig", role: "werewolf" },
    { name: "Deg", role: "hunter" },
    { name: "Dog", role: "seer" },
    { name: "Dug", role: "witch" },
];
let server, token, game, players;

describe("V - Tiny game of 5 players in which because of the early votes, actions during night change", () => {
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
    it("👪 All elect the hunter as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff", votes: [{ from: players[1]._id, for: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 All vote for the hunter (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[1]._id, for: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].isAlive).to.be.false;
                expect(game.players[2].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🎲 Game is waiting for 'sheriff' to 'delegate', 'hunter' to 'shoot' before all other night actions", done => {
        expect(game.waiting).to.be.lengthOf(5);
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "delegate" });
        expect(game.waiting[1]).to.deep.equals({ for: "hunter", to: "shoot" });
        expect(game.waiting[2]).to.deep.equals({ for: "seer", to: "look" });
        expect(game.waiting[3]).to.deep.equals({ for: "werewolves", to: "eat" });
        expect(game.waiting[4]).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🎖 Sheriff delegates to the witch (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [{ player: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].attributes).to.deep.include({ name: "sheriff", source: "sheriff" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[4]._id);
                done();
            });
    });
    it("🔫 Hunter shoots at the witch (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot", targets: [{ player: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].isAlive).to.be.false;
                done();
            });
    });
    it("🎲 Game is waiting for 'sheriff' to 'delegate' and next night actions except witch ", done => {
        expect(game.waiting).to.be.lengthOf(3);
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "delegate" });
        expect(game.waiting[1]).to.deep.equals({ for: "seer", to: "look" });
        expect(game.waiting[2]).to.deep.equals({ for: "werewolves", to: "eat" });
        done();
    });
});