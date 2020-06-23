const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
let user, token, user2;

// eslint-disable-next-line max-lines-per-function
describe("A - Sign up and log in", () => {
    before(done => resetDatabase(done));
    after(done => resetDatabase(done));
    it("📧 Doesn't allow bad email (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .send({ email: "foobar", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
    it("👤 Creates new user (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                user = res.body;
                done();
            });
    });
    it("📧 Doesn't allow duplicate email (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("EMAIL_EXISTS");
                done();
            });
    });
    it("👤 Gets freshly created user with Basic auth (GET /users/:id)", done => {
        chai.request(app)
            .get(`/users/${user._id}`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.email).to.equals(credentials.email);
                done();
            });
    });
    it("🔐 Doesn't allow bad credentials (POST /users/login)", done => {
        chai.request(app)
            .post(`/users/login`)
            .send({ email: "foo@bar.com", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equals("BAD_CREDENTIALS");
                done();
            });
    });
    it("🔑 Logs in successfully (POST /users/login)", done => {
        chai.request(app)
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
        chai.request(app)
            .get(`/users/${user._id}`)
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.email).to.equals(credentials.email);
                done();
            });
    });
    it("🔐 Doesn't allow to get user without auth (GET /users/:id)", done => {
        chai.request(app)
            .get(`/users/${user._id}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });
    it("👤 Creates a second user (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .send({ email: `${credentials.email}bis`, password: credentials.password })
            .end((err, res) => {
                expect(res).to.have.status(200);
                user2 = res.body;
                done();
            });
    });
    it("🔐 Doesn't allow to get user without the right token (GET /users/:id)", done => {
        chai.request(app)
            .get(`/users/${user2._id}`)
            .set({ "Authorization": `Bearer ${token}` })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equals("UNAUTHORIZED");
                done();
            });
    });
});