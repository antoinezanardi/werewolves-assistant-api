const Game = require("./Game");
const GameHistory = require("./GameHistory");
const {
    canBeEaten, doesPlayerHaveAttribute, isAncientKillable, getAttribute,
    getPlayerMurderedPossibilities,
} = require("../helpers/functions/Player");
const { getPlayerWithAttribute, getPlayerWithRole, getPlayerWithId } = require("../helpers/functions/Game");
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

exports.checkEatTarget = async(target, game, source) => {
    if (target.player.side.current === "werewolves") {
        throw generateError("CANT_EAT_EACH_OTHER", `Werewolves target can't be a player with group "werewolves".`);
    } else if (source === "big-bad-wolf" && doesPlayerHaveAttribute(target.player, "eaten")) {
        throw generateError("TARGET_ALREADY_EATEN", `This target is already planned to be eaten by the "werewolves", the big bad wolf can't eat it.`);
    } else if (target.isInfected) {
        const vileFatherOfWolvesPlayer = getPlayerWithRole("vile-father-of-wolves", game);
        if (source !== "werewolves") {
            throw generateError("TARGET_MUST_BE_EATEN_BY_WEREWOLVES", `Target must be eaten by the werewolves and not by ${source} to be infected.`);
        } else if (!vileFatherOfWolvesPlayer || !vileFatherOfWolvesPlayer.isAlive) {
            throw generateError("ABSENT_VILE_FATHER_OF_WOLVES", `Target can't be infected because the vile father of wolves is either not in the game or dead.`);
        } else if (await GameHistory.isInfectionUsed(game._id)) {
            throw generateError("ONLY_ONE_INFECTION", `Vile father of wolves can infect only one target per game.`);
        }
    }
};

exports.checkTargetDependingOnPlay = async(target, game, { source, action }) => {
    if (action === "look" && target.player.role.current === "seer") {
        throw generateError("CANT_LOOK_AT_HERSELF", "Seer can't see herself.");
    } else if (action === "eat") {
        await this.checkEatTarget(target, game, source);
    } else if (action === "use-potion" && target.potion.life && !doesPlayerHaveAttribute(target.player, "eaten")) {
        throw generateError("BAD_LIFE_POTION_USE", `Witch can only use life potion on a target eaten by werewolves.`);
    } else if (action === "protect") {
        const lastProtectedTarget = await GameHistory.getLastProtectedPlayer(game._id);
        if (lastProtectedTarget && lastProtectedTarget._id.toString() === target.player._id.toString()) {
            throw generateError("CANT_PROTECT_TWICE", `Guard can't protect the same player twice in a row.`);
        }
    } else if (action === "settle-votes") {
        const lastVotePlay = await GameHistory.getLastVotePlay(game._id);
        if (lastVotePlay && !lastVotePlay.play.targets.find(({ player }) => player._id.toString() === target.player._id.toString())) {
            throw generateError("CANT_BE_CHOSEN_AS_TIEBREAKER", `Player with id "${target.player._id}" is not part of the tiebreaker choice for the sheriff.`);
        }
    } else if (action === "choose-model" && target.player.role.current === "wild-child") {
        throw generateError("WILD_CHILD_CANT_CHOOSE_HIMSELF", `Wild child can't choose himself as a model.`);
    }
};

exports.checkAndFillPlayerTarget = (target, game) => {
    const player = getPlayerWithId(target.player, game);
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
        this.checkTargetStructure(targets[i], options.play.action);
        this.checkAndFillPlayerTarget(targets[i], game);
        await this.checkTargetDependingOnPlay(targets[i], game, options.play);
    }
    this.checkUniqueTargets(targets);
    await this.checkAllTargetsDependingOnAction(targets, game, options.play.action);
};

exports.insertDeadPlayerIntoGameHistoryEntry = (player, gameHistoryEntry) => {
    if (!gameHistoryEntry.dead) {
        gameHistoryEntry.dead = [player];
    } else {
        gameHistoryEntry.dead.push(player);
    }
};

