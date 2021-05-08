const { Schema } = require("mongoose");
const PlayerSchema = require("./Player");
const AdditionalCardSchema = require("./AdditionalCard");
const {
    getGameStatuses, getWaitingForPossibilities, getGamePhases, getWonByPossibilities,
    getDefaultGameOptions, getWaitingForCauses,
} = require("../../helpers/functions/Game");
const { getPlayerActions } = require("../../helpers/functions/Player");

const gameOptions = {
    repartition: {
        isHidden: {
            type: Boolean,
            default: false,
        },
    },
    roles: {
        areRevealedOnDeath: {
            type: Boolean,
            default: true,
        },
        sheriff: {
            isEnabled: {
                type: Boolean,
                default: true,
            },
            electedAt: {
                turn: {
                    type: Number,
                    default: 1,
                },
                phase: {
                    type: String,
                    enum: getGamePhases(),
                    default: "night",
                },
            },
            hasDoubledVote: {
                type: Boolean,
                default: true,
            },
        },
        bigBadWolf: {
            isPowerlessIfWerewolfDies: {
                type: Boolean,
                default: true,
            },
        },
        whiteWerewolf: {
            wakingUpInterval: {
                type: Number,
                default: 2,
                min: 1,
                max: 5,
            },
        },
        seer: {
            isTalkative: {
                type: Boolean,
                default: true,
            },
            canSeeRoles: {
                type: Boolean,
                default: true,
            },
        },
        littleGirl: {
            isProtectedByGuard: {
                type: Boolean,
                default: false,
            },
        },
        guard: {
            canProtectTwice: {
                type: Boolean,
                default: false,
            },
        },
        ancient: {
            livesCountAgainstWerewolves: {
                type: Number,
                default: 2,
                min: 1,
                max: 5,
            },
            doesTakeHisRevenge: {
                type: Boolean,
                default: true,
            },
        },
        idiot: {
            doesDieOnAncientDeath: {
                type: Boolean,
                default: true,
            },
        },
        twoSisters: {
            wakingUpInterval: {
                type: Number,
                default: 2,
                min: 0,
                max: 5,
            },
        },
        threeBrothers: {
            wakingUpInterval: {
                type: Number,
                default: 2,
                min: 0,
                max: 5,
            },
        },
        fox: {
            isPowerlessIfMissesWerewolf: {
                type: Boolean,
                default: true,
            },
        },
        bearTamer: {
            doesGrowlIfInfected: {
                type: Boolean,
                default: true,
            },
        },
        stutteringJudge: {
            voteRequestsCount: {
                type: Number,
                default: 1,
                min: 1,
                max: 5,
            },
        },
        wildChild: {
            isTransformationRevealed: {
                type: Boolean,
                default: false,
            },
        },
        dogWolf: {
            isChosenSideRevealed: {
                type: Boolean,
                default: false,
            },
            isChosenSideRandom: {
                type: Boolean,
                default: false,
            },
        },
        thief: {
            mustChooseBetweenWerewolves: {
                type: Boolean,
                default: true,
            },
            additionalCardsCount: {
                type: Number,
                default: 2,
                min: 1,
                max: 5,
            },
        },
        piedPiper: {
            charmedPeopleCountPerNight: {
                type: Number,
                default: 2,
                min: 1,
                max: 5,
            },
            isPowerlessIfInfected: {
                type: Boolean,
                default: true,
            },
        },
        raven: {
            markPenalty: {
                type: Number,
                default: 2,
                min: 1,
                max: 5,
            },
        },
    },
};

const WonSchema = new Schema({
    by: {
        type: String,
        enum: getWonByPossibilities(),
        required: true,
    },
    players: {
        type: [PlayerSchema],
        default: undefined,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
    },
    comment: { type: String },
    dysfunctionFound: {
        type: Boolean,
        default: false,
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: false,
});

const WaitingSchema = new Schema({
    for: {
        type: String,
        enum: getWaitingForPossibilities(),
        required: true,
    },
    to: {
        type: String,
        enum: getPlayerActions(),
        required: true,
    },
    cause: {
        type: String,
        enum: getWaitingForCauses(),
    },
}, {
    _id: false,
    timestamps: false,
    versionKey: undefined,
});

const GameSchema = new Schema({
    gameMaster: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    players: {
        type: [PlayerSchema],
        required: true,
    },
    turn: {
        type: Number,
        default: 1,
        min: 1,
        required: true,
    },
    phase: {
        type: String,
        enum: getGamePhases(),
        default: "night",
        required: true,
    },
    tick: {
        type: Number,
        default: 1,
        min: 1,
        required: true,
    },
    waiting: {
        type: [WaitingSchema],
        _id: false,
        default: undefined,
    },
    status: {
        type: String,
        enum: getGameStatuses(),
        default: "playing",
        required: true,
    },
    options: {
        type: gameOptions,
        default: getDefaultGameOptions(),
    },
    additionalCards: {
        type: [AdditionalCardSchema],
        default: undefined,
    },
    won: {
        type: WonSchema,
        required: false,
    },
    review: {
        type: ReviewSchema,
        required: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    id: false,
});

GameSchema.virtual("history", {
    ref: "gameHistory",
    localField: "_id",
    foreignField: "gameId",
    justOne: false,
    options: { sort: { createdAt: -1 } },
});

module.exports = GameSchema;