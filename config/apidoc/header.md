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
| email                | String   | User's email.                                                     |
| createdAt            | Date     | When the user created his account.                                                     |
| updatedAt            | Date     | When the user updated his account.                                                     |

## <a id="role-model"></a>Role

| Field                | Type     | Description                                                         |
|----------------------|----------|---------------------------------------------------------------------|
| _id                  | ObjectId | Role's ID.                                                     |
| name                 | String   | Role's name.                                                     |
| group                | String   | Role's group.                                                     |
| maxInGame            | Number   | Maximum possible of this role in a game.                                                     |