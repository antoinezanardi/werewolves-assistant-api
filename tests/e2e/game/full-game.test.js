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
    { name: "Dog", role: "villager" },
];
let token, game;

// eslint-disable-next-line max-lines-per-function
describe("B - Full game of 6 players with all roles", () => {
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
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        done();
    });
    it("🎲 Game is waiting for 'all' to 'elect-mayor'", done => {
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
                expect(res.body.type).to.equals("CANT_VOTE");
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
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👥 All can't elect mayor if one player votes twice (POST /games/:id/play)", done => {
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
                expect(res.body.type).to.equals("CANT_VOTE_MULTIPLE_TIMES");
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
    it("👥 All elect the witch as the mayor (POST /games/:id/play)", done => {
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
                expect(game.history[0].play.votes[0].from._id).to.equals(game.players[0]._id);
                expect(game.history[0].play.votes[0].for._id).to.equals(game.players[1]._id);
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(game.players[0]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'seer' to 'look'", done => {
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
                { player: players[0]._id },
                { player: players[1]._id },
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
                { player: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🔮 Seer can't look at herself (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { player: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_LOOK_AT_HERSELF");
                done();
            });
    });
    it("🔮 Seer looks at the witch (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { player: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[0]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'wolves' to 'eat'", done => {
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
                { player: players[0]._id },
                { player: players[1]._id },
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
                { player: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🐺 Wolves can't eat another wolf (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { player: players[5]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_EAT_EACH_OTHER");
                done();
            });
    });
    it("🐺 Wolves eat the protector (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { player: players[2]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "eaten", source: "wolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'witch' to 'use-potion'", done => {
        expect(game.waiting).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🧹 Witch can't use potion if play's source is not 'witch' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🧹 Witch can't use potion if play's action is not 'use-potion' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🧹 Witch can't use potion if one target doesn't have `potion` field (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGET_STRUCTURE");
                done();
            });
    });
    it("🧹 Witch can't use potion if one target have both `potion.life` and `potion.death` fields set to `true` (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[0]._id, potion: { life: true, death: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGET_STRUCTURE");
                done();
            });
    });
    it("🧹 Witch can't use potion on unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: mongoose.Types.ObjectId(), potion: { life: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🧹 Witch can't use life potion on player not eaten by wolves (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[0]._id, potion: { life: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_LIFE_POTION_USE");
                done();
            });
    });
    it("🧹 Witch can't use life potion and death potion on same target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[2]._id, potion: { life: true } },
                { player: players[2]._id, potion: { death: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NON_UNIQUE_TARGETS");
                done();
            });
    });
    it("🧹 Witch can't use death potion twice (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[0]._id, potion: { death: true } },
                { player: players[1]._id, potion: { death: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("ONLY_ONE_DEATH_POTION");
                done();
            });
    });
    it("🧹 Witch use life potion on protector (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[2]._id, potion: { life: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "drank-life-potion", source: "witch", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                expect(game.history[0].play.targets[0].potion.life).to.equals(true);
                done();
            });
    });
    it("🎲 Game is waiting for 'protector' to 'protect'", done => {
        expect(game.waiting).to.deep.equals({ for: "protector", to: "protect" });
        done();
    });
    it("🛡 Protector can't protect if play's source is not 'protector' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "protect" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🛡 Protector can't protect if play's action is not 'protect' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🛡 Protector can't protect if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🛡 Protector can't protect if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🛡 Protector can't protect multiple targets (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [
                { player: players[0]._id },
                { player: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🛡 Protector can't protect an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [
                { player: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🛡 Protector protects the wolf (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [
                { player: players[5]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].attributes).to.deep.include({ attribute: "protected", source: "protector", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[5]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'raven' to 'mark'", done => {
        expect(game.waiting).to.deep.equals({ for: "raven", to: "mark" });
        done();
    });
    it("🐦 Raven can't mark if play's source is not 'raven' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "villager", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🐦 Raven can't mark if play's action is not 'mark' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "use-potion" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🐦 Raven can't mark multiple targets (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [
                { player: players[0]._id },
                { player: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🐦 Raven can't mark an unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [
                { player: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🐦 Raven marks the villager (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [
                { player: players[6]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[6].attributes).to.deep.include({ attribute: "raven-marked", source: "raven", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[6]._id);
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "drank-life-potion", source: "witch", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "eaten", source: "wolves", remainingPhases: 1 });
        expect(game.players[5].attributes).to.not.deep.include({ attribute: "protected", source: "protector", remainingPhases: 1 });
        expect(game.players[0].attributes).to.not.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
        expect(game.players[2].isAlive).to.equals(true);
        done();
    });
    it("🎲 Game is waiting for 'all' to 'vote'", done => {
        expect(game.waiting).to.deep.equals({ for: "all", to: "vote" });
        done();
    });
    it("👥 All can't vote if play's source is not 'all' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("👥 All can't vote if play's action is not 'vote' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("👥 All can't vote if votes are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_REQUIRED");
                done();
            });
    });
    it("👥 All can't vote if votes are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("VOTES_CANT_BE_EMPTY");
                done();
            });
    });
    it("👥 All can't vote if one vote has same target and source (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[1]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("SAME_VOTE_SOURCE_AND_TARGET");
                done();
            });
    });
    it("👥 All can't vote if one vote has an unknown source (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: mongoose.Types.ObjectId(), for: players[1]._id },
                { from: players[0]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE");
                done();
            });
    });
    it("👥 All can't vote if one vote has an unknown target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[0]._id, for: mongoose.Types.ObjectId() },
                { from: players[1]._id, for: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👥 All can't vote if one player votes twice (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[0]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE_MULTIPLE_TIMES");
                done();
            });
    });
    it("👥 Tie in votes between villager and wolf [Reason: villager is raven-marked 🐦]  (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[0]._id, for: players[1]._id },
                { from: players[1]._id, for: players[5]._id },
                { from: players[2]._id, for: players[5]._id },
                { from: players[3]._id, for: players[1]._id },
                { from: players[4]._id, for: players[5]._id },
                { from: players[5]._id, for: players[6]._id },
            ] })
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
    it("🎲 Game is waiting for 'mayor' to 'settle-votes'", done => {
        expect(game.waiting).to.deep.equals({ for: "mayor", to: "settle-votes" });
        done();
    });
    it("🎖 Mayor can't settle votes if play's source is not 'mayor' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "villager", action: "settle-votes" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_SOURCE");
                done();
            });
    });
    it("🎖 Mayor can't settle votes if play's action is not 'settle-votes' (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "eat" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_PLAY_ACTION");
                done();
            });
    });
    it("🎖 Mayor can't settle votes if targets are not set (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "settle-votes" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_REQUIRED");
                done();
            });
    });
    it("🎖 Mayor can't settle votes if targets are empty (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "settle-votes", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("TARGETS_CANT_BE_EMPTY");
                done();
            });
    });
    it("🎖 Mayor can't settle votes with multiple targets (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "settle-votes", targets: [
                { player: players[0]._id },
                { player: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_TARGETS_LENGTH");
                done();
            });
    });
    it("🎖 Mayor can't settle votes with unknown target (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "settle-votes", targets: [
                { player: mongoose.Types.ObjectId() },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🎖 Mayor can't settle votes with player who was not in previous tie in votes (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "settle-votes", targets: [
                { player: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_CHOSEN_AS_TIEBREAKER");
                done();
            });
    });
    it("🎖 Mayor settles votes by choosing villager (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "mayor", action: "settle-votes", targets: [
                { player: players[6]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[5].isAlive).to.equals(true);
                expect(game.players[6].isAlive).to.equals(false);
                expect(game.players[6].murdered).to.deep.equals({ by: "mayor", of: "settle-votes" });
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
        expect(game.waiting).to.deep.equals({ for: "seer", to: "look" });
        done();
    });
    it("🔮 Seer can't look at dead target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { player: players[6]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🔮 Seer looks at the protector (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "seer", action: "look", targets: [
                { player: players[2]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'wolves' to 'eat'", done => {
        expect(game.waiting).to.deep.equals({ for: "wolves", to: "eat" });
        done();
    });
    it("🐺 Wolves can't eat a dead target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { player: players[6]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🐺 Wolves eat the protector (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { player: players[2]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "eaten", source: "wolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'witch' to 'use-potion'", done => {
        expect(game.waiting).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🧹 Witch can't use death potion on dead target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[6]._id, potion: { death: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🧹 Witch can't use life potion twice (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[2]._id, potion: { life: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("ONLY_ONE_LIFE_POTION");
                done();
            });
    });
    it("🧹 Witch use death potion on seer (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[1]._id, potion: { death: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].attributes).to.deep.include({ attribute: "drank-death-potion", source: "witch", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[1]._id);
                expect(game.history[0].play.targets[0].potion.death).to.equals(true);
                done();
            });
    });
    it("🎲 Game is waiting for 'protector' to 'protect'", done => {
        expect(game.waiting).to.deep.equals({ for: "protector", to: "protect" });
        done();
    });
    it("🛡 Protector can't protect a dead target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [
                { player: players[6]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🛡 Protector can't protect the same player twice in a row (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [
                { player: players[5]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_PROTECT_TWICE");
                done();
            });
    });
    it("🛡 Protector protects himself (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "protector", action: "protect", targets: [
                { player: players[2]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].attributes).to.deep.include({ attribute: "protected", source: "protector", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[2]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'raven' to 'mark'", done => {
        expect(game.waiting).to.deep.equals({ for: "raven", to: "mark" });
        done();
    });
    it("🐦 Raven can't mark a dead target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [
                { player: players[6]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NOT_TARGETABLE");
                done();
            });
    });
    it("🐦 Raven skips (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "mark" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.not.exist;
                done();
            });
    });
    it("☀️ Sun is rising", done => {
        expect(game.phase).to.equals("day");
        expect(game.players[1].attributes).to.not.deep.include({ attribute: "drank-death-potion", source: "witch", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "seen", source: "seer", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "eaten", source: "wolves", remainingPhases: 1 });
        expect(game.players[2].attributes).to.not.deep.include({ attribute: "protected", source: "protector", remainingPhases: 1 });
        expect(game.players[1].isAlive).to.equals(false);
        expect(game.players[1].murdered).to.deep.equals({ by: "witch", of: "use-potion" });
        expect(game.players[2].isAlive).to.equals(true);
        done();
    });
    it("🎲 Game is waiting for 'all' to 'vote'", done => {
        expect(game.waiting).to.deep.equals({ for: "all", to: "vote" });
        done();
    });
    it("👥 All can't vote if one vote has a dead source (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[6]._id, for: players[1]._id },
                { from: players[0]._id, for: players[1]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_VOTE");
                done();
            });
    });
    it("👥 All can't vote if one vote has a dead target (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[0]._id, for: players[6]._id },
                { from: players[1]._id, for: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_VOTE_TARGET");
                done();
            });
    });
    it("👥 All vote for protector (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [
                { from: players[0]._id, for: players[2]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].isAlive).to.equals(false);
                expect(game.players[2].murdered).to.deep.equals({ by: "all", of: "vote" });
                done();
            });
    });
    it("🌙 Night falls", done => {
        expect(game.phase).to.equals("night");
        expect(game.turn).to.equals(3);
        done();
    });
    it("🎲 Game is waiting for 'wolves' to 'eat'", done => {
        expect(game.waiting).to.deep.equals({ for: "wolves", to: "eat" });
        done();
    });
    it("🐺 Wolves eat the witch (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "wolves", action: "eat", targets: [
                { player: players[0]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[0].attributes).to.deep.include({ attribute: "eaten", source: "wolves", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[0]._id);
                done();
            });
    });
    it("🎲 Game is waiting for 'witch' to 'use-potion'", done => {
        expect(game.waiting).to.deep.equals({ for: "witch", to: "use-potion" });
        done();
    });
    it("🧹 Witch can't use death potion twice (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [
                { player: players[3]._id, potion: { death: true } },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("ONLY_ONE_DEATH_POTION");
                done();
            });
    });
    it("🧹 Witch skips (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "witch", action: "use-potion", targets: [] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.targets).to.not.exist;
                done();
            });
    });
    it("🎲 Game is waiting for 'raven' to 'mark'", done => {
        expect(game.waiting).to.deep.equals({ for: "raven", to: "mark" });
        done();
    });
    it("🐦 Raven marks the hunter (POST /games/:id/play)", done => {
        const { players } = game;
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "raven", action: "mark", targets: [
                { player: players[4]._id },
            ] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[4].attributes).to.deep.include({ attribute: "raven-marked", source: "raven", remainingPhases: 1 });
                expect(game.history[0].play.targets).to.exist;
                expect(game.history[0].play.targets[0].player._id).to.equals(players[4]._id);
                done();
            });
    });
});

// const players = [
//     { name: "0Dig", role: "witch" },
//     { name: "1Doug", role: "seer" }, X
//     { name: "2Dag", role: "protector" }, X
//     { name: "3Dug", role: "raven" },
//     { name: "4Dyg", role: "hunter" },
//     { name: "5Deg", role: "wolf" },
//     { name: "6Dog", role: "villager" }, X
// ];