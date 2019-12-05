# 📈 LIST OF CHANGES FOR WEREWOLVES ASSISTANT API

## 0.2.0 (2019-12-??)

### 🚀 New features

* Travis badge added in the `README.md` file.

### 🛣️ Routes

* Route `GET /games` added for retrieving all games. Protected with basic authentication.
* Route `GET /games/repartition` added for getting a random team composition. Protected with basic authentication.

### 💾 Database

* Game schema for collection `games` defined with minimal configuration.
* Player schema for collection `games` defined with minimal configuration.

### 📚 Documentation

* Model for `user` documented.

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

* Test environment set up. You can run it with `npm run test`.
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