const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { stringify } = require("qs");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
const credentials2 = { email: "test@test.frbis", password: "secret" };
const players = [
    { name: "<h1>Dig</h1>", role: "witch" },
    { name: "Doug", role: "seer" },
    { name: "Dag", role: "guard" },
    { name: "Dug", role: "raven" },
    { name: "Dyg", role: "hunter" },
    { name: "Deg", role: "werewolf" },
];
const playersWithoutWerewolves = [
    { name: "Dig", role: "witch" },
    { name: "Doug", role: "seer" },
    { name: "Dag", role: "guard" },
    { name: "Dug", role: "raven" },
    { name: "Dyg", role: "hunter" },
];
const playersWithoutVillagers = [
    { name: "Dig", role: "werewolf" },
    { name: "Doug", role: "werewolf" },
    { name: "Dag", role: "werewolf" },
    { name: "Dug", role: "werewolf" },
    { name: "Dyg", role: "werewolf" },
    { name: "Deg", role: "werewolf" },
];
const playersWithOnlyOneSister = [
    { name: "Dig", role: "villager" },
    { name: "Doug", role: "two-sisters" },
    { name: "Dag", role: "werewolf" },
    { name: "Dug", role: "werewolf" },
];
const playersWithOnlyTwoBrothers = [
    { name: "Dig", role: "three-brothers" },
    { name: "Doug", role: "three-brothers" },
    { name: "Dag", role: "werewolf" },
    { name: "Dug", role: "werewolf" },
];
let token, token2, game, game2, queryString;

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
    it("👤 Creates another user (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials2)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🔑 Logs in successfully for second user (POST /users/login)", done => {
        chai.request(app)
            .post(`/users/login`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials2)
            .end((err, res) => {
                expect(res).to.have.status(200);
                token2 = res.body.token;
                done();
            });
    });
    it("🔐 Can't create game without JWT auth (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("🐺 Can't create game without werewolves (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: playersWithoutWerewolves })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NO_WEREWOLF_IN_GAME_COMPOSITION");
                done();
            });
    });
    it("👪 Can't create game without villagers (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
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
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: [...players, { name: "Doug", role: "werewolf" }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("PLAYERS_NAME_NOT_UNIQUE");
                done();
            });
    });
    it("👪 Can't create game a player with a too long name (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: [...players, { name: "IAmLaSuperKouisteMoumouneDig!!!", role: "werewolf" }] })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
    it("👭 Can't create game a with only one sister (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: playersWithOnlyOneSister })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("SISTERS_MUST_BE_TWO");
                done();
            });
    });
    it("👨‍👨‍👦 Can't create game a with only two brothers (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players: playersWithOnlyTwoBrothers })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BROTHERS_MUST_BE_THREE");
                done();
            });
    });
    it("🎲 User1 creates game with JWT auth (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                console.log(res.body);
                expect(res).to.have.status(200);
                game = res.body;
                expect(game.status).to.equals("playing");
                expect(game.turn).to.equals(1);
                expect(game.phase).to.equals("night");
                expect(game.tick).to.equals(1);
                expect(game.options.sistersWakingUpInterval).to.equals(2);
                expect(game.options.brothersWakingUpInterval).to.equals(2);
                expect(game.options.isSheriffVoteDoubled).to.equals(true);
                expect(game.options.isSeerTalkative).to.equals(true);
                expect(game.waiting[0]).to.deep.equals({ for: "all", to: "elect-sheriff" });
                expect(game.history).to.deep.equals([]);
                expect(Array.isArray(game.players)).to.equals(true);
                expect(game.players[0].name).to.equals("Dig");
                done();
            });
    });
    it("🎲 User2 creates game with JWT auth (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token2}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game2 = res.body;
                expect(game2.status).to.equals("playing");
                done();
            });
    });
    it("🎲 Can't create another game if one is already playing (POST /games)", done => {
        chai.request(app)
            .post("/games")
            .set({ Authorization: `Bearer ${token}` })
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
            .set({ Authorization: `Bearer ${token}` })
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
            .set({ Authorization: `Bearer ${token}` })
            .send({ source: "all", action: "elect-sheriff" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("NO_MORE_PLAY_ALLOWED");
                done();
            });
    });
    it("🔐 Game can't be reset if status is 'canceled' (PATCH /games/:id/reset)", done => {
        chai.request(app)
            .patch(`/games/${game._id}/reset`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("CANT_BE_RESET");
                done();
            });
    });
    it("🎲 Creates another game because all others are cancelled (POST /games)", done => {
        chai.request(app)
            .post(`/games`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                game = res.body;
                expect(res).to.have.status(200);
                done();
            });
    });
    it("🔐 Can't get games without authentication (GET /games)", done => {
        chai.request(app)
            .get(`/games`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("🎲 User1 gets his games with JWT auth (GET /games)", done => {
        chai.request(app)
            .get("/games")
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                const games = res.body;
                expect(Array.isArray(games)).to.equals(true);
                expect(games.length).to.equals(2);
                done();
            });
    });
    it(`🎲 User1 gets his games with playing status with JWT auth (GET /games?${queryString})`, done => {
        queryString = stringify({ status: "playing" });
        chai.request(app)
            .get(`/games?${queryString}`)
            .set({ Authorization: `Bearer ${token}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                const games = res.body;
                expect(Array.isArray(games)).to.equals(true);
                expect(games.length).to.equals(1);
                done();
            });
    });
    it(`🎲 User2 gets his games with canceled status with JWT auth (GET /games?${queryString})`, done => {
        queryString = stringify({ status: "canceled" });
        chai.request(app)
            .get(`/games?${queryString}`)
            .set({ Authorization: `Bearer ${token2}` })
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                const games = res.body;
                expect(Array.isArray(games)).to.equals(true);
                expect(games.length).to.equals(0);
                done();
            });
    });
    it(`🎲 Gets all games with basic auth (GET /games)`, done => {
        chai.request(app)
            .get(`/games`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send({ players })
            .end((err, res) => {
                expect(res).to.have.status(200);
                const games = res.body;
                expect(Array.isArray(games)).to.equals(true);
                expect(games.length).to.equals(3);
                done();
            });
    });
    it(`🎲 Gets a game with basic auth (GET /games)`, done => {
        chai.request(app)
            .get(`/games/${game._id}`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game._id).to.equals(game._id);
                done();
            });
    });
    it(`🎲 User1 gets his last game with JWT auth (GET /games/:id)`, done => {
        chai.request(app)
            .get(`/games/${game._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                game = res.body;
                expect(game._id).to.equals(game._id);
                done();
            });
    });
    it(`🎲 User1 can't get a game created by user2 with JWT auth (GET /games/:id)`, done => {
        chai.request(app)
            .get(`/games/${game2._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equals("GAME_DOESNT_BELONG_TO_USER");
                done();
            });
    });
    it("👤 Get games with only _id and waiting in response (GET /games?fields=_id,waiting)", done => {
        queryString = stringify({ fields: "_id,waiting" });
        chai.request(app)
            .get(`/games?${queryString}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body[0]._id).to.exist;
                expect(res.body[0].waiting).to.exist;
                expect(res.body[0].turn).to.not.exist;
                expect(res.body[0].tick).to.not.exist;
                done();
            });
    });
});