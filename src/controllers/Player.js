const GameHistory = require("./GameHistory");
const { canBeEaten, hasAttribute } = require("../helpers/functions/Player");
const { playerAttributes, murderedPossibilities } = require("../helpers/constants/Player");
const { generateError } = require("../helpers/functions/Error");

exports.checkAllTargetsDependingOnAction = async(targets, game, action) => {
    if (action === "use-potion") {
        const savedTarget = targets.filter(({ potion }) => potion.life);
        const murderedTarget = targets.filter(({ potion }) => potion.death);
        if (savedTarget.length > 1 || savedTarget.length && await GameHistory.isLifePotionUsed(game._id)) {
            throw generateError("ONLY_ONE_LIFE_POTION", "Witch can only use one life potion per game.");
        } else if (murderedTarget.length > 1 || murderedTarget.length && await GameHistory.isDeathPotionUsed(game._id)) {
            throw generateError("ONLY_ONE_DEATH_POTION", "Witch can only use one death potion per game.");
        }
    }
};

exports.checkUniqueTargets = targets => {
    const uniqueTargets = [...new Set(targets.map(({ player }) => player._id))];
    if (uniqueTargets.length !== targets.length) {
        throw generateError("NON_UNIQUE_TARGETS", "Multiple targets are pointing the same player.");
    }
};

exports.checkTargetDependingOnAction = async(target, game, action) => {
    if (action === "look" && target.player.role.current === "seer") {
        throw generateError("CANT_LOOK_AT_HERSELF", "Seer can't see herself.");
    } else if (action === "eat" && target.player.role.group === "wolves") {
        throw generateError("CANT_EAT_EACH_OTHER", `Wolves's target can't be a player with group "wolves".`);
    } else if (action === "use-potion" && target.potion.life && !hasAttribute(target.player, "eaten")) {
        throw generateError("BAD_LIFE_POTION_USE", `Witch can only use life potion on a target eaten by wolves.`);
    } else if (action === "protect") {
        const lastProtectedTarget = await GameHistory.getLastProtectedPlayer(game._id);
        if (lastProtectedTarget && lastProtectedTarget._id.toString() === target.player._id.toString()) {
            throw generateError("CANT_PROTECT_TWICE", `Protector can't protect the same player twice in a row.`);
        }
    } else if (action === "settle-votes") {
        const lastVotePlay = await GameHistory.getLastVotePlay(game._id);
        if (lastVotePlay && !lastVotePlay.play.targets.find(({ player }) => player._id.toString() === target.player._id.toString())) {
            throw generateError("CANT_BE_CHOSEN_AS_TIEBREAKER", `Player with id "${target.player._id}" is not part of the tiebreaker choice for the mayor.`);
        }
    }
};

exports.checkAndFillPlayerTarget = (target, game) => {
    const player = game.players.find(player => player._id.toString() === target.player);
    if (!player) {
        throw generateError("NOT_TARGETABLE", `Target with id "${target.player}" is not targetable because the player is not in the game.`);
    } else if (!player.isAlive) {
        throw generateError("NOT_TARGETABLE", `Target with id "${target.player}" is not targetable because the player is dead.`);
    }
    target.player = player;
};

exports.checkTargetStructure = (target, action) => {
    if (target.player === undefined) {
        throw generateError("BAD_TARGET_STRUCTURE", `Bad target structure. Field "player" is missing.`);
    } else if (action === "use-potion") {
        if (target.potion === undefined || target.potion.life === undefined && target.potion.death === undefined) {
            throw generateError("BAD_TARGET_STRUCTURE", `Bad target structure. Field "potion" with either "potion.life" or "potion.death" are missing.`);
        } else if (target.potion.life && target.potion.death) {
            throw generateError("BAD_TARGET_STRUCTURE", `Bad target structure. Witch can't use life and death potions on the same target.`);
        }
    }
};

exports.checkTargetsOptions = (targets, { canBeUnset, canBeEmpty, expectedLength }) => {
    if (!canBeUnset && (!targets || !Array.isArray(targets))) {
        throw generateError("TARGETS_REQUIRED", `"targets" needs to be set and to be an array.`);
    } else if (!targets) {
        return;
    }
    if (!canBeEmpty && !targets.length) {
        throw generateError("TARGETS_CANT_BE_EMPTY", "`targets` can't be empty.");
    } else if (!targets.length) {
        return;
    }
    if (expectedLength !== undefined && targets.length !== expectedLength) {
        throw generateError("BAD_TARGETS_LENGTH", `"targets" needs to have exactly a length of ${expectedLength}.`);
    }
};

