const {
    patchableGameStatuses, waitingForPossibilities, gameStatuses, turnNightActionsOrder, findFields, defaultGameOptions, waitingForCauses,
    gamePhases, wonByPossibilities, gameRepartitionForbiddenRoleNames, votesResults, additionalCardsForRoleNames, additionalCardsThiefRoleNames,
} = require("../constants/Game");
const { doesPlayerHaveAttribute } = require("./Player");

exports.isWerewolfSideAlive = game => game.players.some(player => player.side.current === "werewolves" && player.isAlive);

exports.areAllWerewolvesAlive = game => this.getPlayersWithSide("werewolves", game).every(({ isAlive }) => isAlive);

exports.isVillagerSideAlive = game => game.players.some(player => player.side.current === "villagers" && player.isAlive);

exports.areAllPlayersDead = game => game.players.every(player => !player.isAlive);

exports.areLoversTheOnlyAlive = game => !!this.getPlayerWithRole("cupid", game) &&
                                    game.players.every(player => doesPlayerHaveAttribute(player, "in-love") ? player.isAlive : !player.isAlive);

exports.isWhiteWerewolfOnlyAlive = game => !!this.getPlayerWithRole("white-werewolf", game) &&
    game.players.every(({ isAlive, role }) => role.current === "white-werewolf" && isAlive || role.current !== "white-werewolf" && !isAlive);

exports.getRemainingPlayersToCharm = game => game.players.filter(({ role, attributes, isAlive }) => isAlive &&
    role.current !== "pied-piper" && !doesPlayerHaveAttribute({ attributes }, "charmed"));

exports.getRemainingVillagersToEat = game => game.players.filter(({ side, attributes, isAlive }) => isAlive &&
    side.current !== "werewolves" && !doesPlayerHaveAttribute({ attributes }, "eaten"));

exports.getRemainingWerewolvesToEat = game => game.players.filter(({ side, role, isAlive }) => isAlive && side.current === "werewolves" &&
    role.current !== "white-werewolf");

exports.hasPiedPiperWon = game => {
    const piedPiperPlayer = this.getPlayerWithRole("pied-piper", game);
    const remainingPlayersToCharm = this.getRemainingPlayersToCharm(game);
    return piedPiperPlayer?.isAlive && !doesPlayerHaveAttribute(piedPiperPlayer, "powerless") && piedPiperPlayer.side.current === "villagers" &&
        !remainingPlayersToCharm.length;
};

exports.hasAngelWon = game => {
    const angel = this.getPlayerWithRole("angel", game);
    return !!angel && !angel.isAlive && !doesPlayerHaveAttribute(angel, "powerless") && game.turn === 1 &&
        ((angel.murdered.of === "vote" || angel.murdered.of === "settle-votes") && game.phase === "night" || angel.murdered.of === "eat");
};

exports.isGameDone = game => this.areAllPlayersDead(game) || this.hasAngelWon(game) ||
        (!this.isVillagerSideAlive(game) || !this.isWerewolfSideAlive(game) || this.areLoversTheOnlyAlive(game) ||
            this.hasPiedPiperWon(game) || this.isWhiteWerewolfOnlyAlive(game)) && !this.isActionInWaitingQueue(game, "shoot");

exports.isActionInWaitingQueue = (game, action) => game.waiting.some(({ to }) => to === action);

exports.getPatchableGameStatuses = () => JSON.parse(JSON.stringify(patchableGameStatuses));

exports.getWaitingForPossibilities = () => JSON.parse(JSON.stringify(waitingForPossibilities));

exports.getWaitingForCauses = () => JSON.parse(JSON.stringify(waitingForCauses));

exports.getGameStatuses = () => JSON.parse(JSON.stringify(gameStatuses));

exports.getGameTurnNightActionsOrder = () => JSON.parse(JSON.stringify(turnNightActionsOrder));

