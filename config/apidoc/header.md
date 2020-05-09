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
| createdAt            | Date     | When the user created his account.                                                     |
| updatedAt            | Date     | When the user updated his account.                                                     |

## <a id="role-model"></a>Role

| Field                | Type     | Description                                                         |
|----------------------|----------|---------------------------------------------------------------------|
| _id                  | ObjectId | Role's ID.                                                     |
| name                 | String   | Role's name.                                                     |
| group                | String   | Role's group.                                                     |
| maxInGame            | Number   | Maximum possible of this role in a game.                                                     |