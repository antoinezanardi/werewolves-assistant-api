const { generateError } = require("../helpers/functions/Error");

exports.checkVoteTarget = (playerId, players, { action }) => {
    const player = players.find(player => player._id.toString() === playerId);
    if (!player) {
        throw generateError("BAD_PLAY", `Player with id "${playerId}" is not in game and so can't be a vote's target.`);
    } else if (!player.isAlive) {
        throw generateError("BAD_PLAY", `Player with id "${playerId}" is dead and so can't be a vote's target.`);
    } else if (action === "eat" && player.role.group === "wolves") {
        throw generateError("BAD_PLAY", `Player with id "${playerId}" has group "${player.role.group}" and so can't be a vote's target for action ${action}.`);
    }
};

exports.checkPlayerAbilityToVote = (playerId, players, { action }) => {
    const player = players.find(player => player._id.toString() === playerId);
    if (!player) {
        throw generateError("BAD_PLAY", `Player with id "${playerId}" is not in game and so can't vote.`);
    } else if (!player.isAlive) {
        throw generateError("BAD_PLAY", `Player with id "${playerId}" is dead and so can't vote.`);
    } else if (action === "eat" && player.role.group !== "wolves") {
        throw generateError("BAD_PLAY", `Player with id "${playerId}" has group "${player.role.group}" and so can't vote for action "${action}". Needs to be group "wolves".`);
    }
};

exports.checkVoteStructure = vote => {
    if (!vote.from || !vote.for) {
        throw generateError("BAD_PLAY", "Bad vote structure");
    } else if (vote.from === vote.for) {
        throw generateError("BAD_PLAY", "Vote's source and target can't be the same");
    }
};

exports.checkVotesSourceAndTarget = (votes, { players }, options) => {
    for (let vote of votes) {
        this.checkVoteStructure(vote);
        this.checkPlayerAbilityToVote(vote.from, players, options);
        this.checkVoteTarget(vote.from, players, options);
        vote = {
            from: players.find(player => player._id.toString() === vote.from),
            to: players.find(player => player._id.toString() === vote.to),
        };
    }
    // this.checkMultiple
};

exports.checkAndFillVotes = (votes, game, options) => {
    if (!votes || !Array.isArray(votes)) {
        throw generateError("BAD_PLAY", "`votes` need to be set");
    } else if (!votes.length) {
        throw generateError("BAD_PLAY", "`votes` can't be empty");
    }
    this.checkVotesSourceAndTarget(votes, game, options);
};

exports.mayorPlays = async(play, game) => {
    console.log("mayor plays");
};

exports.wolvesPlay = async(play, game) => {
    console.log("wolves play");
};

exports.hunterPlays = async(play, game) => {
    console.log("hunter plays");
};

exports.ravenPlays = async(play, game) => {
    console.log("protector plays");
};

exports.protectorPlays = async(play, game) => {
    console.log("protector plays");
};

exports.witchPlays = async(play, game) => {
    console.log("witch plays");
};

exports.seerPlays = async(play, game) => {
    console.log("seer plays");
};

exports.villagersPlay = async(play, game) => {
    console.log("villagers play");
};

exports.allElectMayor = async(play, game) => {
    const { votes, action } = play;
    this.checkAndFillVotes(votes, game, { action });
};

exports.allPlay = async(play, game) => {
    const allActions = {
        "elect-mayor": this.allElectMayor,
    };
    await allActions[play.action](play, game);
};