exports.applyConsequencesDependingOnKilledPlayerAttributes = (player, game, gameHistoryEntry) => {
    if (doesPlayerHaveAttribute(player, "sheriff")) {
        this.insertActionBeforeAllVote(game, { for: "sheriff", to: "delegate" });
    }
    if (doesPlayerHaveAttribute(player, "in-love")) {
        const otherLoverPlayer = game.players.find(({ _id, isAlive, attributes }) => _id.toString() !== player._id.toString() &&
            isAlive && doesPlayerHaveAttribute({ attributes }, "in-love"));
        if (otherLoverPlayer) {
            this.killPlayer(otherLoverPlayer._id, { action: "charm" }, game, gameHistoryEntry);
        }
    }
    if (doesPlayerHaveAttribute(player, "worshiped")) {
        const wildChildPlayer = getPlayerWithRole("wild-child", game);
        if (wildChildPlayer?.isAlive) {
            wildChildPlayer.side.current = "werewolves";
        }
    }
};

exports.insertActionBeforeAllVote = (game, waiting) => {
    const waitingForAllToVoteIdx = game.waiting.findIndex(({ to }) => to === "vote");
    if (waitingForAllToVoteIdx !== -1 && waitingForAllToVoteIdx !== 0) {
        game.waiting.splice(waitingForAllToVoteIdx, 0, waiting);
    } else {
        game.waiting.push(waiting);
    }
};

exports.applyConsequencesDependingOnKilledPlayerRole = (player, game, action) => {
    const ancientRevengeActions = ["vote", "settle-votes", "shoot", "use-potion"];
    if (player.role.current === "hunter") {
        this.insertActionBeforeAllVote(game, { for: "hunter", to: "shoot" });
    } else if (player.role.current === "ancient" && ancientRevengeActions.includes(action)) {
        for (const { _id, isAlive, role } of game.players) {
            if (isAlive && role.original === "villagers") {
                this.addPlayerAttribute(_id, "powerless", game);
            }
        }
    }
};

exports.killPlayer = (playerId, { action }, game, gameHistoryEntry, forcedSource) => {
    const player = getPlayerWithId(playerId, game);
    if (player?.isAlive && (action !== "eat" || canBeEaten(player))) {
        const alreadyRevealed = player.role.isRevealed;
        player.role.isRevealed = true;
        if (player.role.current !== "ancient" || isAncientKillable(action, alreadyRevealed)) {
            player.isAlive = false;
            const murdered = getPlayerMurderedPossibilities().find(({ of }) => of === action);
            if (murdered) {
                player.murdered = murdered;
                if (forcedSource) {
                    player.murdered.by = forcedSource;
                }
                this.insertDeadPlayerIntoGameHistoryEntry(player, gameHistoryEntry);
            }
            this.applyConsequencesDependingOnKilledPlayerRole(player, game, action);
            this.applyConsequencesDependingOnKilledPlayerAttributes(player, game, gameHistoryEntry);
        }
    }
};

exports.addPlayerAttribute = (playerId, attribute, game, forcedSource) => {
    const player = getPlayerWithId(playerId, game);
    const playerAttribute = getAttribute(attribute);
    if (player && playerAttribute) {
        if (forcedSource) {
            playerAttribute.source = forcedSource;
        }
        if (player.attributes) {
            player.attributes.push(playerAttribute);
        } else {
            player.attributes = [playerAttribute];
        }
    }
};

exports.removePlayerAttribute = (playerId, attributeName, game) => {
    const player = getPlayerWithId(playerId, game);
    if (player && player.attributes) {
        player.attributes = player.attributes.filter(({ name }) => name !== attributeName);
    }
};

exports.incrementPlayerVoteCount = (votedPlayers, playerId, game, inc = 1) => {
    const votedPlayer = votedPlayers.find(player => player._id.toString() === playerId.toString());
    if (votedPlayer) {
        votedPlayer.vote += inc;
    } else {
        const player = getPlayerWithId(playerId, game);
        votedPlayers.push({ ...player, vote: inc });
    }
};

exports.getNominatedPlayers = (votes, game, { action, allowTie = false }) => {
    const votedPlayers = [];
    const sheriffPlayer = getPlayerWithAttribute("sheriff", game);
    for (const vote of votes) {
        if (action === "vote" && sheriffPlayer && sheriffPlayer._id === vote.from._id && game.options.roles.sheriff.hasDoubledVote) {
            this.incrementPlayerVoteCount(votedPlayers, vote.for._id, game, 2);
        } else {
            this.incrementPlayerVoteCount(votedPlayers, vote.for._id, game);
        }
    }
    if (action === "vote") {
        const ravenMarkedPlayers = getPlayerWithAttribute("raven-marked", game);
        if (ravenMarkedPlayers) {
            if (ravenMarkedPlayers.isAlive) {
                this.incrementPlayerVoteCount(votedPlayers, ravenMarkedPlayers._id, game, 2);
            }
            this.removePlayerAttribute(ravenMarkedPlayers._id, "raven-marked", game);
        }
    }
    const maxVotes = Math.max(...votedPlayers.map(player => player.vote));
    const nominatedPlayers = votedPlayers.filter(player => player.vote === maxVotes);
    if (!allowTie && nominatedPlayers.length > 1) {
        throw generateError("TIE_IN_VOTES", "Tie in votes is not allowed for this action.");
    }
    return nominatedPlayers;
};

