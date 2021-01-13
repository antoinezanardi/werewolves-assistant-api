# Codes & Values

## <a id="game-statuses"></a>🎲 Game Statuses

Games have a `status` property which changes through game's lifecycle.

| Status            |                                    Description                             |
|:-----------------:|----------------------------------------------------------------------------|
| playing           | The game is currently playing.                                             |
| done              | The game is finished, no more actions are required to proceed.             |
| canceled          | The game has been canceled by game master and cannot be played any longer. |

## <a id="player-sides"></a>🧑‍🌾⚡🐺 Player Sides

Each player has a `side` property depending on the role chosen. The main goal of each player is to kill players of the other side.

| Side                 |                 Description                                                                                                              |
|:--------------------:|------------------------------------------------------------------------------------------------------------------------------------------|
| 🐺<br/>werewolves    | They are teaming up against `villagers` and need to kill them all to win the game.                                                       |
| 🧑‍🌾<br/>villagers     | They are teaming up against `werewolves` and need to kill them all to win the game.                                                      |

## <a id="player-groups"></a>👪 Player Groups

Among all players, groups are defined depending on players properties. Some groups need to win by themselves to win the game like the `lovers`.

| Group                |                 Description                                                                                                                                          |
|:--------------------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 👪<br/>all           | All players alive. Has `isAlive` property set to `true`.                                                                                                             |
| 🐺<br/>werewolves    | They are teaming up against `villagers` and need to kill them all to win the game. Has `side.current` property set to `werewolves`.                                  |
| 🧑‍🌾<br/>villagers     | They are teaming up against `werewolves` and need to kill them all to win the game. Has `side.current` property set to `villagers`.                                  |
| 💕<br/>lovers        | They are teaming up against `all` but themselves and need to be the last survivors to win the game despite their current side and role. Has the `in-love` attribute. |

## <a id="player-roles"></a>🃏 Player Roles

Each player in a game has a role. It defines the original player's side and powers.

