# 📈 LIST OF CHANGES FOR WEREWOLVES ASSISTANT API

## 0.11.0 (2021-04-30)

### 🚀 New features

* [#137](https://github.com/antoinezanardi/werewolves-assistant-api/issues/137) - `position` for each player.
* [#138](https://github.com/antoinezanardi/werewolves-assistant-api/issues/138) - Facebook authentication.
* [#139](https://github.com/antoinezanardi/werewolves-assistant-api/issues/139) - Google authentication.
* [#141](https://github.com/antoinezanardi/werewolves-assistant-api/issues/141) - Fox role.
* [#142](https://github.com/antoinezanardi/werewolves-assistant-api/issues/142) - Bear Tamer role.
* [#143](https://github.com/antoinezanardi/werewolves-assistant-api/issues/143) - Hidden game repartition option.
* [#144](https://github.com/antoinezanardi/werewolves-assistant-api/issues/144) - Role revealed on death option.
* [#145](https://github.com/antoinezanardi/werewolves-assistant-api/issues/145) - Seer see exact role option.
* [#146](https://github.com/antoinezanardi/werewolves-assistant-api/issues/146) - Guard can protect twice option.
* [#147](https://github.com/antoinezanardi/werewolves-assistant-api/issues/147) - Fox not powerless if he misses a werewolf option.
* [#148](https://github.com/antoinezanardi/werewolves-assistant-api/issues/148) - Bear Tamer growls if he is infected option.
* [#149](https://github.com/antoinezanardi/werewolves-assistant-api/issues/149) - Number of vote requests for Stuttering Judge option.
* [#150](https://github.com/antoinezanardi/werewolves-assistant-api/issues/150) - Time for the Sheriff to be elected option.
* [#151](https://github.com/antoinezanardi/werewolves-assistant-api/issues/151) - Thief not obliged to choose between werewolves cards option.
* [#152](https://github.com/antoinezanardi/werewolves-assistant-api/issues/152) - Wild Child transformation is revealed option.
* [#153](https://github.com/antoinezanardi/werewolves-assistant-api/issues/153) - Dog Wolf chosen side is revealed option.
* [#154](https://github.com/antoinezanardi/werewolves-assistant-api/issues/154) - Big Bad Wolf not powerless if one werewolf dies option.
* [#155](https://github.com/antoinezanardi/werewolves-assistant-api/issues/155) - White Werewolf waking up interval option.
* [#156](https://github.com/antoinezanardi/werewolves-assistant-api/issues/156) - Number of charmed people per night by Pied Piper option.
* [#157](https://github.com/antoinezanardi/werewolves-assistant-api/issues/157) - Pied Piper not powerless if infected option.
* [#158](https://github.com/antoinezanardi/werewolves-assistant-api/issues/158) - Lives count for the Ancient option.
* [#159](https://github.com/antoinezanardi/werewolves-assistant-api/issues/159) - Ancient doesn't make all villagers powerless if murdered from them option.
* [#160](https://github.com/antoinezanardi/werewolves-assistant-api/issues/160) - Number of additional cards for Thief option.
* [#161](https://github.com/antoinezanardi/werewolves-assistant-api/issues/161) - Rusty Sword Knight role.

### 🌟 Enhancements

* [#162](https://github.com/antoinezanardi/werewolves-assistant-api/issues/162) - Role types.

### ♻️ Refactoring

* [#140](https://github.com/antoinezanardi/werewolves-assistant-api/issues/140) - Extend token's lifetime to infinity.

### 📦 Packages

* `axios` installed with version `0.21.1`.
* `@sentry/node` updated to version `6.3.5`.
* `apidoc` updated to version `0.26.0`.
* `chai` updated to version `4.3.4`.
* `eslint` updated to version `7.25.0`.
* `express-validator` updated to version `6.10.1`.
* `migrate-mongo` updated to version `8.2.2`.
* `mocha` updated to version `8.3.2`.
* `mongoose` updated to version `5.12.6`.
* `qs` updated to version `6.10.1`.
* `validator` updated to version `13.6.0`.

---

## 0.10.0 (2021-03-03)

### 🚀 New features

* [#113](https://github.com/antoinezanardi/werewolves-assistant-api/issues/113) - Add option for raven mark penalty.
* [#116](https://github.com/antoinezanardi/werewolves-assistant-api/issues/116) - Options for game's random repartition.
* [#117](https://github.com/antoinezanardi/werewolves-assistant-api/issues/117) - Add guard protection on little girl option.
* [#118](https://github.com/antoinezanardi/werewolves-assistant-api/issues/118) - Add idiot dies on ancient death option.
* [#119](https://github.com/antoinezanardi/werewolves-assistant-api/issues/119) - Implement White Werewolf role.
* [#120](https://github.com/antoinezanardi/werewolves-assistant-api/issues/120) - Implement Stuttering Judge role.
* [#126](https://github.com/antoinezanardi/werewolves-assistant-api/issues/126) - Implement Angel role.
* [#127](https://github.com/antoinezanardi/werewolves-assistant-api/issues/127) - Implement Thief Role.

### 🌟 Enhancements

* [#121](https://github.com/antoinezanardi/werewolves-assistant-api/issues/121) - Add `votesResult` in Game history plays.
* [#131](https://github.com/antoinezanardi/werewolves-assistant-api/issues/131) - Check role availability in game creation.

### 🐛 Bug fixes

* [#112](https://github.com/antoinezanardi/werewolves-assistant-api/issues/112) - Ancient is not infected if he already lost his first life, protected by guard and revived by the witch.
* [#114](https://github.com/antoinezanardi/werewolves-assistant-api/issues/114) - `recommendedMinPlayers` is not used for random game composition for werewolves.
* [#115](https://github.com/antoinezanardi/werewolves-assistant-api/issues/115) - No targets for big bad wolf.
* [#133](https://github.com/antoinezanardi/werewolves-assistant-api/issues/133) - Charmed players must not be called during night if Pied Piper is infected.

### ♻️ Refactoring

* [#124](https://github.com/antoinezanardi/werewolves-assistant-api/issues/124) - Change sheriff enabled option property name.
* [#125](https://github.com/antoinezanardi/werewolves-assistant-api/issues/125) - Change `potion` structure for plays and game history.

### 📚 Documentation

* [#122](https://github.com/antoinezanardi/werewolves-assistant-api/issues/122) - Set `side` to optional field in APIDoc for GameHistory Class.
* [#123](https://github.com/antoinezanardi/werewolves-assistant-api/issues/123) - Bad ancient description.
* [#128](https://github.com/antoinezanardi/werewolves-assistant-api/issues/128) - Update README.md with CI.
* [#129](https://github.com/antoinezanardi/werewolves-assistant-api/issues/129) - Add Player Deaths section in APIDoc.
* [#130](https://github.com/antoinezanardi/werewolves-assistant-api/issues/130) - Add `Limits` for each role in the documentation.

### 📦 Packages

* `@sentry/node` updated to version `6.2.1`.
* `bcrypt` updated to version `5.0.1`.
* `chai` updated to version `4.3.0`.
* `eslint` updated to version `7.21.0`.
* `express-rate-limit` updated to version `5.2.6`.
* `express-validator` updated to version `6.10.0`.
* `mocha` updated to version `8.3.0`.
* `mongoose` updated to version `5.11.18`.

---

## 0.9.0 (2021-02-01)

### 🚀 New features

* [#73](https://github.com/antoinezanardi/werewolves-assistant-api/issues/73) - Vile Father of Wolves Role implemented.
* [#86](https://github.com/antoinezanardi/werewolves-assistant-api/issues/86) - Extend player limit to 40.
* [#87](https://github.com/antoinezanardi/werewolves-assistant-api/issues/87) - Add isRevealed to role structure.
* [#88](https://github.com/antoinezanardi/werewolves-assistant-api/issues/88) - Ancient Role implemented.
* [#91](https://github.com/antoinezanardi/werewolves-assistant-api/issues/91) - Game option for no sheriff.
* [#92](https://github.com/antoinezanardi/werewolves-assistant-api/issues/92) - Scapegoat Role implemented.
* [#93](https://github.com/antoinezanardi/werewolves-assistant-api/issues/93) - Idiot Role implemented.
* [#94](https://github.com/antoinezanardi/werewolves-assistant-api/issues/94) - Pied Piper Role implemented.
* [#95](https://github.com/antoinezanardi/werewolves-assistant-api/issues/95) - Limit game history length.
* [#96](https://github.com/antoinezanardi/werewolves-assistant-api/issues/96) - Add dead players in game history entries.
* [#99](https://github.com/antoinezanardi/werewolves-assistant-api/issues/99) - ESLint rules updated with last rules.

### 🐛 Bug fixes

* [#106](https://github.com/antoinezanardi/werewolves-assistant-api/issues/106) - Remove player attributes with remaining phases if player is dead.

### ♻️ Refactoring

* [#85](https://github.com/antoinezanardi/werewolves-assistant-api/issues/85) - Change game options structure.
* [#89](https://github.com/antoinezanardi/werewolves-assistant-api/issues/89) - Decrease `remainingPhases` for attributes.
* [#90](https://github.com/antoinezanardi/werewolves-assistant-api/issues/90) - Add players source to Game History entry.
* [#100](https://github.com/antoinezanardi/werewolves-assistant-api/issues/100) - Change `attributes.attribute` to `attributes.name` in Player class.

### 📚 Documentation

* [#98](https://github.com/antoinezanardi/werewolves-assistant-api/issues/98) - APIDoc improved for `Classes` and nested properties.
* [#101](https://github.com/antoinezanardi/werewolves-assistant-api/issues/101) - Specify remaining phases for each attribute in the documentation.
* [#103](https://github.com/antoinezanardi/werewolves-assistant-api/issues/103) - Documentation's oversight on game end conditions

### 🛣️ Routes

* [#97](https://github.com/antoinezanardi/werewolves-assistant-api/issues/97) - Users can get full game history or filter entries by source or action.

### 📦 Packages

* `deepmerge` installed with version `4.2.2`.
* `@sentry/node` updated to version `6.0.3`.
* `apidoc` updated to version `0.26.0`.
* `eslint` updated to version `7.19.0`.
* `express-validator` updated to version `6.9.2`.
* `mongoose` updated to version `5.11.14`.
* `nodemon` updated to version `2.0.7`.
* `qs` updated to version `6.9.6`.

---

## 0.8.0 (2020-12-30)

### 🚀 New features

* [#66](https://github.com/antoinezanardi/werewolves-assistant-api/issues/66) - Cupid role implemented.
* [#67](https://github.com/antoinezanardi/werewolves-assistant-api/issues/67) - Two Sisters role implemented.
* [#68](https://github.com/antoinezanardi/werewolves-assistant-api/issues/68) - Three Brothers role implemented.
* [#69](https://github.com/antoinezanardi/werewolves-assistant-api/issues/69) - New game options with `sistersWakingUpInterval`, `brothersWakingUpInterval`, `isSheriffVoteDoubled` and `isSeerTalkative`.
* [#70](https://github.com/antoinezanardi/werewolves-assistant-api/issues/70) - Wild Child role implemented.
* [#71](https://github.com/antoinezanardi/werewolves-assistant-api/issues/71) - Dog-Wolf role implemented.
* [#72](https://github.com/antoinezanardi/werewolves-assistant-api/issues/72) - Big Bad Wolf role implemented.
* [#82](https://github.com/antoinezanardi/werewolves-assistant-api/issues/82) - MongoDB authentication added for `mongoose` config.

### ♻️ Refactoring

* [#74](https://github.com/antoinezanardi/werewolves-assistant-api/issues/74) - During the night, all actions are pushed into the waiting queue instead of predicting them one by one.
* [#76](https://github.com/antoinezanardi/werewolves-assistant-api/issues/76) - Changed `player.role.group` to `player.side`.

### 📚 Documentation

* [#75](https://github.com/antoinezanardi/werewolves-assistant-api/issues/75) - Server configuration added in `REAMDE.md`.
* [#77](https://github.com/antoinezanardi/werewolves-assistant-api/issues/77) - Improve APIDoc documentation.

### 📦 Packages

* `@sentry/node` updated to version `5.29.2`.
* `eslint` updated to version `7.16.0`.
* `express-validator` updated to version `6.9.0`.
* `mongoose` updated to version `5.11.9`.
* `validator` updated to version `13.5.2`.

---

## 0.7.0 (2020-11-21)

### 🚀 New features

* [#58](https://github.com/antoinezanardi/werewolves-assistant-api/issues/58) - Little girl role implemented.
* [#59](https://github.com/antoinezanardi/werewolves-assistant-api/issues/59) - Villager-villager role implemented.
* [#61](https://github.com/antoinezanardi/werewolves-assistant-api/issues/61) - Travis CI linked to Slack.

### 🐛 Bug fixes

* [#54](https://github.com/antoinezanardi/werewolves-assistant-api/issues/54) - Sheriff has double votes, as specified in the rules.

### 📚 Documentation

* [#57](https://github.com/antoinezanardi/werewolves-assistant-api/issues/57) - Fix doc for `game.won`.
* [#62](https://github.com/antoinezanardi/werewolves-assistant-api/issues/62) - Icon for witch 🪄 and raven 🪶 changed.

### 📦 Packages

* `@sentry/node` updated to version `5.27.4`.
* `eslint` updated to version `7.14.0`.
* `express-rate-limit` updated to version `5.2.3`.
* `mongoose` updated to version `5.10.15`.

---

## 0.6.2 (2020-11-08)

### 🐛 Bug fixes

* [#42](https://github.com/antoinezanardi/werewolves-assistant-api/issues/42) - When there is no player left, game is won by nobody.

### ♻️ Refactoring

* [#43](https://github.com/antoinezanardi/werewolves-assistant-api/issues/43) - Many game rules changes according to the official game's guide.

### 📦 Packages

* `@sentry/node` updated to version `5.27.3`.
* `eslint` updated to version `7.13.0`.
* `mongoose` updated to version `5.10.13`.

---

## 0.6.1 (2020-11-03)

### 🐛 Bug fixes

* [#46](https://github.com/antoinezanardi/werewolves-assistant-api/issues/46) - Travis warnings fixed according to build info.

### ♻️ Refactoring

* [#47](https://github.com/antoinezanardi/werewolves-assistant-api/issues/47) - Email's length limit for logging in and registering has been enlarged to 50 characters.

### 🛣️ Routes

* [#44](https://github.com/antoinezanardi/werewolves-assistant-api/issues/44) - Users can review a game with rating and comment.

### 📦 Packages

* `@sentry/node` updated to version `5.27.2`.
* `eslint` updated to version `7.12.1`.
* `migrate-mongo` updated to version `8.1.4`.
* `mocha` updated to version `8.2.1`.
* `mongoose` updated to version `5.10.11`.
* `nodemon` updated to version `2.0.6`.

---

## 0.6.0 (2020-10-13)

### 🚀 New features

* [#34](https://github.com/antoinezanardi/werewolves-assistant-api/issues/34) - Users can review a game with rating and comment.
* [#37](https://github.com/antoinezanardi/werewolves-assistant-api/issues/37) - Users and games can be retrieved with only desired fields.
* [#39](https://github.com/antoinezanardi/werewolves-assistant-api/issues/39) - All player role cards are hosted on the server.

### 🌟 Enhancements

* [#30](https://github.com/antoinezanardi/werewolves-assistant-api/issues/30) - `.eslintrc.js` file contains now all existing rules. Rules were adapted for each type of files.
* [#31](https://github.com/antoinezanardi/werewolves-assistant-api/issues/31) - `README.md` file has been approved with new badges and 4 new sections.
* [#32](https://github.com/antoinezanardi/werewolves-assistant-api/issues/32) - Player names can't exceed 30 characters long and are filter out of HTML tags.
* [#33](https://github.com/antoinezanardi/werewolves-assistant-api/issues/33) - Users email address and password can't exceed 30 characters long for better database storage.
* [#35](https://github.com/antoinezanardi/werewolves-assistant-api/issues/35) - Request rate limit implemented for all routes with no auth or `JWT` auth.

### 📚 Documentation

* [#36](https://github.com/antoinezanardi/werewolves-assistant-api/issues/36) - `CONTRIBUTING.md` file added for helping people contribute to this project.

### 📦 Packages

* `express-rate-limit` installed with version `5.1.3`.
* `xss` installed with version `1.0.8`.
* `@sentry/node` updated to version `5.26.0`.
* `apidoc` updated to version `5.24.2`.
* `eslint` updated to version `7.10.0`.
* `migrate-mongo` updated to version `8.1.2`.
* `mocha` updated to version `8.1.3`.
* `mongoose` updated to version `5.10.9`.
* `nodemon` updated to version `2.0.5`.
* `validator` updated to version `13.1.17`.

---

## 0.5.3 (2020-08-17)

### 🐛 Bug fixes

* Correct order for actions when game's phase is `day`.

---

## 0.5.2 (2020-08-17)

### 🐛 Bug fixes

* [#24](https://github.com/antoinezanardi/werewolves-assistant-api/issues/24) - If a player is killed twice (death potion + werewolves), it doesn't trigger twice death effect (delegating for example).

### 📦 Packages

* `@sentry/node` updated to version `5.21.1`.
* `apidoc` updated to version `0.25.0`.
* `eslint` updated to version `7.7.0`.
* `express-validator` updated to version `6.6.1`.
* `mocha` updated to version `8.1.1`.
* `mongoose` updated to version `5.10.0`.

---

## 0.5.1 (2020-07-22)

### 🐛 Bug fixes

* Player can't be nominated during player votes if he is dead and raven marked.

### 📚 Documentation

* `seen` attribute documented️.

### ♻️ Refactoring

* No more constants are directly imported in `route` and `controller` files to prevent data change in those files. A getter for each constant is implemented.

### 📦 Packages

* `@sentry/node` updated to version `5.20.0`.
* `apidoc` updated to version `0.24.0`.
* `eslint` updated to version `7.5.0`.
* `migrate-mongo` updated to version `8.1.1`.
* `mongoose` updated to version `5.9.25`.

---

## 0.5.0 (2020-06-29)

### 🚀 New features

* Can get available roles with route `GET /roles`.

### 🛣️ Routes

* Route `GET /roles` added for retrieving all available roles. Protected with both basic and JWT authentication.

### 📦 Packages

* `mocha` updated to version `8.0.1`.

---

## 0.4.2 (2020-06-27)

### 🐛 Bug fixes

* Route `GET /games/repartion` fixed:
    - Array of players with role and group.
    - Random role picker respects the `maxInGame` value for each role.
    

### 📦 Packages

* `@sentry/node` updated to version `5.18.1`.

---

## 0.4.1 (2020-06-25)

### ♻️ Refactoring

* Route `GET /games/repartition` needs data passed by query strings and not body to work regarding REST best practises.
* `mayor` renamed to `sheriff` regarding [the official Wikipedia page of The Werewolves of Millers Hollow](https://en.wikipedia.org/wiki/The_Werewolves_of_Millers_Hollow).
* `protector` renamed to `guard` regarding [the official Wikipedia page of The Werewolves of Millers Hollow](https://en.wikipedia.org/wiki/The_Werewolves_of_Millers_Hollow).
* `wolves` renamed to `werewolves` regarding [the official Wikipedia page of The Werewolves of Millers Hollow](https://en.wikipedia.org/wiki/The_Werewolves_of_Millers_Hollow).

### 📚 Documentation

* More icons for prettier documentation ❤️ !
* Fixed villager role description.
* `README.md` fulfilled with awesome badges.

### 📦 Packages

* `query-string` removed for `qs` with version `6.9.4`.

---

## 0.4.0 (2020-06-24)

### 🚀 New features

* Games can be retrieved by status with route `GET /games`. Useful for knowing if a player has ongoing game for instance.
* MIT license added.

### 🛣️ Routes

* Route `POST /users` is no more protected with basic authentication.
* Route `POST /users/login` is no more protected with basic authentication.
* Route `GET /users/:id` can now be accessed with both JWT and basic authentication.
* Route `GET /games/repartition` can now be accessed with JWT authentication.
* Route `GET /games` can now be accessed with JWT authentication.
* Route `GET /games/:id` can now be accessed with JWT authentication.

### 📚 Documentation

* Authentications allowed for routes are more described.
* `README.md` file improved with link to `Werewolves Assistant Web` and **MIT license** badge.
* Fixed the description for the action `vote` and `delegate`.

### 📦 Packages

* `query-string` installed with version `6.13.1`.
* `@sentry/node` updated to version `5.18.0`.
* `eslint` updated to version `7.3.1`.
* `mongoose` updated to version `5.9.20`.

---

## 0.3.0 (2020-06-21)

### 🚀 New features

* Sentry implemented for catching errors for better bug monitoring.

### 📚 Documentation

* Documentation fixed for route `GET /users/:id`.

### 📦 Packages

* `@sentry/node` installed with version `5.17.0`.
* `eslint` updated to version `7.3.0`.
* `express-validator` updated to version `6.6.0`.
* `mongoose` updated to version `5.9.19`.

---

## 0.2.0 (2020-06-14)

### 🚀 New features

* `.editorconfig` file added for code style constancy.
* Travis badge added in the `README.md` file.
* License badge added in the `README.md` file.
* Provides a random game repartition for a set of players.
* Check for unique names when players are provided during game random composition or creation.
* Check for roles compatibility before game creation.
* Games can be created by user. User can't create a game if there is already one playing.
* Games can be canceled at any moment by the game master.
* Each time a play is done by anyone or any group, or an event occurs, an entry in game's history is saved.
* Gameplay for `all`, `sheriff`, `seer`, `witch`, `raven`, `hunter`, `guard` and `wolves` implemented !
* Games can be reset when their status are `playing`.

### 🐛 Bug fixes

* Check if `errorType` provided to `Error constructor` is known to prevent unhandled exception. Otherwise, default `INTERNAL_SERVER_ERROR` is sent. 

### 🛣️ Routes

* Route `GET /users/:id` added for getting one specific user. Protected with basic authentication.
* Route `GET /games` added for retrieving all games. Protected with basic authentication.
* Route `GET /games/repartition` added for getting a random team composition. Protected with basic authentication.
* Route `GET /games/:id` added for getting one specific game. Protected with basic authentication.
* Route `POST /games` added for creating games. Protected with JWT.
* Route `POST /games/:id/play` added for processing into a `playing` game by making a play. Protected with JWT.
* Route `PATCH /games/:id` added for updating games. Protected with JWT.
* Route `PATCH /games/:id/reset` added for resetting games. Protected with JWT.

### 💾 Database

* Game schema for collection `games` defined with minimal configuration.
* Game history schema for collection `gameHistory` defined with minimal configuration.
* Player schema for collection `games` defined with minimal configuration.
* Role schema for collection `roles` defined with minimal configuration.
* First roles added in `roles` collection.

### 📚 Documentation

* API documentation improved.
* `User Class` documented.
* `Role Class` documented.
* `Game Class` documented.
* `Player Class` documented.
* `GameHistory Class` documented.
* `Play Class` documented.
* `Player Roles` documented.
* `Player Groups` documented.
* `Player Actions` documented.
* `Player Attributes` documented.
* `Game Statuses` documented.

### ♻️ Refactoring

* Moved all database related folders and files in `src/db`.
* Divided `helpers` files into `functions` and `constants` folders.
* `checkRouteParameters` helper function renamed into `checkRequestData`.
*  All play methods moved from `Game` controller to brand new `Player` controller.
* `errors` field from `Error` class renamed to `data`.

### 🧪 Tests

* Starting `e2e` tests.
* E2E tests for user registration.
* E2E tests for game creation.
* E2E tests for full game of 7 players with villagers winning.
* E2E tests for tiny game of 4 players with wolves winning.
* E2E tests for game reset.

### 📦 Packages

* `migrate-mongo` installed with version `7.2.1`.
* `validator` installed with version `13.1.1`.
* `apidoc` updated to version `0.23.0`.
* `bcrypt` updated to version `5.0.0`.
* `eslint` updated to version `7.2.0`.
* `express-validator` updated to version `6.5.0`.
* `mocha` updated to version `7.2.0`.
* `mongo-dot-notation` updated to version `2.0.0`.
* `mongoose` updated to version `5.9.18`.
* `nodemon` updated to version `2.0.4`.
* `passport` updated to version `0.4.1`.

---

## 0.1.0 (2019-12-03)

### 🚀 New features

* Basic authentication for some future routes implemented.
    * Username and password are defined in `.env` file.
* Database is created and the connection is established when app starts. 
* `README.md` file created with minimal explanations on project purpose, installation and more. 
* Users can register and log in. JSON Web Token is provided while logging in.

### 🛣️ Routes

* Route `GET /users` added for retrieving all users. Protected with basic authentication.
* Route `POST /users` added for creating a new user account. Protected with basic authentication.
* Route `POST /users/login` added for logging in and retrieve the JSON Web Token. Protected with basic authentication.

### 💾 Database

* User schema for collection `users` defined with minimal configuration.

### 🧪 Tests

* Test environment set up. You can run it with `npm test`.
* Test for route `GET /` added. 
* Test for route `GET /users` added. 

### 📦 Packages

* `apidoc` updated to version `0.19.0`.
* `eslint` updated to version `6.7.2`.
* `mongoose` updated to version `5.7.13`.

---

## 0.0.0 (2019-11-28)

### 🚀 New features

* Starting this awesome project.
* Setting up the Express server and project architecture.
* Setting up `dotenv` and server error handling.
* Setting up CI integration. No test for the moment, only deployment on remote server (with staging and production env) is implemented.
* Setting up `ESLint` on whole project, except migrations.
* Setting up `forever` JSON config files for remote server.
* Setting up `apidoc` for API documentation with `models`, `codes` and `routes`.
* Script `update-version` added in order to update project version on `package.json`, `apidoc` config and API main route.

### 📦 Packages

* Set of required packages installed for Express, route validation and more.