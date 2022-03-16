# overseas-entities-web
Web front-end for the Register An Overseas Entity service

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

### Getting started

To checkout and build the service:

1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README. 
2. Run ./bin/chs-dev modules enable overseas-entities
3. Run ./bin/chs-dev development enable overseas-entities-web (this will allow you to make changes).
4. Run docker using "tilt up" in the docker-chs-development directory.
5. Use spacebar in the command line to open tilt window - wait for overseas-entities-web to become green.
6. Open your browser and go to page http://chs.local/overseas-entities

These instructions are for a local docker environment.


### Config variables

Key             | Example Value   | Description
----------------|---------------- |------------------------------------
CDN_HOST     | http://cdn.chs.local | Used when navigating to the webpage
COOKIE_DOMAIN| chs.local |
COOKIE_NAME  |__SID |
COOKIE_SECRET | 
SHOW_SERVICE_OFFLINE_PAGE | false | Feature Flag
