---

*This API is proudly coded and provided by Antoine ZANARDI with ❤️*

<a href="https://github.com/antoinezanardi" target="_blank"><img src="https://img.shields.io/github/followers/antoinezanardi.svg?style=social&amp;label=Follow%20me%20%3A%29" alt="GitHub followers"/></a>

---

# Classes

### Fields annotated with `*` are optional. Therefore, values aren't always set.

## <a id="user-class"></a>👤 User

| Field                | Type     | Description                                                         |
|----------------------|:--------:|---------------------------------------------------------------------|
| _id                  | ObjectId | User's ID.                                                     |
| email                | String   | User's email.                                                     |
| createdAt            | Date     | When the user created his account.                                                     |
| updatedAt            | Date     | When the user updated his account.                                                     |

## <a id="game-class"></a>🎲 Game

| Field                | Type                      | Description                                                         |
|----------------------|:-------------------------:|---------------------------------------------------------------------|
| _id                  | ObjectId                  | Game's ID.                                                     |
| gameMaster           | User                      | User who created the game and managing it. (_See: [Classes - User](#user-class)_)                                                     |
| players              | [Player[]](#player-class) | Players of the game.                                                     |
| turn                 | Number                    | Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).                                                    |
| phase                | String                    | Each turn has two phases, `day` or `night`. Starting at `night`.                                                    |
| tick                 | Number                    | Starting at `1`, tick increments each time a play is made.                                                    |
| waiting              | Object                    |                                                |
| &emsp;&emsp;for      | String                    | Can be either a group, a role or the mayor. (_See: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `mayor`_)                                         |
| &emsp;&emsp;to       | String                    | What action needs to be performed by `waiting.for`. (_See: [Codes - Player Actions](#player-actions)_)                                         |
| status               | String                    | Game's current status. (_See: [Codes - Game Statuses](#game-statuses)_)                                                |
| **winners***         | [Player[]](#player-class) | Winners of the game when status is `done`. (_See: [Classes - Player](#player-class)_)                                                |
| createdAt            | Date                      | When the user created his account.                                                     |
| updatedAt            | Date                      | When the user updated his account.                                                     |

## <a id="player-class"></a>🐺⚡🧙 ‍Player

| Field                      | Type     | Description                                                         |
|----------------------------|:--------:|---------------------------------------------------------------------|
| _id                        | ObjectId | Player's ID.                                                     |
| name                       | String   | Player's name.                                                     |
| role                       | Object   |                                                      |
| &emsp;&emsp;original       | String   | Player's Original role when the game started. (_See: [Codes - Player Roles](#player-roles)_)                                                    |
| &emsp;&emsp;current        | String   | Player's current role. (_See: [Codes - Player Roles](#player-roles)_)                                                    |
| &emsp;&emsp;group          | String   | Player's current group. (_Possibilities: [Codes - Player Groups](#player-groups)_)                                                    |
| attributes                 | Array    | An attribute is an effect or a status on a player.                                                     |
| &emsp;&emsp;attribute      | String   | Attribute's name on the player. (_Possibilities: [Codes - Player Attributes](#player-attributes)_)                                                    |
| &emsp;&emsp;source         | String   | Which role or group gave this attribute to the player. (_Possibilities: [Codes - Player Roles](#player-roles) or [Codes - Player Groups](#player-groups) or `mayor`_)                                                    |
| **&emsp;&emsp;remaining*** | String   | Remaining time for this attribute before disappear. Expressed in `phases` (_e.g: `2 phases`_), decreases after each phase. |
| isAlive                    | Boolean  | If the player is currently alive or not.                                                     |
| **murdered***              | Object   | Set if `isAlive` is `false`.                                                    |
| &emsp;&emsp;by             | String   | Which role or group killed the player. (_Possibilities: [Codes - Player Roles](#player-roles) or [Codes - Player Groups](#player-groups) or `mayor`_)                                                   |
| &emsp;&emsp;of             | String   | What action killed the player. (_Possibilities: [Codes - Player Actions](#player-actions)_)                                                 |

## <a id="role-class"></a>🃏 Role

| Field                | Type     | Description                                                         |
|----------------------|:--------:|---------------------------------------------------------------------|
| _id                  | ObjectId | Role's ID.                                                     |
| name                 | String   | Role's name.                                                     |
| group                | String   | Role's group.                                                     |
| maxInGame            | Number   | Maximum possible of this role in a game.                                                     |

## <a id="game-history-class"></a>📜 Game History

Each time a play is done by anyone or any group, an entry in game's history is saved. Each entry has the following structure:

| Field                            | Type                      | Description                                                         |
|----------------------------------|:-------------------------:|---------------------------------------------------------------------|
| _id                              | ObjectId                  | Game history entry's ID.                                                     |
| gameId                           | ObjectId                  | Game's ID.                                                     |
| turn                             | Number                    | Game's turn.                                                     |
| phase                            | Number                    | Game's phase.                                                     |
| tick                             | Number                    | Game's tick.                                                     |
| play                             | [Play](#play-class)       | Game's play                                                      |

## <a id="play-class"></a>🕹 Play
| Field                            | Type                      | Description                                                         |
|----------------------------------|:-------------------------:|---------------------------------------------------------------------|
| &emsp;&emsp;source               | String                    | Source of the play. (_Possibilities: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) or `mayor`_)                                                      |
| &emsp;&emsp;action               | String                    | Action of the play. (_Possibilities: [Codes - Player Actions](#player-actions)_)                                                      |
| &emsp;&emsp;**targets***         | [Player[]](#player-class) | Player(s) affected by the play.                                                      |

## <a id="error-class"></a>⚠️ API Error

Class returned from API HTTP requests when something went wrong.

| Field                | Type     | Description                                                         |
|----------------------|:--------:|---------------------------------------------------------------------|
| code                 | Number   | Unique code.                                                     |
| HTTPCode             | Number   | HTTP Code.                                                     |
| type                 | String   | Unique type.                                                     |
| data                 | any      | Error's data. Can be anything.                                                     |

See: [Codes - Errors](#errors) for more information about each property and values.
