# Project Structure

## Microservice

The microservice is quite simple with a few endpoints, its main responsibility is the registration of an overseas entity. The complexity resides on the input data needed for each single page and related validation.

All information filled by the user will be saved in a mem-cache (another microservice) and retrieved when needed during the web journey. The CH module handling session is [node-session-handler](https://github.com/companieshouse/node-session-handler).
Generally we will fetch information from the session, on the GET controller, to be used to populate data on the view. Instead the saving of OE data into the session is done on the POST controller of each page.

It is important to remember that there is a mapping between the OE saved on the session and OE data passed to the view for visualization. The following module/file [here](https://github.com/companieshouse/overseas-entities-web/blob/main/src/utils/application.data.ts) is responsible for the application data saved on the session.

The compiled/transpiled project is copied into the dist folder used later to bootstrap the application from `/dist/bin/www.js`. All static files have been deployed to CDN on aws cloudfront service.

## Files Structure

Directory Path | Description
--- | ---
./.github | Github folder, includes `PULL_REQUEST_TEMPLATE.md` on how to make a pull request to the project and `dependabot.yml` configuration options for dependency updates.
./.husky | Add pre check script, includes `pre-commit` and `pre-push` checks
./src | Contains all typescripts code
./src/app.ts | Application entry point
./src/bin/www.ts | Server configuration
./src/config/index.ts | Contains all the application's configurations
./src/controller | Business logic and handlers
./src/middleware | Middleware functions (Authentication, validation ...)
./src/model | OE Session and View Data Model
./src/routes | Paths and routes controller (Only GET and POST enabled)
./src/service | Interface to the API through SDK
./src/utils | Facade for CH services (logging and session) and other application utils (navigation, application data ...)
./src/validation | Sets of express validator middlewares for each page
./test | Jest Test files
./view | Contains all the html nunjucks structure files
./docs | Contains documentation files
Others files | Other files related to modules dependency, CI/CD, *git, dockerization, lint, test/typescript configs …

## MVC

TBD

## Authentication

Add authentication middleware to the new endpoint if uses session data ...

## Validation

TBD

## Navigation Checks

To avoid user from skipping pages a check navigation logic has been implemented ...
