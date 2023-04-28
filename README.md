# overseas-entities-web

Web front-end for the **register an overseas entity and tell us about its beneficial owners** service. Link to the live page [here](https://www.gov.uk/guidance/register-an-overseas-entity)
</br>

## Overseas entities architecture

Simplified view of the architecture and does not show all services, components and infrastructure
![Overseas entities architecture](./docs/Overseas%20entities%20architecture.png)
</br>

## Frontend Technologies and Utils

- [NodeJS](https://nodejs.org/)
- [ExpressJS](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [NunJucks](https://mozilla.github.io/nunjucks)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [Jest](https://jestjs.io)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [Sonarqube](https://www.sonarqube.org)
- [Docker](https://www.docker.com/)
- [Tilt](https://tilt.dev/)
- [Git](https://git-scm.com/downloads)

## Project Structure

[Project Structure and Code Style](./docs/Project%20Structure%20and%20Code%20Style.md)

## Running locally on Docker env

The only local development mode available, that includes account, redis and other important service/dependency is only possible through our development orchestrator service in [Docker CHS Development](https://github.com/companieshouse/docker-chs-development), that uses [tilt](https://tilt.dev/).

1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README.
2. Run `./bin/chs-dev modules enable overseas-entities`
3. Run `./bin/chs-dev development enable overseas-entities-web` (this will allow you to make changes in real time).
4. Run docker using `tilt up` in the docker-chs-development directory.
5. Use spacebar in the command line to open tilt window - wait for overseas-entities-web to become green.(If you have credential errors then  you may not be logged into `eu-west-2`.)
6. Open your browser and go to page <http://chs.local/register-an-overseas-entity>

Environment variables used to configure this service in docker are located in the file `services/modules/overseas-entities/overseas-entities-web.docker-compose.yaml`

### Requirements

1. node v16(engines block in package.json is used to enforce this)(Concourse pipeline builds using Node 16 and live runs on Node 16)
2. npm 8(engines block in package.json is used to enforce this)
3. Docker

### Build and Test changes

1. To compile the project use `make build`
2. To test the project use `make test`
3. or `make clean build test`

### To build the Docker container

1. `DOCKER_BUILDKIT=0 docker build --build-arg SSH_PRIVATE_KEY="$(cat ~/.ssh/id_rsa)" --build-arg SSH_PRIVATE_KEY_PASSPHRASE -t 169942020521.dkr.ecr.eu-west-1.amazonaws.com/local/overseas-entities-web .`

### Endpoints

Method | Path | Description
--- | --- | ---
GET | `/register-an-overseas-entity` | Returns the landing page for the Register an overseas entity, starting point to different other pages to register an OE. URLs path [here](./src/routes/index.ts).
GET | `/update-an-overseas-entity` | Returns the landing page for updating an overseas entity. URLs path [here](./src/routes/index.ts).
GET | `/register-an-overseas-entity/healthcheck` | Returns responds with HTTP code `200` and a `OK` message body

### Config variables (No feature flags)

Key             |  Description               | Example Value
----------------|--------------------------- |-------------------------
ACCOUNT_URL | URL to account service | `http://account.url`
API_URL | URL to API call | `http://api.url`
CACHE_SERVER | Redis cache server | redis
CDN_HOST | CDN host | cdn.host
CHS_API_KEY | CHS API key for SDK call | key
CHS_URL | CHS local url | `http://url`
COOKIE_DOMAIN | The domain of the cookie | `http://url.local`
COOKIE_NAME | The name of the cookie | __SID
COOKIE_SECRET | The shared secret used in validating/calculating the session cookie signature | secret
INTERNAL_API_URL | Internal API URL | `http://api.url`
LANDING_PAGE_URL | Register OE landing Page | `/register-an-overseas-entity/sold-land-filter`
UPDATE_LANDING_PAGE_URL | Update OE landing Page | `/update-an-overseas-entity/overseas-entity-query`
LOG_LEVEL | LOG level | DEBUG
OAUTH2_CLIENT_ID | OAUTH2 client ID | client ID
OAUTH2_CLIENT_SECRET | OAUTH2 client secret | secret
PAYMENT_FEE | Payment Fee | 100
UPDATE_PAYMENT_FEE | Update Payment Fee | 100
PIWIK_URL | Matomo URL | `http://url`
PIWIK_SITE_ID | Matomo Site ID | 1
PIWIK_START_GOAL_ID | Matomo Start goal ID | 2
PIWIK_UPDATE_START_GOAL_ID | Matomo Update Start goal ID | 3
SHOW_SERVICE_OFFLINE_PAGE | Feature Flag | false
VF01_FORM_DOWNLOAD_URL | Overseas entity verification checks statement URL | `https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/1095139/OE_VF01.pdf`

## Recommendations

1. Use the [Visual Studio Code](https://code.visualstudio.com/) IDE for development.
2. Use the preformatted `PULL_REQUEST_TEMPLATE` by adding meaningful description
3. Make sure test coverage is well above `80%`
4. Do not disable husky pre checks locally
5. Use one of the main CH slack channel if you get stuck
6. Use MVC pattern when adding a new page/endpoint, including validation, authentication and navigation checks all together, otherwise featureflag it please. Example can be found on the following PR [here](https://github.com/companieshouse/overseas-entities-web/pull/226) and doc description [here](./docs/Project%20Structure%20and%20Code%20Style.md)
7. **Happy coding**

## License

This code is open source software licensed under the [MIT License]("https://opensource.org/licenses/MIT").
