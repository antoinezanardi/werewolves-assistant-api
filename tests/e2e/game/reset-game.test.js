const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
let players = [
    { name: "Dag", role: "werewolf" },
    { name: "Dig", role: "werewolf" },
    { name: "Deg", role: "werewolf" },
    { name: "Dog", role: "villager" },
];
let server, token, game;

describe("D - Game Reset", () => {
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
    it("🔐 Can't make a play if game's doesn't belong to user (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${new mongoose.Types.ObjectId()}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equal("GAME_DOESNT_BELONG_TO_USER");
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
                    { from: players[0]._id, for: players[3]._id },
                    { from: players[1]._id, for: players[3]._id },
                    { from: players[2]._id, for: players[3]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("♻️ Game is resetting (PATCH /games/:id/reset)", done => {
        chai.request(server)
            .patch(`/games/${game._id}/reset`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equal("playing");
                expect(game.turn).to.equal(1);
                expect(game.phase).to.equal("night");
                expect(game.tick).to.equal(1);
                expect(game.waiting[0]).to.deep.equals({ for: "all", to: "elect-sheriff" });
                expect(game.history).to.deep.equals([]);
                expect(Array.isArray(game.players)).to.be.true;
                expect(game.players[0].role).to.deep.equals({ original: "werewolf", current: "werewolf", isRevealed: false });
                expect(game.players[0].side.current).to.equal("werewolves");
                expect(game.players[1].role).to.deep.equals({ original: "werewolf", current: "werewolf", isRevealed: false });
                expect(game.players[1].side.current).to.equal("werewolves");
                expect(game.players[2].role).to.deep.equals({ original: "werewolf", current: "werewolf", isRevealed: false });
                expect(game.players[2].side.current).to.equal("werewolves");
                expect(game.players[3].role).to.deep.equals({ original: "villager", current: "villager", isRevealed: false });
                expect(game.players[3].side.current).to.equal("villagers");
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
                    { from: players[0]._id, for: players[3]._id },
                    { from: players[1]._id, for: players[3]._id },
                    { from: players[2]._id, for: players[3]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🐺 Werewolves eat the villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🎲 Game is WON by 'werewolves'!!", done => {
        expect(game.status).to.equal("done");
        expect(game.won.by).to.equal("werewolves");
        done();
    });
    it("🔐 Game can't be reset if status is 'done' (PATCH /games/:id/reset)", done => {
        chai.request(server)
            .patch(`/games/${game._id}/reset`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("CANT_BE_RESET");
                done();
            });
    });
});

/*
 * const players = [
 *     { name: "0Dag", role: "werewolf" },
 *     { name: "1Dig", role: "werewolf" },
 *     { name: "2Deg", role: "werewolf" },
 *     { name: "3Dog", role: "villager" },
 * ];
 */