exports.checkPlayerMultipleVotes = (votes, { players }) => {
    for (const player of players) {
        if (votes.reduce((acc, vote) => vote.from === player._id.toString() ? ++acc : acc, 0) > 1) {
            throw generateError("CANT_VOTE_MULTIPLE_TIMES", `Player with id "${player._id}" isn't allowed to vote more than once.`);
        }
    }
};

exports.checkVoteTarget = (targetId, { players }, options) => {
    const targetedPlayer = getPlayerWithId(targetId, { players });
    if (!targetedPlayer) {
        throw generateError("CANT_BE_VOTE_TARGET", `Player with id "${targetId}" is not in game and so can't be a vote's target.`);
    } else if (!targetedPlayer.isAlive) {
        throw generateError("CANT_BE_VOTE_TARGET", `Player with id "${targetId}" is dead and so can't be a vote's target.`);
    } else if (options.isSecondVoteAfterTie && !options.previousPlay.play.targets.find(({ player }) => player._id.toString() === targetId)) {
        throw generateError("CANT_BE_VOTE_TARGET", `Player with id "${targetId}" is not one of the player in the previous tie in votes and so can't be a vote's target.`);
    }
};

exports.checkPlayerAbilityToVote = (voterId, { players }) => {
    const voter = getPlayerWithId(voterId, { players });
    if (!voter) {
        throw generateError("CANT_VOTE", `Player with id "${voterId}" is not in game and so can't vote.`);
    } else if (!voter.isAlive) {
        throw generateError("CANT_VOTE", `Player with id "${voterId}" is dead and so can't vote.`);
    }
};

exports.checkVoteStructure = vote => {
    if (!vote.from || !vote.for) {
        throw generateError("BAD_VOTE_STRUCTURE", "Bad vote structure.");
    } else if (vote.from === vote.for) {
        throw generateError("SAME_VOTE_SOURCE_AND_TARGET", "Vote's source and target can't be the same.");
    }
};

exports.checkVotesSourceAndTarget = async(votes, game) => {
    const isSecondVoteAfterTie = await Game.isCurrentPlaySecondVoteAfterTie(game);
    const previousPlay = await GameHistory.getPreviousPlay(game._id);
    for (const vote of votes) {
        this.checkVoteStructure(vote);
        this.checkPlayerAbilityToVote(vote.from, game);
        this.checkVoteTarget(vote.for, game, { isSecondVoteAfterTie, previousPlay });
    }
    this.checkPlayerMultipleVotes(votes, game);
};

exports.checkAndFillVotes = async(votes, game, options) => {
    if (!votes || !Array.isArray(votes)) {
        throw generateError("VOTES_REQUIRED", "`votes` need to be set");
    } else if (!votes.length) {
        throw generateError("VOTES_CANT_BE_EMPTY", "`votes` can't be empty");
    }
    await this.checkVotesSourceAndTarget(votes, game, options);
    for (let i = 0; i < votes.length; i++) {
        votes[i].from = getPlayerWithId(votes[i].from, game);
        votes[i].for = getPlayerWithId(votes[i].for, game);
    }
};

exports.bigBadWolfPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.addPlayerAttribute(targets[0].player._id, "eaten", game, "big-bad-wolf");
};

exports.dogWolfPlays = (play, game) => {
    if (!play.side) {
        throw generateError("DOG_WOLF_MUST_CHOOSE_SIDE", "Dog-wolf must choose a side between `villagers` and `werewolves`.");
    } else if (play.side === "werewolves") {
        const dogWolfPlayer = getPlayerWithRole("dog-wolf", game);
        if (dogWolfPlayer) {
            dogWolfPlayer.side.current = "werewolves";
        }
    }
};

