# overseas-entities-web

Web front-end for the **register an overseas entity and tell us about its beneficial owners** service. Link to the live page [here](https://www.gov.uk/guidance/register-an-overseas-entity)
</br>
Web front-end for the **file an overseas entity update statement** service. Link to the live page [here](https://www.gov.uk/guidance/file-an-overseas-entity-update-statement)
</br>
Web front-end for the **apply to remove an overseas entity from the register** service. Link to the live page [here](https://www.gov.uk/guidance/remove-an-overseas-entity)
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
- [Git](https://git-scm.com/downloads)

## Project Structure

[Project Structure and Code Style](./docs/Project%20Structure%20and%20Code%20Style.md)

## Running locally on Docker env

The only local development mode available, that includes account, redis and other important service/dependency is only possible through our development orchestrator service in [Docker CHS Development](https://github.com/companieshouse/docker-chs-development).

1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README.
2. Ensure you are logged into AWS SSO (`aws sso login`) and authenticate to both ECR registries:
   ```sh
   # ch-development ECR
   aws ecr get-login-password --region eu-west-2 --profile development-eu-west-2 | \
     docker login --username AWS --password-stdin 169942020521.dkr.ecr.eu-west-2.amazonaws.com

   # ch-shared-services ECR (required for overseas-entities-api and other services)
   aws ecr get-login-password --region eu-west-2 --profile shared-services-ecr-eu-west-2-ro | \
     docker login --username AWS --password-stdin 416670754337.dkr.ecr.eu-west-2.amazonaws.com
   ```
3. Run `./bin/chs-dev modules enable overseas-entities`
4. Run `./bin/chs-dev development enable overseas-entities-web` (this will allow you to make changes in real time).
5. Run docker using `chs-dev up` in the docker-chs-development directory.
6. Open your browser and go to <http://chs.local/register-an-overseas-entity/starting-new> for the ROE Registration journey, <http://chs.local/update-an-overseas-entity/continue-with-saved-filing> for the ROE Update journey or <http://chs.local/update-an-overseas-entity/continue-with-saved-filing?journey=remove> for the ROE Remove journey (each of these is the first page that would be displayed, if navigating from the GOV UK external ROE guidance screens).

Environment variables used to configure this service in docker are located in the file `services/modules/overseas-entities/overseas-entities-web.docker-compose.yaml`

### Requirements

1. node v18 (engines block in package.json is used to enforce this)(Concourse pipeline builds using Node 18 and live runs on Node 18)
2. npm 8 (engines block in package.json is used to enforce this)
3. Docker

### Build and Test changes

1. To compile the project use `make build`
2. To test the project use `make test`
3. or `make clean build test`

### To build the Docker container

Ensure that you are logged into the AWS eu-west2 region:

`aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 416670754337.dkr.ecr.eu-west-2.amazonaws.com`

and then run:

`DOCKER_BUILDKIT=0 docker build --build-arg SSH_PRIVATE_KEY="$(cat ~/.ssh/id_rsa)" --build-arg SSH_PRIVATE_KEY_PASSPHRASE -t 416670754337.dkr.ecr.eu-west-2.amazonaws.com/local/overseas-entities-web .`

### Endpoints

Method | Path | Description
--- | --- | ---
GET | `/register-an-overseas-entity` | Returns the landing page for the Register an overseas entity, starting point to different other pages to register an OE. URLs path [here](./src/routes/index.ts).
GET | `/update-an-overseas-entity` | Returns the landing page for updating an overseas entity. URLs path [here](./src/routes/index.ts).
GET | `/update-an-overseas-entity/continue-with-saved-filing?journey=remove` | Returns the landing page for removing an overseas entity. URLs path [here](./src/routes/index.ts).
GET | `/register-an-overseas-entity/healthcheck` | Returns responds with HTTP code `200` and a `OK` message body

### Common Config variables (No feature flags)

Key             |  Description               | Example Value
----------------|--------------------------- |-------------------------
ACCOUNT_URL | URL to account service | `http://account-ch-gov-uk:4000`
API_URL | URL to API call | `http://api.chs.local:4001`
CACHE_SERVER | Redis cache server | redis
CDN_HOST | CDN host | cdn.chs.local
CHS_API_KEY | CHS API key for SDK call | key
CHS_URL | CHS local url | `http://chs.local`
COOKIE_DOMAIN | The domain of the cookie | `chs.local`
COOKIE_NAME | The name of the cookie | __SID
COOKIE_SECRET | The shared secret used in validating/calculating the session cookie signature | secret
INTERNAL_API_URL | Internal API URL | `http://api.chs.local:4001`
LANDING_PAGE_URL | Register OE landing Page | `/register-an-overseas-entity/sold-land-filter?start=0`
UPDATE_LANDING_PAGE_URL | Update OE landing Page | `/update-an-overseas-entity/overseas-entity-query`
REMOVE_LANDING_PAGE_URL | Remove OE landing Page | `/update-an-overseas-entity/continue-with-saved-filing?journey=remove`
LOG_LEVEL | LOG level | DEBUG
OAUTH2_CLIENT_ID | OAUTH2 client ID | client ID
OAUTH2_CLIENT_SECRET | OAUTH2 client secret | secret
OE01_PAYMENT_FEE | Payment Fee | config value
OE02_UPDATE_PAYMENT_FEE | Update Payment Fee | config value
PIWIK_URL | Matomo URL | `https://matomo.platform.aws.chdev.org`
PIWIK_SITE_ID | Matomo Site ID | 24
PIWIK_START_GOAL_ID | Matomo Start goal ID | 3
PIWIK_UPDATE_START_GOAL_ID | Matomo Update Start goal ID | 10
PIWIK_REMOVE_START_GOAL_ID | Matomo Remove Start goal ID | 19
PIWIK_RELEVANT_PERIOD_START_GOAL_ID | Matomo Relevant Period Start goal ID | 33
SHOW_SERVICE_OFFLINE_PAGE | Feature Flag | false
VF01_FORM_DOWNLOAD_URL | Overseas entity verification checks statement URL | `https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/1095139/OE_VF01.pdf`


## Terraform and variables required

Terraform is run via a concourse ci pipeline and is used in place of AWS Cloud Formation for both provisioning and for deploying the cluster and services.

See: https://companieshouse.atlassian.net/wiki/spaces/COM/pages/4243718151/confirmation-statement-web+service+-+ECS+-+Devs+Test+-+Capture+Share+What+We+have+Learnt.

The configuration is contained in 5 files:
- data: Specifies the resources to be read as input into the configuration
- locals: Contains internal configuration variables including the docker config variable keys mapped to the variable names
- main: The main configuration file
- variables: Contains variable names and types - the values are contained in the profiles for each environment
- vault: Credentials for the hashicorp vault

NB: All variables under the headings below are based on the contents of the variables file and do not include locals.

### Terraform Config variables

Key             |  Description
----------------|---------------------------
aws_bucket | The bucket used to store the current terraform state files
remote_state_bucket | Alternative bucket used to store the remote state files from ch-service-terraform
state_prefix | The bucket prefix used with the remote_state_bucket files
deploy_to | Bucket namespace used with remote_state_bucket and state_prefix

### Environment

Key             |  Description
----------------|---------------------------
environment | The environment name, defined in environment's vars
aws_region | The AWS region for deployment
aws_profile | The AWS profile to use for deployment
kms_alias |

### Docker container variables

Key             |  Description
----------------|---------------------------
docker_registry | The FQDN of the Docker registry

### Service performance and scaling configs

Key             |  Description               | Example Value
----------------|--------------------------- |-------------------------
desired_task_count | The desired ECS task count for this service | 1
required_cpus | The required cpu resource for this service. 1024 here is 1 vCPU | 128
required_memory | The required memory for this service | 256

### Service environment variable configs (in addition to the common config variables)

Key             |  Description               | Example Value
----------------|--------------------------- |-------------------------
overseas_entities_web_version | The version of the overseas entities web container to run. | 1.0
cache_pool_size | Size of cache pool | 8
default_session_expiration | Lifetime of sessions | 3600
redirect_uri | Redirect users to homepage when trying to access other pages directly | `/`

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
