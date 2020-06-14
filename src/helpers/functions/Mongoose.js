const mongoose = require("mongoose");
const Config = require("../../../config");

exports.connect = () => new Promise((resolve, reject) => {
    const mongooseOptions = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    };
    mongoose.connect(`mongodb://localhost/${Config.db.name}`, mongooseOptions, err => {
        if (err) {
            return reject(err);
        }
        return resolve();
    });
});