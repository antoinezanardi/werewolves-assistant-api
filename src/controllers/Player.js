const { playerAttributes } = require("../helpers/constants/Player");
const { generateError } = require("../helpers/functions/Error");

exports.addPlayerAttribute = (playerId, attribute, game) => {
    const player = game.players.find(player => player._id.toString() === playerId);
    const playerAttribute = playerAttributes.find(playerAttribute => playerAttribute.attribute === attribute);
    player.attributes.push(playerAttribute);
};

exports.getVotesResults = (votes, allowTie = false) => {
    const players = [];
    for (const vote of votes) {
        const player = players.find(player => player._id === vote.for._id.toString());
        if (player) {
            player.vote++;
        } else {
            players.push({ _id: vote.for._id.toString(), vote: 1 });
        }
    }
    const maxVotes = Math.max(...players.map(player => player.vote));
    const nominatedPlayers = players.filter(player => player.vote === maxVotes);
    if (nominatedPlayers.length > 1 && !allowTie) {
        throw generateError("BAD_PLAY", "Tie in votes is not allowed for this action.");
    }
    return nominatedPlayers;
};

exports.checkPlayerMultipleVotes = (votes, players) => {
    for (const player of players) {
        if (votes.reduce((acc, vote) => vote.from === player._id.toString() ? ++acc : acc, 0) > 1) {
            throw generateError("BAD_PLAY", `Player with id "${player._id}" isn't allowed to vote more than once.`);
        }
    }
};

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
        throw generateError("BAD_PLAY", "Bad vote structure.");
    } else if (vote.from === vote.for) {
        throw generateError("BAD_PLAY", "Vote's source and target can't be the same.");
    }
};

exports.checkVotesSourceAndTarget = (votes, { players }, options) => {
    for (const vote of votes) {
        this.checkVoteStructure(vote);
        this.checkPlayerAbilityToVote(vote.from, players, options);
        this.checkVoteTarget(vote.for, players, options);
    }
    this.checkPlayerMultipleVotes(votes, players);
};

exports.checkAndFillVotes = (votes, game, options) => {
    if (!votes || !Array.isArray(votes)) {
        throw generateError("BAD_PLAY", "`votes` need to be set");
    } else if (!votes.length) {
        throw generateError("BAD_PLAY", "`votes` can't be empty");
    }
    this.checkVotesSourceAndTarget(votes, game, options);
    for (let i = 0; i < votes.length; i++) {
        votes[i].from = game.players.find(player => player._id.toString() === votes[i].from);
        votes[i].for = game.players.find(player => player._id.toString() === votes[i].for);
    }
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

exports.allElectMayor = async(play, game, gameHistoryEntry) => {
    const { votes, action } = play;
    this.checkAndFillVotes(votes, game, { action });
    const nominatedPlayers = this.getVotesResults(votes);
    this.addPlayerAttribute(nominatedPlayers[0]._id, "mayor", game);
    gameHistoryEntry.votes = votes;
};

exports.allPlay = async(play, game, gameHistoryEntry) => {
    const allActions = {
        "elect-mayor": this.allElectMayor,
    };
    await allActions[play.action](play, game, gameHistoryEntry);
};