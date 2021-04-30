const mongoose = require("mongoose");
const { describe, it } = require("mocha");
const { expect } = require("chai");
const { getNearestNeighbor } = require("../../../src/helpers/functions/Game");
const players = [
    { _id: new mongoose.Types.ObjectId(), position: 0, isAlive: true, side: { current: "villagers" } },
    { _id: new mongoose.Types.ObjectId(), position: 1, isAlive: true, side: { current: "villagers" } },
    { _id: new mongoose.Types.ObjectId(), position: 2, isAlive: true, side: { current: "villagers" } },
    { _id: new mongoose.Types.ObjectId(), position: 3, isAlive: true, side: { current: "villagers" } },
    { _id: new mongoose.Types.ObjectId(), position: 4, isAlive: true, side: { current: "werewolves" } },
];

describe("A - Get nearest neighbor", () => {
    it("Get first alive third player's neighbor on the left", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "left", { isAlive: true });
        expect(foundNeighbor._id.toString()).to.equal(players[3]._id.toString());
        expect(foundNeighbor.isAlive).to.be.true;
        done();
    });
    it("Get first alive third player's neighbor on the right", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "right", { isAlive: true });
        expect(foundNeighbor._id.toString()).to.equal(players[1]._id.toString());
        expect(foundNeighbor.isAlive).to.be.true;
        players[1].isAlive = false;
        players[3].isAlive = false;
        done();
    });
    it("Get first alive third player's neighbor on the left, first left neighbor is dead", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "left", { isAlive: true });
        expect(foundNeighbor._id.toString()).to.equal(players[4]._id.toString());
        expect(foundNeighbor.isAlive).to.be.true;
        done();
    });
    it("Get first alive third player's neighbor on the right, first right neighbor is dead", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "right", { isAlive: true });
        expect(foundNeighbor._id.toString()).to.equal(players[0]._id.toString());
        expect(foundNeighbor.isAlive).to.be.true;
        players[4].isAlive = false;
        done();
    });
    it("Get first alive third player's neighbor on the left, first and second left neighbors are dead", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "left", { isAlive: true });
        expect(foundNeighbor._id.toString()).to.equal(players[0]._id.toString());
        expect(foundNeighbor.isAlive).to.be.true;
        players[4].isAlive = true;
        players[0].isAlive = false;
        done();
    });
    it("Get first alive third player's neighbor on the right, first and second right neighbors are dead", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "right", { isAlive: true });
        expect(foundNeighbor._id.toString()).to.equal(players[4]._id.toString());
        expect(foundNeighbor.isAlive).to.be.true;
        players[4].isAlive = false;
        done();
    });
    it("Get first alive third player's neighbor on the right, but none is alive", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "right", { isAlive: true });
        expect(foundNeighbor).to.equal(null);
        players[4].isAlive = true;
        done();
    });
    it("Get first alive third player's werewolf neighbor on the right, first and second right neighbors are dead", done => {
        const foundNeighbor = getNearestNeighbor(players[2]._id, players, "right", { isAlive: true, side: "werewolves" });
        expect(foundNeighbor._id.toString()).to.equal(players[4]._id.toString());
        expect(foundNeighbor.side.current).to.equal("werewolves");
        done();
    });
});