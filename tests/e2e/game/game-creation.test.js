const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
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
const playersWithoutWolves = [
    { name: "Dig", role: "witch" },
    { name: "Doug", role: "seer" },
    { name: "Dag", role: "protector" },
    { name: "Dug", role: "raven" },
    { name: "Dyg", role: "hunter" },
];
const playersWithoutVillagers = [
    { name: "Dig", role: "wolf" },
    { name: "Doug", role: "wolf" },
    { name: "Dag", role: "wolf" },
    { name: "Dug", role: "wolf" },
    { name: "Dyg", role: "wolf" },
    { name: "Deg", role: "wolf" },
];
let token, game;

// eslint-disable-next-line max-lines-per-function
describe("A - Game creation", () => {
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
    it("🔐 Can't create game without JWT auth (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .send({ email: "foobar", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("🐺 Can't create game without wolves (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ "Authorization": `Bearer ${token}` })
            .send({ players: playersWithoutWolves })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NO_WOLF_IN_GAME_COMPOSITION");
                done();
            });
    });
    it("👪 Can't create game without villagers (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ "Authorization": `Bearer ${token}` })
            .send({ players: playersWithoutVillagers })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NO_VILLAGER_IN_GAME_COMPOSITION");
                done();
            });
    });
    it("👪 Can't create game with no unique player names (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ "Authorization": `Bearer ${token}` })
            .send({ players: [...players, { name: "Dig", role: "wolf" }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("PLAYERS_NAME_NOT_UNIQUE");
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
                expect(game.status).to.equals("playing");
                expect(game.turn).to.equals(1);
                expect(game.phase).to.equals("night");
                expect(game.tick).to.equals(1);
                expect(game.waiting[0]).to.deep.equals({ for: "all", to: "elect-mayor" });
                expect(game.history).to.deep.equals([]);
                expect(Array.isArray(game.players)).to.equals(true);
                done();
            });
    });
    it("🎲 Can't create another game if one is already playing (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ "Authorization": `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("GAME_MASTER_HAS_ON_GOING_GAMES");
                done();
            });
    });
    it("🎲 Cancels game (PATCH /games)", done => {
        chai.request(app)
            .patch(`/games/${game._id}`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ status: "canceled" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equals("canceled");
                done();
            });
    });
    it("🔐 Can't make a play if game's canceled (POST /games/:id/play)", done => {
        chai.request(app)
            .post(`/games/${game._id}/play`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ source: "all", action: "elect-mayor" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NO_MORE_PLAY_ALLOWED");
                done();
            });
    });
    it("🔐 Game can't be reset if status is 'canceled' (PATCH /games/:id/reset)", done => {
        chai.request(app)
            .patch(`/games/${game._id}/reset`)
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_RESET");
                done();
            });
    });
    it("🎲 Creates another game because all others are cancelled (POST /games)", done => {
        chai.request(app)
            .post(`/games`)
            .set({ "Authorization": `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});