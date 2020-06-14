const { errorMetadata } = require("../helpers/constants/Error");

class Error {
    constructor(errorType, e) {
        const knownErrorType = !!errorMetadata[errorType];
        this.code = knownErrorType ? errorMetadata[errorType].code : 5;
        this.HTTPCode = knownErrorType ? errorMetadata[errorType].HTTPCode : 500;
        this.type = knownErrorType ? errorType : "INTERNAL_SERVER_ERROR";
        this.data = e;
    }
}

module.exports = Error;