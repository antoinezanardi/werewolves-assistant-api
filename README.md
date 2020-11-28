# 🐺 Werewolves Assistant API

[![GitHub release](https://img.shields.io/github/release/antoinezanardi/werewolves-assistant-api.svg)](https://GitHub.com/antoinezanardi/werewolves-assistant-api/releases/)
[![GitHub license](https://img.shields.io/github/license/antoinezanardi/werewolves-assistant-api.svg)](https://github.com/antoinezanardi/https://img.shields.io/github/license/werewolves-assistant-api.svg/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/antoinezanardi/werewolves-assistant-api.svg?branch=master)](https://travis-ci.org/antoinezanardi/werewolves-assistant-api)
[![Known Vulnerabilities](https://snyk.io/test/github/antoinezanardi/werewolves-assistant-api/badge.svg?targetFile=package.json)](https://snyk.io/test/github/antoinezanardi/werewolves-assistant-api?targetFile=package.json)
[![Contributions are welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/antoinezanardi/werewolves-assistant-api/issues)

[![ForTheBadge open-source](https://forthebadge.com/images/badges/open-source.svg)](https://forthebadge.com)
[![ForTheBadge built-with-love](http://ForTheBadge.com/images/badges/built-with-love.svg)](https://GitHub.com/antoinezanardi/)
[![ForTheBadge uses-js](http://ForTheBadge.com/images/badges/uses-js.svg)](https://GitHub.com/antoinezanardi/werewolves-assistant-api)

## 📋 Table of Contents

1. 🐺 [What is this API ?](#what-is-this-api)
2. 🔍 [Let's try !](#lets-try)
3. 🃏 [Roles available](#roles-available)
4. 📚 [API Documentation](#api-documentation)
5. 📈 [Versions & changelog](#versions)
6. ☑️ [Code analysis and consistency](#code-analysis-and-consistency)
7. 🔨 [Installation](#installation)
8. 🔌 [Let's go](#lets-go)
9. ⚙️ [Other useful commands](#other-useful-commands)
10. ©️ [License](#license)
11. ❤️ [Contributors](#contributors)

## <a name="what-is-this-api">🐺 What is this API ?</a>
Werewolves Assistant API provides over HTTP requests a way of manage Werewolves games in order to help the game master in his task.

This is the project's API used by [**Werewolves Assistant Web**](https://github.com/antoinezanardi/werewolves-assistant-web), the main web **VueJS** client.  

#### 🤔 Want to know more about this awesome project ? <a href="https://werewolves-assistant.antoinezanardi.fr/about" target="_blank">**Check out the dedicated about page**</a>.

## <a name="lets-try">🔍 Let's try !</a>
Two versions are available for testing this API:

✨ <a href="https://werewolves-assistant-api.antoinezanardi.fr" target="_blank">**Main API**</a> _(Base URL: https://werewolves-assistant-api.antoinezanardi.fr)_

🔧 <a href="https://sandbox.werewolves-assistant-api.antoinezanardi.fr" target="_blank">**Sandbox API**</a> _(Base URL: https://sandbox.werewolves-assistant-api.antoinezanardi.fr)_

**Sandbox API** may contains some bugs and unexpected behaviors as its purpose is to test new features before deploying on **main API**.

#### 🚀🧑‍🚀 Fan of Postman ? Try out the [**official public collection**](https://www.getpostman.com/collections/d24ac6443fe18e0fe389) for your tests ! 

## <a name="roles-available">🃏 Roles available</a>

On this current version [![GitHub release](https://img.shields.io/github/release/antoinezanardi/werewolves-assistant-api.svg)](https://GitHub.com/antoinezanardi/werewolves-assistant-api/releases/), **15 different roles** are available to play:

- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/werewolf.png" width="25"/> The Werewolf**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/big-bad-wolf.png" width="25"/> The Big Bad Wolf**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/villager.png" width="25"/> The Villager**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/villager.png" width="25"/> The Villager-Villager**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/seer.png" width="25"/> The Seer**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/cupid.png" width="25"/> The Cupid**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/witch.png" width="25"/> The Witch**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/hunter.png" width="25"/> The Hunter**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/little-girl.png" width="25"/> The Little Girl**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/guard.png" width="25"/> The Guard**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/two-sisters.png" width="25"/> The Two Sisters**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/three-brothers.png" width="25"/> The Three Brothers**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/wild-child.png" width="25"/> The Wild Child**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/dog-wolf.png" width="25"/> The Dog-Wolf**
- **<img src="https://werewolves-assistant-api.antoinezanardi.fr/img/roles/raven.png" width="25"/> The Raven**

Please check the <a href="https://werewolves-assistant-api.antoinezanardi.fr/apidoc/#player-roles" target="_blank">**Player role section on API documentation**</a> or the <a href="https://werewolves-assistant.antoinezanardi.fr/about" target="_blank">**Available Roles section on the official website**</a> for more details about each role.

## <a name="api-documentation">📚 API Documentation</a>

Documentation is available for both versions:

* **✨ [Main API Documentation](https://werewolves-assistant-api.antoinezanardi.fr/apidoc)**
* **🔧 [Sandbox API Documentation](https://sandbox.werewolves-assistant-api.antoinezanardi.fr/apidoc)**

Note that contributors try their best to maintain documentations up to date. If you find any typos or oversights, please open an issue, or a pull request.

## <a name="versions">📈 Versions & changelog</a>

Each change when a new version comes up is listed in the <a href="https://github.com/antoinezanardi/werewolves-assistant-api/blob/master/CHANGELOG.md" target="_blank">CHANGELOG.md file</a> placed at project's root.

Also, you can keep up with changes by watching releases with the **Watch GitHub button** at the top of this page.

Current release on **main API** is [![GitHub release](https://img.shields.io/github/release/antoinezanardi/werewolves-assistant-api.svg)](https://GitHub.com/antoinezanardi/werewolves-assistant-api/releases/).

#### 🏷️ <a href="https://github.com/antoinezanardi/werewolves-assistant-api/releases" target="_blank">All releases for this project are available here</a>. 

## <a name="code-analysis-and-consistency">☑️ Code analysis and consistency</a>

In order to keep the code clean, consistent and free of bad JS practises, **[ESLint](https://eslint.org/)** is installed with nearly **220 rules activated** !

Complete list of all enabled rules is available in the **[.eslintrc.js file](https://github.com/antoinezanardi/werewolves-assistant-api/blob/master/.eslintrc.js)**.

## <a name="installation">🔨 Installation</a>

1. Install dependencies with `npm install` (add `--production` to omit dev dependencies).
2. Copy `.env.example` and paste it as `.env`.
3. Replace environment values in the fresh new `.env` file if necessary (When **⚠️️ Required** is specified):
    * **DB_NAME**: Name of the MongoDB database. 
      - _**Not required - Default value**: `werewolves-assistant`_
    * **BASIC_USERNAME**: Username for basic authentication. 
      - _**Not required - Default value**: `root`_
    * **BASIC_PASSWORD**: Password for basic authentication. 
      - _**Not required - Default value**: `secret`_
    * **PORT**: Which port the API must run. 
      - _**Not required - Default value**: `4202`_
    * **JWT_SECRET**: Encryption key used for JSON Web Token. 
      - _**Not required - Default value**: `somethingsecret`_
    * **SENTRY_ENABLED**: Enable if errors are caught and sent to Sentry. 
      - _**Not required**_
    * **SENTRY_PROJECT_ID**: Sentry project's ID. 
      - _**Not required**_
    * **SENTRY_KEY**: Sentry secret key. 
      - _**Not required**_

## <a name="lets-go">🔌 Let's go</a>

To start the API **on development mode**, simply run `npm start`.

To start the API **on production mode**, run `npm run start_sandbox` or `npm run start_production`.

## <a name="other-useful-commands">⚙️ Other useful commands</a>
- **Tests**: `npm run test` runs various tests to check API endpoints.
- **Lint**: `npm run lint` checks for code style. Based on AirBnB configuration with many more rules.
- **Doc**: `npm run doc` generates doc for API.

## <a name="license">©️ License</a>

This project is licensed under the [MIT License](http://opensource.org/licenses/MIT).

## <a name="contributors">❤️ Contributors</a>

If you want to contribute to this project, please read the [**contribution guide**](https://github.com/antoinezanardi/werewolves-assistant-api/pulls/CONTRIBUTING.md).

Thank you to all the contributors:

<table>
    <tbody>
        <tr>
            <td align="center" valign="top">
                <a href="https://github.com/DeschampsThomas">
                    <img src="https://github.com/DeschampsThomas.png?s=75" width="75" height="75"><br/>
                    Thomas Deschamps
                </a>
            </td>
        </tr>
    </tbody>
</table>