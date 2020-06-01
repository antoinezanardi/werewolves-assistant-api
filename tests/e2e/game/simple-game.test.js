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
    { name: "Dig", role: "witch" },
    { name: "Doug", role: "seer" },
    { name: "Dag", role: "protector" },
    { name: "Dug", role: "raven" },
    { name: "Dyg", role: "hunter" },
    { name: "Deg", role: "wolf" },
];
let token, game;

describe("Game of 6 players with basic roles", () => {
    before(done => resetDatabase(done));
    after(done => resetDatabase(done));
    it("Creates new user (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("Logs in successfully (POST /users/login)", done => {
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
    it("Creates game with JWT auth (POST /games)", done => {
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
    it("Can't make a play if game's doesn't belong to user (POST /games/:id/play)", done => {
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
    it("Checks if game is waiting for 'all' to 'elect-mayor' (POST /games/:id/play)", done => {
        expect(game.waiting).to.deep.equals({ for: "all", to: "elect-mayor" });
        done();
    });
    it("Can't elect mayor if play's source is not 'mayor' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if votes are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if votes are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if one vote has same target and source (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[1]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if one vote has an unknown source (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: mongoose.Types.ObjectId(), for: players[1]._id },
                { from: players[0]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if one vote has an unknown target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: mongoose.Types.ObjectId() },
                { from: players[1]._id, for: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if player votes twice (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[0]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("Can't elect mayor if there is a tie in votes (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[1]._id, for: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY");
                done();
            });
    });
    it("All elect the mayor (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[1]._id, for: players[0]._id },
                { from: players[2]._id, for: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ attribute: "mayor", source: "all" });
                expect(game.history[0].play.votes).to.exist;
                done();
            });
    });
    it("Checks if game is waiting for 'seer' to 'look' (POST /games/:id/play)", done => {
        expect(game.waiting).to.deep.equals({ for: "seer", to: "look" });
        done();
    });
});