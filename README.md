# 🐺 Werewolves Assistant API

[![GitHub release](https://img.shields.io/github/release/antoinezanardi/werewolves-assistant-api.svg)](https://GitHub.com/antoinezanardi/werewolves-assistant-api/releases/)
[![GitHub license](https://img.shields.io/github/license/antoinezanardi/werewolves-assistant-api.svg)](https://github.com/antoinezanardi/https://img.shields.io/github/license/werewolves-assistant-api.svg/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/antoinezanardi/werewolves-assistant-api.svg?branch=master)](https://travis-ci.org/antoinezanardi/werewolves-assistant-api)
[![Known Vulnerabilities](https://snyk.io/test/github/antoinezanardi/werewolves-assistant-api/badge.svg?targetFile=package.json)](https://snyk.io/test/github/antoinezanardi/werewolves-assistant-api?targetFile=package.json)
[![Contributions are welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/antoinezanardi/werewolves-assistant-api/issues)

[![Open Source Love svg3](https://badges.frapsoft.com/os/v3/open-source.svg?v=103)](https://github.com/antoinezanardi/werewolves-assistant-api/)

[![ForTheBadge built-with-love](http://ForTheBadge.com/images/badges/built-with-love.svg)](https://GitHub.com/antoinezanardi/)
[![ForTheBadge uses-js](http://ForTheBadge.com/images/badges/uses-js.svg)](https://GitHub.com/antoinezanardi/werewolves-assistant-api)

## 🐺 Description
Werewolves Assistant API provides over HTTP requests a way of manage Werewolves games in order to help the game master in his task.

This is the project's API used by [Werewolves Assistant Web](https://github.com/antoinezanardi/werewolves-assistant-web), a **VueJS** client.  

## 🌻 Live
Two environments are set up:
* **Sandbox**: https://sandbox.werewolves-assistant-api.antoinezanardi.fr
* **Production**: https://werewolves-assistant-api.antoinezanardi.fr

For your tests, please use the **Sandbox URL**.

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