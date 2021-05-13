const { roleNames, groupNames, roles } = require("./Role");

exports.gamePhases = ["day", "night"];

exports.gameStatuses = ["playing", "done", "canceled"];

exports.patchableGameStatuses = ["canceled"];

exports.waitingForPossibilities = [...roleNames, ...groupNames, "sheriff", "all"];

exports.waitingForCauses = ["stuttering-judge-request"];

exports.wonByPossibilities = ["werewolves", "villagers", "lovers", "pied-piper", "abominable-sectarian"];

exports.gameRepartitionForbiddenRoleNames = roleNames.filter(roleName => roleName !== "villager" && roleName !== "werewolf");

exports.populate = [
    { path: "gameMaster", select: "-password" },
    { path: "history", limit: 3 },
];

exports.turnNightActionsOrder = [
    { source: "all", action: "vote", isFirstNightOnly: true },
    { source: "thief", action: "choose-card", isFirstNightOnly: true },
    { source: "dog-wolf", action: "choose-side", isFirstNightOnly: true },
    { source: "cupid", action: "charm", isFirstNightOnly: true },
    { source: "seer", action: "look" },
    { source: "fox", action: "sniff" },
    { source: "lovers", action: "meet-each-other", isFirstNightOnly: true },
    { source: "stuttering-judge", action: "choose-sign", isFirstNightOnly: true },
    { source: "two-sisters", action: "meet-each-other" },
    { source: "three-brothers", action: "meet-each-other" },
    { source: "wild-child", action: "choose-model", isFirstNightOnly: true },
    { source: "raven", action: "mark" },
    { source: "guard", action: "protect" },
    { source: "werewolves", action: "eat" },
    { source: "white-werewolf", action: "eat" },
    { source: "big-bad-wolf", action: "eat" },
    { source: "witch", action: "use-potion" },
    { source: "pied-piper", action: "charm" },
    { source: "charmed", action: "meet-each-other" },
];

exports.findFields = ["status"];

exports.defaultGameOptions = {
    repartition: { isHidden: false },
    roles: {
        areRevealedOnDeath: true,
        sheriff: {
            isEnabled: true,
            electedAt: { turn: 1, phase: "night" },
            hasDoubledVote: true,
            canSettleVotes: true,
        },
        lovers: { doRevealRoleToEachOther: false },
        bigBadWolf: { isPowerlessIfWerewolfDies: true },
        whiteWerewolf: { wakingUpInterval: 2 },
        seer: { isTalkative: true, canSeeRoles: true },
        cupid: { mustWinWithLovers: false },
        littleGirl: { isProtectedByGuard: false },
        guard: { canProtectTwice: false },
        ancient: { livesCountAgainstWerewolves: 2, doesTakeHisRevenge: true },
        idiot: { doesDieOnAncientDeath: true },
        twoSisters: { wakingUpInterval: 2 },
        threeBrothers: { wakingUpInterval: 2 },
        fox: { isPowerlessIfMissesWerewolf: true },
        bearTamer: { doesGrowlIfInfected: true },
        stutteringJudge: { voteRequestsCount: 1 },
        wildChild: { isTransformationRevealed: false },
        dogWolf: { isChosenSideRevealed: false, isChosenSideRandom: false },
        thief: { isChosenCardRevealed: false, mustChooseBetweenWerewolves: true, additionalCardsCount: 2 },
        piedPiper: { charmedPeopleCountPerNight: 2, isPowerlessIfInfected: true },
        raven: { markPenalty: 2 },
    },
};

exports.votesResults = ["election", "need-settlement", "death", "no-death"];

exports.additionalCardsForRoleNames = ["thief"];

exports.additionalCardsThiefRoleNames = roles.filter(({ minInGame }) => !minInGame).map(({ name }) => name);