exports.errorMetadata = {
    BAD_REQUEST: {
        code: 1,
        HTTPCode: 400,
    },
    UNAUTHORIZED: {
        code: 2,
        HTTPCode: 401,
    },
    EMAIL_EXISTS: {
        code: 3,
        HTTPCode: 400,
    },
    NOT_FOUND: {
        code: 4,
        HTTPCode: 404,
    },
    INTERNAL_SERVER_ERROR: {
        code: 5,
        HTTPCode: 500,
    },
    BAD_TOKEN: {
        code: 6,
        HTTPCode: 400,
    },
    BAD_CREDENTIALS: {
        code: 7,
        HTTPCode: 401,
    },
    PLAYERS_NAME_NOT_UNIQUE: {
        code: 8,
        HTTPCode: 400,
    },
    NO_WOLF_IN_GAME_COMPOSITION: {
        code: 9,
        HTTPCode: 400,
    },
    NO_VILLAGER_IN_GAME_COMPOSITION: {
        code: 10,
        HTTPCode: 400,
    },
    GAME_MASTER_HAS_ON_GOING_GAMES: {
        code: 11,
        HTTPCode: 400,
    },
    GAME_DOESNT_BELONG_TO_USER: {
        code: 12,
        HTTPCode: 401,
    },
    BAD_PLAY: {
        code: 13,
        HTTPCode: 400,
    },
};