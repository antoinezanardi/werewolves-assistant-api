# 📈 LIST OF CHANGES FOR WEREWOLVES ASSISTANT API

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