# 🐺 Werewolves Assistant API

[![Build Status](https://travis-ci.org/antoinezanardi/werewolves-assistant-api.svg?branch=master)](https://travis-ci.org/antoinezanardi/werewolves-assistant-api)
[![GitHub license](https://img.shields.io/github/license/antoinezanardi/werewolves-assistant-api.svg)](https://github.com/antoinezanardi/https://img.shields.io/github/license/werewolves-assistant-api.svg/blob/master/LICENSE)

## 🐺 Description
Werewolves Assistant API provides over HTTP requests a way of manage Werewolves games in order to help the game master in his task.

## 🌻 Live
Two environments are set up:
* **Sandbox**: `https://sandbox.werewolves-assistant-api.antoinezanardi.fr`
* **Production**: `https://werewolves-assistant-api.antoinezanardi.fr`

For your tests, please use de **Sandbox URL**.

Basic authentication credentials for **Sandbox environment** are:
* **username**: `root`
* **password**: `secret`

## 📚 API Documentation
Documentation is available for both environments:
* **Sandbox**: `https://sandbox.werewolves-assistant-api.antoinezanardi.fr/apidoc`
* **Production**: `https://werewolves-assistant-api.antoinezanardi.fr/apidoc`

## 🔨 Installation
1. Install dependencies with `npm install` (add `--production` if you install the project on a remote server)
2. Copy `.env.example` and paste it as `.env`
3. Replace environment values in the fresh new `.env` file if necessary
    * **DB_NAME**: Name of the MongoDB database.
    * **BASIC_USERNAME**: Username for basic authentication.
    * **BASIC_PASSWORD**: Password for basic authentication.
    * **PORT**: Which port the API must run (default is 4202).
    * **JWT_SECRET**: Encryption key used for JSON Web Token.
    * **SENTRY_ENABLED**: Enable if errors are caught and sent to Sentry.
    * **SENTRY_PROJECT_ID**: Sentry project's ID.
    * **SENTRY_KEY**: Sentry secret key.

## 🔌 Let's go
To start the API **on development mode**, simply run `npm start`.

To start the API **on production mode**, run `npm run start_sandbox` or `npm run start_production`.

## ⚙️ Other useful commands
- **Tests**: `npm run test` runs various tests to check API endpoints.
- **Lint**: `npm run lint` checks for code style. Based on AirBnB configuration with many more rules.
- **Doc**: `npm run doc` generates doc for API.