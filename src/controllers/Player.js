const Game = require("./Game");
const GameHistory = require("./GameHistory");
const {
    canBeEaten, doesPlayerHaveAttribute, getAttributeWithName,
    getAttributeWithNameAndSource, getPlayerMurderedPossibilities, getPlayerAttribute,
    isPlayerAttributeActive, isIdiotKillable,
} = require("../helpers/functions/Player");
const {
    getPlayerWithAttribute, getPlayerWithRole, getPlayerWithId, filterOutSourcesFromWaitingQueue,
    getRemainingPlayersToCharm, getRemainingVillagersToEat, getRemainingWerewolvesToEat, getNearestNeighbor,
} = require("../helpers/functions/Game");
const { getVillagerRoles, getWerewolfRoles, getRoles } = require("../helpers/functions/Role");
const { generateError } = require("../helpers/functions/Error");

exports.checkAllTargetsDependingOnAction = async(targets, game, action) => {
    if (action === "use-potion") {
        const savedTarget = targets.filter(({ hasDrankLifePotion }) => hasDrankLifePotion);
        const murderedTarget = targets.filter(({ hasDrankDeathPotion }) => hasDrankDeathPotion);
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

exports.checkPiedPiperTargets = target => {
    if (target.player.role.current === "pied-piper") {
        throw generateError("CANT_CHARM_HIMSELF", `Pied piper can't charm himself.`);
    } else if (doesPlayerHaveAttribute(target.player, "charmed")) {
        throw generateError("ALREADY_CHARMED", `Player with id ${target.player._id} is already charmed and so can't be charmed again.`);
    }
};

exports.checkCharmTarget = (target, game, source) => {
    if (source === "pied-piper") {
        this.checkPiedPiperTargets(target);
    } else if (source === "cupid" && game.options.roles.cupid.mustWinWithLovers && target.player.role.current === "cupid") {
        throw generateError("CANT_CHARM_HIMSELF", `Cupid can't charm himself.`);
    }
};

exports.checkProtectTarget = async(target, game) => {
    const lastProtectedTarget = await GameHistory.getLastProtectedPlayer(game._id);
    if (lastProtectedTarget && lastProtectedTarget._id.toString() === target.player._id.toString() && !game.options.roles.guard.canProtectTwice) {
        throw generateError("CANT_PROTECT_TWICE", `Guard can't protect the same player twice in a row.`);
    }
};

exports.checkEatTarget = async(target, game, source) => {
    if (source !== "white-werewolf" && target.player.side.current === "werewolves") {
        throw generateError("CANT_EAT_EACH_OTHER", `Werewolves target can't be a player with current side "werewolves".`);
    } else if (source === "white-werewolf" && target.player.side.current !== "werewolves") {
        throw generateError("MUST_EAT_WEREWOLF", `Werewolves target can't be a player with current side "villager".`);
    } else if (source === "white-werewolf" && target.player.role.current === "white-werewolf") {
        throw generateError("CANT_EAT_HIMSELF", `White werewolf can't eat himself.`);
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
    } else if (action === "use-potion" && target.hasDrankLifePotion) {
        const eatenAttribute = getPlayerAttribute(target.player, "eaten");
        if (!eatenAttribute || eatenAttribute.source === "white-werewolf") {
            throw generateError("BAD_LIFE_POTION_USE", `Witch can only use life potion on a target eaten by "werewolves" of "big-bad-wolf".`);
        }
    } else if (action === "protect") {
        await this.checkProtectTarget(target, game);
    } else if (action === "settle-votes") {
        const lastVotePlay = await GameHistory.getLastVotePlay(game._id);
        if (lastVotePlay && !lastVotePlay.play.targets.find(({ player }) => player._id.toString() === target.player._id.toString())) {
            throw generateError("CANT_BE_CHOSEN_AS_TIEBREAKER", `Player with id "${target.player._id}" is not part of the tiebreaker choice for the sheriff.`);
        }
    } else if (action === "choose-model" && target.player.role.current === "wild-child") {
        throw generateError("WILD_CHILD_CANT_CHOOSE_HIMSELF", `Wild child can't choose himself as a model.`);
    } else if (action === "charm") {
        await this.checkCharmTarget(target, game, source);
    } else if (action === "ban-voting" && doesPlayerHaveAttribute(target.player, "cant-vote")) {
        throw generateError("CANT_VOTE_ALREADY", `Player with id ${target.player._id} is already banned of votes.`);
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

exports.addFoxTargets = (targets, game) => {
    const leftAliveNeighbor = getNearestNeighbor(targets[0].player, game.players, "left", { isAlive: true });
    const rightAliveNeighbor = getNearestNeighbor(targets[0].player, game.players, "right", { isAlive: true });
    if (leftAliveNeighbor) {
        targets.unshift({ player: leftAliveNeighbor._id });
    }
    if (rightAliveNeighbor && leftAliveNeighbor !== rightAliveNeighbor) {
        targets.push({ player: rightAliveNeighbor._id });
    }
};

exports.checkTargetStructure = (target, action) => {
    if (target.player === undefined) {
        throw generateError("BAD_TARGET_STRUCTURE", `Bad target structure. Field "player" is missing.`);
    } else if (target.isInfected && action !== "eat") {
        throw generateError("BAD_PLAY_ACTION_FOR_INFECTION", `"isInfected" can be set on target only if play's action is "eat".`);
    } else if ((target.hasDrankLifePotion || target.hasDrankDeathPotion) && action !== "use-potion") {
        throw generateError("BAD_PLAY_ACTION_FOR_POTION", `"hasDrankLifePotion" or "hasDrankDeathPotion" can be set on target only if play's action is "use-potion".`);
    } else if (action === "use-potion") {
        if (target.hasDrankLifePotion && target.hasDrankDeathPotion) {
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
    for (const target of targets) {
        this.checkTargetStructure(target, options.play.action);
    }
    if (options.play.action === "sniff") {
        this.addFoxTargets(targets, game);
    }
    for (const target of targets) {
        this.checkAndFillPlayerTarget(target, game);
        await this.checkTargetDependingOnPlay(target, game, options.play);
    }
    this.checkUniqueTargets(targets);
    await this.checkAllTargetsDependingOnAction(targets, game, options.play.action);
};

exports.insertDeadPlayerIntoGameHistoryEntry = (player, gameHistoryEntry) => {
    if (!gameHistoryEntry.deadPlayers) {
        gameHistoryEntry.deadPlayers = [player];
    } else {
        gameHistoryEntry.deadPlayers.push(player);
    }
};

exports.insertRevealedPlayerIntoGameHistoryEntry = (player, gameHistoryEntry) => {
    if (!gameHistoryEntry.revealedPlayers) {
        gameHistoryEntry.revealedPlayers = [player];
    } else {
        gameHistoryEntry.revealedPlayers.push(player);
    }
};

exports.purgePlayerAttributes = player => {
    player.attributes = player.attributes?.filter(({ remainingPhases }) => !remainingPhases);
};

exports.applyConsequencesDependingOnKilledPlayerAttributes = async(player, game, gameHistoryEntry) => {
    if (doesPlayerHaveAttribute(player, "sheriff") &&
        (player.role.current !== "idiot" || doesPlayerHaveAttribute(player, "powerless"))) {
        this.insertActionImmediately(game, { for: "sheriff", to: "delegate" });
    }
    if (doesPlayerHaveAttribute(player, "in-love")) {
        const otherLoverPlayer = game.players.find(({ _id, isAlive, attributes }) => _id.toString() !== player._id.toString() &&
            isAlive && doesPlayerHaveAttribute({ attributes }, "in-love"));
        if (otherLoverPlayer) {
            await this.killPlayer(otherLoverPlayer._id, "charm", game, gameHistoryEntry);
        }
    }
    if (doesPlayerHaveAttribute(player, "worshiped")) {
        const wildChildPlayer = getPlayerWithRole("wild-child", game);
        if (wildChildPlayer?.isAlive && !doesPlayerHaveAttribute(wildChildPlayer, "powerless")) {
            wildChildPlayer.side.current = "werewolves";
        }
    }
};

exports.insertActionBeforeAllVote = (game, play) => {
    const waitingForAllToVoteIdx = game.waiting.findIndex(({ to }) => to === "vote");
    if (waitingForAllToVoteIdx !== -1 && waitingForAllToVoteIdx !== 0) {
        game.waiting.splice(waitingForAllToVoteIdx, 0, play);
    } else {
        game.waiting.push(play);
    }
};

exports.insertActionImmediately = (game, play) => {
    if (game.waiting.length) {
        game.waiting.splice(1, 0, play);
    } else {
        game.waiting.push(play);
    }
};

exports.applyConsequencesDependingOnKilledPlayerRole = async(player, action, game, gameHistoryEntry, options) => {
    const ancientRevengeActions = ["vote", "settle-votes", "shoot", "use-potion"];
    if (player.role.current === "hunter" && !doesPlayerHaveAttribute(player, "powerless")) {
        this.insertActionImmediately(game, { for: "hunter", to: "shoot" });
    } else if (player.role.current === "ancient") {
        if (ancientRevengeActions.includes(action) && game.options.roles.ancient.doesTakeHisRevenge) {
            for (const { _id, isAlive, side } of game.players) {
                if (isAlive && side.original === "villagers") {
                    this.addPlayerAttribute(_id, "powerless", game);
                }
            }
            const villagerRoleNames = getVillagerRoles().map(({ name }) => name);
            filterOutSourcesFromWaitingQueue(game, [...villagerRoleNames, "charmed", "lovers"]);
        }
        const idiotPlayer = getPlayerWithRole("idiot", game);
        if (idiotPlayer?.isAlive && idiotPlayer.role.isRevealed && game.options.roles.idiot.doesDieOnAncientDeath) {
            await this.killPlayer(idiotPlayer._id, "reconsider", game, gameHistoryEntry);
        }
    } else if (player.role.current === "scapegoat" && action === "vote" && options?.nominatedPlayers?.length > 1 &&
        !doesPlayerHaveAttribute(player, "powerless")) {
        this.insertActionImmediately(game, { for: "scapegoat", to: "ban-voting" });
    } else if (player.role.current === "rusty-sword-knight" && action === "eat" && !doesPlayerHaveAttribute(player, "powerless")) {
        const leftAliveWerewolfNeighbor = getNearestNeighbor(player._id, game.players, "left", { isAlive: true, side: "werewolves" });
        if (leftAliveWerewolfNeighbor) {
            this.addPlayerAttribute(leftAliveWerewolfNeighbor._id, "contaminated", game);
        }
    }
};

exports.fillMurderedData = (player, action, gameHistoryEntry, options) => {
    const murdered = getPlayerMurderedPossibilities().find(({ of }) => of === action);
    if (murdered) {
        player.murdered = murdered;
        if (options.forcedSource) {
            player.murdered.by = options.forcedSource;
        }
        this.insertDeadPlayerIntoGameHistoryEntry(player, gameHistoryEntry);
    }
};

exports.isAncientKillable = async(action, game, gameHistoryEntry) => {
    if (action !== "eat") {
        return true;
    }
    const werewolvesPlaysOnAncientSearch = {
        "gameId": gameHistoryEntry.gameId,
        "play.source.name": { $in: ["werewolves", "big-bad-wolf"] },
        "play.targets": { $elemMatch: { "player.role.current": "ancient" } },
    };
    const werewolvesPlaysOnAncient = [...await GameHistory.find(werewolvesPlaysOnAncientSearch), gameHistoryEntry];
    const ancientSavedByWitchPlaySearch = {
        "gameId": gameHistoryEntry.gameId,
        "play.source.name": "witch",
        "play.targets": { $elemMatch: { "player.role.current": "ancient", "hasDrankLifePotion": true } },
    };
    const ancientSavedByGuardPlaySearch = {
        "gameId": gameHistoryEntry.gameId,
        "play.source.name": "guard",
        "play.targets": { $elemMatch: { "player.role.current": "ancient" } },
    };
    let livesCount = game.options.roles.ancient.livesCountAgainstWerewolves;
    for (const werewolvesPlay of werewolvesPlaysOnAncient) {
        if (werewolvesPlay.play.action === "eat" && werewolvesPlay.play.targets.find(({ player }) => player.role.current === "ancient") &&
            !await GameHistory.findOne({ ...ancientSavedByWitchPlaySearch, turn: werewolvesPlay.turn }) &&
            !await GameHistory.findOne({ ...ancientSavedByGuardPlaySearch, turn: werewolvesPlay.turn })) {
            livesCount--;
        }
    }
    return livesCount <= 0;
};

exports.isPlayerKillable = async({ role, attributes }, action, alreadyRevealed, game, gameHistoryEntry) => role.current !== "ancient" &&
    role.current !== "idiot" || role.current === "ancient" && await this.isAncientKillable(action, game, gameHistoryEntry) ||
    role.current === "idiot" && isIdiotKillable(action, { attributes }, alreadyRevealed);

exports.killPlayer = async(playerId, action, game, gameHistoryEntry, options = {}) => {
    const player = getPlayerWithId(playerId, game);
    if (player?.isAlive && (action !== "eat" || canBeEaten(player, game))) {
        const alreadyRevealed = player.role.isRevealed;
        if (!alreadyRevealed && (player.role.current !== "ancient" || await this.isAncientKillable(action, game, gameHistoryEntry))) {
            player.role.isRevealed = true;
            this.insertRevealedPlayerIntoGameHistoryEntry(player, gameHistoryEntry);
            if (player.role.current === "idiot" && !doesPlayerHaveAttribute(player, "powerless") &&
                (action === "vote" || action === "settle-votes")) {
                this.addPlayerAttribute(player._id, "cant-vote", game, { source: "all" });
            }
        }
        if (await this.isPlayerKillable(player, action, alreadyRevealed, game, gameHistoryEntry)) {
            player.isAlive = false;
            this.fillMurderedData(player, action, gameHistoryEntry, options);
            if (action === "vote") {
                gameHistoryEntry.play.votesResult = "death";
            }
            await this.applyConsequencesDependingOnKilledPlayerRole(player, action, game, gameHistoryEntry, options);
            await this.applyConsequencesDependingOnKilledPlayerAttributes(player, game, gameHistoryEntry);
            this.purgePlayerAttributes(player);
            if (game.phase === "night") {
                await Game.refreshNightWaitingQueue(game);
            }
        } else if (action === "vote") {
            gameHistoryEntry.play.votesResult = "no-death";
        }
    }
};

exports.addPlayerAttribute = (playerId, attributeName, game, options = {}) => {
    const player = getPlayerWithId(playerId, game);
    const playerAttribute = options.source ? getAttributeWithNameAndSource(attributeName, options.source) : getAttributeWithName(attributeName);
    if (player && playerAttribute) {
        if (options.forcedSource) {
            playerAttribute.source = options.forcedSource;
        }
        if (options?.activeIn?.turn) {
            playerAttribute.activeAt = {
                turn: game.turn + options.activeIn.turn,
                phase: options.activeIn.phase,
            };
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
                this.incrementPlayerVoteCount(votedPlayers, ravenMarkedPlayers._id, game, game.options.roles.raven.markPenalty);
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

exports.checkPlayerAbilityToVote = (voterId, game) => {
    const voter = getPlayerWithId(voterId, game);
    if (!voter) {
        throw generateError("CANT_VOTE", `Player with id "${voterId}" is not in game and so can't vote.`);
    } else if (!voter.isAlive) {
        throw generateError("CANT_VOTE", `Player with id "${voterId}" is dead and so can't vote.`);
    }
    const cantVoteAttribute = getPlayerAttribute(voter, "cant-vote");
    if (cantVoteAttribute && isPlayerAttributeActive(cantVoteAttribute, game)) {
        throw generateError("CANT_VOTE", `Player with id "${voterId}" has "cant-vote" attribute and so can't vote.`);
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

exports.checkJudgeSecondVoteRequest = async game => {
    const stutteringJudgePlayer = getPlayerWithRole("stuttering-judge", game);
    if (!stutteringJudgePlayer || !stutteringJudgePlayer.isAlive) {
        throw generateError("STUTTERING_JUDGE_ABSENT", "Second vote can't be requested if stuttering judge is absent from the game.");
    } else if (doesPlayerHaveAttribute(stutteringJudgePlayer, "powerless")) {
        throw generateError("STUTTERING_JUDGE_POWERLESS", "Stuttering judge is powerless and so can't request another vote.");
    } else if (!await GameHistory.didJudgeChooseSign(game._id)) {
        throw generateError("STUTTERING_JUDGE_DIDNT_CHOOSE_SIGN_YET", `Stuttering judge didn't choose his sign yet and so can't request another vote.`);
    } else if (!await GameHistory.doesStutteringJudgeHaveVoteRequestsLeft(game)) {
        throw generateError("VOTE_REQUESTS_EXCEEDED", "Stuttering judge doesn't have any vote request left.");
    }
};

exports.checkAndFillVotes = async(votes, game, options) => {
    if (!votes || !Array.isArray(votes)) {
        throw generateError("VOTES_REQUIRED", "`votes` need to be set");
    } else if (!votes.length) {
        throw generateError("VOTES_CANT_BE_EMPTY", "`votes` can't be empty");
    }
    if (options.doesJudgeRequestAnotherVote) {
        await this.checkJudgeSecondVoteRequest(game, options);
    }
    await this.checkVotesSourceAndTarget(votes, game, options);
    for (let i = 0; i < votes.length; i++) {
        votes[i].from = getPlayerWithId(votes[i].from, game);
        votes[i].for = getPlayerWithId(votes[i].for, game);
    }
};

exports.foxPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, expectedLength: 1, play });
    if (targets?.length && !targets.find(({ player }) => player.side.current === "werewolves") &&
        game.options.roles.fox.isPowerlessIfMissesWerewolf) {
        const foxPlayer = getPlayerWithRole("fox", game);
        this.addPlayerAttribute(foxPlayer._id, "powerless", game, { source: "fox" });
    }
};

exports.checkAndGetChosenCard = (chosenCardId, game) => {
    const chosenCard = chosenCardId ? game.additionalCards.find(({ _id }) => _id.toString() === chosenCardId.toString()) : null;
    const werewolvesRoles = getWerewolfRoles();
    const thiefAdditionalCards = game.additionalCards.filter(({ for: recipient }) => recipient === "thief");
    if (chosenCardId && !chosenCard) {
        throw generateError("CHOSEN_CARD_NOT_FOUND", `The chosen card with id "${chosenCardId}" is not found in additional cards.`);
    } else if (!chosenCard && thiefAdditionalCards.every(({ role: roleName }) => werewolvesRoles.find(({ name }) => name === roleName)) &&
        game.options.roles.thief.mustChooseBetweenWerewolves) {
        throw generateError("THIEF_MUST_STEAL", `As all additional cards for thief are on the werewolves side, he must choose one of them.`);
    }
    if (chosenCard) {
        chosenCard.isUsed = true;
    }
    return chosenCard;
};

exports.thiefPlays = async(play, game, gameHistoryEntry) => {
    const chosenCard = this.checkAndGetChosenCard(play.card, game);
    if (chosenCard) {
        const thiefPlayer = getPlayerWithRole("thief", game);
        const chosenRole = getRoles().find(({ name }) => name === chosenCard.role);
        thiefPlayer.role.current = chosenRole.name;
        thiefPlayer.side.current = chosenRole.side;
        gameHistoryEntry.play.card = chosenCard;
        await Game.refreshNightWaitingQueue(game);
    }
};

exports.whiteWerewolfPlays = async(play, game) => {
    const { targets } = play;
    const targetsExpectedLength = !getRemainingWerewolvesToEat(game).length ? 0 : 1;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, expectedLength: targetsExpectedLength, play });
    if (targets?.length) {
        this.addPlayerAttribute(targets[0].player._id, "eaten", game, { source: "white-werewolf" });
    }
};

exports.piedPiperPlays = async(play, game) => {
    const { targets } = play;
    const { charmedPeopleCountPerNight: maxCharmedPeople } = game.options.roles.piedPiper;
    const remainingPlayersToCharmCount = getRemainingPlayersToCharm(game).length;
    const targetsExpectedLength = remainingPlayersToCharmCount >= maxCharmedPeople ? maxCharmedPeople : remainingPlayersToCharmCount;
    await this.checkAndFillTargets(targets, game, { expectedLength: targetsExpectedLength, play });
    for (const { player } of targets) {
        this.addPlayerAttribute(player._id, "charmed", game);
    }
};

exports.scapegoatPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { canBeUnset: true, canBeEmpty: true, play });
    for (const { player } of targets) {
        this.addPlayerAttribute(player._id, "cant-vote", game, { activeIn: { turn: 1 } });
    }
};

exports.bigBadWolfPlays = async(play, game) => {
    const { targets } = play;
    const targetsExpectedLength = !getRemainingVillagersToEat(game).length ? 0 : 1;
    const options = { expectedLength: targetsExpectedLength, canBeUnset: !targetsExpectedLength, canBeEmpty: !targetsExpectedLength, play };
    await this.checkAndFillTargets(targets, game, options);
    if (targets?.length) {
        this.addPlayerAttribute(targets[0].player._id, "eaten", game, { source: "big-bad-wolf" });
    }
};

exports.dogWolfPlays = (play, game, gameHistoryEntry) => {
    if (!game.options.roles.dogWolf.isChosenSideRandom && !play.side) {
        throw generateError("DOG_WOLF_MUST_CHOOSE_SIDE", "Dog-wolf must choose a side between `villagers` and `werewolves`.");
    } else if (game.options.roles.dogWolf.isChosenSideRandom) {
        play.side = Math.random() < 0.5 ? "werewolves" : "villagers";
    }
    if (play.side === "werewolves") {
        const dogWolfPlayer = getPlayerWithRole("dog-wolf", game);
        if (dogWolfPlayer) {
            dogWolfPlayer.side.current = "werewolves";
        }
    }
    gameHistoryEntry.play.side = play.side;
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
    this.addPlayerAttribute(targets[0].player._id, "sheriff", game, { forcedSource: "sheriff" });
};

exports.sheriffSettlesVotes = async(play, game, gameHistoryEntry) => {
    const { targets, action } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    await this.killPlayer(targets[0].player._id, action, game, gameHistoryEntry);
};

exports.sheriffPlays = async(play, game, gameHistoryEntry) => {
    const sheriffActions = {
        "settle-votes": this.sheriffSettlesVotes,
        "delegate": this.sheriffDelegates,
    };
    await sheriffActions[play.action](play, game, gameHistoryEntry);
};

exports.werewolvesPlay = async(play, game, gameHistoryEntry) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    if (targets[0].isInfected) {
        const infectedPlayer = getPlayerWithId(targets[0].player._id, game);
        if (infectedPlayer) {
            if (infectedPlayer.role.current === "ancient" && !await this.isAncientKillable(play.action, game, gameHistoryEntry)) {
                this.addPlayerAttribute(targets[0].player._id, "eaten", game);
            } else {
                infectedPlayer.side.current = "werewolves";
                if (infectedPlayer.role.current === "pied-piper" && game.options.roles.piedPiper.isPowerlessIfInfected) {
                    filterOutSourcesFromWaitingQueue(game, ["pied-piper", "charmed"]);
                }
            }
        }
    } else {
        this.addPlayerAttribute(targets[0].player._id, "eaten", game);
    }
};

exports.hunterPlays = async(play, game, gameHistoryEntry) => {
    const { targets, action } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    await this.killPlayer(targets[0].player._id, action, game, gameHistoryEntry);
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
    if (targets) {
        for (const target of targets) {
            if (target.hasDrankLifePotion) {
                this.addPlayerAttribute(target.player._id, "drank-life-potion", game);
            } else if (target.hasDrankDeathPotion) {
                this.addPlayerAttribute(target.player._id, "drank-death-potion", game);
            }
        }
    }
};

exports.seerPlays = async(play, game) => {
    const { targets } = play;
    await this.checkAndFillTargets(targets, game, { expectedLength: 1, play });
    this.addPlayerAttribute(targets[0].player._id, "seen", game);
};

exports.allVote = async(play, game, gameHistoryEntry) => {
    const { votes, action, doesJudgeRequestAnotherVote } = play;
    await this.checkAndFillVotes(votes, game, { action, doesJudgeRequestAnotherVote });
    const nominatedPlayers = this.getNominatedPlayers(votes, game, { action, allowTie: true });
    gameHistoryEntry.play.targets = nominatedPlayers.map(nominatedPlayer => ({ player: nominatedPlayer }));
    const scapegoatPlayer = getPlayerWithRole("scapegoat", game);
    const sheriffPlayer = getPlayerWithAttribute("sheriff", game);
    if (nominatedPlayers.length > 1) {
        if (scapegoatPlayer?.isAlive && !doesPlayerHaveAttribute(scapegoatPlayer, "powerless")) {
            await this.killPlayer(scapegoatPlayer._id, action, game, gameHistoryEntry, { nominatedPlayers });
        } else if (sheriffPlayer?.isAlive && game.options.roles.sheriff.canSettleVotes) {
            this.insertActionImmediately(game, { for: "sheriff", to: "settle-votes" });
            gameHistoryEntry.play.votesResult = "need-settlement";
        } else if (!await Game.isCurrentPlaySecondVoteAfterTie(game)) {
            this.insertActionImmediately(game, { for: "all", to: "vote" });
            gameHistoryEntry.play.votesResult = "need-settlement";
        } else {
            gameHistoryEntry.play.votesResult = "no-death";
        }
    } else {
        await this.killPlayer(nominatedPlayers[0]._id, action, game, gameHistoryEntry);
    }
    if (play.doesJudgeRequestAnotherVote) {
        game.waiting.push({ for: "all", to: "vote", cause: "stuttering-judge-request" });
    }
};

exports.allElectSheriff = async(play, game, gameHistoryEntry) => {
    const { votes, action } = play;
    await this.checkAndFillVotes(votes, game, { action });
    const nominatedPlayers = this.getNominatedPlayers(votes, game, { action });
    this.addPlayerAttribute(nominatedPlayers[0]._id, "sheriff", game);
    gameHistoryEntry.play.targets = nominatedPlayers.map(nominatedPlayer => ({ player: nominatedPlayer }));
    gameHistoryEntry.play.votesResult = "election";
};

exports.allPlay = async(play, game, gameHistoryEntry) => {
    const allActions = {
        "elect-sheriff": this.allElectSheriff,
        "vote": this.allVote,
    };
    await allActions[play.action](play, game, gameHistoryEntry);
};

exports.eaten = async(game, play, gameHistoryEntry) => {
    const eatenPlayer = getPlayerWithAttribute("eaten", game);
    await this.killPlayer(eatenPlayer._id, "eat", game, gameHistoryEntry, { forcedSource: play.source });
    this.removePlayerAttribute(eatenPlayer._id, "eaten", game);
};

exports.removeAttributeFromAllPlayers = (attributeName, game) => {
    for (const { _id } of game.players) {
        this.removePlayerAttribute(_id, attributeName, game);
    }
};

exports.drankDeathPotion = async(game, play, gameHistoryEntry) => {
    const poisonedPlayer = getPlayerWithAttribute("drank-death-potion", game);
    await this.killPlayer(poisonedPlayer._id, "use-potion", game, gameHistoryEntry);
    this.removePlayerAttribute(poisonedPlayer._id, "drank-death-potion", game);
};

exports.makeBearTamerGrowls = game => {
    const bearTamerPlayer = getPlayerWithRole("bear-tamer", game);
    if (bearTamerPlayer && !doesPlayerHaveAttribute(bearTamerPlayer, "powerless")) {
        const leftAliveNeighbor = getNearestNeighbor(bearTamerPlayer._id, game.players, "left", { isAlive: true });
        const rightAliveNeighbor = getNearestNeighbor(bearTamerPlayer._id, game.players, "right", { isAlive: true });
        if (bearTamerPlayer.side.current === "werewolves" && game.options.roles.bearTamer.doesGrowlIfInfected ||
            leftAliveNeighbor?.side.current === "werewolves" || rightAliveNeighbor?.side.current === "werewolves") {
            this.addPlayerAttribute(bearTamerPlayer._id, "growls", game);
        }
    }
};

exports.makeWerewolfDiesFromDisease = async(game, gameHistoryEntry) => {
    const contaminatedWerewolf = getPlayerWithAttribute("contaminated", game);
    if (contaminatedWerewolf) {
        await this.killPlayer(contaminatedWerewolf._id, "disease", game, gameHistoryEntry);
    }
};