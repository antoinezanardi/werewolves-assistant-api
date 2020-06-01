const { describe, it, before, after } = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../app");
const Config = require("../../../config");
const { resetDatabase } = require("../../../src/helpers/functions/Test");

chai.use(chaiHttp);
const { expect } = chai;

const credentials = { email: "test@test.fr", password: "secret" };
let user;

describe("Sign up and log in", () => {
    before(done => resetDatabase(done));
    after(done => resetDatabase(done));
    it("Doesn't allow bad email (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send({ email: "foobar", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("BAD_REQUEST");
                done();
            });
    });
    it("Creates new user (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                user = res.body;
                done();
            });
    });
    it("Doesn't allow duplicate email (POST /users)", done => {
        chai.request(app)
            .post("/users")
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.type).to.equals("EMAIL_EXISTS");
                done();
            });
    });
    it("Gets freshly created user (GET /users/:id)", done => {
        chai.request(app)
            .get(`/users/${user._id}`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.email).to.equals(credentials.email);
                done();
            });
    });
    it("Doesn't allow bad credentials (POST /users/login)", done => {
        chai.request(app)
            .post(`/users/login`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send({ email: "foo@bar.com", password: "secret" })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.type).to.equals("BAD_CREDENTIALS");
                done();
            });
    });
    it("Log in successfully (POST /users/login)", done => {
        chai.request(app)
            .post(`/users/login`)
            .auth(Config.app.basicAuth.username, Config.app.basicAuth.password)
            .send(credentials)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});