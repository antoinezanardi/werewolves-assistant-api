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
    { name: "Dag", role: "werewolf" },
    { name: "Dig", role: "stuttering-judge" },
    { name: "Deg", role: "villager" },
    { name: "Dog", role: "villager" },
];
let server, token, game;

describe("S - Tiny game of 4 players in which there is no sheriff and a stuttering judge which make a lot of consecutive votes", () => {
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
            .send({ players, options: { roles: { sheriff: { isEnabled: false } } } })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("⚖️ Stuttering judge chooses sign (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "stuttering-judge", action: "choose-sign" })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("⚖️ Stuttering judge can't request a second vote if action is not 'vote' (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }], doesJudgeRequestAnotherVote: true })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_PLAY_ACTION_FOR_JUDGE_REQUEST");
                done();
            });
    });
    it("🐺 Werewolf eats a villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "werewolves", action: "eat", targets: [{ player: players[3]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                done();
            });
    });
    it("👪 Tie in votes between werewolf and villager and stuttering judge requests another vote (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[2]._id },
                    { from: players[2]._id, for: players[0]._id },
                ], doesJudgeRequestAnotherVote: true,
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votesResult).to.equal("need-settlement");
                expect(game.players[0].isAlive).to.be.true;
                expect(game.players[2].isAlive).to.be.true;
                expect(game.waiting).to.be.an("array").lengthOf(2);
                expect(game.waiting[0]).to.be.deep.equals({ for: "all", to: "vote" });
                expect(game.waiting[1]).to.be.deep.equals({ for: "all", to: "vote", cause: "stuttering-judge-request" });
                done();
            });
    });
    it("👪 All vote for villager (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[2]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[2].isAlive).to.be.false;
                expect(game.players[2].murdered).to.deep.equals({ by: "all", of: "vote" });
                expect(game.history[0].play.votesResult).to.equal("death");
                done();
            });
    });
    it("👪 Tie in votes between werewolf and stuttering judge (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({
                source: "all", action: "vote", votes: [
                    { from: players[0]._id, for: players[1]._id },
                    { from: players[1]._id, for: players[0]._id },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.history[0].play.votesResult).to.equal("need-settlement");
                expect(game.players[0].isAlive).to.be.true;
                expect(game.players[1].isAlive).to.be.true;
                expect(game.waiting).to.be.an("array").lengthOf(1);
                expect(game.waiting[0]).to.be.deep.equals({ for: "all", to: "vote" });
                done();
            });
    });
    it("👪 All vote for stuttering judge (POST /games/:id/play)", done => {
        players = game.players;
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "vote", votes: [{ from: players[0]._id, for: players[1]._id }] })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.players[1].isAlive).to.be.false;
                expect(game.players[1].murdered).to.deep.equals({ by: "all", of: "vote" });
                expect(game.history[0].play.votesResult).to.equal("death");
                done();
            });
    });
});