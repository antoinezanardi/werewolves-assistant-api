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
    { name: "Dig", role: "witch" },
    { name: "Doug", role: "seer" },
    { name: "Dag", role: "guard" },
    { name: "Dug", role: "raven" },
    { name: "Dyg", role: "hunter" },
    { name: "Deg", role: "werewolf" },
    { name: "Dog", role: "villager" },
    { name: "Dœg", role: "little-girl" },
    { name: "Dºg", role: "villager-villager" },
    { name: "Dêg", role: "cupid" },
    { name: "Dæg", role: "two-sisters" },
    { name: "D∂g", role: "two-sisters" },
];
let token, game;

describe("B - Full game of 10 players with all roles", () => {
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
    it("🌟 Can't update game review if its status is `playing` (PATCH /games/:id)", done => {
        chai.request(app)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ review: { rating: 3 } })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        done();
    });
    it("🎲 Game is waiting for 'all' to 'elect-sheriff'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "all", to: "elect-sheriff" });
        done();
    });
    it("👪 All can't elect sheriff if play's source is not 'all' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("👪 All can't elect sheriff if play's action is not 'elect-sheriff' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "look" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("👪 All can't elect sheriff if votes are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_REQUIRED");
                done();
            });
    });
    it("👪 All can't elect sheriff if votes are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_CANT_BE_EMPTY");
                done();
            });
    });
    it("👪 All can't elect sheriff if one vote has same target and source (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("SAME_VOTE_SOURCE_AND_TARGET");
                done();
            });
    });
    it("👪 All can't elect sheriff if one vote has an unknown source (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: new mongoose.Types.ObjectId(), for: players[1]._id },
                    { from: players[0]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE");
                done();
            });
    });
    it("👪 All can't elect sheriff if one vote has an unknown target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: new mongoose.Types.ObjectId() },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👪 All can't elect sheriff if one player votes twice (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[0]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE_MULTIPLE_TIMES");
                done();
            });
    });
    it("👪 All can't elect sheriff if there is a tie in votes (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TIE_IN_VOTES");
                done();
            });
    });
    it("👪 All elect the little girl as the sheriff (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "elect-sheriff", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[7]._id },
                    { from: players[2]._id, for: players[7]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[7].attributes).to.deep.include({ attribute: "sheriff", source: "all" });
                expect(game.history[0].play.votes).to.exist;
                expect(game.history[0].play.votes[0].from._id).to.equals(game.players[0]._id);
                expect(game.history[0].play.votes[0].for._id).to.equals(game.players[1]._id);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[7]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'cupid' to 'charm'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "cupid", to: "charm" });
        done();
    });
    it("👼 Cupid can't charm if play's source is not 'cupid' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "charm" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("👼 Cupid can't charm if play's action is not 'charm' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "cupid", action: "shoot" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("👼 Cupid can't charm if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "cupid", action: "charm" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("👼 Cupid can't charm if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "cupid", action: "charm", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("👼 Cupid can't charm just one target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "cupid", action: "charm", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("👼 Cupid can't charm more than two targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "cupid", action: "charm", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                    { player: players[2]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("👼 Cupid can't charm unknown targets (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "cupid", action: "charm", targets: [
                    { player: new mongoose.Types.ObjectId() },
                    { player: new mongoose.Types.ObjectId() },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("👼 Cupid can't charm the same targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "cupid", action: "charm", targets: [
                    { player: players[2]._id },
                    { player: players[2]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NON_UNIQUE_TARGETS");
                done();
            });
    });
    it("👼 Cupid charms himself and the little girl (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "cupid", action: "charm", targets: [
                    { player: players[7]._id },
                    { player: players[9]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[7].attributes).to.deep.include({ attribute: "in-love", source: "cupid" });
                expect(game.players[9].attributes).to.deep.include({ attribute: "in-love", source: "cupid" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[7]._id);
                expect(game.history[0].play.targets[1].player._id).to.equals(players[9]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'lovers' to 'meet-each-other'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "lovers", to: "meet-each-other" });
        done();
    });
    it("💕 Lovers can't meet each other if play's source is not 'lovers' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "meet-each-other" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("💕 Lovers can't meet each other if play's action is not 'meet-each-other' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "lovers", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("💕 Lovers meet each other (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "lovers", action: "meet-each-other" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🎲 Game is waiting for 'seer' to 'look'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "seer", to: "look" });
        done();
    });
    it("🔮 Seer can't look if play's source is not 'seer' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
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
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "elect-sheriff" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🔮 Seer can't look if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
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
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🔮 Seer can't look at multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "seer", action: "look", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🔮 Seer can't look at unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🔮 Seer can't look at herself (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [{ player: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_LOOK_AT_HERSELF");
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
                expect(game.players[0].attributes).to.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[0]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'two-sisters' to 'meet-each-other'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "two-sisters", to: "meet-each-other" });
        done();
    });
    it("👭 The two sisters can't meet each other if play's source is not 'two-sisters' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "lovers", action: "meet-each-other" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("👭 The two sisters can't meet each other if play's action is not 'meet-each-other' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "two-sisters", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
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
    it("🎲 Game is waiting for 'raven' to 'mark'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "raven", to: "mark" });
        done();
    });
    it("🪶 Raven can't mark if play's source is not 'raven' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "villager", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🪶 Raven can't mark if play's action is not 'mark' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🪶 Raven can't mark multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "raven", action: "mark", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🪶 Raven can't mark an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🪶 Raven marks the villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[6].attributes).to.deep.include({ attribute: "raven-marked", source: "raven", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[6]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'guard' to 'protect'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "guard", to: "protect" });
        done();
    });
    it("🛡 Guard can't protect if play's source is not 'guard' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "protect" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🛡 Guard can't protect if play's action is not 'protect' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🛡 Guard can't protect if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🛡 Guard can't protect if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🛡 Guard can't protect multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "guard", action: "protect", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🛡 Guard can't protect an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🛡 Guard protects the werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].attributes).to.deep.include({ attribute: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[5]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'werewolves' to 'eat'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "werewolves", to: "eat" });
        done();
    });
    it("🐺 Werewolves can't eat if play's source is not 'werewolves' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🐺 Werewolves can't eat if play's action is not 'eat' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "shoot" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🐺 Werewolves can't eat if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🐺 Werewolves can't eat if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🐺 Werewolves can't eat multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "werewolves", action: "eat", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🐺 Werewolves can't eat an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🐺 Werewolves can't eat another werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_EAT_EACH_OTHER");
                done();
            });
    });
    it("🐺 Werewolves eat the guard (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'witch' to 'use-potion'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🪄 Witch can't use potion if play's source is not 'witch' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🪄 Witch can't use potion if play's action is not 'use-potion' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🪄 Witch can't use potion if one target doesn't have `potion` field (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGET_STRUCTURE");
                done();
            });
    });
    it("🪄 Witch can't use potion if one target have both `potion.life` and `potion.death` fields set to `true` (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[0]._id, potion: { life: true, death: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGET_STRUCTURE");
                done();
            });
    });
    it("🪄 Witch can't use potion on unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: new mongoose.Types.ObjectId(), potion: { life: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🪄 Witch can't use life potion on player not eaten by werewolves (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[0]._id, potion: { life: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_LIFE_POTION_USE");
                done();
            });
    });
    it("🪄 Witch can't use life potion and death potion on same target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "witch", action: "use-potion", targets: [
                    { player: players[2]._id, potion: { life: true } },
                    { player: players[2]._id, potion: { death: true } },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NON_UNIQUE_TARGETS");
                done();
            });
    });
    it("🪄 Witch can't use death potion twice (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "witch", action: "use-potion", targets: [
                    { player: players[0]._id, potion: { death: true } },
                    { player: players[1]._id, potion: { death: true } },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("ONLY_ONE_DEATH_POTION");
                done();
            });
    });
    it("🪄 Witch use life potion on guard (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[2]._id, potion: { life: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                expect(game.history[0].play.targets[0].potion.life).to.equals(true);
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "drank-life-potion", source: "witch", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "eaten", source: "werewolves", remainingPhases: 1 });
        expect(game.players[5].attributes).to.not.deep.include({ attribute: "protected", source: "guard", remainingPhases: 1 });
        expect(game.players[0].attributes).to.not.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
        expect(game.players[2].isAlive).to.equals(true);
        done();
    });
    it("🎲 Game is waiting for 'all' to 'vote'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "all", to: "vote" });
        done();
    });
    it("👪 All can't vote if play's source is not 'all' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("👪 All can't vote if play's action is not 'vote' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("👪 All can't vote if votes are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_REQUIRED");
                done();
            });
    });
    it("👪 All can't vote if votes are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_CANT_BE_EMPTY");
                done();
            });
    });
    it("👪 All can't vote if one vote has same target and source (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("SAME_VOTE_SOURCE_AND_TARGET");
                done();
            });
    });
    it("👪 All can't vote if one vote has an unknown source (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: new mongoose.Types.ObjectId(), for: players[1]._id },
                    { from: players[0]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE");
                done();
            });
    });
    it("👪 All can't vote if one vote has an unknown target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: new mongoose.Types.ObjectId() },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👪 All can't vote if one player votes twice (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[0]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE_MULTIPLE_TIMES");
                done();
            });
    });
    it("👪 Tie in votes between villager and werewolf [Reason: villager is raven-marked 🪶 and little girl, the sheriff, has double vote] (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[5]._id },
                    { from: players[2]._id, for: players[1]._id },
                    { from: players[3]._id, for: players[0]._id },
                    { from: players[4]._id, for: players[1]._id },
                    { from: players[5]._id, for: players[6]._id },
                    { from: players[7]._id, for: players[5]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[6].attributes).to.not.deep.include({ attribute: "raven-marked", source: "raven", remainingPhases: 1 });
                expect(game.players[5].isAlive).to.equals(true);
                expect(game.players[6].isAlive).to.equals(true);
                expect(game.history[0].play.votes).to.exist;
                done();
            });
    });
    it("🎲 Game is waiting for 'sheriff' to 'settle-votes'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "settle-votes" });
        done();
    });
    it("🎖 Sheriff can't settle votes if play's source is not 'sheriff' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "villager", action: "settle-votes" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🎖 Sheriff can't settle votes if play's action is not 'settle-votes' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🎖 Sheriff can't settle votes if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🎖 Sheriff can't settle votes if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🎖 Sheriff can't settle votes with multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "sheriff", action: "settle-votes", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🎖 Sheriff can't settle votes with unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🎖 Sheriff can't settle votes with player who was not in previous tie in votes (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes", targets: [{ player: players[0]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_CHOSEN_AS_TIEBREAKER");
                done();
            });
    });
    it("🎖 Sheriff settles votes by choosing villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "settle-votes", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].isAlive).to.equals(true);
                expect(game.players[6].isAlive).to.equals(false);
                expect(game.players[6].murdered).to.deep.equals({ by: "sheriff", of: "settle-votes" });
                expect(game.history[0].play.targets).to.exist;
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(2);
        done();
    });
    it("🎲 Game is waiting for 'seer' to 'look'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "seer", to: "look" });
        done();
    });
    it("🔮 Seer can't look at dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🔮 Seer looks at the guard (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'raven' to 'mark'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "raven", to: "mark" });
        done();
    });
    it("🪶 Raven can't mark a dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
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
    it("🎲 Game is waiting for 'guard' to 'protect'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "guard", to: "protect" });
        done();
    });
    it("🛡 Guard can't protect a dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🛡 Guard can't protect the same player twice in a row (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_PROTECT_TWICE");
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
                expect(game.players[2].attributes).to.deep.include({ attribute: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'werewolves' to 'eat'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "werewolves", to: "eat" });
        done();
    });
    it("🐺 Werewolves can't eat a dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[6]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🐺 Werewolves eat the guard (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'witch' to 'use-potion'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🪄 Witch can't use death potion on dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[6]._id, potion: { death: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🪄 Witch can't use life potion twice (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[2]._id, potion: { life: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("ONLY_ONE_LIFE_POTION");
                done();
            });
    });
    it("🪄 Witch use death potion on seer (POST /games/:id/play)", done => {
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
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[1].attributes).to.not.deep.include({ attribute: "drank-death-potion", source: "witch", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "eaten", source: "werewolves", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "protected", source: "guard", remainingPhases: 1 });
        expect(game.players[1].isAlive).to.equals(false);
        expect(game.players[1].murdered).to.deep.equals({ by: "witch", of: "use-potion" });
        expect(game.players[2].isAlive).to.equals(true);
        done();
    });
    it("🎲 Game is waiting for 'all' to 'vote'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "all", to: "vote" });
        done();
    });
    it("👪 All can't vote if one vote has a dead source (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[6]._id, for: players[1]._id },
                    { from: players[0]._id, for: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE");
                done();
            });
    });
    it("👪 All can't vote if one vote has a dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[6]._id },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👪 All vote for villager-villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[8].isAlive).to.equals(false);
                expect(game.players[8].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(3);
        done();
    });
    it("🎲 Game is waiting for 'two-sisters' to 'meet-each-other'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "two-sisters", to: "meet-each-other" });
        done();
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
    it("🎲 Game is waiting for 'raven' to 'mark'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "raven", to: "mark" });
        done();
    });
    it("🪶 Raven marks the hunter (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [{ player: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].attributes).to.deep.include({ attribute: "raven-marked", source: "raven", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[4]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'guard' to 'protect'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "guard", to: "protect" });
        done();
    });
    it("🛡 Guard protects the little girl (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "guard", action: "protect", targets: [{ player: players[7]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[7].attributes).to.deep.include({ attribute: "protected", source: "guard", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[7]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'wolves' to 'eat'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "werewolves", to: "eat" });
        done();
    });
    it("🐺 Werewolves eat the little girl (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[7]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[7].attributes).to.deep.include({ attribute: "eaten", source: "werewolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[7]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'witch' to 'use-potion'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🪄 Witch can't use death potion twice (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [{ player: players[3]._id, potion: { death: true } }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("ONLY_ONE_DEATH_POTION");
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
    it("☀️ Sun is rising, little girl is eaten even if protected by guard and cupid dies from broken heart 💔", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[7].attributes).to.not.deep.include({ attribute: "eaten", source: "werewolves", remainingPhases: 1 });
        expect(game.players[7].isAlive).to.equals(false);
        expect(game.players[7].murdered).to.deep.equals({ by: "werewolves", of: "eat" });
        expect(game.players[9].isAlive).to.equals(false);
        expect(game.players[9].murdered).to.deep.equals({ by: "cupid", of: "charm" });
        done();
    });
    it("🎲 Game is waiting for 'sheriff' to 'delegate'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "delegate" });
        done();
    });
    it("🎖 Sheriff can't delegate if play's source is not 'sheriff' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "villager", action: "delegate" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🎖 Sheriff can't delegate if play's action is not 'delegate' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🎖 Sheriff can't delegate if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🎖 Sheriff can't delegate if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🎖 Sheriff can't delegate to multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "sheriff", action: "delegate", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🎖 Sheriff can't delegate to unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🎖 Sheriff can't delegate to a dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [{ player: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🎖 Sheriff delegates to the hunter (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate", targets: [{ player: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.not.deep.include({ attribute: "sheriff", source: "all" });
                expect(game.players[4].attributes).to.deep.include({ attribute: "sheriff", source: "sheriff" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[4]._id);
                done();
            });
    });
    it("👪 All vote for hunter (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[3]._id, for: players[4]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].isAlive).to.equals(false);
                expect(game.players[4].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🎲 Game is waiting for 'hunter' to 'shoot' and 'sheriff' to 'delegate'", done => {
        expect(game.waiting[0]).to.deep.equals({ for: "hunter", to: "shoot" });
        expect(game.waiting[1]).to.deep.equals({ for: "sheriff", to: "delegate" });
        done();
    });
    it("🔫 Hunter can't shoot if play's source is not 'hunter' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "raven", action: "shoot" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🔫 Hunter can't shoot if play's action is not 'shoot' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🔫 Hunter can't shoot if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🔫 Hunter can't shoot if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🔫 Hunter can't shoot at multiple targets (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "hunter", action: "shoot", targets: [
                    { player: players[0]._id },
                    { player: players[1]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🔫 Hunter can't shoot at an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot", targets: [{ player: new mongoose.Types.ObjectId() }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🔫 Hunter can't shoot at a dead target (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot", targets: [{ player: players[8]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🔫 Hunter shoots at the werewolf (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "hunter", action: "shoot", targets: [{ player: players[5]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].isAlive).to.equals(false);
                expect(game.players[5].murdered).to.deep.equals({ by: "hunter", of: "shoot" });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[5]._id);
                done();
            });
    });
    it("🎲 Game is WON by 'villagers'!!", done => {
        expect(game.status).to.equals("done");
        expect(game.won.by).to.equals("villagers");
        expect(game.waiting[0]).to.deep.equals({ for: "sheriff", to: "delegate" });
        done();
    });
    it("🔐 Can't make a play if game's done (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "sheriff", action: "delegate" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NO_MORE_PLAY_ALLOWED");
                done();
            });
    });
    it("🌟 Can't update game review if `rating` is absent (PATCH /games/:id)", done => {
        chai.request(app)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ review: { comment: "That was ok.." } })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
    it("🌟 Setting game review of 3.5 stars (PATCH /games/:id)", done => {
        chai.request(app)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ review: { rating: 3.5, comment: "That was ok..", dysfunctionFound: true } })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.review.rating).to.equals(3.5);
                expect(game.review.dysfunctionFound).to.be.true;
                done();
            });
    });
    it("🌟 Can update game review (PATCH /games/:id)", done => {
        chai.request(app)
            .patch(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ review: { rating: 3.5, comment: "That was ok..", dysfunctionFound: true } })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.review.rating).to.equals(3.5);
                expect(game.review.dysfunctionFound).to.be.true;
                done();
            });
    });
});

/*
 * const players = [
 *     { name: "0Dig", role: "witch" },
 *     { name: "1Doug", role: "seer" },
 *     { name: "2Dag", role: "guard" },
 *     { name: "3Dug", role: "raven" },
 *     { name: "4Dyg", role: "hunter" },
 *     { name: "5Deg", role: "werewolf" },
 *     { name: "6Dog", role: "villager" },
 *     { name: "7Diig", role: "little-girl" },
 *     { name: "8Diig", role: "villager-villager" },
 *     { name: "9Dêg", role: "cupid" },
 * ];
 */