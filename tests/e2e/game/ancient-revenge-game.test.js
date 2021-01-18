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
    { name: "Dig", role: "witch" },
    { name: "D∞g", role: "seer" },
    { name: "Dag", role: "guard" },
    { name: "Dug", role: "raven" },
    { name: "Dyg", role: "hunter" },
    { name: "Dog", role: "vile-father-of-wolves" },
    { name: "Dæg", role: "two-sisters" },
    { name: "D∂g", role: "two-sisters" },
    { name: "D®g", role: "three-brothers" },
    { name: "D†g", role: "three-brothers" },
    { name: "Dπg", role: "three-brothers" },
    { name: "D¬g", role: "wild-child" },
    { name: "D€g", role: "ancient" },
    { name: "Dœg", role: "scapegoat" },
    { name: "D•g", role: "pied-piper" },
    { name: "Dêg", role: "idiot" },
];
let token, game;

describe("L - Game with various villagers who loose their power because they kill ancient", () => {
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
    it("🌙 Night falls", done => {
        players = game.players;
        expect(game.phase).to.equals("night");
        done();
    });
    it("👪 All elect the idiot as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff", votes: [{ from: players[0]._id, for: players[15]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[15].attributes).to.deep.include({ name: "sheriff", source: "all" });
                expect(game.history).to.be.an("array").to.have.lengthOf(1);
                expect(game.history[0].play.votes).to.exist;
                expect(game.history[0].play.votes[0].from._id).to.equals(game.players[0]._id);
                expect(game.history[0].play.votes[0].for._id).to.equals(game.players[15]._id);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[15]._id);
                expect(game.history[0].play.source.name).to.equal("all");
                expect(game.history[0].play.source.players).to.be.an("array").to.have.lengthOf(players.length);
                expect(game.history[0].deadPlayers).to.not.exist;
                done();
            });
    });
    it("🔮 Seer looks at the witch (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ name: "seen", source: "seer", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[0]._id);
                done();
            });
    });
    it("👭 The two sisters meet each other (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "two-sisters", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("👨‍👨‍👦 The three brothers meet each other (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "three-brothers", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🐒 Wild child chooses the ancient as a model (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "wild-child", action: "choose-model", targets: [{ player: players[12]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[12].attributes).to.deep.include({ name: "worshiped", source: "wild-child" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[12]._id);
                done();
            });
    });
    it("🪶 Raven skips (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.not.exist;
                done();
            });
    });
    it("🛡 Guard protects himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🐺 Vile father of wolves eats the ancient and infects him but ancient is not affected (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[12]._id, isInfected: true }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[12].attributes).to.deep.include({ name: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.players[12].side.current).to.equals("villagers");
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[12]._id);
                expect(game.history[0].play.targets[0].isInfected).to.be.true;
                done();
            });
    });
    it("🪄 Witch skips (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.not.exist;
                done();
            });
    });
    it("📣 Pied piper charms witch and seer (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "pied-piper", action: "charm", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ name: "charmed", source: "pied-piper" });
                expect(game.players[1].attributes).to.deep.include({ name: "charmed", source: "pied-piper" });
                done();
            });
    });
    it("🕺️ Charmed players meet each other (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "charmed", action: "meet-each-other" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[12].isAlive).to.equals(true);
        done();
    });
    it("👪 All vote for the ancient, revenge is on: all villagers are powerless (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[12]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[12].isAlive).to.equals(false);
                expect(game.players[12].murdered).to.deep.equals({ by: "all", of: "vote" });
                expect(game.players[0].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[1].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[2].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[3].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[4].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[5].attributes).to.not.exist;
                expect(game.players[6].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[7].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[8].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[9].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[10].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[11].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[11].side.current).to.equals("villagers");
                expect(game.players[13].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[14].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                expect(game.players[15].attributes).to.deep.include({ name: "powerless", source: "ancient" });
                done();
            });
    });
    it("🐺 Vile father of wolves is the only one called during the night and eats guard (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].side.current).to.equals("villagers");
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[4]._id);
                done();
            });
    });
    it("👪 All vote for the raven (POST /games/:id/play)", done => {
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
    it("🎲 Game is waiting for 'werewolves' to 'eat'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "werewolves", to: "eat" });
        done();
    });
    it("🐺 Vile father of wolves is the only one called during the night and eats the witch (POST /games/:id/play)", done => {
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
    it("👪 Tie in vote between the idiot and one sister (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[5]._id, for: players[15]._id },
                    { from: players[7]._id, for: players[6]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[6].isAlive).to.be.true;
                expect(game.players[15].isAlive).to.be.true;
                done();
            });
    });
    it("🎲 Game is waiting for 'sheriff' to 'settle-votes' because scapegoat is powerless", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "settle-votes" });
        done();
    });
    it("🎖 Sheriff settles votes by choosing the sister (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[6].isAlive).to.be.false;
                expect(game.players[15].isAlive).to.be.true;
                done();
            });
    });
    it("🐺 Vile father of wolves is the only one called during the night and eats the other sister (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[7]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[7]._id);
                done();
            });
    });
    it("👪 All vote for the idiot who is the sheriff, he dies from votes because he's powerless (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[5]._id, for: players[15]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[15].isAlive).to.be.false;
                expect(game.players[15].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🎲 Game is waiting for 'sheriff' to 'delegate' because idiot is powerless", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "delegate" });
        done();
    });
    it("🎖 Sheriff delegates to the vile father of wolves (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].attributes).to.deep.include({ name: "sheriff", source: "sheriff" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[5]._id);
                done();
            });
    });
});