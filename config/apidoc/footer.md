# Codes & Values

## <a id="game-statuses"></a>🎲 Game Statuses
| Status            |                 Description                                |
|:-----------------:|------------------------------------------------------------|
| playing           | The game is currently playing. |
| done              | The game is finished, no more actions are required to proceed. |
| canceled          | The game has been canceled by game master and cannot be played any longer. |

## <a id="player-groups"></a>👥 Player Groups
| Group     |                 Description                                |
|:---------:|------------------------------------------------------------|
| all       | All players alive.  |
| wolves    | They teaming up are against `villagers` and need to kill them all to win the game.  |
| villagers | They teaming up are against `wolves` and need to kill them all to win the game.  |

## <a id="player-roles"></a>🃏 Player Roles

| Role      | [Group](#player-groups) |                 Description                                |
|:---------:|:-----------------------:|------------------------------------------------------------|
| wolf      | wolves                  | Each night, his group eats a villager chosen by the majority.                               |
| witch     | villagers               | She has one life potion which prevents from being eaten by wolves and a death potion which instantly kills. She can only use each one once in the game.                                      |
| seer      | villagers               | Each night, she sees the role of the player she wants.                          |
| protector | villagers               | Each night, he protects the player he wants (including himself). He can't protect the same player twice in a row.                         |
| hunter    | villagers               | If he dies, he shoots a victim to take his revenge. He can't kill himself.            |
| raven     | villagers               | Each night, he can mark someone (including himself). The next phase (during the day), the marked player will have two votes against himself.                      |
| villagers | villagers               | Has no powers, can only count on his speech.       |

## <a id="player-actions"></a>🔪 Player Actions

| Action       | [Role](#player-roles)             | [Group](#player-groups) |                 When - Use and Limits                                |
|:------------:|:---------------------------------:|:-----------------------:|------------------------------------|
| eat          | wolf                              | wolves                  | Each night - Kill a villager chosen by majority.                               |
| use-potion   | witch                             | villagers               | Each night - Protect or kill. One use available for each life and death potion.                              |
| look         | seer                              | villagers               | Each night - Reveal a role.                              |
| protect      | protector                         | villagers               | Each night - Prevents from death for the night. Can't protect the same player twice in a row.                              |
| shoot        | hunter                            | villagers               | When hunter dies - Kill someone chosen by hunter, can't be himself.                              |
| mark         | raven                             | villagers               | Each night - Mark someone. The next day, the target will have 2 votes against himself. The mark goes away after the judgement.                             |
| elect-mayor  | -                                 | all                     | Before the first phase (`night`) - Anyone can be elected as a mayor.                               |
| vote         | -                                 | all                     | Before the first phase (`night`) - Anyone can be elected as a mayor.                               |
| delegate     | mayor (_**attribute**, not role_) | -                       | When mayor dies - Anyone alive can be mayor next.                               |
| settle-votes | mayor (_**attribute**, not role_) | -                       | When there is a tie in the votes during the `day` - Choose which one will be executed.                               |

## <a id="player-attributes"></a>🎖️ Player Attributes

| Attribute          |                Description                                |
|:------------------:|------------------------------------|
| mayor              | Elected by all alive players. When dying, this attribute is transferred to someone chosen by the player.                                |
| eaten              | Wolves decided to eat this player during the night. The player will die the next phase (`day`) if he has no protection.                               |
| drank-life-potion  | The witch gave this potion during the night. It prevents from dying until the next phase (`day`).                                |
| drank-death-potion | The witch gave this potion during the night. The player will die the next phase (`day`) if he has no protection.                               |
| protected          | The protector protected this player during the night. He prevents from dying until the next phase (`day`).                               |
| raven-marked       | The raven marked the player during the night. During the next phase (`day`), this player will have two votes against himself.                               |

## <a id="errors"></a>⚠️ Errors

If you have an error from the API, you'll get a generic structure. (_See: [Classes - Error](#error-class)_)

Description for each case below:

| Code | Type                              | HTTP Code |                 Description                                                     |
|:----:|:---------------------------------:|:---------:|---------------------------------------------------------------------------------|
| 1    | BAD_REQUEST                       |    400    | You provided incorrect params.                                                  |
| 2    | UNAUTHORIZED                      |    401    | You're not authorized.                                                          |
| 3    | EMAIL_EXISTS                      |    400    | The email provided already exists.                                              |
| 4    | NOT_FOUND                         |    404    | The requested resource is not found.                                            |
| 5    | INTERNAL_SERVER_ERROR             |    500    | The server got an error, this is not your fault.                                |
| 6    | BAD_TOKEN                         |    400    | You provided a bad or malformed token.                                          |
| 7    | BAD_CREDENTIALS                   |    401    | The credentials provided don't match any in database.                           |
| 8    | PLAYERS_NAME_NOT_UNIQUE           |    400    | Players provided don't have unique `name`.                                      |
| 9    | NO_WOLF_IN_GAME_COMPOSITION       |    400    | There is no wolf in game composition.                                           |
| 10   | NO_VILLAGER_IN_GAME_COMPOSITION   |    400    | There is no villager in game composition.                                       |
| 11   | GAME_MASTER_HAS_ON_GOING_GAMES    |    400    | Game master has already on-going game(s).                                       |
| 12   | GAME_DOESNT_BELONG_TO_USER        |    401    | This game doesn't belong to user.                                               |
| 13   | BAD_PLAY_SOURCE                   |    400    | Play's source provided is not the one expected.                                 |
| 14   | BAD_PLAY_ACTION                   |    400    | Play's action provided is not the one expected.                                 |
| 14   | VOTES_REQUIRED                    |    400    | Play needs votes to be set.                                                     |
| 15   | VOTES_CANT_BE_EMPTY               |    400    | Play's votes can't be an empty array.                                           |
| 16   | BAD_VOTE_STRUCTURE                |    400    | One of play's vote has a bad structure. (_See: [Classes - Play](#play-class)_)  |
| 17   | SAME_VOTE_SOURCE_AND_TARGET       |    400    | Play's vote can't have the same source and target.                              |
| 18   | CANT_VOTE                         |    400    | Player can't be source of a vote.                                               |
| 19   | CANT_BE_VOTE_TARGET               |    400    | Player can't be target of a vote.                                               |
| 20   | CANT_VOTE_MULTIPLE_TIMES          |    400    | Player can't vote more than once.                                               |
| 21   | TIE_IN_VOTES                      |    400    | Tie in votes is not allowed for this action.                                    |
| 22   | TARGETS_REQUIRED                  |    400    | Plays needs targets to be set.                                                  |
| 23   | TARGETS_CANT_BE_EMPTY             |    400    | Play's targets can't be an empty array.                                         |
| 24   | BAD_TARGETS_LENGTH                |    400    | Play's targets length doesn't match the one expected.                           |
| 25   | BAD_TARGET_STRUCTURE              |    400    | One of play's target has a bad structure. (_See: [Classes - Play](#play-class)_ |
| 26   | NOT_TARGETABLE                    |    400    | Player can't be a target.                                                       |
| 27   | CANT_LOOK_AT_HERSELF              |    400    | Seer can't look at herself.                                                     |
| 28   | CANT_EAT_EACH_OTHER               |    400    | Wolves's target can't be a player with group "wolves".                          |
| 29   | BAD_LIFE_POTION_USE               |    400    | Witch can only use life potion on a target eaten by wolves.                     |
| 30   | ONLY_ONE_LIFE_POTION              |    400    | Witch can only use one life potion per game.                                    |
| 31   | ONLY_ONE_DEATH_POTION             |    400    | Witch can only use one death potion per game.                                   |
| 32   | NON_UNIQUE_TARGETS                |    400    | Multiple targets are pointing the same player.                                  |
| 33   | CANT_PROTECT_TWICE                |    400    | Protector can't protect the same player twice in a row.                         |
| 34   | CANT_BE_CHOSEN_AS_TIEBREAKER      |    400    | Player is not part of the tiebreaker choice for the mayor.                      |