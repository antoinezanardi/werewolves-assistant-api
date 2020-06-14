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
const players = [
    { name: "Dag", role: "wolf" },
    { name: "Dig", role: "wolf" },
    { name: "Deg", role: "wolf" },
    { name: "Dog", role: "villager" },
];
let token, game;

// eslint-disable-next-line max-lines-per-function
describe("D - Game Reset", () => {
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
            .set({ "Authorization": `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🔐 Can't make a play if game's doesn't belong to user (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${mongoose.Types.ObjectId()}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equals("GAME_DOESNT_BELONG_TO_USER");
                done();
            });
    });
    it("👥 All elect the villager as the mayor (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: players[3]._id },
                { from: players[1]._id, for: players[3]._id },
                { from: players[2]._id, for: players[3]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("♻️ Game is resetting (PATCH /games/:id/reset)", done => {
        chai.request(app)
            .patch(`/games/${game._id}/reset`)
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equals("playing");
                expect(game.turn).to.equals(1);
                expect(game.phase).to.equals("night");
                expect(game.tick).to.equals(1);
                expect(game.waiting[0]).to.deep.equals({ for: "all", to: "elect-mayor" });
                expect(game.history).to.deep.equals([]);
                expect(Array.isArray(game.players)).to.equals(true);
                expect(game.players[0].role).to.deep.equals({ original: "wolf", current: "wolf", group: "wolves" });
                expect(game.players[1].role).to.deep.equals({ original: "wolf", current: "wolf", group: "wolves" });
                expect(game.players[2].role).to.deep.equals({ original: "wolf", current: "wolf", group: "wolves" });
                expect(game.players[3].role).to.deep.equals({ original: "villager", current: "villager", group: "villagers" });
                done();
            });
    });
    it("👥 All elect the villager as the mayor (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: players[3]._id },
                { from: players[1]._id, for: players[3]._id },
                { from: players[2]._id, for: players[3]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🐺 Wolves eat the villager (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { player: players[3]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🎲 Game is WON by 'wolves'!!", done => {
        expect(game.status).to.equals("done");
        expect(game.won.by).to.equals("wolves");
        done();
    });
    it("🔐 Game can't be reset if status is 'done' (PATCH /games/:id/reset)", done => {
        chai.request(app)
            .patch(`/games/${game._id}/reset`)
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_RESET");
                done();
            });
    });
});

// const players = [
//     { name: "0Dag", role: "wolf" },
//     { name: "1Dig", role: "wolf" },
//     { name: "2Deg", role: "wolf" },
//     { name: "3Dog", role: "villager" },
// ];