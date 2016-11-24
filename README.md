# Webino Development Kit

[![Build Status](https://travis-ci.org/webino/webino-devkit.svg?branch=develop)](https://travis-ci.org/webino/webino-devkit)

Application and module development toolkit for Webino developers. 

## Quick Install

`wget https://get.webino.org/devkit -qO- | sh`

## Requirements

- Latest stable [Node.js](http://nodejs.org/)
- [PHP](http://php.net/) >= 5.6
- [Git](http://git-scm.com) & [GitFlow](https://github.com/nvie/gitflow)
- [Graphviz](http://www.graphviz.org)

*NOTE: Consider to use a [nvm](https://github.com/creationix/nvm) e.g. `nvm install 0.10` to install Node.js.*

## Installation

`sudo npm install webino-devkit -g --unsafe-perm`

*NOTE: We use the `--unsafe-perm` flag allowing post-install of required PHP libraries via composer.*

## Usage

Run `webino` from the command line.

### Module development

Go to a Webino module directory and run one of the following commands.

Initializing new clone
- `webino init`

Updating clone
- `webino update`

Environment configuration
- `webino configure`

Open test site in a web browser
- `webino show`

Live development (browser-sync & watch)
- `webino dev`

Assets regeneration
- `webino regen`

### Testing

**Unit & Functional testing**

PHPUnit
- `webino phpunit`

using filter
- `webino phpunit --filter testMyExampleMethod`

With functional tests & violations check
- `webino test`

using filter
- `webino test --filter testMyExampleMethod`

**Acceptance testing**

Selenium
- `webino uat:<browser> -uri http://localhost:8080/`

using environment variables instead

- `BROWSER=<browser> URI=http://localhost:8080/ webino uat`

*NOTE: Replace the `<browser>` with any supported Selenium browser: htmlunit, firefox, chrome, ...*
*NOTE: Location of the testing site could be any than `http://localhost:8080/`.*

disable tests video recording

- `R=0 webino uat`

### Analysis

Analyze package source, generate logs, todos etc.
- `webino analyze`

### Documentation generator

**API**

Generate API doc
- `webino api`

Open API in a web browser
- `webino show-api`

### Package distribution

Publish new module to a remote repository
- `webino publish`

*NOTE: It initializes local Git with GitFlow and then pushes to the newly created GitHub repository.*

## TODO

- Add webino-generator module

## More informations

Read more on [How to develop Webino modules](https://github.com/webino/Webino/wiki/How-to-develop-Webino-modules)