| Role                          | Card                                                                                                          | [Side](#player-sides)    |                 Description                                                                                                                                                                                                          |
|:-----------------------------:|:-------------------------------------------------------------------------------------------------------------:|:------------------------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 🐺<br/>werewolf               | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/werewolf.png" width="50"/>              | werewolves              | Each night, his group eats a villager chosen by the majority.                                                                                                                                                                        |
| 🐺<br/>big-bad-wolf           | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/big-bad-wolf.png" width="50"/>          | werewolves              | Each night until no player in the `werewolves` side has died, he eats another villager all by himself after the `werewolves` turn.                                                                                                   |
| 🐺<br/>vile-father-of-wolves  | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/vile-father-of-wolves.png" width="50"/> | werewolves              | Once in the game, he infects the victim `eaten` by the werewolves and therefore, the infected villager immediately joins the `werewolves`. The victim keeps his original villager powers but must win with the other `werewolves`.   |
| 🧑‍🌾<br/>villager               | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/villager.png" width="50"/>              | villagers               | Has no powers, can only count on his speech skills.                                                                                                                                                                                  |
| 🧑‍🌾🧑‍🌾<br/>villager-villager    | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/villager.png" width="50"/>              | villagers               | Like the normal villager, has no power but on the two faces of his role card, there is the illustration of a simple villager. So, everybody knows that it's a simple villager.                                                       |
| 🔮<br/>seer                   | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/seer.png" width="50"/>                  | villagers               | Each night, she sees the role of the player she wants.                                                                                                                                                                               |
| 👼<br/>cupid                  | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/cupid.png" width="50"/>                 | villagers               | The first night, he chooses two players that fall instantly in love (he can choose himself). Next, the lovers wake up to meet each other and must win together.                                                                      |
| 🪄<br/>️‍witch                  | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/witch.png" width="50"/>                 | villagers               | She has one life potion which prevents from being eaten by werewolves and a death potion which instantly kills. She can only use each one once in the game.                                                                          |
| 🔫<br/>hunter                 | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/hunter.png" width="50"/>                | villagers               | If he dies, he shoots a victim to take his revenge. He can't kill himself.                                                                                                                                                           |
| 👧<br/>little-girl            | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/little-girl.png" width="50"/>           | villagers               | She can slightly open her eyes during werewolves turn to spot some of them. Even if the guard protects her, she will die by the werewolves if she is chosen by them.                                                                 |
| 🛡️<br/>guard                  | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/guard.png" width="50"/>                 | villagers               | Each night, he protects the player he wants (including himself). He can't protect the same player twice in a row.                                                                                                                    |
| 👴🏼<br/>ancient                | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/ancient.png" width="50"/>               | villagers               | If he dies from the `werewolves`, he has another life and his role is revealed. But if he dies from the `death-potion`, the `vote` or the `hunter`, he dies and all who started the game in `villagers` side loose their powers.     |
| 👭<br/>two-sisters            | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/two-sisters.png" width="50"/>           | villagers               | The first night, they meet each other and, therefore, know that they can trust themselves. Depending on game options, they wake up every X night(s). (Default is `2`).                                                               |
| 👨‍👨‍👦<br/>three-brothers         | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/three-brothers.png" width="50"/>        | villagers               | The first night, they meet each other and, therefore, know that they can trust themselves. Depending on game options, they wake up every X night(s). (Default is `2`).                                                               |
| 🐒<br/>wild-child             | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/wild-child.png" width="50"/>            | villagers / werewolves  | The first night, he chooses a model among the other players. If this model dies during the game, the wild child changes his side to `werewolves` and must win with them.                                                             |
| 🐕<br/>dog-wolf               | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/dog-wolf.png" width="50"/>              | villagers / werewolves  | The first night, he chooses a side between `villagers` and `werewolves`. Then, he must win with the chosen side. Other players don't know what he chose.                                                                             |
| 🪶<br/>raven                  | <img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/raven.png" width="50"/>                 | villagers               | Each night, he can mark someone (including himself). The next phase (during the day), the marked player will have two votes against himself.                                                                                         |

## <a id="player-actions"></a>🔪 Player Actions

Actions can be performed by a group, a role or a player which has a specific attribute.

| Action            | [Role](#player-roles)             | [Group](#player-groups) | [Attribute](#player-attributes)  |              When - Use and Limits                                                                                                                               |
|:-----------------:|:---------------------------------:|:-----------------------:|:--------------------------------:|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| eat               | 🐺<br/>werewolf                   | 🐺<br/>werewolves        | -                                | Each night - Eat a villager chosen by majority.                                                                                                                  |
| eat               | 🐺<br/>big-bad-wolf               | 🐺<br/>werewolves        | -                                | Each night until one player of the `werewolves` side has died - Kill a villager in addition to the `werewolves` target.                                          |
| look              | 🔮<br/>seer                       | 🧑‍🌾<br/>villagers         | -                                | Each night - Reveal a role.                                                                                                                                      |
| charm             | 👼<br/>cupid                      | 🧑‍🌾<br/>villagers         | -                                | First night - Charm two people who have to win together.                                                                                                         |
| use-potion        | 🪄<br/>witch                      | 🧑‍🌾<br/>villagers         | -                                | Each night - Protect or kill. One use available for each life and death potion.                                                                                  |
| shoot             | 🔫<br/>hunter                     | 🧑‍🌾<br/>villagers         | -                                | When hunter dies - Kill someone chosen by hunter, can't be himself.                                                                                              |
| protect           | 🛡️<br/>guard                      | 🧑‍🌾<br/>villagers         | -                                | Each night - Prevents from death for the night. Can't protect the same player twice in a row.                                                                    |
| mark              | 🪶<br/>raven                      | 🧑‍🌾<br/>villagers         | -                                | Each night - Mark someone. The next day, the target will have 2 votes against himself. The mark goes away after the judgement.                                   |
| meet-each-other   | 👭<br/>two-sisters                | 🧑‍🌾<br/>villagers         | -                                | First night and every X night depending on game options. Brief moment in which sisters meet each other and can speak (with gestures).                            |
| meet-each-other   | 👨‍👨‍👦<br/>three-brothers             | 🧑‍🌾<br/>villagers         | -                                | First night and every X night depending on game options. Brief moment in which brothers meet each other and can speak (with gestures).                           |
| choose-model      | 🐒<br/>wild-child                 | 🧑‍🌾<br/>villagers         | -                                | First night - The wild child chooses his model among the players. If the model dies, wild child changes side to `werewolves`. He can't choose himself.           |
| choose-side       | 🐕<br/>dog-wolf                   | 🧑‍🌾<br/>villagers         | -                                | First night - The dog-wolf chooses his side between `villagers` and `werewolves` and must win with the chosen side.                                              |
| elect-sheriff     | -                                 | 👪<br/>all               | -                                | During the first phase (`night`) - Anyone can be elected as a sheriff.                                                                                           |
| vote              | -                                 | 👪<br/>all               | -                                | Each day - All alive players vote for someone to kill.                                                                                                           |
| delegate          | -                                 | -                       | 🎖<br/>sheriff                    | When sheriff dies - The dying sheriff chooses the next one in among the living.                                                                                  |
| settle-votes      | -                                 | -                       | 🎖<br/>sheriff                    | When there is a tie in the votes during the `day` - Choose which one will be executed.                                                                           |
| meet-each-other   | -                                 | -                       | 💕<br/>in-love                    | Right after Cupid chose his targets, lovers wake up and meet each other.                                                                                         |

## <a id="player-attributes"></a>🎖️ Player Attributes

Attributes are consequences of actions and hold by players. Each attribute has special effects and can also have consequences, like death. 

| Attribute                  |                Description                                                                                                                                                                                                                                                    |
|:--------------------------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 🎖️<br/>sheriff             | Elected by all alive players, has the doubled vote. When dying, this attribute is transferred to someone chosen by the player. If there is a tie in the votes during the `day`, the sheriff must settle them.                                                                 |
| 👀<br/>seen                | The seer looked at this player during the night. The player's role is revealed to the seer.                                                                                                                                                                                   |
| 🍽️<br/>eaten               | Werewolves decided to eat this player during the night. The player will die the next phase (`day`) if he is the `little-girl` or doesn't have the `protected` or `drank-life-potion` attribute.                                                                               |
| 🧪<br/>drank-life-potion   | The witch gave this potion during the night. It prevents from dying of the `eaten` attribute until the next phase (`day`).                                                                                                                                                    |
| ☠️<br/>drank-death-potion  | The witch gave this potion during the night. The player will die the next phase (`day`).                                                                                                                                                                                      |
| 🛡<br/>protected           | The guard protected this player during the night. He prevents from dying of the `eaten` attribute until the next phase (`day`).                                                                                                                                               |
| 🪶<br/>raven-marked        | The raven marked the player during the night. During the next phase (`day`), this player will have two votes against himself.                                                                                                                                                 |
| 💕<br/>in-love             | Shot by the Cupid arrow, players with this attribute must win together the game. If one dies, the other one dies too.                                                                                                                                                         |
| 🙇<br/>worshiped           | The wild child chose the player during the first night. If the player dies, the wild child changes his side to `werewolves`.                                                                                                                                                  |
| 🤷‍<br/>powerless           | The ancient died from the `hunter`, the `witch` or from the `vote`, all who started the game in the `villagers` side will have this attribute and therefore, won't be able to use their powers anymore.                                                                       |

## <a id="errors"></a>⚠️ Errors

If you have an error from the API, you'll get a generic structure. (_See: [Classes - Error](#error-class)_)

Description for each case below:

| Code | Type                               | HTTP Code |                 Description                                                                       |
|:----:|:----------------------------------:|:---------:|---------------------------------------------------------------------------------------------------|
| 1    | BAD_REQUEST                        |    400    | You provided incorrect params.                                                                    |
| 2    | UNAUTHORIZED                       |    401    | You're not authorized.                                                                            |
| 3    | EMAIL_EXISTS                       |    400    | The email provided already exists.                                                                |
| 4    | NOT_FOUND                          |    404    | The requested resource is not found.                                                              |
| 5    | INTERNAL_SERVER_ERROR              |    500    | The server got an error, this is not your fault.                                                  |
| 6    | BAD_TOKEN                          |    400    | You provided a bad or malformed token.                                                            |
| 7    | BAD_CREDENTIALS                    |    401    | The credentials provided don't match any in database.                                             |
| 8    | PLAYERS_NAME_NOT_UNIQUE            |    400    | Players provided don't have unique `name`.                                                        |
| 9    | NO_WEREWOLF_IN_GAME_COMPOSITION    |    400    | There is no werewolf in game composition.                                                         |
| 10   | NO_VILLAGER_IN_GAME_COMPOSITION    |    400    | There is no villager in game composition.                                                         |
| 11   | GAME_MASTER_HAS_ON_GOING_GAMES     |    400    | Game master has already on-going game(s).                                                         |
| 12   | GAME_DOESNT_BELONG_TO_USER         |    401    | This game doesn't belong to user.                                                                 |
| 13   | BAD_PLAY_SOURCE                    |    400    | Play's source provided is not the one expected.                                                   |
| 14   | BAD_PLAY_ACTION                    |    400    | Play's action provided is not the one expected.                                                   |
| 14   | VOTES_REQUIRED                     |    400    | Play needs votes to be set.                                                                       |
| 15   | VOTES_CANT_BE_EMPTY                |    400    | Play's votes can't be an empty array.                                                             |
| 16   | BAD_VOTE_STRUCTURE                 |    400    | One of play's vote has a bad structure. (_See: [Classes - Play](#play-class)_)                    |
| 17   | SAME_VOTE_SOURCE_AND_TARGET        |    400    | Play's vote can't have the same source and target.                                                |
| 18   | CANT_VOTE                          |    400    | Player can't be source of a vote.                                                                 |
| 19   | CANT_BE_VOTE_TARGET                |    400    | Player can't be target of a vote.                                                                 |
| 20   | CANT_VOTE_MULTIPLE_TIMES           |    400    | Player can't vote more than once.                                                                 |
| 21   | TIE_IN_VOTES                       |    400    | Tie in votes is not allowed for this action.                                                      |
| 22   | TARGETS_REQUIRED                   |    400    | Plays needs targets to be set.                                                                    |
| 23   | TARGETS_CANT_BE_EMPTY              |    400    | Play's targets can't be an empty array.                                                           |
| 24   | BAD_TARGETS_LENGTH                 |    400    | Play's targets length doesn't match the one expected.                                             |
| 25   | BAD_TARGET_STRUCTURE               |    400    | One of play's target has a bad structure. (_See: [Classes - Play](#play-class)_                   |
| 26   | NOT_TARGETABLE                     |    400    | Player can't be a target.                                                                         |
| 27   | CANT_LOOK_AT_HERSELF               |    400    | Seer can't look at herself.                                                                       |
| 28   | CANT_EAT_EACH_OTHER                |    400    | Werewolves target can't be a player with group "werewolves".                                      |
| 29   | BAD_LIFE_POTION_USE                |    400    | Witch can only use life potion on a target eaten by werewolves.                                   |
| 30   | ONLY_ONE_LIFE_POTION               |    400    | Witch can only use one life potion per game.                                                      |
| 31   | ONLY_ONE_DEATH_POTION              |    400    | Witch can only use one death potion per game.                                                     |
| 32   | NON_UNIQUE_TARGETS                 |    400    | Multiple targets are pointing the same player.                                                    |
| 33   | CANT_PROTECT_TWICE                 |    400    | Guard can't protect the same player twice in a row.                                               |
| 34   | CANT_BE_CHOSEN_AS_TIEBREAKER       |    400    | Player is not part of the tiebreaker choice for the sheriff.                                      |
| 35   | NO_MORE_PLAY_ALLOWED               |    400    | No more play are allowed because game's status is "done" or "canceled".                           |
| 36   | CANT_BE_RESET                      |    400    | Game can't be reset because game's status is "done" or "canceled".                                |
| 37   | TOO_MANY_REQUESTS                  |    429    | Too many requests have been done on this route. Try again later.                                  |
| 38   | SISTERS_MUST_BE_TWO                |    400    | There must be exactly two sisters in game composition if at least one is chosen by a player.      |
| 39   | BROTHERS_MUST_BE_THREE             |    400    | There must be exactly three sisters in game composition if at least one is chosen by a player.    |
| 40   | WILD_CHILD_CANT_CHOOSE_HIMSELF     |    400    | Wild child can't choose himself as a model.                                                       |
| 41   | DOG_WOLF_MUST_CHOOSE_SIDE          |    400    | Dog-wolf must choose a side between `villagers` and `werewolves`.                                 |
| 42   | TARGET_ALREADY_EATEN               |    400    | This target is already planned to be eaten by the `werewolves`, the big bad wolf can't eat it.    |
| 43   | TARGET_MUST_BE_EATEN_BY_WEREWOLVES |    400    | Target must be eaten by the werewolves in order to be infected.                                   |
| 44   | ABSENT_VILE_FATHER_OF_WOLVES       |    400    | Target can't be infected because the vile father of wolves is either not in the game or dead.     |
| 45   | ONLY_ONE_INFECTION                 |    400    | Vile father of wolves can infect only one target per game.                                        |