const mongoose = require("mongoose");

exports.resetDatabase = done => {
    Promise.all(mongoose.connection.modelNames().map(model => mongoose.model(model).deleteMany())).then(() => done());
};