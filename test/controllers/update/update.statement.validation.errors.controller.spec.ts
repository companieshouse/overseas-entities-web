jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/feature.flag");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/statement.validation.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";
import {
  SECURE_UPDATE_FILTER_URL,
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
  UPDATE_STATEMENT_VALIDATION_ERRORS_URL
} from "../../../src/config";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";

import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from '../../../src/middleware/navigation/update/has.presenter.middleware';
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { validateStatements, statementValidationErrorsGuard } from "../../../src/middleware/statement.validation.middleware";

mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockCompanyAuthentication = companyAuthentication as jest.Mock;
mockCompanyAuthentication.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockValidateStatements = validateStatements as jest.Mock;
mockValidateStatements.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockStatementValidationErrorsGuard = statementValidationErrorsGuard as jest.Mock;
mockStatementValidationErrorsGuard.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((_: Request, __: Response, next: NextFunction) => next());

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("Update statement validation errors controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockIsActiveFeature.mockReturnValue(true);
    mockValidateStatements.mockImplementation((_: Request, __: Response, next: NextFunction) => next());
    mockStatementValidationErrorsGuard.mockImplementation((_: Request, __: Response, next: NextFunction) => next());
  });

  describe("GET tests", () => {
    test('runs statementValidationErrorsGuard middleware', async () => {
      mockValidateStatements.mockImplementation((req: Request, _: Response, next: NextFunction) => {
        req['statementErrorList'] = ["There are no active registrable beneficial owners."];
        next();
      });

      mockStatementValidationErrorsGuard.mockImplementation((_: Request, res: Response, __: NextFunction) => {
        res.redirect(SECURE_UPDATE_FILTER_URL);
      });

      const resp = await request(app).get(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(SECURE_UPDATE_FILTER_URL);
    });

    test(`renders the Update statement validation errors page`, async () => {
      mockValidateStatements.mockImplementation((req: Request, _: Response, next: NextFunction) => {
        req['statementErrorList'] = ["There are no active registrable beneficial owners."];
        next();
      });

      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: false,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app).get(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain("The statements you&#39;ve chosen do not match the information provided in this update");
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).toContain("Potato - OE991992");
      expect(resp.text).toContain("There are no active registrable beneficial owners.");
      expect(resp.text).toContain('All beneficial owners have been identified and I can provide all the required information');
      expect(resp.text).toContain('The entity has no reasonable cause to believe that anyone has become or ceased to be a registrable beneficial owner during the update period');

      expect(resp.text).not.toContain(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).not.toContain('value="statement-resolution-change-information" checked');
      expect(resp.text).not.toContain('value="statement-resolution-change-statement" checked');
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the Update statement validation errors page with no change back link when in no change journey`, async () => {
      mockGetApplicationData.mockReturnValue({
        update: { no_change: true },
      });

      const resp = await request(app).get(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain("The statements you&#39;ve chosen do not match the information provided in this update");
      expect(resp.text).toContain(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);

      expect(resp.text).not.toContain(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test(`in a change journey, renders the Update statement validation errors page when there is at least one registrable BO`, async () => {
      mockValidateStatements.mockImplementation((req: Request, __: Response, next: NextFunction) => {
        req['statementErrorList'] = ["There is at least one active registrable beneficial owner.", "There are no active managing officers."];
        next();
      });

      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'NONE_IDENTIFIED',
        update: {
          no_change: false,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app).get(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain('The statements you&#39;ve chosen do not match the information provided in this update');
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).toContain('Potato - OE991992');
      expect(resp.text).toContain('There is at least one active registrable beneficial owner.');
      expect(resp.text).toContain('There are no active managing officers');
      expect(resp.text).toContain('No beneficial owners have been identified');
      expect(resp.text).toContain('The entity has no reasonable cause to believe that anyone has become or ceased to be a registrable beneficial owner during the update period');

      expect(resp.text).not.toContain(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).not.toContain('value="statement-resolution-change-information" checked');
      expect(resp.text).not.toContain('value="statement-resolution-change-statement" checked');
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`in a no change journey, renders the Update statement validation errors page when there is at least one registrable BO`, async () => {
      mockValidateStatements.mockImplementation((req: Request, __: Response, next: NextFunction) => {
        req['statementErrorList'] = ["There is at least one active registrable beneficial owner.", "There are no active managing officers."];
        next();
      });

      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'NONE_IDENTIFIED',
        update: {
          no_change: true,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app).get(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain('The statements you&#39;ve chosen do not match the information provided in this update');
      expect(resp.text).toContain(UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).toContain('Potato - OE991992');
      expect(resp.text).toContain('There is at least one active registrable beneficial owner.');
      expect(resp.text).toContain('There are no active managing officers');
      expect(resp.text).toContain('No beneficial owners have been identified');
      expect(resp.text).toContain('The entity has no reasonable cause to believe that anyone has become or ceased to be a registrable beneficial owner during the update period');

      expect(resp.text).not.toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).not.toContain('value="statement-resolution-change-information" checked');
      expect(resp.text).not.toContain('value="statement-resolution-change-statement" checked');
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("in a change journey, redirect to BO review page if user chooses to change information provided", async () => {
      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: false,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL)
        .send({ statement_resolution: 'statement-resolution-change-information' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test("in a no-change journey, redirect to do you need to make a change page if user chooses to change information provided", async () => {
      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: true,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL)
        .send({ statement_resolution: 'statement-resolution-change-information' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    });

    test("in a change journey, redirect to beneficial-owner-statements if user chooses to change their statement", async () => {
      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: false,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL)
        .send({ statement_resolution: 'statement-resolution-change-statement' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test("in a no-change journey, redirect to update-no-change-beneficial-owner-statements if user chooses to change their statement", async () => {
      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: true,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL)
        .send({ statement_resolution: 'statement-resolution-change-statement' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test('renders the Update statement validation errors page with validator failure when no radio button selected', async () => {
      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: true,
          registrable_beneficial_owner: 0,
        },
      });
      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_UPDATE_STATEMENT_VALIDATION_RESOLUTION);
    });

    test.each([
      ['invalid', 'potatoes'],
      ['no', undefined]
    ])('renders validation error when %s statement_resolution provided', async (_, statement_resolution) => {
      mockGetApplicationData.mockReturnValue({
        entity_name: 'Potato',
        entity_number: 'OE991992',
        beneficial_owners_statement: 'ALL_IDENTIFIED_ALL_DETAILS',
        update: {
          no_change: false,
          registrable_beneficial_owner: 0,
        },
      });

      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL)
        .send({ statement_resolution });

      expect(resp.status).toEqual(200);

      expect(resp.text).toContain("The statements you&#39;ve chosen do not match the information provided in this update");
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(resp.text).toContain('Select if you want to change your statements or change the information provided in this update');
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app)
        .post(UPDATE_STATEMENT_VALIDATION_ERRORS_URL)
        .send({ statement_resolution: 'statement-resolution-change-statement' });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