exports.getPlayerWithAttribute = (attributeName, game) => game.players.find(player => doesPlayerHaveAttribute(player, attributeName));

exports.getPlayersWithAttribute = (attributeName, game) => game.players.filter(player => doesPlayerHaveAttribute(player, attributeName));

exports.getPlayerWithRole = (roleName, game) => game.players.find(({ role }) => role.current === roleName);

exports.getPlayersWithRole = (roleName, game) => game.players.filter(({ role }) => role.current === roleName);

exports.getPlayerWithId = (playerId, game) => game.players.find(({ _id }) => _id.toString() === playerId.toString());

exports.getPlayersWithSide = (sideName, game) => game.players.filter(({ side }) => side.current === sideName);

exports.getAlivePlayers = game => game.players.filter(({ isAlive }) => isAlive);

exports.getPlayersExpectedToPlay = game => {
    if (!game.waiting || !game.waiting.length) {
        return [];
    }
    const { for: source, to: action } = game.waiting[0];
    const deadPlayersActions = ["delegate", "shoot", "ban-voting"];
    const waitingForGroups = {
        all: game.players,
        sheriff: this.getPlayersWithAttribute("sheriff", game),
        lovers: this.getPlayersWithAttribute("in-love", game),
        charmed: this.getPlayersWithAttribute("charmed", game),
        villagers: this.getPlayersWithSide("villagers", game),
        werewolves: this.getPlayersWithSide("werewolves", game),
    };
    const playersExpectedToPlay = waitingForGroups[source] ? waitingForGroups[source] : this.getPlayersWithRole(source, game);
    return deadPlayersActions.includes(action) ? playersExpectedToPlay : playersExpectedToPlay.filter(({ isAlive }) => isAlive);
};

exports.getFindFields = () => JSON.parse(JSON.stringify(findFields));

exports.getGamePhases = () => JSON.parse(JSON.stringify(gamePhases));

exports.getWonByPossibilities = () => JSON.parse(JSON.stringify(wonByPossibilities));

exports.getDefaultGameOptions = () => JSON.parse(JSON.stringify(defaultGameOptions));

exports.isVotePossible = game => game.players.some(player => player.isAlive && !doesPlayerHaveAttribute(player, "cant-vote"));

exports.filterOutSourcesFromWaitingQueue = (game, sources) => {
    game.waiting = game.waiting.filter(({ for: source }) => !sources.includes(source));
};

exports.getGameRepartitionForbiddenRoleNames = () => JSON.parse(JSON.stringify(gameRepartitionForbiddenRoleNames));

exports.getVotesResults = () => JSON.parse(JSON.stringify(votesResults));

exports.getAdditionalCardsForRoleNames = () => JSON.parse(JSON.stringify(additionalCardsForRoleNames));

exports.getAdditionalCardsThiefRoleNames = () => JSON.parse(JSON.stringify(additionalCardsThiefRoleNames));

exports.getNearestNeighbor = (playerId, players, direction, options = {}) => {
    let checkedNeighborsCount = 0;
    const player = players.find(({ _id }) => _id.toString() === playerId.toString());
    if (!player) {
        return null;
    }
    let checkingNeighborPosition = player.position;
    while (checkedNeighborsCount < players.length) {
        const checkingNeighbor = players[checkingNeighborPosition];
        if (checkingNeighbor.position !== player.position && (!options.isAlive || checkingNeighbor.isAlive) &&
            (!options.side || checkingNeighbor.side.current === options.side)) {
            return checkingNeighbor;
        }
        if (direction === "left") {
            checkingNeighborPosition = checkingNeighborPosition + 1 === players.length ? 0 : checkingNeighborPosition + 1;
        } else if (direction === "right") {
            checkingNeighborPosition = checkingNeighborPosition - 1 === -1 ? players.length - 1 : checkingNeighborPosition - 1;
        }
        checkedNeighborsCount++;
    }
    return null;
};