# 📈 LIST OF CHANGES FOR WEREWOLVES ASSISTANT API

## 0.1.0 (2019-12-??)

### 🚀 New features

* Basic authentication for some future routes implemented.
    * Username and password are defined in `.env` file.
* Database is created and the connection is established when app starts. 
* `README.md` file created with minimal explanations on project purpose, installation and more. 

### 🛣️ Routes

* Route `GET /users` added for retrieving all users. Protected with basic authentication.

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