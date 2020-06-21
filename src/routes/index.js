const fs = require("fs");

module.exports = app => {
    fs.readdirSync(__dirname).forEach(file => {
        if (file === "index.js") {
            /**
             * @api {GET} / A] Get API info
             * @apiName GetAPIInfo
             * @apiGroup API 🔌
             *
             * @apiSuccess {String} name API's name
             * @apiSuccess {String} version API's version
             */
            app.route("/").get((req, res) => {
                res.status(200).json({ name: "Werewolves Assistant API", version: "0.3.0" });
            });
            return;
        }
        const name = file.substr(0, file.indexOf("."));
        require(`./${name}`)(app);
    });
};