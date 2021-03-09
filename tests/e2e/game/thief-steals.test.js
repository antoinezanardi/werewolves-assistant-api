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
    { name: "Dag", role: "thief" },
    { name: "Dig", role: "werewolf" },
    { name: "Deg", role: "werewolf" },
    { name: "Dog", role: "villager" },
];
const options = { roles: { sheriff: { isEnabled: false } } };
let server, token, game, additionalCards;

describe("U - Tiny game of 4 players in which thief steals different roles", () => {
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
            .send({
                players: originalPlayers, options, additionalCards: [
                    { role: "angel", for: "thief" },
                    { role: "villager", for: "thief" },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                additionalCards = game.additionalCards;
                done();
            });
    });
    it("🦹 Thief chooses the angel card (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "thief", action: "choose-card", card: additionalCards[0]._id })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                additionalCards = game.additionalCards;
                expect(game.players[0].role.current).to.equals("angel");
                expect(game.players[0].side.current).to.equals("villagers");
                expect(game.history[0].play.card).to.deep.equals(additionalCards[0]);
                expect(game.waiting).to.be.an("array").lengthOf(2);
                expect(game.waiting[0]).to.deep.equals({ for: "all", to: "vote" });
                expect(game.waiting[1]).to.deep.equals({ for: "werewolves", to: "eat" });
                done();
            });
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
    it("🎲 Creates game with JWT auth (POST /games)", done => {
        chai.request(server)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({
                players: originalPlayers, options, additionalCards: [
                    { role: "witch", for: "thief" },
                    { role: "villager", for: "thief" },
                ],
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                additionalCards = game.additionalCards;
                done();
            });
    });
    it("🦹 Thief chooses the witch card (POST /games/:id/play)", done => {
        chai.request(server)
            .post(`/games/${game._id}/play`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "thief", action: "choose-card", card: additionalCards[0]._id })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                additionalCards = game.additionalCards;
                expect(game.players[0].role.current).to.equals("witch");
                expect(game.players[0].side.current).to.equals("villagers");
                expect(game.history[0].play.card).to.deep.equals(additionalCards[0]);
                expect(game.waiting).to.be.an("array").lengthOf(2);
                expect(game.waiting[0]).to.deep.equals({ for: "werewolves", to: "eat" });
                expect(game.waiting[1]).to.deep.equals({ for: "witch", to: "use-potion" });
                done();
            });
    });
});