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
    it("👥 All can't make a play if game's doesn't belong to user (POST /games/:id/play)", done => {
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
    it("🎲 Checks if game is waiting for 'all' to 'elect-mayor' (POST /games/:id/play)", done => {
        expect(game.waiting).to.deep.equals({ for: "all", to: "elect-mayor" });
        done();
    });
    it("👥 All can't elect mayor if play's source is not 'all' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("👥 All can't elect mayor if play's action is not 'elect-mayor' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("👥 All can't elect mayor if votes are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_REQUIRED");
                done();
            });
    });
    it("👥 All can't elect mayor if votes are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_CANT_BE_EMPTY");
                done();
            });
    });
    it("👥 All can't elect mayor if one vote has same target and source (POST /games/:id/play)", done => {
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
                expect(res.body.type).to.equals("SAME_VOTE_SOURCE_AND_TARGET");
                done();
            });
    });
    it("👥 All can't elect mayor if one vote has an unknown source (POST /games/:id/play)", done => {
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
                expect(res.body.type).to.equals("PLAYER_CANT_VOTE");
                done();
            });
    });
    it("👥 All can't elect mayor if one vote has an unknown target (POST /games/:id/play)", done => {
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
                expect(res.body.type).to.equals("PLAYER_CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👥 All can't elect mayor if player votes twice (POST /games/:id/play)", done => {
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
                expect(res.body.type).to.equals("PLAYER_CANT_VOTE_MULTIPLE_TIMES");
                done();
            });
    });
    it("👥 All can't elect mayor if there is a tie in votes (POST /games/:id/play)", done => {
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
                expect(res.body.type).to.equals("TIE_IN_VOTES");
                done();
            });
    });
    it("👥 All elect the mayor (POST /games/:id/play)", done => {
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
    it("🎲 Checks if game is waiting for 'seer' to 'look' (POST /games/:id/play)", done => {
        expect(game.waiting).to.deep.equals({ for: "seer", to: "look" });
        done();
    });
    it("🔮 Seer can't look if play's source is not 'seer' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🔮 Seer can't look if play's action is not 'look' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "elect-mayor" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🔮 Seer can't look if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🔮 Seer can't look if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🔮 Seer can't look at multiple targets (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { _id: players[0]._id },
                { _id: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🔮 Seer can't look at unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { _id: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("PLAYER_NOT_TARGETABLE");
                done();
            });
    });
    it("🔮 Seer can't look at herself (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { _id: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("SEER_CANT_LOOK_AT_HERSELF");
                done();
            });
    });
    it("🔮 Seer looks at the witch (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { _id: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ attribute: "seen", source: "seer" });
                expect(game.history[0].play.targets).to.exist;
                done();
            });
    });
    it("🎲 Checks if game is waiting for 'wolves' to 'eat' (POST /games/:id/play)", done => {
        expect(game.waiting).to.deep.equals({ for: "wolves", to: "eat" });
        done();
    });
    it("🐺 Wolves can't eat if play's source is not 'wolves' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🐺 Wolves can't eat if play's action is not 'eat' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "shoot" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🐺 Wolves can't eat if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🐺 Wolves can't eat if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🐺 Wolves can't eat multiple targets (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { _id: players[0]._id },
                { _id: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🐺 Wolves can't eat an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { _id: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("PLAYER_NOT_TARGETABLE");
                done();
            });
    });
    it("🐺 Wolves can't eat another wolf (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { _id: players[5]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("WOLVES_CANT_EAT_EACH_OTHER");
                done();
            });
    });
    it("🐺 Wolves eat the protector (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { _id: players[2]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "eaten", source: "wolves" });
                expect(game.history[0].play.targets).to.exist;
                done();
            });
    });
});