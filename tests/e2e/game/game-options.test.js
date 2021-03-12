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
    { name: "Dag", role: "werewolf" },
    { name: "Dig", role: "two-sisters" },
    { name: "Deg", role: "two-sisters" },
    { name: "Dog", role: "three-brothers" },
    { name: "Dug", role: "three-brothers" },
    { name: "Dyg", role: "three-brothers" },
    { name: "Dπg", role: "villager" },
    { name: "Dœg", role: "raven" },
    { name: "D–g", role: "guard" },
    { name: "DÁg", role: "little-girl" },
];
let server, token, game, players;

describe("K - Game options", () => {
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
    it("🎲 Creates game with brothers and sisters waking up every night, sheriff has regular vote, seer is talkative and raven penalty to 3 with JWT auth (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                players: originalPlayers,
                options: {
                    repartition: { isHidden: true },
                    roles: {
                        areRevealedOnDeath: false,
                        sheriff: { hasDoubledVote: false },
                        seer: { isTalkative: false, canSeeRoles: false },
                        guard: { canProtectTwice: true },
                        twoSisters: { wakingUpInterval: 1 },
                        threeBrothers: { wakingUpInterval: 1 },
                        raven: { markPenalty: 3 },
                    },
                },
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.options.repartition.isHidden).to.be.true;
                expect(game.options.roles.areRevealedOnDeath).to.be.false;
                expect(game.options.roles.sheriff.hasDoubledVote).to.be.false;
                expect(game.options.roles.seer.isTalkative).to.be.false;
                expect(game.options.roles.seer.canSeeRoles).to.be.false;
                expect(game.options.roles.guard.canProtectTwice).to.be.true;
                expect(game.options.roles.twoSisters.wakingUpInterval).to.equals(1);
                expect(game.options.roles.threeBrothers.wakingUpInterval).to.equals(1);
                expect(game.options.roles.raven.markPenalty).to.equals(3);
                done();
            });
    });
    it("👪 All elect the werewolf as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[2]._id, for: players[0]._id },
                    { from: players[3]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👭 The two sisters meet each other (POST /games/:id/play)", done => {
        chai.request(server)
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
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "three-brothers", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🪶 Raven marks the werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ name: "raven-marked", source: "raven", remainingPhases: 2 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[0]._id);
                done();
            });
    });
    it("🛡 Guard protects himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[8].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[8]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        done();
    });
    it("👪 Werewolf (sheriff) and three other players votes for one brother and the brother votes for the werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[5]._id },
                    { from: players[1]._id, for: players[5]._id },
                    { from: players[2]._id, for: players[5]._id },
                    { from: players[3]._id, for: players[5]._id },
                    { from: players[5]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].isAlive).to.be.true;
                done();
            });
    });
    it("🎲 Game is waiting for 'sheriff' to 'settle-votes' because his vote is a regular vote according to game options", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "settle-votes" });
        done();
    });
    it("🎖 Sheriff settles votes by choosing villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].isAlive).to.be.false;
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(2);
        done();
    });
    it("🎲 Game is waiting for 'two-sisters' to 'meet-each-other' because they wake up every night according to game options", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "two-sisters", to: "meet-each-other" });
        done();
    });
    it("👭 The two sisters meet each other (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "two-sisters", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🎲 Game is waiting for 'three-brothers' to 'meet-each-other' because they wake up every night according to game options", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "three-brothers", to: "meet-each-other" });
        done();
    });
    it("👨‍👨‍👦 The three brothers meet each other (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "three-brothers", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🪶 Raven skips (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🛡 Guard protects himself again because option allows him (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[8].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[8]._id);
                done();
            });
    });
    it("🐺 Werewolf eats one of the two sisters (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        done();
    });
    it("👪 Werewolf (sheriff) votes for one of the two remaining brothers (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].isAlive).to.be.false;
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(3);
        done();
    });
    it("🎲 Game is waiting for 'raven' to 'mark' because sisters and brothers are all alone", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "raven", to: "mark" });
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
                expect(game.status).to.equals("canceled");
                done();
            });
    });
    it("🎲 Creates game with brothers and sisters never waking up after first night (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                players: originalPlayers,
                options: {
                    brothersWakingUpInterval: 0,
                    sistersWakingUpInterval: 0,
                },
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 All elect the werewolf as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[2]._id, for: players[0]._id },
                    { from: players[3]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👭 The two sisters meet each other (POST /games/:id/play)", done => {
        chai.request(server)
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
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "three-brothers", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🪶 Raven skips (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🛡 Guard protects himself again because option allows him (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[8].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[8]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        done();
    });
    it("👪 Werewolf (sheriff) votes for one of the two remaining brothers (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].isAlive).to.be.false;
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(2);
        done();
    });
    it("🎲 Game is waiting for 'raven' to 'mark' because brothers and sisters are never waking up again according to game options", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "raven", to: "mark" });
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
                expect(game.status).to.equals("canceled");
                done();
            });
    });
    it("🎲 Creates game with disabled sheriff option, brothers and sisters waking up only the first night, raven penalty to 1 and little girl is protected by guard with JWT auth (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                players: originalPlayers,
                options: {
                    roles: {
                        sheriff: { isEnabled: false },
                        littleGirl: { isProtectedByGuard: true },
                        twoSisters: { wakingUpInterval: 0 },
                        threeBrothers: { wakingUpInterval: 0 },
                        raven: { markPenalty: 1 },
                    },
                },
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.options.roles.sheriff.isEnabled).to.be.false;
                done();
            });
    });
    it("👭 The two sisters meet each other already because there is no sheriff to elect (POST /games/:id/play)", done => {
        chai.request(server)
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
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "three-brothers", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🪶 Raven mark a brother (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🛡 Guard protects the little girl (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[9]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[9].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[9]._id);
                done();
            });
    });
    it("🐺 Werewolf eats the little girl (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[9]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising and little girl is alive because option for protecting her is set to true", done => {
        expect(game.players[9].isAlive).to.be.true;
        expect(game.phase).to.equals("day");
        done();
    });
    it("👪 Tie in votes between the werewolf and one of the two sisters (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[1]._id, for: players[0]._id },
                    { from: players[0]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votesResult).to.equals("need-settlement");
                expect(game.players[0].isAlive).to.be.true;
                expect(game.players[1].isAlive).to.be.true;
                expect(game.players[5].isAlive).to.be.true;
                done();
            });
    });
    it("🎲 Game is waiting for 'all' to 'vote' again because there is no sheriff to settle votes", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "all", to: "vote" });
        done();
    });
    it("👪 All can't vote if one vote target is not one of the players in the previous tie in votes (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[3]._id },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👪 Another tie in votes between the werewolf, one of the two sisters and one of the three brothers, then nobody dies (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[0]._id },
                    { from: players[2]._id, for: players[1]._id },
                    { from: players[3]._id, for: players[0]._id },
                    { from: players[4]._id, for: players[5]._id },
                    { from: players[7]._id, for: players[5]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].isAlive).to.be.true;
                expect(game.players[1].isAlive).to.be.true;
                expect(game.players[5].isAlive).to.be.true;
                expect(game.history[0].play.votesResult).to.equals("no-death");
                expect(game.history[0].deadPlayers).to.not.exist;
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(2);
        done();
    });
    it("🪶 Raven skips (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("🛡 Guard protects himself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[8].attributes).to.deep.include({ name: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[8]._id);
                done();
            });
    });
    it("🐺 Werewolf eats one of the three brothers (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        done();
    });
    it("👪 Tie in votes between the two sisters (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[2]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votesResult).to.equals("need-settlement");
                expect(game.players[1].isAlive).to.be.true;
                expect(game.players[2].isAlive).to.be.true;
                done();
            });
    });
    it("👪 All vote for the second sister (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[2]._id },
                    { from: players[1]._id, for: players[2]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].isAlive).to.be.true;
                expect(game.players[2].isAlive).to.be.false;
                expect(game.history[0].play.votesResult).to.equals("death");
                expect(game.history[0].deadPlayers).to.be.an("array").lengthOf(1);
                expect(game.history[0].deadPlayers[0]._id).to.be.equals(game.players[2]._id);
                done();
            });
    });
});