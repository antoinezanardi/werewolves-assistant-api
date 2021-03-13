const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
let server, user, token, user2;

describe("A - Sign up and log in", () => {
    before(done => resetDatabase(done));
    before(done => {
        server = app.listen(3000, done);
    });
    after(done => resetDatabase(done));
    it("📧 Doesn't allow bad email (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send({ email: "foobar", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("📧 Doesn't allow email longer than 50 characters (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send({ email: "foobar@foooooooooooooooooooooooooooooooooooobar.com", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("🔏 Doesn't allow password shorter than 5 characters (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send({ email: "foobar@lol.com", password: "lol" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("🔏 Doesn't allow password longer than 50 characters (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send({ email: "foobar@lol.com", password: "IamASuperLongPasswordHowAreYouDoing?ReviewingCodeIsFun!" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("👤 Creates new user (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                user = res.body;
                done();
            });
    });
    it("📧 Doesn't allow duplicate email (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("EMAIL_EXISTS");
                done();
            });
    });
    it("👤 Gets freshly created user with Basic auth (GET /users/:id)", done => {
        chai.request(server)
            .get(`/users/${user._id}`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.email).to.equal(credentials.email);
                done();
            });
    });
    it("📧 Can't log in with a too long email address (POST /users/login)", done => {
        chai.request(server)
            .post(`/users/login`)
            .send({ email: "foobar@foooooooooooooooooooooooooooooooooooobar.com", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("🔏 Can't log in with a too small password (POST /users/login)", done => {
        chai.request(server)
            .post(`/users/login`)
            .send({ email: "foobar@lol.com", password: "lol" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("🔏 Can't log in with a too long password (POST /users/login)", done => {
        chai.request(server)
            .post(`/users/login`)
            .send({ email: "foobar@lol.com", password: "IamASuperLongPasswordHowAreYouDoing?ReviewingCodeIsFun!" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equal("BAD_REQUEST");
                done();
            });
    });
    it("🔐 Doesn't allow bad credentials (POST /users/login)", done => {
        chai.request(server)
            .post(`/users/login`)
            .send({ email: "foo@bar.com", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equal("BAD_CREDENTIALS");
                done();
            });
    });
    it("🔑 Logs in successfully (POST /users/login)", done => {
        chai.request(server)
            .post(`/users/login`)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.token).to.be.a("string");
                token = res.body.token;
                done();
            });
    });
    it("👤 Gets freshly created user with JWT auth (GET /users/:id)", done => {
        chai.request(server)
            .get(`/users/${user._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.email).to.equal(credentials.email);
                done();
            });
    });
    it("🔐 Doesn't allow to get user without auth (GET /users/:id)", done => {
        chai.request(server)
            .get(`/users/${user._id}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("👤 Creates a second user (POST /users)", done => {
        chai.request(server)
            .post("/users")
            .send({ email: `${credentials.email}bis`, password: credentials.password })
            .end((err, res) => {
                expect(res).to.have.status(200);
                user2 = res.body;
                done();
            });
    });
    it("🔐 Doesn't allow to get user without the right token (GET /users/:id)", done => {
        chai.request(server)
            .get(`/users/${user2._id}`)
            .set({ Authorization: `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equal("UNAUTHORIZED");
                done();
            });
    });
    it("👤 Get users with only _id and email in response (GET /users?fields=email,_id)", done => {
        chai.request(server)
            .get(`/users?fields=email,_id`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body[0]._id).to.exist;
                expect(res.body[0].email).to.exist;
                expect(res.body[0].password).to.not.exist;
                expect(res.body[0].createdAt).to.not.exist;
                done();
            });
    });
});