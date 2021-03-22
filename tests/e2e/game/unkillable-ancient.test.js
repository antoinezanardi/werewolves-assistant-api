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
    { name: "Dig", role: "witch" },
    { name: "Dag", role: "guard" },
    { name: "Dog", role: "werewolf" },
    { name: "D€g", role: "ancient" },
    { name: "Dôg", role: "scapegoat" },
    { name: "D∂g", role: "idiot" },
];
let server, token, game, players;

describe("P - Game with an ancient who survives from 3 werewolves attacks", () => {
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
            .send({ players: originalPlayers, options: { roles: { sheriff: { isEnabled: false } } } })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🌙 Night falls", done => {
        players = game.players;
        expect(game.phase).to.equal("night");
        done();
    });
    it("🛡 Guard protects himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[1]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the ancient (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[3].attributes).to.deep.include({ name: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.players[3].side.current).to.equal("villagers");
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("🪄 Witch uses life potion on ancient (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[3]._id, hasDrankLifePotion: true }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising and ancient is alive because witch saved him", done => {
        expect(game.phase).to.equal("day");
        expect(game.players[3].isAlive).to.be.true;
        expect(game.players[3].role.isRevealed).to.be.false;
        done();
    });
    it("⚖️ Stuttering judge can't request another vote if he is absent from the game (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[1]._id, for: players[0]._id }], doesJudgeRequestAnotherVote: true })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("STUTTERING_JUDGE_ABSENT");
                done();
            });
    });
    it("👪 All vote for the witch (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[1]._id, for: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].isAlive).to.be.false;
                expect(game.players[0].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🛡 Guard protects the ancient (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[3].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the ancient again (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("☀️ Sun is rising and ancient is alive because guard saved him", done => {
        expect(game.phase).to.equal("day");
        expect(game.players[3].isAlive).to.be.true;
        expect(game.players[3].role.isRevealed).to.be.false;
        done();
    });
    it("👪 All vote for the idiot, which is only revealed (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[2]._id, for: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].isAlive).to.be.true;
                expect(game.players[5].role.isRevealed).to.be.true;
                done();
            });
    });
    it("🛡 Guard protects himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[1]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the ancient again, again (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("☀️ Sun is rising and ancient is alive because he has a second life", done => {
        expect(game.phase).to.equal("day");
        expect(game.players[3].isAlive).to.be.true;
        expect(game.players[3].role.isRevealed).to.be.false;
        done();
    });
    it("👪 All vote for the scapegoat (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[2]._id, for: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].isAlive).to.be.false;
                expect(game.players[4].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🛡 Guard protects the idiot (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[5]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the ancient again, again and again ! (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("☀️ Sun is rising and ancient is finally dead and idiot too because he was already revealed", done => {
        expect(game.phase).to.equal("day");
        expect(game.players[3].isAlive).to.be.false;
        expect(game.players[3].role.isRevealed).to.be.true;
        expect(game.players[5].isAlive).to.be.false;
        expect(game.players[5].murdered).to.deep.equals({ by: "all", of: "reconsider" });
        done();
    });
    it("🎲 Cancels game (PATCH /games/:id)", done => {
        chai.request(server)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ status: "canceled" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equal("canceled");
                done();
            });
    });
    it("🎲 Creates game with JWT auth with ancient with only one life against werewolves and doesn't take his revenge (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                players: originalPlayers, options: {
                    roles: {
                        sheriff: { isEnabled: false },
                        ancient: { livesCountAgainstWerewolves: 1, doesTakeHisRevenge: false },
                    },
                },
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.options.roles.ancient.livesCountAgainstWerewolves).to.equal(1);
                expect(game.options.roles.ancient.doesTakeHisRevenge).to.be.false;
                done();
            });
    });
    it("🌙 Night falls", done => {
        players = game.players;
        expect(game.phase).to.equal("night");
        done();
    });
    it("🛡 Guard protects himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[1]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the ancient (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[3].attributes).to.deep.include({ name: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.players[3].side.current).to.equal("villagers");
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equal(players[3]._id);
                done();
            });
    });
    it("🪄 Witch skips (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising and ancient is dead because he has only one life against werewolves and no villagers are powerless", done => {
        expect(game.phase).to.equal("day");
        expect(game.players[3].isAlive).to.be.false;
        expect(game.players[0].attributes).to.not.exist;
        expect(game.players[1].attributes).to.be.an("array").lengthOf(0);
        expect(game.players[4].attributes).to.not.exist;
        expect(game.players[5].attributes).to.not.exist;
        done();
    });
});