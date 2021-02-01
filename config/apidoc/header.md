---

#### If you are not familiar with the game **The Werewolves of Millers Hollow**, please check out <a href="https://en.wikipedia.org/wiki/The_Werewolves_of_Millers_Hollow" target="_blank">the Wikipedia page for general rules</a>.

#### ⚠️ **Warning**: Rules explained on this page DO NOT follow strictly the original game's rules.

*~ This API is proudly coded and provided by <a href="https://antoinezanardi.fr" target="_blank">Antoine ZANARDI</a> with ❤️ and open source on <a href="https://github.com/antoinezanardi/werewolves-assistant-api" target="_blank">GitHub<a/> ~️*

<a href="https://github.com/antoinezanardi" target="_blank"><img src="https://img.shields.io/github/followers/antoinezanardi.svg?style=social&amp;label=Follow%20me%20%3A%29" alt="GitHub followers"/></a>
<a href="https://github.com/antoinezanardi/werewolves-assistant-api" target="_blank"><img src="https://img.shields.io/github/stars/antoinezanardi/werewolves-assistant-api.svg?style=social&label=Feel%20free%20to%20leave%20a%20star" alt="GitHub stars"/></a>

---

# Classes

### Fields annotated with `*` are optional. Therefore, classes properties aren't always set.

## <a id="user-class"></a>👤 User

In order to log in and create games, a user must be created (aka the future game master). 

| Field                | Type     | Description                                                         |
|----------------------|:--------:|---------------------------------------------------------------------|
| _id                  | ObjectId | User's ID.                                                          |
| email                | String   | User's email.                                                       |
| createdAt            | Date     | When the user created his account.                                  |
| updatedAt            | Date     | When the user updated his account.                                  |

## <a id="game-class"></a>🎲 Game

A user can create as many games as he wants as long as he doesn't have a game with the status `playing`.

A game must contain at least **4 players** and can be customized by setting different `options`.

During the game, the `waiting` queue tells the game master what are the upcoming actions and players involved.

Each time a play is performed, `tick` increments and `phase` is set according to the current state. Game's `turn` increases after each succession of a `night` and a `day`.

Game ends when one of the following conditions is met:

- All players on `villagers` side are dead. 
- All players on `werewolves` side are dead. 
- Players with the `lovers` attribute are the only survivors.
- The pied piper is in the game, alive, not infected by the vile father of wolves or powerless, and all other survivors have the `charmed` attribute.
- All players are dead. 

At the end of the game, winner(s) are set in the `won` property.

When game's status is `done` or `canceled`, it can be reviewed by the game master.

