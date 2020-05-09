# Codes & Values

## <a id="player-roles"></a>Player Roles

| Role      | [Group](#player-groups) |                 Description                                |
|:---------:|:---------:|------------------------------------------------------------|
| wolf      | wolves    | Each night, his group eats a villager chosen by the majority.                               |
| witch     | villagers | She has one life potion which prevents from murder of any kind and a death potion which instantly kills. She can only use each one once in the game.                                      |
| seer      | villagers | Each night, she sees the role of the player she wants.                          |
| protector | villagers | Each night, he protects the player he wants (including himself). He can't protect the same player twice in a row.                         |
| hunter    | villagers | If he dies, he shoots a victim to take his revenge.            |
| raven     | villagers | Each night, he can mark someone (including himself). The next phase (during the day), the marked player will have two votes against himself.                      |
| villagers | villagers | Has no powers, can only count on his speech.       |

## <a id="errors"></a>Errors

If you have an error from the API, you'll get a generic structure with a field `code`. This field has an integer value.

| Code | HTTP Code |                 Description                                |
|:----:|:---------:|------------------------------------------------------------|
| 1    | 400       | You provided incorrect params                              |
| 2    | 401       | You're not authorized                                      |
| 3    | 400       | The email provided already exists                          |
| 4    | 404       | The requested resource is not found                        |
| 5    | 500       | The server got an error, this is not your fault            |
| 6    | 400       | You provided a bad or malformed token                      |
| 7    | 401       | The credentials provided don't match ani in database       |