exports.checkAndFillTargets = async(targets, game, options) => {
    this.checkTargetsOptions(targets, options);
    if (!targets || !targets.length) {
        return;
    }
    for (let i = 0; i < targets.length; i++) {
        this.checkTargetStructure(targets[i], options.action);
        this.checkAndFillPlayerTarget(targets[i], game);
        await this.checkTargetDependingOnAction(targets[i], game, options.action);
    }
    this.checkUniqueTargets(targets);
    await this.checkAllTargetsDependingOnAction(targets, game, options.action);
};

exports.killPlayer = (playerId, { action }, game) => {
    const player = game.players.find(({ _id }) => _id.toString() === playerId.toString());
    if (player && (action === "eat" && canBeEaten(player) || action !== "eat" && !hasAttribute(player, "protected"))) {
        player.isAlive = false;
        const murdered = murderedPossibilities.find(({ of }) => of === action);
        if (murdered) {
            player.murdered = murdered;
            if (hasAttribute(player, "mayor")) {
                game.waiting = { for: "mayor", to: "delegate" };
            }
        }
    }
};

exports.addPlayerAttribute = (playerId, attribute, game) => {
    const player = game.players.find(player => player._id.toString() === playerId.toString());
    const playerAttribute = playerAttributes.find(playerAttribute => playerAttribute.attribute === attribute);
    if (player) {
        if (player.attributes) {
            player.attributes.push(playerAttribute);
        } else {
            player.attributes = [playerAttribute];
        }
    }
};

exports.removePlayerAttribute = (playerId, attributeName, game) => {
    const player = game.players.find(player => player._id.toString() === playerId.toString());
    if (player && player.attributes) {
        player.attributes = player.attributes.filter(({ attribute }) => attribute !== attributeName);
    }
};

exports.getPlayersWithAttribute = (attributeName, game) => game.players.filter(player => player.attributes && player.attributes.find(({ attribute }) => attribute === attributeName));

exports.incrementPlayerVoteCount = (votedPlayers, playerId, game, inc = 1) => {
    const votedPlayer = votedPlayers.find(player => player._id.toString() === playerId.toString());
    if (votedPlayer) {
        votedPlayer.vote += inc;
    } else {
        const player = game.players.find(player => player._id.toString() === playerId.toString());
        votedPlayers.push({ ...player, vote: inc });
    }
};

exports.getNominatedPlayers = (votes, game, { action, allowTie = false }) => {
    const votedPlayers = [];
    for (const vote of votes) {
        this.incrementPlayerVoteCount(votedPlayers, vote.for._id, game);
    }
    if (action === "vote") {
        const ravenMarkedPlayers = this.getPlayersWithAttribute("raven-marked", game);
        if (ravenMarkedPlayers.length) {
            this.incrementPlayerVoteCount(votedPlayers, ravenMarkedPlayers[0]._id, game, 2);
            this.removePlayerAttribute(ravenMarkedPlayers[0]._id, "raven-marked", game);
        }
    }
    const maxVotes = Math.max(...votedPlayers.map(player => player.vote));
    const nominatedPlayers = votedPlayers.filter(player => player.vote === maxVotes);
    if (!allowTie && nominatedPlayers.length > 1) {
        throw generateError("TIE_IN_VOTES", "Tie in votes is not allowed for this action.");
    }
    return nominatedPlayers;
};

exports.checkPlayerMultipleVotes = (votes, players) => {
    for (const player of players) {
        if (votes.reduce((acc, vote) => vote.from === player._id.toString() ? ++acc : acc, 0) > 1) {
            throw generateError("CANT_VOTE_MULTIPLE_TIMES", `Player with id "${player._id}" isn't allowed to vote more than once.`);
        }
    }
};

exports.checkVoteTarget = (playerId, players) => {
    const player = players.find(player => player._id.toString() === playerId);
    if (!player) {
        throw generateError("CANT_BE_VOTE_TARGET", `Player with id "${playerId}" is not in game and so can't be a vote's target.`);
    } else if (!player.isAlive) {
        throw generateError("CANT_BE_VOTE_TARGET", `Player with id "${playerId}" is dead and so can't be a vote's target.`);
    }
};

exports.checkPlayerAbilityToVote = (playerId, players) => {
    const player = players.find(player => player._id.toString() === playerId);
    if (!player) {
        throw generateError("CANT_VOTE", `Player with id "${playerId}" is not in game and so can't vote.`);
    } else if (!player.isAlive) {
        throw generateError("CANT_VOTE", `Player with id "${playerId}" is dead and so can't vote.`);
    }
};

