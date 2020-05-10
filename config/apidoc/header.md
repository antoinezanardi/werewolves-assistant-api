*This API is proudly coded and provided by Antoine ZANARDI with love*

# Models

### Fields annotated with `*` are optional.

## <a id="user-model"></a>User

| Field                | Type     | Description                                                         |
|----------------------|----------|---------------------------------------------------------------------|
| _id                  | ObjectId | User's ID.                                                     |
| email                | String   | User's email.                                                     |
| createdAt            | Date     | When the user created his account.                                                     |
| updatedAt            | Date     | When the user updated his account.                                                     |

## <a id="game-model"></a>Game

| Field                | Type     | Description                                                         |
|----------------------|----------|---------------------------------------------------------------------|
| _id                  | ObjectId | Game's ID.                                                     |
| gameMaster           | User     | User who created the game and managing it. (_See: [Models - User](#user-model)_)                                                     |
| players              | Player[] | Players of the game. (_See: [Models - Player](#player-model)_)                                                     |
| turn                 | Number   | Starting at `1`, a turn starts with the first phase (the `night`) and ends with the second phase (the `day`).                                                    |
| phase                | String   | Each turn has two phases, `day` or `night`.                                                    |
| waiting              | Object   |                                                |
| &emsp;&emsp;for      | String   | Can be either a group, a role or the mayor. (_See: [Codes - Player Groups](#player-groups) or [Codes - Player Roles](#player-roles) for possibilities_)                                         |
| &emsp;&emsp;to       | String   | What action needs to be performed by `waiting.for`. (_See: [Codes - Player Actions](#player-actions) for possibilities_)                                         |
| status               | String   | Game's current status. (_See: [Codes - Game Statuses](#game-statuses) for possibilities_)                                                |
| **winners***         | Player[] | Winners of the game when status is `done`. (_See: [Models - Player](#player-model)_)                                                |
| createdAt            | Date     | When the user created his account.                                                     |
| updatedAt            | Date     | When the user updated his account.                                                     |

## <a id="player-model"></a>Player

| Field                   | Type     | Description                                                         |
|-------------------------|----------|---------------------------------------------------------------------|
| _id                     | ObjectId | Player's ID.                                                     |
| name                    | String   | Player's name.                                                     |
| role                    | Object   |                                                      |
| &emsp;&emsp;original    | String   | Player's Original role when the game started. (_See [Codes - Player Roles](#player-roles) for possibilities_)                                                    |
| &emsp;&emsp;current     | String   | Player's current role. (_See [Codes - Player Roles](#player-roles) for possibilities_)                                                    |
| &emsp;&emsp;group       | String   | Player's current group. (_See [Codes - Player Groups](#player-groups) for possibilities_)                                                    |
| attributes              | Array    | An attribute is an effect or a status on a player.                                                     |
| &emsp;&emsp;attribute   | String   | Attribute's name on the player. (_See [Codes - Player Attributes](#player-attributes) for possibilities_)                                                    |

## <a id="role-model"></a>Role

| Field                | Type     | Description                                                         |
|----------------------|----------|---------------------------------------------------------------------|
| _id                  | ObjectId | Role's ID.                                                     |
| name                 | String   | Role's name.                                                     |
| group                | String   | Role's group.                                                     |
| maxInGame            | Number   | Maximum possible of this role in a game.                                                     |