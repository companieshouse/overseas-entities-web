jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.who.is.making.update.middleware');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import {
  UPDATE_DUE_DILIGENCE_PAGE,
  UPDATE_DUE_DILIGENCE_URL,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL
} from "../../../src/config";
import app from "../../../src/app";

import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  FOUND_REDIRECT_TO,
  UPDATE_DUE_DILIGENCE_PAGE_TITLE,
  DUE_DILIGENCE_NAME_TEXT,
  DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT,
  DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT,
  DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT,
  DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT,
  DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT,
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
} from "../../__mocks__/text.mock";

import {
  DUE_DILIGENCE_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_OBJECT_MOCK,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE,
  DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK
} from "../../__mocks__/due.diligence.mock";

import { ErrorMessages } from '../../../src/validation/error.messages';
import { getApplicationData, setApplicationData, prepareData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { ApplicationDataType } from '../../../src/model';
import { hasWhoIsMakingUpdate } from "../../../src/middleware/navigation/update/has.who.is.making.update.middleware";
import { EMAIL_ADDRESS } from "../../__mocks__/session.mock";
import { DueDiligenceKey } from '../../../src/model/due.diligence.model';
import { getTwoMonthOldDate } from "../../__mocks__/fields/date.mock";
import { DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK } from "../../__mocks__/validation.mock";
import { DateTime } from "luxon";
import { saveAndContinue } from "../../../src/utils/save.and.continue";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasWhoIsMakingUpdateMiddleware = hasWhoIsMakingUpdate as jest.Mock;
mockHasWhoIsMakingUpdateMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe("Update due diligence controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [DueDiligenceKey]: null });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(DUE_DILIGENCE_IDENTITY_DATE_LABEL_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_NAME_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_IDENTITY_ADDRESS_HINT_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_SUPERVISORY_NAME_LABEL_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_PARTNER_NAME_LABEL_TEXT);
      expect(resp.text).toContain(DUE_DILIGENCE_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(DUE_DILIGENCE_PARTNER_NAME_HINT_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page on GET method with session data populated`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK } );
      const resp = await request(app).get(UPDATE_DUE_DILIGENCE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.name);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.email);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.supervisory_name);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.aml_number);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.agent_code);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.partner_name);
      expect(resp.text).toContain(DUE_DILIGENCE_OBJECT_MOCK.diligence);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} when successful`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK });

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK });

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES };
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL}`);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["email"]).toEqual(EMAIL_ADDRESS);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} with error messages when sending no data`, async () => {
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(DUE_DILIGENCE_REQ_BODY_EMPTY_OBJECT_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DUE_DILIGENCE_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).not.toContain(ErrorMessages.COUNTY);
      expect(resp.text).toContain(ErrorMessages.UK_COUNTRY);
      expect(resp.text).toContain(ErrorMessages.POSTCODE);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(ErrorMessages.SUPERVISORY_NAME);
      expect(resp.text).toContain(ErrorMessages.AGENT_CODE);
      expect(resp.text).toContain(ErrorMessages.PARTNER_NAME);
      expect(resp.text).toContain(ErrorMessages.CHECK_DILIGENCE);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(DUE_DILIGENCE_REQ_BODY_MAX_LENGTH_FIELDS_OBJECT_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_AGENT_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(ErrorMessages.MAX_AML_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_SUPERVISORY_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_AGENT_ASSURANCE_CODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PARTNER_NAME_LENGTH);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only ENTER DATE error when identity date is completely empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when month and year are empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "01";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when day and year are empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-month"] = "01";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when day and month are empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });
    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only DAY error when identity date day is empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only MONTH error when identity date month is empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only YEAR error when identity date year is empty`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "11";
      dueDiligenceData["identity_date-month"] = "2";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when identity date day is outside valid numbers`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "32";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only YEAR_LENGTH error when identity date year is not 4 digits`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "30";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "20";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test("Test email is valid with long email address", async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK });
      const dueDiligenceData = {
        ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "vsocarroll@QQQQQQQT123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk"
      };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with long email name and address", async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK });
      const dueDiligenceData = {
        ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk"
      };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with very long email name and address", async () => {
      mockPrepareData.mockReturnValueOnce({ ...DUE_DILIGENCE_OBJECT_MOCK });
      const dueDiligenceData = {
        ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK,
        email: "socarrollA123456789B132456798C123456798D123456789E123456789F123XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk"
      };
      const twoMonthOldDate = getTwoMonthOldDate();
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when identity date month is outside valid numbers`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "30";
      dueDiligenceData["identity_date-month"] = "13";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when identity date day is zero`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "0";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only INVALID_DATE error when identity date month is zero`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "30";
      dueDiligenceData["identity_date-month"] = "0";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS error when identity date month is more than 3 months in the past`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      dueDiligenceData["identity_date-day"] = "30";
      dueDiligenceData["identity_date-month"] = "11";
      dueDiligenceData["identity_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with only DATE_NOT_IN_PAST error when identity date month is in the future`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const inTheFuture = DateTime.now().plus({ years: 28 });
      dueDiligenceData["identity_date-day"] = inTheFuture.day.toString();
      dueDiligenceData["identity_date-month"] = inTheFuture.month.toString();
      dueDiligenceData["identity_date-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with no date errors when identity date is today`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK_FOR_IDENTITY_DATE };
      const today = DateTime.now();
      dueDiligenceData["identity_date-day"] = today.day.toString();
      dueDiligenceData["identity_date-month"] = today.month.toString();
      dueDiligenceData["identity_date-year"] = today.year.toString();

      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_DUE_DILIGENCE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
    });

    test(`renders the ${UPDATE_DUE_DILIGENCE_PAGE} page with invalid character errors`, async () => {
      const dueDiligenceData = { ...DUE_DILIGENCE_WITH_INVALID_CHARACTERS_FIELDS_MOCK };
      const resp = await request(app).post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
    });

    test(`catch errors when rendering ${UPDATE_DUE_DILIGENCE_PAGE} on POST`, async () => {
      mockSetApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });

      const twoMonthOldDate = getTwoMonthOldDate();

      const dueDiligenceData = { ...DUE_DILIGENCE_REQ_BODY_OBJECT_MOCK };
      dueDiligenceData["identity_date-day"] = twoMonthOldDate.day.toString();
      dueDiligenceData["identity_date-month"] = twoMonthOldDate.month.toString();
      dueDiligenceData["identity_date-year"] = twoMonthOldDate.year.toString();

      const resp = await request(app)
        .post(UPDATE_DUE_DILIGENCE_URL)
        .send(dueDiligenceData);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
