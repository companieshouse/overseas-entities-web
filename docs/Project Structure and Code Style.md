# Project Structure and Code Style

## ROE Web Microservice

The microservice is quite simple with a few endpoints, its main responsibility is the registration of an overseas entity. The complexity resides on the input data needed for each single page and related validation.

All information filled by the user will be saved in a mem-cache (another microservice) and retrieved when needed during the web journey. The CH module handling session is [node-session-handler](https://github.com/companieshouse/node-session-handler).
Generally we will fetch information from the session, on the GET controller, to be used to populate data on the view. Instead the saving of OE data into the session is done on the POST controller of each page.

It is important to remember that there is a mapping between the OE saved on the session and OE data passed to the view for visualization. The following module/file [here](https://github.com/companieshouse/overseas-entities-web/blob/main/src/utils/application.data.ts) is responsible for the application data saved on the session.

The compiled/transpiled project is copied into the dist folder used later to bootstrap the application from `/dist/bin/www.js`. All static files have been deployed to CDN on aws cloudfront service.

## Files Structure

Directory Path | Description
--- | ---
`./.github` | Github folder, includes `PULL_REQUEST_TEMPLATE.md` on how to make a pull request to the project and `dependabot.yml` configuration options for dependency updates.
`./.husky` | Add pre check script, includes `pre-commit` and `pre-push` checks
`./src` | Contains all typescripts code
`./src/app.ts` | Application entry point
`./src/bin/www.ts` | Server configuration
`./src/config/index.ts` | Contains all the application's configurations
`./src/controller` | Business logic and handlers
`./src/middleware` | Middleware functions (Authentication, validation ...)
`./src/model` | OE Session and View Data Model
`./src/routes` | Paths and routes controller (Only GET and POST enabled)
`./src/service` | Interface to the API through SDK
`./src/utils` | Facade for CH services (logging and session) and other application utils (navigation, application data ...)
`./src/validation` | Sets of express validator middlewares for each page
`./test` | Jest Test files (`*.spec.ts`, `setup.ts`, and `*.mocks.ts`)
`./view` | Contains all the html nunjucks structure files
`./docs` | Contains documentation files
Others files | Other files related to modules dependency, CI/CD, *git, dockerization, lint, test/typescript configs …

## Authentication

Authentication is a simple middleware, one of many, that checks `signInInfo.SignedIn` in request session and verifies if user is authenticated with the `checkUserSignedIn(req.session)` util method, otherwise it will be redirected to sign in page `res.redirect('/signin?return_to=${SOLD_LAND_FILTER_URL}')`.

To chain the middleware to the particular endpoint we add it to the router object like `router.METHOD(path, [callback, ...] callback)`. More [here](https://expressjs.com/en/5x/api.html#router.METHOD)

```js
// Chain middlewares for the `presenter` endpoints
router.get(
    config.PRESENTER_URL, authentication, navigation.isSecureRegister, presenter.get
);
router.post(
    config.PRESENTER_URL, authentication, navigation.isSecureRegister, ...validator.presenter, checkValidations, presenter.post
);
```

## Validation

In each `POST` endpoints for every page we have a sets of middlewares used to validate each fields, if one of the validation middlewares fails the `validationResult` [here](https://github.com/companieshouse/overseas-entities-web/blob/85238ed7dd56ed988725b9dd636942b8d8baca7a/src/middleware/validation.middleware.ts#L22) will extracts the validation errors from a request and it will be formatted as an `errors` object [here](https://github.com/companieshouse/overseas-entities-web/blob/85238ed7dd56ed988725b9dd636942b8d8baca7a/src/middleware/validation.middleware.ts#L86) and it will be passed to the render page for the correct error visualization.

```js
// Middlewares validation checks for the presenter page
import { email_validations } from "./fields/email.validation";
export const presenter = [
  body("full_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_FULL_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FULL_NAME_INVALID_CHARACTERS),
    ...email_validations
];
```

```js
// Inputs field on presenter page with the errors object 

...
{% include "includes/list/errors.html" %}

...
{{ govukInput({
    errorMessage: errors.full_name if errors,
    label: {
        text: "Full name",
        isPageHeading: false
    },
    id: "full_name",
    name: "full_name",
    value: full_name
}) }}
...
```

To make sure that the page will have the correct navigation (back link and others info) we use a simple object data [here](https://github.com/companieshouse/overseas-entities-web/blob/main/src/utils/navigation.ts) as a mapper for the current `routePath`.

## Navigation Checks

To avoid users from skipping pages a check navigation logic has been implemented. Because each page depends on the previous one the checks are done by making sure that in the ​`​ApplicationData​`​ the previus page has been correctly submitted, if it has not the user will be redirected to the landing page.
Link for the list of check condition [here](https://github.com/companieshouse/overseas-entities-web/blob/main/src/middleware/navigation/check.condition.ts)

```js
// Check that the secure register ​info in the application ​data model is correctly set before going through
export const isSecureRegister = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if ( !checkIsSecureRegisterDetailsEntered(getApplicationData(req.session) )){
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};

...

export const checkIsSecureRegisterDetailsEntered = (appData: ApplicationData): boolean => {
  return checkHasSoldLandDetailsEntered(appData) && appData[IsSecureRegisterKey] === "0";
};

...

```

## MVC

​For almost each page we have divided the program logic for the creation of the user interface into three elements.

### The Model

In the model we define the interface, the data structure used to represent the data for that particular page and an array used to map back and forth information between the `session` data and the `nunjucks` html view data.

```js
// Presenter Page Model
export const PresenterKey = "presenter";

export const PresenterKeys: string[] = ["full_name", "email"];

export interface Presenter {
    full_name?: string
    email?: string
}
```

For each interface we have a key used to represent the object on the application data model, and the `ApplicationData` represents the object that will be saved in redis, on the `extra_data`, a subfield of our session data. In particular it will be saved under the `roe` name key [APPLICATION_DATA_KEY](https://github.com/companieshouse/overseas-entities-web/blob/85238ed7dd56ed988725b9dd636942b8d8baca7a/src/model/application.model.ts#L17).
`extra_data` is used to store any data that apps need in the session (more info [here](https://github.com/companieshouse/node-session-handler#session)).

```js
// OE Application Data model
export interface ApplicationData {
    presenter?: presenterType.Presenter;
    due_diligence?: dueDiligenceType.DueDiligence;
    overseas_entity_due_diligence?: overseasEntityDueDiligenceType.OverseasEntityDueDiligence;
    entity?: entityType.Entity;
    ​...​
}
```

### The View

We use `Nunjucks` and `GDS` style/components and most of the work has been done by the UX team and their amazing prototype, deployed [here](https://github.com/companieshouse/register-of-overseas-entities-prototype). We use the prototype as an example and format/modify it to make it production ready (just for maintainability and readability).

Due to the complexity of the pages and the common components used across the UI we have an `includes` directory inside the view directory with all useful shared chunks of html code.​ This way we have consistency on error messaging, input formats and others. The value data will be passed by the `GET` controller by using the `res.render(templateUrl, {...data})` method, if value is not set the input field will be empty.
If we need to be specific we add variable, by using `set`, as shown in the example below ​

```js
// Nunjucks HTML inputs field on presenter page 
...
    {% set title = "Who can we contact about this application?" %}

    {% block pageTitle %}
        {% include "includes/page-title.html" %}
    {% endblock %}
...
    <form method="post">

        {{ govukInput({
          errorMessage: errors.full_name if errors,
          label: {
            text: "Full name",
            isPageHeading: false
          },
          id: "full_name",
          name: "full_name",
          value: full_name
        }) }}

        {{ govukInput({
          errorMessage: errors.email if errors,
          label: {
            text: "Email address",
            isPageHeading: false
          },
          id: "email",
          name: "email",
          value: email
        }) }}

        ...

        {% include "includes/save-and-continue-button.html" %}

    </form>
```

### The controller

The only http methods allowed are POST and GET, and therefore we will have mainly just the get and post controller, and literally the last successful middleware of the chain with the duty to respond to the user.
In the `get` method we fetch possible data and pass it to the view/template to be visualized to the user.

```js
// Get controller for the Presenter page
export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    ...
    const appData: ApplicationData = getApplicationData(req.session);
    const presenter = appData[PresenterKey];

    return res.render(config.PRESENTER_PAGE, {
      backLinkUrl: config.INTERRUPT_CARD_URL,
      templateName: config.PRESENTER_PAGE,
      ...presenter
    });
  } catch (error) {
    ...
  }
};

```

In the `post` method we save the user data to the session and to mongo (through the ROE API service)

```js
// Post controller for the Presenter page
export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    ...
    const data = prepareData(req.body, PresenterKeys);
    setApplicationData(session, data, PresenterKey);
    ...

    return res.redirect(config.WHO_IS_MAKING_FILING_URL);
  } catch (error) {
    ...
  }
};
```

File names for the model, view and controller have, when possible, the same start name of the endpoints (es. for the `/presenter` page we have the: `presenter.model.ts`, `presenter.controller.ts` and `presenter.html` files)
