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
    { name: "Dag", role: "white-werewolf" },
    { name: "Dig", role: "werewolf" },
    { name: "Deg", role: "witch" },
    { name: "Dog", role: "villager" },
];
let token, game;

describe("R - Tiny game of 4 players in which the white werewolf is the last survivor, and so wins alone", () => {
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
            .send({ players, options: { roles: { sheriff: { isEnabled: false } } } })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
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
    it("🐺 White werewolf eats the werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "white-werewolf", action: "eat", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ name: "eaten", source: "white-werewolf", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[1]._id);
                done();
            });
    });
    it("🪄 Witch can't use life potion on player eaten by white-werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[1]._id, hasDrankLifePotion: true }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_LIFE_POTION_USE");
                done();
            });
    });
    it("🪄 Witch use death potion on villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[3]._id, hasDrankDeathPotion: true }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🎲 Game is WON by the white werewolf !", done => {
        expect(game.status).to.equals("done");
        expect(game.won.by).to.equals("white-werewolf");
        expect(game.won.players).to.be.an("array").lengthOf(1);
        expect(game.won.players[0]._id).to.equals(game.players[0]._id);
        done();
    });
});