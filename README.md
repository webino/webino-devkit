# Webino Development Kit

[![Build Status](https://travis-ci.org/webino/webino-devkit.svg?branch=develop)](https://travis-ci.org/webino/webino-devkit)

Application and module development toolkit for Webino developers.


## Quick Install

`wget https://get.webino.org/devkit -qO- | sh`


## Requirements

- [Ubuntu](https://www.ubuntu.com/) 15.10 | 14.04 | 12.04 (wget 1.14)
- [Git](http://git-scm.com) & [GitFlow](https://github.com/nvie/gitflow)
- [Node.js](http://nodejs.org/) 0.10
- [PHP](http://php.net/) >=5.6
- [Graphviz](http://www.graphviz.org)
- [Selenium](http://selenium-release.storage.googleapis.com/index.html?path=2.53/) 2.53
- [Firefox](https://ftp.mozilla.org/pub/firefox/releases/46.0.1/linux-x86_64/en-US/) 46.0.1
- [RecordMyDesktop](http://recordmydesktop.sourceforge.net/)

*NOTE: Consider to use a [nvm](https://github.com/creationix/nvm) e.g. `nvm install 0.10` to install Node.js.*


## Features

- Package initialization & updating
- Live front-end development support
- Source code analysis
- API generation
- Testing environment configuration
- Unit & acceptance testing
- Acceptance testing video recording
- Firefox browser testing by default

*NOTE: User acceptance testing automation is powered by Firefox browser out of the box. Using Chrome or other
 browsers requires setting driver system variable, which is not currently implemented.*


## Installation

`sudo npm install webino-devkit -g --unsafe-perm`

*NOTE: We use the `--unsafe-perm` flag allowing post-install of required PHP libraries via composer.*


## Usage

Run `webino` from the command line.


### Module development

Go to a Webino module directory and run one of the following commands.

Updating clone

- `webino update`

Environment configuration

- `webino configure`

Open test site in a web browser

- `webino show`

Live development (browser-sync & watch)

- `webino dev`


### Testing

**Unit testing**

Unit tests with violations check

- `webino test`

using filter

- `webino test --filter testMyExample`

**Acceptance testing**

Selenium

- `webino selenium`

using filter

- `webino selenium --filter testMyExample`

with options

- `webino selenium:<browser> -uri http://localhost:8080/`

with application reconfiguration

- `webino uat:<browser> -uri http://localhost:8080/`

using environment variables instead

- `BROWSER=<browser> URI=http://localhost:8080/ webino uat`

*NOTE: Replace the `<browser>` with any supported Selenium browser: htmlunit, firefox, chrome, ...*
*NOTE: Location of the testing site could be any than `http://localhost:8080/`.*

disable tests video recording

- `R=0 webino uat`

run tests on foreground (without Xvfb) and disable video recording

- `X=0 webino uat`


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

Publish new module to the GitHub repository

- `webino publish`

*NOTE: It initializes local Git with GitFlow and then pushes to the newly created GitHub repository.*


## TODO

- Upgrade to PHP 7
- Upgrade to Selenium 3
- Add webino-generator module


## More information

Read more on [How to develop Webino modules](https://github.com/webino/Webino/wiki/How-to-develop-Webino-module)


## Addendum

Please, if you are interested in this development kit report any issues and don't hesitate to contribute.

[Report a bug](https://github.com/webino/webino-devkit/issues) | [Fork me](https://github.com/webino/webino-devkit)
