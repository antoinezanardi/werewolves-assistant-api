# Werewolves Assistant API

## Description
Werewolves Assistant API provides over HTTP requests a way of manage Werewolves games in order to help the game master in his task.

## Live
Two environments are set up:
* **Sandbox**: `https://sandbox.werewolves-assistant-api.antoinezanardi.fr`
* **Production**: `https://werewolves-assistant-api.antoinezanardi.fr`

For your tests, please use de **Sandbox URL**.

Basic authentication credentials for **Sandbox environment** are:
* **username**: `root`
* **password**: `secret`

## Installation
1. Install dependencies with `npm install` (add `--production` if you install the project on remote server)
2. Copy `.env.example` and paste it as `.env`
3. Replace environment values in the fresh new `.env` file if necessary
    * **DB_NAME**: Name of the MongoDB database.
    * **BASIC_USERNAME**: Username for basic authentication.
    * **BASIC_PASSWORD**: Password for basic authentication.
    * **PORT**: Which port the API must run (default is 4202).
    * **JWT_SECRET**: Encryption key used for JSON Web Token.

## Let's go
To start the API **on development mode**, simply run `npm start`.

To start the API **on production mode**, run `npm run start_sandbox` or `npm run start_production`.

## Other useful commands
- **Tests**: `npm run test` runs various tests to check API endpoints.
- **Lint**: `npm run lint` checks for code style. Based on AirBnB configuration with many more rules.
- **Doc**: `npm run doc` generates doc for API.