exports.checkVoteStructure = vote => {
    if (!vote.from || !vote.for) {
        throw generateError("BAD_VOTE_STRUCTURE", "Bad vote structure.");
    } else if (vote.from === vote.for) {
        throw generateError("SAME_VOTE_SOURCE_AND_TARGET", "Vote's source and target can't be the same.");
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
        throw generateError("VOTES_REQUIRED", "`votes` need to be set");
    } else if (!votes.length) {
        throw generateError("VOTES_CANT_BE_EMPTY", "`votes` can't be empty");
    }
    this.checkVotesSourceAndTarget(votes, game, options);
    for (let i = 0; i < votes.length; i++) {
        votes[i].from = game.players.find(player => player._id.toString() === votes[i].from);
        votes[i].for = game.players.find(player => player._id.toString() === votes[i].for);
    }
};

exports.mayorDelegates = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, action: play.action });
    this.killPlayer(targets[0].player._id, play, game);
};

exports.mayorSettlesVotes = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, action: play.action });
    this.killPlayer(targets[0].player._id, play, game);
};

exports.mayorPlays = async(play, game, gameHistoryEntry) => {
    const mayorActions = {
        "settle-votes": this.mayorSettlesVotes,
        "delegate": this.mayorDelegates,
    };
    await mayorActions[play.action](play, game, gameHistoryEntry);
};

exports.wolvesPlay = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, action: play.action });
    this.addPlayerAttribute(targets[0].player._id, "eaten", game);
};

exports.hunterPlays = async(play, game) => {
    console.log("hunter plays");
};

exports.ravenPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, expectedLength: 1, action: play.action });
    if (targets && targets.length) {
        this.addPlayerAttribute(targets[0].player._id, "raven-marked", game);
    }
};

exports.protectorPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, action: play.action });
    this.addPlayerAttribute(targets[0].player._id, "protected", game);
};

exports.witchPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, action: play.action });
    for (const target of targets) {
        if (target.potion.life) {
            this.addPlayerAttribute(target.player._id, "drank-life-potion", game);
        } else if (target.potion.death) {
            this.addPlayerAttribute(target.player._id, "drank-death-potion", game);
        }
    }
};

exports.seerPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, action: play.action });
    this.addPlayerAttribute(targets[0].player._id, "seen", game);
};

exports.allVote = async(play, game, gameHistoryEntry) => {
    const { votes, action } = play;
    this.checkAndFillVotes(votes, game, { action });
    const nominatedPlayers = this.getNominatedPlayers(votes, game, { action, allowTie: true });
    if (nominatedPlayers.length > 1) {
        game.waiting = { for: "mayor", to: "settle-votes" };
    } else {
        this.killPlayer(nominatedPlayers[0]._id, play, game);
    }
    gameHistoryEntry.play.targets = nominatedPlayers.map(nominatedPlayer => ({ player: nominatedPlayer }));
};

exports.allElectMayor = async(play, game, gameHistoryEntry) => {
    const { votes, action } = play;
    this.checkAndFillVotes(votes, game, { action });
    const nominatedPlayers = this.getNominatedPlayers(votes, game, { action });
    this.addPlayerAttribute(nominatedPlayers[0]._id, "mayor", game);
    gameHistoryEntry.play.targets = nominatedPlayers.map(nominatedPlayer => ({ player: nominatedPlayer }));
};

exports.allPlay = async(play, game, gameHistoryEntry) => {
    const allActions = {
        "elect-mayor": this.allElectMayor,
        "vote": this.allVote,
    };
    await allActions[play.action](play, game, gameHistoryEntry);
};

exports.eaten = game => {
    const eatenPlayer = this.getPlayersWithAttribute("eaten", game)[0];
    this.killPlayer(eatenPlayer._id, { action: "eat" }, game);
    this.removePlayerAttribute(eatenPlayer._id, "eaten", game);
};

exports.removeAttributeFromAllPlayers = (attributeName, game) => {
    for (const { _id } of game.players) {
        this.removePlayerAttribute(_id, attributeName, game);
    }
};

exports.drankDeathPotion = game => {
    const poisonedPlayer = this.getPlayersWithAttribute("drank-death-potion", game)[0];
    this.killPlayer(poisonedPlayer._id, { action: "use-potion" }, game);
    this.removePlayerAttribute(poisonedPlayer._id, "drank-death-potion", game);
};