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
    { name: "Dig", role: "hunter" },
    { name: "Deg", role: "witch" },
    { name: "Dog", role: "villager" },
];
let token, game;

describe("I - Tiny game of 4 players with no winner at the end", () => {
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
    it("🔐 Can't make a play if game's doesn't belong to user (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${new mongoose.Types.ObjectId()}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equals("GAME_DOESNT_BELONG_TO_USER");
                done();
            });
    });
    it("👪 All elect the hunter as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[2]._id, for: players[1]._id },
                    { from: players[3]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🐺 Werewolf eats the villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🧹 Witch use life potion on villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[3]._id, potion: { life: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[3]._id);
                expect(game.history[0].play.targets[0].potion.life).to.equals(true);
                done();
            });
    });
    it("☀️ Sun is rising and villager is dead", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[1].isAlive).to.equals(true);
        done();
    });
    it("👪 All vote for villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[3].isAlive).to.equals(false);
                expect(game.players[3].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(2);
        done();
    });
    it("🐺 Werewolf eats the witch (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🧹 Witch use death potion on hunter (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[1]._id, potion: { death: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[1]._id);
                expect(game.history[0].play.targets[0].potion.death).to.equals(true);
                done();
            });
    });
    it("🎲 Game is not finished and is waiting for for 'hunter' to 'shoot'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "hunter", to: "shoot" });
        done();
    });
    it("🔫 Hunter shoots at the last werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].isAlive).to.equals(false);
                done();
            });
    });
    it("🎲 Game is WON by... nobody ..!", done => {
        expect(game.status).to.equals("done");
        expect(game.won.by).to.equals(null);
        expect(game.won.players).to.not.exist;
        done();
    });
});

/*
 * const players = [
 *     { name: "0Dag", role: "werewolf" },
 *     { name: "1Dig", role: "hunter" },
 *     { name: "2Deg", role: "witch" },
 *     { name: "3Dog", role: "villager" }, X
 * ];
 */