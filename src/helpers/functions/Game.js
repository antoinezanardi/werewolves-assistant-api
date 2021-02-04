const {
    patchableGameStatuses, waitingForPossibilities, gameStatuses, turnNightActionsOrder, findFields, defaultGameOptions,
    gamePhases, wonByPossibilities,
} = require("../constants/Game");
const { doesPlayerHaveAttribute } = require("./Player");

exports.isWerewolfSideAlive = game => game.players.some(player => player.side.current === "werewolves" && player.isAlive);

exports.areAllWerewolvesAlive = game => this.getPlayersWithSide("werewolves", game).every(({ isAlive }) => isAlive);

exports.isVillagerSideAlive = game => game.players.some(player => player.side.current === "villagers" && player.isAlive);

exports.areAllPlayersDead = game => game.players.every(player => !player.isAlive);

exports.areLoversTheOnlyAlive = game => !!this.getPlayerWithRole("cupid", game) &&
                                    game.players.every(player => doesPlayerHaveAttribute(player, "in-love") ? player.isAlive : !player.isAlive);

exports.getRemainingPlayersToCharm = game => game.players.filter(({ role, attributes, isAlive }) => isAlive &&
    role.current !== "pied-piper" && !doesPlayerHaveAttribute({ attributes }, "charmed"));

exports.getRemainingPlayersToEat = game => game.players.filter(({ side, attributes, isAlive }) => isAlive &&
    side.current !== "werewolves" && !doesPlayerHaveAttribute({ attributes }, "eaten"));

exports.hasPiedPiperWon = game => {
    const piedPiperPlayer = this.getPlayerWithRole("pied-piper", game);
    const remainingPlayersToCharm = this.getRemainingPlayersToCharm(game);
    return piedPiperPlayer?.isAlive && !doesPlayerHaveAttribute(piedPiperPlayer, "powerless") && piedPiperPlayer.side.current === "villagers" &&
        !remainingPlayersToCharm.length;
};

exports.isGameDone = game => this.areAllPlayersDead(game) ||
        (!this.isVillagerSideAlive(game) || !this.isWerewolfSideAlive(game) || this.areLoversTheOnlyAlive(game) ||
            this.hasPiedPiperWon(game)) && !this.isActionInWaitingQueue(game, "shoot");

exports.isActionInWaitingQueue = (game, action) => game.waiting.some(({ to }) => to === action);

exports.getPatchableGameStatuses = () => JSON.parse(JSON.stringify(patchableGameStatuses));

exports.getWaitingForPossibilities = () => JSON.parse(JSON.stringify(waitingForPossibilities));

exports.getGameStatuses = () => JSON.parse(JSON.stringify(gameStatuses));

exports.getGameTurNightActionsOrder = () => JSON.parse(JSON.stringify(turnNightActionsOrder));

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