| Field&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; | Type                                  | Description                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------------|:-------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| _id                                                                           | ObjectId                              | Game's ID.                                                                                                                                                                                                                                                                                    |
| gameMaster                                                                    | User                                  | User who created the game and managing it. (_See: [Classes - User](#user-class)_)                                                                                                                                                                                                             |
| players                                                                       | [Player[]](#player-class)             | Players of the game.                                                                                                                                                                                                                                                                          |
| turn                                                                          | Number                                | Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).                                                                                                                                                                                 |
| phase                                                                         | String                                | Each turn has two phases, `day` or `night`. Starting at `night`.                                                                                                                                                                                                                              |
| tick                                                                          | Number                                | Starting at `1`, tick increments each time a play is made.                                                                                                                                                                                                                                    |
| waiting                                                                       | Object[]                              | Queue of upcoming actions and sources.                                                                                                                                                                                                                                                        |
| &emsp;⮑ for                                                                  | String                                | Can be either a group, a role or the sheriff. (_See: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `sheriff`_)                                                                                                                                          |
| &emsp;⮑ to                                                                   | String                                | What action needs to be performed by `waiting.for`. (_See: [Codes - Player Actions](#player-actions)_)                                                                                                                                                                                        |
| status                                                                        | String                                | Game's current status. (_See: [Codes - Game Statuses](#game-statuses)_)                                                                                                                                                                                                                       |
| options                                                                       | Object                                | Game's options.                                                                                                                                                                                                                                                                               |
| &emsp;⮑ roles                                                                | Object                                | Game roles options.                                                                                                                                                                                                                                                                           |
| &emsp;&emsp;⮑ sheriff                                                        | Object                                | Game role sheriff's options.                                                                                                                                                                                                                                                                  |
| &emsp;&emsp;&emsp;⮑ enabled                                                  | Boolean                               | If set to `true`, `sheriff` will be elected the first tick and the responsibility will be delegated when he dies. Otherwise, there will be no sheriff in the game and tie in votes will result in another vote between the tied players. In case of another equality, there will be no vote.  |
| &emsp;&emsp;&emsp;⮑ hasDoubledVote                                           | Boolean                               | If set to `true`, `sheriff` vote during the village's vote is doubled, otherwise, it's a regular vote. Default is `true`.                                                                                                                                                                     |
| &emsp;&emsp;⮑ seer                                                           | Object                                | Game role seer's options.                                                                                                                                                                                                                                                                     |
| &emsp;&emsp;&emsp;⮑ isTalkative                                              | Boolean                               | If set to `true`, the game master must say out loud what the seer saw during her night, otherwise, he must mime the seen role to the seer. Default is `true`.                                                                                                                                 |
| &emsp;&emsp;⮑ twoSisters                                                     | Object                                | Game role two sisters options.                                                                                                                                                                                                                                                                |
| &emsp;&emsp;&emsp;⮑ wakingUpInterval                                         | Number                                | Since first `night`, interval of nights when the Two Sisters are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.                                                                                                   |
| &emsp;&emsp;⮑ threeBrothers                                                  | Object                                | Game role three brothers options.                                                                                                                                                                                                                                                             |
| &emsp;&emsp;&emsp;⮑ wakingUpInterval                                         | Number                                | Since first `night`, interval of nights when the Three Brothers are waking up. Default is `2`, meaning they wake up every other night. If set to `0`, they are waking up the first night only.                                                                                                |
| history                                                                       | [GameHistory[]](#game-history-class)  | Game's history. Limited by default to `3` entries. (_See: [Classes - Game History Entry](#game-history-class)_)                                                                                                                                                                               |
| **won***                                                                      | Object                                | Winner(s) of the game when status is `done`.                                                                                                                                                                                                                                                  |
| &emsp;⮑ by                                                                   | String                                | Can be either a group or a role. (_Possibilities: `werewolves`, `villagers`, `lovers`, `pied-piper` or null if nobody won_)                                                                                                                                                                   |
| **&emsp;⮑ players***                                                         | [Player[]](#player-class)             | List of player(s) who won. (_See: [Classes - Player](#player-class)_)                                                                                                                                                                                                                         |
| **review***                                                                   | Object                                | Game master can attach a game review only if its status is set to `canceled` or `done`.                                                                                                                                                                                                       |
| &emsp;⮑ rating                                                               | Number                                | Review's rating, from 0 to 5.                                                                                                                                                                                                                                                                 |
| **&emsp;⮑ comment***                                                         | String                                | Review's comment, from 1 to 500 characters long.                                                                                                                                                                                                                                              |
| **&emsp;⮑ dysfunctionFound***                                                | Boolean                               | If a bug or a dysfunction was found during the game.                                                                                                                                                                                                                                          |
| createdAt                                                                     | Date                                  | When the user created his account.                                                                                                                                                                                                                                                            |
| updatedAt                                                                     | Date                                  | When the user updated his account.                                                                                                                                                                                                                                                            |

## <a id="player-class"></a>🐺⚡🧙 Player

At the start of the game, each player is either on the `side` of the `werewolves` or on the `side` of the `villagers` and must win with his `side`.

Each player has a `role` which can give him powers during the game. All roles are described in the [dedicated Player Roles section](#player-roles).

Due to some actions, players `role` and `side` can change during the game.

During the game, players can apply to each other `attributes` with many effects and duration. All attributes are described in the [dedicated Player Attributes section](#player-attributes).

When a player is killed, `isAlive` is set to `false` and `murdered` object is filled to tell the game master the source and cause of murder.

| Field&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;| Type     | Description                                                                                                                                                                                                        |
|------------------------------------------------------------|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| _id                                                        | ObjectId | Player's ID.                                                                                                                                                                                                       |
| name                                                       | String   | Player's name.                                                                                                                                                                                                     |
| role                                                       | Object   | Player's role data.                                                                                                                                                                                                |
| &emsp;⮑ original                                          | String   | Player's original role when the game started. (_See: [Codes - Player Roles](#player-roles)_)                                                                                                                       |
| &emsp;⮑ current                                           | String   | Player's current role. (_See: [Codes - Player Roles](#player-roles)_)                                                                                                                                              |
| &emsp;⮑ isRevealed                                        | Boolean  | If player's role is revealed to other players.                                                                                                                                                                     |
| side                                                       | Object   | Player's side data.                                                                                                                                                                                                |
| &emsp;⮑ original                                          | String   | Player's original side when the game started. (_See: [Codes - Player Sides](#player-sides)_)                                                                                                                       |
| &emsp;⮑ current                                           | String   | Player's current side. (_See: [Codes - Player Sides](#player-sides)_)                                                                                                                                              |
| attributes                                                 | Object[] | An attribute is an effect or a status on a player.                                                                                                                                                                 |
| &emsp;⮑ name                                              | String   | Attribute's name on the player. (_Possibilities: [Codes - Player Attributes](#player-attributes)_)                                                                                                                 |
| &emsp;⮑ source                                            | String   | Which role or group gave this attribute to the player. (_Possibilities: [Codes - Player Roles](#player-roles) or [Codes - Player Groups](#player-groups) or `sheriff`_)                                            |
| **&emsp;⮑ remainingPhases***                              | Number   | Remaining time for this attribute before disappear. If not set, the attribute will remain forever on the player. Else, decreases after each phase if `activeAt` conditions are met or if `activeAt` is not set.    |
| **&emsp;⮑ activeAt***                                     | Object   | When the attribute will become active and will have consequences on players. Used for attributes with delay. If not set, the attribute is immediately active.                                                      |
| &emsp;&emsp;⮑ turn                                        | Number   | From which game's turn the attribute will become active.                                                                                                                                                           |
| **&emsp;&emsp;⮑ phase***                                  | String   | From which game turn's phase (`day` or `night`) the attribute will become active.                                                                                                                                  |
| isAlive                                                    | Boolean  | If the player is currently alive or not.                                                                                                                                                                           |
| **murdered***                                              | Object   | Set if `isAlive` is `false`.                                                                                                                                                                                       |
| &emsp;⮑ by                                                | String   | Which role or group killed the player. (_Possibilities: [Codes - Player Roles](#player-roles) or [Codes - Player Groups](#player-groups) or `sheriff`_)                                                            |
| &emsp;⮑ of                                                | String   | What action killed the player. (_Possibilities: [Codes - Player Actions](#player-actions)_)                                                                                                                        |

## <a id="role-class"></a>🃏 Role

All available roles of this version can be gathered on the [route GET /roles](#api-Roles_🃏-GetRoles).

⚠️ **Warning**: Don't mix up the `Role class` (below) and the player `role` attribute, they don't have the same structure.

| Field                         | Type     | Description                                                                                             |
|-------------------------------|:--------:|---------------------------------------------------------------------------------------------------------|
| _id                           | ObjectId | Role's ID.                                                                                              |
| name                          | String   | Role's name.                                                                                            |
| side                          | String   | Role's original side.                                                                                   |
| **minInGame***                | Number   | If the role is chosen by at least one player, then minimum X players must choose it to start the game.  |
| maxInGame                     | Number   | Maximum possible of this role in a game.                                                                |
| **recommendedMinPlayers***    | Number   | It is recommended to have at least X players in game for choosing this role.                            |

## <a id="game-history-class"></a>📜 Game History Entry

Each time a play is done by anyone, any group or any side, an entry in game's history is saved. Each entry has the following structure:

| Field                            | Type                      | Description                                                            |
|----------------------------------|:-------------------------:|------------------------------------------------------------------------|
| _id                              | ObjectId                  | Game history entry's ID.                                               |
| gameId                           | ObjectId                  | Game's ID.                                                             |
| turn                             | Number                    | Game's turn.                                                           |
| phase                            | String                    | Game's phase.                                                          |
| tick                             | Number                    | Game's tick.                                                           |
| play                             | [Play](#play-class)       | Game's play. (_See: [Classes - Play](#play-class)_)                    |
| **deadPlayers***                 | [Player](#player-class)[] | Player(s) that might died after the play.                              |
| **revealedPlayers***             | [Player](#player-class)[] | Player(s) which role has been revealed after the play.                 |

## <a id="play-class"></a>🕹 Play

| Field&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;    | Type                      | Description                                                                                                                                                                      |
|----------------------------------------------------|:-------------------------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| action                                             | String                    | Action of the play. (_Possibilities: [Codes - Player Actions](#player-actions)_)                                                                                                 |
| source                                             | Object                    | Source of the play.                                                                                                                                                              |
| &emsp;⮑ name                                      | String                    | Source of the play. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `sheriff`_)                                             |
| &emsp;⮑ players                                   | [Player](#player-class)[] | Players expected to play.                                                                                                                                                        |
| **targets***                                       | Object[]                  | Players affected by the play. When `votes` are set, targets are nominated from the vote.                                                                                         |
| &emsp;⮑ player                                    | [Player](#player-class)   | Targeted player.                                                                                                                                                                 |
| **&emsp;⮑ isInfected***                           | Boolean                   | Only if there is `vile-father-of-wolves` in the game and the action is `eat` from `werewolves`. If set to `true`, the target joined the `werewolves` side.                       |
| **&emsp;⮑ potion***                               | Object                    | Only available for the `witch`.                                                                                                                                                  |
| **&emsp;&emsp;⮑ life***                           | Boolean                   | Only available for the `witch`. If set to `true`, target is saved from werewolves.                                                                                               |
| **&emsp;&emsp;⮑ death***                          | Boolean                   | Only available for the `witch`. If set to `true`, target is killed.                                                                                                              |
| **votes***                                         | Object[]                  | Votes of the play.                                                                                                                                                               |
| &emsp;⮑ from                                      | [Player](#player-class)   | Vote's source.                                                                                                                                                                   |
| &emsp;⮑ for                                       | [Player](#player-class)   | Vote's target.                                                                                                                                                                   |
| **side**                                           | String                    | Only available for the `dog-wolf`. Is equal to `villagers` or `werewolves` depending on the chosen side.                                                                         |

## <a id="error-class"></a>⚠️ API Error

Class returned from API HTTP requests when something went wrong.

| Field                | Type     | Description                                                         |
|----------------------|:--------:|---------------------------------------------------------------------|
| code                 | Number   | Unique code.                                                        |
| HTTPCode             | Number   | HTTP Code.                                                          |
| type                 | String   | Unique type.                                                        |
| data                 | any      | Error's data. Can be anything.                                      |

See: [Codes - Errors](#errors) for more information about each property and values.