exports.wildChildPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.addPlayerAttribute(targets[0].player._id, "worshiped", game);
};

exports.cupidPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 2, play });
    this.addPlayerAttribute(targets[0].player._id, "in-love", game);
    this.addPlayerAttribute(targets[1].player._id, "in-love", game);
};

exports.sheriffDelegates = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.removeAttributeFromAllPlayers("sheriff", game);
    this.addPlayerAttribute(targets[0].player._id, "sheriff", game, "sheriff");
};

exports.sheriffSettlesVotes = async(play, game, gameHistoryEntry) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.killPlayer(targets[0].player._id, play, game, gameHistoryEntry);
};

exports.sheriffPlays = async(play, game, gameHistoryEntry) => {
    const sheriffActions = {
        "settle-votes": this.sheriffSettlesVotes,
        "delegate": this.sheriffDelegates,
    };
    await sheriffActions[play.action](play, game, gameHistoryEntry);
};

exports.werewolvesPlay = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    if (targets[0].isInfected) {
        const infectedPlayer = getPlayerWithId(targets[0].player._id, game);
        if (infectedPlayer) {
            infectedPlayer.side.current = "werewolves";
        }
    } else {
        this.addPlayerAttribute(targets[0].player._id, "eaten", game);
    }
};

exports.hunterPlays = async(play, game, gameHistoryEntry) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.killPlayer(targets[0].player._id, play, game, gameHistoryEntry);
};

exports.ravenPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, expectedLength: 1, play });
    if (targets && targets.length) {
        this.addPlayerAttribute(targets[0].player._id, "raven-marked", game);
    }
};

exports.guardPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.addPlayerAttribute(targets[0].player._id, "protected", game);
};

exports.witchPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, play });
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
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.addPlayerAttribute(targets[0].player._id, "seen", game);
};

exports.allVote = async(play, game, gameHistoryEntry) => {
    const { votes, action } = play;
    await this.checkAndFillVotes(votes, game, { action });
    const nominatedPlayers = this.getNominatedPlayers(votes, game, { action, allowTie: true });
    if (nominatedPlayers.length > 1) {
        if (getPlayerWithAttribute("sheriff", game)) {
            game.waiting.push({ for: "sheriff", to: "settle-votes" });
        } else if (!await Game.isCurrentPlaySecondVoteAfterTie(game)) {
            const lastVotePlay = await GameHistory.getLastVotePlay(game._id);
            if (!lastVotePlay || lastVotePlay.turn !== game.turn) {
                game.waiting.push({ for: "all", to: "vote" });
            }
        }
    } else {
        this.killPlayer(nominatedPlayers[0]._id, play, game, gameHistoryEntry);
    }
    gameHistoryEntry.play.targets = nominatedPlayers.map(nominatedPlayer => ({ player: nominatedPlayer }));
};

exports.allElectSheriff = async(play, game, gameHistoryEntry) => {
    const { votes, action } = play;
    await this.checkAndFillVotes(votes, game, { action });
    const nominatedPlayers = this.getNominatedPlayers(votes, game, { action });
    this.addPlayerAttribute(nominatedPlayers[0]._id, "sheriff", game);
    gameHistoryEntry.play.targets = nominatedPlayers.map(nominatedPlayer => ({ player: nominatedPlayer }));
};

exports.allPlay = async(play, game, gameHistoryEntry) => {
    const allActions = {
        "elect-sheriff": this.allElectSheriff,
        "vote": this.allVote,
    };
    await allActions[play.action](play, game, gameHistoryEntry);
};

exports.eaten = (game, play, gameHistoryEntry) => {
    const eatenPlayer = getPlayerWithAttribute("eaten", game);
    this.killPlayer(eatenPlayer._id, { action: "eat" }, game, gameHistoryEntry, play.source);
    this.removePlayerAttribute(eatenPlayer._id, "eaten", game);
};

exports.removeAttributeFromAllPlayers = (attributeName, game) => {
    for (const { _id } of game.players) {
        this.removePlayerAttribute(_id, attributeName, game);
    }
};

exports.drankDeathPotion = (game, play, gameHistoryEntry) => {
    const poisonedPlayer = getPlayerWithAttribute("drank-death-potion", game);
    this.killPlayer(poisonedPlayer._id, { action: "use-potion" }, game, gameHistoryEntry);
    this.removePlayerAttribute(poisonedPlayer._id, "drank-death-potion", game);
};